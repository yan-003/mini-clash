let mana = 0;
const maxMana = 10;
const manaDisplay = document.getElementById("mana-count");
const battlefield = document.getElementById("battlefield");

setInterval(() => {
  if (mana < maxMana) {
    mana++;
    manaDisplay.textContent = mana;
  }
}, 1000); // Ganha 1 mana por segundo

document.querySelectorAll(".card").forEach(button => {
  button.addEventListener("click", () => {
    const cost = parseInt(button.dataset.cost);
    const unitType = button.dataset.unit;

    if (mana >= cost) {
      mana -= cost;
      manaDisplay.textContent = mana;
      spawnUnit(unitType);
    } else {
      alert("Mana insuficiente!");
    }
  });
});

function spawnUnit(type) {
  const unit = document.createElement("div");
  unit.classList.add("unit");
  unit.textContent = getEmoji(type);
  unit.style.left = "0px";
  battlefield.appendChild(unit);

  let position = 0;
  const move = setInterval(() => {
    if (position >= battlefield.offsetWidth - 40) {
      clearInterval(move);
      unit.remove();
      // Aqui podemos adicionar dano à torre inimiga depois
    } else {
      position += 2;
      unit.style.left = `${position}px`;
    }
  }, 30);
}

function getEmoji(type) {
  switch (type) {
    case "soldier": return "🗡️";
    case "archer": return "🏹";
    case "tank": return "🛡️";
    case "mage": return "🔥";
    default: return "❓";
  }
}
