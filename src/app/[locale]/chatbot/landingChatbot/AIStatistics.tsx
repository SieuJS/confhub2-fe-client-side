'use client';

import React, { useState, useEffect, useRef } from 'react';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';
import Image from 'next/image'; // Import thẻ Image của Next.js
import { useTranslations } from 'next-intl';


interface Statistic {
  label: string;
  value: number;
  unit?: string;
  description?: string;
}

const AIStatistics = () => {
  const t = useTranslations('');
  
  const statistics: Statistic[] = [
    { label: t('Model_Accuracy'), value: 95.7, unit: '%', description: t('Model_Accuracy_describe') },
    { label: t('Inference_Speed'), value: 5.5, unit: 'ms', description: t('Inference_Speed_describe') },
  ];

  const odometerStyle = {
    fontSize: '10rem',
    fontWeight: 'bold',
    color: '#A7C4BC',
    lineHeight: 1.2,
  };

  const [odometerValues, setOdometerValues] = useState(
    statistics.map(stat => 0)
  );
  const [isIntersecting, setIsIntersecting] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isIntersecting) return;

    const intervals = statistics.map((stat, index) => {
      const intervalId = setInterval(() => {
        const increment = (Math.random() * (stat.value / 5));
        const currentValue = odometerValues[index];

        const newValue = Math.min(currentValue + increment, stat.value);
        setOdometerValues(prevValues => {
          const newValues = [...prevValues];
          newValues[index] = newValue;
          return newValues;
        });

        if (newValue >= stat.value) {
          clearInterval(intervalId);
        }
      }, 50);

      return intervalId;
    });

    return () => {
      intervals.forEach(intervalId => clearInterval(intervalId));
    };
  }, [statistics, isIntersecting]);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white py-8 overflow-hidden" ref={componentRef}>
      <Image
        src="/banner3.png" // Thay đổi đường dẫn này
        alt="AI Background"
        fill
        style={{ objectFit: 'cover' }}
        className="absolute top-0 left-0 w-full h-full object-cover opacity-20 z-0" // Giảm độ mờ và đưa xuống layer dưới
      />
      <div className="container mx-auto relative z-10"> {/* Thêm relative và z-10 để nội dung nằm trên ảnh */}
        <h1 className="text-3xl font-semibold mb-6 text-center text-gray-100">AI Statistics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {statistics.map((stat, index) => (
            <div key={index} className=" text-center p-6 transform transition-transform duration-200">
              <h2 className="text-3xl font-bold text-blue-400 mb-2">{stat.label}</h2>
              <div className="text-3xl font-semibold">
                <Odometer value={Number(odometerValues[index])} format="(,ddd).d" theme="default" style={odometerStyle} />
                {stat.unit && <span className="text-6xl text-gray-400 ml-4">{stat.unit}</span>}
              </div>
              {stat.description && (
                <p className="text-gray-400 mt-2 text-3xl">{stat.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIStatistics;