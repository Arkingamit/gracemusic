
import { ObjectId } from 'mongodb';
import { getCollection } from '../db/connection';
import { COLLECTIONS } from '../db/collections';
import { Group, GroupInput, GroupUpdateInput, MongoGroup, SongTransposition } from '@/lib/types';

export class GroupModel {
  // Convert MongoDB document to application Group type
  static toGroup(doc: MongoGroup): Group {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      organizationId: doc.organizationId,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt.toISOString(),
      members: doc.members,
      songs: doc.songs || [],
      songTranspositions: doc.songTranspositions || []
    };
  }

  // Find a group by ID
  static async findById(id: string): Promise<Group | null> {
    try {
      const collection = await getCollection(COLLECTIONS.GROUPS);
      const result = await collection.findOne({ _id: new ObjectId(id) });
      return result ? this.toGroup(result as MongoGroup) : null;
    } catch (error) {
      console.error("Error finding group by ID:", error);
      throw error;
    }
  }

  // Create a new group
  static async create(groupInput: GroupInput, createdBy: string): Promise<Group> {
    try {
      const collection = await getCollection(COLLECTIONS.GROUPS);
      const now = new Date();
      
      const newGroup = {
        name: groupInput.name,
        description: groupInput.description,
        organizationId: groupInput.organizationId,
        members: groupInput.members || [],
        songs: [],
        songTranspositions: [],
        createdBy,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(newGroup);
      
      // Update the organization to include this group
      const orgCollection = await getCollection(COLLECTIONS.ORGANIZATIONS);
      await orgCollection.updateOne(
        { _id: new ObjectId(groupInput.organizationId) },
        { $push: { groups: result.insertedId.toString() } }
      );
      
      return {
        id: result.insertedId.toString(),
        name: groupInput.name,
        description: groupInput.description,
        organizationId: groupInput.organizationId,
        members: groupInput.members || [],
        songs: [],
        songTranspositions: [],
        createdBy,
        createdAt: now.toISOString()
      };
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  }

  // Update a group
  static async update(id: string, updates: GroupUpdateInput): Promise<Group | null> {
    try {
      const collection = await getCollection(COLLECTIONS.GROUPS);
      
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
      console.error("Error updating group:", error);
      throw error;
    }
  }

  // Delete a group
  static async delete(id: string): Promise<boolean> {
    try {
      const collection = await getCollection(COLLECTIONS.GROUPS);
      
      // Get the group to find its organization
      const group = await collection.findOne({ _id: new ObjectId(id) });
      if (!group) return false;
      
      // Remove the group reference from the organization
      const orgCollection = await getCollection(COLLECTIONS.ORGANIZATIONS);
      await orgCollection.updateOne(
        { _id: new ObjectId(group.organizationId) },
        { $pull: { groups: id } }
      );
      
      // Delete all messages for this group
      const messageCollection = await getCollection(COLLECTIONS.MESSAGES);
      await messageCollection.deleteMany({ groupId: id });
      
      // Delete the group
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.error("Error deleting group:", error);
      throw error;
    }
  }

  // Add a song to a group
  static async addSong(groupId: string, songId: string): Promise<Group | null> {
    try {
      const collection = await getCollection(COLLECTIONS.GROUPS);
      
      await collection.updateOne(
        { _id: new ObjectId(groupId) },
        { 
          $addToSet: { songs: songId },
          $set: { updatedAt: new Date() }
        }
      );
      
      return await this.findById(groupId);
    } catch (error) {
      console.error("Error adding song to group:", error);
      throw error;
    }
  }

  // Remove a song from a group
  static async removeSong(groupId: string, songId: string): Promise<Group | null> {
    try {
      const collection = await getCollection(COLLECTIONS.GROUPS);
      
      await collection.updateOne(
        { _id: new ObjectId(groupId) },
        { 
          $pull: { 
            songs: songId,
            songTranspositions: { songId: songId }
          },
          $set: { updatedAt: new Date() }
        }
      );
      
      return await this.findById(groupId);
    } catch (error) {
      console.error("Error removing song from group:", error);
      throw error;
    }
  }

  // Add a member to a group
  static async addMember(groupId: string, userId: string): Promise<Group | null> {
    try {
      const collection = await getCollection(COLLECTIONS.GROUPS);
      
      await collection.updateOne(
        { _id: new ObjectId(groupId) },
        { 
          $addToSet: { members: userId },
          $set: { updatedAt: new Date() }
        }
      );
      
      return await this.findById(groupId);
    } catch (error) {
      console.error("Error adding member to group:", error);
      throw error;
    }
  }

  // Remove a member from a group
  static async removeMember(groupId: string, userId: string): Promise<Group | null> {
    try {
      const collection = await getCollection(COLLECTIONS.GROUPS);
      
      await collection.updateOne(
        { _id: new ObjectId(groupId) },
        { 
          $pull: { members: userId },
          $set: { updatedAt: new Date() }
        }
      );
      
      return await this.findById(groupId);
    } catch (error) {
      console.error("Error removing member from group:", error);
      throw error;
    }
  }

  // Update song transposition in a group
  static async updateSongTransposition(
    groupId: string, 
    songId: string, 
    transposition: number,
    useFlats: boolean = false
  ): Promise<Group | null> {
    try {
      const collection = await getCollection(COLLECTIONS.GROUPS);
      
      // First check if the transposition entry exists
      const group = await this.findById(groupId);
      if (!group) return null;
      
      const existingTransposition = group.songTranspositions?.find(t => t.songId === songId);
      
      if (existingTransposition) {
        // Update existing transposition
        await collection.updateOne(
          { 
            _id: new ObjectId(groupId),
            "songTranspositions.songId": songId 
          },
          { 
            $set: { 
              "songTranspositions.$.transposition": transposition,
              "songTranspositions.$.useFlats": useFlats,
              updatedAt: new Date()
            } 
          }
        );
      } else {
        // Add new transposition
        await collection.updateOne(
          { _id: new ObjectId(groupId) },
          { 
            $push: { 
              songTranspositions: { songId, transposition, useFlats }
            },
            $set: { updatedAt: new Date() }
          }
        );
      }
      
      return await this.findById(groupId);
    } catch (error) {
      console.error("Error updating song transposition:", error);
      throw error;
    }
  }

  // List groups with various filters
  static async list(
    filters: { 
      organizationId?: string, 
      memberId?: string,
      createdBy?: string
    } = {},
    page = 1, 
    limit = 20
  ): Promise<Group[]> {
    try {
      const collection = await getCollection(COLLECTIONS.GROUPS);
      const skip = (page - 1) * limit;
      
      // Build query from filters
      const query: any = {};
      if (filters.organizationId) query.organizationId = filters.organizationId;
      if (filters.memberId) query.members = filters.memberId;
      if (filters.createdBy) query.createdBy = filters.createdBy;
      
      const results = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return results.map(doc => this.toGroup(doc as MongoGroup));
    } catch (error) {
      console.error("Error listing groups:", error);
      throw error;
    }
  }
}
