# test_main.py

import pytest
from main import process_array

@pytest.fixture(params=[
    # 示例 1
    {
        "input": [2, 1, 3, 5, 2, 4],
        "expected_min": (2, 4),  # 1-5 的差为 -4（最小）
        "expected_max": (4, 5)   # 2-4 的差为 2（最大）
    },
    # 示例 2
    {
        "input": [3, 2, 4, 5, 6],
        "expected_min": (2, 5),  # 2-6 的差为 -4（最小）
        "expected_max": (1, 2)   # 3-2 的差为 1（最大）
    },
    # 所有元素相同
    {
        "input": [5, 5, 5],
        "expected_min": (1, 2),  # 差为0
        "expected_max": (1, 2)   # 差为0
    },
    # 递增数组
    {
        "input": [1, 2, 3, 4, 5],
        "expected_min": (1, 2),  # 最小差1
        "expected_max": (1, 5)   # 最大差4
    },
    # 递减数组
    {
        "input": [5, 4, 3, 2, 1],
        "expected_min": (4, 5),  # 最小差1
        "expected_max": (1, 5)   # 最大差4
    },
    # 多个相同最小差
    {
        "input": [3, 1, 4, 1, 5],
        "expected_min": (2, 4),  # 差0（i=2最小）
        "expected_max": (4, 5)   # 5-1=4
    }
])
def test_cases(request):
    return request.param

def test_process_array(test_cases):
    elements = test_cases["input"]
    expected_min = test_cases["expected_min"]
    expected_max = test_cases["expected_max"]
    
    (actual_min, actual_max) = process_array(elements)
    
    # 验证最小差结果
    assert actual_min == expected_min, f"最小差错误: 输入{elements}"
    # 验证最大差结果
    assert actual_max == expected_max, f"最大差错误: 输入{elements}"


def test_invalid_input():
    """测试非法输入（如n不合法或元素越界）"""
    # 需要重构输入部分为可测试函数（此处假设已处理）
    pass  # 根据实际输入逻辑补充测试

def test_smallest_possible_array():
    """测试最小数组（n=3）"""
    elements = [1, 2, 3]
    expected_min = (1, 2)
    expected_max = (1, 3)
    assert process_array(elements) == (expected_min, expected_max)


"""
# 安装 pytest 和覆盖率工具
pip install pytest pytest-cov

# 运行测试并生成报告
pytest --cov=main --cov-report=html test_main.py
"""