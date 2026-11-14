# MARS — LAST CHANCE
### Reto NASA Space Apps Challenge 2026: *Build a Junior Astronaut Mission Trainer*

**Mars — Last Chance** es un videojuego interactivo de supervivencia y entrenamiento espacial diseñado para niños y jóvenes cadetes de entre 7 y 12 años, con **campaña táctica 2D en Phaser 3**, **modo de exploración 3D en Three.js**, **minijuegos interactivos 2D y 3D** y un **diario de píldoras educativas espaciales**.

---

## 1. Sinopsis de la Misión
Año 2038. La misión tripulada **Ares-VII** sufre un aterrizaje forzoso en **Arcadia Planitia**, a 1 km del Vehículo de Ascenso a Marte (MAV).
Junto al rover asistente **ROVI**, tienes **15 Soles marcianos** para estabilizar los sistemas de soporte vital en el refugio **Outpost Beta**, acumular reservas mediante tecnologías científicas reales y preparar el cohete MAV antes de que una megatormenta global de polvo azote la región.

---

## 2. Modo Prototipo 3D vs. Vista 2D Clásica
El jugador puede alternar en cualquier momento entre ambos modos mediante el botón **`MODO 3D / VISTA 2D`**:
- **Vista 2D (Phaser 3):** Experiencia táctica de gestión día a día con eventos narrativos, Capcom Houston y toma de decisiones.
- **Prototipo 3D (Three.js):** Superficie marciana completa en tercera persona:
  - Control del astronauta con **[W,A,S,D]** o **[Flechas]**.
  - Salto en gravedad marciana (0.38g) con la **[Barra Espaciadora]**.
  - Giro de cámara en 360 grados arrastrando el ratón o deslizando en pantalla táctil.
  - Paisaje marciano con dunas, rocas basálticas, cráteres, atmósfera rojiza y Sol distante.
  - Cúpula Outpost Beta, Invernadero Biodomo translúcido, Parque Solar, Torre de Perforación de Hielo, Rover ROVI y Cohete MAV.
  - Detección de proximidad y activación de minijuegos con **`[E]`** al acercarse a las estaciones.

---

## 3. Minijuegos Educativos (2D y 3D en Three.js)
Todos los minijuegos cuentan con **Briefing previo con controles**, **puntuación escalonada por estrellas (3 Estrellas: Excelente)** y **recompensas de recursos inmediatas**:

### Nuevos Minijuegos 3D (Three.js):
1. **Carrera del Rover ROVI en el Cañón Marciano (3D):** Conduce a ROVI por una pista dinámica en un cañón escarpado, esquivando rocas basálticas y recogiendo cristales de hielo subterráneo y esferas de energía solar.
2. **Ascenso Orbital del Cohete MAV (3D):** Pilota el cohete de retorno MAV atravesando anillos holográficos de telemetría mientras el cielo pasa del atardecer rojizo marciano al negro espacial profundo con estrellas.
3. **Reparación Espacial EVA en Gravedad Cero (3D):** Paseo extravehicular en ingravidez donde el astronauta utiliza propulsores de traje y un láser de microsoldadura para reparar 4 paneles solares dañados.
4. **Espectrometría Láser PIXL 3D:** Apunta el brazo robótico del rover a una roca marciana giratoria para analizar sus minerales con pulsos láser ultravioleta.

### Minijuegos de Gestión Táctica 2D (Phaser 3):
5. **Reactor MOXIE:** Control térmico a 800 °C mediante aguja de presión para sintetizar oxígeno a partir del CO₂ atmosférico.
6. **Perforación Glaciar Arcadia:** Extracción de cristales de hielo subterráneo esquivando rocas basálticas.
7. **Mantenimiento Solar:** Limpieza táctil del polvo electrostático marciano y reactivación del interruptor maestro.
8. **Biodomo Hidropónico:** Riego y aporte lumínico balanceado a tres bandejas de cultivo (rábanos, espirulina y col).
9. **Escudo Deflector DONKI:** Intercepción de protones solares energéticos con la pala deflectora magnética.
10. **Purificación de Agua y Percloratos:** Filtrado en tres etapas (sedimentos, neutralización química y ósmosis inversa).
11. **Sellado de Fugas del Hábitat:** Parcheo con espuma polimérica de micro-fracturas causadas por micrometeoritos.
12. **Reparación Eléctrica y Conexión de Circuitos:** Puzzle de rotación de 4 relés para alinear el flujo de corriente entre paneles y baterías.
13. **Defensa de Tormentas:** Bloqueo rápido de los 4 sistemas críticos antes del impacto de un frente de arena.

---

## 4. Diario de Exploración Espacial (Píldoras Educativas)
El juego incorpora 10 píldoras de aprendizaje breve (1-3 frases) con datos científicos reales de la NASA para niños:
1. **Agua en Marte:** Glaciares de Arcadia Planitia y radar SHARAD de MRO.
2. **Oxígeno y MOXIE:** Electrólisis del CO₂ a 800 °C en el rover Perseverance.
3. **Gravedad Marciana:** Solo el 38% de la gravedad terrestre (pesamos menos de la mitad).
4. **Frío Extremo:** Noches de -65 °C y necesidad de calefacción continua.
5. **Tormentas de Polvo y Remolinos:** Dust Devils limpiando paneles solares.
6. **Paneles Solares e ISRU:** Aprovechamiento de recursos locales en Marte.
7. **Rovers Científicos:** Vehículos autónomos explorando el suelo extraterrestre.
8. **Cultivo Espacial (OSDR):** Microgreens y espirulina de ciclo rápido con luces LED.
9. **Radiación y Sistema DONKI:** Predicción de clima espacial y tormentas solares.
10. **Retraso en las Comunicaciones:** Ondas de radio tardando de 4 a 24 minutos en viajar a Houston.

Las píldoras se desbloquean al interactuar y jugar, mostrándose en una tarjeta flotante y guardándose en el **Diario de Exploración** accesible desde el HUD.

---

## 5. Equilibrio y Lógica de Supervivencia
- **Consumo Nocturno Equilibrado:** Consumo diario moderado (-5 Agua, -4 Oxígeno, -4 Energía, -5 Comida).
- **Producción Pasiva:** Un biodomo bien mantenido aporta nutrientes y regenera oxígeno diariamente.
- **Protocolo de Contingencia ROVI:** Si un recurso llega a cero por primera vez, ROVI inyecta la reserva de emergencia (+18%) dando al jugador un Sol de margen para reponerlo.
- **Simulación Matemática Verificada:** Tasas de supervivencia del 97% al 100% para todo tipo de jugadores.

---

## 6. Cómo Ejecutar el Proyecto

### Opción A (Servidor Local Node.js incluido):
```bash
node server.js
```
Abre tu navegador en: **`http://localhost:8080`**

### Opción B (Directo en Navegador):
Abre directamente **`index.html`** en cualquier navegador moderno (Chrome, Edge, Firefox, Safari).
*(Requiere conexión a internet para cargar Phaser 3 y Three.js desde sus CDN oficiales).*
