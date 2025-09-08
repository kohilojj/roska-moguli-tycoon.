let roskat = 0, rahat = 0, prestige = 0, rps = 0, rpk = 1;
let loggedIn = false;
let playerName = "Anon";

// Päivitys dashboardiin
const el = id => document.getElementById(id);
function update(msg = "") {
  el("roskat").innerText = roskat;
  el("rahat").innerText = rahat;
  el("prestige").innerText = prestige;
  el("rps").innerText = rps;
  if (msg) {
    el("message").innerText = msg;
    setTimeout(() => el("message").innerText = "", 2000);
  }
}

// Klikki
el("click-btn").onclick = () => {
  roskat += rpk;
  if (roskat >= 10) {
    const earned = Math.floor(roskat/10) * 5;
    rahat += earned;
    roskat %= 10;
    update(`Myit roskia ja sait ${earned} €`);
    sendScore();
    loadLeaderboard();
  } else {
    update(`+${rpk} roskaa`);
  }
};

// Autotuotto (RPS)
setInterval(() => {
  if (rps > 0) {
    roskat += rps;
    update();
  }
}, 1000);

// Google-kirjautuminen
function handleCredentialResponse(res) {
  const data = JSON.parse(atob(res.credential.split('.')[1]));
  playerName = data.name;
  loggedIn = true;
  el("user").innerText = `Hei ${playerName}!`;
  rahat += 5000; // bonus
  update("VIP Bonus +5000 € kirjautumisesta!");
  sendScore();
}
window.handleCredentialResponse = handleCredentialResponse;

// Leaderboard
async function loadLeaderboard() {
  try {
    const resp = await fetch("https://YOUR_BACKEND_URL/leaderboard");
    const data = await resp.json();
    el("leaders").innerHTML = "";
    data.forEach((row, i) => {
      const li = document.createElement("li");
      li.innerText = `${i+1}. ${row.name} – ${row.score} €`;
      el("leaders").appendChild(li);
    });
  } catch (e) {
    el("leaders").innerHTML = "<li>Ei yhteyttä leaderboardiin</li>";
  }
}

// Score lähetys
async function sendScore() {
  if (!loggedIn) return;
  await fetch("https://YOUR_BACKEND_URL/submit", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ name: playerName, score: rahat, prestige })
  }).catch(()=>{});
}

loadLeaderboard();