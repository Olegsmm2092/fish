# 🟦 Matrix Path Sum Visualizer

A visual tool inspired by [LeetCode #64](https://leetcode.com/problems/minimum-path-sum/description/), but modified to calculate the **Maximum Path Sum** instead of the minimum.

## ✨ Features

- 🟢 Visualizes the matrix grid step-by-step.
- 🖤 Highlights the current path being explored.
- 🧮 Displays both the **current path sum** and the **maximum path sum** so far.
- 🛠️ Editable matrix with instant updates.

## 📊 How It Works

- **Input:** A matrix of integers.
- **Goal:** Start at the top-left (0,0) and reach the bottom-right (m-1,n-1) by moving **only right or down**.
- **Output:** The path that gives the **maximum sum**.

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Run the Project
```bash
npm run dev
```

---
## 🗂️ Project Structure

| Folder / File       | Description                              |
| ------------------- | ---------------------------------------- |
| `/client`           | Frontend app (likely Vite + React)       |
| `/server`           | Backend logic (if applicable)            |
| `/core`             | Core algorithms (path finding, DP logic) |
| `/db`               | Database (if any; optional)              |
| `drizzle.config.ts` | Drizzle ORM config (if using DB)         |
| `vite.config.ts`    | Vite config file                         |

---
## 🧠 Algorithm (Max Path Sum)

### We use Dynamic Programming:

```python
for each cell (i, j):
    if i == 0 and j == 0:
        dp[i][j] = grid[i][j]
    elif i == 0:
        dp[i][j] = dp[i][j-1] + grid[i][j]
    elif j == 0:
        dp[i][j] = dp[i-1][j] + grid[i][j]
    else:
        dp[i][j] = max(dp[i-1][j], dp[i][j-1]) + grid[i][j]
```

---
## 💻 How to Use

### 1️⃣ Edit the matrix with the Edit Matrix button.
### 2️⃣ Click Next Step to step through the algorithm.
### 3️⃣ Watch as the path and sums update live. 
- Current Path Sum: shows the sum of the path being drawn.

- Maximum Path Sum: updates as new paths are explored.

---

## 🧩 Example Matrix

| 7  | 15 | 1 | 3 | 14 |
| -- | -- | - | - | -- |
| 2  | 3  | 4 | 0 | 1  |
| 9  | 2  | 5 | 8 | 4  |
| 1  | 6  | 2 | 1 | 2  |
| 12 | 3  | 6 | 1 | 2  |

--- 

## 🔗 Related

-    LeetCode Problem: [#64 Minimum Path Sum](https://leetcode.com/problems/minimum-path-sum/)

-   Alternative: [#62 Unique Paths](https://leetcode.com/problems/unique-paths/)

---

## 🛡️ License

### MIT License.

---

👉 **Do you want to include the full algorithm implementation in the README? Or more backend setup instructions too?**

Let me know in the issue on the [GitHub repository](https://github.com/Olegsmm2092/fish/tree/master/algorithm/64.MaxPathSum).


