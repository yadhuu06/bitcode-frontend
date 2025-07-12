import { Trophy } from 'lucide-react';

const ImmediateResultModal = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-green-500 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-green-500 mb-4 text-center">Congratulations!</h2>
        <div className="space-y-4">
          <p className="text-sm text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            You finished  {result.position}!
          </p>
          <p className="text-sm text-gray-400">
            Completed: {new Date(result.completion_time).toLocaleTimeString()}
          </p>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-green-500 text-black font-semibold py-2 px-4 rounded-lg hover:bg-green-400 transition-colors"
          >
            Close
          </button>
        </div>
        <p className="text-sm text-gray-400 text-center mt-4">Navigating to rooms in 3 seconds...</p>
      </div>
    </div>
  );
};

export default ImmediateResultModal;