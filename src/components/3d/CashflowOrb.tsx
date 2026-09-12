import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// CUSTOM SHADER MATERIAL — LIQUID CRYSTALLINE ORB
// ============================================================================

const orbVertexShader = `
  // Simplex 3D Noise for liquid displacement
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v){ 
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  uniform float u_time;
  uniform float u_distortion;
  uniform float u_crystallization;
  uniform float u_energy;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Multi-octave noise for organic liquid motion
    float noise1 = snoise(position * 1.5 + u_time * 0.3) * 0.5;
    float noise2 = snoise(position * 3.0 + u_time * 0.5) * 0.25;
    float noise3 = snoise(position * 6.0 + u_time * 0.8) * 0.125;
    
    float totalNoise = (noise1 + noise2 + noise3) * u_distortion;
    
    // Crystallization: quantize the noise to create facets
    float crystallized = floor(totalNoise * 8.0) / 8.0;
    float finalDisplacement = mix(totalNoise, crystallized, u_crystallization);
    
    // Breathing effect based on energy
    float breathing = sin(u_time * 0.8) * 0.05 * u_energy;
    
    vec3 newPosition = position + normal * (finalDisplacement + breathing);
    
    vPosition = newPosition;
    vDisplacement = finalDisplacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const orbFragmentShader = `
  uniform float u_time;
  uniform vec3 u_colorA;
  uniform vec3 u_colorB;
  uniform vec3 u_colorC;
  uniform float u_energy;
  uniform float u_crystallization;
  uniform float u_emissiveStrength;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  varying vec2 vUv;
  
  // Fresnel effect for edge glow
  float fresnel(vec3 normal, vec3 viewDir, float power) {
    return pow(1.0 - max(dot(normal, viewDir), 0.0), power);
  }
  
  // Iridescence / thin-film interference
  vec3 iridescence(float angle, float thickness) {
    float d = thickness * angle;
    vec3 color;
    color.r = cos(d * 6.2831 * 1.0) * 0.5 + 0.5;
    color.g = cos(d * 6.2831 * 1.3 + 2.094) * 0.5 + 0.5;
    color.b = cos(d * 6.2831 * 1.6 + 4.188) * 0.5 + 0.5;
    return color;
  }
  
  void main() {
    vec3 viewDir = normalize(cameraPosition - vPosition);
    
    // Fresnel for edge highlighting
    float f = fresnel(vNormal, viewDir, 3.0);
    
    // Base color gradient based on displacement
    float t = vDisplacement * 2.0 + 0.5;
    vec3 baseColor = mix(u_colorA, u_colorB, smoothstep(0.0, 0.5, t));
    baseColor = mix(baseColor, u_colorC, smoothstep(0.5, 1.0, t));
    
    // Iridescent layer
    float iriAngle = dot(vNormal, viewDir);
    vec3 iriColor = iridescence(iriAngle, 0.5 + u_time * 0.1);
    
    // Combine colors
    vec3 finalColor = mix(baseColor, iriColor, 0.3 * (1.0 - u_crystallization));
    
    // Emissive glow from within (energy indicator)
    float emissive = u_emissiveStrength * (0.5 + 0.5 * sin(u_time * 2.0));
    finalColor += baseColor * emissive * 0.5;
    
    // Edge glow (Fresnel)
    finalColor += mix(u_colorA, u_colorC, f) * f * 1.5;
    
    // Crystallization: add hard edge highlights
    if (u_crystallization > 0.0) {
      float edge = abs(fract(vDisplacement * 8.0) - 0.5) * 2.0;
      finalColor += vec3(1.0) * (1.0 - edge) * u_crystallization * 0.3;
    }
    
    // Alpha based on fresnel for glass-like transparency
    float alpha = mix(0.7, 1.0, f);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ============================================================================
// CASHFLOW ORB COMPONENT
// ============================================================================

interface CashflowOrbProps {
  status?: 'surplus' | 'deficit' | 'neutral' | 'savings';
  energy?: number; // 0 to 1
  crystallization?: number; // 0 (liquid) to 1 (crystal)
}

function OrbMesh({ status = 'neutral', energy = 0.5, crystallization = 0 }: CashflowOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Color schemes based on status
  const colors = useMemo(() => {
    switch (status) {
      case 'surplus':
        return {
          a: new THREE.Color('#00FFA3'),
          b: new THREE.Color('#00E5FF'),
          c: new THREE.Color('#7000FF'),
        };
      case 'deficit':
        return {
          a: new THREE.Color('#FF2A6D'),
          b: new THREE.Color('#FF8A00'),
          c: new THREE.Color('#FF2A6D'),
        };
      case 'savings':
        return {
          a: new THREE.Color('#7000FF'),
          b: new THREE.Color('#B100FF'),
          c: new THREE.Color('#00E5FF'),
        };
      default:
        return {
          a: new THREE.Color('#00E5FF'),
          b: new THREE.Color('#7000FF'),
          c: new THREE.Color('#00FFA3'),
        };
    }
  }, [status]);
  
  // Shader uniforms
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_distortion: { value: 0.3 },
    u_crystallization: { value: crystallization },
    u_energy: { value: energy },
    u_colorA: { value: colors.a },
    u_colorB: { value: colors.b },
    u_colorC: { value: colors.c },
    u_emissiveStrength: { value: status === 'surplus' ? 0.8 : status === 'deficit' ? 0.3 : 0.5 },
  }), [status, energy, crystallization, colors]);
  
  // Animate uniforms
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
      
      // Smooth transitions
      const targetDistortion = status === 'deficit' ? 0.5 : status === 'surplus' ? 0.2 : 0.3;
      materialRef.current.uniforms.u_distortion.value +=
        (targetDistortion - materialRef.current.uniforms.u_distortion.value) * 0.02;
      
      materialRef.current.uniforms.u_crystallization.value +=
        (crystallization - materialRef.current.uniforms.u_crystallization.value) * 0.02;
      
      materialRef.current.uniforms.u_energy.value +=
        (energy - materialRef.current.uniforms.u_energy.value) * 0.02;
    }
    
    // Gentle rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });
  
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={2}>
        <icosahedronGeometry args={[1, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={orbVertexShader}
          fragmentShader={orbFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

// ============================================================================
// TRANSACTION PARTICLES
// ============================================================================

function TransactionParticles({ transactions }: { transactions: any[] }) {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const count = Math.min(transactions.length, 100);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particleData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const txn = transactions[i % transactions.length];
      const isIncome = txn.amount > 0;
      const angle = (i / count) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const speed = 0.2 + Math.random() * 0.3;
      const yOffset = (Math.random() - 0.5) * 4;
      
      return {
        angle,
        radius,
        speed,
        yOffset,
        isIncome,
        scale: 0.03 + Math.random() * 0.05,
      };
    });
  }, [transactions, count]);
  
  useFrame((state) => {
    if (!particlesRef.current) return;
    
    particleData.forEach((particle, i) => {
      const time = state.clock.elapsedTime;
      const currentAngle = particle.angle + time * particle.speed;
      
      dummy.position.set(
        Math.cos(currentAngle) * particle.radius,
        particle.yOffset + Math.sin(time * 0.5 + i) * 0.5,
        Math.sin(currentAngle) * particle.radius
      );
      
      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();
      particlesRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#00E5FF"
        emissive="#00E5FF"
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
}

// ============================================================================
// AMBIENT ENVIRONMENT
// ============================================================================

function AmbientEnvironment() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00E5FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#7000FF" />
      <pointLight position={[0, 5, 0]} intensity={0.4} color="#00FFA3" />
      
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      
      <Environment preset="night" />
    </>
  );
}

// ============================================================================
// MAIN CASHFLOW ORB CANVAS
// ============================================================================

export default function CashflowOrb3D({
  status = 'neutral',
  energy = 0.5,
  crystallization = 0,
  transactions = [],
  className = '',
}: CashflowOrbProps & { transactions?: any[]; className?: string }) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <AmbientEnvironment />
        <OrbMesh status={status} energy={energy} crystallization={crystallization} />
        {transactions.length > 0 && <TransactionParticles transactions={transactions} />}
      </Canvas>
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 5, 0.5) 100%)',
        }}
      />
    </div>
  );
}
