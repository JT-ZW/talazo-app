'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { AnalysisResult, Field } from '@/lib/store';

interface FieldHealthMapOverlayProps {
  analysis: AnalysisResult;
  field: Field;
}

export default function FieldHealthMapOverlay({ analysis, field }: FieldHealthMapOverlayProps) {
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

      // Add place labels overlay
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Labels © Esri',
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
      color: '#374151',
      weight: 3,
      fillOpacity: 0,
      dashArray: '10, 5',
    }).addTo(map);

    // Fit map to field bounds
    map.fitBounds(fieldBoundary.getBounds(), { padding: [50, 50] });

    // Create heatmap overlay layer group
    const heatmapLayer = L.layerGroup().addTo(map);
    heatmapLayerRef.current = heatmapLayer;

    // Calculate health zones
    const diseaseDetected = analysis.disease.detected;
    const affectedArea = analysis.disease.affectedArea;
    const soilMoisture = analysis.water.soilMoisture;
    const nitrogenLevel = analysis.nutrient.nitrogen;

    // Get field bounds
    const bounds = fieldBoundary.getBounds();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    // Create grid of health zones (20x20 cells for detailed thermal view)
    const gridSize = 20;
    const latStep = (north - south) / gridSize;
    const lngStep = (east - west) / gridSize;

    // Disease epicenter (60% from west, 40% from south)
    const epicenterLat = south + (north - south) * 0.6;
    const epicenterLng = west + (east - west) * 0.6;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellSouth = south + row * latStep;
        const cellNorth = cellSouth + latStep;
        const cellWest = west + col * lngStep;
        const cellEast = cellWest + lngStep;

        const cellCenter = [(cellSouth + cellNorth) / 2, (cellWest + cellEast) / 2];

        // Calculate health score for this cell
        let healthScore = 100;

        if (diseaseDetected) {
          // Calculate distance from disease epicenter
          const distance = Math.sqrt(
            Math.pow(cellCenter[0] - epicenterLat, 2) +
            Math.pow(cellCenter[1] - epicenterLng, 2)
          );
          const maxDistance = Math.sqrt(
            Math.pow(north - south, 2) + Math.pow(east - west, 2)
          );
          const normalizedDistance = distance / maxDistance;

          // Disease intensity decreases with distance
          const diseaseIntensity = Math.max(0, affectedArea - normalizedDistance * 60);
          healthScore -= diseaseIntensity;
          healthScore -= Math.random() * 15;
        }

        // Water stress (edges often drier)
        if (soilMoisture < 40) {
          const moistureDeficit = (40 - soilMoisture) / 40;
          healthScore -= moistureDeficit * 20;

          // Edge cells more affected
          const isEdge = row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1;
          if (isEdge) {
            healthScore -= 15;
          }
        }

        // Nutrient deficiency
        if (nitrogenLevel < 50) {
          healthScore -= (50 - nitrogenLevel) * 0.3;
        }

        // Add natural variation
        healthScore += (Math.random() - 0.5) * 10;
        healthScore = Math.max(0, Math.min(100, healthScore));

        // Determine color based on health score (thermal/NDVI gradient style)
        let color;
        const opacity = 0.75;
        
        if (healthScore >= 85) {
          // Excellent - Dark Green
          color = '#1a472a';
        } else if (healthScore >= 75) {
          // Very Good - Green
          color = '#10b981';
        } else if (healthScore >= 65) {
          // Good - Yellow-Green
          color = '#84cc16';
        } else if (healthScore >= 55) {
          // Moderate - Yellow
          color = '#facc15';
        } else if (healthScore >= 45) {
          // Fair - Light Orange
          color = '#fbbf24';
        } else if (healthScore >= 35) {
          // Poor - Orange
          color = '#fb923c';
        } else if (healthScore >= 25) {
          // Very Poor - Red-Orange
          color = '#f87171';
        } else {
          // Critical - Red
          color = '#ef4444';
        }

        // Create rectangle overlay for this cell
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

    // Add disease epicenter marker if disease detected
    if (diseaseDetected && affectedArea > 30) {
      const epicenterIcon = L.divIcon({
        html: `
          <div style="
            background: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            font-size: 18px;
          ">⚠️</div>
        `,
        className: '',
        iconSize: [30, 30],
      });

      L.marker([epicenterLat, epicenterLng], { icon: epicenterIcon })
        .addTo(heatmapLayer)
        .bindPopup(`
          <div style="text-align: center;">
            <strong style="color: #DC2626;">Disease Hotspot</strong><br/>
            <span style="font-size: 12px;">${analysis.disease.type}</span>
          </div>
        `);
    }

    // Cleanup
    return () => {
      if (heatmapLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
      }
    };
  }, [isClient, field, analysis]);

  const getHealthPercentage = () => {
    if (!analysis.disease.detected) return 100;
    return Math.max(0, 100 - analysis.disease.affectedArea);
  };

  const healthPercent = getHealthPercentage();
  const getOverallColor = () => {
    if (healthPercent >= 75) return '#10B981';
    if (healthPercent >= 45) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
        <div
          ref={mapRef}
          style={{ height: '400px', width: '100%' }}
          className="rounded-lg"
        />

        {/* Thermal/NDVI Legend */}
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <h4 className="font-bold text-sm text-white mb-3">Health Status</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#1a472a' }}></div>
              <span className="text-xs text-white font-medium">Excellent (85-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#10b981' }}></div>
              <span className="text-xs text-white font-medium">Very Good (75-85%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#84cc16' }}></div>
              <span className="text-xs text-white font-medium">Good (65-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#facc15' }}></div>
              <span className="text-xs text-white font-medium">Moderate (55-65%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#fbbf24' }}></div>
              <span className="text-xs text-white font-medium">Fair (45-55%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#fb923c' }}></div>
              <span className="text-xs text-white font-medium">Poor (35-45%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#f87171' }}></div>
              <span className="text-xs text-white font-medium">Very Poor (25-35%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4" style={{ background: '#ef4444' }}></div>
              <span className="text-xs text-white font-medium">Critical (&lt;25%)</span>
            </div>
          </div>
        </div>

        {/* Field label */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2">
          <p className="text-sm font-bold text-gray-900">{field.name}</p>
          <p className="text-xs text-gray-600">{field.area} hectares • {field.cropType}</p>
        </div>
      </div>

      {/* Health metrics bar */}
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Overall Field Health</h3>
          <span
            className="text-2xl font-bold"
            style={{ color: getOverallColor() }}
          >
            {healthPercent.toFixed(0)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 flex items-center justify-end px-2"
            style={{
              width: `${healthPercent}%`,
              backgroundColor: getOverallColor()
            }}
          >
            {healthPercent > 10 && (
              <span className="text-white text-xs font-bold">
                {healthPercent.toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Affected Area</p>
            <p className="text-lg font-bold text-red-600">
              {analysis.disease.affectedArea.toFixed(0)}%
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Soil Moisture</p>
            <p className="text-lg font-bold text-blue-600">
              {analysis.water.soilMoisture.toFixed(0)}%
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Nitrogen Level</p>
            <p className="text-lg font-bold text-green-600">
              {analysis.nutrient.nitrogen.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
