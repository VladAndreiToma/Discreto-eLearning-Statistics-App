// src/components/BoltzmannEntropyGauge.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";

export default function EnsembleNexusWebEngine({
  totalParticles = 120,
  maxParticles = 300,
  width = "100%",
  height = 420,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const resizeObsRef = useRef(null);

  // physics/UI state (T in eV)
  const [mode, setMode] = useState("canonical"); // microcanonical | canonical | grandcanonical | mixed
  const [T_eV, setT_eV] = useState(0.25);
  const [Etotal_eV, setEtotal_eV] = useState(10.0);
  const [mu_eV, setMu_eV] = useState(0.0);
  const [invertMu, setInvertMu] = useState(false);

  // diagnostics
  const [entropyNorm, setEntropyNorm] = useState(0);
  const [particleCount, setParticleCount] = useState(totalParticles);

  // palettes & base params (green theme)
  const baseColors = ["#1ee6a8", "#66ff88", "#39c48a"];
  const baseSizes = [0.95, 1.15, 1.45];
  const baseSpeeds = [0.008, 0.014, 0.02];

  // Physical constants & mapping
  const kB_eV_per_K = 8.617333262e-5; // eV / K
  const VEL_SCALE = 0.06; // visual velocity scale
  const ENERGY_TO_VIS = 1.0; // visual energy multiplier

  // gaussian random (Box-Muller)
  const randNormal = (() => {
    let spare = null;
    return () => {
      if (spare !== null) {
        const v = spare;
        spare = null;
        return v;
      }
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

  // helpers: KE (visual units) and conversions
  const particleKE_visual = (p) => 0.5 * p.userData.velocity.lengthSq();
  const computeTotalKE_visual = (arr) => arr.reduce((a, p) => a + particleKE_visual(p), 0);

  const sigma_visual_from_TeV = (TeV) => Math.sqrt(Math.max(1e-9, TeV)) * VEL_SCALE;
  const KE_visual_to_eV = (KEvis) => KEvis * ENERGY_TO_VIS;

  // size / speed / color mapping based on T and E (deterministic functions)
  const sizeFactorFromState = (TeV, Etot) => {
    // small, smooth function: increases with sqrt(T) and logarithmically with E
    const t = Math.sqrt(Math.max(TeV, 1e-9));
    const e = Math.log10(1 + Math.max(Etot, 0));
    return 1 + 0.35 * t + 0.06 * e; // tuned for pleasant visuals
  };

  const speedFactorFromState = (TeV, Etot) => {
    const t = Math.sqrt(Math.max(TeV, 1e-9));
    const e = Math.log10(1 + Math.max(Etot, 0));
    return 1 + 0.9 * t + 0.06 * e; // multiplies baseSpeeds
  };

  const colorTintFromState = (TeV, Etot) => {
    // returns an H shift and saturation multiplier; higher T/E -> slightly warmer/more saturated
    const t = Math.min(1, Math.sqrt(Math.max(TeV, 0)) / 1.8);
    const e = Math.min(1, Math.log10(1 + Math.max(Etot, 0)) / 3);
    const hueShift = t * 0.04; // shift hue slightly toward yellow/red (in HSL 0..1 space)
    const satMul = 1 + 0.25 * t + 0.08 * e;
    return { hueShift, satMul };
  };

  // color mapping: low KE -> green -> higher KE -> yellow/red (kept, but base color gets tinted by state)
  const colorFromKE = (ke_eV, reference_eV, stateTint) => {
    const norm = Math.max(0, Math.min(1, ke_eV / (reference_eV * 4)));
    const hue = 120 - 120 * norm; // degrees
    const c = new THREE.Color();
    c.setHSL((hue / 360 + 1) % 1, Math.min(1, 0.85 * stateTint.satMul), 0.5);
    // apply small hue shift from global state
    const hsl = {};
    c.getHSL(hsl);
    hsl.h = (hsl.h + stateTint.hueShift) % 1;
    c.setHSL(hsl.h, hsl.s, hsl.l);
    return c;
  };

  // microcanonical enforcement
  const enforceMicrocanonicalEnergy = (Etarget_eV) => {
    const arr = particlesRef.current;
    if (!arr.length) return;
    const currentE = computeTotalKE_visual(arr);
    const targetVisualE = Math.max(1e-8, Etarget_eV * ENERGY_TO_VIS);
    if (currentE <= 1e-9) return;
    const factor = Math.sqrt(targetVisualE / currentE);
    arr.forEach((p) => p.userData.velocity.multiplyScalar(factor));
  };

  // canonical thermostat
  const weakCanonicalThermostat = (T_ev) => {
    const arr = particlesRef.current;
    if (!arr.length) return;
    const sigma = sigma_visual_from_TeV(T_ev);
    const nudges = 0.12;
    arr.forEach((p) => {
      const vx = randNormal() * sigma;
      const vy = randNormal() * sigma;
      const vz = randNormal() * sigma;
      p.userData.velocity.x = THREE.MathUtils.lerp(p.userData.velocity.x, vx, nudges);
      p.userData.velocity.y = THREE.MathUtils.lerp(p.userData.velocity.y, vy, nudges);
      p.userData.velocity.z = THREE.MathUtils.lerp(p.userData.velocity.z, vz, nudges);
    });
  };

  // grand canonical add/remove
  const addParticleRandomized = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const geom = new THREE.SphereGeometry(0.035, 12, 12);
    const pick = Math.floor(Math.random() * 3);
    const mat = new THREE.MeshStandardMaterial({ color: baseColors[pick], emissive: 0x002210, metalness: 0.12, roughness: 0.6 });
    const m = new THREE.Mesh(geom, mat);
    m.position.set((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6);

    const sigma = sigma_visual_from_TeV(T_eV);
    const speedMul = speedFactorFromState(T_eV, Etotal_eV);
    m.userData = { velocity: new THREE.Vector3(randNormal() * sigma * speedMul, randNormal() * sigma * speedMul, randNormal() * sigma * speedMul), type: pick };

    const sizeMul = sizeFactorFromState(T_eV, Etotal_eV);
    const s0 = baseSizes[pick] * sizeMul * (0.95 + (Math.random() - 0.5) * 0.06);
    m.scale.set(s0, s0, s0);

    // tint base color according to global T/E
    const stateTint = colorTintFromState(T_eV, Etotal_eV);
    const base = new THREE.Color(baseColors[pick]);
    const hsl = {}; base.getHSL(hsl);
    const newH = (hsl.h + stateTint.hueShift + 1) % 1;
    const newS = Math.min(1, hsl.s * stateTint.satMul);
    base.setHSL(newH, newS, hsl.l);
    m.material.color.copy(base);

    scene.add(m);
    particlesRef.current.push(m);
    setParticleCount(particlesRef.current.length);
  }, [T_eV, Etotal_eV]);

  const removeRandomParticle = useCallback(() => {
    const arr = particlesRef.current;
    if (!arr.length) return;
    const idx = Math.floor(Math.random() * arr.length);
    const p = arr[idx];
    try { p.geometry?.dispose(); } catch {}
    try { p.material?.dispose(); } catch {}
    try { p.parent?.remove(p); } catch {}
    arr.splice(idx, 1);
    setParticleCount(arr.length);
  }, []);

  const applyGrandCanonicalTick = useCallback(() => {
    const arr = particlesRef.current;
    const targetMu = invertMu ? -mu_eV : mu_eV;
    const pAdd = 1 / (1 + Math.exp(-targetMu));
    const addChance = pAdd * (0.6 + Math.min(0.4, T_eV));
    const removeChance = (1 - pAdd) * (0.6 + Math.min(0.4, T_eV));
    if (Math.random() < addChance && arr.length < maxParticles) addParticleRandomized();
    else if (Math.random() < removeChance && arr.length > 2) removeRandomParticle();
  }, [mu_eV, invertMu, T_eV, addParticleRandomized, removeRandomParticle]);

  // entropy helpers
  const histEntropyNormalized = (values = [], nbins = 10) => {
    if (!values.length) return 0;
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (Math.abs(max - min) < 1e-9) return 0;
    const bins = new Array(nbins).fill(0);
    const range = max - min;
    values.forEach((v) => {
      let idx = Math.floor(((v - min) / range) * nbins);
      if (idx >= nbins) idx = nbins - 1;
      if (idx < 0) idx = 0;
      bins[idx]++;
    });
    const probs = bins.map((c) => c / values.length).filter((p) => p > 0);
    const S = -probs.reduce((a, p) => a + p * Math.log(p), 0);
    return S / Math.log(nbins);
  };

  const computeEntropyNormalized = (particles) => {
    if (!particles.length) return 0;
    const speeds = particles.map((p) => p.userData.velocity.length());
    const sEnt = histEntropyNormalized(speeds, 12);
    const sizes = particles.map((p) => p.scale.x || 1);
    const sizeEnt = histEntropyNormalized(sizes, 8);
    const hues = particles.map((p) => { const hsl = {}; p.material.color.getHSL(hsl); return hsl.h ?? 0; });
    const hueEnt = histEntropyNormalized(hues, 12);
    return Math.min(1, Math.max(0, 0.6 * sEnt + 0.2 * sizeEnt + 0.2 * hueEnt));
  };

  // ---------- Scene init ----------
  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = "";

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x04110a);

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.4, 3.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    const cappedDPR = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(cappedDPR);
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    try { if (!mountRef.current.contains(renderer.domElement)) mountRef.current.appendChild(renderer.domElement); } catch (e) { console.warn(e); }

    // lights + box
    scene.add(new THREE.AmbientLight(0x66ffb8, 0.28));
    const pLight = new THREE.PointLight(0x66ffb8, 0.9); pLight.position.set(0, 2.2, 2); scene.add(pLight);
    const box = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshBasicMaterial({ color: 0x0b6b49, wireframe:true, transparent:true, opacity:0.07 }));
    scene.add(box);

    // particle pool
    const particles = [];
    const sphereGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const globalSizeMul = sizeFactorFromState(T_eV, Etotal_eV);
    const globalSpeedMul = speedFactorFromState(T_eV, Etotal_eV);
    const stateTint = colorTintFromState(T_eV, Etotal_eV);

    for (let i = 0; i < totalParticles; i++) {
      const pick = i % 3;
      const mat = new THREE.MeshStandardMaterial({ color: baseColors[pick], emissive: 0x002210, metalness: 0.12, roughness: 0.6 });
      const m = new THREE.Mesh(sphereGeo, mat);
      m.position.set((Math.random() - 0.5)*1.8, (Math.random() - 0.5)*1.8, (Math.random() - 0.5)*1.8);

      const sigma = sigma_visual_from_TeV(T_eV);
      m.userData = { velocity: new THREE.Vector3(randNormal()*sigma*globalSpeedMul, randNormal()*sigma*globalSpeedMul, randNormal()*sigma*globalSpeedMul), type: pick };

      const s0 = baseSizes[pick] * globalSizeMul * (0.97 + (Math.random()-0.5)*0.04);
      m.scale.set(s0,s0,s0);

      // tint base color according to global T/E
      const base = new THREE.Color(baseColors[pick]);
      const hsl = {}; base.getHSL(hsl);
      const newH = (hsl.h + stateTint.hueShift + 1) % 1;
      const newS = Math.min(1, hsl.s * stateTint.satMul);
      base.setHSL(newH, newS, hsl.l);
      m.material.color.copy(base);

      scene.add(m);
      particles.push(m);
    }
    particlesRef.current = particles;
    setParticleCount(particles.length);

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // animation loop
    let lastEntropy = 0;
    let lastGCtick = 0;
    const gcInterval = 700;
    const entropyInterval = 150;

    const animate = (t) => {
      animRef.current = requestAnimationFrame(animate);
      const arr = particlesRef.current;

      // move & bounce
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        p.position.add(p.userData.velocity);
        ["x","y","z"].forEach((axis) => {
          if (Math.abs(p.position[axis]) > 0.95) {
            p.userData.velocity[axis] *= -1;
            p.position[axis] = Math.sign(p.position[axis]) * 0.95;
          }
        });
      }

      // grand canonical ticks
      if (t - lastGCtick > gcInterval) {
        lastGCtick = t;
        if (mode === "grandcanonical" || mode === "mixed") applyGrandCanonicalTick();
      }

      // apply ensembles and visuals
      if (mode === "microcanonical") {
        enforceMicrocanonicalEnergy(Etotal_eV);
        particlesRef.current.forEach(p => { p.material.emissiveIntensity = 0.12; p.material.color.offsetHSL(0, -0.002, 0); });
      } else if (mode === "canonical") {
        weakCanonicalThermostat(T_eV);
        const e = Math.min(1, T_eV * 1.2);
        particlesRef.current.forEach(p => { p.material.emissiveIntensity = 0.18 * e + 0.03; });
      } else if (mode === "grandcanonical") {
        // additions/removals handled by tick
      } else if (mode === "mixed") {
        enforceMicrocanonicalEnergy(Etotal_eV);
        weakCanonicalThermostat(T_eV);
        particlesRef.current.forEach(p => { p.material.emissiveIntensity = 0.2; });
      }

      // update per-particle color by KE and global tint
      const avgExpectedKE_eV = (mode === "microcanonical" ? (Etotal_eV / Math.max(1, arr.length)) : (1.5 * T_eV));
      const stateTintNow = colorTintFromState(T_eV, Etotal_eV);
      for (const p of arr) {
        const ke_vis = particleKE_visual(p);
        const ke_eV = KE_visual_to_eV(ke_vis);
        const c = colorFromKE(ke_eV, Math.max(1e-6, avgExpectedKE_eV), stateTintNow);
        p.material.color.r = c.r; p.material.color.g = c.g; p.material.color.b = c.b;
      }

      // entropy throttle
      if (t - lastEntropy > entropyInterval) {
        lastEntropy = t;
        const ent = computeEntropyNormalized(arr);
        setEntropyNorm(ent);
        setParticleCount(arr.length);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animRef.current = requestAnimationFrame(animate);

    // responsive
    const onResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || height;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    if (typeof ResizeObserver !== "undefined") {
      resizeObsRef.current = new ResizeObserver(onResize);
      resizeObsRef.current.observe(mountRef.current);
    } else window.addEventListener("resize", onResize);

    // cleanup
    return () => {
      try { if (resizeObsRef.current) resizeObsRef.current.disconnect(); else window.removeEventListener("resize", onResize); } catch {}
      try { if (animRef.current) cancelAnimationFrame(animRef.current); } catch {}
      try { controls.dispose(); } catch {}
      try { particlesRef.current.forEach(p => { p.geometry?.dispose(); p.material?.dispose(); p.parent?.remove(p); }); } catch {}
      try { box.geometry.dispose(); box.material.dispose(); } catch {}
      try { if (rendererRef.current) { const el = rendererRef.current.domElement; rendererRef.current.dispose(); if (el && el.parentNode) el.parentNode.removeChild(el); } } catch (e) {}
      particlesRef.current = [];
      sceneRef.current = null;
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // when mode / T / E change, apply quick effect
  useEffect(() => {
    if (!particlesRef.current.length) return;
    if (mode === "canonical") {
      const sigma = sigma_visual_from_TeV(T_eV);
      const speedMul = speedFactorFromState(T_eV, Etotal_eV);
      particlesRef.current.forEach(p => p.userData.velocity.set(randNormal()*sigma*speedMul, randNormal()*sigma*speedMul, randNormal()*sigma*speedMul));
      setEntropyNorm(computeEntropyNormalized(particlesRef.current));
    } else if (mode === "microcanonical") {
      enforceMicrocanonicalEnergy(Etotal_eV);
      setEntropyNorm(computeEntropyNormalized(particlesRef.current));
    } else if (mode === "mixed") {
      enforceMicrocanonicalEnergy(Etotal_eV);
      weakCanonicalThermostat(T_eV);
      setEntropyNorm(computeEntropyNormalized(particlesRef.current));
    }

    // also update sizes/colors to follow new T/E
    const sizeMul = sizeFactorFromState(T_eV, Etotal_eV);
    const stateTint = colorTintFromState(T_eV, Etotal_eV);
    particlesRef.current.forEach((p, i) => {
      const pick = p.userData.type ?? (i % 3);
      const targetSize = baseSizes[pick] * sizeMul;
      gsap.to(p.scale, { x: targetSize, y: targetSize, z: targetSize, duration: 0.6 });

      // small tint animation
      const base = new THREE.Color(baseColors[pick]);
      const hsl = {}; base.getHSL(hsl);
      const newH = (hsl.h + stateTint.hueShift + 1) % 1;
      const newS = Math.min(1, hsl.s * stateTint.satMul);
      base.setHSL(newH, newS, hsl.l);
      gsap.to(p.material.color, { r: base.r, g: base.g, b: base.b, duration: 0.6 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, T_eV, Etotal_eV]);

  // UI styles injection (en-* classes) — reuse your existing theme
  useEffect(() => {
    const id = "en-styles-boltz";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      .en-controls { background: linear-gradient(180deg, rgba(0,20,10,0.45), rgba(0,10,5,0.35)); padding:12px; border-radius:10px; color:#dfffe6; font-family: Inter, Roboto, sans-serif; box-shadow: 0 8px 22px rgba(0,0,0,0.45); }
      .en-row { display:flex; gap:8px; align-items:center; margin-bottom:10px; flex-wrap:wrap; }
      .en-btn { background: linear-gradient(90deg,#0f6,#06a); color:#042; border: none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:700; font-size:13px; }
      .en-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,200,100,0.06); }
      .en-sublabel { font-size:13px; color:#bfffd0; font-family:monospace; width:120px; }
      .en-range { width:100%; accent-color: #26e698; }
      .en-col { display:flex; flex-direction:column; gap:10px; width:100%; max-width:820px; margin:0 auto; }
      .en-slider-row { display:flex; flex-direction:column; gap:6px; }
      .en-center { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }
      .mode-desc { font-family: monospace; color:#cfffe0; font-size:12px; background: rgba(0,10,5,0.6); padding:8px 10px; border-radius:8px; border:1px solid rgba(10,255,153,0.08); }
    `;
    document.head.appendChild(s);
  }, []);

  // Entropy gauge small component (top-right) — improved contrast
  const EntropyGauge = ({ value = 0 }) => {
    const pct = Math.round(value * 100);
    return (
      <div style={{ width: 132, textAlign: "center", background: "rgba(0,6,4,0.66)", padding:8, borderRadius:12, boxShadow: "0 8px 20px rgba(0,0,0,0.6)", border: "1px solid rgba(180,255,200,0.08)" }}>
        <svg width="96" height="96" viewBox="0 0 84 84">
          <defs><linearGradient id="g1_mod" x1="0%" x2="100%"><stop offset="0%" stopColor="#e9fff6"/><stop offset="100%" stopColor="#0bb96f"/></linearGradient></defs>
          <g transform="translate(42,42)">
            <circle r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" transform="rotate(-90)"/>
            <circle r="30" fill="none" stroke="url(#g1_mod)" strokeWidth="10" strokeDasharray={`${(2*Math.PI*30)*value} ${(2*Math.PI*30)*(1-value)}`} transform="rotate(-90)" strokeLinecap="round" />
          </g>
        </svg>
        <div style={{ color: "#e6fff0", fontSize: 12, marginTop: 6, fontFamily: "monospace" }}>Entropy</div>
        <div style={{ color: "#bfffd0", fontWeight: 700, fontFamily: "monospace", fontSize: 14 }}>{pct}%</div>
      </div>
    );
  };

  // bottom-left mode description (compact)
  const ModeDescription = () => {
    const avgKE_per_particle_eV = mode === "microcanonical" ? (Etotal_eV / Math.max(1, particleCount)) : (1.5 * T_eV);
    const T_K = (T_eV / kB_eV_per_K).toFixed(0);
    return (
      <div style={{ position: "absolute", left: 12, bottom: 12, zIndex: 9, maxWidth: 360 }}>
      </div>
    );
  };

  // quick presets (sizes/speeds now come from state mapping)
  const presetAllEven = () => {
    const particles = particlesRef.current;
    const globalSizeMul = sizeFactorFromState(T_eV, Etotal_eV);
    const globalSpeedMul = speedFactorFromState(T_eV, Etotal_eV);
    setTimeout(()=> {
      particles.forEach((p) => {
        const medianSize = (baseSizes[0]+baseSizes[1]+baseSizes[2])/3 * globalSizeMul;
        gsap.to(p.material.color, { r: 0.6, g: 0.95, b: 0.8, duration: 0.6 });
        gsap.to(p.scale, { x: medianSize, y:medianSize, z:medianSize, duration: 0.6 });
        const dir = p.userData.velocity.clone().normalize();
        const newVel = dir.multiplyScalar(baseSpeeds[p.userData.type ?? 0] * globalSpeedMul);
        gsap.to(p.userData.velocity, { x:newVel.x, y:newVel.y, z:newVel.z, duration:0.6 });
      });
    }, 60);
  };

  const presetAllRandom = () => {
    const particles = particlesRef.current;
    const globalSizeMul = sizeFactorFromState(T_eV, Etotal_eV);
    const globalSpeedMul = speedFactorFromState(T_eV, Etotal_eV);
    setTimeout(() => {
      particles.forEach((p) => {
        const pick = Math.floor(Math.random()*3);
        const base = new THREE.Color(baseColors[pick]);
        const stateTint = colorTintFromState(T_eV, Etotal_eV);
        const hsl = {}; base.getHSL(hsl);
        const newH = (hsl.h + stateTint.hueShift + (Math.random()-0.5)*0.02 + 1) % 1;
        const col = new THREE.Color().setHSL(newH, Math.min(1, hsl.s * stateTint.satMul), hsl.l);
        gsap.to(p.material.color, { r: col.r, g: col.g, b: col.b, duration: 0.6 });
        const newSize = baseSizes[pick] * globalSizeMul * (0.95 + (Math.random()-0.5) * 0.06);
        gsap.to(p.scale, { x:newSize, y:newSize, z:newSize, duration:0.6 });
        const dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
        const newVel = dir.multiplyScalar(baseSpeeds[pick] * globalSpeedMul);
        gsap.to(p.userData.velocity, { x:newVel.x, y:newVel.y, z:newVel.z, duration:0.6 });
      });
    }, 80);
  };

  // render UI
  return (
    <div style={{ width: "100%", maxWidth: width, margin: "0 auto", position: "relative", boxSizing:"border-box" }}>
      <div ref={mountRef} style={{ width: "100%", height, borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.6)", border: "2px solid rgba(10,255,153,0.12)" }} />

      {/* top-right gauge + ensemble label */}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 9, textAlign: "right" }}>
        <EntropyGauge value={entropyNorm} />
        <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(2,12,8,0.7)", color:"#bfffd0", fontFamily:"monospace", fontSize:12 }}>
          <div style={{fontWeight:700, color:"#eafff0", textTransform:"capitalize"}}>{mode}</div>
          <div style={{fontSize:11, opacity:0.9}}>
            {mode==="microcanonical" ? "Total E conserved" : mode==="canonical" ? "Thermostat / Maxwell" : mode==="grandcanonical" ? "Particle exchange (μ)" : "Combined behaviour"}
          </div>
        </div>
      </div>

      {/* bottom-left description */}
      <ModeDescription />

      {/* Controls block */}
      <div style={{ marginTop: 12 }} className="en-controls">
        <div className="en-row en-center" style={{ justifyContent:"center" }}>
          <button className="en-btn" onClick={()=>setMode("microcanonical")} style={{ background: mode==="microcanonical" ? "#0aff9922" : undefined }}>microcanonical</button>
          <button className="en-btn" onClick={()=>setMode("canonical")} style={{ background: mode==="canonical" ? "#0aff9922" : undefined }}>canonical</button>
          <button className="en-btn" onClick={()=>setMode("grandcanonical")} style={{ background: mode==="grandcanonical" ? "#0aff9922" : undefined }}>grandcanonical</button>
          <button className="en-btn" onClick={()=>setMode("mixed")} style={{ background: mode==="mixed" ? "#0aff9922" : undefined }}>mixed</button>
        </div>

        <div className="en-col" style={{ marginTop: 10 }}>
          {/* Temperature slider (T in eV + show Kelvin) */}
          <div className="en-slider-row">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div className="en-sublabel">Temperature (k_B T)</div>
              <div style={{ color:"#bfffd0", fontFamily:"monospace" }}>{T_eV.toFixed(3)} eV ≈ {(T_eV / kB_eV_per_K).toFixed(0)} K</div>
            </div>
            <input className="en-range" type="range" min="0.01" max="3.0" step="0.01" value={T_eV} onChange={e=>setT_eV(parseFloat(e.target.value))} />
          </div>

          {/* Total Energy (eV) */}
          <div className="en-slider-row">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div className="en-sublabel">Total Energy (E)</div>
              <div style={{ color:"#bfffd0", fontFamily:"monospace" }}>{Etotal_eV.toFixed(2)} eV</div>
            </div>
            <input className="en-range" type="range" min="0.1" max="200.0" step="0.1" value={Etotal_eV} onChange={e=>setEtotal_eV(parseFloat(e.target.value))} />
          </div>

          {/* Chemical potential */}
          <div className="en-slider-row">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div className="en-sublabel">Chemical potential (μ)</div>
              <div style={{ color:"#bfffd0", fontFamily:"monospace" }}>{(invertMu ? -mu_eV : mu_eV).toFixed(2)} eV</div>
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <input className="en-range" type="range" min="-10.0" max="10.0" step="0.01" value={mu_eV} onChange={e=>setMu_eV(parseFloat(e.target.value))} />
              <label style={{ color:'#9fffbf', fontSize:13 }}><input type="checkbox" checked={invertMu} onChange={e=>setInvertMu(e.target.checked)} /> invert</label>
            </div>
          </div>
          <div className="en-row" style={{ marginTop:12, justifyContent:"center" }}>
            <button className="en-btn" onClick={presetAllEven}>All Even</button>
            <button className="en-btn" onClick={presetAllRandom}>All Random</button>
          </div>
          <div style={{ marginTop: 10, color: "#80ffaa", fontFamily:"monospace" }}>Particles: {particleCount}</div>
        </div>
      </div>
    </div>
  );
}
