'use client';

import { useEffect, useRef } from 'react';
import type { AnalysisResult } from '@/lib/store';

interface DiseaseVisualizationProps {
  analysis: AnalysisResult;
  fieldName: string;
}

export default function DiseaseVisualization({ analysis }: DiseaseVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, width, height);

    if (analysis.disease.detected) {
      const affectedPercent = analysis.disease.affectedArea;
      const healthyPercent = 100 - affectedPercent;
      const divider = (healthyPercent / 100) * width;
      
      const healthyGradient = ctx.createLinearGradient(0, 0, divider, 0);
      healthyGradient.addColorStop(0, '#10b981');
      healthyGradient.addColorStop(1, '#34d399');
      ctx.fillStyle = healthyGradient;
      ctx.fillRect(0, 0, divider, height);
      
      let affectedColor1 = '#fbbf24';
      let affectedColor2 = '#f59e0b';
      
      if (analysis.disease.severity === 'medium') {
        affectedColor1 = '#f59e0b';
        affectedColor2 = '#ef4444';
      } else if (analysis.disease.severity === 'high') {
        affectedColor1 = '#ef4444';
        affectedColor2 = '#dc2626';
      }
      
      const affectedGradient = ctx.createLinearGradient(divider, 0, width, 0);
      affectedGradient.addColorStop(0, affectedColor1);
      affectedGradient.addColorStop(1, affectedColor2);
      ctx.fillStyle = affectedGradient;
      ctx.fillRect(divider, 0, width - divider, height);
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(divider, 0);
      ctx.lineTo(divider, height);
      ctx.stroke();
      
      if (affectedPercent > 0) {
        ctx.globalAlpha = 0.3;
        const spotSize = 8;
        const spotSpacing = 25;
        
        for (let x = divider + spotSpacing; x < width; x += spotSpacing) {
          for (let y = spotSpacing; y < height; y += spotSpacing) {
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            
            ctx.fillStyle = analysis.disease.severity === 'high' ? '#991b1b' : '#9a3412';
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, spotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }
      
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (divider > 100) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.fillText('✓ Healthy', divider / 2, height / 2 - 30);
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`${healthyPercent}%`, divider / 2, height / 2 + 20);
        ctx.shadowBlur = 0;
      }
      
      if (width - divider > 100) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 32px Arial';
        ctx.fillText('⚠ Affected', divider + (width - divider) / 2, height / 2 - 30);
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`${affectedPercent}%`, divider + (width - divider) / 2, height / 2 + 20);
        ctx.shadowBlur = 0;
      }

    } else {
      const healthyGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.min(width, height) / 2
      );
      healthyGradient.addColorStop(0, '#10b981');
      healthyGradient.addColorStop(0.5, '#34d399');
      healthyGradient.addColorStop(1, '#6ee7b7');
      
      ctx.fillStyle = healthyGradient;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 15;
      
      const centerX = width / 2;
      const centerY = height / 2;
      const size = 80;
      
      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY);
      ctx.lineTo(centerX - size / 3, centerY + size / 2);
      ctx.lineTo(centerX + size, centerY - size / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.fillText('100% Healthy', centerX, centerY + size + 50);
      ctx.shadowBlur = 0;
    }

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);

  }, [analysis]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg">Disease Coverage</h4>
          <p className="text-sm text-gray-600 mt-1">
            Visual representation of affected vs healthy field area
          </p>
        </div>
        {analysis.disease.detected && (
          <div className="sm:text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              analysis.disease.severity === 'high' ? 'bg-red-100 text-red-700' :
              analysis.disease.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {analysis.disease.severity.toUpperCase()} SEVERITY
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full h-auto max-w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 sm:p-4 text-white shadow">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-white rounded-full shrink-0"></div>
            <span className="text-xs font-bold uppercase tracking-wide">Healthy Area</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">
            {analysis.disease.detected ? 100 - analysis.disease.affectedArea : 100}%
          </p>
        </div>
        
        {analysis.disease.detected && (
          <>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 sm:p-4 text-white shadow">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-white rounded-full shrink-0"></div>
                <span className="text-xs font-bold uppercase tracking-wide">Affected Area</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{analysis.disease.affectedArea}%</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 sm:p-4 text-white shadow">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-white rounded-full shrink-0"></div>
                <span className="text-xs font-bold uppercase tracking-wide">Confidence</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{analysis.disease.confidence}%</p>
            </div>
            
            <div className={`rounded-lg p-3 sm:p-4 text-white shadow ${
              analysis.disease.severity === 'high' ? 'bg-gradient-to-br from-red-600 to-red-700' :
              analysis.disease.severity === 'medium' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
              'bg-gradient-to-br from-yellow-500 to-yellow-600'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-white rounded-full shrink-0"></div>
                <span className="text-xs font-bold uppercase tracking-wide">Severity</span>
              </div>
              <p className="text-lg sm:text-xl font-bold uppercase">{analysis.disease.severity}</p>
            </div>
          </>
        )}
      </div>

      {analysis.disease.detected && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">⚠</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">{analysis.disease.type}</h4>
              <p className="text-sm text-gray-700">
                Detected in <strong>{analysis.disease.affectedArea}%</strong> of the field with <strong>{analysis.disease.confidence}% confidence</strong>.
                {analysis.disease.severity === 'high' && ' Immediate action recommended.'}
                {analysis.disease.severity === 'medium' && ' Monitor closely and treat as needed.'}
                {analysis.disease.severity === 'low' && ' Early detection - preventive measures advised.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
