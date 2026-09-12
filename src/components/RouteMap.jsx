import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Navigation,
  ExternalLink,
  MapPin,
  Clock,
  Compass,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Truck,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Flag,
  Radio,
  LocateFixed,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

// Custom icons
const createBaseIcon = () => {
  return L.divIcon({
    className: 'custom-base-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: #1e293b;
        color: #f59e0b;
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        border: 2px solid white;
      ">
        <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createClientIcon = () => {
  return L.divIcon({
    className: 'custom-client-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: #0d9488;
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(13,148,136,0.45);
        border: 2px solid white;
      ">
        <svg style="transform: rotate(45deg); width: 22px; height: 22px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const createVehicleIcon = () => {
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: #2563eb;
        color: white;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(37,99,235,0.3), 0 4px 10px rgba(0,0,0,0.4);
        border: 2px solid white;
        transition: transform 0.3s ease;
      ">
        <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
          <path d="M15 18H9"></path>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path>
          <circle cx="17" cy="18" r="2"></circle>
          <circle cx="7" cy="18" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

export default function RouteMap({
  baseLocation,
  customerLocation,
  customerAddress,
  customerName,
  customerPhone
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const simIntervalRef = useRef(null);
  const watchIdRef = useRef(null);

  // States
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [simCoordIndex, setSimCoordIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 4x
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLiveGpsActive, setIsLiveGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const [routeInfo, setRouteInfo] = useState({
    distanceKm: null,
    durationMin: null,
    loading: true,
    error: null,
  });

  const baseLat = baseLocation?.lat || 19.3732;
  const baseLng = baseLocation?.lng || -99.1788;
  const clientLat = customerLocation?.lat || 19.3598;
  const clientLng = customerLocation?.lng || -99.1834;

  // Web Speech API Assistant
  const speakText = useCallback(
    (text) => {
      if (isVoiceMuted) return;
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        return;
      }

      try {
        window.speechSynthesis.cancel(); // Stop current speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        // Try selecting a Spanish voice
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(
          (v) => v.lang.startsWith('es') || v.lang.includes('es-')
        );
        if (spanishVoice) {
          utterance.voice = spanishVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Speech error:', err);
        setIsSpeaking(false);
      }
    },
    [isVoiceMuted]
  );

  // Parse OSRM Maneuver into Spanish text and Icon
  const formatManeuver = (step, index, total) => {
    const maneuver = step.maneuver || {};
    const type = maneuver.type || '';
    const modifier = maneuver.modifier || '';
    const street = step.name ? `por ${step.name}` : '';
    const distanceM = Math.round(step.distance);
    const distText = distanceM > 1000 ? `${(distanceM / 1000).toFixed(1)} km` : `${distanceM} metros`;

    let instruction = '';
    let iconType = 'straight';

    if (type === 'depart') {
      instruction = `Inicie el recorrido saliendo ${street || 'hacia la ruta'}.`;
      iconType = 'straight';
    } else if (type === 'arrive' || index === total - 1) {
      instruction = `Ha llegado a la dirección del cliente: ${customerName || 'Destino'}.`;
      iconType = 'arrive';
    } else if (modifier.includes('right')) {
      instruction = `En ${distText}, gire a la derecha ${street}.`;
      iconType = 'right';
    } else if (modifier.includes('left')) {
      instruction = `En ${distText}, gire a la izquierda ${street}.`;
      iconType = 'left';
    } else if (type === 'roundabout' || type === 'rotary') {
      instruction = `En la rotonda tome la salida indicada ${street}.`;
      iconType = 'roundabout';
    } else {
      instruction = `Continúe recto ${distText} ${street}.`;
      iconType = 'straight';
    }

    return {
      instruction,
      iconType,
      distanceM,
      distText,
      street: step.name || 'Vía principal',
      maneuverLocation: maneuver.location ? [maneuver.location[1], maneuver.location[0]] : null,
    };
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, &copy; CartoDB',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Base marker (Warehouse)
      const baseMarker = L.marker([baseLat, baseLng], { icon: createBaseIcon() }).addTo(map);
      baseMarker.bindPopup(`<b>Almacén Central (Salida)</b><br>${baseLocation?.name || 'Base Operaciones'}`);

      // Client marker (Destination)
      const clientMarker = L.marker([clientLat, clientLng], { icon: createClientIcon() }).addTo(map);
      clientMarker.bindPopup(`<b>Cliente: ${customerName || 'Destino'}</b><br>${customerAddress || ''}`);

      // Initial Vehicle Marker at base
      const vehicleMarker = L.marker([baseLat, baseLng], {
        icon: createVehicleIcon(),
        zIndexOffset: 1000,
      }).addTo(map);
      vehicleMarkerRef.current = vehicleMarker;

      mapInstanceRef.current = map;

      // Fit bounds
      const bounds = L.latLngBounds([
        [baseLat, baseLng],
        [clientLat, clientLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });

      // Fetch road route with steps from OSRM
      fetchRouteWithSteps(map, baseLng, baseLat, clientLng, clientLat);

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (watchIdRef.current) navigator.geolocation?.clearWatch(watchIdRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [baseLat, baseLng, clientLat, clientLng]);

  // Fetch route and turn-by-turn steps
  const fetchRouteWithSteps = async (map, startLng, startLat, endLng, endLat) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`
      );

      if (!res.ok) throw new Error('No se pudo calcular la ruta por carretera');
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setRouteCoordinates(coords);

        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
        }

        // Draw Polyline
        const polyline = L.polyline(coords, {
          color: '#06b6d4',
          weight: 6,
          opacity: 0.9,
          lineJoin: 'round',
        }).addTo(map);

        routeLayerRef.current = polyline;
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

        // Parse steps
        const rawSteps = route.legs?.[0]?.steps || [];
        const parsedSteps = rawSteps.map((s, idx) =>
          formatManeuver(s, idx, rawSteps.length)
        );

        setSteps(parsedSteps);
        setCurrentStepIndex(0);

        const distKm = (route.distance / 1000).toFixed(1);
        const durMin = Math.round(route.duration / 60);

        setRouteInfo({
          distanceKm: distKm,
          durationMin: durMin,
          loading: false,
          error: null,
        });

        // Announce route start
        speakText(
          `Ruta calculada hacia el domicilio de ${customerName || 'el cliente'}. Distancia: ${distKm} kilómetros. Tiempo estimado: ${durMin} minutos. ${
            parsedSteps[0]?.instruction || ''
          }`
        );
      } else {
        throw new Error('Sin ruta disponible');
      }
    } catch (err) {
      console.warn('Fallback straight line:', err);
      const coords = [
        [startLat, startLng],
        [endLat, endLng],
      ];
      setRouteCoordinates(coords);

      const line = L.polyline(coords, {
        color: '#3b82f6',
        weight: 4,
        dashArray: '8, 8',
      }).addTo(map);
      routeLayerRef.current = line;

      // Approximate distance
      const R = 6371;
      const dLat = ((endLat - startLat) * Math.PI) / 180;
      const dLon = ((endLng - startLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((startLat * Math.PI) / 180) *
          Math.cos((endLat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const approxDist = (R * c).toFixed(1);

      const fallbackSteps = [
        {
          instruction: `Inicie el recorrido hacia la dirección del cliente en ${customerAddress || ''}.`,
          iconType: 'straight',
          distanceM: Number(approxDist) * 1000,
          distText: `${approxDist} km`,
          street: customerAddress,
        },
        {
          instruction: `Ha llegado a la dirección del cliente: ${customerName}.`,
          iconType: 'arrive',
          distanceM: 0,
          distText: '0 m',
          street: 'Destino',
        },
      ];

      setSteps(fallbackSteps);
      setRouteInfo({
        distanceKm: approxDist,
        durationMin: Math.round((approxDist / 30) * 60),
        loading: false,
        error: 'Ruta trazada en modo aproximado.',
      });

      speakText(`Iniciando navegación hacia ${customerName}. Distancia aproximada: ${approxDist} kilómetros.`);
    }
  };

  // Turn-by-Turn Real-time Simulation Loop
  useEffect(() => {
    if (!isSimulating || routeCoordinates.length === 0) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      return;
    }

    const intervalTime = Math.max(50, 400 / simSpeed);

    simIntervalRef.current = setInterval(() => {
      setSimCoordIndex((prevIdx) => {
        const nextIdx = prevIdx + 1;

        if (nextIdx >= routeCoordinates.length) {
          // Reached Destination!
          setIsSimulating(false);
          clearInterval(simIntervalRef.current);
          speakText(`¡Ha llegado a su destino! Domicilio del cliente: ${customerName}.`);
          return prevIdx;
        }

        const currentPos = routeCoordinates[nextIdx];

        // Move Vehicle Marker on Map
        if (vehicleMarkerRef.current) {
          vehicleMarkerRef.current.setLatLng(currentPos);
        }

        // Pan map slightly to keep vehicle in view
        if (mapInstanceRef.current && nextIdx % 5 === 0) {
          mapInstanceRef.current.panTo(currentPos, { animate: true, duration: 0.3 });
        }

        // Calculate progress percentage and match closest step
        const progressRatio = nextIdx / (routeCoordinates.length - 1);
        const targetStepIdx = Math.min(
          steps.length - 1,
          Math.floor(progressRatio * steps.length)
        );

        if (targetStepIdx !== currentStepIndex && steps[targetStepIdx]) {
          setCurrentStepIndex(targetStepIdx);
          speakText(steps[targetStepIdx].instruction);
        }

        return nextIdx;
      });
    }, intervalTime);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isSimulating, simSpeed, routeCoordinates, steps, currentStepIndex, speakText, customerName]);

  // Handle Simulation Start/Pause
  const toggleSimulation = () => {
    if (isLiveGpsActive) {
      stopLiveGps();
    }
    if (!isSimulating) {
      setIsSimulating(true);
      if (simCoordIndex === 0 && steps[0]) {
        speakText(`Iniciando simulación de ruta hacia ${customerName}. ${steps[0].instruction}`);
      }
    } else {
      setIsSimulating(false);
    }
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimCoordIndex(0);
    setCurrentStepIndex(0);
    if (vehicleMarkerRef.current && routeCoordinates.length > 0) {
      vehicleMarkerRef.current.setLatLng(routeCoordinates[0]);
    }
    if (mapInstanceRef.current && routeCoordinates.length > 0) {
      mapInstanceRef.current.setView(routeCoordinates[0], 15);
    }
  };

  // Live GPS Tracking (`watchPosition`)
  const toggleLiveGps = () => {
    if (isLiveGpsActive) {
      stopLiveGps();
    } else {
      startLiveGps();
    }
  };

  const startLiveGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Tu navegador no soporta geolocalización.');
      return;
    }

    setIsSimulating(false);
    setIsLiveGpsActive(true);
    setGpsError('');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const driverLatLng = [lat, lng];

        if (vehicleMarkerRef.current) {
          vehicleMarkerRef.current.setLatLng(driverLatLng);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(driverLatLng);
        }

        // Distance to destination
        const dLat = ((clientLat - lat) * Math.PI) / 180;
        const dLon = ((clientLng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((clientLat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distRemainingM = 6371000 * c;

        if (distRemainingM < 50) {
          speakText(`¡Ha llegado a su destino! Entregando mobiliario a ${customerName}.`);
          stopLiveGps();
        }
      },
      (err) => {
        setGpsError('Error al leer GPS: ' + err.message);
        stopLiveGps();
      },
      { enableHighAccuracy: true, maximumAge: 3000 }
    );

    speakText('Seguimiento GPS en tiempo real activado.');
  };

  const stopLiveGps = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveGpsActive(false);
  };

  const activeStep = steps[currentStepIndex] || steps[0] || {
    instruction: 'Diríjase a la dirección del cliente.',
    iconType: 'straight',
    distText: `${routeInfo.distanceKm || '--'} km`,
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${baseLat},${baseLng}&destination=${clientLat},${clientLng}&travelmode=driving`;
  const wazeUrl = `https://waze.com/ul?ll=${clientLat},${clientLng}&navigate=yes`;

  // Render Maneuver Icon
  const renderManeuverIcon = (type) => {
    switch (type) {
      case 'right':
        return <CornerUpRight className="w-7 h-7 text-emerald-300" />;
      case 'left':
        return <CornerUpLeft className="w-7 h-7 text-teal-300" />;
      case 'arrive':
        return <Flag className="w-7 h-7 text-amber-400 animate-bounce" />;
      case 'roundabout':
        return <RotateCcw className="w-7 h-7 text-cyan-300" />;
      default:
        return <ArrowUp className="w-7 h-7 text-teal-300" />;
    }
  };

  return (
    <div className="bg-[#12172b] rounded-3xl border border-[#1e2642] overflow-hidden shadow-lg flex flex-col">
      {/* Real-time Turn Banner (Google Maps / Waze HUD style) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
            {renderManeuverIcon(activeStep.iconType)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-800/40">
                Paso {currentStepIndex + 1} de {Math.max(1, steps.length)}
              </span>
              {isSpeaking && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold animate-pulse">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Voz activa...</span>
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
              {activeStep.instruction}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Destino: <strong className="text-slate-200">{customerName}</strong> • {customerAddress}
            </p>
          </div>
        </div>

        {/* Distance & ETA Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Distancia</span>
            <span className="text-sm font-black text-teal-300">
              {routeInfo.distanceKm ? `${routeInfo.distanceKm} km` : '--'}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Tiempo</span>
            <span className="text-sm font-black text-amber-300">
              {routeInfo.durationMin ? `${routeInfo.durationMin} min` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Map Display & Overlays */}
      <div className="relative">
        <div ref={mapContainerRef} style={{ height: '360px', width: '100%' }} />

        {/* Live Simulation / GPS Overlay Control Bar */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-2 z-20">
          {/* Simulation Toggle */}
          <button
            onClick={toggleSimulation}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSimulating
                ? 'bg-amber-500 text-slate-950 shadow-md animate-pulse'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
            title="Simular recorrido en vivo del repartidor"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pausar Simulación' : 'Simular Recorrido'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={resetSimulation}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
            title="Reiniciar ruta al almacén"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Toggle */}
          {isSimulating && (
            <button
              onClick={() => setSimSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
              className="px-2 py-1 bg-slate-800 text-teal-300 rounded-lg text-[10px] font-mono font-bold"
              title="Velocidad de simulación"
            >
              {simSpeed}x
            </button>
          )}

          <div className="w-px h-5 bg-slate-700 mx-0.5"></div>

          {/* Live GPS button */}
          <button
            onClick={toggleLiveGps}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isLiveGpsActive
                ? 'bg-blue-600 text-white shadow-md animate-pulse'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Seguir mi ubicación real en el mapa"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{isLiveGpsActive ? 'GPS Activo' : 'GPS Real'}</span>
          </button>

          {/* Voice Mute Toggle */}
          <button
            onClick={() => {
              setIsVoiceMuted(!isVoiceMuted);
              if (isVoiceMuted && activeStep) {
                speakText(activeStep.instruction);
              }
            }}
            className={`p-1.5 rounded-xl transition-all ${
              isVoiceMuted
                ? 'text-rose-400 bg-rose-950/50'
                : 'text-teal-400 bg-teal-950/50 hover:bg-teal-900/50'
            }`}
            title={isVoiceMuted ? 'Activar instrucciones de voz' : 'Silenciar voz'}
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl text-[11px] shadow-lg border border-slate-200 flex flex-col gap-1 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <span className="w-3 h-3 rounded-full bg-slate-900 border border-white shrink-0"></span>
            <span>Origen: Almacén</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <span className="w-3 h-3 rounded-full bg-teal-600 border border-white shrink-0"></span>
            <span>Destino: {customerName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shrink-0"></span>
            <span>Vehículo en Ruta</span>
          </div>
        </div>
      </div>

      {/* GPS Error if any */}
      {gpsError && (
        <div className="bg-rose-50 border-t border-rose-200 px-4 py-2 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Voice Instruction Repeat & Steps preview */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => speakText(activeStep.instruction)}
            className="px-3.5 py-2 bg-[#182038] hover:bg-[#242e50] border border-[#242e50] rounded-xl font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Repetir Indicación de Voz</span>
          </button>

          <span className="text-slate-500 text-[11px]">
            {isVoiceMuted ? 'Voz desactivada' : 'Voz en español activa'}
          </span>
        </div>

        {/* External Apps GPS buttons */}
        <div className="flex items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>Waze</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Turn-by-Turn Maneuvers List Drawer */}
      {steps.length > 0 && (
        <details className="border-t border-[#1e2642] bg-[#12172b] group">
          <summary className="px-4 py-2.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-50 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-600" />
              <span>Ver lista completa de instrucciones de cómo llegar ({steps.length} giros)</span>
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="p-3 max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs bg-slate-50">
            {steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  speakText(step.instruction);
                }}
                className={`py-2 px-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  idx === currentStepIndex
                    ? 'bg-teal-100 text-teal-900 font-bold border border-teal-200'
                    : 'hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step.instruction}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {step.distText}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
