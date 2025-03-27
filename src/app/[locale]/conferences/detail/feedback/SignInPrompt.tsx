// src/components/Feedback/SignInPrompt.tsx
import React from 'react';

interface SignInPromptProps {
    onSignInClick: () => void;
}

const SignInPrompt: React.FC<SignInPromptProps> = ({ onSignInClick }) => {
    return (
        <div className='border-t border-gray-200 pt-6 text-center sm:text-left'>
            <p className='mb-2 text-gray-600'>
                Want to share your feedback?
            </p>
            <p className='mb-4 text-gray-600'>
                Please sign in to post your feedback.
            </p>
            <button
                className='rounded-md bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600'
                onClick={onSignInClick}
            >
                Sign In
            </button>
        </div>
    );
};

export default SignInPrompt;