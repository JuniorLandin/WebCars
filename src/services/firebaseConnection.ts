import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD71Oaq8qFZsd2n6_x6-9V6-oXIe9kyxEE",
  authDomain: "webca-39c3c.firebaseapp.com",
  projectId: "webca-39c3c",
  storageBucket: "webca-39c3c.appspot.com",
  messagingSenderId: "446277732098",
  appId: "1:446277732098:web:0e3260139b774f0945a41b",
  measurementId: "G-QCRK9BKVXF"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const storage = getStorage(app)

export {db, auth, storage};