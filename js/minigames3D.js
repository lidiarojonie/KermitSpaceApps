// js/minigames3D.js — Minijuegos 3D Originales en Three.js para Ninos (7-12 anos)
// Reto NASA Space Apps Challenge 2026: Build a Junior Astronaut Mission Trainer
// Cero emojis en todo el codigo y textos. Diseno tactil, divertido y educativo.

const Minigames3D = {
  activeGame: null,
  container: null,
  canvasWrap: null,
  scene: null,
  camera: null,
  renderer: null,
  clock: null,
  animId: null,
  isEnded: false,

  // Estado del juego en curso
  choice: null,
  onCompleteCallback: null,
  timeRemaining: 25,
  score: 0,
  tier: "good",
  gameData: {},

  // Controles
  keys: {},
  pointerX: 0,
  pointerY: 0,
  isPointerDown: false,
  boundKeydown: null,
  boundKeyup: null,
  boundPointerMove: null,
  boundPointerDown: null,
  boundPointerUp: null,
  boundResize: null,

  // Registro de minijuegos 3D soportados
  supportedGames: [
    "MinigameRoverRace3D",
    "MinigameMavLaunch3D",
    "MinigameEvaRepair3D",
    "MinigamePixlLaser3D"
  ],

  has(minigameKey) {
    return this.supportedGames.includes(minigameKey);
  },

  // 1. Inicializacion y arranque del minijuego 3D
  start(minigameKey, choice, onComplete) {
    this.choice = choice;
    this.onCompleteCallback = onComplete;
    this.activeGame = minigameKey;
    this.isEnded = false;
    this.score = 0;
    this.keys = {};
    this.pointerX = 0;
    this.pointerY = 0;
    this.isPointerDown = false;

    // Obtener contenedor overlay
    this.container = document.getElementById("minigame-3d-overlay");
    this.canvasWrap = document.getElementById("minigame-3d-canvas-wrap");

    if (!this.container || !this.canvasWrap) {
      console.error("Minigames3D: Elementos del DOM no encontrados");
      if (onComplete) onComplete({ tier: "good", score: 100, minigameName: "Operacion 3D" });
      return;
    }

    // Mostrar overlay en pantalla completa
    this.container.classList.remove("hidden");

    // Inicializar Three.js
    if (typeof THREE === "undefined") {
      console.error("Minigames3D: THREE.js no esta cargado");
      if (onComplete) onComplete({ tier: "good", score: 100, minigameName: "Operacion 3D" });
      return;
    }

    const width = window.innerWidth || 960;
    const height = window.innerHeight || 600;

    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 500);

    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.canvasWrap.innerHTML = "";
      this.canvasWrap.appendChild(this.renderer.domElement);
    } catch (e) {
      console.error("Minigames3D: Error creando WebGLRenderer", e);
      if (onComplete) onComplete({ tier: "good", score: 100, minigameName: "Operacion 3D" });
      return;
    }

    this.setupListeners();
    this.setupTouchControls();

    // Inicializar la escena especifica
    if (minigameKey === "MinigameRoverRace3D") {
      this.initRoverRace();
    } else if (minigameKey === "MinigameMavLaunch3D") {
      this.initMavLaunch();
    } else if (minigameKey === "MinigameEvaRepair3D") {
      this.initEvaRepair();
    } else if (minigameKey === "MinigamePixlLaser3D") {
      this.initPixlLaser();
    } else {
      this.initRoverRace();
    }

    this.updateHUD();

    // Iniciar bucle de animacion
    if (this.animId) cancelAnimationFrame(this.animId);
    this.animate();
  },

  // 2. Gestion de eventos de teclado, raton y pantalla tactil
  setupListeners() {
    this.boundKeydown = (e) => {
      this.keys[e.code] = true;
      if (e.code === "Space") e.preventDefault();
    };
    this.boundKeyup = (e) => {
      this.keys[e.code] = false;
    };
    this.boundPointerMove = (e) => {
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      this.pointerX = (clientX / width) * 2 - 1;
      this.pointerY = -(clientY / height) * 2 + 1;
    };
    this.boundPointerDown = (e) => {
      this.isPointerDown = true;
      this.boundPointerMove(e);
    };
    this.boundPointerUp = () => {
      this.isPointerDown = false;
    };
    this.boundResize = () => {
      if (!this.renderer || !this.camera) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
    };

    window.addEventListener("keydown", this.boundKeydown);
    window.addEventListener("keyup", this.boundKeyup);
    window.addEventListener("resize", this.boundResize);

    const canvas = this.renderer.domElement;
    canvas.addEventListener("mousemove", this.boundPointerMove);
    canvas.addEventListener("mousedown", this.boundPointerDown);
    window.addEventListener("mouseup", this.boundPointerUp);

    canvas.addEventListener("touchmove", this.boundPointerMove, { passive: true });
    canvas.addEventListener("touchstart", this.boundPointerDown, { passive: true });
    window.addEventListener("touchend", this.boundPointerUp);
  },

  setupTouchControls() {
    const btnLeft = document.getElementById("m3d-btn-left");
    const btnRight = document.getElementById("m3d-btn-right");
    const btnAction = document.getElementById("m3d-btn-action");

    if (btnLeft) {
      btnLeft.onmousedown = btnLeft.ontouchstart = (e) => {
        e.preventDefault();
        this.keys["ArrowLeft"] = true;
      };
      btnLeft.onmouseup = btnLeft.ontouchend = () => {
        this.keys["ArrowLeft"] = false;
      };
    }

    if (btnRight) {
      btnRight.onmousedown = btnRight.ontouchstart = (e) => {
        e.preventDefault();
        this.keys["ArrowRight"] = true;
      };
      btnRight.onmouseup = btnRight.ontouchend = () => {
        this.keys["ArrowRight"] = false;
      };
    }

    if (btnAction) {
      btnAction.onmousedown = btnAction.ontouchstart = (e) => {
        e.preventDefault();
        this.keys["Space"] = true;
        this.isPointerDown = true;
      };
      btnAction.onmouseup = btnAction.ontouchend = () => {
        this.keys["Space"] = false;
        this.isPointerDown = false;
      };
    }
  },

  // 3. Bucle de animacion principal
  animate() {
    if (this.isEnded) return;
    this.animId = requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // Actualizar temporizador
    this.timeRemaining -= delta;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.finishGame();
      return;
    }

    // Actualizar logica del minijuego especifico
    if (this.activeGame === "MinigameRoverRace3D") {
      this.updateRoverRace(delta, elapsed);
    } else if (this.activeGame === "MinigameMavLaunch3D") {
      this.updateMavLaunch(delta, elapsed);
    } else if (this.activeGame === "MinigameEvaRepair3D") {
      this.updateEvaRepair(delta, elapsed);
    } else if (this.activeGame === "MinigamePixlLaser3D") {
      this.updatePixlLaser(delta, elapsed);
    }

    this.updateHUD();
    this.renderer.render(this.scene, this.camera);
  },

  // 4. Actualizacion del HUD
  updateHUD() {
    const timerEl = document.getElementById("m3d-timer-val");
    const scoreEl = document.getElementById("m3d-score-val");
    const starsEl = document.getElementById("m3d-stars-val");

    if (timerEl) {
      timerEl.textContent = `${Math.ceil(this.timeRemaining)}s`;
    }

    if (scoreEl) {
      scoreEl.textContent = `${this.score}`;
    }

    if (starsEl) {
      let tierLabel = "1 Estrella";
      if (this.tier === "excellent") tierLabel = "3 Estrellas: Excelente";
      else if (this.tier === "good") tierLabel = "2 Estrellas: Buen Trabajo";
      else tierLabel = "1 Estrella: Valioso";
      starsEl.textContent = tierLabel;
    }
  },

  // 5. Finalizacion del minijuego
  finishGame() {
    if (this.isEnded) return;
    this.isEnded = true;

    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    // Recalcular nivel de recompensa segun la puntuacion final alcanzada
    if (this.activeGame === "MinigameRoverRace3D") {
      if (this.score >= 80) this.tier = "excellent";
      else if (this.score >= 45) this.tier = "good";
      else this.tier = "fair";
    } else if (this.activeGame === "MinigameMavLaunch3D") {
      if (this.score >= 90) this.tier = "excellent";
      else if (this.score >= 50) this.tier = "good";
      else this.tier = "fair";
    } else if (this.activeGame === "MinigameEvaRepair3D") {
      if (this.score >= 100) this.tier = "excellent";
      else if (this.score >= 50) this.tier = "good";
      else this.tier = "fair";
    } else if (this.activeGame === "MinigamePixlLaser3D") {
      if (this.score >= 100) this.tier = "excellent";
      else if (this.score >= 50) this.tier = "good";
      else this.tier = "fair";
    }

    // Efecto de sonido final
    if (typeof SoundFx !== "undefined") {
      if (this.tier === "excellent" || this.tier === "good") {
        SoundFx.playSuccess();
      } else {
        SoundFx.playResourceGain();
      }
    }

    // Mostrar feedback en la guia de controles
    const instrText = document.getElementById("m3d-instructions-text");
    if (instrText) {
      instrText.textContent = `Mision Cumplida. Puntuacion: ${this.score} pts. Transfiriendo recursos a la base...`;
    }

    setTimeout(() => {
      this.cleanup();
      if (this.onCompleteCallback) {
        this.onCompleteCallback({
          tier: this.tier,
          score: this.score,
          minigameName: this.choice.minigameTitle || "Operacion 3D"
        });
      }
    }, 1400);
  },

  // 6. Limpieza completa de memoria y listeners
  cleanup() {
    if (this.container) {
      this.container.classList.add("hidden");
    }

    window.removeEventListener("keydown", this.boundKeydown);
    window.removeEventListener("keyup", this.boundKeyup);
    window.removeEventListener("resize", this.boundResize);
    window.removeEventListener("mouseup", this.boundPointerUp);
    window.removeEventListener("touchend", this.boundPointerUp);

    if (this.canvasWrap) {
      this.canvasWrap.innerHTML = "";
    }

    // Disponer geometrias y materiales de la escena
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      this.scene = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.activeGame = null;
    this.gameData = {};
  },

  // =========================================================================
  // MINIJUEGO 1: CARRERA DEL ROVER ROVI EN CANON MARCIANO (Three.js)
  // =========================================================================
  initRoverRace() {
    this.timeRemaining = 24;
    this.score = 0;
    this.tier = "fair";

    const titleEl = document.getElementById("m3d-game-title");
    const labelEl = document.getElementById("m3d-score-label");
    const instrEl = document.getElementById("m3d-instructions-text");

    if (titleEl) titleEl.textContent = "Carrera de ROVI en el Canon Marciano";
    if (labelEl) labelEl.textContent = "Cristales";
    if (instrEl) instrEl.textContent = "Usa A/D, Flechas o Arrastra para recoger cristales de hielo azul y esquivar rocas rojas.";

    // Cielo marciano y niebla
    this.scene.background = new THREE.Color(0xb84b2e);
    this.scene.fog = new THREE.Fog(0xb84b2e, 18, 120);

    // Iluminacion
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.9);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.position.set(10, 24, 20);
    sunLight.castShadow = true;
    this.scene.add(sunLight);

    // Suelo del canon en movimiento continuo
    const canyonFloorGeo = new THREE.PlaneGeometry(24, 160, 24, 80);
    canyonFloorGeo.rotateX(-Math.PI / 2);
    const canyonFloorMat = new THREE.MeshStandardMaterial({
      color: 0x933c24,
      roughness: 0.85,
      metalness: 0.1
    });
    const floorMesh1 = new THREE.Mesh(canyonFloorGeo, canyonFloorMat);
    const floorMesh2 = new THREE.Mesh(canyonFloorGeo, canyonFloorMat);
    floorMesh1.position.set(0, 0, 0);
    floorMesh2.position.set(0, 0, 160);
    floorMesh1.receiveShadow = true;
    floorMesh2.receiveShadow = true;
    this.scene.add(floorMesh1);
    this.scene.add(floorMesh2);

    // Paredes laterales del canon (acantilados de regolito)
    const wallGeo = new THREE.BoxGeometry(6, 12, 160);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x6e2a18, roughness: 0.9 });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(14, 5, 40);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.position.set(-14, 5, 40);
    this.scene.add(rightWall);

    // Rover ROVI en 3D
    const roverGroup = new THREE.Group();
    const chassisGeo = new THREE.BoxGeometry(2.2, 0.8, 2.8);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.4 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.9;
    chassis.castShadow = true;
    roverGroup.add(chassis);

    // 6 Ruedas giratorias
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const wheels = [];
    const wheelPositions = [
      [-1.2, 0.38, -0.9], [1.2, 0.38, -0.9],
      [-1.2, 0.38, 0],    [1.2, 0.38, 0],
      [-1.2, 0.38, 0.9],  [1.2, 0.38, 0.9]
    ];
    wheelPositions.forEach((pos) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(pos[0], pos[1], pos[2]);
      roverGroup.add(w);
      wheels.push(w);
    });

    // Mastil con camara
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    mast.position.set(0.5, 1.8, -0.6);
    roverGroup.add(mast);

    const cameraHead = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.35), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    cameraHead.position.set(0.5, 2.5, -0.6);
    roverGroup.add(cameraHead);

    roverGroup.position.set(0, 0, 0);
    this.scene.add(roverGroup);

    // Posicionar camara detras del Rover
    this.camera.position.set(0, 4.5, -7);
    this.camera.lookAt(0, 1.2, 8);

    // Sistema de elementos interactivos (Hielo, Cristales y Rocas)
    const items = [];
    const crystalGeo = new THREE.OctahedronGeometry(0.7, 0);
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8 });

    const rockGeo = new THREE.DodecahedronGeometry(0.9, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x572014, roughness: 0.9 });

    const ringGeo = new THREE.TorusGeometry(1.6, 0.15, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    for (let i = 0; i < 18; i++) {
      const isRock = i % 3 === 0;
      const isRing = i % 6 === 5;
      let mesh;

      if (isRing) {
        mesh = new THREE.Mesh(ringGeo, ringMat);
        mesh.userData = { type: "turbo", value: 15 };
      } else if (isRock) {
        mesh = new THREE.Mesh(rockGeo, rockMat);
        mesh.userData = { type: "rock", value: -5 };
      } else {
        mesh = new THREE.Mesh(crystalGeo, crystalMat);
        mesh.userData = { type: "crystal", value: 10 };
      }

      mesh.position.set((Math.random() - 0.5) * 12, isRing ? 1.6 : 0.8, 20 + i * 16);
      this.scene.add(mesh);
      items.push(mesh);
    }

    this.gameData = {
      rover: roverGroup,
      wheels: wheels,
      items: items,
      floor1: floorMesh1,
      floor2: floorMesh2,
      roverX: 0,
      targetX: 0,
      speed: 28,
      bumpTimer: 0
    };
  },

  updateRoverRace(delta, elapsed) {
    const d = this.gameData;

    // Manejo de entrada: la cámara mira hacia +Z (Pantalla Izquierda = +X, Pantalla Derecha = -X)
    let moveDir = 0;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) moveDir += 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) moveDir -= 1;

    // Control tactil / puntero
    if (this.isPointerDown) {
      d.targetX = -this.pointerX * 7.5;
    } else if (moveDir !== 0) {
      d.targetX += moveDir * 18 * delta;
    }

    // Limites de la pista del canon
    d.targetX = Math.max(-6.5, Math.min(6.5, d.targetX));
    d.roverX += (d.targetX - d.roverX) * 0.18;
    d.rover.position.x = d.roverX;

    // Inclinacion dinamica al girar
    d.rover.rotation.z = -(d.targetX - d.roverX) * 0.12;
    d.rover.rotation.y = (d.targetX - d.roverX) * 0.08;

    // Giro de ruedas
    d.wheels.forEach((w) => {
      w.rotation.x += delta * 16;
    });

    // Efecto de rebote si choco
    if (d.bumpTimer > 0) {
      d.bumpTimer -= delta;
      this.camera.position.x = (Math.random() - 0.5) * 0.35;
      this.camera.position.y = 4.5 + (Math.random() - 0.5) * 0.35;
    } else {
      this.camera.position.x = d.roverX * 0.45;
      this.camera.position.y = 4.5;
    }

    // Movimiento del suelo
    d.floor1.position.z -= d.speed * delta;
    d.floor2.position.z -= d.speed * delta;
    if (d.floor1.position.z <= -80) d.floor1.position.z = d.floor2.position.z + 160;
    if (d.floor2.position.z <= -80) d.floor2.position.z = d.floor1.position.z + 160;

    // Desplazamiento y colisiones de objetos
    d.items.forEach((item) => {
      item.position.z -= d.speed * delta;

      if (item.userData.type === "crystal") {
        item.rotation.y += delta * 2.5;
        item.rotation.x += delta * 1.5;
      } else if (item.userData.type === "turbo") {
        item.rotation.z += delta * 3;
      }

      // Comprobar colision con el rover (cerca de Z = 0)
      if (Math.abs(item.position.z) < 1.4 && Math.abs(item.position.x - d.roverX) < 1.6) {
        if (!item.userData.collected) {
          item.userData.collected = true;
          item.visible = false;

          if (item.userData.type === "crystal") {
            this.score += item.userData.value;
            if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
          } else if (item.userData.type === "turbo") {
            this.score += item.userData.value;
            d.speed = 42;
            setTimeout(() => { d.speed = 28; }, 2200);
            if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
          } else if (item.userData.type === "rock") {
            this.score = Math.max(0, this.score + item.userData.value);
            d.bumpTimer = 0.3;
            if (typeof SoundFx !== "undefined") SoundFx.playAlert();
          }
        }
      }

      // Reciclar objetos detras de la camara hacia el frente
      if (item.position.z < -10) {
        item.position.z += 16 * d.items.length;
        item.position.x = (Math.random() - 0.5) * 12;
        item.visible = true;
        item.userData.collected = false;
      }
    });

    // Evaluar rendimiento
    if (this.score >= 80) this.tier = "excellent";
    else if (this.score >= 45) this.tier = "good";
    else this.tier = "fair";
  },

  // =========================================================================
  // MINIJUEGO 2: VUELO Y ASCENSO ORBITAL DEL COHETE MAV (Three.js)
  // =========================================================================
  initMavLaunch() {
    this.timeRemaining = 25;
    this.score = 0;
    this.tier = "fair";

    const titleEl = document.getElementById("m3d-game-title");
    const labelEl = document.getElementById("m3d-score-label");
    const instrEl = document.getElementById("m3d-instructions-text");

    if (titleEl) titleEl.textContent = "Ascenso Orbital del Cohete MAV";
    if (labelEl) labelEl.textContent = "Telemetria";
    if (instrEl) instrEl.textContent = "Mueve el raton o usa Flechas/WASD para atravesar los anillos verdes hacia la orbita.";

    // Cielo marciano que oscurecera conforme se asciende
    this.scene.background = new THREE.Color(0xb84b2e);
    this.scene.fog = new THREE.Fog(0xb84b2e, 20, 220);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.0);
    sunLight.position.set(0, 40, -20);
    this.scene.add(sunLight);

    // Planeta Marte en el fondo (curvatura)
    const marsGlobeGeo = new THREE.SphereGeometry(80, 32, 32);
    const marsGlobeMat = new THREE.MeshStandardMaterial({ color: 0x933c24, roughness: 0.9 });
    const marsGlobe = new THREE.Mesh(marsGlobeGeo, marsGlobeMat);
    marsGlobe.position.set(0, -82, 30);
    this.scene.add(marsGlobe);

    // Modelo 3D del Cohete MAV
    const rocketGroup = new THREE.Group();

    // Fuselaje principal
    const bodyGeo = new THREE.CylinderGeometry(1.2, 1.4, 9, 24);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.3, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    rocketGroup.add(body);

    // Ojiva / Capsula roja superior
    const noseGeo = new THREE.ConeGeometry(1.2, 3.2, 24);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = 5.8;
    nose.rotation.x = Math.PI / 2;
    rocketGroup.add(nose);

    // Aletas estabilizadoras
    for (let i = 0; i < 4; i++) {
      const finGeo = new THREE.BoxGeometry(0.12, 2.4, 1.4);
      const finMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const fin = new THREE.Mesh(finGeo, finMat);
      const angle = (i * Math.PI) / 2;
      fin.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, -3.2);
      fin.rotation.z = angle;
      rocketGroup.add(fin);
    }

    // Tobera y llama del motor
    const flameGeo = new THREE.ConeGeometry(0.8, 3.8, 16);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.z = -5.4;
    flame.rotation.x = -Math.PI / 2;
    rocketGroup.add(flame);

    rocketGroup.position.set(0, 0, 0);
    this.scene.add(rocketGroup);

    // Camara de persecucion espacial
    this.camera.position.set(0, 4.5, -9);
    this.camera.lookAt(0, 0.5, 12);

    // Anillos de navegacion hacia la orbita
    const rings = [];
    const ringGeo = new THREE.TorusGeometry(3.2, 0.2, 12, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    for (let r = 0; r < 10; r++) {
      const ringMesh = new THREE.Mesh(ringGeo, ringMat.clone());
      ringMesh.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, 25 + r * 30);
      ringMesh.userData = { id: r, hit: false };
      this.scene.add(ringMesh);
      rings.push(ringMesh);
    }

    if (typeof SoundFx !== "undefined") {
      SoundFx.playRocketLaunch();
    }

    this.gameData = {
      rocket: rocketGroup,
      flame: flame,
      marsGlobe: marsGlobe,
      rings: rings,
      posX: 0,
      posY: 0,
      targetX: 0,
      targetY: 0,
      ascentSpeed: 38,
      altitude: 0
    };
  },

  updateMavLaunch(delta, elapsed) {
    const d = this.gameData;

    // Manejo de controles: cámara mirando hacia +Z (Pantalla Izquierda = +X, Pantalla Derecha = -X)
    let moveX = 0;
    let moveY = 0;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) moveX += 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) moveX -= 1;
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) moveY += 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) moveY -= 1;

    if (this.isPointerDown) {
      d.targetX = -this.pointerX * 6.5;
      d.targetY = this.pointerY * 4.5;
    } else {
      d.targetX += moveX * 14 * delta;
      d.targetY += moveY * 14 * delta;
    }

    d.targetX = Math.max(-6, Math.min(6, d.targetX));
    d.targetY = Math.max(-4, Math.min(4, d.targetY));

    d.posX += (d.targetX - d.posX) * 0.15;
    d.posY += (d.targetY - d.posY) * 0.15;

    d.rocket.position.x = d.posX;
    d.rocket.position.y = d.posY;

    // Giro suave del cohete
    d.rocket.rotation.z = -(d.targetX - d.posX) * 0.25;
    d.rocket.rotation.y = (d.targetX - d.posX) * 0.15;
    d.rocket.rotation.x = -(d.targetY - d.posY) * 0.15;

    // Parpadeo de la llama del motor
    const flicker = 1 + (Math.random() - 0.5) * 0.35;
    d.flame.scale.set(flicker, 1 + Math.sin(elapsed * 25) * 0.2, flicker);

    // Transicion de cielo a negro espacial con la altitud
    d.altitude += delta * 4;
    const progress = Math.min(1, d.altitude / 80);
    const red = Math.round(184 * (1 - progress));
    const green = Math.round(75 * (1 - progress));
    const blue = Math.round(46 * (1 - progress) + 30 * progress);
    this.scene.background.setRGB(red / 255, green / 255, blue / 255);
    this.scene.fog.color.setRGB(red / 255, green / 255, blue / 255);

    // Marte alejandose hacia abajo
    d.marsGlobe.position.y -= delta * 1.5;

    // Desplazamiento de los anillos de telemetria
    d.rings.forEach((ring) => {
      ring.position.z -= d.ascentSpeed * delta;

      // Colision con el cohete (cerca de Z = 0)
      if (Math.abs(ring.position.z) < 1.8 && !ring.userData.hit) {
        const dist = Math.hypot(ring.position.x - d.posX, ring.position.y - d.posY);
        if (dist < 3.2) {
          ring.userData.hit = true;
          this.score += 15;
          ring.material.color.setHex(0x38bdf8);
          if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
        }
      }

      if (ring.position.z < -10) {
        ring.position.z += 300;
        ring.position.x = (Math.random() - 0.5) * 8;
        ring.position.y = (Math.random() - 0.5) * 6;
        ring.userData.hit = false;
        ring.material.color.setHex(0x22c55e);
      }
    });

    if (this.score >= 90) this.tier = "excellent";
    else if (this.score >= 50) this.tier = "good";
    else this.tier = "fair";
  },

  // =========================================================================
  // MINIJUEGO 3: PASEO ESPACIAL Y REPARACION EN GRAVEDAD CERO (Three.js)
  // =========================================================================
  initEvaRepair() {
    this.timeRemaining = 28;
    this.score = 0;
    this.tier = "fair";

    const titleEl = document.getElementById("m3d-game-title");
    const labelEl = document.getElementById("m3d-score-label");
    const instrEl = document.getElementById("m3d-instructions-text");

    if (titleEl) titleEl.textContent = "Reparacion Espacial en Gravedad Cero";
    if (labelEl) labelEl.textContent = "Nodos Sellados";
    if (instrEl) instrEl.textContent = "Acercate a los 4 paneles danados y Manten Clic o Espacio para sellarlos.";

    this.scene.background = new THREE.Color(0x060913);
    this.scene.fog = new THREE.Fog(0x060913, 20, 150);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(20, 30, 20);
    this.scene.add(sunLight);

    // Fondo cosmico con estrellas
    const starGeo = new THREE.BufferGeometry();
    const starCoords = [];
    for (let s = 0; s < 300; s++) {
      starCoords.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    this.scene.add(stars);

    // Modulo de la estacion espacial en el centro
    const stationGroup = new THREE.Group();
    const habGeo = new THREE.CylinderGeometry(3.5, 3.5, 12, 16);
    const habMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.5 });
    const habModule = new THREE.Mesh(habGeo, habMat);
    habModule.rotation.z = Math.PI / 2;
    stationGroup.add(habModule);

    // Paneles solares extendidos
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2, metalness: 0.8 });
    const panel1 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 3), panelMat);
    panel1.position.set(-8, 0, 0);
    stationGroup.add(panel1);

    const panel2 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 3), panelMat);
    panel2.position.set(8, 0, 0);
    stationGroup.add(panel2);

    this.scene.add(stationGroup);

    // 4 Nodos danados con destellos de chispa
    const nodes = [];
    const nodeOffsets = [
      { x: -9, y: 1.2, z: 0.5 },
      { x: -5, y: -1.2, z: -0.5 },
      { x: 5, y: 1.2, z: -0.5 },
      { x: 9, y: -1.2, z: 0.5 }
    ];

    nodeOffsets.forEach((pos, idx) => {
      const nMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      nMesh.position.set(pos.x, pos.y, pos.z);
      nMesh.userData = { id: idx, repaired: false, progress: 0 };
      this.scene.add(nMesh);
      nodes.push(nMesh);
    });

    // Astronauta flotante (controlado por el nino)
    const astroGroup = new THREE.Group();
    const suitMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9 });

    const astroBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12), suitMat);
    astroGroup.add(astroBody);

    const astroHead = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), helmetMat);
    astroHead.position.y = 0.85;
    astroGroup.add(astroHead);

    const jetpack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.35), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    jetpack.position.set(0, 0.1, -0.35);
    astroGroup.add(jetpack);

    astroGroup.position.set(0, 0, 6);
    this.scene.add(astroGroup);

    // Camara orbital
    this.camera.position.set(0, 2, 13);
    this.camera.lookAt(0, 0, 0);

    // Rayo laser de soldadura
    const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 });
    const laserBeam = new THREE.Mesh(beamGeo, beamMat);
    laserBeam.visible = false;
    this.scene.add(laserBeam);

    this.gameData = {
      astro: astroGroup,
      nodes: nodes,
      laserBeam: laserBeam,
      posX: 0,
      posY: 0,
      posZ: 6,
      vx: 0,
      vy: 0,
      activeTarget: null
    };
  },

  updateEvaRepair(delta, elapsed) {
    const d = this.gameData;

    // Manejo de propulsores en gravedad cero (inercia suave)
    let ax = 0;
    let ay = 0;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) ax -= 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) ax += 1;
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) ay += 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) ay -= 1;

    if (this.isPointerDown) {
      ax = this.pointerX * 2;
      ay = this.pointerY * 2;
    }

    d.vx += ax * 9 * delta;
    d.vy += ay * 9 * delta;
    d.vx *= 0.94; // Rozamiento espacial minimo
    d.vy *= 0.94;

    d.posX += d.vx * delta;
    d.posY += d.vy * delta;

    d.posX = Math.max(-11, Math.min(11, d.posX));
    d.posY = Math.max(-5, Math.min(5, d.posY));

    d.astro.position.set(d.posX, d.posY, d.posZ + Math.sin(elapsed * 2) * 0.15);
    d.astro.rotation.z = -d.vx * 0.08;

    // Buscar nodo mas cercano
    let nearest = null;
    let minDist = 3.8;

    d.nodes.forEach((node) => {
      if (!node.userData.repaired) {
        // Parpadeo de alerta
        const pulse = 0.5 + Math.sin(elapsed * 8) * 0.5;
        node.scale.set(1 + pulse * 0.2, 1 + pulse * 0.2, 1 + pulse * 0.2);

        const dist = Math.hypot(node.position.x - d.posX, node.position.y - d.posY);
        if (dist < minDist) {
          minDist = dist;
          nearest = node;
        }
      }
    });

    const isWelding = this.keys["Space"] || this.isPointerDown;

    if (nearest && isWelding) {
      // Activar rayo de reparacion
      d.laserBeam.visible = true;
      const start = d.astro.position;
      const end = nearest.position;

      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      d.laserBeam.position.copy(mid);

      const length = start.distanceTo(end);
      d.laserBeam.scale.set(1, length, 1);
      d.laserBeam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());

      nearest.userData.progress += delta * 50;

      if (nearest.userData.progress >= 100) {
        nearest.userData.repaired = true;
        nearest.material.color.setHex(0x22c55e);
        this.score += 25;
        if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
      }
    } else {
      d.laserBeam.visible = false;
    }

    if (this.score >= 100) this.tier = "excellent";
    else if (this.score >= 50) this.tier = "good";
    else this.tier = "fair";
  },

  // =========================================================================
  // MINIJUEGO 4: LABORATORIO LASER PIXL Y ESPECTROMETRIA 3D (Three.js)
  // =========================================================================
  initPixlLaser() {
    this.timeRemaining = 22;
    this.score = 0;
    this.tier = "fair";

    const titleEl = document.getElementById("m3d-game-title");
    const labelEl = document.getElementById("m3d-score-label");
    const instrEl = document.getElementById("m3d-instructions-text");

    if (titleEl) titleEl.textContent = "Espectrometria Laser PIXL en 3D";
    if (labelEl) labelEl.textContent = "Muestras";
    if (instrEl) instrEl.textContent = "Apunta el laser con el raton o teclas y haz Clic para analizar los 4 minerales marcianos.";

    this.scene.background = new THREE.Color(0x0f172a);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x38bdf8, 2.5);
    spotLight.position.set(0, 12, 10);
    this.scene.add(spotLight);

    // Roca marciana 3D en rotacion
    const rockGeo = new THREE.DodecahedronGeometry(3.5, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x933c24, roughness: 0.85, metalness: 0.1 });
    const rockMesh = new THREE.Mesh(rockGeo, rockMat);
    this.scene.add(rockMesh);

    // 4 Zonas de minerales brillantes sobre la roca
    const targets = [];
    const mineralColors = [0x38bdf8, 0x4ade80, 0xfacc15, 0xf43f5e];
    const mineralNames = ["Hielo H2O", "Silicato", "Carbonato", "Oxido Hierro"];

    for (let m = 0; m < 4; m++) {
      const angle = (m * Math.PI) / 2;
      const targetMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.48, 12, 12),
        new THREE.MeshBasicMaterial({ color: mineralColors[m] })
      );
      targetMesh.position.set(Math.cos(angle) * 3.4, Math.sin(angle) * 1.5, Math.sin(angle) * 2.8);
      targetMesh.userData = { id: m, name: mineralNames[m], scanned: false, progress: 0 };
      rockMesh.add(targetMesh);
      targets.push(targetMesh);
    }

    // Cabezal del escaner laser
    const laserHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.35, 1.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    laserHead.position.set(0, 0, 7);
    laserHead.rotation.x = Math.PI / 2;
    this.scene.add(laserHead);

    this.camera.position.set(0, 0, 9);
    this.camera.lookAt(0, 0, 0);

    // Rayo laser visual
    const beamMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 7, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    beamMesh.position.set(0, 0, 3.5);
    beamMesh.rotation.x = Math.PI / 2;
    beamMesh.visible = false;
    this.scene.add(beamMesh);

    this.gameData = {
      rock: rockMesh,
      targets: targets,
      laserHead: laserHead,
      beam: beamMesh,
      aimX: 0,
      aimY: 0
    };
  },

  updatePixlLaser(delta, elapsed) {
    const d = this.gameData;

    // Rotacion de la roca
    d.rock.rotation.y += delta * 0.45;
    d.rock.rotation.x = Math.sin(elapsed * 0.5) * 0.2;

    // Apuntado del laser con el puntero o con teclas WASD / Flechas
    let keyX = 0;
    let keyY = 0;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) keyX -= 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) keyX += 1;
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) keyY += 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) keyY -= 1;

    if (keyX !== 0 || keyY !== 0) {
      d.aimX = Math.max(-3.5, Math.min(3.5, d.aimX + keyX * 5.0 * delta));
      d.aimY = Math.max(-2.5, Math.min(2.5, d.aimY + keyY * 5.0 * delta));
    } else if (this.isPointerDown) {
      d.aimX += (this.pointerX * 3.5 - d.aimX) * 0.2;
      d.aimY += (this.pointerY * 2.5 - d.aimY) * 0.2;
    }
    d.laserHead.position.x = d.aimX;
    d.laserHead.position.y = d.aimY;

    const isFiring = this.keys["Space"] || this.isPointerDown;
    d.beam.visible = isFiring;
    if (isFiring) {
      d.beam.position.x = d.aimX;
      d.beam.position.y = d.aimY;

      // Comprobar si apunta a algun mineral
      d.targets.forEach((tar) => {
        const worldPos = new THREE.Vector3();
        tar.getWorldPosition(worldPos);

        if (worldPos.z > 0) { // Solo si esta en la cara frontal visible
          const dist = Math.hypot(worldPos.x - d.aimX, worldPos.y - d.aimY);
          if (dist < 0.9 && !tar.userData.scanned) {
            tar.userData.progress += delta * 60;
            if (tar.userData.progress >= 100) {
              tar.userData.scanned = true;
              tar.material.color.setHex(0xffffff);
              this.score += 25;
              if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
            }
          }
        }
      });
    }

    if (this.score >= 100) this.tier = "excellent";
    else if (this.score >= 50) this.tier = "good";
    else this.tier = "fair";
  }
};

if (typeof window !== "undefined") {
  window.Minigames3D = Minigames3D;
}
