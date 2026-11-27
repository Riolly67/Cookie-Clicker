
let cookies = 0;
let totalBaked = 0;
let clickPower = 1;
let totalCps = 0;
let multiplier = 1;
let buyAmount = 1;
let frenzyUntil = 0;
let goldenUntil = 0;
let lastTick = Date.now();
let lastClick = 0;
let clickStreak = 0;
let titleClicks = 0;
let secretUnlocked = false;
let upgradesBought = [];

const buildings = [
  {name:"Curseur",icon:"👆",base:15,cps:0.2,owned:0},
  {name:"Grand-mère",icon:"👵",base:80,cps:1,owned:0},
  {name:"Ferme",icon:"🌾",base:400,cps:5,owned:0},
  {name:"Mine",icon:"⛏️",base:2000,cps:20,owned:0},
  {name:"Usine",icon:"🏭",base:10000,cps:90,owned:0},
  {name:"Banque",icon:"🏦",base:50000,cps:400,owned:0},
  {name:"Temple",icon:"🏛️",base:250000,cps:1800,owned:0},
  {name:"Tour magique",icon:"🪄",base:1200000,cps:8000,owned:0},
  {name:"Vaisseau spatial",icon:"🚀",base:6000000,cps:35000,owned:0},
  {name:"Machine temporelle",icon:"⏳",base:30000000,cps:150000,owned:0},
  {name:"Condensateur",icon:"⚡",base:150000000,cps:700000,owned:0},
  {name:"Portail",icon:"🌀",base:750000000,cps:3500000,owned:0},
  {name:"Usine à cookies",icon:"🍪",base:4000000000,cps:18000000,owned:0},
  {name:"Dimension parallèle",icon:"🌌",base:20000000000,cps:90000000,owned:0},
  {name:"Ordinateur quantique",icon:"💻",base:100000000000,cps:450000000,owned:0},
  {name:"Multivers",icon:"🌠",base:500000000000,cps:2200000000,owned:0},
  {name:"Dieu du cookie",icon:"👑",base:2500000000000,cps:11000000000,owned:0},
  {name:"Réalité sucrée",icon:"✨",base:12500000000000,cps:55000000000,owned:0}
];

const upgrades = [
  {name:"Doigt renforcé",desc:"Clics x2",cost:100,type:"click",value:2},
  {name:"Doigt en or",desc:"Clics x2",cost:1000,type:"click",value:2},
  {name:"Main de pâtissier",desc:"Clics x3",cost:12000,type:"click",value:3},
  {name:"Main légendaire",desc:"Clics x5",cost:250000,type:"click",value:5},
  {name:"Curseurs rapides",desc:"Curseurs x2",cost:300,type:"building",index:0,value:2},
  {name:"Grand-mères expertes",desc:"Grand-mères x2",cost:1500,type:"building",index:1,value:2},
  {name:"Graines magiques",desc:"Fermes x2",cost:8000,type:"building",index:2,value:2},
  {name:"Pioches en diamant",desc:"Mines x2",cost:35000,type:"building",index:3,value:2},
  {name:"Chaînes automatisées",desc:"Usines x2",cost:150000,type:"building",index:4,value:2},
  {name:"Intérêts composés",desc:"Banques x2",cost:700000,type:"building",index:5,value:2},
  {name:"Sagesse ancienne",desc:"Temples x2",cost:3000000,type:"building",index:6,value:2},
  {name:"Sorts puissants",desc:"Tours magiques x2",cost:15000000,type:"building",index:7,value:2},
  {name:"Moteurs améliorés",desc:"Vaisseaux x2",cost:80000000,type:"building",index:8,value:2},
  {name:"Boucle temporelle",desc:"Machines temporelles x2",cost:400000000,type:"building",index:9,value:2},
  {name:"Production générale",desc:"Tous les bâtiments x1,5",cost:2000000000,type:"all",value:1.5},
  {name:"Pouvoir cosmique",desc:"Tous les bâtiments x2",cost:50000000000,type:"all",value:2}
];

const achievements = [
  ["Premier cookie",1],
  ["Petit gourmand",100],
  ["Centenaire",1000],
  ["Collectionneur",10000],
  ["Petite usine",100000],
  ["Millionnaire",1000000],
  ["Roi du goûter",100000000],
  ["Empire du cookie",1000000000],
  ["Maître du multivers",1000000000000]
];

