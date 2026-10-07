# LG-8: Restaurant Customer Satisfaction Using Hypothesis Testing

A real-time, responsive web application for college project presentation and viva evaluation. This project converts statistical analysis and predictive modeling into an interactive, real-time web platform.

---

## 📌 Project Overview

* **Project Title:** LG-8: Restaurant Customer Satisfaction Using Hypothesis Testing
* **Domain:** Applied Statistics & Machine Learning (Data Science / AI)
* **Core Hypothesis:** One-Sample Left-Tailed Student's t-Test
* **Significance Level:** $\alpha = 0.05$
* **Industry Benchmark:** $\mu_0 = 3.5$ stars
* **Supporting ML Component:** Random Forest Multi-Class Classifier (25 Decision Trees, Gini Impurity)

---

## 🎯 Core Research Objective

Evaluate whether empirical restaurant customer satisfaction falls significantly below the operational industry benchmark of **3.50 stars** using rigorous inferential statistics, while discovering multivariate customer behavioral drivers (spending, payment method, visit frequency, and favorite dishes) using ensemble machine learning.

All calculations are performed **in real time directly from the uploaded CSV dataset**. No hardcoded statistics or synthetic results are used.

---

## 📊 Dataset Schema Requirements

The application strictly expects the following column headers in uploaded CSV files:

| Column Name | Inferred Type | Role |
| :--- | :--- | :--- |
| `USER ID` | String | Unique identifier (strictly excluded from ML features) |
| `AMOUNT SPENT ON THAT DAY(20/10/2024)` | Numeric (Float/Int) | Continuous spending covariate |
| `Payment Method` | Categorical | Payment mode (e.g. UPI, Credit Card, Cash, Debit Card) |
| `Feedback Score (1-5)` | Ordinal Integer (1 to 5) | **Primary Target Variable** for Hypothesis Testing & ML |
| `Favorite Dish` | Categorical | Menu item ordered |
| `Visit Frequency` | Categorical | Dining frequency (Daily, Weekly, Monthly, First Time, Rarely) |
| `DATE` | String / Date | Transaction timestamp |

### Feedback Score Interpretation:
* `1` = Very Dissatisfied
* `2` = Dissatisfied
* `3` = Neutral
* `4` = Satisfied
* `5` = Very Satisfied

---

## 📐 Mathematical Formulation of Hypothesis Testing

### 1. Hypotheses:
* **Null Hypothesis ($H_0$):** $\mu \ge 3.5$
  *(The population mean customer satisfaction is at least 3.5 stars — acceptable performance)*
* **Alternative Hypothesis ($H_1$):** $\mu < 3.5$
  *(The population mean customer satisfaction is strictly below 3.5 stars — service underperformance)*

### 2. Test Statistic (One-Sample Left-Tailed t-Test):
$$t = \frac{\bar{x} - \mu_0}{SE} = \frac{\bar{x} - 3.50}{\frac{s}{\sqrt{n}}}$$
Where:
* $n$ = Sample size
* $\bar{x} = \frac{1}{n} \sum_{i=1}^n x_i$ (Sample mean feedback score)
* $s = \sqrt{\frac{1}{n - 1} \sum_{i=1}^n (x_i - \bar{x})^2}$ (Sample standard deviation)
* $SE = \frac{s}{\sqrt{n}}$ (Standard Error of the mean)
* $df = n - 1$ (Degrees of freedom)

### 3. Decision Rule at $\alpha = 0.05$:
* Calculate Left-Tailed Critical Value: $t_{\text{crit}} = -t_{0.05, df}$
* Calculate p-value: $p = P(T \le t \mid df)$ using the regularized incomplete beta function $I_x(df/2, 1/2)$
* **If $p < 0.05$ (or $t < t_{\text{crit}}$):** $\rightarrow$ **Reject $H_0$**
  *(Statistically significant evidence that restaurant customer satisfaction is below the 3.5 benchmark. Urgent management intervention needed).*
* **If $p \ge 0.05$ (or $t \ge t_{\text{crit}}$):** $\rightarrow$ **Fail to Reject $H_0$**
  *(Insufficient evidence to claim satisfaction is below benchmark).*

### 4. 95% Confidence Interval:
$$[\text{Lower CI}, \text{Upper CI}] = \left[ \bar{x} - t_{0.025, df} \cdot SE, \; \bar{x} + t_{0.025, df} \cdot SE \right]$$

