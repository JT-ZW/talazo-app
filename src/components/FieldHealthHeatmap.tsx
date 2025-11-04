'use client';

import { useEffect, useRef } from 'react';
import type { AnalysisResult, Field } from '@/lib/store';

interface FieldHealthHeatmapProps {
  analysis: AnalysisResult;
  field: Field;
}

export default function FieldHealthHeatmap({ analysis, field }: FieldHealthHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw field boundary
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);

    // Calculate health zones based on analysis
    const diseaseDetected = analysis.disease.detected;
    const affectedArea = analysis.disease.affectedArea;
    const soilMoisture = analysis.water.soilMoisture;
    const nitrogenLevel = analysis.nutrient.nitrogen;

    // Generate heatmap grid (20x20 cells)
    const cellSize = width / 20;
    
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 20; col++) {
        const x = col * cellSize;
        const y = row * cellSize;

        // Create zones based on disease spread pattern
        let healthScore = 100;
        
        if (diseaseDetected) {
          // Simulate disease epicenter (usually in one area)
          const epicenterX = width * 0.6; // Disease hotspot at 60% width
          const epicenterY = height * 0.4; // Disease hotspot at 40% height
          
          const centerX = x + cellSize / 2;
          const centerY = y + cellSize / 2;
          
          const distance = Math.sqrt(
            Math.pow(centerX - epicenterX, 2) + Math.pow(centerY - epicenterY, 2)
          );
          const maxDistance = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
          const normalizedDistance = distance / maxDistance;
          
          // Disease intensity based on distance from epicenter
          const diseaseIntensity = Math.max(0, affectedArea - normalizedDistance * 60);
          
          // Reduce health score based on disease
          healthScore -= diseaseIntensity;
          
          // Add some randomness for realistic variation
          healthScore -= Math.random() * 15;
        }

        // Factor in water stress (low moisture = lower health)
        if (soilMoisture < 40) {
          const moistureDeficit = (40 - soilMoisture) / 40;
          healthScore -= moistureDeficit * 20;
          
          // Water stress often in edges/corners
          const edgeDistance = Math.min(
            x, y, width - x, height - y
          );
          if (edgeDistance < width * 0.15) {
            healthScore -= 15;
          }
        }

        // Factor in nutrient deficiency
        if (nitrogenLevel < 50) {
          healthScore -= (50 - nitrogenLevel) * 0.3;
        }

        // Add natural variation
        healthScore += (Math.random() - 0.5) * 10;
        
        // Clamp between 0 and 100
        healthScore = Math.max(0, Math.min(100, healthScore));

        // Determine color based on health score
        let color;
        if (healthScore >= 75) {
          // Healthy - Green
          const intensity = healthScore / 100;
          color = `rgb(${Math.floor(16 * (1 - intensity) + 34)}, ${Math.floor(185 + 54 * intensity)}, ${Math.floor(129 - 64 * intensity)})`;
        } else if (healthScore >= 45) {
          // Warning - Yellow/Orange
          const intensity = (healthScore - 45) / 30;
          color = `rgb(${Math.floor(239 + 6 * intensity)}, ${Math.floor(68 + 90 * intensity)}, ${Math.floor(68 - 23 * intensity)})`;
        } else {
          // Critical - Red
          const intensity = healthScore / 45;
          color = `rgb(${Math.floor(185 + 54 * intensity)}, ${Math.floor(28 + 40 * intensity)}, ${Math.floor(28 + 40 * intensity)})`;
        }

        // Draw cell
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);
        
        // Add subtle grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }

    // Add severity indicators for affected areas
    if (diseaseDetected && affectedArea > 30) {
      const epicenterX = width * 0.6;
      const epicenterY = height * 0.4;
      
      // Draw pulsing effect around disease epicenter
      const gradient = ctx.createRadialGradient(
        epicenterX, epicenterY, 0,
        epicenterX, epicenterY, width * 0.3
      );
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // Add overlay indicators
    if (diseaseDetected) {
      const epicenterX = width * 0.6;
      const epicenterY = height * 0.4;
      
      // Warning icon at disease location
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(epicenterX, epicenterY, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠', epicenterX, epicenterY);
    }

    // Add corner labels
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('N', 10, 20);
    
  }, [analysis, field]);

  const getHealthPercentage = () => {
    if (!analysis.disease.detected) return 100;
    return Math.max(0, 100 - analysis.disease.affectedArea);
  };

  const healthPercent = getHealthPercentage();
  const getOverallColor = () => {
    if (healthPercent >= 75) return '#10B981'; // Green
    if (healthPercent >= 45) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-900 rounded-xl p-6 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-auto rounded-lg"
        />
        
        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-2">
          <h4 className="font-bold text-sm text-gray-900 mb-3">Health Status</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded border-2 border-white shadow-sm"></div>
              <span className="text-xs text-gray-700 font-medium">Healthy (75-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500 rounded border-2 border-white shadow-sm"></div>
              <span className="text-xs text-gray-700 font-medium">Warning (45-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded border-2 border-white shadow-sm"></div>
              <span className="text-xs text-gray-700 font-medium">Critical (&lt;45%)</span>
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
