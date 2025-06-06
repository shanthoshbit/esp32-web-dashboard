// 🔧 Firebase Config (Your project settings)
const firebaseConfig = {
  apiKey: "AIzaSyDviS9iLHKvh7hd5FNIlfucIZP7lAsYyhA",
  authDomain: "jst-control.firebaseapp.com",
  databaseURL: "https://jst-control-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jst-control",
  storageBucket: "jst-control.appspot.com",
  messagingSenderId: "301905840455",
  appId: "1:301905840455:web:6ba55894f2c7b8b5f22462"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const lightRef = db.ref("test/light");

const loginSection = document.getElementById("loginSection");
const controlSection = document.getElementById("controlSection");

// 🔐 Sign in logic
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      loginSection.classList.add("hidden");
      controlSection.classList.remove("hidden");
    })
    .catch((error) => {
      document.getElementById("loginStatus").innerText = error.message;
    });
}

// 🔒 Logout logic
function logout() {
  firebase.auth().signOut().then(() => {
    controlSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
  });
}

// ✅ Monitor auth state
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    loginSection.classList.add("hidden");
    controlSection.classList.remove("hidden");
    lightRef.on("value", (snapshot) => {
      const isOn = snapshot.val();
      document.getElementById("lightSwitch").checked = isOn;
      document.getElementById("status").innerText = isOn ? "ON" : "OFF";
    });
  } else {
    logout();
  }
});

// 💡 Toggle light value
document.getElementById("lightSwitch").addEventListener("change", (e) => {
  lightRef.set(e.target.checked);
});
