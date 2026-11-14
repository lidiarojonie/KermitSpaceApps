// js/scene3d.js — Prototipo 3D Interactivo de Exploración en Marte (Three.js)
// Reto NASA Space Apps Challenge 2026: Build a Junior Astronaut Mission Trainer

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
  leftLeg: null,
  rightLeg: null,
  playerSpeed: 14,
  keys: {},

  // Físicas marcianas: Gravedad reducida (0.38g) y Salto
  jumpY: 0,
  jumpVelocity: 0,
  isGrounded: true,

  // Partículas de polvo al pisar y aterrizar
  dustParticles: [],
  lastStepTime: 0,

  // Cámara en tercera persona
  cameraOffset: { x: 0, y: 7, z: 12 },
  cameraAngle: 0,
  isMouseDown: false,
  prevMouseX: 0,

  // Estaciones interactivas y obstáculos físicos
  stations: [],
  obstacles: [],
  activePromptStation: null,

  // Función matemática de relieve marciano continuo (evita hundimientos en montañas)
  getTerrainHeight(x, z) {
    const dist = Math.sqrt(x * x + z * z);
    // Zona central plana para la base (radio 18m)
    if (dist <= 18) return 0;
    // Relieve ondulado para montes y cráteres circundantes
    const rawH = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.8 + Math.sin(x * 0.03 + z * 0.03) * 3.2;
    // Transición suave entre la base y las montañas
    const blend = Math.min(1, (dist - 18) / 12);
    return rawH * blend;
  },

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

    // Asegurar que el contenedor sea visible para calcular dimensiones
    this.container.classList.remove("hidden");

    this.clock = new THREE.Clock();

    // 1. Escena y atmósfera marciana
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb84b2e); // Cielo marciano terracota
    this.scene.fog = new THREE.Fog(0xb84b2e, 25, 230); // Niebla marciana suave

    // 2. Dimensiones robustas garantizadas (mínimo 900x500)
    const width = Math.max(900, this.container.clientWidth || 900);
    const height = Math.max(500, this.container.clientHeight || 500);

    // 3. Cámara en tercera persona
    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 350);
    this.camera.position.set(0, 7, 26);
    this.camera.lookAt(0, 1.6, 14);

    // 4. Renderizador WebGL
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

    // 5. Iluminación realista de Marte
    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x8a3822, 0.85);
    this.scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.5);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5dd, 1.3);
    sunLight.position.set(40, 55, -30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 160;
    const d = 50;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    // 6. Construcción del entorno marciano
    this.buildMartianLandscape();
    this.buildBaseOutpost();
    this.buildPlayer();
    this.buildDustParticleSystem();

    // 7. Event listeners de entrada
    this.setupInputs();

    window.addEventListener("resize", () => this.onWindowResize());

    // Renderizado inmediato del primer frame
    this.renderOnce();
    console.log("Scene3D: Inicializado con exito. Resolucion:", width, "x", height);
  },

  buildMartianLandscape() {
    // Suelo marciano con relieve continuo computado
    const groundGeo = new THREE.PlaneGeometry(260, 260, 64, 64);
    groundGeo.rotateX(-Math.PI / 2);

    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, this.getTerrainHeight(x, z));
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xc85532,
      roughness: 0.88,
      metalness: 0.05
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Rocas y bloques basálticos colocados exactamente sobre el terreno
    const rockGeo = new THREE.DodecahedronGeometry(1, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x8a3822, roughness: 0.9 });

    for (let i = 0; i < 50; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 85;
      const rx = Math.cos(angle) * radius;
      const rz = Math.sin(angle) * radius;
      const scale = 0.6 + Math.random() * 2.2;
      const ry = this.getTerrainHeight(rx, rz);

      rock.scale.set(scale, scale * 0.7, scale);
      rock.position.set(rx, ry + scale * 0.35, rz);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);

      // Registrar rocas grandes como obstáculos físicos
      if (scale > 1.8) {
        this.obstacles.push({ x: rx, z: rz, r: scale * 0.8 });
      }
    }

    // Sol marciano en el cielo
    const sunMarkerGeo = new THREE.SphereGeometry(3.5, 16, 16);
    const sunMarkerMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa });
    const sunMarker = new THREE.Mesh(sunMarkerGeo, sunMarkerMat);
    sunMarker.position.set(80, 75, -80);
    this.scene.add(sunMarker);
  },

  buildBaseOutpost() {
    this.stations = [];
    this.obstacles = [];

    // 1. Cúpula Central del Hábitat (Outpost Beta)
    const habGeo = new THREE.SphereGeometry(7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const habMat = new THREE.MeshStandardMaterial({
      color: 0xedf2f7,
      roughness: 0.35,
      metalness: 0.2
    });
    const habDome = new THREE.Mesh(habGeo, habMat);
    habDome.position.set(0, 0, 0);
    habDome.castShadow = true;
    habDome.receiveShadow = true;
    this.scene.add(habDome);

    const ringGeo = new THREE.TorusGeometry(7.1, 0.25, 12, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0.4, 0);
    this.scene.add(ring);

    // Esclusa de entrada (Airlock)
    const airlockGeo = new THREE.BoxGeometry(2.8, 3.2, 3);
    const airlockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const airlock = new THREE.Mesh(airlockGeo, airlockMat);
    airlock.position.set(0, 1.6, 7);
    airlock.castShadow = true;
    this.scene.add(airlock);

    // Antena parabólica sobre el hábitat
    const dishGeo = new THREE.ConeGeometry(1.6, 0.8, 16, 1, true);
    dishGeo.rotateX(-Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.5 });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 7.8, 0);
    this.scene.add(dish);

    // Obstáculo físico del hábitat
    this.obstacles.push({ x: 0, z: 0, r: 7.3 });
    this.obstacles.push({ x: 0, z: 7, r: 2.2 });

    // 2. Invernadero Biodomo Hidropónico
    const bioDomeGeo = new THREE.SphereGeometry(4.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bioDomeMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.65,
      roughness: 0.2,
      metalness: 0.1
    });
    const bioDome = new THREE.Mesh(bioDomeGeo, bioDomeMat);
    bioDome.position.set(-16, 0, 5);
    bioDome.castShadow = true;
    this.scene.add(bioDome);

    const growLight = new THREE.PointLight(0xff77aa, 2.0, 14);
    growLight.position.set(-16, 2.5, 5);
    this.scene.add(growLight);

    this.obstacles.push({ x: -16, z: 5, r: 4.8 });

    // 3. Granja de Paneles Solares
    for (let p = 0; p < 3; p++) {
      const pz = -6 + p * 6;
      const panelGroup = new THREE.Group();
      const mastGeo = new THREE.CylinderGeometry(0.15, 0.15, 2.4, 8);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = 1.2;
      panelGroup.add(mast);

      const panelGeo = new THREE.BoxGeometry(4.2, 0.15, 2.6);
      panelGeo.rotateX(-Math.PI / 5);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x172554, roughness: 0.2, metalness: 0.7 });
      const panelPlate = new THREE.Mesh(panelGeo, panelMat);
      panelPlate.position.y = 2.4;
      panelPlate.castShadow = true;
      panelGroup.add(panelPlate);

      panelGroup.position.set(16, 0, pz);
      this.scene.add(panelGroup);

      this.obstacles.push({ x: 16, z: pz, r: 2.3 });
    }

    // 4. Torre de Perforación de Hielo (Glaciar Arcadia)
    const rigGroup = new THREE.Group();
    const towerGeo = new THREE.CylinderGeometry(0.3, 1.4, 7, 4);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 3.5;
    tower.castShadow = true;
    rigGroup.add(tower);

    const iceGeo = new THREE.OctahedronGeometry(1.2, 0);
    const iceMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ice = new THREE.Mesh(iceGeo, iceMat);
    ice.position.y = 0.8;
    rigGroup.add(ice);

    const iceLight = new THREE.PointLight(0x38bdf8, 2.5, 12);
    iceLight.position.set(0, 1.2, 0);
    rigGroup.add(iceLight);

    rigGroup.position.set(-15, 0, -14);
    this.scene.add(rigGroup);
    this.obstacles.push({ x: -15, z: -14, r: 2.8 });

    // 5. Cohete MAV (Vehículo de Ascenso a Marte)
    const mavGroup = new THREE.Group();
    const rocketGeo = new THREE.CylinderGeometry(1.6, 1.8, 12, 24);
    const rocketMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.3, roughness: 0.3 });
    const rocket = new THREE.Mesh(rocketGeo, rocketMat);
    rocket.position.y = 6;
    rocket.castShadow = true;
    mavGroup.add(rocket);

    const coneGeo = new THREE.ConeGeometry(1.6, 3.4, 24);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = 13.7;
    cone.castShadow = true;
    mavGroup.add(cone);

    for (let f = 0; f < 3; f++) {
      const finGeo = new THREE.BoxGeometry(0.18, 2.8, 1.6);
      const finMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const fin = new THREE.Mesh(finGeo, finMat);
      const finAngle = (f * Math.PI * 2) / 3;
      fin.position.set(Math.cos(finAngle) * 2.2, 1.5, Math.sin(finAngle) * 2.2);
      fin.rotation.y = -finAngle;
      mavGroup.add(fin);
    }

    mavGroup.position.set(22, 0, 16);
    this.scene.add(mavGroup);
    this.obstacles.push({ x: 22, z: 16, r: 2.8 });

    // 6. Rover ROVI en 3D
    const roverGroup = new THREE.Group();
    const chassisGeo = new THREE.BoxGeometry(2.4, 1, 3.2);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 1.1;
    chassis.castShadow = true;
    roverGroup.add(chassis);

    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.4, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    const wheelOffsets = [
      [-1.3, 0.45, -1.1], [1.3, 0.45, -1.1],
      [-1.3, 0.45, 0],    [1.3, 0.45, 0],
      [-1.3, 0.45, 1.1],  [1.3, 0.45, 1.1]
    ];
    wheelOffsets.forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(pos[0], pos[1], pos[2]);
      roverGroup.add(w);
    });

    const mastPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    mastPole.position.set(0.6, 2.2, -1);
    roverGroup.add(mastPole);
    const cameraHead = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.4), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    cameraHead.position.set(0.6, 3, -1);
    roverGroup.add(cameraHead);

    roverGroup.position.set(7, 0, 11);
    this.scene.add(roverGroup);
    this.obstacles.push({ x: 7, z: 11, r: 2.3 });

    // 7. Nueva Estación: Banco Espectrométrico Láser PIXL (Muestras de regolito)
    const spectroGroup = new THREE.Group();
    const benchGeo = new THREE.CylinderGeometry(2, 2.2, 0.8, 16);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.y = 0.4;
    spectroGroup.add(bench);

    const laserArmGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8);
    laserArmGeo.rotateZ(Math.PI / 4);
    const laserArmMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
    const laserArm = new THREE.Mesh(laserArmGeo, laserArmMat);
    laserArm.position.set(0, 1.4, 0);
    spectroGroup.add(laserArm);

    spectroGroup.position.set(14, 0, -15);
    this.scene.add(spectroGroup);
    this.obstacles.push({ x: 14, z: -15, r: 2.3 });

    // 8. Nueva Estación: Mástil de Defensa y Alerta de Tormentas
    const defenseGroup = new THREE.Group();
    const defMastGeo = new THREE.CylinderGeometry(0.2, 0.5, 5, 8);
    const defMastMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.6 });
    const defMast = new THREE.Mesh(defMastGeo, defMastMat);
    defMast.position.y = 2.5;
    defenseGroup.add(defMast);

    const defBeaconGeo = new THREE.SphereGeometry(0.5, 12, 12);
    const defBeaconMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 });
    const defBeacon = new THREE.Mesh(defBeaconGeo, defBeaconMat);
    defBeacon.position.y = 5.2;
    defenseGroup.add(defBeacon);

    defenseGroup.position.set(-7, 0, 18);
    this.scene.add(defenseGroup);
    this.obstacles.push({ x: -7, z: 18, r: 2.2 });

    // Registro de 8 estaciones interactivas (sin emojis en los textos de acción)
    this.registerStation({
      id: "drill",
      name: "Perforacion Glaciar",
      actionText: "[E] o Clic: Extraer Hielo Subterraneo",
      position: new THREE.Vector3(-15, 0, -14),
      radius: 7.0,
      color: 0x38bdf8,
      minigameKey: "MinigameDrill",
      discoveryId: "water_mars"
    });

    this.registerStation({
      id: "solar",
      name: "Parque Solar",
      actionText: "[E] o Clic: Mantenimiento y Conexion Solar",
      position: new THREE.Vector3(16, 0, 0),
      radius: 8.0,
      color: 0xfacc15,
      minigameKey: "MinigameCircuit",
      discoveryId: "solar_power"
    });

    this.registerStation({
      id: "biodome",
      name: "Biodomo Hidroponico",
      actionText: "[E] o Clic: Cosecha en el Biodomo",
      position: new THREE.Vector3(-16, 0, 5),
      radius: 7.5,
      color: 0x4ade80,
      minigameKey: "MinigameBiodome",
      discoveryId: "biodome_osdr"
    });

    this.registerStation({
      id: "hab",
      name: "Laboratorio MOXIE",
      actionText: "[E] o Clic: Reactor MOXIE de Oxigeno",
      position: new THREE.Vector3(0, 0, 8),
      radius: 6.0,
      color: 0x38bdf8,
      minigameKey: "MinigameMoxie",
      discoveryId: "moxie_oxygen"
    });

    this.registerStation({
      id: "rover",
      name: "Rover ROVI",
      actionText: "[E] o Clic: Carrera con ROVI en el Canon",
      position: new THREE.Vector3(7, 0, 11),
      radius: 6.0,
      color: 0xfacc15,
      minigameKey: "MinigameRoverRace3D",
      discoveryId: "rovers_exploration"
    });

    this.registerStation({
      id: "mav",
      name: "Cohete MAV",
      actionText: "[E] o Clic: Prueba de Ascenso Orbital MAV",
      position: new THREE.Vector3(22, 0, 16),
      radius: 8.0,
      color: 0xf43f5e,
      minigameKey: "MinigameMavLaunch3D",
      discoveryId: "radiation_donki"
    });

    this.registerStation({
      id: "spectro",
      name: "Analizador Laser PIXL",
      actionText: "[E] o Clic: Analizar Minerales con Laser PIXL 3D",
      position: new THREE.Vector3(14, 0, -15),
      radius: 6.5,
      color: 0x38bdf8,
      minigameKey: "MinigamePixlLaser3D",
      discoveryId: "water_mars"
    });

    this.registerStation({
      id: "solar",
      name: "Parque Solar",
      actionText: "[E] o Clic: Paseo Espacial y Reparacion de Paneles",
      position: new THREE.Vector3(16, 0, 0),
      radius: 8.0,
      color: 0xfacc15,
      minigameKey: "MinigameEvaRepair3D",
      discoveryId: "solar_power"
    });

    this.registerStation({
      id: "defense",
      name: "Defensa de Tormentas",
      actionText: "[E] o Clic: Protocolo de Emergencia de Tormenta",
      position: new THREE.Vector3(-7, 0, 18),
      radius: 6.5,
      color: 0xf97316,
      minigameKey: "MinigameDustDefense",
      discoveryId: "dust_devils"
    });
  },

  registerStation(st) {
    const ringGeo = new THREE.RingGeometry(st.radius * 0.65, st.radius * 0.72, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: st.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(st.position);
    ringMesh.position.y = this.getTerrainHeight(st.position.x, st.position.z) + 0.08;
    this.scene.add(ringMesh);

    st.beaconRing = ringMesh;
    this.stations.push(st);
  },

  buildPlayer() {
    this.player = new THREE.Group();

    const suitMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 1.4, 12), suitMat);
    torso.position.y = 1.4;
    torso.castShadow = true;
    this.player.add(torso);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), suitMat);
    helmet.position.y = 2.4;
    helmet.castShadow = true;
    this.player.add(helmet);

    const visorGeo = new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI, 0, Math.PI);
    visorGeo.rotateY(Math.PI / 2);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.1 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.4, 0.15);
    this.player.add(visor);

    const packMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.4), packMat);
    pack.position.set(0, 1.5, -0.45);
    pack.castShadow = true;
    this.player.add(pack);

    this.leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.0), suitMat);
    this.leftLeg.position.set(-0.28, 0.5, 0);
    this.leftLeg.castShadow = true;
    this.player.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.0), suitMat);
    this.rightLeg.position.set(0.28, 0.5, 0);
    this.rightLeg.castShadow = true;
    this.player.add(this.rightLeg);

    this.player.position.set(0, this.getTerrainHeight(0, 14), 14);
    this.scene.add(this.player);
  },

  buildDustParticleSystem() {
    this.dustParticles = [];
    const pGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xc85532, transparent: true, opacity: 0.7 });

    for (let i = 0; i < 24; i++) {
      const p = new THREE.Mesh(pGeo, pMat.clone());
      p.visible = false;
      p.life = 0;
      p.maxLife = 0.5;
      p.vel = new THREE.Vector3();
      this.scene.add(p);
      this.dustParticles.push(p);
    }
  },

  spawnDustPuff(x, y, z, count = 2) {
    let spawned = 0;
    for (let p of this.dustParticles) {
      if (!p.visible) {
        p.visible = true;
        p.life = 0;
        p.position.set(x + (Math.random() - 0.5) * 0.4, y + 0.05, z + (Math.random() - 0.5) * 0.4);
        p.vel.set((Math.random() - 0.5) * 1.5, Math.random() * 1.2 + 0.3, (Math.random() - 0.5) * 1.5);
        p.material.opacity = 0.7;
        spawned++;
        if (spawned >= count) break;
      }
    }
  },

  spawnDustRing(x, y, z) {
    this.spawnDustPuff(x, y, z, 8);
  },

  setupInputs() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;

      // Salto en baja gravedad de Marte con Barra Espaciadora
      if (e.code === "Space" && this.active) {
        if (this.jumpY === 0) {
          this.jumpVelocity = 8.5; // Impulso vertical en 0.38g
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
      e.preventDefault();
    });

    window.addEventListener("mouseup", () => {
      this.isMouseDown = false;
    });

    window.addEventListener("dragend", () => {
      this.isMouseDown = false;
    });

    window.addEventListener("blur", () => {
      this.isMouseDown = false;
      this.keys = {};
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isMouseDown || !this.active) return;
      const deltaX = e.clientX - this.prevMouseX;
      this.cameraAngle -= deltaX * 0.005;
      this.prevMouseX = e.clientX;
    });

    // Soporte para pantalla táctil en dispositivos móviles / tabletas
    dom.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        this.isMouseDown = true;
        this.prevMouseX = e.touches[0].clientX;
      }
    }, { passive: true });

    window.addEventListener("touchend", () => {
      this.isMouseDown = false;
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (!this.isMouseDown || !this.active || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - this.prevMouseX;
      this.cameraAngle -= deltaX * 0.005;
      this.prevMouseX = e.touches[0].clientX;
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
      nasaFact: `Mision completada con exito en la estacion ${station.name}. Recursos transferidos al Outpost Beta.`
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
    const targetX = this.player.position.x + Math.sin(this.cameraAngle) * this.cameraOffset.z;
    const targetZ = this.player.position.z + Math.cos(this.cameraAngle) * this.cameraOffset.z;
    const targetY = this.player.position.y + this.cameraOffset.y;

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

  animate() {
    if (!this.active) return;
    this.animId = requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    this.updatePlayerMovement(delta, elapsed);
    this.updateParticles(delta);
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

      // Vector de movimiento orientado según la perspectiva de la cámara en 3D
      const worldX = moveX * cosA + moveZ * sinA;
      const worldZ = -moveX * sinA + moveZ * cosA;

      this.player.position.x += worldX * this.playerSpeed * delta;
      this.player.position.z += worldZ * this.playerSpeed * delta;

      const targetAngle = Math.atan2(worldX, worldZ);
      this.player.rotation.y = targetAngle;

      // Animación de piernas
      if (this.leftLeg && this.rightLeg) {
        this.leftLeg.rotation.x = Math.sin(elapsed * 10) * 0.45;
        this.rightLeg.rotation.x = -Math.sin(elapsed * 10) * 0.45;
      }

      // Emisión de polvo al caminar
      if (this.jumpY === 0 && elapsed - this.lastStepTime > 0.28) {
        this.lastStepTime = elapsed;
        this.spawnDustPuff(this.player.position.x, this.player.position.y, this.player.position.z, 2);
      }
    } else {
      if (this.leftLeg && this.rightLeg) {
        this.leftLeg.rotation.x = 0;
        this.rightLeg.rotation.x = 0;
      }
    }

    // Físicas de Salto Marciano (Gravedad 0.38g)
    if (this.jumpVelocity !== 0 || this.jumpY > 0) {
      this.jumpY += this.jumpVelocity * delta;
      this.jumpVelocity -= 14 * delta; // Gravedad marciana
      if (this.jumpY <= 0) {
        this.jumpY = 0;
        this.jumpVelocity = 0;
        this.spawnDustRing(this.player.position.x, this.player.position.y, this.player.position.z);
      }
    }

    // Colisión física con estructuras para evitar atravesar paredes o el cohete
    this.obstacles.forEach(obs => {
      const dx = this.player.position.x - obs.x;
      const dz = this.player.position.z - obs.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minSafeDist = obs.r + 0.6; // Radio del obstáculo + radio del astronauta

      if (dist < minSafeDist && dist > 0.001) {
        const push = minSafeDist - dist;
        this.player.position.x += (dx / dist) * push;
        this.player.position.z += (dz / dist) * push;
      }
    });

    // Límite perimetral del campamento marciano
    const distFromCenter = Math.sqrt(this.player.position.x ** 2 + this.player.position.z ** 2);
    if (distFromCenter > 95) {
      this.player.position.x = (this.player.position.x / distFromCenter) * 95;
      this.player.position.z = (this.player.position.z / distFromCenter) * 95;
    }

    // SEGUIMIENTO DE RELIEVE: La altura Y del personaje sigue el terreno exactamente
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

  updateCamera() {
    if (!this.player || !this.camera) return;

    const targetX = this.player.position.x + Math.sin(this.cameraAngle) * this.cameraOffset.z;
    const targetZ = this.player.position.z + Math.cos(this.cameraAngle) * this.cameraOffset.z;
    const targetY = this.player.position.y + this.cameraOffset.y;

    if (this.isMouseDown) {
      // Respuesta orbital inmediata al arrastrar el ratón para evitar desfases o atravesar al personaje
      this.camera.position.set(targetX, targetY, targetZ);
    } else {
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, 0.15);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, 0.15);
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZ, 0.15);
    }

    this.camera.lookAt(this.player.position.x, this.player.position.y + 1.6, this.player.position.z);
  },

  checkStationProximity(elapsed) {
    if (!this.player) return;

    let nearest = null;
    let minDist = Infinity;

    this.stations.forEach(st => {
      const dist = this.player.position.distanceTo(st.position);

      if (st.beaconRing) {
        const scalePulse = 1 + Math.sin(elapsed * 3) * 0.06;
        st.beaconRing.scale.set(scalePulse, scalePulse, scalePulse);
      }

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
      if (promptText) promptText.textContent = nearest.actionText;
    } else {
      this.activePromptStation = null;
      if (promptCard) promptCard.classList.add("hidden");
    }
  }
};

if (typeof window !== "undefined") {
  window.Scene3D = Scene3D;
}
