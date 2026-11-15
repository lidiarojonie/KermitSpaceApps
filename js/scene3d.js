// js/scene3d.js — Prototipo 3D Interactivo de Exploración en Marte (Three.js)
// Reto NASA Space Apps Challenge 2026: Build a Junior Astronaut Mission Trainer
// Entorno marciano inmersivo con atmósfera dinámica, relieve procedural,
// Outpost Beta de alta fidelidad, Rover ROVI animado, Cohete MAV y astronauta interactivo.

const Scene3D = {
  container: null,
  scene: null,
  camera: null,
  renderer: null,
  clock: null,
  active: false,
  animId: null,

  // Entidades del mundo 3D
  player: null,
  playerGroup: null,
  leftLeg: null,
  rightLeg: null,
  leftArm: null,
  rightArm: null,
  headlampLight: null,
  playerSpeed: 14,
  keys: {},

  // Físicas marcianas: Gravedad reducida (0.38g) y Salto
  jumpY: 0,
  jumpVelocity: 0,
  isGrounded: true,

  // Partículas y efectos dinámicos
  dustParticles: [],
  thrusterParticles: [],
  ambientDustSystem: null,
  dustDevilGroup: null,
  lastStepTime: 0,

  // Elementos de la base y animación
  roviMastHead: null,
  anemometerGroup: null,
  mavStageLeds: [],
  iceSteamParticles: [],
  pixlLaserBeam: null,
  radarDish: null,
  conduitGlows: [],

  // Cámara en tercera persona orbital
  cameraOffset: { x: 0, y: 7.2, z: 12.5 },
  cameraAngle: 0,
  cameraPitch: 0.22,
  isMouseDown: false,
  prevMouseX: 0,
  prevMouseY: 0,

  // Estaciones interactivas y obstáculos físicos
  stations: [],
  obstacles: [],
  activePromptStation: null,

  // Cache de texturas generadas proceduralmente
  textures: {},

  // ==========================================================================
  // 1. GENERADORES DE TEXTURAS PROCEDURALES NATIVAS (CERO DEPENDENCIAS)
  // ==========================================================================
  createMarsGroundTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Fondo base de regolito y arena marciana
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, "#c2512f");
    grad.addColorStop(0.35, "#a84124");
    grad.addColorStop(0.7, "#8e341b");
    grad.addColorStop(1, "#ba4d2b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Ondulaciones del viento marciano (wind ripples)
    ctx.strokeStyle = "rgba(225, 120, 75, 0.28)";
    ctx.lineWidth = 3;
    for (let y = 0; y < 1024; y += 14) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 32) {
        const offset = Math.sin((x + y * 0.5) * 0.04) * 5;
        ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }

    // Granulado mineral y motas de grava volcánica
    for (let i = 0; i < 4500; i++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 1024;
      const size = Math.random() * 2.2 + 0.5;
      const isDark = Math.random() > 0.4;
      ctx.fillStyle = isDark ? "rgba(60, 24, 14, 0.45)" : "rgba(255, 180, 120, 0.35)";
      ctx.fillRect(rx, ry, size, size);
    }

    // Huellas y surcos de rodadura de los rovers entre estaciones
    ctx.strokeStyle = "rgba(70, 28, 16, 0.35)";
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(512, 512);
    ctx.lineTo(820, 820);
    ctx.moveTo(512, 512);
    ctx.lineTo(240, 260);
    ctx.moveTo(512, 512);
    ctx.lineTo(820, 480);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  },

  createSolarPanelTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0c1d3b";
    ctx.fillRect(0, 0, 256, 256);

    // Celdas fotovoltaicas de silicio
    ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Barras colectoras plateadas (busbars)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 64);
    ctx.lineTo(256, 64);
    ctx.moveTo(0, 192);
    ctx.lineTo(256, 192);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  },

  createHazardStripeTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    for (let i = -128; i < 256; i += 32) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 16, 0);
      ctx.lineTo(i + 48, 128);
      ctx.lineTo(i + 32, 128);
    }
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },

  createSkyGradientTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Cielo marciano real: ocre manteca en horizonte, degradando a salmón y azul crepúsculo oscuro
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, "#161129"); // Cénit cósmico oscuro con estrellas
    grad.addColorStop(0.35, "#3d1f2a");
    grad.addColorStop(0.65, "#823621"); // Capa media de polvo
    grad.addColorStop(0.92, "#c8592d"); // Horizonte ocre brillante
    grad.addColorStop(1.0, "#df6d38");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    return new THREE.CanvasTexture(canvas);
  },

  // ==========================================================================
  // 2. RELIEVE MATEMÁTICO DEL TERRENO MARCIANO
  // ==========================================================================
  getTerrainHeight(x, z) {
    const dist = Math.sqrt(x * x + z * z);
    // Zona central plana para la base (radio 18m)
    if (dist <= 18) return 0;

    // Relieve ondulado con dunas, crestas y depresiones de cráteres
    const duneWave1 = Math.sin(x * 0.07 + z * 0.04) * 1.6;
    const duneWave2 = Math.cos(z * 0.06 - x * 0.03) * 1.8;
    const microRidge = Math.sin(x * 0.15) * Math.cos(z * 0.15) * 0.6;
    const rawH = duneWave1 + duneWave2 + microRidge;

    // Transición suave entre la base y las dunas exteriores
    const blend = Math.min(1, (dist - 18) / 14);
    return rawH * blend;
  },

  // ==========================================================================
  // 3. INICIALIZACIÓN PRINCIPAL DEL MUNDO 3D
  // ==========================================================================
  init(containerId = "threejs-container") {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("Scene3D: Container #" + containerId + " not found!");
      return;
    }

    if (typeof THREE === "undefined") {
      console.error("Scene3D: THREE is not defined! Check three.js script tag.");
      return;
    }

    this.container.classList.remove("hidden");
    this.clock = new THREE.Clock();

    // 1. Escena y atmósfera marciana
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xb84b2e, 35, 240); // Niebla marciana volumétrica

    // 2. Dimensiones robustas garantizadas
    const width = Math.max(900, this.container.clientWidth || window.innerWidth || 900);
    const height = Math.max(500, this.container.clientHeight || window.innerHeight || 500);

    // 3. Cámara en tercera persona con FOV cinematográfico
    this.camera = new THREE.PerspectiveCamera(52, width / height, 0.4, 450);
    this.camera.position.set(0, 7.2, 26);
    this.camera.lookAt(0, 1.6, 14);

    // 4. Renderizador WebGL de alta fidelidad
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.container.innerHTML = "";
      this.container.appendChild(this.renderer.domElement);
    } catch (err) {
      console.error("Scene3D: WebGLRenderer creation failed", err);
      return;
    }

    // 5. Cargar texturas procedurales
    this.textures.ground = this.createMarsGroundTexture();
    this.textures.solar = this.createSolarPanelTexture();
    this.textures.hazard = this.createHazardStripeTexture();
    this.textures.sky = this.createSkyGradientTexture();

    // 6. Iluminación realista del Sol Marciano (43% de intensidad terrestre)
    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x782c18, 0.85);
    this.scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0xffddcc, 0.45);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaea, 1.4);
    sunLight.position.set(50, 65, -35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 180;
    sunLight.shadow.bias = -0.0005;
    const d = 55;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    // 7. Construcción de todo el mundo marciano
    this.buildSkyAndCelestialBodies();
    this.buildMartianLandscape();
    this.buildBaseOutpost();
    this.buildPlayer();
    this.buildDustParticleSystem();
    this.buildAtmosphericEffects();
    this.buildDustDevil();

    // 8. Configuración de controles
    this.setupInputs();

    window.addEventListener("resize", () => this.onWindowResize());

    this.renderOnce();
    console.log("Scene3D: Entorno marciano de alta fidelidad cargado con exito.");
  },

  // ==========================================================================
  // 4. CIELO, SOL, CORONA Y LUNAS (FOBOS Y DEIMOS)
  // ==========================================================================
  buildSkyAndCelestialBodies() {
    // Bóveda celeste con degradado atmosférico
    const skyGeo = new THREE.SphereGeometry(260, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: this.textures.sky,
      side: THREE.BackSide,
      fog: false
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyDome);

    // Disco solar pálido de Marte
    const sunGroup = new THREE.Group();
    const sunDiskGeo = new THREE.SphereGeometry(3.6, 24, 24);
    const sunDiskMat = new THREE.MeshBasicMaterial({ color: 0xfffbe6, fog: false });
    const sunDisk = new THREE.Mesh(sunDiskGeo, sunDiskMat);
    sunGroup.add(sunDisk);

    // Corona y halo difuso del Sol
    const coronaGeo = new THREE.RingGeometry(3.8, 11, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffd175,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      fog: false
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    corona.rotation.x = Math.PI / 4;
    sunGroup.add(corona);

    sunGroup.position.set(85, 80, -85);
    this.scene.add(sunGroup);

    // Luna Fobos (cuerpo irregular patatoide con cráteres)
    const phobosGeo = new THREE.DodecahedronGeometry(2.4, 2);
    const pos = phobosGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      const deform = 1 + Math.sin(v.x * 2.5) * 0.18 + Math.cos(v.y * 3) * 0.12;
      v.multiplyScalar(deform);
      pos.setXYZ(i, v.x, v.y * 0.85, v.z);
    }
    phobosGeo.computeVertexNormals();

    const phobosMat = new THREE.MeshStandardMaterial({
      color: 0x8a7f76,
      roughness: 0.95,
      metalness: 0.05,
      fog: false
    });
    const phobos = new THREE.Mesh(phobosGeo, phobosMat);
    phobos.position.set(-65, 88, -110);
    this.scene.add(phobos);

    // Luna Deimos (pequeño cuerpo distante brillante)
    const deimosGeo = new THREE.SphereGeometry(1.1, 12, 12);
    const deimosMat = new THREE.MeshBasicMaterial({ color: 0xdfdad2, fog: false });
    const deimos = new THREE.Mesh(deimosGeo, deimosMat);
    deimos.position.set(110, 95, -70);
    this.scene.add(deimos);

    // Campo de estrellas en el cénit marciano
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0) * 0.55; // Concentradas arriba
      const r = 240;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi) + 20;
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.4,
      transparent: true,
      opacity: 0.75,
      fog: false
    });
    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
  },

  // ==========================================================================
  // 5. PAISAJE MARCIANO (DUNAS, CRÁTERES Y ROCAS BASÁLTICAS)
  // ==========================================================================
  buildMartianLandscape() {
    this.obstacles = []; // Reinicia los obstáculos una sola vez por escena
    // Malla continua de terreno de 280x280 metros
    const groundGeo = new THREE.PlaneGeometry(280, 280, 80, 80);
    groundGeo.rotateX(-Math.PI / 2);

    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, this.getTerrainHeight(x, z));
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      map: this.textures.ground,
      color: 0xc85532,
      roughness: 0.88,
      metalness: 0.06
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Cordilleras rocosas en el horizonte exterior (Arcadia Hills)
    const rimGeo = new THREE.CylinderGeometry(135, 140, 22, 32, 1, true);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x873620,
      roughness: 0.95,
      side: THREE.BackSide
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 8;
    this.scene.add(rimMesh);

    // Rocas volcánicas basálticas y bloques de arenisca
    const rockGeo1 = new THREE.DodecahedronGeometry(1, 1);
    const rockGeo2 = new THREE.IcosahedronGeometry(1, 0);

    const basaltMat = new THREE.MeshStandardMaterial({ color: 0x4f2518, roughness: 0.92 });
    const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xa8482c, roughness: 0.85 });

    for (let i = 0; i < 65; i++) {
      const isBasalt = i % 2 === 0;
      const rock = new THREE.Mesh(isBasalt ? rockGeo1 : rockGeo2, isBasalt ? basaltMat : sandstoneMat);

      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 88;
      const rx = Math.cos(angle) * radius;
      const rz = Math.sin(angle) * radius;
      const scale = 0.6 + Math.random() * 2.4;
      const ry = this.getTerrainHeight(rx, rz);

      rock.scale.set(scale, scale * 0.65, scale * 0.9);
      rock.position.set(rx, ry + scale * 0.3, rz);
      rock.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);

      // Todas las rocas son sólidas (radio ajustado a su tamaño real)
      this.obstacles.push({ x: rx, z: rz, r: scale * 0.95 });
    }

    // Balizas luminosas del perímetro del campamento
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const lampGeo = new THREE.SphereGeometry(0.18, 8, 8);

    const pathPoints = [
      [10, 14], [16, 15], [20, 16], // Hacia MAV
      [-8, 10], [-14, 6], [-16, 5], // Hacia Biodomo
      [-6, -6], [-12, -10], [-15, -14], // Hacia Perforación
      [8, -6], [12, -3], [16, 0] // Hacia Parque Solar
    ];

    pathPoints.forEach((pt, idx) => {
      const bx = pt[0];
      const bz = pt[1];
      const by = this.getTerrainHeight(bx, bz);

      const pole = new THREE.Mesh(beaconGeo, beaconMat);
      pole.position.set(bx, by + 0.7, bz);
      this.scene.add(pole);

      const lampColor = idx % 2 === 0 ? 0x38bdf8 : 0xfacc15;
      const lamp = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: lampColor }));
      lamp.position.set(bx, by + 1.4, bz);
      this.scene.add(lamp);
    });
  },

  // ==========================================================================
  // 6. BASE OUTPOST BETA Y LAS 8 ESTACIONES INTERACTIVAS
  // ==========================================================================
  buildBaseOutpost() {
    this.stations = [];
    // No vaciar this.obstacles: las rocas del paisaje ya se registraron antes
    if (!this.obstacles) this.obstacles = [];

    // ------------------------------------------------------------------------
    // A. CÚPULA CENTRAL DEL HÁBITAT (OUTPOST BETA)
    // ------------------------------------------------------------------------
    const habGroup = new THREE.Group();

    // Domo geodésico presurizado
    const habGeo = new THREE.SphereGeometry(7.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const habMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.32,
      metalness: 0.25
    });
    const habDome = new THREE.Mesh(habGeo, habMat);
    habDome.castShadow = true;
    habDome.receiveShadow = true;
    habGroup.add(habDome);

    // Anillo exterior de anclaje con iluminación cian de soporte vital
    const ringGeo = new THREE.TorusGeometry(7.3, 0.3, 12, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.4;
    habGroup.add(ring);

    // Esclusa de aire (Airlock) con compuerta rayada y terminal táctico
    const airlockGeo = new THREE.BoxGeometry(3.0, 3.4, 3.2);
    const airlockMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.4,
      roughness: 0.5
    });
    const airlock = new THREE.Mesh(airlockGeo, airlockMat);
    airlock.position.set(0, 1.7, 7.2);
    airlock.castShadow = true;
    habGroup.add(airlock);

    // Franja de advertencia en la compuerta de la esclusa
    const stripeGeo = new THREE.PlaneGeometry(2.4, 0.6);
    const stripeMat = new THREE.MeshBasicMaterial({ map: this.textures.hazard });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 2.7, 8.82);
    habGroup.add(stripe);

    // Luz de estado de la esclusa (Verde presurizado)
    const airlockLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    airlockLed.position.set(1.1, 2.2, 8.83);
    habGroup.add(airlockLed);

    // Antena parabólica orientada hacia la Tierra en el techo del domo
    const dishGroup = new THREE.Group();
    const mastGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.y = 1.1;
    dishGroup.add(mast);

    const dishGeo = new THREE.ConeGeometry(1.8, 0.9, 24, 1, true);
    dishGeo.rotateX(-Math.PI / 2.8);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6, side: THREE.DoubleSide });
    this.radarDish = new THREE.Mesh(dishGeo, dishMat);
    this.radarDish.position.y = 2.1;
    dishGroup.add(this.radarDish);

    dishGroup.position.set(0, 7.2, 0);
    habGroup.add(dishGroup);

    // Túnel presurizado que conecta el Hábitat con el Biodomo
    const tunnelGeo = new THREE.CylinderGeometry(1.2, 1.2, 8.5, 16);
    tunnelGeo.rotateZ(Math.PI / 2);
    const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.position.set(-8.5, 1.2, 2.5);
    tunnel.rotation.y = -Math.PI / 6;
    tunnel.castShadow = true;
    habGroup.add(tunnel);

    habGroup.position.set(0, 0, 0);
    this.scene.add(habGroup);

    this.obstacles.push({ x: 0, z: 0, r: 7.5 });
    this.obstacles.push({ x: 0, z: 7.2, r: 2.4 });
    // Túnel: cápsula a lo largo de todo su eje (longitud 8.5, rotado -30° en Y)
    this.obstacles.push({
      x: -8.5 - Math.cos(Math.PI / 6) * 4.25,
      z: 2.5 - Math.sin(Math.PI / 6) * 4.25,
      x2: -8.5 + Math.cos(Math.PI / 6) * 4.25,
      z2: 2.5 + Math.sin(Math.PI / 6) * 4.25,
      r: 1.3
    });

    // ------------------------------------------------------------------------
    // B. INVERNADERO BIODOMO HIDROPÓNICO (CULTIVOS ESPACIALES OSDR)
    // ------------------------------------------------------------------------
    const bioGroup = new THREE.Group();

    // Cúpula translúcida esmeralda
    const bioDomeGeo = new THREE.SphereGeometry(4.6, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bioDomeMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.55,
      roughness: 0.15,
      metalness: 0.1
    });
    const bioDome = new THREE.Mesh(bioDomeGeo, bioDomeMat);
    bioDome.castShadow = true;
    bioGroup.add(bioDome);

    // Estructura de anillos metálicos del invernadero
    const bioRib = new THREE.Mesh(
      new THREE.TorusGeometry(4.65, 0.14, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    bioRib.rotation.x = Math.PI / 2;
    bioRib.position.y = 0.3;
    bioGroup.add(bioRib);

    // Bandejas de cultivo hidropónico multinivel en el interior
    for (let t = 1; t <= 3; t++) {
      const trayRadius = 3.6 - t * 0.8;
      const trayGeo = new THREE.CylinderGeometry(trayRadius, trayRadius, 0.25, 20);
      const tray = new THREE.Mesh(trayGeo, new THREE.MeshStandardMaterial({ color: 0x15803d }));
      tray.position.y = t * 1.1;
      bioGroup.add(tray);
    }

    // Luz rosa/magenta de crecimiento OSDR en el centro del biodomo
    const growLight = new THREE.PointLight(0xff3399, 2.8, 16);
    growLight.position.set(0, 2.8, 0);
    bioGroup.add(growLight);

    bioGroup.position.set(-16, 0, 5);
    this.scene.add(bioGroup);
    this.obstacles.push({ x: -16, z: 5, r: 5.0 });

    // ------------------------------------------------------------------------
    // C. PARQUE SOLAR FOTOVOLTAICO (4 PANELES DE DOBLE EJE)
    // ------------------------------------------------------------------------
    for (let p = 0; p < 4; p++) {
      const pz = -9 + p * 6;
      const panelGroup = new THREE.Group();

      const mastGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.6, 8);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = 1.3;
      panelGroup.add(mast);

      // Panel con textura azul de celdas de silicio
      const panelGeo = new THREE.BoxGeometry(4.4, 0.16, 2.8);
      panelGeo.rotateX(-Math.PI / 4.5);
      const panelMat = new THREE.MeshStandardMaterial({
        map: this.textures.solar,
        roughness: 0.2,
        metalness: 0.85
      });
      const panelPlate = new THREE.Mesh(panelGeo, panelMat);
      panelPlate.position.y = 2.6;
      panelPlate.castShadow = true;
      panelGroup.add(panelPlate);

      // Inversor de corriente en la base del mástil
      const inv = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.7, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b })
      );
      inv.position.set(0, 0.4, 0.3);
      panelGroup.add(inv);

      panelGroup.position.set(16, 0, pz);
      this.scene.add(panelGroup);
      this.obstacles.push({ x: 16, z: pz, r: 2.4 });
    }

    // ------------------------------------------------------------------------
    // D. TORRE DE PERFORACIÓN GLACIAR (ARCADIA DRILL RIG)
    // ------------------------------------------------------------------------
    const rigGroup = new THREE.Group();

    // Torre de celosía de perforación
    const towerGeo = new THREE.CylinderGeometry(0.4, 1.8, 7.5, 4);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.7,
      roughness: 0.3
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 3.75;
    tower.castShadow = true;
    rigGroup.add(tower);

    // Formación de cristales de hielo azul puro brotando de la perforación
    const iceGeo = new THREE.OctahedronGeometry(1.4, 1);
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const ice = new THREE.Mesh(iceGeo, iceMat);
    ice.position.y = 1.0;
    rigGroup.add(ice);

    const iceLight = new THREE.PointLight(0x38bdf8, 3.2, 14);
    iceLight.position.set(0, 1.5, 0);
    rigGroup.add(iceLight);

    rigGroup.position.set(-15, 0, -14);
    this.scene.add(rigGroup);
    this.obstacles.push({ x: -15, z: -14, r: 3.0 });

    // ------------------------------------------------------------------------
    // E. COHETE MAV (VEHÍCULO DE RETORNO A LA TIERRA)
    // ------------------------------------------------------------------------
    const mavGroup = new THREE.Group();

    // Plataforma de lanzamiento hexagonal
    const padGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.8, 6);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.4;
    mavGroup.add(pad);

    // Fuselaje principal de 3 etapas
    const rocketGeo = new THREE.CylinderGeometry(1.7, 1.9, 13, 24);
    const rocketMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.4,
      roughness: 0.25
    });
    const rocket = new THREE.Mesh(rocketGeo, rocketMat);
    rocket.position.y = 7.3;
    rocket.castShadow = true;
    mavGroup.add(rocket);

    // Cono de proa y módulo de tripulación (Rojo térmico aeroespacial)
    const coneGeo = new THREE.ConeGeometry(1.7, 3.6, 24);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.35 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = 15.6;
    cone.castShadow = true;
    mavGroup.add(cone);

    // 4 toberas de motor cohete en la base
    for (let f = 0; f < 4; f++) {
      const a = (f * Math.PI * 2) / 4;
      const noz = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.55, 1.0, 12),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
      );
      noz.position.set(Math.cos(a) * 0.9, 1.2, Math.sin(a) * 0.9);
      mavGroup.add(noz);
    }

    // Aletas estabilizadoras de titanio
    for (let f = 0; f < 3; f++) {
      const finGeo = new THREE.BoxGeometry(0.18, 3.2, 1.8);
      const finMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const fin = new THREE.Mesh(finGeo, finMat);
      const finAngle = (f * Math.PI * 2) / 3;
      fin.position.set(Math.cos(finAngle) * 2.3, 2.2, Math.sin(finAngle) * 2.3);
      fin.rotation.y = -finAngle;
      mavGroup.add(fin);
    }

    // Luces indicadoras de las 3 fases del MAV en el fuselaje
    this.mavStageLeds = [];
    for (let s = 0; s < 3; s++) {
      const ledGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0, 5.0 + s * 2.5, 1.95);
      mavGroup.add(led);
      this.mavStageLeds.push(led);
    }

    mavGroup.position.set(22, 0, 16);
    this.scene.add(mavGroup);
    this.obstacles.push({ x: 22, z: 16, r: 3.5 });

    // ------------------------------------------------------------------------
    // F. ROVER AUTÓNOMO ROVI (SISTEMA ROCKER-BOGIE 6X6)
    // ------------------------------------------------------------------------
    const roverGroup = new THREE.Group();

    // Chasis con manta térmica dorada (MLI insulation)
    const chassisGeo = new THREE.BoxGeometry(2.5, 1.1, 3.4);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.85,
      roughness: 0.25
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 1.2;
    chassis.castShadow = true;
    roverGroup.add(chassis);

    // Cubierta con panel solar propio
    const rSolar = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.08, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
    );
    rSolar.position.set(0, 1.8, 0.1);
    roverGroup.add(rSolar);

    // 6 ruedas articuladas de gran tracción
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.42, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    const wheelOffsets = [
      [-1.4, 0.48, -1.2], [1.4, 0.48, -1.2],
      [-1.4, 0.48, 0.0],  [1.4, 0.48, 0.0],
      [-1.4, 0.48, 1.2],  [1.4, 0.48, 1.2]
    ];
    wheelOffsets.forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(pos[0], pos[1], pos[2]);
      w.castShadow = true;
      roverGroup.add(w);
    });

    // Mástil de cámaras estereoscópicas y sensor
    const mastBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x64748b })
    );
    mastBar.position.set(0.65, 2.5, -1.1);
    roverGroup.add(mastBar);

    this.roviMastHead = new THREE.Group();
    const headBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.35, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    this.roviMastHead.add(headBox);

    // Ojos/sensores ópticos gemelos de ROVI
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
    eyeL.position.set(-0.16, 0, 0.24);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
    eyeR.position.set(0.16, 0, 0.24);
    this.roviMastHead.add(eyeL);
    this.roviMastHead.add(eyeR);

    this.roviMastHead.position.set(0.65, 3.4, -1.1);
    roverGroup.add(this.roviMastHead);

    roverGroup.position.set(7, 0, 11);
    this.scene.add(roverGroup);
    this.obstacles.push({ x: 7, z: 11, r: 2.5 });

    // ------------------------------------------------------------------------
    // G. BANCO ESPECTROMÉTRICO LÁSER PIXL (ANÁLISIS DE MINERALES)
    // ------------------------------------------------------------------------
    const spectroGroup = new THREE.Group();
    const bench = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.3, 0.9, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    bench.position.y = 0.45;
    spectroGroup.add(bench);

    // Muestra de mineral marciano sujeto
    const sampleRock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.6, 1),
      new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.3 })
    );
    sampleRock.position.set(0, 1.1, 0);
    spectroGroup.add(sampleRock);

    // Brazo del emisor láser ultravioleta PIXL
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 2.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
    );
    arm.rotation.z = Math.PI / 4;
    arm.position.set(-0.7, 1.6, 0);
    spectroGroup.add(arm);

    // Haz láser visible pulsante
    const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.75 });
    this.pixlLaserBeam = new THREE.Mesh(beamGeo, beamMat);
    this.pixlLaserBeam.rotation.z = -Math.PI / 4;
    this.pixlLaserBeam.position.set(-0.2, 1.3, 0);
    spectroGroup.add(this.pixlLaserBeam);

    spectroGroup.position.set(14, 0, -15);
    this.scene.add(spectroGroup);
    this.obstacles.push({ x: 14, z: -15, r: 2.5 });

    // ------------------------------------------------------------------------
    // H. TORRE METEOROLÓGICA Y ESCUDO DE TORMENTAS
    // ------------------------------------------------------------------------
    const defGroup = new THREE.Group();
    const towerMast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.6, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.7 })
    );
    towerMast.position.y = 3;
    defGroup.add(towerMast);

    // Anemómetro giratorio de 3 cazoletas en la cima
    this.anemometerGroup = new THREE.Group();
    for (let c = 0; c < 3; c++) {
      const a = (c * Math.PI * 2) / 3;
      const cupArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      cupArm.rotation.z = Math.PI / 2;
      cupArm.position.set(Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4);
      cupArm.rotation.y = a;
      this.anemometerGroup.add(cupArm);

      const cup = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 8, 8, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc })
      );
      cup.position.set(Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8);
      this.anemometerGroup.add(cup);
    }
    this.anemometerGroup.position.y = 6.2;
    defGroup.add(this.anemometerGroup);

    // Baliza de alerta deflector magnético
    const defBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e })
    );
    defBeacon.position.y = 6.6;
    defGroup.add(defBeacon);

    defGroup.position.set(-7, 0, 18);
    this.scene.add(defGroup);
    this.obstacles.push({ x: -7, z: 18, r: 2.3 });

    // ------------------------------------------------------------------------
    // REGISTRO DE LAS 8 ESTACIONES CON BALIZAS HOLOGRÁFICAS FLOTANTES
    // ------------------------------------------------------------------------
    this.registerStation({
      id: "hab",
      name: "Laboratorio MOXIE",
      actionText: "Pulsa [E] para producir Oxigeno con MOXIE",
      position: new THREE.Vector3(0, 0, 8.2),
      radius: 6.2,
      color: 0x38bdf8,
      minigameKey: "MinigameMoxie",
      discoveryId: "moxie_oxygen"
    });

    this.registerStation({
      id: "drill",
      name: "Perforacion Glaciar",
      actionText: "Pulsa [E] para extraer Hielo Subterraneo",
      position: new THREE.Vector3(-15, 0, -14),
      radius: 7.2,
      color: 0x06b6d4,
      minigameKey: "MinigameDrill",
      discoveryId: "water_mars"
    });

    this.registerStation({
      id: "biodome",
      name: "Biodomo Hidroponico",
      actionText: "Pulsa [E] para cosechar Microgreens en el Biodomo",
      position: new THREE.Vector3(-16, 0, 5),
      radius: 7.6,
      color: 0x10b981,
      minigameKey: "MinigameBiodome",
      discoveryId: "biodome_osdr"
    });

    this.registerStation({
      id: "solar",
      name: "Parque Solar",
      actionText: "Pulsa [E] para reparar y limpiar Paneles Solares",
      position: new THREE.Vector3(16, 0, 0),
      radius: 8.2,
      color: 0xf59e0b,
      minigameKey: "MinigameEvaRepair3D",
      discoveryId: "solar_power"
    });

    this.registerStation({
      id: "rover",
      name: "Rover ROVI",
      actionText: "Pulsa [E] para Carrera con ROVI en el Canon",
      position: new THREE.Vector3(7, 0, 11),
      radius: 6.2,
      color: 0xfbbf24,
      minigameKey: "MinigameRoverRace3D",
      discoveryId: "rovers_exploration"
    });

    this.registerStation({
      id: "mav",
      name: "Cohete MAV",
      actionText: "Pulsa [E] para Lanzamiento Orbital con el Cohete MAV",
      position: new THREE.Vector3(22, 0, 16),
      radius: 8.2,
      color: 0xf43f5e,
      minigameKey: "MinigameMavLaunch3D",
      discoveryId: "radiation_donki"
    });

    this.registerStation({
      id: "spectro",
      name: "Analizador Laser PIXL",
      actionText: "Pulsa [E] para Analizar Minerales con Laser 3D",
      position: new THREE.Vector3(14, 0, -15),
      radius: 6.6,
      color: 0xa855f7,
      minigameKey: "MinigamePixlLaser3D",
      discoveryId: "water_mars"
    });

    this.registerStation({
      id: "defense",
      name: "Defensa de Tormentas",
      actionText: "Pulsa [E] para Activar Escudo ante Tormentas",
      position: new THREE.Vector3(-7, 0, 18),
      radius: 6.6,
      color: 0xf97316,
      minigameKey: "MinigameDustDefense",
      discoveryId: "dust_devils"
    });
  },

  // ==========================================================================
  // 7. BALIZAS HOLOGRÁFICAS 3D Y ANILLOS DE ENERGÍA
  // ==========================================================================
  registerStation(st) {
    const beaconGroup = new THREE.Group();

    // Anillo en el suelo
    const ringGeo = new THREE.RingGeometry(st.radius * 0.65, st.radius * 0.74, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: st.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    beaconGroup.add(ringMesh);

    // Columna de luz holográfica vertical translúcida
    const colGeo = new THREE.CylinderGeometry(0.12, st.radius * 0.65, 3.5, 16, 1, true);
    const colMat = new THREE.MeshBasicMaterial({
      color: st.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18
    });
    const colMesh = new THREE.Mesh(colGeo, colMat);
    colMesh.position.y = 1.75;
    beaconGroup.add(colMesh);

    // Diamante holográfico flotante que rota sobre la estación
    const diamondGeo = new THREE.OctahedronGeometry(0.55, 0);
    const diamondMat = new THREE.MeshBasicMaterial({
      color: st.color,
      wireframe: true
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.y = 3.8;
    beaconGroup.add(diamond);

    // Luz ambiental temática de la estación
    const stLight = new THREE.PointLight(st.color, 1.8, st.radius * 1.5);
    stLight.position.y = 2.0;
    beaconGroup.add(stLight);

    const groundY = this.getTerrainHeight(st.position.x, st.position.z);
    beaconGroup.position.set(st.position.x, groundY + 0.08, st.position.z);
    this.scene.add(beaconGroup);

    st.beaconGroup = beaconGroup;
    st.beaconRing = ringMesh;
    st.diamond = diamond;
    this.stations.push(st);
  },

  // ==========================================================================
  // 8. PERSONAJE ASTRONAUTA CON EQUIPO EVA Y VISOR REFLECTANTE
  // ==========================================================================
  buildPlayer() {
    this.player = new THREE.Group();

    const suitMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.38,
      metalness: 0.15
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6
    });

    // Torso con unidad de soporte vital
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.44, 1.45, 14), suitMat);
    torso.position.y = 1.45;
    torso.castShadow = true;
    this.player.add(torso);

    // Ordenador de control de pecho (Chest Display Unit) con LEDs
    const chestPack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.22), trimMat);
    chestPack.position.set(0, 1.55, 0.42);
    this.player.add(chestPack);

    const chestLed1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    chestLed1.position.set(-0.16, 1.6, 0.54);
    this.player.add(chestLed1);

    const chestLed2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    chestLed2.position.set(0.16, 1.6, 0.54);
    this.player.add(chestLed2);

    // Casco presurizado
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 20), suitMat);
    helmet.position.y = 2.5;
    helmet.castShadow = true;
    this.player.add(helmet);

    // Visor dorado reflectante (protección de radiación solar NASA)
    const visorGeo = new THREE.SphereGeometry(0.42, 18, 18, 0, Math.PI, 0, Math.PI);
    visorGeo.rotateY(Math.PI / 2);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.95,
      roughness: 0.08
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.5, 0.16);
    this.player.add(visor);

    // Linterna frontal del casco que proyecta luz hacia adelante
    this.headlampLight = new THREE.SpotLight(0xfffaea, 2.5, 24, Math.PI / 6, 0.4, 1);
    this.headlampLight.position.set(0, 2.5, 0.6);
    this.headlampLight.target.position.set(0, 0, 12);
    this.player.add(this.headlampLight);
    this.player.add(this.headlampLight.target);

    // Mochila de soporte vital PLSS (Portable Life Support System)
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.15, 0.45), trimMat);
    pack.position.set(0, 1.6, -0.48);
    pack.castShadow = true;
    this.player.add(pack);

    // Toberas micro-thruster RCS de maniobra EVA en la mochila
    const nozL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.2), trimMat);
    nozL.position.set(-0.35, 2.1, -0.45);
    this.player.add(nozL);
    const nozR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.2), trimMat);
    nozR.position.set(0.35, 2.1, -0.45);
    this.player.add(nozR);

    // Brazos articulados con guantes y anillos de muñeca
    const armGeo = new THREE.CylinderGeometry(0.16, 0.14, 1.1, 10);

    this.leftArm = new THREE.Mesh(armGeo, suitMat);
    this.leftArm.position.set(-0.65, 1.45, 0);
    this.leftArm.castShadow = true;
    this.player.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, suitMat);
    this.rightArm.position.set(0.65, 1.45, 0);
    this.rightArm.castShadow = true;
    this.player.add(this.rightArm);

    // Piernas y botas articuladas
    const legGeo = new THREE.CylinderGeometry(0.2, 0.24, 1.05, 10);

    this.leftLeg = new THREE.Mesh(legGeo, suitMat);
    this.leftLeg.position.set(-0.3, 0.52, 0);
    this.leftLeg.castShadow = true;
    this.player.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, suitMat);
    this.rightLeg.position.set(0.3, 0.52, 0);
    this.rightLeg.castShadow = true;
    this.player.add(this.rightLeg);

    this.player.position.set(0, this.getTerrainHeight(0, 14), 14);
    this.scene.add(this.player);
  },

  // ==========================================================================
  // 9. SISTEMA DE PARTÍCULAS (POLVO, SALTO Y VAPOR CRIOGÉNICO)
  // ==========================================================================
  buildDustParticleSystem() {
    this.dustParticles = [];
    const pGeo = new THREE.SphereGeometry(0.14, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({
      color: 0xc85532,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i < 30; i++) {
      const p = new THREE.Mesh(pGeo, pMat.clone());
      p.visible = false;
      p.life = 0;
      p.maxLife = 0.55;
      p.vel = new THREE.Vector3();
      this.scene.add(p);
      this.dustParticles.push(p);
    }
  },

  buildAtmosphericEffects() {
    // Mota de polvo flotante en el aire iluminado por el Sol
    const motesCount = 90;
    const motesGeo = new THREE.BufferGeometry();
    const motesPos = new Float32Array(motesCount * 3);

    for (let i = 0; i < motesCount; i++) {
      motesPos[i * 3] = (Math.random() - 0.5) * 80;
      motesPos[i * 3 + 1] = Math.random() * 12 + 0.5;
      motesPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }

    motesGeo.setAttribute("position", new THREE.BufferAttribute(motesPos, 3));
    const motesMat = new THREE.PointsMaterial({
      color: 0xffd199,
      size: 0.35,
      transparent: true,
      opacity: 0.45
    });

    this.ambientDustSystem = new THREE.Points(motesGeo, motesMat);
    this.scene.add(this.ambientDustSystem);
  },

  buildDustDevil() {
    // Remolino de polvo marciano en el horizonte lejano
    this.dustDevilGroup = new THREE.Group();
    const count = 75;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const h = Math.random() * 18;
      const radiusAtH = 0.5 + h * 0.28;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radiusAtH;
      positions[i * 3 + 1] = h;
      positions[i * 3 + 2] = Math.sin(angle) * radiusAtH;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xdf6d38,
      size: 0.85,
      transparent: true,
      opacity: 0.5
    });

    const vortex = new THREE.Points(geo, mat);
    this.dustDevilGroup.add(vortex);

    // Posicionado en las llanuras exteriores de Arcadia Planitia
    this.dustDevilGroup.position.set(-65, this.getTerrainHeight(-65, -60), -60);
    this.scene.add(this.dustDevilGroup);
  },

  spawnDustPuff(x, y, z, count = 2) {
    let spawned = 0;
    for (let p of this.dustParticles) {
      if (!p.visible) {
        p.visible = true;
        p.life = 0;
        p.position.set(x + (Math.random() - 0.5) * 0.4, y + 0.05, z + (Math.random() - 0.5) * 0.4);
        p.vel.set((Math.random() - 0.5) * 1.6, Math.random() * 1.3 + 0.4, (Math.random() - 0.5) * 1.6);
        p.material.opacity = 0.7;
        spawned++;
        if (spawned >= count) break;
      }
    }
  },

  spawnDustRing(x, y, z) {
    this.spawnDustPuff(x, y, z, 8);
  },

  // ==========================================================================
  // 10. GESTIÓN DE ENTRADAS (RATÓN, TECLADO Y TOUCH)
  // ==========================================================================
  setupInputs() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;

      // Salto marciano en baja gravedad con Espacio
      if (e.code === "Space" && this.active) {
        if (this.jumpY === 0) {
          this.jumpVelocity = 8.8; // Impulso vertical en 0.38g
          if (typeof SoundFx !== "undefined") SoundFx.playClick();
        }
      }

      // Tecla E para interactuar con la estación más cercana
      if (e.code === "KeyE" && this.active && this.activePromptStation) {
        this.interactWithStation(this.activePromptStation);
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    const dom = this.container || (this.renderer ? this.renderer.domElement : window);

    dom.addEventListener("mousedown", (e) => {
      this.isMouseDown = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      e.preventDefault();
    });

    window.addEventListener("mouseup", () => {
      this.isMouseDown = false;
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isMouseDown || !this.active) return;
      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;

      this.cameraAngle -= deltaX * 0.005;
      this.cameraPitch = Math.max(0.05, Math.min(0.55, this.cameraPitch + deltaY * 0.003));

      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    // Soporte para pantalla táctil en móviles y tabletas
    dom.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        this.isMouseDown = true;
        this.prevMouseX = e.touches[0].clientX;
        this.prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener("touchend", () => {
      this.isMouseDown = false;
    });

    window.addEventListener("touchmove", (e) => {
      if (!this.isMouseDown || !this.active || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - this.prevMouseX;
      const deltaY = e.touches[0].clientY - this.prevMouseY;

      this.cameraAngle -= deltaX * 0.005;
      this.cameraPitch = Math.max(0.05, Math.min(0.55, this.cameraPitch + deltaY * 0.003));

      this.prevMouseX = e.touches[0].clientX;
      this.prevMouseY = e.touches[0].clientY;
    }, { passive: true });

    const promptBtn = document.getElementById("btn-3d-interact");
    if (promptBtn) {
      promptBtn.onclick = () => {
        if (this.activePromptStation) {
          this.interactWithStation(this.activePromptStation);
        }
      };
    }
  },

  interactWithStation(station) {
    if (!station) return;

    // El cohete MAV solo permite despegue y ascenso orbital en el último día (Sol 15)
    if (station.id === "mav" && typeof GameState !== "undefined" && GameState.sol < 15) {
      if (typeof SoundFx !== "undefined") SoundFx.playAlert();
      const roviMsg = document.getElementById("rovi-msg");
      if (roviMsg) {
        roviMsg.textContent = "ROVI: «¡Comandante! El cohete MAV está completando sus etapas de combustible. El ascenso orbital solo se activará en el último día (Sol 15) ante la megatormenta.»";
      }
      if (typeof GameState.showFloatingIndicator === "function") {
        GameState.showFloatingIndicator("Cohete MAV: Bloqueado hasta el Sol 15", "#f43f5e");
      }
      return;
    }

    if (typeof SoundFx !== "undefined") SoundFx.playClick();

    if (station.discoveryId && typeof DiscoverySystem !== "undefined") {
      DiscoverySystem.unlock(station.discoveryId, true);
    }

    const mockChoice = {
      label: station.name,
      minigame: station.minigameKey,
      minigameTitle: station.name,
      cost: {},
      successReward: {
        water: station.id === "drill" || station.id === "spectro" ? 25 : 0,
        energy: station.id === "solar" || station.id === "defense" ? 25 : 0,
        food: station.id === "biodome" ? 25 : 0,
        oxygen: station.id === "hab" ? 25 : 0,
        shield: station.id === "defense" ? 15 : 0,
        mav: station.id === "mav" ? 1 : 0
      },
      failReward: {
        water: station.id === "drill" || station.id === "spectro" ? 12 : 0,
        energy: station.id === "solar" || station.id === "defense" ? 12 : 0,
        food: station.id === "biodome" ? 12 : 0,
        oxygen: station.id === "hab" ? 12 : 0
      },
      nasaFact: `Misión completada con éxito en la estación ${station.name}. Recursos transferidos al Outpost Beta.`
    };

    if (typeof showMinigameBriefing === "function") {
      pendingMinigameChoice = mockChoice;
      showMinigameBriefing(mockChoice);
    }
  },

  renderOnce() {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.updateCameraImmediate();
    this.renderer.render(this.scene, this.camera);
  },

  updateCameraImmediate() {
    if (!this.player || !this.camera) return;
    const cosP = Math.cos(this.cameraPitch);
    const sinP = Math.sin(this.cameraPitch);

    const distH = this.cameraOffset.z * cosP;
    const targetX = this.player.position.x + Math.sin(this.cameraAngle) * distH;
    const targetZ = this.player.position.z + Math.cos(this.cameraAngle) * distH;
    const targetY = this.player.position.y + this.cameraOffset.y * sinP + 3.2;

    this.camera.position.set(targetX, targetY, targetZ);
    this.camera.lookAt(this.player.position.x, this.player.position.y + 1.6, this.player.position.z);
  },

  start() {
    this.active = true;
    if (this.container) {
      this.container.classList.remove("view-layer-inactive");
      this.container.classList.add("view-layer-active");
    }
    const hud3d = document.getElementById("hud-3d-controls");
    if (hud3d) hud3d.classList.remove("hidden");

    this.onWindowResize();
    this.updateCameraImmediate();
    this.renderOnce();

    if (this.animId) cancelAnimationFrame(this.animId);
    this.animate();
  },

  stop() {
    this.active = false;
    this.isMouseDown = false;
    this.keys = {};
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.container) {
      this.container.classList.remove("view-layer-active");
      this.container.classList.add("view-layer-inactive");
    }
    const hud3d = document.getElementById("hud-3d-controls");
    if (hud3d) hud3d.classList.add("hidden");
  },

  onWindowResize() {
    if (!this.renderer || !this.camera || !this.container) return;
    const width = window.innerWidth || this.container.clientWidth || 900;
    const height = window.innerHeight || this.container.clientHeight || 500;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  },

  // ==========================================================================
  // 11. BUCLE PRINCIPAL DE ANIMACIÓN Y RENDERIZADO
  // ==========================================================================
  animate() {
    if (!this.active) return;
    this.animId = requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    this.updatePlayerMovement(delta, elapsed);
    this.updateParticles(delta);
    this.updateEnvironmentAnimations(elapsed);
    this.updateCamera();
    this.checkStationProximity(elapsed);

    this.renderer.render(this.scene, this.camera);
  },

  updatePlayerMovement(delta, elapsed) {
    if (!this.player) return;

    let moveX = 0;
    let moveZ = 0;

    if (this.keys["KeyW"] || this.keys["ArrowUp"]) moveZ -= 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) moveZ += 1;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) moveX -= 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) moveX += 1;

    const isMoving = moveX !== 0 || moveZ !== 0;

    if (isMoving) {
      const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= len;
      moveZ /= len;

      const sinA = Math.sin(this.cameraAngle);
      const cosA = Math.cos(this.cameraAngle);

      const worldX = moveX * cosA + moveZ * sinA;
      const worldZ = -moveX * sinA + moveZ * cosA;

      this.player.position.x += worldX * this.playerSpeed * delta;
      this.player.position.z += worldZ * this.playerSpeed * delta;

      const targetAngle = Math.atan2(worldX, worldZ);
      this.player.rotation.y = targetAngle;

      // Animación coordinada de zancada (piernas y brazos en contra-fase)
      const stride = Math.sin(elapsed * 10.5);
      if (this.leftLeg && this.rightLeg) {
        this.leftLeg.rotation.x = stride * 0.55;
        this.rightLeg.rotation.x = -stride * 0.55;
      }
      if (this.leftArm && this.rightArm) {
        this.leftArm.rotation.x = -stride * 0.45;
        this.rightArm.rotation.x = stride * 0.45;
      }

      // Emisión de polvo al apoyar las botas sobre el regolito
      if (this.jumpY === 0 && elapsed - this.lastStepTime > 0.26) {
        this.lastStepTime = elapsed;
        this.spawnDustPuff(this.player.position.x, this.player.position.y, this.player.position.z, 2);
      }
    } else {
      if (this.leftLeg && this.rightLeg) {
        this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.2);
        this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.2);
      }
      if (this.leftArm && this.rightArm) {
        this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.2);
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.2);
      }
    }

    // Físicas del salto en gravedad marciana (0.38g)
    if (this.jumpVelocity !== 0 || this.jumpY > 0) {
      this.jumpY += this.jumpVelocity * delta;
      this.jumpVelocity -= 14 * delta; // Aceleración de gravedad marciana
      if (this.jumpY <= 0) {
        this.jumpY = 0;
        this.jumpVelocity = 0;
        this.spawnDustRing(this.player.position.x, this.player.position.y, this.player.position.z);
      }
    }

    // Colisión física con estructuras y rocas gigantes
    // Se admiten obstáculos circulares {x,z,r} y alargados (cápsulas) {x,z,x2,z2,r}
    for (let pass = 0; pass < 2; pass++) {
      this.obstacles.forEach(obs => {
        let cx = obs.x;
        let cz = obs.z;
        if (obs.x2 !== undefined) {
          const sx = obs.x2 - obs.x;
          const sz = obs.z2 - obs.z;
          const lenSq = sx * sx + sz * sz;
          let t = lenSq > 0 ? ((this.player.position.x - obs.x) * sx + (this.player.position.z - obs.z) * sz) / lenSq : 0;
          t = Math.max(0, Math.min(1, t));
          cx = obs.x + sx * t;
          cz = obs.z + sz * t;
        }
        const dx = this.player.position.x - cx;
        const dz = this.player.position.z - cz;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minSafeDist = obs.r + 0.65;

        if (dist < minSafeDist) {
          if (dist > 0.001) {
            const push = minSafeDist - dist;
            this.player.position.x += (dx / dist) * push;
            this.player.position.z += (dz / dist) * push;
          } else {
            this.player.position.x += minSafeDist;
          }
        }
      });
    }

    // Límite de perímetro del campamento
    const distFromCenter = Math.sqrt(this.player.position.x ** 2 + this.player.position.z ** 2);
    if (distFromCenter > 105) {
      this.player.position.x = (this.player.position.x / distFromCenter) * 105;
      this.player.position.z = (this.player.position.z / distFromCenter) * 105;
    }

    // El personaje sigue el relieve del terreno exactamente
    const groundY = this.getTerrainHeight(this.player.position.x, this.player.position.z);
    this.player.position.y = groundY + this.jumpY;
  },

  updateParticles(delta) {
    for (let p of this.dustParticles) {
      if (p.visible) {
        p.life += delta;
        p.position.addScaledVector(p.vel, delta);
        p.material.opacity = Math.max(0, 0.7 * (1 - p.life / p.maxLife));
        if (p.life >= p.maxLife) {
          p.visible = false;
        }
      }
    }
  },

  updateEnvironmentAnimations(elapsed) {
    // 1. Antena de radar de Outpost Beta rotando suavemente
    if (this.radarDish) {
      this.radarDish.rotation.z = Math.sin(elapsed * 0.4) * 0.35;
    }

    // 2. Anemómetro girando con el viento marciano
    if (this.anemometerGroup) {
      this.anemometerGroup.rotation.y += 0.08;
    }

    // 3. Cabeza de ROVI orientándose suavemente hacia el astronauta cuando se acerca
    if (this.roviMastHead && this.player) {
      const rPos = new THREE.Vector3(7, 0, 11);
      const dToPlayer = rPos.distanceTo(this.player.position);
      if (dToPlayer < 20) {
        const targetAngle = Math.atan2(this.player.position.x - 7, this.player.position.z - 11);
        this.roviMastHead.rotation.y = THREE.MathUtils.lerp(this.roviMastHead.rotation.y, targetAngle, 0.05);
      }
    }

    // 4. Remolino de polvo rotando en espiral
    if (this.dustDevilGroup) {
      this.dustDevilGroup.rotation.y += 0.05;
      this.dustDevilGroup.position.x += Math.sin(elapsed * 0.5) * 0.05;
    }

    // 5. Haz láser PIXL pulsando en intensidad
    if (this.pixlLaserBeam) {
      this.pixlLaserBeam.material.opacity = 0.45 + Math.sin(elapsed * 6) * 0.3;
    }

    // 6. Actualización de luces del MAV según GameState
    if (this.mavStageLeds && typeof GameState !== "undefined") {
      const activeStages = GameState.mav || 0;
      this.mavStageLeds.forEach((led, idx) => {
        if (idx < activeStages) {
          led.material.color.setHex(0x22c55e); // Verde listo
        } else {
          led.material.color.setHex(0x475569); // Apagado
        }
      });
    }

    // 7. Animación de las balizas holográficas de las 8 estaciones
    this.stations.forEach(st => {
      if (st.diamond) {
        st.diamond.rotation.y += 0.03;
        st.diamond.position.y = 3.8 + Math.sin(elapsed * 2.5) * 0.22;
      }
      if (st.beaconRing) {
        const pulse = 1 + Math.sin(elapsed * 3.2) * 0.05;
        st.beaconRing.scale.set(pulse, pulse, pulse);
      }
    });
  },

  updateCamera() {
    if (!this.player || !this.camera) return;

    const cosP = Math.cos(this.cameraPitch);
    const sinP = Math.sin(this.cameraPitch);

    const distH = this.cameraOffset.z * cosP;
    const targetX = this.player.position.x + Math.sin(this.cameraAngle) * distH;
    const targetZ = this.player.position.z + Math.cos(this.cameraAngle) * distH;
    const targetY = this.player.position.y + this.cameraOffset.y * sinP + 3.2;

    if (this.isMouseDown) {
      this.camera.position.set(targetX, targetY, targetZ);
    } else {
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, 0.16);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, 0.16);
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZ, 0.16);
    }

    this.camera.lookAt(this.player.position.x, this.player.position.y + 1.6, this.player.position.z);
  },

  checkStationProximity(elapsed) {
    if (!this.player) return;

    let nearest = null;
    let minDist = Infinity;

    this.stations.forEach(st => {
      const dist = this.player.position.distanceTo(st.position);
      if (dist < st.radius && dist < minDist) {
        minDist = dist;
        nearest = st;
      }
    });

    const promptCard = document.getElementById("station-prompt-card");
    const promptText = document.getElementById("station-prompt-text");

    if (nearest) {
      this.activePromptStation = nearest;
      if (promptCard) promptCard.classList.remove("hidden");
      if (promptText) {
        if (nearest.id === "mav" && typeof GameState !== "undefined" && GameState.sol < 15) {
          promptText.textContent = "Cohete MAV en preparación (Despegue disponible en el Sol 15)";
        } else {
          promptText.textContent = nearest.actionText;
        }
      }
    } else {
      this.activePromptStation = null;
      if (promptCard) promptCard.classList.add("hidden");
    }
  }
};

if (typeof window !== "undefined") {
  window.Scene3D = Scene3D;
}
