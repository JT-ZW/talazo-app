'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { AnalysisResult, Field } from '@/lib/store';

interface WaterStressMapOverlayProps {
  analysis: AnalysisResult;
  field: Field;
}

export default function WaterStressMapOverlay({ analysis, field }: WaterStressMapOverlayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const [isClient] = useState(typeof window !== 'undefined');

  useEffect(() => {
    if (!isClient || !mapRef.current || !field.coordinates || field.coordinates.length === 0) return;

    // Calculate center of field
    const latSum = field.coordinates.reduce((sum, coord) => sum + coord[0], 0);
    const lngSum = field.coordinates.reduce((sum, coord) => sum + coord[1], 0);
    const center: [number, number] = [
      latSum / field.coordinates.length,
      lngSum / field.coordinates.length
    ];

    // Initialize map if not exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: true,
      }).setView(center, 15);

      // Add satellite imagery
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing heatmap layer
    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
    }

    // Draw field boundary
    const fieldBoundary = L.polygon(field.coordinates as L.LatLngExpression[], {
      color: '#FFFFFF',
      weight: 3,
      fillOpacity: 0,
      dashArray: '10, 5',
    }).addTo(map);

    // Fit map to field bounds
    map.fitBounds(fieldBoundary.getBounds(), { padding: [50, 50] });

    // Create heatmap overlay layer group
    const heatmapLayer = L.layerGroup().addTo(map);
    heatmapLayerRef.current = heatmapLayer;

    // Get soil moisture level
    const soilMoisture = analysis.water.soilMoisture;

    // Get field bounds
    const bounds = fieldBoundary.getBounds();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    // Create grid (20x20 for detailed thermal view)
    const gridSize = 20;
    const latStep = (north - south) / gridSize;
    const lngStep = (east - west) / gridSize;

    // Water stress patterns
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellSouth = south + row * latStep;
        const cellNorth = cellSouth + latStep;
        const cellWest = west + col * lngStep;
        const cellEast = cellWest + lngStep;

        // Calculate moisture value for this cell
        let cellMoisture = soilMoisture;

        // Add spatial variation
        // Edges and corners typically dry faster
        const distanceFromCenter = Math.sqrt(
          Math.pow((row - gridSize / 2) / (gridSize / 2), 2) +
          Math.pow((col - gridSize / 2) / (gridSize / 2), 2)
        );
        
        cellMoisture -= distanceFromCenter * 15;

        // Add topographical variation (low spots retain water)
        const isLowSpot = (row === Math.floor(gridSize * 0.7) && col === Math.floor(gridSize * 0.3)) ||
                         (row === Math.floor(gridSize * 0.4) && col === Math.floor(gridSize * 0.6));
        if (isLowSpot) {
          cellMoisture += 20;
        }

        // Add random variation
        cellMoisture += (Math.random() - 0.5) * 15;
        cellMoisture = Math.max(0, Math.min(100, cellMoisture));

        // Thermal-style color gradient (blue=wet, red=dry)
        let color;
        const opacity = 0.7;
        
        if (cellMoisture >= 80) {
          // Very Wet - Dark Blue
          color = '#1e3a8a';
        } else if (cellMoisture >= 65) {
          // Optimal - Blue
          color = '#3b82f6';
        } else if (cellMoisture >= 50) {
          // Good - Light Blue
          color = '#60a5fa';
        } else if (cellMoisture >= 35) {
          // Moderate - Cyan
          color = '#22d3ee';
        } else if (cellMoisture >= 20) {
          // Low - Yellow
          color = '#facc15';
        } else if (cellMoisture >= 10) {
          // Very Low - Orange
          color = '#fb923c';
        } else {
          // Critical Dry - Red
          color = '#ef4444';
        }

        // Create rectangle overlay
        const cellBounds: L.LatLngBoundsExpression = [
          [cellSouth, cellWest],
          [cellNorth, cellEast]
        ];

        L.rectangle(cellBounds, {
          color: color,
          weight: 0,
          fillColor: color,
          fillOpacity: opacity,
        }).addTo(heatmapLayer);
      }
    }

    // Cleanup
    return () => {
      if (heatmapLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
      }
    };
  }, [isClient, field, analysis]);

  const soilMoisture = analysis.water.soilMoisture;
  const waterStatus = analysis.water.status;

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
        <div
          ref={mapRef}
          style={{ height: '500px', width: '100%' }}
          className="rounded-lg"
        />

        {/* Thermal Legend */}
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <h4 className="font-bold text-sm text-white mb-3">Soil Moisture</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#1e3a8a' }}></div>
              <span className="text-xs text-white font-medium">Very Wet (80-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#3b82f6' }}></div>
              <span className="text-xs text-white font-medium">Optimal (65-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#60a5fa' }}></div>
              <span className="text-xs text-white font-medium">Good (50-65%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#22d3ee' }}></div>
              <span className="text-xs text-white font-medium">Moderate (35-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#facc15' }}></div>
              <span className="text-xs text-white font-medium">Low (20-35%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#fb923c' }}></div>
              <span className="text-xs text-white font-medium">Very Low (10-20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#ef4444' }}></div>
              <span className="text-xs text-white font-medium">Critical (&lt;10%)</span>
            </div>
          </div>
        </div>

        {/* Field Info */}
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 text-white">
          <p className="text-sm font-bold">{field.name}</p>
          <p className="text-xs opacity-80">{field.area} hectares • {field.cropType}</p>
          <div className="mt-2 pt-2 border-t border-white/20">
            <p className="text-xs opacity-80">Soil Moisture</p>
            <p className="text-lg font-bold">{soilMoisture.toFixed(0)}%</p>
            <p className="text-xs mt-1 opacity-80">Status: {waterStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
