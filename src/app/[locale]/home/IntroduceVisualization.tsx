// // src/app/[locale]/home/IntroduceVisualization.tsx

// 'use client'; // BẮT BUỘC: Vì component này dùng hook và state

// import React from 'react';
// import { useTranslations } from 'next-intl';
// import { useChartAnimation } from '@/src/hooks/home/useChartAnimation';
// import IntroductoryContent from './introducevisualization/IntroductoryContent';
// import AnimatedChart from './introducevisualization/AnimatedChart';

// export default function IntroduceVisualization() {
//   const t = useTranslations('IntroduceVisualization');
//   // Hook useChartAnimation chỉ chạy ở client
//   const { chartData, chartType, currentDataSetIndex } = useChartAnimation(3000);

//   return (
//     <section
//       aria-labelledby='visualization-intro-heading'
//       className='bg-white-pure px-16 py-8 md:px-20'
//     >
//       <div className='container mx-auto flex flex-col items-center gap-8 lg:flex-row lg:gap-12'>
//         <IntroductoryContent t={t} />
//         <AnimatedChart
//           chartData={chartData}
//           chartType={chartType}
//           currentDataSetIndex={currentDataSetIndex}
//         />
//       </div>
//     </section>
//   );
// }