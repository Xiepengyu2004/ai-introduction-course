---
title: NumPy 向量化基础
summary: 为 kNN、Softmax 和神经网络实验准备 broadcasting 与矩阵运算知识。
order: 2
updated: 2026-09-02
---

# NumPy 向量化基础

向量化的目标不是“少写几行代码”，而是把逐样本计算改写成矩阵运算，使计算能够交给底层高效实现。

## 必须掌握的操作

| 操作 | 常见用途 |
|---|---|
| `reshape` | 改变样本的组织方式 |
| `sum(axis=...)` | 沿指定维度聚合 |
| broadcasting | 避免复制数据 |
| 布尔索引 | ReLU、分类正确项处理 |
| `argmax` | 从分类分数得到预测类别 |

```python
# X: (N, D), W: (D, C)
scores = X @ W
predictions = np.argmax(scores, axis=1)
```

## 自检问题

如果 `X.shape == (500, 3072)`，`W.shape == (3072, 10)`，那么 `X @ W` 的 shape 是多少？每个维度分别代表什么？
