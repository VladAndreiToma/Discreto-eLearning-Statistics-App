import React, { useEffect, useRef, useState, useMemo } from "react";

const kB_eV = 8.617333262e-5;
function gaussian(E, A, center, sigma) {
  const s2 = sigma * sigma;
  return A * Math.exp(-0.5 * ((E - center) * (E - center)) / s2);
}
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

export default function DensityMatrixWebEngine({
  initialParticles = 220,
  energyRange = [0, 5],
}) {
  // --- state (kept minimal)
  const [peaks, setPeaks] = useState([
    { id: 1, A: 1.0, center: 0.6, sigma: 0.2 },
    { id: 2, A: 0.8, center: 1.6, sigma: 0.18 },
    { id: 3, A: 0.6, center: 3.0, sigma: 0.35 },
  ]);
  const [distribution, setDistribution] = useState("maxwell");
  const [T, setT] = useState(300);
  const [mu, setMu] = useState(0.7);
  const [particleCount, setParticleCount] = useState(initialParticles);
  const [autoResample, setAutoResample] = useState(true);

  // refs
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const svgRef = useRef(null);
  const canvasRef = useRef(null);

  const Emin = energyRange[0], Emax = energyRange[1];
  const bins = 300;
  const Egrid = useMemo(() => {
    const arr = new Float32Array(bins);
    for (let i = 0; i < bins; i++) arr[i] = Emin + (i / (bins - 1)) * (Emax - Emin);
    return arr;
  }, [Emin, Emax, bins]);

  const gOfE = useMemo(() => {
    const arr = new Float32Array(bins);
    for (let i = 0; i < bins; i++) {
      let s = 0;
      for (const p of peaks) s += gaussian(Egrid[i], p.A, p.center, Math.max(1e-3, p.sigma));
      arr[i] = s;
    }
    const sum = arr.reduce((a, b) => a + b, 0);
    if (sum > 0) for (let i = 0; i < arr.length; i++) arr[i] = arr[i] / sum;
    return arr;
  }, [peaks, Egrid]);

  const fOfE = useMemo(() => {
    const arr = new Float32Array(bins);
    const kT = Math.max(1e-10, kB_eV * Math.max(1e-6, T));
    for (let i = 0; i < bins; i++) {
      const E = Egrid[i];
      if (distribution === "maxwell") arr[i] = Math.exp(-E / kT);
      else if (distribution === "fermi") arr[i] = 1 / (1 + Math.exp((E - mu) / kT));
      else if (distribution === "bose") {
        const denom = Math.exp((E - mu) / kT) - 1;
        arr[i] = denom <= 1e-8 ? 1e8 : 1 / denom;
      }
    }
    if (distribution === "maxwell" || distribution === "bose") {
      const m = Math.max(...arr);
      if (m > 0) for (let i = 0; i < arr.length; i++) arr[i] = clamp(arr[i] / m, 0, 1);
    }
    return arr;
  }, [distribution, T, mu, Egrid]);

  const gfOfE = useMemo(() => {
    const arr = new Float32Array(bins);
    for (let i = 0; i < bins; i++) arr[i] = gOfE[i] * fOfE[i];
    const sum = arr.reduce((a, b) => a + b, 0);
    if (sum > 0) for (let i = 0; i < bins; i++) arr[i] = arr[i] / sum;
    return arr;
  }, [gOfE, fOfE]);

  const cdf = useMemo(() => {
    const arr = new Float32Array(bins);
    let acc = 0;
    for (let i = 0; i < bins; i++) { acc += gfOfE[i]; arr[i] = acc; }
    const last = arr[bins - 1] || 1;
    if (last <= 0) for (let i = 0; i < bins; i++) arr[i] = (i + 1) / bins;
    else for (let i = 0; i < bins; i++) arr[i] = arr[i] / last;
    return arr;
  }, [gfOfE]);

  function sampleEnergyFromCDF() {
    const r = Math.random();
    let lo = 0, hi = cdf.length - 1;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (cdf[m] < r) lo = m + 1; else hi = m;
    }
    const idx = lo;
    const leftE = Egrid[Math.max(0, idx - 1)];
    const rightE = Egrid[Math.min(bins - 1, idx)];
    return leftE + Math.random() * (rightE - leftE);
  }

  // init particles once
  useEffect(() => {
    const N = clamp(Math.round(particleCount), 10, 1200);
    particlesRef.current = new Array(N).fill(0).map((_, i) => {
      const E = sampleEnergyFromCDF();
      return {
        id: i,
        E,
        x: (E - Emin) / (Emax - Emin),
        y: 0.5 + (Math.random() - 0.5) * 0.35,
        vx: (Math.random() - 0.5) * 0.0015,
        vy: (Math.random() - 0.5) * 0.0008,
        color: "#bfffd0",
      };
    });
  }, []);

  useEffect(() => {
    if (!autoResample) return;
    if (!particlesRef.current || particlesRef.current.length === 0) return;
    const N = particlesRef.current.length;
    for (let i = 0; i < Math.max(1, Math.round(N * 0.4)); i++) {
      const idx = Math.floor(Math.random() * N);
      const Enew = sampleEnergyFromCDF();
      const p = particlesRef.current[idx];
      const xnew = (Enew - Emin) / (Emax - Emin);
      p.E = Enew;
      p.vx += (xnew - p.x) * 0.06 + (Math.random() - 0.5) * 0.002;
      p.color = null;
    }
  }, [distribution, T, mu, peaks, autoResample]);

  // animation: particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    function resizeIfNeeded() {
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      if (cw !== w || ch !== h) {
        w = cw; h = ch;
        const DPR = window.devicePixelRatio || 1;
        canvas.width = Math.floor(w * DPR);
        canvas.height = Math.floor(h * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      }
    }

    let last = performance.now();
    function step(t) {
      rafRef.current = requestAnimationFrame(step);
      resizeIfNeeded();
      const dt = Math.min(0.05, (t - last) * 0.001);
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(2,8,4,0.95)";
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;
      if (!particles) return;
      for (let p of particles) {
        p.x += p.vx * (1 + dt * 10);
        p.y += p.vy * (1 + dt * 6);
        if (p.x < -0.05) { p.x = -0.05; p.vx *= -0.6; }
        if (p.x > 1.05) { p.x = 1.05; p.vx *= -0.6; }
        if (p.y < 0.05) { p.y = 0.05; p.vy *= -0.6; }
        if (p.y > 0.95) { p.y = 0.95; p.vy *= -0.6; }

        const ratio = clamp((p.E - Emin) / (Emax - Emin), 0, 1);
        const hue = 140 - ratio * 120;
        p.color = `hsl(${hue} 85% 55%)`;

        const cx = Math.round(12 + p.x * (w - 24));
        const cy = Math.round(12 + p.y * (h - 24));
        const r = 3 + 3 * (0.8 + 0.6 * (Math.sin((p.id + t / 600) * 2) * 0.5 + 0.5));
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#bfffd0";
      ctx.font = "12px monospace";
      ctx.fillText(`${distribution} • T=${T}K • μ=${Number(mu).toFixed(3)}eV`, 12, h - 8);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [particleCount, distribution, T, mu, gOfE]);

  const dosPath = useMemo(() => {
    const W = 560, H = 160, pad = 12;
    const gx = (i) => pad + (i / (bins - 1)) * (W - pad * 2);
    const gmax = Math.max(...gOfE) || 1;
    const fmax = Math.max(...fOfE) || 1;
    const gfmax = Math.max(...gfOfE) || 1;
    let gPath = "", fPath = "", gfPath = "";
    for (let i = 0; i < bins; i++) {
      const x = gx(i);
      const gy = H - pad - (gOfE[i] / gmax) * (H - pad * 2) * 0.85;
      const fy = H - pad - (fOfE[i] / fmax) * (H - pad * 2) * 0.6;
      const gfy = H - pad - (gfOfE[i] / gfmax) * (H - pad * 2) * 0.95;
      gPath += (i === 0 ? `M ${x},${gy}` : ` L ${x},${gy}`);
      fPath += (i === 0 ? `M ${x},${fy}` : ` L ${x},${fy}`);
      gfPath += (i === 0 ? `M ${x},${gfy}` : ` L ${x},${gfy}`);
    }
    return { gPath, fPath, gfPath, W, H, pad };
  }, [gOfE, fOfE, gfOfE, bins]);

  // minimal editors
  const addPeak = () => { const id = Math.max(0, ...peaks.map(p => p.id)) + 1; setPeaks(p => [...p, { id, A: 0.6, center: 1.0 + Math.random() * 2.5, sigma: 0.2 + Math.random() * 0.4 }]); };
  const removePeak = (id) => setPeaks(p => p.filter(x => x.id !== id));
  const updatePeak = (id, key, value) => setPeaks(p => p.map(x => x.id === id ? { ...x, [key]: value } : x));

  const summary = useMemo(() => {
    let avg = 0; for (let i = 0; i < bins; i++) avg += Egrid[i] * gfOfE[i];
    const occProb = gfOfE.reduce((a, b) => a + b, 0);
    return { avgE: avg, occProb };
  }, [gfOfE, Egrid, bins]);
  const fmt = (v, d = 3) => Number.isFinite(v) ? v.toFixed(d) : "—";

  return (
  <div style={{ width: "100%", margin: "0 auto", fontFamily: "Inter, Roboto, monospace", color: "#dfffe6" }}>
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 60%", minWidth: 320 }}>
        <svg ref={svgRef} width="100%" height={180} viewBox={`0 0 ${dosPath.W} ${dosPath.H}`} style={{ background: "linear-gradient(180deg,#03120a,#021007)", borderRadius: 8, border: "1px solid rgba(10,255,153,0.06)" }}>
          <rect x="0" y="0" width={dosPath.W} height={dosPath.H} fill="transparent" />
          <path d={dosPath.gPath} stroke="#66ffb0" strokeWidth="2" fill="none" opacity="0.95" />
          <path d={dosPath.fPath} stroke="#ffdf6b" strokeWidth="1.5" fill="none" opacity="0.9" />
          <path d={dosPath.gfPath} stroke="#ff7fbf" strokeWidth="2.2" fill="none" opacity="0.95" />
          <text x={10} y={18} fill="#bfffd0" fontSize="12" fontFamily="monospace">g(E)</text>
          <text x={dosPath.W - 120} y={18} fill="#ff7fbf" fontSize="12" fontFamily="monospace">g(E)·f(E)</text>
        </svg>

        <div style={{ marginTop: 12, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(10,255,153,0.06)" }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: 260, display: "block", background: "linear-gradient(180deg,#02150d,#02110a)" }} />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
          <div style={{ background: "#032412", padding: 8, borderRadius: 8, border: "1px solid rgba(10,255,153,0.06)", fontFamily: "monospace" }}>
            <div style={{ color: "#8effc2" }}>avg E</div>
            <div style={{ fontWeight: 700 }}>{fmt(summary.avgE, 3)} eV</div>
          </div>
          <div style={{ background: "#032412", padding: 8, borderRadius: 8, border: "1px solid rgba(10,255,153,0.06)", fontFamily: "monospace" }}>
            <div style={{ color: "#8effc2" }}>occupied (Rel)</div>
            <div style={{ fontWeight: 700 }}>{fmt(summary.occProb, 3)}</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#9fffbf", fontFamily: "monospace" }}>
            particles: {particleCount}
          </div>
        </div>
      </div>

      <div style={{ width: "100%", background: "linear-gradient(180deg,#021a12,#04120a)", padding: 12, borderRadius: 12, border: "1px solid rgba(10,255,153,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ color: "#bfffd0", fontWeight: 700 }}>Controls</div>
        </div>

        {/* DISTRIBUTION */}
        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={{ color: "#b6fcb6", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Distribution</div>
          <select
            value={distribution}
            onChange={(e) => setDistribution(e.target.value)}
            style={{
              width: "100%", padding: "8px 10px", borderRadius: 10,
              background: "linear-gradient(90deg,#073,#0a4)", color: "#d9ffe0",
              border: "1px solid rgba(0,255,128,0.15)", outline: "none",
              boxShadow: "inset 0 1px 3px rgba(0,255,100,0.05)", fontSize: 13, transition: "0.2s ease"
            }}
            onMouseOver={(e) => (e.target.style.border = "1px solid rgba(0,255,128,0.25)")}
            onMouseOut={(e) => (e.target.style.border = "1px solid rgba(0,255,128,0.15)")}
          >
            <option value="maxwell">Maxwell–Boltzmann</option>
            <option value="fermi">Fermi–Dirac</option>
            <option value="bose">Bose–Einstein</option>
          </select>
        </label>

        {/* TEMPERATURE */}
        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={{ color: "#b6fcb6", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Temperature T (K)</div>
          <input type="range" min={1} max={5000} value={T} onChange={(e) => setT(Number(e.target.value))} style={{ width: "100%", height: 6, accentColor: "#1fff6b", background: "linear-gradient(90deg,#073,#0a4)", borderRadius: 10, boxShadow: "0 0 6px rgba(0,255,128,0.15)", cursor: "pointer" }} />
          <div style={{ color: "#96ffc1", fontFamily: "monospace", marginTop: 6, fontSize: 12, textAlign: "right" }}>{T} K</div>
        </label>

        {/* MU */}
        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={{ color: "#b6fcb6", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Chemical potential μ (eV)</div>
          <input type="range" min={-2} max={4} step={0.001} value={mu} onChange={(e) => setMu(Number(e.target.value))} style={{ width: "100%", height: 6, accentColor: "#1fff6b", background: "linear-gradient(90deg,#073,#0a4)", borderRadius: 10, boxShadow: "0 0 6px rgba(0,255,128,0.15)", cursor: "pointer" }} />
          <div style={{ color: "#96ffc1", fontFamily: "monospace", marginTop: 6, fontSize: 12, textAlign: "right" }}>{mu.toFixed(3)} eV</div>
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <input type="checkbox" checked={autoResample} onChange={(e) => setAutoResample(e.target.checked)} />
          <div style={{ color: "#bfffd0" }}>Auto resample</div>
        </label>

        {/* PARTICLES */}
        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={{ color: "#b6fcb6", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Particles</div>
          <input type="range" min={20} max={800} value={particleCount} onChange={(e) => {
            setParticleCount(Number(e.target.value));
            particlesRef.current = new Array(Number(e.target.value)).fill(0).map((_, i) => ({ id: i, E: sampleEnergyFromCDF(), x: 0, y: 0.5 + (Math.random() - 0.5) * 0.35, vx: (Math.random()-0.5)*0.002, vy: (Math.random()-0.5)*0.0008 }));
          }} style={{ width: "100%", height: 6, accentColor: "#1fff6b", background: "linear-gradient(90deg,#073,#0a4)", borderRadius: 10, boxShadow: "0 0 6px rgba(0,255,128,0.15)", cursor: "pointer" }} />
          <div style={{ color: "#96ffc1", fontFamily: "monospace", marginTop: 6, fontSize: 12, textAlign: "right" }}>{particleCount}</div>
        </label>

        <hr style={{ border: "none", height: 1, background: "rgba(10,255,153,0.06)", margin: "10px 0" }} />

        <div style={{ color: "#bfffd0", fontWeight: 700, marginBottom: 8 }}>g(E) editor</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <button onClick={addPeak} style={{ padding: "6px 8px", background: "#063", color: "#dfffe6", borderRadius: 8 }}>+ Peak</button>
          <button onClick={() => setPeaks([{ id: 1, A: 1.0, center: 0.6, sigma: 0.2 }])} style={{ padding: "6px 8px", background: "#064", color: "#dfffe6", borderRadius: 8 }}>Reset</button>
        </div>

        <div style={{ maxHeight: 220, overflow: "auto", paddingRight: 6 }}>
          {peaks.map(p => (
            <div key={p.id} style={{ background: "#021a12", padding: 8, borderRadius: 8, marginBottom: 8, border: "1px solid rgba(10,255,153,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: "#bfffd0", fontWeight: 700 }}>Peak {p.id}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => updatePeak(p.id, "A", clamp(Number(p.A) * 0.9, 0.01, 5))} style={{ padding: "4px 6px", borderRadius: 6 }}>-A</button>
                  <button onClick={() => updatePeak(p.id, "A", clamp(Number(p.A) * 1.1, 0.01, 5))} style={{ padding: "4px 6px", borderRadius: 6 }}>+A</button>
                  <button onClick={() => removePeak(p.id)} style={{ padding: "4px 6px", borderRadius: 6 }}>✕</button>
                </div>
              </div>
              <div style={{ marginTop: 6 }}>
                <div style={{ color: "#9fffbf", fontSize: 12 }}>Amplitude A</div>
                <input type="range" min={0.01} max={3} step={0.01} value={p.A} onChange={(e) => updatePeak(p.id, "A", Number(e.target.value))} style={{ width: "100%", height: 6, accentColor: "#1fff6b", background: "linear-gradient(90deg,#073,#0a4)", borderRadius: 10, boxShadow: "0 0 6px rgba(0,255,128,0.15)", cursor: "pointer" }} />
                <div style={{ color: "#90ffae", fontFamily: "monospace" }}>{p.A.toFixed(2)}</div>

                <div style={{ color: "#9fffbf", fontSize: 12, marginTop: 6 }}>Center (eV)</div>
                <input type="range" min={Emin} max={Emax} step={0.01} value={p.center} onChange={(e) => updatePeak(p.id, "center", Number(e.target.value))} style={{ width: "100%", height: 6, accentColor: "#1fff6b", background: "linear-gradient(90deg,#073,#0a4)", borderRadius: 10, boxShadow: "0 0 6px rgba(0,255,128,0.15)", cursor: "pointer" }} />
                <div style={{ color: "#90ffae", fontFamily: "monospace" }}>{p.center.toFixed(2)} eV</div>

                <div style={{ color: "#9fffbf", fontSize: 12, marginTop: 6 }}>Width σ (eV)</div>
                <input type="range" min={0.02} max={1.2} step={0.01} value={p.sigma} onChange={(e) => updatePeak(p.id, "sigma", Number(e.target.value))} style={{ width: "100%", height: 6, accentColor: "#1fff6b", background: "linear-gradient(90deg,#073,#0a4)", borderRadius: 10, boxShadow: "0 0 6px rgba(0,255,128,0.15)", cursor: "pointer" }} />
                <div style={{ color: "#90ffae", fontFamily: "monospace" }}>{p.sigma.toFixed(2)} eV</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{ marginTop: 12, color: "#9fffbf", fontSize: 13 }}>
      <strong>Essentials:</strong> g(E) = density of states (how many states exist at each energy). f(E) = occupation probability (depends on T and μ). g(E)·f(E) shows where particles actually sit. Change peaks / T / μ and watch particles cluster where g(E)·f(E) is large.
    </div>
  </div>
)

}
