import { NextRequest } from 'next/server';
import { OrganizationModel } from '@/backend/models/organization';
import { getAuthUser, authError } from '@/lib/auth';

// GET /api/organizations - List all organizations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const memberId = searchParams.get('memberId') || undefined;

    const organizations = await OrganizationModel.list({ memberId }, page, limit);
    return Response.json({ organizations });
  } catch (error) {
    console.error('List organizations error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/organizations - Create a new organization
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return authError('Not authenticated');
    }

    const body = await request.json();
    const organization = await OrganizationModel.create(body, auth.userId);
    return Response.json({ organization }, { status: 201 });
  } catch (error) {
    console.error('Create organization error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
