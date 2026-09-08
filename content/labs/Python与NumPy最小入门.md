---
title: Python 与 NumPy 最小入门
summary: 面向 Python 零基础同学，只学习完成课程实验真正需要的语法和数组操作。
order: 5
updated: 2026-09-08
---

# Python 与 NumPy 最小入门

这不是一份完整的 Python 教程。我们的目标是：**能看懂 Notebook、能补全实验中的 TODO、能根据报错定位问题。**

学习时不要只阅读代码。请打开一个新的 Jupyter Notebook 或 Colab，逐段运行并修改示例。

## 1. 先认识 Notebook

Notebook 由许多单元格（cell）组成。代码单元格需要按顺序运行：

```python
x = 10
x + 5
```

常用操作：

- 运行当前单元格：`Shift + Enter`
- `#` 后面是注释，不会被执行
- 单元格左侧出现数字，表示它已经运行过
- 修改了前面的代码后，需要重新运行相关单元格
- 如果变量状态混乱，重启运行环境并从头运行

看到下面这种代码时，`!` 表示执行系统命令，而不是 Python 语句：

```python
!pip install numpy
```

## 2. 变量和基本类型

Python 不需要提前声明变量类型：

```python
name = "Ada"       # 字符串 str
epoch = 10          # 整数 int
learning_rate = 0.1 # 小数 float
finished = False    # 布尔值 bool

print(name)
print(type(learning_rate))
```

常见运算：

```python
a = 7
b = 3

print(a + b)   # 加法：10
print(a - b)   # 减法：4
print(a * b)   # 乘法：21
print(a / b)   # 除法：2.333...
print(a // b)  # 整除：2
print(a % b)   # 余数：1
print(a ** b)  # 幂：343
```

比较运算会得到 `True` 或 `False`：

```python
score = 85
print(score >= 60)
print(score == 85)  # 判断相等使用两个等号
print(score != 85)
```

## 3. List、Tuple 和 Dictionary

### 3.1 List：有顺序、可以修改

```python
losses = [2.4, 1.8, 1.2]

print(losses[0])   # 第一个元素
print(losses[-1])  # 最后一个元素
print(len(losses)) # 元素数量

losses.append(0.9)
losses[0] = 2.3
```

Python 从 `0` 开始计数。切片 `start:end` 包含开头、不包含结尾：

```python
values = [10, 20, 30, 40, 50]

print(values[1:4]) # [20, 30, 40]
print(values[:3])  # [10, 20, 30]
print(values[2:])  # [30, 40, 50]
print(values[::2]) # [10, 30, 50]
```

### 3.2 Tuple：有顺序、通常不修改

图像尺寸经常用 tuple 表示：

```python
image_shape = (32, 32, 3)
height, width, channels = image_shape
```

### 3.3 Dictionary：用键查找值

```python
config = {
    "learning_rate": 0.01,
    "batch_size": 64,
}

print(config["batch_size"])
config["epochs"] = 20
```

## 4. 判断、循环和缩进

Python 使用缩进表示代码属于哪个结构，通常使用 4 个空格：

```python
accuracy = 0.82

if accuracy >= 0.80:
    print("达到要求")
else:
    print("继续调试")
```

遍历列表：

```python
losses = [2.4, 1.8, 1.2]

for loss in losses:
    print(loss)
```

需要下标时使用 `enumerate`：

```python
for index, loss in enumerate(losses):
    print(index, loss)
```

重复指定次数：

```python
for epoch in range(5):
    print(epoch)  # 依次输出 0、1、2、3、4
```

列表推导式是生成 list 的简写，能看懂即可：

```python
squares = [x ** 2 for x in range(5)]
```

## 5. 函数

函数把一段操作包装起来，`return` 返回结果：

```python
def compute_accuracy(correct, total):
    accuracy = correct / total
    return accuracy

result = compute_accuracy(82, 100)
print(result)
```

带默认值的参数：

```python
def train(epochs, learning_rate=0.01):
    print(epochs, learning_rate)

train(10)
train(10, learning_rate=0.001)
```

实验代码中常见：

```python
def loss(X, y=None):
    pass
```

`pass` 表示暂时什么都不做。你通常需要根据 `TODO` 提示补全这里。

## 6. 导入模块

```python
import numpy as np
import matplotlib.pyplot as plt
```

这里的 `np` 和 `plt` 是约定俗成的简称。之后：

```python
x = np.array([1, 2, 3])
plt.plot([1, 2, 3])
```

如果修改了已经导入的课程 `.py` 文件，但 Notebook 中结果没有变化，可以重新启动运行环境，或者使用课程 Notebook 提供的自动重载代码。

---

# NumPy：实验中最重要的部分

NumPy 用于高效处理数组。课程中的图像、权重、分数、梯度，通常都是 `ndarray`。

## 7. 创建数组并检查信息

```python
import numpy as np

x = np.array([1, 2, 3, 4])
print(x)
print(x.shape) # (4,)
print(x.ndim)  # 1
print(x.dtype) # 元素类型
print(x.size)  # 元素总数
```

