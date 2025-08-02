import os
import firebase_admin
from firebase_admin import credentials, db

# Initialize Firebase Admin SDK (service account JSON loaded via env)
cred = credentials.Certificate(os.getenv("FIREBASE_SA_PATH"))
firebase_admin.initialize_app(cred, {
    'databaseURL': os.getenv("FIREBASE_DB_URL").rstrip('/')  # e.g. "https://yourproject.firebaseio.com"
})

def root_ref(): return db.reference("/")
