// js/mainScene.js — Escenario Principal 2.5D / Pseudo-3D Inmersivo en Phaser 3.60
// Reto NASA Space Apps Challenge: Build a Junior Astronaut Mission Trainer

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Coordenadas de Parallax
    this.targetParallaxX = 0;
    this.targetParallaxY = 0;
    this.currentParallaxX = 0;
    this.currentParallaxY = 0;

    // Contenedores para los 5 planos de profundidad Parallax 3D
    this.layer0 = this.add.container(0, 0); // Plano 0: Cielo profundo, Sol y Lunas
    this.layer1 = this.add.container(0, 0); // Plano 1: Cordillera lejana con niebla
    this.layer2 = this.add.container(0, 0); // Plano 2: Cohete MAV y torre de servicio
    this.layer3 = this.add.container(0, 0); // Plano 3: Cúpula Outpost Beta y Biodomo
    this.layer4 = this.add.container(0, 0); // Plano 4: Suelo con perspectiva, sombras y ROVI
    this.weatherLayer = this.add.container(0, 0); // Clima, partículas y tinte atmosférico

    this.buildSceneGraphics(w, h);

    // Entrada de ratón para parallax suave
    this.input.on("pointermove", (pointer) => {
      this.targetParallaxX = (pointer.x / this.scale.width) - 0.5;
      this.targetParallaxY = (pointer.y / this.scale.height) - 0.5;
    });

    // Redimensionamiento dinámico automático
    this.scale.on("resize", (gameSize) => {
      this.onResize(gameSize.width, gameSize.height);
    });
  }

  buildSceneGraphics(w, h) {
    // Limpiar capas previas si es un resize
    this.layer0.removeAll(true);
    this.layer1.removeAll(true);
    this.layer2.removeAll(true);
    this.layer3.removeAll(true);
    this.layer4.removeAll(true);
    this.weatherLayer.removeAll(true);

    const horizonY = h * 0.62;

    // =========================================================================
    // PLANO 0: CIELO PROFUNDO, ESTRELLAS, SOL Y LUNAS (FOBOS Y DEIMOS)
    // =========================================================================
    // Gradiente atmosférico marciano (cielo cósmico violeta oscuro -> terracota horizonte)
    const skyGfx = this.add.graphics();
    const skySteps = 24;
    for (let i = 0; i <= skySteps; i++) {
      const t = i / skySteps;
      const y0 = (horizonY * i) / skySteps;
      const y1 = (horizonY * (i + 1)) / skySteps;
      // Interpolación de color entre 0x0c0714 (zenith cósmico) y 0xb84b2e (horizonte marciano)
      const r = Math.round(12 + t * (184 - 12));
      const g = Math.round(7 + t * (75 - 7));
      const b = Math.round(20 + t * (46 - 20));
      const col = (r << 16) | (g << 8) | b;
      skyGfx.fillStyle(col, 1);
      skyGfx.fillRect(-60, y0 - 10, w + 120, y1 - y0 + 12);
    }
    this.layer0.add(skyGfx);

    // Estrellas titilantes en el cielo superior
    this.stars = [];
    for (let i = 0; i < 65; i++) {
      const sx = Phaser.Math.Between(-30, w + 30);
      const sy = Phaser.Math.Between(0, horizonY * 0.7);
      const radius = Phaser.Math.FloatBetween(0.8, 2.2);
      const star = this.add.circle(sx, sy, radius, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.95));
      this.layer0.add(star);
      this.stars.push(star);

      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.15, 0.4),
        duration: Phaser.Math.Between(1400, 3200),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    // Sol marciano distante (recibe solo el 43% de radiación comparado con la Tierra)
    const sunX = w * 0.22;
    const sunY = horizonY * 0.28;
    const sunCorona3 = this.add.circle(sunX, sunY, 68, 0xfde047, 0.08);
    const sunCorona2 = this.add.circle(sunX, sunY, 46, 0xfde047, 0.18);
    const sunCorona1 = this.add.circle(sunX, sunY, 28, 0xfffbeb, 0.45);
    const sunCore = this.add.circle(sunX, sunY, 16, 0xffffff, 0.95);
    this.layer0.add([sunCorona3, sunCorona2, sunCorona1, sunCore]);

    // Lunas marcianas en órbita lenta
    // Fobos: más cercana y rápida
    this.phobos = this.add.circle(w * 0.65, horizonY * 0.22, 9, 0xd1d5db, 0.85);
    const phobosCrater1 = this.add.circle(w * 0.65 - 2, horizonY * 0.22 - 2, 2.2, 0x6b7280, 0.8);
    const phobosCrater2 = this.add.circle(w * 0.65 + 3, horizonY * 0.22 + 2, 1.6, 0x6b7280, 0.8);
    this.layer0.add([this.phobos, phobosCrater1, phobosCrater2]);

    // Deimos: más lejana y pequeña
    this.deimos = this.add.circle(w * 0.84, horizonY * 0.38, 4.5, 0x9ca3af, 0.7);
    this.layer0.add(this.deimos);

    // =========================================================================
    // PLANO 1: HORIZONTE LEJANO Y CORDILLERAS CON NIEBLA ATMOSFÉRICA
    // =========================================================================
    const ridgeGfx = this.add.graphics();
    // Capa de montaña 1 (más distante, difusa con niebla)
    ridgeGfx.fillStyle(0x712b1d, 0.85);
    ridgeGfx.beginPath();
    ridgeGfx.moveTo(-60, horizonY);
    const pts1 = [
      0.0, 0.15, 0.28, 0.42, 0.58, 0.72, 0.85, 1.0, 1.1
    ];
    pts1.forEach((px, idx) => {
      const rx = -60 + (w + 120) * px;
      const ry = horizonY - (idx % 2 === 1 ? 55 : 22) - (idx % 3 === 0 ? 25 : 0);
      ridgeGfx.lineTo(rx, ry);
    });
    ridgeGfx.lineTo(w + 60, horizonY + 20);
    ridgeGfx.lineTo(-60, horizonY + 20);
    ridgeGfx.closePath();
    ridgeGfx.fillPath();

    // Capa de montaña 2 (media distancia, crestas basálticas)
    ridgeGfx.fillStyle(0x943722, 0.95);
    ridgeGfx.beginPath();
    ridgeGfx.moveTo(-60, horizonY + 15);
    const pts2 = [0.0, 0.12, 0.25, 0.38, 0.52, 0.68, 0.82, 0.94, 1.1];
    pts2.forEach((px, idx) => {
      const rx = -60 + (w + 120) * px;
      const ry = horizonY - (idx % 2 === 0 ? 38 : 12) - ((idx * 7) % 18);
      ridgeGfx.lineTo(rx, ry);
    });
    ridgeGfx.lineTo(w + 60, horizonY + 30);
    ridgeGfx.lineTo(-60, horizonY + 30);
    ridgeGfx.closePath();
    ridgeGfx.fillPath();
    this.layer1.add(ridgeGfx);

    // Velo de niebla atmosférica marciana sobre el horizonte
    const fogGfx = this.add.graphics();
    fogGfx.fillStyle(0xc85532, 0.22);
    fogGfx.fillRect(-60, horizonY - 45, w + 120, 75);
    this.layer1.add(fogGfx);

    // =========================================================================
    // PLANO 2: COHETE MAV (VOLUMEN CILÍNDRICO, TORRE Y VAPOR CRIOGÉNICO)
    // =========================================================================
    const mavBaseX = w * 0.16;
    const mavBaseY = horizonY + h * 0.08;

    // Torre de servicio y pasarela de lanzamiento
    const gantryGfx = this.add.graphics();
    gantryGfx.lineStyle(2, 0x475569, 0.8);
    // Mástil vertical de celosía
    gantryGfx.strokeRect(mavBaseX - 34, mavBaseY - 145, 14, 145);
    for (let gy = mavBaseY - 145; gy < mavBaseY; gy += 18) {
      gantryGfx.lineBetween(mavBaseX - 34, gy, mavBaseX - 20, gy + 18);
      gantryGfx.lineBetween(mavBaseX - 34, gy + 18, mavBaseX - 20, gy);
    }
    // Pasarela de umbilical criogénico conectada al cohete
    gantryGfx.strokeRect(mavBaseX - 20, mavBaseY - 80, 24, 6);
    this.layer2.add(gantryGfx);

    // Fuselaje con volumen cilíndrico sombreado
    const rocketH = 125;
    const rocketW = 34;

    // Cuerpo base (sombra derecha)
    const mavCoreShadow = this.add.rectangle(mavBaseX + 6, mavBaseY - rocketH / 2, rocketW / 2 + 2, rocketH, 0x94a3b8);
    // Cuerpo base (luz izquierda con brillo cilíndrico)
    const mavCoreLight = this.add.rectangle(mavBaseX - 7, mavBaseY - rocketH / 2, rocketW / 2 + 2, rocketH, 0xf8fafc);
    const mavOutline = this.add.rectangle(mavBaseX, mavBaseY - rocketH / 2, rocketW, rocketH).setStrokeStyle(1.5, 0x0f172a, 0);

    // Ojiva cónica aerodinámica (Heatshield rojo NASA)
    const coneGfx = this.add.graphics();
    coneGfx.fillStyle(0xf43f5e, 1);
    coneGfx.fillTriangle(mavBaseX, mavBaseY - rocketH - 42, mavBaseX - rocketW / 2, mavBaseY - rocketH, mavBaseX + rocketW / 2, mavBaseY - rocketH);
    // Brillo en la ojiva
    coneGfx.fillStyle(0xfecdd3, 0.45);
    coneGfx.fillTriangle(mavBaseX, mavBaseY - rocketH - 42, mavBaseX - rocketW / 2, mavBaseY - rocketH, mavBaseX - 2, mavBaseY - rocketH);

    // Aletas estabilizadoras con bisel
    const finsGfx = this.add.graphics();
    finsGfx.fillStyle(0x334155, 1);
    finsGfx.fillTriangle(mavBaseX - rocketW / 2, mavBaseY - 45, mavBaseX - rocketW / 2 - 16, mavBaseY, mavBaseX - rocketW / 2, mavBaseY);
    finsGfx.fillTriangle(mavBaseX + rocketW / 2, mavBaseY - 45, mavBaseX + rocketW / 2 + 16, mavBaseY, mavBaseX + rocketW / 2, mavBaseY);

    // Rótulo técnico
    const mavLabel = this.add.text(mavBaseX, mavBaseY + 12, "COHETE MAV", {
      fontSize: "11px",
      fontStyle: "bold",
      color: "#f7e396",
      fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    // Indicadores luminosos de las 3 etapas del MAV
    this.mavStageLights = [
      this.add.circle(mavBaseX, mavBaseY - 95, 3.5, 0x475569),
      this.add.circle(mavBaseX, mavBaseY - 65, 3.5, 0x475569),
      this.add.circle(mavBaseX, mavBaseY - 35, 3.5, 0x475569)
    ];

    this.layer2.add([mavCoreShadow, mavCoreLight, mavOutline, coneGfx, finsGfx, mavLabel, ...this.mavStageLights]);

    // Chorros de vapor criogénico animados (LOX / Metano líquido)
    this.vaporParticles = [];
    for (let v = 0; v < 14; v++) {
      const vp = this.add.circle(mavBaseX + 16, mavBaseY - 78, Phaser.Math.FloatBetween(2, 6), 0xe0f2fe, 0.7);
      vp.vx = Phaser.Math.FloatBetween(12, 35);
      vp.vy = Phaser.Math.FloatBetween(-6, 4);
      vp.baseAlpha = Phaser.Math.FloatBetween(0.3, 0.7);
      this.layer2.add(vp);
      this.vaporParticles.push(vp);
    }

    // =========================================================================
    // PLANO 3: HÁBITAT OUTPOST BETA, BIODOMO OSDR Y PARQUE SOLAR
    // =========================================================================
    const habCenterX = w * 0.48;
    const habCenterY = horizonY + h * 0.16;

    // 1. Hábitat geodésico presurizado
    const habRadius = Math.min(w * 0.14, 130);
    const domeGfx = this.add.graphics();

    // Fondo y relleno interior cálido de la cúpula
    domeGfx.fillStyle(0x0f172a, 1);
    domeGfx.fillCircle(habCenterX, habCenterY, habRadius);

    // Cubierta esférica con volumen e iluminación 3D
    domeGfx.fillStyle(0xf1f5f9, 0.96);
    domeGfx.fillCircle(habCenterX, habCenterY, habRadius);

    // Sombra de volumen esférico inferior/derecha
    domeGfx.fillStyle(0x94a3b8, 0.35);
    domeGfx.fillCircle(habCenterX + habRadius * 0.22, habCenterY + habRadius * 0.18, habRadius * 0.9);

    // Brillo especular superior curvo (sensación de cristal/material aeroespacial)
    domeGfx.fillStyle(0xffffff, 0.55);
    domeGfx.fillEllipse(habCenterX - habRadius * 0.32, habCenterY - habRadius * 0.38, habRadius * 0.65, habRadius * 0.28);

    // Costillas estructurales geodésicas (arcos 3D)
    domeGfx.lineStyle(3, 0x0284c7, 0.75);
    domeGfx.strokeCircle(habCenterX, habCenterY, habRadius);
    domeGfx.strokeEllipse(habCenterX, habCenterY, habRadius * 1.5, habRadius * 2);
    domeGfx.strokeEllipse(habCenterX, habCenterY, habRadius * 2, habRadius * 0.85);

    // Anillo tecnológico base de soporte vital
    const ringBase = this.add.rectangle(habCenterX, habCenterY + habRadius * 0.88, habRadius * 2.1, 14, 0x1e293b)
      .setStrokeStyle(2, 0x38bdf8);

    // Ventanas de observación iluminadas (reaccionan a GameState.energy)
    this.habInteriorLight = this.add.circle(habCenterX, habCenterY - 10, habRadius * 0.42, 0xfef08a, 0.55);
    this.tweens.add({
      targets: this.habInteriorLight,
      alpha: 0.35,
      duration: 1800,
      yoyo: true,
      repeat: -1
    });

    const habLabel = this.add.text(habCenterX, habCenterY - habRadius - 16, "OUTPOST BETA", {
      fontSize: "12px",
      fontStyle: "bold",
      color: "#38bdf8",
      fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    // Escudo magnético deflector DONKI (hexagonal/shimmer)
    this.shieldGfx = this.add.graphics();
    this.drawShieldShimmer(habCenterX, habCenterY, habRadius * 1.25);

    this.layer3.add([domeGfx, this.habInteriorLight, ringBase, habLabel, this.shieldGfx]);

    // 2. Biodomo Invernadero OSDR (Cúpula translúcida con luz de crecimiento rosa)
    const bioX = habCenterX + habRadius * 1.35;
    const bioY = habCenterY + habRadius * 0.25;
    const bioRadius = habRadius * 0.48;

    const bioGfx = this.add.graphics();
    bioGfx.fillStyle(0x4ade80, 0.4);
    bioGfx.fillCircle(bioX, bioY, bioRadius);
    bioGfx.lineStyle(2, 0x22c55e, 0.8);
    bioGfx.strokeCircle(bioX, bioY, bioRadius);

    // Iluminación LED hortícola OSDR rosada
    const bioLed = this.add.circle(bioX, bioY, bioRadius * 0.65, 0xf43f5e, 0.45);
    const bioLabel = this.add.text(bioX, bioY - bioRadius - 12, "BIODOMO OSDR", {
      fontSize: "10px",
      fontStyle: "bold",
      color: "#4ade80",
      fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.layer3.add([bioGfx, bioLed, bioLabel]);

    // 3. Parque de Paneles Solares Fotovoltaicos
    const solarGfx = this.add.graphics();
    const solarBaseX = w * 0.84;
    const solarBaseY = horizonY + h * 0.12;

    for (let p = 0; p < 3; p++) {
      const px = solarBaseX + p * 38;
      const py = solarBaseY + p * 12;
      // Mástil
      solarGfx.lineStyle(3, 0x64748b, 1);
      solarGfx.lineBetween(px, py, px, py + 36);
      // Panel inclinado
      solarGfx.fillStyle(0x172554, 1);
      solarGfx.fillPoints([
        { x: px - 28, y: py - 12 },
        { x: px + 18, y: py - 20 },
        { x: px + 28, y: py + 8 },
        { x: px - 18, y: py + 16 }
      ], true);
      solarGfx.lineStyle(1.5, 0x60a5fa, 0.9);
      solarGfx.strokePoints([
        { x: px - 28, y: py - 12 },
        { x: px + 18, y: py - 20 },
        { x: px + 28, y: py + 8 },
        { x: px - 18, y: py + 16 }
      ], true);
    }
    this.layer3.add(solarGfx);

    // =========================================================================
    // PLANO 4: SUELO CON PERSPECTIVA, SOMBRAS DE CONTACTO Y PERSONAJES
    // =========================================================================
    // Superficie marciana con textura y gradiente de profundidad
    const groundGfx = this.add.graphics();
    const groundH = h - horizonY;
    const groundSteps = 16;
    for (let g = 0; g < groundSteps; g++) {
      const gt = g / groundSteps;
      const gy0 = horizonY + (groundH * g) / groundSteps;
      const gy1 = horizonY + (groundH * (g + 1)) / groundSteps;
      // Gradiente de color de regolito: 0xa8432b (horizonte) -> 0xd95328 (primer plano vibrante)
      const gr = Math.round(168 + gt * (217 - 168));
      const gg = Math.round(67 + gt * (83 - 67));
      const gb = Math.round(43 + gt * (40 - 43));
      const gCol = (gr << 16) | (gg << 8) | gb;
      groundGfx.fillStyle(gCol, 1);
      groundGfx.fillRect(-60, gy0, w + 120, gy1 - gy0 + 2);
    }

    // Rocas y cráteres con volumen y sombra
    for (let r = 0; r < 20; r++) {
      const rx = Phaser.Math.Between(0, w);
      const ry = Phaser.Math.Between(horizonY + 30, h - 20);
      const rScale = Phaser.Math.FloatBetween(2, 8);
      // Sombra oscura bajo la roca
      groundGfx.fillStyle(0x521b10, 0.6);
      groundGfx.fillEllipse(rx + 2, ry + rScale * 0.4, rScale * 2.2, rScale * 0.8);
      // Roca iluminada
      groundGfx.fillStyle(0x8a3822, 1);
      groundGfx.fillCircle(rx, ry, rScale);
    }
    this.layer4.add(groundGfx);

    // SOMBRAS DE CONTACTO ELÍPTICAS OSCURAS (CLAVE PARA EL ACABADO 3D/2.5D)
    const shadowGfx = this.add.graphics();
    shadowGfx.fillStyle(0x3a1007, 0.72);

    // Sombra del Cohete MAV
    shadowGfx.fillEllipse(mavBaseX + 6, mavBaseY + 6, 75, 22);

    // Sombra del Hábitat Outpost Beta
    shadowGfx.fillEllipse(habCenterX, habCenterY + habRadius * 0.88, habRadius * 2.3, 38);

    // Sombra del Biodomo
    shadowGfx.fillEllipse(bioX, bioY + bioRadius * 0.9, bioRadius * 2.2, 22);
    this.layer4.add(shadowGfx);

    // Astronauta en Primer Plano
    const astroX = habCenterX - habRadius * 0.45;
    const astroY = habCenterY + habRadius * 0.72;

    this.astroShadow = this.add.ellipse(astroX, astroY + 28, 36, 12, 0x3a1007, 0.68);
    this.astronaut = this.add.container(astroX, astroY);

    // Traje espacial presurizado blanco NASA
    const astroBody = this.add.rectangle(0, 8, 20, 28, 0xf1f5f9, 1).setStrokeStyle(1.5, 0x334155);
    const astroPack = this.add.rectangle(-12, 6, 10, 24, 0x475569);
    const astroHelmet = this.add.circle(0, -14, 13, 0xf8fafc).setStrokeStyle(2, 0x38bdf8);
    // Visor dorado reflectante
    const astroVisor = this.add.ellipse(3, -14, 14, 10, 0xfacc15, 0.95);
    const astroVisorGleam = this.add.circle(1, -16, 2.5, 0xffffff, 0.9);

    this.astronaut.add([astroPack, astroBody, astroHelmet, astroVisor, astroVisorGleam]);
    this.layer4.add([this.astroShadow, this.astronaut]);

    // Animación suave de respiración e idle del astronauta
    this.tweens.add({
      targets: this.astronaut,
      y: astroY - 3,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Rover ROVI patrullando con 6 ruedas y faros de navegación
    const roviBaseX = habCenterX + habRadius * 0.25;
    const roviBaseY = habCenterY + habRadius * 0.78;

    this.roviShadow = this.add.ellipse(roviBaseX, roviBaseY + 16, 68, 18, 0x3a1007, 0.68);
    this.rovi = this.add.container(roviBaseX, roviBaseY);

    // Chasis dorado / amarillo de alta visibilidad
    const roviChassis = this.add.rectangle(0, 0, 44, 20, 0xfacc15).setStrokeStyle(2, 0x0f172a);
    const roviMast = this.add.rectangle(12, -16, 4, 18, 0x475569);
    const roviHead = this.add.circle(12, -26, 6, 0x0284c7);
    const roviEye = this.add.circle(14, -26, 2.5, 0x38bdf8);

    // 6 Ruedas independientes
    const wheelPositions = [-16, 0, 16];
    this.roviWheels = [];
    wheelPositions.forEach((wx) => {
      const wTop = this.add.circle(wx, 11, 6.5, 0x1e293b).setStrokeStyle(1.5, 0x64748b);
      this.roviWheels.push(wTop);
    });

    const roviTag = this.add.text(0, -38, "ROVI", {
      fontSize: "11px",
      fontStyle: "bold",
      color: "#F7E396",
      fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    // Haz de luz de faros
    const headlightCone = this.add.triangle(45, 4, 0, 8, 55, 0, 55, 24, 0xfef08a, 0.25);

    this.rovi.add([roviChassis, roviMast, roviHead, roviEye, ...this.roviWheels, roviTag, headlightCone]);
    this.layer4.add([this.roviShadow, this.rovi]);

    // Movimiento continuo de patrulla de ROVI
    this.roviTween = this.tweens.add({
      targets: [this.rovi, this.roviShadow],
      x: "+=95",
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // =========================================================================
    // PLANO 5: CLIMA DINÁMICO, PARTÍCULAS ATMOSFÉRICAS Y TINTE DE TORMENTA
    // =========================================================================
    this.dustParticles = [];
    for (let p = 0; p < 45; p++) {
      const pDepth = Phaser.Math.Between(1, 3); // 1: lejos (pequeño), 3: cerca (grande y rápido)
      const px = Phaser.Math.Between(0, w);
      const py = Phaser.Math.Between(0, h);
      const pSize = pDepth === 3 ? Phaser.Math.FloatBetween(3.5, 6) : Phaser.Math.FloatBetween(1, 2.5);
      const pAlpha = pDepth === 3 ? 0.35 : 0.65;
      const pCol = pDepth === 3 ? 0xea580c : 0xfde047;

      const pMesh = this.add.circle(px, py, pSize, pCol, pAlpha);
      pMesh.speedX = pDepth === 3 ? Phaser.Math.FloatBetween(75, 140) : Phaser.Math.FloatBetween(25, 60);
      pMesh.speedY = Phaser.Math.FloatBetween(-5, 8);
      this.weatherLayer.add(pMesh);
      this.dustParticles.push(pMesh);
    }

    // Tinte ambiental de pantalla completa según el estado de la misión
    this.ambientTintOverlay = this.add.rectangle(w / 2, h / 2, w, h, 0xb84b2e, 0.04);
    this.weatherLayer.add(this.ambientTintOverlay);
  }

  drawShieldShimmer(cx, cy, r) {
    this.shieldGfx.clear();
    if (typeof GameState === "undefined" || GameState.shield <= 0) return;

    const shieldAlpha = Math.min(0.65, Math.max(0.12, (GameState.shield / 100) * 0.65));
    this.shieldGfx.lineStyle(2.5, 0x38bdf8, shieldAlpha);
    this.shieldGfx.strokeCircle(cx, cy, r);

    // Malla de arcos hexagonales
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

    // 1. Suavizado e interpolación de Parallax 3D
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

    // 2. Órbita lenta de Fobos y Deimos
    if (this.phobos) {
      this.phobos.x -= 2.2 * dt;
      if (this.phobos.x < -20) this.phobos.x = w + 20;
    }
    if (this.deimos) {
      this.deimos.x -= 0.8 * dt;
      if (this.deimos.x < -20) this.deimos.x = w + 20;
    }

    // 3. Vapor criogénico del cohete MAV proporcional a GameState.mav
    if (this.vaporParticles && typeof GameState !== "undefined") {
      const activeVapors = Math.max(2, GameState.mav * 4);
      for (let i = 0; i < this.vaporParticles.length; i++) {
        const vp = this.vaporParticles[i];
        if (i < activeVapors) {
          vp.visible = true;
          vp.x += vp.vx * dt;
          vp.y += vp.vy * dt;
          vp.alpha -= 0.4 * dt;
          if (vp.alpha <= 0) {
            vp.x = w * 0.16 + 16;
            vp.y = (h * 0.62 + h * 0.08) - 78;
            vp.alpha = vp.baseAlpha;
          }
        } else {
          vp.visible = false;
        }
      }
    }

    // 4. Luces de fases del MAV
    if (typeof GameState !== "undefined" && this.mavStageLights) {
      for (let i = 0; i < 3; i++) {
        if (GameState.mav > i) {
          this.mavStageLights[i].setFillStyle(0x22c55e); // Verde listo
        } else {
          this.mavStageLights[i].setFillStyle(0x475569); // Inactivo
        }
      }
    }

    // 5. Partículas de polvo atmosférico en suspensión movidas por el viento
    if (this.dustParticles) {
      this.dustParticles.forEach((p) => {
        p.x -= p.speedX * dt;
        p.y += p.speedY * dt;
        if (p.x < -20) {
          p.x = w + 20;
          p.y = Phaser.Math.Between(0, h);
        }
      });
    }

    // 6. Iluminación y tinte ambiental dinámico según el Sol de la misión
    if (typeof GameState !== "undefined" && this.ambientTintOverlay) {
      if (GameState.sol >= 12) {
        // Soles 12 a 15: Tormenta de polvo densa pre-despegue
        this.ambientTintOverlay.setFillStyle(0x7c2d12, 0.28);
      } else if ([4, 10].includes(GameState.sol)) {
        // Soles de radiación DONKI: fulguración violeta/solar
        this.ambientTintOverlay.setFillStyle(0x7c3aed, 0.14);
      } else {
        // Sol normal: cálido tenue
        this.ambientTintOverlay.setFillStyle(0xb84b2e, 0.04);
      }

      // Parpadeo de luz interior si la energía es baja (< 25%)
      if (this.habInteriorLight) {
        if (GameState.energy < 25) {
          this.habInteriorLight.alpha = Math.sin(time * 0.008) > 0 ? 0.45 : 0.08;
        }
      }
    }
  }
}
