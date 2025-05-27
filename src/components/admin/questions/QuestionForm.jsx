import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Code } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import CustomButton from '../../ui/CustomButton';
import { createQuestion, editQuestion, fetchQuestionById } from '../../../services/ProblemService';
import { toast } from 'react-toastify';

const editorStyles = `
  .w-md-editor {
    background-color: #0f172a;
    border-radius: 0.75rem;
    border: 1px solid #334155;
    font-family: 'Fira Code', monospace;
    color: #e2e8f0;
    overflow: hidden;
  }
  .w-md-editor-text textarea::placeholder {
    color: #64748b !important;
    font-style: italic;
  }
  .w-md-editor-toolbar {
    background-color: #1e293b !important;
    border-bottom: 1px solid #334155 !important;
    border-radius: 0.75rem 0.75rem 0 0 !important;
    padding: 0.5rem;
  }
  .w-md-editor-toolbar button {
    color: #94a3b8 !important;
    transition: color 0.2s ease;
  }
  .w-md-editor-toolbar button:hover {
    color: #22c55e !important;
  }
  .w-md-editor-text {
    background-color: #0f172a !important;
  }
  .w-md-editor-text-container textarea {
    background-color: #0f172a !important;
    color: #f1f5f9 !important;
    font-size: 14px;
    line-height: 1.6;
    padding: 1rem;
    min-height: 300px;
  }
  .wmde-markdown {
    background-color: #0f172a !important;
    color: #e2e8f0 !important;
    font-family: 'Fira Code', monospace !important;
    font-size: 14px;
    padding: 1rem;
    line-height: 1.75;
  }
  .wmde-markdown h1, .wmde-markdown h2, .wmde-markdown h3 {
    color: #facc15;
  }
  .wmde-markdown code {
    background-color: #334155;
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 90%;
  }
  .wmde-markdown pre code {
    background-color: #0f172a;
    padding: 1em;
    display: block;
    overflow-x: auto;
    border-radius: 6px;
  }
  .w-md-editor-fullscreen {
    background-color: #0f172a !important;
    z-index: 9999;
  }
  .w-md-editor:focus-within {
    outline: 2px solid #22c55e !important;
    outline-offset: 2px;
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
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/questions')}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Go back"
        >
          
        </button>
        <h1 className="text-2xl font-bold text-green-500 font-sans flex items-center gap-2">
          <span className="text-white">{'<'}</span>
          {isEditMode ? 'Edit Question' : 'Create New Question'}
          <span className="text-white">{'/>'}</span>
        </h1>
      </header>

      <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-800">
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Question Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter question title"
            className={`w-full bg-gray-800/50 text-white text-sm rounded-lg border ${
              errors.title ? 'border-red-500' : 'border-gray-700/50'
            } focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-3 font-mono`}
            disabled={loading}
          />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
        </div>

        <div className="mb-6" data-color-mode="dark">
          <label className="block text-sm text-gray-400 mb-2">Description</label>
          <style>{editorStyles}</style>
          <MDEditor
            value={formData.description}
            onChange={handleDescriptionChange}
            height={250}
            placeholder="Write the question description in Markdown..."
            preview="live"
            className={`rounded-lg ${errors.description ? 'border border-red-500' : ''}`}
            data-color-mode="dark"
            textareaProps={{
              style: {
                backgroundColor: '#000000',
                color: '#ffffff',
                caretColor: '#4ade80',
                fontFamily: "'Fira Code', monospace",
                fontSize: '14px',
                lineHeight: '1.5',
              },
              disabled: loading,
            }}
            previewOptions={{
              style: {
                backgroundColor: '#000000',
                color: '#ffffff',
                fontFamily: "'Fira Code', monospace",
              },
            }}
          />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Examples</label>
          {examples.map((example, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Input</label>
                  <input
                    type="text"
                    value={example.input_example}
                    onChange={(e) => handleExampleChange(index, 'input_example', e.target.value)}
                    placeholder="Enter input example"
                    className="w-full bg-gray-800/50 text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-2 font-mono"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Output</label>
                  <input
                    type="text"
                    value={example.output_example}
                    onChange={(e) => handleExampleChange(index, 'output_example', e.target.value)}
                    placeholder="Enter output example"
                    className="w-full bg-gray-800/50 text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-2 font-mono"
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Explanation</label>
                  <textarea
                    value={example.explanation}
                    onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                    placeholder="Enter explanation (optional)"
                    className="w-full bg-gray-800/50 text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-2 font-mono"
                    rows="3"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Order</label>
                  <input
                    type="number"
                    value={example.order}
                    onChange={(e) => handleExampleChange(index, 'order', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800/50 text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-2 font-mono"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-end">
                  <CustomButton
                    onClick={() => removeExample(index)}
                    variant="cancel"
                    disabled={loading || examples.length === 1}
                  >
                    Remove
                  </CustomButton>
                </div>
              </div>
              {errors[`example_${index}`] && (
                <p className="text-red-400 text-xs mt-1">{errors[`example_${index}`]}</p>
              )}
            </div>
          ))}
          <CustomButton onClick={addExample} variant="create" disabled={loading}>
            Add Example
          </CustomButton>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Test Cases</label>
          <CustomButton
            onClick={() => navigate(`/admin/questions/${questionId}/test-cases`)}
            variant="create"
            disabled={!isEditMode}
          >
            <span className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Manage Test Cases
            </span>
          </CustomButton>
          {!isEditMode && (
            <p className="text-gray-400 text-xs mt-1">
              Save the question first to manage test cases.
            </p>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className={`w-full bg-gray-800/50 text-sm rounded-lg border ${
                errors.difficulty ? 'border-red-500' : 'border-gray-700/50'
              } focus:outline-none px-4 py-3 capitalize font-mono ${
                formData.difficulty === 'EASY'
                  ? 'text-green-400 border-green-500/50'
                  : formData.difficulty === 'MEDIUM'
                  ? 'text-yellow-400 border-yellow-500/50'
                  : 'text-red-400 border-red-500/50'
              }`}
              disabled={loading}
            >
              <option value="EASY" className="bg-gray-800 text-green-400">Easy</option>
              <option value="MEDIUM" className="bg-gray-800 text-yellow-400">Medium</option>
              <option value="HARD" className="bg-gray-800 text-red-400">Hard</option>
            </select>
            {errors.difficulty && <p className="text-red-400 text-xs mt-1">{errors.difficulty}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Topic</label>
            <select
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className={`w-full bg-gray-800/50 text-white text-sm rounded-lg border ${
                errors.tags ? 'border-red-500' : 'border-gray-700/50'
              } focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-3 font-mono`}
              disabled={loading}
            >
              <option value="ARRAY" className="bg-gray-800">Array</option>
              <option value="STRING" className="bg-gray-800">String</option>
              <option value="DSA" className="bg-gray-800">DSA</option>
            </select>
            {errors.tags && <p className="text-red-400 text-xs mt-1">{errors.tags}</p>}
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