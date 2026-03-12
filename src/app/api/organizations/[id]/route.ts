import { NextRequest } from 'next/server';
import { OrganizationModel } from '@/backend/models/organization';
import { getAuthUser, authError } from '@/lib/auth';

// GET /api/organizations/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organization = await OrganizationModel.findById(id);
    if (!organization) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }
    return Response.json({ organization });
  } catch (error) {
    console.error('Get organization error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/organizations/[id]
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
    const organization = await OrganizationModel.update(id, updates);
    if (!organization) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }
    return Response.json({ organization });
  } catch (error) {
    console.error('Update organization error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/organizations/[id]
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
    const success = await OrganizationModel.delete(id);
    if (!success) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete organization error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
