import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyCx6dUefZJL_Vx_IKxavbuZ4c8nrMnX-a4',
  authDomain: 'gymtracker-bfa72.firebaseapp.com',
  projectId: 'gymtracker-bfa72',
  storageBucket: 'gymtracker-bfa72.firebasestorage.app',
  messagingSenderId: '1051741502493',
  appId: '1:1051741502493:web:8d93117195d6f41e991af4',
  measurementId: 'G-00KXJRS915',
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Optional analytics in supported environments
export let analytics
;(async () => {
  try {
    if (await isSupported()) {
      analytics = getAnalytics(app)
    }
  } catch (_) {
    // ignore analytics errors in unsupported environments
  }
})()


