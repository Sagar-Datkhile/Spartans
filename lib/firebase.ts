import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const isConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY

// Initialize Firebase only if we have a real API key
let app: any
let auth: any
let db: any
let storage: any

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } catch (error) {
    console.error("Firebase initialization failed:", error)
  }
} else {
  // Provide harmless mock objects for development
  console.warn("Firebase not configured. Using development bypass.")
  app = {}
  auth = { currentUser: null, onAuthStateChanged: () => () => { } }
  db = {}
  storage = {}
}

export { auth, db, storage }
export default app
