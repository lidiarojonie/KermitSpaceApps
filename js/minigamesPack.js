// js/minigamesPack.js — Pack con los 10 minijuegos de supervivencia para el Junior Astronaut Trainer
// 1. MinigameDrill (Extracción de Hielo)
// 2. MinigameSolar (Mantenimiento y Conexión Solar)
// 3. MinigameBiodome (Cultivo Hidropónico OSDR)
// 4. MinigameShield (Deflector de Tormenta Solar DONKI)
// 5. MinigameWaterFilter (Purificación de Agua y Percloratos)
// 6. MinigameLeakRepair (Reparación de Fugas de Oxígeno)
// 7. MinigameCircuit (Red de Energía y Relés)
// 8. MinigameRoverDrive (Conducción del Rover ROVI)
// 9. MinigameSpectro (Espectrometría Láser de Muestras PIXL)
// 10. MinigameDustDefense (Defensa ante Megatormenta Marciana)

// Utilidades visuales compartidas para consolas amigables y táctiles para niños
function createTechConsole(scene, cx, cy, w, h, accentColor, title, subtitle) {
  // Capa de fondo oscurecida para enfocar la diversión en el minijuego
  scene.add.rectangle(cx, cy, scene.scale.width * 2, scene.scale.height * 2, 0x070b14, 0.88);

  // Sombra suave para dar relieve 3D
  scene.add.rectangle(cx + 6, cy + 6, w, h, 0x000000, 0.6);

  // Marco principal con bordes redondeados y color alegre
  const frame = scene.add.rectangle(cx, cy, w, h, 0x111a2c).setStrokeStyle(3, accentColor, 0.9);

  // Pantalla interior
  scene.add.rectangle(cx, cy + 24, w - 24, h - 72, 0x182438, 0.75).setStrokeStyle(1.5, accentColor, 0.3);

  // Detalles en las cuatro esquinas
  const corners = [
    [-w / 2 + 16, -h / 2 + 16],
    [w / 2 - 16, -h / 2 + 16],
    [-w / 2 + 16, h / 2 - 16],
    [w / 2 - 16, h / 2 - 16]
  ];
  corners.forEach(([ox, oy]) => {
    scene.add.circle(cx + ox, cy + oy, 4, accentColor, 0.9);
  });

  // Título y subtítulo con tipografía infantil amigable
  scene.add.text(cx, cy - h / 2 + 28, title, {
    fontSize: '22px', fontStyle: 'bold', color: '#ffd000', fontFamily: "'Fredoka', 'Nunito', sans-serif"
  }).setOrigin(0.5);

  if (subtitle) {
    scene.add.text(cx, cy - h / 2 + 54, subtitle, {
      fontSize: '14px', color: '#cbd5e1', fontFamily: "'Fredoka', 'Nunito', sans-serif"
    }).setOrigin(0.5);
  }

  return frame;
}

function spawnBurst(scene, x, y, color, count, speed) {
  const n = count || 8;
  const sp = speed || 80;
  for (let i = 0; i < n; i++) {
    const p = scene.add.circle(x, y, Phaser.Math.Between(3, 5), color, 1);
    const angle = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.4;
    const dist = Phaser.Math.Between(sp * 0.5, sp);
    scene.tweens.add({
      targets: p,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0,
      scale: 0.2,
      duration: Phaser.Math.Between(300, 500),
      ease: 'Cubic.easeOut',
      onComplete: () => p.destroy()
    });
  }
}

// ============================================================================
// 1. MINIJUEGO: ARCADIA ICE DRILL (Extracción de Hielo Subterráneo)
// ============================================================================
class MinigameDrill extends Phaser.Scene {
  constructor() {
    super({ key: 'MinigameDrill' });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const w = 860;
    const h = 480;

    createTechConsole(this, cx, cy, w, h, 0x38bdf8,
      'PERFORACIÓN GLACIAR: ¡BUSCANDO AGUA!',
      'Mueve la broca con el RATÓN o FLECHAS para atrapar 6 CRISTALES AZULES y esquivar las rocas'
    );

    this.iceCollected = 0;
    this.hits = 0;
    this.targetIce = 6;
    this.maxHits = 3;
    this.ended = false;
    this.timeLeft = 14;

    this.scoreText = this.add.text(cx - 390, cy - 150, 'Hielo recogido: 0 / 6', {
      fontSize: '18px', fontStyle: 'bold', color: '#38bdf8', fontFamily: "'Fredoka', sans-serif"
    });

    this.livesText = this.add.text(cx - 390, cy - 122, 'Vidas de la broca: 3 / 3', {
      fontSize: '16px', color: '#ffd000', fontFamily: "'Fredoka', sans-serif"
    });

    this.timerText = this.add.text(cx + 250, cy - 150, 'Tiempo: 14s', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffffff', fontFamily: "'Fredoka', sans-serif"
    });

    // Broca perforadora del jugador
    this.drill = this.add.triangle(cx, cy - 90, 0, 0, 42, 0, 21, 46, 0xffd000)
      .setStrokeStyle(2.5, 0x0f172a);
    this.drillCore = this.add.circle(cx, cy - 98, 9, 0x38bdf8);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.items = [];

