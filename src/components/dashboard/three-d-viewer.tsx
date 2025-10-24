'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ThreeDViewer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // --- START OF SETUP ---
    const mount = mountRef.current;
    let animationFrameId: number;

    // Clean up previous renders
    mount.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('hsl(var(--background))');
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    let controls: any;
    
    // Dynamic import for OrbitControls
    import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 5;
        controls.maxDistance = 50;
    });

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 20, 10);
    scene.add(directionalLight);

    // --- MATERIALS ---
    const concreteMaterial = new THREE.MeshStandardMaterial({
      color: 0x9e9e9e,
      metalness: 0.2,
      roughness: 0.8,
    });

    // --- VILLA STRUCTURE ---
    const groundFloorHeight = 4;
    const slabThickness = 0.2;
    const columnSize = 0.4;
    const villaWidth = 12;
    const villaDepth = 18;

    const villa = new THREE.Group();

    const slabGeometry = new THREE.BoxGeometry(villaWidth, slabThickness, villaDepth);
    const slab = new THREE.Mesh(slabGeometry, concreteMaterial);
    slab.position.y = groundFloorHeight;
    villa.add(slab);
    
    const columnGeometry = new THREE.BoxGeometry(columnSize, groundFloorHeight, columnSize);
    const columnPositions = [
      new THREE.Vector3(-villaWidth / 2 + columnSize, groundFloorHeight / 2, -villaDepth / 2 + columnSize),
      new THREE.Vector3(villaWidth / 2 - columnSize, groundFloorHeight / 2, -villaDepth / 2 + columnSize),
      new THREE.Vector3(-villaWidth / 2 + columnSize, groundFloorHeight / 2, villaDepth / 2 - columnSize),
      new THREE.Vector3(villaWidth / 2 - columnSize, groundFloorHeight / 2, villaDepth / 2 - columnSize),
      new THREE.Vector3(0, groundFloorHeight / 2, -villaDepth / 2 + columnSize),
      new THREE.Vector3(0, groundFloorHeight / 2, villaDepth / 2 - columnSize),
    ];

    columnPositions.forEach(pos => {
      const column = new THREE.Mesh(columnGeometry, concreteMaterial);
      column.position.copy(pos);
      villa.add(column);
    });
    
    const shearWallWidth = 5;
    const shearWallThickness = 0.3;
    const shearWallGeometry = new THREE.BoxGeometry(shearWallWidth, groundFloorHeight, shearWallThickness);
    
    const shearWall1 = new THREE.Mesh(shearWallGeometry, concreteMaterial);
    shearWall1.position.set(0, groundFloorHeight / 2, -villaDepth/4);
    villa.add(shearWall1);
    
    const shearWall2 = new THREE.Mesh(shearWallGeometry, concreteMaterial);
    shearWall2.position.set(0, groundFloorHeight / 2, villaDepth/4);
    shearWall2.rotation.y = Math.PI;
    villa.add(shearWall2);

    scene.add(villa);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x555555, 0x333333);
    scene.add(gridHelper);
    
    // --- ANIMATION & RESIZE ---
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controls) controls.update();
      renderer.render(scene, camera);
    };
    
    const handleResize = () => {
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (controls) {
        controls.dispose();
      }
      renderer.dispose();
      // This is now redundant due to innerHTML='' at the start, but good for safety
      if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">عارض نماذج ثلاثية الأبعاد</CardTitle>
        <CardDescription>
          تفاعل مع تمثيل هيكلي ثلاثي الأبعاد للمشروع. هذا نموذج افتراضي.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={mountRef}
          className="h-[500px] w-full rounded-lg border bg-card"
        />
      </CardContent>
    </Card>
  );
}
