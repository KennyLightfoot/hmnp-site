"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, MapPin } from 'lucide-react';

interface PolygonEditorProps {
  initialPolygon?: any;
  onPolygonChange: (polygon: any) => void;
  height?: string;
}

export default function PolygonEditor({ initialPolygon, onPolygonChange, height = "400px" }: PolygonEditorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map and drawing controls
  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const L = await import('leaflet');
        await import('leaflet-draw');
        
        // Import CSS
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);

        const drawCSS = document.createElement('link');
        drawCSS.rel = 'stylesheet';
        drawCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css';
        document.head.appendChild(drawCSS);

        if (!mounted || !mapRef.current) return;

        // Houston coordinates as default center
        const houstonCoords: [number, number] = [29.7604, -95.3698];

        // Initialize map
        const map = L.map(mapRef.current).setView(houstonCoords, 10);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Initialize FeatureGroup to store drawn items
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        drawnItemsRef.current = drawnItems;

        // Drawing control options
        const drawControl = new (L as any).Control.Draw({
          position: 'topright',
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: true,
              metric: ['km', 'm'],
              feet: false,
              shapeOptions: {
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
                weight: 2
              }
            },
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
            polyline: false
          },
          edit: {
            featureGroup: drawnItems,
            remove: true
          }
        });
        map.addControl(drawControl);

        // Handle drawing events
        map.on((L as any).Draw.Event.CREATED, (e: any) => {
          const layer = e.layer;
          drawnItems.clearLayers(); // Clear previous polygon
          drawnItems.addLayer(layer);
          
          // Convert to GeoJSON
          const geoJSON = layer.toGeoJSON();
          onPolygonChange(geoJSON.geometry);
        });

        map.on((L as any).Draw.Event.EDITED, (e: any) => {
          const layers = e.layers;
          layers.eachLayer((layer: any) => {
            const geoJSON = layer.toGeoJSON();
            onPolygonChange(geoJSON.geometry);
          });
        });

        map.on((L as any).Draw.Event.DELETED, () => {
          onPolygonChange(null);
        });

        // Load initial polygon if provided
        if (initialPolygon && initialPolygon.coordinates) {
          try {
            const polygon = L.polygon(
              initialPolygon.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]),
              {
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
                weight: 2
              }
            );
            drawnItems.addLayer(polygon);
            map.fitBounds(polygon.getBounds());
          } catch (err) {
            console.warn('Failed to load initial polygon:', err);
          }
        }

        mapInstanceRef.current = map;
        
        if (mounted) {
          setIsLoaded(true);
          setError(null);
        }

      } catch (err) {
        console.error('Failed to initialize map:', err);
        if (mounted) {
          setError('Failed to load map. Please refresh the page.');
        }
      }
    };

    initializeMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialPolygon, onPolygonChange]);

  // Clear polygon
  const handleClear = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
      onPolygonChange(null);
    }
  };

  // Reset view to Houston
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([29.7604, -95.3698], 10);
    }
  };

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef}
        style={{ height, width: '100%' }}
        className="rounded-lg overflow-hidden border"
      />
      
      {isLoaded && (
        <div className="absolute bottom-4 left-4 flex gap-2 z-[1000]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClear}
            className="flex items-center gap-1 shadow-lg"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleResetView}
            className="flex items-center gap-1 shadow-lg"
          >
            <RotateCcw className="h-3 w-3" />
            Reset View
          </Button>
        </div>
      )}

      {!isLoaded && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg"
        >
          <div className="text-center text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p>Loading map editor...</p>
          </div>
        </div>
      )}
    </div>
  );
} 