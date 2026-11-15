// js/minigameIntro.js — Mini-cinemáticas de introducción: muestran el PROBLEMA antes de cada minijuego
// Uso: MinigameIntro.play("MinigameMoxie", () => { /* arrancar minijuego */ });

const MinigameIntro = (() => {
  const W = 800;
  const H = 450;
  const FONT = "Fredoka, Nunito, sans-serif";

  // ---------------------------------------------------------------------------
  // Utilidades de dibujo compartidas
  // ---------------------------------------------------------------------------
  const D = {
    rnd(i) {
      const s = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
      return s - Math.floor(s);
    },
    blink(t, f) {
      return Math.sin(t * f) > 0;
    },
    label(ctx, txt, x, y, color, size, align) {
      ctx.fillStyle = color || "#ffffff";
      ctx.font = `700 ${size || 18}px ${FONT}`;
      ctx.textAlign = align || "center";
      ctx.textBaseline = "middle";
      ctx.fillText(txt, x, y);
    },
    rrect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    },
    sky(ctx, stops) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    },
    stars(ctx, t, n, yMax) {
      for (let i = 0; i < n; i++) {
        const x = D.rnd(i + 1) * W;
        const y = D.rnd(i + 99) * (yMax || H);
        const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i));
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(x, y, 2, 2);
      }
    },
    ground(ctx, y, c1, c2) {
      const g = ctx.createLinearGradient(0, y, 0, H);
      g.addColorStop(0, c1 || "#9a4128");
      g.addColorStop(1, c2 || "#4a1d12");
      ctx.fillStyle = g;
      ctx.fillRect(0, y, W, H - y);
    },
    bar(ctx, x, y, w, h, pct, color, text) {
      pct = Math.max(0, Math.min(1, pct));
      ctx.fillStyle = "rgba(2,6,23,0.8)";
      D.rrect(ctx, x, y, w, h, h / 2);
      ctx.fill();
      if (pct > 0.01) {
        ctx.fillStyle = color;
        D.rrect(ctx, x + 2, y + 2, Math.max(h - 4, (w - 4) * pct), h - 4, (h - 4) / 2);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      D.rrect(ctx, x, y, w, h, h / 2);
      ctx.stroke();
      if (text) D.label(ctx, `${text} ${Math.round(pct * 100)}%`, x + w / 2, y - 14, "#ffffff", 16);
    },
    dome(ctx, x, y, r, damaged) {
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = damaged ? "#fbbf24" : "#38bdf8";
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.45, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#475569";
      D.rrect(ctx, x + r * 0.15, y - r * 0.4, r * 0.3, r * 0.4, 6);
      ctx.fill();
      ctx.strokeStyle = "#94a3b8";
      ctx.beginPath();
      ctx.moveTo(x + r * 0.7, y - r * 0.7);
      ctx.lineTo(x + r * 0.7, y - r * 1.15);
      ctx.stroke();
    },
    rover(ctx, x, y, s) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.fillStyle = "#facc15";
      D.rrect(ctx, -34, -34, 68, 24, 6);
      ctx.fill();
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, -34);
      ctx.lineTo(18, -54);
      ctx.stroke();
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(10, -64, 18, 12);
      ctx.fillStyle = "#1e293b";
      [-26, 0, 26].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, -4, 9, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    },
    warnTriangle(ctx, x, y, s, t) {
      if (!D.blink(t, 7)) return;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s, y + s * 0.8);
      ctx.lineTo(x - s, y + s * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7c2d12";
      ctx.lineWidth = 3;
      ctx.stroke();
      D.label(ctx, "!", x, y + s * 0.25, "#7c2d12", s * 1.2);
    }
  };

  // ---------------------------------------------------------------------------
  // Escenas animadas (una por minijuego). t = segundos desde el inicio de la intro
  // ---------------------------------------------------------------------------
  const SCENES = {
    // 1. MOXIE: el oxígeno baja y el reactor se descontrola
    MinigameMoxie(ctx, t) {
      D.sky(ctx, ["#6b2f22", "#c2674a", "#e8a27c"]);
      D.ground(ctx, 345);
      D.dome(ctx, 190, 345, 95);
      const p = 0.62 - ((t % 6) / 6) * 0.55;
      D.bar(ctx, 60, 60, 260, 26, p, p < 0.3 ? "#ef4444" : "#38bdf8", "OXÍGENO (O₂)");
      if (p < 0.3 && D.blink(t, 8)) D.label(ctx, "¡Se acaba el aire!", 190, 112, "#fecaca", 20);

      ctx.fillStyle = "#334155";
      D.rrect(ctx, 440, 215, 170, 130, 14);
      ctx.fill();
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.stroke();
      D.label(ctx, "MOXIE", 525, 280, "#e2e8f0", 26);

      for (let i = 0; i < 7; i++) {
        const x = 462 + i * 22;
        const y = 120 + ((t * 55 + i * 41) % 95);
        ctx.fillStyle = "rgba(148,163,184,0.85)";
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        if (i % 3 === 0) D.label(ctx, "CO₂", x, y, "#0f172a", 8);
      }

      // Termómetro
      const top = 90;
      const bot = 340;
      const hh = bot - top;
      ctx.fillStyle = "#0f172a";
      D.rrect(ctx, 665, top, 36, hh, 14);
      ctx.fill();
      ctx.fillStyle = "rgba(74,222,128,0.5)";
      ctx.fillRect(667, bot - hh * 0.74, 32, hh * 0.12);
      D.label(ctx, "800 °C", 683, bot - hh * 0.68, "#bbf7d0", 11);
      const m = 0.5 + 0.38 * Math.sin(t * 1.6);
      const ok = m > 0.62 && m < 0.74;
      ctx.fillStyle = ok ? "#4ade80" : "#ef4444";
      ctx.fillRect(669, bot - hh * m, 28, hh * m - 4);
      D.label(ctx, "¡Temperatura inestable!", 640, 62, "#fde68a", 16);
    },

    // 2. DRILL: depósito de agua vacío y hielo bajo tierra
    MinigameDrill(ctx, t) {
      D.sky(ctx, ["#7a3b2a", "#d98b66"]);
      ctx.fillStyle = "#8b3a24";
      ctx.fillRect(0, 160, W, 290);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.12 + i * 0.08})`;
        ctx.fillRect(0, 160 + i * 72, W, 72);
      }
      for (let i = 0; i < 9; i++) {
        const x = 90 + D.rnd(i + 5) * 620;
        const y = 230 + D.rnd(i + 17) * 170;
        const ice = i % 3 !== 0;
        ctx.fillStyle = ice ? "#7dd3fc" : "#5a1f12";
        ctx.beginPath();
        if (ice) {
          ctx.moveTo(x, y - 18); ctx.lineTo(x + 13, y); ctx.lineTo(x, y + 18); ctx.lineTo(x - 13, y);
        } else {
          ctx.arc(x, y, 18, 0, Math.PI * 2);
        }
        ctx.closePath();
        ctx.fill();
        if (ice) {
          ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))})`;
          ctx.fillRect(x - 3, y - 8, 4, 4);
        }
      }
      // Torre de perforación
      ctx.fillStyle = "#475569";
      ctx.fillRect(385, 80, 30, 80);
      const depth = 160 + 90 * Math.abs(Math.sin(t * 1.4));
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(400, 160);
      ctx.lineTo(400, depth);
      ctx.stroke();
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(388, depth); ctx.lineTo(412, depth); ctx.lineTo(400, depth + 22);
      ctx.fill();
      // Depósito de agua casi vacío
      ctx.fillStyle = "#1e293b";
      D.rrect(ctx, 60, 50, 130, 100, 12);
      ctx.fill();
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(66, 134, 118, 12);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      D.rrect(ctx, 60, 50, 130, 100, 12);
      ctx.stroke();
      D.label(ctx, D.blink(t, 6) ? "AGUA 5%" : "AGUA", 125, 90, "#fecaca", 20);
      D.label(ctx, "¡Hay hielo bajo el suelo!", 600, 110, "#bae6fd", 18);
    },

    // 3. SOLAR: paneles cubiertos de polvo
    MinigameSolar(ctx, t) {
      D.sky(ctx, ["#8a4a30", "#d9906a", "#f3c79c"]);
      D.ground(ctx, 360);
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(680, 80, 42, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + t * 0.3;
        ctx.strokeStyle = "rgba(253,224,71,0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(680 + Math.cos(a) * 52, 80 + Math.sin(a) * 52);
        ctx.lineTo(680 + Math.cos(a) * 72, 80 + Math.sin(a) * 72);
        ctx.stroke();
      }
      for (let k = 0; k < 3; k++) {
        const px = 70 + k * 230;
        ctx.fillStyle = "#1e3a8a";
        ctx.beginPath();
        ctx.moveTo(px + 30, 170); ctx.lineTo(px + 190, 170); ctx.lineTo(px + 170, 290); ctx.lineTo(px + 10, 290);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#93c5fd";
        ctx.lineWidth = 2;
        ctx.stroke();
        for (let g = 1; g < 4; g++) {
          ctx.beginPath();
          ctx.moveTo(px + 30 - g * 5, 170 + g * 30);
          ctx.lineTo(px + 190 - g * 5, 170 + g * 30);
          ctx.stroke();
        }
        ctx.fillStyle = "#475569";
        ctx.fillRect(px + 96, 290, 8, 70);
        for (let d = 0; d < 6; d++) {
          const dx = px + 30 + D.rnd(k * 10 + d) * 140;
          const dy = 180 + D.rnd(k * 10 + d + 50) * 100;
          const r = 14 + 6 * Math.sin(t * 2 + d);
          ctx.fillStyle = "rgba(217,107,67,0.9)";
          ctx.beginPath();
          ctx.arc(dx, dy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      D.bar(ctx, 60, 60, 240, 26, 0.12 + 0.05 * Math.sin(t * 3), "#ef4444", "BATERÍA");
      D.label(ctx, "¡El polvo tapa el Sol!", 400, 400, "#fff7ed", 22);
    },

    // 4. BIODOME: plantas marchitas
    MinigameBiodome(ctx, t) {
      D.sky(ctx, ["#0f2a1d", "#14532d"]);
      ctx.fillStyle = "rgba(244,114,182,0.15)";
      ctx.fillRect(0, 0, W, H);
      const cyc = (t % 5) / 5;
      for (let k = 0; k < 3; k++) {
        const cx = 150 + k * 250;
        ctx.fillStyle = "#334155";
        D.rrect(ctx, cx - 100, 300, 200, 70, 10);
        ctx.fill();
        ctx.fillStyle = "#5b3a24";
        ctx.fillRect(cx - 92, 306, 184, 24);
        const vit = Math.max(0.1, 0.9 - cyc * 0.8 - k * 0.05);
        const droop = (1 - vit) * 40;
        const col = vit > 0.5 ? "#22c55e" : vit > 0.3 ? "#a3a82a" : "#a16207";
        for (let s = -1; s <= 1; s++) {
          const sx = cx + s * 45;
          ctx.strokeStyle = col;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(sx, 306);
          ctx.quadraticCurveTo(sx, 240, sx + droop * (s || 1), 250 + droop * 0.5);
          ctx.stroke();
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.ellipse(sx + droop * (s || 1), 248 + droop * 0.6, 20, 11, droop * 0.03 * (s || 1), 0, Math.PI * 2);
          ctx.fill();
        }
        D.bar(ctx, cx - 80, 130, 160, 20, vit, vit > 0.5 ? "#4ade80" : "#ef4444", "Vitalidad");
        if (vit < 0.5 && D.blink(t, 7)) D.label(ctx, "¡Tengo sed!", cx, 205, "#fde68a", 18);
      }
      D.label(ctx, "Las plantas necesitan agua y luz para dar comida", 400, 410, "#bbf7d0", 18);
    },

    // 5. SHIELD: lluvia de partículas solares
    MinigameShield(ctx, t) {
      D.sky(ctx, ["#1a0b2e", "#4c1d3a", "#7f2a2a"]);
      D.stars(ctx, t, 50, 200);
      const pulse = 1 + 0.08 * Math.sin(t * 4);
      const g = ctx.createRadialGradient(400, 10, 10, 400, 10, 120 * pulse);
      g.addColorStop(0, "#fff7ae");
      g.addColorStop(0.4, "#fbbf24");
      g.addColorStop(1, "rgba(251,191,36,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(400, 10, 120 * pulse, 0, Math.PI * 2);
      ctx.fill();
      D.ground(ctx, 380, "#7a2f1c", "#3c150d");
      D.dome(ctx, 400, 380, 80, true);
      let hits = 0;
      for (let i = 0; i < 26; i++) {
        const ph = (t * 0.45 + D.rnd(i + 3)) % 1;
        const x = 400 + (D.rnd(i + 40) - 0.5) * 560 * ph;
        const y = 20 + ph * 360;
        ctx.fillStyle = "#facc15";
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (ph > 0.96 && Math.abs(x - 400) < 80) hits++;
      }
      if (D.blink(t, 6)) {
        ctx.fillStyle = "rgba(239,68,68,0.25)";
        ctx.beginPath();
        ctx.arc(400, 380, 82, Math.PI, 0);
        ctx.fill();
      }
      D.bar(ctx, 40, 60, 220, 26, 0.55 - ((t % 6) / 6) * 0.35, "#ef4444", "ESCUDO");
      D.label(ctx, "¡Tormenta de radiación solar!", 600, 100, "#fde68a", 20);
    },

    // 6. WATERFILTER: agua sucia con percloratos
    MinigameWaterFilter(ctx, t) {
      D.sky(ctx, ["#0f172a", "#1e293b"]);
      // Depósito de agua turbia
      ctx.fillStyle = "#334155";
      D.rrect(ctx, 80, 110, 300, 240, 16);
      ctx.fill();
      ctx.save();
      D.rrect(ctx, 90, 120, 280, 220, 12);
      ctx.clip();
      ctx.fillStyle = "#7a5a2a";
      ctx.beginPath();
      ctx.moveTo(90, 340);
      for (let x = 90; x <= 370; x += 10) ctx.lineTo(x, 175 + Math.sin(x * 0.05 + t * 3) * 6);
      ctx.lineTo(370, 340);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 16; i++) {
        const x = 110 + ((D.rnd(i) * 240 + Math.sin(t + i) * 12 + 240) % 240);
        const y = 200 + ((D.rnd(i + 30) * 130 + t * 18 + i * 9) % 130);
        ctx.fillStyle = "rgba(220,38,38,0.85)";
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        if (i % 4 === 0) D.label(ctx, "ClO₄", x, y - 12, "#fecaca", 9);
      }
      ctx.restore();
      D.label(ctx, "AGUA TURBIA", 230, 90, "#e2e8f0", 20);
      // Vaso con aviso
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(520, 200); ctx.lineTo(540, 340); ctx.lineTo(640, 340); ctx.lineTo(660, 200);
      ctx.stroke();
      ctx.fillStyle = "#7a5a2a";
      ctx.beginPath();
      ctx.moveTo(526, 235); ctx.lineTo(541, 336); ctx.lineTo(639, 336); ctx.lineTo(654, 235);
      ctx.fill();
      D.label(ctx, "NO POTABLE", 590, 160, D.blink(t, 6) ? "#fca5a5" : "#ffffff", 22);
      D.warnTriangle(ctx, 590, 100, 22, t);
      // Tubería
      ctx.fillStyle = "#64748b";
      ctx.fillRect(380, 280, 140, 14);
      D.label(ctx, "Los percloratos son tóxicos", 400, 405, "#fde68a", 18);
    },

    // 7. LEAKREPAIR: fugas de aire
    MinigameLeakRepair(ctx, t) {
      D.sky(ctx, ["#0b1220", "#1e293b"]);
      ctx.fillStyle = "#1e293b";
      D.rrect(ctx, 40, 50, 520, 350, 22);
      ctx.fill();
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 5;
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const x = 90 + D.rnd(i + 8) * 420;
        const y = 100 + D.rnd(i + 20) * 250;
        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.arc(x, y, 10 + 2 * Math.sin(t * 5 + i), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.stroke();
        for (let p = 0; p < 4; p++) {
          const ph = (t * 1.2 + p * 0.25 + i * 0.13) % 1;
          ctx.fillStyle = `rgba(186,230,253,${1 - ph})`;
          ctx.beginPath();
          ctx.arc(x + (p - 1.5) * 12 * ph, y - ph * 40, 4 + ph * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        D.label(ctx, "¡Fuga!", x, y + 24, "#7dd3fc", 12);
      }
      // Manómetro
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(680, 220, 86, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 4;
      ctx.stroke();
      const prog = (t % 6) / 6;
      const ang = Math.PI * (0.85 + (1 - (1 - prog * 0.8)) * 0 + 0.0) - prog * Math.PI * 0.7 + Math.PI * 0.2;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(680, 220);
      ctx.lineTo(680 + Math.cos(ang - Math.PI * 0.9) * 66, 220 + Math.sin(ang - Math.PI * 0.9) * 66);
      ctx.stroke();
      D.label(ctx, "PRESIÓN", 680, 262, "#e2e8f0", 14);
      D.label(ctx, D.blink(t, 6) ? "¡BAJANDO!" : "", 680, 330, "#fca5a5", 20);
    },

    // 8. CIRCUIT: relés desalineados, lámpara apagada
    MinigameCircuit(ctx, t) {
      D.sky(ctx, ["#0b1220", "#172036"]);
      D.bar(ctx, 40, 90, 140, 24, 0.1, "#ef4444", "");
      D.label(ctx, "BATERÍA", 110, 70, "#e2e8f0", 16);
      const rx = [250, 380, 510];
      const ry = [200, 270, 200];
      ctx.strokeStyle = "#475569";
      ctx.setLineDash([10, 8]);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(180, 102);
      ctx.lineTo(220, 102);
      ctx.lineTo(220, 200);
      ctx.moveTo(280, 200);
      ctx.lineTo(380, 235);
      ctx.moveTo(380, 305);
      ctx.lineTo(510, 235);
      ctx.moveTo(540, 200);
      ctx.lineTo(620, 200);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "#1e293b";
        D.rrect(ctx, rx[i] - 36, ry[i] - 36, 72, 72, 10);
        ctx.fill();
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.save();
        ctx.translate(rx[i], ry[i]);
        ctx.rotate(Math.sin(t * 1.3 + i * 2) * 1.3 + i);
        ctx.fillStyle = "#ffd000";
        ctx.fillRect(-24, -6, 48, 12);
        ctx.restore();
      }
      // Chispas en los huecos
      [[290, 215], [445, 270], [525, 200]].forEach((p, i) => {
        if (D.blink(t * 2 + i, 9)) {
          ctx.strokeStyle = "#fde047";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(p[0] - 8, p[1] - 8); ctx.lineTo(p[0] + 2, p[1]); ctx.lineTo(p[0] - 4, p[1] + 2); ctx.lineTo(p[0] + 8, p[1] + 10);
          ctx.stroke();
        }
      });
      // Lámpara apagada
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(680, 200, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 4;
      ctx.stroke();
      D.label(ctx, "SIN LUZ", 680, 260, "#fca5a5", 16);
      D.label(ctx, "La corriente no llega: ¡hay que alinear los relés!", 400, 400, "#fde68a", 18);
    },

    // 9. ROVERDRIVE: balizas y cráteres
    MinigameRoverDrive(ctx, t) {
      ctx.fillStyle = "#7a3320";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      [[200, 150, 36], [480, 300, 44], [620, 130, 30], [330, 330, 26]].forEach(c => {
        ctx.fillStyle = "#170f1a";
        ctx.beginPath();
        ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#8a3822";
        ctx.lineWidth = 4;
        ctx.stroke();
        D.label(ctx, "Cráter", c[0], c[1], "#fb7185", 11);
      });
      [[110, 90], [700, 230], [260, 390], [560, 60]].forEach((b, i) => {
        const r = 14 + 4 * Math.sin(t * 4 + i);
        ctx.fillStyle = "rgba(56,189,248,0.35)";
        ctx.beginPath();
        ctx.arc(b[0], b[1], r + 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(b[0], b[1], r, 0, Math.PI * 2);
        ctx.fill();
        D.label(ctx, "?", b[0], b[1], "#0c4a6e", 16);
      });
      const px = 400 + Math.cos(t * 0.8) * 250;
      const py = 225 + Math.sin(t * 1.6) * 130;
      const ang = Math.atan2(Math.cos(t * 1.6) * 208, -Math.sin(t * 0.8) * 200);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(ang);
      ctx.fillStyle = "#facc15";
      D.rrect(ctx, -24, -15, 48, 30, 6);
      ctx.fill();
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-20, -20, 14, 6); ctx.fillRect(6, -20, 14, 6); ctx.fillRect(-20, 14, 14, 6); ctx.fillRect(6, 14, 14, 6);
      ctx.restore();
      D.label(ctx, "Hay suministros por señalizar... ¡y cráteres peligrosos!", 400, 425, "#fff7ed", 18);
    },

    // 10. SPECTRO: rocas desconocidas
    MinigameSpectro(ctx, t) {
      D.sky(ctx, ["#0b1220", "#1b2540"]);
      ctx.fillStyle = "rgba(56,189,248,0.07)";
      for (let i = 0; i < W; i += 30) ctx.fillRect(i, 0, 1, H);
      const colors = ["#475569", "#a1a1aa", "#b45309", "#7f1d1d"];
      for (let k = 0; k < 4; k++) {
        const px = 120 + k * 187;
        const py = 280 + Math.sin(t * 1.5 + k) * 6;
        ctx.fillStyle = colors[k];
        ctx.beginPath();
        ctx.moveTo(px - 45, py - 20); ctx.lineTo(px, py - 55); ctx.lineTo(px + 48, py - 15); ctx.lineTo(px + 38, py + 40); ctx.lineTo(px - 30, py + 38);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.stroke();
        const a = 0.5 + 0.5 * Math.abs(Math.sin(t * 2 + k));
        D.label(ctx, "?", px, py - 100 - a * 8, `rgba(251,191,36,${0.5 + a * 0.5})`, 44);
      }
      const sx = 120 + (Math.floor(t / 1.2) % 4) * 187;
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, 40);
      ctx.lineTo(sx + (Math.sin(t * 20) * 4), 230);
      ctx.stroke();
      ctx.fillStyle = "#334155";
      ctx.fillRect(sx - 16, 20, 32, 26);
      D.label(ctx, "¿De qué están hechas estas rocas?", 400, 410, "#bae6fd", 20);
    },

    // 11. DUSTDEFENSE: muro de polvo que se acerca
    MinigameDustDefense(ctx, t) {
      D.sky(ctx, ["#7a3b2a", "#c2674a", "#e2a275"]);
      D.ground(ctx, 360);
      D.dome(ctx, 160, 360, 70);
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(250, 300, 70, 12);
      ctx.fillStyle = "#475569";
      ctx.fillRect(282, 312, 6, 48);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(380, 360); ctx.lineTo(380, 270);
      ctx.moveTo(350, 285); ctx.quadraticCurveTo(380, 250, 410, 285);
      ctx.stroke();
      const prog = (t % 7) / 7;
      const front = 800 - prog * 480;
      for (let i = 0; i < 70; i++) {
        const x = front + D.rnd(i) * 420 - 40 + Math.sin(t * 2 + i) * 14;
        const y = 80 + D.rnd(i + 200) * 300;
        ctx.fillStyle = `rgba(${150 + D.rnd(i + 5) * 40},${100 + D.rnd(i + 9) * 30},60,0.55)`;
        ctx.beginPath();
        ctx.arc(x, y, 26 + D.rnd(i + 7) * 30, 0, Math.PI * 2);
        ctx.fill();
      }
      D.label(ctx, `¡Megatormenta en ${Math.max(1, Math.ceil(7 - prog * 7))} s!`, 400, 50, D.blink(t, 6) ? "#fecaca" : "#ffffff", 26);
      D.label(ctx, "Paneles, antena, hábitat... ¡todo debe asegurarse!", 400, 415, "#fff7ed", 18);
    },

    // 12. ROVER RACE 3D: cañón en perspectiva con rocas
    MinigameRoverRace3D(ctx, t) {
      D.sky(ctx, ["#8a4a30", "#e0a07a"]);
      const hz = 150;
      ctx.fillStyle = "#6e2a18";
      ctx.beginPath();
      ctx.moveTo(0, hz - 40); ctx.lineTo(260, hz - 40); ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(W, hz - 40); ctx.lineTo(540, hz - 40); ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#933c24";
      ctx.beginPath();
      ctx.moveTo(300, hz); ctx.lineTo(500, hz); ctx.lineTo(W + 100, H); ctx.lineTo(-100, H);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 8; i++) {
        const p = ((t * 0.5 + i / 8) % 1);
        const y = hz + (H - hz) * p * p;
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(400 - (100 + 340 * p), y, (100 + 340 * p) * 2, 4 + 10 * p);
      }
      const lanes = [-1, 0, 1];
      const objs = [];
      for (let i = 0; i < 7; i++) {
        const p = ((t * 0.32 + i / 7) % 1);
        objs.push({ p, lane: lanes[Math.floor(D.rnd(i + 11) * 3)], rock: i % 2 === 0 });
      }
      objs.sort((a, b) => a.p - b.p);
      objs.forEach(o => {
        const y = hz + (H - hz) * o.p * o.p;
        const x = 400 + o.lane * (30 + 250 * o.p);
        const s = 6 + 50 * o.p;
        ctx.fillStyle = o.rock ? "#4a1a10" : "#38bdf8";
        ctx.strokeStyle = o.rock ? "#fb7185" : "#e0f2fe";
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (o.rock) {
          ctx.arc(x, y - s * 0.5, s, 0, Math.PI * 2);
        } else {
          ctx.moveTo(x, y - s * 1.6); ctx.lineTo(x + s * 0.7, y - s * 0.7); ctx.lineTo(x, y); ctx.lineTo(x - s * 0.7, y - s * 0.7);
          ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();
      });
      // Rover visto por detrás
      const rx = 400 + Math.sin(t * 1.4) * 120;
      ctx.fillStyle = "#facc15";
      D.rrect(ctx, rx - 40, 360, 80, 40, 8);
      ctx.fill();
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(rx - 50, 385, 18, 30); ctx.fillRect(rx + 32, 385, 18, 30);
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(rx - 10, 335, 20, 28);
      D.label(ctx, "¡Rocas por el camino!", 400, 50, "#fff7ed", 24);
    },

    // 13. MAV LAUNCH 3D: ascenso hasta la órbita
    MinigameMavLaunch3D(ctx, t) {
      const prog = (t % 8) / 8;
      const r1 = Math.round(184 * (1 - prog)), g1 = Math.round(75 * (1 - prog)), b1 = Math.round(46 * (1 - prog) + 30 * prog);
      ctx.fillStyle = `rgb(${r1},${g1},${b1})`;
      ctx.fillRect(0, 0, W, H);
      D.stars(ctx, t, 90, H);
      if (prog < 0.7) {
        ctx.fillStyle = "#933c24";
        ctx.fillRect(0, 380 + prog * 500, W, 300);
      }
      // Anillos
      for (let i = 0; i < 4; i++) {
        const p = ((t * 0.35 + i / 4) % 1);
        const s = 6 + p * 130;
        const cx = 400 + Math.sin(i * 2.3) * 120 * p;
        const cy = 210 + Math.cos(i * 1.7) * 60 * p;
        ctx.strokeStyle = `rgba(34,197,94,${0.4 + p * 0.6})`;
        ctx.lineWidth = 3 + p * 6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, s, s * 0.9, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Cohete
      const bob = Math.sin(t * 8) * 2;
      const rx = 400 + bob;
      ctx.fillStyle = "#f8fafc";
      D.rrect(ctx, rx - 22, 250, 44, 110, 14);
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(rx - 22, 252); ctx.lineTo(rx, 200); ctx.lineTo(rx + 22, 252);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.moveTo(rx - 22, 330); ctx.lineTo(rx - 44, 372); ctx.lineTo(rx - 22, 360);
      ctx.moveTo(rx + 22, 330); ctx.lineTo(rx + 44, 372); ctx.lineTo(rx + 22, 360);
      ctx.fill();
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(rx, 285, 9, 0, Math.PI * 2);
      ctx.fill();
      const fl = 40 + Math.random() * 25;
      const fg = ctx.createLinearGradient(0, 360, 0, 360 + fl);
      fg.addColorStop(0, "#e0f2fe");
      fg.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(rx - 14, 360); ctx.lineTo(rx, 360 + fl); ctx.lineTo(rx + 14, 360);
      ctx.fill();
      D.label(ctx, "¡Hay que llegar a la órbita para volver a casa!", 400, 50, "#fff7ed", 20);
      D.label(ctx, `Altitud: ${Math.round(prog * 400)} km`, 90, 420, "#bae6fd", 16);
    },

    // 14. EVA 3D: panel dañado en la estación
    MinigameEvaRepair3D(ctx, t) {
      D.sky(ctx, ["#020617", "#0b1030"]);
      D.stars(ctx, t, 110, H);
      const g = ctx.createRadialGradient(400, 560, 80, 400, 560, 330);
      g.addColorStop(0, "#d9663f");
      g.addColorStop(1, "#6e2a18");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(400, 560, 330, 0, Math.PI * 2);
      ctx.fill();
      // Estación
      ctx.fillStyle = "#e2e8f0";
      D.rrect(ctx, 290, 180, 220, 70, 30);
      ctx.fill();
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.stroke();
      for (let k = 0; k < 4; k++) {
        const left = k < 2;
        const row = k % 2;
        const x = left ? 80 : 530;
        const y = 150 + row * 80;
        const broken = k === 0 || k === 3;
        ctx.fillStyle = broken ? "#3b3b4f" : "#1e3a8a";
        ctx.fillRect(x, y, 190, 60);
        ctx.strokeStyle = "#93c5fd";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 190, 60);
        if (broken) {
          ctx.strokeStyle = "#ef4444";
          ctx.beginPath();
          ctx.moveTo(x + 40, y); ctx.lineTo(x + 80, y + 30); ctx.lineTo(x + 60, y + 60);
          ctx.stroke();
          if (D.blink(t * 1.3 + k, 9)) {
            ctx.fillStyle = "#fde047";
            ctx.beginPath();
            ctx.arc(x + 80, y + 30, 8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(270, 215); ctx.lineTo(270, 215);
      ctx.moveTo(290, 215); ctx.lineTo(270, 215);
      ctx.moveTo(510, 215); ctx.lineTo(530, 215);
      ctx.stroke();
      // Astronauta flotando
      const ax = 400 + Math.sin(t * 0.9) * 90;
      const ay = 330 + Math.cos(t * 1.3) * 18;
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(Math.sin(t * 0.7) * 0.4);
      ctx.fillStyle = "#475569";
      ctx.fillRect(-20, -14, 14, 38);
      ctx.fillStyle = "#ffffff";
      D.rrect(ctx, -16, -14, 32, 42, 10);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -26, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(0, -26, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      D.label(ctx, "¡Paneles solares dañados! Sin gravedad... ¡a flotar y reparar!", 400, 410, "#fde68a", 18);
    },

    // 15. PIXL 3D: roca con minerales desconocidos
    MinigamePixlLaser3D(ctx, t) {
      D.sky(ctx, ["#050a18", "#101a38"]);
      D.stars(ctx, t, 40, H);
      const cx = 400, cy = 250;
      const rg = ctx.createRadialGradient(cx - 30, cy - 40, 20, cx, cy, 130);
      rg.addColorStop(0, "#c2573a");
      rg.addColorStop(1, "#5a1f12");
      ctx.fillStyle = rg;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + t * 0.4;
        const r = 120 + 14 * Math.sin(i * 2.1) ;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.9;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fecaca";
      ctx.lineWidth = 2;
      ctx.stroke();
      const mc = ["#38bdf8", "#4ade80", "#facc15", "#f43f5e"];
      for (let m = 0; m < 4; m++) {
        const a = t * 0.9 + (m * Math.PI) / 2;
        const x = cx + Math.cos(a) * 80;
        const y = cy + Math.sin(a * 1.0) * 30 + Math.sin(a) * 20 - 10;
        if (Math.sin(a) > -0.2) {
          ctx.fillStyle = mc[m];
          ctx.beginPath();
          ctx.arc(x, y, 14 + 2 * Math.sin(t * 5 + m), 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
          D.label(ctx, "?", x, y, "#0f172a", 16);
        }
      }
      // Cabezal láser
      const lx = cx + Math.sin(t * 1.2) * 90;
      ctx.fillStyle = "#334155";
      D.rrect(ctx, lx - 14, 40, 28, 40, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(74,222,128,0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lx, 80);
      ctx.lineTo(lx, cy - 20);
      ctx.stroke();
      D.label(ctx, "¿Qué minerales esconde esta roca?", 400, 415, "#bae6fd", 20);
    }
  };

  // ---------------------------------------------------------------------------
  // Texto del problema para cada minijuego
  // ---------------------------------------------------------------------------
  const INFO = {
    MinigameMoxie: {
      title: "Se acaba el oxígeno",
      problem: "El aire del hábitat se está agotando y en Marte no se puede respirar. El reactor MOXIE convierte el CO₂ marciano en oxígeno, pero solo funciona si se mantiene a 800 °C... ¡y ahora la temperatura se descontrola!",
      goal: "Mantén la aguja en la zona verde."
    },
    MinigameDrill: {
      title: "El depósito de agua está casi vacío",
      problem: "Sin agua no hay bebida, ni cultivos, ni combustible. Pero hay buenas noticias: bajo el suelo de Arcadia Planitia hay hielo. Tienes que perforar sin chocar contra las rocas duras.",
      goal: "Recoge cristales de hielo y esquiva las rocas."
    },
    MinigameSolar: {
      title: "Paneles solares cubiertos de polvo",
      problem: "El polvo rojo de Marte tapa los paneles y casi no llega luz solar. Con las baterías casi a cero, la base se quedará sin calefacción ni electricidad.",
      goal: "Limpia todo el polvo y reconecta el sistema."
    },
    MinigameBiodome: {
      title: "¡Las plantas se marchitan!",
      problem: "El biodomo es nuestra granja: sin cultivos no hay comida fresca. Las plantas se están secando porque necesitan agua y luz LED a tiempo.",
      goal: "Riega cada bandeja antes de que pierda vitalidad."
    },
    MinigameShield: {
      title: "Tormenta de radiación solar",
      problem: "Marte casi no tiene campo magnético que nos proteja. Una llamarada del Sol lanza protones que dañan la base y a la tripulación. El escudo se debilita con cada impacto.",
      goal: "Mueve el deflector e intercepta las partículas."
    },
    MinigameWaterFilter: {
      title: "El agua no se puede beber",
      problem: "El hielo marciano trae percloratos, unas sales tóxicas para las personas. Si bebemos esta agua tal cual, enfermaremos. Hay que depurarla paso a paso.",
      goal: "Activa los 3 filtros en el orden correcto."
    },
    MinigameLeakRepair: {
      title: "¡Fugas de aire en el hábitat!",
      problem: "Pequeños micrometeoritos han agujereado la pared y el aire escapa al exterior. La presión baja y, si no actuamos rápido, no podremos respirar dentro de la base.",
      goal: "Sella las 5 fugas con espuma antes de perder presión."
    },
    MinigameCircuit: {
      title: "Circuito eléctrico roto",
      problem: "Los relés se han desalineado por las vibraciones y la corriente no llega a las baterías. Sin electricidad se apagan las luces y los sistemas de soporte vital.",
      goal: "Gira cada relé hasta alinear el circuito."
    },
    MinigameRoverDrive: {
      title: "Suministros por localizar",
      problem: "Las cápsulas de suministros han caído lejos de la base, en un terreno lleno de cráteres. Debemos balizarlas para recuperarlas, pero un error al conducir y ROVI quedará atrapado.",
      goal: "Conduce hasta las 4 balizas sin caer en un cráter."
    },
    MinigameSpectro: {
      title: "Rocas misteriosas",
      problem: "Hemos recogido cuatro rocas marcianas y no sabemos qué contienen. Analizar sus minerales nos dirá dónde hay agua y qué materiales podemos aprovechar.",
      goal: "Dispara el láser PIXL a cada muestra."
    },
    MinigameDustDefense: {
      title: "¡Llega la megatormenta!",
      problem: "Un enorme muro de polvo se acerca a la base a gran velocidad. Si el viento pilla los paneles, la antena o los depósitos sin proteger, podría destrozarlos.",
      goal: "Asegura los 4 sistemas críticos antes de que llegue."
    },
    MinigameRoverRace3D: {
      title: "Carrera por el cañón marciano",
      problem: "Para encontrar hielo, ROVI debe cruzar un cañón lleno de rocas afiladas. Si choca con ellas se dañará, y los cristales azules del camino son justo lo que necesitamos.",
      goal: "Esquiva las rocas y recoge los cristales."
    },
    MinigameMavLaunch3D: {
      title: "Hora de volver a casa",
      problem: "Para regresar a la Tierra, el cohete MAV debe vencer la gravedad de Marte y alcanzar la órbita. Una mala trayectoria gastaría el combustible antes de llegar.",
      goal: "Atraviesa los anillos verdes hasta la órbita."
    },
    MinigameEvaRepair3D: {
      title: "Paneles dañados en el espacio",
      problem: "Dos paneles solares de la estación están rotos y sueltan chispas. Hay que salir al exterior con el traje, flotar en gravedad cero y soldarlos antes de perder la energía.",
      goal: "Acércate a cada panel y mantén el láser para repararlo."
    },
    MinigamePixlLaser3D: {
      title: "Una roca llena de secretos",
      problem: "Esta roca de Marte esconde cuatro minerales importantes, entre ellos hielo de agua. No los vemos a simple vista, pero el láser PIXL puede revelarlos uno a uno.",
      goal: "Apunta el láser a los 4 minerales y analízalos."
    }
  };

  // ---------------------------------------------------------------------------
  // Overlay DOM (se crea la primera vez que se necesita)
  // ---------------------------------------------------------------------------
  let overlay = null;
  let canvas = null;
  let ctx = null;
  let rafId = null;
  let onDoneCb = null;
  let currentKey = null;
  let startTime = 0;
  let typed = 0;
  let keyHandler = null;

  function injectStyles() {
    if (document.getElementById("minigame-intro-style")) return;
    const style = document.createElement("style");
    style.id = "minigame-intro-style";
    style.textContent = `
      #minigame-intro-overlay{position:fixed;inset:0;z-index:9500;display:flex;align-items:center;justify-content:center;
        background:rgba(2,6,23,0.92);padding:12px;animation:mgIntroFade .35s ease-out;font-family:'Fredoka','Nunito',sans-serif;overflow:auto}
      #minigame-intro-overlay.hidden{display:none !important}
      @keyframes mgIntroFade{from{opacity:0}to{opacity:1}}
      .mgi-card{width:min(860px,100%);background:linear-gradient(160deg,#111a2c,#0b1220);border:3px solid #f59e0b;border-radius:22px;
        padding:16px 20px 18px;box-shadow:0 0 40px rgba(245,158,11,.35);color:#f1f5f9;display:flex;flex-direction:column;gap:10px}
      .mgi-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
      .mgi-badge{background:#b91c1c;color:#fff;font-weight:800;font-size:.8rem;letter-spacing:.08em;padding:4px 12px;border-radius:99px;animation:mgiPulse 1s infinite}
      @keyframes mgiPulse{50%{background:#f59e0b;color:#1c1917}}
      .mgi-skip{background:transparent;border:1px solid rgba(255,255,255,.35);color:#cbd5e1;border-radius:99px;padding:4px 12px;cursor:pointer;font-family:inherit;font-size:.8rem}
      .mgi-skip:hover{background:#38bdf8;color:#041226}
      .mgi-title{margin:0;font-size:1.55rem;font-weight:800;color:#fde68a}
      .mgi-canvas{width:100%;aspect-ratio:16/9;border-radius:14px;border:2px solid #334155;background:#000;display:block}
      .mgi-problem{margin:0;font-size:1.02rem;line-height:1.45;min-height:4.4em;color:#e2e8f0}
      .mgi-problem b{color:#7dd3fc}
      .mgi-goal{background:rgba(56,189,248,.12);border-left:4px solid #38bdf8;border-radius:8px;padding:8px 12px;font-size:.95rem;color:#bae6fd}
      .mgi-actions{display:flex;justify-content:flex-end;gap:10px}
      .mgi-go{background:linear-gradient(180deg,#34d399,#059669);color:#022c22;font-family:inherit;font-weight:800;font-size:1.05rem;border:none;
        border-radius:99px;padding:10px 26px;cursor:pointer;box-shadow:0 4px 0 #065f46}
      .mgi-go:hover{filter:brightness(1.1)}
      .mgi-go:active{transform:translateY(3px);box-shadow:0 1px 0 #065f46}
    `;
    document.head.appendChild(style);
  }

  function buildOverlay() {
    injectStyles();
    overlay = document.createElement("div");
    overlay.id = "minigame-intro-overlay";
    overlay.className = "hidden";
    overlay.innerHTML = `
      <div class="mgi-card">
        <div class="mgi-top">
          <span class="mgi-badge">&#9888; PROBLEMA DETECTADO</span>
          <button class="mgi-skip" type="button">Saltar &rarr;</button>
        </div>
        <h2 class="mgi-title"></h2>
        <canvas class="mgi-canvas" width="1600" height="900"></canvas>
        <p class="mgi-problem"></p>
        <div class="mgi-goal"></div>
        <div class="mgi-actions">
          <button class="mgi-go" type="button">¡MANOS A LA OBRA! &rarr;</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    canvas = overlay.querySelector(".mgi-canvas");
    ctx = canvas.getContext("2d");
    overlay.querySelector(".mgi-go").addEventListener("click", finish);
    overlay.querySelector(".mgi-skip").addEventListener("click", finish);
  }

  function frame(now) {
    const t = (now - startTime) / 1000;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    const scene = SCENES[currentKey];
    try {
      if (scene) scene(ctx, t);
    } catch (e) {
      console.warn("Intro scene error:", e);
    }
    ctx.restore();

    // Viñeta roja de alerta
    const a = 0.12 + 0.1 * Math.sin(t * 5);
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95);
    vg.addColorStop(0, "rgba(239,68,68,0)");
    vg.addColorStop(1, `rgba(239,68,68,${a})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    // Texto del problema con efecto máquina de escribir
    const info = INFO[currentKey];
    if (info) {
      const target = Math.min(info.problem.length, Math.floor(t * 55));
      if (target !== typed) {
        typed = target;
        overlay.querySelector(".mgi-problem").textContent = info.problem.slice(0, typed);
      }
    }
    rafId = requestAnimationFrame(frame);
  }

  function finish() {
    if (!overlay || overlay.classList.contains("hidden")) return;
    overlay.classList.add("hidden");
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (keyHandler) {
      window.removeEventListener("keydown", keyHandler, true);
      keyHandler = null;
    }
    if (typeof SoundFx !== "undefined" && SoundFx.playClick) SoundFx.playClick();
    const cb = onDoneCb;
    onDoneCb = null;
    if (cb) cb();
  }

  function play(minigameKey, onDone) {
    if (!SCENES[minigameKey] || !INFO[minigameKey]) {
      if (onDone) onDone();
      return;
    }
    if (!overlay) buildOverlay();
    currentKey = minigameKey;
    onDoneCb = onDone;
    typed = -1;
    const info = INFO[minigameKey];
    overlay.querySelector(".mgi-title").textContent = info.title;
    overlay.querySelector(".mgi-problem").textContent = "";
    overlay.querySelector(".mgi-goal").innerHTML = `<b>Tu misión:</b> ${info.goal}`;
    overlay.classList.remove("hidden");
    if (typeof SoundFx !== "undefined" && SoundFx.playAlert) SoundFx.playAlert();

    keyHandler = (e) => {
      if (e.code === "Enter" || e.code === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        finish();
      }
    };
    window.addEventListener("keydown", keyHandler, true);

    startTime = performance.now();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  return { play, has: (k) => !!SCENES[k] };
})();

if (typeof window !== "undefined") {
  window.MinigameIntro = MinigameIntro;
}
