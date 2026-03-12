import { NextRequest } from 'next/server';
import { GroupModel } from '@/backend/models/group';
import { getAuthUser, authError } from '@/lib/auth';

// GET /api/groups - List all groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const organizationId = searchParams.get('organizationId') || undefined;
    const memberId = searchParams.get('memberId') || undefined;

    const groups = await GroupModel.list({ organizationId, memberId }, page, limit);
    return Response.json({ groups });
  } catch (error) {
    console.error('List groups error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return authError('Not authenticated');
    }

    const body = await request.json();
    const group = await GroupModel.create(body, auth.userId);
    return Response.json({ group }, { status: 201 });
  } catch (error) {
    console.error('Create group error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
