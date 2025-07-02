import { welcomeData } from '../data/announcementData';
import { PartyPopper } from 'lucide-react';

export const WelcomeTab = () => (
  <div>
    <div className="flex flex-col items-center text-center p-4 bg-background-secondary rounded-lg">
      <PartyPopper className="w-16 h-16 text-primary mb-4" />
      <h3 className="text-2xl font-bold text-text-primary mb-2">{welcomeData.title}</h3>
      <p className="text-text-secondary">{welcomeData.description}</p>
    </div>
  </div>
);