    // Spawner de hielo y rocas
    this.spawner = this.time.addEvent({
      delay: 580,
      loop: true,
      callback: () => {
        if (this.ended) return;
        const x = Phaser.Math.Between(cx - 340, cx + 340);
        const isIce = Math.random() > 0.40;
        let item;
        if (isIce) {
          item = this.add.rectangle(x, cy + 220, 32, 32, 0x38bdf8)
            .setStrokeStyle(2, 0xffffff);
        } else {
          item = this.add.polygon(x, cy + 220, [0, 15, 12, 0, 28, 6, 32, 26, 16, 34, 4, 28], 0xd96b43)
            .setStrokeStyle(2, 0x7c2d12);
        }
        item.isIce = isIce;
        this.items.push(item);
      }
    });

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 13,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.timerText.setText(`Tiempo: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      }
    });
  }

  update(time, delta) {
    if (this.ended) return;
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    if (this.input.activePointer.x > cx - 380 && this.input.activePointer.x < cx + 380) {
      this.drill.x = Phaser.Math.Linear(this.drill.x, this.input.activePointer.x, 0.22);
    }
    if (this.cursors.left.isDown) this.drill.x -= 0.42 * delta;
    if (this.cursors.right.isDown) this.drill.x += 0.42 * delta;
    this.drill.x = Phaser.Math.Clamp(this.drill.x, cx - 350, cx + 350);
    this.drillCore.x = this.drill.x;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const obj = this.items[i];
      obj.y -= 0.24 * delta;

      if (Phaser.Math.Distance.Between(this.drill.x, this.drill.y, obj.x, obj.y) < 38) {
        if (obj.isIce) {
          this.iceCollected++;
          spawnBurst(this, obj.x, obj.y, 0x38bdf8, 12, 80);
          if (typeof SoundFx !== 'undefined') SoundFx.playResourceGain();
          this.scoreText.setText(`Hielo recogido: ${this.iceCollected} / ${this.targetIce}`);
          if (this.iceCollected >= this.targetIce) {
            this.finish();
            return;
          }
        } else {
          this.hits++;
          this.cameras.main.shake(160, 0.008);
          spawnBurst(this, obj.x, obj.y, 0xd96b43, 10, 90);
          if (typeof SoundFx !== 'undefined') SoundFx.playAlert();
          this.livesText.setText(`Vidas de la broca: ${Math.max(0, this.maxHits - this.hits)} / ${this.maxHits}`);
          if (this.hits >= this.maxHits) {
            this.finish();
            return;
          }
        }
        obj.destroy();
        this.items.splice(i, 1);
      } else if (obj.y < cy - 140) {
        obj.destroy();
        this.items.splice(i, 1);
      }
    }
  }

  finish() {
    this.ended = true;
    if (this.spawner) this.spawner.remove();
    if (this.timer) this.timer.remove();

    let tier = 'fail';
    if (this.iceCollected >= this.targetIce && this.hits === 0) {
      tier = 'excellent';
    } else if (this.iceCollected >= this.targetIce || (this.iceCollected >= 4 && this.hits < 2)) {
      tier = 'good';
    } else if (this.iceCollected >= 3) {
      tier = 'fair';
    }

    this.scene.stop('MinigameDrill');
    this.scene.resume('MainScene');

    if (typeof window.onMinigameComplete === 'function') {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.iceCollected / this.targetIce) * 100),
        minigameName: 'Perforación Glaciar Arcadia (Agua)'
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 2. MINIJUEGO: SOLAR & CIRCUIT PATCH (Limpieza y Reconexión de Paneles)
// ============================================================================
class MinigameSolar extends Phaser.Scene {
  constructor() {
    super({ key: 'MinigameSolar' });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const w = 860;
    const h = 480;

    createTechConsole(this, cx, cy, w, h, 0xffd000,
      'LIMPIEZA SOLAR: ¡A QUITAR EL POLVO!',
      'Haz CLIC sobre las manchas de polvo rojizo para limpiarlas y enciende el interruptor'
    );

    // Malla fotovoltaica
    this.add.rectangle(cx, cy + 10, 620, 260, 0x172554).setStrokeStyle(3, 0x38bdf8);
    for (let c = cx - 270; c <= cx + 270; c += 90) {
      this.add.line(0, 0, c, cy - 120, c, cy + 140, 0x1e40af).setOrigin(0);
    }
    for (let r = cy - 80; r <= cy + 110; r += 45) {
      this.add.line(0, 0, cx - 310, r, cx + 310, r, 0x1e40af).setOrigin(0);
    }

    this.cleaned = 0;
    this.totalSpots = 8;
    this.timeLeft = 11;
    this.switchActive = false;
    this.ended = false;

    this.statusText = this.add.text(cx, cy + 155, 'Celdas limpiadas: 0 / 8  |  Tiempo: 11s', {
      fontSize: '18px', fontStyle: 'bold', color: '#4ade80', fontFamily: "'Fredoka', sans-serif"
    }).setOrigin(0.5);

    this.switchBtn = this.add.rectangle(cx, cy + 195, 340, 42, 0x475569)
      .setInteractive({ useHandCursor: true });
    this.switchText = this.add.text(cx, cy + 195, '¡LIMPIA TODO EL POLVO PRIMERO!', {
      fontSize: '14px', fontStyle: 'bold', color: '#cbd5e1', fontFamily: "'Fredoka', sans-serif"
    }).setOrigin(0.5);

    for (let i = 0; i < this.totalSpots; i++) {
      const px = Phaser.Math.Between(cx - 260, cx + 260);
      const py = Phaser.Math.Between(cy - 90, cy + 110);
      const dust = this.add.circle(px, py, 28, 0xd96b43, 0.95)
        .setStrokeStyle(2.5, 0xffd000)
        .setInteractive({ useHandCursor: true });

      dust.on('pointerdown', () => {
        if (this.ended) return;
        dust.destroy();
        this.cleaned++;
        spawnBurst(this, px, py, 0xd96b43, 10, 60);
        if (typeof SoundFx !== 'undefined') SoundFx.playClick();
        this.statusText.setText(`Celdas limpiadas: ${this.cleaned} / ${this.totalSpots}  |  Tiempo: ${this.timeLeft}s`);

        if (this.cleaned >= this.totalSpots) {
          this.switchBtn.setFillStyle(0x22c55e);
          this.switchText.setText('¡ACTIVAR ENERGÍA SOLAR AHORA!');
          this.switchText.setColor('#0f172a');
          this.switchActive = true;
          this.tweens.add({
            targets: this.switchBtn,
            scaleX: 1.05,
            scaleY: 1.1,
            duration: 350,
            yoyo: true,
            repeat: -1
          });
        }
      });
    }

    this.switchBtn.on('pointerdown', () => {
      if (this.switchActive && !this.ended) {
        spawnBurst(this, cx, cy + 195, 0x4ade80, 18, 120);
        if (typeof SoundFx !== 'undefined') SoundFx.playSuccess();
        this.finish(true);
      }
    });

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 10,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.statusText.setText(`Celdas limpiadas: ${this.cleaned} / ${this.totalSpots}  |  Tiempo: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finish(false);
        }
      }
    });
  }

  finish(switchClicked) {
    this.ended = true;
    if (this.timer) this.timer.remove();

    let tier = 'fail';
    if (switchClicked && this.timeLeft >= 4) {
      tier = 'excellent';
    } else if (switchClicked || this.cleaned >= 7) {
      tier = 'good';
    } else if (this.cleaned >= 5) {
      tier = 'fair';
    }

    this.scene.stop('MinigameSolar');
    this.scene.resume('MainScene');

    if (typeof window.onMinigameComplete === 'function') {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.cleaned / this.totalSpots) * 100),
        minigameName: 'Mantenimiento Solar (Energía)'
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 3. MINIJUEGO: BIO-DOME HYDROPONICS (Cultivo Hidropónico OSDR)
// ============================================================================
class MinigameBiodome extends Phaser.Scene {
  constructor() {
    super({ key: 'MinigameBiodome' });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const w = 860;
    const h = 480;

    createTechConsole(this, cx, cy, w, h, 0x4ade80,
      'HUERTO ESPACIAL: ¡CULTIVANDO COMIDA!',
      'Pulsa los botones de REGAR + LUZ para mantener felices las 3 plantas hasta la cosecha'
    );

    this.plants = [80, 75, 85];
    this.bars = [];
    this.sprouts = [];
    this.timeLeft = 10;
    this.ended = false;

    const offsets = [-230, 0, 230];
    const cropNames = ['Rábano Marciano', 'Espirulina Verde', 'Col Nutritiva'];

    offsets.forEach((ox, idx) => {
      const px = cx + ox;
      this.add.rectangle(px, cy + 15, 190, 220, 0x1e293b).setStrokeStyle(2.5, 0x4ade80);
      this.add.text(px, cy - 75, cropNames[idx], {
        fontSize: '14px', fontStyle: 'bold', color: '#ffffff', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);

      const sprout = this.add.circle(px, cy - 25, 20, 0x22c55e);
      this.sprouts.push(sprout);

      const bar = this.add.text(px, cy + 20, 'Vitalidad: 80%', {
        fontSize: '15px', fontStyle: 'bold', color: '#4ade80', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);
      this.bars.push(bar);

      const btn = this.add.rectangle(px, cy + 80, 150, 44, 0x0284c7)
        .setInteractive({ useHandCursor: true });
      this.add.text(px, cy + 80, 'REGAR + LUZ', {
        fontSize: '13px', fontStyle: 'bold', color: '#ffffff', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (this.ended) return;
        this.plants[idx] = Math.min(100, this.plants[idx] + 25);
        spawnBurst(this, px, cy + 80, 0x38bdf8, 10, 50);
        if (typeof SoundFx !== 'undefined') SoundFx.playResourceGain();
        btn.setFillStyle(0x22c55e);
        this.time.delayedCall(150, () => btn.setFillStyle(0x0284c7));
      });
    });

    this.timerText = this.add.text(cx, cy + 185, 'Tiempo para cosecha: 10s', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffd000', fontFamily: "'Fredoka', sans-serif"
    }).setOrigin(0.5);

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.timerText.setText(`Tiempo para cosecha: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      }
    });
  }

  update(time, delta) {
    if (this.ended) return;

    for (let i = 0; i < 3; i++) {
      this.plants[i] -= (0.013 + i * 0.003) * delta;
      const v = Math.max(0, Math.floor(this.plants[i]));
      this.bars[i].setText(`Vitalidad: ${v}%`);

      if (v > 60) {
        this.sprouts[i].setScale(1.2);
        this.sprouts[i].setFillStyle(0x22c55e);
      } else if (v > 25) {
        this.sprouts[i].setScale(0.9);
        this.sprouts[i].setFillStyle(0xfacc15);
      } else {
        this.sprouts[i].setScale(0.6);
        this.sprouts[i].setFillStyle(0xfb7185);
      }

      if (this.plants[i] <= 0) {
        this.finish();
        return;
      }
    }
  }

  finish() {
    this.ended = true;
    if (this.timer) this.timer.remove();

    const avg = Math.round((this.plants[0] + this.plants[1] + this.plants[2]) / 3);
    let tier = 'fail';
    if (avg >= 70) {
      tier = 'excellent';
    } else if (avg >= 45) {
      tier = 'good';
    } else if (avg >= 20) {
      tier = 'fair';
    }

    this.scene.stop('MinigameBiodome');
    this.scene.resume('MainScene');

    if (typeof window.onMinigameComplete === 'function') {
      window.onMinigameComplete({
        tier: tier,
        score: avg,
        minigameName: 'Biodomo Hidropónico (Alimentos)'
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 4. MINIJUEGO: DONKI SHIELD DEFENSE (Deflector de Tormenta Solar)
// ============================================================================
class MinigameShield extends Phaser.Scene {
  constructor() {
    super({ key: 'MinigameShield' });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const w = 860;
    const h = 480;

    createTechConsole(this, cx, cy, w, h, 0xfb7185,
      'ESCUDO SOLAR: ¡PROTEGE EL HÁBITAT!',
      'Mueve el escudo con el RATÓN para bloquear 7 partículas de radiación antes de que toquen la base'
    );

    // Barra de base del hábitat
    this.add.rectangle(cx, cy + 205, 800, 36, 0x334155).setStrokeStyle(1.5, 0x64748b);
    this.add.text(cx, cy + 205, 'BARRERA DEFENSIVA OUTPOST BETA', {
      fontSize: '12px', fontStyle: 'bold', color: '#cbd5e1', fontFamily: "'Fredoka', sans-serif"
    }).setOrigin(0.5);

    this.paddle = this.add.rectangle(cx, cy + 155, 140, 22, 0x38bdf8)
      .setStrokeStyle(2.5, 0xffffff);

    this.blocked = 0;
    this.missed = 0;
    this.targetBlocked = 7;
    this.maxMisses = 3;
    this.ended = false;
    this.rays = [];

    this.scoreText = this.add.text(cx - 390, cy - 150, 'Partículas bloqueadas: 0 / 7', {
      fontSize: '18px', fontStyle: 'bold', color: '#38bdf8', fontFamily: "'Fredoka', sans-serif"
    });
    this.damageText = this.add.text(cx - 390, cy - 122, 'Impactos permitidos: 0 / 3', {
      fontSize: '16px', color: '#fb7185', fontFamily: "'Fredoka', sans-serif"
    });

    this.spawner = this.time.addEvent({
      delay: 700,
      loop: true,
      callback: () => {
        if (this.ended) return;
        const rx = Phaser.Math.Between(cx - 330, cx + 330);
        const ray = this.add.circle(rx, cy - 140, 14, 0xfacc15).setStrokeStyle(3, 0xfb7185);
        this.rays.push(ray);
      }
    });
  }

  update(time, delta) {
    if (this.ended) return;
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    if (this.input.activePointer.x > cx - 360 && this.input.activePointer.x < cx + 360) {
      this.paddle.x = this.input.activePointer.x;
    }

    for (let i = this.rays.length - 1; i >= 0; i--) {
      const r = this.rays[i];
      r.y += 0.26 * delta;

      if (Math.abs(r.y - this.paddle.y) < 22 && Math.abs(r.x - this.paddle.x) < 75) {
        this.blocked++;
        spawnBurst(this, r.x, r.y, 0x38bdf8, 12, 90);
        if (typeof SoundFx !== 'undefined') SoundFx.playResourceGain();
        this.scoreText.setText(`Partículas bloqueadas: ${this.blocked} / ${this.targetBlocked}`);
        r.destroy();
        this.rays.splice(i, 1);

        if (this.blocked >= this.targetBlocked) {
          this.finish();
          return;
        }
      } else if (r.y > cy + 195) {
        this.missed++;
        this.cameras.main.shake(180, 0.01);
        spawnBurst(this, r.x, cy + 195, 0xfb7185, 10, 80);
        if (typeof SoundFx !== 'undefined') SoundFx.playAlert();
        this.damageText.setText(`Impactos permitidos: ${this.missed} / ${this.maxMisses}`);
        r.destroy();
        this.rays.splice(i, 1);

        if (this.missed >= this.maxMisses) {
          this.finish();
          return;
        }
      }
    }
  }

  finish() {
    this.ended = true;
    if (this.spawner) this.spawner.remove();

    let tier = 'fail';
    if (this.blocked >= this.targetBlocked && this.missed === 0) {
      tier = 'excellent';
    } else if (this.blocked >= this.targetBlocked || (this.blocked >= 5 && this.missed < 2)) {
      tier = 'good';
    } else if (this.blocked >= 4) {
      tier = 'fair';
    }

    this.scene.stop('MinigameShield');
    this.scene.resume('MainScene');

    if (typeof window.onMinigameComplete === 'function') {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.blocked / this.targetBlocked) * 100),
        minigameName: 'Escudo DONKI (Radiación)'
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 5. MINIJUEGO: PURIFICACIÓN Y FILTRADO DE AGUA (Separar Percloratos)
// ============================================================================
class MinigameWaterFilter extends Phaser.Scene {
  constructor() {
    super({ key: 'MinigameWaterFilter' });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const w = 860;
    const h = 480;

    createTechConsole(this, cx, cy, w, h, 0x38bdf8,
      'DEPURADORA DE AGUA: ¡LIMPIANDO PERCLORATOS!',
      'Activa los 3 filtros en orden (Paso 1 -> Paso 2 -> Paso 3) para conseguir agua limpia'
    );

    this.stagesDone = [false, false, false];
    this.timeLeft = 12;
    this.ended = false;

    const stages = [
      { num: 1, title: 'Filtro 1: Rocas y Arena', desc: 'Retiene la tierra del suelo', ox: -230 },
      { num: 2, title: 'Filtro 2: Percloratos', desc: 'Elimina las sales tóxicas', ox: 0 },
      { num: 3, title: 'Filtro 3: Agua Pura', desc: 'Agua 100% limpia para beber', ox: 230 }
    ];

    this.buttons = [];

    // Tubería conectora central
    this.add.line(0, 0, cx - 230, cy + 10, cx + 230, cy + 10, 0x0284c7, 4).setOrigin(0);

    stages.forEach((st, idx) => {
      const px = cx + st.ox;
      this.add.rectangle(px, cy + 15, 190, 210, 0x162b3a).setStrokeStyle(2.5, 0x38bdf8);
      this.add.text(px, cy - 65, st.title, {
        fontSize: '14px', fontStyle: 'bold', color: '#ffffff', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);

      this.add.text(px, cy - 35, st.desc, {
        fontSize: '12px', color: '#cbd5e1', align: 'center', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);

      const statusTag = this.add.text(px, cy + 10, 'Esperando turno', {
        fontSize: '13px', fontStyle: 'bold', color: '#fb7185', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);

      const btn = this.add.rectangle(px, cy + 75, 150, 44, idx === 0 ? 0x0284c7 : 0x475569)
        .setInteractive({ useHandCursor: true });
      const btnText = this.add.text(px, cy + 75, idx === 0 ? 'ACTIVAR' : 'BLOQUEADO', {
        fontSize: '13px', fontStyle: 'bold', color: '#ffffff', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (this.ended) return;

        if (idx === 0 || this.stagesDone[idx - 1]) {
          if (!this.stagesDone[idx]) {
            this.stagesDone[idx] = true;
            statusTag.setText('¡Filtro activo!');
            statusTag.setColor('#4ade80');
            btn.setFillStyle(0x22c55e);
            btnText.setText('¡LISTO!');
            spawnBurst(this, px, cy + 75, 0x38bdf8, 12, 70);
            if (typeof SoundFx !== 'undefined') SoundFx.playResourceGain();

            if (idx + 1 < stages.length) {
              this.buttons[idx + 1].btn.setFillStyle(0x0284c7);
              this.buttons[idx + 1].btnText.setText('ACTIVAR');
              this.buttons[idx + 1].statusTag.setText('¡Listo para activar!');
              this.buttons[idx + 1].statusTag.setColor('#ffd000');
            } else {
              this.time.delayedCall(400, () => this.finish());
            }
          }
        } else {
          this.cameras.main.shake(120, 0.005);
          if (typeof SoundFx !== 'undefined') SoundFx.playAlert();
        }
      });

      this.buttons.push({ btn, btnText, statusTag });
    });

    this.timerText = this.add.text(cx, cy + 185, 'Tiempo restante: 12s', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffd000', fontFamily: "'Fredoka', sans-serif"
    }).setOrigin(0.5);

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 11,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.timerText.setText(`Tiempo restante: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      }
    });
  }

  finish() {
    this.ended = true;
    if (this.timer) this.timer.remove();

    const count = this.stagesDone.filter(Boolean).length;
    let tier = 'fail';
    if (count === 3 && this.timeLeft >= 5) {
      tier = 'excellent';
    } else if (count === 3) {
      tier = 'good';
    } else if (count >= 2) {
      tier = 'fair';
    }

    this.scene.stop('MinigameWaterFilter');
    this.scene.resume('MainScene');

    if (typeof window.onMinigameComplete === 'function') {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((count / 3) * 100),
        minigameName: 'Purificación de Agua y Percloratos (Agua)'
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 6. MINIJUEGO: REPARACIÓN DE FUGAS DE OXÍGENO EN EL HÁBITAT
// ============================================================================
class MinigameLeakRepair extends Phaser.Scene {
  constructor() {
    super({ key: 'MinigameLeakRepair' });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const w = 860;
    const h = 480;

    createTechConsole(this, cx, cy, w, h, 0x38bdf8,
      'SELLADO DE FUGAS: ¡SALVA EL OXÍGENO!',
      'Haz CLIC sobre las 5 fugas marcadas para taparlas antes de que baje el aire de la cabina'
    );

    this.sealed = 0;
    this.totalLeaks = 5;
    this.timeLeft = 10;
    this.ended = false;
    this.pressure = 100;

    this.pressureText = this.add.text(cx - 390, cy - 150, 'Presión de cabina: 100%', {
      fontSize: '18px', fontStyle: 'bold', color: '#4ade80', fontFamily: "'Fredoka', sans-serif"
    });

    this.statusText = this.add.text(cx + 170, cy - 150, 'Fugas selladas: 0 / 5', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffd000', fontFamily: "'Fredoka', sans-serif"
    });

    // Panel de mamparo del hábitat
    this.add.rectangle(cx, cy + 25, 720, 260, 0x1e293b).setStrokeStyle(3, 0x475569);

    for (let i = 0; i < this.totalLeaks; i++) {
      const lx = Phaser.Math.Between(cx - 280, cx + 280);
      const ly = Phaser.Math.Between(cy - 75, cy + 115);

      const leakCircle = this.add.circle(lx, ly, 24, 0x0284c7)
        .setStrokeStyle(3, 0x38bdf8)
        .setInteractive({ useHandCursor: true });

      this.tweens.add({
        targets: leakCircle,
        scale: 1.25,
        alpha: 0.7,
        duration: 400,
        yoyo: true,
        repeat: -1
      });

      const hissText = this.add.text(lx, ly - 30, '¡Fuga!', {
        fontSize: '12px', fontStyle: 'bold', color: '#38bdf8', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);

      leakCircle.on('pointerdown', () => {
        if (this.ended) return;
        leakCircle.destroy();
        hissText.destroy();
        this.sealed++;
        spawnBurst(this, lx, ly, 0x38bdf8, 14, 60);
        if (typeof SoundFx !== 'undefined') SoundFx.playResourceGain();
        this.statusText.setText(`Fugas selladas: ${this.sealed} / ${this.totalLeaks}`);

        this.add.circle(lx, ly, 18, 0x22c55e).setStrokeStyle(2.5, 0xffffff);

        if (this.sealed >= this.totalLeaks) {
          this.finish();
        }
      });
    }

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.pressure = Math.max(10, this.pressure - (this.totalLeaks - this.sealed) * 4);
        this.pressureText.setText(`Presión de cabina: ${this.pressure}%`);
        if (this.pressure < 50) {
          this.pressureText.setColor('#fb7185');
          this.cameras.main.shake(90, 0.004);
        }
        if (this.timeLeft <= 0) {
          this.finish();
        }
      }
    });
  }

  finish() {
    this.ended = true;
    if (this.timer) this.timer.remove();

    let tier = 'fail';
    if (this.sealed >= this.totalLeaks && this.timeLeft >= 4) {
      tier = 'excellent';
    } else if (this.sealed >= this.totalLeaks || this.sealed >= 4) {
      tier = 'good';
    } else if (this.sealed >= 3) {
      tier = 'fair';
    }

    this.scene.stop('MinigameLeakRepair');
    this.scene.resume('MainScene');

    if (typeof window.onMinigameComplete === 'function') {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.sealed / this.totalLeaks) * 100),
        minigameName: 'Sellado de Fugas del Hábitat (Oxígeno)'
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 7. MINIJUEGO: REPARACIÓN ELÉCTRICA Y CONEXIÓN DE CIRCUITOS
// ============================================================================
class MinigameCircuit extends Phaser.Scene {
  constructor() {
    super({ key: 'MinigameCircuit' });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const w = 860;
    const h = 480;

    createTechConsole(this, cx, cy, w, h, 0xffd000,
      'CIRCUITOS: ¡CONECTA LA ENERGÍA!',
      'Haz clic en los 4 relés para girarlos y hacer que la corriente viaje de los paneles a las baterías'
    );

    // Entrada y Salida
    this.add.rectangle(cx - 330, cy + 10, 110, 70, 0x1e3a8a).setStrokeStyle(2.5, 0x38bdf8);
    this.add.text(cx - 330, cy + 10, 'PANELES\nSOLARES', {
      fontSize: '13px', fontStyle: 'bold', color: '#38bdf8', align: 'center', fontFamily: "'Fredoka', sans-serif"
    }).setOrigin(0.5);

    this.add.rectangle(cx + 330, cy + 10, 110, 70, 0x14532d).setStrokeStyle(2.5, 0x4ade80);
    this.add.text(cx + 330, cy + 10, 'BATERÍAS\nBASE', {
      fontSize: '13px', fontStyle: 'bold', color: '#4ade80', align: 'center', fontFamily: "'Fredoka', sans-serif"
    }).setOrigin(0.5);

    this.relays = [
      { ox: -190, oy: 10, state: 1, target: 0 },
      { ox: -60, oy: -50, state: 2, target: 0 },
      { ox: 70, oy: 70, state: 3, target: 0 },
      { ox: 200, oy: 10, state: 1, target: 0 }
    ];

    this.relayObjects = [];
    this.timeLeft = 12;
    this.ended = false;

    this.wireLine = this.add.graphics();
    this.drawWires(false);

    this.relays.forEach((r, idx) => {
      const rx = cx + r.ox;
      const ry = cy + r.oy;

      const box = this.add.rectangle(rx, ry, 74, 74, 0x1e293b)
        .setStrokeStyle(3, 0x64748b)
        .setInteractive({ useHandCursor: true });

      const indicator = this.add.rectangle(rx, ry, 48, 12, 0xffd000);
      indicator.setAngle(r.state * 90);

      this.add.text(rx, ry - 48, `Relé ${idx + 1}`, {
        fontSize: '12px', fontStyle: 'bold', color: '#cbd5e1', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);

      box.on('pointerdown', () => {
        if (this.ended) return;
        r.state = (r.state + 1) % 4;
        indicator.setAngle(r.state * 90);
        if (typeof SoundFx !== 'undefined') SoundFx.playClick();

        if (r.state === r.target) {
          box.setStrokeStyle(3, 0x22c55e);
          indicator.setFillStyle(0x4ade80);
        } else {
          box.setStrokeStyle(3, 0x64748b);
          indicator.setFillStyle(0xffd000);
        }

        this.checkCircuitComplete();
      });

      this.relayObjects.push({ box, indicator });
    });

    this.timerText = this.add.text(cx, cy + 185, 'Tiempo restante: 12s', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffd000', fontFamily: "'Fredoka', sans-serif"
    }).setOrigin(0.5);

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 11,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.timerText.setText(`Tiempo restante: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      }
    });
  }

  drawWires(isPowered) {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.wireLine.clear();
    this.wireLine.lineStyle(4, isPowered ? 0xffd000 : 0x334155);
    this.wireLine.beginPath();
    this.wireLine.moveTo(cx - 275, cy + 10);
    this.wireLine.lineTo(cx - 190, cy + 10);
    this.wireLine.lineTo(cx - 60, cy - 50);
    this.wireLine.lineTo(cx + 70, cy + 70);
    this.wireLine.lineTo(cx + 200, cy + 10);
    this.wireLine.lineTo(cx + 275, cy + 10);
    this.wireLine.strokePath();
  }

  checkCircuitComplete() {
    const isComplete = this.relays.every(r => r.state === r.target);
    if (isComplete && !this.ended) {
      const cx = this.scale.width / 2;
      const cy = this.scale.height / 2;
      this.drawWires(true);
      spawnBurst(this, cx, cy + 10, 0xffd000, 20, 130);
      if (typeof SoundFx !== 'undefined') SoundFx.playSuccess();
      this.time.delayedCall(450, () => this.finish());
    }
  }

  finish() {
    this.ended = true;
    if (this.timer) this.timer.remove();

    const alignedCount = this.relays.filter(r => r.state === r.target).length;
    let tier = 'fail';
    if (alignedCount === 4 && this.timeLeft >= 5) {
      tier = 'excellent';
    } else if (alignedCount === 4) {
      tier = 'good';
    } else if (alignedCount >= 2) {
      tier = 'fair';
    }

    this.scene.stop('MinigameCircuit');
    this.scene.resume('MainScene');

    if (typeof window.onMinigameComplete === 'function') {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((alignedCount / 4) * 100),
        minigameName: 'Conexión de Circuitos (Energía)'
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 8. MINIJUEGO: CONDUCCIÓN Y EXPLORACIÓN DEL ROVER ROVI
// ============================================================================
class MinigameRoverDrive extends Phaser.Scene {
  constructor() {
    super({ key: 'MinigameRoverDrive' });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const w = 860;
    const h = 480;

    createTechConsole(this, cx, cy, w, h, 0xffd000,
      'ROVER ROVI: ¡EXPLORACIÓN MARCIANA!',
      'Conduce a ROVI con FLECHAS o WASD para recoger 4 balizas científicas esquivando los cráteres'
    );

    this.sensorsCollected = 0;
    this.targetSensors = 4;
    this.timeLeft = 14;
    this.ended = false;

    // Obstáculos
    this.obstacles = [];
    const obsPos = [
      { ox: -150, oy: -60, r: 28 },
      { ox: 150, oy: -30, r: 32 },
      { ox: -30, oy: 90, r: 26 },
      { ox: 250, oy: 110, r: 30 }
    ];

    obsPos.forEach(p => {
      const crat = this.add.circle(cx + p.ox, cy + p.oy, p.r, 0x170f1a).setStrokeStyle(3, 0x8a3822);
      this.add.text(cx + p.ox, cy + p.oy, 'Cráter', { fontSize: '11px', fontStyle: 'bold', color: '#fb7185', fontFamily: "'Fredoka', sans-serif" }).setOrigin(0.5);
      this.obstacles.push(crat);
    });

    // 4 Balizas científicas
    this.beacons = [];
    const beaconCoords = [
      { ox: -230, oy: -100 },
      { ox: 290, oy: -90 },
      { ox: -130, oy: 140 },
      { ox: 310, oy: 130 }
    ];

    beaconCoords.forEach(b => {
      const beacon = this.add.circle(cx + b.ox, cy + b.oy, 16, 0x38bdf8).setStrokeStyle(2.5, 0xffffff);
      const icon = this.add.text(cx + b.ox, cy + b.oy, 'Baliza', { fontSize: '10px', fontStyle: 'bold', color: '#ffffff', fontFamily: "'Fredoka', sans-serif" }).setOrigin(0.5);
      beacon.icon = icon;
      this.beacons.push(beacon);

      this.tweens.add({
        targets: beacon,
        scale: 1.15,
        alpha: 0.85,
        duration: 450,
        yoyo: true,
        repeat: -1
      });
    });

    // Rover ROVI
    this.rover = this.add.rectangle(cx, cy + 10, 36, 24, 0xffd000).setStrokeStyle(2, 0x0f172a);
    this.roverSensor = this.add.circle(cx + 12, cy + 10, 5, 0x0284c7);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    this.scoreText = this.add.text(cx - 390, cy - 150, 'Balizas colocadas: 0 / 4', {
      fontSize: '18px', fontStyle: 'bold', color: '#38bdf8', fontFamily: "'Fredoka', sans-serif"
    });

    this.timerText = this.add.text(cx + 250, cy - 150, 'Tiempo: 14s', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffd000', fontFamily: "'Fredoka', sans-serif"
    });

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 13,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.timerText.setText(`Tiempo: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      }
    });
  }

  update(time, delta) {
    if (this.ended) return;
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    let moveX = 0;
    let moveY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) moveX -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) moveX += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) moveY -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) moveY += 1;

    if (moveX !== 0 || moveY !== 0) {
      const speed = 0.22 * delta;
      this.rover.x += moveX * speed;
      this.rover.y += moveY * speed;

      const angle = Math.atan2(moveY, moveX);
      this.rover.rotation = angle;
      this.roverSensor.x = this.rover.x + Math.cos(angle) * 12;
      this.roverSensor.y = this.rover.y + Math.sin(angle) * 12;
    }

    this.rover.x = Phaser.Math.Clamp(this.rover.x, cx - 370, cx + 370);
    this.rover.y = Phaser.Math.Clamp(this.rover.y, cy - 140, cy + 200);

    for (let i = this.beacons.length - 1; i >= 0; i--) {
      const b = this.beacons[i];
      if (Phaser.Math.Distance.Between(this.rover.x, this.rover.y, b.x, b.y) < 28) {
        this.sensorsCollected++;
        spawnBurst(this, b.x, b.y, 0x38bdf8, 12, 80);
        if (typeof SoundFx !== 'undefined') SoundFx.playResourceGain();
        this.scoreText.setText(`Balizas colocadas: ${this.sensorsCollected} / ${this.targetSensors}`);

        b.icon.destroy();
        b.destroy();
        this.beacons.splice(i, 1);

        if (this.sensorsCollected >= this.targetSensors) {
          this.finish();
          return;
        }
      }
    }
  }

  finish() {
    this.ended = true;
    if (this.timer) this.timer.remove();

    let tier = 'fail';
    if (this.sensorsCollected >= this.targetSensors && this.timeLeft >= 5) {
      tier = 'excellent';
    } else if (this.sensorsCollected >= this.targetSensors) {
      tier = 'good';
    } else if (this.sensorsCollected >= 2) {
      tier = 'fair';
    }

    this.scene.stop('MinigameRoverDrive');
    this.scene.resume('MainScene');

    if (typeof window.onMinigameComplete === 'function') {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.sensorsCollected / this.targetSensors) * 100),
        minigameName: 'Exploración con Rover ROVI (Ciencia)'
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 9. MINIJUEGO: ESPECTROMETRÍA LÁSER DE MUESTRAS MARCIANAS (NASA PIXL)
// ============================================================================
class MinigameSpectro extends Phaser.Scene {
  constructor() {
    super('MinigameSpectro');
  }