const $ = id => document.getElementById(id);

function formatNumber(n) {
  if (!Number.isFinite(n)) return "∞";
  if (n < 1000) return Math.floor(n).toLocaleString("fr-FR");

  const units = ["","K","M","Md","Bn","T","Qa","Qi"];
  let i = 0;

  while (n >= 1000 && i < units.length-1) {
    n /= 1000;
    i++;
  }

  return n.toFixed(2).replace(".",",") + units[i];
}

function getCost(building,quantity=1) {
  let cost = 0;

  for(let i=0;i<quantity;i++) {
    cost += Math.ceil(building.base * Math.pow(1.12,building.owned+i));
  }

  return Math.ceil(cost);
}

function calculateCps() {
  totalCps = buildings.reduce(
    (sum,b) => sum+b.owned*b.cps,0
  );

  return totalCps;
}

function showFloating(message) {
  const el = $("floating-text");
  if(!el) return;

  el.textContent = message;
  el.classList.remove("float");
  void el.offsetWidth;
  el.classList.add("float");
}

function currentMultiplier() {
  return Date.now() < frenzyUntil ? 7 : 1;
}

function updateDisplay() {
  calculateCps();

  $("cookie-count").textContent =
    formatNumber(cookies)+" cookies";

  $("production").textContent =
    formatNumber(totalCps*currentMultiplier())+" cookies par seconde";

  $("click-power").textContent =
    formatNumber(clickPower*currentMultiplier())+" cookies par clic";

  $("total-baked").textContent =
    "Total produit : "+formatNumber(totalBaked);

  $("save-status").textContent = "Sauvegarde automatique activée";

  updateAchievements();
  updateButtons();
}

function updateButtons() {
  document.querySelectorAll(".buy-button[data-index]").forEach(button => {
    const b = buildings[Number(button.dataset.index)];
    const quantity = buyAmount === "max" ? 1 : buyAmount;

    button.disabled = cookies < getCost(b,quantity);

    button.innerHTML =
      `Acheter ${buyAmount === "max" ? "MAX" : "x"+buyAmount}<br>`+
      `${formatNumber(getCost(b,quantity))} 🍪`;
  });

  document.querySelectorAll(".upgrade-button").forEach(button => {
    const upgrade = upgrades[Number(button.dataset.index)];
    button.disabled = cookies < upgrade.cost;
  });
}

function renderBuildings() {
  const shop = $("building-shop");
  shop.innerHTML = "";

  buildings.forEach((b,index) => {
    const row = document.createElement("div");
    row.className = "building";

    row.innerHTML = `
      <div class="building-icon">${b.icon}</div>
      <div class="building-info">
        <div class="building-name">${b.name}</div>
        <div class="building-detail">
          Possédés : <span id="owned-${index}">${b.owned}</span><br>
          Production : ${formatNumber(b.cps*b.owned)} / sec<br>
          Prochain prix : ${formatNumber(getCost(b))} 🍪
        </div>
      </div>
      <button class="buy-button" data-index="${index}"></button>
    `;

    row.querySelector("button").addEventListener("click",()=>buyBuilding(index));
    shop.appendChild(row);
  });

  updateButtons();
}

function renderUpgrades() {
  const shop = $("upgrade-shop");
  shop.innerHTML = "";

  upgrades.forEach((u,index) => {
    if(upgradesBought.includes(u.name)) return;

    const button = document.createElement("button");
    button.className = "upgrade-button";
    button.dataset.index = index;

    button.innerHTML =
      `${u.name}<br><small>${u.desc}</small><br>💰 ${formatNumber(u.cost)} cookies`;

    button.addEventListener("click",()=>buyUpgrade(index));
    shop.appendChild(button);
  });

  updateButtons();
}

function renderBuyControls() {
  const shop = $("building-shop");
  if($("buy-controls")) return;

  const controls = document.createElement("div");
  controls.id = "buy-controls";
  controls.style.cssText =
    "display:flex;gap:8px;flex-wrap:wrap;margin:15px 0;";

  [1,10,100,"max"].forEach(amount => {
    const button = document.createElement("button");
    button.className = "buy-button";
    button.textContent = amount === "max" ? "MAX" : "x"+amount;

    button.addEventListener("click",()=>{
      buyAmount = amount;

      controls.querySelectorAll("button").forEach(b => {
        b.style.outline = "none";
      });

      button.style.outline = "2px solid #ffd36f";
      updateButtons();
    });

    controls.appendChild(button);
  });

  shop.before(controls);
}

