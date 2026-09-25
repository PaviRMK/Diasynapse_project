from firebase_config import db

# Write a test document
doc_ref = db.collection("test_collection").document("test_doc")
doc_ref.set({
    "message": "DiaSynapse connected to Firebase successfully!",
    "project": "DiaSynapse"
})
print("Write successful!")

# Read it back
doc = doc_ref.get()
if doc.exists:
    print("Read successful! Data:", doc.to_dict())
else:
    print("Document not found.")