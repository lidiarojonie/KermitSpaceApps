// js/minigamesPack.js — Pack con los 4 minijuegos adicionales de la misión

// ============================================================================
// MINIJUEGO 2: ARCADIA ICE DRILL (Recoger 5 bloques de hielo esquivando rocas)
// ============================================================================
class MinigameDrill extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameDrill" });
  }

  init(data) {
    this.choiceData = data.choice;
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x241722);
    this.add.text(450, 35, "🧊 PERFORACIÓN GLACIAR: ARCADIA PLANITIA", {
      fontSize: "21px", fontStyle: "bold", color: "#38bdf8"
    }).setOrigin(0.5);
    this.add.text(450, 65, "Mueve el ratón (o flechas) para recoger 5 HIELOS AZULES y esquivar las ROCAS ROJAS", {
      fontSize: "14px", color: "#cbd5e1"
    }).setOrigin(0.5);

    this.iceCollected = 0;
    this.hits = 0;
    this.ended = false;

    this.scoreText = this.add.text(40, 100, "💧 Hielo: 0 / 5", { fontSize: "20px", fontStyle: "bold", color: "#38bdf8" });
    this.livesText = this.add.text(40, 135, "🛠️ Integridad Broca: 3 / 3", { fontSize: "18px", color: "#f7e396" });

    // Broca controlada por el jugador
    this.drill = this.add.triangle(450, 130, 0, 0, 36, 0, 18, 42, 0xf7e396).setStrokeStyle(2, 0x161b28);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.items = [];

    // Generador de bloques de hielo y rocas que suben desde el fondo
    this.spawner = this.time.addEvent({
      delay: 650,
      loop: true,
      callback: () => {
        const x = Phaser.Math.Between(180, 780);
        const isIce = Math.random() > 0.42;
        const item = this.add.rectangle(x, 520, 34, 34, isIce ? 0x38bdf8 : 0xd96b43)
          .setStrokeStyle(2, 0xffffff);
        item.isIce = isIce;
        this.items.push(item);
      }
    });
  }

  update(time, delta) {
    if (this.ended) return;

    // Control con ratón o cursores
    if (this.input.activePointer.x > 150 && this.input.activePointer.x < 820) {
      this.drill.x = Phaser.Math.Linear(this.drill.x, this.input.activePointer.x, 0.2);
    }
    if (this.cursors.left.isDown) this.drill.x -= 0.4 * delta;
    if (this.cursors.right.isDown) this.drill.x += 0.4 * delta;
    this.drill.x = Phaser.Math.Clamp(this.drill.x, 160, 800);

    // Mover objetos hacia arriba (simulando que la broca baja)
    for (let i = this.items.length - 1; i >= 0; i--) {
      const obj = this.items[i];
      obj.y -= 0.22 * delta;

      // Colisión simple por distancia
      if (Phaser.Math.Distance.Between(this.drill.x, this.drill.y, obj.x, obj.y) < 34) {
        if (obj.isIce) {
          this.iceCollected++;
          this.scoreText.setText(`💧 Hielo: ${this.iceCollected} / 5`);
          if (this.iceCollected >= 5) {
            this.finish(true);
            return;
          }
        } else {
          this.hits++;
          this.livesText.setText(`🛠️ Integridad Broca: ${3 - this.hits} / 3`);
          if (this.hits >= 3) {
            this.finish(false);
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

  finish(success) {
    this.ended = true;
    this.spawner.remove();
    this.scene.stop("MinigameDrill");
    this.scene.resume("MainScene");
    window.onMinigameComplete(success, this.choiceData);
  }
}

// ============================================================================
// MINIJUEGO 3: SOLAR & CIRCUIT PATCH (Limpiar polvo marciano de los paneles)
// ============================================================================
class MinigameSolar extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameSolar" });
  }

  init(data) {
    this.choiceData = data.choice;
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x161b28);
    this.add.text(450, 40, "☀️ MANTENIMIENTO SOLAR: LIMPIEZA DE POLVO", {
      fontSize: "21px", fontStyle: "bold", color: "#F7E396"
    }).setOrigin(0.5);
    this.add.text(450, 72, "¡Haz CLIC RÁPIDO sobre las 8 acumulaciones de polvo rojizo antes de que acabe el tiempo!", {
      fontSize: "15px", color: "#cbd5e1"
    }).setOrigin(0.5);

    // Panel solar de fondo
    this.add.rectangle(450, 275, 560, 290, 0x1e3a8a).setStrokeStyle(4, 0x38bdf8);

    this.cleaned = 0;
    this.totalSpots = 8;
    this.timeLeft = 10;

    this.statusText = this.add.text(450, 455, "Polvo limpiado: 0 / 8  |  ⏱️ Tiempo: 10s", {
      fontSize: "19px", fontStyle: "bold", color: "#4ade80"
    }).setOrigin(0.5);

    // Crear 8 manchas de polvo marciano interactivas
    for (let i = 0; i < this.totalSpots; i++) {
      const x = Phaser.Math.Between(220, 680);
      const y = Phaser.Math.Between(165, 385);
      const dust = this.add.circle(x, y, 34, 0xd96b43, 0.95)
        .setStrokeStyle(2, 0xf7e396)
        .setInteractive({ useHandCursor: true });

      dust.on("pointerdown", () => {
        dust.destroy();
        this.cleaned++;
        this.statusText.setText(`Polvo limpiado: ${this.cleaned} / 8  |  ⏱️ Tiempo: ${this.timeLeft}s`);
        if (this.cleaned >= this.totalSpots) {
          this.finish(true);
        }
      });
    }

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        this.timeLeft--;
        this.statusText.setText(`Polvo limpiado: ${this.cleaned} / 8  |  ⏱️ Tiempo: ${this.timeLeft}s`);
        if (this.timeLeft <= 0 && this.cleaned < this.totalSpots) {
          this.finish(false);
        }
      }
    });
  }

  finish(success) {
    this.timer.remove();
    this.scene.stop("MinigameSolar");
    this.scene.resume("MainScene");
    window.onMinigameComplete(success, this.choiceData);
  }
}

