// js/game.js — Controlador principal del ciclo diario y configuración de Phaser 3

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 500,
  parent: "phaser-container",
  scene: [MainScene, MinigameMoxie]
};

const phaserGame = new Phaser.Game(config);

// Referencias a elementos del DOM
const startScreen = document.getElementById("start-screen");
const decisionPanel = document.getElementById("decision-panel");
const resultPanel = document.getElementById("result-panel");

// Carga un Sol en la interfaz
function loadCurrentSol() {
  GameState.updateHUD();

  // Buscamos los datos del Sol actual (o repetimos plantilla si pasa del Sol 2 en este prototipo)
  const dayData = MISSION_DAYS.find(d => d.sol === GameState.sol) || MISSION_DAYS[0];

  document.getElementById("comm-text").textContent = dayData.comm;
  document.getElementById("event-phase").textContent = dayData.phase;
  document.getElementById("event-title").textContent = dayData.title;
  document.getElementById("event-desc").textContent = dayData.description;

  const choicesContainer = document.getElementById("choices-container");
  choicesContainer.innerHTML = "";

  dayData.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerHTML = `
      <strong>${choice.label}</strong>
      <span class="choice-cost">${choice.costText}</span>
    `;
    btn.onclick = () => handleChoiceSelection(choice);
    choicesContainer.appendChild(btn);
  });

  resultPanel.classList.add("hidden");
  decisionPanel.classList.remove("hidden");
}

// Al pulsar una decisión
function handleChoiceSelection(choice) {
  // 1. Descontamos el coste inmediato de la acción
  GameState.modifyResources(choice.cost);
  decisionPanel.classList.add("hidden");

  // 2. Si tiene minijuego asociado, lo lanzamos en Phaser 3
  if (choice.minigame) {
    phaserGame.scene.pause("MainScene");
    phaserGame.scene.start(choice.minigame, { choice });
  } else {
    // Si es una decisión directa sin minijuego, mostramos resultado
    window.onMinigameComplete(true, choice);
  }
}

// Callback global que se ejecuta al terminar el minijuego
window.onMinigameComplete = function (success, choice) {
  const reward = success ? choice.successReward : choice.failReward;
  GameState.modifyResources(reward);

  document.getElementById("result-title").textContent = success
    ? "✅ ¡OPERACIÓN COMPLETADA CON ÉXITO!"
    : "⚠️ OPERACIÓN PARCIAL (SISTEMA DE RESERVA)";

  document.getElementById("result-desc").textContent = success
    ? "Has estabilizado el sistema a la perfección y los tanques del refugio han recibido el máximo suministro."
    : "No alcanzaste el rendimiento óptimo a tiempo, pero ROVI logró rescatar una parte de los recursos.";

  document.getElementById("nasa-fact").textContent = choice.nasaFact;
  resultPanel.classList.remove("hidden");
};

// Botón para dormir y pasar al siguiente Sol
document.getElementById("btn-next-sol").onclick = () => {
  GameState.advanceSol();

  const failureReason = GameState.checkFailure();
  if (failureReason) {
    alert(`🛑 MODO HIBERNACIÓN ACTIVADO\n\n${failureReason}\n\nSe reiniciará la simulación en el Sol 1.`);
    GameState.reset();
    loadCurrentSol();
    return;
  }

  if (GameState.sol > 15) {
    alert("🏆 ¡MISIÓN CUMPLIDA! Has sobrevivido los 15 Soles y despegado en el MAV.");
    GameState.reset();
  }

  loadCurrentSol();
};

// Botones de la pantalla inicial
document.getElementById("btn-new-game").onclick = () => {
  if (!GameState.load()) {
    GameState.reset();
  }
  startScreen.classList.add("hidden");
  loadCurrentSol();
};

document.getElementById("btn-Reset-save").onclick = () => {
  GameState.reset();
  alert("Partida reiniciada al Sol 1.");
};