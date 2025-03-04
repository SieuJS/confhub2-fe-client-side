import React from 'react';

const ConferenceFeedback: React.FC = () => {
  return (
    <div className="container mx-auto py-6 rounded-lg"> {/* Increased max-w for two-column layout */}
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold ">Conference Feedback</h2>
          <div className="text-sm ">Showing 5,768 Conference Reviews</div>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm ">
            All Feedback
          </button>
          <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm ">
            Recently Added
          </button>
        </div>
      </div>

      <div className="flex"> {/* Two-column layout container */}
        <div className="w-1/2 pr-8"> {/* Left column */}
          {/* Overall Rating */}
          <div className="mb-6 flex items-start">
            <div>
              <div className="text-4xl font-bold ">4.0</div>
              <div className="flex text-yellow-500">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>☆</span>
              </div>
              <div className="text-sm ">based on 23 reviews</div>
            </div>
            <div className="ml-8 flex-1">
              {/* Rating Bars */}
              <div className="mb-2 flex items-center">
                <div className="w-10 text-sm font-medium ">5 <span className="inline-block text-xs ml-1 text-yellow-500">★</span></div>
                <div className="mx-2 bg-green-400 h-4 rounded-sm flex-1 relative">
                  <div className="absolute bg-green-600 h-4 rounded-sm w-[70%]" ></div>
                </div>
                <div className="w-16 text-right text-sm ">239 reviews</div>
              </div>
              <div className="mb-2 flex items-center">
                <div className="w-10 text-sm font-medium ">4 <span className="inline-block text-xs ml-1 text-yellow-500">★</span></div>
                <div className="mx-2 bg-green-400 h-4 rounded-sm flex-1 relative">
                  <div className="absolute bg-green-500 h-4 rounded-sm w-[30%]" ></div>
                </div>
                <div className="w-16 text-right text-sm ">75 reviews</div>
              </div>
              <div className="mb-2 flex items-center">
                <div className="w-10 text-sm font-medium ">3 <span className="inline-block text-xs ml-1 text-yellow-500">★</span></div>
                <div className="mx-2 bg-yellow-400 h-4 rounded-sm flex-1 relative">
                  <div className="absolute bg-yellow-500 h-4 rounded-sm w-[40%]" ></div>
                </div>
                <div className="w-16 text-right text-sm ">106 reviews</div>
              </div>
              <div className="mb-2 flex items-center">
                <div className="w-10 text-sm font-medium ">2 <span className="inline-block text-xs ml-1 text-yellow-500">★</span></div>
                <div className="mx-2 bg-orange-400 h-4 rounded-sm flex-1 relative">
                  <div className="absolute bg-orange-500 h-4 rounded-sm w-[15%]" ></div>
                </div>
                <div className="w-16 text-right text-sm ">40 reviews</div>
              </div>
              <div className="mb-2 flex items-center">
                <div className="w-10 text-sm font-medium ">1 <span className="inline-block text-xs ml-1 text-yellow-500">★</span></div>
                <div className="mx-2 bg-red-400 h-4 rounded-sm flex-1 relative">
                  <div className="absolute bg-red-500 h-4 rounded-sm w-[8%]" ></div>
                </div>
                <div className="w-16 text-right text-sm ">20 reviews</div>
              </div>
            </div>
          </div>

          {/* Feedback Description */}
          <div className="mb-6 text-sm ">
            Conference feedback helps us understand what attendees valued most and identify areas for improvement in future events.
            <br />
            Our rating system considers factors like the recency of the feedback and the attendees overall experience.
          </div>

          
        </div>

        <div className="w-1/2 pl-8"> {/* Right column */}
          {/* Feedback Comments */}
          <div className="space-y-4 mb-8">
            {/* John Doe Feedback */}
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <img src="https://via.placeholder.com/30" alt="John Doe" className="rounded-full w-8 h-8 mr-2" />
                  <div className="font-medium ">John Doe</div>
                </div>
                <div className="flex text-yellow-500">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
              </div>
              <div className="text-sm  mb-2">November 18 2023 at 15:35</div>
              <div className=" mb-3">
                The keynote speaker was inspiring, and the networking opportunities were invaluable. The sessions were well-organized and informative.
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm ">
                  <button className="hover:underline mr-4">Reply</button>
                  <button className="hover:underline">Report</button>
                </div>
                
              </div>
            </div>

            {/* Jane Smith Feedback */}
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <img src="https://via.placeholder.com/30" alt="Jane Smith" className="rounded-full w-8 h-8 mr-2" />
                  <div className="font-medium ">Jane Smith</div>
                </div>
                <div className="flex text-yellow-500">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>☆</span>
                </div>
              </div>
              <div className="text-sm  mb-2">November 19 2023 at 10:00</div>
              <div className=" mb-3">
                The conference was well-organized, but the venues Wi-Fi was unreliable, which made it difficult to access some of the online resources. The catering could also have been better.
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm ">
                  <button className="hover:underline mr-4">Reply</button>
                  <button className="hover:underline">Report</button>
                </div>
                
              </div>
            </div>
          </div>

          {/* Feedback Input */}
          <div className="border-t border-gray-200 pt-6">
            <div className="mb-3 font-medium ">Rating:</div>
            <div className="flex text-3xl text-yellow-500 mb-4">
              <span>☆</span>
              <span>☆</span>
              <span>☆</span>
              <span>☆</span>
              <span>☆</span>
            </div>
            <textarea
              placeholder="Write your feedback..."
              className="w-full p-3 border border-gray-300 rounded-md text-sm  focus:ring-blue-500 focus:border-blue-500 mb-4"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md">
                Post Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConferenceFeedback;