---
title: CoLab使用手册
summary:
order: 10
updated: 2026-09-02
---

# CoLab使用手册

## 1. 准备

你只需要：

- 一个 Google 账号
- 浏览器
- 作业压缩文件（比如project1.zip）

打开：

```
https://colab.research.google.com/
```

登录 Google 账号后即可使用 Colab。

## 2. Colab 是什么

Colab 可以理解成：

> 在线版 Jupyter Notebook + 一台临时 Linux 服务器。

你可以直接运行 Python，也可以使用 GPU。

Notebook 文件一般是：

```
xxx.ipynb
```

## 3. 把 project1文件放到 Google Drive

Google Drive 就是 Google 提供的云盘。

直接把解压后的project1放入到云盘根目录下，组织成：

```
MyDrive/
└── project1/
    └── assignment1_1/
    └── knn.ipynb
    └── ......
```

## 4. 在 Colab 中挂载 Google Drive

**挂载的代码和project1代码导入都已经写好在每个.ipynb中，点一下左键运行即可。**

运行：

```
from google.colab import drive
drive.mount('/content/drive')
```

授权后，你的 Google Drive 会出现在：

```
/content/drive/MyDrive
```

例如：

```
MyDrive/project1
```

对应 Colab 中的：

```
/content/drive/MyDrive/project1
```

## 5. 让 Python 找到 project1代码

Notebook 中通常会有：

```
FOLDERNAME = 'project1/'
```

然后：

```
import sys

sys.path.append(
    '/content/drive/MyDrive/{}'.format(FOLDERNAME)
)
```

作用就是：

> 把 project1目录加入 Python 的模块搜索路径。

之后才能正常运行：

```
from assignment1_1.data_utils import load_CIFAR10
```

## 6. 使用 GPU

如果实验需要 GPU：

```
Runtime
→ Change runtime type
→ GPU
```

然后可以检查：

```
!nvidia-smi
```

或者：

```
import torch

print(torch.cuda.is_available())
```

## 7. 最重要的一个概念

Colab 自己的：

```
/content
```

是临时空间，运行环境关闭后文件可能消失。

而：

```
/content/drive/MyDrive
```

对应你的 Google Drive，可以长期保存。

所以做 project1 时，最简单的理解就是：

```
project1 文件
    ↓
Google Drive
    ↓
挂载到 Colab
    ↓
Notebook 运行实验
```

基本掌握：

```
drive.mount(...)
sys.path.append(...)
```

就已经足够完成 project1前面的基础实验了。

## 8.注意事项

**在执行jupyter文件的时候，如果修改了已导入模块的代码（比如softmax.py）， 需要释放临时环境重新执行才能生效** 

解决方案：在各个`.ipynb`文件前面加上这段代码

```
import sys
import importlib

sys.modules["imp"] = importlib

%load_ext autoreload
%autoreload 2
```

