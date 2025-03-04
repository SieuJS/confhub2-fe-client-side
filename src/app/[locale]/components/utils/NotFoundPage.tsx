import React from 'react';
import Button from './Button';
import Link from 'next/link';

const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-background to-background-secondary min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl mb-8">
          Oops! Page not found.
        </p>
        <p className="mb-8">
          The page you are looking for might be temporarily unavailable or does not exist.
        </p>
        <Link href={`/`} >
          <Button variant="primary" size="large" rounded className="ml-2">
            Go back to homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;