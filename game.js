let mana = 0;
const maxMana = 10;
const manaDisplay = document.getElementById("mana-count");
const lanes = document.querySelectorAll(".lane");

// Gera mana ao longo do tempo
setInterval(() => {
  if (mana < maxMana) {
    mana++;
    manaDisplay.textContent = mana;
  }
}, 1000);

// Dados das tropas
const unitsData = {
  soldier: { emoji: "🗡️", speed: 2, hp: 3 },
  archer:  { emoji: "🏹", speed: 3, hp: 2 },
  tank:    { emoji: "🛡️", speed: 1, hp: 6 },
  mage:    { emoji: "🔥", speed: 2.5, hp: 2 }
};

// Clique nas cartas
document.querySelectorAll(".card").forEach(button => {
  button.addEventListener("click", () => {
    const cost = parseInt(button.dataset.cost);
    const unitType = button.dataset.unit;

    if (mana >= cost) {
      mana -= cost;
      manaDisplay.textContent = mana;

      const lane = prompt("Escolha a lane (top, mid, bot):", "mid");
      if (["top", "mid", "bot"].includes(lane)) {
        spawnUnit(unitType, "player", lane);
        // Spawnar inimigo automático como resposta
        setTimeout(() => {
          spawnUnit(randomUnit(), "enemy", lane);
        }, 1500);
      } else {
        alert("Lane inválida!");
      }
    } else {
      alert("Mana insuficiente!");
    }
  });
});

// Criação de unidade
function spawnUnit(type, side, laneName) {
  const lane = Array.from(lanes).find(l => l.dataset.lane === laneName);
  const unit = document.createElement("div");
  unit.classList.add("unit", side);
  unit.textContent = unitsData[type].emoji;

  unit.dataset.hp = unitsData[type].hp;
  unit.dataset.speed = unitsData[type].speed;
  unit.dataset.type = type;

  unit.style.left = side === "player" ? "0px" : "460px";
  lane.appendChild(unit);

  animateUnit(unit, side, lane);
}

// Animação e colisão
function animateUnit(unit, side, lane) {
  let position = parseInt(unit.style.left);
  const speed = parseFloat(unit.dataset.speed);
  const direction = side === "player" ? 1 : -1;

  const move = setInterval(() => {
    const opponents = Array.from(lane.querySelectorAll(`.unit.${side === "player" ? "enemy" : "player"}`));

    const collided = opponents.find(op => {
      const opPos = parseInt(op.style.left);
      return Math.abs(opPos - position) < 30;
    });

    if (collided) {
      fight(unit, collided);
      clearInterval(move);
      return;
    }

    position += direction * speed;
    unit.style.left = `${position}px`;

    if (position < 0 || position > 460) {
      unit.remove();
      clearInterval(move);
    }
  }, 30);
}

// Batalha entre duas unidades
function fight(unitA, unitB) {
  const hpA = parseInt(unitA.dataset.hp) - 1;
  const hpB = parseInt(unitB.dataset.hp) - 1;

  unitA.dataset.hp = hpA;
  unitB.dataset.hp = hpB;

  if (hpA <= 0) unitA.remove();
  if (hpB <= 0) unitB.remove();

  // Se os dois sobreviverem, eles voltam a se mover
  if (hpA > 0) animateUnit(unitA, unitA.classList.contains("player") ? "player" : "enemy", unitA.parentElement);
  if (hpB > 0) animateUnit(unitB, unitB.classList.contains("player") ? "player" : "enemy", unitB.parentElement);
}

// Gera tropa inimiga aleatória
function randomUnit() {
  const keys = Object.keys(unitsData);
  return keys[Math.floor(Math.random() * keys.length)];
}
