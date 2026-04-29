
const firebaseConfig = {
apiKey: "PASTE_API_KEY_HERE",
authDomain: "PASTE_PROJECT.firebaseapp.com",
projectId: "PASTE_PROJECT_ID",
storageBucket: "PASTE_PROJECT.appspot.com",
appId: "PASTE_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
