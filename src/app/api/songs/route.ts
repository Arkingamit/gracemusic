import { NextRequest } from 'next/server';
import { SongModel } from '@/backend/models/song';
import { getAuthUser, authError } from '@/lib/auth';

// GET /api/songs - List all songs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const genre = searchParams.get('genre') || undefined;
    const artist = searchParams.get('artist') || undefined;

    const songs = await SongModel.list(page, limit, { genre, artist });
    return Response.json({ songs });
  } catch (error) {
    console.error('List songs error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/songs - Create a new song
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return authError('Not authenticated');
    }

    const body = await request.json();
    const songInput = {
      ...body,
      createdBy: auth.userId,
    };

    const song = await SongModel.create(songInput);
    return Response.json({ song }, { status: 201 });
  } catch (error) {
    console.error('Create song error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
