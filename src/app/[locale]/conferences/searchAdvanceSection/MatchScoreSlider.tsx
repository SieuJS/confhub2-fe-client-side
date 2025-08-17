// src/components/conferences/searchAdvanceSection/MatchScoreSlider.tsx
import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';

interface MatchScoreSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  t: (key: string) => string;
}

export const MatchScoreSlider: React.FC<MatchScoreSliderProps> = ({ value, onValueChange, t }) => {
  const milestones = [0, 20, 40, 60, 80, 100]; // Define the milestone percentages

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className="col-span-1 md:col-span-3 lg:col-span-2 cursor-help">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold">{t('Match_Score_Range')}:</label>
            <div className="text-sm font-mono rounded border border-gray-300 px-2 py-0.5 bg-gray-20">
              {value[0]}% - {value[1]}%
            </div>
          </div>
          <div className="relative w-full"> {/* Wrapper for slider and milestones */}
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              defaultValue={[0, 100]}
              value={value}
              onValueChange={onValueChange}
              max={100}
              step={1}
              minStepsBetweenThumbs={5}
            >
              <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
                {/* Milestone Markers */}
                {milestones.map((milestone) => (
                  <div
                    key={milestone}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full"
                    style={{ left: `${milestone}%`, transform: 'translateX(-50%) translateY(-50%)' }} // Adjust transform for perfect centering
                  ></div>
                ))}
                <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-4 h-4 bg-blue-500 shadow-md rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Lower match score"
              />
              <Slider.Thumb
                className="block w-4 h-4 bg-blue-500 shadow-md rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Upper match score"
              />
            </Slider.Root>

            {/* Milestone Labels */}
            <div className="relative flex justify-between w-full mt-2">
              {milestones.map((milestone) => (
                <div
                  key={`label-${milestone}`}
                  className="absolute text-xs text-gray-500"
                  style={{ left: `${milestone}%`, transform: 'translateX(-50%)' }} // Center the text label
                >
                  {milestone}%
                </div>
              ))}
            </div>
          </div>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 max-w-xs rounded-md bg-gray-800 px-3 py-2 text-sm text-white shadow-lg"
          sideOffset={5}
        >
          {t('tooltip_match_score_filter')}
          <Tooltip.Arrow className="fill-gray-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};