'use client';

import { useAuthStore, useFieldsStore, useAnalysisStore } from '@/lib/store';
import { MapPin, TrendingUp, AlertTriangle, Plus, Upload, FileText } from 'lucide-react';
import Link from 'next/link';
import { formatDate, calculateDaysSince, getHealthStatusColor } from '@/lib/utils';
import { SkeletonStats, SkeletonCard } from '@/components/SkeletonLoader';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { fields } = useFieldsStore();
  const { analyses } = useAnalysisStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const totalFields = fields.length;
  const healthyFields = fields.filter(f => f.healthStatus === 'healthy').length;
  const warningFields = fields.filter(f => f.healthStatus === 'warning').length;
  const criticalFields = fields.filter(f => f.healthStatus === 'critical').length;
  const totalScans = analyses.length;

  const recentAnalysis = analyses.length > 0 ? analyses[analyses.length - 1] : null;
  const lastScanDate = recentAnalysis ? formatDate(recentAnalysis.timestamp) : 'No scans yet';

  const recentFields = fields.slice(-3).reverse();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <SkeletonStats />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your crops today
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Fields */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fields</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalFields}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {healthyFields} healthy, {warningFields} warning
          </p>
        </div>

        {/* Total Scans */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Scans</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalScans}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Last scan: {lastScanDate}</p>
        </div>

        {/* Issues Detected */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Issues Detected</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{criticalFields + warningFields}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-amber-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {criticalFields} critical, {warningFields} warnings
          </p>
        </div>

        {/* Health Score */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalFields > 0 ? Math.round((healthyFields / totalFields) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4">+5% from last week</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/fields"
          className="bg-gradient-to-br from-[#1E4D2B] to-[#2d7a45] text-white rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="font-semibold">Add New Field</h3>
              <p className="text-sm text-green-100">Register a new field</p>
            </div>
          </div>
        </Link>

        <Link
          href="/upload"
          className="bg-gradient-to-br from-[#F6A623] to-[#e09616] text-white rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-semibold">Upload Image</h3>
              <p className="text-sm text-amber-100">Analyze crop health</p>
            </div>
          </div>
        </Link>

        <Link
          href="/reports"
          className="bg-gradient-to-br from-[#4A5568] to-[#2d3748] text-white rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-semibold">View Reports</h3>
              <p className="text-sm text-gray-100">Access all reports</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent fields */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Fields</h2>
        </div>
        <div className="p-6">
          {recentFields.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No fields yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first field</p>
              <Link
                href="/fields"
                className="inline-flex items-center px-4 py-2 bg-[#1E4D2B] text-white rounded-lg hover:bg-[#2d7a45] transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add Field
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#1E4D2B] transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{field.name}</h3>
                      <p className="text-sm text-gray-600">
                        {field.cropType.charAt(0).toUpperCase() + field.cropType.slice(1)} • {field.area} hectares
                      </p>
                      {field.lastScan && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last scanned {calculateDaysSince(field.lastScan)} days ago
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {field.healthStatus && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(field.healthStatus)}`}>
                        {field.healthStatus.charAt(0).toUpperCase() + field.healthStatus.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
