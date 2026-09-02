---
title:  Assignment-1.1：深度学习基础
summary: 完成 kNN、Softmax分、两层神经网络、特征训练和全连接层网络板块。
order: 20
updated: 2026-09-02

softDeadline: 2026-09-15T23:59:00+08:00
hardDeadline: 2026-09-20T23:59:00+08:00
points: 100
status: 进行中
---

# Assignment-1.1：深度学习基础

### 截止时间

> softDeadline: **2026年9月15日（周二）晚上 23:59**
> hardDeadline: **2026年9月20日（周日）晚上 23:59**

----

### 分数分布

| 部分 | 分值 |
|:--|:--:|
| 问题1：kNN | 10 |
| 问题2：Softmax | 15 |
| 问题3：两层神经网络 | 25 |
| 问题4：图像特征 |   10 |
| 问题5：全连接层网络 | 25 |
| 探究1：优化器算法 | 5 |
| 探究2：调参方法 | 5 |
| 探究3：初始化方法 | 5 |

----

### 环境设置

- 请确保定期保存笔记本（`File -> Save`，即“文件 → 保存”）。这样，当你暂时离开作业、Colab 虚拟机断开连接时，就不会丢失进度。
- 为了支持在会话中编辑文件，每次打开新的笔记本时，请在运行任何单元格之前，点击 `Runtime -> Change runtime type`（“运行时 → 更改运行时类型”）。在弹出的窗口中，将 `Runtime version`（“运行时版本”）从 `Latest`（“最新”）更改为 `2025.07`。（如果你已经启动了运行时，请点击 `Runtime -> Disconnect and delete runtime`，即“运行时 → 断开连接并删除运行时”。）

在Colab上完成除了 `collect_submission.ipynb` 之外的所有**Jupyter notebook**（`.ipynb`后缀文件）后，请根据**提交作业**指明的方式提交。

----

### 实验目标

在本次作业中，你将练习搭建一个简单的图像分类工作流，所使用的分类器包括 k 近邻分类器以及 SVM/Softmax 分类器。本次作业的目标如下：

- 理解基本的图像分类流程和数据驱动方法（训练/预测阶段）。
- 理解**训练集、验证集和测试集**的划分，以及如何使用验证数据**调节超参数**。
- 熟练使用 NumPy 编写高效的向量化代码。
- 实现并应用 k 近邻（kNN）分类器。
- 实现并应用 Softmax 分类器。
- 实现并应用两层神经网络分类器。
- 实现并应用全连接网络分类器。
- 理解这些分类器之间的差异与权衡。
- 初步了解使用高层次表示（相比于原始像素）所带来的性能提升，例如颜色直方图、方向梯度直方图（HOG）特征等。

-----

### 任务总览

#### 问题 1：k 近邻分类器

`knn.ipynb` 将引导你实现 kNN 分类器。

#### 问题 2：实现 Softmax 分类器

`softmax.ipynb` 将引导你实现 Softmax 分类器。

#### 问题 3：两层神经网络

`two_layer_net.ipynb` 将引导你实现一个两层神经网络分类器。

#### 问题 4：更高层次的表示——图像特征

`features.ipynb` 将研究与直接使用原始像素值相比，使用更高层次的图像表示能够带来哪些提升。

#### 问题 5：训练全连接网络

`FullyConnectedNets.ipynb` 将引导你实现全连接网络。

## 研究实验



## 提交方式

**重要提示：请务必确认待提交的notebook已经运行过，并且单元格输出清晰可见。**

完成所有notebook并填写必要的代码后，请按照以下步骤提交作业：

1. 在 kaggle中打开 `collect_submission.ipynb`，然后执行其中的单元格。

   该脚本将会：

   - 把你的代码（`.py` 和 `.ipynb` 文件）打包成名为 `a1_code_submission.zip` 的 ZIP 文件。
   - 将所有笔记本转换并合并为一个 PDF 文件。

   如果这一步成功完成，你应该会看到以下提示信息：

   ```text
   ### Done! Please submit a1_code_submission.zip and a1_inline_submission.pdf. ###
   ```

   中文含义：

   > 完成！请将 `a1_code_submission.zip` 和 `a1_inline_submission.pdf` 提交到 Gradescope。

2. 将 PDF 文件和 ZIP 文件提交至 [Gradescope](https://www.gradescope.com/courses/1288404)。

在提交至 Gradescope 之前，请记得先把 `a1_code_submission.zip` 和 `a1_inline_submission.pdf` 下载到本地。

## 提醒

- 不要使用测试集调参；
- 提交前保证从头运行 notebook没有问题；
- 个人答案不得上传到公开仓库。

