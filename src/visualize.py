import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

def plot_group_accuracy(group_acc_baseline, group_acc_mitigated, labels, title="Group Accuracy Comparison"):
    x = np.arange(len(labels))
    width = 0.35
    
    fig, ax = plt.subplots(figsize=(8, 6))
    rects1 = ax.bar(x - width/2, group_acc_baseline, width, label='Baseline')
    rects2 = ax.bar(x + width/2, group_acc_mitigated, width, label='Mitigated')
    
    ax.set_ylabel('Accuracy')
    ax.set_title(title)
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.legend()
    
    ax.bar_label(rects1, padding=3, fmt='%.3f')
    ax.bar_label(rects2, padding=3, fmt='%.3f')
    
    fig.tight_layout()
    plt.savefig(f'outputs/charts/{title.replace(" ", "_").lower()}.png')
    plt.close()

def plot_accuracy_fairness_tradeoff(results, metric_name='Demographic Parity Diff'):
    fig, ax = plt.subplots(figsize=(8, 6))
    
    for name, metrics in results.items():
        ax.scatter(metrics[metric_name], metrics['Accuracy'], label=name, s=100)
        ax.annotate(name, (metrics[metric_name], metrics['Accuracy']), xytext=(5, 5), textcoords='offset points')
        
    ax.set_xlabel(metric_name)
    ax.set_ylabel('Accuracy')
    ax.set_title(f'Accuracy vs {metric_name} Trade-off')
    ax.grid(True)
    ax.legend()
    
    plt.savefig(f'outputs/charts/tradeoff_{metric_name.replace(" ", "_").lower()}.png')
    plt.close()

if __name__ == "__main__":
    from preprocess import load_data, preprocess_data, get_train_test_splits
    from model import evaluate_model
    from bias_metrics import calculate_fairness_metrics
    import joblib
    
    df = load_data()
    X, y, sf = preprocess_data(df)
    _, X_te, _, y_te, _, sf_te = get_train_test_splits(X, y, sf)
    
    lr = joblib.load('outputs/models/lr_baseline.joblib')
    to = joblib.load('outputs/models/to_mitigator.joblib')
    eg = joblib.load('outputs/models/eg_mitigator.joblib')
    
    metrics_lr, group_acc_lr = evaluate_model(lr, X_te, y_te, sf_te)
    
    y_pred_to = to.predict(X_te, sensitive_features=sf_te['sex'])
    y_pred_eg = eg.predict(X_te)
    
    from sklearn.metrics import accuracy_score
    from fairlearn.metrics import MetricFrame
    
    mf_to = MetricFrame(metrics=accuracy_score, y_true=y_te, y_pred=y_pred_to, sensitive_features=sf_te['sex'])
    mf_eg = MetricFrame(metrics=accuracy_score, y_true=y_te, y_pred=y_pred_eg, sensitive_features=sf_te['sex'])
    
    group_acc_to = mf_to.by_group
    group_acc_eg = mf_eg.by_group
    
    labels = group_acc_lr.index.tolist()
    
    plot_group_accuracy(group_acc_lr.values, group_acc_to.values, labels, "Group Accuracy TO")
    plot_group_accuracy(group_acc_lr.values, group_acc_eg.values, labels, "Group Accuracy EG")
    
    fairness_lr = calculate_fairness_metrics(y_te, lr.predict(X_te), sf_te)
    fairness_to = calculate_fairness_metrics(y_te, y_pred_to, sf_te)
    fairness_eg = calculate_fairness_metrics(y_te, y_pred_eg, sf_te)
    
    results = {
        'Baseline': {'Accuracy': metrics_lr['accuracy'], 'Demographic Parity Diff': fairness_lr['demographic_parity_diff']},
        'Threshold Optimizer': {'Accuracy': mf_to.overall, 'Demographic Parity Diff': fairness_to['demographic_parity_diff']},
        'Exponentiated Gradient': {'Accuracy': mf_eg.overall, 'Demographic Parity Diff': fairness_eg['demographic_parity_diff']}
    }
    
    plot_accuracy_fairness_tradeoff(results)
    print("Charts generated in outputs/charts/")
