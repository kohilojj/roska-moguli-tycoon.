let score = 0;
let prestige = 0;

const scoreEl = document.getElementById("score");
const prestigeEl = document.getElementById("prestige");
const btn = document.getElementById("clickBtn");
const leaderboardEl = document.getElementById("leaderboard");

btn.addEventListener("click", () => {
  score += 1;
  scoreEl.textContent = `Raha: ${score} €`;
});

async function loadLeaderboard() {
  try {
    const res = await fetch("http://localhost:3000/leaderboard");
    const data = await res.json();
    leaderboardEl.innerHTML = "<h3>Leaderboard</h3>" +
      data.map((row,i)=>`<div>${i+1}. ${row.name}: ${row.score}</div>`).join("");
  } catch(e) {
    leaderboardEl.textContent = "Ei yhteyttä leaderboardiin";
  }
}
loadLeaderboard();
