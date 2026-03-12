
import { ObjectId } from 'mongodb';
import { getCollection } from '../db/connection';
import { COLLECTIONS } from '../db/collections';
import { User, MongoUser, UserRole } from '@/lib/types';
import bcrypt from 'bcryptjs';

export class UserModel {
  // Convert MongoDB document to application User type
  static toUser(doc: MongoUser): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      username: doc.username || doc.email, // Fallback to email if username not set
      name: doc.name,
      role: doc.role,
      createdAt: doc.createdAt.toISOString(),
      displayName: doc.displayName || doc.name, // Fallback to name if displayName not set
      photoURL: doc.photoURL || '' // Fallback to empty string if photoURL not set
    };
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const collection = await getCollection(COLLECTIONS.USERS);
      const result = await collection.findOne({ email });
      return result ? this.toUser(result as MongoUser) : null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    try {
      const collection = await getCollection(COLLECTIONS.USERS);
      const result = await collection.findOne({ _id: new ObjectId(id) });
      return result ? this.toUser(result as MongoUser) : null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  // Create a new user - updated signature to match usage
  static async create(username: string, email: string, password: string, role?: UserRole): Promise<User> {
    try {
      const collection = await getCollection(COLLECTIONS.USERS);
      
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const newUser = {
        email,
        name: username,
        passwordHash,
        role: role || 'user' as UserRole,
        createdAt: new Date(),
        username,
        displayName: username,
        photoURL: ''
      };
      
      const result = await collection.insertOne(newUser);
      
      return {
        id: result.insertedId.toString(),
        email,
        username,
        name: username,
        role: role || 'user',
        createdAt: newUser.createdAt.toISOString(),
        displayName: username,
        photoURL: ''
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Authenticate user - new method
  static async authenticate(email: string, password: string): Promise<User | null> {
    try {
      const collection = await getCollection(COLLECTIONS.USERS);
      const user = await collection.findOne({ email });
      
      if (!user) return null;
      
      const isValid = await bcrypt.compare(password, user.passwordHash);
      return isValid ? this.toUser(user as MongoUser) : null;
    } catch (error) {
      console.error("Error authenticating user:", error);
      throw error;
    }
  }

  // Update user - new method
  static async update(id: string, updates: any): Promise<User | null> {
    try {
      const collection = await getCollection(COLLECTIONS.USERS);
      
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );
      
      return await this.findById(id);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Delete user - new method
  static async delete(id: string): Promise<boolean> {
    try {
      const collection = await getCollection(COLLECTIONS.USERS);
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      const collection = await getCollection(COLLECTIONS.USERS);
      const user = await collection.findOne({ email });
      
      if (!user) return null;
      
      const isValid = await bcrypt.compare(password, user.passwordHash);
      return isValid ? this.toUser(user as MongoUser) : null;
    } catch (error) {
      console.error("Error verifying password:", error);
      throw error;
    }
  }

  // List users with pagination
  static async list(page = 1, limit = 20): Promise<User[]> {
    try {
      const collection = await getCollection(COLLECTIONS.USERS);
      const skip = (page - 1) * limit;
      
      const results = await collection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return results.map(doc => this.toUser(doc as MongoUser));
    } catch (error) {
      console.error("Error listing users:", error);
      throw error;
    }
  }

  // Update user role (admin function)
  static async updateRole(id: string, role: UserRole): Promise<User | null> {
    try {
      const collection = await getCollection(COLLECTIONS.USERS);
      
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role } }
      );
      
      return await this.findById(id);
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  // Get user stats (for admin dashboard)
  static async getStats(): Promise<{ totalUsers: number, usersByRole: Record<string, number> }> {
    try {
      const collection = await getCollection(COLLECTIONS.USERS);
      
      const totalUsers = await collection.countDocuments();
      
      const roleAggregation = await collection.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]).toArray();
      
      const usersByRole: Record<string, number> = {};
      roleAggregation.forEach((item: any) => {
        usersByRole[item._id] = item.count;
      });
      
      return { totalUsers, usersByRole };
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw error;
    }
  }
}
