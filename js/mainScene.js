// js/mainScene.js — Escenario Principal 2.5D / Pseudo-3D Inmersivo en Phaser 3.60
// Reto NASA Space Apps Challenge: Build a Junior Astronaut Mission Trainer
// Direccion de Arte: Realismo Cientifico Marciano + Ingenieria Espacial NASA

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Coordenadas de Parallax interactivo con el puntero
    this.targetParallaxX = 0;
    this.targetParallaxY = 0;
    this.currentParallaxX = 0;
    this.currentParallaxY = 0;

    // 5 Contenedores de profundidad Parallax 3D + Capa Climatica y Efectos de Lente
    this.layer0 = this.add.container(0, 0); // Plano 0: Cielo Rayleigh/Mie, Atardecer Azul, Sol, Rayos, Lunas
    this.layer1 = this.add.container(0, 0); // Plano 1: Cordilleras lejanas, estratos geologicos, remolino de polvo, niebla
    this.layer2 = this.add.container(0, 0); // Plano 2: Cohete MAV, torre gantry, escarcha criogenica, vapor y plasma
    this.layer3 = this.add.container(0, 0); // Plano 3: Outpost Beta geodesico, esclusa, antena giratoria, radiadores, biodomo
    this.layer4 = this.add.container(0, 0); // Plano 4: Dunas de arena, sombras arrojadas, huellas, astronauta y ROVI
    this.weatherLayer = this.add.container(0, 0); // Plano 5: Polvo volumetrico, velo de tormenta y viñeta cinematografica

    this.buildSceneGraphics(w, h);

    // Entrada de raton para Parallax suave
    this.input.on("pointermove", (pointer) => {
      this.targetParallaxX = (pointer.x / this.scale.width) - 0.5;
      this.targetParallaxY = (pointer.y / this.scale.height) - 0.5;
    });

    // Escalado responsive dinamico (Phaser.Scale.RESIZE)
    this.scale.on("resize", (gameSize) => {
      this.onResize(gameSize.width, gameSize.height);
    });
  }

  buildSceneGraphics(w, h) {
    // 1. Limpieza de tweens y animaciones previas para evitar memory leaks
    if (this.stars) this.stars.forEach(s => this.tweens.killTweensOf(s));
    if (this.astronaut) this.tweens.killTweensOf(this.astronaut);
    if (this.roviTween) this.roviTween.stop();
    if (this.habInteriorLight) this.tweens.killTweensOf(this.habInteriorLight);
    if (this.radarDishTween) this.radarDishTween.stop();
    if (this.godRaysTween) this.godRaysTween.stop();

    // 2. Limpieza de contenedores graficos
    this.layer0.removeAll(true);
    this.layer1.removeAll(true);
    this.layer2.removeAll(true);
    this.layer3.removeAll(true);
    this.layer4.removeAll(true);
    this.weatherLayer.removeAll(true);

    const horizonY = h * 0.60;
    const sunX = w * 0.20;
    const sunY = horizonY * 0.28;

    // =========================================================================
    // PLANO 0: CIELO DE MARTE CON DISPERSION OPTICA Y ATARDECER AZUL FISICO
    // =========================================================================
    // En Marte, el polvo fino (0.5 micras) dispersa la luz azul hacia adelante.
    // Esto crea el celebre "Blue Sunset on Mars" alrededor del Sol, mientras el
    // resto del firmamento transiciona de ocre anaranjado a violeta/indigo cosmico.
    const skyGfx = this.add.graphics();
    const skySteps = 40;
    const stops = [
      { t: 0.00, r: 11, g: 7,  b: 24 },  // Cenit espacial profundo (#0b0718)
      { t: 0.25, r: 40, g: 14, b: 46 },  // Alta atmosfera malva purpurea (#280e2e)
      { t: 0.50, r: 96, g: 30, b: 54 },  // Media atmosfera terracota (#601e36)
      { t: 0.72, r: 172, g: 60, b: 40 }, // Dispersion Rayleigh ocre (#ac3c28)
      { t: 0.88, r: 215, g: 86, b: 42 }, // Naranja oxido de hierro (#d7562a)
      { t: 1.00, r: 242, g: 115, b: 54 } // Resplandor crepuscular de horizonte (#f27336)
    ];

    function getMartianSkyColor(normT) {
      for (let i = 0; i < stops.length - 1; i++) {
        if (normT >= stops[i].t && normT <= stops[i + 1].t) {
          const localT = (normT - stops[i].t) / (stops[i + 1].t - stops[i].t);
          const r = Math.round(Phaser.Math.Linear(stops[i].r, stops[i + 1].r, localT));
          const g = Math.round(Phaser.Math.Linear(stops[i].g, stops[i + 1].g, localT));
          const b = Math.round(Phaser.Math.Linear(stops[i].b, stops[i + 1].b, localT));
          return (r << 16) | (g << 8) | b;
        }
      }
      return 0xf27336;
    }

    for (let i = 0; i <= skySteps; i++) {
      const t = i / skySteps;
      const y0 = (horizonY * i) / skySteps;
      const y1 = (horizonY * (i + 1)) / skySteps;
      const col = getMartianSkyColor(t);
      skyGfx.fillStyle(col, 1);
      skyGfx.fillRect(-60, y0 - 4, w + 120, y1 - y0 + 6);
    }
    this.layer0.add(skyGfx);

    // Halo azul de dispersion frontal de Mie caracteristico del Sol marciano
    const blueHaloGfx = this.add.graphics();
    blueHaloGfx.fillStyle(0x38bdf8, 0.14);
    blueHaloGfx.fillCircle(sunX, sunY, 150);
    blueHaloGfx.fillStyle(0x7dd3fc, 0.22);
    blueHaloGfx.fillCircle(sunX, sunY, 90);
    blueHaloGfx.fillStyle(0xbae6fd, 0.38);
    blueHaloGfx.fillCircle(sunX, sunY, 48);
    blueHaloGfx.fillStyle(0xe0f2fe, 0.65);
    blueHaloGfx.fillCircle(sunX, sunY, 26);
    this.layer0.add(blueHaloGfx);

    // Rayos crepusculares volumetricos que barren la atmosfera
    this.godRaysGfx = this.add.graphics();
    this.godRaysGfx.fillStyle(0xfde047, 0.08);
    this.godRaysGfx.fillTriangle(sunX, sunY, sunX - 220, horizonY + 30, sunX + 320, horizonY + 30);
    this.godRaysGfx.fillStyle(0xbae6fd, 0.12);
    this.godRaysGfx.fillTriangle(sunX, sunY, sunX - 60, horizonY + 30, sunX + 160, horizonY + 30);
    this.godRaysGfx.fillStyle(0xfb923c, 0.06);
    this.godRaysGfx.fillTriangle(sunX, sunY, -50, horizonY + 10, sunX - 90, horizonY + 30);
    this.layer0.add(this.godRaysGfx);

    // Animacion sutil de respiracion de los rayos solares
    this.godRaysTween = this.tweens.add({
      targets: this.godRaysGfx,
      alpha: { from: 0.85, to: 1.15 },
      duration: 3800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Disco solar con halo interior blanco puro y contorno entintado
    const sunGleam = this.add.circle(sunX, sunY, 17, 0xffffff, 1).setStrokeStyle(2.5, 0x161b28);
    const sunSpikeH = this.add.rectangle(sunX, sunY, 52, 2, 0xffffff, 0.55);
    const sunSpikeV = this.add.rectangle(sunX, sunY, 2, 52, 0xffffff, 0.55);
    this.layer0.add([sunGleam, sunSpikeH, sunSpikeV]);

    // Estrellas titilantes cientificas con extincion atmosferica cerca del horizonte
    this.stars = [];
    for (let i = 0; i < 75; i++) {
      const sx = Phaser.Math.Between(-20, w + 20);
      const sy = Phaser.Math.Between(0, horizonY * 0.62);
      const altitudeFactor = 1 - (sy / (horizonY * 0.62));
      const radius = Phaser.Math.FloatBetween(0.7, 2.2);
      const starAlpha = Phaser.Math.FloatBetween(0.25, 0.95) * altitudeFactor;
      const star = this.add.circle(sx, sy, radius, 0xffffff, starAlpha);
      this.layer0.add(star);
      this.stars.push(star);

      this.tweens.add({
        targets: star,
        alpha: starAlpha * 0.35,
        duration: Phaser.Math.Between(1600, 3600),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    // Fobos (morfologia irregular con crater Stickney y estrias de impacto)
    this.phobos = this.add.container(w * 0.67, horizonY * 0.22);
    const phobosBody = this.add.ellipse(0, 0, 22, 16, 0xd1d5db).setStrokeStyle(2, 0x161b28);
    const phobosTerminator = this.add.ellipse(4, 2, 17, 13, 0x6b7280, 0.9);
    const craterStickney = this.add.circle(-5, -2, 4.5, 0x374151).setStrokeStyle(1.5, 0x1f2937);
    const phobosGroove1 = this.add.rectangle(2, -4, 9, 1.2, 0x4b5563);
    const phobosGroove2 = this.add.rectangle(3, 3, 11, 1.2, 0x4b5563);
    this.phobos.add([phobosBody, phobosTerminator, craterStickney, phobosGroove1, phobosGroove2]);
    this.layer0.add(this.phobos);

    // Deimos (pequena luna oblonga con capa de regolito liso)
    this.deimos = this.add.ellipse(w * 0.86, horizonY * 0.36, 9, 6.5, 0x9ca3af)
      .setStrokeStyle(1.5, 0x161b28);
    this.layer0.add(this.deimos);

    // =========================================================================
    // PLANO 1: TOPOGRAFIA DE ARCADIA PLANITIA, ESTRATOS Y REMOLINO DE POLVO
    // =========================================================================
    const ridgeGfx = this.add.graphics();

    // Capa 1: Cordillera lejana del escudo volcanico (25+ km) con niebla de distancia
    ridgeGfx.fillStyle(0x562016, 0.88);
    ridgeGfx.lineStyle(2, 0x161b28, 0.9);
    ridgeGfx.beginPath();
    ridgeGfx.moveTo(-60, horizonY);
    const pts1 = [0.0, 0.12, 0.25, 0.39, 0.54, 0.68, 0.82, 0.94, 1.1];
    pts1.forEach((px, idx) => {
      const rx = -60 + (w + 120) * px;
      const ry = horizonY - (idx % 2 === 1 ? 62 : 26) - (idx % 3 === 0 ? 28 : 0);
      ridgeGfx.lineTo(rx, ry);
    });
    ridgeGfx.lineTo(w + 60, horizonY + 25);
    ridgeGfx.lineTo(-60, horizonY + 25);
    ridgeGfx.closePath();
    ridgeGfx.fillPath();
    ridgeGfx.strokePath();

    // Resplandor de cresta (Rim Light) proyectado por el sol poniente
    const rimGfx = this.add.graphics();
    rimGfx.lineStyle(2.5, 0xfbbf24, 0.80);
    rimGfx.beginPath();
    pts1.forEach((px, idx) => {
      const rx = -60 + (w + 120) * px;
      const ry = horizonY - (idx % 2 === 1 ? 62 : 26) - (idx % 3 === 0 ? 28 : 0);
      if (idx === 0) rimGfx.moveTo(rx, ry);
      else rimGfx.lineTo(rx, ry);
    });
    rimGfx.strokePath();

    // Capa 2: Mesas y farallones intermedios con estratos sedimentarios visibles
    ridgeGfx.fillStyle(0x7c2c1a, 0.96);
    ridgeGfx.lineStyle(3, 0x161b28, 1);
    ridgeGfx.beginPath();
    ridgeGfx.moveTo(-60, horizonY + 16);
    const pts2 = [0.0, 0.10, 0.21, 0.34, 0.48, 0.63, 0.77, 0.91, 1.1];
    pts2.forEach((px, idx) => {
      const rx = -60 + (w + 120) * px;
      const ry = horizonY - (idx % 2 === 0 ? 44 : 16) - ((idx * 7) % 20);
      ridgeGfx.lineTo(rx, ry);
    });
    ridgeGfx.lineTo(w + 60, horizonY + 38);
    ridgeGfx.lineTo(-60, horizonY + 38);
    ridgeGfx.closePath();
    ridgeGfx.fillPath();
    ridgeGfx.strokePath();

    // Bandas geologicas de estratificacion en las laderas intermedias
    const strataGfx = this.add.graphics();
    strataGfx.lineStyle(1.8, 0x45160d, 0.65);
    for (let s = 0; s < 4; s++) {
      const syOffset = horizonY - 14 + s * 7;
      strataGfx.beginPath();
      strataGfx.moveTo(-50, syOffset);
      for (let sx = -50; sx <= w + 50; sx += 40) {
        strataGfx.lineTo(sx, syOffset + Math.sin(sx * 0.015 + s) * 4);
      }
      strataGfx.strokePath();
    }

    this.layer1.add([ridgeGfx, rimGfx, strataGfx]);

    // Remolino de polvo marciano (Dust Devil) en la planicie lejana
    this.dustDevil = this.add.container(w * 0.74, horizonY - 8);
    const devilGfx = this.add.graphics();
    devilGfx.fillStyle(0xd97706, 0.35);
    // Columna vertical en embudo
    devilGfx.fillTriangle(0, 0, -8, -90, 8, -90);
    devilGfx.fillStyle(0xf59e0b, 0.45);
    devilGfx.fillTriangle(0, 0, -4, -60, 4, -60);
    this.dustDevil.add(devilGfx);
    this.dustDevil.vx = -14; // Velocidad de deriva con el viento marciano
    this.dustDevil.baseY = horizonY - 8;
    this.layer1.add(this.dustDevil);

    // Velo de niebla atmosferica sobre el horizonte
    const horizonFog = this.add.graphics();
    horizonFog.fillStyle(0xc85532, 0.28);
    horizonFog.fillRect(-60, horizonY - 42, w + 120, 68);
    this.layer1.add(horizonFog);

    // Capa Lejana de Polvo (Far Dust): micro-particulas lentas en suspension
    this.dustFar = [];
    for (let p = 0; p < 55; p++) {
      const px = Phaser.Math.Between(0, w);
      const py = Phaser.Math.Between(horizonY - 130, horizonY + 70);
      const pSize = Phaser.Math.FloatBetween(0.8, 1.8);
      const pAlpha = Phaser.Math.FloatBetween(0.18, 0.35);
      const pMesh = this.add.circle(px, py, pSize, 0xc2410c, pAlpha);
      pMesh.speedX = Phaser.Math.FloatBetween(16, 36);
      pMesh.speedY = Phaser.Math.FloatBetween(-3, 3);
      this.layer1.add(pMesh);
      this.dustFar.push(pMesh);
    }

    // =========================================================================
    // PLANO 2: COHETE MAV (INGENIERIA NASA, ESCARCHA CRIOGENICA, VAPOR Y PLASMA)
    // =========================================================================
    const mavBaseX = w * 0.16;
    const mavBaseY = horizonY + h * 0.08;

    // Torre de servicio Gantry con pasarelas de lanzamiento y baliza de advertencia
    const gantryGfx = this.add.graphics();
    gantryGfx.lineStyle(2.5, 0x161b28, 1);
    gantryGfx.strokeRect(mavBaseX - 36, mavBaseY - 148, 15, 148);
    for (let gy = mavBaseY - 148; gy < mavBaseY; gy += 18) {
      gantryGfx.lineBetween(mavBaseX - 36, gy, mavBaseX - 21, gy + 18);
      gantryGfx.lineBetween(mavBaseX - 36, gy + 18, mavBaseX - 21, gy);
    }
    // Brazo umbilical criogenico basculante conectado al cohete
    gantryGfx.strokeRect(mavBaseX - 21, mavBaseY - 82, 26, 7);
    gantryGfx.fillStyle(0x475569, 1);
    gantryGfx.fillRect(mavBaseX - 20, mavBaseY - 81, 24, 5);

    // Mástil pararrayos y baliza roja de navegacion superior
    gantryGfx.lineBetween(mavBaseX - 28, mavBaseY - 148, mavBaseX - 28, mavBaseY - 162);
    const gantryBeacon = this.add.circle(mavBaseX - 28, mavBaseY - 163, 3, 0xef4444);
    this.tweens.add({
      targets: gantryBeacon,
      alpha: { from: 0.2, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    this.layer2.add([gantryGfx, gantryBeacon]);

    // Fuselaje del Cohete MAV con aislamiento termico y costuras tecnicas
    const rocketH = 125;
    const rocketW = 34;

    const mavCoreShadow = this.add.rectangle(mavBaseX + 8, mavBaseY - rocketH / 2, rocketW / 2 + 1, rocketH, 0x94a3b8);
    const mavCoreLight = this.add.rectangle(mavBaseX - 8, mavBaseY - rocketH / 2, rocketW / 2 + 1, rocketH, 0xf8fafc);
    const mavOutline = this.add.rectangle(mavBaseX, mavBaseY - rocketH / 2, rocketW, rocketH).setStrokeStyle(3, 0x161b28);

    // Bandas de escarcha criogenica (condensacion de hielo por metano y LOX superenfriados)
    const frostBand1 = this.add.rectangle(mavBaseX, mavBaseY - 90, rocketW - 4, 12, 0xe0f2fe, 0.85);
    const frostBand2 = this.add.rectangle(mavBaseX, mavBaseY - 45, rocketW - 4, 16, 0xe0f2fe, 0.85);

    // Aletas de titanio para guiado hipersonico en el reingreso/ascenso (Grid Fins)
    const gridFinLeft = this.add.rectangle(mavBaseX - rocketW / 2 - 4, mavBaseY - 105, 8, 12, 0x334155).setStrokeStyle(1.5, 0x161b28);
    const gridFinRight = this.add.rectangle(mavBaseX + rocketW / 2 + 4, mavBaseY - 105, 8, 12, 0x334155).setStrokeStyle(1.5, 0x161b28);

    // Ojiva conica aerodinamica con escudo termico ablativo rojo NASA
    const coneGfx = this.add.graphics();
    coneGfx.fillStyle(0xf43f5e, 1);
    coneGfx.lineStyle(3, 0x161b28, 1);
    coneGfx.fillTriangle(mavBaseX, mavBaseY - rocketH - 42, mavBaseX - rocketW / 2, mavBaseY - rocketH, mavBaseX + rocketW / 2, mavBaseY - rocketH);
    coneGfx.strokeTriangle(mavBaseX, mavBaseY - rocketH - 42, mavBaseX - rocketW / 2, mavBaseY - rocketH, mavBaseX + rocketW / 2, mavBaseY - rocketH);
    coneGfx.fillStyle(0xfecdd3, 0.45);
    coneGfx.fillTriangle(mavBaseX, mavBaseY - rocketH - 42, mavBaseX - rocketW / 2, mavBaseY - rocketH, mavBaseX - 2, mavBaseY - rocketH);

    // Aletas estabilizadoras de base con refuerzos diagonales
    const finsGfx = this.add.graphics();
    finsGfx.fillStyle(0x334155, 1);
    finsGfx.lineStyle(2.5, 0x161b28, 1);
    finsGfx.fillTriangle(mavBaseX - rocketW / 2, mavBaseY - 45, mavBaseX - rocketW / 2 - 18, mavBaseY, mavBaseX - rocketW / 2, mavBaseY);
    finsGfx.strokeTriangle(mavBaseX - rocketW / 2, mavBaseY - 45, mavBaseX - rocketW / 2 - 18, mavBaseY, mavBaseX - rocketW / 2, mavBaseY);
    finsGfx.fillTriangle(mavBaseX + rocketW / 2, mavBaseY - 45, mavBaseX + rocketW / 2 + 18, mavBaseY, mavBaseX + rocketW / 2, mavBaseY);
    finsGfx.strokeTriangle(mavBaseX + rocketW / 2, mavBaseY - 45, mavBaseX + rocketW / 2 + 18, mavBaseY, mavBaseX + rocketW / 2, mavBaseY);

    // Tobera de aleacion refractaria de niobio
    const nozzleGfx = this.add.graphics();
    nozzleGfx.fillStyle(0x1e293b, 1);
    nozzleGfx.lineStyle(2, 0x161b28, 1);
    nozzleGfx.fillRect(mavBaseX - 11, mavBaseY - 4, 22, 9);
    nozzleGfx.strokeRect(mavBaseX - 11, mavBaseY - 4, 22, 9);

    // Resplandor y destellos de energia de precalentamiento en la tobera
    this.mavEngineGlow = this.add.circle(mavBaseX, mavBaseY + 4, 18, 0x38bdf8, 0);
    this.mavEngineGlow2 = this.add.circle(mavBaseX, mavBaseY + 4, 9, 0xfacc15, 0);

    // Placa tecnica con tipografia Space Mono
    const mavBadgeBg = this.add.rectangle(mavBaseX, mavBaseY + 24, 96, 20, 0x1e2430).setStrokeStyle(2, 0x161b28);
    const mavLabel = this.add.text(mavBaseX, mavBaseY + 24, "COHETE MAV", {
      fontSize: "11px",
      fontStyle: "bold",
      color: "#f7e396",
      fontFamily: "'Space Mono', monospace"
    }).setOrigin(0.5);

    // Indicadores luminosos de etapas del MAV
    this.mavStageLights = [
      this.add.circle(mavBaseX, mavBaseY - 95, 4, 0x475569).setStrokeStyle(1.5, 0x161b28),
      this.add.circle(mavBaseX, mavBaseY - 65, 4, 0x475569).setStrokeStyle(1.5, 0x161b28),
      this.add.circle(mavBaseX, mavBaseY - 35, 4, 0x475569).setStrokeStyle(1.5, 0x161b28)
    ];

    this.layer2.add([
      mavCoreShadow, mavCoreLight, mavOutline, frostBand1, frostBand2,
      gridFinLeft, gridFinRight, coneGfx, finsGfx, nozzleGfx,
      this.mavEngineGlow, this.mavEngineGlow2, mavBadgeBg, mavLabel, ...this.mavStageLights
    ]);

    // Particulas de vapor criogenico (LOX / Metano liquido) saliendo del venteo
    this.vaporParticles = [];
    for (let v = 0; v < 20; v++) {
      const vp = this.add.circle(mavBaseX + 16, mavBaseY - 80, Phaser.Math.FloatBetween(2, 6), 0xf0fdf4, 0.75);
      vp.vx = Phaser.Math.FloatBetween(16, 42);
      vp.vy = Phaser.Math.FloatBetween(-6, 6);
      vp.baseAlpha = Phaser.Math.FloatBetween(0.35, 0.80);
      this.layer2.add(vp);
      this.vaporParticles.push(vp);
    }

    // Micro-destellos de plasma en el escape del motor
    this.plasmaSparks = [];
    for (let s = 0; s < 7; s++) {
      const spark = this.add.circle(mavBaseX, mavBaseY + 3, Phaser.Math.FloatBetween(1.2, 2.6), 0x38bdf8, 0);
      this.layer2.add(spark);
      this.plasmaSparks.push(spark);
    }

    // =========================================================================
    // PLANO 3: OUTPOST BETA GEODESICO, ESCLUSA, ANTENA GIRATORIA Y RADIADORES
    // =========================================================================
    const habCenterX = w * 0.48;
    const habCenterY = horizonY + h * 0.16;
    const habRadius = Math.min(w * 0.14, 130);

    // Cúpula Geodesica Facetada (Tessellacion Triangular Aeroespacial)
    const domeGfx = this.add.graphics();
    domeGfx.fillStyle(0x0f172a, 1);
    domeGfx.fillCircle(habCenterX, habCenterY, habRadius);

    // Cascaron presurizado base
    domeGfx.fillStyle(0xf1f5f9, 1);
    domeGfx.lineStyle(3.5, 0x161b28, 1);
    domeGfx.fillCircle(habCenterX, habCenterY, habRadius);
    domeGfx.strokeCircle(habCenterX, habCenterY, habRadius);

    // Facetas triangulares sombreadas (Geodesic Trusses)
    domeGfx.fillStyle(0x94a3b8, 0.45);
    domeGfx.fillCircle(habCenterX + habRadius * 0.22, habCenterY + habRadius * 0.18, habRadius * 0.90);

    // Malla de nervaduras geodesicas reales
    domeGfx.lineStyle(2, 0x0284c7, 0.8);
    const rings = 4;
    for (let r = 1; r <= rings; r++) {
      const ringR = (habRadius * r) / rings;
      domeGfx.strokeEllipse(habCenterX, habCenterY + (habRadius - ringR) * 0.3, ringR * 2, ringR * 1.4);
    }
    // Radios estructurales
    for (let a = -Math.PI * 0.8; a <= Math.PI * 0.8; a += Math.PI / 4) {
      const ex = habCenterX + Math.cos(a) * habRadius;
      const ey = habCenterY + Math.sin(a) * habRadius * 0.7;
      domeGfx.lineBetween(habCenterX, habCenterY - habRadius * 0.35, ex, ey);
    }

    // Reflejo especular curvo en la cupula
    domeGfx.fillStyle(0xffffff, 0.65);
    domeGfx.fillEllipse(habCenterX - habRadius * 0.32, habCenterY - habRadius * 0.38, habRadius * 0.60, habRadius * 0.25);

    // Anillo de cimentacion presurizada
    const ringBase = this.add.rectangle(habCenterX, habCenterY + habRadius * 0.88, habRadius * 2.15, 14, 0x1e293b)
      .setStrokeStyle(3, 0x161b28);

    // Ventana central con iluminacion calida
    this.habInteriorLight = this.add.circle(habCenterX, habCenterY - 10, habRadius * 0.38, 0xfef08a, 0.55);
    this.tweens.add({
      targets: this.habInteriorLight,
      alpha: 0.35,
      duration: 1800,
      yoyo: true,
      repeat: -1
    });

    // Modulo de Esclusa de Descompresion (Airlock Module) a la izquierda de la cupula
    const airlockX = habCenterX - habRadius * 0.88;
    const airlockY = habCenterY + habRadius * 0.55;
    const airlockGfx = this.add.graphics();
    airlockGfx.fillStyle(0xe2e8f0, 1);
    airlockGfx.lineStyle(2.5, 0x161b28, 1);
    airlockGfx.fillRect(airlockX - 22, airlockY - 18, 28, 36);
    airlockGfx.strokeRect(airlockX - 22, airlockY - 18, 28, 36);
    // Escotilla circular de salida EVA
    airlockGfx.fillStyle(0x334155, 1);
    airlockGfx.fillCircle(airlockX - 8, airlockY, 9);
    airlockGfx.strokeCircle(airlockX - 8, airlockY, 9);
    // Baliza de estado de esclusa (verde: presurizada)
    const airlockBeacon = this.add.circle(airlockX - 8, airlockY - 22, 2.5, 0x22c55e);

    // Mástil con Antena Parabolica de Comunicaciones con la Tierra (Gira lentamente)
    const mastX = habCenterX + habRadius * 0.65;
    const mastY = habCenterY - habRadius * 0.68;
    const commMastGfx = this.add.graphics();
    commMastGfx.lineStyle(2.5, 0x161b28, 1);
    commMastGfx.lineBetween(mastX, mastY, mastX, mastY - 32);

    this.radarDish = this.add.ellipse(mastX, mastY - 32, 26, 9, 0xf8fafc)
      .setStrokeStyle(2, 0x161b28);
    const radarFeed = this.add.line(mastX, mastY - 32, 0, 0, 8, -6, 0x0284c7)
      .setLineWidth(2);

    // Animacion continua de rastreo orbital de la antena
    this.radarDishTween = this.tweens.add({
      targets: this.radarDish,
      scaleX: { from: 1, to: 0.6 },
      duration: 4200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Paneles Radiadores de disipacion termica (acordeon desplegable)
    const radGfx = this.add.graphics();
    radGfx.lineStyle(2, 0x161b28, 1);
    radGfx.fillStyle(0x475569, 1);
    const radX = habCenterX + habRadius * 0.88;
    const radY = habCenterY - 15;
    for (let r = 0; r < 3; r++) {
      radGfx.fillRect(radX + r * 10, radY, 8, 38);
      radGfx.strokeRect(radX + r * 10, radY, 8, 38);
      // Brillo termico disipador tenue
      radGfx.fillStyle(0xf97316, 0.4);
      radGfx.fillRect(radX + r * 10 + 2, radY + 2, 4, 34);
      radGfx.fillStyle(0x475569, 1);
    }

    const habBadge = this.add.rectangle(habCenterX, habCenterY - habRadius - 20, 115, 22, 0x1e2430)
      .setStrokeStyle(2, 0x161b28);
    const habLabel = this.add.text(habCenterX, habCenterY - habRadius - 20, "OUTPOST BETA", {
      fontSize: "12px",
      fontStyle: "bold",
      color: "#38bdf8",
      fontFamily: "'Space Mono', monospace"
    }).setOrigin(0.5);

    // Escudo deflector magnetico DONKI
    this.shieldGfx = this.add.graphics();
    this.drawShieldShimmer(habCenterX, habCenterY, habRadius * 1.25);

    this.layer3.add([
      domeGfx, this.habInteriorLight, ringBase, airlockGfx, airlockBeacon,
      commMastGfx, this.radarDish, radarFeed, radGfx, habBadge, habLabel, this.shieldGfx
    ]);

    // 2. Biodomo Invernadero OSDR
    const bioX = habCenterX + habRadius * 1.35;
    const bioY = habCenterY + habRadius * 0.25;
    const bioRadius = habRadius * 0.48;

    const bioGfx = this.add.graphics();
    bioGfx.fillStyle(0x4ade80, 0.45);
    bioGfx.lineStyle(3, 0x161b28, 1);
    bioGfx.fillCircle(bioX, bioY, bioRadius);
    bioGfx.strokeCircle(bioX, bioY, bioRadius);

    const bioLed = this.add.circle(bioX, bioY, bioRadius * 0.65, 0xf43f5e, 0.50);
    const bioBadge = this.add.rectangle(bioX, bioY - bioRadius - 14, 105, 20, 0x1e2430).setStrokeStyle(2, 0x161b28);
    const bioLabel = this.add.text(bioX, bioY - bioRadius - 14, "BIODOMO OSDR", {
      fontSize: "10px",
      fontStyle: "bold",
      color: "#4ade80",
      fontFamily: "'Space Mono', monospace"
    }).setOrigin(0.5);

    this.layer3.add([bioGfx, bioLed, bioBadge, bioLabel]);

    // 3. Parque de Paneles Solares Fotovoltaicos de Alta Eficiencia
    const solarGfx = this.add.graphics();
    const solarBaseX = w * 0.84;
    const solarBaseY = horizonY + h * 0.12;

    for (let p = 0; p < 3; p++) {
      const px = solarBaseX + p * 38;
      const py = solarBaseY + p * 12;
      solarGfx.lineStyle(3, 0x161b28, 1);
      solarGfx.lineBetween(px, py, px, py + 36);
      solarGfx.fillStyle(0x172554, 1);
      solarGfx.lineStyle(2, 0x161b28, 1);
      const panelPts = [
        { x: px - 28, y: py - 12 },
        { x: px + 18, y: py - 20 },
        { x: px + 28, y: py + 8 },
        { x: px - 18, y: py + 16 }
      ];
      solarGfx.fillPoints(panelPts, true);
      solarGfx.strokePoints(panelPts, true);

      // Rejilla de celdas solares fotovoltaicas
      solarGfx.lineStyle(1, 0x60a5fa, 0.7);
      solarGfx.lineBetween(px - 5, py - 16, px + 5, py + 12);
      solarGfx.lineBetween(px - 23, py + 2, px + 23, py - 6);
    }
    this.layer3.add(solarGfx);

    // Conductos pesados de energia y tuberias presurizadas en el suelo
    const conduitGfx = this.add.graphics();
    conduitGfx.lineStyle(3, 0x0f172a, 0.95);
    // Cable principal del campo solar al habitat
    conduitGfx.beginPath();
    conduitGfx.moveTo(solarBaseX, solarBaseY + 36);
    conduitGfx.lineTo(habCenterX + habRadius, habCenterY + habRadius * 0.85);
    // Cable del habitat a la torre MAV
    conduitGfx.moveTo(habCenterX - habRadius, habCenterY + habRadius * 0.85);
    conduitGfx.lineTo(mavBaseX + 24, mavBaseY + 4);
    conduitGfx.strokePath();
    this.layer3.add(conduitGfx);

    // Capa Media de Polvo (Mid Dust): iluminadas cerca de las estructuras
    this.dustMid = [];
    for (let p = 0; p < 45; p++) {
      const px = Phaser.Math.Between(0, w);
      const py = Phaser.Math.Between(horizonY, h);
      const pSize = Phaser.Math.FloatBetween(2.0, 3.8);
      const pAlpha = Phaser.Math.FloatBetween(0.40, 0.70);
      const pMesh = this.add.circle(px, py, pSize, 0xf59e0b, pAlpha);
      pMesh.speedX = Phaser.Math.FloatBetween(48, 88);
      pMesh.speedY = Phaser.Math.FloatBetween(-4, 5);
      this.layer3.add(pMesh);
      this.dustMid.push(pMesh);
    }

    // =========================================================================
    // PLANO 4: SUELO MARCRA CON DUNAS EOLICAS, SOMBRAS PROYECTADAS Y HUELLAS
    // =========================================================================
    const groundGfx = this.add.graphics();
    const groundH = h - horizonY;
    const groundSteps = 20;

    // Gradiente de regolito en perspectiva
    for (let g = 0; g < groundSteps; g++) {
      const gt = g / groundSteps;
      const gy0 = horizonY + (groundH * g) / groundSteps;
      const gy1 = horizonY + (groundH * (g + 1)) / groundSteps;
      const gr = Math.round(180 + gt * (228 - 180));
      const gg = Math.round(65 + gt * (82 - 65));
      const gb = Math.round(38 + gt * (35 - 38));
      const gCol = (gr << 16) | (gg << 8) | gb;
      groundGfx.fillStyle(gCol, 1);
      groundGfx.fillRect(-60, gy0, w + 120, gy1 - gy0 + 2);
    }

    // Ondas eolicas de arena (Dune Ripples) en perspectiva hacia el horizonte
    const rippleGfx = this.add.graphics();
    for (let r = 0; r < 14; r++) {
      const rProg = r / 14;
      const ry = horizonY + 15 + Math.pow(rProg, 1.4) * (groundH - 25);
      const rAlpha = 0.20 + rProg * 0.45;
      rippleGfx.lineStyle(1.8 + rProg * 2, 0x832616, rAlpha);
      rippleGfx.beginPath();
      rippleGfx.moveTo(-40, ry);
      for (let rx = -40; rx <= w + 40; rx += 45) {
        rippleGfx.lineTo(rx, ry + Math.sin(rx * 0.02 + r * 1.5) * (2 + rProg * 5));
      }
      rippleGfx.strokePath();
    }
    this.layer4.add([groundGfx, rippleGfx]);

    // Fracturas poligonales del permafrost de Arcadia Planitia
    const permafrostGfx = this.add.graphics();
    permafrostGfx.lineStyle(1.2, 0x5a180b, 0.45);
    for (let poly = 0; poly < 8; poly++) {
      const px = w * 0.15 + (poly * (w * 0.11));
      const py = horizonY + 30 + ((poly * 27) % (groundH * 0.6));
      permafrostGfx.strokePoints([
        { x: px - 18, y: py - 6 },
        { x: px + 8,  y: py - 12 },
        { x: px + 22, y: py + 2 },
        { x: px + 6,  y: py + 14 },
        { x: px - 14, y: py + 8 }
      ], true);
    }
    this.layer4.add(permafrostGfx);

    // Rocas basalticas facetadas (Ventifactos moldeados por el viento marciano)
    for (let r = 0; r < 24; r++) {
      const rx = Phaser.Math.Between(0, w);
      const ry = Phaser.Math.Between(horizonY + 25, h - 15);
      const rScale = Phaser.Math.FloatBetween(2.5, 9);
      // Sombra proyectada alargada por el sol bajo
      groundGfx.fillStyle(0x2d0c06, 0.65);
      groundGfx.fillEllipse(rx + rScale * 1.4, ry + rScale * 0.5, rScale * 3.2, rScale * 0.9);
      // Cara iluminada
      groundGfx.fillStyle(0x943722, 1);
      groundGfx.lineStyle(2, 0x161b28, 1);
      groundGfx.fillCircle(rx, ry, rScale);
      groundGfx.strokeCircle(rx, ry, rScale);
    }

    // =========================================================================
    // SOMBRAS ARROJADAS ALARGADAS Y OCLUSION AMBIENTAL (SOL BAJO MARCIANO)
    // El sol bajo en la izquierda proyecta sombras largas hacia la derecha (+X, +Y)
    // =========================================================================
    const castShadowsGfx = this.add.graphics();

    // Sombra proyectada del Cohete MAV (alargada hacia la derecha)
    castShadowsGfx.fillStyle(0x180502, 0.70);
    castShadowsGfx.fillPoints([
      { x: mavBaseX - 14, y: mavBaseY + 6 },
      { x: mavBaseX + 18, y: mavBaseY + 6 },
      { x: mavBaseX + 160, y: mavBaseY + 52 },
      { x: mavBaseX + 130, y: mavBaseY + 58 }
    ], true);

    // Sombra del Habitat Outpost Beta (elipse amplia oblicua)
    castShadowsGfx.fillStyle(0x180502, 0.75);
    castShadowsGfx.fillEllipse(habCenterX + 28, habCenterY + habRadius * 0.90, habRadius * 2.6, 52);
    // Nucleo de contacto oscuro
    castShadowsGfx.fillStyle(0x0a0201, 0.90);
    castShadowsGfx.fillEllipse(habCenterX + 12, habCenterY + habRadius * 0.92, habRadius * 2.1, 28);

    // Sombra del Biodomo OSDR
    castShadowsGfx.fillStyle(0x180502, 0.70);
    castShadowsGfx.fillEllipse(bioX + 22, bioY + bioRadius * 0.92, bioRadius * 2.4, 28);
    castShadowsGfx.fillStyle(0x0a0201, 0.85);
    castShadowsGfx.fillEllipse(bioX + 10, bioY + bioRadius * 0.93, bioRadius * 1.9, 16);

    // Sombras de los paneles solares
    for (let p = 0; p < 3; p++) {
      const px = solarBaseX + p * 38;
      const py = solarBaseY + p * 12 + 36;
      castShadowsGfx.fillStyle(0x180502, 0.75);
      castShadowsGfx.fillPoints([
        { x: px - 6, y: py },
        { x: px + 6, y: py },
        { x: px + 54, y: py + 22 },
        { x: px + 42, y: py + 24 }
      ], true);
    }
    this.layer4.add(castShadowsGfx);

    // Huellas de Rodadura del Rover ROVI impresas en el regolito
    const roviBaseX = habCenterX + habRadius * 0.25;
    const roviBaseY = habCenterY + habRadius * 0.78;

    const tracksGfx = this.add.graphics();
    tracksGfx.lineStyle(2.5, 0x3d0f07, 0.75);
    // Par de huellas continuas paralelas donde patrulla ROVI
    tracksGfx.lineBetween(roviBaseX - 30, roviBaseY + 16, roviBaseX + 140, roviBaseY + 16);
    tracksGfx.lineBetween(roviBaseX - 30, roviBaseY + 22, roviBaseX + 140, roviBaseY + 22);
    // Marcas dentadas de los cleats de las ruedas
    for (let tx = roviBaseX - 25; tx <= roviBaseX + 135; tx += 8) {
      tracksGfx.lineBetween(tx, roviBaseY + 14, tx + 2, roviBaseY + 24);
    }
    this.layer4.add(tracksGfx);

    // Astronauta con traje espacial EMU y mochila PLSS
    const astroX = habCenterX - habRadius * 0.45;
    const astroY = habCenterY + habRadius * 0.72;

    this.astroShadow = this.add.ellipse(astroX + 16, astroY + 32, 46, 14, 0x0a0201, 0.85);

    this.astronaut = this.add.container(astroX, astroY);
    const astroBody = this.add.rectangle(0, 8, 20, 28, 0xf1f5f9, 1).setStrokeStyle(2.5, 0x161b28);
    const astroPack = this.add.rectangle(-12, 6, 11, 24, 0x475569).setStrokeStyle(2, 0x161b28);
    const astroHelmet = this.add.circle(0, -14, 13, 0xf8fafc).setStrokeStyle(3, 0x161b28);
    // Visor dorado reflectante con miniatura del horizonte
    const astroVisor = this.add.ellipse(3, -14, 14, 10, 0xfacc15, 0.95).setStrokeStyle(2, 0x161b28);
    const astroVisorGleam = this.add.circle(1, -16, 2.5, 0xffffff, 0.9);
    // Brazalete de telemetria
    const astroWrist = this.add.rectangle(8, 14, 5, 4, 0x38bdf8);
    this.astronaut.add([astroPack, astroBody, astroHelmet, astroVisor, astroVisorGleam, astroWrist]);
    this.layer4.add([this.astroShadow, this.astronaut]);

    this.tweens.add({
      targets: this.astronaut,
      y: astroY - 3,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Rover ROVI con suspension Rocker-Bogie, Mastcam-Z y faros duales
    this.roviShadow = this.add.ellipse(roviBaseX + 18, roviBaseY + 18, 86, 22, 0x0a0201, 0.85);

    const wheelPositions = [-16, 0, 16];
    this.wheelShadows = [];
    wheelPositions.forEach((wx) => {
      const ws = this.add.ellipse(roviBaseX + wx + 2, roviBaseY + 18, 16, 6, 0x0e0301, 0.90);
      this.layer4.add(ws);
      this.wheelShadows.push({ obj: ws, relX: wx + 2 });
    });

    this.rovi = this.add.container(roviBaseX, roviBaseY);
    // Chasis con rocker-bogie de aleacion dorada
    const roviChassis = this.add.rectangle(0, 0, 46, 20, 0xfacc15).setStrokeStyle(3, 0x161b28);
    const roviBogieArm = this.add.line(0, 5, -16, 8, 16, 8, 0x475569).setLineWidth(3);
    const roviMast = this.add.rectangle(14, -16, 4, 20, 0x475569).setStrokeStyle(1.5, 0x161b28);
    // Cabezal Mastcam-Z con doble optica estereo
    const roviHead = this.add.rectangle(14, -26, 10, 8, 0x0284c7).setStrokeStyle(2, 0x161b28);
    const roviEyeL = this.add.circle(12, -26, 2, 0x38bdf8);
    const roviEyeR = this.add.circle(16, -26, 2, 0x38bdf8);

    // Unidad generadora RTG en la parte trasera
    const roviRtg = this.add.rectangle(-20, -6, 8, 10, 0x334155).setStrokeStyle(1.5, 0x161b28);

    this.roviWheels = [];
    wheelPositions.forEach((wx) => {
      const wTop = this.add.circle(wx, 11, 7, 0x1e293b).setStrokeStyle(2.5, 0x161b28);
      this.roviWheels.push(wTop);
    });

    const roviTagBadge = this.add.rectangle(0, -38, 48, 18, 0x1e2430).setStrokeStyle(2, 0x161b28);
    const roviTag = this.add.text(0, -38, "ROVI", {
      fontSize: "11px",
      fontStyle: "bold",
      color: "#F7E396",
      fontFamily: "'Space Mono', monospace"
    }).setOrigin(0.5);

    // Cono de luz volumetrico de los faros
    const headlightCone = this.add.triangle(48, 4, 0, 8, 65, -4, 65, 28, 0xfef08a, 0.32);
    this.rovi.add([roviChassis, roviBogieArm, roviRtg, roviMast, roviHead, roviEyeL, roviEyeR, ...this.roviWheels, roviTagBadge, roviTag, headlightCone]);
    this.layer4.add([this.roviShadow, this.rovi]);

    // Patrulla continua de ROVI sincronizada con sus sombras
    this.roviTween = this.tweens.add({
      targets: [this.rovi, this.roviShadow],
      x: "+=95",
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        if (this.wheelShadows && this.rovi) {
          this.wheelShadows.forEach((ws) => {
            ws.obj.x = this.rovi.x + ws.relX;
          });
        }
      }
    });

    // =========================================================================
    // PLANO 5: POLVO EN PRIMER PLANO (SALTACION), TORMENTA DINAMICA Y VIÑETA
    // =========================================================================
    // Particulas elipticas que barren el primer plano simulando el fenomeno fisico de la saltacion
    this.dustNear = [];
    for (let p = 0; p < 28; p++) {
      const px = Phaser.Math.Between(0, w);
      const py = Phaser.Math.Between(horizonY - 40, h + 20);
      const eW = Phaser.Math.FloatBetween(16, 28);
      const eH = Phaser.Math.FloatBetween(3.5, 6.5);
      const pAlpha = Phaser.Math.FloatBetween(0.18, 0.40);
      const pMesh = this.add.ellipse(px, py, eW, eH, 0xf97316, pAlpha);
      pMesh.speedX = Phaser.Math.FloatBetween(150, 270);
      pMesh.speedY = Phaser.Math.FloatBetween(-6, 7);
      this.weatherLayer.add(pMesh);
      this.dustNear.push(pMesh);
    }

    // Velo de tormenta y polvo dinamico que aumenta con GameState.sol
    this.dustHazeGfx = this.add.graphics();
    this.updateDustHaze(w, h, (typeof GameState !== "undefined" && GameState.sol) ? GameState.sol : 1);
    this.weatherLayer.add(this.dustHazeGfx);

    // Tinte ambiental de pantalla completa segun el estado solar de la mision
    this.ambientTintOverlay = this.add.rectangle(w / 2, h / 2, w, h, 0xb84b2e, 0.04);
    this.weatherLayer.add(this.ambientTintOverlay);

    // Viñeta cinematografica en los bordes para simular lente de camara de exploracion espacial
    const vignetteGfx = this.add.graphics();
    vignetteGfx.lineStyle(18, 0x07090e, 0.45);
    vignetteGfx.strokeRect(0, 0, w, h);
    vignetteGfx.lineStyle(8, 0x07090e, 0.65);
    vignetteGfx.strokeRect(0, 0, w, h);
    this.weatherLayer.add(vignetteGfx);
  }

  updateDustHaze(w, h, sol) {
    if (!this.dustHazeGfx) return;
    this.dustHazeGfx.clear();
    const currentSol = Math.max(1, Math.min(15, sol || 1));
    const solFactor = (currentSol - 1) / 14;

    const baseAlpha = 0.04 + (solFactor * 0.32);
    const stormCol = currentSol >= 12 ? 0x7c2d12 : 0x9a3412;
    this.dustHazeGfx.fillStyle(stormCol, baseAlpha);
    this.dustHazeGfx.fillRect(-60, 0, w + 120, h);
  }

  drawShieldShimmer(cx, cy, r) {
    this.shieldGfx.clear();
    if (typeof GameState === "undefined" || !GameState.shield || GameState.shield <= 0) return;

    const shieldAlpha = Math.min(0.65, Math.max(0.12, (GameState.shield / 100) * 0.65));
    this.shieldGfx.lineStyle(2.5, 0x38bdf8, shieldAlpha);
    this.shieldGfx.strokeCircle(cx, cy, r);

    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      const hx = cx + Math.cos(a) * r;
      const hy = cy + Math.sin(a) * r * 0.75;
      this.shieldGfx.strokeCircle(hx, hy, r * 0.28);
    }
  }

  onResize(newW, newH) {
    this.buildSceneGraphics(newW, newH);
  }

  update(time, delta) {
    const dt = delta / 1000;
    const w = this.scale.width;
    const h = this.scale.height;
    const sol = (typeof GameState !== "undefined" && GameState.sol) ? GameState.sol : 1;
    const solFactor = Phaser.Math.Clamp((sol - 1) / 14, 0, 1);
    const windMultiplier = 1.0 + (solFactor * 0.85);

    // 1. Suavizado e interpolacion de Parallax 3D
    this.currentParallaxX = Phaser.Math.Linear(this.currentParallaxX, this.targetParallaxX, 0.055);
    this.currentParallaxY = Phaser.Math.Linear(this.currentParallaxY, this.targetParallaxY, 0.055);

    this.layer0.x = this.currentParallaxX * 14;
    this.layer0.y = this.currentParallaxY * 8;

    this.layer1.x = this.currentParallaxX * 32;
    this.layer1.y = this.currentParallaxY * 16;

    this.layer2.x = this.currentParallaxX * 62;
    this.layer2.y = this.currentParallaxY * 26;

    this.layer3.x = this.currentParallaxX * 98;
    this.layer3.y = this.currentParallaxY * 36;

    this.layer4.x = this.currentParallaxX * 138;
    this.layer4.y = this.currentParallaxY * 48;

    // 2. Orbita lenta de Fobos y Deimos
    if (this.phobos) {
      this.phobos.x -= 2.2 * dt;
      if (this.phobos.x < -30) this.phobos.x = w + 30;
    }
    if (this.deimos) {
      this.deimos.x -= 0.8 * dt;
      if (this.deimos.x < -20) this.deimos.x = w + 20;
    }

    // 3. Desplazamiento y torsion procedural del remolino de polvo (Dust Devil)
    if (this.dustDevil) {
      this.dustDevil.x += this.dustDevil.vx * dt * windMultiplier;
      this.dustDevil.y = this.dustDevil.baseY + Math.sin(time * 0.004) * 3;
      if (this.dustDevil.x < -60) {
        this.dustDevil.x = w + 80;
      }
    }

    // 4. Sistema reactivo del Cohete MAV: vapor criogenico y destellos de energia/plasma
    if (typeof GameState !== "undefined") {
      const mavStage = GameState.mav || 0;

      // Vapor criogenico proporcional a GameState.mav
      if (this.vaporParticles) {
        const activeVapors = mavStage === 0 ? 3 : Math.min(this.vaporParticles.length, 5 + mavStage * 5);
        for (let i = 0; i < this.vaporParticles.length; i++) {
          const vp = this.vaporParticles[i];
          if (i < activeVapors) {
            vp.visible = true;
            vp.x += vp.vx * dt;
            vp.y += vp.vy * dt;
            vp.alpha -= (0.35 + (mavStage * 0.10)) * dt;
            if (vp.alpha <= 0) {
              vp.x = (w * 0.16) + 16;
              vp.y = (h * 0.60 + h * 0.08) - 80;
              vp.alpha = vp.baseAlpha;
            }
          } else {
            vp.visible = false;
          }
        }
      }

      // Micro-destellos y resplandor de ignicion en la tobera
      if (this.mavEngineGlow && this.mavEngineGlow2) {
        if (mavStage >= 3) {
          // Fase 3: Pre-ignicion (plasma activo pulsante)
          const pulse = Math.sin(time * 0.012);
          this.mavEngineGlow.alpha = 0.55 + 0.35 * pulse;
          this.mavEngineGlow.setFillStyle(0x38bdf8);
          this.mavEngineGlow2.alpha = 0.85 + 0.15 * pulse;

          if (this.plasmaSparks) {
            this.plasmaSparks.forEach((sp, idx) => {
              sp.alpha = Math.sin(time * 0.02 + idx) > 0.3 ? 0.9 : 0;
              sp.x = (w * 0.16) + Phaser.Math.FloatBetween(-9, 9);
              sp.y = (h * 0.60 + h * 0.08) - 4 + Phaser.Math.FloatBetween(2, 14);
            });
          }
        } else if (mavStage >= 2) {
          // Fase 2: Precalentamiento de motores
          this.mavEngineGlow.alpha = 0.28 + 0.18 * Math.sin(time * 0.006);
          this.mavEngineGlow.setFillStyle(0xf59e0b);
          this.mavEngineGlow2.alpha = 0.40;
          if (this.plasmaSparks) {
            this.plasmaSparks.forEach(sp => { sp.alpha = 0; });
          }
        } else if (mavStage >= 1) {
          // Fase 1: Presurizacion basica
          this.mavEngineGlow.alpha = 0.12;
          this.mavEngineGlow.setFillStyle(0x38bdf8);
          this.mavEngineGlow2.alpha = 0;
          if (this.plasmaSparks) {
            this.plasmaSparks.forEach(sp => { sp.alpha = 0; });
          }
        } else {
          // Fase 0: Frio
          this.mavEngineGlow.alpha = 0;
          this.mavEngineGlow2.alpha = 0;
          if (this.plasmaSparks) {
            this.plasmaSparks.forEach(sp => { sp.alpha = 0; });
          }
        }
      }

      // Luces de fase del MAV
      if (this.mavStageLights) {
        for (let i = 0; i < 3; i++) {
          if (mavStage > i) {
            this.mavStageLights[i].setFillStyle(0x22c55e);
          } else {
            this.mavStageLights[i].setFillStyle(0x475569);
          }
        }
      }
    }

    // 5. Parallax de particulas de polvo en 3 capas de profundidad:
    // Capa Lejana:
    if (this.dustFar) {
      this.dustFar.forEach((p) => {
        p.x -= p.speedX * windMultiplier * dt;
        p.y += p.speedY * dt;
        if (p.x < -30) {
          p.x = w + 30;
          p.y = Phaser.Math.Between(h * 0.60 - 130, h * 0.60 + 70);
        }
      });
    }

    // Capa Media:
    if (this.dustMid) {
      this.dustMid.forEach((p) => {
        p.x -= p.speedX * windMultiplier * dt;
        p.y += p.speedY * dt;
        if (p.x < -30) {
          p.x = w + 30;
          p.y = Phaser.Math.Between(h * 0.60, h);
        }
      });
    }

    // Capa Cercana (Primer plano con saltacion):
    if (this.dustNear) {
      this.dustNear.forEach((p) => {
        p.x -= p.speedX * windMultiplier * dt;
        p.y += p.speedY * dt;
        if (p.x < -40) {
          p.x = w + 40;
          p.y = Phaser.Math.Between(h * 0.60 - 40, h + 20);
        }
      });
    }

    // 6. Velo de tormenta y tinte ambiental segun Sol y clima espacial
    if (typeof GameState !== "undefined") {
      this.updateDustHaze(w, h, GameState.sol);

      if (this.ambientTintOverlay) {
        if (GameState.sol >= 12) {
          // Soles 12 a 15: Megatormenta de polvo densa pre-despegue
          this.ambientTintOverlay.setFillStyle(0x7c2d12, 0.32);
        } else if ([4, 10].includes(GameState.sol)) {
          // Soles DONKI: radiacion solar / fulguracion violeta espacial
          this.ambientTintOverlay.setFillStyle(0x7c3aed, 0.16);
        } else {
          // Sol normal: calido tenue
          this.ambientTintOverlay.setFillStyle(0xb84b2e, 0.04);
        }
      }

      // Parpadeo de emergencia en luz interior si la energia es critica (< 25%)
      if (this.habInteriorLight) {
        if (GameState.energy < 25) {
          this.habInteriorLight.alpha = Math.sin(time * 0.009) > 0 ? 0.50 : 0.08;
        }
      }
    }
  }
}
