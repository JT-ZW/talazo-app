'use client';

import { useEffect, useRef } from 'react';
import type { AnalysisResult } from '@/lib/store';

interface DiseaseVisualizationProps {
  analysis: AnalysisResult;
  fieldName: string;
}

export default function DiseaseVisualization({ analysis, fieldName }: DiseaseVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#f9fafb');
    bgGradient.addColorStop(1, '#f3f4f6');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    if (analysis.disease.detected) {
      // Disease spread visualization
      const affectedPercent = analysis.disease.affectedArea;
      const epicenterX = width * 0.65;
      const epicenterY = height * 0.45;

      // Draw multiple concentric circles to show disease spread
      const maxRadius = Math.min(width, height) * 0.4;
      const affectedRadius = (affectedPercent / 100) * maxRadius;

      // Critical zone (innermost - red)
      if (affectedPercent > 60) {
        const criticalGradient = ctx.createRadialGradient(
          epicenterX, epicenterY, 0,
          epicenterX, epicenterY, affectedRadius * 0.4
        );
        criticalGradient.addColorStop(0, 'rgba(220, 38, 38, 0.9)');
        criticalGradient.addColorStop(1, 'rgba(239, 68, 68, 0.6)');
        ctx.fillStyle = criticalGradient;
        ctx.beginPath();
        ctx.arc(epicenterX, epicenterY, affectedRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Warning zone (middle - orange)
      if (affectedPercent > 30) {
        const warningGradient = ctx.createRadialGradient(
          epicenterX, epicenterY, affectedRadius * 0.4,
          epicenterX, epicenterY, affectedRadius * 0.7
        );
        warningGradient.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
        warningGradient.addColorStop(1, 'rgba(251, 191, 36, 0.4)');
        ctx.fillStyle = warningGradient;
        ctx.beginPath();
        ctx.arc(epicenterX, epicenterY, affectedRadius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Affected zone (outer - yellow/light)
      const affectedGradient = ctx.createRadialGradient(
        epicenterX, epicenterY, affectedRadius * 0.7,
        epicenterX, epicenterY, affectedRadius
      );
      affectedGradient.addColorStop(0, 'rgba(252, 211, 77, 0.5)');
      affectedGradient.addColorStop(1, 'rgba(254, 243, 199, 0.2)');
      ctx.fillStyle = affectedGradient;
      ctx.beginPath();
      ctx.arc(epicenterX, epicenterY, affectedRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw healthy surrounding area
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Cut out the affected area
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(epicenterX, epicenterY, affectedRadius * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      // Add glow effect
      ctx.shadowColor = analysis.disease.severity.toLowerCase() === 'high' ? '#EF4444' : '#F59E0B';
      ctx.shadowBlur = 30;
      ctx.strokeStyle = analysis.disease.severity.toLowerCase() === 'high' ? '#DC2626' : '#D97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(epicenterX, epicenterY, affectedRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw impact markers
      const numMarkers = Math.min(8, Math.floor(affectedPercent / 10));
      for (let i = 0; i < numMarkers; i++) {
        const angle = (i / numMarkers) * Math.PI * 2;
        const markerRadius = affectedRadius * 0.6;
        const x = epicenterX + Math.cos(angle) * markerRadius;
        const y = epicenterY + Math.sin(angle) * markerRadius;

        ctx.fillStyle = 'rgba(220, 38, 38, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Central warning icon
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(epicenterX, epicenterY, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠', epicenterX, epicenterY);

    } else {
      // Healthy field - beautiful green gradient
      const healthyGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.min(width, height) / 2
      );
      healthyGradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
      healthyGradient.addColorStop(0.5, 'rgba(52, 211, 153, 0.6)');
      healthyGradient.addColorStop(1, 'rgba(167, 243, 208, 0.3)');
      
      ctx.fillStyle = healthyGradient;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Draw checkmark
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(width / 2 - 15, height / 2);
      ctx.lineTo(width / 2 - 5, height / 2 + 10);
      ctx.lineTo(width / 2 + 15, height / 2 - 10);
      ctx.stroke();
    }

    // Add field boundary
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(20, 20, width - 40, height - 40);
    ctx.setLineDash([]);

  }, [analysis]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Disease Impact Visualization</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">
            {analysis.disease.detected ? 'Active Detection' : 'No Issues'}
          </span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={700}
          height={450}
          className="w-full h-auto rounded-lg shadow-inner"
        />

        {/* Legend overlay */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-2 border border-gray-200">
          <h4 className="font-bold text-xs text-gray-900 mb-2">SEVERITY ZONES</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-600 to-red-500 border-2 border-white shadow"></div>
              <span className="text-xs text-gray-700 font-medium">Critical (&gt;60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 border-2 border-white shadow"></div>
              <span className="text-xs text-gray-700 font-medium">Warning (30-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-100 border-2 border-white shadow"></div>
              <span className="text-xs text-gray-700 font-medium">Affected (&lt;30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-green-400 border-2 border-white shadow"></div>
              <span className="text-xs text-gray-700 font-medium">Healthy</span>
            </div>
          </div>
        </div>

        {/* Field info overlay */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 border border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-1">FIELD NAME</p>
          <p className="text-sm font-bold text-gray-900">{fieldName}</p>
          {analysis.disease.detected && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600 font-medium mb-1">DETECTION</p>
              <p className="text-sm font-bold text-red-600">{analysis.disease.type}</p>
              <p className="text-xs text-gray-600 mt-1">
                {analysis.disease.confidence}% confidence
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics bar */}
      {analysis.disease.detected && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 text-center shadow">
            <p className="text-xs text-gray-600 font-medium mb-1">Affected Area</p>
            <p className="text-2xl font-bold text-red-600">{analysis.disease.affectedArea}%</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow">
            <p className="text-xs text-gray-600 font-medium mb-1">Severity</p>
            <p className="text-lg font-bold text-orange-600 uppercase">{analysis.disease.severity}</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow">
            <p className="text-xs text-gray-600 font-medium mb-1">Confidence</p>
            <p className="text-2xl font-bold text-gray-900">{analysis.disease.confidence}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
