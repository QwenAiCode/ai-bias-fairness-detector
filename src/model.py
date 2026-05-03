from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from fairlearn.metrics import MetricFrame
import joblib

def train_baseline_models(X_tr, y_tr):
    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_tr, y_tr)
    
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_tr, y_tr)
    
    return lr, rf

def evaluate_model(model, X_te, y_te, sf_te, group_col='sex'):
    y_pred = model.predict(X_te)
    y_prob = model.predict_proba(X_te)[:, 1] if hasattr(model, 'predict_proba') else None
    
    metrics = {
        'accuracy': accuracy_score(y_te, y_pred),
        'f1_macro': f1_score(y_te, y_pred, average='macro'),
    }
    if y_prob is not None:
        metrics['roc_auc'] = roc_auc_score(y_te, y_prob)
        
    mf = MetricFrame(
        metrics=accuracy_score,
        y_true=y_te,
        y_pred=y_pred,
        sensitive_features=sf_te[group_col]
    )
    return metrics, mf.by_group

if __name__ == "__main__":
    from preprocess import load_data, preprocess_data, get_train_test_splits
    df = load_data()
    X, y, sf = preprocess_data(df)
    X_tr, X_te, y_tr, y_te, sf_tr, sf_te = get_train_test_splits(X, y, sf)
    
    print("Training models...")
    lr, rf = train_baseline_models(X_tr, y_tr)
    
    print("Evaluating Logistic Regression:")
    metrics_lr, group_acc_lr = evaluate_model(lr, X_te, y_te, sf_te)
    print(metrics_lr)
    print("Group Accuracy:\n", group_acc_lr)
    
    joblib.dump(lr, 'outputs/models/lr_baseline.joblib')
    joblib.dump(rf, 'outputs/models/rf_baseline.joblib')
