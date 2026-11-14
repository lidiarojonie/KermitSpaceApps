// js/discovery.js — Sistema de Píldoras Educativas y Diario de Exploración Espacial (NASA Space Apps 2026)

const DISCOVERY_PILLS = [
  {
    id: "water_mars",
    title: "🧊 AGUA EN MARTE: GLACIARES SUBTERRÁNEOS",
    category: "Agua y Geología",
    icon: "💧",
    text: "¡Buen descubrimiento! Bajo el polvo de Arcadia Planitia hay enormes capas de hielo de agua pura detectadas por el radar SHARAD de la NASA. Los futuros astronautas podrán derretirlo para beber y obtener combustible.",
    unlocked: false
  },
  {
    id: "moxie_oxygen",
    title: "⚙️ OXÍGENO Y EL REACTOR MOXIE",
    category: "Soporte Vital",
    icon: "🫧",
    text: "¿Sabías que la atmósfera de Marte es 95% dióxido de carbono? El instrumento MOXIE del rover Perseverance demostró que podemos fabricar oxígeno respirable respirando la atmósfera marciana a 800 °C.",
    unlocked: false
  },
  {
    id: "mars_gravity",
    title: "🚀 GRAVEDAD: ¡UN SALTO DE GIGANTE!",
    category: "Física Espacial",
    icon: "🦘",
    text: "¡La gravedad en Marte es solo el 38% de la de la Tierra! Si en la Tierra pesas 40 kilos, en Marte la báscula marcaría apenas 15 kilos. ¡Podrías saltar casi 3 veces más alto!",
    unlocked: false
  },
  {
    id: "mars_cold",
    title: "❄️ TEMPERATURA: EL FRÍO MARCIANO",
    category: "Climatología",
    icon: "🌡️",
    text: "Marte está más lejos del Sol que la Tierra, por lo que es un mundo gélido. Durante la noche, la temperatura puede caer hasta los -65 °C o incluso -120 °C en los polos. ¡La calefacción es vital!",
    unlocked: false
  },
  {
    id: "dust_devils",
    title: "🌪️ REMOLINOS Y TORMENTAS DE POLVO",
    category: "Atmósfera",
    icon: "🌪️",
    text: "En Marte se forman 'Dust Devils' o remolinos gigantescos de polvo que barren el suelo. En 2005, uno de estos remolinos limpió por sorpresa los paneles solares del rover Spirit, salvando su misión.",
    unlocked: false
  },
  {
    id: "solar_power",
    title: "☀️ PANELES FOTOVOLTAICOS E ISRU",
    category: "Energía y Sostenibilidad",
    icon: "⚡",
    text: "Marte recibe menos de la mitad de luz solar que la Tierra. Por eso los paneles deben ser ultrafinos y limpiarse con frecuencia. Usar los recursos del propio planeta se llama ISRU (In-Situ Resource Utilization).",
    unlocked: false
  },
  {
    id: "rovers_exploration",
    title: "🤖 ROVERS: NUESTROS OJOS EN OTROS MUNDOS",
    category: "Robótica y Exploración",
    icon: "🚙",
    text: "Los rovers como Curiosity, Perseverance o nuestro querido ROVI son robots autónomos con cámaras científicas, brazos robóticos y lásers para estudiar rocas donde los humanos todavía no han pisado.",
    unlocked: false
  },
  {
    id: "biodome_osdr",
    title: "🌱 CULTIVO ESPACIAL: BANCO DE DATOS OSDR",
    category: "Biología Espacial",
    icon: "🥗",
    text: "El Open Science Data Repository (OSDR) de la NASA estudia cómo cultivar microgreens y algas como la espirulina con luces LED especiales. Crecen en solo 7 días y aportan vitaminas frescas esenciales.",
    unlocked: false
  },
  {
    id: "radiation_donki",
    title: "🛡️ RADIACIÓN Y EL SISTEMA DONKI",
    category: "Clima Espacial",
    icon: "☀️",
    text: "A diferencia de la Tierra, Marte no tiene un campo magnético global. La base de datos DONKI de la NASA avisa a los astronautas cuando el Sol lanza llamaradas para que se refugien bajo escudos de regolito y agua.",
    unlocked: false
  },
  {
    id: "earth_comms",
    title: "📡 COMUNICACIONES: EL RETRASO DE SEÑAL",
    category: "Telecomunicaciones",
    icon: "⏱️",
    text: "Una señal de radio viaja a la velocidad de la luz (300.000 km/s), pero Marte está tan lejos que un mensaje tarda entre 4 y 24 minutos en llegar a Houston. ¡Por eso la tripulación debe saber resolver problemas sola!",
    unlocked: false
  }
];

