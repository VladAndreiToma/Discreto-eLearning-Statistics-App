// StatisticalText3D.jsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { gsap } from "gsap";

export default function StatisticalText3D({ text = "ENTROPY" }) {
  const mountRef = useRef();

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001a0f);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // --- LIGHTS ---
    const ambient = new THREE.AmbientLight(0xaaffcc, 0.4);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- FONT LOADER ---
    const loader = new FontLoader();
    loader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", (font) => {
      const textGeo = new TextGeometry(text, {
        font,
        size: 1.2,
        height: 0.1,
        curveSegments: 8,
      });
      textGeo.center();

      // --- GENERATE POINTS FROM TEXT GEOMETRY ---
      const sampler = new THREE.MeshSurfaceSampler(new THREE.Mesh(textGeo))
        .build();
      const count = 1200;
      const tempPosition = new THREE.Vector3();
      const cubes = [];
      const group = new THREE.Group();

      for (let i = 0; i < count; i++) {
        sampler.sample(tempPosition);
        const geom = new THREE.BoxGeometry(0.07, 0.07, 0.07);
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.35 + Math.random() * 0.1, 1, 0.6),
          emissive: 0x00ff99,
          emissiveIntensity: 0.2,
          roughness: 0.3,
          metalness: 0.4,
        });
        const cube = new THREE.Mesh(geom, mat);
        cube.position.copy(tempPosition);
        cube.initialPosition = tempPosition.clone();
        cube.castShadow = true;
        cube.receiveShadow = true;
        group.add(cube);
        cubes.push(cube);
      }

      scene.add(group);

      // --- INITIAL EXPLOSION (chaos to order) ---
      cubes.forEach((cube) => {
        cube.position.x += (Math.random() - 0.5) * 8;
        cube.position.y += (Math.random() - 0.5) * 6;
        cube.position.z += (Math.random() - 0.5) * 6;
      });

      // Animate recomposition
      setTimeout(() => {
        cubes.forEach((cube, i) => {
          gsap.to(cube.position, {
            x: cube.initialPosition.x,
            y: cube.initialPosition.y,
            z: cube.initialPosition.z,
            duration: 2 + Math.random() * 1.5,
            ease: "power3.out",
            delay: Math.random() * 1.5,
          });
        });
      }, 800);

      // --- ANIMATION LOOP ---
      const animate = () => {
        requestAnimationFrame(animate);
        group.rotation.y += 0.003;
        group.rotation.x += 0.001;
        renderer.render(scene, camera);
      };
      animate();
    });

    // Cleanup
    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, [text]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    />
  );
}
