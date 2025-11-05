import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const kB_eV = 8.617333262e-5; // eV/K

export default function PopulationSurgeWebEngine({
  levels = 12,
  baseE = 0.1,
  stepE = 0.3,
  initialT = 300,
  Nparticles = 200,
  height = 460,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const barsRef = useRef([]);
  const animationRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const pausedRef = useRef(false);

  const [T, setT] = useState(initialT);

  const Elevels = useMemo(
    () => new Array(levels).fill(0).map((_, i) => baseE + i * stepE),
    [levels, baseE, stepE]
  );

  // compute Boltzmann probabilities (normalized)
  function computeBoltzmannProbs(Tlocal) {
    const safeT = Math.max(1e-8, Math.abs(Tlocal));
    const kT = Math.max(1e-12, kB_eV * safeT);
    const exps = Elevels.map((E) => {
      const x = -E / kT;
      if (x < -1000) return 0;
      if (x > 700) return Number.POSITIVE_INFINITY;
      return Math.exp(x);
    });
    let Z = exps.reduce((a, b) => a + b, 0);
    if (!Number.isFinite(Z) || Z <= 0) Z = 1;
    const P = exps.map((v) => (Z > 0 ? v / Z : 1 / Math.max(1, Elevels.length)));
    return { P, Z };
  }

  // deterministic integer sampling from probabilities (floor + largest fractional parts)
  function sampleCountsFromP(P, N) {
    const L = Math.max(0, P?.length || 0);
    if (L === 0 || N <= 0) return new Array(L).fill(0);

    const expected = new Array(L);
    for (let i = 0; i < L; i++) expected[i] = Math.max(0, (P[i] || 0) * N);

    const floors = expected.map((v) => Math.floor(v));
    let assigned = floors.reduce((a, b) => a + b, 0);
    let remainder = N - assigned;

    const frac = expected.map((v, i) => ({ i, f: v - floors[i] }));
    frac.sort((a, b) => b.f - a.f);

    if (remainder > 0) {
      let idx = 0;
      const Lfrac = frac.length || 1;
      while (remainder > 0) {
        const pick = frac[idx % Lfrac].i;
        floors[pick] = (floors[pick] || 0) + 1;
        remainder--;
        idx++;
        if (idx >= Lfrac && frac[0].f === 0) {
          let j = 0;
          while (remainder > 0) {
            floors[j % L] = (floors[j % L] || 0) + 1;
            remainder--;
            j++;
          }
          break;
        }
      }
    } else if (remainder < 0) {
      const fracAsc = frac.slice().sort((a, b) => a.f - b.f);
      let idx = 0;
      while (remainder < 0 && idx < fracAsc.length) {
        const pick = fracAsc[idx % fracAsc.length].i;
        if (floors[pick] > 0) {
          floors[pick] -= 1;
          remainder++;
        }
        idx++;
        if (idx > fracAsc.length * 2) break;
      }
      if (remainder < 0) {
        for (let j = 0; j < floors.length && remainder < 0; j++) {
          const dec = Math.min(floors[j], -remainder);
          floors[j] -= dec;
          remainder += dec;
        }
      }
    }

    return floors;
  }

  function occupancyToColor(o) {
    const h = 0.6 - Math.min(1, Math.max(0, o)) * 0.58;
    const col = new THREE.Color();
    col.setHSL(h, 0.85, 0.45);
    return col;
  }

  function fitCameraToBars(camera, mountW, mountH, visualScale, levelsCount) {
    const aspect = Math.max(0.5, mountW / mountH);
    const spacing = 1.0;
    const totalW = (levelsCount - 1) * spacing + 1.0;
    const horizHalf = totalW / 2;
    const vertHalf = Math.max(4, visualScale * 0.9);
    camera.left = -horizHalf * aspect;
    camera.right = horizHalf * aspect;
    camera.top = vertHalf * 1.2;
    camera.bottom = -Math.max(2, vertHalf * 0.4);
    camera.near = 0.1;
    camera.far = 1000;
    camera.updateProjectionMatrix();
    camera.position.set(0, vertHalf * 0.9, Math.max(10, vertHalf * 1.8));
    camera.lookAt(0, 0, 0);
  }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04110a);

    const aspect = Math.max(0.5, mount.clientWidth / mount.clientHeight || 1);
    const camera = new THREE.OrthographicCamera(-6 * aspect, 6 * aspect, 6, -3, 0.1, 1000);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x061709, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    const spacing = 1.0;
    const totalW = (levels - 1) * spacing;
    barsRef.current = [];

    for (let i = 0; i < levels; i++) {
      const geom = new THREE.BoxGeometry(0.6, 1, 0.6);
      const mat = new THREE.MeshStandardMaterial({ color: 0x2aa66a, roughness: 0.45, metalness: 0.08, emissive: 0x002211 });
      const mesh = new THREE.Mesh(geom, mat);
      const x = -totalW / 2 + i * spacing;
      mesh.position.set(x, 0.5, 0);
      scene.add(mesh);
      barsRef.current.push({ mesh, idx: i, targetHeight: 1, labelSprite: null, bottomLabelSprite: null });
    }

    // create labels above bars: energy label and count
    // create bottom labels under bars (axis labels) indicating E0, E1, ...
    for (let i = 0; i < barsRef.current.length; i++) {
      const b = barsRef.current[i];

      // top sprite: energy + count (dynamic)
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "16px monospace";
      ctx.fillStyle = "#bfffd0";
      ctx.textAlign = "center";
      ctx.fillText(`E_${i} (${(Elevels[i]).toFixed(2)} eV)`, 128, 18);
      ctx.font = "18px monospace";
      ctx.fillText("0", 128, 48);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      spr.scale.set(1.0, 0.3, 1);
      spr.position.set(b.mesh.position.x, 1.2, 0);
      scene.add(spr);
      b.labelSprite = { sprite: spr, canvas, ctx, tex };

      // bottom sprite: simple axis label (E_i) under the bar
const canvasB = document.createElement("canvas");
canvasB.width = 160;
canvasB.height = 36;
const ctxB = canvasB.getContext("2d");
ctxB.clearRect(0, 0, canvasB.width, canvasB.height);
ctxB.font = "14px monospace";
ctxB.fillStyle = "#bfffd0";
ctxB.textAlign = "center";
ctxB.fillText(`E_${i}`, canvasB.width / 2, 22);

const texB = new THREE.CanvasTexture(canvasB);
texB.needsUpdate = true;

// sprite material and setup
const sprB = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: texB,
    transparent: true,
    depthTest: false,  // ensures it's not hidden behind geometry
  })
);

