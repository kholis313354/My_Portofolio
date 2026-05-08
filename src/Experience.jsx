import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, Float, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// ─── Falling Binary Rain (InstancedMesh) ───────────────────────────────────
function BinaryRain() {
  const count = 250;
  const instanceRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const tex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00f3ff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1', 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const [pos, spd] = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3]     = (Math.random() - 0.5) * 32;
      p[i * 3 + 1] = (Math.random() - 0.5) * 24;
      p[i * 3 + 2] = (Math.random() - 0.5) * 14 - 4;
      s[i] = Math.random() * 1.5 + 0.5;
    }
    return [p, s];
  }, [count]);

  useFrame((_, delta) => {
    if (!instanceRef.current) return;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= delta * spd[i] * 2.5;
      if (pos[i * 3 + 1] < -12) {
        pos[i * 3 + 1] = 12;
        pos[i * 3] = (Math.random() - 0.5) * 32;
      }
      dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      dummy.updateMatrix();
      instanceRef.current.setMatrixAt(i, dummy.matrix);
    }
    instanceRef.current.instanceMatrix.needsUpdate = true;
  });

  const geo = useMemo(() => new THREE.PlaneGeometry(0.5, 0.5), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    map: tex, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide
  }), [tex]);

  return <instancedMesh ref={instanceRef} args={[geo, mat, count]} />;
}

// ─── Cyberpunk Hero Mask ─────────────────────────────────────────────────────
function Cybermask() {
  const { scene } = useGLTF('/models/scene.gltf');
  const groupRef = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const m = child.material.clone();
        m.metalness = 1;
        m.roughness = 0.2;
        m.envMapIntensity = 2.5;
        m.emissive = new THREE.Color('#00f3ff');
        m.emissiveIntensity = 0.5;
        child.material = m;
      }
    });
  }, [scene]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.elapsedTime * 0.25;
    const pulse = Math.abs(Math.sin(clock.elapsedTime * 1.3)) * 0.7 + 0.4;
    scene.traverse((child) => {
      if (child.isMesh && child.material) child.material.emissiveIntensity = pulse;
    });
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={groupRef} position={[0, 0.5, 0]} scale={2.5}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

// ─── Avatar Kholis ───────────────────────────────────────────────────────────
function Avatar({ isMobile }) {
  const { scene, animations } = useGLTF('/models/kholis.glb');
  const safeAnims = useMemo(() => (Array.isArray(animations) ? animations : []), [animations]);
  const { actions } = useAnimations(safeAnims, scene);
  const groupRef = useRef();

  useEffect(() => {
    if (safeAnims.length > 0 && actions) {
      const first = Object.values(actions)[0];
      if (first) first.play();
    }
  }, [actions, safeAnims]);

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, (pointer.x * Math.PI) / 6, 0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, (-pointer.y * Math.PI) / 6, 0.05
    );
  });

  if (isMobile) return null;

  return (
    <group ref={groupRef} position={[4.5, -3.5, -1]} scale={2.8}>
      <pointLight position={[-2, 3, 2]} intensity={3} color="#00f3ff" distance={8} />
      <pointLight position={[2, 1, 2]}  intensity={2} color="#7000ff" distance={8} />
      <primitive object={scene} />
    </group>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function Experience({ isMobile, fullAccess }) {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none">
      <Canvas
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        camera={{ position: [0, 0, 9], fov: 45 }}
      >
        <ambientLight intensity={0.12} />
        <directionalLight position={[5, 10, 5]}   intensity={0.9} color="#00f3ff" />
        <directionalLight position={[-5, -5, -3]} intensity={0.5} color="#7000ff" />

        <React.Suspense fallback={null}>
          <Environment files="/textures/blue_lagoon_night_1k.hdr" />
          <BinaryRain />
          {fullAccess && (
            <>
              <Cybermask />
              <Avatar isMobile={isMobile} />
            </>
          )}
        </React.Suspense>

        <OrbitControls
          enableZoom={false} enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.3}
          minPolarAngle={Math.PI / 2 - 0.3}
        />
      </Canvas>
    </div>
  );
}
