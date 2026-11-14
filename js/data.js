// js/data.js — Campaña completa de 15 Soles con datos científicos de NASA

const MISSION_DAYS = [
  // ================= FASE 1: EMERGENCY (Soles 1-3) =================
  {
    sol: 1,
    phase: "FASE 1: EMERGENCY",
    title: "Sol 1: El Despertar Rojo",
    comm: "Houston: «Ares-VII, vemos en la telemetría de hace 14 minutos que habéis entrado al Outpost Beta. ¡Limpiad los paneles solares cuanto antes!»",
    description: "El polvo levantado por el aterrizaje forzoso cubre las placas solares y las baterías están bajando por el frío de -65 °C.",
    choices: [
      {
        label: "☀️ Salir en traje EVA a limpiar las placas solares",
        costText: "Coste: -5 🫧 Oxígeno | Juegas: Limpieza Solar (+30 ⚡ Energía si ganas)",
        cost: { oxygen: -5 },
        minigame: "MinigameSolar",
        successReward: { energy: 30 },
        failReward: { energy: 15 },
        nasaFact: "Marte recibe menos de la mitad de luz solar que la Tierra. Además, el polvo fino marciano se adhiere a los paneles por electricidad estática."
      },
      {
        label: "🔋 Quemar célula química de reserva sin salir fuera",
        costText: "Coste: -10 💧 Agua | Recompensa segura: +20 ⚡ Energía",
        cost: { water: -10 },
        minigame: null,
        successReward: { energy: 20 },
        nasaFact: "Las células de combustible espaciales permiten obtener electricidad de emergencia cuando es peligroso realizar una caminata espacial (EVA)."
      }
    ]
  },
  {
    sol: 2,
    phase: "FASE 1: EMERGENCY",
    title: "Sol 2: Caída de Presión de Oxígeno",
    comm: "Houston: «Recibido vuestro estado del Sol 1. El sensor de cabina muestra pérdida de oxígeno. Activad el sistema MOXIE.»",
    description: "Una válvula dañada hizo perder parte del aire respirable. Debes producir oxígeno nuevo a partir de la atmósfera marciana.",
    choices: [
      {
        label: "⚙️ Encender el reactor MOXIE a 800 °C",
        costText: "Coste: -10 ⚡ Energía | Juegas: Reactor MOXIE (+25 🫧 Oxígeno si ganas)",
        cost: { energy: -10 },
        minigame: "MinigameMoxie",
        successReward: { oxygen: 25 },
        failReward: { oxygen: 10 },
        nasaFact: "El instrumento MOXIE de la NASA en el rover Perseverance demostró que es posible transformar el CO2 de Marte (95% de su atmósfera) en oxígeno puro."
      },
      {
        label: "🌱 Activar fotosíntesis de emergencia en el Biodomo",
        costText: "Coste: -10 💧 Agua | Juegas: Biodomo (+15 🫧 Oxígeno y +15 🌱 Comida)",
        cost: { water: -10 },
        minigame: "MinigameBiodome",
        successReward: { oxygen: 15, food: 15 },
        failReward: { oxygen: 5, food: 10 },
        nasaFact: "Las microalgas y brotes jóvenes estudiados en el repositorio OSDR de la NASA ayudan a reciclar el dióxido de carbono que exhalan los astronautas."
      }
    ]
  },
  {
    sol: 3,
    phase: "FASE 1: EMERGENCY",
    title: "Sol 3: Reservas de Agua al Límite",
    comm: "Houston: «El radar SHARAD del orbitador MRO confirma hielo glaciar a solo 3 metros bajo vuestro refugio en Arcadia Planitia.»",
    description: "El depósito principal de agua se perdió en el accidente. Es hora de perforar el subsuelo helado de Marte.",
    choices: [
      {
        label: "🧊 Perforar el glaciar subterráneo con ROVI",
        costText: "Coste: -5 ⚡ Energía | Juegas: Perforación de Hielo (+25 💧 Agua si ganas)",
        cost: { energy: -5 },
        minigame: "MinigameDrill",
        successReward: { water: 25 },
        failReward: { water: 10 },
        nasaFact: "Arcadia Planitia contiene enormes placas de hielo de agua cerca de la superficie, lo que la convierte en una zona candidata real para futuras bases."
      },
      {
        label: "💧 Exprimir los deshumidificadores del aire interior",
        costText: "Coste: -10 ⚡ Energía | Recompensa segura: +20 💧 Agua",
        cost: { energy: -10 },
        minigame: null,
        successReward: { water: 20 },
        nasaFact: "En la Estación Espacial Internacional se recicla más del 90% del agua procedente del sudor y la humedad del aliento de los astronautas."
      }
    ]
  },

  // ================= FASE 2: REBUILD (Soles 4-7) =================
  {
    sol: 4,
    phase: "FASE 2: REBUILD",
    title: "Sol 4: Alerta DONKI — Llamarada Solar",
    comm: "Houston: «¡ALERTA ROJA! El sistema DONKI de la NASA acaba de registrar una llamarada solar clase M dirigiéndose hacia Marte.»",
    description: "Marte no tiene un campo magnético global como la Tierra. Debes proteger el refugio antes de que lleguen las partículas energéticas.",
    choices: [
      {
        label: "🛡️ Activar el deflector magnético y sacos de regolito",
        costText: "Coste: -10 ⚡ Energía | Juegas: Escudo DONKI (+15% 🛡️ Escudo y +15 ⚡ Energía)",
        cost: { energy: -10 },
        minigame: "MinigameShield",
        successReward: { shield: 15, energy: 15 },
        failReward: { shield: -10, energy: -5 },
        nasaFact: "La base de datos DONKI de la NASA monitoriza el clima espacial para avisar a satélites y astronautas antes de que lleguen tormentas de radiación solar."
      },
      {
        label: "⛺ Apagar sistemas y refugiarse en el búnker de agua",
        costText: "Coste: -10 🌱 Comida | Recompensa segura: +10% 🛡️ Escudo y +10 💧 Agua",
        cost: { food: -10 },
        minigame: null,
        successReward: { shield: 10, water: 10 },
        nasaFact: "El agua es uno de los mejores escudos contra la radiación espacial porque sus átomos de hidrógeno frenan las partículas solares."
      }
    ]
  },
  {
    sol: 5,
    phase: "FASE 2: REBUILD",
    title: "Sol 5: Nutrición Espacial (OSDR)",
    comm: "Houston: «Para mantener las fuerzas, iniciad el cultivo rápido de microgreens hidropónicos con luces LED.»",
    description: "Las raciones envasadas empiezan a bajar. El módulo hidropónico puede multiplicar tus alimentos si equilibras el agua y la luz.",
    choices: [
      {
        label: "🌱 Cosecha intensiva en el Biodomo Hidropónico",
        costText: "Coste: -10 💧 Agua, -5 ⚡ Energía | Juegas: Biodomo (+30 🌱 Comida, +5 🫧 Oxígeno)",
        cost: { water: -10, energy: -5 },
        minigame: "MinigameBiodome",
        successReward: { food: 30, oxygen: 5 },
        failReward: { food: 15 },
        nasaFact: "Los microgreens crecen en apenas 7 a 10 días bajo luces LED rosas y aportan vitaminas frescas esenciales para proteger el cuerpo en el espacio."
      },
      {
        label: "☀️ Día de ahorro energético y recarga de paneles",
        costText: "Coste: -5 🫧 Oxígeno | Juegas: Limpieza Solar (+25 ⚡ Energía, +10 🌱 Comida)",
        cost: { oxygen: -5 },
        minigame: "MinigameSolar",
        successReward: { energy: 25, food: 10 },
        failReward: { energy: 15 },
        nasaFact: "Mantener el equilibrio térmico del invernadero consume gran parte de la energía eléctrica de un hábitat marciano."
      }
    ]
  },
  {
    sol: 6,
    phase: "FASE 2: REBUILD",
    title: "Sol 6: Remolino de Polvo Electrostático",
    comm: "Houston: «Un Dust Devil acaba de pasar cerca del Outpost Beta. Revisad los conectores eléctricos exteriores.»",
    description: "El viento ha dejado arena en los relés principales, pero también ofrece la oportunidad de captar energía y aire.",
    choices: [
      {
        label: "☀️ Limpiar relés y captar el máximo de luz solar",
        costText: "Coste: 0 | Juegas: Limpieza Solar (+30 ⚡ Energía)",
        cost: {},
        minigame: "MinigameSolar",
        successReward: { energy: 30 },
        failReward: { energy: 15 },
        nasaFact: "En 2005, un remolino de viento marciano limpió por sorpresa los paneles solares del rover Spirit de la NASA, alargando su misión varios años."
      },
      {
        label: "🫧 Aprovechar la presión del viento en el reactor MOXIE",
        costText: "Coste: -10 ⚡ Energía | Juegas: Reactor MOXIE (+25 🫧 Oxígeno)",
        cost: { energy: -10 },
        minigame: "MinigameMoxie",
        successReward: { oxygen: 25 },
        failReward: { oxygen: 12 },
        nasaFact: "El filtro HEPA de MOXIE evita que el polvo fino de Marte entre en las celdas cerámicas donde se produce el oxígeno."
      }
    ]
  },
  {
    sol: 7,
    phase: "FASE 2: REBUILD",
    title: "Sol 7: Cápsula de Suministros Enterrada",
    comm: "Houston: «ROVI ha detectado a 200 metros un contenedor de la misión que quedó semienterrado en el hielo.»",
    description: "Si usas la perforadora para desenterrar el contenedor, podrás recuperar tanto hielo de agua como paquetes de comida liofilizada.",
    choices: [
      {
        label: "🧊 Excavar el contenedor y extraer hielo a la vez",
        costText: "Coste: -10 ⚡ Energía | Juegas: Perforación (+25 💧 Agua y +20 🌱 Comida)",
        cost: { energy: -10 },
        minigame: "MinigameDrill",
        successReward: { water: 25, food: 20 },
        failReward: { water: 15, food: 10 },
        nasaFact: "Las misiones a Marte envían suministros por adelantado en cápsulas de carga robóticas antes de que despeguen los astronautas desde la Tierra."
      },
      {
        label: "🛡️ Usar las placas metálicas del contenedor para el escudo",
        costText: "Coste: -5 ⚡ Energía | Recompensa segura: +15% 🛡️ Escudo y +15 🌱 Comida",
        cost: { energy: -5 },
        minigame: null,
        successReward: { shield: 15, food: 15 },
        nasaFact: "Reutilizar piezas de las naves de descenso es una técnica clave de sostenibilidad espacial para reforzar los refugios."
      }
    ]
  },

  // ================= FASE 3: RESOURCE HUNT (Soles 8-11) =================
  {
    sol: 8,
    phase: "FASE 3: RESOURCE HUNT",
    title: "Sol 8: Operación Hielo Profundo",
    comm: "Houston: «Pasamos el ecuador de la misión. Necesitáis acumular agua pura para el sistema de refrigeración del cohete MAV.»",
    description: "A partir del Sol 12 tendrás que alimentar al cohete de retorno. Es momento de llenar los tanques de agua al máximo.",
    choices: [
      {
        label: "🧊 Perforación profunda en la veta glaciar",
        costText: "Coste: -5 ⚡ Energía | Juegas: Perforación (+30 💧 Agua)",
        cost: { energy: -5 },
        minigame: "MinigameDrill",
        successReward: { water: 30 },
        failReward: { water: 15 },
        nasaFact: "El suelo de Marte contiene sales llamadas percloratos, por lo que toda el agua extraída del hielo debe destilarse y filtrarse antes de beberla."
      },
      {
        label: "🌱 Ciclo doble de reciclaje biológico en el Biodomo",
        costText: "Coste: -5 ⚡ Energía | Juegas: Biodomo (+15 💧 Agua y +20 🌱 Comida)",
        cost: { energy: -5 },
        minigame: "MinigameBiodome",
        successReward: { water: 15, food: 20 },
        failReward: { water: 10, food: 10 },
        nasaFact: "El vapor de agua que transpiran las hojas de las plantas en un invernadero cerrado se condensa como agua potable totalmente limpia."
      }
    ]
  },
  {
    sol: 9,
    phase: "FASE 3: RESOURCE HUNT",
    title: "Sol 9: Producción Masiva de Oxígeno",
    comm: "Houston: «La presión atmosférica hoy es alta. Es el día ideal para llenar las botellas de oxígeno de alta presión.»",
    description: "Necesitas oxígeno tanto para respirar como para el tanque oxidante del cohete MAV en la fase final.",
    choices: [
      {
        label: "⚙️ Sobrecargar el reactor MOXIE a máxima capacidad",
        costText: "Coste: -10 ⚡ Energía | Juegas: Reactor MOXIE (+30 🫧 Oxígeno)",
        cost: { energy: -10 },
        minigame: "MinigameMoxie",
        successReward: { oxygen: 30 },
        failReward: { oxygen: 15 },
        nasaFact: "Quemar combustible en un cohete requiere muchísimo oxígeno líquido: cerca del 75% del peso del propelente de ascenso en Marte es puro oxígeno."
      },
      {
        label: "☀️ Recargar primero todas las baterías solares",
        costText: "Coste: 0 | Juegas: Limpieza Solar (+30 ⚡ Energía y +10 🫧 Oxígeno)",
        cost: {},
        minigame: "MinigameSolar",
        successReward: { energy: 30, oxygen: 10 },
        failReward: { energy: 15 },
        nasaFact: "Una planta MOXIE a escala humana requerirá unos 25 a 30 kilovatios de potencia continua para llenar el cohete de retorno."
      }
    ]
  },
  {
    sol: 10,
    phase: "FASE 3: RESOURCE HUNT",
    title: "Sol 10: Eyección de Masa Coronal (CME)",
    comm: "Houston: «¡Atención Ares-VII! DONKI confirma la llegada de una nube de plasma solar en menos de una hora.»",
    description: "Es la tormenta de radiación más fuerte de toda la misión. Si no defiendes la cúpula, los ordenadores sufrirán daños.",
    choices: [
      {
        label: "🛡️ Desviar energía al escudo deflector DONKI",
        costText: "Coste: -10 ⚡ Energía | Juegas: Escudo DONKI (+20% 🛡️ Escudo, +15 🫧 Oxígeno)",
        cost: { energy: -10 },
        minigame: "MinigameShield",
        successReward: { shield: 20, oxygen: 15 },
        failReward: { shield: -15, energy: -10 },
        nasaFact: "El detector RAD a bordo del rover Curiosity midió la radiación en la superficie marciana para diseñar los escudos de los futuros astronautas."
      },
      {
        label: "☀️ Reparar circuitos en caliente durante la tormenta",
        costText: "Coste: -10% 🛡️ Escudo | Juegas: Limpieza Solar (+30 ⚡ Energía)",
        cost: { shield: -10 },
        minigame: "MinigameSolar",
        successReward: { energy: 30 },
        failReward: { energy: 10 },
        nasaFact: "Los ordenadores espaciales usan procesadores 'endurecidos contra radiación' para evitar que las partículas solares reinicien el sistema."
      }
    ]
  },
  {
    sol: 11,
    phase: "FASE 3: RESOURCE HUNT",
    title: "Sol 11: Último Aprovisionamiento",
    comm: "Houston: «Mañana empieza la secuencia de carga del cohete MAV. Aseguraos de tener comida y agua suficientes para los últimos 4 Soles.»",
    description: "Revisa tus barras superiores de recursos y elige qué reserva necesitas reforzar antes de la Fase 4.",
    choices: [
      {
        label: "🌱 Supercosecha de espirulina y microgreens",
        costText: "Coste: -5 💧 Agua | Juegas: Biodomo (+30 🌱 Comida y +15 🫧 Oxígeno)",
        cost: { water: -5 },
        minigame: "MinigameBiodome",
        successReward: { food: 30, oxygen: 15 },
        failReward: { food: 15 },
        nasaFact: "La espirulina es una cianobacteria riquísima en proteínas y hierro que crece muy rápido con poca agua en misiones espaciales."
      },
      {
        label: "🧊 Llenar todos los bidones de agua y baterías",
        costText: "Coste: -5 🌱 Comida | Juegas: Perforación (+25 💧 Agua y +20 ⚡ Energía)",
        cost: { food: -5 },
        minigame: "MinigameDrill",
        successReward: { water: 25, energy: 20 },
        failReward: { water: 15, energy: 10 },
        nasaFact: "El aprovechamiento de recursos locales en Marte se denomina ISRU (In-Situ Resource Utilization) y es la clave para no depender de la Tierra."
      }
    ]
  },

  // ================= FASE 4: GET OUT (Soles 12-15) =================
  {
    sol: 12,
    phase: "FASE 4: GET OUT",
    title: "Sol 12: MAV Fase 1 — Enlace Eléctrico",
    comm: "Houston: «La megatormenta de polvo está a 4 Soles. Conectad el cable de alta tensión al Vehículo de Ascenso a Marte (MAV).»",
    description: "¡Comienza la cuenta atrás! Ambas opciones completan la Fase 1/3 del cohete MAV, elige según tus recursos actuales.",
    choices: [
      {
        label: "🚀 Cargar baterías del MAV limpiando la matriz solar",
        costText: "Coste: -5 🫧 Oxígeno | Juegas: Limpieza Solar (🚀 MAV +1/3 y +25 ⚡ Energía)",
        cost: { oxygen: -5 },
        minigame: "MinigameSolar",
        successReward: { mav: 1, energy: 25 },
        failReward: { mav: 1, energy: 10 },
        nasaFact: "El MAV debe mantener sus tanques de metano y oxígeno a temperaturas criogénicas (-180 °C) usando energía eléctrica constante."
      },
      {
        label: "🚀 Transferir energía del biodomo al cohete MAV",
        costText: "Coste: -5 💧 Agua | Juegas: Biodomo (🚀 MAV +1/3, +20 🌱 Comida, +15 ⚡ Energía)",
        cost: { water: -5 },
        minigame: "MinigameBiodome",
        successReward: { mav: 1, food: 20, energy: 15 },
        failReward: { mav: 1, food: 10 },
        nasaFact: "Antes del despegue, los astronautas apagan los módulos secundarios de la base para concentrar toda la potencia en la nave de ascenso."
      }
    ]
  },
  {
    sol: 13,
    phase: "FASE 4: GET OUT",
    title: "Sol 13: MAV Fase 2 — Bombeo de Oxidante",
    comm: "Houston: «Ordenador del MAV encendido (1/3). Ahora bombead el oxígeno líquido fabricado con MOXIE a los tanques del cohete.»",
    description: "El cohete necesita su oxidante para poder encender los motores rumbo a la órbita marciana.",
    choices: [
      {
        label: "🚀 Bombeo criogénico con el reactor MOXIE",
        costText: "Coste: -10 ⚡ Energía | Juegas: Reactor MOXIE (🚀 MAV +2/3 y +30 🫧 Oxígeno)",
        cost: { energy: -10 },
        minigame: "MinigameMoxie",
        successReward: { mav: 1, oxygen: 30 },
        failReward: { mav: 1, oxygen: 15 },
        nasaFact: "Fabricar el oxidante del cohete en Marte ahorra tener que lanzar más de 200 toneladas de peso extra desde la Tierra."
      },
      {
        label: "🚀 Extraer oxígeno y agua del hielo subsuperficial",
        costText: "Coste: -5 ⚡ Energía | Juegas: Perforación (🚀 MAV +2/3, +20 💧 Agua, +15 🫧 Oxígeno)",
        cost: { energy: -5 },
        minigame: "MinigameDrill",
        successReward: { mav: 1, water: 20, oxygen: 15 },
        failReward: { mav: 1, water: 10, oxygen: 10 },
        nasaFact: "Mediante electrólisis del agua derretida de los glaciares marcianos también se puede separar hidrógeno y oxígeno para combustible."
      }
    ]
  },
  {
    sol: 14,
    phase: "FASE 4: GET OUT",
    title: "Sol 14: MAV Fase 3 — Blindaje de Lanzamiento",
    comm: "Houston: «¡Ya vemos el frente de la tormenta desde órbita! Completad la refrigeración por agua y el blindaje de la antena del MAV.»",
    description: "Último preparativo antes del Sol 15. Con esta operación el cohete quedará en estado 3/3 listo para ignición.",
    choices: [
      {
        label: "🚀 Proteger la aviónica del MAV con el escudo DONKI",
        costText: "Coste: -5 ⚡ Energía | Juegas: Escudo DONKI (🚀 MAV 3/3, +20 💧 Agua, +20 🌱 Comida)",
        cost: { energy: -5 },
        minigame: "MinigameShield",
        successReward: { mav: 1, water: 20, food: 20 },
        failReward: { mav: 1, water: 10, food: 10 },
        nasaFact: "Las tormentas de polvo en Marte generan descargas eléctricas estáticas en la atmósfera que requieren proteger las antenas de guiado."
      },
      {
        label: "🚀 Inyectar agua refrigerante en la plataforma del MAV",
        costText: "Coste: -5 ⚡ Energía | Juegas: Perforación (🚀 MAV 3/3, +25 💧 Agua, +20 ⚡ Energía)",
        cost: { energy: -5 },
        minigame: "MinigameDrill",
        successReward: { mav: 1, water: 25, energy: 20 },
        failReward: { mav: 1, water: 15, energy: 10 },
        nasaFact: "Las plataformas de lanzamiento usan cortinas de agua para absorber las ondas acústicas y el calor extremo de los motores al encenderse."
      }
    ]
  },
  {
    sol: 15,
    phase: "FASE 4: GET OUT",
    title: "Sol 15: ¡Ignición en Medio de la Tormenta!",
    comm: "Houston: «¡Ares-VII, vientos de 110 km/h sobre Arcadia Planitia! Subid al MAV con ROVI e iniciad la secuencia de despegue.»",
    description: "Estás en la cabina del cohete MAV con ROVI. Un pico de tensión sacude los sistemas a segundos del despegue. ¡Estabilízalo para ir a órbita!",
    choices: [
      {
        label: "🔥 ¡SECUENCIA DE IGNICIÓN Y DESPEGUE A ÓRBITA!",
        costText: "Juegas: Estabilización Final MOXIE (+20 a todos los recursos para llegar a órbita)",
        cost: {},
        minigame: "MinigameMoxie",
        successReward: { water: 20, oxygen: 20, energy: 20, food: 20 },
        failReward: { water: 15, oxygen: 15, energy: 15, food: 15 },
        nasaFact: "El Vehículo de Ascenso a Marte tarda solo unos 8 minutos en subir desde la superficie hasta acoplarse con la nave de regreso a la Tierra en órbita marciana."
      }
    ]
  }
];