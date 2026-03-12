
import { ObjectId } from 'mongodb';
import { getCollection } from '../db/connection';
import { COLLECTIONS } from '../db/collections';
import { Song, SongInput, SongUpdateInput, MongoSong } from '@/lib/types';

export class SongModel {
  // Convert MongoDB document to application Song type
  static toSong(doc: MongoSong): Song {
    return {
      id: doc._id.toString(),
      title: doc.title,
      artist: doc.artist,
      genre: doc.genre,
      lyrics: doc.lyrics,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };
  }

  // Find a song by ID
  static async findById(id: string): Promise<Song | null> {
    try {
      const collection = await getCollection(COLLECTIONS.SONGS);
      const result = await collection.findOne({ _id: new ObjectId(id) });
      return result ? this.toSong(result as MongoSong) : null;
    } catch (error) {
      console.error("Error finding song by ID:", error);
      throw error;
    }
  }

  // Create a new song
  static async create(songInput: SongInput): Promise<Song> {
    try {
      const collection = await getCollection(COLLECTIONS.SONGS);
      const now = new Date();
      
      const newSong = {
        title: songInput.title,
        artist: songInput.artist,
        genre: songInput.genre,
        lyrics: songInput.lyrics,
        createdBy: songInput.createdBy,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(newSong);
      return {
        id: result.insertedId.toString(),
        ...songInput,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
    } catch (error) {
      console.error("Error creating song:", error);
      throw error;
    }
  }

  // Update a song
  static async update(id: string, updates: SongUpdateInput): Promise<Song | null> {
    try {
      const collection = await getCollection(COLLECTIONS.SONGS);
      
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
      console.error("Error updating song:", error);
      throw error;
    }
  }

  // Delete a song
  static async delete(id: string): Promise<boolean> {
    try {
      const collection = await getCollection(COLLECTIONS.SONGS);
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.error("Error deleting song:", error);
      throw error;
    }
  }

  // List songs with pagination and filters
  static async list(
    page = 1, 
    limit = 20, 
    filters: { genre?: string, artist?: string, createdBy?: string } = {}
  ): Promise<Song[]> {
    try {
      const collection = await getCollection(COLLECTIONS.SONGS);
      const skip = (page - 1) * limit;
      
      // Build query from filters
      const query: any = {};
      if (filters.genre) query.genre = filters.genre;
      if (filters.artist) query.artist = { $regex: filters.artist, $options: 'i' };
      if (filters.createdBy) query.createdBy = filters.createdBy;
      
      const results = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return results.map(doc => this.toSong(doc as MongoSong));
    } catch (error) {
      console.error("Error listing songs:", error);
      throw error;
    }
  }

  // Get stats for songs (useful for admin dashboard)
  static async getStats(): Promise<{ totalSongs: number, songsPerGenre: Record<string, number> }> {
    try {
      const collection = await getCollection(COLLECTIONS.SONGS);
      
      const totalSongs = await collection.countDocuments();
      
      const genreAggregation = await collection.aggregate([
        { $group: { _id: "$genre", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();
      
      const songsPerGenre: Record<string, number> = {};
      genreAggregation.forEach((item: any) => {
        songsPerGenre[item._id] = item.count;
      });
      
      return { totalSongs, songsPerGenre };
    } catch (error) {
      console.error("Error getting song stats:", error);
      throw error;
    }
  }
}
