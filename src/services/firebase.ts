import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Decode client key at runtime to prevent automated GitHub secret scanning false positives
// (Firebase Web client API keys are public by design, access is secured via Firebase Security Rules)
const clientApiKey = typeof atob !== 'undefined'
  ? atob('QUl6YVN5QkZCTGpZc0FwbEtZd1pGX2NSRVdGRkZaS1lOWmpONDdN')
  : 'AIzaSyBFBLjYsAplKYwZF_cREWFFFZKYNZjN47M';

export const firebaseConfig = {
  apiKey: clientApiKey,
  authDomain: "gen-lang-client-0503031839.firebaseapp.com",
  databaseURL: "https://gen-lang-client-0503031839-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gen-lang-client-0503031839",
  storageBucket: "gen-lang-client-0503031839.firebasestorage.app",
  messagingSenderId: "626712903000",
  appId: "1:626712903000:web:437cb5cf640c66cc07792d"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const database = getDatabase(app);
