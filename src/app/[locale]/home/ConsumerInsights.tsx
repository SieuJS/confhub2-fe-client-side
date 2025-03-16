import React from 'react';
import Image from 'next/image'; // Import Next.js Image

interface ConsumerInsightsProps {
  //  props nếu bạn muốn truyền dữ liệu động vào component này
  // Ví dụ:
  title?: string;
  subtitle?: string;
  description?: string;
  stats?: { value: string; label: string }[];
  imageUrl?: string;
  imageAlt?: string;  // Thêm alt text cho image.
  buttonText?: string;
  buttonLink?: string;
}

const ConsumerInsights: React.FC<ConsumerInsightsProps> = ({
  title = "CONSUMER INSIGHTS", // Giá trị mặc định
  subtitle = "Understand what drives consumers",
  description = "The Consumer Insights helps marketers, planners and product managers to understand consumer behavior and their interaction with brands. Explore consumption and media usage on a global basis.",
  stats = [
    { value: "2,500,000+", label: "interviews" },
    { value: "56", label: "countries" },
    { value: "500+", label: "industries" },
    { value: "15,000+", label: "brands" },
  ],
  imageUrl = "/bg-2.jpg", //  placeholder, bạn cần thay bằng URL thật
  imageAlt = "Placeholder Image",
  buttonText = "Explore the tool",
  buttonLink = "#", // Placeholder link
}) => {
  return (
    <div className="container mx-auto my-12 px-4 py-8 md:flex md:items-center md:justify-between">
      {/* Left Column (Image) */}
      <div className="md:w-1/2 mb-8 md:mb-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={600}  //  kích thước.  Cần điều chỉnh cho phù hợp.
          height={400}
          className="w-full h-auto rounded-lg" // Thêm rounded-lg
          priority
        />
      </div>

      {/* Right Column (Content) */}
      <div className="md:w-1/2 md:pl-12">
        <h2 className="text-sm font-semibold text-sky-700 uppercase mb-2">
          {title}
        </h2>
        <h3 className="text-4xl font-bold text-gray-800 mb-4">
          {subtitle}
        </h3>
        <p className="text-gray-600 mb-8">
          {description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl font-bold text-sky-700">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Button */}
        <a
          href={buttonLink}
          className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
};

export default ConsumerInsights;