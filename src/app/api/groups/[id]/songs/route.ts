import { NextRequest } from 'next/server';
import { GroupModel } from '@/backend/models/group';
import { getAuthUser, authError } from '@/lib/auth';

// POST /api/groups/[id]/songs - Add a song to the group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return authError('Not authenticated');
    }

    const { id } = await params;
    const { songId } = await request.json();
    const group = await GroupModel.addSong(id, songId);
    if (!group) {
      return Response.json({ error: 'Group not found' }, { status: 404 });
    }
    return Response.json({ group });
  } catch (error) {
    console.error('Add song to group error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/groups/[id]/songs - Remove a song from the group
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
    const { songId } = await request.json();
    const group = await GroupModel.removeSong(id, songId);
    if (!group) {
      return Response.json({ error: 'Group not found' }, { status: 404 });
    }
    return Response.json({ group });
  } catch (error) {
    console.error('Remove song from group error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
