/**
 * API Route to proxy external images to avoid CORS issues
 * Used for loading CCCD images in PDF generation
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
    }
    
    console.log('📸 Proxying image:', imageUrl.substring(0, 100));
    
    // Fetch the image from the external URL
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*',
      },
    });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch image:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` }, 
        { status: response.status }
      );
    }
    
    // Get the image data as ArrayBuffer
    const imageBuffer = await response.arrayBuffer();
    
    // Get content type from response or detect from URL
    let contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Ensure it's a valid image content type
    if (!contentType.startsWith('image/')) {
      // Try to detect from URL extension
      if (imageUrl.includes('.png')) {
        contentType = 'image/png';
      } else if (imageUrl.includes('.webp')) {
        contentType = 'image/webp';
      } else if (imageUrl.includes('.gif')) {
        contentType = 'image/gif';
      } else {
        contentType = 'image/jpeg';
      }
    }
    
    console.log('✅ Image proxied successfully, type:', contentType);
    
    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('❌ Proxy image error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
