import React from 'react';

const AIAbilities = () => {
  return (
    <div className="bg-gray-900 text-white flex flex-col items-center gap-6 p-4">

      {/* Row 1 */}
      <div className="flex flex-wrap justify-center gap-6">
        {/* EASE OF USE */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 w-full md:w-[350px] lg:w-[350px]">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">EASE OF USE</h3>
          <h2 className="text-2xl font-semibold text-white mb-4">Complex requests solved simply</h2>
          <p className="text-gray-400 text-sm">
            While your questions may be complex, the tool you use to answer them shouldnt be.
            Thats why Research AI is designed to give you exactly the valuable insights youre looking for,
            regardless of your experience with AI or Statista, what language you speak, or how specific your search is.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="border border-gray-700 rounded-md p-2 w-full">
              <h4 className="text-gray-300 text-sm font-medium">The most spoken languages <br /> worldwide in 2023 <br /> <span className="text-xs text-gray-500">(by speakers in millions)</span></h4>
              <img
                src="https://i.imgur.com/QeJt13g.png"
                alt="Most Spoken Languages"
                className="w-full"
              />
            </div>
            <div className="border border-gray-700 rounded-md p-2 w-full">
              <h4 className="text-gray-300 text-sm font-medium">How many languages <br /> do you speak?</h4>
              <img
                src="https://i.imgur.com/XU2hU1s.png"
                alt="How Many Languages"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* EFFICIENCY */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 w-full md:w-[350px] lg:w-[350px]">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">EFFICIENCY</h3>
          <h2 className="text-2xl font-semibold text-white mb-4">Your shortcut to lasting good decisions</h2>
          <p className="text-gray-400 text-sm">
            Time is money, as they say, so urgency is key. However, its a real shame to see your savings go up in smoke due
            to poor decisions. Research AI offers a double advantage: find insights in the blink of an eye that will
            lead you to eternally sound decisions.
          </p>

          <div className="mt-4 border border-gray-700 rounded-md p-2">
            <h4 className="text-gray-300 text-sm font-medium">Average time to insights</h4>
            <p className="text-gray-400 text-xs mb-2">Split by different steps during a typical research, in minutes</p>
            <img
              src="https://i.imgur.com/M9Y1n0J.png"
              alt="Average time to insights"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex flex-wrap justify-center gap-6">
        {/* QUALITY */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 w-full md:w-[350px] lg:w-[350px]">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">QUALITY</h3>
          <h2 className="text-2xl font-semibold text-white mb-4">Half human, half AI</h2>
          <p className="text-gray-400 text-sm">
            The decisions you are facing are too important to be made on the basis of opaque, possibly erroneous data.
            With Research AI, artificial and human intelligence work hand in hand to create unique synergies: the AI presents
            you with data that has been curated and carefully checked by Statista experts.
          </p>
          <div className="mt-4 p-2 bg-gray-700 rounded-md text-gray-300 text-xs">
            The best solution to transform complex data into understandable insights: Research AI.
          </div>
        </div>

        {/* INNOVATION */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 w-full md:w-[350px] lg:w-[350px]">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">INNOVATION</h3>
          <h2 className="text-2xl font-semibold text-white mb-4">Uniquely customized</h2>
          <p className="text-gray-400 text-sm">
            Knowledge is not the same as insight. However, reliable decisions can only be made on the basis of real findings that
            meet individual requirements. Unlike generic statistical AIs, Research AI provides you with a customized narrative based on
            high-quality data collected and/or verified by Statista experts. In other words, it gives you real insight.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <button className="bg-gray-700 text-gray-300 text-xs px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none">Semantic Search Embeddings</button>
            <button className="bg-gray-700 text-gray-300 text-xs px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none">Large Language Models (LLMs)</button>
            <button className="bg-gray-700 text-gray-300 text-xs px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none">Retrieval Augmented Generation (RAG)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAbilities;