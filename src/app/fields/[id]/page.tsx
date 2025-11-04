'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFieldsStore } from '@/lib/store';
import { zimbabweanCrops } from '@/lib/mockData';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const FieldMap = dynamic(() => import('@/components/FieldMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function EditFieldPage() {
  const router = useRouter();
  const params = useParams();
  const fieldId = params.id as string;
  const { fields, updateField } = useFieldsStore();
  
  const [field, setField] = useState(fields.find(f => f.id === fieldId));
  const [formData, setFormData] = useState({
    name: field?.name || '',
    cropType: field?.cropType || 'maize',
    area: field?.area.toString() || '',
    plantingDate: field?.plantingDate.split('T')[0] || new Date().toISOString().split('T')[0],
    notes: field?.notes || '',
  });
  
  const [coordinates, setCoordinates] = useState<number[][]>(field?.coordinates || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentField = fields.find(f => f.id === fieldId);
    if (!currentField) {
      toast.error('Field not found');
      router.push('/fields');
      return;
    }
    setField(currentField);
    setFormData({
      name: currentField.name,
      cropType: currentField.cropType,
      area: currentField.area.toString(),
      plantingDate: currentField.plantingDate.split('T')[0],
      notes: currentField.notes || '',
    });
    setCoordinates(currentField.coordinates);
  }, [fieldId, fields, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCoordinatesChange = (newCoordinates: number[][]) => {
    setCoordinates(newCoordinates);
    
    if (newCoordinates.length >= 3) {
      const area = Math.abs(
        newCoordinates.reduce((sum, coord, i) => {
          const next = newCoordinates[(i + 1) % newCoordinates.length];
          return sum + (coord[0] * next[1] - next[0] * coord[1]);
        }, 0) / 2
      );
      
      const hectares = Math.round(area * 12321 * 100 * 10) / 10;
      setFormData(prev => ({ ...prev, area: hectares.toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a field name');
      return;
    }
    
    if (!formData.area || parseFloat(formData.area) <= 0) {
      toast.error('Please enter a valid area');
      return;
    }
    
    if (coordinates.length < 3) {
      toast.error('Please draw the field boundary on the map');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateField(fieldId, {
        name: formData.name,
        cropType: formData.cropType,
        area: parseFloat(formData.area),
        plantingDate: formData.plantingDate,
        coordinates,
        notes: formData.notes,
      });

      toast.success('Field updated successfully!');
      router.push('/fields');
    } catch (error) {
      toast.error('Failed to update field');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!field) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Loading field...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fields"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Field</h1>
          <p className="text-gray-600 mt-1">Update field information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., North Maize Field"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crop Type <span className="text-red-500">*</span>
              </label>
              <select
                name="cropType"
                value={formData.cropType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent"
                required
              >
                {zimbabweanCrops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name} ({crop.season})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area (hectares) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="e.g., 25"
                step="0.1"
                min="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planting Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="plantingDate"
                value={formData.plantingDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Add any additional information about this field..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Field Location</h2>
              <p className="text-sm text-gray-600">Update the field boundary on the map</p>
            </div>
            {coordinates.length >= 3 && (
              <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                <MapPin size={16} className="mr-2" />
                <span className="text-sm font-medium">Boundary marked</span>
              </div>
            )}
          </div>
          
          <FieldMap
            coordinates={coordinates}
            onCoordinatesChange={handleCoordinatesChange}
            editable={true}
            height="500px"
          />
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/fields"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-[#1E4D2B] text-white rounded-lg hover:bg-[#2d7a45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Update Field
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
