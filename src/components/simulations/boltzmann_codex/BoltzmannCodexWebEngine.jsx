// src/components/BoltzmannEntropyGauge.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";

export default function BoltzmannEntropyGauge({
  totalParticles = 120,
  width = 1100,
  height = 520,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  // counts and base params
  const [counts, setCounts] = useState(() => {
    const base = Math.floor(totalParticles / 3);
    const arr = [base, base, base];
    arr[0] += totalParticles - base * 3;
    return arr;
  });

  // green-ish base palette for states A,B,C
  const baseColors = ["#1ee6a8", "#66ff88", "#39c48a"]; // all green tones

  // <<--- INCREASED VISIBLE SIZES (scale ~1 means geometry size used directly) --->
  const baseSizes = [0.9, 1.1, 1.4];

  const baseSpeeds = [0.008, 0.014, 0.02];

  // randomness sliders (0..1)
  const [sizeRand, setSizeRand] = useState(0.05);
  const [speedRand, setSpeedRand] = useState(0.05);
  const [colorRand, setColorRand] = useState(0.05);

  // entropy 0..1
  const [entropyNorm, setEntropyNorm] = useState(0);

  // init scene once
  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = "";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04110a); // dark green-black

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.4, 3.8);
    cameraRef.current = camera;

    // renderer (safe DPR)
    let renderer;
    try {
      const cappedDPR = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(cappedDPR);
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);
    } catch (err) {
      console.error("WebGL init failed:", err);
      const fallback = document.createElement("div");
      fallback.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#cfeee0;background:#020a06;";
      fallback.innerText = "WebGL unavailable.";
      mountRef.current.appendChild(fallback);
      return;
    }

    // lights + box
    const ambient = new THREE.AmbientLight(0x66ffb8, 0.28);
    const point = new THREE.PointLight(0x66ffb8, 0.9);
    point.position.set(0, 2.2, 2);
    scene.add(ambient, point);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshBasicMaterial({
        color: 0x0b6b49,
        wireframe: true,
        transparent: true,
        opacity: 0.07,
      })
    );
    scene.add(box);

    // create particle pool
    const particles = [];
    // <<--- slightly larger geometry radius so combined with scale gives big visible particles --->
    const sphereGeo = new THREE.SphereGeometry(0.03, 12, 12);

    for (let i = 0; i < totalParticles; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: baseColors[i % 3],
        emissive: 0x002210,
        metalness: 0.12,
        roughness: 0.6,
      });
      const m = new THREE.Mesh(sphereGeo, mat);
      m.position.set((Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.8);
      m.userData = {
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01),
        type: i % 3,
      };
      // initial size vary a bit (use new baseSizes)
      const s0 = baseSizes[i % 3] * (1 + (Math.random() - 0.5) * sizeRand);
      m.scale.set(s0, s0, s0);
      scene.add(m);
      particles.push(m);
    }
    particlesRef.current = particles;

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // animation + entropy computing throttled
    let lastEntropyUpdate = 0;
    const animate = (t) => {
      animRef.current = requestAnimationFrame(animate);
      const arr = particlesRef.current;

      // move & bounce
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        p.position.add(p.userData.velocity);
        ["x", "y", "z"].forEach((axis) => {
          if (Math.abs(p.position[axis]) > 0.95) {
            p.userData.velocity[axis] *= -1;
            p.position[axis] = Math.sign(p.position[axis]) * 0.95;
          }
        });
      }

      // compute entropy every 150ms
      if (t - lastEntropyUpdate > 150) {
        lastEntropyUpdate = t;
        const ent = computeEntropyNormalized(arr);
        setEntropyNorm(ent);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animRef.current = requestAnimationFrame(animate);

    // resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      controls.dispose();
      particlesRef.current.forEach((p) => {
        try { if (p.geometry) p.geometry.dispose(); if (p.material) p.material.dispose(); } catch (e) {}
        try { scene.remove(p); } catch (e) {}
      });
      try { box.geometry.dispose(); box.material.dispose(); } catch (e) {}
      try {
        if (rendererRef.current) {
          rendererRef.current.dispose();
          if (mountRef.current && rendererRef.current.domElement) mountRef.current.removeChild(rendererRef.current.domElement);
        }
      } catch (e) {}
      particlesRef.current = [];
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // once

  // histogram entropy helper
  const histEntropyNormalized = (values = [], nbins = 10) => {
    if (!values.length) return 0;
    let min = Infinity, max = -Infinity;
    for (const v of values) { if (v < min) min = v; if (v > max) max = v; }
    if (min === max) return 0;
    const bins = new Array(nbins).fill(0);
    const range = max - min;
    for (const v of values) {
      let idx = Math.floor(((v - min) / range) * nbins);
      if (idx >= nbins) idx = nbins - 1;
      if (idx < 0) idx = 0;
      bins[idx]++;
    }
    const probs = bins.map((c) => c / values.length).filter((p) => p > 0);
    const S = -probs.reduce((acc, p) => acc + p * Math.log(p), 0);
    const Smax = Math.log(nbins);
    return Smax === 0 ? 0 : S / Smax;
  };

  // compute combined entropy
  const computeEntropyNormalized = (particles) => {
    const speeds = particles.map((p) => p.userData.velocity.length());
    const sEnt = histEntropyNormalized(speeds, 12);

    const sizes = particles.map((p) => (p.scale && p.scale.x) ? p.scale.x : 1.0);
    const sizeEnt = histEntropyNormalized(sizes, 8);

    const hues = [];
    for (const p of particles) {
      const c = p.material.color;
      const hsl = {}; c.getHSL(hsl);
      hues.push(hsl.h || 0);
    }
    const hueEnt = histEntropyNormalized(hues, 12);

    // equal weighting (tweak if desired)
    const avg = (sEnt + sizeEnt + hueEnt) / 3;
    return Math.min(1, Math.max(0, avg));
  };

  // PRESETS implementations (read current randomness vars inside)
  const applyPreset_AllEven = useCallback(() => {
    const particles = particlesRef.current;
    const medianSize = (baseSizes[0] + baseSizes[1] + baseSizes[2]) / 3;
    const medianSpeed = (baseSpeeds[0] + baseSpeeds[1] + baseSpeeds[2]) / 3;
    const averageColor = new THREE.Color(baseColors[0]).lerp(new THREE.Color(baseColors[1]), 0.5).lerp(new THREE.Color(baseColors[2]), 0.5);

    // equal counts
    const eq = Math.floor(totalParticles / 3);
    const baseCounts = [eq, eq, totalParticles - 2 * eq];
    setCounts(baseCounts);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      gsap.to(p.material.color, { r: averageColor.r, g: averageColor.g, b: averageColor.b, duration: 0.8 });
      gsap.to(p.scale, { x: medianSize, y: medianSize, z: medianSize, duration: 0.8 });
      const dir = p.userData.velocity.length() > 1e-6 ? p.userData.velocity.clone().normalize() : new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
      const newVel = dir.multiplyScalar(medianSpeed * (1 - speedRand * Math.random()));
      gsap.to(p.userData.velocity, { x: newVel.x, y: newVel.y, z: newVel.z, duration: 0.8 });
      p.userData.type = i % 3;
    }
  }, [speedRand, totalParticles]);

  const applyPreset_SameSize = useCallback(() => {
    const avgSize = (baseSizes[0] + baseSizes[1] + baseSizes[2]) / 3;
    particlesRef.current.forEach((p) => {
      gsap.to(p.scale, { x: avgSize, y: avgSize, z: avgSize, duration: 0.8 });
    });
  }, []);

  const applyPreset_SameSpeed = useCallback(() => {
    const avgSpeedVal = (baseSpeeds[0] + baseSpeeds[1] + baseSpeeds[2]) / 3;
    particlesRef.current.forEach((p) => {
      const dir = p.userData.velocity.length() > 1e-6 ? p.userData.velocity.clone().normalize() : new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
      const newVel = dir.multiplyScalar(avgSpeedVal * (1 - speedRand * Math.random()));
      gsap.to(p.userData.velocity, { x: newVel.x, y: newVel.y, z: newVel.z, duration: 0.8 });
    });
  }, [speedRand]);

  const applyPreset_SameColor = useCallback(() => {
    const avg = new THREE.Color(baseColors[0]).clone().lerp(new THREE.Color(baseColors[1]), 0.5).lerp(new THREE.Color(baseColors[2]), 0.5);
    particlesRef.current.forEach((p) => {
      gsap.to(p.material.color, { r: avg.r, g: avg.g, b: avg.b, duration: 0.8 });
    });
  }, []);

  const applyPreset_AllRandom = useCallback(() => {
    // create random counts
    let arr = [Math.floor(Math.random() * totalParticles), Math.floor(Math.random() * totalParticles), Math.floor(Math.random() * totalParticles)];
    let s = arr.reduce((a,b)=>a+b,0);
    if (s === 0) arr = [totalParticles,0,0];
    else {
      arr = arr.map((v) => Math.round((v/s) * totalParticles));
      let diff = totalParticles - arr.reduce((a,b)=>a+b,0);
      let idx = 0; while (diff>0){ arr[idx%3]++; diff--; idx++; }
    }
    setCounts(arr);

    const particles = particlesRef.current;
    for (const p of particles) {
      const pick = Math.floor(Math.random() * 3);
      const base = new THREE.Color(baseColors[pick]);
      // jitter hue by colorRand (0..1)
      const hsv = {}; base.getHSL(hsv);
      const newH = (hsv.h + (Math.random() - 0.5) * colorRand) % 1;
      const col = new THREE.Color().setHSL(newH < 0 ? newH + 1 : newH, Math.min(1, hsv.s + (Math.random()-0.5)*0.2), hsv.l);
      gsap.to(p.material.color, { r: col.r, g: col.g, b: col.b, duration: 0.8 });

      const newSize = baseSizes[pick] * (1 + (Math.random() - 0.5) * sizeRand * 2);
      gsap.to(p.scale, { x: newSize, y: newSize, z: newSize, duration: 0.8 });

      const dir = p.userData.velocity.length() > 1e-6 ? p.userData.velocity.clone().normalize() : new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
      const newVel = dir.multiplyScalar(baseSpeeds[pick] * (1 + (Math.random() - 0.5) * speedRand * 2));
      gsap.to(p.userData.velocity, { x: newVel.x, y: newVel.y, z: newVel.z, duration: 0.8 });

      p.userData.type = pick;
    }
  }, [colorRand, sizeRand, speedRand, totalParticles]);

  // When counts OR randomness change: assign particles sequentially per counts
  useEffect(() => {
    const arr = particlesRef.current;
    if (!arr || !arr.length) return;
    const sum = counts.reduce((a,b)=>a+b,0);
    let normalizedCounts = counts.slice();
    if (sum !== totalParticles) {
      if (sum === 0) normalizedCounts = [totalParticles,0,0];
      else {
        normalizedCounts = counts.map((v) => Math.round((v / sum) * totalParticles));
        let diff = totalParticles - normalizedCounts.reduce((a,b)=>a+b,0);
        let k = 0; while (diff > 0) { normalizedCounts[k%3]++; diff--; k++; }
      }
    }
    let ptr = 0;
    for (let t = 0; t < 3; t++) {
      const how = normalizedCounts[t];
      for (let k = 0; k < how && ptr < arr.length; k++, ptr++) {
        const p = arr[ptr];
        const col = new THREE.Color(baseColors[t]);
        const hsl = {}; col.getHSL(hsl);
        const newH = (hsl.h + (Math.random()-0.5)*colorRand*0.2 + 1) % 1;
        const finalCol = new THREE.Color().setHSL(newH, Math.min(1, hsl.s + (Math.random()-0.5)*0.1), hsl.l);
        gsap.to(p.material.color, { r: finalCol.r, g: finalCol.g, b: finalCol.b, duration: 0.6 });

        const newSize = baseSizes[t] * (1 + (Math.random()-0.5) * sizeRand);
        gsap.to(p.scale, { x: newSize, y: newSize, z: newSize, duration: 0.6 });

        const dir = p.userData.velocity.length() > 1e-6 ? p.userData.velocity.clone().normalize() : new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
        const newVel = dir.multiplyScalar(baseSpeeds[t] * (1 + (Math.random()-0.5) * speedRand));
        gsap.to(p.userData.velocity, { x: newVel.x, y: newVel.y, z: newVel.z, duration: 0.6 });

        p.userData.type = t;
      }
    }
  }, [counts, colorRand, sizeRand, speedRand]);

  // Entropy gauge (green themed)
  const EntropyGauge = ({ value = 0 }) => {
    const pct = Math.round(value * 100);
    const size = 84;
    const stroke = 10;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const dash = circumference * value;
    const dashGap = circumference - dash;
    // green gradient: light -> deep green
    return (
      <div style={{ width: 110, textAlign: "center" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="g1" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#b8ffd4" />
              <stop offset="100%" stopColor="#0bb96f" />
            </linearGradient>
          </defs>
          <g transform={`translate(${size/2}, ${size/2})`}>
            <circle
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth={stroke}
              strokeLinecap="round"
              transform="rotate(-90)"
            />
            <circle
              r={radius}
              fill="none"
              stroke="url(#g1)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${dashGap}`}
              transform="rotate(-90)"
              style={{ transition: "stroke-dasharray 300ms ease" }}
            />
          </g>
        </svg>
        <div style={{ color: "#dfffe6", fontSize: 12, marginTop: 6, fontFamily: "monospace" }}>
          Entropy
        </div>
        <div style={{ color: "#bfffd0", fontWeight: 700, fontFamily: "monospace", fontSize: 13 }}>{pct}%</div>
      </div>
    );
  };

  // Buttons handlers
  const onAllEven = () => applyPreset_AllEven();
  const onSameSize = () => applyPreset_SameSize();
  const onSameSpeed = () => applyPreset_SameSpeed();
  const onSameColor = () => applyPreset_SameColor();
  const onAllRandom = () => {
    // set randomness to full, then apply randomness after a tick
    setSizeRand(1);
    setSpeedRand(1);
    setColorRand(1);
    // small timeout so state updates propagate and applyPreset_AllRandom reads new rand values
    setTimeout(() => applyPreset_AllRandom(), 60);
  };

  // CSS injection (green theme + column sliders)
  useEffect(() => {
    const id = "boltzman-ui-styles";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      .be-controls { background: linear-gradient(180deg, rgba(0,20,10,0.45), rgba(0,10,5,0.35)); padding:12px; border-radius:10px; color:#dfffe6; font-family: Inter, Roboto, sans-serif; box-shadow: 0 8px 22px rgba(0,0,0,0.45); }
      .be-row { display:flex; gap:8px; align-items:center; margin-bottom:10px; flex-wrap:wrap; }
      .be-btn { background: linear-gradient(90deg,#0f6,#06a); color:#042; border: none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:700; font-size:13px; }
      .be-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,200,100,0.06); }
      .be-sublabel { font-size:13px; color:#bfffd0; font-family:monospace; width:120px; }
      .be-range { width:100%; accent-color: #26e698; }
      .be-control-col { display:flex; flex-direction:column; gap:10px; width:100%; max-width:820px; margin:0 auto; }
      .be-slider-row { display:flex; flex-direction:column; gap:6px; }
      .be-row-center { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }
    `;
    document.head.appendChild(s);
  }, []);

  // UI render
  return (
    <div style={{ width: "100%", maxWidth: width, margin: "0 auto", position: "relative" }}>
      <div ref={mountRef} style={{ width: "100%", height: height, borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" }} />

      {/* Entropy gauge top-right */}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 8 }}>
        <EntropyGauge value={entropyNorm} />
      </div>

      {/* Controls below: buttons and column sliders */}
      <div style={{ marginTop: 12 }} className="be-controls">
        <div className="be-row-center">
          <button className="be-btn" onClick={onAllEven}>All Even</button>
          <button className="be-btn" onClick={onSameSize}>Same Size</button>
          <button className="be-btn" onClick={onSameSpeed}>Same Speed</button>
          <button className="be-btn" onClick={onSameColor}>Same Color</button>
          <button className="be-btn" onClick={onAllRandom}>All Random</button>
        </div>

        <div className="be-control-col" style={{ marginTop: 12 }}>
          <div className="be-slider-row">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="be-sublabel">Size randomness</div>
              <div style={{ color: "#bfffd0", fontFamily: "monospace" }}>{Math.round(sizeRand * 100)}%</div>
            </div>
            <input className="be-range" type="range" min="0" max="1" step="0.01" value={sizeRand} onChange={(e) => setSizeRand(parseFloat(e.target.value))} />
          </div>

          <div className="be-slider-row">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="be-sublabel">Speed randomness</div>
              <div style={{ color: "#bfffd0", fontFamily: "monospace" }}>{Math.round(speedRand * 100)}%</div>
            </div>
            <input className="be-range" type="range" min="0" max="1" step="0.01" value={speedRand} onChange={(e) => setSpeedRand(parseFloat(e.target.value))} />
          </div>

          <div className="be-slider-row">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="be-sublabel">Color randomness</div>
              <div style={{ color: "#bfffd0", fontFamily: "monospace" }}>{Math.round(colorRand * 100)}%</div>
            </div>
            <input className="be-range" type="range" min="0" max="1" step="0.01" value={colorRand} onChange={(e) => setColorRand(parseFloat(e.target.value))} />
          </div>
        </div>
      </div>
    </div>
  );
}
