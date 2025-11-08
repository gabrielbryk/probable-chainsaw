

import React, { useState } from 'react';
import { useQuery, useAction, getCurrentRiddle, submitAnswer, requestHint } from 'wasp/client/operations';

const RiddlePage = () => {
  const { data: riddle, isLoading, error } = useQuery(getCurrentRiddle);
  const submitAnswerFn = useAction(submitAnswer);
  const requestHintFn = useAction(requestHint);
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState(null);
  const [feedback, setFeedback] = useState(null);

  if (isLoading) return 'Loading...';
  if (error) return 'Error: ' + error;

  const handleSubmitAnswer = async () => {
    const response = await submitAnswerFn({ riddleId: riddle.id, answer });
    setFeedback(response.message);
    if (response.success) {
      setAnswer('');
    }
  };

  const handleRequestHint = async () => {
    const response = await requestHintFn();
    setHint(response.hint);
  };

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">{riddle.title}</h1>
      <p className="mb-2">Difficulty: {riddle.difficulty}</p>
      <p className="mb-4">{riddle.narrative}</p>
      <input
        type="text"
        placeholder="Your answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        onClick={handleSubmitAnswer}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Submit Answer
      </button>
      {feedback && <p className="mb-4">{feedback}</p>}
      <button
        onClick={handleRequestHint}
        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Request Hint
      </button>
      {hint && <p className="mt-4">Hint: {hint}</p>}
    </div>
  );
};

export default RiddlePage;
