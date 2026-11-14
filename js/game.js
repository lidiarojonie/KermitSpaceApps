// js/game.js — Controlador principal del juego con soporte dual 2D/3D, Píldoras Educativas y NASA Pedia

// 1. Registro de todas las escenas de Phaser 3 (2D)
const scenesList = [];
if (typeof MainScene !== "undefined") scenesList.push(MainScene);
if (typeof MinigameMoxie !== "undefined") scenesList.push(MinigameMoxie);
if (typeof MinigameDrill !== "undefined") scenesList.push(MinigameDrill);
if (typeof MinigameSolar !== "undefined") scenesList.push(MinigameSolar);
if (typeof MinigameBiodome !== "undefined") scenesList.push(MinigameBiodome);
if (typeof MinigameShield !== "undefined") scenesList.push(MinigameShield);
if (typeof MinigameWaterFilter !== "undefined") scenesList.push(MinigameWaterFilter);
if (typeof MinigameLeakRepair !== "undefined") scenesList.push(MinigameLeakRepair);
if (typeof MinigameCircuit !== "undefined") scenesList.push(MinigameCircuit);
if (typeof MinigameRoverDrive !== "undefined") scenesList.push(MinigameRoverDrive);

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

// 2. Eventos aleatorios positivos de exploración marciana
const RANDOM_EVENTS = [
  {
    text: "🌪️ FENÓMENO DUST DEVIL: ¡Un remolino marciano ha limpiado el polvo de los paneles solares! (+18 ⚡ Energía)",
    changes: { energy: 18 },
    pillId: "dust_devils"
  },
  {
    text: "🧊 RADAR SHARAD: La sonda orbital detectó una bolsa de hielo puro cerca de la superficie (+18 💧 Agua)",
    changes: { water: 18 },
    pillId: "water_mars"
  },
  {
    text: "🌱 BROTE ACELERADO OSDR: ¡Crecimiento extra de microgreens bajo luces LED rosas! (+16 🌱 Comida y +6 🫧 Oxígeno)",
    changes: { food: 16, oxygen: 6 },
    pillId: "biodome_osdr"
  },
  {
    text: "☀️ FLUJO SOLAR DONKI: Las partículas solares fueron absorbidas por las baterías del hábitat (+14 ⚡ Energía, +5% 🛡️ Escudo)",
    changes: { energy: 14, shield: 5 },
    pillId: "radiation_donki"
  }
];

// 3. Referencias DOM
const startScreen = document.getElementById("start-screen");
const decisionPanel = document.getElementById("decision-panel");
const resultPanel = document.getElementById("result-panel");
const briefingModal = document.getElementById("briefing-modal");
const pediaModal = document.getElementById("nasapedia-modal");
const endModal = document.getElementById("end-modal");
const randomBanner = document.getElementById("random-event-banner");
const roviMsg = document.getElementById("rovi-msg");
const soundBtn = document.getElementById("btn-toggle-sound");
const toggleViewBtn = document.getElementById("btn-toggle-view");
const diaryBtn = document.getElementById("btn-open-diary");
const closeDiaryBtn = document.getElementById("btn-close-diary");
const closeDiscoveryBtn = document.getElementById("btn-close-discovery");

let pendingMinigameChoice = null;
let currentViewMode = "2d"; // '2d' o '3d'

// 4. Sistema de efectos visuales flotantes de recursos (+25, -4, etc.)
window.showFloatingDeltas = function (diffs) {
  const container = document.getElementById("floating-indicators");
  if (!container) return;

  const labels = {
    water: { icon: "💧", box: "box-water" },
    oxygen: { icon: "🫧", box: "box-oxygen" },
    energy: { icon: "⚡", box: "box-energy" },
    food: { icon: "🌱", box: "box-food" },
    shield: { icon: "🛡️", box: null },
    mav: { icon: "🚀 MAV", box: null }
  };

  Object.keys(diffs).forEach(key => {
    const val = diffs[key];
    if (val === 0 || !val) return;

    const floater = document.createElement("div");
    floater.className = `floating-delta ${val > 0 ? "gain" : "cost"}`;
    const sign = val > 0 ? "+" : "";
    const info = labels[key] || { icon: key };
    floater.textContent = `${sign}${val} ${info.icon}`;

    if (info.box) {
      const boxEl = document.getElementById(info.box);
      if (boxEl) {
        const rect = boxEl.getBoundingClientRect();
        floater.style.left = `${rect.left + rect.width / 2}px`;
        floater.style.top = `${rect.top - 10}px`;
      }
    } else {
      floater.style.left = "50%";
      floater.style.top = "70px";
    }

    container.appendChild(floater);
    setTimeout(() => floater.remove(), 1800);
  });
};

// 5. Ilumina las barras de recursos afectadas al pasar el ratón por una opción
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

// 6. Asistente ROVI: genera consejos inteligentes y dinámicos para los niños
function updateRoviAdvice() {
  if (GameState.contingencyAlert) {
    roviMsg.innerHTML = `<strong>${GameState.contingencyAlert}</strong>`;
    return;
  }

  const critical = GameState.getCriticalResources();
  if (critical.length > 0) {
    const first = critical[0];
    roviMsg.innerHTML = `⚠️ <strong>¡ALERTA ROVI!</strong> El nivel de <strong>${first.name}</strong> está bajo (${GameState[first.key]}%). ¡Elige una opción que recupere ${first.name} hoy!`;
    return;
  }

  if (currentViewMode === "3d") {
    roviMsg.textContent = "🤖 ROVI: ¡Modo 3D activo! Camina con [W,A,S,D] o [Flechas] hacia las estaciones y pulsa [E] para interactuar.";
    return;
  }

  if (GameState.sol <= 3) {
    roviMsg.textContent = "🤖 ROVI: Fase de Emergencia. Estabiliza el hábitat reparando paneles solares y asegurando agua y oxígeno.";
  } else if (GameState.sol <= 7) {
    roviMsg.textContent = "🤖 ROVI: Fase de Reconstrucción. Cultiva en el biodomo para cosechar alimentos y mantén el escudo activo ante tormentas solares.";
  } else if (GameState.sol <= 11) {
    roviMsg.textContent = "🤖 ROVI: Fase de Recursos. Acumula reservas de agua pura y oxígeno para cuando comencemos a cargar el cohete MAV.";
  } else {
    roviMsg.textContent = `🤖 ROVI: ¡Fase de Despegue! El cohete MAV está al ${GameState.mav}/3 de preparación. ¡Prioriza las etapas del cohete!`;
  }
}

// 7. Actualiza visualmente el indicador de las 3 fases del cohete MAV
window.updateMavVisuals = function (mavVal) {
  const stepsEl = document.getElementById("mav-step-icons");
  if (!stepsEl) return;
  const icons = ["⚪", "⚪", "⚪"];
  for (let i = 0; i < mavVal; i++) {
    icons[i] = "🟢";
  }
  stepsEl.textContent = icons.join("");
};

// 8. Carga el Sol actual en la interfaz
function loadCurrentSol() {
  GameState.updateHUD();

  // Desbloqueo progresivo de curiosidades científicas en hitos clave
  if (typeof DiscoverySystem !== "undefined") {
    if (GameState.sol === 1) DiscoverySystem.unlock("solar_power", false);
    if (GameState.sol === 3) DiscoverySystem.unlock("mars_gravity", true);
    if (GameState.sol === 6) DiscoverySystem.unlock("dust_devils", false);
    if (GameState.sol === 10) DiscoverySystem.unlock("mars_cold", true);
    if (GameState.sol === 12) DiscoverySystem.unlock("earth_comms", true);
  }

  // Actualizar etiqueta de fase en el HUD
  const phaseTag = document.getElementById("sol-phase-tag");
  if (phaseTag) {
    if (GameState.sol <= 3) phaseTag.textContent = "FASE 1: EMERGENCIA";
    else if (GameState.sol <= 7) phaseTag.textContent = "FASE 2: RECONSTRUCCIÓN";
    else if (GameState.sol <= 11) phaseTag.textContent = "FASE 3: RECURSOS";
    else phaseTag.textContent = "FASE 4: DESPEGUE MAV";
  }

  // Eventos aleatorios positivos en Soles seleccionados
  if ([3, 6, 9, 13].includes(GameState.sol)) {
    const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    GameState.modifyResources(ev.changes, true);
    randomBanner.textContent = ev.text;
    randomBanner.classList.remove("hidden");
    if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
    if (ev.pillId && typeof DiscoverySystem !== "undefined") {
      DiscoverySystem.unlock(ev.pillId, true);
    }
  } else {
    randomBanner.classList.add("hidden");
  }

  updateRoviAdvice();

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
      if (typeof SoundFx !== "undefined") SoundFx.playClick();
      handleChoiceSelection(choice);
    };
    choicesContainer.appendChild(btn);
  });

  resultPanel.classList.add("hidden");
  if (currentViewMode === "2d") {
    decisionPanel.classList.remove("hidden");
  }
}