// slightly smaller and brought forward
sprB.scale.set(0.6, 0.12, 1);
sprB.position.set(b.mesh.position.x, -0.22, 0.15); // push a bit toward camera
sprB.renderOrder = 999; // force draw in front

scene.add(sprB);
b.bottomLabelSprite = { sprite: sprB, canvas: canvasB, ctx: ctxB, tex: texB };

    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.8;
    controlsRef.current = controls;

    // initial counts and mapping to heights
    const { P, Z } = computeBoltzmannProbs(T);
    const counts = sampleCountsFromP(P, Math.max(0, Math.round(Nparticles)));

    const visualScale = 18;
    barsRef.current.forEach((b, i) => {
      const cnt = counts[i] || 0;
      const h = Math.max(0.12, (cnt / Math.max(1, Nparticles)) * visualScale);
      b.targetHeight = h;
      b.mesh.scale.y = h;
      b.mesh.position.y = h / 2;
      const occ = cnt / Math.max(1, Nparticles);
      b.mesh.material.color.copy(occupancyToColor(occ));

      // update top label canvas with count
      const { ctx, canvas, tex } = b.labelSprite;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "16px monospace";
      ctx.fillStyle = "#bfffd0";
      ctx.textAlign = "center";
      ctx.fillText(`E_${i} (${(Elevels[i]).toFixed(2)} eV)`, 128, 18);
      ctx.font = "18px monospace";
      ctx.fillText(`${cnt}`, 128, 48);
      tex.needsUpdate = true;

      // ensure bottom label stays under the bar (static text)
      if (b.bottomLabelSprite) {
        b.bottomLabelSprite.sprite.position.set(b.mesh.position.x, -0.22, 0);
      }

      b.labelSprite.sprite.position.y = h + 0.28;
    });

    fitCameraToBars(camera, mount.clientWidth, mount.clientHeight, visualScale, levels);

    // double-click resets view
    function onDoubleClick() {
      fitCameraToBars(camera, mount.clientWidth, mount.clientHeight, visualScale, levels);
      controls.target.set(0, 0, 0);
      controls.update();
    }
    mount.addEventListener("dblclick", onDoubleClick);

    let last = performance.now();
    function animate(now) {
      animationRef.current = requestAnimationFrame(animate);
      if (document.hidden || pausedRef.current) return;
      const dt = (now - last) * 0.001;
      last = now;

      for (let b of barsRef.current) {
        const m = b.mesh;
        const cur = m.scale.y;
        const th = b.targetHeight;
        const nh = cur + (th - cur) * Math.min(1, dt * 6.0);
        m.scale.y = nh;
        m.position.y = nh / 2;
        if (b.labelSprite && b.labelSprite.sprite) {
          b.labelSprite.sprite.position.y = nh + 0.28;
        }
        // bottom labels remain fixed under x
        if (b.bottomLabelSprite && b.bottomLabelSprite.sprite) {
          b.bottomLabelSprite.sprite.position.x = b.mesh.position.x;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animationRef.current = requestAnimationFrame(animate);

    function onResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      const aspect2 = Math.max(0.5, w / h);
      const spacingLocal = 1.0;
      const totalWLocal = (levels - 1) * spacingLocal + 1.0;
      camera.left = -totalWLocal / 2 * aspect2;
      camera.right = totalWLocal / 2 * aspect2;
      camera.updateProjectionMatrix();
      controls.update();

      // reposition bottom labels in case of layout change
      for (let b of barsRef.current) {
        if (b.bottomLabelSprite && b.bottomLabelSprite.sprite) {
          b.bottomLabelSprite.sprite.position.set(b.mesh.position.x, -0.22, 0);
        }
      }
    }
    window.addEventListener("resize", onResize);

    // cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("dblclick", onDoubleClick);
      controls.dispose();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init once

  // when T changes, compute counts and update bar targets
  useEffect(() => {
    if (!barsRef.current || barsRef.current.length === 0) return;
    const { P, Z } = computeBoltzmannProbs(T);
    const counts = sampleCountsFromP(P, Math.max(0, Math.round(Nparticles)));

    const visualScale = 18; // same fixed visual scale
    barsRef.current.forEach((b, i) => {
      const cnt = counts[i] || 0;
      const h = Math.max(0.12, (cnt / Math.max(1, Nparticles)) * visualScale);
      b.targetHeight = h;
      const occ = cnt / Math.max(1, Nparticles);
      const c = occupancyToColor(occ);
      b.mesh.material.color.copy(c);
      if (b.labelSprite) {
        const { ctx, canvas, tex } = b.labelSprite;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "16px monospace";
        ctx.fillStyle = "#bfffd0";
        ctx.textAlign = "center";
        ctx.fillText(`E_${i} (${(Elevels[i]).toFixed(2)} eV)`, 128, 18);
        ctx.font = "18px monospace";
        ctx.fillText(`${cnt}`, 128, 48);
        tex.needsUpdate = true;
      }
      // bottom labels don't change text, but ensure position stays under bar
      if (b.bottomLabelSprite && b.bottomLabelSprite.sprite) {
        b.bottomLabelSprite.sprite.position.set(b.mesh.position.x, -0.22, 0);
      }
    });

    // auto-adjust orthographic extents vertically but don't override user's zoom/pan
    const camera = cameraRef.current;
    const mount = mountRef.current;
    if (camera && mount) {
      const aspect = Math.max(0.5, mount.clientWidth / mount.clientHeight);
      const spacingLocal = 1.0;
      const totalWLocal = (levels - 1) * spacingLocal + 1.0;
      camera.left = -totalWLocal / 2 * aspect;
      camera.right = totalWLocal / 2 * aspect;
      const vertHalf = Math.max(4, visualScale * 0.9);
      camera.top = vertHalf * 1.2;
      camera.bottom = -Math.max(2, vertHalf * 0.4);
      camera.updateProjectionMatrix();
    }
  }, [T, Nparticles, levels]);

  // heat pulse (kept)
  function heatPulse() {
    const original = T;
    const spike = Math.max(50, original * 2 + 200);
    const durUp = 220;
    const hold = 300;
    const durDown = 700;
    const t0 = performance.now();
    function step(now) {
      const dt = now - t0;
      if (dt < durUp) {
        const tt = dt / durUp;
        setT(Math.round(original + (spike - original) * tt));
        requestAnimationFrame(step);
      } else if (dt < durUp + hold) {
        setT(spike);
        requestAnimationFrame(step);
      } else if (dt < durUp + hold + durDown) {
        const tt = (dt - durUp - hold) / durDown;
        setT(Math.round(spike + (original - spike) * tt));
        requestAnimationFrame(step);
      } else setT(original);
    }
    requestAnimationFrame(step);
  }

  const summary = useMemo(() => {
    const { P, Z } = computeBoltzmannProbs(T);
    let maxi = 0;
    for (let i = 0; i < P.length; i++) if (P[i] > P[maxi]) maxi = i;
    return { Z, maxIndex: maxi, maxProb: P[maxi], P };
  }, [T]);

  // English live verdict based on occupancy of lowest levels
  function liveVerdict() {
    const { P } = summary;
    if (!P || P.length === 0) return "—";
    const counts = sampleCountsFromP(P, Math.max(1, Math.round(Nparticles)));
    const lowCount = (counts[0] || 0) + (counts[1] || 0);
    const frac = lowCount / Math.max(1, Nparticles);
    if (frac > 0.75) return `Low T — particles occupy mostly the lowest levels (E_0, E_1).`;
    if (frac > 0.45) return `Medium T — distribution still concentrated low, but higher levels begin to fill.`;
    return `High T — particles spread across many levels, including higher-energy states.`;
  }

  const mountHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div style={{ width: "100%", boxSizing: "border-box", fontFamily: "Inter, Roboto, monospace", color: "#bfffd0" }}>
      <div style={{ position: "relative", width: "100%", height: mountHeight, borderRadius: 10, overflow: "hidden" }}>
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

        {/* Top-right explanation (multi-line) */}
        <div style={{ position: "absolute", right: 12, top: 12, zIndex: 5, pointerEvents: 'none', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,255,128,0.06)', maxWidth: 320 }}>
          <div style={{ fontSize: 12, color: '#aef7c9', lineHeight: 1.4 }}>
            <div>• Low T → particles occupy mostly the lowest energy levels (E₀, E₁).</div>
            <div>• Medium T → distribution spreads across several levels.</div>
            <div>• High T → significant occupancy of higher energy states.</div>
          </div>
        </div>

        {/* Occupancy legend (bottom-left) */}
        <div style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 5, background: 'rgba(0,0,0,0.22)', padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(0,255,128,0.06)', display: 'flex', gap: 8, alignItems: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, color: '#bfffd0' }}>Occupancy</div>
          <div style={{ width: 120, height: 10, borderRadius: 6, background: 'linear-gradient(90deg, hsl(0.6turn,100%,40%), hsl(0.02turn,100%,40%))' }} />
          <div style={{ fontSize: 11, color: '#bfffd0' }}>low — high</div>
        </div>
      </div>

      {/* Controls panel */}
      <div style={{
        width: "100%", boxSizing: "border-box", padding: 12, marginTop: 12,
        display: "flex", flexDirection: "column", gap: 10,
        background: "linear-gradient(180deg,#021a12,#04120a)", borderRadius: 8, border: "1px solid rgba(10,255,153,0.06)"
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ color: "#96ffc1", fontSize: 13 }}>T: <strong style={{ color: "#dfffe6" }}>{T} K</strong></div>
          <div style={{ color: "#96ffc1", fontSize: 13 }}>Z: <strong style={{ color: "#dfffe6" }}>{Math.round(summary.Z)}</strong></div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ color: "#b6fcb6", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.6 }}>Temperature</label>
          <input
            type="range" min={0} max={20000} value={T}
            onChange={(e) => setT(Number(e.target.value))}
            style={{ width: "100%", height: 6, accentColor: "#1fff6b", background: "linear-gradient(90deg,#073,#0a4)", borderRadius: 10, boxShadow: "0 0 6px rgba(0,255,128,0.12)", cursor: "pointer", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={heatPulse} style={{ padding: "8px 10px", borderRadius: 8, background: "linear-gradient(90deg,#085,#0b7)", color: "#001b0e", fontWeight: 700, border: "1px solid rgba(0,255,128,0.12)" }}>Heat pulse</button>
          <div style={{ color: "#9fffbf", fontSize: 13, background: "rgba(2,10,6,0.5)", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(0,255,128,0.06)" }}>
            <strong>Tip:</strong> use mouse wheel to zoom, drag to pan, double-click canvas to reset.
          </div>
        </div>

      </div>
    </div>
  );
}
