// js/outroReturn.js — Cinemática interactiva del cohete MAV regresando a la Tierra
// Se activa al superar los 15 Soles con las 3 etapas del MAV completadas

const OutroReturn = {
  active: false,
  step: 0,
  onCompleteCallback: null,
  animId: null,

  // Canvas y contexto
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,

  // Estado de simulación gráfica
  stars: [],
  particles: [],
  fireworks: [],
  confetti: [],
  clouds: [],
  earthRotation: 0,
  marsRotation: 0,
  lastTime: 0,

  // Estado cinemático del cohete MAV
  rocket: {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    angle: -Math.PI / 2,
    targetAngle: -Math.PI / 2,
    scale: 1,
    targetScale: 1,
    engineType: "fire", // "fire", "ion", "rcs", "orbit"
    flamePulse: 0
  },

  // Máquina de escribir para diálogos de radio
  typewriterTimer: null,
  fullText: "",
  displayedText: "",
  charIndex: 0,
  isTyping: false,

  // 4 etapas narrativas del viaje de regreso
  narrativeSteps: [
    {
      stage: "ASCENSO Y ESCAPE DE MARTE",
      speaker: "rovi",
      speakerName: "ROVI // COPILOTO DE ABORDO",
      channel: "Cabina MAV Ares-VII // Órbita Marciana",
      text: "«¡BEEP BEEP! ¡Motores de ascenso al 100%! ¡Nos elevamos sobre los cañones de Arcadia Planitia! La gravedad marciana ha quedado atrás y los paneles de crucero están desplegados. ¡Adiós planeta rojo, nos vamos a casa!»",
      dist: "225.000.000 km",
      speed: "Mach 32 (11 km/s)",
      prop: "IMPULSO PRIMARIO 100%",
      life: "SOPORTE VITAL: ÓPTIMO",
      propClass: "text-green",
      lifeClass: "text-cyan",
      engine: "fire"
    },
    {
      stage: "CRUCERO INTERPLANETARIO",
      speaker: "houston",
      speakerName: "HOUSTON // CONTROL DE MISIÓN (NASA)",
      channel: "Red del Espacio Profundo (DSN Goldstone)",
      text: "«¡Ares-VII, habla Houston! Recibimos vuestra telemetría alta y clara. Habéis entrado en la trayectoria Hohmann de retorno con una precisión del 99.8%. Marte ya es un punto lejano en vuestras cámaras. ¡Rumbo directo a la Tierra!»",
      dist: "112.000.000 km",
      speed: "28.500 km/h (Inercial)",
      prop: "PROPULSIÓN IÓNICA",
      life: "RECICLAJE 100%",
      propClass: "text-cyan",
      lifeClass: "text-green",
      engine: "ion"
    },
    {
      stage: "APROXIMACIÓN A LA TIERRA",
      speaker: "rovi",
      speakerName: "ROVI // COPILOTO DE ABORDO",
      channel: "Aproximación Cislunar Tierra-Luna",
      text: "«¡Comandante, mira por la cúpula frontal! ¡Esa es nuestra hermosa Tierra! ¡Océanos de agua líquida azul, nubes blancas y continentes verdes! La Luna nos saluda a babor. ¡Es la vista más maravillosa de toda la galaxia!»",
      dist: "384.400 km (Órbita Cislunar)",
      speed: "7.800 km/h (Frenado)",
      prop: "RETROPROPULSIÓN LEO",
      life: "CABINA PRESURIZADA",
      propClass: "text-amber",
      lifeClass: "text-green",
      engine: "rcs"
    },
    {
      stage: "INSERCIÓN ORBITAL Y BIENVENIDA",
      speaker: "houston",
      speakerName: "HOUSTON // CONTROL DE MISIÓN (NASA)",
      channel: "Centro Espacial Johnson (Houston, TX)",
      text: "«¡Ares-VII, habéis logrado una hazaña histórica! 15 Soles sobreviviendo a las tormentas marcianas, reparando la base y regresando sanos y salvos. ¡Todo el equipo de la NASA está de pie aplaudiendo vuestra valentía! ¡Bienvenidos a casa, HÉROES DE MARTE!»",
      dist: "400 km (Órbita Terrestre Baja)",
      speed: "Mach 25 (Reentrada segura)",
      prop: "PARACAÍDAS Y ESCUDO OK",
      life: "¡MISIÓN CUMPLIDA!",
      propClass: "text-green",
      lifeClass: "text-green",
      engine: "orbit"
    }
  ],

  // 1. Inicialización de eventos DOM
  init() {
    this.canvas = document.getElementById("outro-return-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    window.addEventListener("resize", () => {
      if (this.active) this.resizeCanvas();
    });

    const btnSkip = document.getElementById("btn-skip-outro");
    if (btnSkip) {
      btnSkip.addEventListener("click", (e) => {
        e.stopPropagation();
        this.skip();
      });
    }

    const btnNext = document.getElementById("btn-next-outro-step");
    if (btnNext) {
      btnNext.addEventListener("click", (e) => {
        e.stopPropagation();
        this.nextStep();
      });
    }

    const commBox = document.getElementById("outro-comm-box");
    if (commBox) {
      commBox.addEventListener("click", () => this.nextStep());
    }

    const btnFinish = document.getElementById("btn-outro-finish");
    if (btnFinish) {
      btnFinish.addEventListener("click", (e) => {
        e.stopPropagation();
        this.finish();
      });
    }

    window.addEventListener("keydown", (e) => {
      if (!this.active) return;
      if (e.code === "Space" || e.code === "Enter") {
        const celebrateCard = document.getElementById("outro-celebrate-card");
        if (celebrateCard && !celebrateCard.classList.contains("hidden")) {
          this.finish();
        } else {
          this.nextStep();
        }
      } else if (e.code === "Escape") {
        this.skip();
      }
    });

    this.initStars();
    this.initClouds();
  },

  initStars() {
    this.stars = [];
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        z: Math.random() * 1200 + 1,
        pz: 1200,
        size: Math.random() * 2 + 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  },

  initClouds() {
    this.clouds = [];
    for (let i = 0; i < 18; i++) {
      this.clouds.push({
        angle: (i / 18) * Math.PI * 2,
        distRel: 0.2 + Math.random() * 0.7,
        radius: 18 + Math.random() * 28,
        opacity: 0.35 + Math.random() * 0.45,
        speed: (Math.random() * 0.0003 + 0.0002) * (Math.random() < 0.5 ? 1 : -1)
      });
    }
  },

  resizeCanvas() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";
    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    }
  },

  // 2. Iniciar la cinemática de retorno
  start(onComplete) {
    this.onCompleteCallback = onComplete;
    this.active = true;
    this.step = 0;
    this.particles = [];
    this.fireworks = [];
    this.confetti = [];
    this.earthRotation = 0;
    this.marsRotation = 0;

    const overlay = document.getElementById("outro-return-overlay");
    if (overlay) {
      overlay.classList.remove("hidden");
      overlay.classList.remove("outro-fade-out");
    }

    const celebrateCard = document.getElementById("outro-celebrate-card");
    if (celebrateCard) celebrateCard.classList.add("hidden");

    const commBox = document.getElementById("outro-comm-box");
    if (commBox) commBox.classList.remove("hidden");

    this.resizeCanvas();

    // Posición inicial del cohete en la rampa de Arcadia Planitia (mirando arriba y a la derecha)
    this.rocket.x = this.width * 0.38;
    this.rocket.y = this.height * 0.78;
    this.rocket.targetX = this.width * 0.62;
    this.rocket.targetY = this.height * 0.36;
    this.rocket.angle = -Math.PI * 0.35;
    this.rocket.targetAngle = -Math.PI * 0.28;
    this.rocket.scale = 1.0;
    this.rocket.targetScale = 0.85;
    this.rocket.engineType = "fire";

    if (this.animId) cancelAnimationFrame(this.animId);
    this.lastTime = performance.now();
    this.animate();

    this.loadStep(0);
  },

  // 3. Cargar un paso narrativo
  loadStep(idx) {
    if (idx >= this.narrativeSteps.length) {
      this.triggerCelebration();
      return;
    }

    this.step = idx;
    const data = this.narrativeSteps[idx];

    this.rocket.engineType = data.engine;

    // Actualizar objetivos del cohete según la etapa (siempre orientado hacia su trayectoria y destino a la derecha)
    if (idx === 0) {
      // Despegue de Marte: el cohete asciende curvando hacia arriba y a la derecha
      this.rocket.x = this.width * 0.38;
      this.rocket.y = this.height * 0.78;
      this.rocket.targetX = this.width * 0.62;
      this.rocket.targetY = this.height * 0.36;
      this.rocket.angle = -Math.PI * 0.35;
      this.rocket.targetAngle = -Math.PI * 0.28;
      this.rocket.scale = 1.15;
      this.rocket.targetScale = 0.85;
      if (typeof SoundFx !== "undefined") SoundFx.playRocketLaunch();
    } else if (idx === 1) {
      // Crucero interplanetario: viaja de izquierda a derecha apuntando a la Tierra en la esquina superior derecha
      this.rocket.x = this.width * 0.22;
      this.rocket.y = this.height * 0.58;
      this.rocket.targetX = this.width * 0.56;
      this.rocket.targetY = this.height * 0.44;
      this.rocket.angle = -0.26;
      this.rocket.targetAngle = -0.22;
      this.rocket.scale = 0.75;
      this.rocket.targetScale = 0.88;
      if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
    } else if (idx === 2) {
      // Gran aproximación: el cohete vuela mirando directamente a la derecha hacia el planeta Tierra
      this.rocket.x = this.width * 0.16;
      this.rocket.y = this.height * 0.42;
      this.rocket.targetX = this.width * 0.48;
      this.rocket.targetY = this.height * 0.48;
      this.rocket.angle = 0.05;
      this.rocket.targetAngle = 0.02;
      this.rocket.scale = 0.85;
      this.rocket.targetScale = 0.95;
      if (typeof SoundFx !== "undefined") SoundFx.playRoviChirp();
    } else if (idx === 3) {
      // Inserción orbital y celebración: volando horizontalmente a la derecha en órbita alrededor de la Tierra
      this.rocket.x = this.width * 0.28;
      this.rocket.y = this.height * 0.33;
      this.rocket.targetX = this.width * 0.58;
      this.rocket.targetY = this.height * 0.33;
      this.rocket.angle = 0.0;
      this.rocket.targetAngle = 0.0;
      this.rocket.scale = 1.05;
      this.rocket.targetScale = 1.05;
      if (typeof SoundFx !== "undefined") SoundFx.playSuccess();
    }

    // Actualizar telemetría visual en el HUD
    const stageEl = document.getElementById("outro-telemetry-stage");
    const distEl = document.getElementById("outro-telemetry-dist");
    const speedEl = document.getElementById("outro-telemetry-speed");
    const propEl = document.getElementById("outro-telemetry-prop");
    const lifeEl = document.getElementById("outro-telemetry-life");

    if (stageEl) stageEl.textContent = data.stage;
    if (distEl) distEl.textContent = data.dist;
    if (speedEl) speedEl.textContent = data.speed;

    if (propEl) {
      propEl.textContent = data.prop;
      propEl.className = `gauge-value ${data.propClass}`;
    }

    if (lifeEl) {
      lifeEl.textContent = data.life;
      lifeEl.className = `gauge-value ${data.lifeClass}`;
    }

    // Cabecera del interlocutor
    const speakerName = document.getElementById("outro-speaker-name");
    const commChannel = document.getElementById("outro-comm-channel");
    const speakerAvatar = document.getElementById("outro-speaker-avatar");

    if (speakerName) speakerName.textContent = data.speakerName;
    if (commChannel) commChannel.textContent = data.channel;

    if (speakerAvatar) {
      speakerAvatar.className = `speaker-avatar ${data.speaker === "rovi" ? "rovi-speaker-avatar" : "houston-avatar"}`;
      if (data.speaker === "rovi") {
        speakerAvatar.innerHTML = `
          <div class="rovi-face-avatar">
            <div class="rovi-antenna"></div>
            <div class="rovi-head">
              <div class="rovi-eyes"><span class="eye"></span><span class="eye"></span></div>
              <div class="rovi-smile"></div>
            </div>
          </div>
        `;
      } else {
        speakerAvatar.innerHTML = `<span class="houston-icon">&#128225;</span>`;
      }
    }

    // Contador de paso
    const stepHint = document.getElementById("outro-step-hint");
    if (stepHint) {
      stepHint.textContent = `Paso ${idx + 1} / ${this.narrativeSteps.length} • Pulsa ESPACIO o Siguiente`;
    }

    // Iniciar mecanografía del diálogo
    this.typewriteText(data.text);
  },

  // 4. Efecto de máquina de escribir para el texto
  typewriteText(text) {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    this.fullText = text;
    this.displayedText = "";
    this.charIndex = 0;
    this.isTyping = true;

    const speechEl = document.getElementById("outro-speech-text");
    if (speechEl) speechEl.textContent = "";

    this.typewriterTimer = setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.displayedText += this.fullText[this.charIndex];
        this.charIndex++;
        if (speechEl) speechEl.textContent = this.displayedText;

        if (this.charIndex % 3 === 0 && typeof SoundFx !== "undefined") {
          SoundFx.playTypingBlip();
        }
      } else {
        this.isTyping = false;
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
      }
    }, 24);
  },

  // 5. Avanzar de paso o autocompletar texto
  nextStep() {
    if (this.isTyping) {
      // Completar inmediatamente el texto
      if (this.typewriterTimer) clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
      this.isTyping = false;
      this.displayedText = this.fullText;
      const speechEl = document.getElementById("outro-speech-text");
      if (speechEl) speechEl.textContent = this.displayedText;
      return;
    }

    if (this.step < this.narrativeSteps.length - 1) {
      this.loadStep(this.step + 1);
    } else {
      this.triggerCelebration();
    }
  },

  // 6. Activar la celebración final con fuegos artificiales y tarjeta de bienvenida
  triggerCelebration() {
    this.step = 3;
    const commBox = document.getElementById("outro-comm-box");
    if (commBox) commBox.classList.add("hidden");

    const celebrateCard = document.getElementById("outro-celebrate-card");
    if (celebrateCard) {
      celebrateCard.classList.remove("hidden");
      celebrateCard.classList.add("wakeup-card-enter");
    }

    if (typeof SoundFx !== "undefined") {
      SoundFx.playSuccess();
    }

    // Disparar oleadas iniciales de fuegos artificiales espaciales
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (!this.active) return;
        this.spawnFirework();
      }, i * 350);
    }

    // Inicializar confeti espacial flotante
    this.confetti = [];
    const colors = ["#38bdf8", "#facc15", "#f43f5e", "#22c55e", "#a855f7", "#ffffff"];
    for (let i = 0; i < 90; i++) {
      this.confetti.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.7,
        vx: (Math.random() - 0.5) * 60,
        vy: Math.random() * 80 + 40,
        size: Math.random() * 6 + 4,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  },

  spawnFirework() {
    const x = this.width * (0.2 + Math.random() * 0.6);
    const y = this.height * (0.15 + Math.random() * 0.4);
    const colors = ["#facc15", "#38bdf8", "#ec4899", "#22c55e", "#fb923c", "#a855f7"];
    const baseColor = colors[Math.floor(Math.random() * colors.length)];
    const count = 35 + Math.floor(Math.random() * 20);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const speed = Math.random() * 160 + 80;
      this.fireworks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: baseColor,
        alpha: 1.0,
        size: Math.random() * 3.5 + 2,
        life: 1.0,
        decay: Math.random() * 0.7 + 0.6
      });
    }
  },

  // 7. Bucle de animación Canvas
  animate() {
    if (!this.active) return;
    this.animId = requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const delta = Math.min((now - (this.lastTime || now)) / 1000, 0.1);
    this.lastTime = now;

    this.update(delta);
    this.render();
  },

  // 8. Actualización de física y partículas
  update(delta) {
    this.earthRotation += delta * 0.08;
    this.marsRotation += delta * 0.05;

    // Interpolación suave del cohete
    const lerpSpeed = 2.2 * delta;
    this.rocket.x += (this.rocket.targetX - this.rocket.x) * lerpSpeed;
    this.rocket.y += (this.rocket.targetY - this.rocket.y) * lerpSpeed;
    this.rocket.angle += (this.rocket.targetAngle - this.rocket.angle) * lerpSpeed;
    this.rocket.scale += (this.rocket.targetScale - this.rocket.scale) * lerpSpeed;

    // En la celebración orbital final (Paso 3), el cohete avanza suavemente hacia la derecha en órbita
    if (this.step === 3) {
      this.rocket.targetX = Math.min(this.width * 0.72, this.rocket.targetX + delta * 16);
    }

    // Pulso del motor
    this.rocket.flamePulse += delta * 24;

    // Actualización de estrellas (con warp en etapa 1)
    const warp = this.step === 1 ? 5.0 : 1.0;
    this.stars.forEach((s) => {
      s.pz = s.z;
      s.z -= 18 * warp;
      if (s.z <= 0) {
        s.z = 1200;
        s.pz = 1200;
        s.x = (Math.random() - 0.5) * this.width * 2;
        s.y = (Math.random() - 0.5) * this.height * 2;
      }
    });

    // Emisión de partículas según el motor
    const nozzleDist = 34 * this.rocket.scale;
    if (this.rocket.engineType === "fire") {
      // Motor de despegue potente (llamas expulsadas hacia la cola / izquierda)
      const count = 4;
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 8;
        const fireAngle = this.rocket.angle + Math.PI + (Math.random() - 0.5) * 0.28;
        const speed = Math.random() * 260 + 160;
        this.particles.push({
          x: this.rocket.x - Math.cos(this.rocket.angle) * nozzleDist - Math.sin(this.rocket.angle) * spread,
          y: this.rocket.y - Math.sin(this.rocket.angle) * nozzleDist + Math.cos(this.rocket.angle) * spread,
          vx: Math.cos(fireAngle) * speed,
          vy: Math.sin(fireAngle) * speed,
          color: Math.random() < 0.4 ? "#facc15" : Math.random() < 0.75 ? "#f97316" : "#ef4444",
          size: Math.random() * 7 * this.rocket.scale + 3,
          alpha: 1.0,
          decay: 2.4
        });
      }
    } else if (this.rocket.engineType === "ion") {
      // Motor iónico azul cian (partículas iónicas emitidas hacia atrás)
      for (let i = 0; i < 3; i++) {
        const spread = (Math.random() - 0.5) * 4;
        const ionAngle = this.rocket.angle + Math.PI + (Math.random() - 0.5) * 0.12;
        const speed = Math.random() * 220 + 140;
        this.particles.push({
          x: this.rocket.x - Math.cos(this.rocket.angle) * nozzleDist - Math.sin(this.rocket.angle) * spread,
          y: this.rocket.y - Math.sin(this.rocket.angle) * nozzleDist + Math.cos(this.rocket.angle) * spread,
          vx: Math.cos(ionAngle) * speed,
          vy: Math.sin(ionAngle) * speed,
          color: Math.random() < 0.6 ? "#38bdf8" : "#818cf8",
          size: Math.random() * 5 * this.rocket.scale + 2,
          alpha: 0.9,
          decay: 2.8
        });
      }
    } else if (this.rocket.engineType === "rcs") {
      // Micro-pulsos RCS
      if (Math.random() < 0.35) {
        const rcsAngle = this.rocket.angle + Math.PI / 2 * (Math.random() < 0.5 ? 1 : -1);
        this.particles.push({
          x: this.rocket.x,
          y: this.rocket.y,
          vx: Math.cos(rcsAngle) * 50,
          vy: Math.sin(rcsAngle) * 50,
          color: "#e2e8f0",
          size: 2.5,
          alpha: 0.8,
          decay: 3.5
        });
      }
    }

    // Actualizar partículas de propulsión
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.alpha -= p.decay * delta;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    // Actualizar fuegos artificiales
    if (this.step === 3 && Math.random() < 0.04) {
      this.spawnFirework();
    }

    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const f = this.fireworks[i];
      f.x += f.vx * delta;
      f.y += f.vy * delta + 25 * delta; // gravedad sutil
      f.alpha -= f.decay * delta;
      if (f.alpha <= 0) this.fireworks.splice(i, 1);
    }

    // Actualizar confeti
    this.confetti.forEach((c) => {
      c.x += c.vx * delta;
      c.y += c.vy * delta;
      c.rot += c.vRot * delta;
      if (c.y > this.height + 20) {
        c.y = -10;
        c.x = Math.random() * this.width;
      }
    });
  },

  // 9. Renderizado gráfico
  render() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // Fondo del cosmos
    this.drawCosmosBackground(ctx);

    // Estrellas
    this.drawStars(ctx);

    // Cuerpos celestes según la etapa actual
    if (this.step === 0) {
      // Marte grande en la base con la atmósfera y Outpost Beta
      this.drawMarsDeparture(ctx);
    } else if (this.step === 1) {
      // Espacio profundo: Marte alejándose (esquina inferior izquierda) y Tierra como canica lejana (arriba a la derecha)
      this.drawDeepSpaceTransit(ctx);
    } else if (this.step === 2) {
      // Tierra grande a la derecha con nubes y la Luna a babor
      this.drawEarthApproach(ctx);
    } else if (this.step === 3) {
      // Órbita terrestre majestuosa abajo con luces de ciudades y atmósfera
      this.drawEarthOrbitCelebration(ctx);
    }

    // Partículas del motor
    this.drawEngineParticles(ctx);

    // Cohete MAV Ares-VII
    this.drawRocket(
      ctx,
      this.rocket.x,
      this.rocket.y,
      this.rocket.angle,
      this.rocket.scale,
      this.rocket.engineType
    );

    // Fuegos artificiales de victoria
    this.drawFireworks(ctx);

    // Confeti de celebración
    this.drawConfetti(ctx);

    ctx.restore();
  },

  // 10. Fondo cósmico degradado
  drawCosmosBackground(ctx) {
    const grad = ctx.createRadialGradient(
      this.width * 0.5,
      this.height * 0.4,
      100,
      this.width * 0.5,
      this.height * 0.5,
      this.width * 0.9
    );
    grad.addColorStop(0, "#080d1a");
    grad.addColorStop(0.5, "#040711");
    grad.addColorStop(1, "#010206");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Nebulosa sutil en púrpura / azul cian
    ctx.save();
    ctx.globalAlpha = 0.12;
    const nebGrad = ctx.createRadialGradient(
      this.width * 0.7,
      this.height * 0.25,
      20,
      this.width * 0.7,
      this.height * 0.25,
      350
    );
    nebGrad.addColorStop(0, "#818cf8");
    nebGrad.addColorStop(0.6, "#38bdf8");
    nebGrad.addColorStop(1, "transparent");
    ctx.fillStyle = nebGrad;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  },

  // 11. Estrellas y rayos warp
  drawStars(ctx) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const isWarp = this.step === 1;

    ctx.save();
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const k = 300 / (s.z || 1);
      const px = s.x * k + cx;
      const py = s.y * k + cy;

      if (px < 0 || px > this.width || py < 0 || py > this.height) continue;

      if (isWarp) {
        const pk = 300 / (s.pz || 1);
        const ppx = s.x * pk + cx;
        const ppy = s.y * pk + cy;
        ctx.strokeStyle = `rgba(224, 242, 254, ${s.alpha * 0.85})`;
        ctx.lineWidth = Math.max(0.8, s.size * 0.9);
        ctx.beginPath();
        ctx.moveTo(ppx, ppy);
        ctx.lineTo(px, py);
        ctx.stroke();
      } else {
        const twinkle = 0.7 + 0.3 * Math.sin(performance.now() * s.twinkleSpeed + s.twinklePhase);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(px, py, s.size * (0.8 + 0.3 * (1 - s.z / 1200)), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  // 12. Paso 0: Despegue desde Marte
  drawMarsDeparture(ctx) {
    const radius = Math.max(this.width * 0.7, 520);
    const mx = this.width * 0.5;
    const my = this.height + radius * 0.42;

    // Resplandor atmosférico de Marte
    ctx.save();
    const atmGrad = ctx.createRadialGradient(mx, my, radius - 40, mx, my, radius + 70);
    atmGrad.addColorStop(0, "rgba(239, 68, 68, 0.45)");
    atmGrad.addColorStop(0.6, "rgba(249, 115, 22, 0.22)");
    atmGrad.addColorStop(1, "transparent");
    ctx.fillStyle = atmGrad;
    ctx.beginPath();
    ctx.arc(mx, my, radius + 70, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo de Marte
    const marsGrad = ctx.createRadialGradient(mx - radius * 0.3, my - radius * 0.6, 50, mx, my, radius);
    marsGrad.addColorStop(0, "#e05338");
    marsGrad.addColorStop(0.4, "#c23a22");
    marsGrad.addColorStop(0.85, "#801e10");
    marsGrad.addColorStop(1, "#3f0d06");
    ctx.fillStyle = marsGrad;
    ctx.beginPath();
    ctx.arc(mx, my, radius, 0, Math.PI * 2);
    ctx.fill();

    // Relieves y cráteres en el horizonte marciano
    ctx.fillStyle = "rgba(79, 16, 7, 0.45)";
    ctx.beginPath();
    ctx.arc(mx - radius * 0.2, my - radius * 0.85, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(mx + radius * 0.35, my - radius * 0.75, 75, 0, Math.PI * 2);
    ctx.fill();

    // Cúpula miniatura de Outpost Beta en el horizonte
    const domeX = mx - 60;
    const domeY = my - radius + 2;
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.arc(domeX, domeY, 14, Math.PI, Math.PI * 2);
    ctx.fill();
    // Ventana cian de la base
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(domeX - 6, domeY - 6, 12, 4);

    // Paneles solares miniatura
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(domeX + 22, domeY - 5, 20, 6);
    ctx.fillRect(domeX - 42, domeY - 5, 20, 6);

    ctx.restore();
  },

  // 13. Paso 1: Tránsito en el espacio profundo
  drawDeepSpaceTransit(ctx) {
    // Marte alejándose (esquina inferior izquierda)
    const marsX = this.width * 0.14;
    const marsY = this.height * 0.78;
    const marsR = 38;

    ctx.save();
    const marsAtm = ctx.createRadialGradient(marsX, marsY, marsR - 5, marsX, marsY, marsR + 15);
    marsAtm.addColorStop(0, "rgba(239, 68, 68, 0.4)");
    marsAtm.addColorStop(1, "transparent");
    ctx.fillStyle = marsAtm;
    ctx.beginPath();
    ctx.arc(marsX, marsY, marsR + 15, 0, Math.PI * 2);
    ctx.fill();

    const marsGrad = ctx.createRadialGradient(marsX - 10, marsY - 12, 6, marsX, marsY, marsR);
    marsGrad.addColorStop(0, "#e05338");
    marsGrad.addColorStop(0.7, "#8c2211");
    marsGrad.addColorStop(1, "#360b05");
    ctx.fillStyle = marsGrad;
    ctx.beginPath();
    ctx.arc(marsX, marsY, marsR, 0, Math.PI * 2);
    ctx.fill();

    // Etiqueta Marte
    ctx.fillStyle = "#fca5a5";
    ctx.font = "700 11px Fredoka, sans-serif";
    ctx.fillText("MARTE (Atrás)", marsX - 35, marsY + marsR + 18);

    // Tierra como punto azul brillante (esquina superior derecha)
    const earthX = this.width * 0.85;
    const earthY = this.height * 0.22;
    const earthR = 14;

    // Trayectoria de transferencia interplanetaria Hohmann (arco punteado cian hacia la Tierra)
    ctx.save();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(marsX + marsR * 0.8, marsY - marsR * 0.5);
    ctx.quadraticCurveTo(this.width * 0.45, this.height * 0.40, earthX - earthR * 1.5, earthY + earthR * 0.8);
    ctx.stroke();
    ctx.restore();

    const earthGlow = ctx.createRadialGradient(earthX, earthY, 4, earthX, earthY, 32);
    earthGlow.addColorStop(0, "rgba(56, 189, 248, 0.95)");
    earthGlow.addColorStop(0.5, "rgba(56, 189, 248, 0.35)");
    earthGlow.addColorStop(1, "transparent");
    ctx.fillStyle = earthGlow;
    ctx.beginPath();
    ctx.arc(earthX, earthY, 32, 0, Math.PI * 2);
    ctx.fill();

    // Punto azul pálido
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
    ctx.fill();

    // Destello de estrella
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(earthX - 22, earthY);
    ctx.lineTo(earthX + 22, earthY);
    ctx.moveTo(earthX, earthY - 22);
    ctx.lineTo(earthX, earthY + 22);
    ctx.stroke();

    // Etiqueta Tierra
    ctx.fillStyle = "#7dd3fc";
    ctx.font = "700 11px Fredoka, sans-serif";
    ctx.fillText("TIERRA (Destino)", earthX - 44, earthY + earthR + 22);

    ctx.restore();
  },

  // 14. Paso 2: Gran aproximación a la Tierra y la Luna
  drawEarthApproach(ctx) {
    const ex = this.width * 0.74;
    const ey = this.height * 0.52;
    const er = Math.min(this.width, this.height) * 0.38;

    ctx.save();

    // 1. Luna (a babor de la nave, parte superior izquierda de la Tierra)
    const moonX = this.width * 0.48;
    const moonY = this.height * 0.24;
    const moonR = er * 0.22;

    const moonGrad = ctx.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.3, 4, moonX, moonY, moonR);
    moonGrad.addColorStop(0, "#e2e8f0");
    moonGrad.addColorStop(0.7, "#94a3b8");
    moonGrad.addColorStop(1, "#334155");
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Cráteres de la Luna
    ctx.fillStyle = "rgba(51, 65, 85, 0.35)";
    ctx.beginPath();
    ctx.arc(moonX - moonR * 0.2, moonY - moonR * 0.1, moonR * 0.22, 0, Math.PI * 2);
    ctx.arc(moonX + moonR * 0.25, moonY + moonR * 0.15, moonR * 0.28, 0, Math.PI * 2);
    ctx.arc(moonX - moonR * 0.1, moonY + moonR * 0.4, moonR * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // 2. Halo atmosférico brillante de la Tierra
    const atmGrad = ctx.createRadialGradient(ex, ey, er - 10, ex, ey, er + 55);
    atmGrad.addColorStop(0, "rgba(56, 189, 248, 0.65)");
    atmGrad.addColorStop(0.4, "rgba(14, 165, 233, 0.35)");
    atmGrad.addColorStop(0.8, "rgba(2, 132, 199, 0.12)");
    atmGrad.addColorStop(1, "transparent");
    ctx.fillStyle = atmGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, er + 55, 0, Math.PI * 2);
    ctx.fill();

    // 3. Océanos de la Tierra (globo base)
    const oceanGrad = ctx.createRadialGradient(ex - er * 0.35, ey - er * 0.35, er * 0.1, ex, ey, er);
    oceanGrad.addColorStop(0, "#38bdf8");
    oceanGrad.addColorStop(0.35, "#0284c7");
    oceanGrad.addColorStop(0.8, "#034870");
    oceanGrad.addColorStop(1, "#021c30");
    ctx.fillStyle = oceanGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.fill();

    // 4. Continentes estilizados en verde esmeralda y tierra
    ctx.save();
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = "#15803d";
    // Continente 1 (América / Europa estilizada)
    const rot = this.earthRotation;
    const c1X = ex + Math.sin(rot) * er * 0.45;
    ctx.beginPath();
    ctx.ellipse(c1X, ey - er * 0.1, er * 0.38, er * 0.55, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Continente 2
    ctx.fillStyle = "#16a34a";
    const c2X = ex + Math.sin(rot + 2.2) * er * 0.45;
    ctx.beginPath();
    ctx.ellipse(c2X, ey + er * 0.2, er * 0.32, er * 0.42, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Casquetes polares blancos
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.ellipse(ex, ey - er * 0.92, er * 0.45, er * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ex, ey + er * 0.92, er * 0.4, er * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nubes arremolinadas procedurales
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    this.clouds.forEach((c) => {
      const cx = ex + Math.cos(c.angle + rot * 1.2) * er * c.distRel;
      const cy = ey + Math.sin(c.angle + rot * 1.2) * er * c.distRel * 0.85;
      ctx.beginPath();
      ctx.ellipse(cx, cy, c.radius, c.radius * 0.45, c.angle, 0, Math.PI * 2);
      ctx.fill();
    });

    // Lado nocturno sombreado de la Tierra (Terminador)
    const shadowGrad = ctx.createLinearGradient(ex - er, ey, ex + er, ey);
    shadowGrad.addColorStop(0, "rgba(2, 6, 23, 0)");
    shadowGrad.addColorStop(0.55, "rgba(2, 6, 23, 0.15)");
    shadowGrad.addColorStop(0.85, "rgba(2, 6, 23, 0.7)");
    shadowGrad.addColorStop(1, "rgba(2, 6, 23, 0.92)");
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(ex - er, ey - er, er * 2, er * 2);

    ctx.restore();
    ctx.restore();
  },

  // 15. Paso 3: Órbita terrestre majestuosa con amanecer orbital
  drawEarthOrbitCelebration(ctx) {
    const radius = Math.max(this.width * 1.1, 850);
    const ex = this.width * 0.5;
    const ey = this.height + radius * 0.65;

    ctx.save();

    // Halo de la atmósfera terrestre
    const atmGrad = ctx.createRadialGradient(ex, ey, radius - 20, ex, ey, radius + 75);
    atmGrad.addColorStop(0, "rgba(56, 189, 248, 0.75)");
    atmGrad.addColorStop(0.4, "rgba(14, 165, 233, 0.4)");
    atmGrad.addColorStop(0.75, "rgba(3, 105, 161, 0.12)");
    atmGrad.addColorStop(1, "transparent");
    ctx.fillStyle = atmGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, radius + 75, 0, Math.PI * 2);
    ctx.fill();

    // Superficie de la Tierra curvada en el horizonte
    const earthGrad = ctx.createRadialGradient(ex, ey - radius * 0.8, 50, ex, ey, radius);
    earthGrad.addColorStop(0, "#0284c7");
    earthGrad.addColorStop(0.4, "#0369a1");
    earthGrad.addColorStop(0.8, "#075985");
    earthGrad.addColorStop(1, "#082f49");
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, radius, 0, Math.PI * 2);
    ctx.fill();

    // Continentes verdes iluminados por el amanecer
    ctx.save();
    ctx.beginPath();
    ctx.arc(ex, ey, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = "#15803d";
    ctx.beginPath();
    ctx.ellipse(ex - radius * 0.3, ey - radius * 0.94, radius * 0.3, radius * 0.12, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ex + radius * 0.25, ey - radius * 0.95, radius * 0.35, radius * 0.14, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Luces doradas de ciudades en la zona de penumbra (derecha)
    ctx.fillStyle = "#fef08a";
    for (let i = 0; i < 45; i++) {
      const lx = ex + (0.2 + (i % 9) * 0.05) * radius + (Math.sin(i * 12) * 20);
      const ly = ey - radius + 12 + Math.floor(i / 9) * 10;
      ctx.beginPath();
      ctx.arc(lx, ly, Math.random() * 2 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nubes finas y delgadas en la alta atmósfera
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    for (let i = 0; i < 12; i++) {
      const nx = ex - radius * 0.6 + i * (radius * 0.11);
      const ny = ey - radius + 6 + Math.sin(i * 2 + this.earthRotation) * 6;
      ctx.beginPath();
      ctx.ellipse(nx, ny, 65, 12, 0.05, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Guía orbital estilizada en arco cian suave (marca la órbita de retorno hacia la derecha)
    ctx.save();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(ex, ey, radius + 85, -Math.PI * 0.65, -Math.PI * 0.35);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  },

  // 16. Dibujar el cohete MAV Ares-VII orientado hacia la DERECHA (+X) con estilo cómic NASA
  drawRocket(ctx, x, y, angle, scale, engineType) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    const time = performance.now() * 0.005;

    // --- LLAMA O RAYO PROPULSOR SALIENDO DE LA COLA HACIA LA IZQUIERDA (X < -32) ---
    if (engineType === "fire") {
      const flameLen = 65 + Math.sin(time * 35) * 14;
      const flameW = 16 + Math.sin(time * 28) * 3;

      // Llama exterior naranja
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(-32, -flameW);
      ctx.quadraticCurveTo(-32 - flameLen * 0.6, -flameW * 0.8, -32 - flameLen, 0);
      ctx.quadraticCurveTo(-32 - flameLen * 0.6, flameW * 0.8, -32, flameW);
      ctx.closePath();
      ctx.fill();

      // Llama media amarilla
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(-32, -flameW * 0.65);
      ctx.quadraticCurveTo(-32 - flameLen * 0.45, -flameW * 0.5, -32 - flameLen * 0.72, 0);
      ctx.quadraticCurveTo(-32 - flameLen * 0.45, flameW * 0.5, -32, flameW * 0.65);
      ctx.closePath();
      ctx.fill();

      // Núcleo blanco brillante
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(-32, -flameW * 0.35);
      ctx.quadraticCurveTo(-32 - flameLen * 0.25, -flameW * 0.25, -32 - flameLen * 0.45, 0);
      ctx.quadraticCurveTo(-32 - flameLen * 0.25, flameW * 0.25, -32, flameW * 0.35);
      ctx.closePath();
      ctx.fill();
    } else if (engineType === "ion") {
      // Rayo iónico cian hacia la izquierda con diamantes de choque
      const beamLen = 72 + Math.sin(time * 30) * 8;
      const beamW = 12;

      const ionGrad = ctx.createLinearGradient(-32, 0, -32 - beamLen, 0);
      ionGrad.addColorStop(0, "#ffffff");
      ionGrad.addColorStop(0.2, "#38bdf8");
      ionGrad.addColorStop(0.7, "#818cf8");
      ionGrad.addColorStop(1, "transparent");
      ctx.fillStyle = ionGrad;

      ctx.beginPath();
      ctx.moveTo(-32, -beamW);
      ctx.lineTo(-32 - beamLen, -beamW * 0.3);
      ctx.lineTo(-32 - beamLen, beamW * 0.3);
      ctx.lineTo(-32, beamW);
      ctx.closePath();
      ctx.fill();
    }

    // --- ALETAS Y ALAS DELTA (ARRIBA Y ABAJO) ---
    // Aleta superior
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(-10, -14);
    ctx.lineTo(-28, -32);
    ctx.lineTo(-36, -28);
    ctx.lineTo(-24, -14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ef4444"; // Borde rojo NASA
    ctx.beginPath();
    ctx.moveTo(-28, -32);
    ctx.lineTo(-36, -28);
    ctx.lineTo(-30, -20);
    ctx.closePath();
    ctx.fill();

    // Aleta inferior
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(-10, 14);
    ctx.lineTo(-28, 32);
    ctx.lineTo(-36, 28);
    ctx.lineTo(-24, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ef4444"; // Borde rojo NASA
    ctx.beginPath();
    ctx.moveTo(-28, 32);
    ctx.lineTo(-36, 28);
    ctx.lineTo(-30, 20);
    ctx.closePath();
    ctx.fill();

    // --- TOBERA METÁLICA DEL MOTOR ---
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(-26, -11);
    ctx.lineTo(-34, -13);
    ctx.lineTo(-34, 13);
    ctx.lineTo(-26, 11);
    ctx.closePath();
    ctx.fill();

    // --- FUSELAJE PRINCIPAL DEL COHETE MAV (APUNTANDO A LA DERECHA +X) ---
    const bodyGrad = ctx.createLinearGradient(0, -16, 0, 16);
    bodyGrad.addColorStop(0, "#f8fafc");
    bodyGrad.addColorStop(0.3, "#ffffff");
    bodyGrad.addColorStop(0.7, "#e2e8f0");
    bodyGrad.addColorStop(1, "#94a3b8");
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(-26, -14);
    ctx.lineTo(20, -14);
    // Morro aerodinámico curvado hacia la derecha
    ctx.quadraticCurveTo(42, -12, 54, 0);
    ctx.quadraticCurveTo(42, 12, 20, 14);
    ctx.lineTo(-26, 14);
    ctx.closePath();
    ctx.fill();

    // Placas de escudo térmico en la panza inferior
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(-26, 10);
    ctx.lineTo(20, 10);
    ctx.quadraticCurveTo(40, 9, 54, 0);
    ctx.quadraticCurveTo(42, 14, 20, 14);
    ctx.lineTo(-26, 14);
    ctx.closePath();
    ctx.fill();

    // Franjas características de la NASA (roja y azul)
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(14, -14, 5, 24);
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(8, -14, 4, 24);

    // Cúpula / Ventana de observación (mirando hacia adelante y arriba)
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(28, -5, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(28, -5, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Reflejo blanco en el cristal de la cabina
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.ellipse(26.5, -6.8, 2.5, 1.4, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Nombre "ARES-VII" legible horizontalmente en el lateral del fuselaje
    ctx.fillStyle = "#1e293b";
    ctx.font = "800 6.5px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ARES-VII", -4, 0);

    // Luces de navegación orbital (roja en ala superior, verde en ala inferior, blanca estroboscópica en el morro)
    const blink = Math.sin(time * 18) > 0;
    // Luz roja (ala superior)
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(-32, -29, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Luz verde (ala inferior)
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(-32, 29, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Luz estroboscópica blanca en la punta del morro (mirando a la derecha)
    if (blink) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(54, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  drawEngineParticles(ctx) {
    ctx.save();
    this.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  },

  drawFireworks(ctx) {
    if (this.fireworks.length === 0) return;
    ctx.save();
    this.fireworks.forEach((f) => {
      ctx.fillStyle = f.color;
      ctx.globalAlpha = Math.max(0, f.alpha);
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  },

  drawConfetti(ctx) {
    if (this.confetti.length === 0) return;
    ctx.save();
    this.confetti.forEach((c) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size * 0.55);
      ctx.restore();
    });
    ctx.restore();
  },

  // 17. Omitir cinemática
  skip() {
    this.endOutro();
  },

  // 18. Terminar normalmente
  finish() {
    this.endOutro();
  },

  endOutro() {
    if (!this.active) return;
    this.active = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);

    const overlay = document.getElementById("outro-return-overlay");
    if (overlay) {
      overlay.classList.add("outro-fade-out");
      setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.classList.remove("outro-fade-out");
      }, 400);
    }

    if (typeof this.onCompleteCallback === "function") {
      this.onCompleteCallback();
    }
  }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => OutroReturn.init());
} else {
  OutroReturn.init();
}
