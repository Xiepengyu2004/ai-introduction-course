---
title: Assignment-1.2：深入神经网络
summary: 后续将实现CNN，学习PyTorch基础。
order: 21
updated: 2026-09-14

softDeadline: 2026-10-1T23:59:00+08:00
hardDeadline: 2026-10-11T23:59:00+08:00
points: 100
status: 进行中

zipUrl: files/packages/assignment_1_2.zip
zipLabel: 实验代码下载
---

# Assignment-1.2 深入神经网络

## 截止时间

> softDeadline: **2026年10月1日（周四）晚上 23:59**
> hardDeadline: **2026年10月11日（周日）晚上 23:59**

----

## 分数分布

| 部分                           | 分值 |
| :----------------------------- | :--: |
| 基础实验1：卷积神经网络        |  40  |
| 基础实验2：PyTorch入门         |  20  |
| 研究实验1：PyTorch挑战CIFAR-10 |  40  |

----

## 环境设置

本节课所有实验不对所使用平台做要求，但建议使用Colab进行实验，最终需要保证提交的zip文件包含**模型权重、包代码和notebook**。

Colab的使用方法请参考**实验资源**部分。

----

**Assignment1.2分两个部分完成：基础实验+研究实验**

## 基础实验

> **每个问题的具体实验指引在notebook(.ipynb)中 !!!!!!!!**

#### 问题 1：卷积神经网络 (Convolutional Neural Networks)

在 `ConvolutionalNetworks.ipynb` 笔记本中，你将实现几种卷积神经网络中常用的新层，以及实现一个简单的CNN网络进行训练。

#### 问题 2：PyTorch入门

在这一部分，你将学会使用 PyTorch（**一个流行且强大的深度学习框架**），打开 `PyTorch.ipynb`学习PyTorch的基本操作吧。

## 研究实验

这一部分属于开放性问题，可以自主或者结合AI设计合理的实验方案。

#### 探究 1：使用PyTorch挑战CIFAR-10分类任务

这一部分自由设计模型架构（层数，优化器，超参），要求是利用Pytorch框架进行模型的开发，你可以尝试任何PyTorch提供的板块和功能。

## 实验报告要求

1. 基础实验讲清楚大致实验过程即可。
2. 针对每个探究问题写清楚**实验设置**、**实验结果**、**实验分析**、和**实验结论。**
3. **实验结果**需要包含**可视化图表。**
4. **实验分析**不能只描述表现，要尝试解释原因，比如不能只说“如图显示损失下降”，要解释**为什么**上升/下降/震荡。
5. 实验报告长度不做要求，但是需要表述完整清楚。
6. 实验报告模板见**作业得分**板块

## 提交方式

1. 统一将文件组织成如下形式再进行压缩：

   ```
   assignment_1_2/
   ├── assignment_1_2/
   ├── ConvolutionalNetworks.ipynb
   ├── PyTorch.ipynb
   ├── ConvolutionalNetworks.npy
   ├── two_layer_fc.pth
   ├── three_layer_convnet.pth
   ├── two_layer_fc_seq.pth
   ├── three_layer_convnet_seq.pth
   ├── ..... 探究实验代码
   └── 学号_report.pdf
   ```
   
2. 压缩后命名为`学号_assignment1_2.zip`

3. 将压缩文件提交至[https://box.nju.edu.cn/u/d/5f8be2351b8949079e75/](https://box.nju.edu.cn/u/d/5f8be2351b8949079e75/)

## 提醒

- **不要使用测试集调参**；
- 提交前保证从头运行 notebook没有问题，确保权重都以`.npy`文件形式存储下来了；
- 个人答案不得上传到公开仓库。
