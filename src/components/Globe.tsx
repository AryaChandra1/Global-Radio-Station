import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { CountryCoordinates } from '@/types/radio';

interface GlobeMarkerProps {
  country: CountryCoordinates;
  onClick: (country: CountryCoordinates) => void;
  isSelected: boolean;
}

function GlobeMarker({ country, onClick, isSelected }: GlobeMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Convert lat/lng to 3D position on sphere
  const position = useMemo(() => {
    const phi = (90 - country.lat) * (Math.PI / 180);
    const theta = (country.lng + 180) * (Math.PI / 180);
    const radius = 2.02;
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, [country.lat, country.lng]);

  useFrame(() => {
    if (meshRef.current) {
      const scale = hovered || isSelected ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(country);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? '#4ade80' : hovered ? '#22c55e' : '#16a34a'}
          emissive={isSelected ? '#4ade80' : hovered ? '#22c55e' : '#16a34a'}
          emissiveIntensity={isSelected ? 1 : hovered ? 0.8 : 0.5}
        />
      </mesh>
      {/* Pulse ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.07, 32]} />
        <meshBasicMaterial
          color={isSelected ? '#4ade80' : '#16a34a'}
          transparent
          opacity={isSelected ? 0.6 : 0.3}
        />
      </mesh>
      {/* Label */}
      {(hovered || isSelected) && (
        <Html
          position={[0, 0.12, 0]}
          center
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
        >
          <div className="px-2 py-1 bg-card/95 backdrop-blur-sm rounded text-xs font-medium text-foreground border border-border shadow-lg">
            {country.name}
          </div>
        </Html>
      )}
    </group>
  );
}

interface EarthProps {
  countries: CountryCoordinates[];
  onCountryClick: (country: CountryCoordinates) => void;
  selectedCountry: string | null;
}

function Earth({ countries, onCountryClick, selectedCountry }: EarthProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  
  // Helper to convert lat/lng to canvas x/y (equirectangular projection)
  // Canvas: width = 1024, height = 512
  // X: longitude -180 to 180 maps to 0 to 1024
  // Y: latitude 90 to -90 maps to 0 to 512
  const lngToX = (lng: number) => ((lng + 180) / 360) * 1024;
  const latToY = (lat: number) => ((90 - lat) / 180) * 512;
  
  // Create a custom earth material with accurate continent positions
  const earthMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Ocean gradient
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGradient.addColorStop(0, '#0a2e4a');
    oceanGradient.addColorStop(0.3, '#0f3d5c');
    oceanGradient.addColorStop(0.5, '#16425b');
    oceanGradient.addColorStop(0.7, '#0f3d5c');
    oceanGradient.addColorStop(1, '#0a2e4a');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 1024, 512);
    
    // Land color with gradient
    const landGradient = ctx.createLinearGradient(0, 0, 0, 512);
    landGradient.addColorStop(0, '#1a6b52');
    landGradient.addColorStop(0.5, '#1f7a5e');
    landGradient.addColorStop(1, '#1a6b52');
    ctx.fillStyle = landGradient;
    
    // Draw continents using accurate lat/lng coordinates
    // Each continent is drawn as a path with multiple points
    
    // North America
    ctx.beginPath();
    ctx.moveTo(lngToX(-168), latToY(65)); // Alaska
    ctx.lineTo(lngToX(-140), latToY(70));
    ctx.lineTo(lngToX(-95), latToY(72)); // Northern Canada
    ctx.lineTo(lngToX(-75), latToY(83)); // Arctic islands
    ctx.lineTo(lngToX(-60), latToY(75));
    ctx.lineTo(lngToX(-55), latToY(52)); // Labrador
    ctx.lineTo(lngToX(-67), latToY(45)); // New England
    ctx.lineTo(lngToX(-75), latToY(35)); // East coast
    ctx.lineTo(lngToX(-81), latToY(25)); // Florida
    ctx.lineTo(lngToX(-97), latToY(26)); // Gulf coast
    ctx.lineTo(lngToX(-105), latToY(20)); // Mexico
    ctx.lineTo(lngToX(-117), latToY(32)); // Baja
    ctx.lineTo(lngToX(-124), latToY(40)); // California
    ctx.lineTo(lngToX(-125), latToY(49)); // Pacific Northwest
    ctx.lineTo(lngToX(-140), latToY(60)); // Alaska panhandle
    ctx.lineTo(lngToX(-168), latToY(65));
    ctx.closePath();
    ctx.fill();
    
    // Greenland
    ctx.beginPath();
    ctx.moveTo(lngToX(-45), latToY(60));
    ctx.lineTo(lngToX(-22), latToY(65));
    ctx.lineTo(lngToX(-20), latToY(75));
    ctx.lineTo(lngToX(-35), latToY(83));
    ctx.lineTo(lngToX(-55), latToY(80));
    ctx.lineTo(lngToX(-55), latToY(70));
    ctx.closePath();
    ctx.fill();
    
    // Central America & Caribbean
    ctx.beginPath();
    ctx.moveTo(lngToX(-105), latToY(20));
    ctx.lineTo(lngToX(-87), latToY(22)); // Yucatan
    ctx.lineTo(lngToX(-83), latToY(15));
    ctx.lineTo(lngToX(-78), latToY(9)); // Panama
    ctx.lineTo(lngToX(-85), latToY(12));
    ctx.lineTo(lngToX(-92), latToY(15));
    ctx.closePath();
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.moveTo(lngToX(-78), latToY(9)); // Colombia
    ctx.lineTo(lngToX(-60), latToY(10)); // Venezuela
    ctx.lineTo(lngToX(-50), latToY(5)); // North Brazil
    ctx.lineTo(lngToX(-35), latToY(-5)); // East Brazil
    ctx.lineTo(lngToX(-38), latToY(-15));
    ctx.lineTo(lngToX(-48), latToY(-28)); // South Brazil
    ctx.lineTo(lngToX(-58), latToY(-35)); // Argentina
    ctx.lineTo(lngToX(-65), latToY(-42));
    ctx.lineTo(lngToX(-68), latToY(-52)); // Patagonia
    ctx.lineTo(lngToX(-73), latToY(-55)); // Tierra del Fuego
    ctx.lineTo(lngToX(-75), latToY(-45)); // Chile
    ctx.lineTo(lngToX(-70), latToY(-30));
    ctx.lineTo(lngToX(-70), latToY(-18)); // Peru/Bolivia
    ctx.lineTo(lngToX(-81), latToY(-5)); // Ecuador
    ctx.lineTo(lngToX(-78), latToY(9));
    ctx.closePath();
    ctx.fill();
    
    // Europe
    ctx.beginPath();
    ctx.moveTo(lngToX(-10), latToY(36)); // Portugal
    ctx.lineTo(lngToX(-9), latToY(43)); // Spain
    ctx.lineTo(lngToX(3), latToY(43)); // France
    ctx.lineTo(lngToX(-5), latToY(50)); // Britain
    ctx.lineTo(lngToX(-8), latToY(58)); // Scotland
    ctx.lineTo(lngToX(5), latToY(62)); // Norway
    ctx.lineTo(lngToX(25), latToY(71)); // North Norway
    ctx.lineTo(lngToX(30), latToY(70)); // Finland
    ctx.lineTo(lngToX(28), latToY(60));
    ctx.lineTo(lngToX(25), latToY(55)); // Baltic
    ctx.lineTo(lngToX(20), latToY(54)); // Poland
    ctx.lineTo(lngToX(14), latToY(54));
    ctx.lineTo(lngToX(10), latToY(47)); // Alps
    ctx.lineTo(lngToX(15), latToY(45)); // Italy
    ctx.lineTo(lngToX(18), latToY(40));
    ctx.lineTo(lngToX(25), latToY(35)); // Greece
    ctx.lineTo(lngToX(28), latToY(41)); // Turkey
    ctx.lineTo(lngToX(40), latToY(42));
    ctx.lineTo(lngToX(50), latToY(45));
    ctx.lineTo(lngToX(60), latToY(55)); // Russia
    ctx.lineTo(lngToX(55), latToY(60));
    ctx.lineTo(lngToX(40), latToY(55));
    ctx.lineTo(lngToX(32), latToY(52));
    ctx.lineTo(lngToX(22), latToY(50));
    ctx.lineTo(lngToX(10), latToY(50));
    ctx.lineTo(lngToX(5), latToY(47));
    ctx.lineTo(lngToX(-1), latToY(44));
    ctx.lineTo(lngToX(-10), latToY(36));
    ctx.closePath();
    ctx.fill();
    
    // Scandinavia (additional detail)
    ctx.beginPath();
    ctx.moveTo(lngToX(5), latToY(58));
    ctx.lineTo(lngToX(10), latToY(59));
    ctx.lineTo(lngToX(18), latToY(56));
    ctx.lineTo(lngToX(12), latToY(56));
    ctx.closePath();
    ctx.fill();
    
    // Africa
    ctx.beginPath();
    ctx.moveTo(lngToX(-17), latToY(15)); // Senegal
    ctx.lineTo(lngToX(-5), latToY(36)); // Morocco
    ctx.lineTo(lngToX(10), latToY(37)); // Tunisia
    ctx.lineTo(lngToX(25), latToY(32)); // Libya
    ctx.lineTo(lngToX(35), latToY(31)); // Egypt
    ctx.lineTo(lngToX(43), latToY(12)); // Horn of Africa
    ctx.lineTo(lngToX(51), latToY(12));
    ctx.lineTo(lngToX(41), latToY(-2)); // Kenya
    ctx.lineTo(lngToX(40), latToY(-11)); // Tanzania
    ctx.lineTo(lngToX(35), latToY(-20)); // Mozambique
    ctx.lineTo(lngToX(32), latToY(-28)); // South Africa
    ctx.lineTo(lngToX(28), latToY(-33));
    ctx.lineTo(lngToX(18), latToY(-35)); // Cape
    ctx.lineTo(lngToX(15), latToY(-30)); // Namibia
    ctx.lineTo(lngToX(12), latToY(-18)); // Angola
    ctx.lineTo(lngToX(9), latToY(-6)); // Congo
    ctx.lineTo(lngToX(10), latToY(4)); // Cameroon
    ctx.lineTo(lngToX(-5), latToY(5)); // Ghana
    ctx.lineTo(lngToX(-17), latToY(15));
    ctx.closePath();
    ctx.fill();
    
    // Madagascar
    ctx.beginPath();
    ctx.moveTo(lngToX(44), latToY(-12));
    ctx.lineTo(lngToX(50), latToY(-16));
    ctx.lineTo(lngToX(47), latToY(-24));
    ctx.lineTo(lngToX(44), latToY(-25));
    ctx.lineTo(lngToX(44), latToY(-12));
    ctx.closePath();
    ctx.fill();
    
    // Asia (Russia + Central Asia)
    ctx.beginPath();
    ctx.moveTo(lngToX(60), latToY(55));
    ctx.lineTo(lngToX(90), latToY(50));
    ctx.lineTo(lngToX(120), latToY(53));
    ctx.lineTo(lngToX(135), latToY(45));
    ctx.lineTo(lngToX(140), latToY(50));
    ctx.lineTo(lngToX(160), latToY(60));
    ctx.lineTo(lngToX(180), latToY(65));
    ctx.lineTo(lngToX(180), latToY(72));
    ctx.lineTo(lngToX(140), latToY(75));
    ctx.lineTo(lngToX(100), latToY(78));
    ctx.lineTo(lngToX(70), latToY(75));
    ctx.lineTo(lngToX(60), latToY(68));
    ctx.closePath();
    ctx.fill();
    
    // Middle East & South Asia
    ctx.beginPath();
    ctx.moveTo(lngToX(35), latToY(31)); // Israel
    ctx.lineTo(lngToX(44), latToY(37)); // Turkey
    ctx.lineTo(lngToX(55), latToY(37)); // Iran
    ctx.lineTo(lngToX(65), latToY(38)); // Afghanistan
    ctx.lineTo(lngToX(75), latToY(36)); // Pakistan
    ctx.lineTo(lngToX(78), latToY(32)); // India
    ctx.lineTo(lngToX(88), latToY(28)); // Bangladesh
    ctx.lineTo(lngToX(92), latToY(22));
    ctx.lineTo(lngToX(98), latToY(15)); // Myanmar
    ctx.lineTo(lngToX(100), latToY(7)); // Thailand
    ctx.lineTo(lngToX(104), latToY(1)); // Malaysia
    ctx.lineTo(lngToX(93), latToY(6)); // Bay of Bengal
    ctx.lineTo(lngToX(80), latToY(8)); // South India
    ctx.lineTo(lngToX(73), latToY(15));
    ctx.lineTo(lngToX(68), latToY(23)); // Pakistan coast
    ctx.lineTo(lngToX(57), latToY(25)); // Oman
    ctx.lineTo(lngToX(51), latToY(24)); // UAE
    ctx.lineTo(lngToX(44), latToY(29)); // Saudi Arabia
    ctx.lineTo(lngToX(35), latToY(31));
    ctx.closePath();
    ctx.fill();
    
    // Southeast Asia & Indonesia
    ctx.beginPath();
    ctx.moveTo(lngToX(100), latToY(20)); // Vietnam
    ctx.lineTo(lngToX(108), latToY(22));
    ctx.lineTo(lngToX(120), latToY(22)); // China coast
    ctx.lineTo(lngToX(122), latToY(30)); // Shanghai
    ctx.lineTo(lngToX(120), latToY(40)); // Korea
    ctx.lineTo(lngToX(130), latToY(42));
    ctx.lineTo(lngToX(135), latToY(35)); // Japan
    ctx.lineTo(lngToX(140), latToY(38));
    ctx.lineTo(lngToX(145), latToY(44));
    ctx.lineTo(lngToX(142), latToY(46));
    ctx.lineTo(lngToX(135), latToY(45));
    ctx.lineTo(lngToX(128), latToY(36)); // Korea
    ctx.lineTo(lngToX(118), latToY(32));
    ctx.lineTo(lngToX(110), latToY(35)); // China
    ctx.lineTo(lngToX(90), latToY(28)); // Tibet
    ctx.lineTo(lngToX(80), latToY(35)); // Central Asia
    ctx.lineTo(lngToX(90), latToY(45));
    ctx.closePath();
    ctx.fill();
    
    // Philippines, Indonesia, Malaysia
    ctx.beginPath();
    ctx.moveTo(lngToX(117), latToY(7)); // Philippines
    ctx.lineTo(lngToX(126), latToY(8));
    ctx.lineTo(lngToX(127), latToY(5));
    ctx.lineTo(lngToX(120), latToY(5));
    ctx.closePath();
    ctx.fill();
    
    // Borneo
    ctx.beginPath();
    ctx.moveTo(lngToX(109), latToY(7));
    ctx.lineTo(lngToX(119), latToY(7));
    ctx.lineTo(lngToX(117), latToY(1));
    ctx.lineTo(lngToX(110), latToY(-1));
    ctx.closePath();
    ctx.fill();
    
    // Sumatra
    ctx.beginPath();
    ctx.moveTo(lngToX(95), latToY(6));
    ctx.lineTo(lngToX(104), latToY(1));
    ctx.lineTo(lngToX(106), latToY(-5));
    ctx.lineTo(lngToX(98), latToY(-3));
    ctx.closePath();
    ctx.fill();
    
    // Java
    ctx.beginPath();
    ctx.moveTo(lngToX(105), latToY(-6));
    ctx.lineTo(lngToX(114), latToY(-8));
    ctx.lineTo(lngToX(114), latToY(-7));
    ctx.lineTo(lngToX(105), latToY(-5));
    ctx.closePath();
    ctx.fill();
    
    // New Guinea
    ctx.beginPath();
    ctx.moveTo(lngToX(131), latToY(-1));
    ctx.lineTo(lngToX(141), latToY(-2));
    ctx.lineTo(lngToX(150), latToY(-5));
    ctx.lineTo(lngToX(147), latToY(-10));
    ctx.lineTo(lngToX(141), latToY(-9));
    ctx.lineTo(lngToX(132), latToY(-5));
    ctx.closePath();
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.moveTo(lngToX(113), latToY(-22)); // West coast
    ctx.lineTo(lngToX(115), latToY(-34)); // Southwest
    ctx.lineTo(lngToX(130), latToY(-35)); // South
    ctx.lineTo(lngToX(141), latToY(-38)); // Melbourne
    ctx.lineTo(lngToX(150), latToY(-37)); // Sydney area
    ctx.lineTo(lngToX(153), latToY(-28)); // Brisbane
    ctx.lineTo(lngToX(145), latToY(-15)); // Queensland
    ctx.lineTo(lngToX(142), latToY(-10)); // Cape York
    ctx.lineTo(lngToX(131), latToY(-12)); // Top End
    ctx.lineTo(lngToX(129), latToY(-15)); // Darwin
    ctx.lineTo(lngToX(122), latToY(-18)); // Northwest
    ctx.lineTo(lngToX(113), latToY(-22));
    ctx.closePath();
    ctx.fill();
    
    // Tasmania
    ctx.beginPath();
    ctx.ellipse(lngToX(147), latToY(-42), 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // New Zealand
    ctx.beginPath();
    ctx.moveTo(lngToX(173), latToY(-35)); // North Island
    ctx.lineTo(lngToX(178), latToY(-37));
    ctx.lineTo(lngToX(177), latToY(-41));
    ctx.lineTo(lngToX(174), latToY(-41));
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(lngToX(168), latToY(-44)); // South Island
    ctx.lineTo(lngToX(174), latToY(-41));
    ctx.lineTo(lngToX(174), latToY(-46));
    ctx.lineTo(lngToX(168), latToY(-46));
    ctx.closePath();
    ctx.fill();
    
    // Japan (detailed)
    ctx.beginPath();
    ctx.moveTo(lngToX(130), latToY(31)); // Kyushu
    ctx.lineTo(lngToX(132), latToY(34));
    ctx.lineTo(lngToX(135), latToY(34)); // Honshu
    ctx.lineTo(lngToX(140), latToY(36));
    ctx.lineTo(lngToX(141), latToY(41));
    ctx.lineTo(lngToX(140), latToY(43)); // Hokkaido
    ctx.lineTo(lngToX(145), latToY(44));
    ctx.lineTo(lngToX(145), latToY(43));
    ctx.lineTo(lngToX(141), latToY(39));
    ctx.lineTo(lngToX(139), latToY(35));
    ctx.lineTo(lngToX(136), latToY(33));
    ctx.lineTo(lngToX(131), latToY(32));
    ctx.closePath();
    ctx.fill();
    
    // UK & Ireland
    ctx.beginPath();
    ctx.moveTo(lngToX(-10), latToY(52)); // Ireland
    ctx.lineTo(lngToX(-6), latToY(54));
    ctx.lineTo(lngToX(-6), latToY(51));
    ctx.lineTo(lngToX(-10), latToY(52));
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(lngToX(-5), latToY(50)); // Britain
    ctx.lineTo(lngToX(2), latToY(51));
    ctx.lineTo(lngToX(0), latToY(54));
    ctx.lineTo(lngToX(-3), latToY(56));
    ctx.lineTo(lngToX(-5), latToY(58));
    ctx.lineTo(lngToX(-6), latToY(55));
    ctx.lineTo(lngToX(-5), latToY(50));
    ctx.closePath();
    ctx.fill();
    
    // Iceland
    ctx.beginPath();
    ctx.ellipse(lngToX(-19), latToY(65), 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Sri Lanka
    ctx.beginPath();
    ctx.ellipse(lngToX(81), latToY(7), 5, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Taiwan
    ctx.beginPath();
    ctx.ellipse(lngToX(121), latToY(24), 4, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    return new THREE.MeshPhongMaterial({
      map: texture,
      bumpScale: 0.02,
      specular: new THREE.Color('#333333'),
      shininess: 10,
    });
  }, [lngToX, latToY]);

  useFrame(({ clock }) => {
    // Subtle rotation
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[2, 64, 64]} />
      </mesh>
      
      {/* Grid lines for visual effect */}
      <mesh>
        <sphereGeometry args={[2.005, 36, 18]} />
        <meshBasicMaterial
          color="#22c55e"
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>
      
      {/* Atmospheric glow */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial
          transparent
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
              gl_FragColor = vec4(0.2, 0.8, 0.4, 1.0) * intensity;
            }
          `}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Country markers */}
      {countries.map((country) => (
        <GlobeMarker
          key={country.code}
          country={country}
          onClick={onCountryClick}
          isSelected={selectedCountry === country.code}
        />
      ))}
    </group>
  );
}

function Scene({ countries, onCountryClick, selectedCountry }: EarthProps) {
  const { camera } = useThree();
  
  useMemo(() => {
    camera.position.set(0, 0, 5.5);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#16a34a" />
      
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      
      <Earth
        countries={countries}
        onCountryClick={onCountryClick}
        selectedCountry={selectedCountry}
      />
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.2}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

interface GlobeProps {
  countries: CountryCoordinates[];
  onCountryClick: (country: CountryCoordinates) => void;
  selectedCountry: string | null;
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function FallbackGlobe({ countries, onCountryClick, selectedCountry }: GlobeProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-8">
      <div className="relative w-64 h-64 mb-6">
        {/* Stylized 2D globe */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-secondary to-card border border-border" />
        
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(142 70% 50% / 0.2)" strokeWidth="0.5" />
          <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="hsl(142 70% 50% / 0.15)" strokeWidth="0.5" />
          <ellipse cx="50" cy="50" rx="30" ry="45" fill="none" stroke="hsl(142 70% 50% / 0.15)" strokeWidth="0.5" />
          <line x1="50" y1="5" x2="50" y2="95" stroke="hsl(142 70% 50% / 0.15)" strokeWidth="0.5" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="hsl(142 70% 50% / 0.15)" strokeWidth="0.5" />
        </svg>
      </div>
      
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        3D Globe requires WebGL. Select a country from the list below to explore radio stations.
      </p>
      
      {/* Country selector grid */}
      <div className="flex flex-wrap gap-2 justify-center max-w-lg max-h-48 overflow-y-auto p-2">
        {countries.slice(0, 20).map((country) => (
          <button
            key={country.code}
            onClick={() => onCountryClick(country)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              selectedCountry === country.code
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
            }`}
          >
            {country.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Globe({ countries, onCountryClick, selectedCountry }: GlobeProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setHasWebGL(checkWebGLSupport());
  }, []);

  const handleCreated = useCallback(() => {
    setIsReady(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  if (!hasWebGL || error) {
    return (
      <FallbackGlobe
        countries={countries}
        onCountryClick={onCountryClick}
        selectedCountry={selectedCountry}
      />
    );
  }

  return (
    <div className="w-full h-full relative">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading globe...</p>
          </div>
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={handleCreated}
        onError={handleError}
      >
        <Scene
          countries={countries}
          onCountryClick={onCountryClick}
          selectedCountry={selectedCountry}
        />
      </Canvas>
    </div>
  );
}