  init(data) {
    this.choiceData = data.choice || {};
    this.samplesScanned = 0;
    this.targetSamples = 4;
    this.timeLeft = 16;
    this.ended = false;
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const w = 860;
    const h = 480;

    createTechConsole(this, cx, cy, w, h, 0x38bdf8,
      'LÁSER PIXL: ¡ANALIZA LAS ROCAS DE MARTE!',
      'Haz clic en cada roca para disparar el láser y descubrir qué minerales contiene'
    );

    this.timerText = this.add.text(cx - 390, cy - 150, 'Tiempo restante: 16.0s', {
      fontSize: '16px', color: '#ffd000', fontFamily: "'Fredoka', sans-serif"
    });

    this.scoreText = this.add.text(cx - 390, cy - 125, 'Muestras analizadas: 0 / 4', {
      fontSize: '16px', fontStyle: 'bold', color: '#38bdf8', fontFamily: "'Fredoka', sans-serif"
    });

    const samplesData = [
      { name: 'Basalto Volcánico', sub: 'Roca volcánica marciana', color: 0x475569, ox: -270 },
      { name: 'Esferas de Hematita', sub: 'Huellas de agua del pasado', color: 0x991b1b, ox: -90 },
      { name: 'Arcilla de Lago', sub: 'Barro de un antiguo lago', color: 0xb45309, ox: 90 },
      { name: 'Sulfatos con Agua', sub: '¡Tiene agua atrapada dentro!', color: 0x0284c7, ox: 270 }
    ];

    this.samples = [];

    samplesData.forEach((sd, idx) => {
      const px = cx + sd.ox;
      const py = cy + 40;

      this.add.circle(px, py, 60, 0x1e293b).setStrokeStyle(3, 0x334155);

      const rock = this.add.polygon(px, py, [-35, -15, 0, -42, 38, -12, 30, 35, -25, 30], sd.color)
        .setInteractive({ useHandCursor: true });

      const nameLabel = this.add.text(px, py + 75, sd.name, {
        fontSize: '13px', fontStyle: 'bold', color: '#ffffff', align: 'center', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);

      const statusTag = this.add.text(px, py + 95, 'Pendiente', {
        fontSize: '12px', fontStyle: 'bold', color: '#94a3b8', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);

      const specBox = this.add.rectangle(px, py - 90, 130, 48, 0x0f172a).setStrokeStyle(1.5, 0x38bdf8);
      const specText = this.add.text(px, py - 90, sd.sub, {
        fontSize: '11px', color: '#f1f5f9', align: 'center', wordWrap: { width: 120 }, fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);
      specBox.setVisible(false);
      specText.setVisible(false);

      const sampleObj = {
        idx,
        rock,
        statusTag,
        specBox,
        specText,
        x: px,
        y: py,
        scanned: false
      };

      rock.on('pointerdown', () => {
        if (sampleObj.scanned || this.ended) return;
        this.scanSample(sampleObj);
      });

      this.samples.push(sampleObj);
    });

    this.laserBeam = this.add.line(0, 0, 0, 0, 0, 0, 0x38bdf8, 3.5).setOrigin(0);
    this.laserBeam.setVisible(false);

    this.timer = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.ended) return;
        this.timeLeft -= 0.1;
        this.timerText.setText(`Tiempo restante: ${Math.max(0, this.timeLeft).toFixed(1)}s`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      },
      loop: true
    });
  }

