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
if (typeof MinigameSpectro !== "undefined") scenesList.push(MinigameSpectro);
if (typeof MinigameDustDefense !== "undefined") scenesList.push(MinigameDustDefense);

let phaserGame = null;
if (typeof Phaser !== "undefined") {
  phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: "100%",
      height: "100%"
    },
    parent: "phaser-container",
    scene: scenesList
  });
}

// 2. Eventos aleatorios positivos de exploración marciana
const RANDOM_EVENTS = [
  {
    text: "FENOMENO DUST DEVIL: Un remolino marciano ha limpiado el polvo de los paneles solares (+18 Energia [PWR])",
    changes: { energy: 18 },
    pillId: "dust_devils"
  },
  {
    text: "RADAR SHARAD: La sonda orbital detecto una bolsa de hielo puro cerca de la superficie (+18 Agua [H2O])",
    changes: { water: 18 },
    pillId: "water_mars"
  },
  {
    text: "BROTE ACELERADO OSDR: Crecimiento extra de microgreens bajo luces LED rosas (+16 Comida [BIO] y +6 Oxigeno [O2])",
    changes: { food: 16, oxygen: 6 },
    pillId: "biodome_osdr"
  },
  {
    text: "FLUJO SOLAR DONKI: Las particulas solares fueron absorbidas por las baterias del habitat (+14 Energia [PWR], +5% Blindaje)",
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
let isMinigameRunning = false;

// 4. Sistema de efectos visuales flotantes de recursos (+25, -4, etc.)
window.showFloatingDeltas = function (diffs) {
  const container = document.getElementById("floating-indicators");
  if (!container) return;

  const labels = {
    water: { icon: "H2O", box: "box-water" },
    oxygen: { icon: "O2", box: "box-oxygen" },
    energy: { icon: "PWR", box: "box-energy" },
    food: { icon: "BIO", box: "box-food" },
    shield: { icon: "ESCUDO", box: null },
    mav: { icon: "MAV", box: null }
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
    roviMsg.innerHTML = `[ALERTA ROVI] El nivel de <strong>${first.name}</strong> esta bajo (${GameState[first.key]}%). Prioriza reponer ${first.name} hoy.`;
    return;
  }

  if (currentViewMode === "3d") {
    roviMsg.textContent = "ROVI: Modo 3D activo. Camina con [W,A,S,D], salta con [Espacio] e interactua con [E] frente a las estaciones marcianas.";
    return;
  }

  if (GameState.sol <= 3) {
    roviMsg.textContent = "ROVI: Fase de Emergencia. Estabiliza el hábitat reparando paneles solares y asegurando agua y oxígeno.";
  } else if (GameState.sol <= 7) {
    roviMsg.textContent = "ROVI: Fase de Reconstruccion. Cultiva en el biodomo para cosechar alimentos y mantén el escudo activo ante tormentas solares.";
  } else if (GameState.sol <= 11) {
    roviMsg.textContent = "ROVI: Fase de Recursos. Acumula reservas de agua pura y oxígeno para cuando comencemos a cargar el cohete MAV.";
  } else {
    roviMsg.textContent = `ROVI: Fase de Despegue. El cohete MAV está al ${GameState.mav}/3 de preparación. ¡Prioriza las etapas del cohete!`;
  }
}

// 7. Actualiza visualmente el indicador de las 3 fases del cohete MAV
window.updateMavVisuals = function (mavVal) {
  const stepsEl = document.getElementById("mav-step-icons");
  if (!stepsEl) return;
  const icons = ["[ ]", "[ ]", "[ ]"];
  for (let i = 0; i < mavVal; i++) {
    icons[i] = "[OK]";
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
  } else {
    decisionPanel.classList.add("hidden");
    if (roviMsg) {
      roviMsg.textContent = `Sol ${GameState.sol}: ¡Nuevo día en Marte! Explora la base en 3D o pulsa "Vista 2D" para ver las misiones de hoy.`;
    }
  }
}

// 9. Manejo de la decisión elegida (abre briefing si hay minijuego o resuelve de inmediato)
function handleChoiceSelection(choice) {
  const is3DMinigame = typeof Minigames3D !== "undefined" && Minigames3D.has(choice.minigame);
  const hasMinigameScene =
    choice.minigame &&
    ((phaserGame && phaserGame.scene && phaserGame.scene.getScene(choice.minigame)) || is3DMinigame);

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
    case "MinigameRoverRace3D":
      return "Usa A / D, las Flechas o arrastra el ratón para guiar a ROVI, esquivar rocas rojas y recoger cristales de hielo.";
    case "MinigameMavLaunch3D":
      return "Usa W,A,S,D, las Flechas o arrastra el ratón para guiar el cohete a través de los anillos verdes hacia la órbita de Marte.";
    case "MinigameEvaRepair3D":
      return "Muévete hacia los paneles dañados y mantén pulsado Clic o Barra Espaciadora para soldar y reparar con el rayo láser.";
    case "MinigamePixlLaser3D":
      return "Apunta el rayo láser con el ratón o flechas a los 4 minerales de la roca marciana y haz Clic para analizarlos.";
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
    case "MinigameSpectro":
      return "Haz clic en cada una de las 4 muestras para disparar el laser PIXL y analizar su mineralogia.";
    case "MinigameDustDefense":
      return "Haz clic rapido en el boton ASEGURAR de los 4 sistemas criticos antes de que expire el tiempo de tormenta.";
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

  isMinigameRunning = true;
  toggleViewBtn.disabled = true;
  toggleViewBtn.style.opacity = "0.5";

  if (typeof SoundFx !== "undefined") SoundFx.playClick();

  // Mini-intro con el problema a resolver; al terminar arranca el minijuego
  if (typeof MinigameIntro !== "undefined" && MinigameIntro.has(pendingMinigameChoice.minigame)) {
    MinigameIntro.play(pendingMinigameChoice.minigame, launchPendingMinigame);
  } else {
    launchPendingMinigame();
  }
};

function launchPendingMinigame() {
  if (!pendingMinigameChoice) return;
  const is3DMinigame = typeof Minigames3D !== "undefined" && Minigames3D.has(pendingMinigameChoice.minigame);

  if (is3DMinigame) {
    if (typeof Scene3D !== "undefined") Scene3D.stop();
    if (phaserGame && phaserGame.scene) {
      phaserGame.scene.pause("MainScene");
    }
    const hud3d = document.getElementById("hud-3d-controls");
    if (hud3d) hud3d.classList.add("hidden");

    GameState.modifyResources(pendingMinigameChoice.cost || {}, true);
    Minigames3D.start(pendingMinigameChoice.minigame, pendingMinigameChoice, (result) => {
      window.onMinigameComplete(result, pendingMinigameChoice);
    });
    return;
  }

  const phaserCont = document.getElementById("phaser-container");
  const threeCont = document.getElementById("threejs-container");
  const hud3d = document.getElementById("hud-3d-controls");

  if (typeof Scene3D !== "undefined") Scene3D.stop();
  if (threeCont) {
    threeCont.classList.remove("view-layer-active");
    threeCont.classList.add("view-layer-inactive");
  }
  if (hud3d) hud3d.classList.add("hidden");

  if (phaserCont) {
    phaserCont.classList.remove("view-layer-inactive");
    phaserCont.classList.add("view-layer-active");
  }

  if (phaserGame && phaserGame.scale) {
    phaserGame.scale.refresh();
  }

  // Descontar coste de la acción
  GameState.modifyResources(pendingMinigameChoice.cost || {}, true);

  phaserGame.scene.pause("MainScene");
  phaserGame.scene.start(pendingMinigameChoice.minigame, { choice: pendingMinigameChoice });
};

document.getElementById("btn-cancel-briefing").onclick = () => {
  briefingModal.classList.add("hidden");
  pendingMinigameChoice = null;
  isMinigameRunning = false;
  toggleViewBtn.disabled = false;
  toggleViewBtn.style.opacity = "1";

  if (currentViewMode === "3d") {
    if (typeof Scene3D !== "undefined") Scene3D.start();
  } else {
    decisionPanel.classList.remove("hidden");
  }

  if (typeof SoundFx !== "undefined") SoundFx.playClick();
};

// 12. Finalización y evaluación escalonada del minijuego (Excelente, Bien, Regular, Fallo)
window.onMinigameComplete = function (result, choice) {
  isMinigameRunning = false;
  toggleViewBtn.disabled = false;
  toggleViewBtn.style.opacity = "1";

  if (typeof Minigames3D !== "undefined") {
    Minigames3D.cleanup();
  }

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

  const phaserCont = document.getElementById("phaser-container");
  const threeCont = document.getElementById("threejs-container");
  const hud3d = document.getElementById("hud-3d-controls");

  // Si estábamos en modo 3D, restauramos la vista 3D tras el minijuego
  if (currentViewMode === "3d") {
    if (phaserCont) {
      phaserCont.classList.remove("view-layer-active");
      phaserCont.classList.add("view-layer-inactive");
    }
    if (threeCont) {
      threeCont.classList.remove("view-layer-inactive");
      threeCont.classList.add("view-layer-active");
    }
    if (hud3d) hud3d.classList.remove("hidden");
    if (typeof Scene3D !== "undefined") {
      Scene3D.start();
    }
  } else {
    if (threeCont) {
      threeCont.classList.remove("view-layer-active");
      threeCont.classList.add("view-layer-inactive");
    }
    if (phaserCont) {
      phaserCont.classList.remove("view-layer-inactive");
      phaserCont.classList.add("view-layer-active");
    }
    if (phaserGame && phaserGame.scale) {
      phaserGame.scale.refresh();
    }
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
    if (choice.minigame === "MinigameRoverDrive" || choice.minigame === "MinigameRoverRace3D") DiscoverySystem.unlock("rovers_exploration", true);
    if (choice.minigame === "MinigameMavLaunch3D") DiscoverySystem.unlock("mav_rocket", true);
    if (choice.minigame === "MinigameEvaRepair3D") DiscoverySystem.unlock("solar_power", true);
    if (choice.minigame === "MinigamePixlLaser3D" || choice.minigame === "MinigameSpectro") DiscoverySystem.unlock("water_mars", true);
  }

  // Aplicar recompensa al estado
  GameState.modifyResources(finalReward, true);

  // Generar resumen visual de recursos ganados
  const breakdownEl = document.getElementById("result-breakdown");
  breakdownEl.innerHTML = "";
  const icons = { water: "Agua", oxygen: "Oxígeno", energy: "Energía", food: "Comida", shield: "Escudo", mav: "Fase Cohete MAV" };

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
    starsEl.textContent = "3 Estrellas: ¡Excelente!";
    titleEl.textContent = "¡TRABAJO EXTRAORDINARIO!";
    descEl.textContent = `¡Lo has hecho genial! Los sistemas del Outpost Beta están al máximo y has ganado recursos extra para la misión.`;
  } else if (tier === "good") {
    starsEl.textContent = "2 Estrellas: ¡Muy bien!";
    titleEl.textContent = "¡MISIÓN CUMPLIDA!";
    descEl.textContent = `¡Buen trabajo! Has completado la tarea con éxito y los recursos ya están en los depósitos de la base.`;
  } else if (tier === "fair") {
    starsEl.textContent = "1 Estrella: ¡Buen intento!";
    titleEl.textContent = "TAREA COMPLETADA";
    descEl.textContent = `Conseguiste completar parte de la misión. Con un poco más de práctica lo harás todavía mejor.`;
  } else {
    starsEl.textContent = "¡Ánimo astronauta!";
    titleEl.textContent = "ROVI TE AYUDA";
    descEl.textContent = `Esta vez no dio tiempo a terminar, pero tu robot amigo ROVI activó las reservas para proteger a la tripulación.`;
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
    ? "DESPEGUE EXITOSO HACIA LA ORBITA TERRESTRE"
    : "MODO HIBERNACION DE EMERGENCIA ACTIVADO";

  document.getElementById("end-desc").textContent = reasonText;

  const medalBox = document.getElementById("end-medal-box");
  if (isVictory) {
    if (typeof SoundFx !== "undefined") SoundFx.playRocketLaunch();
    const avg = Math.round((GameState.water + GameState.oxygen + GameState.energy + GameState.food) / 4);
    let medal = "INSIGNIA DE HONOR: SUPERVIVIENTE AL LIMITE (Bronce)";
    let desc = "¡Has logrado escapar a tiempo antes de la tormenta!";

    if (avg >= 50 && GameState.shield >= 70) {
      medal = "INSIGNIA DE HONOR: COMANDANTE DE MARTE (Oro)";
      desc = "¡Gestión perfecta digna de una misión oficial de la NASA!";
    } else if (avg >= 30) {
      medal = "INSIGNIA DE HONOR: INGENIERO ESPACIAL (Plata)";
      desc = "¡Gran trabajo de reparación y equilibrio de soporte vital!";
    }

    const discs = typeof DiscoverySystem !== "undefined" ? DiscoverySystem.getUnlockedCount() : 0;

    medalBox.innerHTML = `
      <div class="medal-name">${medal}</div>
      <p class="medal-desc">${desc}</p>
      <div class="final-stats-grid">
        <div>Agua [H2O]: <strong>${GameState.water}%</strong></div>
        <div>Oxigeno [O2]: <strong>${GameState.oxygen}%</strong></div>
        <div>Energia [PWR]: <strong>${GameState.energy}%</strong></div>
        <div>Comida [BIO]: <strong>${GameState.food}%</strong></div>
        <div>Blindaje: <strong>${GameState.shield}%</strong></div>
        <div>Cohete MAV: <strong>3 / 3 Etapas</strong></div>
      </div>
      <p style="margin-top: 10px; font-size: 0.85rem; color: #38bdf8;">
        Secretos cientificos descubiertos en tu diario: <strong>${discs} / 10</strong>
      </p>
    `;
  } else {
    if (typeof SoundFx !== "undefined") SoundFx.playAlert();
    medalBox.innerHTML = `
      <strong>LECCION DE SUPERVIVENCIA NASA:</strong>
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
      const victoryText = "¡Has sobrevivido con éxito los 15 Soles en Arcadia Planitia, completado las 3 etapas del cohete MAV y despegado junto a ROVI rumbo a la órbita de retorno a la Tierra!";
      if (typeof OutroReturn !== "undefined") {
        OutroReturn.start(() => {
          showEndScreen(true, victoryText);
        });
      } else {
        showEndScreen(true, victoryText);
      }
    } else {
      showEndScreen(false, "Sobreviviste los 15 Soles, pero el cohete MAV no completó todas sus etapas de combustible antes de la megatormenta.");
    }
    return;
  }

  loadCurrentSol();
};

// 15. Alternar entre Vista 2D Clásica y Prototipo 3D
function switchViewMode(mode) {
  if (isMinigameRunning) return;

  currentViewMode = mode;
  const phaserCont = document.getElementById("phaser-container");
  const threeCont = document.getElementById("threejs-container");
  const hud3d = document.getElementById("hud-3d-controls");

  if (mode === "3d") {
    if (phaserCont) {
      phaserCont.classList.remove("view-layer-active");
      phaserCont.classList.add("view-layer-inactive");
    }
    if (threeCont) {
      threeCont.classList.remove("view-layer-inactive");
      threeCont.classList.add("view-layer-active");
    }
    decisionPanel.classList.add("hidden");
    toggleViewBtn.textContent = "Vista 2D";
    toggleViewBtn.classList.add("active-3d");

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
    if (threeCont) {
      threeCont.classList.remove("view-layer-active");
      threeCont.classList.add("view-layer-inactive");
    }
    if (hud3d) hud3d.classList.add("hidden");

    if (phaserCont) {
      phaserCont.classList.remove("view-layer-inactive");
      phaserCont.classList.add("view-layer-active");
    }
    toggleViewBtn.textContent = "Modo 3D";
    toggleViewBtn.classList.remove("active-3d");

    if (briefingModal.classList.contains("hidden") && resultPanel.classList.contains("hidden")) {
      decisionPanel.classList.remove("hidden");
    }

    if (phaserGame && phaserGame.scale) {
      phaserGame.scale.refresh();
    }
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

  // Siempre reproducir la cinemática del accidente al empezar misión
  if (typeof IntroAccident !== "undefined") {
    IntroAccident.start(() => {
      switchViewMode("2d");
      loadCurrentSol();
    });
  } else {
    switchViewMode("2d");
    loadCurrentSol();
  }
};

// =========================================================================
// SALA DE ENTRENAMIENTO / SELECTOR DIRECTO DE MINIJUEGOS (ARCADE NASA)
// =========================================================================
const ARCADE_MINIGAMES_3D = [
  {
    minigame: "MinigameRoverRace3D",
    minigameTitle: "Carrera del Rover ROVI en el Cañón Marciano",
    minigameBrief: "Conduce a ROVI por el cañón de Marte en 3D, esquiva rocas rojas basálticas y recoge cristales de hielo azul y turbo solar.",
    badge: "ACCIÓN 3D",
    desc: "Pilotaje 3D de alta velocidad por el cañón marciano con recolección de recursos.",
    cost: {},
    successReward: { water: 26, food: 22 },
    failReward: { water: 14, food: 10 },
    nasaFact: "Los rovers de la NASA analizan el terreno marciano para localizar depósitos de agua congelada accesibles."
  },
  {
    minigame: "MinigameMavLaunch3D",
    minigameTitle: "Ascenso y Vuelo a Órbita del Cohete MAV",
    minigameBrief: "Guía el cohete de retorno MAV a través de los anillos de navegación verde mientras el cielo pasa del atardecer rojizo al negro espacial estrellado.",
    badge: "VUELO Y ÓRBITA 3D",
    desc: "Simulador de ascenso orbital 3D atravesando capas atmosféricas de Marte.",
    cost: {},
    successReward: { mav: 1, energy: 25, oxygen: 25 },
    failReward: { mav: 1, energy: 15, oxygen: 15 },
    nasaFact: "El MAV alcanza la órbita marciana en unos 8 minutos para acoplarse con la nave que vuelve a la Tierra."
  },
  {
    minigame: "MinigameEvaRepair3D",
    minigameTitle: "Paseo Espacial EVA en Gravedad Cero",
    minigameBrief: "Flota en gravedad cero con tu traje espacial y repara los 5 componentes dañados usando el rayo láser de microsoldadura.",
    badge: "GRAVEDAD CERO 3D",
    desc: "Actividad extravehicular (EVA) en ingravidez para reparar paneles de la estación.",
    cost: {},
    successReward: { energy: 30, shield: 15 },
    failReward: { energy: 15, shield: 8 },
    nasaFact: "Los paseos espaciales (EVA) requieren trajes presurizados EMU para trabajar en el vacío del espacio."
  },
  {
    minigame: "MinigamePixlLaser3D",
    minigameTitle: "Espectrometría Láser PIXL en 3D",
    minigameBrief: "Apunta el láser del brazo robótico a la roca marciana en rotación y analiza sus 4 minerales clave (hielo, silicato, carbonato y hierro).",
    badge: "LABORATORIO 3D",
    desc: "Análisis geológico tridimensional disparando pulsos láser ultravioleta.",
    cost: {},
    successReward: { water: 25, energy: 20 },
    failReward: { water: 12, energy: 10 },
    nasaFact: "El instrumento PIXL de Perseverance usa rayos X y luz UV para mapear elementos químicos en rocas."
  }
];

const ARCADE_MINIGAMES_2D = [
  {
    minigame: "MinigameMoxie",
    minigameTitle: "Reactor MOXIE: Síntesis de Oxígeno",
    minigameBrief: "Mantén pulsada la barra espaciadora para regular la temperatura en 800 °C y convertir CO2 en oxígeno respirable.",
    badge: "SOPORTE VITAL",
    desc: "Control térmico electrolítico de 800 °C para producir oxígeno.",
    cost: {},
    successReward: { oxygen: 28 },
    failReward: { oxygen: 14 }
  },
  {
    minigame: "MinigameDrill",
    minigameTitle: "Perforación Glaciar Arcadia",
    minigameBrief: "Mueve la broca a los lados para extraer cristales de hielo puro y esquivar las rocas subterráneas.",
    badge: "EXTRACCIÓN AGUA",
    desc: "Perforación del glaciar subterráneo para extraer bloques de agua potable.",
    cost: {},
    successReward: { water: 30 },
    failReward: { water: 15 }
  },
  {
    minigame: "MinigameSolar",
    minigameTitle: "Mantenimiento Solar de Emergencia",
    minigameBrief: "Haz clic rápido sobre todas las motas de polvo marciano en los paneles solares y pulsa el interruptor.",
    badge: "ENERGÍA SOLAR",
    desc: "Limpieza electrostática de paneles solares y rearme del disyuntor.",
    cost: {},
    successReward: { energy: 30 },
    failReward: { energy: 15 }
  },
  {
    minigame: "MinigameBiodome",
    minigameTitle: "Cultivo Hidropónico en el Biodomo",
    minigameBrief: "Riega y equilibra la luz de las 3 bandejas de cultivo para cosechar microgreens y espirulina fresca.",
    badge: "ALIMENTOS Y BIOLOGÍA",
    desc: "Gestión de nutrientes y luces LED en el huerto hidropónico.",
    cost: {},
    successReward: { food: 30, oxygen: 12 },
    failReward: { food: 15, oxygen: 6 }
  },
  {
    minigame: "MinigameShield",
    minigameTitle: "Deflector de Radiación Solar DONKI",
    minigameBrief: "Mueve el deflector magnético para interceptar los protones solares antes de que impacten la base.",
    badge: "DEFENSA SOLAR",
    desc: "Intercepción de llamaradas solares con la barrera magnética.",
    cost: {},
    successReward: { shield: 25, energy: 15 },
    failReward: { shield: 10, energy: 8 }
  },
  {
    minigame: "MinigameWaterFilter",
    minigameTitle: "Purificación de Agua y Percloratos",
    minigameBrief: "Activa los 3 filtros en orden (sedimentos, neutralización química y ósmosis) para depurar el agua.",
    badge: "QUÍMICA Y FILTRADO",
    desc: "Filtrado en tres fases para eliminar sales perclorato tóxicas.",
    cost: {},
    successReward: { water: 28 },
    failReward: { water: 14 }
  },
  {
    minigame: "MinigameLeakRepair",
    minigameTitle: "Sellado de Fugas del Hábitat",
    minigameBrief: "Haz clic en las 5 fugas marcadas en la pared para sellarlas con espuma polimérica antes de perder presión.",
    badge: "REPARACIÓN CABINA",
    desc: "Parcheo rápido de fracturas de micrometeoritos en el refugio.",
    cost: {},
    successReward: { oxygen: 25, shield: 15 },
    failReward: { oxygen: 12, shield: 8 }
  },
  {
    minigame: "MinigameCircuit",
    minigameTitle: "Conexión de Circuitos y Relés",
    minigameBrief: "Haz clic en los 4 relés rotatorios para alinearlos y restablecer el flujo de corriente eléctrica.",
    badge: "INGENIERÍA ELÉCTRICA",
    desc: "Puzzle de alineación de relés para reconectar las baterías.",
    cost: {},
    successReward: { energy: 30 },
    failReward: { energy: 15 }
  },
  {
    minigame: "MinigameDustDefense",
    minigameTitle: "Defensa ante Megatormenta Marciana",
    minigameBrief: "Bloquea y asegura a tiempo los 4 sistemas críticos de la base antes de que la tormenta impacte.",
    badge: "EMERGENCIA CLIMA",
    desc: "Protocolo de aseguramiento ante ráfagas de viento huracanado.",
    cost: {},
    successReward: { shield: 25, oxygen: 15 },
    failReward: { shield: 10, oxygen: 8 }
  },
  {
    minigame: "MinigameRoverDrive",
    minigameTitle: "Exploración y Conducción 2D con ROVI",
    minigameBrief: "Conduce el rover con las flechas o WASD para desplegar 4 balizas científicas esquivando cráteres.",
    badge: "CONDUCCIÓN TÁCTICA",
    desc: "Navegación sobre terreno rocoso para balizar suministros caídos.",
    cost: {},
    successReward: { water: 25, food: 20 },
    failReward: { water: 14, food: 10 }
  }
];

function openArcadeModal() {
  const modal = document.getElementById("arcade-modal");
  const grid3d = document.getElementById("arcade-3d-grid");
  const grid2d = document.getElementById("arcade-2d-grid");

  if (!modal || !grid3d || !grid2d) return;

  grid3d.innerHTML = "";
  ARCADE_MINIGAMES_3D.forEach(g => {
    const card = document.createElement("div");
    card.className = "arcade-item-card";
    card.innerHTML = `
      <div>
        <div class="arcade-item-header">
          <span class="arcade-item-badge badge-3d">${g.badge}</span>
        </div>
        <h4 class="arcade-item-title">${g.minigameTitle}</h4>
        <p class="arcade-item-desc">${g.desc}</p>
      </div>
      <button class="btn-primary btn-arcade-play">¡JUGAR 3D!</button>
    `;
    card.querySelector("button").onclick = () => {
      modal.classList.add("hidden");
      startScreen.classList.add("hidden");
      if (typeof SoundFx !== "undefined") SoundFx.playClick();
      handleChoiceSelection(g);
    };
    grid3d.appendChild(card);
  });

  grid2d.innerHTML = "";
  ARCADE_MINIGAMES_2D.forEach(g => {
    const card = document.createElement("div");
    card.className = "arcade-item-card";
    card.innerHTML = `
      <div>
        <div class="arcade-item-header">
          <span class="arcade-item-badge badge-2d">${g.badge}</span>
        </div>
        <h4 class="arcade-item-title">${g.minigameTitle}</h4>
        <p class="arcade-item-desc">${g.desc}</p>
      </div>
      <button class="btn-primary btn-arcade-play">¡JUGAR 2D!</button>
    `;
    card.querySelector("button").onclick = () => {
      modal.classList.add("hidden");
      startScreen.classList.add("hidden");
      if (typeof SoundFx !== "undefined") SoundFx.playClick();
      handleChoiceSelection(g);
    };
    grid2d.appendChild(card);
  });

  modal.classList.remove("hidden");
}

const btnOpenArcade = document.getElementById("btn-open-arcade");
if (btnOpenArcade) {
  btnOpenArcade.onclick = () => {
    if (typeof SoundFx !== "undefined") SoundFx.playClick();
    openArcadeModal();
  };
}

const btnOpenArcadeHud = document.getElementById("btn-open-arcade-hud");
if (btnOpenArcadeHud) {
  btnOpenArcadeHud.onclick = () => {
    if (typeof SoundFx !== "undefined") SoundFx.playClick();
    openArcadeModal();
  };
}

const btnCloseArcade = document.getElementById("btn-close-arcade");
if (btnCloseArcade) {
  btnCloseArcade.onclick = () => {
    if (typeof SoundFx !== "undefined") SoundFx.playClick();
    const modal = document.getElementById("arcade-modal");
    if (modal) modal.classList.add("hidden");
  };
}

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
    soundBtn.textContent = isNowOn ? "SONIDO: ON" : "SONIDO: OFF";
    soundBtn.title = isNowOn ? "Silenciar sonido" : "Activar sonido";
  }
};

// Inicialización del sistema de descubrimientos
if (typeof DiscoverySystem !== "undefined") {
  DiscoverySystem.init();
}

// Control de Pantalla Completa (Fullscreen)
const fullscreenBtn = document.getElementById("btn-toggle-fullscreen");
if (fullscreenBtn) {
  fullscreenBtn.onclick = () => {
    if (typeof SoundFx !== "undefined") SoundFx.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      fullscreenBtn.textContent = "Salir Pantalla Completa";
      fullscreenBtn.classList.add("active-fullscreen");
    } else {
      fullscreenBtn.textContent = "Pantalla Completa";
      fullscreenBtn.classList.remove("active-fullscreen");
    }
  });
}

// Control del Panel de Mision en Modo 3D
const btnToggle3dMission = document.getElementById("btn-toggle-3d-mission");
if (btnToggle3dMission) {
  btnToggle3dMission.onclick = () => {
    if (typeof SoundFx !== "undefined") SoundFx.playClick();
    decisionPanel.classList.toggle("hidden");
  };
}

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyM" && currentViewMode === "3d") {
    decisionPanel.classList.toggle("hidden");
    if (typeof SoundFx !== "undefined") SoundFx.playClick();
  }
});

// Helper de depuración para probar la cinemática de retorno en cualquier momento
window.testOutro = () => {
  if (typeof OutroReturn !== "undefined") {
    OutroReturn.start(() => {
      showEndScreen(true, "¡Has sobrevivido con éxito los 15 Soles en Arcadia Planitia, completado las 3 etapas del cohete MAV y despegado junto a ROVI rumbo a la órbita de retorno a la Tierra!");
    });
  } else {
    console.warn("OutroReturn no está cargado");
  }
};
