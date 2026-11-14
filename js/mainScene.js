// js/mainScene.js — Escenario principal 2D de Marte en Phaser 3

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    // 1. Cielo marciano atardecer y estrellas sutiles
    this.add.rectangle(450, 250, 900, 500, 0x2b1d28);
    this.add.circle(160, 100, 38, 0xf7e396, 0.85); // El Sol lejano en Marte

    // 2. Montañas y suelo rojizo de Arcadia Planitia
    this.add.polygon(450, 330, [0, 80, 180, 10, 380, 65, 620, 0, 900, 75, 900, 120, 0, 120], 0x9e4730);
    this.add.rectangle(450, 420, 900, 160, 0xd96b43);

    // 3. Cohete MAV al fondo (a la izquierda)
    this.add.rectangle(130, 295, 26, 85, 0xe2e8f0).setStrokeStyle(2, 0x161b28);
    this.add.triangle(130, 240, 0, 28, 14, 0, 28, 28, 0xfb7185);
    this.add.text(92, 345, "🚀 MAV", { fontSize: "13px", fontStyle: "bold", color: "#f7e396" });

    // 4. Hábitat Outpost Beta (Cúpula central)
    this.add.arc(380, 365, 115, 180, 360, false, 0xe2e8f0).setStrokeStyle(4, 0x38bdf8);
    this.add.rectangle(380, 355, 190, 22, 0x161b28);
    this.add.text(315, 220, "🏠 OUTPOST BETA", { fontSize: "14px", fontStyle: "bold", color: "#ffffff" });

    // 5. Astronauta y Robot ROVI dentro/cerca de la base
    this.astronaut = this.add.circle(350, 330, 16, 0xf8fafc).setStrokeStyle(3, 0x38bdf8);
    this.rovi = this.add.rectangle(420, 338, 28, 20, 0xf7e396).setStrokeStyle(2, 0x161b28);
    this.roviLabel = this.add.text(402, 308, "🤖 ROVI", { fontSize: "11px", color: "#f7e396" });

    // Animación continua de ROVI patrullando la base
    this.tweens.add({
      targets: [this.rovi, this.roviLabel],
      x: "+=45",
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }
}