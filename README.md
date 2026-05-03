# 🤖 AI Bias & Fairness Detector

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3%2B-orange?style=for-the-badge&logo=scikit-learn)
![fairlearn](https://img.shields.io/badge/fairlearn-0.9%2B-green?style=for-the-badge)
![aif360](https://img.shields.io/badge/aif360-0.5%2B-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Complete-brightgreen?style=for-the-badge)

**Detect, Measure & Mitigate Algorithmic Bias in Machine Learning Models**

*BCA Final Year Project — Demonstrating Socially Responsible AI Development*

[📊 View Results](#-results) · [🚀 Quick Start](#-quick-start) · [📓 Notebooks](#-notebooks) · [🧠 How It Works](#-how-it-works)

</div>

---

## 📌 What is this project?

Biased AI systems cause **real-world harm** — loan denials for women, unfair hiring for minorities, skewed bail decisions for people of colour. This project demonstrates how to:

1. **Detect** algorithmic bias using industry-standard fairness metrics
2. **Measure** the exact magnitude of disparity across demographic groups  
3. **Mitigate** bias using 3 state-of-the-art strategies
4. **Visualise** the accuracy vs fairness trade-off honestly

### Real-world impact this addresses:
- 🏦 **Loan approvals** — AI approving men more than equally-qualified women
- 💼 **Hiring systems** — Résumé screeners discriminating by name/race
- ⚖️ **Criminal justice** — Bail prediction tools with racial disparities (COMPAS)

---

## 📊 Results

After applying mitigation strategies on the UCI Adult Income dataset:

| Strategy | Accuracy | DP Diff | EO Diff | DIR | Fair? |
|---|---|---|---|---|---|
| **Baseline LR** | 84.5% | 0.184 ❌ | 0.155 ❌ | 0.287 ❌ | No |
| **Reweighing** (Pre-proc) | 84.3% | ~0.15 ❌ | ~0.12 ❌ | ~0.40 ❌ | Partially |
| **Exp. Gradient** (In-proc) | 75.2% | **0.005 ✅** | 0.308 ❌ | **0.968 ✅** | Best Fairness |
| **Threshold Optimizer** (Post-proc) | 83.9% | 0.114 ❌ | **0.004 ✅** | 0.740 ❌ | Best EO |

**Target Metrics:** DP Diff < 0.10 · EO Diff < 0.10 · DIR ≥ 0.80 · Accuracy drop < 3 pp

### Generated Charts

| Chart 1: Group Accuracy | Chart 2: Fairness Dashboard |
|---|---|
| Per-group accuracy across all strategies | DP Diff, EO Diff, DIR visualised |

| Chart 3: Accuracy-Fairness Trade-off | Chart 4: Confusion Matrix Grid |
|---|---|
| Scatter — one point per strategy | 2×2 grid — Male vs Female splits |

> Run `python run_all.py` to regenerate all charts.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- pip

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-bias-fairness-detector.git
cd ai-bias-fairness-detector
```

### 2. Create a virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Download the dataset

The dataset is downloaded automatically when you run the pipeline. It uses the [UCI Adult Income dataset](https://archive.ics.uci.edu/dataset/2/adult) (~48K rows).

```bash
python -c "from src.preprocess import load_data; load_data(download=True)"
```

### 5. Run the full pipeline

```bash
python run_all.py
```

This single command:
- ✅ Loads & preprocesses the data
- ✅ Trains baseline ML models (Logistic Regression + Random Forest)
- ✅ Computes bias metrics (DP Diff, EO Diff, Disparate Impact Ratio)
- ✅ Applies all 3 mitigation strategies
- ✅ Generates all 4 charts → saved in `outputs/charts/`
- ✅ Prints the final results comparison table

---

## 📓 Notebooks

Launch Jupyter to explore the analysis interactively:

```bash
jupyter notebook notebooks/
```

| Notebook | Description |
|---|---|
| [`01_eda.ipynb`](notebooks/01_eda.ipynb) | Exploratory Data Analysis — income distribution by sex & race, raw disparity quantification |
| [`02_bias_detection.ipynb`](notebooks/02_bias_detection.ipynb) | Fairness metrics computation, dashboard chart, confusion matrix grid |
| [`03_mitigation.ipynb`](notebooks/03_mitigation.ipynb) | All 3 mitigation strategies live, results table, trade-off scatter chart |

---

## 🧠 How It Works

### Pipeline Overview

```
Raw Data (UCI Adult Income, 48K rows)
         ↓
    Preprocessing
    • Drop missing values (~2K rows)
    • One-hot encode categorical features
    • StandardScaler on numeric features
    • Tag sensitive attributes: sex, race
    • 80/20 stratified train/test split
         ↓
  Baseline Model Training
    • LogisticRegression(max_iter=1000)
    • RandomForestClassifier(n_estimators=100)
    • Evaluate: accuracy, F1, ROC-AUC
    • MetricFrame: per-group accuracy
         ↓
    Bias Detection
    • Demographic Parity Difference
    • Equalized Odds Difference
    • Disparate Impact Ratio
    • Selection Rate by Group
         ↓
   Bias Mitigation (3 strategies)
    • Pre-processing:  Reweighing (aif360)
    • In-processing:   ExponentiatedGradient (fairlearn)
    • Post-processing: ThresholdOptimizer (fairlearn)
         ↓
  Visualisation & Report
    • Chart 1: Group Accuracy Bar Chart
    • Chart 2: Fairness Metric Dashboard
    • Chart 3: Accuracy-Fairness Trade-off
    • Chart 4: Confusion Matrix Grid
```

### Fairness Metrics Explained

| Metric | Formula | Threshold | What it means |
|---|---|---|---|
| **Demographic Parity Diff** | P(ŷ=1\|Male) − P(ŷ=1\|Female) | < 0.10 | Equal positive prediction rates across groups |
| **Equalized Odds Diff** | max(TPR gap, FPR gap) | < 0.10 | Equal true/false positive rates across groups |
| **Disparate Impact Ratio** | P(ŷ=1\|unprivileged) / P(ŷ=1\|privileged) | ≥ 0.80 | The "80% rule" from US employment law |

### Mitigation Strategies Explained

#### 1. Pre-processing — Reweighing (`aif360`)
```python
from aif360.algorithms.preprocessing import Reweighing
rw = Reweighing(unprivileged_groups=[{'sex': 0}], privileged_groups=[{'sex': 1}])
dataset_rw = rw.fit_transform(dataset)
```
Assigns higher weights to underrepresented group samples so the model treats them more equally during training.

- ✅ Simple — doesn't change model architecture  
- ❌ Only helps if bias is in label distribution

#### 2. In-processing — Exponentiated Gradient (`fairlearn`)
```python
from fairlearn.reductions import ExponentiatedGradient, DemographicParity
mitigator = ExponentiatedGradient(LogisticRegression(), constraints=DemographicParity())
mitigator.fit(X_tr, y_tr, sensitive_features=sf_tr['sex'])
```
Adds a fairness constraint directly into the optimisation loop. Trains an ensemble of models and picks the best fairness/accuracy trade-off.

- ✅ Directly optimises the fairness constraint  
- ❌ Slower; returns a randomised predictor

#### 3. Post-processing — Threshold Optimizer (`fairlearn`)
```python
from fairlearn.postprocessing import ThresholdOptimizer
to = ThresholdOptimizer(estimator=lr, constraints='equalized_odds')
to.fit(X_tr, y_tr, sensitive_features=sf_tr['sex'])
y_pred = to.predict(X_te, sensitive_features=sf_te['sex'])
```
Adjusts the decision threshold separately for each demographic group after the model is trained. No retraining needed.

- ✅ Works on any pretrained model. Fast.  
- ❌ Requires sensitive attributes at predict time

---

## 📁 Project Structure

```
ai-bias-fairness-detector/
│
├── 📂 data/                        # Dataset storage
│   └── adult.csv                   # UCI Adult Income (downloaded automatically)
│
├── 📂 notebooks/                   # Jupyter notebooks
│   ├── 01_eda.ipynb                # Exploratory Data Analysis
│   ├── 02_bias_detection.ipynb     # Bias measurement + charts
│   └── 03_mitigation.ipynb         # All 3 mitigation strategies
│
├── 📂 src/                         # Python source modules
│   ├── __init__.py
│   ├── preprocess.py               # Data loading & feature engineering
│   ├── model.py                    # Baseline model training & evaluation
│   ├── bias_metrics.py             # Fairness metrics (DP, EO, DIR)
│   ├── mitigation.py               # 3 mitigation strategies
│   └── visualize.py                # Chart generation utilities
│
├── 📂 outputs/                     # Generated outputs (git-ignored)
│   ├── models/                     # Saved .joblib model files
│   └── charts/                     # Generated PNG charts
│
├── run_all.py                      # ⭐ One-command full pipeline
├── requirements.txt                # Python dependencies
├── LICENSE                         # MIT License
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

---

## 🛠️ Tech Stack

| Library | Version | Role |
|---|---|---|
| `pandas` | ≥ 2.0 | Data loading, cleaning, groupby analysis |
| `numpy` | ≥ 1.24 | Numerical operations |
| `scikit-learn` | ≥ 1.3 | ML models (LR, RF), metrics, preprocessing |
| `fairlearn` | ≥ 0.9 | Fairness metrics, ExponentiatedGradient, ThresholdOptimizer |
| `aif360` | ≥ 0.5 | Reweighing, BinaryLabelDataset |
| `matplotlib` | ≥ 3.7 | All chart rendering and PNG export |
| `seaborn` | ≥ 0.12 | Statistical plots, heatmaps |
| `jupyter` | ≥ 1.0 | Interactive notebook environment |
| `joblib` | ≥ 1.3 | Save and load trained ML models |
| `ucimlrepo` | latest | Direct download of UCI Adult Income dataset |

---

## 📖 Dataset

**UCI Adult Income Dataset**
- **Source:** [UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/2/adult)
- **Rows:** 48,842 (after cleaning: ~45,222)
- **Features:** 14 (age, workclass, education, occupation, sex, race, etc.)
- **Target:** Income >50K (binary)
- **Sensitive attributes:** `sex` (Male/Female), `race` (5 categories)
- **Known bias:** Males earn >50K at ~31%, females at ~11% — 20 pp gap

---

## 📚 References

1. Barocas, S., Hardt, M., & Narayanan, A. (2019). **Fairness and Machine Learning**. fairmlbook.org
2. Hardt, M., Price, E., & Srebro, N. (2016). **Equality of Opportunity in Supervised Learning**. NeurIPS.
3. Bellamy, R. K. et al. (2018). **AI Fairness 360: An Extensible Toolkit for Detecting, Understanding, and Mitigating Unwanted Algorithmic Bias**. IBM Research.
4. Bird, S. et al. (2020). **Fairlearn: A toolkit for assessing and improving fairness in AI**. Microsoft Research.

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/add-race-analysis`
3. Commit your changes: `git commit -m 'Add race-based disparity analysis'`
4. Push to the branch: `git push origin feature/add-race-analysis`
5. Open a Pull Request

### Ideas for contributions:
- Add race-based mitigation analysis
- Add more datasets (COMPAS, German Credit)
- Build a Streamlit web dashboard
- Add report PDF generation
- Add more fairness metrics (individual fairness)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Shree Dive**  
BCA Final Year Student  

⭐ **If this project helped you, please give it a star!** ⭐

---

<div align="center">
Made with ❤️ to promote <strong>Responsible & Fair AI</strong>
</div>
