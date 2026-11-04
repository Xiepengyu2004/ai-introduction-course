"""
OJ端的额外测试用例
"""

import math

import torch
from torch.nn import functional as F

from assignment_2_1 import RMSNorm, SwiGLU, CausalSelfAttention, TransformerBlock, TransformerLM
from assignment_2_1.attention import scaled_dot_product_attention
from assignment_2_1.rope import RotaryEmbedding


def norm(x, weight, eps=1e-5):
    return x / torch.sqrt(x.square().mean(-1, keepdim=True) + eps) * weight


def rotate(x, positions, theta):
    angle = positions.to(x)[:, None] * theta ** (-torch.arange(0, x.shape[-1], 2).to(x) / x.shape[-1])
    pairs = x.reshape(*x.shape[:-1], -1, 2)
    return torch.stack((pairs[..., 0] * angle.cos() - pairs[..., 1] * angle.sin(),
                        pairs[..., 0] * angle.sin() + pairs[..., 1] * angle.cos()), -1).flatten(-2)


def attention(q, k, v, mask=None):
    logits = q @ k.transpose(-1, -2) / math.sqrt(q.shape[-1])
    if mask is not None:
        logits = logits.masked_fill(~mask, -torch.inf)
    return logits.softmax(-1) @ v


def multihead(x, weights, heads, positions, theta):
    batch, length, width = x.shape
    q, k, v = [(x @ weights[f'{name}_proj.weight'].T).reshape(batch, length, heads, width // heads)
               .transpose(1, 2) for name in ('q', 'k', 'v')]
    q, k = rotate(q, positions, theta), rotate(k, positions, theta)
    mask = torch.ones(length, length, dtype=torch.bool).tril()
    output = attention(q, k, v, mask).transpose(1, 2).reshape(batch, length, width)
    return output @ weights['output_proj.weight'].T


def feedforward(x, weights):
    return (F.silu(x @ weights['w1.weight'].T) * (x @ weights['w3.weight'].T)) @ weights['w2.weight'].T


def block(x, weights, heads, positions, theta):
    attn_weights = {key.removeprefix('attn.'): value for key, value in weights.items() if key.startswith('attn.')}
    ff_weights = {key.removeprefix('ffn.'): value for key, value in weights.items() if key.startswith('ffn.')}
    z = x + multihead(norm(x, weights['ln1.weight']), attn_weights, heads, positions, theta)
    return z + feedforward(norm(z, weights['ln2.weight']), ff_weights)


def fill_weights(model, seed):
    generator = torch.Generator().manual_seed(seed)
    weights = {name: torch.randn(value.shape, generator=generator, dtype=value.dtype) * 0.2
               for name, value in model.state_dict().items()}
    model.load_state_dict(weights)
    return weights


def test_rmsnorm_edges():
    torch.manual_seed(101)
    for shape in [(6,), (5, 6), (2, 3, 4, 6)]:
        model = RMSNorm(6, eps=0.05).double()
        weights = fill_weights(model, 102)
        x = torch.randn(shape, dtype=torch.float64)
        torch.testing.assert_close(model(x), norm(x, weights['weight'], 0.05))
        torch.testing.assert_close(model(torch.zeros_like(x)), torch.zeros_like(x))


def test_swiglu_edges():
    torch.manual_seed(111)
    model = SwiGLU(6, 10).double()
    weights = fill_weights(model, 112)
    for shape in [(6,), (3, 6), (2, 3, 5, 6)]:
        x = torch.randn(shape, dtype=torch.float64)
        torch.testing.assert_close(model(x), feedforward(x, weights))


def test_rope_edges():
    torch.manual_seed(121)
    model = RotaryEmbedding(8, 32, 137.0)
    positions = torch.tensor([11, 3, 18, 1])
    # API requires matching dtype/shape and supports arbitrary leading dimensions.
    for shape in [(4, 8), (2, 4, 8), (2, 3, 4, 8)]:
        x = torch.randn(shape)
        actual = model(x, positions)
        assert actual.dtype == x.dtype and actual.shape == x.shape
        torch.testing.assert_close(actual, rotate(x, positions, 137.0), atol=1e-5, rtol=1e-5)
        torch.testing.assert_close(model(x), rotate(x, torch.arange(4), 137.0), atol=1e-5, rtol=1e-5)


def test_sdpa_edges():
    torch.manual_seed(131)
    q = torch.randn(2, 3, 4, 6, dtype=torch.float64)
    k = torch.randn(1, 3, 5, 6, dtype=torch.float64)
    v = torch.randn(2, 1, 5, 7, dtype=torch.float64)
    mask = torch.tensor([[True, False, True, False, False]]).expand(4, -1)
    for visibility in (None, mask):
        torch.testing.assert_close(scaled_dot_product_attention(q, k, v, visibility),
                                   attention(q, k, v, visibility))
    # Masked keys must not affect the result, even with extremely large values.
    altered = v.clone()
    altered[..., ~mask[0], :] = 1e6
    torch.testing.assert_close(scaled_dot_product_attention(q, k, altered, mask), attention(q, k, v, mask))


def test_multihead_edges():
    torch.manual_seed(141)
    model = CausalSelfAttention(12, 3, 32, 137.0).double()
    weights = fill_weights(model, 142)
    x = torch.randn(2, 4, 12, dtype=torch.float64)
    positions = torch.tensor([11, 3, 18, 1])
    for indices in (None, positions):
        expected = multihead(x, weights, 3, torch.arange(4) if indices is None else indices, 137.0)
        torch.testing.assert_close(model(x, indices), expected, atol=1e-6, rtol=1e-5)
    altered = x.clone()
    altered[:, 2:] += 50
    torch.testing.assert_close(model(x)[:, :2], model(altered)[:, :2])
    torch.testing.assert_close(model(x[:, :1]), multihead(x[:, :1], weights, 3, torch.arange(1), 137.0))


def test_block_edges():
    torch.manual_seed(151)
    model = TransformerBlock(12, 3, 20, 32, 137.0).double()
    weights = fill_weights(model, 152)
    x = torch.randn(2, 4, 12, dtype=torch.float64)
    positions = torch.tensor([11, 3, 18, 1])
    torch.testing.assert_close(model(x, positions), block(x, weights, 3, positions, 137.0), atol=1e-6, rtol=1e-5)


def test_lm_edges():
    torch.manual_seed(161)
    model = TransformerLM(29, 8, 12, 2, 3, 20, 137.0).double()
    weights = fill_weights(model, 162)
    assert model.token_embeddings.weight is not model.lm_head.weight
    assert len({id(layer) for layer in model.layers}) == 2
    token_ids = torch.randint(0, 29, (2, 8))
    for length in (1, 3, 8):
        ids = token_ids[:, :length]
        x = weights['token_embeddings.weight'][ids]
        for layer in range(2):
            prefix = f'layers.{layer}.'
            layer_weights = {key.removeprefix(prefix): value for key, value in weights.items() if key.startswith(prefix)}
            x = block(x, layer_weights, 3, torch.arange(length), 137.0)
        expected = norm(x, weights['ln_final.weight']) @ weights['lm_head.weight'].T
        torch.testing.assert_close(model(ids), expected, atol=1e-6, rtol=1e-5)
    modified = token_ids.clone()
    modified[:, 4:] = (modified[:, 4:] + 1) % 29
    torch.testing.assert_close(model(token_ids)[:, :4], model(modified)[:, :4])
