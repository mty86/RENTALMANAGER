import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Search, Navigation, AlertCircle, Loader2 } from 'lucide-react';

// Custom modern SVG marker
const createCustomIcon = (color = '#ff2e93') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: ${color};
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <svg style="transform: rotate(45deg); width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
};

export default function MapSelector({ initialLocation, initialAddress, onLocationChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState(
    initialLocation && initialLocation.lat ? initialLocation : { lat: 19.3732, lng: -99.1788 }
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [addressPreview, setAddressPreview] = useState(initialAddress || '');
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, &copy; CartoDB',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], {
        draggable: true,
        icon: createCustomIcon('#0d9488'),
      }).addTo(map);

      marker.bindPopup('<b>Ubicación de Entrega</b><br>Arrastra este marcador o haz clic en el mapa').openPopup();

      // On Drag End
      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        handlePositionUpdate(newPos.lat, newPos.lng, map);
      });

      // On Click Map
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        handlePositionUpdate(e.latlng.lat, e.latlng.lng, map);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size after layout renders
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handlePositionUpdate = async (lat, lng, mapInstance = mapInstanceRef.current) => {
    setCoords({ lat, lng });
    setErrorMessage('');

    // Reverse geocode with OpenStreetMap Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'es',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const displayAddress = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setAddressPreview(displayAddress);
        if (onLocationChange) {
          onLocationChange({
            location: { lat, lng },
            address: displayAddress,
          });
        }
        if (markerRef.current) {
          markerRef.current.setPopupContent(`<b>Ubicación seleccionada:</b><br><span style="font-size:12px;">${displayAddress}</span>`);
        }
      } else {
        fallbackLocation(lat, lng);
      }
    } catch (err) {
      fallbackLocation(lat, lng);
    }
  };

  const fallbackLocation = (lat, lng) => {
    const text = `Ubicación (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    setAddressPreview(text);
    if (onLocationChange) {
      onLocationChange({
        location: { lat, lng },
        address: text,
      });
    }
  };

  // Search address using Nominatim
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMessage('');
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=mx,es,co,ar,pe,cl,us&limit=4`,
        {
          headers: { 'Accept-Language': 'es' },
        }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setErrorMessage('No se encontraron resultados para esa dirección. Intenta añadir tu ciudad o municipio.');
      }
    } catch (err) {
      setErrorMessage('Error al consultar el servicio de búsqueda de direcciones.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setCoords({ lat, lng });
    setAddressPreview(item.display_name);
    setSearchResults([]);
    setSearchQuery('');

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setPopupContent(`<b>${item.display_name}</b>`).openPopup();
    }

    if (onLocationChange) {
      onLocationChange({
        location: { lat, lng },
        address: item.display_name,
      });
    }
  };

  // Geolocation button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Tu navegador no soporta geolocalización.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setIsLocating(false);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        handlePositionUpdate(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        setErrorMessage('No se pudo obtener tu ubicación actual. Puedes buscarla manualmente.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      {/* Search and GPS controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar calle, colonia, municipio o punto de referencia..."
            className="w-full pl-10 pr-24 py-2.5 bg-[#182038] border border-[#242e50] text-white placeholder-slate-400 rounded-xl text-sm focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-gradient-to-r from-neon-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-glow-pink transition-all"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-200 transition-colors shrink-0"
          title="Detectar mi ubicación actual"
        >
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> : <Navigation className="w-4 h-4 text-teal-600" />}
          <span>Mi GPS</span>
        </button>
      </div>

      {/* Search results dropdown */}
      {searchResults.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-2 divide-y divide-slate-100 z-30">
          <p className="text-xs font-semibold text-slate-400 px-2 py-1">Selecciona la dirección más cercana:</p>
          {searchResults.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectSearchResult(item)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 hover:text-teal-900 rounded-lg flex items-start gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#1e2642] shadow-inner">
        <div ref={mapContainerRef} style={{ height: '280px', width: '100%' }} />

        {/* Pin Helper Tag */}
        <div className="absolute top-2 left-2 bg-[#0b0e1b]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-200 shadow-sm border border-[#1e2642] pointer-events-none flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          Haz clic o arrastra el pin hasta tu portón o entrada
        </div>
      </div>

      {/* Selected Coordinates & Address Preview */}
      <div className="bg-[#0b0e1b] border border-[#1e2642] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-700">Punto fijado en mapa: </span>
            <span className="text-slate-600">{addressPreview || 'Dirección detectada automáticamente'}</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200 shrink-0 self-start sm:self-auto">
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </div>
      </div>
    </div>
  );
}