// 9. Manejo de la decisión elegida (abre briefing si hay minijuego o resuelve de inmediato)
function handleChoiceSelection(choice) {
  const hasMinigameScene =
    choice.minigame &&
    phaserGame &&
    phaserGame.scene &&
    phaserGame.scene.getScene(choice.minigame);

  if (hasMinigameScene) {
    pendingMinigameChoice = choice;
    showMinigameBriefing(choice);
  } else {
    GameState.modifyResources(choice.cost || {}, true);
    decisionPanel.classList.add("hidden");
    window.onMinigameComplete({ tier: "good", score: 100, minigameName: "Operación de Base" }, choice);
  }
}

// 10. Muestra el modal de Briefing con objetivos claros antes de jugar
function showMinigameBriefing(choice) {
  document.getElementById("brief-title").textContent = choice.minigameTitle || "Preparación de la Operación";
  document.getElementById("brief-desc").textContent = choice.minigameBrief || choice.description || "Cumple el objetivo técnico para abastecer el refugio.";

  const controlsText = getMinigameControlsHelp(choice.minigame);
  document.getElementById("brief-controls").textContent = controlsText;

  briefingModal.classList.remove("hidden");
}

function getMinigameControlsHelp(minigameKey) {
  switch (minigameKey) {
    case "MinigameMoxie":
      return "Mantén pulsado la BARRA ESPACIADORA o haz CLIC en el botón para mantener la aguja en la zona verde de 800 °C.";
    case "MinigameDrill":
      return "Mueve el RATÓN o las FLECHAS IZQUIERDA/DERECHA para recoger cristales de hielo azul y esquivar las rocas rojizas.";
    case "MinigameSolar":
      return "Haz CLIC rápido sobre todas las manchas de polvo marciano para limpiarlas y pulsa el interruptor de reconexión.";
    case "MinigameBiodome":
      return "Haz CLIC en el botón 'REGAR + LUZ' de cada bandeja para mantener su vitalidad por encima del 25% hasta cosechar.";
    case "MinigameShield":
      return "Mueve el RATÓN para desplazar el deflector magnético e interceptar las partículas de radiación solar.";
    case "MinigameWaterFilter":
      return "Haz CLIC en los 3 filtros en orden (Filtro 1 -> Filtro 2 -> Filtro 3) para completar la depuración de percloratos.";
    case "MinigameLeakRepair":
      return "Haz CLIC en las 5 fugas de aire marcadas en la cabina para sellarlas con espuma antes de perder presión.";
    case "MinigameCircuit":
      return "Haz CLIC en cada uno de los 4 relés de circuito para rotarlos y alinear el flujo de corriente eléctrica.";
    case "MinigameRoverDrive":
      return "Conduce el rover con las FLECHAS del teclado o [W,A,S,D] para desplegar 4 balizas científicas esquivando cráteres.";
    default:
      return "Usa el ratón o teclado para cumplir el objetivo del minijuego.";
  }
}

// 11. Inicio del minijuego tras confirmar en el Briefing
document.getElementById("btn-start-minigame").onclick = () => {
  if (!pendingMinigameChoice) return;
  briefingModal.classList.add("hidden");
  decisionPanel.classList.add("hidden");

  if (typeof SoundFx !== "undefined") SoundFx.playClick();

  // Si estábamos en 3D, ocultamos temporalmente el canvas 3D y mostramos Phaser para el minijuego
  if (currentViewMode === "3d") {
    if (typeof Scene3D !== "undefined") Scene3D.stop();
    document.getElementById("threejs-container").classList.add("hidden");
    const hud3d = document.getElementById("hud-3d-controls");
    if (hud3d) hud3d.classList.add("hidden");
    document.getElementById("phaser-container").classList.remove("hidden");
  }

  // Descontar coste de la acción
  GameState.modifyResources(pendingMinigameChoice.cost || {}, true);

  phaserGame.scene.pause("MainScene");
  phaserGame.scene.start(pendingMinigameChoice.minigame, { choice: pendingMinigameChoice });
};

document.getElementById("btn-cancel-briefing").onclick = () => {
  briefingModal.classList.add("hidden");
  pendingMinigameChoice = null;
  if (typeof SoundFx !== "undefined") SoundFx.playClick();
};

