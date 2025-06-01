import { JournalFollowInput, JournalFollowedResponse, JournalFollowersResponse } from '../models/response/journal-follow.response';

const API_BASE_URL = (process.env.NEXT_PUBLIC_DATABASE_URL || 'http://localhost:3000') + '/api/v1';

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