import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase yapılandırması
// Not: Gerçek kullanımda bu bilgiler .env dosyasından alınmalı
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanını al
export const db = getFirestore(app);

// Collection path helper
export const getCollectionPath = (userId: string, collectionName: string) => {
  const appId = 'ogaleri'; // Sabit uygulama ID'si
  return `artifacts/${appId}/users/${userId}/${collectionName}`;
};
