import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html, useProgress } from "@react-three/drei";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Button } from "@/shared/components/ui/button";
import { RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import * as THREE from "three";

interface Product3DViewerProps {
  modelUrl?: string;
  productName: string;
  className?: string;
}

function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle auto-rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={gltf.scene}
      scale={2}
      position={[0, -1, 0]}
    />
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center space-y-2">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">{Math.round(progress)}% loaded</p>
      </div>
    </Html>
  );
}

function Fallback3D() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1, 0.3, 16, 100]} />
      <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

export const Product3DViewer = ({ modelUrl, productName, className = "" }: Product3DViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const resetCamera = () => {
    setAutoRotate(false);
    setTimeout(() => setAutoRotate(true), 100);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const viewerContent = (
    <div className={`relative bg-gradient-to-br from-background to-muted/50 rounded-lg overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        className="touch-none"
      >
        <ambientLight intensity={0.4} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={<Loader />}>
          {modelUrl ? (
            <Model url={modelUrl} />
          ) : (
            <Fallback3D />
          )}
          <Environment preset="studio" />
          <ContactShadows
            rotation-x={Math.PI / 2}
            position={[0, -2, 0]}
            opacity={0.25}
            width={10}
            height={10}
            blur={1.5}
            far={10}
          />
        </Suspense>
        
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={1}
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={resetCamera}
          className="bg-background/80 backdrop-blur-sm"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Reset view</span>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle fullscreen</span>
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-xs text-muted-foreground text-center">
            Drag to rotate • Scroll to zoom • Double-click to focus
          </p>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        {viewerContent}
      </div>
    );
  }

  return viewerContent;
};
