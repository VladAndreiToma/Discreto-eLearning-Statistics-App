// src/components/QuantumCrowdWebEngine.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * QuantumCrowdWebEngine
 * - realistic-ish: T in Kelvin, Maxwell sampling for velocities
 * - fermions: short-range repulsion + occupancy-based repulsion factor
 * - bosons: condensation tendency computed from n * lambda^3, visualized via attractor
 * - includes "quantumScale" knob to amplify quantum effects for visualization
 *
 * Notes:
 * - Physical constants used (SI): h, hbar, kB, mass (default ~N2 molecule).
 * - We map physical velocities -> visual velocities via VEL_SCALE to get good visual motion.
 */

export default function QuantumCrowdWebEngine({
  initialParticles = 120,
  width = "100%",
  height = 460,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const particlesRef = useRef([]);
  const velocitiesRef = useRef([]);
  const animRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  // Physical constants (SI)
  const h = 6.62607015e-34;
  const hbar = h / (2 * Math.PI);
  const kB = 1.380649e-23;
  // choose particle mass (N2 ~ 28u -> 28 * 1.6605e-27 ~ 4.65e-26 kg)
  const mass = 4.65e-26;

  // Visual mapping params (tweak for display)
  const VEL_SCALE = 0.0025; // m/s -> scene units / frame (tweak to slow/fast)
  const BOX_HALF = 12; // visual box half-size (scene units)

  // UI / physics state
  const [distribution, setDistribution] = useState("maxwell"); // 'maxwell'|'fermi'|'bose'
  const [T, setT] = useState(300); // Kelvin
  const [count, setCount] = useState(initialParticles);
  const [mu, setMu] = useState(0.0); // placeholder - not deeply used physically here
  const [quantumScale, setQuantumScale] = useState(1e8); // amplification for visualization (explain in UI)
  const [entropy, setEntropy] = useState(0);
  const [degeneracyVal, setDegeneracyVal] = useState(0);

  // CSS injection for green sliders + grey track
  useEffect(() => {
    const id = "qc-slider-style";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      .qc-range { -webkit-appearance: none; appearance: none; height: 10px; border-radius: 6px; background: #3a3a3a; outline: none; }
      .qc-range::-webkit-slider-runnable-track { height: 10px; border-radius:6px; background:#3a3a3a; }
      .qc-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width:18px; height:18px; border-radius:50%; background:#00ff96; margin-top:-4px; border:2px solid #023b1f;}
      .qc-range::-moz-range-track { height:10px; background:#3a3a3a; border-radius:6px; }
      .qc-range::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:#00ff96; border:2px solid #023b1f;}
      .qc-panel { background: linear-gradient(180deg, rgba(0,20,10,0.45), rgba(0,10,5,0.35)); padding:12px; border-radius:10px; color:#dfffe6; font-family: Inter, Roboto, sans-serif; box-shadow: 0 8px 22px rgba(0,0,0,0.45);}
      .qc-btn { background: #063; color:#dfffe6; border: none; padding:8px 10px; border-radius:8px; cursor:pointer; font-weight:700;}
      .qc-small { font-family: monospace; color:#bfffd0; font-size:13px; }
    `;
    document.head.appendChild(s);
  }, []);

  // gaussian normal generator
  const randNormal = (() => {
    let spare = null;
    return () => {
      if (spare !== null) { const v = spare; spare = null; return v; }
      let u, v, s;
      do { u = Math.random() * 2 - 1; v = Math.random() * 2 - 1; s = u * u + v * v; } while (s === 0 || s >= 1);
      const mul = Math.sqrt(-2.0 * Math.log(s) / s);
      spare = v * mul;
      return u * mul;
    };
  })();

  // compute thermal sigma (m/s) for each velocity component: sqrt(kB T / m)
  const sigma_mps = (Tkelvin) => Math.sqrt((kB * Math.max(1e-12, Tkelvin)) / mass);

  // compute thermal de Broglie wavelength (m): lambda = h / sqrt(2π m kB T)
  const lambda_db = (Tkelvin) => h / Math.sqrt(2 * Math.PI * mass * kB * Math.max(1e-12, Tkelvin));

  // compute degeneracy parameter n * lambda^3 for box physical size (we assume a physical box length)
  // choose a representative physical box length for density mapping (user can change in code)
  const BOX_LENGTH_M = 1e-6; // 1 micron (tunable). we show value to user; real gases differ dramatically.
  const computeDegeneracy = (N, Tkelvin) => {
    const V = BOX_LENGTH_M ** 3;
    const n = N / V;
    const lambda = lambda_db(Tkelvin);
    const eta = n * lambda ** 3;
    return { eta, n, lambda };
  };

  // initialize / rebuild scene when count or distribution changes
  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    mount.innerHTML = "";

    // Scene / camera / renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x021007);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, BOX_HALF * 3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // lights
    const amb = new THREE.AmbientLight(0x66ffb8, 0.25);
    const pl = new THREE.PointLight(0x66ffb8, 0.9);
    pl.position.set(0, BOX_HALF * 1.5, BOX_HALF);
    scene.add(amb, pl);

    // box (wireframe)
    const box = new THREE.Mesh(new THREE.BoxGeometry(BOX_HALF * 2, BOX_HALF * 2, BOX_HALF * 2),
      new THREE.MeshBasicMaterial({ color: 0x064f2f, wireframe: true, opacity: 0.08, transparent: true }));
    scene.add(box);

    // particle pool
    particlesRef.current = [];
    velocitiesRef.current = [];

    // geometry and separate materials per kind
    const geo = new THREE.SphereGeometry(0.6, 12, 12);

    // function to create a particle
    const createParticle = (i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: distribution === "bose" ? 0x66ffcc : distribution === "fermi" ? 0xffb07a : 0x90ffb0,
        emissive: 0x003318,
        metalness: 0.15,
        roughness: 0.6,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set((Math.random() - 0.5) * BOX_HALF * 2 * 0.9, (Math.random() - 0.5) * BOX_HALF * 2 * 0.9, (Math.random() - 0.5) * BOX_HALF * 2 * 0.9);
      scene.add(m);
      particlesRef.current.push(m);
      // initial velocity sample Maxwellian
      const sigma = sigma_mps(T) * VEL_SCALE;
      velocitiesRef.current.push(new THREE.Vector3(randNormal() * sigma, randNormal() * sigma, randNormal() * sigma));
    };

    for (let i = 0; i < count; i++) createParticle(i);

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // animation loop and physics
    let lastEntropy = 0;
    let lastTick = performance.now();
    const gc = { box };

    const animate = (t) => {
      animRef.current = requestAnimationFrame(animate);
      const dt = (t - lastTick) * 0.001 || 0.016;
      lastTick = t;
      const parts = particlesRef.current;
      const vels = velocitiesRef.current;

      // precompute degeneracy param
      const { eta, n, lambda } = computeDegeneracy(parts.length, T);
      // scaled for visualization
      const scaledEta = eta * quantumScale;
      setDegeneracyVal(eta);

      // For bosons: condensation fraction (visual) ~ clamp((scaledEta)/2.612, 0, 1)
      const condFrac = Math.max(0, Math.min(1, scaledEta / 2.612));
      // For fermions: degeneracy factor for stronger Pauli-like repulsion
      const fermiDeg = Math.max(0, Math.min(1, scaledEta));

      // move particles
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const v = vels[i];

        // apply different behavior
        if (distribution === "bose") {
          // attractor = center (ground state). strength scales with condFrac and with (1 - T/Tvis)
          // cause clustering at low T or when quantumScale is big
          const attractor = new THREE.Vector3(0, -BOX_HALF * 0.15, 0);
          const toCenter = attractor.clone().sub(p.position);
          // attraction magnitude
          const attStrength = 0.6 * condFrac; // tune
          v.add(toCenter.normalize().multiplyScalar(attStrength * dt));
          // small random jitter scaled by temperature
          v.add(new THREE.Vector3((Math.random()-0.5) * 0.3 * Math.sqrt(T/300), (Math.random()-0.5) * 0.3 * Math.sqrt(T/300), (Math.random()-0.5) * 0.3 * Math.sqrt(T/300)).multiplyScalar(VEL_SCALE));
        } else if (distribution === "fermi") {
          // short-range repulsion: if close to others, push out stronger when degeneracy large
          const repulseRadius = 2.2;
          for (let j = 0; j < parts.length; j++) {
            if (j === i) continue;
            const other = parts[j];
            const dist = p.position.distanceTo(other.position);
            if (dist < repulseRadius && dist > 0.0001) {
              const push = p.position.clone().sub(other.position).normalize().multiplyScalar((repulseRadius - dist) * 0.02 * (1 + 4 * fermiDeg));
              v.add(push);
            }
          }
          // thermal jitter
          v.add(new THREE.Vector3((Math.random()-0.5) * 0.5, (Math.random()-0.5) * 0.5, (Math.random()-0.5) * 0.5).multiplyScalar(sigma_mps(T) * VEL_SCALE * 0.2));
        } else {
          // Maxwell-Boltzmann: mostly thermal motion
          // small random resampling to keep Maxwellian shape
          const sigma = sigma_mps(T) * VEL_SCALE;
          if (Math.random() < 0.02) {
            v.set(randNormal() * sigma, randNormal() * sigma, randNormal() * sigma);
          }
          v.add(new THREE.Vector3((Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2).multiplyScalar(sigma));
        }

        // simple damping to avoid runaway speeds
        v.multiplyScalar(0.995);

        // step
        p.position.add(v.clone().multiplyScalar(60 * dt)); // scale so motion visible; 60*dt approximates frames/sec scaling

        // bounce on walls
        ["x","y","z"].forEach((axis) => {
          if (p.position[axis] > BOX_HALF) { p.position[axis] = BOX_HALF; v[axis] *= -0.9; }
          if (p.position[axis] < -BOX_HALF) { p.position[axis] = -BOX_HALF; v[axis] *= -0.9; }
        });
      }

      // color mapping by kinetic energy (visual)
      // compute expected KE per particle approx (1.5 k_B T) in J -> convert to visual KE via VEL_SCALE^2 scaling
      const expectedKE_J = 1.5 * kB * T;
      const expected_visKE = 0.5 * mass * ( (sigma_mps(T) * VEL_SCALE) ** 2 ); // approximate unit
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const v = vels[i];
        const ke_vis = 0.5 * mass * ( (v.length() / VEL_SCALE) ** 2 ); // approximate convert back
        // get color mapped by ke relative to expected
        const ratio = Math.min(4, ke_vis / Math.max(expectedKE_J, 1e-30));
        // hue 120 (green) -> 60 (yellow) -> 0 (red)
        const hue = 120 - Math.min(120, ratio * 50);
        const col = new THREE.Color();
        col.setHSL((hue / 360 + 1) % 1, 0.85, 0.45);
        p.material.color.r = col.r; p.material.color.g = col.g; p.material.color.b = col.b;
      }

      // entropy estimator (speeds histogram)
      if (performance.now() - lastEntropy > 150) {
        lastEntropy = performance.now();
        const speeds = velocitiesRef.current.map(v => v.length());
        // compute simple entropy from histogram
        const nbins = 12;
        const maxv = Math.max(...speeds, 1e-6);
        const minv = Math.min(...speeds, 0);
        const bins = new Array(nbins).fill(0);
        speeds.forEach(s => {
          let idx = Math.floor(((s - minv) / (maxv - minv + 1e-12)) * nbins);
          if (idx >= nbins) idx = nbins - 1;
          bins[idx]++; 
        });
        const probs = bins.map(c => c / speeds.length).filter(p => p > 0);
        let S = 0;
        probs.forEach(p => S -= p * Math.log(p));
        const Smax = Math.log(nbins);
        setEntropy(Math.max(0, Math.min(1, S / (Smax || 1))));
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animRef.current = requestAnimationFrame(animate);

    // resize
    const onResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animRef.current);
      try { controls.dispose(); } catch {}
      try { particlesRef.current.forEach(p => { p.geometry?.dispose(); p.material?.dispose(); p.parent?.remove(p); }); } catch {}
      try { if (rendererRef.current) { const el = rendererRef.current.domElement; rendererRef.current.dispose(); if (el && el.parentNode) el.parentNode.removeChild(el); } } catch (e) {}
      particlesRef.current = [];
      velocitiesRef.current = [];
      sceneRef.current = null;
      rendererRef.current = null;
    };
  }, [count, distribution]); // rebuild when particle count or distribution changes

  // Recompute degeneracy and show computed values (honest physics) on UI when T or count or quantumScale change
  useEffect(() => {
    const { eta, n, lambda } = computeDegeneracy(count, T);
    setDegeneracyVal(eta);
    // If canonical (maxwell) we can resample velocities according to T
    // quick thermostat: resample a fraction to show change
    if (velocitiesRef.current.length) {
      const sigma = sigma_mps(T) * VEL_SCALE;
      velocitiesRef.current = velocitiesRef.current.map(v => {
        if (distribution === "maxwell" || Math.random() < 0.25) {
          return new THREE.Vector3(randNormal() * sigma, randNormal() * sigma, randNormal() * sigma);
        }
        return v;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [T, count, distribution, quantumScale]);

  return (
  <div
    style={{
      width,
      maxWidth: "1200px",
      margin: "0 auto",
      position: "relative",
      color: "#dfffe6",
      fontFamily: "Inter, Roboto, sans-serif",
    }}
  >
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
        border: "2px solid rgba(10,255,153,0.08)",
      }}
    />

    {/* top-right entropy */}
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 9,
        textAlign: "right",
      }}
    >
      <div style={{ width: 110, textAlign: "center" }}>
        <svg width="84" height="84" viewBox="0 0 84 84">
          <defs>
            <linearGradient id="gq" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#b8ffd4" />
              <stop offset="100%" stopColor="#0bb96f" />
            </linearGradient>
          </defs>
          <g transform="translate(42,42)">
            <circle
              r="30"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="10"
              transform="rotate(-90)"
            />
            <circle
              r="30"
              fill="none"
              stroke="url(#gq)"
              strokeWidth="10"
              strokeDasharray={`${(2 * Math.PI * 30) * entropy} ${(2 * Math.PI * 30) * (1 - entropy)}`}
              transform="rotate(-90)"
              strokeLinecap="round"
            />
          </g>
        </svg>
        <div
          style={{
            color: "#dfffe6",
            fontSize: 12,
            marginTop: 6,
            fontFamily: "monospace",
          }}
        >
          Entropy
        </div>
        <div
          style={{
            color: "#bfffd0",
            fontWeight: 700,
            fontFamily: "monospace",
            fontSize: 13,
          }}
        >
          {Math.round(entropy * 100)}%
        </div>
      </div>
    </div>

    {/* responsive column panel */}
    <div
      className="qc-panel"
      style={{
        marginTop: 12,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        alignItems: "stretch",
      }}
    >
      {/* Distribution selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label className="qc-small">Distribution</label>
        <select
          value={distribution}
          onChange={(e) => setDistribution(e.target.value)}
          style={{
            background: "#072814",
            color: "#bfffd0",
            borderRadius: 8,
            padding: "6px 8px",
            border: "1px solid rgba(10,255,153,0.06)",
          }}
        >
          <option value="maxwell">Maxwell–Boltzmann (classical)</option>
          <option value="fermi">Fermi–Dirac (fermions)</option>
          <option value="bose">Bose–Einstein (bosons)</option>
        </select>
      </div>

      {/* Particle count */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div className="qc-small">
          Particles: <b style={{ color: "#eafff0" }}>{count}</b>
        </div>
        <input
          className="qc-range"
          type="range"
          min="30"
          max="400"
          step="1"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
        />
      </div>

      {/* Temperature */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div className="qc-small">
          Temperature (K): <b style={{ color: "#eafff0" }}>{T}</b>
        </div>
        <input
          className="qc-range"
          type="range"
          min="1"
          max="5000"
          step="1"
          value={T}
          onChange={(e) => setT(parseFloat(e.target.value))}
        />
      </div>

      {/* Quantum scale */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div className="qc-small">
          Quantum scale (visual):{" "}
          <b style={{ color: "#eafff0" }}>{Number(quantumScale).toExponential(0)}</b>
        </div>
        <input
          className="qc-range"
          type="range"
          min="1e6"
          max="1e12"
          step="1e6"
          value={quantumScale}
          onChange={(e) => setQuantumScale(parseFloat(e.target.value))}
        />
      </div>

      {/* Chemical potential */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div className="qc-small">
          μ (eV): <b style={{ color: "#eafff0" }}>{mu.toFixed(2)}</b>
        </div>
        <input
          className="qc-range"
          type="range"
          min={-5}
          max={5}
          step={0.01}
          value={mu}
          onChange={(e) => setMu(parseFloat(e.target.value))}
        />
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "stretch",
          marginTop: 10,
        }}
      >
        <button className="qc-btn" onClick={() => setDistribution("maxwell")}>
          Preset: Maxwell
        </button>
        <button className="qc-btn" onClick={() => setDistribution("fermi")}>
          Preset: Fermi
        </button>
        <button className="qc-btn" onClick={() => setDistribution("bose")}>
          Preset: Bose
        </button>
        <button
          className="qc-btn"
          onClick={() => {
            setQuantumScale(1e10);
            setT(50);
          }}
        >
          Demo: Strong Quantum
        </button>
      </div>
    </div>

    <div
      style={{
        marginTop: 10,
        color: "#80ffaa",
        fontFamily: "monospace",
        fontSize: 13,
        textAlign: "center",
      }}
    >
      Tip: real quantum degeneracy (nλ³ ~ 1) needs ultracold T or high n; this
      sim shows both physical and amplified visual modes.
    </div>
  </div>
);

}