---

## 🤖 Supporting Machine Learning Component

* **Model:** Random Forest Classifier (25 ensemble decision trees)
* **Target Variable:** `Feedback Score (1-5)`
* **Features Used:** `Amount Spent`, `Payment Method` (One-Hot Encoded), `Favorite Dish` (One-Hot Encoded), `Visit Frequency` (One-Hot Encoded)
* **Exclusion:** `USER ID` is excluded to prevent data leakage and memorization.
* **Train / Test Split:** 80% Training / 20% Testing (fixed random seed 42 for exact reproducibility).
* **Metrics Computed:**
  * Multi-class Accuracy
  * Macro & Weighted Precision, Recall, F1-Score
  * $5 \times 5$ Confusion Matrix Heatmap
  * Feature Importance based on Mean Decrease in Gini Impurity ($\Delta I_G$)
* **Real-Time Prediction:** Interactive form accepting customer spend, payment method, favorite dish, and visit frequency, generating predicted rating and class probabilities.

---

## 💻 Tech Stack & Architecture

* **Frontend:** React 19 + TypeScript + Vite 8
* **Styling:** Modern Tailwind CSS v4 (Dark Theme, Data-Science visual identity)
* **Icons:** Lucide React
* **Charts:** Chart.js 4 + react-chartjs-2 (9 responsive charts)
* **CSV Parsing:** PapaParse (with robust schema validation & type coercion)
* **Statistical Engine:** Mathematically rigorous numerical algorithms (Incomplete Beta function, Student's t CDF & quantile inversion)
* **Storage:** 100% In-Memory / Client-Side (No external database or MongoDB required)

---

## 🚀 How to Run the Application

### Prerequisites:
* Node.js (v18+)
* npm (v9+)

### Installation & Execution:
```bash
# Navigate to project folder
cd "C:\Users\SHAILESH REDDY M\.gemini\antigravity\scratch\restaurant-satisfaction-app"

# Install dependencies (already installed)
npm install

# Start development server
npm run dev
```

Open your browser at:
`http://localhost:5173/`

### Production Build:
```bash
npm run build
npm run preview
```

---

## 🧭 Navigation Guide (9 Sidebar Sections)

1. **Dashboard:** High-level overview cards (Total Customers, Mean, Median, Std Dev, Min, Max), hypothesis test status banner, mini-charts.
2. **Dataset:** Column schema, missing/duplicate summary, searchable & filterable data table.
3. **Satisfaction Analysis:** Rating breakdown (counts & percentages), Chart 1 (Rating distribution), Chart 2 (Histogram), Chart 3 (Donut chart).
4. **Hypothesis Testing:** Full Left-Tailed t-test formulation, step-by-step calculated values, Student's t distribution curve, and Confidence Interval visual diagram.
5. **Customer Analysis:** Payment method analysis, visit frequency analysis, favorite dish horizontal bar chart, Amount spent vs rating scatter plot, Pearson $r$, non-causation disclaimer.
6. **Machine Learning:** Random Forest architecture, 80/20 train-test metrics, $5 \times 5$ Confusion Matrix, Feature Importance chart, model discussion.
7. **Prediction:** Interactive prediction form with dropdowns and live probability breakdown.
8. **Visualizations:** Comprehensive responsive gallery containing all 9 project charts.
9. **Final Conclusion:** Automatically synthesized executive report with a 1-click Print/Export feature for college documentation.

---

## 🎓 College Viva & Presentation Q&A Reference

* **Q1: Why is a One-Sample Left-Tailed t-Test used instead of a Two-Tailed test or z-test?**
  * *Answer:* We specifically want to test if satisfaction is *below* the 3.5 benchmark ($H_1: \mu < 3.5$). We use a $t$-test because the population standard deviation $\sigma$ is unknown and must be estimated via the sample standard deviation $s$.
* **Q2: Why is USER ID excluded from Random Forest training?**
  * *Answer:* User ID is a high-cardinality arbitrary identifier that has zero generalizable predictive relationship with dining satisfaction. Including it would cause severe overfitting.
* **Q3: What does "Correlation does not imply causation" mean here?**
  * *Answer:* Even if patrons who spend more rate higher ($r > 0$), spending more does not necessarily *cause* higher satisfaction; wealthy or satisfied patrons may naturally spend more, or higher-priced dishes might come with better service.
