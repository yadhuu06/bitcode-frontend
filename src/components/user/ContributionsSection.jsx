import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ContributionsSection = ({ isAdmin }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl">
      <h2 className="text-lg font-mono text-green-500 mb-4">Contributions</h2>
      <div className="space-y-4 text-white font-mono">
        <div className="flex justify-between">
          <span>Problems Submitted</span>
          <span>3</span>
        </div>
        <div className="flex justify-between">
          <span>Solutions Accepted</span>
          <span>28</span>
        </div>
        <div className="flex justify-between">
          <span>Forum Posts</span>
          <span>12</span>
        </div>
        <div className="mt-4">
          <h3 className="text-green-500 mb-2">Recent Contributions</h3>
          <ul className="list-disc pl-5">
            <li>Submitted "Reverse Linked List" - 2025-06-01</li>
            <li>Answered "How to optimize BFS?" - 2025-06-03</li>
            <li>Solution accepted for "Matrix Spiral" - 2025-06-07</li>
          </ul>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/contribute/question')}
            className="border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Contribute New Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContributionsSection;