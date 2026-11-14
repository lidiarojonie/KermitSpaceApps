// js/state.js — Gestión de recursos, límites, equilibrio y guardado en LocalStorage

const STORAGE_KEY = "mars_last_chance_save_v2";

const GameState = {
  sol: 1,
  water: 50,
  oxygen: 60,
  energy: 50,
  food: 55,
  shield: 80,
  mav: 0,
  emergencyUsed: false,
  contingencyAlert: null,

  // Reinicia los valores para una partida nueva y equilibrada
  reset() {
    this.sol = 1;
    this.water = 50;
    this.oxygen = 60;
    this.energy = 50;
    this.food = 55;
    this.shield = 80;
    this.mav = 0;
    this.emergencyUsed = false;
    this.contingencyAlert = null;
    this.save();
    this.updateHUD();
  },

  // Aplica cambios de recursos manteniendo todo estrictamente entre 0 y 100
  modifyResources(changes, showFloaters = true) {
    const diffs = {};

    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

    if (changes.water !== undefined) {
      const prev = this.water;
      this.water = clamp(this.water + changes.water, 0, 100);
      diffs.water = this.water - prev;
    }
    if (changes.oxygen !== undefined) {
      const prev = this.oxygen;
      this.oxygen = clamp(this.oxygen + changes.oxygen, 0, 100);
      diffs.oxygen = this.oxygen - prev;
    }
    if (changes.energy !== undefined) {
      const prev = this.energy;
      this.energy = clamp(this.energy + changes.energy, 0, 100);
      diffs.energy = this.energy - prev;
    }
    if (changes.food !== undefined) {
      const prev = this.food;
      this.food = clamp(this.food + changes.food, 0, 100);
      diffs.food = this.food - prev;
    }
    if (changes.shield !== undefined) {
      const prev = this.shield;
      this.shield = clamp(this.shield + changes.shield, 0, 100);
      diffs.shield = this.shield - prev;
    }
    if (changes.mav !== undefined) {
      const prev = this.mav;
      this.mav = clamp(this.mav + changes.mav, 0, 3);
      diffs.mav = this.mav - prev;
    }

    if (showFloaters && typeof window.showFloatingDeltas === "function") {
      window.showFloatingDeltas(diffs);
    }

    this.save();
    this.updateHUD();
    return diffs;
  },

  // Consumo nocturno equilibrado al pasar al siguiente Sol
  // - Agua: -5 (reciclador de orina/sudor ECLSS recupera gran parte)
  // - Oxígeno: -4 (CO2 scrubbers + presurización)
  // - Comida: -5 (raciones de supervivencia)
  // - Energía: -4 (calefacción nocturna; -6 si el escudo está bajo o paneles sucios)
  advanceSol() {
    this.sol += 1;

    // Producción pasiva si el hábitat está en buenas condiciones
    let passiveFood = 0;
    let passiveOxygen = 0;
    if (this.water >= 30 && this.food >= 30) {
      // El biodomo hidropónico produce un pequeño excedente diario
      passiveFood = 2;
      passiveOxygen = 1;
    }

    // Gasto energético nocturno según el estado del escudo y base
    const energyDrain = this.shield >= 70 ? -4 : -6;

    const netChanges = {
      water: -5,
      oxygen: -4 + passiveOxygen,
      energy: energyDrain,
      food: -5 + passiveFood
    };

    this.modifyResources(netChanges, true);

    // Sistema de contingencia infantil: si un recurso llega a 0 por primera vez,
    // ROVI inyecta la reserva de emergencia para darle al niño 1 Sol de margen para reponerlo
    this.contingencyAlert = null;
    const vital = ["water", "oxygen", "energy", "food"];
    for (const res of vital) {
      if (this[res] <= 0 && !this.emergencyUsed) {
        this.emergencyUsed = true;
        this[res] = 18;
        this.contingencyAlert = `[ALERTA DE CONTINGENCIA ROVI] Se ha inyectado la reserva de emergencia de ${res.toUpperCase()} (+18%). Repon este recurso inmediatamente hoy.`;
        if (typeof SoundFx !== "undefined") SoundFx.playAlert();
        break;
      }
    }

    this.save();
    this.updateHUD();
  },

  // Comprueba si algún recurso vital ha caído a 0 de forma definitiva
  checkFailure() {
    if (this.water <= 0) return "Te has quedado sin AGUA potable. El traje activo la hibernacion de emergencia.";
    if (this.oxygen <= 0) return "El nivel de OXIGENO cayo a cero. ROVI sello tu casco en modo rescate.";
    if (this.energy <= 0) return "Sin ENERGIA electrica, la calefaccion se apago durante la noche marciana de -65 C.";
    if (this.food <= 0) return "Sin ALIMENTOS, no tienes fuerzas para operar los sistemas del habitat.";
    return null;
  },

  // Devuelve los recursos que están en estado crítico (< 25%)
  getCriticalResources() {
    const list = [];
    if (this.water < 25) list.push({ key: "water", name: "Agua", icon: "[H2O]" });
    if (this.oxygen < 25) list.push({ key: "oxygen", name: "Oxigeno", icon: "[O2]" });
    if (this.energy < 25) list.push({ key: "energy", name: "Energia", icon: "[PWR]" });
    if (this.food < 25) list.push({ key: "food", name: "Comida", icon: "[BIO]" });
    return list;
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      sol: this.sol,
      water: this.water,
      oxygen: this.oxygen,
      energy: this.energy,
      food: this.food,
      shield: this.shield,
      mav: this.mav,
      emergencyUsed: this.emergencyUsed
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

  // Sincroniza las barras HTML y los indicadores con los números actuales
  updateHUD() {
    const solEl = document.getElementById("sol-counter");
    if (solEl) solEl.textContent = `SOL ${this.sol} / 15`;

    const setBar = (id, val) => {
      const valEl = document.getElementById(`val-${id}`);
      const barEl = document.getElementById(`bar-${id}`);
      const boxEl = document.getElementById(`box-${id}`);

      if (valEl) valEl.textContent = `${val}%`;
      if (barEl) {
        barEl.style.width = `${val}%`;
        // Color de advertencia si está muy bajo
        if (val < 25) {
          barEl.classList.add("bar-critical");
        } else {
          barEl.classList.remove("bar-critical");
        }
      }
      if (boxEl) {
        if (val < 25) {
          boxEl.classList.add("box-warning-pulse");
        } else {
          boxEl.classList.remove("box-warning-pulse");
        }
      }
    };

    setBar("water", this.water);
    setBar("oxygen", this.oxygen);
    setBar("energy", this.energy);
    setBar("food", this.food);

    const shieldEl = document.getElementById("val-shield");
    if (shieldEl) shieldEl.textContent = `${this.shield}%`;

    const mavEl = document.getElementById("val-mav");
    if (mavEl) mavEl.textContent = `${this.mav} / 3`;

    // Actualizar indicador visual de etapas MAV si existe
    if (typeof window.updateMavVisuals === "function") {
      window.updateMavVisuals(this.mav);
    }
  }
};