  scanSample(sample) {
    sample.scanned = true;
    if (typeof SoundFx !== 'undefined') SoundFx.playClick();

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const startX = cx;
    const startY = cy - 140;
    const targetX = sample.x;
    const targetY = sample.y;

    this.laserBeam.setTo(startX, startY, targetX, targetY);
    this.laserBeam.setVisible(true);

    this.time.delayedCall(400, () => {
      this.laserBeam.setVisible(false);
      sample.rock.setFillStyle(0xffd000);
      sample.statusTag.setText('¡Analizado!');
      sample.statusTag.setColor('#4ade80');
      sample.specBox.setVisible(true);
      sample.specText.setVisible(true);

      this.samplesScanned++;
      spawnBurst(this, sample.x, sample.y, 0xffd000, 14, 70);
      if (typeof SoundFx !== 'undefined') SoundFx.playResourceGain();
      this.scoreText.setText(`Muestras analizadas: ${this.samplesScanned} / ${this.targetSamples}`);

      if (this.samplesScanned >= this.targetSamples) {
        this.finish();
      }
    });
  }

  finish() {
    this.ended = true;
    if (this.timer) this.timer.remove();

    let tier = 'fail';
    if (this.samplesScanned >= this.targetSamples && this.timeLeft >= 5) {
      tier = 'excellent';
    } else if (this.samplesScanned >= this.targetSamples) {
      tier = 'good';
    } else if (this.samplesScanned >= 2) {
      tier = 'fair';
    }

    this.scene.stop('MinigameSpectro');
    this.scene.resume('MainScene');

    if (typeof window.onMinigameComplete === 'function') {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.samplesScanned / this.targetSamples) * 100),
        minigameName: 'Espectrometría Láser PIXL (Muestras)'
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 10. MINIJUEGO: DEFENSA ANTE MEGATORMENTA MARCIANA (PROTOCOLO DE EMERGENCIA)
// ============================================================================
class MinigameDustDefense extends Phaser.Scene {
  constructor() {
    super('MinigameDustDefense');
  }

