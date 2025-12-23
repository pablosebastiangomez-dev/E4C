// src/types.ts

export interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentDate: string;
  tokens: number;
  tasksCompleted: number;
  nfts: string[]; // Array of NFT IDs
  grade: string; // Added from mockData
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[]; // Added from mockData
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  points: number;
  status: 'pending' | 'completed';
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  issuedDate: string;
  category: 'achievement' | 'excellence' | 'participation';
  signatures: {
    teacher: string;
    admin: string;
    timestamp: string;
  };
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: string;
  image: string;
  available: number;
}

export interface AchievementTemplate {
  name: string;
  emoji: string;
  description: string;
}

export interface WeeklyActivityItem {
  day: string;
  tasks: number;
  logins: number;
}

export interface TokenTransaction {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
  date: string;
  teacherId?: string;
  teacherName?: string;
}

