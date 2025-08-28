const maxMana = 10;
let mana = 0;
const manaDisplay = document.getElementById("mana-count");
const lanes = document.querySelectorAll(".lane");
const playerTowers = document.querySelectorAll(".tower.player");
const enemyTowers = document.querySelectorAll(".tower.enemy");

// Dados das tropas e torres
const unitsData = {
  soldier: { emoji: "🗡️", speed: 2, hp: 5, attack: 1 },
  archer:  { emoji: "🏹", speed: 3, hp: 3, attack: 1 },
  tank:    { emoji: "🛡️", speed: 1, hp: 10, attack: 2 },
  mage:    { emoji: "🔥", speed: 2.5, hp: 3, attack: 2 }
};

const towerHP = 20;

// Inicializa vida das torres e barras
playerTowers.forEach(tower => initTower(tower));
enemyTowers.forEach(tower => initTower(tower));

function initTower(tower) {
  tower.dataset.hp = towerHP;
  const healthBarFill = tower.querySelector(".health-bar-fill");
  healthBarFill.style.width = "100%";
}

// Gera mana com o tempo
setInterval(() => {
  if (mana < maxMana) {
    mana++;
    manaDisplay.textContent = mana;
  }
}, 1000);

// Controle do botão das cartas para desabilitar se mana insuficiente
function updateCards() {
  document.querySelectorAll(".card").forEach(button => {
    const cost = parseInt(button.dataset.cost);
    button.disabled = mana < cost;
  });
}

setInterval(updateCards, 300);

// Spawn de unidades ao clicar na carta
document.querySelectorAll(".card").forEach(button => {
  button.addEventListener("click", () => {
    const cost = parseInt(button.dataset.cost);
    const unitType = button.dataset.unit;

    if (mana >= cost) {
      const lane = prompt("Escolha a lane (top, mid, bot):", "mid");
      if (!["top", "mid", "bot"].includes(lane)) {
        alert("Lane inválida!");
        return;
      }

      mana -= cost;
      manaDisplay.textContent = mana;
      updateCards();

      spawnUnit(unitType, "player", lane);

      // IA inimiga joga carta após um delay aleatório entre 1.5s e 3s
      setTimeout(() => {
        const laneInimiga = chooseLaneForEnemy();
        spawnUnit(randomUnit(), "enemy", laneInimiga);
      }, 1500 + Math.random() * 1500);
    } else {
      alert("Mana insuficiente!");
    }
  });
});

// Spawn de unidades
function spawnUnit(type, side, laneName) {
  const lane = Array.from(lanes).find(l => l.dataset.lane === laneName);
  const unit = document.createElement("div");
  unit.classList.add("unit", side);
  unit.textContent = unitsData[type].emoji;

  unit.dataset.hp = unitsData[type].hp;
  unit.dataset.speed = unitsData[type].speed;
  unit.dataset.attack = unitsData[type].attack;
  unit.dataset.type = type;
  unit.dataset.side = side;
  unit.dataset.lane = laneName;

  unit.style.left = side === "player" ? "0px" : "480px";

  // Barra de vida visível
  const healthBar = document.createElement("div");
  healthBar.classList.add("health-bar");
  const healthBarFill = document.createElement("div");
  healthBarFill.classList.add("health-bar-fill");
  healthBar.appendChild(healthBarFill);
  unit.appendChild(healthBar);

  lane.appendChild(unit);

  animateUnit(unit, side, lane);
}

