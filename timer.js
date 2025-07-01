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

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

document.addEventListener("DOMContentLoaded", function () {
  const startBtn = document.getElementById("startBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  startBtn.addEventListener("click", function () {
    const hours = parseInt(document.getElementById("hours").value) || 0;
    const minutes = parseInt(document.getElementById("minutes").value) || 0;

    const durationMs = (hours * 60 + minutes) * 60 * 1000;
    if (durationMs <= 0) {
      alert("Please enter valid hours or minutes.");
      return;
    }

    const endTime = Date.now() + durationMs;

    auth.onAuthStateChanged((user) => {
      if (user) {
        // ✅ Step 1: Turn ON the MOTOR immediately
        database.ref("/test/light").set(true);

        // ✅ Step 2: Set timer info
        database.ref("/test/motor_timer").set({
          running: true,
          endTime: endTime
        }).then(() => {
          alert("✅ Timer started and MOTOR turned ON!");
          window.location.href = "index.html";
        }).catch((err) => {
          alert("❌ Write Error: " + err.message);
        });
      } else {
        alert("Please login first.");
      }
    });
  });

  cancelBtn.addEventListener("click", function () {
    window.location.href = "index.html";
  });
});
