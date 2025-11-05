'use client';

import { useState } from 'react';
import { Image as ImageIcon, CheckCircle, Sparkles } from 'lucide-react';

interface SampleImage {
  id: string;
  name: string;
  path: string;
  description: string;
  cropType: string;
  condition: 'healthy' | 'diseased' | 'deficient';
}

const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-1',
    name: 'Diseased Tobacco Leaf',
    path: '/sample_image1.jpg',
    description: 'Tobacco plant showing disease symptoms - ideal for testing disease detection',
    cropType: 'Tobacco',
    condition: 'diseased',
  },
  {
    id: 'sample-2',
    name: 'Crop Field Analysis',
    path: '/sample-image-2.jpg',
    description: 'Field crop showing various health patterns',
    cropType: 'Maize',
    condition: 'diseased',
  },
  {
    id: 'sample-3',
    name: 'Plant Health Assessment',
    path: '/sample-image-3.jpg',
    description: 'Plant sample for comprehensive health analysis',
    cropType: 'Tomato',
    condition: 'diseased',
  },
  {
    id: 'aerial-1',
    name: 'Aerial Field View',
    path: '/aerial-view-1.jpeg',
    description: 'Drone/aerial view of crop field - tests field-wide health monitoring',
    cropType: 'Wheat',
    condition: 'healthy',
  },
];

interface SampleImageGalleryProps {
  onSelectImage: (imageUrl: string, isAerial: boolean) => void;
  disabled?: boolean;
}

export default function SampleImageGallery({ onSelectImage, disabled = false }: SampleImageGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = async (sample: SampleImage) => {
    if (disabled) return;
    
    setSelectedId(sample.id);
    
    // Fetch the image and convert to File object
    try {
      const response = await fetch(sample.path);
      const blob = await response.blob();
      
      // Determine if it's an aerial image
      const isAerial = sample.id.startsWith('aerial');
      
      // Pass the image URL to parent (for preview) and aerial flag
      onSelectImage(sample.path, isAerial);
      
      // Reset selection after a moment
      setTimeout(() => setSelectedId(null), 500);
    } catch (error) {
      console.error('Error loading sample image:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
          <Sparkles className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Quick Start with Sample Images</h3>
          <p className="text-sm text-gray-600">
            Click any image below to test the AI analysis instantly - no upload needed!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {SAMPLE_IMAGES.map((sample) => (
          <button
            key={sample.id}
            onClick={() => handleSelect(sample)}
            disabled={disabled}
            className={`group relative bg-white rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg hover:scale-105 ${
              selectedId === sample.id
                ? 'border-green-500 ring-2 ring-green-200'
                : 'border-gray-200 hover:border-green-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {/* Image */}
            <div className="aspect-square relative overflow-hidden bg-gray-100">
              <img
                src={sample.path}
                alt={sample.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-medium">{sample.description}</p>
                </div>
              </div>

              {/* Selected indicator */}
              {selectedId === sample.id && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="text-white" size={20} />
                </div>
              )}

              {/* Condition badge */}
              <div className="absolute top-2 left-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                  sample.condition === 'healthy'
                    ? 'bg-green-500 text-white'
                    : sample.condition === 'diseased'
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {sample.condition === 'healthy' && '✓ Healthy'}
                  {sample.condition === 'diseased' && '⚠ Diseased'}
                  {sample.condition === 'deficient' && '⚠ Deficient'}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-start gap-2 mb-1">
                <ImageIcon size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                  {sample.name}
                </h4>
              </div>
              <p className="text-xs text-gray-600">
                Crop: <span className="font-medium text-green-700">{sample.cropType}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {sample.id.startsWith('aerial') ? '📸 Aerial View' : '🌱 Ground Level'}
              </p>
            </div>

            {/* Click to analyze button overlay */}
            <div className="absolute inset-0 bg-green-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-center">
                <CheckCircle className="mx-auto text-white mb-2" size={32} />
                <p className="text-white font-bold text-sm">Click to Analyze</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 bg-white rounded-lg p-3 border border-green-200">
        <p className="text-xs text-gray-600 flex items-start gap-2">
          <span className="text-green-600 font-bold shrink-0">💡 Tip:</span>
          <span>
            These sample images demonstrate the AI's capability to detect diseases, assess nutrient levels, 
            and analyze crop health across different conditions and imaging types (ground-level and aerial).
          </span>
        </p>
      </div>
    </div>
  );
}
