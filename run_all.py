"""
run_all.py — Execute the full AI Bias & Fairness Detector pipeline.
Generates all charts and prints the final results table.
Run from the project root: python run_all.py
"""
import sys, os, warnings
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
warnings.filterwarnings('ignore')
import matplotlib
matplotlib.use('Agg')

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.ensemble import RandomForestClassifier

from fairlearn.metrics import (
    demographic_parity_difference, equalized_odds_difference,
    MetricFrame, selection_rate
)
from fairlearn.reductions import ExponentiatedGradient, DemographicParity
from fairlearn.postprocessing import ThresholdOptimizer

from src.preprocess import load_data, preprocess_data, get_train_test_splits
from src.bias_metrics import calculate_fairness_metrics

BASE = os.path.dirname(os.path.abspath(__file__))
CHARTS = os.path.join(BASE, 'outputs', 'charts')
MODELS = os.path.join(BASE, 'outputs', 'models')
os.makedirs(CHARTS, exist_ok=True)
os.makedirs(MODELS, exist_ok=True)
os.makedirs(os.path.join(BASE, 'data'), exist_ok=True)

plt.style.use('dark_background')

# ─── PHASE 1: Load & Preprocess ───────────────────────────────────────────────
print("=" * 60)
print("PHASE 1: Data Loading & Preprocessing")
print("=" * 60)
df = load_data()
X, y, sf = preprocess_data(df)
X_tr, X_te, y_tr, y_te, sf_tr, sf_te = get_train_test_splits(X, y, sf)
print(f"Train: {X_tr.shape}, Test: {X_te.shape}")

# ─── EDA Charts ────────────────────────────────────────────────────────────────
print("\nGenerating EDA charts...")
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle('Income Distribution by Sex', fontsize=16, color='white', fontweight='bold')
raw_df = pd.read_csv(os.path.join(BASE, 'data', 'adult.csv')).replace('?', np.nan).dropna()

sex_rate = raw_df.groupby('sex')['income'].apply(lambda x: (x.str.contains('>50K')).mean() * 100)
bars = axes[0].bar(sex_rate.index, sex_rate.values, color=['#9B59B6', '#F39C12'], edgecolor='none')
axes[0].set_title('High-Income Rate by Sex (%)', color='white')
axes[0].set_xlabel('Sex', color='white'); axes[0].set_ylabel('% earning >50K', color='white')
axes[0].tick_params(colors='white')
for bar, val in zip(bars, sex_rate.values):
    axes[0].text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5, f'{val:.1f}%', ha='center', color='white', fontweight='bold')

race_rate = raw_df.groupby('race')['income'].apply(lambda x: (x.str.contains('>50K')).mean() * 100).sort_values(ascending=False)
colors = plt.cm.plasma(np.linspace(0.2, 0.8, len(race_rate)))
bars2 = axes[1].bar(race_rate.index, race_rate.values, color=colors, edgecolor='none')
axes[1].set_title('High-Income Rate by Race (%)', color='white')
axes[1].set_xlabel('Race', color='white'); axes[1].set_ylabel('% earning >50K', color='white')
axes[1].tick_params(colors='white', axis='both')
plt.setp(axes[1].get_xticklabels(), rotation=20, ha='right')
plt.tight_layout()
plt.savefig(os.path.join(CHARTS, 'eda_group_disparity.png'), dpi=150, bbox_inches='tight')
plt.close()
print("  ✅ eda_group_disparity.png")

# ─── PHASE 2: Baseline Model ──────────────────────────────────────────────────
print("\n" + "=" * 60)
print("PHASE 2: Baseline Model Training")
print("=" * 60)
lr_baseline = LogisticRegression(max_iter=1000, random_state=42)
lr_baseline.fit(X_tr, y_tr)
joblib.dump(lr_baseline, os.path.join(MODELS, 'lr_baseline.joblib'))

rf_baseline = RandomForestClassifier(n_estimators=100, random_state=42)
rf_baseline.fit(X_tr, y_tr)
joblib.dump(rf_baseline, os.path.join(MODELS, 'rf_baseline.joblib'))

