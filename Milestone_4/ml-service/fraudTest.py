import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
from sklearn.ensemble import RandomForestClassifier
from imblearn.over_sampling import SMOTE
import joblib

print("Loading dataset...")

# -----------------------------
# Load dataset
# -----------------------------

data = pd.read_csv("fraud_dataset_250k.csv")

# -----------------------------
# Convert datetime features
# -----------------------------

data["trans_date_trans_time"] = pd.to_datetime(data["trans_date_trans_time"])

data["transaction_hour"] = data["trans_date_trans_time"].dt.hour
data["transaction_day"] = data["trans_date_trans_time"].dt.day
data["transaction_month"] = data["trans_date_trans_time"].dt.month

# -----------------------------
# Drop unnecessary columns
# -----------------------------

data = data.drop(columns=[
    "Unnamed: 0",
    "cc_num",
    "first",
    "last",
    "street",
    "trans_num",
    "dob",
    "trans_date_trans_time"
], errors="ignore")

# -----------------------------
# Encode categorical features
# -----------------------------

categorical_cols = [
    "merchant",
    "category",
    "gender",
    "city",
    "state",
    "job"
]

le = LabelEncoder()

for col in categorical_cols:
    if col in data.columns:
        data[col] = le.fit_transform(data[col])

# -----------------------------
# Separate features and target
# -----------------------------

X = data.drop(columns=["is_fraud"])
y = data["is_fraud"]

print("\nFraud Distribution:")
print(y.value_counts())

# -----------------------------
# Train Test Split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# -----------------------------
# Apply SMOTE
# -----------------------------

print("\nApplying SMOTE...")

smote = SMOTE(random_state=42)

X_train, y_train = smote.fit_resample(X_train, y_train)

print("\nBalanced Training Data:")
print(pd.Series(y_train).value_counts())

# -----------------------------
# Train Random Forest
# -----------------------------

print("\nTraining Random Forest...")

rf_model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1
)

rf_model.fit(X_train, y_train)

# -----------------------------
# Predictions
# -----------------------------

predictions = rf_model.predict(X_test)

# -----------------------------
# Evaluation Metrics
# -----------------------------

accuracy = accuracy_score(y_test, predictions)
precision = precision_score(y_test, predictions)
recall = recall_score(y_test, predictions)
f1 = f1_score(y_test, predictions)

print("\nModel Performance")
print("------------------")
print("Accuracy :", accuracy)
print("Precision:", precision)
print("Recall   :", recall)
print("F1 Score :", f1)

print("\nClassification Report")
print(classification_report(y_test, predictions))

# -----------------------------
# Confusion Matrix (numbers only)
# -----------------------------

cm = confusion_matrix(y_test, predictions)

print("\nConfusion Matrix")
print(cm)

# -----------------------------
# Save Model
# -----------------------------

joblib.dump(rf_model, "fraud_test_model.pkl")

print("\nModel saved successfully!")

# -----------------------------
# Feature Importance
# -----------------------------

importance = rf_model.feature_importances_

feature_importance_df = pd.DataFrame({
    "Feature": X.columns,
    "Importance": importance
}).sort_values(by="Importance", ascending=False)

print("\nTop 10 Important Features")
print(feature_importance_df.head(10))