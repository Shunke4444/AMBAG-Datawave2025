# firebase_admin_setup.py
import firebase_admin
from firebase_admin import credentials, auth
import os

# Path to your Firebase service account key JSON file
FIREBASE_CRED_PATH = os.getenv('FIREBASE_CRED_PATH', 'ambag-auth.json')

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        return None
