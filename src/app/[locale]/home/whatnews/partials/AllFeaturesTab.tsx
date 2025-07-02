import { allFeaturesData, FeatureItem } from '../data/announcementData';
import { Star } from 'lucide-react';

// Một component card tái sử dụng để hiển thị thông tin tính năng
const FeatureItemCard = ({ feature }: { feature: FeatureItem }) => (
  <li className="flex items-start space-x-4 p-3 rounded-lg hover:bg-background-secondary transition-colors">
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
      <feature.icon className="w-5 h-5" />
    </div>
    <div>
      <h4 className="font-bold text-text-primary flex items-center">
        {feature.title}
        {feature.isNew && <span className="ml-2 inline-block px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-200 rounded-full">MỚI</span>}
      </h4>
      <p className="text-sm text-text-secondary">{feature.description}</p>
    </div>
  </li>
);

export const AllFeaturesTab = () => (
  <div className="space-y-6">
    {allFeaturesData.map((category, index) => (
      <div key={index}>
        <h3 className="text-lg font-bold text-text-primary mb-3 pb-2 border-b border-border">{category.category}</h3>
        <ul className="space-y-2">
          {category.features.map((feature, featureIndex) => (
            <FeatureItemCard key={featureIndex} feature={feature} />
          ))}
        </ul>
      </div>
    ))}
  </div>
);