// ============================================================================
// MINIJUEGO 4: BIO-DOME HYDROPONICS (Nutrir las 3 bandejas de microgreens)
// ============================================================================
class MinigameBiodome extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameBiodome" });
  }

  init(data) {
    this.choiceData = data.choice;
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x132226);
    this.add.text(450, 40, "🌱 BIODOMO OSDR: CULTIVO HIDROPÓNICO", {
      fontSize: "21px", fontStyle: "bold", color: "#4ade80"
    }).setOrigin(0.5);
    this.add.text(450, 72, "Haz clic en el botón de cada bandeja para mantener su vitalidad por encima del 20% durante 10 segundos", {
      fontSize: "14px", color: "#cbd5e1"
    }).setOrigin(0.5);

    this.plants = [80, 75, 85];
    this.bars = [];
    this.timeLeft = 10;
    this.ended = false;

    const positions = [230, 450, 670];
    positions.forEach((x, idx) => {
      this.add.rectangle(x, 260, 170, 210, 0x1e293b).setStrokeStyle(2, 0x4ade80);
      this.add.text(x, 185, `Bandeja #${idx + 1}`, { fontSize: "16px", fontStyle: "bold", color: "#f8fafc" }).setOrigin(0.5);

      const bar = this.add.text(x, 235, "Vitalidad: 80%", { fontSize: "16px", color: "#4ade80" }).setOrigin(0.5);
      this.bars.push(bar);

      const btn = this.add.rectangle(x, 315, 140, 44, 0x38bdf8).setInteractive({ useHandCursor: true });
      this.add.text(x, 315, "💧 NUTRIR + LUZ", { fontSize: "13px", fontStyle: "bold", color: "#161b28" }).setOrigin(0.5);

      btn.on("pointerdown", () => {
        this.plants[idx] = Math.min(100, this.plants[idx] + 28);
      });
    });

    this.timerText = this.add.text(450, 435, "⏱️ Tiempo de cosecha: 10s", {
      fontSize: "20px", fontStyle: "bold", color: "#f7e396"
    }).setOrigin(0.5);

    this.timer = this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`⏱️ Tiempo de cosecha: ${this.timeLeft}s`);
        if (this.timeLeft <= 0 && !this.ended) {
          this.finish(true);
        }
      }
    });
  }

  update(time, delta) {
    if (this.ended) return;

    for (let i = 0; i < 3; i++) {
      // Cada planta pierde vitalidad a distinto ritmo
      this.plants[i] -= (0.014 + i * 0.003) * delta;
      this.bars[i].setText(`Vitalidad: ${Math.max(0, Math.floor(this.plants[i]))}%`);

      if (this.plants[i] <= 0) {
        this.finish(false);
        return;
      }
    }
  }

  finish(success) {
    this.ended = true;
    this.timer.remove();
    this.scene.stop("MinigameBiodome");
    this.scene.resume("MainScene");
    window.onMinigameComplete(success, this.choiceData);
  }
}

// ============================================================================
// MINIJUEGO 5: DONKI SHIELD DEFENSE (Bloquear radiación solar con el escudo)
// ============================================================================
class MinigameShield extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameShield" });
  }

  init(data) {
    this.choiceData = data.choice;
  }

  create() {
    this.add.rectangle(450, 250, 900, 500, 0x191224);
    this.add.text(450, 35, "🛡️ ALERTA SOLAR DONKI: ESCUDO DEFLECTOR", {
      fontSize: "21px", fontStyle: "bold", color: "#fb7185"
    }).setOrigin(0.5);
    this.add.text(450, 65, "Mueve el ratón para interceptar 6 PARTÍCULAS SOLARES antes de que golpeen el hábitat", {
      fontSize: "14px", color: "#cbd5e1"
    }).setOrigin(0.5);

    // Techo del hábitat abajo
    this.add.rectangle(450, 475, 900, 50, 0x334155);

    // Escudo magnético controlado por el jugador
    this.paddle = this.add.rectangle(450, 415, 130, 18, 0x38bdf8).setStrokeStyle(2, 0xf8fafc);

    this.blocked = 0;
    this.missed = 0;
    this.ended = false;
    this.rays = [];

    this.scoreText = this.add.text(40, 100, "🛡️ Bloqueadas: 0 / 6", { fontSize: "19px", fontStyle: "bold", color: "#38bdf8" });
    this.damageText = this.add.text(40, 132, "⚠️ Impactos en base: 0 / 3", { fontSize: "18px", color: "#fb7185" });

    this.spawner = this.time.addEvent({
      delay: 750,
      loop: true,
      callback: () => {
        const x = Phaser.Math.Between(160, 760);
        const ray = this.add.circle(x, 95, 14, 0xfacc15).setStrokeStyle(3, 0xfb7185);
        this.rays.push(ray);
      }
    });
  }

  update(time, delta) {
    if (this.ended) return;

    if (this.input.activePointer.x > 100 && this.input.activePointer.x < 800) {
      this.paddle.x = this.input.activePointer.x;
    }

    for (let i = this.rays.length - 1; i >= 0; i--) {
      const r = this.rays[i];
      r.y += 0.25 * delta;

      // Comprobar rebote en el escudo
      if (Math.abs(r.y - this.paddle.y) < 18 && Math.abs(r.x - this.paddle.x) < 72) {
        this.blocked++;
        this.scoreText.setText(`🛡️ Bloqueadas: ${this.blocked} / 6`);
        r.destroy();
        this.rays.splice(i, 1);
        if (this.blocked >= 6) {
          this.finish(true);
          return;
        }
      } else if (r.y > 455) {
        this.missed++;
        this.damageText.setText(`⚠️ Impactos en base: ${this.missed} / 3`);
        r.destroy();
        this.rays.splice(i, 1);
        if (this.missed >= 3) {
          this.finish(false);
          return;
        }
      }
    }
  }

  finish(success) {
    this.ended = true;
    this.spawner.remove();
    this.scene.stop("MinigameShield");
    this.scene.resume("MainScene");
    window.onMinigameComplete(success, this.choiceData);
  }
}