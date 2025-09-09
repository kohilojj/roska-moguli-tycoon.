let roskat=0, rahat=0, prestige=0, rps=0, rpk=1;
let loggedIn=false, playerName="Anon";

const el=id=>document.getElementById(id);
function update(msg=""){
  el("roskat").innerText=roskat;
  el("rahat").innerText=rahat;
  el("prestige").innerText=prestige;
  el("rps").innerText=rps;
  if(msg){el("message").innerText=msg;setTimeout(()=>el("message").innerText="",2000);}
}

el("click-btn").onclick=e=>{
  let gain=rpk;
  if(Math.random()<0.1){gain*=10;spawnParticle(e.clientX,e.clientY,"+"+gain+"!");}
  roskat+=gain;
  if(roskat>=10){const earned=Math.floor(roskat/10)*5;rahat+=earned;roskat%=10;update("Myit roskia ja sait "+earned+" €");sendScore();loadLeaderboard();}
  else{update("+"+gain+" roskaa");}
};

setInterval(()=>{if(rps>0){roskat+=rps;update();}},1000);

// Kauppa
const shopItems=[
  {name:"Roskakärry",cost:50,rps:1},
  {name:"Jäteauto",cost:500,rps:10},
  {name:"Superpuristin",cost:5000,rps:50},
  {name:"RoskaTehdas",cost:50000,rps:500},
  {name:"MegaKone",cost:500000,rps:5000}
];
function renderShop(){el("shop").innerHTML="";shopItems.forEach((it,i)=>{const d=document.createElement("div");d.className="shop-item";d.innerText=it.name+" ("+it.cost+"€, +"+it.rps+" RPS)";d.onclick=()=>buyItem(i);el("shop").appendChild(d);});}
function buyItem(i){const it=shopItems[i];if(rahat>=it.cost){rahat-=it.cost;rps+=it.rps;update("Ostit: "+it.name);}else update("Ei tarpeeksi rahaa!");}
renderShop();

// Leaderboard
const API_URL="https://roska-moguli-tycoon.onrender.com";
async function loadLeaderboard(){try{const resp=await fetch(`${API_URL}/leaderboard`);const data=await resp.json();el("leaders").innerHTML="";data.forEach((row,i)=>{const li=document.createElement("li");li.innerText=`${i+1}. ${row.name} – ${row.score} €`;el("leaders").appendChild(li);});}catch(e){el("leaders").innerHTML="<li>Ei yhteyttä leaderboardiin</li>";}}
async function sendScore(){if(!loggedIn)return;await fetch(`${API_URL}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:playerName,score:rahat,prestige})}).catch(()=>{});}

// Partikkeliefektit
function spawnParticle(x,y,text){const p=document.createElement("div");p.className="particle";p.innerText=text;document.body.appendChild(p);p.style.left=x+"px";p.style.top=y+"px";setTimeout(()=>p.remove(),1000);}

// Musiikki
const music=el("bg-music");el("mute-btn").onclick=()=>{if(music.paused)music.play();else music.pause();};

loadLeaderboard();