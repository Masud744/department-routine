import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyBFBLjYsAplKYwZF_cREWFFFZKYNZjN47M",
  authDomain: "gcn-lang-client-0503031839.firebaseapp.com",
  databaseURL: "https://gcn-lang-client-0503031839-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gcn-lang-client-0503031839",
  storageBucket: "gcn-lang-client-0503031839.firebasestorage.app",
  messagingSenderId: "626712903000",
  appId: "1:626712903000:web:437cb5cf640c66cc07792d"
};

// Initialize Firebase safely (avoid multi-initialization)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const database = getDatabase(app);
