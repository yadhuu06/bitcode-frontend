import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import CustomButton from '../../ui/CustomButton';

// Custom styles for the Markdown editor to match the dark theme
const editorStyles = `
  .w-md-editor {


 


 

  /* Placeholder styling */
  .w-md-editor-text textarea::placeholder {
    color: #64748b !important;
  }

  /* Toolbar styling */
  .w-md-editor-toolbar {
    background-color: #1e293b !important;
    border-bottom: 1px solid #334155 !important;
    border-radius: 0.5rem 0.5rem 0 0 !important;
  }

  .w-md-editor-toolbar button {
    color: #94a3b8 !important;
  }

  .w-md-editor-toolbar button:hover {
    color: #4ade80 !important;
  }

  /* Preview area styling */
 

  /* Markdown rendered content */
  .wmde-markdown {
    background-color:rgb(25, 29, 37) !important;
    color: #ffffff !important;
    font-family: 'Fira Code', monospace !important;
  }

  /* Fullscreen mode */
  .w-md-editor-fullscreen {
    background-color:rgb(63, 43, 43) !important;
  }

  /* Focus outline */
  .w-md-editor:focus-within {
    outline: 1px solid #4ade80 !important;
    outline-offset: 2px;
  }

  /* Ensure visibility of input area */
  .w-md-editor-text-container {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
`;

const CreateQuestion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    topic: 'Array',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value || '' }));
  };

  const handleCreateQuestion = () => {
    console.log('Creating question:', formData);
    navigate('/admin/questions');
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'easy',
      topic: 'Array',
    });
    navigate('/admin/questions');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header with Back Button */}
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/questions')}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-green-500 font-sans flex items-center gap-2">
          <span className="text-white">{'<'}</span>
          Create New Question
          <span className="text-white">{'/>'}</span>
        </h1>
      </header>

      {/* Form */}
      <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-800">
        {/* Question Title */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Question Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter question title"
            className="w-full bg-gray-800/50 text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-3 font-mono"
          />
        </div>

        {/* Description with Markdown Editor */}
        <div className="mb-6" data-color-mode="dark">
          <label className="block text-sm text-gray-400 mb-2">Description</label>
          <style>{editorStyles}</style>
          <MDEditor
            value={formData.description}
            onChange={handleDescriptionChange}
            height={250}
            placeholder="Write the question description in Markdown..."
            preview="live"
            className="rounded-lg"
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
            }}
            previewOptions={{
              style: {
                backgroundColor: '#000000',
                color: '#ffffff',
                fontFamily: "'Fira Code', monospace",
              },
            }}
          />
        </div>

        {/* Difficulty and Topic in a Single Row */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Difficulty */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className={`w-full bg-gray-800/50 text-sm rounded-lg border focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-3 capitalize font-mono ${
                formData.difficulty === 'easy'
                  ? 'text-green-400 border-green-500/50'
                  : formData.difficulty === 'medium'
                  ? 'text-yellow-400 border-yellow-500/50'
                  : 'text-red-400 border-red-500/50'
              }`}
            >
              <option value="easy" className="bg-gray-800 text-green-400">Easy</option>
              <option value="medium" className="bg-gray-800 text-yellow-400">Medium</option>
              <option value="hard" className="bg-gray-800 text-red-400">Hard</option>
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Topic</label>
            <select
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              className="w-full bg-gray-800/50 text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-green-500 focus:outline-none px-4 py-3 font-mono"
            >
              <option value="Array" className="bg-gray-800">Array</option>
              <option value="String" className="bg-gray-800">String</option>
              <option value="DSA" className="bg-gray-800">DSA</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CustomButton onClick={handleCancel} variant="cancel">
            Cancel
          </CustomButton>

          <CustomButton onClick={handleCreateQuestion} variant="create">
            <span className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Create
            </span>
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;