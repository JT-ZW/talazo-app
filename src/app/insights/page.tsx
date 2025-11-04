'use client';

import { useState, useEffect } from 'react';
import { useAnalysisStore, useFieldsStore } from '@/lib/store';
import { AlertTriangle, TrendingDown, TrendingUp, Droplets, Bug, Leaf, ChevronDown, MapPin, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDate, getSeverityColor } from '@/lib/utils';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SkeletonChart, SkeletonCard, SkeletonStats } from '@/components/SkeletonLoader';
import FieldHealthHeatmap from '@/components/FieldHealthHeatmap';
import DiseaseVisualization from '@/components/DiseaseVisualization';

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

      {/* Field Info Card */}
      {selectedField && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedField.name}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Leaf size={16} className="mr-1 text-green-600" />
                  {selectedField.cropType.charAt(0).toUpperCase() + selectedField.cropType.slice(1)}
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1 text-blue-600" />
                  {selectedField.area} hectares
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1 text-purple-600" />
                  Planted: {formatDate(selectedField.plantingDate)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600">Overall Health</span>
              <p className="text-3xl font-bold text-green-600">
                {selectedAnalysis ? Math.round(((selectedAnalysis.nutrient.nitrogen + selectedAnalysis.nutrient.phosphorus + selectedAnalysis.nutrient.potassium) / 3)) : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View Toggles */}
      <div className="flex gap-2 bg-white rounded-lg shadow p-2">
        <button
          onClick={() => setActiveView('disease')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
            activeView === 'disease' ? 'bg-[#1E4D2B] text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Bug size={20} />
          Disease Detection
        </button>
        <button
          onClick={() => setActiveView('nutrient')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
            activeView === 'nutrient' ? 'bg-[#1E4D2B] text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Leaf size={20} />
          Nutrient Analysis
        </button>
        <button
          onClick={() => setActiveView('water')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
            activeView === 'water' ? 'bg-[#1E4D2B] text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Droplets size={20} />
          Water Stress
        </button>
      </div>

      {/* Disease View */}
      {activeView === 'disease' && selectedAnalysis && selectedField && (
        <div className="space-y-6">
          {/* Visual Health Heatmap */}
          <FieldHealthHeatmap analysis={selectedAnalysis} field={selectedField} />
          
          {/* Disease Impact Visualization */}
          <DiseaseVisualization analysis={selectedAnalysis} fieldName={selectedField.name} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detection Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Disease Detection Summary</h3>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${selectedAnalysis.disease.detected ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Status</span>
                  {selectedAnalysis.disease.detected ? (
                    <AlertTriangle className="text-amber-600" size={24} />
                  ) : (
                    <Bug className="text-green-600" size={24} />
                  )}
                </div>
                <p className={`text-2xl font-bold ${selectedAnalysis.disease.detected ? 'text-amber-600' : 'text-green-600'}`}>
                  {selectedAnalysis.disease.detected ? selectedAnalysis.disease.type : 'No Issues Detected'}
                </p>
              </div>

              {selectedAnalysis.disease.detected && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Confidence</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedAnalysis.disease.confidence}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Affected Area</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedAnalysis.disease.affectedArea}%</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Severity</p>
                    <p className={`text-lg font-bold ${getSeverityColor(selectedAnalysis.disease.severity)}`}>
                      {selectedAnalysis.disease.severity.toUpperCase()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h3>
            <ul className="space-y-3">
              {selectedAnalysis.disease.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#1E4D2B] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Field Map */}
          {selectedField && (
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Field Location</h3>
              <FieldMap
                coordinates={selectedField.coordinates}
                editable={false}
                height="400px"
              />
            </div>
          )}
          </div>
        </div>
      )}

      {/* Nutrient View */}
      {activeView === 'nutrient' && selectedAnalysis && (
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
      )}

      {/* Water Stress View */}
      {activeView === 'water' && selectedAnalysis && (
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

          {/* NDVI Trend */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
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
