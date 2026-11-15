// js/introAccident.js — Recreación cinemática interactiva del accidente de la nave Ares-VII en Marte
// Proporciona el prólogo narrativo y científico previo al Sol 1 (El Despertar Rojo)

const IntroAccident = {
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
  flameParticles: [],
  dustParticles: [],
  shakeAmount: 0,
  flashAlpha: 0,
  blackoutAlpha: 0,
  marsProgress: 0, // 0 (órbita) a 1 (impacto)
  isCrashing: false,
  isBlackout: false,
  isAwakening: false,

  // Máquina de escribir para diálogos
  typewriterTimer: null,
  fullText: "",
  displayedText: "",
  charIndex: 0,
  isTyping: false,

  // Pasos de la recreación
  narrativeSteps: [
    {
      speaker: "houston",
      speakerName: "HOUSTON // CONTROL DE MISIÓN (NASA)",
      channel: "Canal Tierra-Marte (Telemetría en tiempo real)",
      text: "«Ares-VII, habla Houston. Confirmamos que habéis entrado en la atmósfera marciana según la trayectoria calculada. El escudo térmico resiste a 1.480 °C. Mantened vector de planeo y preparad el encendido de los retrocohetes hacia Arcadia Planitia.»",
      alt: "85.000 m",
      speed: "Mach 24.2",
      temp: "1.480 °C",
      status: "NOMINAL",
      statusClass: "text-green",
      prop: "ACTIVA 100%",
      alarm: false,
      shake: 1.5,
      marsProg: 0.25
    },
    {
      speaker: "houston",
      speakerName: "HOUSTON // CONTROL DE MISIÓN (NASA)",
      channel: "¡CANAL DE EMERGENCIA RED ALERT!",
      text: "«¡Atención Ares-VII! ¡El radar orbital MRO detecta una microráfaga violenta de regolito cruzando vuestro corredor de descenso! ¡Vemos fluctuaciones severas de presión en el propulsor 2! ¡Corregid ángulo de guiado inmediatamente!»",
      alt: "32.000 m",
      speed: "Mach 16.5",
      temp: "1.720 °C",
      status: "¡ALERTA DE PRESIÓN!",
      statusClass: "text-amber",
      prop: "PROPULSOR 2: ERROR",
      alarm: true,
      alarmMain: "¡ANOMALÍA EN DESCENSO!",
      alarmSub: "CAÍDA DE PRESIÓN EN RETROCOHETES POR TORMENTA DE POLVO",
      shake: 5.5,
      marsProg: 0.55
    },
    {
      speaker: "rovi",
      speakerName: "ROVI // COPILOTO ROBÓTICO",
      channel: "Intercomunicador de Cabina Ares-VII",
      text: "«¡BEEP BEEP! ¡Comandante! ¡El retropropulsor secundario ha sufrido un atasco por el polvo marciano! ¡He desplegado el paracaídas supersónico de emergencia, pero los vientos laterales de 180 km/h están desestabilizando la cápsula!»",
      alt: "11.200 m",
      speed: "Mach 6.2",
      temp: "1.250 °C",
      status: "¡FALLO CRÍTICO!",
      statusClass: "text-red",
      prop: "MOTOR OFFLINE",
      alarm: true,
      alarmMain: "¡FALLO DE FRENADO!",
      alarmSub: "VELOCIDAD EXCESIVA PARA ATERRIZAJE NOMINAL",
      shake: 9.0,
      marsProg: 0.78
    },
    {
      speaker: "rovi",
      speakerName: "ROVI // COPILOTO ROBÓTICO",
      channel: "¡¡ALERTA DE IMPACTO INMINENTE!!",
      text: "«¡¡Houston, señal de datos cortada!! ¡Comandante, nos acercamos al suelo a demasiada velocidad! ¡La estructura no resistirá el impacto suave! ¡¡SUJÉTATE CON TODAS TUS FUERZAS, EL IMPACTO ES INEVITABLE EN 3... 2... 1...!!»",
      alt: "1.200 m",
      speed: "Mach 2.8",
      temp: "980 °C",
      status: "¡IMPACTO INMINENTE!",
      statusClass: "text-red",
      prop: "COLAPSO",
      alarm: true,
      alarmMain: "¡¡ALERTA DE COLISIÓN TERRESTRE!!",
      alarmSub: "ACTIVANDO AIRBAGS Y SISTEMAS DE PROTECCIÓN EVA",
      shake: 16.0,
      marsProg: 0.98
    }
  ],

  // 1. Inicialización de listeners del DOM
  init() {
    this.canvas = document.getElementById("intro-accident-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    window.addEventListener("resize", () => {
      if (this.active) this.resizeCanvas();
    });

    // Botón de saltar
    const btnSkip = document.getElementById("btn-skip-intro");
    if (btnSkip) {
      btnSkip.onclick = (e) => {
        e.stopPropagation();
        this.skip();
      };
    }

    // Botón siguiente en el diálogo
    const btnNext = document.getElementById("btn-next-intro-step");
    if (btnNext) {
      btnNext.onclick = (e) => {
        e.stopPropagation();
        this.handleNextInput();
      };
    }

    // Clic en la caja de diálogo para avanzar
    const commBox = document.getElementById("intro-comm-box");
    if (commBox) {
      commBox.onclick = () => this.handleNextInput();
    }

    // Botón final del despertar para entrar a Sol 1
    const btnFinish = document.getElementById("btn-intro-finish");
    if (btnFinish) {
      btnFinish.onclick = () => {
        this.finish();
      };
    }

    // Tecla Espacio o Enter para avanzar
    this.boundKeyHandler = (e) => {
      if (!this.active) return;
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        if (this.isAwakening) {
          this.finish();
        } else if (!this.isCrashing && !this.isBlackout) {
          this.handleNextInput();
        }
      } else if (e.code === "Escape") {
        this.skip();
      }
    };
    window.addEventListener("keydown", this.boundKeyHandler);
  },

  resizeCanvas() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.initStars();
  },

  initStars() {
    this.stars = [];
    const count = Math.min(220, Math.floor(this.width * 0.18));
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * this.width * 2,
        y: (Math.random() - 0.5) * this.height * 2,
        z: Math.random() * this.width,
        pz: Math.random() * this.width
      });
    }
  },

  // 2. Iniciar la reproducción de la recreación
  start(onComplete) {
    this.onCompleteCallback = onComplete;
    this.active = true;
    this.step = 0;
    this.shakeAmount = 0;
    this.flashAlpha = 0;
    this.blackoutAlpha = 0;
    this.marsProgress = 0.15;
    this.isCrashing = false;
    this.isBlackout = false;
    this.isAwakening = false;
    this.flameParticles = [];
    this.dustParticles = [];

    const overlay = document.getElementById("intro-accident-overlay");
    if (overlay) {
      overlay.classList.remove("hidden");
      overlay.classList.remove("intro-fade-out");
    }

    // Ocultar card de despertar si estuviera visible
    const wakeupCard = document.getElementById("intro-wakeup-card");
    if (wakeupCard) wakeupCard.classList.add("hidden");

    const commBox = document.getElementById("intro-comm-box");
    if (commBox) commBox.classList.remove("hidden");

    this.resizeCanvas();

    // Iniciar bucle de animación
    if (this.animId) cancelAnimationFrame(this.animId);
    this.lastTime = performance.now();
    this.animate();

    // Cargar el paso 0
    this.loadStep(0);
  },

  // 3. Cargar un paso narrativo
  loadStep(idx) {
    if (idx >= this.narrativeSteps.length) {
      this.triggerCrashSequence();
      return;
    }

    this.step = idx;
    const data = this.narrativeSteps[idx];

    this.shakeAmount = data.shake;
    this.marsProgress = data.marsProg;

    // Actualizar telemetría visual en el HUD
    const altEl = document.getElementById("telemetry-alt");
    const speedEl = document.getElementById("telemetry-speed");
    const tempEl = document.getElementById("telemetry-temp");
    const statusEl = document.getElementById("telemetry-status");
    const propEl = document.getElementById("telemetry-prop");

    if (altEl) altEl.textContent = data.alt;
    if (speedEl) speedEl.textContent = data.speed;
    if (tempEl) tempEl.textContent = data.temp;

    if (statusEl) {
      statusEl.textContent = data.status;
      statusEl.className = `gauge-value ${data.statusClass}`;
    }

    if (propEl) {
      propEl.textContent = data.prop;
      propEl.className = `gauge-value ${data.alarm ? "text-red" : "text-green"}`;
    }

    // Banner de alarma
    const alarmBanner = document.getElementById("intro-alarm-banner");
    const alarmMain = document.getElementById("alarm-main-text");
    const alarmSub = document.getElementById("alarm-sub-text");
    if (alarmBanner) {
      if (data.alarm) {
        alarmBanner.classList.remove("hidden");
        if (alarmMain) alarmMain.textContent = data.alarmMain;
        if (alarmSub) alarmSub.textContent = data.alarmSub;
      } else {
        alarmBanner.classList.add("hidden");
      }
    }

    // Cabecera del interlocutor
    const speakerName = document.getElementById("intro-speaker-name");
    const commChannel = document.getElementById("intro-comm-channel");
    const speakerAvatar = document.getElementById("intro-speaker-avatar");

    if (speakerName) speakerName.textContent = data.speakerName;
    if (commChannel) commChannel.textContent = data.channel;

    if (speakerAvatar) {
      speakerAvatar.className = `speaker-avatar ${data.speaker === "rovi" ? "rovi-speaker-avatar" : "houston-avatar"}`;
      if (data.speaker === "rovi") {
        speakerAvatar.innerHTML = `
          <div class="rovi-face-avatar">
            <div class="rovi-antenna"></div>
            <div class="rovi-head ${data.alarm ? "rovi-head-alert" : ""}">
              <div class="rovi-eyes"><span class="eye"></span><span class="eye"></span></div>
              <div class="rovi-smile ${data.alarm ? "rovi-scared" : ""}"></div>
            </div>
          </div>
        `;
      } else {
        speakerAvatar.innerHTML = `<span class="houston-icon">&#128225;</span>`;
      }
    }

    // Contador de paso
    const stepHint = document.getElementById("intro-step-hint");
    if (stepHint) {
      stepHint.textContent = `Paso ${idx + 1} / ${this.narrativeSteps.length} • Pulsa ESPACIO o Siguiente`;
    }

    // Efectos de sonido según el paso
    if (typeof SoundFx !== "undefined") {
      if (data.speaker === "rovi") {
        SoundFx.playRoviChirp();
      } else {
        SoundFx.playStaticRadio(0.4);
      }

      if (data.alarm) {
        SoundFx.playAlarmSiren();
      }
    }

    // Iniciar máquina de escribir
    this.startTypewriter(data.text);
  },

  // 4. Mecanografía de diálogo
  startTypewriter(text) {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    this.fullText = text;
    this.displayedText = "";
    this.charIndex = 0;
    this.isTyping = true;

    const textEl = document.getElementById("intro-speech-text");
    if (textEl) textEl.textContent = "";

    this.typewriterTimer = setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.displayedText += this.fullText.charAt(this.charIndex);
        this.charIndex++;
        if (textEl) textEl.textContent = this.displayedText;

        // Sonido de tipeo cada 4 caracteres
        if (this.charIndex % 4 === 0 && typeof SoundFx !== "undefined") {
          SoundFx.playTypingBlip();
        }
      } else {
        this.isTyping = false;
        clearInterval(this.typewriterTimer);
      }
    }, 24);
  },

  handleNextInput() {
    if (this.isCrashing || this.isBlackout || this.isAwakening) return;

    if (this.isTyping) {
      // Si todavía estaba escribiendo, completar de golpe
      clearInterval(this.typewriterTimer);
      this.isTyping = false;
      this.displayedText = this.fullText;
      const textEl = document.getElementById("intro-speech-text");
      if (textEl) textEl.textContent = this.fullText;
    } else {
      // Avanzar al siguiente paso
      this.loadStep(this.step + 1);
    }
  },

  // 5. Secuencia dramática del impacto (Crash & Flash)
  triggerCrashSequence() {
    this.isCrashing = true;
    this.shakeAmount = 28; // Terremoto de pantalla

    // Reproducir gran impacto sónico y explosión
    if (typeof SoundFx !== "undefined") {
      SoundFx.playCrashImpact();
    }

    // Flash blanco/naranja cegador
    this.flashAlpha = 1.0;

    // Ocultar caja de diálogo y alarmas
    const commBox = document.getElementById("intro-comm-box");
    const alarmBanner = document.getElementById("intro-alarm-banner");
    if (commBox) commBox.classList.add("hidden");
    if (alarmBanner) alarmBanner.classList.add("hidden");

    // Tras 350ms, fundir a negro absoluto (blackout)
    setTimeout(() => {
      this.isBlackout = true;
      this.blackoutAlpha = 1.0;
      this.shakeAmount = 0;

      // Sonido de soporte vital débil en el silencio (después de 700ms)
      setTimeout(() => {
        if (typeof SoundFx !== "undefined") SoundFx.playLifeSupportBeep();
      }, 700);

      setTimeout(() => {
        if (typeof SoundFx !== "undefined") SoundFx.playLifeSupportBeep();
      }, 1400);

      // Despertar tras 2.2 segundos de silencio
      setTimeout(() => {
        this.triggerAwakeningSequence();
      }, 2200);
    }, 380);
  },

  // 6. Secuencia del despertar en el Outpost Beta (Sol 1)
  triggerAwakeningSequence() {
    this.isBlackout = false;
    this.isAwakening = true;

    // Inicializar partículas de polvo marciano flotante
    this.dustParticles = [];
    for (let i = 0; i < 45; i++) {
      this.dustParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.3 - 0.1,
        size: Math.random() * 3.5 + 1.2,
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    if (typeof SoundFx !== "undefined") {
      SoundFx.playRoviChirp();
    }

    // Mostrar tarjeta de despertar
    const wakeupCard = document.getElementById("intro-wakeup-card");
    if (wakeupCard) {
      wakeupCard.classList.remove("hidden");
      wakeupCard.classList.add("wakeup-card-enter");
    }
  },

  // 7. Bucle principal de animación Canvas
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
    // Reducción suave del temblor
    if (this.shakeAmount > 0 && !this.isCrashing) {
      this.shakeAmount = Math.max(0.5, this.shakeAmount - delta * 0.5);
    }

    // Desvanecimiento del destello
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - delta * 2.2);
    }

    if (!this.isAwakening && !this.isBlackout) {
      // 1. Simulación de estrellas con warp speed
      const speed = this.isCrashing ? 75 : 18 + this.step * 14;
      this.stars.forEach((s) => {
        s.pz = s.z;
        s.z -= speed;
        if (s.z <= 0) {
          s.z = this.width;
          s.pz = this.width;
          s.x = (Math.random() - 0.5) * this.width * 2;
          s.y = (Math.random() - 0.5) * this.height * 2;
        }
      });

      // 2. Partículas de fuego de reentrada
      const spawnCount = 2 + this.step * 3;
      for (let i = 0; i < spawnCount; i++) {
        const side = Math.random() < 0.5 ? -1 : 1;
        this.flameParticles.push({
          x: this.width / 2 + side * (this.width * 0.35 + Math.random() * this.width * 0.18),
          y: this.height + 20,
          vx: -side * (Math.random() * 90 + 30),
          vy: -(Math.random() * 450 + 280),
          size: Math.random() * 8 + 4,
          life: 1.0,
          color: Math.random() < 0.4 ? "#f97316" : Math.random() < 0.7 ? "#ef4444" : "#facc15"
        });
      }

      for (let i = this.flameParticles.length - 1; i >= 0; i--) {
        const p = this.flameParticles[i];
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.life -= delta * 1.8;
        if (p.life <= 0) this.flameParticles.splice(i, 1);
      }
    } else if (this.isAwakening) {
      // Partículas de polvo flotante tras el choque
      this.dustParticles.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.y < -10) d.y = this.height + 10;
        if (d.x < -10) d.x = this.width + 10;
        if (d.x > this.width + 10) d.x = -10;
      });
    }
  },

  // 9. Renderizado gráfico
  render() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.save();

    // Aplicar temblor de cámara (Screen Shake)
    if (this.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * this.shakeAmount * 2;
      const sy = (Math.random() - 0.5) * this.shakeAmount * 2;
      ctx.translate(sx, sy);
    }

    // Fondo del espacio o de la atmósfera
    if (this.isBlackout) {
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
      return;
    }

    if (this.isAwakening) {
      // Atmósfera de Marte tras el despertar: polvo rojo y luz de emergencia
      const grad = ctx.createLinearGradient(0, 0, 0, this.height);
      grad.addColorStop(0, "#2d0f0a");
      grad.addColorStop(0.5, "#4a190f");
      grad.addColorStop(1, "#832e18");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Dibujar partículas de regolito flotando
      this.dustParticles.forEach((d) => {
        ctx.fillStyle = `rgba(251, 146, 60, ${d.alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Efecto de fisuras en el cristal del casco EVA
      this.drawVisorCracks(ctx);

      ctx.restore();
      return;
    }

    // Degradado del cielo espacial a reentrada marciana
    const atmGrad = ctx.createRadialGradient(
      this.width / 2, this.height * 0.7, 50,
      this.width / 2, this.height * 0.7, this.width * 0.8
    );
    const marsHue = Math.min(1, this.marsProgress);
    atmGrad.addColorStop(0, `rgba(184, 75, 46, ${0.15 + marsHue * 0.55})`);
    atmGrad.addColorStop(0.5, `rgba(74, 25, 15, ${0.4 + marsHue * 0.4})`);
    atmGrad.addColorStop(1, "#050811");
    ctx.fillStyle = atmGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 1. Campo de estrellas con warp lines
    const cx = this.width / 2;
    const cy = this.height * 0.45;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 1.6;

    this.stars.forEach((s) => {
      const k = 280 / s.z;
      const px = s.x * k + cx;
      const py = s.y * k + cy;

      const pk = 280 / s.pz;
      const prevX = s.x * pk + cx;
      const prevY = s.y * pk + cy;

      if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
    });

    // 2. Planeta Marte aproximándose
    this.drawApproachingMars(ctx, cx, cy);

    // 3. Fuego de reentrada (Llamas de plasma)
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    this.flameParticles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 4. Marco de la cabina y mira de puntería (Cockpit HUD)
    this.drawCockpitFrame(ctx);

    // 5. Destello cegador de impacto (Flash blanco/naranja)
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.fillStyle = `rgba(249, 115, 22, ${this.flashAlpha * 0.6})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore();
  },

  // 10. Dibujar a Marte agrandándose en el visor
  drawApproachingMars(ctx, cx, cy) {
    const p = Math.min(1.2, this.marsProgress);
    // Radio creciente de Marte
    const radius = Math.min(this.width * 0.85, 90 + p * this.width * 0.6);
    const marsY = cy + (1 - p) * 120 + p * 180;

    // Halo atmosférico marciano
    const halo = ctx.createRadialGradient(cx, marsY, radius * 0.75, cx, marsY, radius * 1.25);
    halo.addColorStop(0, "rgba(249, 115, 22, 0.5)");
    halo.addColorStop(0.5, "rgba(239, 68, 68, 0.25)");
    halo.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, marsY, radius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // Esfera del planeta Marte con textura e iluminación
    const marsGrad = ctx.createRadialGradient(cx - radius * 0.3, marsY - radius * 0.3, radius * 0.1, cx, marsY, radius);
    marsGrad.addColorStop(0, "#c25438");
    marsGrad.addColorStop(0.5, "#933c24");
    marsGrad.addColorStop(0.85, "#602113");
    marsGrad.addColorStop(1, "#270c06");

    ctx.fillStyle = marsGrad;
    ctx.beginPath();
    ctx.arc(cx, marsY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Detalles procedimentales de la superficie (Cráteres y valles)
    ctx.save();
    ctx.clip(); // Limitar al círculo de Marte

    ctx.fillStyle = "rgba(43, 14, 8, 0.4)";
    // Valles Marineris (hendidura central)
    ctx.beginPath();
    ctx.ellipse(cx + radius * 0.1, marsY - radius * 0.1, radius * 0.45, radius * 0.08, 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Cráteres de Arcadia Planitia
    const craters = [
      { ox: -0.25, oy: -0.2, r: 0.12 },
      { ox: 0.35, oy: 0.15, r: 0.16 },
      { ox: -0.1, oy: 0.3, r: 0.09 },
      { ox: 0.18, oy: -0.32, r: 0.08 }
    ];
    craters.forEach((c) => {
      ctx.beginPath();
      ctx.arc(cx + radius * c.ox, marsY + radius * c.oy, radius * c.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(40, 12, 7, 0.35)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(217, 119, 87, 0.4)";
      ctx.stroke();
    });

    // Cúpula del Outpost Beta acercándose en el paso final
    if (this.step >= 3) {
      const domeX = cx + (Math.sin(performance.now() * 0.005) * 8);
      const domeY = marsY - radius * 0.15;
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(domeX, domeY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Etiqueta holográfica Outpost Beta
      ctx.font = "bold 11px Fredoka, sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("OUTPOST BETA (200m)", domeX + 14, domeY + 4);
    }

    ctx.restore();
  },

  // 11. Marco futurista de cabina de nave
  drawCockpitFrame(ctx) {
    const w = this.width;
    const h = this.height;

    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 2;

    // Mira central de aterrizaje (Crosshair)
    const cx = w / 2;
    const cy = h * 0.45;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.moveTo(cx - 55, cy);
    ctx.lineTo(cx - 20, cy);
    ctx.moveTo(cx + 20, cy);
    ctx.lineTo(cx + 55, cy);
    ctx.moveTo(cx, cy - 55);
    ctx.lineTo(cx, cy - 20);
    ctx.moveTo(cx, cy + 20);
    ctx.lineTo(cx, cy + 55);
    ctx.stroke();

    // Horizonte artificial oscilante por la turbulencia
    const tilt = (this.step >= 1 ? Math.sin(performance.now() * 0.008) * 0.25 : 0);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.strokeStyle = this.step >= 2 ? "#ef4444" : "#22c55e";
    ctx.beginPath();
    ctx.moveTo(-70, 0);
    ctx.lineTo(70, 0);
    ctx.stroke();
    ctx.restore();

    // Esquinas oscuras de la estructura de la cabina
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.15, 0);
    ctx.lineTo(0, h * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w * 0.85, 0);
    ctx.lineTo(w, h * 0.2);
    ctx.closePath();
    ctx.fill();
  },

  // 12. Fisuras en el visor del casco tras el impacto
  drawVisorCracks(ctx) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 2;

    // Fractura en la esquina superior derecha
    ctx.beginPath();
    ctx.moveTo(this.width - 20, 20);
    ctx.lineTo(this.width - 120, 80);
    ctx.lineTo(this.width - 180, 70);
    ctx.lineTo(this.width - 240, 130);

    ctx.moveTo(this.width - 120, 80);
    ctx.lineTo(this.width - 150, 160);
    ctx.lineTo(this.width - 210, 190);

    // Fractura en la esquina inferior izquierda
    ctx.moveTo(30, this.height - 30);
    ctx.lineTo(130, this.height - 110);
    ctx.lineTo(210, this.height - 90);
    ctx.lineTo(280, this.height - 160);
    ctx.stroke();
  },

  // 13. Omitir intro (Saltar directamente al juego)
  skip() {
    this.endIntro();
  },

  // 14. Terminar la intro y pasar al juego
  finish() {
    this.endIntro();
  },

  endIntro() {
    if (!this.active) return;
    this.active = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);

    const overlay = document.getElementById("intro-accident-overlay");
    if (overlay) {
      overlay.classList.add("intro-fade-out");
      setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.classList.remove("intro-fade-out");
      }, 400);
    }

    if (typeof SoundFx !== "undefined") {
      SoundFx.playSuccess();
    }

    if (typeof this.onCompleteCallback === "function") {
      this.onCompleteCallback();
    }
  }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => IntroAccident.init());
} else {
  IntroAccident.init();
}
