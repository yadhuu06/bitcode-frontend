import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, HelpCircle, PlusSquare, X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import CustomButton from '../ui/CustomButton';
import { createQuestion, editQuestion, fetchQuestionById } from '../../services/ProblemService'
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

const tagDisplayMap = {
  ARRAY: 'Array',
  STRING: 'String',
  DSA: 'DSA',
};

const tagValueMap = {
  Array: 'ARRAY',
  String: 'STRING',
  DSA: 'DSA',
};

const QuestionForm = () => {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const isEditMode = !!questionId;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    tags: 'ARRAY',
  });
  const [examples, setExamples] = useState([{ input_example: '', output_example: '', explanation: '', order: 0 }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchQuestion = async () => {
        try {
          setLoading(true);
          const question = await fetchQuestionById(questionId);
          setFormData({
            title: question.title,
            description: question.description,
            difficulty: question.difficulty,
            tags: tagValueMap[question.tags] || question.tags,
          });
          setExamples(question.examples?.length > 0 ? question.examples : [{ input_example: '', output_example: '', explanation: '', order: 0 }]);
        } catch (error) {
          const errorData = JSON.parse(error.message);
          toast.error(errorData.error || 'Failed to load question');
          navigate('/admin/questions');
        } finally {
          setLoading(false);
        }
      };
      fetchQuestion();
    }
  }, [isEditMode, questionId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value || '' }));
    setErrors((prev) => ({ ...prev, description: '' }));
  };

  const handleExampleChange = (index, field, value) => {
    setExamples((prev) => {
      const newExamples = [...prev];
      newExamples[index] = { ...newExamples[index], [field]: value };
      return newExamples;
    });
    setErrors((prev) => ({ ...prev, [`example_${index}`]: '' }));
  };

  const addExample = () => {
    setExamples((prev) => [...prev, { input_example: '', output_example: '', explanation: '', order: prev.length }]);
  };

  const removeExample = (index) => {
    setExamples((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});
      const payload = { ...formData, examples };
      if (isEditMode) {
        await editQuestion(questionId, payload);
        toast.success('Question updated successfully');
      } else {
        await createQuestion(payload);
        toast.success('Question created successfully');
      }
      navigate('/admin/questions');
    } catch (error) {
      const errorData = JSON.parse(error.message);
      if (errorData.title || errorData.description || errorData.difficulty || errorData.tags || errorData.examples) {
        setErrors(errorData);
      } else {
        toast.error(errorData.error || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', description: '', difficulty: 'EASY', tags: 'ARRAY' });
    setExamples([{ input_example: '', output_example: '', explanation: '', order: 0 }]);
    setErrors({});
    navigate('/admin/questions');
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-black min-h-screen">
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/questions')}
          className="text-gray-300 hover:text-green-400 transition-colors duration-200"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold text-green-400 font-['Roboto_Mono'] flex items-center gap-2">
          <span className="text-gray-200">{'<'}</span>
          {isEditMode ? 'Edit Question' : 'Create New Question'}
          <span className="text-gray-200">{'/>'}</span>
        </h1>
      </header>

      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2d2d2d] shadow-lg">
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-2 font-['Roboto_Mono']">Question Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter question title"
            className={`w-full bg-[#252525] text-gray-100 text-sm rounded-lg border ${
              errors.title ? 'border-red-500' : 'border-[#2d2d2d]'
            } focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-3 font-['Roboto_Mono'] transition-all duration-200`}
            disabled={loading}
          />
          {errors.title && <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">{errors.title}</p>}
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
            className={`rounded-lg ${errors.description ? 'border border-red-500' : ''}`}
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
          {errors.description && <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">{errors.description}</p>}
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
                    className="w-full bg-[#252525] text-gray-100 text-sm rounded-lg border border-[#2d2d2d] focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-2 font-['Roboto_Mono'] transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-['Roboto_Mono']">Output</label>
                  <input
                    type="text"
                    value={example.output_example}
                    onChange={(e) => handleExampleChange(index, 'output_example', e.target.value)}
                    placeholder="Enter output example"
                    className="w-full bg-[#252525] text-gray-100 text-sm rounded-lg border border-[#2d2d2d] focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-2 font-['Roboto_Mono'] transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-300 mb-1 font-['Roboto_Mono']">Explanation</label>
                  <textarea
                    value={example.explanation}
                    onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                    placeholder="Enter explanation (optional)"
                    className="w-full bg-[#252525] text-gray-100 text-sm rounded-lg border border-[#2d2d2d] focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-2 font-['Roboto_Mono'] transition-all duration-200"
                    rows="3"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-end justify-end">
                  <button
                    onClick={() => removeExample(index)}
                    disabled={loading || examples.length === 1}
                    className={`text-gray-300 hover:text-red-400 transition-colors duration-200 relative ${loading || examples.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-2 font-['Roboto_Mono']">Test Cases</label>
          {!isEditMode && (
            <p className="text-gray-400 text-xs mt-1 font-['Roboto_Mono']">
              Save the question first to manage test cases.
            </p>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2 font-['Roboto_Mono']">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className={`w-full bg-[#252525] text-sm rounded-lg border ${
                errors.difficulty ? 'border-red-500' : 'border-[#2d2d2d]'
              } focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-3 capitalize font-['Roboto_Mono'] transition-all duration-200 ${
                formData.difficulty === 'EASY'
                  ? 'text-green-400 border-green-400/50'
                  : formData.difficulty === 'MEDIUM'
                  ? 'text-yellow-400 border-yellow-400/50'
                  : 'text-red-400 border-red-400/50'
              }`}
              disabled={loading}
            >
              <option value="EASY" className="bg-[#252525] text-green-400">Easy</option>
              <option value="MEDIUM" className="bg-[#252525] text-yellow-400">Medium</option>
              <option value="HARD" className="bg-[#252525] text-red-400">Hard</option>
            </select>
            {errors.difficulty && <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">{errors.difficulty}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 font-['Roboto_Mono']">Topic</label>
            <select
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className={`w-full bg-[#252525] text-gray-100 text-sm rounded-lg border ${
                errors.tags ? 'border-red-500' : 'border-[#2d2d2d]'
              } focus:ring-2 focus:ring-green-400 focus:outline-none px-4 py-3 font-['Roboto_Mono'] transition-all duration-200`}
              disabled={loading}
            >
              <option value="ARRAY" className="bg-[#252525]">Array</option>
              <option value="STRING" className="bg-[#252525]">String</option>
              <option value="DSA" className="bg-[#252525]">DSA</option>
            </select>
            {errors.tags && <p className="text-red-400 text-xs mt-1 font-['Roboto_Mono']">{errors.tags}</p>}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CustomButton onClick={handleCancel} variant="cancel" disabled={loading}>
            Cancel
          </CustomButton>
          <CustomButton onClick={handleSubmit} variant="create" disabled={loading}>
            <span className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              {isEditMode ? 'Update' : 'Create'}
            </span>
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;