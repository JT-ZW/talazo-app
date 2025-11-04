'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAnalysisStore, useFieldsStore } from '@/lib/store';
import { ArrowLeft, Download, Printer, Share2, Calendar, MapPin, Leaf, AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Bug, Droplets } from 'lucide-react';
import { formatDateTime, getSeverityColor, getHealthStatusColor } from '@/lib/utils';
import Link from 'next/link';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const { analyses } = useAnalysisStore();
  const { fields } = useFieldsStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const analysis = analyses.find(a => a.id === reportId);
  const field = analysis ? fields.find(f => f.id === analysis.fieldId) : null;

  useEffect(() => {
    if (!analysis) {
      toast.error('Report not found');
      router.push('/reports');
    }
  }, [analysis, router]);

  const generatePDF = async () => {
    if (!analysis || !field) return;

    setIsGenerating(true);
    toast.loading('Generating PDF...', { id: 'pdf' });

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Header
      doc.setFillColor(30, 77, 43); // #1E4D2B
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('TALAZO AGRITECH', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Crop Health Analysis Report', pageWidth / 2, 30, { align: 'center' });

      yPos = 55;
      doc.setTextColor(0, 0, 0);

      // Field Information
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Field Information', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Field Name: ${field.name}`, 20, yPos);
      yPos += 7;
      doc.text(`Crop Type: ${field.cropType.charAt(0).toUpperCase() + field.cropType.slice(1)}`, 20, yPos);
      yPos += 7;
      doc.text(`Area: ${field.area} hectares`, 20, yPos);
      yPos += 7;
      doc.text(`Analysis Date: ${formatDateTime(analysis.timestamp)}`, 20, yPos);
      yPos += 15;

      // Overall Health Score
      const healthScore = Math.round(
        (analysis.nutrient.nitrogen + analysis.nutrient.phosphorus + analysis.nutrient.potassium) / 3
      );
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Health Score', 20, yPos);
      yPos += 10;

      doc.setFontSize(32);
      if (healthScore > 70) {
        doc.setTextColor(16, 185, 129); // green
      } else if (healthScore > 50) {
        doc.setTextColor(245, 158, 11); // amber
      } else {
        doc.setTextColor(239, 68, 68); // red
      }
      doc.text(`${healthScore}%`, 20, yPos);
      yPos += 15;

      doc.setTextColor(0, 0, 0);

      // Disease Detection
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Disease Detection', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      if (analysis.disease.detected) {
        doc.text(`Status: ${analysis.disease.type}`, 20, yPos);
        yPos += 7;
        doc.text(`Severity: ${analysis.disease.severity.toUpperCase()}`, 20, yPos);
        yPos += 7;
        doc.text(`Confidence: ${analysis.disease.confidence}%`, 20, yPos);
        yPos += 7;
        doc.text(`Affected Area: ${analysis.disease.affectedArea}%`, 20, yPos);
        yPos += 10;

        doc.setFont('helvetica', 'bold');
        doc.text('Recommendations:', 20, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        analysis.disease.recommendations.forEach((rec, index) => {
          const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 2;
        });
      } else {
        doc.text('Status: No diseases detected', 20, yPos);
        yPos += 7;
        doc.setTextColor(16, 185, 129);
        doc.text('Field is healthy!', 20, yPos);
        doc.setTextColor(0, 0, 0);
      }
      yPos += 10;

      // Check if we need a new page
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      // Nutrient Analysis
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Nutrient Analysis', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nitrogen (N): ${analysis.nutrient.nitrogen}%`, 20, yPos);
      yPos += 7;
      doc.text(`Phosphorus (P): ${analysis.nutrient.phosphorus}%`, 20, yPos);
      yPos += 7;
      doc.text(`Potassium (K): ${analysis.nutrient.potassium}%`, 20, yPos);
      yPos += 7;
      doc.text(`Primary Deficiency: ${analysis.nutrient.primaryDeficiency}`, 20, yPos);
      yPos += 7;
      doc.text(`Confidence: ${analysis.nutrient.confidence}%`, 20, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Treatment Recommendations:', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      analysis.nutrient.recommendations.forEach((rec, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
        doc.text(lines, 20, yPos);
        yPos += lines.length * 5 + 2;
      });
      yPos += 10;

      // Water Stress
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Water Stress Analysis', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Status: ${analysis.water.status.replace('-', ' ').toUpperCase()}`, 20, yPos);
      yPos += 7;
      doc.text(`Soil Moisture: ${analysis.water.soilMoisture}%`, 20, yPos);
      yPos += 7;
      doc.text(`Confidence: ${analysis.water.confidence}%`, 20, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Irrigation Recommendations:', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      analysis.water.recommendations.forEach((rec, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
        doc.text(lines, 20, yPos);
        yPos += lines.length * 5 + 2;
      });
      yPos += 10;

      // NDVI Trend
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('NDVI Trend Analysis', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Average NDVI: ${analysis.ndvi.average.toFixed(2)}`, 20, yPos);
      yPos += 7;
      doc.text(`Healthy Threshold: ${analysis.ndvi.healthy.toFixed(2)}`, 20, yPos);
      yPos += 7;
      doc.text(`Stress Threshold: ${analysis.ndvi.stressed.toFixed(2)}`, 20, yPos);
      yPos += 7;
      doc.text(`Trend: ${analysis.ndvi.trend.toUpperCase()}`, 20, yPos);

      // Footer
      const footerY = pageHeight - 20;
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text('Generated by Talazo Agritech - Precision Agriculture for Zimbabwe', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Report ID: ${analysis.id}`, pageWidth / 2, footerY + 5, { align: 'center' });

      // Save the PDF
      doc.save(`talazo-report-${field.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF generated successfully!', { id: 'pdf' });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: 'pdf' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Analysis Report - ${field?.name}`,
          text: `Crop health analysis report for ${field?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        toast.error('Failed to share');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Report link copied to clipboard!');
    }
  };

  if (!analysis || !field) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading report...</p>
      </div>
    );
  }

  const healthScore = Math.round(
    (analysis.nutrient.nitrogen + analysis.nutrient.phosphorus + analysis.nutrient.potassium) / 3
  );

  const status = analysis.disease.detected
    ? analysis.disease.severity === 'high'
      ? 'critical'
      : 'warning'
    : 'healthy';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/reports"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Reports
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 size={18} className="mr-2" />
            Share
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer size={18} className="mr-2" />
            Print
          </button>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center px-4 py-2 bg-[#1E4D2B] text-white rounded-lg hover:bg-[#2d7a45] transition-colors disabled:opacity-50"
          >
            <Download size={18} className="mr-2" />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none">
        {/* Report Header */}
        <div className="bg-gradient-to-r from-[#1E4D2B] to-[#2d7a45] text-white p-8 print:bg-[#1E4D2B]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Crop Health Analysis Report</h1>
              <p className="text-green-100">Talazo Agritech - Precision Agriculture</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100">Report ID</p>
              <p className="font-mono text-sm">{analysis.id.slice(0, 12)}</p>
            </div>
          </div>
        </div>

        {/* Report Body */}
        <div className="p-8 space-y-8">
          {/* Field Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="mr-2 text-[#1E4D2B]" size={24} />
              Field Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Field Name</p>
                <p className="font-semibold text-gray-900">{field.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Crop Type</p>
                <p className="font-semibold text-gray-900">{field.cropType.charAt(0).toUpperCase() + field.cropType.slice(1)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Area</p>
                <p className="font-semibold text-gray-900">{field.area} hectares</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Analysis Date</p>
                <p className="font-semibold text-gray-900">{formatDateTime(analysis.timestamp)}</p>
              </div>
            </div>
          </section>

          {/* Overall Health Score */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Health Score</h2>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={healthScore > 70 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - healthScore / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{healthScore}%</span>
                </div>
              </div>
              <div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getHealthStatusColor(status)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <p className="text-gray-600 mt-2">
                  {status === 'healthy' ? 'Field is in excellent condition' :
                   status === 'warning' ? 'Some issues detected, monitoring recommended' :
                   'Immediate attention required'}
                </p>
              </div>
            </div>
          </section>

          {/* Disease Detection */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Bug className="mr-2 text-[#1E4D2B]" size={24} />
              Disease Detection
            </h2>
            {analysis.disease.detected ? (
              <div className="space-y-4">
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-2">Detected Issue</p>
                      <p className="text-2xl font-bold text-amber-600 mb-4">{analysis.disease.type}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-amber-700">Severity</p>
                          <p className={`font-bold ${getSeverityColor(analysis.disease.severity)}`}>
                            {analysis.disease.severity.toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-amber-700">Confidence</p>
                          <p className="font-bold text-amber-900">{analysis.disease.confidence}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-amber-700">Affected Area</p>
                          <p className="font-bold text-amber-900">{analysis.disease.affectedArea}%</p>
                        </div>
                      </div>
                    </div>
                    <AlertTriangle className="text-amber-600" size={48} />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Recommended Actions:</h3>
                  <ul className="space-y-2">
                    {analysis.disease.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#1E4D2B] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="text-green-600 mr-4" size={48} />
                <div>
                  <p className="text-xl font-bold text-green-600 mb-1">No Diseases Detected</p>
                  <p className="text-green-700">Your field appears to be healthy with no visible disease indicators.</p>
                </div>
              </div>
            )}
          </section>

          {/* Nutrient Analysis */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Leaf className="mr-2 text-[#1E4D2B]" size={24} />
              Nutrient Analysis
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Nitrogen (N)</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{analysis.nutrient.nitrogen}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${analysis.nutrient.nitrogen}%`,
                        backgroundColor: analysis.nutrient.nitrogen > 70 ? '#10b981' : analysis.nutrient.nitrogen > 50 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Phosphorus (P)</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{analysis.nutrient.phosphorus}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${analysis.nutrient.phosphorus}%`,
                        backgroundColor: analysis.nutrient.phosphorus > 70 ? '#10b981' : analysis.nutrient.phosphorus > 50 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Potassium (K)</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{analysis.nutrient.potassium}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${analysis.nutrient.potassium}%`,
                        backgroundColor: analysis.nutrient.potassium > 70 ? '#10b981' : analysis.nutrient.potassium > 50 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 mb-1">Primary Deficiency</p>
                <p className="text-xl font-bold text-amber-600">{analysis.nutrient.primaryDeficiency}</p>
                <p className="text-sm text-amber-700 mt-2">Detection Confidence: {analysis.nutrient.confidence}%</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Treatment Recommendations:</h3>
                <ul className="space-y-2">
                  {analysis.nutrient.recommendations.map((rec, index) => (
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
          </section>

          {/* Water Stress */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Droplets className="mr-2 text-[#1E4D2B]" size={24} />
              Water Stress Analysis
            </h2>
            <div className="space-y-4">
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-700 mb-1">Status</p>
                    <p className="text-xl font-bold text-blue-600 capitalize">
                      {analysis.water.status.replace('-', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 mb-1">Soil Moisture</p>
                    <p className="text-xl font-bold text-blue-900">{analysis.water.soilMoisture}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 mb-1">Confidence</p>
                    <p className="text-xl font-bold text-blue-900">{analysis.water.confidence}%</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Irrigation Recommendations:</h3>
                <ul className="space-y-2">
                  {analysis.water.recommendations.map((rec, index) => (
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
          </section>

          {/* NDVI Trend */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              {analysis.ndvi.trend === 'declining' ? (
                <TrendingDown className="mr-2 text-red-600" size={24} />
              ) : (
                <TrendingUp className="mr-2 text-green-600" size={24} />
              )}
              NDVI Trend Analysis
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Average NDVI</p>
                <p className="text-2xl font-bold text-gray-900">{analysis.ndvi.average.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Healthy Zone</p>
                <p className="text-2xl font-bold text-green-600">{analysis.ndvi.healthy.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Stress Zone</p>
                <p className="text-2xl font-bold text-amber-600">{analysis.ndvi.stressed.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Trend</p>
                <p className={`text-2xl font-bold capitalize ${analysis.ndvi.trend === 'declining' ? 'text-red-600' : 'text-green-600'}`}>
                  {analysis.ndvi.trend}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Report Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>Generated by Talazo Agritech - Precision Agriculture for Zimbabwe</p>
            <p>Report ID: {analysis.id.slice(0, 12)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}