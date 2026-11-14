// js/minigamesPack.js — Pack con los minijuegos de supervivencia para el Junior Astronaut Trainer
// 1. MinigameDrill (Extracción de Hielo)
// 2. MinigameSolar (Mantenimiento y Conexión Solar)
// 3. MinigameBiodome (Cultivo Hidropónico OSDR)
// 4. MinigameShield (Deflector de Tormenta Solar DONKI)
// 5. MinigameWaterFilter (Purificación de Agua y Percloratos)
// 6. MinigameLeakRepair (Reparación de Fugas de Oxígeno)

// ============================================================================
// 1. MINIJUEGO: ARCADIA ICE DRILL (Extracción de Hielo Subterráneo)
// ============================================================================
class MinigameDrill extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameDrill" });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x1e1526);
    this.add.rectangle(450, 250, 880, 480, 0x2d1f38).setStrokeStyle(2, 0x38bdf8, 0.4);

    this.add.text(450, 34, "PERFORACION GLACIAR: ARCADIA PLANITIA", {
      fontSize: "22px", fontStyle: "bold", color: "#38bdf8", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.text(450, 64, "Mueve la broca con el RATÓN o FLECHAS para extraer 6 CRISTALES DE HIELO y esquivar las ROCAS", {
      fontSize: "14px", color: "#cbd5e1", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.iceCollected = 0;
    this.hits = 0;
    this.targetIce = 6;
    this.maxHits = 3;
    this.ended = false;
    this.timeLeft = 14;

    this.scoreText = this.add.text(40, 95, "Hielo extraido [H2O]: 0 / 6", {
      fontSize: "20px", fontStyle: "bold", color: "#38bdf8", fontFamily: "'Segoe UI', sans-serif"
    });

    this.livesText = this.add.text(40, 130, "Integridad Broca: 3 / 3", {
      fontSize: "17px", color: "#f7e396", fontFamily: "'Segoe UI', sans-serif"
    });

    this.timerText = this.add.text(680, 95, "⏱️ Tiempo: 14s", {
      fontSize: "18px", color: "#f8fafc", fontFamily: "'Segoe UI', sans-serif"
    });

    // Broca perforadora del jugador
    this.drill = this.add.triangle(450, 140, 0, 0, 40, 0, 20, 44, 0xf7e396)
      .setStrokeStyle(2, 0x0f172a);
    
    // Núcleo giratorio de la broca
    this.drillCore = this.add.circle(450, 132, 8, 0x38bdf8);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.items = [];

    // Generador de hielo y rocas
    this.spawner = this.time.addEvent({
      delay: 600,
      loop: true,
      callback: () => {
        if (this.ended) return;
        const x = Phaser.Math.Between(180, 760);
        const isIce = Math.random() > 0.40;
        
        let item;
        if (isIce) {
          item = this.add.rectangle(x, 520, 32, 32, 0x38bdf8)
            .setStrokeStyle(2, 0xffffff);
        } else {
          item = this.add.polygon(x, 520, [0, 15, 12, 0, 28, 6, 32, 26, 16, 34, 4, 28], 0xd96b43)
            .setStrokeStyle(2, 0x7c2d12);
        }
        item.isIce = isIce;
        this.items.push(item);
      }
    });

    // Reloj
    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 13,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.timerText.setText(`⏱️ Tiempo: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      }
    });
  }

  update(time, delta) {
    if (this.ended) return;

    // Control de broca
    if (this.input.activePointer.x > 150 && this.input.activePointer.x < 800) {
      this.drill.x = Phaser.Math.Linear(this.drill.x, this.input.activePointer.x, 0.22);
    }
    if (this.cursors.left.isDown) this.drill.x -= 0.42 * delta;
    if (this.cursors.right.isDown) this.drill.x += 0.42 * delta;
    this.drill.x = Phaser.Math.Clamp(this.drill.x, 170, 780);
    this.drillCore.x = this.drill.x;

    // Mover objetos
    for (let i = this.items.length - 1; i >= 0; i--) {
      const obj = this.items[i];
      obj.y -= 0.24 * delta;

      if (Phaser.Math.Distance.Between(this.drill.x, this.drill.y, obj.x, obj.y) < 36) {
        if (obj.isIce) {
          this.iceCollected++;
          if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
          this.scoreText.setText(`Hielo extraido [H2O]: ${this.iceCollected} / ${this.targetIce}`);
          if (this.iceCollected >= this.targetIce) {
            this.finish();
            return;
          }
        } else {
          this.hits++;
          if (typeof SoundFx !== "undefined") SoundFx.playAlert();
          this.livesText.setText(`Integridad Broca: ${Math.max(0, this.maxHits - this.hits)} / ${this.maxHits}`);
          if (this.hits >= this.maxHits) {
            this.finish();
            return;
          }
        }
        obj.destroy();
        this.items.splice(i, 1);
      } else if (obj.y < 80) {
        obj.destroy();
        this.items.splice(i, 1);
      }
    }
  }

  finish() {
    this.ended = true;
    this.spawner.remove();
    this.timer.remove();

    let tier = "fail";
    if (this.iceCollected >= this.targetIce && this.hits === 0) {
      tier = "excellent";
    } else if (this.iceCollected >= this.targetIce || (this.iceCollected >= 4 && this.hits < 2)) {
      tier = "good";
    } else if (this.iceCollected >= 3) {
      tier = "fair";
    } else {
      tier = "fail";
    }

    this.scene.stop("MinigameDrill");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.iceCollected / this.targetIce) * 100),
        minigameName: "Perforación Glaciar Arcadia (Agua)"
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 2. MINIJUEGO: SOLAR & CIRCUIT PATCH (Limpieza y Reconexión de Paneles)
// ============================================================================
class MinigameSolar extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameSolar" });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x0f172a);
    this.add.rectangle(450, 250, 880, 480, 0x1e293b).setStrokeStyle(2, 0xfacc15, 0.4);

    this.add.text(450, 34, "MANTENIMIENTO SOLAR: LIMPIEZA Y CONEXION FOTOVOLTAICA", {
      fontSize: "21px", fontStyle: "bold", color: "#F7E396", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.text(450, 64, "¡Haz CLIC sobre las manchas de polvo marciano para limpiarlas y activa el interruptor maestro!", {
      fontSize: "14px", color: "#cbd5e1", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.rectangle(450, 260, 620, 270, 0x172554).setStrokeStyle(4, 0x38bdf8);
    for (let c = 180; c <= 720; c += 90) {
      this.add.line(0, 0, c, 125, c, 395, 0x1e40af).setOrigin(0);
    }
    for (let r = 160; r <= 360; r += 45) {
      this.add.line(0, 0, 140, r, 760, r, 0x1e40af).setOrigin(0);
    }

    this.cleaned = 0;
    this.totalSpots = 8;
    this.timeLeft = 11;
    this.switchActive = false;
    this.ended = false;

    this.statusText = this.add.text(450, 415, "Celdas limpiadas: 0 / 8  |  ⏱️ Tiempo: 11s", {
      fontSize: "18px", fontStyle: "bold", color: "#4ade80", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.switchBtn = this.add.rectangle(450, 455, 300, 36, 0x475569)
      .setInteractive({ useHandCursor: true });
    this.switchText = this.add.text(450, 455, "LIMPIA EL POLVO PRIMERO", {
      fontSize: "14px", fontStyle: "bold", color: "#94a3b8", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    for (let i = 0; i < this.totalSpots; i++) {
      const x = Phaser.Math.Between(190, 710);
      const y = Phaser.Math.Between(155, 365);
      const dust = this.add.circle(x, y, 28, 0xd96b43, 0.95)
        .setStrokeStyle(2, 0xf7e396)
        .setInteractive({ useHandCursor: true });

      dust.on("pointerdown", () => {
        if (this.ended) return;
        dust.destroy();
        this.cleaned++;
        if (typeof SoundFx !== "undefined") SoundFx.playClick();
        this.statusText.setText(`Celdas limpiadas: ${this.cleaned} / ${this.totalSpots}  |  ⏱️ Tiempo: ${this.timeLeft}s`);

        if (this.cleaned >= this.totalSpots) {
          this.switchBtn.setFillStyle(0x22c55e);
          this.switchText.setText("ACTIVAR INTERRUPTOR MAESTRO");
          this.switchText.setColor("#0f172a");
          this.switchActive = true;
        }
      });
    }

    this.switchBtn.on("pointerdown", () => {
      if (this.switchActive && !this.ended) {
        if (typeof SoundFx !== "undefined") SoundFx.playSuccess();
        this.finish(true);
      }
    });

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 10,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.statusText.setText(`Celdas limpiadas: ${this.cleaned} / ${this.totalSpots}  |  ⏱️ Tiempo: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finish(false);
        }
      }
    });
  }

  finish(switchClicked) {
    this.ended = true;
    this.timer.remove();

    let tier = "fail";
    if (switchClicked && this.timeLeft >= 4) {
      tier = "excellent";
    } else if (switchClicked || this.cleaned >= 7) {
      tier = "good";
    } else if (this.cleaned >= 5) {
      tier = "fair";
    } else {
      tier = "fail";
    }

    this.scene.stop("MinigameSolar");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.cleaned / this.totalSpots) * 100),
        minigameName: "Mantenimiento Solar (Energía)"
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 3. MINIJUEGO: BIO-DOME HYDROPONICS (Cultivo Hidropónico OSDR)
// ============================================================================
class MinigameBiodome extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameBiodome" });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x0f2027);
    this.add.rectangle(450, 250, 880, 480, 0x1a332c).setStrokeStyle(2, 0x4ade80, 0.4);

    this.add.text(450, 34, "BIODOMO OSDR: CULTIVO HIDROPONICO Y ESPIRULINA", {
      fontSize: "21px", fontStyle: "bold", color: "#4ade80", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.text(450, 64, "Mantén las 3 bandejas hidratadas y bajo luz LED pulsando sus botones antes de cosechar", {
      fontSize: "14px", color: "#cbd5e1", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.plants = [80, 75, 85];
    this.bars = [];
    this.sprouts = [];
    this.timeLeft = 10;
    this.ended = false;

    const positions = [220, 450, 680];
    const cropNames = ["Microgreens Rábano", "Espirulina Nutritiva", "Microgreens Col"];

    positions.forEach((x, idx) => {
      this.add.rectangle(x, 255, 190, 230, 0x1e293b).setStrokeStyle(2, 0x4ade80);
      this.add.text(x, 160, cropNames[idx], {
        fontSize: "14px", fontStyle: "bold", color: "#f8fafc", fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);

      const sprout = this.add.circle(x, 215, 18, 0x22c55e);
      this.sprouts.push(sprout);

      const bar = this.add.text(x, 260, "Vitalidad: 80%", {
        fontSize: "16px", fontStyle: "bold", color: "#4ade80", fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);
      this.bars.push(bar);

      const btn = this.add.rectangle(x, 325, 150, 46, 0x38bdf8)
        .setInteractive({ useHandCursor: true });
      this.add.text(x, 325, "REGAR + LUZ LED", {
        fontSize: "12px", fontStyle: "bold", color: "#0f172a", fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);

      btn.on("pointerdown", () => {
        if (this.ended) return;
        this.plants[idx] = Math.min(100, this.plants[idx] + 25);
        if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
        btn.setFillStyle(0x4ade80);
        this.time.delayedCall(150, () => btn.setFillStyle(0x38bdf8));
      });
    });

    this.timerText = this.add.text(450, 420, "⏱️ Tiempo para cosecha: 10s", {
      fontSize: "19px", fontStyle: "bold", color: "#f7e396", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.timerText.setText(`⏱️ Tiempo para cosecha: ${this.timeLeft}s`);
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
    this.timer.remove();

    const avg = Math.round((this.plants[0] + this.plants[1] + this.plants[2]) / 3);

    let tier = "fail";
    if (avg >= 70) {
      tier = "excellent";
    } else if (avg >= 45) {
      tier = "good";
    } else if (avg >= 20) {
      tier = "fair";
    } else {
      tier = "fail";
    }

    this.scene.stop("MinigameBiodome");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: avg,
        minigameName: "Biodomo Hidropónico (Alimentos)"
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 4. MINIJUEGO: DONKI SHIELD DEFENSE (Deflector de Tormenta Solar)
// ============================================================================
class MinigameShield extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameShield" });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x180f24);
    this.add.rectangle(450, 250, 880, 480, 0x28163c).setStrokeStyle(2, 0xfb7185, 0.4);

    this.add.text(450, 34, "ALERTA SOLAR DONKI: ESCUDO DEFLECTOR DE RADIACION", {
      fontSize: "21px", fontStyle: "bold", color: "#fb7185", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.text(450, 64, "Mueve el deflector con el RATÓN para interceptar 7 PROTONES SOLARES antes de que dañen el hábitat", {
      fontSize: "14px", color: "#cbd5e1", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.rectangle(450, 475, 900, 50, 0x334155);

    this.paddle = this.add.rectangle(450, 415, 140, 20, 0x38bdf8)
      .setStrokeStyle(2, 0xffffff);

    this.blocked = 0;
    this.missed = 0;
    this.targetBlocked = 7;
    this.maxMisses = 3;
    this.ended = false;
    this.rays = [];

    this.scoreText = this.add.text(40, 95, "Particulas bloqueadas: 0 / 7", {
      fontSize: "19px", fontStyle: "bold", color: "#38bdf8", fontFamily: "'Segoe UI', sans-serif"
    });
    this.damageText = this.add.text(40, 128, "Impactos permitidos: 0 / 3", {
      fontSize: "17px", color: "#fb7185", fontFamily: "'Segoe UI', sans-serif"
    });

    this.spawner = this.time.addEvent({
      delay: 720,
      loop: true,
      callback: () => {
        if (this.ended) return;
        const x = Phaser.Math.Between(160, 760);
        const ray = this.add.circle(x, 90, 14, 0xfacc15).setStrokeStyle(3, 0xfb7185);
        this.rays.push(ray);
      }
    });
  }

  update(time, delta) {
    if (this.ended) return;

    if (this.input.activePointer.x > 120 && this.input.activePointer.x < 780) {
      this.paddle.x = this.input.activePointer.x;
    }

    for (let i = this.rays.length - 1; i >= 0; i--) {
      const r = this.rays[i];
      r.y += 0.26 * delta;

      if (Math.abs(r.y - this.paddle.y) < 20 && Math.abs(r.x - this.paddle.x) < 75) {
        this.blocked++;
        if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
        this.scoreText.setText(`Particulas bloqueadas: ${this.blocked} / ${this.targetBlocked}`);
        r.destroy();
        this.rays.splice(i, 1);

        if (this.blocked >= this.targetBlocked) {
          this.finish();
          return;
        }
      } else if (r.y > 455) {
        this.missed++;
        if (typeof SoundFx !== "undefined") SoundFx.playAlert();
        this.damageText.setText(`Impactos en Outpost: ${this.missed} / ${this.maxMisses}`);
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
    this.spawner.remove();

    let tier = "fail";
    if (this.blocked >= this.targetBlocked && this.missed === 0) {
      tier = "excellent";
    } else if (this.blocked >= this.targetBlocked || (this.blocked >= 5 && this.missed < 2)) {
      tier = "good";
    } else if (this.blocked >= 4) {
      tier = "fair";
    } else {
      tier = "fail";
    }

    this.scene.stop("MinigameShield");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.blocked / this.targetBlocked) * 100),
        minigameName: "Escudo DONKI (Radiación)"
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 5. NUEVO MINIJUEGO: PURIFICACIÓN Y FILTRADO DE AGUA (Separar Percloratos)
// ============================================================================
class MinigameWaterFilter extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameWaterFilter" });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x091e2b);
    this.add.rectangle(450, 250, 880, 480, 0x113144).setStrokeStyle(2, 0x38bdf8, 0.4);

    this.add.text(450, 34, "PURIFICACION DE AGUA: ELIMINACION DE PERCLORATOS", {
      fontSize: "21px", fontStyle: "bold", color: "#38bdf8", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.text(450, 64, "Activa los 3 filtros en orden (1: Sedimentos -> 2: Percloratos -> 3: Ósmosis Inversa) para obtener agua potable", {
      fontSize: "13px", color: "#cbd5e1", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.stagesDone = [false, false, false];
    this.timeLeft = 12;
    this.ended = false;

    const stages = [
      { num: 1, title: "Filtro 1: Sedimentos", desc: "Retener roca y arena", x: 220 },
      { num: 2, title: "Filtro 2: Percloratos", desc: "Desactivar sales tóxicas", x: 450 },
      { num: 3, title: "Filtro 3: Ósmosis Inversa", desc: "Agua 100% esterilizada", x: 680 }
    ];

    this.buttons = [];

    stages.forEach((st, idx) => {
      this.add.rectangle(st.x, 240, 190, 220, 0x162b3a).setStrokeStyle(2, 0x38bdf8);
      this.add.text(st.x, 160, st.title, {
        fontSize: "15px", fontStyle: "bold", color: "#f8fafc", fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);

      this.add.text(st.x, 195, st.desc, {
        fontSize: "12px", color: "#94a3b8", align: "center", fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);

      const statusTag = this.add.text(st.x, 240, "ESTADO: BLOQUEADO", {
        fontSize: "13px", fontStyle: "bold", color: "#fb7185", fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);

      const btn = this.add.rectangle(st.x, 305, 150, 44, idx === 0 ? 0x38bdf8 : 0x475569)
        .setInteractive({ useHandCursor: true });
      const btnText = this.add.text(st.x, 305, idx === 0 ? "ACTIVAR" : "ESPERANDO", {
        fontSize: "13px", fontStyle: "bold", color: "#0f172a", fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);

      btn.on("pointerdown", () => {
        if (this.ended) return;

        if (idx === 0 || this.stagesDone[idx - 1]) {
          if (!this.stagesDone[idx]) {
            this.stagesDone[idx] = true;
            statusTag.setText("ESTADO: PURIFICADO [OK]");
            statusTag.setColor("#4ade80");
            btn.setFillStyle(0x22c55e);
            btnText.setText("COMPLETADO");
            if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();

            if (idx + 1 < stages.length) {
              this.buttons[idx + 1].btn.setFillStyle(0x38bdf8);
              this.buttons[idx + 1].btnText.setText("ACTIVAR");
            } else {
              this.time.delayedCall(400, () => this.finish());
            }
          }
        } else {
          if (typeof SoundFx !== "undefined") SoundFx.playAlert();
        }
      });

      this.buttons.push({ btn, btnText, statusTag });
    });

    this.timerText = this.add.text(450, 420, "⏱️ Tiempo de presurización: 12s", {
      fontSize: "18px", fontStyle: "bold", color: "#f7e396", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 11,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.timerText.setText(`⏱️ Tiempo de presurización: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      }
    });
  }

  finish() {
    this.ended = true;
    this.timer.remove();

    const count = this.stagesDone.filter(Boolean).length;
    let tier = "fail";
    if (count === 3 && this.timeLeft >= 5) {
      tier = "excellent";
    } else if (count === 3) {
      tier = "good";
    } else if (count >= 2) {
      tier = "fair";
    } else {
      tier = "fail";
    }

    this.scene.stop("MinigameWaterFilter");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((count / 3) * 100),
        minigameName: "Purificación de Agua y Percloratos (Agua)"
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 6. NUEVO MINIJUEGO: REPARACIÓN DE FUGAS DE OXÍGENO EN EL HÁBITAT
// ============================================================================
class MinigameLeakRepair extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameLeakRepair" });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x161e2e);
    this.add.rectangle(450, 250, 880, 480, 0x1f2d42).setStrokeStyle(2, 0x38bdf8, 0.4);

    this.add.text(450, 34, "🫧 REPARACIÓN DE FUGAS: INTEGRIDAD DE CABINA", {
      fontSize: "21px", fontStyle: "bold", color: "#38bdf8", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.text(450, 64, "¡Haz CLIC sobre las 5 micro-roturas para sellarlas con espuma antes de que caiga la presión de oxígeno!", {
      fontSize: "14px", color: "#cbd5e1", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.sealed = 0;
    this.totalLeaks = 5;
    this.timeLeft = 10;
    this.ended = false;

    this.pressure = 100;
    this.pressureText = this.add.text(40, 95, "Presión interior: 101.3 kPa (100%)", {
      fontSize: "18px", fontStyle: "bold", color: "#4ade80", fontFamily: "'Segoe UI', sans-serif"
    });

    this.statusText = this.add.text(650, 95, "Fugas selladas: 0 / 5", {
      fontSize: "18px", fontStyle: "bold", color: "#f7e396", fontFamily: "'Segoe UI', sans-serif"
    });

    this.add.rectangle(450, 275, 700, 260, 0x1e293b).setStrokeStyle(3, 0x475569);

    for (let i = 0; i < this.totalLeaks; i++) {
      const x = Phaser.Math.Between(200, 700);
      const y = Phaser.Math.Between(175, 375);

      const leakCircle = this.add.circle(x, y, 22, 0x0284c7)
        .setStrokeStyle(3, 0x38bdf8)
        .setInteractive({ useHandCursor: true });

      const hissText = this.add.text(x, y - 28, "FUGA", {
        fontSize: "11px", fontStyle: "bold", color: "#38bdf8"
      }).setOrigin(0.5);

      leakCircle.on("pointerdown", () => {
        if (this.ended) return;
        leakCircle.destroy();
        hissText.destroy();
        this.sealed++;
        if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
        this.statusText.setText(`Fugas selladas: ${this.sealed} / ${this.totalLeaks}`);

        this.add.circle(x, y, 16, 0x22c55e).setStrokeStyle(2, 0xffffff);

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
        this.pressureText.setText(`Presión interior: ${(this.pressure * 1.013).toFixed(1)} kPa (${this.pressure}%)`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      }
    });
  }

  finish() {
    this.ended = true;
    this.timer.remove();

    let tier = "fail";
    if (this.sealed >= this.totalLeaks && this.timeLeft >= 4) {
      tier = "excellent";
    } else if (this.sealed >= this.totalLeaks || this.sealed >= 4) {
      tier = "good";
    } else if (this.sealed >= 3) {
      tier = "fair";
    } else {
      tier = "fail";
    }

    this.scene.stop("MinigameLeakRepair");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.sealed / this.totalLeaks) * 100),
        minigameName: "Sellado de Fugas del Hábitat (Oxígeno)"
      }, this.choiceData);
    }
  }
}


// ============================================================================
// 7. NUEVO MINIJUEGO: REPARACIÓN ELÉCTRICA Y CONEXIÓN DE CIRCUITOS
// ============================================================================
class MinigameCircuit extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameCircuit" });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x0f172a);
    this.add.rectangle(450, 250, 880, 480, 0x1e293b).setStrokeStyle(2, 0xfacc15, 0.4);

    this.add.text(450, 34, "REPARACION ELECTRICA: CONEXION DE CIRCUITOS", {
      fontSize: "21px", fontStyle: "bold", color: "#F7E396", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.text(450, 64, "Haz clic en los 4 relés de paso para ALINEAR EL FLUJO ELÉCTRICO desde los paneles a las baterías", {
      fontSize: "13px", color: "#cbd5e1", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    // Entrada de energía (izquierda) y Salida a baterías (derecha)
    this.add.rectangle(120, 250, 110, 70, 0x1e3a8a).setStrokeStyle(2, 0x38bdf8);
    this.add.text(120, 250, "PANELES\nENTRADA", {
      fontSize: "12px", fontStyle: "bold", color: "#38bdf8", align: "center", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.rectangle(780, 250, 110, 70, 0x14532d).setStrokeStyle(2, 0x4ade80);
    this.add.text(780, 250, "BATERIAS\nOUTPOST", {
      fontSize: "12px", fontStyle: "bold", color: "#4ade80", align: "center", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    // 4 Nodos relé centrales que el jugador rota
    this.relays = [
      { x: 260, y: 250, state: 1, target: 0 },
      { x: 390, y: 190, state: 2, target: 0 },
      { x: 520, y: 310, state: 3, target: 0 },
      { x: 650, y: 250, state: 1, target: 0 }
    ];

    this.relayObjects = [];
    this.timeLeft = 12;
    this.ended = false;

    // Cables guía entre nodos
    this.wireLine = this.add.graphics();
    this.drawWires(false);

    this.relays.forEach((r, idx) => {
      const box = this.add.rectangle(r.x, r.y, 76, 76, 0x1e293b)
        .setStrokeStyle(3, 0x64748b)
        .setInteractive({ useHandCursor: true });

      const indicator = this.add.rectangle(r.x, r.y, 48, 12, 0xfacc15);
      indicator.setAngle(r.state * 90);

      const label = this.add.text(r.x, r.y - 48, `Relé #${idx + 1}`, {
        fontSize: "11px", color: "#94a3b8", fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);

      box.on("pointerdown", () => {
        if (this.ended) return;
        r.state = (r.state + 1) % 4;
        indicator.setAngle(r.state * 90);
        if (typeof SoundFx !== "undefined") SoundFx.playClick();

        if (r.state === r.target) {
          box.setStrokeStyle(3, 0x22c55e);
          indicator.setFillStyle(0x4ade80);
        } else {
          box.setStrokeStyle(3, 0x64748b);
          indicator.setFillStyle(0xfacc15);
        }

        this.checkCircuitComplete();
      });

      this.relayObjects.push({ box, indicator });
    });

    this.timerText = this.add.text(450, 420, "⏱️ Tiempo de diagnóstico: 12s", {
      fontSize: "18px", fontStyle: "bold", color: "#f7e396", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 11,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.timerText.setText(`⏱️ Tiempo de diagnóstico: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      }
    });
  }

  drawWires(isPowered) {
    this.wireLine.clear();
    this.wireLine.lineStyle(4, isPowered ? 0xfacc15 : 0x334155);

    this.wireLine.beginPath();
    this.wireLine.moveTo(175, 250);
    this.wireLine.lineTo(260, 250);
    this.wireLine.lineTo(390, 190);
    this.wireLine.lineTo(520, 310);
    this.wireLine.lineTo(650, 250);
    this.wireLine.lineTo(725, 250);
    this.wireLine.strokePath();
  }

  checkCircuitComplete() {
    const isComplete = this.relays.every(r => r.state === r.target);
    if (isComplete && !this.ended) {
      this.drawWires(true);
      if (typeof SoundFx !== "undefined") SoundFx.playSuccess();
      this.time.delayedCall(450, () => this.finish());
    }
  }

  finish() {
    this.ended = true;
    this.timer.remove();

    const alignedCount = this.relays.filter(r => r.state === r.target).length;

    let tier = "fail";
    if (alignedCount === 4 && this.timeLeft >= 5) {
      tier = "excellent";
    } else if (alignedCount === 4) {
      tier = "good";
    } else if (alignedCount >= 2) {
      tier = "fair";
    } else {
      tier = "fail";
    }

    this.scene.stop("MinigameCircuit");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((alignedCount / 4) * 100),
        minigameName: "Conexión de Circuitos (Energía)"
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 8. NUEVO MINIJUEGO: CONDUCCIÓN Y EXPLORACIÓN DEL ROVER ROVI
// ============================================================================
class MinigameRoverDrive extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameRoverDrive" });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x1f1424);
    this.add.rectangle(450, 250, 880, 480, 0x2b1b30).setStrokeStyle(2, 0xfacc15, 0.4);

    this.add.text(450, 34, "EXPLORACION Y CONDUCCION CON EL ROVER ROVI", {
      fontSize: "21px", fontStyle: "bold", color: "#F7E396", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.text(450, 64, "Conduce a ROVI con FLECHAS o WASD para desplegar 4 SENSORES CIENTÍFICOS evitando cráteres", {
      fontSize: "13px", color: "#cbd5e1", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.sensorsCollected = 0;
    this.targetSensors = 4;
    this.timeLeft = 14;
    this.ended = false;

    // Obstáculos (cráteres y rocas)
    this.obstacles = [];
    const obsPos = [
      { x: 300, y: 190, r: 28 },
      { x: 600, y: 220, r: 32 },
      { x: 420, y: 340, r: 26 },
      { x: 700, y: 360, r: 30 }
    ];

    obsPos.forEach(p => {
      const crat = this.add.circle(p.x, p.y, p.r, 0x170f1a).setStrokeStyle(3, 0x8a3822);
      this.add.text(p.x, p.y, "[X]", { fontSize: "16px" }).setOrigin(0.5);
      this.obstacles.push(crat);
    });

    // 4 Balizas / Sensores científicos a recoger
    this.beacons = [];
    const beaconCoords = [
      { x: 220, y: 150 },
      { x: 740, y: 160 },
      { x: 320, y: 390 },
      { x: 760, y: 380 }
    ];

    beaconCoords.forEach((b, idx) => {
      const beacon = this.add.circle(b.x, b.y, 16, 0x38bdf8).setStrokeStyle(2, 0xffffff);
      const icon = this.add.text(b.x, b.y, "[RAD]", { fontSize: "14px" }).setOrigin(0.5);
      beacon.icon = icon;
      this.beacons.push(beacon);
    });

    // Rover ROVI controlado por el jugador
    this.rover = this.add.rectangle(450, 250, 36, 24, 0xfacc15).setStrokeStyle(2, 0x0f172a);
    this.roverSensor = this.add.circle(450 + 12, 250, 5, 0x0284c7);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    this.scoreText = this.add.text(40, 95, "Balizas cientificas desplegadas: 0 / 4", {
      fontSize: "18px", fontStyle: "bold", color: "#38bdf8", fontFamily: "'Segoe UI', sans-serif"
    });

    this.timerText = this.add.text(680, 95, "⏱️ Tiempo: 14s", {
      fontSize: "18px", fontStyle: "bold", color: "#f7e396", fontFamily: "'Segoe UI', sans-serif"
    });

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 13,
      callback: () => {
        if (this.ended) return;
        this.timeLeft--;
        this.timerText.setText(`⏱️ Tiempo: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finish();
        }
      }
    });
  }

  update(time, delta) {
    if (this.ended) return;

    let moveX = 0;
    let moveY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) moveX -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) moveX += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) moveY -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) moveY += 1;

    if (moveX !== 0 || moveY !== 0) {
      // Normalizar vector de movimiento diagonal para velocidad constante
      const len = Math.hypot(moveX, moveY);
      moveX /= len;
      moveY /= len;

      const speed = 0.22 * delta;
      this.rover.x += moveX * speed;
      this.rover.y += moveY * speed;

      const angle = Math.atan2(moveY, moveX);
      this.rover.rotation = angle;
      this.roverSensor.x = this.rover.x + Math.cos(angle) * 12;
      this.roverSensor.y = this.rover.y + Math.sin(angle) * 12;
    }

    this.rover.x = Phaser.Math.Clamp(this.rover.x, 80, 820);
    this.rover.y = Phaser.Math.Clamp(this.rover.y, 110, 450);

    // Detección de balizas científicas
    for (let i = this.beacons.length - 1; i >= 0; i--) {
      const b = this.beacons[i];
      if (Phaser.Math.Distance.Between(this.rover.x, this.rover.y, b.x, b.y) < 28) {
        this.sensorsCollected++;
        if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
        this.scoreText.setText(`Balizas cientificas desplegadas: ${this.sensorsCollected} / ${this.targetSensors}`);

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
    this.timer.remove();

    let tier = "fail";
    if (this.sensorsCollected >= this.targetSensors && this.timeLeft >= 5) {
      tier = "excellent";
    } else if (this.sensorsCollected >= this.targetSensors) {
      tier = "good";
    } else if (this.sensorsCollected >= 2) {
      tier = "fair";
    } else {
      tier = "fail";
    }

    this.scene.stop("MinigameRoverDrive");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.sensorsCollected / this.targetSensors) * 100),
        minigameName: "Exploración con Rover ROVI (Ciencia)"
      }, this.choiceData);
    }
  }
}


// ============================================================================
// 9. MINIJUEGO: ESPECTROMETRÍA LÁSER DE MUESTRAS MARCIANAS (NASA PIXL)
// ============================================================================
class MinigameSpectro extends Phaser.Scene {
  constructor() {
    super("MinigameSpectro");
  }

  init(data) {
    this.choiceData = data.choice || {};
    this.samplesScanned = 0;
    this.targetSamples = 4;
    this.timeLeft = 16;
    this.ended = false;
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x090d16);
    this.add.rectangle(450, 250, 880, 480, 0x111827).setStrokeStyle(2, 0x38bdf8, 0.4);

    this.add.text(450, 32, "ESPECTROMETRO LASER PIXL: ANALISIS DE MUESTRAS MARCIANAS", {
      fontSize: "20px", fontStyle: "bold", color: "#F7E396", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.text(450, 62, "Haz clic en cada muestra para disparar el laser PIXL y analizar su composicion quimica.", {
      fontSize: "13px", color: "#94a3b8", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.timerText = this.add.text(40, 90, "Tiempo restante: 16.0s", {
      fontSize: "15px", color: "#f7e396", fontFamily: "'Segoe UI', sans-serif"
    });

    this.scoreText = this.add.text(40, 115, "Muestras analizadas: 0 / 4", {
      fontSize: "15px", fontStyle: "bold", color: "#38bdf8", fontFamily: "'Segoe UI', sans-serif"
    });

    const samplesData = [
      { name: "Basalto Volcanico", sub: "Silicio + Hierro (Regolito)", color: 0x475569, x: 160 },
      { name: "Esferas Hematita", sub: "Evidencia de Agua Pasada", color: 0x991b1b, x: 350 },
      { name: "Arcilla Lacustre", sub: "Sedimentos de Antiguo Lago", color: 0xb45309, x: 540 },
      { name: "Sulfatos Hidratados", sub: "Reserva de H2O Atrapada", color: 0x0284c7, x: 730 }
    ];

    this.samples = [];

    samplesData.forEach((sd, idx) => {
      const container = this.add.container(sd.x, 280);

      this.add.circle(sd.x, 280, 62, 0x1e293b).setStrokeStyle(3, 0x334155);

      const rock = this.add.polygon(sd.x, 280, [-35, -15, 0, -42, 38, -12, 30, 35, -25, 30], sd.color)
        .setInteractive({ useHandCursor: true });

      const nameLabel = this.add.text(sd.x, 355, sd.name, {
        fontSize: "13px", fontStyle: "bold", color: "#ffffff", align: "center", fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);

      const statusTag = this.add.text(sd.x, 375, "[PENDIENTE]", {
        fontSize: "11px", color: "#94a3b8", fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);

      const specBox = this.add.rectangle(sd.x, 190, 130, 48, 0x0f172a).setStrokeStyle(1, 0x334155);
      const specText = this.add.text(sd.x, 190, sd.sub, {
        fontSize: "10px", color: "#cbd5e1", align: "center", wordWrap: { width: 120 }, fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);
      specBox.setVisible(false);
      specText.setVisible(false);

      const sampleObj = {
        idx,
        rock,
        statusTag,
        specBox,
        specText,
        x: sd.x,
        y: 280,
        scanned: false
      };

      rock.on("pointerdown", () => {
        if (sampleObj.scanned || this.ended) return;
        this.scanSample(sampleObj);
      });

      this.samples.push(sampleObj);
    });

    this.laserBeam = this.add.line(0, 0, 0, 0, 0, 0, 0x38bdf8, 3).setOrigin(0);
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
    if (typeof SoundFx !== "undefined") SoundFx.playClick();

    const startX = 450;
    const startY = 80;
    const targetX = sample.x;
    const targetY = sample.y;

    this.laserBeam.setTo(startX, startY, targetX, targetY);
    this.laserBeam.setVisible(true);

    this.time.delayedCall(400, () => {
      this.laserBeam.setVisible(false);
      sample.rock.setFillStyle(0xfacc15);
      sample.statusTag.setText("[ANALIZADO - OK]");
      sample.statusTag.setColor("#4ade80");
      sample.specBox.setVisible(true);
      sample.specText.setVisible(true);

      this.samplesScanned++;
      if (typeof SoundFx !== "undefined") SoundFx.playResourceGain();
      this.scoreText.setText(`Muestras analizadas: ${this.samplesScanned} / ${this.targetSamples}`);

      if (this.samplesScanned >= this.targetSamples) {
        this.finish();
      }
    });
  }

  finish() {
    this.ended = true;
    this.timer.remove();

    let tier = "fail";
    if (this.samplesScanned >= this.targetSamples && this.timeLeft >= 5) {
      tier = "excellent";
    } else if (this.samplesScanned >= this.targetSamples) {
      tier = "good";
    } else if (this.samplesScanned >= 2) {
      tier = "fair";
    }

    this.scene.stop("MinigameSpectro");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.samplesScanned / this.targetSamples) * 100),
        minigameName: "Espectrometria Laser PIXL (Muestras)"
      }, this.choiceData);
    }
  }
}

// ============================================================================
// 10. MINIJUEGO: DEFENSA ANTE MEGATORMENTA MARCIANA (PROTOCOLO DE EMERGENCIA)
// ============================================================================
class MinigameDustDefense extends Phaser.Scene {
  constructor() {
    super("MinigameDustDefense");
  }

  init(data) {
    this.choiceData = data.choice || {};
    this.securedCount = 0;
    this.totalSystems = 4;
    this.timeLeft = 15;
    this.ended = false;
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x180b08);
    this.add.rectangle(450, 250, 880, 480, 0x27140e).setStrokeStyle(2, 0xf97316, 0.5);

    this.add.text(450, 32, "ALERTA DE TORMENTA: PROTOCOLO DE ASEGURAMIENTO DE BASE", {
      fontSize: "20px", fontStyle: "bold", color: "#F7E396", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.text(450, 62, "Vientos de 110 km/h acercandose. Asegura los 4 sistemas criticos antes del impacto.", {
      fontSize: "13px", color: "#fdba74", fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.timerText = this.add.text(40, 90, "Tiempo hasta impacto: 15.0s", {
      fontSize: "16px", fontStyle: "bold", color: "#fb7185", fontFamily: "'Segoe UI', sans-serif"
    });

    this.scoreText = this.add.text(40, 115, "Sistemas asegurados: 0 / 4", {
      fontSize: "15px", fontStyle: "bold", color: "#38bdf8", fontFamily: "'Segoe UI', sans-serif"
    });

    const systems = [
      { id: "solar", title: "PANELES SOLARES", task: "Inclinar a 85 deg contra el polvo", x: 250, y: 220 },
      { id: "mast", title: "ANTENA CAPCOM", task: "Plegar mastil de alta ganancia", x: 650, y: 220 },
      { id: "airlock", title: "ESCLUSA OUTPOST", task: "Bloquear triple sello de presion", x: 250, y: 370 },
      { id: "rover", title: "ROVER ROVI", task: "Anclar al hangar electromagnetico", x: 650, y: 370 }
    ];

    this.systemCards = [];

    systems.forEach((sys) => {
      const cardBg = this.add.rectangle(sys.x, sys.y, 380, 110, 0x1f1412)
        .setStrokeStyle(2, 0x7c2d12);

      this.add.text(sys.x - 170, sys.y - 38, sys.title, {
        fontSize: "14px", fontStyle: "bold", color: "#ffffff", fontFamily: "'Segoe UI', sans-serif"
      });

      this.add.text(sys.x - 170, sys.y - 14, sys.task, {
        fontSize: "12px", color: "#94a3b8", fontFamily: "'Segoe UI', sans-serif"
      });

      const statusTag = this.add.text(sys.x - 170, sys.y + 16, "ESTADO: [EXPUESTO]", {
        fontSize: "12px", fontStyle: "bold", color: "#fb7185", fontFamily: "'Segoe UI', sans-serif"
      });

      const btn = this.add.rectangle(sys.x + 105, sys.y, 110, 44, 0xef4444)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0xffffff);

      const btnText = this.add.text(sys.x + 105, sys.y, "ASEGURAR", {
        fontSize: "12px", fontStyle: "bold", color: "#ffffff", fontFamily: "'Segoe UI', sans-serif"
      }).setOrigin(0.5);

      const item = {
        sys,
        btn,
        btnText,
        cardBg,
        statusTag,
        secured: false
      };

      btn.on("pointerdown", () => {
        if (item.secured || this.ended) return;
        this.secureSystem(item);
      });

      this.systemCards.push(item);
    });

    this.dustParticles = [];
    for (let i = 0; i < 40; i++) {
      const p = this.add.circle(Phaser.Math.Between(0, 900), Phaser.Math.Between(100, 480), Phaser.Math.Between(1, 3), 0xca8a04, 0.4);
      p.speed = Phaser.Math.Between(180, 450);
      this.dustParticles.push(p);
    }

    this.timer = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.ended) return;
        this.timeLeft -= 0.1;
        this.timerText.setText(`Tiempo hasta impacto: ${Math.max(0, this.timeLeft).toFixed(1)}s`);
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
    this.dustParticles.forEach(p => {
      p.x -= p.speed * dt;
      if (p.x < -10) {
        p.x = 910;
        p.y = Phaser.Math.Between(100, 480);
      }
    });
  }

  secureSystem(item) {
    item.secured = true;
    item.btn.setFillStyle(0x22c55e);
    item.btnText.setText("[OK]");
    item.statusTag.setText("ESTADO: [ASEGURADO]");
    item.statusTag.setColor("#4ade80");
    item.cardBg.setStrokeStyle(2, 0x22c55e);

    this.securedCount++;
    if (typeof SoundFx !== "undefined") SoundFx.playSuccess();
    this.scoreText.setText(`Sistemas asegurados: ${this.securedCount} / ${this.totalSystems}`);

    if (this.securedCount >= this.totalSystems) {
      this.finish();
    }
  }

  finish() {
    this.ended = true;
    this.timer.remove();

    let tier = "fail";
    if (this.securedCount >= this.totalSystems && this.timeLeft >= 4) {
      tier = "excellent";
    } else if (this.securedCount >= this.totalSystems) {
      tier = "good";
    } else if (this.securedCount >= 2) {
      tier = "fair";
    }

    this.scene.stop("MinigameDustDefense");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: Math.round((this.securedCount / this.totalSystems) * 100),
        minigameName: "Defensa ante Megatormenta Marciana"
      }, this.choiceData);
    }
  }
}
