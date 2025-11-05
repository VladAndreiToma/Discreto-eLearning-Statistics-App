// src/components/InspectorParticleWebEngine.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";

/**
 * InspectorParticleWebEngine — repaired full component
 * - safe renderer creation (capped DPR, try/catch)
 * - webglcontextlost/restored handlers
 * - single canvas (clears mount before append)
 * - full cleanup (remove listeners, cancel RAF, dispose resources)
 * - distribution sliders with clamping and GSAP transitions
 */

export default function InspectorParticleWebEngine() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);
  const canvasListenersRef = useRef({}); // store handlers to remove later

  const totalParticles = 120;
  const [distribution, setDistribution] = useState(() => {
    const equal = Math.floor(totalParticles / 5);
    const arr = Array(5).fill(equal);
    arr[0] += totalParticles - equal * 5;
    return arr;
  });

  const [macroColor, setMacroColor] = useState("#001100");
  const [avgSpeed, setAvgSpeed] = useState("0.000");

  // palette & speeds
  const typeColors = [0xff3355, 0x33ff66, 0x33ccff, 0xffee33, 0xaa33ff];
  const typeSpeeds = [0.006, 0.01, 0.014, 0.018, 0.022];

  // insert UI CSS (only once)
  useEffect(() => {
    const id = "ipw-slider-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      .ipw-controls { background: linear-gradient(180deg, rgba(0,20,10,0.45), rgba(0,10,5,0.35)); border-radius:10px; padding:10px; color:#dfffe6; font-family: Inter, Roboto, sans-serif; box-shadow: 0 8px 22px rgba(0,0,0,0.45);}
      .ipw-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
      .ipw-label { width:72px; display:flex; align-items:center; gap:8px; color:#c8ffd8; font-weight:600; font-size:13px; }
      .ipw-color { width:14px; height:14px; border-radius:3px; border:1px solid rgba(255,255,255,0.06); }
      .ipw-range { -webkit-appearance:none; appearance:none; height:8px; border-radius:999px; background: rgba(0,80,40,0.18); outline:none; }
      .ipw-range::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background: linear-gradient(180deg,#b8ffd4,#1cff7a); box-shadow: 0 2px 8px rgba(0,255,120,0.12); border: none; cursor:pointer; }
      .ipw-value { width:40px; text-align:right; color:#bfffd0; font-weight:700; font-size:13px; }
      .ipw-presets { display:flex; gap:8px; justify-content:center; margin-top:8px; flex-wrap:wrap; }
      .ipw-btn { background: rgba(0,255,140,0.06); color:#c9ffde; border: 1px solid rgba(0,255,140,0.10); padding:6px 8px; border-radius:8px; cursor:pointer; font-weight:700; font-size:13px; }
      .ipw-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,200,100,0.06); }
      .ipw-macro { display:flex; gap:8px; align-items:center; background: rgba(0,10,6,0.45); padding:8px 10px; border-radius:8px; color:#dfffe6; font-family: monospace; font-size:13px; }
    `;
    document.head.appendChild(style);
  }, []);

  // Initialize scene and renderer once
  useEffect(() => {
    if (!mountRef.current) return;

    // ensure mount element is clean (avoid double canvases)
    mountRef.current.innerHTML = "";

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00110a);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.2, 3.5);
    cameraRef.current = camera;

    // Safe renderer creation
    let renderer;
    try {
      const cappedDPR = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(cappedDPR);
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);
    } catch (err) {
      console.error("WebGL renderer creation failed:", err);
      const fallback = document.createElement("div");
      fallback.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#cfeee0;background:#020a06;";
      fallback.innerText = "WebGL unavailable — try another browser or reduce particle count.";
      mountRef.current.appendChild(fallback);
      return;
    }

    // context lost/restored handlers
    const canvasEl = renderer.domElement;
    const onContextLost = (e) => {
      e.preventDefault();
      console.warn("WebGL context lost.");
      if (animRef.current) cancelAnimationFrame(animRef.current);
      // show minimal overlay (optional)
    };
    const onContextRestored = () => {
      console.info("WebGL context restored (manual reload recommended).");
    };
    canvasEl.addEventListener("webglcontextlost", onContextLost, false);
    canvasEl.addEventListener("webglcontextrestored", onContextRestored, false);
    canvasListenersRef.current = { onContextLost, onContextRestored, canvasEl };

    // Lights
    const ambient = new THREE.AmbientLight(0x88ffcc, 0.35);
    const point = new THREE.PointLight(0x66ffbb, 1.0);
    point.position.set(0, 2.0, 2.0);
    scene.add(ambient, point);

    // Box (boundary)
    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0x00aa66, wireframe: true, transparent: true, opacity: 0.09 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    scene.add(box);

    // Create particles once
    const particles = [];
    const sphereGeo = new THREE.SphereGeometry(0.04, 12, 12);
    for (let i = 0; i < totalParticles; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x000000, metalness: 0.12, roughness: 0.6 });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set((Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.8);
      mesh.userData = { velocity: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01), type: 0 };
      scene.add(mesh);
      particles.push(mesh);
    }
    particlesRef.current = particles;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 2.0;
    controls.maxDistance = 7;
    controlsRef.current = controls;

    // Animation loop
    let lastUpdate = 0;
    const animate = (t) => {
      animRef.current = requestAnimationFrame(animate);

      // Move particles
      const arr = particlesRef.current;
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

      // Compute macro metrics every 200ms
      if (t - lastUpdate > 200) {
        lastUpdate = t;
        let r = 0, g = 0, b = 0, vsum = 0;
        for (let i = 0; i < arr.length; i++) {
          const c = arr[i].material.color;
          r += c.r; g += c.g; b += c.b;
          vsum += arr[i].userData.velocity.length();
        }
        const n = arr.length || 1;
        const col = new THREE.Color(r / n, g / n, b / n);
        setMacroColor(`#${col.getHexString()}`);
        setAvgSpeed((vsum / n).toFixed(4));
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animRef.current = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);

      // remove context listeners
      try {
        if (canvasListenersRef.current.canvasEl) {
          canvasListenersRef.current.canvasEl.removeEventListener("webglcontextlost", canvasListenersRef.current.onContextLost);
          canvasListenersRef.current.canvasEl.removeEventListener("webglcontextrestored", canvasListenersRef.current.onContextRestored);
        }
      } catch (e) {}

      if (animRef.current) cancelAnimationFrame(animRef.current);
      controls.dispose();

      // dispose particles
      particlesRef.current.forEach((p) => {
        try {
          if (p.geometry) p.geometry.dispose();
          if (p.material) p.material.dispose();
        } catch (e) {}
        try { scene.remove(p); } catch (e) {}
      });

      // dispose box
      try { box.geometry.dispose(); box.material.dispose(); } catch (e) {}

      // dispose renderer & remove canvas
      try {
        if (rendererRef.current) {
          // do not call forceContextLoss unless necessary; safe dispose
          rendererRef.current.dispose();
          if (mountRef.current && rendererRef.current.domElement) {
            mountRef.current.removeChild(rendererRef.current.domElement);
          }
        }
      } catch (e) {}

      // clear refs
      particlesRef.current = [];
      rendererRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      canvasListenersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // apply distribution to particles
  const applyDistribution = useCallback(() => {
    const arr = particlesRef.current;
    if (!arr || !arr.length) return;
    const counts = distribution.map((v) => Math.max(0, Math.round(v)));
    let sum = counts.reduce((a, b) => a + b, 0);

    if (sum < totalParticles) { counts[0] += totalParticles - sum; sum = totalParticles; }

    if (sum > totalParticles) {
      const factor = totalParticles / sum;
      let newSum = 0;
      for (let i = 0; i < counts.length; i++) { counts[i] = Math.round(counts[i] * factor); newSum += counts[i]; }
      let diff = totalParticles - newSum;
      let idx = 0;
      while (diff > 0) { counts[idx % counts.length]++; diff--; idx++; }
    }

    let ptr = 0;
    for (let t = 0; t < counts.length; t++) {
      const targetCount = counts[t];
      for (let k = 0; k < targetCount && ptr < arr.length; k++, ptr++) {
        const p = arr[ptr];
        const nc = new THREE.Color(typeColors[t]);
        gsap.to(p.material.color, { r: nc.r, g: nc.g, b: nc.b, duration: 0.85, ease: "power2.out" });
        const speed = typeSpeeds[t];
        const dir = p.userData.velocity.length() > 1e-6 ? p.userData.velocity.clone().normalize() : new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
        const newVel = dir.multiplyScalar((Math.random()*0.6 + 0.7) * speed);
        gsap.to(p.userData.velocity, { x: newVel.x, y: newVel.y, z: newVel.z, duration: 0.85, ease: "power2.out" });
        p.userData.type = t;
      }
    }
  }, [distribution]);

  useEffect(() => { applyDistribution(); }, [distribution, applyDistribution]);

  // slider change: clamp so sum <= totalParticles by limiting changed value
  const onSliderChange = (index, rawValue) => {
    const val = Math.max(0, Math.min(totalParticles, Math.round(Number(rawValue))));
    const otherSum = distribution.reduce((s, v, i) => (i === index ? s : s + v), 0);
    const allowed = Math.max(0, totalParticles - otherSum);
    const final = Math.min(val, allowed);
    const copy = [...distribution];
    copy[index] = final;
    setDistribution(copy);
  };

  // presets
  const setEven = () => {
    const base = Math.floor(totalParticles / 5);
    const arr = Array(5).fill(base);
    arr[0] += totalParticles - base * 5;
    setDistribution(arr);
  };
  const setAll = (idx) => {
    const arr = [0,0,0,0,0];
    arr[idx] = totalParticles;
    setDistribution(arr);
  };
  const setRandom = () => {
    const arr = Array.from({length:5}, () => Math.floor(Math.random() * (totalParticles/2)));
    let s = arr.reduce((a,b)=>a+b,0);
    if (s === 0) arr[0] = totalParticles;
    else {
      arr.forEach((_,i) => arr[i] = Math.round(arr[i] / s * totalParticles));
      let diff = totalParticles - arr.reduce((a,b) => a+b,0);
      let k=0; while(diff>0){ arr[k%5]++; diff--; k++; }
    }
    setDistribution(arr);
  };

  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", position: "relative" }}>
      {/* canvas mount area */}
      <div ref={mountRef} style={{ width: "100%", height: 400, borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" }} />

      {/* compact macro patch placed over top-right of canvas (ONLY this) */}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 8 }}>
        <div className="ipw-macro" style={{ width: 160 }}>
          <div style={{ width: 36, height: 28, background: macroColor, borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Macro state</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Avg speed: {avgSpeed}</div>
          </div>
        </div>
      </div>

      {/* controls below canvas */}
      <div style={{ marginTop: 12 }} className="ipw-controls" >
        <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700, color: "#e8ffef", fontSize: 14 }}>Microstate Composition — total {totalParticles}</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Sum: {distribution.reduce((a,b)=>a+b,0)}</div>
        </div>

        {["State A","State B","State C","State D","State E"].map((label, i) => (
          <div className="ipw-row" key={i}>
            <div className="ipw-label">
              <div className="ipw-color" style={{ background: `#${new THREE.Color(typeColors[i]).getHexString()}` }} />
              <div style={{ fontSize: 13 }}>{label}</div>
            </div>

            <input
              className="ipw-range"
              type="range"
              min="0"
              max={totalParticles}
              value={distribution[i]}
              onChange={(e) => onSliderChange(i, e.target.value)}
              style={{ flex: 1 }}
            />

            <div className="ipw-value">{distribution[i]}</div>
          </div>
        ))}

        <div className="ipw-presets">
          <button className="ipw-btn" onClick={() => setAll(0)}>All A</button>
          <button className="ipw-btn" onClick={() => setAll(1)}>All B</button>
          <button className="ipw-btn" onClick={() => setAll(2)}>All C</button>
          <button className="ipw-btn" onClick={() => setAll(3)}>All D</button>
          <button className="ipw-btn" onClick={() => setAll(4)}>All E</button>
          <button className="ipw-btn" onClick={setEven}>Even</button>
          <button className="ipw-btn" onClick={setRandom}>Random</button>
        </div>
      </div>
    </div>
  );
}
