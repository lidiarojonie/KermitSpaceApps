// js/game.js — Controlador final con NASA Pedia, Eventos Aleatorios y Medallas

const scenesList = [];
if (typeof MainScene !== "undefined") scenesList.push(MainScene);
if (typeof MinigameMoxie !== "undefined") scenesList.push(MinigameMoxie);
if (typeof MinigameDrill !== "undefined") scenesList.push(MinigameDrill);
if (typeof MinigameSolar !== "undefined") scenesList.push(MinigameSolar);
if (typeof MinigameBiodome !== "undefined") scenesList.push(MinigameBiodome);
if (typeof MinigameShield !== "undefined") scenesList.push(MinigameShield);

let phaserGame = null;
if (typeof Phaser !== "undefined") {
  phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    width: 900,
    height: 500,
    parent: "phaser-container",
    scene: scenesList
  });
}

// Eventos aleatorios basados en fenómenos reales de Marte y NASA
const RANDOM_EVENTS = [
  {
    text: "🌪️ EVENTO NASA: ¡Un remolino 'Dust Devil' ha barrido el polvo de tus placas solares! (+15 ⚡ Energía)",
    changes: { energy: 15 }
  },
  {
    text: "🧊 HALLAZGO MRO: La broca encontró una lente de hielo subsuperficial purísimo (+15 💧 Agua)",
    changes: { water: 15 }
  },
  {
    text: "🌱 BIODOMO OSDR: ¡Brote acelerado de espirulina bajo luz LED roja! (+15 🌱 Comida y +5 🫧 Oxígeno)",
    changes: { food: 15, oxygen: 5 }
  },
  {
    text: "☀️ VIENTO SOLAR DONKI: Pequeña ráfaga de protones solares absorbida por el escudo (-5% 🛡️ Escudo, +10 ⚡ Energía)",
    changes: { shield: -5, energy: 10 }
  }
];

// Referencias DOM
const startScreen = document.getElementById("start-screen");
const decisionPanel = document.getElementById("decision-panel");
const resultPanel = document.getElementById("result-panel");
const pediaModal = document.getElementById("nasapedia-modal");
const endModal = document.getElementById("end-modal");
const randomBanner = document.getElementById("random-event-banner");

// Ilumina las barras de recursos afectadas al pasar el ratón por una opción
function highlightResources(cost = {}, reward = {}, active = true) {
  const keys = ["water", "oxygen", "energy", "food"];
  keys.forEach(k => {
    const box = document.getElementById(`box-${k}`);
    if (!box) return;
    box.classList.remove("res-highlight-cost", "res-highlight-gain");
    if (!active) return;

    if (cost[k] && cost[k] < 0) {
      box.classList.add("res-highlight-cost");
    } else if (reward[k] && reward[k] > 0) {
      box.classList.add("res-highlight-gain");
    }
  });
}

// Carga un Sol en la interfaz
function loadCurrentSol() {
  GameState.updateHUD();

  // Eventos aleatorios en los Soles 3, 6, 9 y 13
  if ([3, 6, 9, 13].includes(GameState.sol)) {
    const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    GameState.modifyResources(ev.changes);
    randomBanner.textContent = ev.text;
    randomBanner.classList.remove("hidden");
  } else {
    randomBanner.classList.add("hidden");
  }

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
    btn.onmouseenter = () => highlightResources(choice.cost, choice.successReward, true);
    btn.onmouseleave = () => highlightResources({}, {}, false);
    btn.onclick = () => {
      highlightResources({}, {}, false);
      handleChoiceSelection(choice);
    };
    choicesContainer.appendChild(btn);
  });

  resultPanel.classList.add("hidden");
  decisionPanel.classList.remove("hidden");
}

function handleChoiceSelection(choice) {
  GameState.modifyResources(choice.cost || {});
  decisionPanel.classList.add("hidden");

  const hasMinigameScene =
    choice.minigame &&
    phaserGame &&
    phaserGame.scene &&
    phaserGame.scene.getScene(choice.minigame);

  if (hasMinigameScene) {
    phaserGame.scene.pause("MainScene");
    phaserGame.scene.start(choice.minigame, { choice });
  } else {
    window.onMinigameComplete(true, choice);
  }
}

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

// Mostrar modal de Fin de Partida (Victoria o Hibernación)
function showEndScreen(isVictory, reasonText) {
  document.getElementById("end-badge").textContent = isVictory
    ? "MISIÓN ARES-VII COMPLETADA"
    : "PROTOCOLO DE PROTECCIÓN DE TRIPULACIÓN";

  document.getElementById("end-title").textContent = isVictory
    ? "🚀 ¡DESPEGUE EXITOSO EN EL MAV!"
    : "🛑 MODO HIBERNACIÓN ACTIVADO";

  document.getElementById("end-desc").textContent = reasonText;

  const medalBox = document.getElementById("end-medal-box");
  if (isVictory) {
    const avg = Math.round((GameState.water + GameState.oxygen + GameState.energy + GameState.food) / 4);
    let medal = "🥉 INSIGNIA SUPERVIVIENTE AL LÍMITE (Bronce)";
    if (avg >= 45 && GameState.shield >= 70) {
      medal = "🥇 INSIGNIA COMANDANTE DE MARTE (Oro)";
    } else if (avg >= 25) {
      medal = "🥈 INSIGNIA INGENIERO/A ESPACIAL (Plata)";
    }
    medalBox.innerHTML = `<strong>${medal}</strong><p>Media final de recursos vitales: ${avg}% | Escudo del hábitat: ${GameState.shield}%</p>`;
  } else {
    medalBox.innerHTML = `<strong>💡 CONSEJO DE INGENIERÍA NASA:</strong><p>Recuerda que la Energía alimenta al reactor MOXIE (Oxígeno) y la perforadora (Agua). No dejes que ninguna barra baje del 15% antes de dormir.</p>`;
  }

  endModal.classList.remove("hidden");
}

// Pasar al siguiente Sol
document.getElementById("btn-next-sol").onclick = () => {
  GameState.advanceSol();

  const failureReason = GameState.checkFailure();
  if (failureReason) {
    showEndScreen(false, `${failureReason} ROVI ha tomado el control autónomo del Outpost Beta en el Sol ${GameState.sol}.`);
    return;
  }

  if (GameState.sol > 15) {
    if (GameState.mav >= 3) {
      showEndScreen(true, "¡Has sobrevivido los 15 Soles en Arcadia Planitia, cargado las 3 etapas del cohete MAV y despegado junto a ROVI justo antes de la megatormenta de polvo!");
    } else {
      showEndScreen(false, "Has sobrevivido hasta el Sol 15, pero el cohete MAV no alcanzó las 3 fases de carga necesarias para despegar antes de la tormenta.");
    }
    return;
  }

  loadCurrentSol();
};

// Botones de control y NASA Pedia
document.getElementById("btn-new-game").onclick = () => {
  if (!GameState.load()) GameState.reset();
  startScreen.classList.add("hidden");
  loadCurrentSol();
};

document.getElementById("btn-Reset-save").onclick = () => {
  GameState.reset();
};

document.getElementById("btn-restart-end").onclick = () => {
  GameState.reset();
  endModal.classList.add("hidden");
  loadCurrentSol();
};

document.getElementById("btn-open-pedia").onclick = () => {
  pediaModal.classList.remove("hidden");
};

document.getElementById("btn-close-pedia").onclick = () => {
  pediaModal.classList.add("hidden");
};