import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';
import { toast } from 'react-toastify';
import { fetchUserContributions } from '../../services/ProfileService';

const ContributionsSection = () => {
  const navigate = useNavigate();
  const [contributions, setContributions] = useState({
    problems_submitted: 0,
    solutions_accepted: 0,
    recent_contributions: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContributions = async () => {
      setLoading(true);
      try {
        const data = await fetchUserContributions();
        setContributions(data);
      } catch (err) {
        toast.error('Failed to load contributions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadContributions();
  }, []);

  return (
    <div className="bg-black bg-opacity-20 backdrop-blur-md p-4 rounded-md border border-blue-900 shadow-lg">
      <h2 className="text-xl font-mono text-[#73ff00] mb-4">Contributions</h2>
      {loading ? (
        <p className="text-gray-300">Loading contributions...</p>
      ) : (
        <div className="space-y-4 text-gray-300 font-mono">
          <div className="flex items-center justify-between">
            <span>Problems Submitted</span>
            <span>{contributions.problems_submitted}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Solutions Accepted</span>
            <span>{contributions.solutions_accepted}</span>
          </div>
          {contributions.recent_contributions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-blue-600 mb-2">Recent Contributions</h3>
              <ul className="list-disc pl-4">
                {contributions.recent_contributions.map((contrib, index) => (
                  <li key={index}>
                    {contrib.type} "{contrib.title}" - {contrib.date}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => navigate(ROUTES.USER_CONTRIBUTE)}
            className="mt-2 px-4 py-2 bg-blue-600 text-black font-mono rounded hover:bg-blue-700 transition duration-200"
          >
            Contribute New Question
          </button>
        </div>
      )}
    </div>
  );
};

export default ContributionsSection;