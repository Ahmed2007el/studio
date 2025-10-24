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

    let animationFrameId: number;
    let controls: any;

    const init = async () => {
      // Dynamically import OrbitControls only on the client side
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('hsl(var(--background))');

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current!.clientWidth / mountRef.current!.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(
        mountRef.current!.clientWidth,
        mountRef.current!.clientHeight
      );
      renderer.setPixelRatio(window.devicePixelRatio);
      mountRef.current!.appendChild(renderer.domElement);

      // Controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Sample object
      const geometry = new THREE.BoxGeometry(1.5, 2.5, 1.5);
      const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('hsl(var(--primary))'),
          metalness: 0.3,
          roughness: 0.6,
      });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      const wireframe = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
      );
      cube.add(wireframe);

      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        if (!mountRef.current) return;
        camera.aspect =
          mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          mountRef.current.clientWidth,
          mountRef.current.clientHeight
        );
      };
      window.addEventListener('resize', handleResize);
    };

    init();

    // Cleanup
    return () => {
      window.removeEventListener('resize', () => {});
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (mountRef.current && mountRef.current.firstChild) {
         mountRef.current.removeChild(mountRef.current.firstChild);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">عارض نماذج ثلاثية الأبعاد</CardTitle>
        <CardDescription>
          تفاعل مع تمثيل ثلاثي الأبعاد للهيكل. هذا نموذج تجريبي.
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
