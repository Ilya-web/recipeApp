import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyAgG_vzZDyboum1DWd6jeLPES3VMjE7IZM',
  authDomain: 'recipes-cf955.firebaseapp.com',
  projectId: 'recipes-cf955',
  storageBucket: 'recipes-cf955.appspot.com',
  messagingSenderId: '22953072400',
  appId: '1:22953072400:web:02eb95ace7dfc7f7653795',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
