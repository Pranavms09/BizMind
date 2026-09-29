'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;
  uniform vec3 uColor;
  uniform float uHorizontalBeamOffset;
  uniform float uVerticalBeamOffset;
  uniform float uHorizontalSizing;
  uniform float uVerticalSizing;
  uniform float uWispDensity;
  uniform float uWispSpeed;
  uniform float uWispIntensity;
  uniform float uFlowSpeed;
  uniform float uFlowStrength;
  uniform float uFogIntensity;
  uniform float uFogScale;
  uniform float uFogFallSpeed;
  uniform float uDecay;
  uniform float uFalloffStart;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; ++i) {
      v += a * noise(p);
      p = rot * p * 2.0 + vec2(80.0);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 C = iResolution * 0.5;

    // Apply beam offsets
    vec2 offset = vec2(uHorizontalBeamOffset * iResolution.x, uVerticalBeamOffset * iResolution.y);

    // Aspect-correct scale matching user coordinates
    vec2 sc = (512.0 / iResolution.xy) * 0.4;
    sc.x *= uHorizontalSizing;
    sc.y *= uVerticalSizing;

    vec2 uv = (frag - C - offset) * sc;

    // Subtle mouse deflection
    vec2 mouseNorm = (iMouse - C) / iResolution.xy;
    uv -= mouseNorm * vec2(0.2, 0.1);

    float t = iTime * uFlowSpeed;
    float wTime = iTime * (uWispSpeed * 0.07);

    // Primary undulating laser wave
    float wave = sin(uv.x * 2.2 + t) * cos(uv.x * 0.85 - t * 0.6) * uFlowStrength;
    float dist = abs(uv.y - wave);

    // Laser core and volumetric bloom (high dynamic range)
    float coreSharp = exp(-dist * 34.0 * uDecay) * 2.4;
    float coreSoft = exp(-dist * 9.0 * uDecay) * 1.1;
    float glow = exp(-dist * 2.4 * uDecay) * 0.45;

    // Wisps: layered harmonic micro-streaks
    float wisps = 0.0;
    float dFreq = 18.0 * uWispDensity;
    for (int i = 1; i <= 3; i++) {
      float fi = float(i);
      float phase = uv.x * dFreq * fi * 0.5 + wTime * (1.0 + fi * 0.35);
      float wLine = sin(phase) * sin(uv.x * 3.5 - wTime * 0.4);
      float wDist = abs(uv.y - wave - wLine * (0.045 * fi * uFlowStrength));
      wisps += exp(-wDist * (16.0 + fi * 14.0) * uDecay) * (0.8 / fi);
    }
    wisps *= (uWispIntensity * 0.28);

    // Volumetric fog drifting down and illuminated by the beam
    vec2 fogUv = uv * uFogScale + vec2(iTime * 0.04, -iTime * uFogFallSpeed * 0.07);
    float fogVal = fbm(fogUv) * uFogIntensity;
    float fogBloom = fogVal * exp(-dist * 3.2);

    float energy = coreSharp + coreSoft + glow + wisps + fogBloom;

    // Falloff and decay
    float r = length(uv);
    float falloff = smoothstep(uFalloffStart, max(0.0, uFalloffStart - 0.75), r);
    falloff = clamp(pow(falloff, uDecay), 0.0, 1.0);

    // Smooth screen perimeter falloff
    vec2 norm = frag / iResolution.xy;
    float edgeMask = smoothstep(0.0, 0.08, norm.x) * smoothstep(1.0, 0.92, norm.x) *
                     smoothstep(0.0, 0.06, norm.y) * smoothstep(1.0, 0.94, norm.y);

    float intensity = energy * falloff * edgeMask;

    // Laser color base + subtle highlights
    vec3 baseColor = uColor * intensity;
    vec3 pinkPurple = vec3(0.85, 0.25, 0.65) * wisps * 0.45 + vec3(0.55, 0.2, 0.85) * fogBloom * 0.35;
    vec3 col = baseColor + pinkPurple;
    col = col / (1.0 + col * 0.3);

    gl_FragColor = vec4(col, min(intensity * 1.3, 1.0));
  }
`;

export interface LaserFlowProps {
  horizontalBeamOffset?: number;
  verticalBeamOffset?: number;
  color?: string;
  horizontalSizing?: number;
  verticalSizing?: number;
  wispDensity?: number;
  wispSpeed?: number;
  wispIntensity?: number;
  flowSpeed?: number;
  flowStrength?: number;
  fogIntensity?: number;
  fogScale?: number;
  fogFallSpeed?: number;
  decay?: number;
  falloffStart?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LaserFlow: React.FC<LaserFlowProps> = ({
  horizontalBeamOffset = 0.1,
  verticalBeamOffset = 0.0,
  color = '#f4f4f4',
  horizontalSizing = 0.5,
  verticalSizing = 2,
  wispDensity = 1,
  wispSpeed = 15,
  wispIntensity = 5,
  flowSpeed = 0.35,
  flowStrength = 0.25,
  fogIntensity = 0.45,
  fogScale = 0.3,
  fogFallSpeed = 0.6,
  decay = 1.1,
  falloffStart = 1.2,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animFrameRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const isVisibleRef = useRef<boolean>(true);
  const mouseRef = useRef<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
  }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.className = 'laser-flow-canvas';
    container.appendChild(canvas);
    rendererRef.current = renderer;

    const threeColor = new THREE.Color(color);

    const uniforms = {
      iResolution: { value: new THREE.Vector2(width, height) },
      iTime: { value: 0 },
      iMouse: { value: new THREE.Vector2(width * 0.5, height * 0.5) },
      uColor: { value: new THREE.Vector3(threeColor.r, threeColor.g, threeColor.b) },
      uHorizontalBeamOffset: { value: horizontalBeamOffset },
      uVerticalBeamOffset: { value: verticalBeamOffset },
      uHorizontalSizing: { value: horizontalSizing },
      uVerticalSizing: { value: verticalSizing },
      uWispDensity: { value: wispDensity },
      uWispSpeed: { value: wispSpeed },
      uWispIntensity: { value: wispIntensity },
      uFlowSpeed: { value: flowSpeed },
      uFlowStrength: { value: flowStrength },
      uFogIntensity: { value: fogIntensity },
      uFogScale: { value: fogScale },
      uFogFallSpeed: { value: fogFallSpeed },
      uDecay: { value: decay },
      uFalloffStart: { value: falloffStart },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = rect.height - (e.clientY - rect.top);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        renderer.setSize(w, h);
        uniforms.iResolution.value.set(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisibleRef.current = entry.isIntersecting;
      });
    });
    intersectionObserver.observe(container);

    const animate = () => {
      if (isVisibleRef.current && renderer) {
        const elapsed = clockRef.current.getElapsedTime();
        uniforms.iTime.value = elapsed;

        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
        uniforms.iMouse.value.set(mouseRef.current.x, mouseRef.current.y);

        renderer.render(scene, camera);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (container && canvas && container.contains(canvas)) {
        container.removeChild(canvas);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [
    horizontalBeamOffset,
    verticalBeamOffset,
    color,
    horizontalSizing,
    verticalSizing,
    wispDensity,
    wispSpeed,
    wispIntensity,
    flowSpeed,
    flowStrength,
    fogIntensity,
    fogScale,
    fogFallSpeed,
    decay,
    falloffStart,
  ]);

  return (
    <div
      ref={containerRef}
      className={`laser-flow-container ${className}`}
      style={style}
    />
  );
};

export default LaserFlow;
