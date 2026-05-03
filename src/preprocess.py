import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder

# Default data path (relative to project root)
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_DEFAULT_DATA_PATH = os.path.join(_PROJECT_ROOT, 'data', 'adult.csv')


def load_data(filepath=None, download=False):
    """
    Load the UCI Adult Income dataset.

    Args:
        filepath: Path to the CSV file. Defaults to data/adult.csv in project root.
        download:  If True, force re-download even if file exists.

    Returns:
        pd.DataFrame with missing values dropped.
    """
    if filepath is None:
        filepath = _DEFAULT_DATA_PATH

    if os.path.exists(filepath) and not download:
        df = pd.read_csv(filepath)
    else:
        print("Downloading UCI Adult Income dataset from UCI ML Repository...")
        try:
            from ucimlrepo import fetch_ucirepo
            ds = fetch_ucirepo(id=2)
            df = pd.concat([ds.data.features, ds.data.targets], axis=1)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            df.to_csv(filepath, index=False)
            print(f"Dataset saved to {filepath}")
        except ImportError:
            raise RuntimeError(
                "ucimlrepo not installed. Run: pip install ucimlrepo"
            )

    df = df.replace('?', np.nan)
    df = df.dropna()
    return df


def preprocess_data(df):
    """
    Clean, encode, and split features. Tags sensitive attributes (sex, race).

    Returns:
        X_processed (pd.DataFrame): Encoded feature matrix.
        y_enc (np.array):           Binary target (1 = >50K, 0 = <=50K).
        sensitive_features (pd.DataFrame): sex and race columns.
    """
    X = df.drop('income', axis=1)
    y = df['income']

    # Sensitive attributes (kept as strings for fairlearn)
    sensitive_features = X[['sex', 'race']].copy()

    # Label encode target: '>50K' → 1, '<=50K' → 0
    le = LabelEncoder()
    y_enc = le.fit_transform(y.astype(str).str.replace('.', '', regex=False))

    # Identify column types
    cat_cols = X.select_dtypes(include=['object', 'str']).columns
    num_cols = X.select_dtypes(include=['int64', 'float64']).columns

    # One-hot encode categorical features
    ohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    X_cat_enc = ohe.fit_transform(X[cat_cols])
    cat_feature_names = ohe.get_feature_names_out(cat_cols)
    X_cat_df = pd.DataFrame(X_cat_enc, columns=cat_feature_names, index=X.index)

    # Standard scale numerical features
    scaler = StandardScaler()
    X_num_scaled = scaler.fit_transform(X[num_cols])
    X_num_df = pd.DataFrame(X_num_scaled, columns=num_cols, index=X.index)

    X_processed = pd.concat([X_num_df, X_cat_df], axis=1)
    return X_processed, y_enc, sensitive_features


def get_train_test_splits(X, y, sf, test_size=0.2, random_state=42):
    """Stratified 80/20 train-test split preserving label distribution."""
    return train_test_split(X, y, sf, test_size=test_size, stratify=y, random_state=random_state)


if __name__ == "__main__":
    df = load_data()
    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    X, y, sf = preprocess_data(df)
    X_tr, X_te, y_tr, y_te, sf_tr, sf_te = get_train_test_splits(X, y, sf)
    print(f"Train shape: {X_tr.shape}, Test shape: {X_te.shape}")
