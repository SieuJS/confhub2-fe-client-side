import { newFeaturesData, FeatureItem } from '../data/announcementData';
import { Star } from 'lucide-react';

const FeatureCard = ({ feature }: { feature: FeatureItem }) => (
  <li className="flex items-start space-x-4 p-4 rounded-lg hover:bg-background-secondary transition-colors">
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
      <feature.icon className="w-5 h-5" />
    </div>
    <div>
      <h4 className="font-bold text-text-primary flex items-center">
        {feature.title}
        {feature.isNew && <Star className="w-4 h-4 ml-2 text-yellow-500 fill-current" />}
      </h4>
      <p className="text-sm text-text-secondary">{feature.description}</p>
    </div>
  </li>
);

export const NewFeaturesTab = () => (
  <ul className="space-y-4">
    {newFeaturesData.map((feature, index) => (
      <FeatureCard key={index} feature={feature} />
    ))}
  </ul>
);