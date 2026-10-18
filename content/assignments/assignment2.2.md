---
title: Assignment-2.2： 实现LLM的训练
summary: 实现训练代码，并且在本地电脑或者云端GPU训练
order: 22
updated: 2026-10-17

softDeadline: 
hardDeadline: 
points: 100
status: 进行中
zipUrl: files/packages/assignment_2_2.zip
zipLabel: 实验代码下载
---
# Assignment-2.2：训练 Transformer LM（选做，不计分）

在上一个实验里面，我们完成了TransformerLM的实现，接下来在这个实验里，我们将动手完成模型的训练，详细的文档请参照，文件包的README.md. 

## 环境

使用 Python 3.12 或 3.13，在创建并且激活虚拟环境后，在本目录运行：
```sh
python -m pip install -r requirements.txt
```
或者使用uv：
```
uv pip install -r requirements.txt
```


## 0. 准备
在开始之前，先把assignment_2_1/中我们实现的模块加入进来

```text
assignment_2_2/                 # 当前工作目录
├── README.md
├── prepare_data.py             # 训练分词器并编码数据
├── generate.py                 # 用训练好的模型续写文本
├── assignment_2_1/             # 自己完成的模型包
│   └── transformer.py以及其他文件
├── assignment_2_2/             # 本次要写的训练组件
├── tests/
└── data/
    ├── raw/                    # 下载的 train/valid 文本
    └── tokens/                 # prepare_data.py 生成的 tokenizer.json 和 .bin
```

准备好后，下载 TinyStories. 分别下载好训练集和验证集，保存在`data/raw/TinyStoriesV2-GPT4-train.txt`和`data/raw/TinyStoriesV2-GPT4-valid.txt`中：
```sh
mkdir -p data/raw
curl -fL --retry 3 -o data/raw/TinyStoriesV2-GPT4-train.txt https://huggingface.co/datasets/roneneldan/TinyStories/resolve/main/TinyStoriesV2-GPT4-train.txt
curl -fL --retry 3 -o data/raw/TinyStoriesV2-GPT4-valid.txt https://huggingface.co/datasets/roneneldan/TinyStories/resolve/main/TinyStoriesV2-GPT4-valid.txt
```
其中训练文本约 2.23 GB，验证文本约 22.5 MB。

之后，运行 `python prepare_data.py`训练 BPE 并且生成对应文件。

下面是需要完成的TODO，我们为大家准备了详细的TODO文档
| TODO | 内容 |
| --- | --- |
| 1 | 数据 batch |
| 2 | 交叉熵 |
| 3 | AdamW |
| 4 | 学习率调度 |
| 5 | 梯度裁剪 |
| 6、7 | checkpoint 保存与加载 |
| 8 | 验证 |
| 9 | 训练循环 |
| 10 | 训练入口（`main`，已提供，读懂即可） |

## 1. 数据与损失

### 1.1 数据加载

前面生成的 `train.bin` 和 `valid.bin` 保存的是分词后的 token ID，数据类型是 `uint16`。可以使用用 `np.memmap(path, dtype=np.uint16, mode="r")` 打开后，会得到一维数组，也就是下面的 `dataset`。文件里还没有分好 batch，这一步需要我们完成get_batch函数。

语言模型的任务是根据前面的内容预测下一个 token。因此，一个 batch 除了输入序列，还需要有对应的预测目标。`get_batch(dataset, batch_size, context_length, device)` 要从数据中随机取出若干段序列，返回输入和目标，形状都是 `(B, N)`，其中 B 是 batch size，N 是上下文长度。两个张量都应放在指定设备上。

请完成 `assignment_2_2/data_loading.py` 中的 `get_batch`（TODO 1）。可以先用一小段递增整数作为数据，看看每个位置的输入和目标是否对应，再运行下面的测试。测试会多次采样，检查取样范围。
下面的测试命令都在本作业目录的终端中运行。

```sh
python -m pytest -q tests/test_data.py
```

### 1.2 交叉熵损失

Assignment-2.1 的模型在每个位置输出一组 logits，每个数对应词表中的一个 token。现在有了真实的下一个 token，我们就可以计算交叉熵，衡量模型预测得怎么样。

请在 `assignment_2_2/loss.py` 中完成 `cross_entropy(inputs, targets)`（TODO 2）。输入的最后一维是词表，前面可以有任意个 batch 维度；目标中每个位置保存一个 token ID。函数返回所有位置的平均损失，是一个可以反向传播的标量。计算使用自然对数，还要注意 logits 很大时的数值稳定性。

完成后运行下面的测试，并检查 loss 能否正常反向传播。

```sh
python -m pytest -q tests/test_nn_utils.py -k cross_entropy
```

## 2. 优化器

### 2.1 AdamW

损失的反向传播会给出梯度，接下来需要用优化器更新模型参数。本实验使用 AdamW作为优化器，之前的实验中我们做过了Adam，在这里我们尝试在pytorch框架下实现AdamW优化器。

请在 `assignment_2_2/opt.py` 中完成 `AdamW.__init__` 和 `step`（TODO 3），支持 `params`、`lr`、`betas`、`eps` 和 `weight_decay`。AdamW 在更新过程中还会维护优化器状态，后面暂停和恢复训练时也需要保存它们。

下面的测试会用一个小网络训练若干步，把更新后的参数与参考结果比较。训练用的起始超参写在 `train.py` 开头，正式训练时可以进一调整。

```sh
python -m pytest -q tests/test_optimizer.py -k adamw
```

