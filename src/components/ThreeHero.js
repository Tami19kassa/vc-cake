"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ThreeHero() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 8.2);
    camera.lookAt(0, 0.2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Main Group
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // Cake Group
    const cakeGroup = new THREE.Group();
    universeGroup.add(cakeGroup);

    // Stand Group (Gold)
    const standGroup = new THREE.Group();
    cakeGroup.add(standGroup);

    // Tier 1 Group (Bottom - White/Gold)
    const tier1Group = new THREE.Group();
    cakeGroup.add(tier1Group);

    // Tier 2 Group (Middle - White/Gold)
    const tier2Group = new THREE.Group();
    tier2Group.position.y = 0.6; // Local offset
    cakeGroup.add(tier2Group);

    // Tier 3 Group (Top - White/Gold + Golden Heart)
    const tier3Group = new THREE.Group();
    tier3Group.position.y = 1.25; // Local offset
    cakeGroup.add(tier3Group);

    // MATERIALS
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Polished Gold
      metalness: 0.95,
      roughness: 0.08
    });

    const ivoryMaterial = new THREE.MeshStandardMaterial({
      color: 0xfffaf0, // Ivory White
      roughness: 0.25,
      metalness: 0.05
    });

    const creamMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Whipped Cream White
      roughness: 0.3
    });

    // --- PROCEDURAL MODELING ---

    // 1. Gold Stand (Base plate from the logo)
    const standPlateGeom = new THREE.CylinderGeometry(2.3, 2.3, 0.08, 48);
    const standPlate = new THREE.Mesh(standPlateGeom, goldMaterial);
    standPlate.position.y = -0.55;
    standPlate.receiveShadow = true;
    standGroup.add(standPlate);

    const standStemGeom = new THREE.CylinderGeometry(0.35, 0.5, 0.45, 32);
    const standStem = new THREE.Mesh(standStemGeom, goldMaterial);
    standStem.position.y = -0.78;
    standGroup.add(standStem);

    const standBaseGeom = new THREE.CylinderGeometry(1.3, 1.45, 0.08, 32);
    const standBase = new THREE.Mesh(standBaseGeom, goldMaterial);
    standBase.position.y = -1.0;
    standGroup.add(standBase);

    // 2. TIER 1: Bottom Tier (Ivory Cylinder + Gold bottom ring + shoulder cream)
    const tier1Geom = new THREE.CylinderGeometry(1.85, 1.85, 0.7, 48);
    const tier1 = new THREE.Mesh(tier1Geom, ivoryMaterial);
    tier1.position.y = -0.2;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    tier1Group.add(tier1);

    const tier1GoldRingGeom = new THREE.TorusGeometry(1.86, 0.045, 12, 48);
    const tier1GoldRing = new THREE.Mesh(tier1GoldRingGeom, goldMaterial);
    tier1GoldRing.rotation.x = Math.PI / 2;
    tier1GoldRing.position.y = -0.52;
    tier1Group.add(tier1GoldRing);

    // Bottom shoulder whipped swirls & pearls
    const swirlGeom = new THREE.SphereGeometry(0.09, 16, 16);
    const swirlCount = 14;
    const swirlRadius1 = 1.65;
    for (let i = 0; i < swirlCount; i++) {
      const angle = (i / swirlCount) * Math.PI * 2;
      const swirl = new THREE.Mesh(swirlGeom, creamMaterial);
      swirl.position.set(Math.cos(angle) * swirlRadius1, 0.16, Math.sin(angle) * swirlRadius1);
      swirl.scale.set(1, 0.6, 1);
      tier1Group.add(swirl);
      
      // small gold pearl next to swirl
      const pearlGeom = new THREE.SphereGeometry(0.035, 8, 8);
      const pearl = new THREE.Mesh(pearlGeom, goldMaterial);
      pearl.position.set(Math.cos(angle) * (swirlRadius1 + 0.1), 0.17, Math.sin(angle) * (swirlRadius1 + 0.1));
      tier1Group.add(pearl);
    }

    // 3. TIER 2: Middle Tier (Ivory Cylinder + Gold bottom ring)
    const tier2Geom = new THREE.CylinderGeometry(1.35, 1.35, 0.6, 48);
    const tier2 = new THREE.Mesh(tier2Geom, ivoryMaterial);
    tier2.position.y = 0.1;
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    tier2Group.add(tier2);

    const tier2GoldRingGeom = new THREE.TorusGeometry(1.36, 0.04, 12, 48);
    const tier2GoldRing = new THREE.Mesh(tier2GoldRingGeom, goldMaterial);
    tier2GoldRing.rotation.x = Math.PI / 2;
    tier2GoldRing.position.y = -0.18;
    tier2Group.add(tier2GoldRing);

    // Middle shoulder swirls
    const swirlRadius2 = 1.15;
    const swirlCount2 = 10;
    for (let i = 0; i < swirlCount2; i++) {
      const angle = (i / swirlCount2) * Math.PI * 2;
      const swirl = new THREE.Mesh(swirlGeom, creamMaterial);
      swirl.position.set(Math.cos(angle) * swirlRadius2, 0.41, Math.sin(angle) * swirlRadius2);
      swirl.scale.set(1, 0.6, 1);
      tier2Group.add(swirl);
    }

    // 4. TIER 3: Top Tier (Ivory Cylinder + Gold bottom ring + Golden Heart Peak)
    const tier3Geom = new THREE.CylinderGeometry(0.85, 0.85, 0.5, 48);
    const tier3 = new THREE.Mesh(tier3Geom, ivoryMaterial);
    tier3.position.y = 0.35;
    tier3.castShadow = true;
    tier3.receiveShadow = true;
    tier3Group.add(tier3);

    const tier3GoldRingGeom = new THREE.TorusGeometry(0.86, 0.035, 12, 48);
    const tier3GoldRing = new THREE.Mesh(tier3GoldRingGeom, goldMaterial);
    tier3GoldRing.rotation.x = Math.PI / 2;
    tier3GoldRing.position.y = 0.11;
    tier3Group.add(tier3GoldRing);

    // Top shoulder swirls
    const swirlRadius3 = 0.7;
    const swirlCount3 = 8;
    for (let i = 0; i < swirlCount3; i++) {
      const angle = (i / swirlCount3) * Math.PI * 2;
      const swirl = new THREE.Mesh(swirlGeom, creamMaterial);
      swirl.position.set(Math.cos(angle) * swirlRadius3, 0.61, Math.sin(angle) * swirlRadius3);
      swirl.scale.set(1, 0.6, 1);
      tier3Group.add(swirl);
    }

    // 5. GOLDEN HEART TOPPING (from the brand logo circle)
    // Create vector path for 2D heart
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(-0.18, 0.2, -0.32, 0.38, -0.32, 0.58);
    heartShape.bezierCurveTo(-0.32, 0.82, -0.12, 1.05, 0, 1.25);
    heartShape.bezierCurveTo(0.12, 1.05, 0.32, 0.82, 0.32, 0.58);
    heartShape.bezierCurveTo(0.32, 0.38, 0.18, 0.2, 0, 0);

    const extrudeSettings = {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02
    };

    const heartGeom = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeom.center(); // Center pivot

    const heartMesh = new THREE.Mesh(heartGeom, goldMaterial);
    heartMesh.position.set(0, 1.2, 0); // Position at top peak
    heartMesh.castShadow = true;
    tier3Group.add(heartMesh);

    // Small gold stand stem for the heart
    const heartStemGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8);
    const heartStem = new THREE.Mesh(heartStemGeom, goldMaterial);
    heartStem.position.set(0, 0.75, 0);
    tier3Group.add(heartStem);

    // --- ORBITING LOGO BRAND ELEMENTS ---
    const brandOrbitsGroup = new THREE.Group();
    universeGroup.add(brandOrbitsGroup);

    // Helper: Extruded 5-Point Star Generator (from the logo)
    const createGoldStar = () => {
      const starShape = new THREE.Shape();
      const points = 5;
      const outerRadius = 0.16;
      const innerRadius = 0.07;
      
      for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) {
          starShape.moveTo(px, py);
        } else {
          starShape.lineTo(px, py);
        }
      }
      starShape.closePath();

      const starGeom = new THREE.ExtrudeGeometry(starShape, { depth: 0.03, bevelEnabled: false });
      starGeom.center();
      const star = new THREE.Mesh(starGeom, goldMaterial);
      star.castShadow = true;
      return star;
    };

    // Helper: Wheat Ear Generator (from the stand in the logo)
    const createGoldWheatEar = () => {
      const group = new THREE.Group();
      
      const stemGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8);
      const stem = new THREE.Mesh(stemGeom, goldMaterial);
      group.add(stem);

      const grainGeom = new THREE.SphereGeometry(0.045, 8, 8);
      
      for (let i = 0; i < 4; i++) {
        const yPos = -0.15 + i * 0.08;
        
        const leftGrain = new THREE.Mesh(grainGeom, goldMaterial);
        leftGrain.scale.set(1.5, 0.6, 0.6);
        leftGrain.position.set(-0.05, yPos, 0);
        leftGrain.rotation.z = -Math.PI / 4;
        leftGrain.castShadow = true;
        group.add(leftGrain);

        const rightGrain = new THREE.Mesh(grainGeom, goldMaterial);
        rightGrain.scale.set(1.5, 0.6, 0.6);
        rightGrain.position.set(0.05, yPos, 0);
        rightGrain.rotation.z = Math.PI / 4;
        rightGrain.castShadow = true;
        group.add(rightGrain);
      }
      
      return group;
    };

    // Helper: Cream cloud
    const createCreamCloud = () => {
      const geom = new THREE.SphereGeometry(0.12, 12, 12);
      const mesh = new THREE.Mesh(geom, creamMaterial);
      mesh.scale.set(1, 0.7, 1);
      mesh.castShadow = true;
      return mesh;
    };

    // Array of floaters
    const floaters = [
      { mesh: createGoldStar(), baseAngle: 0.0, heightOffset: 0.6 },
      { mesh: createGoldWheatEar(), baseAngle: 1.25, heightOffset: -0.2 },
      { mesh: createCreamCloud(), baseAngle: 2.5, heightOffset: 1.0 },
      { mesh: createGoldStar(), baseAngle: 3.75, heightOffset: -0.5 },
      { mesh: createGoldWheatEar(), baseAngle: 5.0, heightOffset: 0.3 }
    ];

    floaters.forEach((floater) => {
      brandOrbitsGroup.add(floater.mesh);
    });

    // --- GOLDEN SUGAR SPARKLES PARTICLE SYSTEM ---
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.9 + Math.random() * 2.3;
      positions[i] = Math.cos(angle) * radius;
      positions[i + 1] = (Math.random() - 0.5) * 3.6;
      positions[i + 2] = Math.sin(angle) * radius;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xd4af37, // Golden sparkles
      size: 0.055,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    universeGroup.add(particleSystem);

    // LIGHTING SETUP
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff9f0, 1.8);
    dirLight1.position.set(6, 12, 8);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xd4af37, 0.85); // Warm gold reflection light
    dirLight2.position.set(-6, 3, -6);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.95, 15);
    pointLight.position.set(0, 2.8, 4.2);
    scene.add(pointLight);

    setLoading(false);

    // INTERACTIVE ANIMATION TIMELINE SCROLL KEYFRAMES
    const keyframes = [
      { scroll: 0.0, x: 1.4, y: 0.1, z: 0.0, scale: 1.0, explode: 0.0, rx: 0.05, ry: -0.15, orbitRadius: 2.8, universeRotate: 0.001 },   // Section 1: Hero
      { scroll: 0.3, x: -1.3, y: 0.35, z: 0.0, scale: 0.82, explode: 0.0, rx: 0.2, ry: 0.3, orbitRadius: 2.5, universeRotate: 0.003 },  // Section 2: Shifts
      { scroll: 0.65, x: 0.0, y: -0.15, z: 0.5, scale: 1.25, explode: 1.0, rx: 0.35, ry: 0.0, orbitRadius: 1.6, universeRotate: 0.01 },  // Section 3: Exploded Tiers
      { scroll: 1.0, x: 1.5, y: -0.9, z: -0.5, scale: 0.6, explode: 0.0, rx: -0.1, ry: -0.2, orbitRadius: 3.5, universeRotate: 0.002 }   // Section 4: Blogs & Footer
    ];

    const getInterpolatedTimeline = (scrollVal) => {
      const scroll = Math.max(0, Math.min(1, scrollVal));
      if (scroll <= keyframes[0].scroll) return keyframes[0];
      if (scroll >= keyframes[keyframes.length - 1].scroll) return keyframes[keyframes.length - 1];

      let i = 0;
      for (; i < keyframes.length - 1; i++) {
        if (scroll >= keyframes[i].scroll && scroll <= keyframes[i+1].scroll) {
          break;
        }
      }

      const k1 = keyframes[i];
      const k2 = keyframes[i+1];
      const progress = (scroll - k1.scroll) / (k2.scroll - k1.scroll);

      return {
        x: THREE.MathUtils.lerp(k1.x, k2.x, progress),
        y: THREE.MathUtils.lerp(k1.y, k2.y, progress),
        z: THREE.MathUtils.lerp(k1.z, k2.z, progress),
        scale: THREE.MathUtils.lerp(k1.scale, k2.scale, progress),
        explode: THREE.MathUtils.lerp(k1.explode, k2.explode, progress),
        rx: THREE.MathUtils.lerp(k1.rx, k2.rx, progress),
        ry: THREE.MathUtils.lerp(k1.ry, k2.ry, progress),
        orbitRadius: THREE.MathUtils.lerp(k1.orbitRadius, k2.orbitRadius, progress),
        universeRotate: THREE.MathUtils.lerp(k1.universeRotate, k2.universeRotate, progress)
      };
    };

    const adjustCoordinatesForMobile = (coords) => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        return {
          ...coords,
          x: coords.x * 0.0,
          y: coords.y - 0.2,
          scale: coords.scale * 0.72
        };
      }
      return coords;
    };

    let scrollYTarget = 0;
    let scrollPercent = 0;
    let mouseX = 0;
    let mouseY = 0;
    let mouseTiltX = 0;
    let mouseTiltY = 0;

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollYTarget = docHeight > 0 ? window.scrollY / docHeight : 0;
    };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseTiltY = mouseX * 0.2;
      mouseTiltX = -mouseY * 0.12;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Render loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      // Smooth scroll target lerp
      scrollPercent = THREE.MathUtils.lerp(scrollPercent, scrollYTarget, 0.08);

      // Interpolate keyframes
      let timeline = getInterpolatedTimeline(scrollPercent);
      timeline = adjustCoordinatesForMobile(timeline);

      // Apply positions & scaling
      cakeGroup.position.x = THREE.MathUtils.lerp(cakeGroup.position.x, timeline.x, 0.08);
      cakeGroup.position.y = THREE.MathUtils.lerp(cakeGroup.position.y, timeline.y, 0.08);
      cakeGroup.position.z = THREE.MathUtils.lerp(cakeGroup.position.z, timeline.z, 0.08);

      const s = THREE.MathUtils.lerp(cakeGroup.scale.x, timeline.scale, 0.08);
      cakeGroup.scale.set(s, s, s);

      // Rotations (mapped strictly to scroll progress + mouse follow tilt)
      const targetYRotation = scrollPercent * Math.PI * 2.2 + timeline.ry + mouseTiltY;
      cakeGroup.rotation.y = THREE.MathUtils.lerp(cakeGroup.rotation.y, targetYRotation, 0.08);

      const targetX = timeline.rx + mouseTiltX;
      cakeGroup.rotation.x = THREE.MathUtils.lerp(cakeGroup.rotation.x, targetX, 0.08);

      // Explode Tier Shift (3-Tier separates vertically on scroll)
      const currentExplode = THREE.MathUtils.lerp(tier2Group.position.y - 0.6, timeline.explode * 0.8, 0.08);
      
      // Tier 1 stays grounded.
      // Tier 2 shifts up.
      tier2Group.position.y = 0.6 + currentExplode;
      
      // Tier 3 shifts up even more (stacked explode).
      tier3Group.position.y = 1.25 + currentExplode * 2.1;

      // Ground positions (no float bobbing to comply with animate-on-scroll only)
      tier1Group.position.y = -0.2;

      // Elapsed time remains for minor mouse interactions, but base orbits are scroll-locked
      const elapsed = Date.now() * 0.0014;

      // --- BRAND ORBITING DYNAMICS (Orbit angle locked strictly to scroll) ---
      floaters.forEach((floater, index) => {
        // Angle changes strictly with scroll progress rather than elapsed time
        const angle = floater.baseAngle + scrollPercent * Math.PI * 1.8;
        const radius = timeline.orbitRadius;
        
        const targetFloaterX = Math.cos(angle) * radius;
        const targetFloaterZ = Math.sin(angle) * radius;
        const targetFloaterY = floater.heightOffset; // flat position

        floater.mesh.position.x = THREE.MathUtils.lerp(floater.mesh.position.x, targetFloaterX, 0.08);
        floater.mesh.position.z = THREE.MathUtils.lerp(floater.mesh.position.z, targetFloaterZ, 0.08);
        floater.mesh.position.y = THREE.MathUtils.lerp(floater.mesh.position.y, targetFloaterY, 0.08);

        // Spin individual items slightly on scroll
        floater.mesh.rotation.y = scrollPercent * Math.PI * 3 + index;
        floater.mesh.rotation.x = scrollPercent * Math.PI * 1.5;
      });

      // --- SUGAR SPARKLES SWIRLING (Swirl angle locked strictly to scroll) ---
      particleSystem.rotation.y = scrollPercent * Math.PI * 1.5;
      particleSystem.rotation.x = scrollPercent * Math.PI * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(reqId);
      
      scene.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      });

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none overflow-hidden bg-[#0c0706]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0c0706]">
          <div className="w-12 h-12 border-t-2 border-b-2 border-[#d4af37] rounded-full animate-spin"></div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
