// Type alias to avoid importing mongodb on the client side
type ObjectId = string;

// User roles
export type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

export interface User {
  id: string;
  email: string;
  username: string; // Required in the interface
  name: string;
  role: UserRole;
  createdAt: string;
  displayName: string; // Required in the interface
  photoURL: string; // Required in the interface
}

export interface MongoUser {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  username?: string; // Making this optional for backward compatibility
  displayName?: string; // Making this optional for backward compatibility
  photoURL?: string; // Making this optional for backward compatibility
}

// Add Genre interface
export interface Genre {
  id: string;
  name: string;
  createdAt: string;
}

export interface MongoGenre {
  _id: ObjectId;
  name: string;
  createdAt: Date;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  lyrics: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string; // Making this optional for backward compatibility
  originalKey?: string; // Add original key field
  structure?: {
    lines: Array<{
      type: 'chord' | 'lyric' | 'both';
      content: string;
      chords?: Array<{
        chord: string;
        position: number;
      }>;
    }>;
  }; // Add structured format for Ultimate Guitar style
}

export interface SongInput {
  title: string;
  artist: string;
  genre: string;
  lyrics: string;
  createdBy: string; // Adding this to fix type errors
  originalKey?: string; // Add original key field
}

export interface SongUpdateInput {
  title?: string;
  artist?: string;
  genre?: string;
  lyrics?: string;
  updatedAt?: string; // Making this optional for backward compatibility
  originalKey?: string; // Add original key field
}

export interface MongoSong {
  _id: ObjectId;
  title: string;
  artist: string;
  genre: string;
  lyrics: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date; // Making this optional for backward compatibility
  originalKey?: string; // Add original key field
  structure?: {
    lines: Array<{
      type: 'chord' | 'lyric' | 'both';
      content: string;
      chords?: Array<{
        chord: string;
        position: number;
      }>;
    }>;
  }; // Add structured format
}

// Add a new interface for song transpositions
export interface SongTransposition {
  songId: string;
  transposition: number;
  useFlats?: boolean;
}

// Rename Group to SongSet in display names, but keep Group internally for now
export interface Group {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  members: string[];
  songs: string[];
  createdBy: string;
  createdAt: string;
  // Add the songTranspositions array to store per-song transpositions for this group
  songTranspositions?: SongTransposition[];
}

export interface GroupInput {
  name: string;
  description: string;
  organizationId: string;
  members?: string[];
}

export interface GroupUpdateInput {
  name?: string;
  description?: string;
  members?: string[];
  organizationId?: string; // Adding this to fix type errors
  songTranspositions?: SongTransposition[];
}

export interface MongoGroup {
  _id: ObjectId;
  name: string;
  description: string;
  organizationId: string;
  members: string[];
  songs: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  songTranspositions?: SongTransposition[];
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  members: string[];
  groups: string[];
  createdBy: string;
  createdAt: string;
}

export interface OrganizationInput {
  name: string;
  description: string;
  members: string[];
}

export interface OrganizationUpdateInput {
  name?: string;
  description?: string;
  members?: string[];
}

export interface MongoOrganization {
  _id: ObjectId;
  name: string;
  description: string;
  members: string[];
  groups: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  groupId: string;
  createdBy: string;
  createdAt: string;
}

export interface MessageInput {
  content: string;
  groupId: string;
}

export interface MongoMessage {
  _id: ObjectId;
  content: string;
  groupId: string;
  createdBy: string;
  createdAt: Date;
}

export interface AdminStats {
  totalSongs: number;
  totalUsers: number;
  usersCount?: number;
  songsCount?: number;
  groupsCount?: number;
  organizationsCount?: number;
  songsPerGenre: Record<string, number>;
  recentlyAddedSongs?: Song[];
  usersByRole?: Record<string, number>;
}