### 2.2 学习率调度与梯度裁剪

训练时，学习率会随迭代步数变化：开始时线性增大，完成预热后按余弦曲线下降，最后保持在最小值。请在 `assignment_2_2/opt.py` 中完成 `get_lr_cosine_schedule`（TODO 4）。`cosine_cycle_iters` 表示衰减结束的迭代数，调整训练步数时也要一起调整它。注意预热和衰减交界处的取值。

接着完成同一文件中的 `gradient_clipping`（TODO 5）。这里按照所有梯度的整体 L2 范数进行裁剪，eps使用`1e-6`。有些参数可能没有梯度，函数也需要能处理这种情况。

完成后运行下面的测试。实际训练时，再从日志中观察学习率和梯度范数的变化。

```sh
python -m pytest -q tests/test_optimizer.py -k get_lr_cosine_schedule
python -m pytest -q tests/test_nn_utils.py -k gradient_clipping
```

## 3. Checkpoint、训练与验证

### 3.1 Checkpoint

训练可能需要很长时间，我们希望中途停下来后还能继续。为此，除了模型参数，还要保存优化器状态和已经完成的迭代数，这些内容合起来就是训练的 checkpoint。

请在 `assignment_2_2/checkpoint.py` 中完成 `save_checkpoint`（TODO 6）和 `load_checkpoint`（TODO 7）。加载时恢复模型和优化器，并返回已完成的迭代数。接口既可以接收文件路径，也可以接收已经打开的二进制文件对象。

先运行下面的测试，等训练循环完成后，我们再实际尝试一次中断和恢复。

```sh
python -m pytest -q tests/test_serialization.py
```

### 3.2 训练与验证

现在训练需要的组件都准备好了。接下来，请在 `assignment_2_2/train.py` 中完成 `evaluate`（TODO 8）和 `train`（TODO 9），把这些组件和 Assignment-2.1 的模型接起来。两个函数的注释里有分步说明和伪代码。入口 `main`（TODO 10）已经写好：它设置随机种子，用 memmap 打开数据，构造模型和优化器，需要时从 checkpoint 恢复，再调用 `train`。先读一遍，弄清楚各个部分是怎么接起来的。

`evaluate` 用验证集计算平均损失；验证结束后，模型参数、梯度和原来的训练模式应保持不变。`train` 负责训练过程，并定期验证、保存 checkpoint。`main` 负责准备数据、模型和优化器，以及从 checkpoint 恢复训练。

我们准备的默认模型配置为：词表 10,000，上下文长度 256，d_model 512，d_ff 1344，4 层，16 个头，RoPE theta 10,000。

训练参数写在了train.py的开头，可以修改配置尝试不同的训练参数，默认只训练500步（见下表），在正式训练时，推荐将配置改为下面表格中的第二行或者第三行，也推荐尝试在Colab上训练模型：
| 用途 | batch × steps × context | 累计训练 token | warmup / 衰减结束步数 |
| --- | --- | ---: | --- |
| 笔记本电脑调试 |4 × 500 × 256 | 512,000 | 50 / 500 |
| 正式实验配置1 | 32 × 1,000 × 256 | 8,192,000 | 20 / 1,000 |
| 正式实验配置2 | 32 × 5,000 × 256 | 40,960,000 | 100 / 5,000 |

表中的训练 token 数等于 batch size、步数和上下文长度的乘积，表示模型在这次训练中一共学习了多少 token。
如果在本地电脑上运行，三个配置的预期训练时间大约分别是5min,1h和5h. 如果在GPU服务器/Colab/Kaggle/本地电脑GPU上运行时，将 `DEVICE` 改为 `"cuda"`。可以参考[Colab教程](https://xiepengyu2004.github.io/ai-introduction-course/#/labs/CoLab)自行导入训练代码，使用免费的GPU进行训练。

本地训练时，在本目录运行：

```sh
python -m assignment_2_2.train
```

训练时记录 step、训练和验证 loss、学习率、累计训练 token 和耗时，并画出 loss 曲线。为了方便比较，建议每次验证使用相同的片段和采样种子。建议使用python库tqdm来展示训练进度。
作为参考，在约4000万训练token时验证loss不超过 2.00。

### 3.3 生成文本

模型训练完成之后，可以尝试在运行 `python generate.py`，加载checkpoint，让模型输出文本。

## 4. 对比实验（选做）

Assignment-2.1 中，我们在注意力和前馈网络前使用了 RMSNorm。现在模型已经能训练了，可以试着去掉这些归一化，看看训练会发生什么。

| 组别 | 模型 | 学习率 |
| --- | --- | --- |
| A | 原始 pre-norm 模型 | 调好的基线学习率 |
| B | 去掉所有 RMSNorm，包括最后一层 | 与 A 相同 |
| C | 与 B 相同 | 比 A 低，写明取值和理由 |

为了比较 RMSNorm 的影响，三组使用相同的数据和词表，保留参数的初始权重也相同。每组都从头训练，使用相同的随机种子、batch、上下文长度和训练 token 数。验证片段、训练精度、预热比例和衰减计划也保持一致。

画出三组的训练和验证 loss，分别以 step 和运行时间为横轴。结合梯度范数，观察有没有 NaN、Inf 或其他不稳定现象，再讨论：同样的学习率下，去掉 RMSNorm 后有什么变化？降低学习率能否让训练稳定下来？结果以实际运行观察为准。

## 提交

本实验不计分，如想要提交可以上传到：https://box.nju.edu.cn/u/d/3b2f712994104e3e93ec/
