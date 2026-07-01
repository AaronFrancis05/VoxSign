"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Tune this to adjust sign-language playback speed.
// >1 = faster, <1 = slower. 0.9 gives a natural sign-language cadence.
const ANIMATION_SPEED = 0.9;

interface LandingAvatarViewerProps {
  modelUrl: string;
  isRecording?: boolean;
  triggerAnimation?: boolean;
  onAnimationComplete?: () => void;
  onLoadStateChange?: (loaded: boolean) => void;
}

export default function LandingAvatarViewer({
  modelUrl,
  isRecording = false,
  triggerAnimation = false,
  onAnimationComplete,
  onLoadStateChange,
}: LandingAvatarViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Keep references
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationsRef = useRef<THREE.AnimationClip[]>([]);
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const isRecordingRef = useRef(isRecording);
  const onAnimationCompleteRef = useRef(onAnimationComplete);

  // Sync refs with latest prop values so callbacks inside animate/loader close over fresh values
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { onAnimationCompleteRef.current = onAnimationComplete; }, [onAnimationComplete]);

  // Notify parent when loading state changes
  useEffect(() => { onLoadStateChange?.(!loading); }, [loading, onLoadStateChange]);

  // Handle playing animation once on trigger
  useEffect(() => {
    if (triggerAnimation && mixerRef.current && animationsRef.current.length > 0) {
      const mixer = mixerRef.current;
      
      // Stop any existing playing action
      if (activeActionRef.current) {
        activeActionRef.current.stop();
      }

      // Find 'rigAction' or fallback to the first clip
      const clip =
        animationsRef.current.find((c) => c.name === "rigAction") ||
        animationsRef.current[0];

      if (clip) {
        const action = mixer.clipAction(clip);
        action.reset();
        action.timeScale = ANIMATION_SPEED;
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = false; // ensure returning to rest pose
        activeActionRef.current = action;
        action.play();
      }
    }
  }, [triggerAnimation]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    controls.enablePan = true;
    controls.target.set(0, 1.3, 0);

    // Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(2, 4, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xddeeff, 1.0);
    fillLight.position.set(-2, 2, -2);
    scene.add(fillLight);

    // Floor shadow catcher
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Load model
    const loader = new GLTFLoader();
    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();
    let initialY = 0;

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Traverse to enable shadows
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Auto-center and align model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Place base of model at y=0
        initialY = -box.min.y;
        model.position.y = initialY;
        model.position.x = -center.x;
        model.position.z = -center.z;
        scene.add(model);

        // Adjust camera position
        const height = size.y || 1.8;
        const fovRad = (camera.fov * Math.PI) / 180;
        let distance = height / 2 / Math.tan(fovRad / 2);
        distance *= 1.35;

        camera.position.set(0, height / 2, distance);
        controls.target.set(0, height / 2, 0);

        controls.minDistance = distance * 0.4;
        controls.maxDistance = distance * 2.5;
        controls.update();

        // Store animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          animationsRef.current = gltf.animations;

          // Register finished listener so we can return to rest pose and notify parent
          mixer.addEventListener("finished", (e: { action: THREE.AnimationAction }) => {
            if (e.action === activeActionRef.current) {
              e.action.stop();
              activeActionRef.current = null;
              onAnimationCompleteRef.current?.();
            }
          });
        }

        setLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (err) => {
        console.error("Error loading avatar:", err);
        setError("Failed to load 3D model.");
        setLoading(false);
      }
    );

    // Render loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (mixer) {
        mixer.update(delta);
      }

      // If no active animation is playing, do a subtle idle movement
      if (!activeActionRef.current && modelRef.current) {
        const time = clock.getElapsedTime();
        modelRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
        modelRef.current.position.y = initialY + Math.sin(time * 2) * 0.005;
      }

      // Jitter/react on recording (read from ref to avoid capturing prop in animation closure)
      if (isRecordingRef.current && modelRef.current) {
        const time = clock.getElapsedTime();
        modelRef.current.rotation.y += Math.sin(time * 10) * 0.002;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.clear();
    };
  }, [modelUrl]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[340px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F9FBFE]/80 rounded-[28px] backdrop-blur-sm z-10">
          <div className="w-12 h-12 border-4 border-[#2E6BFF] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-[#2E6BFF]">Loading 3D Avatar...</p>
          {progress > 0 && <p className="text-xs text-[#5A6A85] mt-1">{progress}% loaded</p>}
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFF5F5] rounded-[28px] p-6 text-center z-10">
          <p className="text-red-500 font-semibold mb-2">Error</p>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}