// Animação + colisão + ataque
function animateUnit(unit, side, lane) {
  let position = parseInt(unit.style.left);
  const speed = parseFloat(unit.dataset.speed);
  const direction = side === "player" ? 1 : -1;

  const move = setInterval(() => {
    if (!unit.parentElement) {
      clearInterval(move);
      return;
    }

    // Procurar inimigos na lane perto pra atacar
    const opponents = Array.from(lane.querySelectorAll(`.unit.${side === "player" ? "enemy" : "player"}`));

    const collided = opponents.find(op => {
      const opPos = parseInt(op.style.left);
      return Math.abs(opPos - position) < 30;
    });

    if (collided) {
      clearInterval(move);
      fight(unit, collided, lane);
      return;
    }

    // Se chegou perto da torre inimiga, atacar torre
    if ((side === "player" && position >= 470) || (side === "enemy" && position <= 10)) {
      clearInterval(move);
      const tower = getTowerAtLane(side === "player" ? "enemy" : "player", unit.dataset.lane);
      if (tower) {
        attackTower(unit, tower, lane);
      } else {
        unit.remove();
      }
      return;
    }

    position += direction * speed;
    unit.style.left = `${position}px`;

  }, 30);
}

// Função para pegar torre na lane e lado
function getTowerAtLane(side, laneName) {
  const towers = side === "player" ? playerTowers : enemyTowers;
  for (const t of towers) {
    if (t.dataset.lane === laneName) return t;
  }
  return null;
}

// Luta entre duas unidades
function fight(unitA, unitB, lane) {
  const hpA = parseInt(unitA.dataset.hp) - parseInt(unitB.dataset.attack);
  const hpB = parseInt(unitB.dataset.hp) - parseInt(unitA.dataset.attack);

  unitA.dataset.hp = hpA;
  unitB.dataset.hp = hpB;

  updateHealthBar(unitA);
  updateHealthBar(unitB);

  if (hpA <= 0) unitA.remove();
  if (hpB <= 0) unitB.remove();

  if (hpA > 0 && hpB > 0) {
    setTimeout(() => fight(unitA, unitB, lane), 800);
  } else {
    if (hpA > 0) animateUnit(unitA, "player", lane);
    if (hpB > 0) animateUnit(unitB, "enemy", lane);
  }
}

// Atualiza barra de vida da unidade
function updateHealthBar(unit) {
  const hp = parseInt(unit.dataset.hp);
  const maxHp = unitsData[unit.dataset.type].hp;
  const percent = Math.max(0, (hp / maxHp) * 100);
  const barFill = unit.querySelector(".health-bar-fill");
  if (barFill) barFill.style.width = percent + "%";
}

// Ataque de unidade na torre
function attackTower(unit, tower, lane) {
  const attackPower = parseInt(unit.dataset.attack);

  const towerHPNow = parseInt(tower.dataset.hp) - attackPower;
  tower.dataset.hp = towerHPNow;

  updateTowerHealthBar(tower);

  if (towerHPNow <= 0) {
    alert(`${unit.dataset.side === "player" ? "Você" : "Inimigo"} venceu a torre ${tower.dataset.lane}!`);
    tower.remove();
  } else {
    // Continua atacando a cada 1 segundo enquanto unidade e torre existirem
    setTimeout(() => {
      if (unit.parentElement && tower.parentElement) {
        attackTower(unit, tower, lane);
      }
    }, 1000);
  }
}

// Atualiza barra de vida da torre
function updateTowerHealthBar(tower) {
  const hp = parseInt(tower.dataset.hp);
  const percent = Math.max(0, (hp / towerHP) * 100);
  const barFill = tower.querySelector(".health-bar-fill");
  if (barFill) barFill.style.width = percent + "%";
}

// IA inimiga escolhe lane com menos tropas do jogador
function chooseLaneForEnemy() {
  let minCount = Infinity;
  let chosenLane = "mid";

  ["top", "mid", "bot"].forEach(lane => {
    const playerUnits = document.querySelectorAll(`.lane[data-lane="${lane}"] .unit.player`);
    if (playerUnits.length < minCount) {
      minCount = playerUnits.length;
      chosenLane = lane;
    }
  });

  return chosenLane;
}

// Escolhe uma tropa aleatória para o inimigo
function randomUnit() {
  const keys = Object.keys(unitsData);
  return keys[Math.floor(Math.random() * keys.length)];
}

