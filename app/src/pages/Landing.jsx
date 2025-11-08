

import React from 'react';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-800 to-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to Joy's Birthday Hunt!</h1>
      <p className="text-lg mb-8">Join us on an exciting scavenger hunt adventure.</p>
      <button className="bg-gold-500 hover:bg-gold-700 text-black font-bold py-2 px-4 rounded">
        Begin the Hunt
      </button>
    </div>
  );
};

export default LandingPage;