function buyBuilding(index) {
  const b = buildings[index];

  let quantity = buyAmount === "max" ? 0 : buyAmount;

  if(buyAmount === "max") {
    while(quantity < 10000 &&
      cookies >= getCost(b,quantity+1)) {
      quantity++;
    }
  }

  if(quantity < 1) return;

  const cost = getCost(b,quantity);
  if(cookies < cost) return;

  cookies -= cost;
  b.owned += quantity;

  renderBuildings();
  updateDisplay();
  saveGame();
}

function buyUpgrade(index) {
  const u = upgrades[index];

  if(upgradesBought.includes(u.name) || cookies < u.cost) return;

  cookies -= u.cost;
  upgradesBought.push(u.name);

  if(u.type === "click") clickPower *= u.value;

  if(u.type === "building") {
    buildings[u.index].cps *= u.value;
  }

  if(u.type === "all") {
    buildings.forEach(b => b.cps *= u.value);
  }

  renderUpgrades();
  renderBuildings();
  updateDisplay();
  saveGame();
}

function updateAchievements() {
  const list = $("achievement-list");
  if(!list) return;

  list.innerHTML = achievements.map(a => {
    const unlocked = totalBaked >= a[1];

    return `
      <div class="achievement ${unlocked ? "unlocked" : ""}">
        ${unlocked ? "🏆" : "🔒"} ${a[0]}
        ${unlocked ? "✓" : "— "+formatNumber(a[1])+" cookies"}
      </div>
    `;
  }).join("");

  const next = achievements.find(a => totalBaked < a[1]);

  if($("achievement-progress")) {
    const previous = achievements.filter(a => a[1] < (next?.[1] || Infinity)).slice(-1)[0];
    const start = previous ? previous[1] : 0;

    $("achievement-progress").style.width =
      (next ? Math.min(100,(totalBaked-start)/(next[1]-start)*100) : 100)+"%";
  }

  if($("achievement-text")) {
    $("achievement-text").textContent = next
      ? next[0]+" : "+formatNumber(totalBaked)+" / "+formatNumber(next[1])
      : "Tous les succès débloqués !";
  }
}

// CLIC SUR LE COOKIE
$("cookie").addEventListener("click",()=>{
  const now = Date.now();

  clickStreak = now-lastClick < 700 ? clickStreak+1 : 1;
  lastClick = now;

  const gain = clickPower*currentMultiplier();

  cookies += gain;
  totalBaked += gain;

  showFloating("+"+formatNumber(gain));

  if(clickStreak === 25) {
    const bonus = clickPower*10;
    cookies += bonus;
    totalBaked += bonus;
    showFloating("🔥 Série de clics ! +"+formatNumber(bonus));
  }

  updateDisplay();
});

// PRODUCTION AUTOMATIQUE
function gameTick() {
  const now = Date.now();
  const elapsed = Math.min((now-lastTick)/1000,5);
  lastTick = now;

  const gain = calculateCps()*currentMultiplier()*elapsed;

  if(gain > 0) {
    cookies += gain;
    totalBaked += gain;
  }

  updateDisplay();
}

setInterval(gameTick,100);

// COOKIE DORÉ
function spawnGoldenCookie() {
  const golden = $("golden-cookie");
  if(!golden) return;

  golden.style.left = (10+Math.random()*70)+"%";
  golden.style.right = "auto";
  golden.classList.remove("hidden");

  setTimeout(()=>golden.classList.add("hidden"),12000);
}

$("golden-cookie").addEventListener("click",()=>{
  const reward = Math.max(50,totalCps*60,cookies*.05);

  cookies += reward;
  totalBaked += reward;

  frenzyUntil = Date.now()+12000;

  $("golden-cookie").classList.add("hidden");

  showFloating("✨ COOKIE DORÉ +"+formatNumber(reward));

  updateDisplay();
});

function scheduleGolden() {
  setTimeout(()=>{
    spawnGoldenCookie();
    scheduleGolden();
  },30000+Math.random()*30000);
}

