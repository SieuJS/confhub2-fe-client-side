// src/services/journal-follow.service.ts

import { appConfig } from '../middleware';
import { JournalFollowInput, JournalFollowedResponse, JournalFollowersResponse } from '../models/response/journal-follow.response';

const API_BASE_URL = (process.env.NEXT_PUBLIC_DATABASE_URL || 'http://localhost:3000') + '/api/v1';



// Định nghĩa một interface cho cấu trúc dữ liệu trả về từ API /by-user
interface JournalFollowRecord {
  id: string;
  journalId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  belongsTo: any;
}




export const journalFollowService = {
  async followJournal(journalId: string): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/journal-follows/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ journalId })
    });

    if (!response.ok) {
      throw new Error('Failed to follow journal');
    }
  },

  async unfollowJournal(journalId: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/journal-follows/unfollow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ journalId })
    });

    if (!response.ok) {
      throw new Error('Failed to unfollow journal');
    }

    return response.json();
  },

  // Phương thức cũ, có thể giữ lại nếu có nơi khác cần
  async getFollowedJournals(): Promise<JournalFollowedResponse[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/journal-follows/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get followed journals');
    }

    return response.json();
  },

    // PHƯƠNG THỨC MỚI ĐỂ LẤY DANH SÁCH FOLLOWED JOURNAL IDs
  async getFollowedJournalIdsByUser(): Promise<string[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://confhub.westus3.cloudapp.azure.com/api/v1/journal-follows/by-user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get followed journal IDs by user');
    }

    // Thay đổi ở đây:
    // API trả về một mảng các đối tượng JournalFollowRecord
    const data: JournalFollowRecord[] = await response.json();

    // Chúng ta cần map qua mảng này để lấy ra chỉ các journalId
    return data.map(record => record.journalId);
  },

  async getJournalFollowers(journalId: string): Promise<JournalFollowersResponse[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/journal-follows/journal/${journalId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get journal followers');
    }

    return response.json();
  }
};