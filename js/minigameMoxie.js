// js/minigameMoxie.js — Minijuego 1: Control térmico del reactor MOXIE (NASA)

class MinigameMoxie extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameMoxie" });
  }

  init(data) {
    this.choiceData = data.choice;
  }

  create() {
    // Fondo del laboratorio de ingeniería
    this.add.rectangle(450, 250, 900, 500, 0x161b28);

    // Título e instrucciones claras para niños
    this.add.text(450, 45, "⚙️ REACTOR MOXIE: PRODUCCIÓN DE OXÍGENO", {
      fontSize: "22px",
      fontStyle: "bold",
      color: "#F7E396"
    }).setOrigin(0.5);

    this.add.text(450, 82, "Mantén pulsado CLIC o ESPACIO para subir la aguja a la ZONA VERDE (800 °C) hasta llenar el tanque al 100%", {
      fontSize: "15px",
      color: "#cbd5e1"
    }).setOrigin(0.5);

    // Termómetro vertical y Zona Verde objetivo
    this.add.rectangle(300, 260, 46, 260, 0x0f172a).setStrokeStyle(3, 0x475569);
    // Zona verde entre Y=190 y Y=270
    this.add.rectangle(300, 230, 40, 80, 0x4ade80, 0.35).setStrokeStyle(2, 0x4ade80);
    this.add.text(225, 222, "800°C\nÓPTIMO", { fontSize: "12px", color: "#4ade80", align: "right" });

    // Aguja de temperatura del jugador (empieza abajo, en frío)
    this.needleY = 360;
    this.needle = this.add.rectangle(300, this.needleY, 58, 12, 0xf7e396).setStrokeStyle(2, 0x161b28);

    // Barra de progreso de Oxígeno generado y cuenta atrás
    this.progress = 0;
    this.timeLeft = 12;

    this.progressText = this.add.text(540, 200, "Oxígeno filtrado: 0%", {
      fontSize: "22px",
      fontStyle: "bold",
      color: "#38bdf8"
    });

    this.timerText = this.add.text(540, 250, "⏱️ Tiempo restante: 12s", {
      fontSize: "18px",
      color: "#f8fafc"
    });

    // Botón grande en pantalla por si juegan con ratón o tablet
    const heatBtn = this.add.rectangle(620, 330, 240, 56, 0xfb7185).setInteractive({ useHandCursor: true });
    this.add.text(620, 330, "🔥 MANTENER CALOR", { fontSize: "17px", fontStyle: "bold", color: "#161b28" }).setOrigin(0.5);

    this.isHeating = false;
    this.input.on("pointerdown", () => { this.isHeating = true; });
    this.input.on("pointerup", () => { this.isHeating = false; });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Reloj de 1 segundo
    this.time.addEvent({
      delay: 1000,
      repeat: 11,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`⏱️ Tiempo restante: ${this.timeLeft}s`);
        if (this.timeLeft <= 0) {
          this.finishMinigame(false);
        }
      }
    });
  }

  update(time, delta) {
    const heatingNow = this.isHeating || this.spaceKey.isDown;

    // Si calienta sube (Y disminuye); si suelta, se enfría (Y aumenta)
    if (heatingNow) {
      this.needleY -= 0.18 * delta;
    } else {
      this.needleY += 0.14 * delta;
    }

    this.needleY = Phaser.Math.Clamp(this.needleY, 140, 380);
    this.needle.y = this.needleY;

    // Comprobamos si la aguja está dentro de la zona verde (entre 190 y 270)
    if (this.needleY >= 190 && this.needleY <= 270) {
      this.needle.setFillStyle(0x4ade80);
      this.progress += 0.022 * delta; // Se llena en unos 4.5 segundos dentro del verde
      this.progressText.setText(`Oxígeno filtrado: ${Math.min(100, Math.floor(this.progress))}%`);

      if (this.progress >= 100) {
        this.finishMinigame(true);
      }
    } else {
      this.needle.setFillStyle(0xf7e396);
    }
  }

  finishMinigame(success) {
    this.scene.stop("MinigameMoxie");
    this.scene.resume("MainScene");
    window.onMinigameComplete(success, this.choiceData);
  }
}