// 12. Finalización y evaluación escalonada del minijuego (Excelente, Bien, Regular, Fallo)
window.onMinigameComplete = function (result, choice) {
  let tier = "good";
  let score = 100;
  let minigameName = "Operación Técnica";

  if (typeof result === "object" && result !== null) {
    tier = result.tier || "good";
    score = result.score || 100;
    minigameName = result.minigameName || minigameName;
  } else if (typeof result === "boolean") {
    tier = result ? "good" : "fail";
  }

  // Si estábamos en modo 3D, restauramos la vista 3D tras el minijuego
  if (currentViewMode === "3d") {
    document.getElementById("phaser-container").classList.add("hidden");
    document.getElementById("threejs-container").classList.remove("hidden");
    const hud3d = document.getElementById("hud-3d-controls");
    if (hud3d) hud3d.classList.remove("hidden");
    if (typeof Scene3D !== "undefined") Scene3D.start();
  }

  // Cálculo de recompensas escalonadas según rendimiento
  const finalReward = {};
  const baseReward = choice.successReward || {};
  const failReward = choice.failReward || {};

  if (tier === "excellent") {
    Object.keys(baseReward).forEach(k => {
      finalReward[k] = k === "mav" ? baseReward[k] : baseReward[k] + 4;
    });
    if (typeof SoundFx !== "undefined") SoundFx.playSuccess();
  } else if (tier === "good") {
    Object.assign(finalReward, baseReward);
    if (typeof SoundFx !== "undefined") SoundFx.playSuccess();
  } else if (tier === "fair") {
    Object.keys(baseReward).forEach(k => {
      finalReward[k] = k === "mav" ? baseReward[k] : Math.max(10, Math.round(baseReward[k] * 0.65));
    });
    if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
  } else {
    Object.assign(finalReward, failReward);
    if (typeof SoundFx !== "undefined") SoundFx.playAlert();
  }

  // Desbloqueo de píldoras educativas según el minijuego jugado
  if (typeof DiscoverySystem !== "undefined") {
    if (choice.minigame === "MinigameMoxie") DiscoverySystem.unlock("moxie_oxygen", true);
    if (choice.minigame === "MinigameDrill") DiscoverySystem.unlock("water_mars", true);
    if (choice.minigame === "MinigameSolar") DiscoverySystem.unlock("solar_power", true);
    if (choice.minigame === "MinigameBiodome") DiscoverySystem.unlock("biodome_osdr", true);
    if (choice.minigame === "MinigameShield") DiscoverySystem.unlock("radiation_donki", true);
    if (choice.minigame === "MinigameWaterFilter") DiscoverySystem.unlock("water_mars", true);
    if (choice.minigame === "MinigameCircuit") DiscoverySystem.unlock("solar_power", true);
    if (choice.minigame === "MinigameRoverDrive") DiscoverySystem.unlock("rovers_exploration", true);
  }

  // Aplicar recompensa al estado
  GameState.modifyResources(finalReward, true);

  // Generar resumen visual de recursos ganados
  const breakdownEl = document.getElementById("result-breakdown");
  breakdownEl.innerHTML = "";
  const icons = { water: "💧 Agua", oxygen: "🫧 Oxígeno", energy: "⚡ Energía", food: "🌱 Comida", shield: "🛡️ Escudo", mav: "🚀 MAV" };

  Object.keys(finalReward).forEach(k => {
    const val = finalReward[k];
    if (val > 0) {
      const pill = document.createElement("span");
      pill.className = "resource-gain-pill";
      pill.textContent = `+${val} ${icons[k] || k}`;
      breakdownEl.appendChild(pill);
    }
  });

  const starsEl = document.getElementById("result-stars");
  const titleEl = document.getElementById("result-title");
  const descEl = document.getElementById("result-desc");

  if (tier === "excellent") {
    starsEl.textContent = "⭐⭐⭐ ¡EXCELENTE!";
    titleEl.textContent = "¡RENDIMIENTO CIENTÍFICO ÓPTIMO!";
    descEl.textContent = `¡Has completado la operación con maestría! Los tanques del Outpost Beta han recibido la máxima dotación de recursos con bonus de eficiencia.`;
  } else if (tier === "good") {
    starsEl.textContent = "⭐⭐ ¡MUY BIEN!";
    titleEl.textContent = "OPERACIÓN COMPLETADA CON ÉXITO";
    descEl.textContent = `Has estabilizado el sistema correctamente y los recursos previstos se han transferido a la base.`;
  } else if (tier === "fair") {
    starsEl.textContent = "⭐ REGULAR";
    titleEl.textContent = "OPERACIÓN PARCIAL";
    descEl.textContent = `Completaste parte de la tarea. Se ha recuperado un suministro parcial para asegurar la misión.`;
  } else {
    starsEl.textContent = "⚠️ RESCATE POR ROVI";
    titleEl.textContent = "SISTEMA DE ASISTENCIA ACTIVADO";
    descEl.textContent = `No se alcanzó el objetivo a tiempo, pero el rover ROVI desplegó el protocolo de reserva y rescató suministros de emergencia.`;
  }

  document.getElementById("nasa-fact").textContent = choice.nasaFact || "";
  resultPanel.classList.remove("hidden");
};

