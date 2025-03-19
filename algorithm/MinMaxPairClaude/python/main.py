# main.py

def process_array(elements):
    """处理数组并返回最小差和最大差的索引对 (1-based)"""
    n = len(elements)
    
    # 预处理 max_after 数组
    current_max_val = -float('inf')
    current_max_index = -1
    max_after = [(0, 0)] * n
    for i in range(n-1, -1, -1):
        max_after[i] = (current_max_val, current_max_index)
        if elements[i] > current_max_val:
            current_max_val = elements[i]
            current_max_index = i

    # 预处理 min_after 数组
    current_min_val = float('inf')
    current_min_index = -1
    min_after = [(0, 0)] * n
    for i in range(n-1, -1, -1):
        min_after[i] = (current_min_val, current_min_index)
        if elements[i] < current_min_val:
            current_min_val = elements[i]
            current_min_index = i

    # 查找最小差和最大差
    min_diff = float('inf')
    i_min, j_min = -1, -1
    max_diff = -float('inf')
    i_max, j_max = -1, -1

    for i in range(n-1):
        # 最小差逻辑
        current_max_val, current_max_idx = max_after[i]
        if current_max_idx != -1:
            current_diff = elements[i] - current_max_val
            if current_diff < min_diff:
                min_diff = current_diff
                i_min, j_min = i, current_max_idx
            elif current_diff == min_diff:
                if i < i_min or (i == i_min and current_max_idx < j_min):
                    i_min, j_min = i, current_max_idx

        # 最大差逻辑
        current_min_val, current_min_idx = min_after[i]
        current_diff = elements[i] - current_min_val
        if current_diff > max_diff:
            max_diff = current_diff
            i_max, j_max = i, current_min_idx
        elif current_diff == max_diff:
            if i < i_max or (i == i_max and current_min_idx < j_max):
                i_max, j_max = i, current_min_idx

    return (i_min + 1, j_min + 1), (i_max + 1, j_max + 1)