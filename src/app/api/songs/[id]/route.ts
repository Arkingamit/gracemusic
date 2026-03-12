import { NextRequest } from 'next/server';
import { SongModel } from '@/backend/models/song';
import { getAuthUser, authError } from '@/lib/auth';

// GET /api/songs/[id] - Get a song by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const song = await SongModel.findById(id);
    if (!song) {
      return Response.json({ error: 'Song not found' }, { status: 404 });
    }
    return Response.json({ song });
  } catch (error) {
    console.error('Get song error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/songs/[id] - Update a song
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return authError('Not authenticated');
    }

    const { id } = await params;
    const updates = await request.json();
    const song = await SongModel.update(id, updates);
    if (!song) {
      return Response.json({ error: 'Song not found' }, { status: 404 });
    }
    return Response.json({ song });
  } catch (error) {
    console.error('Update song error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/songs/[id] - Delete a song
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return authError('Not authenticated');
    }

    const { id } = await params;
    const success = await SongModel.delete(id);
    if (!success) {
      return Response.json({ error: 'Song not found' }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete song error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
