import os

base_path = r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\datasets\OhioT1DM"

for root, dirs, files in os.walk(base_path):
    print("FOLDER:", root)
    for f in files:
        print("   FILE:", f)