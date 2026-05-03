from aif360.datasets import BinaryLabelDataset
from aif360.algorithms.preprocessing import Reweighing
from fairlearn.reductions import ExponentiatedGradient, DemographicParity
from fairlearn.postprocessing import ThresholdOptimizer
from sklearn.linear_model import LogisticRegression
import pandas as pd
import numpy as np

def mitigation_reweighing(X_tr, y_tr, sf_tr, group_col='sex', priv_group='Male', unpriv_group='Female'):
    # AIF360 requires data in its specific format
    df_tr = pd.concat([X_tr, y_tr.to_frame('income'), sf_tr], axis=1)
    
    # Map sex to 0/1 for AIF360 if it's not already
    # Assuming 'income' is 0/1, where 1 is favorable
    dataset_orig = BinaryLabelDataset(
        df=df_tr,
        label_names=['income'],
        protected_attribute_names=[group_col],
        favorable_label=1,
        unfavorable_label=0
    )
    
    # Needs integer representation for protected attributes usually
    # If sf_tr[group_col] is string, need to encode it first.
    # We'll assume the caller passes strings and we encode here for AIF360
    dataset_orig.features[:, dataset_orig.feature_names.index(group_col)] = \
        np.where(dataset_orig.features[:, dataset_orig.feature_names.index(group_col)] == priv_group, 1, 0)
        
    privileged_groups = [{group_col: 1}]
    unprivileged_groups = [{group_col: 0}]
    
    rw = Reweighing(unprivileged_groups=unprivileged_groups, privileged_groups=privileged_groups)
    dataset_transf = rw.fit_transform(dataset_orig)
    
    # Train model on reweighed data
    lr_rw = LogisticRegression(max_iter=1000, random_state=42)
    X_tr_rw = dataset_transf.features[:, :-1] # Assuming income is last, wait, need to check feature order
    # Let's extract carefully
    X_cols = [c for c in dataset_transf.feature_names if c != 'income' and c != group_col]
    X_tr_rw = pd.DataFrame(dataset_transf.features, columns=dataset_transf.feature_names)[X_tr.columns]
    y_tr_rw = dataset_transf.labels.ravel()
    weights = dataset_transf.instance_weights
    
    lr_rw.fit(X_tr_rw, y_tr_rw, sample_weight=weights)
    return lr_rw

def mitigation_exponentiated_gradient(X_tr, y_tr, sf_tr, group_col='sex'):
    estimator = LogisticRegression(max_iter=1000, random_state=42)
    constraint = DemographicParity()
    mitigator = ExponentiatedGradient(estimator, constraints=constraint)
    mitigator.fit(X_tr, y_tr, sensitive_features=sf_tr[group_col])
    return mitigator

def mitigation_threshold_optimizer(estimator, X_tr, y_tr, sf_tr, group_col='sex'):
    to = ThresholdOptimizer(
        estimator=estimator,
        constraints='equalized_odds',
        objective='balanced_accuracy_score',
        prefit=True # Assuming estimator is already fitted
    )
    to.fit(X_tr, y_tr, sensitive_features=sf_tr[group_col])
    return to

if __name__ == "__main__":
    from preprocess import load_data, preprocess_data, get_train_test_splits
    from bias_metrics import calculate_fairness_metrics
    import joblib
    
    df = load_data()
    X, y, sf = preprocess_data(df)
    X_tr, X_te, y_tr, y_te, sf_tr, sf_te = get_train_test_splits(X, y, sf)
    
    print("Mitigation: Threshold Optimizer (Post-processing)")
    lr_baseline = joblib.load('outputs/models/lr_baseline.joblib')
    to_mitigator = mitigation_threshold_optimizer(lr_baseline, X_tr, y_tr, sf_tr)
    y_pred_to = to_mitigator.predict(X_te, sensitive_features=sf_te['sex'])
    
    metrics_to = calculate_fairness_metrics(y_te, y_pred_to, sf_te)
    print("Metrics after Post-processing:")
    for k, v in metrics_to.items():
        print(f"  {k}: {v}")
    
    print("\nMitigation: Exponentiated Gradient (In-processing)")
    eg_mitigator = mitigation_exponentiated_gradient(X_tr, y_tr, sf_tr)
    y_pred_eg = eg_mitigator.predict(X_te)
    
    metrics_eg = calculate_fairness_metrics(y_te, y_pred_eg, sf_te)
    print("Metrics after In-processing:")
    for k, v in metrics_eg.items():
        print(f"  {k}: {v}")
    
    # Save mitigators
    joblib.dump(to_mitigator, 'outputs/models/to_mitigator.joblib')
    joblib.dump(eg_mitigator, 'outputs/models/eg_mitigator.joblib')
