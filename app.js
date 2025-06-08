// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDviS9iLHKvh7hd5FNIlfucIZP7lAsYyhA",
  authDomain: "jst-control.firebaseapp.com",
  databaseURL: "https://jst-control-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jst-control",
  storageBucket: "jst-control.appspot.com",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

const loginSection = document.getElementById("loginSection");
const controlSection = document.getElementById("controlSection");
const loginStatus = document.getElementById("loginStatus");

const relay1Switch = document.getElementById("relay1Switch");
const relay2Switch = document.getElementById("relay2Switch");
const relay3Switch = document.getElementById("relay3Switch");
const relay4Switch = document.getElementById("relay4Switch");

const status1 = document.getElementById("status1");
const status2 = document.getElementById("status2");
const status3 = document.getElementById("status3");
const status4 = document.getElementById("status4");

// 🔐 LOGIN
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginStatus.textContent = "";
      loginSection.classList.add("hidden");
      controlSection.classList.remove("hidden");
      monitorRelays();
    })
    .catch((error) => {
      loginStatus.textContent = "Login Failed: " + error.message;
    });
}

// 🚪 LOGOUT
function logout() {
  auth.signOut().then(() => {
    loginSection.classList.remove("hidden");
    controlSection.classList.add("hidden");
  });
}

// 🧠 Monitor Relay States
function monitorRelays() {
  const refs = [
    { ref: database.ref("/test/light"), switchEl: relay1Switch, statusEl: status1 },
    { ref: database.ref("/test/light2"), switchEl: relay2Switch, statusEl: status2 },
    { ref: database.ref("/test/light3"), switchEl: relay3Switch, statusEl: status3 },
    { ref: database.ref("/test/light4"), switchEl: relay4Switch, statusEl: status4 }
  ];

  refs.forEach((item, i) => {
    item.ref.on("value", (snapshot) => {
      const value = snapshot.val();
      item.switchEl.checked = value === true;
      item.statusEl.textContent = value ? "ON" : "OFF";
    });

    item.switchEl.onchange = () => {
      item.ref.set(item.switchEl.checked);
    };
  });
}

// 🔐 Stay Logged In
auth.onAuthStateChanged((user) => {
  if (user) {
    loginSection.classList.add("hidden");
    controlSection.classList.remove("hidden");
    monitorRelays();
  } else {
    loginSection.classList.remove("hidden");
    controlSection.classList.add("hidden");
  }
});
