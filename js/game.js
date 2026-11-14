// js/game.js — Controlador principal completo y blindado

// 1. Construimos la lista de escenas verificando que existan para evitar bloqueos
const scenesList = [];

if (typeof MainScene !== "undefined") scenesList.push(MainScene);
if (typeof MinigameMoxie !== "undefined") scenesList.push(MinigameMoxie);
if (typeof MinigameDrill !== "undefined") scenesList.push(MinigameDrill);
if (typeof MinigameSolar !== "undefined") scenesList.push(MinigameSolar);
if (typeof MinigameBiodome !== "undefined") scenesList.push(MinigameBiodome);
if (typeof MinigameShield !== "undefined") scenesList.push(MinigameShield);

// 2. Inicializamos Phaser 3
let phaserGame = null;
if (typeof Phaser !== "undefined") {
  const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 500,
    parent: "phaser-container",
    scene: scenesList
  };
  phaserGame = new Phaser.Game(config);
} else {
  console.error("Error: Phaser 3 no se ha podido cargar desde el CDN.");
}

// 3. Referencias a elementos del DOM
const startScreen = document.getElementById("start-screen");
const decisionPanel = document.getElementById("decision-panel");
const resultPanel = document.getElementById("result-panel");
const btnNewGame = document.getElementById("btn-new-game");
const btnResetSave = document.getElementById("btn-Reset-save");
const btnNextSol = document.getElementById("btn-next-sol");

// 4. Carga un Sol en la interfaz
function loadCurrentSol() {
  if (typeof GameState === "undefined" || typeof MISSION_DAYS === "undefined") {
    alert("Error de carga: Revisa que js/data.js y js/state.js estén guardados y enlazados en index.html.");
    return;
  }

  GameState.updateHUD();

  // Buscamos los datos del Sol actual (o usamos el último disponible si supera la lista)
  const dayData = MISSION_DAYS.find(d => d.sol === GameState.sol) || MISSION_DAYS[MISSION_DAYS.length - 1];

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

// 5. Al pulsar una opción de decisión
function handleChoiceSelection(choice) {
  // Descontamos el coste inmediato de la acción
  GameState.modifyResources(choice.cost || {});
  decisionPanel.classList.add("hidden");

  // Comprobamos si la opción tiene minijuego y si la escena está registrada en Phaser
  const hasMinigameScene =
    choice.minigame &&
    phaserGame &&
    phaserGame.scene &&
    phaserGame.scene.getScene(choice.minigame);

  if (hasMinigameScene) {
    phaserGame.scene.pause("MainScene");
    phaserGame.scene.start(choice.minigame, { choice });
  } else {
    // Si no tiene minijuego (o aún no está cargado minigamesPack.js), resolvemos directamente
    window.onMinigameComplete(true, choice);
  }
}

// 6. Callback global que se ejecuta al terminar cualquier minijuego
window.onMinigameComplete = function (success, choice) {
  const reward = success ? (choice.successReward || {}) : (choice.failReward || {});
  GameState.modifyResources(reward);

  document.getElementById("result-title").textContent = success
    ? "✅ ¡OPERACIÓN COMPLETADA CON ÉXITO!"
    : "⚠️ OPERACIÓN PARCIAL (SISTEMA DE RESERVA)";

  document.getElementById("result-desc").textContent = success
    ? "Has estabilizado el sistema y los tanques del refugio han recibido el suministro completo."
    : "No alcanzaste el rendimiento óptimo a tiempo, pero ROVI logró rescatar una parte de los recursos.";

  document.getElementById("nasa-fact").textContent = choice.nasaFact || "";
  resultPanel.classList.remove("hidden");
};

// 7. Botón para dormir y pasar al siguiente Sol
if (btnNextSol) {
  btnNextSol.onclick = () => {
    GameState.advanceSol();

    const failureReason = GameState.checkFailure();
    if (failureReason) {
      alert(`🛑 MODO HIBERNACIÓN ACTIVADO\n\n${failureReason}\n\nSe reiniciará la simulación en el Sol 1.`);
      GameState.reset();
      loadCurrentSol();
      return;
    }

    if (GameState.sol > 15) {
      if (GameState.mav >= 3) {
        alert("🏆 ¡MISIÓN CUMPLIDA! Has sobrevivido los 15 Soles y despegado hacia la órbita marciana en el MAV.");
      } else {
        alert("⚠️ FIN DEL SOL 15: Has sobrevivido en el hábitat, pero el cohete MAV no completó sus 3 fases de carga antes de la tormenta.");
      }
      GameState.reset();
    }

    loadCurrentSol();
  };
}

// 8. Botones de la pantalla inicial
if (btnNewGame) {
  btnNewGame.onclick = () => {
    if (typeof GameState !== "undefined") {
      if (!GameState.load()) {
        GameState.reset();
      }
    }
    startScreen.classList.add("hidden");
    loadCurrentSol();
  };
}

if (btnResetSave) {
  btnResetSave.onclick = () => {
    if (typeof GameState !== "undefined") {
      GameState.reset();
      alert("Partida reiniciada al Sol 1.");
    }
  };
}