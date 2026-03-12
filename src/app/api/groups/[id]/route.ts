import { NextRequest } from 'next/server';
import { GroupModel } from '@/backend/models/group';
import { getAuthUser, authError } from '@/lib/auth';

// GET /api/groups/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const group = await GroupModel.findById(id);
    if (!group) {
      return Response.json({ error: 'Group not found' }, { status: 404 });
    }
    return Response.json({ group });
  } catch (error) {
    console.error('Get group error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/groups/[id]
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
    const group = await GroupModel.update(id, updates);
    if (!group) {
      return Response.json({ error: 'Group not found' }, { status: 404 });
    }
    return Response.json({ group });
  } catch (error) {
    console.error('Update group error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/groups/[id]
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
    const success = await GroupModel.delete(id);
    if (!success) {
      return Response.json({ error: 'Group not found' }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete group error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
