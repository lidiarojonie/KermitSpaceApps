// js/data.js — Base de datos de Soles, decisiones y píldoras científicas de NASA

const MISSION_DAYS = [
  {
    sol: 1,
    phase: "FASE 1: EMERGENCY",
    title: "Sol 1: Alerta de Oxígeno y Polvo",
    comm: "Houston: «Ares-VII, vemos en la telemetría de hace 14 minutos que habéis entrado al Outpost Beta. ¡Confirmad presión de cabina!»",
    description: "El golpe del aterrizaje desajustó una válvula de aire y cubrió las placas solares de polvo rojizo. Necesitas estabilizar el soporte vital antes del anochecer.",
    choices: [
      {
        label: "🔧 Encender el reactor MOXIE para fabricar Oxígeno del aire marciano",
        costText: "Coste inmediato: -10 ⚡ Energía | Juegas: Minijuego MOXIE (+25 🫧 Oxígeno si ganas)",
        cost: { energy: -10 },
        minigame: "MinigameMoxie",
        successReward: { oxygen: 25 },
        failReward: { oxygen: 10 },
        nasaFact: "El experimento MOXIE de la NASA en el rover Perseverance demostró que podemos aspirar dióxido de carbono (CO2) de la atmósfera de Marte y dividirlo a 800 °C para producir oxígeno respirable."
      },
      {
        label: "🔋 Quemar célula química de reserva (Opción segura sin minijuego)",
        costText: "Coste: -10 💧 Agua de refrigeración | Recompensa segura: +20 ⚡ Energía y +10 🫧 Oxígeno",
        cost: { water: -10 },
        minigame: null,
        successReward: { energy: 20, oxygen: 10 },
        nasaFact: "Las células de combustible espaciales combinan reactivos químicos para generar electricidad y calor de forma fiable cuando las tormentas de polvo tapan el Sol."
      }
    ]
  },
  {
    sol: 2,
    phase: "FASE 1: EMERGENCY",
    title: "Sol 2: Fuga de Presión en el Invernadero",
    comm: "Houston: «Hemos recibido los datos del Sol 1. El satélite DONKI detecta viento solar moderado acercándose a vuestra posición.»",
    description: "El módulo de microgreens tiene una microfuga y el nivel de oxígeno vuelve a bajar. ¿Cómo quieres compensarlo hoy?",
    choices: [
      {
        label: "🫧 Forzar un segundo ciclo del reactor MOXIE",
        costText: "Coste inmediato: -10 ⚡ Energía | Juegas: Minijuego MOXIE (+25 🫧 Oxígeno si ganas)",
        cost: { energy: -10 },
        minigame: "MinigameMoxie",
        successReward: { oxygen: 25 },
        failReward: { oxygen: 10 },
        nasaFact: "En una misión humana real, una versión de MOXIE del tamaño de una lavadora funcionará día y noche para fabricar tanto el aire de los astronautas como las 30 toneladas de oxígeno líquido del cohete de vuelta."
      },
      {
        label: "🌱 Sellar el módulo y reciclar aire con las plantas (OSDR)",
        costText: "Coste: -10 💧 Agua | Recompensa directa: +15 🌱 Comida y +10 🫧 Oxígeno",
        cost: { water: -10 },
        minigame: null,
        successReward: { food: 15, oxygen: 10 },
        nasaFact: "El repositorio OSDR de la NASA estudia cómo las plantas en el espacio absorben el CO2 que exhalamos y devuelven oxígeno limpio mediante la fotosíntesis."
      }
    ]
  }
];