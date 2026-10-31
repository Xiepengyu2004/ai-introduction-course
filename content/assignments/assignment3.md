---
title: Assignment-3：扩散模型实践——DDPM 与 DDIM
summary: 在二维 Swiss Roll 数据集上实现 DDPM 与 DDIM，训练噪声预测网络，理解扩散过程并比较两种采样方法的生成效果。
order: 23
updated: 2026-10-31
points: 20
status: 待发布
zipUrl: files/packages/assignment_3.zip
zipLabel: 实验代码下载
---

# Assignment-3：扩散模型实践——DDPM 与 DDIM

本次实验将通过一个二维玩具数据集，亲手实现两种经典扩散生成模型：**Denoising Diffusion Probabilistic Models（DDPM）** 和 **Denoising Diffusion Implicit Models（DDIM）**。你将实现噪声预测网络、噪声调度器、正向加噪与反向采样，训练 DDPM，并复用相同的噪声预测网络完成 DDIM 采样，直观地观察不同采样过程的生成效果。

> 本次实验以 `DDPM_DDIM.ipynb` 为主要实验文件。具体代码提示、运行顺序与可视化均在 Notebook 中给出。
>
> **资料来源与致谢：** 本次实验参考 KAIST CS492(C): Diffusion and Flow Models（Fall 2025）的 Programming Assignment 1，原课程讲师 Minhyuk Sung，助教 Yunhong Min；原材料另致谢 Juil Koo 和 Nguyen Minh Hieu。详见 Notebook 首页及[原课程页面](https://mhsung.github.io/kaist-cs492c-fall-2025/)。

## 截止时间

> softDeadline：**待公布**
>
> hardDeadline：**待公布**

正式发布时，请在本文开头的 YAML 中补充 `softDeadline`、`hardDeadline` 字段（例如 `2026-11-30T23:59:00+08:00`），以启用首页倒计时和作业日历。

## 分数分布

| 部分 | 内容 |分值 |
| --- | --- | ---: |
| 基础实验 1（DDPM） | 噪声预测网络、调度器、扩散过程、训练及生成评估 | 30 |
| 基础实验 2（DDIM） | DDIM 反向采样、生成评估 | 30 |
| 实验报告 | 独立完成的实验分析与思考 | 40 |
| **合计** | | **60** |

## 环境设置

建议使用 **Google Colab（T4 GPU）** 完成实验，也可在配置了兼容 CUDA 和 PyTorch 环境的本地 GPU/CPU 上运行。

1. 下载实验代码包，解压后打开 `DDPM_DDIM.ipynb`，或将 Notebook 上传到 [Google Colab](https://colab.research.google.com/)。
2. 在 Colab 的 `Runtime → Change runtime type` 中选择 **T4 GPU**。
3. 运行 Notebook 开头的环境检查代码，确认 `torch.cuda.is_available()` 返回 `True`。
4. 按 Notebook 的顺序运行依赖导入、数据集和工具函数等单元。

实验主要使用 PyTorch、NumPy、Matplotlib、SciPy、scikit-learn、tqdm、ipywidgets 与 Pillow 等 Python 库。Notebook 已给出必要的导入代码。

数据集采用二维 **Swiss Roll** 分布，初始噪声服从二维标准高斯分布。实验中提供数据集生成、可视化及 Chamfer Distance 计算工具。

## 基础实验

**请仅修改 Notebook 中标记为 `TODO` 的代码区域，不要修改这些区域以外的代码。** 对于明确要求保持固定的随机种子与超参数，也不要自行修改。

### 基础实验 1：DDPM（30 分）

#### Task 1-1：实现噪声预测网络

在 `SimpleNet` 中补全网络构造和前向传播：

- 使用给定的 `TimeLinear` 层，按照 `[dim_in, dim_hids[0], ..., dim_hids[-1], dim_out]` 依次连接网络。
- 除最后一层外，每个 `TimeLinear` 层后使用 ReLU 激活。
- 完成 `SimpleNet.forward`，使网络能够根据带噪输入 $x_t$ 和时间步 $t$ 预测噪声。

#### Task 1-2：实现 DDPM 噪声调度器

在 `BaseScheduler` 中补全：

- $\alpha_t = 1-\beta_t$；
- $\bar\alpha_t = \prod_{s=1}^{t}\alpha_s$。

Notebook 已提供 `linear` 和 `quad` 两种 $\beta$ 调度方式，需在给定代码框架内完成后续计算。

#### Task 1-3：实现 DDPM 核心过程

在 `DDPM` 类中完成以下函数：

| 函数 | 任务 |
| --- | --- |
| `q_sample()` | 正向扩散：根据 $x_0$ 和时间步 $t$ 生成 $x_t$ |
| `p_sample()` | 反向扩散：从 $x_t$ 采样得到 $x_{t-1}$ |
| `p_sample_loop()` | 从高斯噪声出发，迭代完成反向生成过程 |
| `compute_loss()` | 实现 DDPM 的简化噪声预测训练损失 |

完成后运行 Notebook 的可视化单元，观察 Swiss Roll 数据在正向扩散中逐渐接近高斯分布的过程。

#### Task 1-4：训练与评估

按照 Notebook 提供的固定超参数运行 DDPM 训练：

| 参数 | 设置 |
| --- | --- |
| 扩散步数 `num_diffusion_steps` | 1000 |
| 隐层维度 `dim_hids` | `[128, 128, 128]` |
| 学习率 `lr` | `1e-3` |
| Batch size | 128 |
| 训练迭代次数 `num_train_iters` | 5000 |
| 随机种子 `SEED` | 1234 |

使用 Notebook 提供的评估代码，生成 **2048 个二维样本**，计算 DDPM 生成样本与目标数据的 Chamfer Distance，并绘制两种分布的对比图。

### 基础实验 2：DDIM（30 分）

DDIM 与此前训练的 DDPM **共享噪声预测网络**，但采用不同的反向采样过程。因此，本部分无需重新训练噪声预测网络。

在 `DDIM` 类中补全：

- `ddim_p_sample()`：根据当前时间步、上一采样时间步以及随机性参数 `eta`，实现 DDIM 的单步反向采样。
- `ddim_p_sample_loop()`：实现完整 DDIM 采样循环，支持给定推理步数和 `eta`。

Notebook 中的默认推理步数为 `num_inference_timesteps=50`，默认 `eta=0.0`。按照 Notebook 的评估单元，复用前面训练好的网络，生成 **2048 个二维样本**，计算 DDIM 的 Chamfer Distance 并绘制生成分布与目标分布的对比图。

## 测试与验收

本次实验以 Notebook 中的训练、采样与评估代码进行验收。完成所有 `TODO` 后，应能按顺序执行相关单元并得到：

1. DDPM 训练损失曲线。
2. DDPM 采样的 Chamfer Distance 数值及生成样本可视化。
3. DDIM 采样的 Chamfer Distance 数值及生成样本可视化。

本次 Notebook 未提供独立的 `pytest` 自动测试套件；请确保提交的 Notebook 能够在规定环境中复现运行结果。

## 实验报告要求

报告保存为 PDF，至少包含：

1. **基本信息**：姓名、学号。
2. **DDPM 训练结果**：训练 Loss 曲线截图。
3. **DDPM 生成结果**：Chamfer Distance 输出截图、生成分布与目标分布的对比可视化。
4. **DDIM 生成结果**：Chamfer Distance 输出截图、生成分布与目标分布的对比可视化。

建议在报告中简要说明 DDPM 与 DDIM 采样过程的区别，并结合可视化和 CD 指标对结果进行分析。

## 提交方式

提交一个 ZIP 文件，包含填写了 `TODO` 且已运行的 Notebook，以及一份 PDF 实验报告：

```text
assignment_3/
├── DDPM_DDIM.ipynb
└── 学号_report.pdf
```

建议将压缩包命名为 **`学号_assignment3.zip`**。

> 提交地址：**待公布**。

## 提醒

- 仅修改 `TODO` 区域；不要更改 Notebook 中明确指定为固定的随机种子、超参数或其他实验代码。
- 提交前从头运行 Notebook，检查训练、采样和评估结果能否复现。
- 确保报告包含要求的截图、指标和可视化。
- 原 Notebook 规定：未提交、代码不可复现、擅自修改非 `TODO` 部分或固定超参数，将得到零分；抄袭亦将得到零分。请遵守课程学术诚信要求。
- 个人答案不得上传到公开仓库。

## 参考资料

- [Denoising Diffusion Probabilistic Models (DDPM)](https://arxiv.org/abs/2006.11239)
- [Denoising Diffusion Implicit Models (DDIM)](https://arxiv.org/abs/2010.02502)
- [What are Diffusion Models? — Lilian Weng](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/)