// ÉVÉNEMENTS ALÉATOIRES
function randomEvent() {
  const events = [
    {
      name:"🍀 Chance du pâtissier !",
      action:()=> {
        const bonus = Math.max(100,totalCps*20);
        cookies += bonus;
        totalBaked += bonus;
      }
    },
    {
      name:"⚡ Super production !",
      action:()=> {
        frenzyUntil = Date.now()+15000;
      }
    },
    {
      name:"🍪 Pluie de cookies !",
      action:()=> {
        const bonus = Math.max(250,totalCps*35);
        cookies += bonus;
        totalBaked += bonus;
      }
    }
  ];

  const event = events[Math.floor(Math.random()*events.length)];
  event.action();

  showFloating(event.name);
  updateDisplay();
}

setInterval(()=>{
  if(Math.random()<0.08) randomEvent();
},60000);

// EASTER EGG : CLIQUER 10 FOIS SUR LE TITRE
document.querySelector("h1")?.addEventListener("click",()=>{
  titleClicks++;

  if(titleClicks>=10 && !secretUnlocked) {
    secretUnlocked = true;

    cookies += 5000;
    totalBaked += 5000;

    showFloating("🥚 SECRET DÉCOUVERT ! +5 000");
    updateDisplay();
    saveGame();
  }
});

// EASTER EGG : TAPER COOKIE AU CLAVIER
let secretKeys = "";

document.addEventListener("keydown",event=>{
  if(event.key.length===1) {
    secretKeys=(secretKeys+event.key.toLowerCase()).slice(-6);
  }

  if(secretKeys==="cookie") {
    const bonus=Math.max(1000,totalCps*30);

    cookies+=bonus;
    totalBaked+=bonus;

    secretKeys="";
    showFloating("🥚 SECRET COOKIE ! +"+formatNumber(bonus));

    updateDisplay();
  }
});

// SAUVEGARDE
function saveGame() {
  const data = {
    cookies,
    totalBaked,
    clickPower,
    buildings,
    upgradesBought,
    lastSave:Date.now(),
    secretUnlocked
  };

  try {
    localStorage.setItem("cookieClickerSave",JSON.stringify(data));
    $("save-status").textContent="Sauvegardé ✓";
  } catch(error) {
    console.warn("Sauvegarde impossible",error);
  }
}

function loadGame() {
  try {
    const raw=localStorage.getItem("cookieClickerSave");
    if(!raw) return;

    const data=JSON.parse(raw);

    cookies=Number(data.cookies)||0;
    totalBaked=Number(data.totalBaked)||0;
    clickPower=Number(data.clickPower)||1;
    secretUnlocked=Boolean(data.secretUnlocked);

    if(Array.isArray(data.buildings)) {
      data.buildings.forEach(saved=>{
        const b=buildings.find(item=>item.name===saved.name);

        if(b) {
          b.owned=Number(saved.owned)||0;
          if(Number.isFinite(saved.cps)) b.cps=saved.cps;
        }
      });
    }

    if(Array.isArray(data.upgradesBought)) {
      upgradesBought=data.upgradesBought;
    } else if(Array.isArray(data.upgrades)) {
      data.upgrades.forEach((u,index)=>{
        if(u.bought && upgrades[index]) {
          upgradesBought.push(upgrades[index].name);
        }
      });
    }

    if(data.lastSave) {
      const elapsed=Math.min(
        8*60*60,
        Math.max(0,(Date.now()-data.lastSave)/1000)
      );

      const offline=calculateCps()*elapsed;

      cookies+=offline;
      totalBaked+=offline;

      if(offline>0) {
        setTimeout(()=>{
          alert("Bienvenue ! Tu as gagné "+formatNumber(offline)+" cookies pendant ton absence !");
        },500);
      }
    }
  } catch(error) {
    console.warn("Erreur de sauvegarde",error);
  }
}

// BOUTONS
$("save-button").addEventListener("click",()=>{
  saveGame();
  showFloating("💾 Partie sauvegardée !");
});

$("reset-button").addEventListener("click",()=>{
  if(confirm("Veux-tu vraiment supprimer toute ta partie ?")) {
    localStorage.removeItem("cookieClickerSave");
    location.reload();
  }
});

// DÉMARRAGE
loadGame();
renderBuildings();
renderUpgrades();
renderBuyControls();
updateDisplay();

scheduleGolden();
setInterval(saveGame,15000);
window.addEventListener("beforeunload",saveGame);
