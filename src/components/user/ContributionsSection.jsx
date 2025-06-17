
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';
import { toast } from 'react-toastify';
import { fetchUserContributions } from '../../services/ProfileService';
import { CheckCircle, XCircle ,Plus} from 'lucide-react';

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
    <div className="bg-black bg-opacity-30 backdrop-blur-lg p-6 rounded-lg border border-green-500 max-w-3xl mx-auto">
      <h2 className="text-2xl font-mono text-green-500 mb-6 animate-glitch">Contributions</h2>
      {loading ? (
        <p className="text-white font-mono animate-pulse">Initializing Data...</p>
      ) : (
        <div className="space-y-6">
          <table className="w-full text-white font-mono text-sm">
            <tbody>
              <tr className="border-b border-gray-700 hover:bg-green-500/10 transition duration-200">
                <td className="py-2 px-4 text-white">Problems Submitted</td>
                <td className="py-2 px-4 text-green-500 text-right">{contributions.problems_submitted}</td>
              </tr>
              <tr className="border-b border-gray-700 hover:bg-green-500/10 transition duration-200">
                <td className="py-2 px-4 text-white">Solutions Accepted</td>
                <td className="py-2 px-4 text-green-500 text-right">{contributions.solutions_accepted}</td>
              </tr>
              {contributions.recent_contributions.length > 0 && (
                <tr>
                  <td colSpan="2" className="py-2 px-4">
                    <h3 className="text-green-500 mb-2">Recent Contributions</h3>
                    <ul className="list-none space-y-2">
                      {contributions.recent_contributions.map((contrib, index) => (
                        <li
                          key={index}
                          className={`flex justify-between items-center p-2 bg-gray-900 rounded-md border border-green-500 hover:bg-green-500/10 transition duration-200 relative ${
                            contrib.status === 'Accepted' || contrib.status === 'Rejected' ? 'group' : ''
                          }`}
                        >
                          <span className="t">
                            name: "{contrib.title}"
                          </span>
                          <span className="flex items-center text-white text-xs">
                            {contrib.date} - {contrib.status}
                            {contrib.status === 'Accepted' && (
                              <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                            )}
                            {contrib.status === 'Rejected' && (
                              <XCircle className="ml-2 h-4 w-4 text-red-500" />
                            )}
                          </span>
                          {(contrib.status === 'Accepted' || contrib.status === 'Rejected') && (
                            <span className="absolute hidden group-hover:block bg-gray-800 text-green-500 text-xs px-2 py-1 rounded top-[-1.5rem] left-1/2 transform -translate-x-1/2">
                              {contrib.status}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button
  onClick={() => navigate(ROUTES.USER_CONTRIBUTE)}
className="mt-4 px-6 py-2 bg-transparent border-2 border-green-500 text-green-500 font-mono rounded-lg flex items-center gap-2 transition duration-300 hover:bg-black hover:text-white"
>
  <Plus size={18} /> Contribute
</button>

        </div>
      )}
     
    </div>
  );
};

export default ContributionsSection;
