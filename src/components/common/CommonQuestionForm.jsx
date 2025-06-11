import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MDEditor from '@uiw/react-md-editor';
import { X, PlusSquare } from 'lucide-react';

const CommonQuestionForm = ({
  initialData,
  examples: initialExamples,
  testCases: initialTestCases,
  isEditMode,
  onSubmit,
  onCancel,
  errors,
  loading,
  tags,
  difficultyOptions,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [examples, setExamples] = useState(initialExamples);
  const [testCases, setTestCases] = useState(initialTestCases);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleExampleChange = (index, field, value) => {
    setExamples((prev) => {
      const newExamples = [...prev];
      newExamples[index] = { ...newExamples[index], [field]: value };
      return newExamples;
    });
  };

  const addExample = () => {
    setExamples((prev) => [...prev, { input_example: '', output_example: '', explanation: '', order: prev.length }]);
  };

  const removeExample = (index) => {
    setExamples((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index, field, value) => {
    setTestCases((prev) => {
      const newTestCases = [...prev];
      newTestCases[index] = { ...newTestCases[index], [field]: value };
      return newTestCases;
    });
  };

  const addTestCase = () => {
    setTestCases((prev) => [...prev, { input_data: '', expected_output: '', is_sample: false, order: prev.length }]);
  };

  const removeTestCase = (index) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (testCases.length === 0) {
      return;
    }
    onSubmit({ ...formData, examples, test_cases: testCases });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-mono text-gray-100">
      {/* Title */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter question title"
          className="w-full bg-[#252525] text-gray-100 text-sm rounded-lg border border-[#2d2d2d] px-4 py-2"
          disabled={loading}
        />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Description</label>
        <MDEditor
          value={formData.description}
          onChange={handleDescriptionChange}
          preview="edit"
          height={200}
          className="bg-[#252525] rounded-lg"
          disabled={loading}
        />
        {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
      </div>

      {/* Tags and Difficulty in a Single Row */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        {/* Tags (Left) */}
        <div className="flex-1">
          <label className="block text-sm text-gray-300 mb-2">Tags</label>
          <select
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full bg-[#252525] text-gray-100 text-sm rounded-lg border border-[#2d2d2d] px-4 py-2"
            disabled={loading}
          >
            {tags.map((tag) => (
              <option key={tag.value} value={tag.value}>
                {tag.label}
              </option>
            ))}
          </select>
          {errors.tags && <p className="text-red-400 text-xs mt-1">{errors.tags}</p>}
        </div>

        {/* Difficulty (Right) */}
        <div className="flex-1">
          <label className="block text-sm text-gray-300 mb-2">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full bg-[#252525] text-gray-100 text-sm rounded-lg border border-[#2d2d2d] px-4 py-2"
            disabled={loading}
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.difficulty && <p className="text-red-400 text-xs mt-1">{errors.difficulty}</p>}
        </div>
      </div>

      {/* Examples */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Examples</label>
        {examples.map((example, index) => (
          <div key={index} className="mb-4 p-5 bg-[#252525] rounded-lg border border-[#2d2d2d] relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Input</label>
                <input
                  type="text"
                  value={example.input_example}
                  onChange={(e) => handleExampleChange(index, 'input_example', e.target.value)}
                  placeholder="Enter input example"
                  className="w-full bg-[#252525] text-gray-100 text-sm rounded-lg border border-[#2d2d2d] px-4 py-2"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Output</label>
                <input
                  type="text"
                  value={example.output_example}
                  onChange={(e) => handleExampleChange(index, 'output_example', e.target.value)}
                  placeholder="Enter output example"
                  className="w-full bg-[#252525] text-gray-100 text-sm rounded-lg border border-[#2d2d2d] px-4 py-2"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-xs text-gray-300 mb-1">Explanation</label>
              <textarea
                value={example.explanation}
                onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                placeholder="Enter explanation"
                className="w-full bg-[#252525] text-gray-100 text-sm rounded-lg border border-[#2d2d2d] px-4 py-2"
                disabled={loading}
              />
            </div>
            <button
              onClick={() => removeExample(index)}
              disabled={loading || examples.length === 1}
              className={`absolute top-2 right-2 text-gray-300 hover:text-red-400 ${loading || examples.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          onClick={addExample}
          disabled={loading}
          className={`text-gray-300 hover:text-green-400 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <PlusSquare className="w-6 h-6" />
        </button>
        {errors.examples && <p className="text-red-400 text-xs mt-1">{errors.examples}</p>}
      </div>

      {/* Test Cases */}
      <div>
        <label className="block text-sm text-gray-300 mb-2">Test Cases (At least one required)</label>
        {testCases.map((test, index) => (
          <div key={index} className="mb-4 p-5 bg-[#252525] rounded-lg border border-[#2d2d2d] relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Input</label>
                <input
                  type="text"
                  value={test.input_data}
                  onChange={(e) => handleTestCaseChange(index, 'input_data', e.target.value)}
                  placeholder="Enter input data"
                  className="w-full bg-[#252525] text-gray-100 text-sm rounded-lg border border-[#2d2d2d] px-4 py-2"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Expected Output</label>
                <input
                  type="text"
                  value={test.expected_output}
                  onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                  placeholder="Enter expected output"
                  className="w-full bg-[#252525] text-gray-100 text-sm rounded-lg border border-[#2d2d2d] px-4 py-2"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="mt-2">
              <label className="flex items-center text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={test.is_sample}
                  onChange={(e) => handleTestCaseChange(index, 'is_sample', e.target.checked)}
                  className="mr-2"
                  disabled={loading}
                />
                Sample Test Case
              </label>
            </div>
            <button
              onClick={() => removeTestCase(index)}
              disabled={loading || testCases.length === 1}
              className={`absolute top-2 right-2 text-gray-300 hover:text-red-400 ${loading || testCases.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          onClick={addTestCase}
          disabled={loading}
          className={`text-gray-300 hover:text-green-400 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <PlusSquare className="w-6 h-6" />
        </button>
        {errors.test_cases && <p className="text-red-400 text-xs mt-1">{errors.test_cases}</p>}
      </div>

      {/* Buttons */}
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 bg-green-500 text-black py-2 rounded-lg hover:bg-green-400 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Submitting...' : isEditMode ? 'Update Question' : 'Next: Submit Solution'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={`flex-1 border border-green-500 text-green-500 py-2 rounded-lg hover:bg-green-500 hover:text-black ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Cancel
        </button>
      </div>
      {errors.general && <p className="text-red-400 text-xs mt-1">{errors.general}</p>}
    </form>
  );
};

CommonQuestionForm.propTypes = {
  initialData: PropTypes.object.isRequired,
  examples: PropTypes.array.isRequired,
  testCases: PropTypes.array,
  isEditMode: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  errors: PropTypes.object,
  loading: PropTypes.bool,
  tags: PropTypes.array.isRequired,
  difficultyOptions: PropTypes.array.isRequired,
};

export default CommonQuestionForm;