// 13. Mostrar pantalla final (Victoria o Hibernación)
function showEndScreen(isVictory, reasonText) {
  document.getElementById("end-badge").textContent = isVictory
    ? "MISIÓN ARES-VII COMPLETADA"
    : "PROTOCOLO DE CONTINGENCIA DE TRIPULACIÓN";

  document.getElementById("end-title").textContent = isVictory
    ? "🚀 ¡DESPEGUE EXITOSO HACIA LA ÓRBITA!"
    : "🛑 MODO HIBERNACIÓN ACTIVADO";

  document.getElementById("end-desc").textContent = reasonText;

  const medalBox = document.getElementById("end-medal-box");
  if (isVictory) {
    if (typeof SoundFx !== "undefined") SoundFx.playRocketLaunch();
    const avg = Math.round((GameState.water + GameState.oxygen + GameState.energy + GameState.food) / 4);
    let medal = "🥉 INSIGNIA SUPERVIVIENTE AL LÍMITE (Bronce)";
    let desc = "¡Has logrado escapar a tiempo antes de la tormenta!";

    if (avg >= 50 && GameState.shield >= 70) {
      medal = "🥇 INSIGNIA COMANDANTE DE MARTE (Oro)";
      desc = "¡Gestión perfecta digna de una misión oficial de la NASA!";
    } else if (avg >= 30) {
      medal = "🥈 INSIGNIA INGENIERO/A ESPACIAL (Plata)";
      desc = "¡Gran trabajo de reparación y equilibrio de soporte vital!";
    }

    const discs = typeof DiscoverySystem !== "undefined" ? DiscoverySystem.getUnlockedCount() : 0;

    medalBox.innerHTML = `
      <div class="medal-name">${medal}</div>
      <p class="medal-desc">${desc}</p>
      <div class="final-stats-grid">
        <div>💧 Agua: <strong>${GameState.water}%</strong></div>
        <div>🫧 Oxígeno: <strong>${GameState.oxygen}%</strong></div>
        <div>⚡ Energía: <strong>${GameState.energy}%</strong></div>
        <div>🌱 Comida: <strong>${GameState.food}%</strong></div>
        <div>🛡️ Escudo: <strong>${GameState.shield}%</strong></div>
        <div>🚀 Cohete MAV: <strong>3 / 3</strong></div>
      </div>
      <p style="margin-top: 10px; font-size: 0.85rem; color: #38bdf8;">
        📘 Secretos científicos descubiertos en tu diario: <strong>${discs} / 10</strong>
      </p>
    `;
  } else {
    if (typeof SoundFx !== "undefined") SoundFx.playAlert();
    medalBox.innerHTML = `
      <strong>💡 LECCIÓN DE SUPERVIVENCIA NASA:</strong>
      <p>Marte es un entorno implacable pero predecible. Recuerda que la Energía alimenta al reactor MOXIE (Oxígeno) y al desalinador (Agua). Vigila siempre que ninguna barra baje del 20% antes de avanzar al siguiente Sol.</p>
    `;
  }

  endModal.classList.remove("hidden");
}

// 14. Pasar al siguiente Sol con consumo nocturno equilibrado
document.getElementById("btn-next-sol").onclick = () => {
  if (typeof SoundFx !== "undefined") SoundFx.playClick();

  GameState.advanceSol();

  const failureReason = GameState.checkFailure();
  if (failureReason) {
    showEndScreen(false, `${failureReason} El sistema autónomo de Outpost Beta te mantuvo a salvo en el Sol ${GameState.sol}.`);
    return;
  }

  if (GameState.sol > 15) {
    if (GameState.mav >= 3) {
      showEndScreen(true, "¡Has sobrevivido con éxito los 15 Soles en Arcadia Planitia, completado las 3 etapas del cohete MAV y despegado junto a ROVI rumbo a la órbita de retorno a la Tierra!");
    } else {
      showEndScreen(false, "Sobreviviste los 15 Soles, pero el cohete MAV no completó todas sus etapas de combustible antes de la megatormenta.");
    }
    return;
  }

  loadCurrentSol();
};

