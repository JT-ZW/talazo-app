'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { calculatePolygonArea, formatArea } from '@/lib/geoUtils';

// Fix for default marker icons in Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FieldMapProps {
  coordinates?: number[][];
  onCoordinatesChange?: (coordinates: number[][], area?: number) => void;
  center?: [number, number];
  zoom?: number;
  editable?: boolean;
  height?: string;
}

export default function FieldMap({
  coordinates = [],
  onCoordinatesChange,
  center = [-17.8252, 31.0335], // Harare, Zimbabwe
  zoom = 13,
  editable = true,
  height = '500px',
}: FieldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentArea, setCurrentArea] = useState<number>(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);

    // Add high-quality tile layers
    const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 3,
    });

    // High-quality satellite imagery (Esri World Imagery)
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19,
      minZoom: 3,
    });

    // Hybrid view (satellite with labels) - RECOMMENDED DEFAULT
    const labelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Labels © Esri',
      maxZoom: 19,
    });

    // Add default layers (satellite + labels for best experience)
    satellite.addTo(map);
    labelsLayer.addTo(map);

    // Layer control - allow toggling labels on/off
    const baseMaps = {
      'Satellite': satellite,
      'Street Map': streetMap,
    };

    const overlayMaps = {
      'Place Names & Boundaries': labelsLayer,
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    // Initialize feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    if (editable) {
      // Add drawing controls
      const drawControl = new L.Control.Draw({
        draw: {
          polygon: {
            allowIntersection: false,
            drawError: {
              color: '#e1e100',
              message: '<strong>Error:</strong> Shape edges cannot cross!',
            },
            shapeOptions: {
              color: '#1E4D2B',
              fillColor: '#1E4D2B',
              fillOpacity: 0.3,
            },
          },
          polyline: false,
          circle: false,
          rectangle: {
            shapeOptions: {
              color: '#1E4D2B',
              fillColor: '#1E4D2B',
              fillOpacity: 0.3,
            },
          },
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
      });
      map.addControl(drawControl);

      // Handle draw events
      map.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);

        const coords = layer.getLatLngs()[0].map((latlng: L.LatLng) => [
          latlng.lat,
          latlng.lng,
        ]);

        // Calculate area in hectares
        const areaInHectares = calculatePolygonArea(coords);
        setCurrentArea(areaInHectares);
        console.log(`📏 Calculated area: ${formatArea(areaInHectares)}`);

        if (onCoordinatesChange) {
          onCoordinatesChange(coords, areaInHectares);
        }
      });

      map.on(L.Draw.Event.EDITED, (event: any) => {
        const layers = event.layers;
        layers.eachLayer((layer: any) => {
          const coords = layer.getLatLngs()[0].map((latlng: L.LatLng) => [
            latlng.lat,
            latlng.lng,
          ]);

          // Recalculate area after edit
          const areaInHectares = calculatePolygonArea(coords);
          setCurrentArea(areaInHectares);
          console.log(`📏 Updated area: ${formatArea(areaInHectares)}`);

          if (onCoordinatesChange) {
            onCoordinatesChange(coords, areaInHectares);
          }
        });
      });

      map.on(L.Draw.Event.DELETED, () => {
        setCurrentArea(0);
        if (onCoordinatesChange) {
          onCoordinatesChange([], 0);
        }
      });
    }

    // If coordinates are provided, draw the polygon
    if (coordinates.length > 0) {
      const polygon = L.polygon(
        coordinates.map(coord => [coord[0], coord[1]] as [number, number]),
        {
          color: '#1E4D2B',
          fillColor: '#1E4D2B',
          fillOpacity: 0.3,
        }
      );
      drawnItems.addLayer(polygon);
      map.fitBounds(polygon.getBounds());
    }

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient]);

  // Update polygon when coordinates prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !drawnItemsRef.current) return;

    drawnItemsRef.current.clearLayers();

    if (coordinates.length > 0) {
      const polygon = L.polygon(
        coordinates.map(coord => [coord[0], coord[1]] as [number, number]),
        {
          color: '#1E4D2B',
          fillColor: '#1E4D2B',
          fillOpacity: 0.3,
        }
      );
      drawnItemsRef.current.addLayer(polygon);
      mapInstanceRef.current.fitBounds(polygon.getBounds());
    }
  }, [coordinates]);

  if (!isClient) {
    return (
      <div 
        style={{ height }} 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} style={{ height }} className="rounded-lg z-0" />
      {editable && (
        <div className="absolute top-4 right-14 bg-white px-3 py-2 rounded shadow-lg text-sm z-[1000]">
          <p className="font-semibold text-gray-700">Draw your field:</p>
          <p className="text-gray-600 text-xs">Use the polygon tool to mark boundaries</p>
          {currentArea > 0 && (
            <p className="mt-2 text-green-700 font-bold">
              Area: {formatArea(currentArea)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
