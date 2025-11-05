// RubikCube.jsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

export default function RubikCube() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    // Scene + bg
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);

    // Lights
    const ambient = new THREE.AmbientLight(0x223322, 0.6);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xc8ffdd, 1.0);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x44ff88, 0.35, 20);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    // Soft ground shadow plane (receives shadows)
    const planeGeo = new THREE.PlaneGeometry(40, 40);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2.3;
    plane.receiveShadow = true;
    scene.add(plane);

    // Build 3x3x3 small cubes group
    const cubeGroup = new THREE.Group();
    const cubeSize = 0.9;
    const gap = 0.06;
    const palette = [0x003b20, 0x00663f, 0x00996a, 0x00cc88, 0x00ffaa];

    const meshes = []; // list of mesh objects
    for (let xi = -1; xi <= 1; xi++) {
      for (let yi = -1; yi <= 1; yi++) {
        for (let zi = -1; zi <= 1; zi++) {
          const geom = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
          const mat = new THREE.MeshPhysicalMaterial({
            color: palette[Math.floor(Math.random() * palette.length)],
            metalness: 0.25,
            roughness: 0.35,
            clearcoat: 0.18,
            clearcoatRoughness: 0.08,
            emissive: new THREE.Color(0x002212).multiplyScalar(0.06),
            emissiveIntensity: 0.6,
          });

          const mesh = new THREE.Mesh(geom, mat);
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // base position and userData state
          const basePos = new THREE.Vector3(
            xi * (cubeSize + gap),
            yi * (cubeSize + gap),
            zi * (cubeSize + gap)
          );
          mesh.userData.basePos = basePos.clone();
          mesh.userData.fall = { x: 0, y: 0, z: 0 };      // values animated by GSAP
          mesh.userData.rotAdd = { x: 0, z: 0 };          // rolling rotations during fall
          mesh.userData.jitter = { x: 0, y: 0, z: 0 };   // small relative motion
          mesh.position.copy(basePos);

          // thin edges for definition
          const edgeGeom = new THREE.EdgesGeometry(geom);
          const edgeMat = new THREE.LineBasicMaterial({ color: 0x0a2a1a, linewidth: 1 });
          const edge = new THREE.LineSegments(edgeGeom, edgeMat);
          edge.position.copy(mesh.position);

          // attach edge as child for easier movement
          const wrapper = new THREE.Group();
          wrapper.add(mesh);
          wrapper.add(edge);

          wrapper.userData = mesh.userData; // mirror userData so we can animate wrapper as a unit
          wrapper.position.copy(basePos);

          cubeGroup.add(wrapper);
          meshes.push(wrapper);
        }
      }
    }
    scene.add(cubeGroup);

    // compute bounding and set camera
    const box = new THREE.Box3().setFromObject(cubeGroup);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let camZ = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.6;
    camZ = Math.max(camZ, 4.5);
    camera.position.set(camZ * 0.8, camZ * 0.6, camZ * 1.0);
    camera.lookAt(box.getCenter(new THREE.Vector3()));

    // responsive
    const resize = () => {
      const w = mount.clientWidth || 300;
      const h = mount.clientHeight || 150;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // subtle mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const onPointer = (e) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * -2;
    };
    mount.addEventListener("pointermove", onPointer);

    // periodic fall / roll animation
    let fallInterval = null;
    const scheduleFall = () => {
      // pick 2..5 random cubes
      const n = 2 + Math.floor(Math.random() * 4);
      const picked = [];
      const idxSet = new Set();
      while (idxSet.size < n) {
        idxSet.add(Math.floor(Math.random() * meshes.length));
      }
      idxSet.forEach(i => picked.push(meshes[i]));

      // animate picked wrappers (wrapper contains mesh+edges)
      picked.forEach((w, i) => {
        // stagger start
        const delay = i * 0.12;

        // fall away: translate down + outward, add rolling rotation
        gsap.to(w.userData.fall, {
          x: (Math.random() - 0.5) * 1.6,
          y: -3.2 - Math.random() * 0.8,
          z: (Math.random() - 0.5) * 1.6,
          duration: 0.9 + Math.random() * 0.4,
          ease: "power2.in",
          delay,
        });

        gsap.to(w.userData.rotAdd, {
          x: (Math.random() > 0.5 ? 1 : -1) * (Math.PI * (1.2 + Math.random() * 2.2)),
          z: (Math.random() > 0.5 ? 1 : -1) * (Math.PI * (0.6 + Math.random() * 1.6)),
          duration: 0.9 + Math.random() * 0.4,
          ease: "power2.in",
          delay,
        });

        // after a pause, roll back (recombine)
        gsap.to(w.userData.fall, {
          x: 0, y: 0, z: 0,
          duration: 1.1,
          ease: "power3.out",
          delay: 1.1 + delay,
        });
        gsap.to(w.userData.rotAdd, {
          x: 0, z: 0,
          duration: 1.1,
          ease: "power3.out",
          delay: 1.1 + delay,
        });
      });

      // schedule next fall in 4..8s
      const next = 4 + Math.random() * 5;
      clearInterval(fallInterval);
      fallInterval = setInterval(scheduleFall, next * 1000);
    };

    // start initial schedule with some randomness
    fallInterval = setInterval(scheduleFall, 3000 + Math.random() * 2000);
    // trigger first after a short delay
    setTimeout(scheduleFall, 900);

    // small relative jitter animation parameters
    const jitterAmp = 0.03;
    const jitterSpeed = 1.6;

    // animation loop
    let rafId;
    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // base auto-rotation
      cubeGroup.rotation.y += 0.0075;
      cubeGroup.rotation.x = Math.sin(t * 0.2) * 0.06;

      // iterate wrappers and apply composed transforms
      for (let i = 0; i < meshes.length; i++) {
        const w = meshes[i];
        const ud = w.userData;
        // jitter: small relative motion so cubes "float" vs each other
        const ji = (i % 13) * 0.37; // phase per cube
        ud.jitter.x = Math.sin(t * jitterSpeed + ji) * jitterAmp * (0.8 + Math.sin(ji) * 0.2);
        ud.jitter.y = Math.cos(t * (jitterSpeed * 0.9) + ji) * jitterAmp * 0.6;
        ud.jitter.z = Math.cos(t * (jitterSpeed * 1.1) + ji) * jitterAmp * 0.9;

        // compute desired position = basePos + fall + jitter
        const bp = ud.basePos;
        const fx = (ud.fall.x || 0) + ud.jitter.x;
        const fy = (ud.fall.y || 0) + ud.jitter.y;
        const fz = (ud.fall.z || 0) + ud.jitter.z;

        w.position.set(bp.x + fx, bp.y + fy, bp.z + fz);

        // apply rolling rotation during fall via rotAdd (affects child meshes)
        // wrapper.rotation is independent of child's mesh rotation so rotate wrapper
        w.rotation.x = (ud.rotAdd.x || 0) * 1.0 + (Math.sin(t + i) * 0.002);
        w.rotation.z = (ud.rotAdd.z || 0) * 1.0 + (Math.cos(t + i) * 0.002);

        // small local spin of the little cube to feel lively
        if (w.children[0]) {
          w.children[0].rotation.y += 0.003 + (i % 5) * 0.0006;
        }
      }

      // subtle breathing effect on plane shadow
      plane.material.opacity = 0.32 + Math.abs(Math.sin(t * 0.6)) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    // cleanup on unmount
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      mount.removeEventListener("pointermove", onPointer);
      clearInterval(fallInterval);
      gsap.globalTimeline.clear();

      // dispose group contents
      cubeGroup.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose();
          if (o.material) {
            if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
            else o.material.dispose();
          }
        }
        if (o.isLineSegments) {
          o.geometry?.dispose();
          o.material?.dispose();
        }
      });
      plane.geometry?.dispose();
      plane.material?.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }} />
  );
}
