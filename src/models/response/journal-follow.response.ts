import { JournalResponse } from './journal.response';

export type JournalFollowInput = {
  journalId: string;
};

export type JournalFollowByInput = {
  userId: string;
};

export type JournalFollowResponse = {
  message: string;
};

export type JournalFollower = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
};

export type JournalFollowedResponse = {
  id: string;
  userId: string;
  journalId: string;
  belongsTo: JournalResponse;
  byUser: JournalFollower;
  createdAt: string;
  updatedAt: string;
};

export type JournalFollowersResponse = {
  id: string;
  userId: string;
  journalId: string;
  byUser: JournalFollower;
  createdAt: string;
  updatedAt: string;
}; 