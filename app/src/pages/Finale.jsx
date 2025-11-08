

import React from 'react';
import { useQuery, getEffectEvents } from 'wasp/client/operations';

const FinalePage = () => {
  const { data: events, isLoading, error } = useQuery(getEffectEvents);

  if (isLoading) return 'Loading...';
  if (error) return 'Error: ' + error;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-700 to-black text-white">
      <h1 className="text-4xl font-bold mb-4">Congratulations!</h1>
      <p className="text-lg mb-8">You've completed the Joy Hunt!</p>
      <div className="flex gap-4">
        <button className="bg-gold-500 hover:bg-gold-700 text-black font-bold py-2 px-4 rounded">
          Replay Celebration
        </button>
        <button className="bg-gold-500 hover:bg-gold-700 text-black font-bold py-2 px-4 rounded">
          End Hunt
        </button>
      </div>
      <div className="mt-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Recent Events</h2>
        <ul className="space-y-2">
          {events.map(event => (
            <li key={event.id} className="bg-slate-800 p-4 rounded-lg">
              <p><strong>Type:</strong> {event.type}</p>
              <p><strong>Details:</strong> {event.details}</p>
              <p><strong>Timestamp:</strong> {new Date(event.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FinalePage;