const DIARY_STORAGE_KEY = "mars_last_chance_diary_v1";

const DiscoverySystem = {
  pills: DISCOVERY_PILLS,

  init() {
    this.load();
    this.updateDiaryBadge();
  },

  load() {
    try {
      const saved = localStorage.getItem(DIARY_STORAGE_KEY);
      if (saved) {
        const unlockedIds = JSON.parse(saved);
        this.pills.forEach(p => {
          if (unlockedIds.includes(p.id)) p.unlocked = true;
        });
      }
    } catch (e) {}
  },

  save() {
    try {
      const unlockedIds = this.pills.filter(p => p.unlocked).map(p => p.id);
      localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(unlockedIds));
    } catch (e) {}
  },

  unlock(pillId, triggerPopup = true) {
    const pill = this.pills.find(p => p.id === pillId);
    if (!pill) return;

    const isFirstTime = !pill.unlocked;
    pill.unlocked = true;
    this.save();
    this.updateDiaryBadge();

    if (triggerPopup && isFirstTime) {
      this.showPillPopup(pill);
    }
  },

  getUnlockedCount() {
    return this.pills.filter(p => p.unlocked).length;
  },

  updateDiaryBadge() {
    const badge = document.getElementById("diary-counter-badge");
    if (badge) {
      badge.textContent = `${this.getUnlockedCount()} / ${this.pills.length}`;
    }
  },

  showPillPopup(pill) {
    const modal = document.getElementById("discovery-popup-modal");
    if (!modal) return;

    document.getElementById("disc-pop-icon").textContent = pill.icon;
    document.getElementById("disc-pop-cat").textContent = pill.category.toUpperCase();
    document.getElementById("disc-pop-title").textContent = pill.title;
    document.getElementById("disc-pop-text").textContent = pill.text;

    modal.classList.remove("hidden");

    if (typeof SoundFx !== "undefined") {
      SoundFx.playResourceGain();
    }
  },

  closePillPopup() {
    const modal = document.getElementById("discovery-popup-modal");
    if (modal) modal.classList.add("hidden");
  },

  openDiary() {
    const modal = document.getElementById("discovery-diary-modal");
    if (!modal) return;

    const grid = document.getElementById("diary-cards-grid");
    grid.innerHTML = "";

    this.pills.forEach(p => {
      const card = document.createElement("div");
      card.className = `diary-card ${p.unlocked ? "unlocked" : "locked"}`;

      if (p.unlocked) {
        card.innerHTML = `
          <div class="diary-card-header">
            <span class="diary-icon">${p.icon}</span>
            <span class="diary-cat">${p.category}</span>
          </div>
          <h4>${p.title}</h4>
          <p>${p.text}</p>
          <span class="diary-status-tag">✅ Desbloqueado en la misión</span>
        `;
      } else {
        card.innerHTML = `
          <div class="diary-card-header">
            <span class="diary-icon">🔒</span>
            <span class="diary-cat">${p.category}</span>
          </div>
          <h4>Descubrimiento Bloqueado</h4>
          <p class="locked-hint">Completa misiones y explora Marte para descubrir esta curiosidad científica de la NASA.</p>
          <span class="diary-status-tag locked-tag">❓ Por descubrir</span>
        `;
      }

      grid.appendChild(card);
    });

    document.getElementById("diary-stats-text").textContent =
      `Has descubierto ${this.getUnlockedCount()} de ${this.pills.length} secretos marcianos`;

    modal.classList.remove("hidden");
    if (typeof SoundFx !== "undefined") SoundFx.playClick();
  },

  closeDiary() {
    const modal = document.getElementById("discovery-diary-modal");
    if (modal) modal.classList.add("hidden");
  }
};
