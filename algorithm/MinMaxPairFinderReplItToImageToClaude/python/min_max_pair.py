# n = int(input())
# elements = list(map(int, input().split()))
n = 6
elements = [2, 1, 3, 5, 2, 4]

# 预处理max_after数组，记录每个i之后的最大值及其最早索引
current_max_val = -float('inf')
current_max_index = -1
max_after = [(0, 0)] * n
for i in range(n-1, -1, -1):
    max_after[i] = (current_max_val, current_max_index)
    if elements[i] > current_max_val:
        current_max_val = elements[i]
        current_max_index = i

# 预处理min_after数组，记录每个i之后的最小值及其最早索引
current_min_val = float('inf')
current_min_index = -1
min_after = [(0, 0)] * n
for i in range(n-1, -1, -1):
    min_after[i] = (current_min_val, current_min_index)
    if elements[i] < current_min_val:
        current_min_val = elements[i]
        current_min_index = i

# 初始化变量记录最小差和最大差的索引
min_diff = float('inf')
i_min, j_min = -1, -1
max_diff = -float('inf')
i_max, j_max = -1, -1

# 遍历每个i，寻找最优解
for i in range(n-1):  # i最多到n-2，因为j必须大于i
    # 处理最小差：elements[i] - max_after[i][0]
    current_max_val, current_max_idx = max_after[i]
    if current_max_idx == -1:
        continue  # 理论上不会发生，因为i最多到n-2
    current_diff = elements[i] - current_max_val
    # 比较并更新最小差
    if current_diff < min_diff:
        min_diff = current_diff
        i_min, j_min = i, current_max_idx
    elif current_diff == min_diff:
        if i < i_min or (i == i_min and current_max_idx < j_min):
            i_min, j_min = i, current_max_idx

    # 处理最大差：elements[i] - min_after[i][0]
    current_min_val, current_min_idx = min_after[i]
    current_diff = elements[i] - current_min_val
    # 比较并更新最大差
    if current_diff > max_diff:
        max_diff = current_diff
        i_max, j_max = i, current_min_idx
    elif current_diff == max_diff:
        if i < i_max or (i == i_max and current_min_idx < j_max):
            i_max, j_max = i, current_min_idx

# 转换为1-based索引
print(i_min + 1, j_min + 1)
print(i_max + 1, j_max + 1)
