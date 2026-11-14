// js/state.js — Gestión de recursos, límites y guardado en LocalStorage

const STORAGE_KEY = "mars_last_chance_save_v1";

const GameState = {
  sol: 1,
  water: 50,
  oxygen: 60,
  energy: 50,
  food: 55,
  shield: 80,
  mav: 0,

  // Reinicia los valores para una partida nueva
  reset() {
    this.sol = 1;
    this.water = 50;
    this.oxygen = 60;
    this.energy = 50;
    this.food = 55;
    this.shield = 80;
    this.mav = 0;
    this.save();
    this.updateHUD();
  },

  // Aplica cambios de recursos manteniendo todo entre 0 y 100
  modifyResources(changes) {
    if (changes.water) this.water = Phaser.Math.Clamp(this.water + changes.water, 0, 100);
    if (changes.oxygen) this.oxygen = Phaser.Math.Clamp(this.oxygen + changes.oxygen, 0, 100);
    if (changes.energy) this.energy = Phaser.Math.Clamp(this.energy + changes.energy, 0, 100);
    if (changes.food) this.food = Phaser.Math.Clamp(this.food + changes.food, 0, 100);
    if (changes.shield) this.shield = Phaser.Math.Clamp(this.shield + changes.shield, 0, 100);
    if (changes.mav) this.mav = Phaser.Math.Clamp(this.mav + changes.mav, 0, 3);

    this.save();
    this.updateHUD();
  },

  // Consumo nocturno al pasar al siguiente Sol (-10 a cada recurso vital)
  advanceSol() {
    this.sol += 1;
    this.modifyResources({
      water: -10,
      oxygen: -10,
      energy: -10,
      food: -10
    });
  },

  // Comprueba si algún recurso vital ha caído a 0
  checkFailure() {
    if (this.water <= 0) return "Te has quedado sin AGUA potable. El traje activó la hibernación de emergencia.";
    if (this.oxygen <= 0) return "El nivel de OXÍGENO cayó a cero. ROVI selló tu casco en modo rescate.";
    if (this.energy <= 0) return "Sin ENERGÍA eléctrica, la calefacción se apagó durante la noche de -65 °C.";
    if (this.food <= 0) return "Sin ALIMENTOS, no tienes fuerzas para operar los sistemas del hábitat.";
    return null;
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      sol: this.sol,
      water: this.water,
      oxygen: this.oxygen,
      energy: this.energy,
      food: this.food,
      shield: this.shield,
      mav: this.mav
    }));
  },

  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      Object.assign(this, data);
      this.updateHUD();
      return true;
    } catch (e) {
      return false;
    }
  },

  // Sincroniza las barras HTML con los números actuales
  updateHUD() {
    document.getElementById("sol-counter").textContent = `SOL ${this.sol} / 15`;

    const setBar = (id, val) => {
      document.getElementById(`val-${id}`).textContent = `${val}%`;
      document.getElementById(`bar-${id}`).style.width = `${val}%`;
    };

    setBar("water", this.water);
    setBar("oxygen", this.oxygen);
    setBar("energy", this.energy);
    setBar("food", this.food);

    document.getElementById("val-shield").textContent = `${this.shield}%`;
    document.getElementById("val-mav").textContent = `${this.mav} / 3`;
  }
};