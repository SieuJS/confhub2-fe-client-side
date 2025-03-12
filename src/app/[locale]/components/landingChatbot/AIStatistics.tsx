'use client';

import React, { useState, useEffect } from 'react';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';

interface Statistic {
  label: string;
  value: number;
  unit?: string;
  description?: string;
}

const AIStatistics = () => {
  const statistics: Statistic[] = [
    { label: 'Model Accuracy', value: 95.7, unit: '%', description: 'Average accuracy across all models.' },
    { label: 'Inference Speed', value: 5.5, unit: 'ms', description: 'Average time to process a single inference.' },
  ];

  const odometerStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#A7C4BC',
    lineHeight: 1.2,
  };

  const [odometerValues, setOdometerValues] = useState(
    statistics.map(stat => 0) // Khởi tạo với giá trị 0 cho mỗi thống kê
  );

  useEffect(() => {
    const intervals = statistics.map((stat, index) => {
      const intervalId = setInterval(() => {
        // Tạo giá trị ngẫu nhiên để tăng/giảm
        const increment = (Math.random() * (stat.value / 5)); // Điều chỉnh tốc độ biến động
        const currentValue = odometerValues[index];

        // Tính giá trị mới, đảm bảo không vượt quá giá trị cuối cùng
        const newValue = Math.min(currentValue + increment, stat.value);
        setOdometerValues(prevValues => {
          const newValues = [...prevValues];
          newValues[index] = newValue;
          return newValues;
        });

        // Dừng interval khi đạt đến giá trị cuối cùng
        if (newValue >= stat.value) {
          clearInterval(intervalId);
        }
      }, 50); // Điều chỉnh tốc độ cập nhật (mili giây)

      return intervalId;
    });

    return () => {
      // Xóa tất cả các interval khi component unmount
      intervals.forEach(intervalId => clearInterval(intervalId));
    };
  }, [statistics]); // Chạy lại effect khi `statistics` thay đổi

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-center text-gray-100">AI Statistics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {statistics.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-lg shadow-md p-6 transform transition-transform duration-200">
              <h2 className="text-xl font-bold text-blue-400 mb-2">{stat.label}</h2>
              <div className="text-3xl font-semibold">
                <Odometer value={Number(odometerValues[index])} format="(,ddd).d" theme="default" style={odometerStyle} />
                {stat.unit && <span className="text-lg text-gray-400 ml-1">{stat.unit}</span>}
              </div>
              {stat.description && (
                <p className="text-gray-400 mt-2 text-sm">{stat.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIStatistics;