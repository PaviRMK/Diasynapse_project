import pandas as pd
import os
import xml.etree.ElementTree as ET

def load_azt1d(base_path=r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\datasets\AZT1D_2025\AZT1D 2025\CGM Records"):
    all_data = []
    
    for subject_folder in os.listdir(base_path):
        subject_path = os.path.join(base_path, subject_folder)
        if os.path.isdir(subject_path):
            for file in os.listdir(subject_path):
                if file.endswith(".csv"):
                    file_path = os.path.join(subject_path, file)
                    df = pd.read_csv(file_path)
                    df["patient_id"] = subject_folder
                    all_data.append(df)
    
    combined = pd.concat(all_data, ignore_index=True)
    return combined


def load_ohio(base_path=r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\datasets\OhioT1DM"):
    all_data = []
    
    for file in os.listdir(base_path):
        if file.endswith(".xml"):
            file_path = os.path.join(base_path, file)
            tree = ET.parse(file_path)
            root = tree.getroot()
            
            patient_id = root.attrib.get("id")
            

            glucose_section = root.find("glucose_level")
            if glucose_section is not None:
                for event in glucose_section.findall("event"):
                    all_data.append({
                        "timestamp": event.attrib.get("ts"),
                        "glucose": event.attrib.get("value"),
                        "patient_id": patient_id,
                        "source_file": file
                    })
    
    df = pd.DataFrame(all_data)
    df["timestamp"] = pd.to_datetime(df["timestamp"], format="%d-%m-%Y %H:%M:%S", errors="coerce")
    df["timestamp"] = df["timestamp"].dt.strftime("%Y-%m-%d %H:%M:%S")
    return df

def standardize_columns(df):
    rename_map = {}
    for col in df.columns:
        col_clean = col.strip()
        if "CGM" in col_clean:
            rename_map[col] = "glucose"
        elif "Dietary intake" in col_clean or "饮食" in col_clean or "进食量" in col_clean:
            rename_map[col] = "carbs"
        elif "Insulin dose - s.c." in col_clean:
            rename_map[col] = "insulin_dose"
        elif col_clean == "Date":
            rename_map[col] = "timestamp"
    df = df.rename(columns=rename_map)
    
    # Merge duplicate columns (e.g. two "carbs" columns from English + Chinese headers)
    df = df.T.groupby(level=0).first().T
    
    return df

def load_shanghai(base_path=r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\datasets\ShanghaiT1DM_T2DM"):
    all_data = []
    
    for root_folder, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith((".xlsx", ".xls")) and not file.startswith("~$") and "Summary" not in file:
                file_path = os.path.join(root_folder, file)
                try:
                    df = pd.read_excel(file_path)
                    df = standardize_columns(df)
                    
                    keep_cols = ["timestamp", "glucose", "carbs", "insulin_dose"]
                    available_cols = [c for c in keep_cols if c in df.columns]
                    df = df[available_cols]
                    
                    df["patient_id"] = file.split("_")[0]
                    df["source_file"] = file
                    df["diabetes_type"] = "T1DM" if "Shanghai_T1DM" in root_folder else "T2DM"
                    all_data.append(df)
                except Exception as e:
                    print(f"Skipped {file} due to error: {e}")
    
    combined = pd.concat(all_data, ignore_index=True)
    return combined
def load_glucobench(base_path=r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\datasets\GlucoBench_eval\raw_data"):
    all_data = []
    
    for file in os.listdir(base_path):
        if file.endswith(".csv"):
            file_path = os.path.join(base_path, file)
            df = pd.read_csv(file_path)
            
            keep_cols = {}
            if "id" in df.columns:
                keep_cols["id"] = "patient_id"
            if "time" in df.columns:
                keep_cols["time"] = "timestamp"
            if "gl" in df.columns:
                keep_cols["gl"] = "glucose"
            
            df = df.rename(columns=keep_cols)
            available = [c for c in ["patient_id", "timestamp", "glucose"] if c in df.columns]
            df = df[available]
            
            df["source_file"] = file
            all_data.append(df)
    
    combined = pd.concat(all_data, ignore_index=True)
    return combined
def combine_all():
    azt1d = load_azt1d()
    azt1d = azt1d.rename(columns={
        "EventDateTime": "timestamp",
        "CGM": "glucose",
        "CarbSize": "carbs",
        "TotalBolusInsulinDelivered": "insulin_dose"
    })
    azt1d["dataset"] = "AZT1D"
    azt1d["patient_id"] = "AZT1D_" + azt1d["patient_id"].astype(str)

    ohio = load_ohio()
    ohio["dataset"] = "OhioT1DM"
    ohio["patient_id"] = "Ohio_" + ohio["patient_id"].astype(str)

    shanghai = load_shanghai()
    shanghai["dataset"] = shanghai["diabetes_type"]
    shanghai["patient_id"] = "Shanghai_" + shanghai["patient_id"].astype(str)

    glucobench = load_glucobench()
    glucobench["dataset"] = "GlucoBench_" + glucobench["source_file"].str.replace(".csv", "", regex=False)
    glucobench["patient_id"] = glucobench["dataset"] + "_" + glucobench["patient_id"].astype(str)

    keep_cols = ["timestamp", "glucose", "carbs", "insulin_dose", "patient_id", "dataset"]

    # TRAINING data = AZT1D + Ohio + Shanghai only
    train_frames = []
    for df in [azt1d, ohio, shanghai]:
        for col in keep_cols:
            if col not in df.columns:
                df[col] = None
        train_frames.append(df[keep_cols])
    training_data = pd.concat(train_frames, ignore_index=True)

    # EVAL data = GlucoBench only, kept completely separate
    for col in keep_cols:
        if col not in glucobench.columns:
            glucobench[col] = None
    eval_data = glucobench[keep_cols]

    return training_data, eval_data
if __name__ == "__main__":
    training_data, eval_data = combine_all()
    
    print("TRAINING DATA:", training_data.shape)
    print(training_data["dataset"].value_counts())
    
    print("\nEVAL DATA (GlucoBench):", eval_data.shape)
    print(eval_data["dataset"].value_counts())
    
    training_output = r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\combined_glucose_data.csv"
    training_data.to_csv(training_output, index=False)
    print(f"Saved training data to {training_output}")
    
    eval_output = r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\eval_glucobench_data.csv"
    eval_data.to_csv(eval_output, index=False)
    print(f"Saved eval data to {eval_output}")
    