  init(data) {
    this.choiceData = data.choice || {};
    this.securedCount = 0;
    this.totalSystems = 4;
    this.timeLeft = 15;
    this.ended = false;
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const w = 860;
    const h = 480;

    createTechConsole(this, cx, cy, w, h, 0xf97316,
      '¡ALERTA DE TORMENTA!: PROTEGE LA BASE',
      'El viento sopla fuerte. Pulsa en PROTEGER en los 4 sistemas antes de que llegue la arena'
    );

    this.timerText = this.add.text(cx - 390, cy - 150, 'Tiempo antes del viento: 15.0s', {
      fontSize: '16px', fontStyle: 'bold', color: '#fb7185', fontFamily: "'Fredoka', sans-serif"
    });

    this.scoreText = this.add.text(cx - 390, cy - 125, 'Sistemas protegidos: 0 / 4', {
      fontSize: '16px', fontStyle: 'bold', color: '#38bdf8', fontFamily: "'Fredoka', sans-serif"
    });

    const systems = [
      { id: 'solar', title: 'PANELES SOLARES', task: 'Plegar para evitar la arena', ox: -195, oy: -25 },
      { id: 'mast', title: 'ANTENA DE RADIO', task: 'Bajar mástil de comunicaciones', ox: 195, oy: -25 },
      { id: 'airlock', title: 'PUERTA DEL HÁBITAT', task: 'Cerrar triple sello hermético', ox: -195, oy: 105 },
      { id: 'rover', title: 'ROVER ROVI', task: 'Anclar al garaje seguro', ox: 195, oy: 105 }
    ];

    this.systemCards = [];

    systems.forEach((sys) => {
      const px = cx + sys.ox;
      const py = cy + sys.oy;

      const cardBg = this.add.rectangle(px, py, 360, 105, 0x1f1412)
        .setStrokeStyle(2.5, 0x7c2d12);

      this.add.text(px - 160, py - 36, sys.title, {
        fontSize: '14px', fontStyle: 'bold', color: '#ffffff', fontFamily: "'Fredoka', sans-serif"
      });

      this.add.text(px - 160, py - 14, sys.task, {
        fontSize: '12px', color: '#cbd5e1', fontFamily: "'Fredoka', sans-serif"
      });

      const statusTag = this.add.text(px - 160, py + 16, '¡Peligro de tormenta!', {
        fontSize: '12px', fontStyle: 'bold', color: '#fb7185', fontFamily: "'Fredoka', sans-serif"
      });

      const btn = this.add.rectangle(px + 105, py, 110, 44, 0xef4444)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2.5, 0xffffff);

      const btnText = this.add.text(px + 105, py, 'PROTEGER', {
        fontSize: '12px', fontStyle: 'bold', color: '#ffffff', fontFamily: "'Fredoka', sans-serif"
      }).setOrigin(0.5);

      const item = {
        sys,
        btn,
        btnText,
        cardBg,
        statusTag,
        secured: false
      };

      btn.on('pointerdown', () => {
        if (item.secured || this.ended) return;
        this.secureSystem(item);
      });

      this.systemCards.push(item);
    });

