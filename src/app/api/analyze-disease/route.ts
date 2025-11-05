import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    console.log('🔍 Server-side analysis starting...');
    console.log('📊 Image:', imageFile.name, imageFile.size, imageFile.type);

    // Convert to buffer for API call
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('📡 Calling Hugging Face API from server...');

    // Try multiple models in order of preference
    const models = [
      'nateraw/vit-base-beans', // Bean disease detection (active)
      'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification', // Original model
      'Matthijs/plant-disease-detection', // Alternative model
    ];

    let lastError: any = null;
    
    for (const model of models) {
      try {
        console.log(`🔍 Trying model: ${model}`);
        
        const response = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': imageFile.type,
            },
            body: buffer,
          }
        );

        if (response.ok) {
          const results = await response.json();
          console.log(`✅ Success with model ${model}:`, results);

          if (results && results.length > 0) {
            return NextResponse.json({
              disease: results[0].label,
              confidence: results[0].score,
              allPredictions: results,
              model: model,
              success: true
            });
          }
        } else if (response.status === 503) {
          // Model is loading - this is actually good, means model exists
          console.log(`⏳ Model ${model} is loading (503)...`);
          return NextResponse.json(
            { 
              error: 'Model is loading', 
              message: 'The AI model is warming up. Please try again in 20 seconds.',
              model: model,
              retry: true 
            },
            { status: 503 }
          );
        } else {
          const errorText = await response.text();
          console.warn(`❌ Model ${model} failed: ${response.status} - ${errorText}`);
          lastError = { status: response.status, message: errorText };
        }
      } catch (error) {
        console.warn(`❌ Model ${model} error:`, error);
        lastError = error;
      }
    }

    // All models failed
    console.error('❌ All Hugging Face models failed. Last error:', lastError);
    return NextResponse.json(
      { 
        error: 'All models unavailable', 
        message: 'Hugging Face models are currently unavailable. Using offline analysis.',
        success: false 
      },
      { status: 503 }
    );

  } catch (error) {
    console.error('❌ Server-side analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}

// Enable CORS for this route if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
