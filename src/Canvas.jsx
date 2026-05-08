import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';
// We are implementing glitch without @react-three/postprocessing to reduce complex dependencies for now.
// The CSS glitch-overlay in index.css supplements the visual effect.

// Model: Cyberpunk Mask
function CyberpunkMask() {
  const { scene } = useGLTF('/models/scene.gltf');
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      {/* We center and scale the mask. Adjust scale depending on the actual model size */}
      <primitive object={scene} scale={2} position={[0, 0, 0]} />
    </Float>
  );
}

// Model: Kholis Avatar
function Avatar({ isMobile }) {
  const { scene, animations } = useGLTF('/models/kholis.glb');
  const groupRef = useRef();
  
  // Custom animation logic
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Head/Eyes following cursor (simplified to rotating the whole body/head slightly)
    const targetX = (state.pointer.x * Math.PI) / 4;
    const targetY = (state.pointer.y * Math.PI) / 4;
    
    // Smooth interpolation for look
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.1);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.1);
    
    // Waving hand logic (procedural if no animation exists)
    // Attempting to find right arm bone, very standard in RPM/Mixamo
    scene.traverse((child) => {
      if (child.isBone && (child.name.includes('RightArm') || child.name.includes('RightForeArm'))) {
        child.rotation.z = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 1;
      }
    });
  });

  if (isMobile) return null;

  return (
    <group ref={groupRef} position={[3, -2, 0]} scale={2}>
      <primitive object={scene} />
    </group>
  );
}

// Data Stream Particles
function DataStream() {
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5; // z
    }
    return pos;
  }, [count]);

  const pointsRef = useRef();

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.position.y -= delta * 2;
      if (pointsRef.current.position.y < -10) {
        pointsRef.current.position.y = 10;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00f3ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Main Canvas Component
export default function SceneCanvas({ glitchActive, isMobile }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1, filter: glitchActive ? 'invert(1) hue-rotate(180deg)' : 'none' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#00f3ff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#7000ff" />
        
        {/* Environment Map */}
        <Environment files="/textures/blue_lagoon_night_1k.hdr" />
        
        <DataStream />
        <React.Suspense fallback={null}>
          <CyberpunkMask />
          <Avatar isMobile={isMobile} />
        </React.Suspense>

        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
      </Canvas>
    </div>
  );
}
