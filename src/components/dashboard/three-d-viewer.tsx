'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ConceptualDesignOutput } from './conceptual-design';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';


interface ThreeDViewerProps {
  designData: ConceptualDesignOutput | null;
}

export default function ThreeDViewer({ designData }: ThreeDViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let animationFrameId: number;
    let controls: any;
    let renderer: THREE.WebGLRenderer;

    const cleanup = () => {
        cancelAnimationFrame(animationFrameId);
        if (renderer && mount && mount.contains(renderer.domElement)) {
            mount.removeChild(renderer.domElement);
        }
        if (controls) {
            controls.dispose();
        }
        if (renderer) {
            renderer.dispose();
        }
    };
    
    cleanup();
    
    // If no design data, or no dimensions, don't render the scene
    if (!designData || !designData.columnWidth || !designData.columnHeight) {
        const placeholder = document.createElement('div');
        placeholder.className = "flex items-center justify-center h-full text-muted-foreground";
        const p = document.createElement('p');
        p.textContent = "يرجى إكمال خطوة 'التصميم المبدئي' أولاً لعرض النموذج.";
        placeholder.appendChild(p);
        mount.appendChild(placeholder);
        return;
    }

    // Convert cm to meters
    const columnSizeX = designData.columnWidth / 100;
    const columnSizeZ = designData.columnHeight / 100;
    
    // --- START OF SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('hsl(var(--background))');
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

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

    // --- DYNAMIC VILLA STRUCTURE ---
    const groundFloorHeight = 4;
    const slabThickness = 0.2;
    const villaWidth = 12;
    const villaDepth = 18;

    const villa = new THREE.Group();

    const slabGeometry = new THREE.BoxGeometry(villaWidth, slabThickness, villaDepth);
    const slab = new THREE.Mesh(slabGeometry, concreteMaterial);
    slab.position.y = groundFloorHeight;
    villa.add(slab);
    
    const columnGeometry = new THREE.BoxGeometry(columnSizeX, groundFloorHeight, columnSizeZ);
    const columnPositions = [
      new THREE.Vector3(-villaWidth / 2 + columnSizeX, groundFloorHeight / 2, -villaDepth / 2 + columnSizeZ),
      new THREE.Vector3(villaWidth / 2 - columnSizeX, groundFloorHeight / 2, -villaDepth / 2 + columnSizeZ),
      new THREE.Vector3(-villaWidth / 2 + columnSizeX, groundFloorHeight / 2, villaDepth / 2 - columnSizeZ),
      new THREE.Vector3(villaWidth / 2 - columnSizeX, groundFloorHeight / 2, villaDepth / 2 - columnSizeZ),
      new THREE.Vector3(0, groundFloorHeight / 2, -villaDepth / 2 + columnSizeZ),
      new THREE.Vector3(0, groundFloorHeight / 2, villaDepth / 2 - columnSizeZ),
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
      if (renderer) renderer.render(scene, camera);
    };
    
    const handleResize = () => {
        if (!renderer || !camera || !mount) return;
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    // --- CLEANUP FUNCTION ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [designData, renderKey]); // Re-run effect when designData or renderKey changes

  const handleRefresh = () => {
    setRenderKey(prevKey => prevKey + 1);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">عارض نماذج ثلاثية الأبعاد</CardTitle>
        <CardDescription>
          تفاعل مع تمثيل هيكلي ثلاثي الأبعاد للمشروع.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={mountRef}
          className="h-[500px] w-full rounded-lg border bg-card"
        >
        </div>
      </CardContent>
      {designData && (
        <CardFooter className="justify-end">
            <Button onClick={handleRefresh}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث النموذج
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
