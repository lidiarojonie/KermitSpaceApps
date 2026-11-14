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
    // Fondo de la consola de ingeniería del hábitat
    this.add.rectangle(450, 250, 900, 500, 0x0f172a);
    this.add.rectangle(450, 250, 880, 480, 0x161e31).setStrokeStyle(2, 0x38bdf8, 0.4);

    // Cabecera e instrucciones para el astronauta junior
    this.add.text(450, 36, "REACTOR MOXIE: SINTESIS DE OXIGENO", {
      fontSize: "22px",
      fontStyle: "bold",
      color: "#F7E396",
      fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    this.add.text(450, 68, "Manten pulsado ESPACIO o haz CLIC en el boton para mantener la temperatura en la ZONA VERDE (800 C)", {
      fontSize: "14px",
      color: "#cbd5e1",
      fontFamily: "'Segoe UI', sans-serif"
    }).setOrigin(0.5);

    // Termómetro vertical
    this.add.rectangle(260, 260, 54, 280, 0x0b0f19).setStrokeStyle(3, 0x475569);
    
    // Zona Verde objetivo (760°C - 840°C)
    // Coordenada Y de la zona verde: centro en Y=240, altura 80 (de Y=200 a Y=280)
    const targetZone = this.add.rectangle(260, 240, 48, 80, 0x22c55e, 0.35)
      .setStrokeStyle(2, 0x4ade80);
    
    // Marcas térmicas
    this.add.text(215, 125, "1000 C\nCRITICO", { fontSize: "11px", color: "#fb7185", align: "right" });
    this.add.text(215, 230, "800 C\nOPTIMO", { fontSize: "12px", fontStyle: "bold", color: "#4ade80", align: "right" });
    this.add.text(215, 365, "200 C\nFRIO", { fontSize: "11px", color: "#94a3b8", align: "right" });

    // Aguja indicadora
    this.needleY = 365;
    this.needle = this.add.rectangle(260, this.needleY, 70, 14, 0xf7e396)
      .setStrokeStyle(2, 0x0f172a);

    // Panel derecho con lecturas digitales
    const panelBg = this.add.rectangle(600, 235, 460, 230, 0x1e293b, 0.8)
      .setStrokeStyle(2, 0x334155);

    this.tempDisplay = this.add.text(400, 150, "Temperatura: 200 C", {
      fontSize: "18px",
      fontStyle: "bold",
      color: "#f8fafc",
      fontFamily: "'Segoe UI', sans-serif"
    });

    this.progressText = this.add.text(400, 195, "Tanque de O2: 0%", {
      fontSize: "20px",
      fontStyle: "bold",
      color: "#38bdf8",
      fontFamily: "'Segoe UI', sans-serif"
    });

    // Barra de progreso visual del tanque de oxígeno
    this.add.rectangle(600, 235, 380, 20, 0x0f172a).setStrokeStyle(1, 0x475569);
    this.tankBar = this.add.rectangle(410, 235, 0, 18, 0x38bdf8).setOrigin(0, 0.5);

    this.timerText = this.add.text(400, 265, "Tiempo restante: 12.0s", {
      fontSize: "17px",
      color: "#f7e396",
      fontFamily: "'Segoe UI', sans-serif"
    });

    // Botón de control interactivo para ratón / pantalla táctil
    this.heatBtn = this.add.rectangle(600, 390, 320, 60, 0x38bdf8)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0xffffff);

    this.btnText = this.add.text(600, 390, "MANTENER CALOR (800 C)", {
      fontSize: "17px",
      fontStyle: "bold",
      color: "#0f172a",
      fontFamily: "'Segoe UI', sans-serif"
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

    // Estado del juego
    this.progress = 0;
    this.timeLeft = 12.0;
    this.ended = false;
  }

  update(time, delta) {
    if (this.ended) return;

    // Reducir tiempo restante
    this.timeLeft -= delta / 1000;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.evaluateEnd();
      return;
    }
    this.timerText.setText(`⏱️ Tiempo de reacción: ${this.timeLeft.toFixed(1)}s`);

    const heatingNow = this.isHeating || this.spaceKey.isDown;

    // Física de la aguja: subir con calor, descender por el frío marciano
    if (heatingNow) {
      this.needleY -= 0.22 * delta;
    } else {
      this.needleY += 0.16 * delta;
    }

    this.needleY = Phaser.Math.Clamp(this.needleY, 130, 375);
    this.needle.y = this.needleY;

    // Calcular temperatura aproximada para el display
    // Y=375 -> 200°C, Y=130 -> 1000°C
    const currentTemp = Math.round(1000 - ((this.needleY - 130) / (375 - 130)) * 800);
    this.tempDisplay.setText(`Temperatura: ${currentTemp} C`);

    // Comprobar si está en la zona verde óptima (Y entre 200 y 280, aprox 750°C a 850°C)
    if (this.needleY >= 200 && this.needleY <= 280) {
      this.needle.setFillStyle(0x4ade80);
      this.tempDisplay.setColor("#4ade80");
      // Llena el tanque en unos 4.5 segundos continuos
      this.progress += 0.024 * delta;
      
      const pct = Math.min(100, Math.floor(this.progress));
      this.progressText.setText(`Tanque de O2: ${pct}%`);
      this.tankBar.width = (pct / 100) * 380;

      if (this.progress >= 100) {
        this.evaluateEnd();
      }
    } else {
      this.needle.setFillStyle(0xf7e396);
      this.tempDisplay.setColor("#f8fafc");
    }
  }

  evaluateEnd() {
    this.ended = true;

    let tier = "fail";
    let score = Math.min(100, Math.floor(this.progress));

    if (this.progress >= 100) {
      if (this.timeLeft >= 4.0) {
        tier = "excellent"; // Más de 4s sobrantes
      } else {
        tier = "good";
      }
    } else if (this.progress >= 55) {
      tier = "fair";
    } else {
      tier = "fail";
    }

    this.scene.stop("MinigameMoxie");
    this.scene.resume("MainScene");

    if (typeof window.onMinigameComplete === "function") {
      window.onMinigameComplete({
        tier: tier,
        score: score,
        minigameName: "Reactor MOXIE (Oxígeno)"
      }, this.choiceData);
    }
  }
}