y_pred_baseline = lr_baseline.predict(X_te)
acc_baseline = accuracy_score(y_te, y_pred_baseline)
print(f"Logistic Regression Accuracy: {acc_baseline:.4f}")

mf_lr = MetricFrame(metrics=accuracy_score, y_true=y_te, y_pred=y_pred_baseline, sensitive_features=sf_te['sex'])
print(f"Group Accuracy:\n{mf_lr.by_group}")

# ─── PHASE 3: Bias Detection ─────────────────────────────────────────────────
print("\n" + "=" * 60)
print("PHASE 3: Bias Detection")
print("=" * 60)
metrics_baseline = calculate_fairness_metrics(y_te, y_pred_baseline, sf_te)
for k, v in metrics_baseline.items():
    if k != 'selection_rate_by_group':
        print(f"  {k}: {v:.4f}")

# Chart: Fairness Metric Dashboard
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
fig.suptitle('Chart 2: Fairness Metric Dashboard — Baseline Model', fontsize=15, color='white', fontweight='bold')
dp = abs(metrics_baseline['demographic_parity_diff'])
eo = abs(metrics_baseline['equalized_odds_diff'])
dir_v = metrics_baseline['disparate_impact_ratio']
metric_vals = [dp, eo, dir_v]
thresholds = [0.10, 0.10, 0.80]
higher_better = [False, False, True]
names = ['Demographic\nParity Diff', 'Equalized\nOdds Diff', 'Disparate\nImpact Ratio']

for ax, name, val, thresh, hb in zip(axes, names, metric_vals, thresholds, higher_better):
    is_fair = (val < thresh) if not hb else (val >= thresh)
    color = '#2ECC71' if is_fair else '#E74C3C'
    ax.bar([name], [val], color=color, alpha=0.85, edgecolor='none', width=0.4)
    ax.axhline(thresh, color='#F39C12', linestyle='--', linewidth=2, label=f'Threshold: {thresh}')
    ax.set_ylim(0, max(val, thresh) * 1.5)
    ax.set_title(name, color='white', fontsize=11)
    ax.text(0, val + max(val, thresh)*0.06, f'{val:.4f}', ha='center', color='white', fontweight='bold', fontsize=13)
    ax.text(0, max(val, thresh)*1.3, '✅ FAIR' if is_fair else '❌ BIASED', ha='center',
            color='#2ECC71' if is_fair else '#E74C3C', fontsize=12, fontweight='bold')
    ax.tick_params(colors='white')
    ax.set_xticklabels([])
    ax.legend(labelcolor='white', loc='upper right', fontsize=8)
plt.tight_layout()
plt.savefig(os.path.join(CHARTS, 'chart2_fairness_metric_dashboard.png'), dpi=150, bbox_inches='tight')
plt.close()
print("  ✅ chart2_fairness_metric_dashboard.png")

# Chart: Confusion Matrix Grid
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle('Chart 4: Confusion Matrix Grid — Baseline Model (by Sex)', fontsize=14, color='white', fontweight='bold')
for ax, group in zip(axes, ['Male', 'Female']):
    mask = sf_te['sex'] == group
    cm = confusion_matrix(y_te[mask], y_pred_baseline[mask])
    acc_g = accuracy_score(y_te[mask], y_pred_baseline[mask])
    sns.heatmap(cm, annot=True, fmt='d', ax=ax, cmap='Blues', linewidths=0.5,
                xticklabels=['<=50K', '>50K'], yticklabels=['<=50K', '>50K'])
    ax.set_title(f'{group} — Accuracy: {acc_g:.3f}', color='white', fontweight='bold')
    ax.set_xlabel('Predicted', color='white'); ax.set_ylabel('Actual', color='white')
    ax.tick_params(colors='white')
plt.tight_layout()
plt.savefig(os.path.join(CHARTS, 'chart4_confusion_matrix_grid.png'), dpi=150, bbox_inches='tight')
plt.close()
print("  ✅ chart4_confusion_matrix_grid.png")

