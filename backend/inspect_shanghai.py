import os
import pandas as pd

base = "../datasets/ShanghaiT1DM_T2DM"

# Find the T1DM folder automatically
t1dm_folder = None
for root, dirs, files in os.walk(base):
    if root.endswith("Shanghai_T1DM"):
        t1dm_folder = root
        break

# Pick one real patient file (skip junk/summary files)
first_file = "1001_0_20210730.xlsx"
file_path = os.path.join(t1dm_folder, first_file)

df = pd.read_excel(file_path)
print(df.columns.tolist())
print(df.head())