二维数组：

```python
X = np.array([
    [1.0, 2.0, 3.0],
    [4.0, 5.0, 6.0],
])

print(X.shape) # (2, 3)：2 行、3 列
```

常用创建方法：

```python
zeros = np.zeros((2, 3))
ones = np.ones((2, 3))
sequence = np.arange(0, 10, 2)
random_values = np.random.randn(2, 3)
```

遇到数组问题，先输出以下内容：

```python
print("shape:", X.shape)
print("dtype:", X.dtype)
```

## 8. 索引和切片

```python
X = np.array([
    [10, 11, 12],
    [20, 21, 22],
    [30, 31, 32],
])

print(X[0, 1])    # 第 0 行、第 1 列：11
print(X[0])       # 第 0 行
print(X[:, 1])    # 所有行的第 1 列
print(X[:2, 1:])  # 前两行，第 1 列到最后
```

布尔索引用于筛选元素：

```python
scores = np.array([0.2, 0.8, 0.4, 0.9])
mask = scores >= 0.5

print(mask)
print(scores[mask]) # [0.8, 0.9]
```

按下标批量选择：

```python
labels = np.array([2, 0, 1])
rows = np.arange(3)

scores = np.array([
    [0.1, 0.2, 0.7],
    [0.8, 0.1, 0.1],
    [0.2, 0.6, 0.2],
])

correct_scores = scores[rows, labels]
print(correct_scores) # [0.7, 0.8, 0.6]
```

这种写法在分类损失中非常常见。

## 9. 改变 shape

```python
x = np.arange(12)
X = x.reshape(3, 4)

print(X.shape) # (3, 4)
```

`-1` 表示让 NumPy 自动计算这一维：

```python
images = np.zeros((100, 32, 32, 3))
flat_images = images.reshape(100, -1)

print(flat_images.shape) # (100, 3072)
```

增加一个长度为 1 的维度：

```python
x = np.array([1, 2, 3])

column = x[:, None] # shape 为 (3, 1)
row = x[None, :]    # shape 为 (1, 3)
```

交换矩阵的行和列：

```python
X_transposed = X.T
```

## 10. 数组运算和矩阵乘法

NumPy 的 `+ - * /` 默认逐元素计算：

```python
a = np.array([1.0, 2.0, 3.0])
b = np.array([4.0, 5.0, 6.0])

print(a + b)
print(a * b) # 逐元素乘法，不是矩阵乘法
```

矩阵乘法使用 `@` 或 `np.dot`：

```python
X = np.random.randn(5, 3) # 5 个样本，每个样本 3 个特征
W = np.random.randn(3, 4) # 从 3 个特征映射到 4 个类别

scores = X @ W
print(scores.shape)       # (5, 4)
```

检查矩阵乘法时，只看相邻的两个维度：

```text
(5, 3) @ (3, 4) -> (5, 4)
       ↑   ↑
       必须相等
```

## 11. 聚合操作与 axis

```python
X = np.array([
    [1, 2, 3],
    [4, 5, 6],
])

print(np.sum(X))         # 所有元素求和：21
print(np.sum(X, axis=0)) # 沿行方向压缩，每列求和：[5, 7, 9]
print(np.sum(X, axis=1)) # 沿列方向压缩，每行求和：[6, 15]
```

一个实用记法：**`axis` 指定哪一维会被消掉。**

常用函数：

```python
np.mean(X, axis=0)
np.max(X, axis=1)
np.min(X)
np.argmax(X, axis=1)
```

分类模型通常为每个样本选择分数最大的类别：

```python
predicted_labels = np.argmax(scores, axis=1)
```

保留被聚合的维度可以使用 `keepdims=True`：

```python
row_max = np.max(scores, axis=1, keepdims=True)
print(row_max.shape) # (样本数, 1)
```

## 12. Broadcasting（广播）

广播允许不同 shape 的数组参与运算：

```python
X = np.array([
    [1.0, 2.0, 3.0],
    [4.0, 5.0, 6.0],
])
mean = np.array([2.5, 3.5, 4.5])

centered = X - mean
```

`X.shape` 是 `(2, 3)`，`mean.shape` 是 `(3,)`。NumPy 会把同一个 `mean` 应用到每一行。

广播从 shape 的最后一维向前比较。两个维度能够配对，需要满足：

- 两者相等；或者
- 其中一个是 `1`。

如果广播报错，先打印两个数组的 shape，再考虑使用 `reshape` 或 `[:, None]`。

## 13. 向量化：尽量用数组运算

下面的循环可以工作，但速度较慢：

```python
result = np.zeros_like(x)
for i in range(len(x)):
    result[i] = x[i] ** 2
```

NumPy 写法更简洁，也更快：

```python
result = x ** 2
```

再看一个计算样本到训练数据平方距离的例子：

```python
# train_X.shape: (N, D)
# x.shape: (D,)
distances = np.sum((train_X - x) ** 2, axis=1)
```

