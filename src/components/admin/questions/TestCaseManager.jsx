import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Search, Save, X, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchTestCases, createTestCase, updateTestCase, deleteTestCase } from '../../../services/ProblemService';
import { toast } from 'react-toastify';

const TestCaseManager = () => {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const [testCases, setTestCases] = useState([]);
  const [newTestCase, setNewTestCase] = useState({
    input_data: '',
    expected_output: '',
    is_sample: false,
    order: 0,
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterSample, setFilterSample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchTestCases(questionId, page, pageSize, search, filterSample);
        setTestCases(response.results || []);
        setTotalPages(Math.ceil(response.count / pageSize));
      } catch (error) {
        const errorData = JSON.parse(error.message);
        toast.error(errorData.error || 'Failed to fetch test cases');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [questionId, page, pageSize, search, filterSample]);

  const handleNewTestCaseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTestCase((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddTestCase = async () => {
    try {
      setLoading(true);
      setErrors({});
      const response = await createTestCase(questionId, newTestCase);
      setTestCases((prev) => [...prev, response.data]);
      setNewTestCase({ input_data: '', expected_output: '', is_sample: false, order: testCases.length });
      toast.success('Test case added successfully');
    } catch (error) {
      const errorData = JSON.parse(error.message);
      if (errorData.input_data || errorData.expected_output || errorData.order) {
        setErrors(errorData);
      } else {
        toast.error(errorData.error || 'Failed to add test case');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTestCase = async (testCaseId, data) => {
    try {
      setLoading(true);
      const response = await updateTestCase(questionId, testCaseId, data);
      setTestCases((prev) =>
        prev.map((tc) => (tc.id === testCaseId ? response.data : tc))
      );
      toast.success('Test case updated successfully');
    } catch (error) {
      const errorData = JSON.parse(error.message);
      toast.error(errorData.error || 'Failed to update test case');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestCase = async (testCaseId) => {
    try {
      setLoading(true);
      await deleteTestCase(questionId, testCaseId);
      setTestCases((prev) => prev.filter((tc) => tc.id !== testCaseId));
      toast.success('Test case deleted successfully');
    } catch (error) {
      const errorData = JSON.parse(error.message);
      toast.error(errorData.error || 'Failed to delete test case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 text-white">
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate(`/admin/questions/edit/${questionId}`)}
          className="text-gray-400 hover:text-[#73E600] transition-colors duration-300"
          aria-label="Go back to question edit"
          title="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-[#73E600] font-sans flex items-center gap-2">
          <span className="text-white">{'<'}</span>
          Manage Test Cases
          <span className="text-white">{'/>'}</span>
        </h1>
      </header>

      <div className="bg-gray-900/80 p-6 rounded-lg border-[1.5px] border-[#73E600] shadow-[0_0_15px_rgba(115,230,0,0.3)]">
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Search Test Cases</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by input or output..."
                className="w-full bg-black text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-[#73E600] focus:outline-none pl-10 py-2 font-mono transition-all duration-300"
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Filter by Sample</label>
            <select
              value={filterSample === null ? '' : filterSample}
              onChange={(e) => setFilterSample(e.target.value === '' ? null : e.target.value === 'true')}
              className="w-full bg-black text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-[#73E600] focus:outline-none px-4 py-2 font-mono transition-all duration-300"
              disabled={loading}
            >
              <option value="">All</option>
              <option value="true">Sample</option>
              <option value="false">Non-Sample</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Add New Test Case</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black rounded-lg border border-gray-700/50 shadow-[0_0_10px_rgba(115,230,0,0.2)]">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Input</label>
              <input
                type="text"
                name="input_data"
                value={newTestCase.input_data}
                onChange={handleNewTestCaseChange}
                placeholder="Enter input data"
                className={`w-full bg-gray-900/80 text-white text-sm rounded-lg border ${
                  errors.input_data ? 'border-red-500' : 'border-gray-700/50'
                } focus:ring-2 focus:ring-[#73E600] focus:outline-none px-4 py-2 font-mono transition-all duration-300`}
                disabled={loading}
              />
              {errors.input_data && <p className="text-red-400 text-xs mt-1">{errors.input_data}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Expected Output</label>
              <input
                type="text"
                name="expected_output"
                value={newTestCase.expected_output}
                onChange={handleNewTestCaseChange}
                placeholder="Enter expected output"
                className={`w-full bg-gray-900/80 text-white text-sm rounded-lg border ${
                  errors.expected_output ? 'border-red-500' : 'border-gray-700/50'
                } focus:ring-2 focus:ring-[#73E600] focus:outline-none px-4 py-2 font-mono transition-all duration-300`}
                disabled={loading}
              />
              {errors.expected_output && <p className="text-red-400 text-xs mt-1">{errors.expected_output}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sample</label>
              <input
                type="checkbox"
                name="is_sample"
                checked={newTestCase.is_sample}
                onChange={handleNewTestCaseChange}
                className="bg-gray-900/80 text-[#73E600] rounded border border-gray-700/50 focus:ring-2 focus:ring-[#73E600] transition-all duration-300"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Order</label>
              <input
                type="number"
                name="order"
                value={newTestCase.order}
                onChange={handleNewTestCaseChange}
                className={`w-full bg-gray-900/80 text-white text-sm rounded-lg border ${
                  errors.order ? 'border-red-500' : 'border-gray-700/50'
                } focus:ring-2 focus:ring-[#73E600] focus:outline-none px-4 py-2 font-mono transition-all duration-300`}
                disabled={loading}
              />
              {errors.order && <p className="text-red-400 text-xs mt-1">{errors.order}</p>}
            </div>
            <div className="flex items-end">
              <div className="group relative">
                <button
                  onClick={handleAddTestCase}
                  className="p-2 bg-gray-900/80 text-[#73E600] rounded-lg border border-gray-700/50 hover:bg-[#73E600] hover:text-black transition-all duration-300"
                  disabled={loading}
                  aria-label="Add test case"
                  title="Add"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  Add
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Test Cases</label>
          {loading ? (
            <p className="text-gray-400 text-center">Loading test cases...</p>
          ) : testCases.length === 0 ? (
            <p className="text-gray-400 text-center">No test cases found.</p>
          ) : (
            <div className="space-y-4">
              {testCases.map((testCase) => (
                <TestCaseRow
                  key={testCase.id}
                  testCase={testCase}
                  onUpdate={(data) => handleUpdateTestCase(testCase.id, data)}
                  onDelete={() => handleDeleteTestCase(testCase.id)}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="group relative">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 bg-gray-900/80 text-[#73E600] rounded-lg border border-gray-700/50 hover:bg-[#73E600] hover:text-black transition-all duration-300 disabled:opacity-50"
              disabled={loading || page === 1}
              aria-label="Previous page"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Previous
            </span>
          </div>
          <span className="text-gray-400 text-sm">
            Page {page} of {totalPages}
          </span>
          <div className="group relative">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="p-2 bg-gray-900/80 text-[#73E600] rounded-lg border border-gray-700/50 hover:bg-[#73E600] hover:text-black transition-all duration-300 disabled:opacity-50"
              disabled={loading || page === totalPages}
              aria-label="Next page"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Next
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestCaseRow = ({ testCase, onUpdate, onDelete, loading }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...testCase });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = () => {
    onUpdate(formData);
    setEditing(false);
  };

  return (
    <div className="p-4 bg-black rounded-lg border border-gray-700/50 shadow-[0_0_10px_rgba(115,230,0,0.2)]">
      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Input</label>
            <input
              type="text"
              name="input_data"
              value={formData.input_data}
              onChange={handleChange}
              className="w-full bg-gray-900/80 text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-[#73E600] focus:outline-none px-4 py-2 font-mono transition-all duration-300"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Expected Output</label>
            <input
              type="text"
              name="expected_output"
              value={formData.expected_output}
              onChange={handleChange}
              className="w-full bg-gray-900/80 text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-[#73E600] focus:outline-none px-4 py-2 font-mono transition-all duration-300"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Sample</label>
            <input
              type="checkbox"
              name="is_sample"
              checked={formData.is_sample}
              onChange={handleChange}
              className="bg-gray-900/80 text-[#73E600] rounded border border-gray-700/50 focus:ring-2 focus:ring-[#73E600] transition-all duration-300"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="w-full bg-gray-900/80 text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-[#73E600] focus:outline-none px-4 py-2 font-mono transition-all duration-300"
              disabled={loading}
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="group relative">
              <button
                onClick={handleSubmit}
                className="p-2 bg-gray-900/80 text-[#73E600] rounded-lg border border-gray-700/50 hover:bg-[#73E600] hover:text-black transition-all duration-300"
                disabled={loading}
                aria-label="Save test case"
                title="Save"
              >
                <Save className="w-5 h-5" />
              </button>
              <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Save
              </span>
            </div>
            <div className="group relative">
              <button
                onClick={() => setEditing(false)}
                className="p-2 bg-gray-900/80 text-[#73E600] rounded-lg border border-gray-700/50 hover:bg-[#73E600] hover:text-black transition-all duration-300"
                disabled={loading}
                aria-label="Cancel editing"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Cancel
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 space-y-2">
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">Input:</span> {testCase.input_data}
            </p>
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">Output:</span> {testCase.expected_output}
            </p>
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">Sample:</span> {testCase.is_sample ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">Order:</span> {testCase.order}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="group relative">
              <button
                onClick={() => setEditing(true)}
                className="p-2 bg-gray-900/80 text-[#73E600] rounded-lg border border-gray-700/50 hover:bg-[#73E600] hover:text-black transition-all duration-300"
                disabled={loading}
                aria-label="Edit test case"
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </button>
              <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Edit
              </span>
            </div>
            <div className="group relative">
              <button
                onClick={onDelete}
                className="p-2 bg-gray-900/80 text-[#73E600] rounded-lg border border-gray-700/50 hover:bg-red-600 hover:text-white transition-all duration-300"
                disabled={loading}
                aria-label="Delete test case"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Delete
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseManager;