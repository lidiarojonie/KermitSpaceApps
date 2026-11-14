// js/minigameMoxie.js — Minijuego 1: Control térmico del reactor MOXIE (NASA)
// Producción de oxígeno a partir del CO2 atmosférico marciano a 800 °C

class MinigameMoxie extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameMoxie" });
  }

  init(data) {
    this.choiceData = data.choice || {};
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // Fondo completo de ingeniería espacial
    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x070b14);

    // Chasis 3D biselado con efecto de profundidad y cristal
    this.add.rectangle(cx + 4, cy + 4, Math.min(880, this.scale.width - 40), 470, 0x000000, 0.6); // Sombra paralela
    const mainFrame = this.add.rectangle(cx, cy, Math.min(880, this.scale.width - 40), 470, 0x0f172a)
      .setStrokeStyle(3, 0x38bdf8, 0.7);
    this.add.rectangle(cx, cy - 232, Math.min(874, this.scale.width - 46), 2, 0x93c5fd, 0.5); // Reflejo especular superior

    // Cabecera e instrucciones para el astronauta junior
    this.add.text(cx, cy - 195, "FÁBRICA DE OXÍGENO MOXIE", {
      fontSize: "24px",
      fontStyle: "bold",
      color: "#ffd000",
      fontFamily: "'Fredoka', 'Nunito', sans-serif"
    }).setOrigin(0.5);

    this.add.text(cx, cy - 165, "Mantén pulsado ESPACIO o haz CLIC para mantener la aguja en la ZONA VERDE", {
      fontSize: "14px",
      color: "#cbd5e1",
      fontFamily: "'Fredoka', sans-serif"
    }).setOrigin(0.5);

    // Termómetro vertical con bisel 3D
    const thermoX = cx - 190;
    const thermoY = cy + 15;
    this.add.rectangle(thermoX + 3, thermoY + 3, 58, 284, 0x000000, 0.5); // Sombra
    this.add.rectangle(thermoX, thermoY, 54, 280, 0x0b0f19).setStrokeStyle(3, 0x475569);

    // Zona Verde objetivo (760°C - 840°C)
    this.add.rectangle(thermoX, thermoY - 20, 48, 80, 0x22c55e, 0.35).setStrokeStyle(2, 0x4ade80);

    // Marcas térmicas
    this.add.text(thermoX - 45, thermoY - 135, "1000 C\nCRITICO", { fontSize: "11px", color: "#fb7185", align: "right" });
    this.add.text(thermoX - 45, thermoY - 30, "800 C\nOPTIMO", { fontSize: "12px", fontStyle: "bold", color: "#4ade80", align: "right" });
    this.add.text(thermoX - 45, thermoY + 105, "200 C\nFRIO", { fontSize: "11px", color: "#94a3b8", align: "right" });

    // Aguja indicadora
    this.needleBaseY = thermoY + 105;
    this.needleMinY = thermoY - 130;
    this.needleMaxY = thermoY + 115;
    this.needleY = this.needleBaseY;
    this.needle = this.add.rectangle(thermoX, this.needleY, 70, 14, 0xf7e396).setStrokeStyle(2, 0x0f172a);

    // Panel derecho con lecturas digitales (Glassmorphism espacial)
    const panelX = cx + 150;
    const panelY = cy - 20;
    this.add.rectangle(panelX + 4, panelY + 4, 460, 230, 0x000000, 0.5); // Sombra
    this.add.rectangle(panelX, panelY, 460, 230, 0x1e293b, 0.85).setStrokeStyle(2, 0x334155);

    this.tempDisplay = this.add.text(panelX - 200, panelY - 85, "Temperatura: 200 C", {
      fontSize: "18px",
      fontStyle: "bold",
      color: "#f8fafc",
      fontFamily: "'Fredoka', sans-serif"
    });

    this.progressText = this.add.text(panelX - 200, panelY - 40, "Tanque de Oxígeno: 0%", {
      fontSize: "20px",
      fontStyle: "bold",
      color: "#38bdf8",
      fontFamily: "'Fredoka', sans-serif"
    });

    // Barra de progreso visual del tanque de oxígeno
    this.add.rectangle(panelX, panelY, 380, 20, 0x0f172a).setStrokeStyle(1.5, 0x475569);
    this.tankBar = this.add.rectangle(panelX - 190, panelY, 0, 18, 0x38bdf8).setOrigin(0, 0.5);

    this.timerText = this.add.text(panelX - 200, panelY + 30, "Tiempo restante: 12.0s", {
      fontSize: "18px",
      fontStyle: "bold",
      color: "#ffd000",
      fontFamily: "'Fredoka', sans-serif"
    });

    // Botón de control interactivo para ratón / pantalla táctil con volumen 3D
    const btnX = panelX;
    const btnY = cy + 140;
    this.add.rectangle(btnX + 3, btnY + 4, 320, 60, 0x000000, 0.5); // Sombra
    this.heatBtn = this.add.rectangle(btnX, btnY, 320, 60, 0x38bdf8)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0xffffff);

    this.btnText = this.add.text(btnX, btnY, "¡CALENTAR REACTOR (800 C)!", {
      fontSize: "16px",
      fontStyle: "bold",
      color: "#0f172a",
      fontFamily: "'Fredoka', sans-serif"
    }).setOrigin(0.5);

    this.heatBtn.on("pointerdown", () => {
      this.isHeating = true;
      this.heatBtn.setFillStyle(0xfbbf24);
      if (typeof SoundFx !== "undefined") SoundFx.playClick();
    });

    this.heatBtn.on("pointerup", () => {
      this.isHeating = false;
      this.heatBtn.setFillStyle(0x38bdf8);
    });

    this.heatBtn.on("pointerout", () => {
      this.isHeating = false;
      this.heatBtn.setFillStyle(0x38bdf8);
    });

    this.isHeating = false;
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Partículas de síntesis de O2 (destellos de oxígeno al reaccionar)
    this.o2Sparks = [];
    for (let s = 0; s < 18; s++) {
      const spark = this.add.circle(panelX, panelY, Phaser.Math.Between(2, 4), 0x38bdf8, 0);
      this.o2Sparks.push(spark);
    }

    // Estado del juego
    this.progress = 0;
    this.timeLeft = 12.0;
    this.ended = false;
    this.lastShakeTime = 0;
  }

  update(time, delta) {
    if (this.ended) return;

    this.timeLeft -= delta / 1000;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.evaluateEnd();
      return;
    }
    this.timerText.setText(`Tiempo restante: ${this.timeLeft.toFixed(1)}s`);

    const heatingNow = this.isHeating || this.spaceKey.isDown;

    if (heatingNow) {
      this.needleY -= 0.22 * delta;
    } else {
      this.needleY += 0.16 * delta;
    }

    this.needleY = Phaser.Math.Clamp(this.needleY, this.needleMinY, this.needleMaxY);
    this.needle.y = this.needleY;

    // Calcular temperatura aproximada para el display
    const currentTemp = Math.round(1000 - ((this.needleY - this.needleMinY) / (this.needleMaxY - this.needleMinY)) * 800);
    this.tempDisplay.setText(`Temperatura: ${currentTemp} C`);

    // Zona verde óptima (800 C)
    const optimalZoneCenter = (this.needleMinY + this.needleMaxY) / 2;
    if (Math.abs(this.needleY - optimalZoneCenter) < 42) {
      this.needle.setFillStyle(0x4ade80);
      this.tempDisplay.setColor("#4ade80");
      this.progress += 0.024 * delta;

      const pct = Math.min(100, Math.floor(this.progress));
      this.progressText.setText(`Tanque de O2: ${pct}%`);
      this.tankBar.width = (pct / 100) * 380;

      // Destellos de partículas de oxígeno activo
      const sp = this.o2Sparks[Phaser.Math.Between(0, this.o2Sparks.length - 1)];
      if (sp && sp.alpha <= 0.1) {
        sp.x = this.tankBar.x + this.tankBar.width;
        sp.y = this.tankBar.y + Phaser.Math.Between(-8, 8);
        sp.alpha = 0.9;
        this.tweens.add({
          targets: sp,
          y: sp.y - 20,
          alpha: 0,
          duration: 400
        });
      }

      if (this.progress >= 100) {
        this.evaluateEnd();
      }
    } else {
      this.needle.setFillStyle(0xf7e396);
      this.tempDisplay.setColor("#f8fafc");

      // Sacudida de cámara si entra en zona crítica (> 950 C)
      if (currentTemp > 950 && time - this.lastShakeTime > 600) {
        this.lastShakeTime = time;
        this.cameras.main.shake(120, 0.005);
        if (typeof SoundFx !== "undefined") SoundFx.playAlert();
      }
    }
  }

  evaluateEnd() {
    this.ended = true;

    let tier = "fail";
    let score = Math.min(100, Math.floor(this.progress));

    if (this.progress >= 100) {
      tier = this.timeLeft >= 4.0 ? "excellent" : "good";
    } else if (this.progress >= 55) {
      tier = "fair";
    }

    this.scene.stop("MinigameMoxie");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: score,
        minigameName: "Reactor MOXIE (Oxigeno)"
      }, this.choiceData);
    }
  }
}