# ─── PHASE 4: Mitigation ─────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("PHASE 4: Bias Mitigation — All 3 Strategies")
print("=" * 60)

# Strategy 1: Reweighing (Pre-processing)
print("\n1. Reweighing (Pre-processing)...")
from aif360.datasets import BinaryLabelDataset
from aif360.algorithms.preprocessing import Reweighing

sex_enc_tr = (sf_tr['sex'] == 'Male').astype(int)
df_aif = X_tr.copy(); df_aif['income'] = y_tr; df_aif['sex_bin'] = sex_enc_tr.values
aif_ds = BinaryLabelDataset(df=df_aif, label_names=['income'], protected_attribute_names=['sex_bin'], favorable_label=1, unfavorable_label=0)
rw = Reweighing(unprivileged_groups=[{'sex_bin': 0}], privileged_groups=[{'sex_bin': 1}])
ds_rw = rw.fit_transform(aif_ds)
lr_rw = LogisticRegression(max_iter=1000, random_state=42)
lr_rw.fit(X_tr, y_tr, sample_weight=ds_rw.instance_weights)
joblib.dump(lr_rw, os.path.join(MODELS, 'rw_mitigator.joblib'))
y_pred_rw = lr_rw.predict(X_te)
metrics_rw = calculate_fairness_metrics(y_te, y_pred_rw, sf_te)
print(f"   Accuracy: {accuracy_score(y_te, y_pred_rw):.4f} | DP Diff: {metrics_rw['demographic_parity_diff']:.4f} | DIR: {metrics_rw['disparate_impact_ratio']:.4f}")

# Strategy 2: ExponentiatedGradient (In-processing)
print("2. Exponentiated Gradient (In-processing)...")
eg = ExponentiatedGradient(LogisticRegression(max_iter=1000, random_state=42), constraints=DemographicParity())
eg.fit(X_tr, y_tr, sensitive_features=sf_tr['sex'])
joblib.dump(eg, os.path.join(MODELS, 'eg_mitigator.joblib'))
y_pred_eg = eg.predict(X_te)
metrics_eg = calculate_fairness_metrics(y_te, y_pred_eg, sf_te)
print(f"   Accuracy: {accuracy_score(y_te, y_pred_eg):.4f} | DP Diff: {metrics_eg['demographic_parity_diff']:.4f} | DIR: {metrics_eg['disparate_impact_ratio']:.4f}")

# Strategy 3: ThresholdOptimizer (Post-processing)
print("3. Threshold Optimizer (Post-processing)...")
to = ThresholdOptimizer(estimator=lr_baseline, constraints='equalized_odds', objective='balanced_accuracy_score', prefit=True)
to.fit(X_tr, y_tr, sensitive_features=sf_tr['sex'])
joblib.dump(to, os.path.join(MODELS, 'to_mitigator.joblib'))
y_pred_to = to.predict(X_te, sensitive_features=sf_te['sex'])
metrics_to = calculate_fairness_metrics(y_te, y_pred_to, sf_te)
print(f"   Accuracy: {accuracy_score(y_te, y_pred_to):.4f} | DP Diff: {metrics_to['demographic_parity_diff']:.4f} | DIR: {metrics_to['disparate_impact_ratio']:.4f}")

# ─── PHASE 5: Charts ─────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("PHASE 5: Generating All Charts")
print("=" * 60)

all_preds = {
    'Baseline': y_pred_baseline,
    'Reweighing': y_pred_rw,
    'Exp. Gradient': y_pred_eg,
    'Threshold Opt.': y_pred_to,
}

# Chart 1: Group Accuracy Bar Chart
groups = ['Male', 'Female']
fig, ax = plt.subplots(figsize=(13, 6))
x = np.arange(len(groups))
width = 0.18
bar_colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12']

for i, (label, preds) in enumerate(all_preds.items()):
    accs = [accuracy_score(y_te[sf_te['sex']==g], preds[sf_te['sex']==g]) for g in groups]
    bars = ax.bar(x + i*width - 1.5*width, accs, width, label=label, color=bar_colors[i], alpha=0.85, edgecolor='none')
    for bar, acc in zip(bars, accs):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.003, f'{acc:.3f}',
                ha='center', color='white', fontsize=8, fontweight='bold')

