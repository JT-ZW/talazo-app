'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFieldsStore } from '@/lib/store';
import { Plus, MapPin, Edit, Trash2, Calendar, Sprout } from 'lucide-react';
import { formatDate, calculateDaysSince, getHealthStatusColor } from '@/lib/utils';
import { zimbabweanCrops } from '@/lib/mockData';
import toast from 'react-hot-toast';
import { SkeletonList, SkeletonCard } from '@/components/SkeletonLoader';

export default function FieldsPage() {
  const { fields, deleteField } = useFieldsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredFields = fields.filter(field =>
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.cropType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteField(id);
      toast.success(`${name} has been deleted`);
    }
  };

  const getCropInfo = (cropType: string) => {
    return zimbabweanCrops.find(c => c.id === cropType);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-9 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <SkeletonCard />
        <SkeletonList items={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Fields</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all your agricultural fields</p>
        </div>
        <Link
          href="/fields/new"
          className="inline-flex items-center px-4 py-2 bg-[#1E4D2B] text-white rounded-lg hover:bg-[#2d7a45] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add New Field
        </Link>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search fields by name or crop type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent"
        />
      </div>

      {/* Fields grid */}
      {filteredFields.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MapPin className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {fields.length === 0 ? 'No fields yet' : 'No fields found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {fields.length === 0
              ? 'Start by adding your first field to begin monitoring'
              : 'Try adjusting your search terms'}
          </p>
          {fields.length === 0 && (
            <Link
              href="/fields/new"
              className="inline-flex items-center px-6 py-3 bg-[#1E4D2B] text-white rounded-lg hover:bg-[#2d7a45] transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Your First Field
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => {
            const cropInfo = getCropInfo(field.cropType);
            return (
              <div
                key={field.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Field image placeholder */}
                <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <MapPin size={48} className="text-white opacity-80" />
                  </div>
                  {field.healthStatus && (
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getHealthStatusColor(
                          field.healthStatus
                        )}`}
                      >
                        {field.healthStatus.charAt(0).toUpperCase() + field.healthStatus.slice(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Field info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{field.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Sprout size={16} className="mr-2 text-green-600" />
                      <span className="font-medium">{cropInfo?.name || field.cropType}</span>
                      <span className="mx-2">•</span>
                      <span>{field.area} hectares</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2 text-blue-600" />
                      <span>Planted: {formatDate(field.plantingDate)}</span>
                    </div>

                    {field.lastScan && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2 text-purple-600" />
                        <span>Last scanned {calculateDaysSince(field.lastScan)} days ago</span>
                      </div>
                    )}
                  </div>

                  {field.notes && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{field.notes}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/fields/${field.id}`}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(field.id, field.name)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary stats */}
      {fields.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Summary Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Fields</p>
              <p className="text-2xl font-bold text-gray-900">{fields.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Area</p>
              <p className="text-2xl font-bold text-gray-900">
                {fields.reduce((sum, f) => sum + f.area, 0)} ha
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Healthy Fields</p>
              <p className="text-2xl font-bold text-green-600">
                {fields.filter(f => f.healthStatus === 'healthy').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Need Attention</p>
              <p className="text-2xl font-bold text-amber-600">
                {fields.filter(f => f.healthStatus === 'warning' || f.healthStatus === 'critical').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
