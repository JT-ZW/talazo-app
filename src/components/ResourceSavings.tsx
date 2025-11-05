'use client';

import { DollarSign, Leaf, TrendingDown, Award } from 'lucide-react';

interface ResourceSavingsProps {
  fullFieldCost: number;
  precisionCost: number;
  savings: number;
  savingsPercentage: number;
  chemicalReduction: number;
  chemicalReductionPercentage: number;
  environmentalImpact: string;
  roi: number;
  treatmentRequired: number;
  totalZones: number;
}

export default function ResourceSavings({
  fullFieldCost,
  precisionCost,
  savings,
  savingsPercentage,
  chemicalReduction,
  chemicalReductionPercentage,
  environmentalImpact,
  roi,
  treatmentRequired,
  totalZones,
}: ResourceSavingsProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-lg p-6 border-2 border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <Award className="text-green-600" size={28} />
        <h3 className="text-xl font-bold text-gray-900">Precision Agriculture Savings</h3>
      </div>

      {/* Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cost Savings</span>
            <DollarSign className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-green-600">${savings.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{savingsPercentage.toFixed(1)}% reduction</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Chemical Reduction</span>
            <Leaf className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-blue-600">{chemicalReduction.toFixed(1)} kg</p>
          <p className="text-xs text-gray-500 mt-1">{chemicalReductionPercentage.toFixed(1)}% less</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">ROI</span>
            <TrendingDown className="text-purple-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-purple-600">{roi.toFixed(0)}%</p>
          <p className="text-xs text-gray-500 mt-1">Return on investment</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Treatment Area</span>
            <Award className="text-amber-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-amber-600">{treatmentRequired}/{totalZones}</p>
          <p className="text-xs text-gray-500 mt-1">Zones requiring action</p>
        </div>
      </div>

      {/* Cost Comparison */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Cost Comparison</h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Traditional Full-Field Treatment</span>
              <span className="text-sm font-semibold text-gray-900">${fullFieldCost.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Precision Targeted Treatment</span>
              <span className="text-sm font-semibold text-green-600">${precisionCost.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(precisionCost / fullFieldCost * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Environmental Impact</h4>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Leaf className="text-green-600" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">{environmentalImpact}</p>
            <ul className="mt-2 text-xs text-gray-600 space-y-1">
              <li>• Reduced soil contamination</li>
              <li>• Lower water pollution risk</li>
              <li>• Protected beneficial insects</li>
              <li>• Improved soil microbiome health</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-900 mb-1">💡 Smart Farming Advantage</p>
        <p className="text-sm text-blue-800">
          By treating only {((treatmentRequired / totalZones) * 100).toFixed(0)}% of your field, 
          you save ${savings.toFixed(2)} while maintaining crop health. 
          This precision approach pays for itself {roi > 0 ? Math.floor(roi / 100) : 0}x over 
          and supports sustainable agriculture practices.
        </p>
      </div>
    </div>
  );
}
