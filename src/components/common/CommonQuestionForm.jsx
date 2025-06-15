import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, PlusSquare, X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import CustomButton from '../ui/CustomButton';
import { toast } from 'react-toastify';

const editorStyles = `
  .w-md-editor {
    background-color: #1a1a1a;
    border-radius: 0.5rem;
    border: 1px solid #2d2d2d;
    font-family: 'Fira Code', 'Roboto Mono', monospace;
    color: #e0e0e0;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }
  .w-md-editor-text textarea::placeholder {
    color: #6b7280 !important;
    font-style: italic;
    opacity: 0.8;
  }
  .w-md-editor-toolbar {
    background-color: #252525 !important;
    border-bottom: 1px solid #2d2d2d !important;
    border-radius: 0.5rem 0.5rem 0 0 !important;
    padding: 0.75rem;
  }
  .w-md-editor-toolbar button {
    color: #9ca3af !important;
    transition: color 0.2s ease, background-color 0.2s ease;
  }
  .w-md-editor-toolbar button:hover {
    color: #10b981 !important;
    background-color: rgba(16, 185, 129, 0.1) !important;
  }
  .w-md-editor-text {
    background-color: #1a1a1a !important;
  }
  .w-md-editor-text-container textarea {
    background-color: #1a1a1a !important;
    color: #f3f4f6 !important;
    font-size: 14px;
    line-height: 1.6;
    padding: 1rem;
    min-height: 320px;
    border-radius: 0 0 0.5rem 0.5rem;
  }
  .wmde-markdown {
    background-color: #1a1a1a !important;
    color: #e0e0e0 !important;
    font-family: 'Fira Code', 'Roboto Mono', monospace !important;
    font-size: 14px;
    padding: 1.25rem;
    line-height: 1.75;
  }
  .wmde-markdown h1, .wmde-markdown h2, .wmde-markdown h3 {
    color: #10b981;
    font-weight: 600;
  }
  .wmde-markdown code {
    background-color: #2d2d2d;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9em;
  }
  .wmde-markdown pre code {
    background-color: #1a1a1a;
    padding: 1.25rem;
    display: block;
    overflow-x: auto;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }
  .w-md-editor-fullscreen {
    background-color: #1a1a1a !important;
    z-index: 9999;
  }
  .w-md-editor:focus-within {
    outline: 1px solid #10b981 !important;
    outline-offset: 2px;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  }
  .w-md-editor-text-container {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
`;

