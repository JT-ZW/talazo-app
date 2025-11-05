'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { AnalysisResult, Field } from '@/lib/store';

interface NutrientMapOverlayProps {
  analysis: AnalysisResult;
  field: Field;
  nutrientType: 'nitrogen' | 'phosphorus' | 'potassium';
}

export default function NutrientMapOverlay({ analysis, field, nutrientType }: NutrientMapOverlayProps) {
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

    // Get nutrient level
    const nutrientLevel = nutrientType === 'nitrogen' ? analysis.nutrient.nitrogen :
                         nutrientType === 'phosphorus' ? analysis.nutrient.phosphorus :
                         analysis.nutrient.potassium;

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

    // Deficiency patterns (varies by location)
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellSouth = south + row * latStep;
        const cellNorth = cellSouth + latStep;
        const cellWest = west + col * lngStep;
        const cellEast = cellWest + lngStep;

        // Calculate nutrient value for this cell
        let cellNutrientLevel = nutrientLevel;

        // Add spatial variation
        const edgeDistance = Math.min(row, col, gridSize - row - 1, gridSize - col - 1);
        const edgeFactor = edgeDistance / (gridSize / 2);
        
        // Edges typically have less nutrients
        cellNutrientLevel -= (1 - edgeFactor) * 15;

        // Add some random variation
        cellNutrientLevel += (Math.random() - 0.5) * 20;
        cellNutrientLevel = Math.max(0, Math.min(100, cellNutrientLevel));

        // NDVI/Thermal-style color gradient
        let color;
        const opacity = 0.7;
        
        if (cellNutrientLevel >= 80) {
          // High - Dark Green/Blue
          color = '#1a472a';
        } else if (cellNutrientLevel >= 65) {
          // Good - Green
          color = '#10b981';
        } else if (cellNutrientLevel >= 50) {
          // Moderate - Yellow-Green
          color = '#84cc16';
        } else if (cellNutrientLevel >= 35) {
          // Low - Yellow
          color = '#facc15';
        } else if (cellNutrientLevel >= 20) {
          // Very Low - Orange
          color = '#fb923c';
        } else {
          // Critical - Red
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
  }, [isClient, field, analysis, nutrientType]);

  const nutrientLabel = nutrientType.charAt(0).toUpperCase() + nutrientType.slice(1);
  const nutrientLevel = nutrientType === 'nitrogen' ? analysis.nutrient.nitrogen :
                       nutrientType === 'phosphorus' ? analysis.nutrient.phosphorus :
                       analysis.nutrient.potassium;

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
          <h4 className="font-bold text-sm text-white mb-3">{nutrientLabel} Levels</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#1a472a' }}></div>
              <span className="text-xs text-white font-medium">High (80-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#10b981' }}></div>
              <span className="text-xs text-white font-medium">Good (65-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#84cc16' }}></div>
              <span className="text-xs text-white font-medium">Moderate (50-65%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#facc15' }}></div>
              <span className="text-xs text-white font-medium">Low (35-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#fb923c' }}></div>
              <span className="text-xs text-white font-medium">Very Low (20-35%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#ef4444' }}></div>
              <span className="text-xs text-white font-medium">Critical (&lt;20%)</span>
            </div>
          </div>
        </div>

        {/* Field Info */}
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 text-white">
          <p className="text-sm font-bold">{field.name}</p>
          <p className="text-xs opacity-80">{field.area} hectares • {field.cropType}</p>
          <div className="mt-2 pt-2 border-t border-white/20">
            <p className="text-xs opacity-80">Average {nutrientLabel}</p>
            <p className="text-lg font-bold">{nutrientLevel.toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
