// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDviS9iLHKvh7hd5FNIlfucIZP7lAsYyhA",
  authDomain: "jst-control.firebaseapp.com",
  databaseURL: "https://jst-control-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jst-control",
  storageBucket: "jst-control.appspot.com",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID"
};

// 🔄 Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// 🔄 DOM Elements
const loginSection = document.getElementById("loginSection");
const controlSection = document.getElementById("controlSection");
const loginStatus = document.getElementById("loginStatus");
const popup = document.getElementById("espOfflinePopup");

const relay1Switch = document.getElementById("relay1Switch");
const relay2Switch = document.getElementById("relay2Switch");
const relay3Switch = document.getElementById("relay3Switch");
const relay4Switch = document.getElementById("relay4Switch");

const status1 = document.getElementById("status1");
const status2 = document.getElementById("status2");
const status3 = document.getElementById("status3");
const status4 = document.getElementById("status4");
const timerStatus = document.getElementById("timerStatus");

let motorInterval = null; // Global to clear when needed

// 🔐 Login Function
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

// 🚪 Logout Function
function logout() {
  auth.signOut().then(() => {
    loginSection.classList.remove("hidden");
    controlSection.classList.add("hidden");
  });
}

// 🧠 Monitor and Toggle Relay States
function monitorRelays() {
  const refs = [
    { ref: database.ref("/test/light"), switchEl: relay1Switch, statusEl: status1 },
    { ref: database.ref("/test/light2"), switchEl: relay2Switch, statusEl: status2 },
    { ref: database.ref("/test/light3"), switchEl: relay3Switch, statusEl: status3 },
    { ref: database.ref("/test/light4"), switchEl: relay4Switch, statusEl: status4 }
  ];

  const offlineAlert = document.getElementById("offlineAlert");

function monitorESPStatus() {
  const espRef = database.ref("/test/esp_status");

  espRef.on("value", (snapshot) => {
    const isOnline = snapshot.val();

    if (isOnline === true) {
      offlineAlert.style.display = "none";
    } else {
      offlineAlert.style.display = "block";
    }
  });

  // Timeout fail-safe: if status not updated in 20s, consider offline
  setInterval(() => {
    espRef.get().then(snapshot => {
      const timeDiff = Date.now() - snapshot._dataTimestamp;
      if (timeDiff > 20000) {
        offlineAlert.style.display = "block";
      }
    });
  }, 10000);
}

  refs.forEach((item) => {
    item.ref.on("value", (snapshot) => {
      const value = snapshot.val();
      item.switchEl.checked = value === true;
      item.statusEl.textContent = value ? "ON" : "OFF";
    });

    item.switchEl.onchange = () => {
      item.ref.set(item.switchEl.checked);

      // Cancel timer if MOTOR (relay1) manually turned OFF
      if (item.ref.key === "light" && !item.switchEl.checked) {
        database.ref("/test/motor_timer").set({ running: false });
        timerStatus.textContent = "Timer: OFF";
        status1.textContent = "OFF";
        if (motorInterval) clearInterval(motorInterval);
      }
    };
  });

  // Motor Timer Countdown Display
  const motorTimerRef = database.ref("/test/motor_timer");
  motorTimerRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (motorInterval) clearInterval(motorInterval);

    if (data && data.running && data.endTime) {
      motorInterval = setInterval(() => {
        const timeLeft = data.endTime - Date.now();

        if (timeLeft <= 0) {
          clearInterval(motorInterval);
          timerStatus.textContent = "Timer: OFF";
          relay1Switch.checked = false;
          status1.textContent = "OFF";
          database.ref("/test/light").set(false);
          motorTimerRef.set({ running: false });
        } else {
          const mins = Math.floor((timeLeft / 1000 / 60) % 60);
          const hrs = Math.floor((timeLeft / 1000 / 60 / 60));
          timerStatus.textContent = `Timer: ${hrs}h ${mins}m`;
        }
      }, 1000);
    } else {
      timerStatus.textContent = "Timer: --";
    }
  });
}

// 👤 Auth Persistence
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

// ⏳ Splash Screen Hide
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splashScreen").style.display = "none";
  }, 2500);
});

// 🕒 Auto Logout on Inactivity
const AUTO_LOGOUT_MINUTES = 5;
let logoutTimer;

function resetLogoutTimer() {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(() => {
    auth.signOut().then(() => {
      alert("Logged out due to inactivity.");
      location.reload();
    });
  }, AUTO_LOGOUT_MINUTES * 60 * 1000);
}

window.addEventListener("mousemove", resetLogoutTimer);
window.addEventListener("keydown", resetLogoutTimer);
resetLogoutTimer();
