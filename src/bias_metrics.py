from fairlearn.metrics import (
    demographic_parity_difference,
    equalized_odds_difference,
    MetricFrame,
    selection_rate
)
import pandas as pd

def calculate_fairness_metrics(y_true, y_pred, sensitive_features, group_col='sex'):
    sf = sensitive_features[group_col]
    
    dp_diff = demographic_parity_difference(y_true, y_pred, sensitive_features=sf)
    eo_diff = equalized_odds_difference(y_true, y_pred, sensitive_features=sf)
    
    mf = MetricFrame(
        metrics=selection_rate,
        y_true=y_true,
        y_pred=y_pred,
        sensitive_features=sf
    )
    
    sel_rates = mf.by_group.to_dict()
    # Calculate Disparate Impact Ratio (DIR). Assuming Female is unprivileged in this context
    # Adjust logic if needed based on actual selection rates.
    groups = list(sel_rates.keys())
    if len(groups) == 2:
        dir_val = min(sel_rates[groups[0]], sel_rates[groups[1]]) / max(sel_rates[groups[0]], sel_rates[groups[1]]) if max(sel_rates[groups[0]], sel_rates[groups[1]]) > 0 else 0
    else:
        dir_val = None
        
    return {
        'demographic_parity_diff': dp_diff,
        'equalized_odds_diff': eo_diff,
        'disparate_impact_ratio': dir_val,
        'selection_rate_by_group': sel_rates
    }

if __name__ == "__main__":
    from preprocess import load_data, preprocess_data, get_train_test_splits
    import joblib
    
    df = load_data()
    X, y, sf = preprocess_data(df)
    _, X_te, _, y_te, _, sf_te = get_train_test_splits(X, y, sf)
    
    lr = joblib.load('outputs/models/lr_baseline.joblib')
    y_pred = lr.predict(X_te)
    
    metrics = calculate_fairness_metrics(y_te, y_pred, sf_te)
    for k, v in metrics.items():
        print(f"{k}: {v}")