理解过程：

1. `train_X - x`：广播后，每个训练样本都减去 `x`
2. `** 2`：每个差值平方
3. `sum(..., axis=1)`：对每个样本的所有特征求和

## 14. Softmax 中的数值稳定性

直接计算很大的指数可能溢出：

```python
scores = np.array([[1000.0, 1001.0, 1002.0]])
```

Softmax 前先减去每行最大值，不会改变最终概率：

```python
shifted_scores = scores - np.max(scores, axis=1, keepdims=True)
exp_scores = np.exp(shifted_scores)
probabilities = exp_scores / np.sum(exp_scores, axis=1, keepdims=True)
```

检查每行概率之和：

```python
print(np.sum(probabilities, axis=1)) # 应接近 1
```

## 15. 随机数与可复现

调试时设置随机种子，可以让每次运行产生相同的随机结果：

```python
np.random.seed(42)

W = 0.01 * np.random.randn(3072, 10)
indices = np.random.choice(1000, size=64, replace=False)
```

## 16. Copy 和 View

切片得到的数组可能与原数组共享数据：

```python
x = np.array([1, 2, 3, 4])
y = x[:2]
y[0] = 99

print(x) # x 也发生了变化
```

需要互不影响时显式复制：

```python
y = x[:2].copy()
```

## 17. 最常见的报错

### `NameError`

变量不存在，常见原因是变量名拼错或前面的单元格没有运行。

```text
NameError: name 'scores' is not defined
```

### `IndexError`

下标超出了数组范围。检查 `array.shape` 和索引值。

### `ValueError: operands could not be broadcast together`

两个数组的 shape 无法广播。打印双方 shape，确认对应维度是否相等或为 `1`。

### 矩阵乘法维度错误

检查 `A.shape` 和 `B.shape`，确认 `(m, n) @ (n, p)` 中间的 `n` 相等。

### 结果是 `nan` 或 `inf`

常见原因包括除以零、对零取对数、指数溢出。可以检查：

```python
print(np.isnan(x).any())
print(np.isinf(x).any())
```

计算对数时常加入一个很小的数：

```python
safe_log = np.log(probabilities + 1e-12)
```

## 18. 调试实验代码的最小流程

遇到问题时按以下顺序处理：

1. 完整阅读报错信息的最后一行
2. 找到报错指向的文件和行号
3. 输出关键变量的 `type`、`shape`、`dtype`
4. 用 2～3 个样本构造一个小输入
5. 手工计算小输入的预期结果
6. 对照程序输出，逐步缩小问题范围

推荐临时加入：

```python
print("X:", type(X), X.shape, X.dtype)
print("W:", type(W), W.shape, W.dtype)
print("scores:", scores.shape)
```

修复问题后，再删除多余的调试输出。

## 19. 五个最小练习

### 练习 1：Python 函数

编写函数，返回列表中所有数的平均值：

```python
def average(values):
    # TODO
    pass
```

### 练习 2：筛选数组

从下面的数组中选出所有大于等于 `0.5` 的元素：

```python
x = np.array([0.1, 0.7, 0.4, 0.9])
```

### 练习 3：标准化

给定 `X.shape == (100, 20)`，计算每个特征的均值，并让每个样本减去该均值。

### 练习 4：线性分类器

给定：

```python
X = np.random.randn(8, 5)
W = np.random.randn(5, 3)
```

计算类别分数，并得到 8 个样本各自的预测类别。

### 练习 5：Softmax

把练习 4 的类别分数转换为概率，并检查每个样本的概率之和是否接近 `1`。

<details>
<summary>点击查看参考答案</summary>

```python
# 练习 1
def average(values):
    return sum(values) / len(values)

# 练习 2
selected = x[x >= 0.5]

# 练习 3
feature_mean = np.mean(X, axis=0)
centered_X = X - feature_mean

# 练习 4
scores = X @ W
predictions = np.argmax(scores, axis=1)

# 练习 5
shifted = scores - np.max(scores, axis=1, keepdims=True)
exp_scores = np.exp(shifted)
probabilities = exp_scores / np.sum(exp_scores, axis=1, keepdims=True)
print(np.sum(probabilities, axis=1))
```

</details>

## 20. 开始实验前的检查清单

如果下面的大部分内容都能理解，就可以开始课程实验：

- 能运行和重新运行 Notebook 单元格
- 知道 Python 从下标 `0` 开始
- 能读懂函数、循环和 `if` 判断
- 能查看 NumPy 数组的 `shape` 和 `dtype`
- 能进行二维数组索引和切片
- 知道 `*` 是逐元素乘法，`@` 是矩阵乘法
- 能使用 `sum`、`mean`、`max`、`argmax` 及其 `axis`
- 能用 `reshape`、`.T` 和 `[:, None]` 调整 shape
- 大致理解广播和向量化
- 遇到报错时会先检查变量和 shape

不需要一次记住所有写法。实验中遇到问题时，回到对应章节查找即可。
