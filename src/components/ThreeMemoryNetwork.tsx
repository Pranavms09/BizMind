'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { MemoryNetworkNode, MemoryNetworkLink } from '@/types';
import { Brain, Layers } from 'lucide-react';

interface ThreeMemoryNetworkProps {
  nodes: MemoryNetworkNode[];
  links: MemoryNetworkLink[];
  onSelectNode?: (node: MemoryNetworkNode) => void;
  onNodeClick?: (node: MemoryNetworkNode) => void;
  selectedNodeId?: string | null;
}

export const ThreeMemoryNetwork: React.FC<ThreeMemoryNetworkProps> = ({
  nodes,
  links,
  onSelectNode,
  onNodeClick,
  selectedNodeId,
}) => {
  const handleNodeClick = (node: MemoryNetworkNode) => {
    if (onSelectNode) onSelectNode(node);
    if (onNodeClick) onNodeClick(node);
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const [use2DFallback, setUse2DFallback] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<MemoryNetworkNode | null>(null);

  useEffect(() => {
    if (use2DFallback) return;
    const container = containerRef.current;
    if (!container || nodes.length === 0) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050507);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 36);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambient and Point lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1.8);
    pointLight1.position.set(20, 20, 25);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xef4444, 1.2);
    pointLight2.position.set(-20, -15, -15);
    scene.add(pointLight2);

    // Node meshes
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const sphereGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const meshes: Array<{ mesh: THREE.Mesh; node: MemoryNetworkNode }> = [];

    const nodeMap = new Map<string, THREE.Vector3>();

    nodes.forEach((n) => {
      const pos = new THREE.Vector3(n.position[0], n.position[1], n.position[2]);
      nodeMap.set(n.id, pos);

      const isSelected = selectedNodeId === n.id;
      const isOutcome = n.type.toLowerCase() === 'outcome';
      const color = isSelected
        ? 0xffffff
        : isOutcome
        ? 0xef4444
        : n.type.toLowerCase() === 'decision'
        ? 0xe4e4e7
        : 0xa1a1aa;

      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: isSelected ? 0.8 : 0.25,
        roughness: 0.2,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.copy(pos);
      nodeGroup.add(mesh);
      meshes.push({ mesh, node: n });
    });

    // Links
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x52525b,
      transparent: true,
      opacity: 0.35,
    });

    links.forEach((l) => {
      const start = nodeMap.get(l.source);
      const end = nodeMap.get(l.target);
      if (start && end) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
      }
    });

    // Raycasting for interactive click & hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes.map((m) => m.mesh));
      if (intersects.length > 0) {
        const hit = meshes.find((m) => m.mesh === intersects[0].object);
        if (hit) {
          setHoveredNode(hit.node);
          renderer.domElement.style.cursor = 'pointer';
        }
      } else {
        setHoveredNode(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes.map((m) => m.mesh));
      if (intersects.length > 0) {
        const hit = meshes.find((m) => m.mesh === intersects[0].object);
        if (hit) {
          handleNodeClick(hit.node);
        }
      }
    };

    // Simple drag to rotate
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      nodeGroup.rotation.y += deltaX * 0.005;
      nodeGroup.rotation.x += deltaY * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousemove', onPointerMove);
    dom.addEventListener('click', onClick);
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseDrag);

    // Animation Loop
    let animId = 0;
    const animate = () => {
      if (!isDragging) {
        nodeGroup.rotation.y += 0.0015;
      }
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousemove', onPointerMove);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseDrag);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(dom)) container.removeChild(dom);
    };
  }, [nodes, links, selectedNodeId, use2DFallback, onSelectNode]);

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[450px] rounded-3xl bg-surface border border-border flex flex-col items-center justify-center p-8 text-center nothing-dots">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white mb-4">
          <Brain className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider mb-2">No Experience Indexed</h3>
        <p className="text-xs text-text-muted max-w-md font-mono">
          Record a business decision and evaluate its outcome to construct organizational memory.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[480px] rounded-3xl bg-[#050507] border border-border overflow-hidden shadow-2xl">
      {/* Network Header Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border text-xs text-text-muted font-mono">
        <span className="flex items-center text-white font-medium">
          <span className="glyph-dot-white mr-2" />
          {nodes.length} Memories Indexed
        </span>
        <span>•</span>
        <span className="font-mono text-[10px] text-text-secondary">Drag to rotate • Click node</span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <button
          onClick={() => setUse2DFallback(!use2DFallback)}
          className="btn-nothing-outline text-xs py-1.5 px-3.5 font-mono"
        >
          <Layers className="w-3.5 h-3.5 mr-1.5 text-white" />
          <span>{use2DFallback ? '3D Canvas' : '2D Grid'}</span>
        </button>
      </div>

      {/* Hovered Node Tooltip */}
      {hoveredNode && (
        <div className="absolute top-16 left-4 z-20 bg-black/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 max-w-sm pointer-events-none animate-fade-in shadow-xl">
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white font-semibold mb-1 inline-block">
            {hoveredNode.category}
          </span>
          <h4 className="text-xs font-bold text-white">{hoveredNode.title}</h4>
          <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{hoveredNode.lesson}</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center space-x-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-border text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-white"></span>
          <span className="text-text-secondary text-[11px] uppercase">Decision</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
          <span className="text-text-secondary text-[11px] uppercase">Outcome</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#A1A1AA]"></span>
          <span className="text-text-secondary text-[11px] uppercase">Lesson</span>
        </div>
      </div>

      {/* 2D Grid View */}
      {use2DFallback ? (
        <div className="w-full h-full p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-16">
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-surface hover:bg-surface-hover border-border hover:border-white/30 text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold border ${
                      isSelected ? 'bg-black text-white border-black' : 'bg-white/10 text-white border-white/20'
                    }`}
                  >
                    {node.type}
                  </span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-neutral-700' : 'text-text-muted'}`}>
                    {node.date}
                  </span>
                </div>
                <h4 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-black' : 'text-white'}`}>{node.title}</h4>
                <p className={`text-xs line-clamp-2 ${isSelected ? 'text-neutral-600' : 'text-text-muted'}`}>
                  {node.lesson}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        /* 3D WebGL Canvas */
        <div ref={containerRef} className="w-full h-full" />
      )}
    </div>
  );
};

export default ThreeMemoryNetwork;
