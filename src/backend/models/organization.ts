
import { ObjectId } from 'mongodb';
import { getCollection } from '../db/connection';
import { COLLECTIONS } from '../db/collections';
import { Organization, OrganizationInput, OrganizationUpdateInput, MongoOrganization } from '@/lib/types';

export class OrganizationModel {
  // Convert MongoDB document to application Organization type
  static toOrganization(doc: MongoOrganization): Organization {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt.toISOString(),
      members: doc.members || [],
      groups: doc.groups || []
    };
  }

  // Find an organization by ID
  static async findById(id: string): Promise<Organization | null> {
    try {
      const collection = await getCollection(COLLECTIONS.ORGANIZATIONS);
      const result = await collection.findOne({ _id: new ObjectId(id) });
      return result ? this.toOrganization(result as MongoOrganization) : null;
    } catch (error) {
      console.error("Error finding organization by ID:", error);
      throw error;
    }
  }

  // Create a new organization
  static async create(orgInput: OrganizationInput, createdBy: string): Promise<Organization> {
    try {
      const collection = await getCollection(COLLECTIONS.ORGANIZATIONS);
      const now = new Date();
      
      // Make sure creator is included in members
      const members = [...new Set([...orgInput.members, createdBy])];
      
      const newOrg = {
        name: orgInput.name,
        description: orgInput.description,
        members,
        groups: [],
        createdBy,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(newOrg);
      return {
        id: result.insertedId.toString(),
        name: orgInput.name,
        description: orgInput.description,
        members,
        groups: [],
        createdBy,
        createdAt: now.toISOString()
      };
    } catch (error) {
      console.error("Error creating organization:", error);
      throw error;
    }
  }

  // Update an organization
  static async update(id: string, updates: OrganizationUpdateInput): Promise<Organization | null> {
    try {
      const collection = await getCollection(COLLECTIONS.ORGANIZATIONS);
      
      const updateDoc = {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      };
      
      await collection.updateOne(
        { _id: new ObjectId(id) },
        updateDoc
      );
      
      return await this.findById(id);
    } catch (error) {
      console.error("Error updating organization:", error);
      throw error;
    }
  }

  // Delete an organization
  static async delete(id: string): Promise<boolean> {
    try {
      const collection = await getCollection(COLLECTIONS.ORGANIZATIONS);
      
      // Get all groups belonging to this organization
      const groupCollection = await getCollection(COLLECTIONS.GROUPS);
      const groups = await groupCollection.find({ organizationId: id }).toArray();
      const groupIds = groups.map(g => g._id.toString());
      
      // Delete all groups belonging to this organization
      await groupCollection.deleteMany({ organizationId: id });
      
      // Delete all messages for groups in this organization
      const messageCollection = await getCollection(COLLECTIONS.MESSAGES);
      await messageCollection.deleteMany({ groupId: { $in: groupIds } });
      
      // Delete the organization
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.error("Error deleting organization:", error);
      throw error;
    }
  }

  // Add a member to an organization
  static async addMember(orgId: string, userId: string): Promise<Organization | null> {
    try {
      const collection = await getCollection(COLLECTIONS.ORGANIZATIONS);
      
      await collection.updateOne(
        { _id: new ObjectId(orgId) },
        { 
          $addToSet: { members: userId },
          $set: { updatedAt: new Date() }
        }
      );
      
      return await this.findById(orgId);
    } catch (error) {
      console.error("Error adding member to organization:", error);
      throw error;
    }
  }

  // Remove a member from an organization
  static async removeMember(orgId: string, userId: string): Promise<Organization | null> {
    try {
      const collection = await getCollection(COLLECTIONS.ORGANIZATIONS);
      
      await collection.updateOne(
        { _id: new ObjectId(orgId) },
        { 
          $pull: { members: userId },
          $set: { updatedAt: new Date() }
        }
      );
      
      // Also remove this user from all groups in this organization
      const groupCollection = await getCollection(COLLECTIONS.GROUPS);
      await groupCollection.updateMany(
        { organizationId: orgId },
        { $pull: { members: userId } }
      );
      
      return await this.findById(orgId);
    } catch (error) {
      console.error("Error removing member from organization:", error);
      throw error;
    }
  }

  // List organizations with filters
  static async list(
    filters: { 
      memberId?: string,
      createdBy?: string
    } = {},
    page = 1, 
    limit = 20
  ): Promise<Organization[]> {
    try {
      const collection = await getCollection(COLLECTIONS.ORGANIZATIONS);
      const skip = (page - 1) * limit;
      
      // Build query from filters
      const query: any = {};
      if (filters.memberId) query.members = filters.memberId;
      if (filters.createdBy) query.createdBy = filters.createdBy;
      
      const results = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return results.map(doc => this.toOrganization(doc as MongoOrganization));
    } catch (error) {
      console.error("Error listing organizations:", error);
      throw error;
    }
  }
}
