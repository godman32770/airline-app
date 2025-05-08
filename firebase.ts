// firebase.ts
import { initializeApp } from 'firebase/app';
//import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBlsSzuejb169-odb4LUHQ-rTmkkwcPeUU",
    authDomain: "airflight-app.firebaseapp.com",
    databaseURL: "https://airflight-app-default-rtdb.firebaseio.com",
    projectId: "airflight-app",
    storageBucket: "airflight-app.firebasestorage.app",
    messagingSenderId: "521287660565",
    appId: "1:521287660565:web:f040184647d83287634a1c",
    measurementId: "G-B8MSJV46DL"
};

const app = initializeApp(firebaseConfig);

//export const auth = getAuth(app);
export const db = getDatabase(app);
