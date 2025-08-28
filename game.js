const unitsData = {
  soldier: { emoji: "🗡️", speed: 2, hp: 5, attack: 1 },
  archer:  { emoji: "🏹", speed: 3, hp: 3, attack: 1 },
  tank:    { emoji: "🛡️", speed: 1, hp: 10, attack: 2 },
  mage:    { emoji: "🔥", speed: 2.5, hp: 3, attack: 2 }
};

let arena = document.getElementById("arena");

// Função para arrastar as cartas
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("unit", event.target.dataset.unit);
    event.dataTransfer.setData("cost", event.target.dataset.cost);
  });
});

// Função para soltar as tropas na arena
arena.addEventListener("dragover", (event) => {
  event.preventDefault();
});

arena.addEventListener("drop", (event) => {
  event.preventDefault();
  const unitType = event.dataTransfer.getData("unit");
  const cost = parseInt(event.dataTransfer.getData("cost"));

  // Se tiver mana suficiente, coloca a tropa
  if (mana >= cost) {
    const unit = spawnUnit(unitType, "player");
    mana -= cost;
    updateManaDisplay();
  } else {
    alert("Mana insuficiente!");
  }
});

// Função para criar uma unidade (tropa)
function spawnUnit(type, side) {
  const unit = document.createElement("div");
  unit.classList.add("unit", side);
  unit.textContent = unitsData[type].emoji;

  unit.dataset.hp = unitsData[type].hp;
  unit.dataset.speed = unitsData[type].speed;
  unit.dataset.attack = unitsData[type].attack;
  unit.dataset.type = type;
  unit.dataset.side = side;

  // Randomiza a posição inicial na arena (só no eixo X)
  const xPos = Math.random() * (arena.clientWidth - 50);
  unit.style.left = `${xPos}px`;
  unit.style.top = `${side === "player" ? arena.clientHeight - 50 : 0}px`;

  arena.appendChild(unit);
  moveUnit(unit, side);
  return unit;
}

// Função para mover a unidade
function moveUnit(unit, side) {
  const target = side === "player" ? 0 : arena.clientHeight - 50;
  const direction = side === "player" ? -1 : 1;

  const moveInterval = setInterval(() => {
    const currentTop = parseFloat(unit.style.top);
    if ((side === "player" && currentTop <= target) || (side === "enemy" && currentTop >= target)) {
      clearInterval(moveInterval);
    } else {
      unit.style.top = `${currentTop + direction * unitsData[unit.dataset.type].speed}px`;
    }
  }, 30);
}

// Função para atualizar a mana
let mana = 10;
const manaDisplay = document.getElementById("mana-count");

function updateManaDisplay() {
  manaDisplay.textContent = mana;
}

// Atualiza a mana a cada segundo
setInterval(() => {
  if (mana < 10) {
    mana++;
    updateManaDisplay();
  }
}, 1000);