// 15. Alternar entre Vista 2D Clásica y Prototipo 3D
function switchViewMode(mode) {
  currentViewMode = mode;
  const phaserCont = document.getElementById("phaser-container");
  const threeCont = document.getElementById("threejs-container");
  const hud3d = document.getElementById("hud-3d-controls");

  if (mode === "3d") {
    phaserCont.classList.add("hidden");
    decisionPanel.classList.add("hidden");
    toggleViewBtn.textContent = "🚀 VISTA 2D";
    toggleViewBtn.classList.add("active-3d");

    threeCont.classList.remove("hidden");
    if (hud3d) hud3d.classList.remove("hidden");

    if (typeof Scene3D !== "undefined") {
      if (!Scene3D.renderer) {
        Scene3D.init("threejs-container");
      }
      Scene3D.start();
    }
  } else {
    if (typeof Scene3D !== "undefined") {
      Scene3D.stop();
    }
    threeCont.classList.add("hidden");
    if (hud3d) hud3d.classList.add("hidden");
    phaserCont.classList.remove("hidden");
    toggleViewBtn.textContent = "🪐 MODO 3D";
    toggleViewBtn.classList.remove("active-3d");
    decisionPanel.classList.remove("hidden");
  }

  updateRoviAdvice();
}

toggleViewBtn.onclick = () => {
  if (typeof SoundFx !== "undefined") SoundFx.playClick();
  switchViewMode(currentViewMode === "2d" ? "3d" : "2d");
};

// Botón de Inicio Rápido a 3D desde la Pantalla de Inicio
document.getElementById("btn-demo-3d").onclick = () => {
  if (typeof SoundFx !== "undefined") SoundFx.playClick();
  if (!GameState.load()) GameState.reset();
  startScreen.classList.add("hidden");
  loadCurrentSol();
  switchViewMode("3d");
};

// 16. Controles de inicio, reinicio y modales
document.getElementById("btn-new-game").onclick = () => {
  if (typeof SoundFx !== "undefined") SoundFx.playClick();
  if (!GameState.load()) GameState.reset();
  startScreen.classList.add("hidden");
  switchViewMode("2d");
  loadCurrentSol();
};

document.getElementById("btn-Reset-save").onclick = () => {
  if (typeof SoundFx !== "undefined") SoundFx.playClick();
  GameState.reset();
};

document.getElementById("btn-restart-end").onclick = () => {
  if (typeof SoundFx !== "undefined") SoundFx.playClick();
  GameState.reset();
  endModal.classList.add("hidden");
  loadCurrentSol();
};

document.getElementById("btn-open-pedia").onclick = () => {
  if (typeof SoundFx !== "undefined") SoundFx.playClick();
  pediaModal.classList.remove("hidden");
};

document.getElementById("btn-close-pedia").onclick = () => {
  if (typeof SoundFx !== "undefined") SoundFx.playClick();
  pediaModal.classList.add("hidden");
};

// Controles del Diario de Exploración y Píldoras Educativas
diaryBtn.onclick = () => {
  if (typeof DiscoverySystem !== "undefined") DiscoverySystem.openDiary();
};

closeDiaryBtn.onclick = () => {
  if (typeof DiscoverySystem !== "undefined") DiscoverySystem.closeDiary();
};

closeDiscoveryBtn.onclick = () => {
  if (typeof DiscoverySystem !== "undefined") DiscoverySystem.closePillPopup();
};

soundBtn.onclick = () => {
  if (typeof SoundFx !== "undefined") {
    const isNowOn = SoundFx.toggleSound();
    soundBtn.textContent = isNowOn ? "🔊" : "🔇";
    soundBtn.title = isNowOn ? "Silenciar sonido" : "Activar sonido";
  }
};

// Inicialización del sistema de descubrimientos
if (typeof DiscoverySystem !== "undefined") {
  DiscoverySystem.init();
}


// Inicialización del sistema de descubrimientos
if (typeof DiscoverySystem !== "undefined") {
  DiscoverySystem.init();
}