// firebase.ts
import { initializeApp } from 'firebase/app';
//import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = { //Create Your Own Firebase and Get all config put it in here
    apiKey: "---",
    authDomain: "---",
    databaseURL: "---",
    projectId: "---",
    storageBucket: "---",
    messagingSenderId: "---",
    appId: "---",
    measurementId: "---"
};

const app = initializeApp(firebaseConfig);

//export const auth = getAuth(app);
export const db = getDatabase(app);
