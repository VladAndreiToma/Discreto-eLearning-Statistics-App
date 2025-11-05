// src/components/ThermoSync.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * ThermoSync — Visual-first, slow, numeric inputs, temp-driven colors
 *
 * Key user-facing changes:
 * - Number inputs + +/- buttons for T1/T2 (commit on Enter / blur)
 * - Much slower visual motion and smaller stochastic kicks (so you can *see* agitation)
 * - Particle color primarily maps to box temperature (blue -> green -> red)
 * - Emissive intensity is secondary mapped to instantaneous speed
 * - "Slow motion" toggle to instantly slow down visuals
 * - Fewer, larger, more visible particles by default; KE/temperature evolution remains physical-ish
 */

export default function ThermoSyncWebEngine({
  initialLeftT = 473.15,
  initialRightT = 323.15,
  particlesPerBox = 30,
  width = "100%",
  height = 420,
}) {
  // --- physical constants
  const kB = 1.380649e-23;
  const mass = 4.65e-26; // ~N2

  // --- visual / tuneable params (play with these if you want different feel)
  let VEL_SCALE = 7e-5;     // maps m/s -> visual velocity (smaller = slower)
  let VIS_SPEED = 8;        // integration visual multiplier (smaller = slower)
  const GAMMA = 4.0;        // damping (higher = faster relaxation to thermal bath)
  const THERMAL_KICK = 0.35; // stochastic kick scale (smaller = less jitter)
  const RESCALE_ALPHA_BASE = 6.0; // how fast velocities adapt to temperature changes

  // refs for DOM/three
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animRef = useRef(null);
  const glowRef = useRef(null);

  // particle state (three objects + velocities)
  const particlesLeftRef = useRef([]);
  const particlesRightRef = useRef([]);
  const vLeftRef = useRef([]);
  const vRightRef = useRef([]);

  // fast simulation refs
  const TleftRef = useRef(Number(initialLeftT));
  const TrightRef = useRef(Number(initialRightT));
  const KcondRef = useRef(1e-5);
  const runningRef = useRef(true);

  // UI states (numbers + text inputs)
  const [leftInput, setLeftInput] = useState(Math.round(initialLeftT));
  const [rightInput, setRightInput] = useState(Math.round(initialRightT));
  const [Kslider, setKslider] = useState(50);
  const [runningUI, setRunningUI] = useState(true);
  const [slowMotion, setSlowMotion] = useState(false);
  const [powerUI, setPowerUI] = useState(0);
  const [deltaTUI, setDeltaTUI] = useState(Math.abs(initialLeftT - initialRightT));
  const [particleCountUI, setParticleCountUI] = useState(particlesPerBox * 2);

  // layout
  const BOX_HALF = 6;
  const BOX_GAP = 4;
  const LEFT_X = -BOX_HALF - BOX_GAP / 2;
  const RIGHT_X = BOX_HALF + BOX_GAP / 2;

  // map slider 0..100 -> 1e-8..1e-3 (log)
  const Kmin = 1e-8;
  const Kmax = 1e-3;
  const sliderToK = (s) => {
    const t = Math.max(0, Math.min(100, Number(s))) / 100;
    const logMin = Math.log10(Kmin);
    const logMax = Math.log10(Kmax);
    return Math.pow(10, logMin + (logMax - logMin) * t);
  };

  // gaussian (Box-Muller)
  const randNormal = (() => {
    let spare = null;
    return () => {
      if (spare !== null) { const v = spare; spare = null; return v; }
      let u, v, s;
      do {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
        s = u * u + v * v;
      } while (s === 0 || s >= 1);
      const mul = Math.sqrt(-2.0 * Math.log(s) / s);
      spare = v * mul;
      return u * mul;
    };
  })();

  const sigma_mps = (T) => Math.sqrt((kB * Math.max(1e-12, T)) / mass);

  // init K
  useEffect(() => { KcondRef.current = sliderToK(Kslider); }, []); // once

  // scene init
  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    mount.innerHTML = "";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x021007);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 9, 22);
    cameraRef.current = camera;

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // lights + boxes
    scene.add(new THREE.AmbientLight(0x66ffb8, 0.22));
    const pLight = new THREE.PointLight(0x66ffb8, 0.9);
    pLight.position.set(0, 30, 20);
    scene.add(pLight);

    const boxMat = new THREE.MeshBasicMaterial({ color: 0x0b6b49, wireframe: true, transparent: true, opacity: 0.12 });
    const leftBox = new THREE.Mesh(new THREE.BoxGeometry(BOX_HALF * 2, BOX_HALF * 2, BOX_HALF * 2), boxMat);
    leftBox.position.set(LEFT_X, 0, 0);
    const rightBox = new THREE.Mesh(new THREE.BoxGeometry(BOX_HALF * 2, BOX_HALF * 2, BOX_HALF * 2), boxMat);
    rightBox.position.set(RIGHT_X, 0, 0);
    scene.add(leftBox, rightBox);

    // subtle glow plane
    const glowGeo = new THREE.PlaneGeometry(BOX_GAP * 1.2, BOX_HALF * 2 * 1.0);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const glowPlane = new THREE.Mesh(glowGeo, glowMat);
    glowPlane.position.set(0, 0, 0);
    scene.add(glowPlane);
    glowRef.current = glowPlane;

    // particles creation (fewer, larger and centered)
    particlesLeftRef.current = [];
    particlesRightRef.current = [];
    vLeftRef.current = [];
    vRightRef.current = [];

    const N = Math.max(6, Math.min(120, particlesPerBox));
    const sphereGeo = new THREE.SphereGeometry(0.6, 14, 14); // larger visible spheres

    for (let i = 0; i < N; i++) {
      // left
      const matL = new THREE.MeshStandardMaterial({ color: 0x66cfa0, emissive: 0x002211, emissiveIntensity: 0.6, roughness: 0.45, metalness: 0.05 });
      const mL = new THREE.Mesh(sphereGeo, matL);
      // spawn well inside the box (no near-wall start)
      mL.position.set(LEFT_X + (Math.random() - 0.5) * (BOX_HALF * 1.6), (Math.random() - 0.5) * (BOX_HALF * 1.6), (Math.random() - 0.5) * (BOX_HALF * 1.6));
      scene.add(mL);
      particlesLeftRef.current.push(mL);
      const sigmaL = sigma_mps(TleftRef.current) * VEL_SCALE;
      vLeftRef.current.push(new THREE.Vector3(randNormal() * sigmaL, randNormal() * sigmaL, randNormal() * sigmaL));

      // right
      const matR = new THREE.MeshStandardMaterial({ color: 0x90ffd0, emissive: 0x002211, emissiveIntensity: 0.55, roughness: 0.45, metalness: 0.05 });
      const mR = new THREE.Mesh(sphereGeo, matR);
      mR.position.set(RIGHT_X + (Math.random() - 0.5) * (BOX_HALF * 1.6), (Math.random() - 0.5) * (BOX_HALF * 1.6), (Math.random() - 0.5) * (BOX_HALF * 1.6));
      scene.add(mR);
      particlesRightRef.current.push(mR);
      const sigmaR = sigma_mps(TrightRef.current) * VEL_SCALE;
      vRightRef.current.push(new THREE.Vector3(randNormal() * sigmaR, randNormal() * sigmaR, randNormal() * sigmaR));
    }

    setParticleCountUI(N * 2);

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // animate
    let last = performance.now();
    let lastUI = 0;

    const animate = (t) => {
      animRef.current = requestAnimationFrame(animate);
      const now = t || performance.now();
      let dt = (now - last) * 0.001;
      if (dt > 0.05) dt = 0.05;
      last = now;

      // adapt VIS_SPEED on slowMotion toggle
      const visSpeedNow = slowMotion ? VIS_SPEED * 0.22 : VIS_SPEED;
      const vScaleNow = slowMotion ? VEL_SCALE * 0.55 : VEL_SCALE;

      if (runningRef.current) {
        const Nl = Math.max(1, particlesLeftRef.current.length);
        const Nr = Math.max(1, particlesRightRef.current.length);
        const Uleft = 1.5 * Nl * kB * TleftRef.current;
        const Uright = 1.5 * Nr * kB * TrightRef.current;

        const power = KcondRef.current * (TleftRef.current - TrightRef.current);
        const dQ = power * dt;

        const UleftNew = Uleft - dQ;
        const UrightNew = Uright + dQ;

        const TleftNew = Math.max(1e-6, UleftNew / (1.5 * Nl * kB));
        const TrightNew = Math.max(1e-6, UrightNew / (1.5 * Nr * kB));

        // gradual rescale with stronger alpha so change is visible but not jumpy
        const rescaleGradual = (arrV, Told, Tnew) => {
          if (Told <= 0) return;
          const f = Math.sqrt(Math.max(1e-12, Tnew / Told));
          const alpha = Math.min(1, dt * RESCALE_ALPHA_BASE);
          const scale = Math.pow(f, alpha);
          for (let i = 0; i < arrV.length; i++) arrV[i].multiplyScalar(scale);
        };

        rescaleGradual(vLeftRef.current, TleftRef.current, TleftNew);
        rescaleGradual(vRightRef.current, TrightRef.current, TrightNew);

        TleftRef.current = TleftNew;
        TrightRef.current = TrightNew;

        // glow mapping: use dT but softer
        const dT = TleftRef.current - TrightRef.current;
        const gp = glowRef.current;
        if (gp && gp.material) {
          const intensity = Math.min(1, Math.abs(dT) / 350);
          gp.material.opacity = 0.4 * intensity;
          gp.material.color.setHex(dT >= 0 ? 0xffb86b : 0x66ffe0);
        }

        if (now - lastUI > 120) {
          lastUI = now;
          setPowerUI(power);
          setDeltaTUI(Math.abs(TleftRef.current - TrightRef.current));
          setLeftInput(Math.round(TleftRef.current));
          setRightInput(Math.round(TrightRef.current));
        }
      }

      // move + Langevin-like thermalization (damped + stochastic kicks)
      const moveThermal = (parts, vels, centerX, Tbox) => {
        const kickSigma = sigma_mps(Tbox) * vScaleNow * THERMAL_KICK;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const v = vels[i];

          // damping
          const damp = Math.exp(-GAMMA * dt);
          v.multiplyScalar(damp);

          // stochastic kick (sqrt(dt) factor for correct scaling)
          const sd = Math.sqrt(Math.max(1e-12, dt));
          v.x += randNormal() * kickSigma * sd;
          v.y += randNormal() * kickSigma * sd;
          v.z += randNormal() * kickSigma * sd;

          // integrate (VIS)
          p.position.add(v.clone().multiplyScalar(visSpeedNow * dt));

          // bounce inside box
          ["x","y","z"].forEach((axis) => {
            if (axis === "x") {
              const maxX = centerX + BOX_HALF - 0.6;
              const minX = centerX - BOX_HALF + 0.6;
              if (p.position.x > maxX) { p.position.x = maxX; v.x *= -0.8; }
              if (p.position.x < minX) { p.position.x = minX; v.x *= -0.8; }
            } else {
              const max = BOX_HALF - 0.6; const min = -BOX_HALF + 0.6;
              if (p.position[axis] > max) { p.position[axis] = max; v[axis] *= -0.8; }
              if (p.position[axis] < min) { p.position[axis] = min; v[axis] *= -0.8; }
            }
          });
        }
      };

      moveThermal(particlesLeftRef.current, vLeftRef.current, LEFT_X, TleftRef.current);
      moveThermal(particlesRightRef.current, vRightRef.current, RIGHT_X, TrightRef.current);

      // color mapping: map box temperature to hue (240 blue -> 120 green -> 0 red)
      const mapTempToHue = (T) => {
        // map interesting range 200K..800K -> [240..0]
        const minT = 200; const maxT = 800;
        const t = Math.max(0, Math.min(1, (T - minT) / (maxT - minT)));
        return 240 - 240 * t;
      };

      // recolor per box using box temperature (and emissive by speed)
      const recolorBox = (parts, vels, Tbox) => {
        const hue = mapTempToHue(Tbox);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const v = vels[i];
          // base color from hue
          const col = new THREE.Color();
          col.setHSL(((hue / 360) + 1) % 1, 0.78, 0.48);
          p.material.color.r = col.r; p.material.color.g = col.g; p.material.color.b = col.b;
          // emissive intensity scaled by instantaneous speed
          const speed = v.length() / Math.max(1e-12, vScaleNow);
          p.material.emissiveIntensity = Math.min(1.5, 0.4 + 0.02 * speed);
        }
      };

      // throttle recolor to light frequency
      if (performance.now() % 60 < 18) {
        recolorBox(particlesLeftRef.current, vLeftRef.current, TleftRef.current);
        recolorBox(particlesRightRef.current, vRightRef.current, TrightRef.current);
      }

      controlsRef.current.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animRef.current = requestAnimationFrame(animate);

    // resize handler
    const onResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || height;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      try { controls.dispose(); } catch {}
      try {
        particlesLeftRef.current.forEach((p) => { p.geometry?.dispose(); p.material?.dispose(); p.parent?.remove(p); });
        particlesRightRef.current.forEach((p) => { p.geometry?.dispose(); p.material?.dispose(); p.parent?.remove(p); });
      } catch {}
      try {
        if (rendererRef.current) {
          const el = rendererRef.current.domElement;
          rendererRef.current.dispose();
          if (el && el.parentNode) el.parentNode.removeChild(el);
        }
      } catch {}
      particlesLeftRef.current = [];
      particlesRightRef.current = [];
      vLeftRef.current = [];
      vRightRef.current = [];
      sceneRef.current = null;
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- UI handlers: numeric inputs + +/- buttons ---
  const applyLeftInput = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n)) { setLeftInput(Math.round(TleftRef.current)); return; }
    const clamped = Math.max(1, Math.min(4000, n));
    TleftRef.current = clamped;
    setLeftInput(Math.round(clamped));
  };
  const applyRightInput = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n)) { setRightInput(Math.round(TrightRef.current)); return; }
    const clamped = Math.max(1, Math.min(4000, n));
    TrightRef.current = clamped;
    setRightInput(Math.round(clamped));
  };

  const onLeftChange = (e) => setLeftInput(e.target.value);
  const onRightChange = (e) => setRightInput(e.target.value);
  const leftKey = (e) => { if (e.key === "Enter") applyLeftInput(e.target.value); };
  const rightKey = (e) => { if (e.key === "Enter") applyRightInput(e.target.value); };

  const changeK = (s) => {
    const sv = Number(s);
    if (!Number.isFinite(sv)) return;
    setKslider(sv);
    KcondRef.current = sliderToK(sv);
  };

  const toggleRun = () => { runningRef.current = !runningRef.current; setRunningUI(runningRef.current); };
  const toggleSlow = () => { setSlowMotion((x) => !x); };

  const reset = useCallback(() => {
    TleftRef.current = Number(initialLeftT);
    TrightRef.current = Number(initialRightT);
    setLeftInput(Math.round(initialLeftT));
    setRightInput(Math.round(initialRightT));
    KcondRef.current = sliderToK(50);
    setKslider(50);

    // resample velocities to initial distribution (quieter)
    const sigmaL = sigma_mps(initialLeftT) * VEL_SCALE;
    const sigmaR = sigma_mps(initialRightT) * VEL_SCALE;
    vLeftRef.current = vLeftRef.current.map(() => new THREE.Vector3(randNormal() * sigmaL, randNormal() * sigmaL, randNormal() * sigmaL));
    vRightRef.current = vRightRef.current.map(() => new THREE.Vector3(randNormal() * sigmaR, randNormal() * sigmaR, randNormal() * sigmaR));

    setPowerUI(0);
    setDeltaTUI(Math.abs(initialLeftT - initialRightT));
  }, [initialLeftT, initialRightT]);

  // UI CSS (minimal)
  useEffect(() => {
    const id = "thermosync-ui-styles-2";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      .ts-panel{background:linear-gradient(180deg,rgba(0,20,10,0.45),rgba(0,10,5,0.35));padding:12px;border-radius:10px;color:#dfffe6;font-family:Inter,Roboto,system-ui;border:1px solid rgba(10,255,153,0.06)}
      .ts-grid{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
      .ts-col{display:flex;flex-direction:column;gap:8px;flex:1;min-width:200px}
      .ts-range{width:100%;accent-color:#26e698;background:#2d2d2d;height:10px;border-radius:8px}
      .ts-btn{background:linear-gradient(90deg,#06c,#0f6);color:#021;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;font-weight:700}
      .ts-small{font-family:monospace;color:#bfffd0;font-size:13px}
      .ts-num{width:100%;padding:6px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:rgba(0,0,0,0.25);color:#dfffe6}
      .step-row{display:flex;gap:6px}
      @media(max-width:720px){.ts-grid{flex-direction:column;align-items:stretch}}
    `;
    document.head.appendChild(s);
  }, []);

  // Render UI
  return (
    <div style={{ width, maxWidth: 1100, margin: "0 auto", position: "relative", boxSizing: "border-box", color: "#dfffe6" }}>
      <div ref={mountRef} style={{ width: "100%", height, borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.6)", border: "2px solid rgba(10,255,153,0.08)" }} />

      {/* readout */}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 9, textAlign: "right", background: "rgba(1,10,8,0.6)", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(10,255,153,0.06)" }}>
        <div className="ts-small">T₁: <b style={{ color: "#eafff0" }}>{leftInput} K</b></div>
        <div className="ts-small">T₂: <b style={{ color: "#eafff0" }}>{rightInput} K</b></div>
        <div className="ts-small">ΔT: {deltaTUI.toFixed(1)} K</div>
        <div className="ts-small">P: {powerUI.toExponential(2)} W</div>
      </div>

      {/* controls */}
      <div style={{ marginTop: 12 }} className="ts-panel">
        <div className="ts-grid">
          <div className="ts-col">
            <div className="ts-small">Left box temp T₁ (K)</div>
            <div className="step-row">
              <input className="ts-num" type="number" min={1} max={4000} step={1} value={leftInput} onChange={onLeftChange} onBlur={(e) => applyLeftInput(e.target.value)} onKeyDown={leftKey} />
              <button className="ts-btn" onClick={() => applyLeftInput(leftInput + 1)}>+1</button>
              <button className="ts-btn" onClick={() => applyLeftInput(leftInput - 1)}>-1</button>
            </div>
            <div style={{ color: "#90ffae", fontFamily: "monospace" }}>{leftInput} K</div>
          </div>

          <div className="ts-col">
            <div className="ts-small">Right box temp T₂ (K)</div>
            <div className="step-row">
              <input className="ts-num" type="number" min={1} max={4000} step={1} value={rightInput} onChange={onRightChange} onBlur={(e) => applyRightInput(e.target.value)} onKeyDown={rightKey} />
              <button className="ts-btn" onClick={() => applyRightInput(rightInput + 1)}>+1</button>
              <button className="ts-btn" onClick={() => applyRightInput(rightInput - 1)}>-1</button>
            </div>
            <div style={{ color: "#90ffae", fontFamily: "monospace" }}>{rightInput} K</div>
          </div>

          <div className="ts-col" style={{ maxWidth: 260 }}>
            <div className="ts-small">Thermal conductance (log scale)</div>
            <input className="ts-range" type="range" min={0} max={100} step={1} value={Kslider} onChange={(e) => changeK(e.target.value)} />
            <div style={{ color: "#90ffae", fontFamily: "monospace" }}>{KcondRef.current.toExponential(2)} W/K</div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="ts-btn" onClick={() => { toggleRun(); }}>{runningUI ? "Pause" : "Start"}</button>
            <button className="ts-btn" onClick={reset}>Reset</button>
            <button className="ts-btn" onClick={() => { setSlowMotion(x => !x); }}>{slowMotion ? "Normal" : "Slow"}</button>
          </div>
        </div>

        <div style={{ marginTop: 8, color: "#9fffbf", fontSize: 13 }}>Tip: tastează o valoare și apasă Enter sau click în afara câmpului. Folosește "Slow" dacă vrei mișcare foarte vizibilă.</div>
      </div>

      <div style={{ marginTop: 10, color: "#80ffaa", fontFamily: "monospace" }}>Particles: {particleCountUI}</div>
    </div>
  );
}
