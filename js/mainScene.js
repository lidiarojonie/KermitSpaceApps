// js/mainScene.js — Escenario principal 2D de Marte en Phaser 3
// Base Outpost Beta, Cohete MAV reactivo, Biodomo y patrullaje de ROVI

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    // 1. Cielo marciano con estrellas sutiles y Sol lejano
    this.add.rectangle(450, 250, 900, 500, 0x1f1424);
    
    // Estrellas titilantes en el cielo marciano
    for (let i = 0; i < 40; i++) {
      const sx = Phaser.Math.Between(10, 890);
      const sy = Phaser.Math.Between(10, 220);
      const alpha = Phaser.Math.FloatBetween(0.3, 0.9);
      const star = this.add.circle(sx, sy, Phaser.Math.FloatBetween(1, 2), 0xffffff, alpha);
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.1, 0.4),
        duration: Phaser.Math.Between(1200, 2800),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    // El Sol lejano y pálido de Marte (recibe un 43% de la luz solar de la Tierra)
    this.add.circle(180, 85, 34, 0xfde047, 0.85);
    this.add.circle(180, 85, 48, 0xfde047, 0.25);

    // 2. Cordilleras y suelo rojizo de Arcadia Planitia
    this.add.polygon(450, 310, [0, 85, 160, 15, 360, 60, 580, 0, 780, 50, 900, 30, 900, 140, 0, 140], 0x883523);
    this.add.polygon(450, 350, [0, 50, 220, 10, 480, 40, 720, 5, 900, 45, 900, 120, 0, 120], 0xa8432b);
    this.add.rectangle(450, 425, 900, 150, 0xc85532);

    // 3. Cohete MAV (Vehículo de Ascenso a Marte) al fondo izquierda
    this.mavBody = this.add.rectangle(130, 290, 30, 95, 0xe2e8f0).setStrokeStyle(2, 0x0f172a);
    this.add.triangle(130, 230, 0, 32, 15, 0, 30, 32, 0xf43f5e);
    // Aletas estabilizadoras
    this.add.polygon(108, 325, [0, 20, 10, 0, 10, 20], 0x64748b);
    this.add.polygon(152, 325, [0, 0, 10, 20, 0, 20], 0x64748b);

    this.add.text(96, 345, "🚀 MAV", {
      fontSize: "13px", fontStyle: "bold", color: "#f7e396", fontFamily: "'Segoe UI', sans-serif"
    });

    // Indicadores luminosos de las etapas del cohete MAV en el fuselaje
    this.mavStageLights = [
      this.add.circle(130, 265, 4, 0x475569),
      this.add.circle(130, 290, 4, 0x475569),
      this.add.circle(130, 315, 4, 0x475569)
    ];

    // 4. Hábitat Outpost Beta (Cúpula geodésica presurizada)
    this.add.arc(380, 365, 115, 180, 360, false, 0xf1f5f9).setStrokeStyle(4, 0x38bdf8);
    this.add.rectangle(380, 365, 190, 18, 0x1e293b);
    this.add.text(305, 230, "🏠 OUTPOST BETA", {
      fontSize: "13px", fontStyle: "bold", color: "#38bdf8", fontFamily: "'Segoe UI', sans-serif"
    });

    // Biodomo invernadero hidropónico adyacente (Cúpula transparente pequeña)
    this.add.arc(520, 375, 45, 180, 360, false, 0x4ade80, 0.4).setStrokeStyle(2, 0x22c55e);
    this.add.text(500, 325, "🌱", { fontSize: "16px" });

    // Matriz de paneles solares fotovoltaicos a la derecha
    this.add.polygon(680, 355, [0, 25, 45, 0, 90, 0, 45, 25], 0x1e3a8a).setStrokeStyle(1, 0x60a5fa);
    this.add.polygon(740, 355, [0, 25, 45, 0, 90, 0, 45, 25], 0x1e3a8a).setStrokeStyle(1, 0x60a5fa);
    this.add.line(0, 0, 725, 368, 725, 385, 0x475569, 3).setOrigin(0);
    this.add.line(0, 0, 785, 368, 785, 385, 0x475569, 3).setOrigin(0);

    // 5. Astronauta y Robot Asistente ROVI
    this.astronaut = this.add.circle(345, 335, 15, 0xf8fafc).setStrokeStyle(3, 0x38bdf8);
    // Visor del casco
    this.add.arc(348, 335, 8, 270, 90, false, 0xfacc15);

    // Robot ROVI
    this.rovi = this.add.rectangle(420, 342, 28, 18, 0xfacc15).setStrokeStyle(2, 0x0f172a);
    this.roviWheelL = this.add.circle(412, 352, 5, 0x1e293b);
    this.roviWheelR = this.add.circle(428, 352, 5, 0x1e293b);
    this.roviSensor = this.add.circle(420, 330, 4, 0x38bdf8);
    this.roviLabel = this.add.text(402, 310, "🤖 ROVI", {
      fontSize: "11px", fontStyle: "bold", color: "#F7E396", fontFamily: "'Segoe UI', sans-serif"
    });

    // Animación continua de ROVI patrullando la base
    this.tweens.add({
      targets: [this.rovi, this.roviWheelL, this.roviWheelR, this.roviSensor, this.roviLabel],
      x: "+=50",
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  update() {
    // Sincronizar luces de las fases del MAV
    if (typeof GameState !== "undefined" && this.mavStageLights) {
      for (let i = 0; i < 3; i++) {
        if (GameState.mav > i) {
          this.mavStageLights[i].setFillStyle(0x22c55e); // Luz verde encendida
        } else {
          this.mavStageLights[i].setFillStyle(0x475569); // Apagado
        }
      }
    }
  }
}
