// js/data.js — Campaña completa de 15 Soles con datos científicos reales de la NASA y equilibrio de supervivencia

const MISSION_DAYS = [
  // ================= FASE 1: EMERGENCY (Soles 1-3) =================
  {
    sol: 1,
    phase: "FASE 1: EMERGENCY",
    title: "Sol 1: El Despertar Rojo",
    comm: "Houston: «Ares-VII, vemos en la telemetría de hace 14 minutos que habéis entrado al Outpost Beta. ¡Limpiad los paneles solares cuanto antes para restaurar las baterías!»",
    description: "El polvo levantado por el aterrizaje forzoso cubre las placas solares y las baterías están bajando por el frío marciano de -65 °C.",
    choices: [
      {
        label: " Salir en traje EVA a limpiar y reconectar los paneles",
        costText: "Coste: -4 Oxigeno [O2] | Juegas: Mantenimiento Solar (+32 Energia [PWR] si ganas)",
        cost: { oxygen: -4 },
        minigame: "MinigameSolar",
        minigameTitle: "Mantenimiento Solar: Limpieza de Polvo",
        minigameBrief: "El polvo fino marciano reduce la captación de luz solar. Haz clic en las manchas de polvo rojizo para limpiarlas y activa el interruptor.",
        successReward: { energy: 32 },
        failReward: { energy: 16 },
        nasaFact: "Marte recibe menos de la mitad de luz solar que la Tierra. Además, el polvo fino marciano se adhiere a los paneles por electricidad estática."
      },
      {
        label: " Encender célula química de reserva en el interior",
        costText: "Coste: -4 Agua [H2O] | Recompensa segura: +22 Energia [PWR]",
        cost: { water: -4 },
        minigame: null,
        successReward: { energy: 22 },
        nasaFact: "Las células de combustible permiten obtener electricidad de emergencia mediante reacción de hidrógeno y oxígeno cuando es peligroso salir al exterior."
      }
    ]
  },
  {
    sol: 2,
    phase: "FASE 1: EMERGENCY",
    title: "Sol 2: Pérdida de Presión en el Módulo",
    comm: "Houston: «El sensor de cabina muestra una caída de presión. Una micro-fractura en el sello del hábitat está dejando escapar aire respirable.»",
    description: "Debes actuar de inmediato para recuperar el oxígeno del refugio antes de que la atmósfera interna baje de los niveles seguros.",
    choices: [
      {
        label: "Sellar las fugas del casco con espuma selladora",
        costText: "Coste: -4 Energia [PWR] | Juegas: Sellado de Fugas (+28 Oxigeno [O2] si ganas)",
        cost: { energy: -4 },
        minigame: "MinigameLeakRepair",
        minigameTitle: "Sellado de Fugas de Oxígeno",
        minigameBrief: "Localiza las fugas en la pared presurizada del hábitat y haz clic sobre ellas para sellarlas con espuma antes de que caiga la presión.",
        successReward: { oxygen: 28 },
        failReward: { oxygen: 14 },
        nasaFact: "Las estaciones espaciales como la ISS monitorizan caídas microscópicas de presión y usan selladores térmicos rápidos para proteger la vida de los astronautas."
      },
      {
        label: " Encender el reactor MOXIE para compensar la fuga",
        costText: "Coste: -5 Energia [PWR] | Juegas: Reactor MOXIE (+26 Oxigeno [O2] si ganas)",
        cost: { energy: -5 },
        minigame: "MinigameMoxie",
        minigameTitle: "Reactor MOXIE: Síntesis Térmica",
        minigameBrief: "Mantén el reactor en la zona óptima de 800 °C manteniendo pulsado el botón para convertir el CO₂ exterior en oxígeno respirable.",
        successReward: { oxygen: 26 },
        failReward: { oxygen: 14 },
        nasaFact: "El experimento MOXIE en el rover Perseverance demostró que es posible producir oxígeno respirable a partir del 95% de CO₂ de la atmósfera marciana a 800 °C."
      }
    ]
  },
  {
    sol: 3,
    phase: "FASE 1: EMERGENCY",
    title: "Sol 3: Hielo Bajo Arcadia Planitia",
    comm: "Houston: «El radar SHARAD del orbitador MRO confirma una veta de hielo glaciar a pocos metros de profundidad bajo el Outpost Beta.»",
    description: "El tanque de agua sufrió daños en el impacto. Es momento de extraer el hielo subterráneo y purificarlo para el consumo.",
    choices: [
      {
        label: " Perforar el glaciar subterráneo con ROVI",
        costText: "Coste: -4 Energia [PWR] | Juegas: Perforación Glaciar (+30 Agua [H2O] si ganas)",
        cost: { energy: -4 },
        minigame: "MinigameDrill",
        minigameTitle: "Perforación Glaciar Arcadia",
        minigameBrief: "Mueve la broca para extraer cristales de hielo azul puro y esquivar las rocas basálticas subterráneas.",
        successReward: { water: 30 },
        failReward: { water: 15 },
        nasaFact: "Arcadia Planitia contiene enormes depósitos de hielo de agua pura a poca profundidad, detectados por el radar SHARAD del orbitador MRO de la NASA."
      },
      {
        label: " Filtrar y desalinizar el hielo en el laboratorio",
        costText: "Coste: -4 Energia [PWR] | Juegas: Purificación de Agua (+28 Agua [H2O] si ganas)",
        cost: { energy: -4 },
        minigame: "MinigameWaterFilter",
        minigameTitle: "Purificación de Agua y Percloratos",
        minigameBrief: "Activa los 3 filtros en orden (sedimentos, neutralización de percloratos y ósmosis inversa) para obtener agua bebible 100% segura.",
        successReward: { water: 28 },
        failReward: { water: 14 },
        nasaFact: "El regolito marciano contiene sales perclorato que son tóxicas. Toda el agua extraída del hielo debe purificarse antes de ser consumida."
      }
    ]
  },

  // ================= FASE 2: REBUILD (Soles 4-7) =================
  {
    sol: 4,
    phase: "FASE 2: REBUILD",
    title: "Sol 4: Alerta DONKI — Llamarada Solar",
    comm: "Houston: «¡ALERTA DONKI! El observatorio espacial ha registrado una eyección de masa coronal dirigida hacia Marte. Activad el escudo del refugio.»",
    description: "Marte carece de un campo magnético global protector. Debes desviar las partículas de alta radiación antes de que dañen las baterías y cultivos.",
    choices: [
      {
        label: " Activar el deflector magnético y barrera DONKI",
        costText: "Coste: -4 Energia [PWR] | Juegas: Escudo DONKI (+20% Escudo [DEF] y +15 Energia [PWR])",
        cost: { energy: -4 },
        minigame: "MinigameShield",
        minigameTitle: "Deflector de Radiación Solar DONKI",
        minigameBrief: "Mueve el deflector magnético para interceptar los protones solares energéticos y evitar impactos directos en el refugio.",
        successReward: { shield: 20, energy: 15 },
        failReward: { shield: 5, energy: 8 },
        nasaFact: "El sistema DONKI de la NASA predice el clima espacial para alertar de tormentas de radiación que podrían afectar a astronautas fuera de la magnetosfera terrestre."
      },
      {
        label: " Refugiarse en el búnker interior rodeado de agua",
        costText: "Coste: -4 Comida [BIO] | Recompensa segura: +15% Escudo [DEF] y +12 Agua [H2O]",
        cost: { food: -4 },
        minigame: null,
        successReward: { shield: 15, water: 12 },
        nasaFact: "El agua contiene átomos de hidrógeno altamente eficientes para absorber la radiación cósmica y solar, actuando como escudo protector."
      }
    ]
  },
  {
    sol: 5,
    phase: "FASE 2: REBUILD",
    title: "Sol 5: Nutrición Espacial OSDR",
    comm: "Houston: «Para mantener las fuerzas, iniciad el ciclo rápido de microgreens hidropónicos y espirulina con luces LED rosa.»",
    description: "Las raciones envasadas bajan. El biodomo hidropónico puede generar alimentos frescos y ricos en vitaminas si cuidas el riego y la luz.",
    choices: [
      {
        label: " Cosecha intensiva en el Biodomo OSDR",
        costText: "Coste: -4 Agua [H2O] | Juegas: Cultivo Hidropónico (+32 Comida [BIO] y +8 Oxigeno [O2])",
        cost: { water: -4 },
        minigame: "MinigameBiodome",
        minigameTitle: "Biodomo Hidropónico OSDR",
        minigameBrief: "Mantén hidratadas las 3 bandejas de cultivo pulsando sus botones de riego y luz LED antes de que baje su vitalidad.",
        successReward: { food: 32, oxygen: 8 },
        failReward: { food: 18, oxygen: 4 },
        nasaFact: "El Open Science Data Repository (OSDR) de la NASA investiga cómo cultivar microgreens de crecimiento rápido para la nutrición de futuros astronautas."
      },
      {
        label: " Optimizar paneles solares y compartir energía con el invernadero",
        costText: "Coste: -4 Oxigeno [O2] | Juegas: Mantenimiento Solar (+26 Energia [PWR] y +14 Comida [BIO])",
        cost: { oxygen: -4 },
        minigame: "MinigameSolar",
        minigameTitle: "Mantenimiento y Recarga Solar",
        minigameBrief: "Limpia las placas fotovoltaicas para aumentar la energía eléctrica disponible para el soporte térmico del biodomo.",
        successReward: { energy: 26, food: 14 },
        failReward: { energy: 14, food: 8 },
        nasaFact: "Los invernaderos marcianos consumen mucha energía eléctrica para calefacción y para las luces LED que sustituyen la tenue luz solar marciana."
      }
    ]
  },
  {
    sol: 6,
    phase: "FASE 2: REBUILD",
    title: "Sol 6: Remolino de Viento Limpiador",
    comm: "Houston: «Un Dust Devil (remolino de polvo marciano) ha pasado cerca de la base, generando corrientes térmicas y viento.»",
    description: "Podemos aprovechar la succión del remolino para potenciar el flujo de aire al reactor MOXIE o recargar acumuladores.",
    choices: [
      {
        label: "Inyectar flujo de CO2 marciano al reactor MOXIE",
        costText: "Coste: -4 Energia [PWR] | Juegas: Reactor MOXIE (+30 Oxigeno [O2])",
        cost: { energy: -4 },
        minigame: "MinigameMoxie",
        minigameTitle: "Reactor MOXIE: Flujo Forzado",
        minigameBrief: "Regula el calentamiento del reactor a 800 °C aprovechando la sobrepresión atmosférica del remolino.",
        successReward: { oxygen: 30 },
        failReward: { oxygen: 15 },
        nasaFact: "El filtro HEPA de MOXIE impide la entrada de granos de arena y polvo marciano a las micro-celdas cerámicas electrolíticas."
      },
      {
        label: " Reconfigurar y alinear relés de circuito del Outpost",
        costText: "Coste: 0 | Juegas: Conexión de Circuitos (+30 Energia [PWR])",
        cost: {},
        minigame: "MinigameCircuit",
        minigameTitle: "Conexión de Circuitos y Relés",
        minigameBrief: "Alinea los 4 relés rotatorios para cerrar el circuito y recargar las baterías del Outpost Beta.",
        successReward: { energy: 30 },
        failReward: { energy: 16 },
        nasaFact: "Los hábitats espaciales emplean conmutadores redundantes para reconectar líneas eléctricas si el viento marciano desajusta los contactos."
      }
    ]
  },
  {
    sol: 7,
    phase: "FASE 2: REBUILD",
    title: "Sol 7: Cápsula de Suministros Desenterrada",
    comm: "Houston: «ROVI ha detectado una cápsula de descenso no tripulada semienterrada en el hielo a 200 metros de la cúpula.»",
    description: "Si usamos a ROVI para explorar la zona y balizar el contenedor, podremos rescatar comida espacial liofilizada y bloques de hielo intactos.",
    choices: [
      {
        label: " Carrera y expedición con ROVI en el Cañón Marciano",
        costText: "Coste: -4 Energia [PWR] | Juegas: Carrera 3D de ROVI (+26 Agua [H2O] y +22 Comida [BIO])",
        cost: { energy: -4 },
        minigame: "MinigameRoverRace3D",
        minigameTitle: "Carrera del Rover ROVI en el Cañón Marciano",
        minigameBrief: "Pilota a ROVI en 3D por el cañón marciano esquivando rocas para recoger cristales de hielo puro y contenedores de víveres.",
        successReward: { water: 26, food: 22 },
        failReward: { water: 15, food: 12 },
        nasaFact: "Los rovers marcianos de la NASA como Curiosity y Perseverance exploran terrenos escarpados en busca de depósitos de hielo y minerales antiguos."
      },
      {
        label: " Analizar muestras del regolito con el láser PIXL en 3D",
        costText: "Coste: -3 Energia [PWR] | Juegas: Espectrometría Láser 3D (+22 Agua [H2O] y +18 Comida [BIO])",
        cost: { energy: -3 },
        minigame: "MinigamePixlLaser3D",
        minigameTitle: "Espectrometría Láser PIXL en 3D",
        minigameBrief: "Apunta el láser del espectrómetro PIXL a las muestras marcianas para identificar vetas de hielo y silicatos.",
        successReward: { water: 22, food: 18 },
        failReward: { water: 12, food: 10 },
        nasaFact: "El instrumento PIXL situado en el brazo del rover Perseverance utiliza un haz de rayos X y luz ultravioleta para mapear elementos químicos a escala milimétrica."
      },
      {
        label: " Usar las placas del contenedor para reforzar el refugio",
        costText: "Coste: -4 Energia [PWR] | Recompensa segura: +15% Escudo [DEF] y +15 Comida [BIO]",
        cost: { energy: -4 },
        minigame: null,
        successReward: { shield: 15, food: 15 },
        nasaFact: "El reciclaje de piezas de naves espaciales es una estrategia fundamental de ISRU (In-Situ Resource Utilization) para garantizar la supervivencia."
      }
    ]
  },

  // ================= FASE 3: RESOURCE HUNT (Soles 8-11) =================
  {
    sol: 8,
    phase: "FASE 3: RESOURCE HUNT",
    title: "Sol 8: Acumulación de Agua Pura",
    comm: "Houston: «Hemos superado el ecuador de la misión. A partir del Sol 12 prepararéis el cohete MAV. Necesitamos tanques de agua llenos para refrigeración.»",
    description: "Es momento de llenar las reservas al máximo nivel tanto para consumo de la tripulación como para los preparativos de despegue.",
    choices: [
      {
        label: " Purificar agua a gran escala mediante ósmosis y destilación",
        costText: "Coste: -4 Energia [PWR] | Juegas: Purificación de Agua (+30 Agua [H2O])",
        cost: { energy: -4 },
        minigame: "MinigameWaterFilter",
        minigameTitle: "Purificación de Agua y Percloratos",
        minigameBrief: "Filtra el agua del glaciar eliminando impurezas minerales y sales perclorato para llenar los tanques principales.",
        successReward: { water: 30 },
        failReward: { water: 16 },
        nasaFact: "En la Estación Espacial Internacional (ISS), el sistema ECLSS recicla hasta el 98% del agua utilizada por la tripulación."
      },
      {
        label: " Ciclo de transpiración vegetal en el Biodomo",
        costText: "Coste: -4 Energia [PWR] | Juegas: Cultivo Hidropónico (+16 Agua [H2O] y +22 Comida [BIO])",
        cost: { energy: -4 },
        minigame: "MinigameBiodome",
        minigameTitle: "Reciclaje Biológico en el Biodomo",
        minigameBrief: "Nutre las plantas para estimular la transpiración y condensa el vapor en agua dulce purísima.",
        successReward: { water: 16, food: 22 },
        failReward: { water: 10, food: 12 },
        nasaFact: "Las hojas de las plantas transpiran vapor de agua puro que, al ser condensado por los sistemas del hábitat, no requiere complejos tratamientos químicos."
      }
    ]
  },
  {
    sol: 9,
    phase: "FASE 3: RESOURCE HUNT",
    title: "Sol 9: Reserva de Oxígeno para el MAV",
    comm: "Houston: «La presión atmosférica hoy es favorable en Arcadia Planitia. Operad el reactor MOXIE para almacenar oxígeno en botellas criogénicas.»",
    description: "El cohete MAV necesita oxígeno líquido puro para combinarse con el metano de sus propulsores.",
    choices: [
      {
        label: " Producción de oxígeno de alta pureza con MOXIE",
        costText: "Coste: -4 Energia [PWR] | Juegas: Reactor MOXIE (+30 Oxigeno [O2])",
        cost: { energy: -4 },
        minigame: "MinigameMoxie",
        minigameTitle: "MOXIE: Producción Intensiva",
        minigameBrief: "Controla la temperatura de catálisis para condensar oxígeno puro en los acumuladores de alta presión.",
        successReward: { oxygen: 30 },
        failReward: { oxygen: 16 },
        nasaFact: "El oxidante líquido (oxígeno) representa cerca del 75% del peso de propelente que un cohete necesita para escapar de la gravedad marciana."
      },
      {
        label: "Sellado preventivo de conductos y juntas del hábitat",
        costText: "Coste: -4 Energia [PWR] | Juegas: Sellado de Fugas (+26 Oxigeno [O2] y +12 Energia [PWR])",
        cost: { energy: -4 },
        minigame: "MinigameLeakRepair",
        minigameTitle: "Sellado de Fugas y Aislamiento",
        minigameBrief: "Repara las juntas de ventilación para asegurar que ningún litro de oxígeno se escape.",
        successReward: { oxygen: 26, energy: 12 },
        failReward: { oxygen: 14, energy: 6 },
        nasaFact: "El mantenimiento del aislamiento térmico y neumático de los hábitats espaciales ahorra enormes cantidades de energía eléctrica diaria."
      }
    ]
  },
  {
    sol: 10,
    phase: "FASE 3: RESOURCE HUNT",
    title: "Sol 10: Tormenta Geomagnética DONKI",
    comm: "Houston: «Alerta solar de clase M registrada por DONKI. Proyectad la pantalla deflectora sobre el domo y los circuitos exteriores.»",
    description: "La radiación solar puede sobrecargar las placas de control del refugio. Debes interceptar la oleada de partículas.",
    choices: [
      {
        label: " Activar el protocolo de aseguramiento ante la tormenta",
        costText: "Coste: -4 Energia [PWR] | Juegas: Defensa de Tormenta (+24% Escudo [DEF] y +15 Oxigeno [O2])",
        cost: { energy: -4 },
        minigame: "MinigameDustDefense",
        minigameTitle: "Defensa ante Megatormenta Marciana",
        minigameBrief: "Bloquea los 4 sistemas críticos de la base (solar, antena, esclusa, rover) antes de que la tormenta impacte.",
        successReward: { shield: 24, oxygen: 15 },
        failReward: { shield: 10, oxygen: 8 },
        nasaFact: "El detector RAD de Curiosity midió la radiación en superficie para determinar el blindaje necesario para las misiones tripuladas de la NASA."
      },
      {
        label: " Paseo espacial EVA y reparación de paneles solares en 3D",
        costText: "Coste: -3 Energia [PWR] | Juegas: Reparación EVA 3D (+28 Energia [PWR] y +12% Escudo [DEF])",
        cost: { energy: -3 },
        minigame: "MinigameEvaRepair3D",
        minigameTitle: "Reparación Espacial EVA en 3D",
        minigameBrief: "Flota en gravedad cero con tu traje de astronauta y suelda los 5 componentes dañados de la nave.",
        successReward: { energy: 28, shield: 12 },
        failReward: { energy: 15, shield: 6 },
        nasaFact: "Los paseos espaciales (EVA) permiten a los astronautas realizar reparaciones complejas en el exterior de naves y estaciones espaciales."
      }
    ]
  },
  {
    sol: 11,
    phase: "FASE 3: RESOURCE HUNT",
    title: "Sol 11: Gran Cosecha de Espirulina",
    comm: "Houston: «Mañana empieza la secuencia de carga del cohete MAV. Aseguraos de cosechar alimentos suficientes para los últimos 4 Soles.»",
    description: "El biodomo hidropónico ha alcanzado su punto álgido de floración de microgreens y biomasa de microalgas.",
    choices: [
      {
        label: " Gran cosecha de microgreens y espirulina",
        costText: "Coste: -4 Agua [H2O] | Juegas: Cultivo Hidropónico (+32 Comida [BIO] y +12 Oxigeno [O2])",
        cost: { water: -4 },
        minigame: "MinigameBiodome",
        minigameTitle: "Gran Cosecha en el Biodomo",
        minigameBrief: "Nutre las 3 bandejas para maximizar el rendimiento nutricional antes de la recolección final.",
        successReward: { food: 32, oxygen: 12 },
        failReward: { food: 18, oxygen: 6 },
        nasaFact: "La espirulina es rica en proteínas completas, hierro y betacarotenos, tolerando condiciones controladas de luz y espacio reducido."
      },
      {
        label: " Extracción profunda de agua para la despensa",
        costText: "Coste: -4 Energia [PWR] | Juegas: Perforación Glaciar (+28 Agua [H2O] y +16 Energia [PWR])",
        cost: { energy: -4 },
        minigame: "MinigameDrill",
        minigameTitle: "Extracción Glaciar Profunda",
        minigameBrief: "Extrae los bloques de hielo más puros de la veta inferior para garantizar agua abundante en la Fase 4.",
        successReward: { water: 28, energy: 16 },
        failReward: { water: 15, energy: 8 },
        nasaFact: "El aprovechamiento de recursos in-situ (ISRU) garantiza que los astronautas no dependan de costosos envíos de agua desde la Tierra."
      }
    ]
  },

  // ================= FASE 4: GET OUT (Soles 12-15) =================
  {
    sol: 12,
    phase: "FASE 4: GET OUT",
    title: "Sol 12: MAV Etapa 1 — Enlace Eléctrico y Baterías",
    comm: "Houston: «La megatormenta de polvo está a 3 Soles de distancia. Conectad el cable de alta tensión al cohete MAV para encender su ordenador de vuelo.»",
    description: "¡Comienza la cuenta atrás para el regreso! Completar esta operación activa la Etapa 1/3 del cohete MAV.",
    choices: [
      {
        label: " Conectar línea eléctrica del MAV y limpiar paneles",
        costText: "Coste: -4 Oxigeno [O2] | Juegas: Mantenimiento Solar (Cohete MAV +1/3 y +26 Energia [PWR])",
        cost: { oxygen: -4 },
        minigame: "MinigameSolar",
        minigameTitle: "Enlace Eléctrico del MAV",
        minigameBrief: "Limpia las celdas solares exteriores y activa el relé para suministrar energía a los acumuladores del cohete MAV.",
        successReward: { mav: 1, energy: 26 },
        failReward: { mav: 1, energy: 14 },
        nasaFact: "El Vehículo de Ascenso a Marte (MAV) requiere energía eléctrica continua para mantener sus ordenadores calientes y listos para la secuencia de despegue."
      },
      {
        label: " Suministro eléctrico de respaldo desde el biodomo",
        costText: "Coste: -4 Agua [H2O] | Juegas: Cultivo Hidropónico (Cohete MAV +1/3, +18 Comida [BIO], +14 Energia [PWR])",
        cost: { water: -4 },
        minigame: "MinigameBiodome",
        minigameTitle: "Transferencia de Potencia al MAV",
        minigameBrief: "Ajusta los sistemas del biodomo para alimentar las baterías de a bordo del cohete.",
        successReward: { mav: 1, food: 18, energy: 14 },
        failReward: { mav: 1, food: 10, energy: 8 },
        nasaFact: "En emergencias espaciales, la tripulación deriva la potencia de módulos secundarios a los sistemas críticos de la nave de escape."
      }
    ]
  },
  {
    sol: 13,
    phase: "FASE 4: GET OUT",
    title: "Sol 13: MAV Etapa 2 — Carga Criogénica de Oxígeno",
    comm: "Houston: «Ordenador del MAV operativo (1/3). Ahora bombead el oxígeno líquido fabricado con MOXIE a los tanques de propelente.»",
    description: "Los motores del MAV usan metano criogénico y oxígeno líquido (LOX). Con esta operación completarás la Etapa 2/3.",
    choices: [
      {
        label: " Bombeo de oxígeno criogénico con el reactor MOXIE",
        costText: "Coste: -4 Energia [PWR] | Juegas: Reactor MOXIE (Cohete MAV +2/3 y +30 Oxigeno [O2])",
        cost: { energy: -4 },
        minigame: "MinigameMoxie",
        minigameTitle: "Bombeo Criogénico de Oxígeno al MAV",
        minigameBrief: "Sintetiza y comprime oxígeno a alta pureza para alimentar los depósitos criogénicos del cohete de retorno.",
        successReward: { mav: 1, oxygen: 30 },
        failReward: { mav: 1, oxygen: 15 },
        nasaFact: "Fabricar el propelente oxidante directamente en Marte ahorra tener que lanzar más de 25 toneladas de peso extra desde la superficie terrestre."
      },
      {
        label: " Sellado de tuberías criogénicas del cohete MAV",
        costText: "Coste: -4 Energia [PWR] | Juegas: Sellado de Fugas (Cohete MAV +2/3, +24 Oxigeno [O2], +14 Agua [H2O])",
        cost: { energy: -4 },
        minigame: "MinigameLeakRepair",
        minigameTitle: "Sellado de Válvulas Criogénicas",
        minigameBrief: "Sella las conexiones de presurización de combustible para asegurar un sellado hermético al 100%.",
        successReward: { mav: 1, oxygen: 24, water: 14 },
        failReward: { mav: 1, oxygen: 12, water: 8 },
        nasaFact: "Los gases criogénicos a -180 °C requieren juntas especiales de teflón y elastómeros que resistan temperaturas ultrabajas sin quebrarse."
      }
    ]
  },
  {
    sol: 14,
    phase: "FASE 4: GET OUT",
    title: "Sol 14: MAV Etapa 3 — Blindaje y Refrigeración de Toberas",
    comm: "Houston: «¡El frente de la megatormenta ya es visible en el horizonte! Completad la refrigeración y blindad la antena de guiado del MAV.»",
    description: "Último paso antes del Sol 15. Con esta operación el cohete quedará en estado 3/3 con sus motores listos para ignición.",
    choices: [
      {
        label: " Blindar la antena de guiado con el deflector DONKI",
        costText: "Coste: -4 Energia [PWR] | Juegas: Escudo DONKI (Cohete MAV 3/3, +20 Agua [H2O], +18 Comida [BIO])",
        cost: { energy: -4 },
        minigame: "MinigameShield",
        minigameTitle: "Blindaje de Guía del Cohete MAV",
        minigameBrief: "Defiende los sensores de vuelo del cohete frente a las partículas cargadas de estática del polvo marciano.",
        successReward: { mav: 1, water: 20, food: 18 },
        failReward: { mav: 1, water: 12, food: 10 },
        nasaFact: "Las tormentas de polvo en Marte generan fuertes descargas de electricidad estática en la atmósfera que pueden perturbar las antenas de telemetría."
      },
      {
        label: " Inyectar agua refrigerante en la plataforma de toberas",
        costText: "Coste: -4 Energia [PWR] | Juegas: Purificación de Agua (Cohete MAV 3/3, +26 Agua [H2O], +16 Energia [PWR])",
        cost: { energy: -4 },
        minigame: "MinigameWaterFilter",
        minigameTitle: "Refrigeración Acústica de Lanzamiento",
        minigameBrief: "Llena el sistema de amortiguación acústica por agua para absorber las ondas sónicas del encendido del motor.",
        successReward: { mav: 1, water: 26, energy: 16 },
        failReward: { mav: 1, water: 14, energy: 8 },
        nasaFact: "Las plataformas de lanzamiento utilizan potentes chorros de agua para amortiguar la tremenda onda de presión acústica que provocan los motores cohete."
      }
    ]
  },
  {
    sol: 15,
    phase: "FASE 4: GET OUT",
    title: "Sol 15: ¡Despegue en Medio de la Megatormenta!",
    comm: "Houston: «¡Ares-VII, vientos huracanados sobre Arcadia Planitia! Subid a la cabina del MAV con ROVI. ¡Iniciad la secuencia de encendido!»",
    description: "Estás dentro del cohete con ROVI. El radar confirma cielo despejado en órbita alta. ¡Estabiliza los reactores y enciende motores!",
    choices: [
      {
        label: " ¡IGNICIÓN DE MOTORES Y ASCENSO ORBITAL HACIA LAS ESTRELLAS!",
        costText: "Juegas: Ascenso Orbital 3D (+25 a todos los recursos para alcanzar la órbita marciana)",
        cost: {},
        minigame: "MinigameMavLaunch3D",
        minigameTitle: "Ascenso y Vuelo a Órbita del Cohete MAV",
        minigameBrief: "Pilota el cohete MAV en 3D atravesando los anillos de telemetría para escapar de la atmósfera hacia la órbita de Marte.",
        successReward: { water: 25, oxygen: 25, energy: 25, food: 25 },
        failReward: { water: 18, oxygen: 18, energy: 18, food: 18 },
        nasaFact: "El Vehículo de Ascenso a Marte tarda apenas unos 8 minutos en ascender desde la superficie para acoplarse con el Vehículo de Tránsito a la Tierra (ERV) en órbita."
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.MISSION_DAYS = MISSION_DAYS;
}
if (typeof global !== "undefined") {
  global.MISSION_DAYS = MISSION_DAYS;
}