    this.dustParticles = [];
    for (let i = 0; i < 40; i++) {
      const p = this.add.circle(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(cy - 200, cy + 220), Phaser.Math.Between(1, 3), 0xca8a04, 0.45);
      p.speed = Phaser.Math.Between(180, 450);
      this.dustParticles.push(p);
    }

    this.timer = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.ended) return;
        this.timeLeft -= 0.1;
        this.timerText.setText(`Tiempo antes del viento: ${Math.max(0, this.timeLeft).toFixed(1)}s`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      },
      loop: true
    });
  }

  update(time, delta) {
    if (this.ended) return;
    const dt = delta / 1000;
    const w = this.scale.width;
    const cy = this.scale.height / 2;
    this.dustParticles.forEach(p => {
      p.x -= p.speed * dt;
      if (p.x < -10) {
        p.x = w + 10;
        p.y = Phaser.Math.Between(cy - 200, cy + 220);
      }
    });
  }

  secureSystem(item) {
    item.secured = true;
    item.btn.setFillStyle(0x22c55e);
    item.btnText.setText('¡LISTO!');
    item.statusTag.setText('¡Protegido con éxito!');
    item.statusTag.setColor('#4ade80');
    item.cardBg.setStrokeStyle(2.5, 0x22c55e);

    spawnBurst(this, item.btn.x, item.btn.y, 0x22c55e, 14, 80);
    this.securedCount++;
    if (typeof SoundFx !== 'undefined') SoundFx.playSuccess();
    this.scoreText.setText(`Sistemas protegidos: ${this.securedCount} / ${this.totalSystems}`);

    if (this.securedCount >= this.totalSystems) {
      this.finish();
    }
  }

  finish() {
    this.ended = true;
    if (this.timer) this.timer.remove();

    let tier = 'fail';
    if (this.securedCount >= this.totalSystems && this.timeLeft >= 4) {
      tier = 'excellent';
    } else if (this.securedCount >= this.totalSystems) {
      tier = 'good';
    } else if (this.securedCount >= 2) {
      tier = 'fair';
    }

    this.scene.stop('MinigameDustDefense');
    this.scene.resume('MainScene');

    if (typeof window.onMinigameComplete === 'function') {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.securedCount / this.totalSystems) * 100),
        minigameName: 'Defensa ante Megatormenta Marciana'
      }, this.choiceData);
    }
  }
}
