'use client';

import { useEffect, useRef } from 'react';
import { Zone } from '@/lib/precisionAgriculture';

interface PrescriptionMapProps {
  zones: Zone[];
  fieldName: string;
  onZoneClick?: (zone: Zone) => void;
}

export default function PrescriptionMap({ zones, fieldName, onZoneClick }: PrescriptionMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || zones.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate grid dimensions from first zone
    const maxRow = Math.max(...zones.map(z => z.row)) + 1;
    const maxCol = Math.max(...zones.map(z => z.col)) + 1;

    // Set canvas size
    const cellSize = 80;
    canvas.width = maxCol * cellSize;
    canvas.height = maxRow * cellSize;

    // Draw zones
    zones.forEach(zone => {
      const x = zone.col * cellSize;
      const y = zone.row * cellSize;

      // Zone color based on classification
      const color = 
        zone.classification === 'critical' ? '#ef4444' :
        zone.classification === 'warning' ? '#f59e0b' :
        '#10b981';

      // Draw zone rectangle
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

      // Draw zone label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${zone.row + 1}-${zone.col + 1}`, x + cellSize / 2, y + 20);

      // Draw health score
      ctx.font = '10px sans-serif';
      ctx.fillText(`Health: ${(zone.healthScore * 100).toFixed(0)}%`, x + cellSize / 2, y + cellSize / 2);

      // Draw priority if treatment needed
      if (zone.classification !== 'healthy') {
        ctx.font = 'bold 9px sans-serif';
        const priorityText = zone.prescription.priority.toUpperCase();
        ctx.fillText(priorityText, x + cellSize / 2, y + cellSize - 15);
      }
    });
  }, [zones]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onZoneClick) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellSize = 80;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    const clickedZone = zones.find(z => z.row === row && z.col === col);
    if (clickedZone) {
      onZoneClick(clickedZone);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Prescription Map: {fieldName}</h3>
        <p className="text-sm text-gray-600">Click on zones for detailed recommendations</p>
      </div>

      <div className="overflow-x-auto">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="border border-gray-300 rounded cursor-pointer hover:border-[#1E4D2B]"
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-700">Critical - Immediate Treatment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span className="text-sm text-gray-700">Warning - Monitor Closely</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-700">Healthy - No Action Needed</span>
        </div>
      </div>
    </div>
  );
}
