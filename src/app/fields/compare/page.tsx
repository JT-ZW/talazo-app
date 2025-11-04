'use client';

import { useState } from 'react';
import { useFieldsStore } from '@/lib/store';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Check } from 'lucide-react';
import Link from 'next/link';

export default function FieldComparisonPage() {
  const { fields } = useFieldsStore();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const toggleFieldSelection = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
    } else {
      if (selectedFields.length < 4) {
        setSelectedFields([...selectedFields, fieldId]);
      }
    }
  };

  const comparedFields = fields.filter(f => selectedFields.includes(f.id));

  const getHealthStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getComparisonIcon = (value: number, avgValue: number) => {
    if (value > avgValue) return <TrendingUp className="text-green-600" size={16} />;
    if (value < avgValue) return <TrendingDown className="text-red-600" size={16} />;
    return <Minus className="text-gray-600" size={16} />;
  };

  const avgArea = comparedFields.length > 0 
    ? comparedFields.reduce((sum, f) => sum + f.area, 0) / comparedFields.length 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/fields"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Field Comparison</h1>
            <p className="text-gray-600">Compare up to 4 fields side by side</p>
          </div>
        </div>
      </div>

      {/* Field Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Fields to Compare ({selectedFields.length}/4)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {fields.map(field => (
            <button
              key={field.id}
              onClick={() => toggleFieldSelection(field.id)}
              disabled={!selectedFields.includes(field.id) && selectedFields.length >= 4}
              className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                selectedFields.includes(field.id)
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {selectedFields.includes(field.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
              )}
              <div className="font-semibold text-gray-900">{field.name}</div>
              <div className="text-sm text-gray-600">{field.cropType}</div>
              <div className="text-xs text-gray-500 mt-2">{field.area.toFixed(2)} ha</div>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {comparedFields.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                    Metric
                  </th>
                  {comparedFields.map(field => (
                    <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Crop Type */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    Crop Type
                  </td>
                  {comparedFields.map(field => (
                    <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {field.cropType}
                    </td>
                  ))}
                </tr>

                {/* Area */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                    Area (hectares)
                  </td>
                  {comparedFields.map(field => (
                    <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span>{field.area.toFixed(2)}</span>
                        {getComparisonIcon(field.area, avgArea)}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Planting Date */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    Planting Date
                  </td>
                  {comparedFields.map(field => (
                    <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(field.plantingDate).toLocaleDateString()}
                    </td>
                  ))}
                </tr>

                {/* Health Status */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                    Health Status
                  </td>
                  {comparedFields.map(field => (
                    <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(field.healthStatus)}`}>
                        {field.healthStatus || 'Unknown'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Last Scan */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    Last Scan
                  </td>
                  {comparedFields.map(field => (
                    <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {field.lastScan ? new Date(field.lastScan).toLocaleDateString() : 'Never'}
                    </td>
                  ))}
                </tr>

                {/* Days Since Planting */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                    Days Since Planting
                  </td>
                  {comparedFields.map(field => {
                    const daysSincePlanting = Math.floor(
                      (new Date().getTime() - new Date(field.plantingDate).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {daysSincePlanting} days
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {comparedFields.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparison Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Average Area</div>
              <div className="text-2xl font-bold text-gray-900">{avgArea.toFixed(2)} ha</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Largest Field</div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.max(...comparedFields.map(f => f.area)).toFixed(2)} ha
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Smallest Field</div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.min(...comparedFields.map(f => f.area)).toFixed(2)} ha
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {comparedFields.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <TrendingUp size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Fields Selected</h3>
          <p className="text-gray-600">Select at least 2 fields to start comparing</p>
        </div>
      )}
    </div>
  );
}
