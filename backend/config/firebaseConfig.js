const admin = require("firebase-admin")
const serviceCred = require("./service.json");
import dotenv from 'dotenv'
// const { initializeApp } = require("firebase-admin/app"); // Import initializeApp method
// const { getFirestore } = require("firebase-admin/firestore");

dotenv.config()
admin.initializeApp({
  credential: admin.credential.cert({
    private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEYID,
    project_id: process.env.PROJECT_ID,
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
    client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
    ...serviceCred,
  }),
  storageBucket: process.env.STORAGE_BUCKET,
});

console.log('Firebase initialized')
export const db = admin.firestore();
export const auth = admin.auth();
export const adminApp = admin;
