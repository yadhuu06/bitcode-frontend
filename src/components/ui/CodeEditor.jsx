import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, setCode, language = 'python' }) => {
  const editorRef = useRef(null);

  // Define custom Monaco theme
  useEffect(() => {
    if (window.monaco) {
      window.monaco.editor.defineTheme('bitcode', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: '', foreground: 'FFFFFF' }, // White text for general code
          { token: 'comment', foreground: '6B7280' }, // Gray for comments
          { token: 'string', foreground: '22C55E' }, // Green for strings
          { token: 'keyword', foreground: '22C55E' }, // Green for keywords
          { token: 'number', foreground: 'FFFFFF' }, // White for numbers
          { token: 'identifier', foreground: 'FFFFFF' }, // White for identifiers
        ],
        colors: {
          'editor.background': '#030712E6', // Matches bg-gray-950/90 (dark gray with 90% opacity)
          'editor.foreground': '#FFFFFF', // White text
          'editorLineNumber.foreground': '#6B7280', // Gray line numbers
          'editorLineNumber.activeForeground': '#22C55E', // Green for active line number
          'editor.selectionBackground': '#22C55E33', // Semi-transparent green selection
          'editorCursor.foreground': '#22C55E', // Green cursor
          'editorHoverWidget.background': '#1F2937', // Gray-800 for hover widgets
          'editorHoverWidget.border': '#22C55E4D', // Green border for hover
          'editorIndentGuide.background': '#6B728033', // Semi-transparent gray indent guides
          'editorIndentGuide.activeBackground': '#22C55E33', // Green active indent
        },
      });
    }
  }, []);

  return (
    <Editor
      height="66vh"
      language={language}
      value={code}
      theme="bitcode"
      onChange={setCode}
      onMount={(editor) => (editorRef.current = editor)}
      options={{
        fontSize: 14,
        tabSize: 4,
        minimap: { enabled: false },
        autoIndent: 'advanced',
        formatOnType: true,
        formatOnPaste: true,
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        padding: { top: 8, bottom: 8 },
      }}
    />
  );
};

export default CodeEditor;