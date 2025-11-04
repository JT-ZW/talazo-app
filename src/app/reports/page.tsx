'use client';

import { useState, useEffect } from 'react';
import { useAnalysisStore, useFieldsStore } from '@/lib/store';
import { FileText, Download, Eye, Search, Calendar, MapPin, TrendingUp, Filter } from 'lucide-react';
import { formatDate, formatDateTime, getHealthStatusColor } from '@/lib/utils';
import Link from 'next/link';
import { SkeletonTable, SkeletonCard } from '@/components/SkeletonLoader';

export default function ReportsPage() {
  const { analyses } = useAnalysisStore();
  const { fields } = useFieldsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  // Filter analyses
  const filteredAnalyses = analyses.filter(analysis => {
    const field = fields.find(f => f.id === analysis.fieldId);
    const matchesSearch = field?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesField = filterField === 'all' || analysis.fieldId === filterField;
    
    let matchesStatus = true;
    if (filterStatus === 'healthy') {
      matchesStatus = !analysis.disease.detected;
    } else if (filterStatus === 'warning') {
      matchesStatus = analysis.disease.detected && analysis.disease.severity !== 'high';
    } else if (filterStatus === 'critical') {
      matchesStatus = analysis.disease.detected && analysis.disease.severity === 'high';
    }

    return matchesSearch && matchesField && matchesStatus;
  });

  // Sort by most recent
  const sortedAnalyses = [...filteredAnalyses].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getStatusBadge = (analysis: typeof analyses[0]) => {
    if (!analysis.disease.detected) return 'healthy';
    if (analysis.disease.severity === 'high') return 'critical';
    return 'warning';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-9 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
        </div>
        <SkeletonCard />
        <SkeletonTable rows={6} />
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download field analysis reports</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Reports Available</h2>
          <p className="text-gray-600 mb-6">Upload and analyze field images to generate reports</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis Reports</h1>
          <p className="text-gray-600 mt-1">View and download detailed field analysis reports</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by field name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent"
            />
          </div>

          {/* Field Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent appearance-none"
            >
              <option value="all">All Fields</option>
              {fields.map(field => (
                <option key={field.id} value={field.id}>{field.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analyses.length}</p>
            </div>
            <FileText className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Healthy</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {analyses.filter(a => !a.disease.detected).length}
              </p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {analyses.filter(a => a.disease.detected && a.disease.severity !== 'high').length}
              </p>
            </div>
            <FileText className="text-amber-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {analyses.filter(a => a.disease.detected && a.disease.severity === 'high').length}
              </p>
            </div>
            <FileText className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field / Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues Detected
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAnalyses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No reports match your filters
                  </td>
                </tr>
              ) : (
                sortedAnalyses.map((analysis) => {
                  const field = fields.find(f => f.id === analysis.fieldId);
                  const status = getStatusBadge(analysis);
                  const healthScore = Math.round(
                    (analysis.nutrient.nitrogen + analysis.nutrient.phosphorus + analysis.nutrient.potassium) / 3
                  );

                  return (
                    <tr key={analysis.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MapPin className="text-gray-400 mr-2" size={20} />
                          <div>
                            <p className="font-semibold text-gray-900">{field?.name}</p>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <Calendar size={14} className="mr-1" />
                              {formatDateTime(analysis.timestamp)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getHealthStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {analysis.disease.detected ? (
                            <>
                              <p className="font-semibold text-gray-900">{analysis.disease.type}</p>
                              <p className="text-gray-500">Affected: {analysis.disease.affectedArea}%</p>
                            </>
                          ) : (
                            <p className="text-green-600 font-semibold">No issues detected</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${healthScore}%`,
                                backgroundColor: healthScore > 70 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{healthScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/reports/${analysis.id}`}
                            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            <Eye size={16} className="mr-1" />
                            View
                          </Link>
                          <button
                            onClick={() => {
                              // We'll implement this in the detail page
                              window.location.href = `/reports/${analysis.id}?download=true`;
                            }}
                            className="inline-flex items-center px-3 py-2 bg-[#1E4D2B] text-white rounded-lg hover:bg-[#2d7a45] transition-colors text-sm font-medium"
                          >
                            <Download size={16} className="mr-1" />
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
