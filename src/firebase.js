import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBKTvHVkJp12-Juu9Ek_3FZ-eLLSQbrkvc",
  authDomain: "gcxsys.firebaseapp.com",
  databaseURL: "https://gcxsys-default-rtdb.firebaseio.com",
  projectId: "gcxsys",
  storageBucket: "gcxsys.appspot.com",
  messagingSenderId: "122069893420",
  appId: "1:122069893420:web:d3cf949ca12e57bd256c89",
  measurementId: "G-9SYF06YWR4",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
