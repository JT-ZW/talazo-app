'use client';

import { useState, useEffect } from 'react';
import { useAnalysisStore, useFieldsStore } from '@/lib/store';
import { AlertTriangle, TrendingDown, TrendingUp, Droplets, Bug, Leaf, ChevronDown, MapPin, Calendar, FileDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDate, getSeverityColor } from '@/lib/utils';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SkeletonChart, SkeletonCard, SkeletonStats } from '@/components/SkeletonLoader';
import FieldHealthMapOverlay from '@/components/FieldHealthMapOverlay';
import DiseaseVisualization from '@/components/DiseaseVisualization';
import NutrientMapOverlay from '@/components/NutrientMapOverlay';
import WaterStressMapOverlay from '@/components/WaterStressMapOverlay';
import { exportAnalysisPDF } from '@/lib/dataExport';

const FieldMap = dynamic(() => import('@/components/FieldMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />,
});

const COLORS = {
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
};

export default function InsightsPage() {
  const { analyses } = useAnalysisStore();
  const { fields } = useFieldsStore();
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(analyses.length > 0 ? analyses[analyses.length - 1].id : '');
  const [activeView, setActiveView] = useState<'disease' | 'nutrient' | 'water'>('disease');
  const [selectedNutrient, setSelectedNutrient] = useState<'nitrogen' | 'phosphorus' | 'potassium'>('nitrogen');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const selectedAnalysis = analyses.find(a => a.id === selectedAnalysisId);
  const selectedField = selectedAnalysis ? fields.find(f => f.id === selectedAnalysis.fieldId) : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <SkeletonCard />
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
          <p className="text-gray-600 mt-1">View analysis results and trends</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MapPin className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analysis Data</h2>
          <p className="text-gray-600 mb-6">Upload and analyze field images to see insights here</p>
          <Link
            href="/upload"
            className="inline-flex items-center px-6 py-3 bg-[#1E4D2B] text-white rounded-lg hover:bg-[#2d7a45] transition-colors"
          >
            Upload Image
          </Link>
        </div>
      </div>
    );
  }

  const healthData = [
    { name: 'Nitrogen', value: selectedAnalysis?.nutrient.nitrogen || 0, color: COLORS.warning },
    { name: 'Phosphorus', value: selectedAnalysis?.nutrient.phosphorus || 0, color: COLORS.healthy },
    { name: 'Potassium', value: selectedAnalysis?.nutrient.potassium || 0, color: COLORS.critical },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Field Insights</h1>
          <p className="text-gray-600 mt-1">Detailed AI analysis results and recommendations</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Export PDF Button */}
          {selectedAnalysis && selectedField && (
            <button
              onClick={async () => {
                try {
                  await exportAnalysisPDF(selectedAnalysis, selectedField, 'My Farm');
                } catch (error) {
                  console.error('Failed to export PDF:', error);
                  alert('Failed to export PDF. Please try again.');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileDown size={20} />
              Export PDF
            </button>
          )}
          
          {/* Analysis selector */}
          <div className="relative">
            <select
              value={selectedAnalysisId}
              onChange={(e) => setSelectedAnalysisId(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] bg-white"
            >
              {analyses.map((analysis) => {
                const field = fields.find(f => f.id === analysis.fieldId);
                return (
                  <option key={analysis.id} value={analysis.id}>
                    {field?.name} - {formatDate(analysis.timestamp)}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>
      </div>

      {/* Field Info Card */}
      {selectedField && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-2 border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{selectedField.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3 border border-green-200">
                  <Leaf size={20} className="text-green-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-medium">Crop Type</p>
                    <p className="font-bold text-gray-900 capitalize truncate">{selectedField.cropType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <MapPin size={20} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-medium">Field Area</p>
                    <p className="font-bold text-gray-900 truncate">{selectedField.area} hectares</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <Calendar size={20} className="text-purple-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-medium">Planted</p>
                    <p className="font-bold text-gray-900 truncate">{formatDate(selectedField.plantingDate)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wide block mb-2">Overall Health Score</span>
              <div className={`inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full text-2xl sm:text-3xl font-bold shadow-lg ${
                selectedAnalysis && selectedAnalysis.disease.detected
                  ? selectedAnalysis.disease.affectedArea > 50
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                    : selectedAnalysis.disease.affectedArea > 30
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                    : 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white'
                  : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
              }`}>
                {selectedAnalysis 
                  ? selectedAnalysis.disease.detected
                    ? Math.max(0, 100 - Math.round(selectedAnalysis.disease.affectedArea * 1.2))
                    : 100
                  : 0}%
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {selectedAnalysis && selectedAnalysis.disease.detected
                  ? `${selectedAnalysis.disease.affectedArea}% affected`
                  : 'No issues detected'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View Toggles */}
      <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-lg shadow p-2">
        <button
          onClick={() => setActiveView('disease')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-lg font-semibold transition-colors ${
            activeView === 'disease' ? 'bg-[#1E4D2B] text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Bug size={20} className="shrink-0" />
          <span className="text-sm sm:text-base">Disease Detection</span>
        </button>
        <button
          onClick={() => setActiveView('nutrient')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-lg font-semibold transition-colors ${
            activeView === 'nutrient' ? 'bg-[#1E4D2B] text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Leaf size={20} className="shrink-0" />
          <span className="text-sm sm:text-base">Nutrient Analysis</span>
        </button>
        <button
          onClick={() => setActiveView('water')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-lg font-semibold transition-colors ${
            activeView === 'water' ? 'bg-[#1E4D2B] text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Droplets size={20} className="shrink-0" />
          <span className="text-sm sm:text-base">Water Stress</span>
        </button>
      </div>

      {/* Disease View */}
      {activeView === 'disease' && selectedAnalysis && selectedField && (
        <div className="space-y-6">
          {/* Main Disease Card - Clean Layout */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200">
            {/* Header Section */}
            <div className={`p-4 sm:p-6 ${selectedAnalysis.disease.detected ? 'bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-red-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-lg shrink-0 ${selectedAnalysis.disease.detected ? 'bg-red-500' : 'bg-green-500'}`}>
                    {selectedAnalysis.disease.detected ? (
                      <AlertTriangle className="text-white" size={24} />
                    ) : (
                      <Bug className="text-white" size={24} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words">
                      {selectedAnalysis.disease.detected ? selectedAnalysis.disease.type : 'No Disease Detected'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Analysis performed on {formatDate(selectedAnalysis.timestamp)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Field: <strong>{selectedField.name}</strong> • {selectedField.area} hectares
                    </p>
                  </div>
                </div>
                
                {selectedAnalysis.disease.detected && (
                  <div className="text-center sm:text-right">
                    <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">Severity Level</div>
                    <div className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-xl font-bold text-lg sm:text-xl shadow-lg ${
                      selectedAnalysis.disease.severity === 'high' ? 'bg-red-600 text-white' :
                      selectedAnalysis.disease.severity === 'medium' ? 'bg-orange-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      <span className="text-xl sm:text-2xl">
                        {selectedAnalysis.disease.severity === 'high' ? '🔴' : 
                         selectedAnalysis.disease.severity === 'medium' ? '🟠' : '🟡'}
                      </span>
                      <span className="hidden sm:inline">{selectedAnalysis.disease.severity.toUpperCase()}</span>
                      <span className="sm:hidden">{selectedAnalysis.disease.severity.charAt(0).toUpperCase() + selectedAnalysis.disease.severity.slice(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Metrics Section - Clear and Accurate */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedAnalysis.disease.detected ? (
                  <>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 sm:p-6 border-2 border-red-200 shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs sm:text-sm font-bold text-red-700 uppercase tracking-wide">Affected Area</span>
                        <AlertTriangle className="text-red-600 shrink-0" size={18} />
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-2">
                        {selectedAnalysis.disease.affectedArea}%
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-2.5 sm:h-3 mb-2">
                        <div 
                          className="bg-red-600 h-2.5 sm:h-3 rounded-full transition-all shadow-inner"
                          style={{ width: `${selectedAnalysis.disease.affectedArea}%` }}
                        />
                      </div>
                      <p className="text-xs text-red-700">
                        {selectedAnalysis.disease.affectedArea > 50 ? 'Critical spread' : 
                         selectedAnalysis.disease.affectedArea > 30 ? 'Significant impact' : 
                         'Localized infection'}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border-2 border-green-200 shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs sm:text-sm font-bold text-green-700 uppercase tracking-wide">Healthy Area</span>
                        <Leaf className="text-green-600 shrink-0" size={18} />
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                        {100 - selectedAnalysis.disease.affectedArea}%
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2.5 sm:h-3 mb-2">
                        <div 
                          className="bg-green-600 h-2.5 sm:h-3 rounded-full transition-all shadow-inner"
                          style={{ width: `${100 - selectedAnalysis.disease.affectedArea}%` }}
                        />
                      </div>
                      <p className="text-xs text-green-700">
                        {100 - selectedAnalysis.disease.affectedArea > 70 ? 'Majority unaffected' : 
                         100 - selectedAnalysis.disease.affectedArea > 50 ? 'Moderate healthy area' : 
                         'Requires attention'}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border-2 border-blue-200 shadow sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wide">AI Confidence</span>
                        <span className="text-blue-600 font-bold shrink-0">AI</span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                        {selectedAnalysis.disease.confidence}%
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2.5 sm:h-3 mb-2">
                        <div 
                          className="bg-blue-600 h-2.5 sm:h-3 rounded-full transition-all shadow-inner"
                          style={{ width: `${selectedAnalysis.disease.confidence}%` }}
                        />
                      </div>
                      <p className="text-xs text-blue-700">
                        {selectedAnalysis.disease.confidence >= 90 ? 'Very high accuracy' : 
                         selectedAnalysis.disease.confidence >= 75 ? 'High accuracy' : 
                         'Moderate confidence'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 sm:p-8 border-2 border-green-200 shadow text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 shadow-lg">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Field is Healthy!</h3>
                    <p className="text-green-700">
                      No diseases detected in this analysis. Continue regular monitoring and preventive care.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visual Representation */}
          <div className="space-y-6">
            {/* Disease Spread Visualization - Improved */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-gray-200">
              <DiseaseVisualization analysis={selectedAnalysis} fieldName={selectedField.name} />
            </div>

            {/* Field Health Map with Satellite Overlay */}
            <FieldHealthMapOverlay analysis={selectedAnalysis} field={selectedField} />
          </div>

          {/* Action Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recommendations */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                  <Leaf className="text-white" size={18} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Treatment Recommendations</h3>
              </div>
              
              <div className="space-y-3">
                {selectedAnalysis.disease.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                    <div className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>

              {selectedAnalysis.disease.detected && selectedAnalysis.disease.severity === 'high' && (
                <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
                    <div className="min-w-0">
                      <p className="font-bold text-red-900 text-sm">Urgent Action Required</p>
                      <p className="text-red-700 text-xs mt-1">
                        High severity detected. Contact agricultural extension officer if symptoms persist.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Field Details & Map */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Field Location</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
                  <div className="bg-white rounded-lg p-2.5 sm:p-3">
                    <p className="text-gray-600 mb-1 text-xs sm:text-sm">Crop Type</p>
                    <p className="font-bold text-gray-900 capitalize text-sm truncate">{selectedField.cropType}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 sm:p-3">
                    <p className="text-gray-600 mb-1 text-xs sm:text-sm">Field Area</p>
                    <p className="font-bold text-gray-900 text-sm">{selectedField.area} ha</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 sm:p-3 col-span-2">
                    <p className="text-gray-600 mb-1 text-xs sm:text-sm">Planting Date</p>
                    <p className="font-bold text-gray-900 text-sm">{formatDate(selectedField.plantingDate)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 sm:p-4">
                <FieldMap
                  coordinates={selectedField.coordinates}
                  editable={false}
                  height="300px"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nutrient View */}
      {activeView === 'nutrient' && selectedAnalysis && selectedField && (
        <div className="space-y-6">
          {/* Nutrient Heatmap with Tabs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nutrient Distribution Heatmap</h3>
            
            {/* Nutrient Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedNutrient('nitrogen')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedNutrient === 'nitrogen' 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nitrogen (N)
              </button>
              <button
                onClick={() => setSelectedNutrient('phosphorus')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedNutrient === 'phosphorus' 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Phosphorus (P)
              </button>
              <button
                onClick={() => setSelectedNutrient('potassium')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedNutrient === 'potassium' 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Potassium (K)
              </button>
            </div>

            {/* Heatmap Display */}
            <NutrientMapOverlay 
              analysis={selectedAnalysis} 
              field={selectedField}
              nutrientType={selectedNutrient}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nutrient Levels */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nutrient Levels</h3>
            
            <div className="space-y-4">
              {healthData.map((nutrient) => (
                <div key={nutrient.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{nutrient.name}</span>
                    <span className="text-lg font-bold text-gray-900">{nutrient.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${nutrient.value}%`,
                        backgroundColor: nutrient.value > 70 ? COLORS.healthy : nutrient.value > 50 ? COLORS.warning : COLORS.critical
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-900 mb-1">Primary Deficiency</p>
              <p className="text-lg font-bold text-amber-600">{selectedAnalysis.nutrient.primaryDeficiency}</p>
              <p className="text-sm text-amber-700 mt-2">Confidence: {selectedAnalysis.nutrient.confidence}%</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nutrient Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1E4D2B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Treatment Recommendations</h3>
            <ul className="space-y-3">
              {selectedAnalysis.nutrient.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#F6A623] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          </div>
        </div>
      )}

      {/* Water Stress View */}
      {activeView === 'water' && selectedAnalysis && selectedField && (
        <div className="space-y-6">
          {/* Water Stress Heatmap */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Soil Moisture Distribution</h3>
            <WaterStressMapOverlay 
              analysis={selectedAnalysis} 
              field={selectedField}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Water Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Water Stress Analysis</h3>
            
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Status</span>
                <Droplets className="text-blue-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-blue-600 capitalize">
                {selectedAnalysis.water.status.replace('-', ' ')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Soil Moisture</p>
                <p className="text-2xl font-bold text-gray-900">{selectedAnalysis.water.soilMoisture}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-gray-900">{selectedAnalysis.water.confidence}%</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Irrigation Recommendations</h3>
            <ul className="space-y-3">
              {selectedAnalysis.water.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          </div>

          {/* NDVI Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">NDVI Trend</h3>
              <div className="flex items-center">
                {selectedAnalysis.ndvi.trend === 'declining' ? (
                  <>
                    <TrendingDown className="text-red-600 mr-1" size={20} />
                    <span className="text-sm font-semibold text-red-600">Declining</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="text-green-600 mr-1" size={20} />
                    <span className="text-sm font-semibold text-green-600">Improving</span>
                  </>
                )}
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedAnalysis.ndvi.historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#1E4D2B" strokeWidth={2} name="NDVI Value" />
              </LineChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Average</p>
                <p className="text-lg font-bold text-gray-900">{selectedAnalysis.ndvi.average.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Healthy Zone</p>
                <p className="text-lg font-bold text-green-600">{selectedAnalysis.ndvi.healthy.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600">Stress Zone</p>
                <p className="text-lg font-bold text-amber-600">{selectedAnalysis.ndvi.stressed.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
