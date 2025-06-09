// src/app/[locale]/addconference/steps/VerticalProgressStepper.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Confetti from 'react-confetti';

interface Step {
  id: string;
  name: string;
}

type TInterpolation = { [key: string]: string | number };

interface VerticalProgressStepperProps {
  steps: Step[];
  currentStepId: string;
  completedStepIds: Set<string>;
  t: (key: string, options?: TInterpolation) => string;
  onStepClick?: (stepId: string) => void;
}

const VerticalProgressStepper: React.FC<VerticalProgressStepperProps> = ({
  steps,
  currentStepId,
  completedStepIds,
  t,
  onStepClick,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const completedCount = completedStepIds.size;
  const totalSteps = steps.length;
  const isAllComplete = completedCount === totalSteps;
  const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  // Kích hoạt hiệu ứng pháo bông khi tất cả các bước hoàn thành
  useEffect(() => {
    if (isAllComplete) {
      setShowConfetti(true);
      // Tự động tắt pháo bông sau 5 giây
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isAllComplete]);

  const handleStepClick = (stepId: string) => {
    if (onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <div className="flex flex-col justify-between p-4">
      {/* Hiệu ứng pháo bông */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={250} />}

      <nav aria-label="Progress">
        <ol role="list" className="space-y-6">
          {steps.map((step, stepIdx) => {
            const isCompleted = completedStepIds.has(step.id);
            const isCurrent = step.id === currentStepId;

            return (
              <li key={step.name} className="relative">
                {/* Đường kẻ nối các bước */}
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className={clsx(
                      'absolute left-4 top-5 -ml-px h-full w-0.5 transition-colors duration-300',
                      isCompleted ? 'bg-indigo-600' : 'bg-gray-200'
                    )}
                    aria-hidden="true"
                  />
                ) : null}
                <a
                  href={`#${step.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleStepClick(step.id);
                  }}
                  className="group relative flex items-center rounded-md p-2 -ml-2 transition-colors duration-200 cursor-pointer hover:bg-gray-30"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className="flex h-8 w-8 items-center" aria-hidden="true">
                    <span
                      className={clsx(
                        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
                        {
                          'bg-indigo-600 shadow-md': isCompleted,
                          'border-2 border-indigo-600 bg-white shadow-sm': !isCompleted && isCurrent,
                          'border-2 border-gray-300 bg-white': !isCompleted && !isCurrent,
                        },
                        'group-hover:scale-110 group-hover:shadow-lg'
                      )}
                    >
                      {/* *** SỬA LỖI LOGIC HIỂN THỊ ICON TẠI ĐÂY *** */}
                      {isCompleted ? (
                        <CheckIcon className="h-5 w-5 text-white" />
                      ) : (
                        // Chỉ hiển thị chấm tròn bên trong cho bước hiện tại (nếu chưa hoàn thành)
                        <span
                          className={clsx(
                            'h-2.5 w-2.5 rounded-full bg-indigo-600 transition-transform duration-300',
                            isCurrent ? 'scale-100' : 'scale-0'
                          )}
                        />
                      )}
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span
                      className={clsx(
                        'text-sm font-semibold transition-colors duration-300',
                        {
                          'text-indigo-600': isCurrent && !isCompleted,
                          'text-gray-900': isCompleted,
                          'text-gray-500': !isCompleted && !isCurrent,
                        },
                        'group-hover:text-indigo-700'
                      )}
                    >
                      {t(step.name)}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Phần hiển thị tiến độ hoặc thông báo chúc mừng */}
      <div className="mt-10">
        {isAllComplete ? (
          <div className="text-center p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
            <SparklesIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-green-800">{t('All_sections_complete')}</h4>
            <p className="mt-1 text-xs text-green-700">{t('You_can_now_proceed_to_the_next_step')}</p>
          </div>
        ) : (
          <>
            <h4 className="text-sm font-medium text-gray-900">{t('Form_Completion')}</h4>
            <p className="mt-1 text-xs text-gray-500">
              {t('completed_steps', { count: completedCount, total: totalSteps })}
            </p>
            <div className="mt-3" aria-hidden="true">
              <div className="overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerticalProgressStepper;