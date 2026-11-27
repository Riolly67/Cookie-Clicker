
let cookies = 0;
let totalBaked = 0;
let clickPower = 1;
let totalCps = 0;
let goldenBonus = 1;

const buildings = [
  { name: "Curseur", icon: "👆", base: 15, cps: 0.1, owned: 0 },
  { name: "Grand-mère", icon: "👵", base: 100, cps: 1, owned: 0 },
  { name: "Ferme", icon: "🌾", base: 1100, cps: 8, owned: 0 },
  { name: "Mine", icon: "⛏️", base: 12000, cps: 47, owned: 0 },
  { name: "Usine", icon: "🏭", base: 130000, cps: 260, owned: 0 },
  { name: "Banque", icon: "🏦", base: 1400000, cps: 1400, owned: 0 },
  { name: "Temple", icon: "🏛️", base: 20000000, cps: 7800, owned: 0 },
  { name: "Tour de magie", icon: "🪄", base: 330000000, cps: 44000, owned: 0 },
  { name: "Vaisseau spatial", icon: "🚀", base: 5100000000, cps: 260000, owned: 0 },
  { name: "Machine temporelle", icon: "⏳", base: 75000000000, cps: 1600000, owned: 0 }
];

const upgrades = [
  {
    name: "Doigt renforcé",
    description: "Double la puissance des clics",
    cost: 100,
    type: "click",
    multiplier: 2,
    bought: false
  },
  {
    name: "Doigt en or",
    description: "Double encore la puissance des clics",
    cost: 1000,
    type: "click",
    multiplier: 2,
    bought: false
  },
  {
    name: "Grandes mains",
    description: "Triple la puissance des clics",
    cost: 10000,
    type: "click",
    multiplier: 3,
    bought: false
  },
  {
    name: "Curseurs améliorés",
    description: "Double la production des curseurs",
    cost: 500,
    type: "building",
    building: 0,
    multiplier: 2,
    bought: false
  },
  {
    name: "Recettes de grand-mère",
    description: "Double la production des grand-mères",
    cost: 2000,
    type: "building",
    building: 1,
    multiplier: 2,
    bought: false
  },
  {
    name: "Engrais magique",
    description: "Double la production des fermes",
    cost: 15000,
    type: "building",
    building: 2,
    multiplier: 2,
    bought: false
  },
  {
    name: "Machines perfectionnées",
    description: "Double la production des mines",
    cost: 100000,
    type: "building",
    building: 3,
    multiplier: 2,
    bought: false
  },
  {
    name: "Super usines",
    description: "Double la production des usines",
    cost: 1000000,
    type: "building",
    building: 4,
    multiplier: 2,
    bought: false
  },
  {
    name: "Technologie avancée",
    description: "Double la production des banques",
    cost: 10000000,
    type: "building",
    building: 5,
    multiplier: 2,
    bought: false
  },
  {
    name: "Pouvoir ancien",
    description: "Double la production des temples",
    cost: 100000000,
    type: "building",
    building: 6,
    multiplier: 2,
    bought: false
  }
];

const achievements = [
  { name: "Premier cookie", target: 1, unlocked: false },
  { name: "Débutant", target: 100, unlocked: false },
  { name: "Accro aux cookies", target: 1000, unlocked: false },
  { name: "Millionnaire", target: 1000000, unlocked: false },
  { name: "Empire du cookie", target: 100000000, unlocked: false },
  { name: "Légende", target: 1000000000, unlocked: false }
];

const cookie = document.getElementById("cookie");
const countDisplay = document.getElementById("cookie-count");
const productionDisplay = document.getElementById("production");
const clickDisplay = document.getElementById("click-power");

function formatNumber(number) {
  if (number < 1000) return Math.floor(number).toLocaleString("fr-FR");

  const units = ["", "K", "M", "Md", "Bn", "T", "Qa"];
  let index = 0;

  while (number >= 1000 && index < units.length - 1) {
    number /= 1000;
    index++;
  }

  return number.toFixed(2) + units[index];
}

function getBuildingCost(building) {
  return Math.ceil(building.base * Math.pow(1.15, building.owned));
}

function calculateCps() {
  totalCps = buildings.reduce((sum, building) => {
    return sum + building.owned * building.cps;
  }, 0);
}

function updateDisplay() {
  calculateCps();

  countDisplay.textContent = formatNumber(cookies) + " cookies";
  productionDisplay.textContent = formatNumber(totalCps * goldenBonus) + " cookies par seconde";
  clickDisplay.textContent = formatNumber(clickPower * goldenBonus) + " cookies par clic";

  document.getElementById("total-baked").textContent =
    "Total produit : " + formatNumber(totalBaked);

  document.querySelectorAll(".buy-button").forEach((button, index) => {
    button.disabled = cookies < getBuildingCost(buildings[index]);
  });

  document.querySelectorAll(".upgrade-button").forEach(button => {
    const upgrade = upgrades[Number(button.dataset.id)];
    button.disabled = cookies < upgrade.cost;
  });

  updateAchievements();
}

function showFloatingText(text) {
  const floating = document.getElementById("floating-text");

  floating.textContent = text;
  floating.classList.remove("float");

  void floating.offsetWidth;

  floating.classList.add("float");
}

cookie.addEventListener("click", () => {
  const gain = clickPower * goldenBonus;

  cookies += gain;
  totalBaked += gain;

  showFloatingText("+" + formatNumber(gain));

  updateDisplay();
});

function renderBuildings() {
  const shop = document.getElementById("building-shop");

  shop.innerHTML = "";

  buildings.forEach((building, index) => {
    const cost = getBuildingCost(building);

    const item = document.createElement("div");
    item.className = "building";

    item.innerHTML = `
      <div class="building-icon">${building.icon}</div>
      <div class="building-info">
        <div class="building-name">${building.name}</div>
        <div class="building-detail">
          Possédés : ${building.owned}<br>
          Production : ${formatNumber(building.cps * building.owned)} / sec
        </div>
      </div>
      <button class="buy-button" ${cookies < cost ? "disabled" : ""}>
        Acheter<br>${formatNumber(cost)} 🍪
      </button>
    `;

    item.querySelector("button").addEventListener("click", () => {
      buyBuilding(index);
    });

    shop.appendChild(item);
  });
}

function buyBuilding(index) {
  const building = buildings[index];
  const cost = getBuildingCost(building);

  if (cookies < cost) return;

  cookies -= cost;
  building.owned++;

  renderBuildings();
  updateDisplay();
}

function renderUpgrades() {
  const shop = document.getElementById("upgrade-shop");

  shop.innerHTML = "";

  upgrades.forEach((upgrade, index) => {
    if (upgrade.bought) return;

    const button = document.createElement("button");
    button.className = "upgrade-button";
    button.dataset.id = index;
    button.disabled = cookies < upgrade.cost;

    button.innerHTML = `
      ${upgrade.name}<br>
      <small>${upgrade.description}</small><br>
      💰 ${formatNumber(upgrade.cost)} cookies
    `;

    button.addEventListener("click", () => buyUpgrade(index));

    shop.appendChild(button);
  });
}

function buyUpgrade(index) {
  const upgrade = upgrades[index];

  if (upgrade.bought || cookies < upgrade.cost) return;

  cookies -= upgrade.cost;
  upgrade.bought = true;

  if (upgrade.type === "click") {
    clickPower *= upgrade.multiplier;
  }

  if (upgrade.type === "building") {
    buildings[upgrade.building].cps *= upgrade.multiplier;
  }

  renderUpgrades();
  renderBuildings();
  updateDisplay();
}

