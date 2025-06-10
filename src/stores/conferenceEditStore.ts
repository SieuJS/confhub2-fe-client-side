//src/stores/conferenceEditStore.ts
import { create } from 'zustand';
import { ConferenceResponse } from '../models/response/conference.response';

interface ConferenceEditState {
  conferenceToEdit: ConferenceResponse | null;
  setConferenceToEdit: (conference: ConferenceResponse | null) => void;
}

export const useConferenceEditStore = create<ConferenceEditState>((set) => ({
  conferenceToEdit: null,
  setConferenceToEdit: (conference) => set({ conferenceToEdit: conference }),
}));