const CommonQuestionForm = ({
  initialData,
  examples: initialExamples,
  testCases: initialTestCases = [],
  isEditMode,
  onSubmit,
  onCancel,
  errors,
  loading,
  tags,
  difficultyOptions,
  showTestCases = true,
  testCasesOnly = false, // New prop for test case-only mode
}) => {
  const [formData, setFormData] = useState(initialData);
  const [examples, setExamples] = useState(initialExamples);
  const [testCases, setTestCases] = useState(initialTestCases);
  const [localErrors, setLocalErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (localErrors[name]) {
      setLocalErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value || '' }));
    if (localErrors.description) {
      setLocalErrors((prev) => ({ ...prev, description: null }));
    }
  };

  const handleExampleChange = (index, field, value) => {
    setExamples((prev) => {
      const newExamples = [...prev];
      newExamples[index] = { ...newExamples[index], [field]: value };
      return newExamples;
    });
    if (localErrors[`example_${index}_${field}`]) {
      setLocalErrors((prev) => ({ ...prev, [`example_${index}_${field}`]: null }));
    }
  };

  const handleTestCaseChange = (index, field, value) => {
    setTestCases((prev) => {
      const newTestCases = [...prev];
      newTestCases[index] = { ...newTestCases[index], [field]: value };
      return newTestCases;
    });
    if (localErrors[`test_case_${index}_${field}`]) {
      setLocalErrors((prev) => ({ ...prev, [`test_case_${index}_${field}`]: null }));
    }
  };

  const addExample = () => {
    setExamples((prev) => [...prev, { input_example: '', output_example: '', explanation: '', order: prev.length }]);
  };

  const addTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { input_data: '', expected_output: '', is_sample: false, order: prev.length },
    ]);
  };

  const removeExample = (index) => {
    setExamples((prev) => prev.filter((_, i) => i !== index));
    setLocalErrors((prev) => {
      const updatedErrors = { ...prev };
      Object.keys(updatedErrors).forEach((key) => {
        if (key.startsWith(`example_${index}_`)) {
          delete updatedErrors[key];
        }
      });
      return updatedErrors;
    });
  };

  const removeTestCase = (index) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
    setLocalErrors((prev) => {
      const updatedErrors = { ...prev };
      Object.keys(updatedErrors).forEach((key) => {
        if (key.startsWith(`test_case_${index}_`)) {
          delete updatedErrors[key];
        }
      });
      return updatedErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!testCasesOnly) {
      // Validate title
      if (!formData.title.trim()) {
        newErrors.title = 'Question title cannot be empty';
      }

      // Validate description
      if (!formData.description.trim()) {
        newErrors.description = 'Description cannot be empty';
      }

      // Validate examples
      examples.forEach((example, index) => {
        if (!example.input_example.trim()) {
          newErrors[`example_${index}_input_example`] = 'Input example cannot be empty';
        }
        if (!example.output_example.trim()) {
          newErrors[`example_${index}_output_example`] = 'Output example cannot be empty';
        }
        if (!example.explanation.trim()) {
          newErrors[`example_${index}_explanation`] = 'Explanation cannot be empty';
        }
      });
    }

    // Validate test cases
    if (showTestCases || testCasesOnly) {
      testCases.forEach((testCase, index) => {
        if (!testCase.input_data.trim()) {
          newErrors[`test_case_${index}_input_data`] = 'Input data cannot be empty';
        }
        if (!testCase.expected_output.trim()) {
          newErrors[`test_case_${index}_expected_output`] = 'Expected output cannot be empty';
        }
      });
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (testCasesOnly) {
      onSubmit({ testCases });
    } else {
      onSubmit({ ...formData, examples, ...(showTestCases ? { testCases } : {}) });
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-black min-h-screen">
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={onCancel}
          className="text-gray-300 hover:text-green-400 transition-colors duration-200"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold text-green-400 font-['Roboto_Mono'] flex items-center gap-2">
          <span className="text-gray-200">{'<'}</span>
          {testCasesOnly ? 'Add Test Cases' : isEditMode ? 'Edit Question' : 'Create New Question'}
          <span className="text-gray-200">{'/>'}</span>
        </h1>
      </header>

      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2d2d2d] shadow-lg">
        {!testCasesOnly && (
          <>
            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2 font-['Roboto_Mono']">Question Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter question title"
                className={`w-full bg-[#252525] text-gray-100 text-sm rounded-lg border ${
                  errors.title || localErrors.title ? 'border-red-500' : 'border-[#2d2d2d]'
                } focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-3 font-['Roboto_Mono'] transition-all duration-200`}
                disabled={loading}
              />
              {(errors.title || localErrors.title) && (
                <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">
                  {errors.title || localErrors.title}
                </p>
              )}
            </div>

            <div className="mb-6" data-color-mode="dark">
              <label className="block text-sm text-gray-300 mb-2 font-['Roboto_Mono']">Description</label>
              <style>{editorStyles}</style>
              <MDEditor
                value={formData.description}
                onChange={handleDescriptionChange}
                height={320}
                placeholder="Write the question description in Markdown..."
                preview="live"
                className={`rounded-lg ${errors.description || localErrors.description ? 'border border-red-500' : ''}`}
                data-color-mode="dark"
                textareaProps={{
                  style: {
                    backgroundColor: '#1a1a1a',
                    color: '#f3f4f6',
                    caretColor: '#10b981',
                    fontFamily: "'Fira Code', 'Roboto Mono', monospace",
                    fontSize: '14px',
                    lineHeight: '1.6',
                  },
                  disabled: loading,
                }}
                previewOptions={{
                  style: {
                    backgroundColor: '#1a1a1a',
                    color: '#e0e0e0',
                    fontFamily: "'Fira Code', 'Roboto Mono', monospace",
                  },
                }}
              />
              {(errors.description || localErrors.description) && (
                <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">
                  {errors.description || localErrors.description}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2 font-['Roboto_Mono']">Examples</label>
              {examples.map((example, index) => (
                <div key={index} className="mb-4 p-5 bg-[#252525] rounded-lg border border-[#2d2d2d] relative shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-300 mb-1 font-['Roboto_Mono']">Input</label>
                      <input
                        type="text"
                        value={example.input_example}
                        onChange={(e) => handleExampleChange(index, 'input_example', e.target.value)}
                        placeholder="Enter input example"
                        className={`w-full bg-[#252525] text-gray-100 text-sm rounded-lg border ${
                          errors[`example_${index}`] || localErrors[`example_${index}_input_example`]
                            ? 'border-red-500'
                            : 'border-[#2d2d2d]'
                        } focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-2 font-['Roboto_Mono'] transition-all duration-200`}
                        disabled={loading}
                      />
                      {localErrors[`example_${index}_input_example`] && (
                        <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">
                          {localErrors[`example_${index}_input_example`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-300 mb-1 font-['Roboto_Mono']">Output</label>
                      <input
                        type="text"
                        value={example.output_example}
                        onChange={(e) => handleExampleChange(index, 'output_example', e.target.value)}
                        placeholder="Enter output example"
                        className={`w-full bg-[#252525] text-gray-100 text-sm rounded-lg border ${
                          errors[`example_${index}`] || localErrors[`example_${index}_output_example`]
                            ? 'border-red-500'
                            : 'border-[#2d2d2d]'
                        } focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-2 font-['Roboto_Mono'] transition-all duration-200`}
                        disabled={loading}
                      />
                      {localErrors[`example_${index}_output_example`] && (
                        <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">
                          {localErrors[`example_${index}_output_example`]}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-300 mb-1 font-['Roboto_Mono']">Explanation</label>
                      <textarea
                        value={example.explanation}
                        onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                        placeholder="Enter explanation"
                        className={`w-full bg-[#252525] text-gray-100 text-sm rounded-lg border ${
                          errors[`example_${index}`] || localErrors[`example_${index}_explanation`]
                            ? 'border-red-500'
                            : 'border-[#2d2d2d]'
                        } focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-2 font-['Roboto_Mono'] transition-all duration-200`}
                        rows="3"
                        disabled={loading}
                      />
                      {localErrors[`example_${index}_explanation`] && (
                        <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">
                          {localErrors[`example_${index}_explanation`]}
                        </p>
                      )}
                    </div>
                    <div className="flex items-end justify-end">
                      <button
                        onClick={() => removeExample(index)}
                        disabled={loading || examples.length === 1}
                        className={`text-gray-300 hover:text-red-400 transition-colors duration-200 relative ${
                          loading || examples.length === 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label="Close example"
                      >
                        <X className="w-5 h-5" />
                        <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-[#252525] text-gray-100 text-xs px-2 py-1 rounded shadow-md opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none font-['Roboto_Mono']">
                          Close
                        </span>
                      </button>
                    </div>
                  </div>
                  {errors[`example_${index}`] && (
                    <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">{errors[`example_${index}`]}</p>
                  )}
                </div>
              ))}
              <button
                onClick={addExample}
                disabled={loading}
                className={`text-gray-300 hover:text-green-400 transition-colors duration-200 relative ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Add Example"
              >
                <PlusSquare className="w-6 h-6" />
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-[#252525] text-gray-100 text-xs px-2 py-1 rounded shadow-md opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none font-['Roboto_Mono']">
                  Add Example
                </span>
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-['Roboto_Mono']">Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className={`w-full bg-[#252525] text-sm rounded-lg border ${
                    errors.difficulty || localErrors.difficulty ? 'border-red-500' : 'border-[#2d2d2d]'
                  } focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-3 capitalize font-['Roboto_Mono'] transition-all duration-200 ${
                    formData.difficulty === 'EASY'
                      ? 'text-green-400 border-green-400/50'
                      : formData.difficulty === 'MEDIUM'
                      ? 'text-yellow-400 border-yellow-400/50'
                      : 'text-red-400 border-red-400/50'
                  }`}
                  disabled={loading}
                >
                  {difficultyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className={`bg-[#252525] text-${opt.color}`}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {(errors.difficulty || localErrors.difficulty) && (
                  <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">
                    {errors.difficulty || localErrors.difficulty}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2 font-['Roboto_Mono']">Topic</label>
                <select
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className={`w-full bg-[#252525] text-gray-100 text-sm rounded-lg border ${
                    errors.tags || localErrors.tags ? 'border-red-500' : 'border-[#2d2d2d]'
                  } focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-3 font-['Roboto_Mono'] transition-all duration-200`}
                  disabled={loading}
                >
                  {tags.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#252525]">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {(errors.tags || localErrors.tags) && (
                  <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">{errors.tags || localErrors.tags}</p>
                )}
              </div>
            </div>
          </>
        )}

        {(showTestCases || testCasesOnly) && (
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-2 font-['Roboto_Mono']">Test Cases</label>
            {testCases.map((testCase, index) => (
              <div key={index} className="mb-4 p-5 bg-[#252525] rounded-lg border border-[#2d2d2d] relative shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-['Roboto_Mono']">Input Data</label>
                    <input
                      type="text"
                      value={testCase.input_data}
                      onChange={(e) => handleTestCaseChange(index, 'input_data', e.target.value)}
                      placeholder="Enter input data"
                      className={`w-full bg-[#252525] text-gray-100 text-sm rounded-lg border ${
                        errors[`test_case_${index}`] || localErrors[`test_case_${index}_input_data`]
                          ? 'border-red-500'
                          : 'border-[#2d2d2d]'
                      } focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-2 font-['Roboto_Mono'] transition-all duration-200`}
                      disabled={loading}
                    />
                    {localErrors[`test_case_${index}_input_data`] && (
                      <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">
                        {localErrors[`test_case_${index}_input_data`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-['Roboto_Mono']">Expected Output</label>
                    <input
                      type="text"
                      value={testCase.expected_output}
                      onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                      placeholder="Enter expected output"
                      className={`w-full bg-[#252525] text-gray-100 text-sm rounded-lg border ${
                        errors[`test_case_${index}`] || localErrors[`test_case_${index}_expected_output`]
                          ? 'border-red-500'
                          : 'border-[#2d2d2d]'
                      } focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-2 font-['Roboto_Mono'] transition-all duration-200`}
                      disabled={loading}
                    />
                    {localErrors[`test_case_${index}_expected_output`] && (
                      <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">
                        {localErrors[`test_case_${index}_expected_output`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1 font-['Roboto_Mono']">Sample Test Case</label>
                    <input
                      type="checkbox"
                      checked={testCase.is_sample}
                      onChange={(e) => handleTestCaseChange(index, 'is_sample', e.target.checked)}
                      className="bg-[#252525] text-green-400 rounded focus:ring-2 focus:ring-green-400"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      onClick={() => removeTestCase(index)}
                      disabled={loading || testCases.length === 1}
                      className={`text-gray-300 hover:text-red-400 transition-colors duration-200 relative ${
                        loading || testCases.length === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      aria-label="Close test case"
                    >
                      <X className="w-5 h-5" />
                      <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-[#252525] text-gray-100 text-xs px-2 py-1 rounded shadow-md opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none font-['Roboto_Mono']">
                        Close
                      </span>
                    </button>
                  </div>
                </div>
                {errors[`test_case_${index}`] && (
                  <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">{errors[`test_case_${index}`]}</p>
                )}
              </div>
            ))}
            <button
              onClick={addTestCase}
              disabled={loading}
              className={`text-gray-300 hover:text-green-400 transition-colors duration-200 relative ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Add Test Case"
            >
              <PlusSquare className="w-6 h-6" />
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-[#252525] text-gray-100 text-xs px-2 py-1 rounded shadow-md opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none font-['Roboto_Mono']">
                Add Test Case
              </span>
            </button>
          </div>
        )}

        {errors.general && (
          <p className="text-red-400 text-sm mb-4 font-['Roboto_Mono']">{errors.general}</p>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CustomButton onClick={onCancel} variant="cancel" disabled={loading}>
            Cancel
          </CustomButton>
          <CustomButton onClick={handleFormSubmit} variant="create" disabled={loading}>
            <span className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              {testCasesOnly ? 'Submit Test Cases' : isEditMode ? 'Update' : 'Create'}
            </span>
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default CommonQuestionForm;