ax.set_title('Chart 1: Group Accuracy — Baseline vs Post-Mitigation', color='white', fontsize=14, fontweight='bold')
ax.set_xticks(x); ax.set_xticklabels(groups, color='white', fontsize=12)
ax.tick_params(colors='white')
ax.set_ylim(0.7, 1.0); ax.legend(labelcolor='white', loc='lower right'); ax.grid(axis='y', alpha=0.2)
plt.tight_layout()
plt.savefig(os.path.join(CHARTS, 'chart1_group_accuracy_all_strategies.png'), dpi=150, bbox_inches='tight')
plt.close()
print("  ✅ chart1_group_accuracy_all_strategies.png")

# Chart 3: Accuracy vs Fairness Trade-off
all_metrics = {
    'Baseline': (accuracy_score(y_te, y_pred_baseline), abs(metrics_baseline['demographic_parity_diff'])),
    'Reweighing': (accuracy_score(y_te, y_pred_rw), abs(metrics_rw['demographic_parity_diff'])),
    'Exp. Gradient': (accuracy_score(y_te, y_pred_eg), abs(metrics_eg['demographic_parity_diff'])),
    'Threshold Opt.': (accuracy_score(y_te, y_pred_to), abs(metrics_to['demographic_parity_diff'])),
}
fig, ax = plt.subplots(figsize=(10, 6))
colors_map = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12']
for (name, (acc, dp)), color in zip(all_metrics.items(), colors_map):
    ax.scatter(dp, acc, s=200, color=color, label=name, zorder=5, edgecolors='white', linewidths=1)
    ax.annotate(name, (dp, acc), xytext=(8, 5), textcoords='offset points', color='white', fontsize=11, fontweight='bold')

ax.axvline(0.10, color='#F39C12', linestyle='--', linewidth=1.5, label='Fair threshold (0.10)', alpha=0.7)
ax.set_xlabel('Demographic Parity Difference (lower = fairer)', color='white', fontsize=12)
ax.set_ylabel('Accuracy', color='white', fontsize=12)
ax.set_title('Chart 3: Accuracy vs Fairness Trade-off', color='white', fontsize=14, fontweight='bold')
ax.tick_params(colors='white'); ax.legend(labelcolor='white'); ax.grid(alpha=0.2)
plt.tight_layout()
plt.savefig(os.path.join(CHARTS, 'chart3_accuracy_fairness_tradeoff.png'), dpi=150, bbox_inches='tight')
plt.close()
print("  ✅ chart3_accuracy_fairness_tradeoff.png")

# ─── Final Summary Table ──────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("FINAL RESULTS SUMMARY")
print("=" * 60)
rows = []
for name, preds, mets in [
    ('Baseline LR', y_pred_baseline, metrics_baseline),
    ('Reweighing', y_pred_rw, metrics_rw),
    ('Exp. Gradient', y_pred_eg, metrics_eg),
    ('Threshold Opt.', y_pred_to, metrics_to),
]:
    rows.append({
        'Strategy': name,
        'Accuracy': round(accuracy_score(y_te, preds), 4),
        'DP Diff': round(abs(mets['demographic_parity_diff']), 4),
        'EO Diff': round(abs(mets['equalized_odds_diff']), 4),
        'DIR': round(mets['disparate_impact_ratio'], 4),
        'DP OK': '✅' if abs(mets['demographic_parity_diff']) < 0.1 else '❌',
        'EO OK': '✅' if abs(mets['equalized_odds_diff']) < 0.1 else '❌',
        'DIR OK': '✅' if mets['disparate_impact_ratio'] >= 0.8 else '❌',
    })
summary = pd.DataFrame(rows).set_index('Strategy')
print(summary.to_string())

print(f"\n✅ All outputs saved in: {CHARTS}")
print(f"✅ All models saved in: {MODELS}")
print("\n🎉 PROJECT COMPLETE! Open Jupyter to explore notebooks.")
