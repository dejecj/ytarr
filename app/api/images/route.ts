import { createServerClient } from '@/lib/pocketbase'; // adjust path as needed
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const id = searchParams.get('id');
    const image = searchParams.get('image');

    if (!collectionId || !id || !image) {
      return new Response('Missing required parameters', { status: 400 });
    }

    const pb = createServerClient();

    // Get the full image URL
    const imageUrl = pb.files.getURL({ collectionId, id }, image, {
        download: true
    });

    // Fetch the image
    const response = await fetch(imageUrl);

    // Create a response with the file data
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new Response('Image not found', { status: 404 });
  }
}