function updateAchievements() {
  const list = document.getElementById("achievement-list");

  achievements.forEach(achievement => {
    if (totalBaked >= achievement.target && !achievement.unlocked) {
      achievement.unlocked = true;
      showFloatingText("🏆 Succès débloqué !");
    }
  });

  list.innerHTML = achievements.map(achievement => `
    <div class="achievement ${achievement.unlocked ? "unlocked" : ""}">
      ${achievement.unlocked ? "🏆" : "🔒"}
      ${achievement.name}
      ${achievement.unlocked ? "✓" : ""}
    </div>
  `).join("");

  const next = achievements.find(a => !a.unlocked);

  const progress = document.getElementById("achievement-progress");
  const text = document.getElementById("achievement-text");

  if (next) {
    const previous = achievements[achievements.indexOf(next) - 1];
    const start = previous ? previous.target : 0;
    const percentage = Math.min(
      100,
      ((totalBaked - start) / (next.target - start)) * 100
    );

    progress.style.width = percentage + "%";
    text.textContent = next.name + " : " +
      formatNumber(totalBaked) + " / " + formatNumber(next.target);
  } else {
    progress.style.width = "100%";
    text.textContent = "Tous les succès débloqués !";
  }
}

// Production automatique
setInterval(() => {
  const gain = totalCps * goldenBonus / 10;

  if (gain > 0) {
    cookies += gain;
    totalBaked += gain;
    updateDisplay();
  }
}, 100);

// Cookies dorés
function spawnGoldenCookie() {
  const golden = document.getElementById("golden-cookie");

  golden.classList.remove("hidden");

  setTimeout(() => {
    golden.classList.add("hidden");
  }, 10000);
}

document.getElementById("golden-cookie").addEventListener("click", () => {
  const reward = Math.max(50, totalCps * 60, cookies * 0.05);

  cookies += reward;
  totalBaked += reward;

  goldenBonus = 7;

  showFloatingText("✨ +" + formatNumber(reward));

  document.getElementById("golden-cookie").classList.add("hidden");

  setTimeout(() => {
    goldenBonus = 1;
    updateDisplay();
  }, 10000);

  updateDisplay();
});

function scheduleGoldenCookie() {
  const delay = 25000 + Math.random() * 25000;

  setTimeout(() => {
    spawnGoldenCookie();
    scheduleGoldenCookie();
  }, delay);
}

// Sauvegarde
function saveGame() {
  const data = {
    cookies,
    totalBaked,
    clickPower,
    buildings,
    upgrades,
    achievements,
    lastSave: Date.now()
  };

  localStorage.setItem("cookieClickerSave", JSON.stringify(data));

  document.getElementById("save-status").textContent = "Partie sauvegardée ✓";
}

function loadGame() {
  const saved = localStorage.getItem("cookieClickerSave");

  if (!saved) return;

  try {
    const data = JSON.parse(saved);

    cookies = data.cookies || 0;
    totalBaked = data.totalBaked || 0;
    clickPower = data.clickPower || 1;

    if (data.buildings) {
      buildings.forEach((building, index) => {
        if (data.buildings[index]) {
          building.owned = data.buildings[index].owned || 0;
          building.cps = data.buildings[index].cps;
        }
      });
    }

    if (data.upgrades) {
      upgrades.forEach((upgrade, index) => {
        if (data.upgrades[index]) {
          upgrade.bought = data.upgrades[index].bought || false;
        }
      });
    }

    if (data.achievements) {
      achievements.forEach((achievement, index) => {
        if (data.achievements[index]) {
          achievement.unlocked = data.achievements[index].unlocked || false;
        }
      });
    }

    // Production pendant l'absence, limitée à 8 heures
    if (data.lastSave) {
      const elapsed = Math.min(
        (Date.now() - data.lastSave) / 1000,
        8 * 60 * 60
      );

      const offlineCookies = calculateOfflineProduction() * elapsed;

      cookies += offlineCookies;
      totalBaked += offlineCookies;
    }

  } catch (error) {
    console.error("Erreur de sauvegarde :", error);
  }
}

function calculateOfflineProduction() {
  return buildings.reduce((sum, building) => {
    return sum + building.owned * building.cps;
  }, 0);
}

document.getElementById("save-button").addEventListener("click", saveGame);

document.getElementById("reset-button").addEventListener("click", () => {
  if (!confirm("Attention ! Veux-tu vraiment supprimer toute ta partie ?")) {
    return;
  }

  localStorage.removeItem("cookieClickerSave");
  location.reload();
});

// Démarrage
loadGame();
renderBuildings();
renderUpgrades();
updateDisplay();
scheduleGoldenCookie();

setInterval(saveGame, 10000);

window.addEventListener("beforeunload", saveGame);
