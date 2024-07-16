import admin from "firebase-admin";
import dotenv from "dotenv";
import * as serviceCred from "./service.json" assert { type: 'json' }

dotenv.config();

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEYID,
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      ...serviceCred,
    }),
  });
  console.log("Firebase app initialized");
} catch (error) {
  console.log(error);
}
