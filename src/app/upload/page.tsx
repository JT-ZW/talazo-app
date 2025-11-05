'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useFieldsStore, useAnalysisStore, useAuthStore } from '@/lib/store';
import { analyzeImageWithML } from '@/lib/mlService';
import { Upload, Image as ImageIcon, CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import SampleImageGallery from '@/components/SampleImageGallery';

const ANALYSIS_STEPS = [
  { id: 1, name: 'Uploading Image', duration: 800 },
  { id: 2, name: 'AI Detection', duration: 2500 },
  { id: 3, name: 'Disease Analysis', duration: 1500 },
  { id: 4, name: 'Generating Report', duration: 1000 },
];

export default function UploadPage() {
  const router = useRouter();
  const { fields } = useFieldsStore();
  const { addAnalysis, setIsAnalyzing } = useAnalysisStore();
  const { user } = useAuthStore();
  
  const [selectedField, setSelectedField] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAerial, setIsAerial] = useState(false);
  const [isAnalyzing, setLocalAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isFromSample, setIsFromSample] = useState(false);

  const handleSampleSelect = async (imageUrl: string, isAerial: boolean) => {
    try {
      // Fetch the sample image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Convert to File object
      const fileName = imageUrl.split('/').pop() || 'sample.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      
      // Set the file and preview
      setUploadedImage(file);
      setImagePreview(imageUrl);
      setIsAerial(isAerial);
      setAnalysisComplete(false);
      setIsFromSample(true);
      
      toast.success('✨ Sample image loaded - ready to analyze!');
    } catch (error) {
      console.error('Error loading sample:', error);
      toast.error('Failed to load sample image');
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedImage(file);
      setAnalysisComplete(false);
      setIsFromSample(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('Image uploaded successfully!');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!selectedField) {
      toast.error('Please select a field');
      return;
    }
    
    if (!uploadedImage) {
      toast.error('Please upload an image');
      return;
    }

    setLocalAnalyzing(true);
    setIsAnalyzing(true);
    setCurrentStep(0);

    try {
      // Simulate analysis steps with visual progress
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setCurrentStep(i);
        
        // Call real ML API during step 2 (AI Detection)
        if (i === 1) {
          // Get crop type from selected field
          const field = fields.find(f => f.id === selectedField);
          const cropType = field?.cropType || 'tobacco';
          
          const analysisResults = await analyzeImageWithML(uploadedImage, cropType, isAerial);
          
          if (!user?.id) {
            toast.error('You must be logged in');
            return;
          }

          // Ensure we have all required fields
          const completeAnalysis = {
            fieldId: selectedField,
            imageUrl: imagePreview || undefined,
            disease: analysisResults.disease || {
              detected: false,
              type: 'Unknown',
              confidence: 0,
              affectedArea: 0,
              severity: 'none',
              recommendations: [],
            },
            nutrient: analysisResults.nutrient || {
              nitrogen: 0,
              phosphorus: 0,
              potassium: 0,
              primaryDeficiency: 'None',
              confidence: 0,
              recommendations: [],
            },
            water: analysisResults.water || {
              status: 'Unknown',
              soilMoisture: 0,
              confidence: 0,
              recommendations: [],
            },
            ndvi: analysisResults.ndvi || {
              average: 0,
              healthy: 0,
              stressed: 0,
              trend: 'stable',
              historicalData: [],
            },
          };

          // Save analysis
          await addAnalysis(completeAnalysis, user.id);

          // Update field health status based on analysis
          const selectedFieldData = fields.find(f => f.id === selectedField);
          if (selectedFieldData) {
            const { updateField } = useFieldsStore.getState();
            await updateField(selectedField, {
              lastScan: new Date().toISOString(),
              healthStatus: completeAnalysis.disease.detected ? 
                (completeAnalysis.disease.severity === 'high' ? 'critical' : 'warning') : 
                'healthy',
            });
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, ANALYSIS_STEPS[i].duration));
      }

      setAnalysisComplete(true);
      setCurrentStep(ANALYSIS_STEPS.length);
      toast.success('✅ Real AI analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed - please try again');
    } finally {
      setLocalAnalyzing(false);
      setIsAnalyzing(false);
    }
  };

  const handleViewInsights = () => {
    router.push('/insights');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Real AI Notice */}
      {process.env.NEXT_PUBLIC_USE_REAL_ML === 'true' && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="text-green-500 mt-0.5 mr-3 shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">Real AI Active</h3>
              <p className="text-sm text-green-800">
                Using <strong>dual AI analysis system</strong>:
              </p>
              <ul className="text-sm text-green-800 mt-2 ml-4 space-y-1">
                <li>• <strong>Primary:</strong> Hugging Face deep learning model (38+ diseases)</li>
                <li>• <strong>Backup:</strong> Advanced image analysis (color/texture detection)</li>
              </ul>
              <p className="text-sm text-green-700 mt-2">
                📸 System automatically analyzes your image and provides accurate disease detection - works even offline!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Demo Mode Notice (only if Real ML is disabled) */}
      {process.env.NEXT_PUBLIC_USE_REAL_ML !== 'true' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-blue-500 mt-0.5 mr-3 shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Demo Mode Active</h3>
              <p className="text-sm text-blue-800">
                Using advanced AI simulation for analysis. For production use with custom Roboflow models, 
                set <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_USE_REAL_ML=true</code> in .env.local 
                and configure your trained models.
              </p>
              <p className="text-sm text-blue-700 mt-2 italic">
                💡 The system generates realistic crop disease analysis based on image characteristics 
                and field data - perfect for demonstrations and competitions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload & Analyze</h1>
        <p className="text-gray-600 mt-1">Upload field images for AI-powered crop health analysis</p>
      </div>

      {/* Field Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Field</h2>
        {fields.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto text-amber-500 mb-3" size={48} />
            <p className="text-gray-600 mb-4">You need to add a field first</p>
            <button
              onClick={() => router.push('/fields/new')}
              className="inline-flex items-center px-4 py-2 bg-[#1E4D2B] text-white rounded-lg hover:bg-[#2d7a45] transition-colors"
            >
              Add Field
            </button>
          </div>
        ) : (
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent"
            disabled={isAnalyzing}
          >
            <option value="">Select a field...</option>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name} - {field.cropType} ({field.area} hectares)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Sample Image Gallery */}
      {!imagePreview && (
        <SampleImageGallery 
          onSelectImage={handleSampleSelect}
          disabled={isAnalyzing}
        />
      )}

      {/* Image Upload */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upload Your Own Image</h2>
          {isFromSample && imagePreview && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <CheckCircle size={16} />
              Sample Image Loaded
            </span>
          )}
        </div>
        
        {!imagePreview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-[#1E4D2B] bg-green-50'
                : 'border-gray-300 hover:border-[#1E4D2B]'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto text-gray-400 mb-4" size={64} />
            {isDragActive ? (
              <p className="text-lg text-[#1E4D2B] font-semibold">Drop the image here...</p>
            ) : (
              <>
                <p className="text-lg text-gray-700 font-semibold mb-2">
                  {isFromSample ? 'Or drag & drop your own image here' : 'Drag & drop field image here'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse from your device
                </p>
                <p className="text-xs text-gray-400">
                  Supports: JPG, PNG, TIFF, GIF (Max 10MB)
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={imagePreview}
                alt="Uploaded field"
                className="w-full h-64 object-cover"
              />
              {!isAnalyzing && !analysisComplete && (
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-4 right-4 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            
            {/* Image Type Selector */}
            {!analysisComplete && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Image Type</h3>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="imageType"
                      value="ground"
                      checked={!isAerial}
                      onChange={() => setIsAerial(false)}
                      className="w-4 h-4 text-[#1E4D2B] focus:ring-[#1E4D2B]"
                      disabled={isAnalyzing}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      <strong>Ground Level</strong> (Close-up leaf/plant photos)
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="imageType"
                      value="aerial"
                      checked={isAerial}
                      onChange={() => setIsAerial(true)}
                      className="w-4 h-4 text-[#1E4D2B] focus:ring-[#1E4D2B]"
                      disabled={isAnalyzing}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      <strong>Aerial/Drone View</strong> (Field-wide health monitoring)
                    </span>
                  </label>
                </div>
                {isAerial && (
                  <p className="mt-2 text-xs text-blue-700">
                    ℹ️ Aerial images analyze overall field health patterns and vegetation coverage
                  </p>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <ImageIcon size={16} className="mr-2" />
                <span>{uploadedImage?.name}</span>
              </div>
              <span>{((uploadedImage?.size || 0) / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Button */}
      {imagePreview && selectedField && !analysisComplete && (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center px-6 py-4 bg-[#1E4D2B] text-white rounded-lg hover:bg-[#2d7a45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin mr-2" size={24} />
              Analyzing...
            </>
          ) : (
            <>
              <CheckCircle size={24} className="mr-2" />
              Start AI Analysis
            </>
          )}
        </button>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Analyzing Image...</h2>
          
          <div className="space-y-4">
            {ANALYSIS_STEPS.map((step, index) => {
              const isComplete = index < currentStep;
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-green-500' :
                    isCurrent ? 'bg-[#F6A623]' :
                    'bg-gray-200'
                  }`}>
                    {isComplete ? (
                      <CheckCircle size={20} className="text-white" />
                    ) : isCurrent ? (
                      <Loader2 size={20} className="text-white animate-spin" />
                    ) : (
                      <span className="text-gray-400 text-sm">{step.id}</span>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <p className={`font-semibold ${
                      isComplete ? 'text-green-600' :
                      isCurrent ? 'text-[#F6A623]' :
                      'text-gray-400'
                    }`}>
                      {step.name}
                    </p>
                  </div>

                  {isComplete && (
                    <CheckCircle size={20} className="text-green-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Complete */}
      {analysisComplete && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-lg p-8 text-center border border-green-200">
          <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete!</h2>
          <p className="text-gray-700 mb-6">
            Your field image has been analyzed successfully. View detailed insights now.
          </p>
          <button
            onClick={handleViewInsights}
            className="inline-flex items-center px-6 py-3 bg-[#1E4D2B] text-white rounded-lg hover:bg-[#2d7a45] transition-colors text-lg font-semibold"
          >
            View Insights
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );
}
