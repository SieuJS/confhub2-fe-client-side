"use client";

import React, { useState, useEffect } from 'react';

const AIFAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'getting-started' | 'functionality-features' | 'general'>('getting-started');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [titleVisible, setTitleVisible] = useState(false);

  type CategoryKey = 'getting-started' | 'functionality-features' | 'general';

  const questions: { [key in CategoryKey]: { question: string; answer: string }[] } = {
    'getting-started': [
      {
        question: 'What is the difference between Research AI and the Statista search?',
        answer: "Research AI and Statista search differ significantly in terms of technology and user experience. Powered by AI technologies such as Claude 3 Sonnet, Research AI uses semantic search and Cohere's Large Language Model (LLM) for nuanced understanding and tailored, context-relevant responses. It interprets user intent to provide comprehensive answers from a vast dataset. In contrast, Statista search is a keyword-based tool for finding specific data points and content. The search provides a list of relevant content for the user to get closer to the insight."
      },
      {
        question: 'How reliable are the answers from Research AI?',
        answer: 'Research AI aims to provide accurate and up-to-date answers by leveraging a vast dataset and advanced AI technologies. However, as with any AI-driven tool, it is important to critically evaluate the information and consider it in conjunction with other reliable sources.'
      },
    ],
    'functionality-features': [
      {
        question: 'What types of content are used to generate my response?',
        answer: 'Research AI utilizes a diverse range of content, including reports, studies, articles, and datasets, to generate comprehensive and context-relevant responses.'
      },
      {
        question: 'Is data from the Company Insights and Consumer Insights also included in Research AI?',
        answer: 'In its initial version, Research AI does not incorporate data from the Company Insights and Consumer Insights products. For information specific to these areas, users are advised to utilize the dedicated tools provided for Company Insights and Consumer Insights directly.'
      },
    ],
    'general': [
      {
        question: 'How many languages are supported by Research AI?',
        answer: 'Research AI currently supports English and is continuously expanding language support to cater to a global audience.'
      },
      {
        question: 'How can I provide feedback or report an issue with Research AI?',
        answer: 'You can provide feedback or report issues directly through the platform. Look for the feedback link in the interface.'
      },
    ],
  };

  const getQuestionsForCategory = (category: CategoryKey): { question: string; answer: string }[] => {
    return questions[category] || [];
  };

  const categoryIcons = {
    'getting-started': (
      <svg className="text-gray-400 mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1m-12 0h-1m7 4h1m-7-4h-1m-1 4l-1-1m1-4l-1 1m4-4l-1 1m-1 4l1 1" />
      </svg>
    ),
    'functionality-features': (
      <svg className="text-gray-400 mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3.285a9 9 0 110 17.43 9 9 0 010-17.43z" />
      </svg>
    ),
    'general': (
      <svg className="text-gray-400 mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  };

  useEffect(() => {
    // Trigger the animation after the component mounts
    setTimeout(() => {
      setTitleVisible(true);
    }, 100); // A small delay to ensure component is mounted
  }, []);


  const titleClasses = `text-4xl font-semibold text-gray-100 mt-2 transition-opacity duration-500 ${titleVisible ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div className="bg-gray-900 text-white min-h-screen py-12 px-6">
      <div className="container mx-auto">
        {/* Title */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-blue-400">FAQ</h2>
          <h1 className={titleClasses}>You have the questions, we <br /> have the answers</h1>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left Side - Category List */}
          <div className="flex flex-col">
            <div
              className={`bg-gray-800 rounded-md shadow-sm p-4 cursor-pointer hover:shadow-md transition duration-200 ${activeCategory === 'getting-started' ? 'shadow-md border-2 border-blue-500' : ''}`}
              onClick={() => setActiveCategory('getting-started')}
            >
              <div className="flex items-center">
                {categoryIcons['getting-started']}
                <span className="text-gray-300 font-medium">Getting started</span>
              </div>
            </div>
            <div
              className={`bg-gray-800 rounded-md shadow-sm p-4 mt-4 cursor-pointer hover:shadow-md transition duration-200 ${activeCategory === 'functionality-features' ? 'shadow-md border-2 border-blue-500' : ''}`}
              onClick={() => setActiveCategory('functionality-features')}
            >
              <div className="flex items-center">
                {categoryIcons['functionality-features']}
                <span className="text-gray-300 font-medium">Functionality & features</span>
              </div>
            </div>
            <div
              className={`bg-gray-800 rounded-md shadow-sm p-4 mt-4 cursor-pointer hover:shadow-md transition duration-200 ${activeCategory === 'general' ? 'shadow-md border-2 border-blue-500' : ''}`}
              onClick={() => setActiveCategory('general')}
            >
              <div className="flex items-center">
                {categoryIcons['general']}
                <span className="text-gray-300 font-medium">General</span>
              </div>
            </div>
          </div>

          {/* Right Side - Questions */}
          <div className="flex flex-col">
            {getQuestionsForCategory(activeCategory).map((item, index) => (
              <div key={index} className="mb-2">
                <div
                  className="py-3 cursor-pointer hover:bg-gray-700 rounded-md px-4 flex items-center justify-between"
                  onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                >
                  <span className="text-gray-300">{item.question}</span>
                  <svg
                    className={`text-gray-400 h-4 w-4 transition-transform duration-200 ${expandedQuestion === index ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {expandedQuestion === index && (
                  <div className="bg-gray-800 rounded-md p-4 text-gray-400">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFAQ;