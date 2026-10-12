---
title: Assignment-2.1：实现 Transformer Block 与语言模型
summary: 实现 RMSNorm、SwiGLU、RoPE 和因果注意力，组装 Transformer Block 与完整语言模型，并分析单个 Block 的资源开销。
order: 22
updated: 2026-10-12

softDeadline: 2026-11-05T23:59:00+08:00
hardDeadline: 2026-11-20T23:59:00+08:00
points: 100
status: 进行中
zipUrl: files/packages/assignment_2_1.zip
zipLabel: 实验代码下载
---

# Assignment-2.1：实现 Transformer Block 与语言模型
Assignment-2 分为两个部分：在Assignment-2.1中，我们将会实现一个完整的Transformer Langauage Model，在Assignment 2.2中我们会完成训练部分的代码，并且亲手地训练模型。其中Assignment-2.1是必做实验，而Assignment-2.2将会以选做实验的形式给出。

本次实验，我们将实现基础组件、单个 Transformer Block 和完整的 Transformer 语言模型（Transformer LM），并分析单个 Block 的参数量与前向计算量。实验全程**无需训练模型，本地 CPU 即可完成** 。

## 截止时间

> softDeadline: **2026年11月5日（周四）晚上 23:59**
> hardDeadline: **2026年11月20日（周五）晚上 23:59**

## 分数分布

| 部分 | 内容 | 分值 |
| --- | --- | ---: |
| 基础实验 1 | RMSNorm、SwiGLU | 25 |
| 基础实验 2 | RoPE、缩放点积注意力、多头因果自注意力 | 40 |
| 基础实验 3 | Transformer Block（10 分）、Transformer LM（15 分） | 25 |
| 探究实验 | 单个 Block 的 Resource Accounting | 10 |
| **合计** | | **100** |

## 环境设置

下载实验代码并解压，使用conda或者uv在本机配置好环境：
```sh
python -m pip install -r requirements.txt
python -m notebook 
```

打开 `TransformerBlock.ipynb`，按其中的说明完成实验，所有的TODO都在`assignment_2_1/`中，notebook里面主要是一些必要的引导和测评指令，当然也可以在命令行中输入pytest相关指令来测评（实际上Notebook里面就是这样测评的）

## 基础实验

### 基础实验 1：RMSNorm 与 SwiGLU（25 分）

在 `assignment_2_1/layers.py` 中完成：

- `RMSNorm.forward`（TODO 1）：实现沿特征维度的均方根归一化。
- `SwiGLU.forward`（TODO 2）：实现带门控的前馈网络。

### 基础实验 2：位置编码与注意力（40 分）

- 在 `assignment_2_1/rope.py` 中完成 `RotaryEmbedding.forward`（TODO 3）。
- 在 `assignment_2_1/attention.py` 中完成 `scaled_dot_product_attention`（TODO 4）。
- 在 `assignment_2_1/attention.py` 中完成 `CausalSelfAttention.forward`（TODO 5），包含 RoPE、多头计算和因果 mask。

### 基础实验 3：Transformer Block 与 Transformer LM（25 分）

在 `assignment_2_1/transformer.py` 中完成：

- `TransformerBlock.forward`（TODO 6，10 分）：组装 pre-norm Block。
- `TransformerLM.__init__` 和 `TransformerLM.forward`（TODO 7，15 分）：组装完整语言模型。

完整模型接受形状为 `(B, N)` 的整数 token ID，返回 `(B, N, V)` 的 **logits**，支持不超过 `context_length` 的不同输入长度。各 Block 参数独立，embedding 与 LM head 不共享权重。Linear 与 Embedding 不单独考核，可使用 PyTorch 提供的层。

## 测试与验收

可以运行 Notebook 中的分项测试，也可以在外层作业目录运行全部测试：

```sh
python -m pytest -q
```

共 **9 个测试用例**，覆盖 RMSNorm、SwiGLU、RoPE、缩放点积注意力（含四维输入）、含 RoPE 的多头注意力、Transformer Block，以及完整语言模型和截短输入。

请不要修改`tests/adapters.py`、`tests/_snapshots/` 和 `tests/fixtures/`等文件，以免影响测评。

## 探究实验：Resource Accounting（10 分）
> Note: 这一部分需要在实验报告中需要给出

分析**一个 Transformer Block** 的可训练参数量与一次前向传播的主要计算量，统一使用以下配置：

| 配置项 | 值 |
| --- | ---: |
| `d_model` | 128 |
| `num_heads` | 4 |
| `d_ff` | 344 |
| RoPE theta | 10000 |
| batch size | 1 |

线性层均无 bias，两个 RMSNorm 各有一组可训练缩放参数。

### 参数量

计算给定配置下一个 Block 的可训练参数量，在报告中说明统计范围与各项来源。

### 前向计算量

1. 输入长度为 1 时，列出主要矩阵乘法的形状和 FLOPs，并求总量。
2. 输入长度为 `n` 时，用 `n`、`d`（`d_model`）、`d_ff` 写出各项计算量与总量；代入 `n=16` 和给定配置。
3. 说明哪些操作随 token 数线性增长，哪些随 token 数平方增长。

计算约定如下：

- 一次乘法加一次加法计为 **2 FLOPs**。
- 只统计单个 Block 前向传播的主要矩阵乘法，不含 Embedding、LM head、反向传播和优化器。
- RMSNorm、Softmax、SiLU、门控逐元素乘、RoPE、mask/缩放和残差加法作为忽略项列出说明。
- 先计算完整注意力分数矩阵再应用因果 mask，不能直接将矩阵乘法 FLOPs 减半。
- “1 个 token”指长度为 1、无历史缓存的完整前向传播，不涉及 KV cache。

## 实验报告要求

报告保存为 `学号_report.pdf`，包含：

1. 基础实验过程的简要说明和记录。
2. Resource Accounting的分析和结果。
3. （可选）对课堂实验的评价或改进建议。


## 提交方式

将完整作业目录、已运行的 Notebook 和报告组织为以下结构：

```text
assignment_2_1/
├── assignment_2_1/
│   ├── __init__.py
│   ├── layers.py
│   ├── rope.py
│   ├── attention.py
│   └── transformer.py
├── TransformerBlock.ipynb
├── tests/                  
├── images/
├── requirements.txt
├── pytest.ini
├── README.md
├── AGENTS.md
├── LICENSE
└── 学号_report.pdf
```

压缩后命名为 **`学号_assignment2_1.zip`**。

将压缩文件提交至[https://box.nju.edu.cn/u/d/a4d1e3e449f9454b8d58/](https://box.nju.edu.cn/u/d/a4d1e3e449f9454b8d58/)。

## 成绩查询

[查询个人成绩](https://table.nju.edu.cn/dtable/links/a0e501c5caf44b71b423)

## 提醒

- 不要将虚拟环境、缓存或无关文件打包提交。
- 个人答案不得上传到公开仓库。
- 你在2.1中完成的部分，将会在作业2.2中复用
