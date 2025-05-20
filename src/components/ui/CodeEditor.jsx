import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, setCode, language = 'javascript' }) => {
  const editorRef = useRef(null);

  // Function to define and apply the theme
  const applyTheme = () => {
    if (window.monaco) {
      window.monaco.editor.defineTheme('bitcode', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: '', foreground: 'FFFFFF' }, // Default text
          { token: 'comment', foreground: '6B7280' },
          { token: 'string', foreground: '22C55E' },
          { token: 'keyword', foreground: '22C55E' },
          { token: 'number', foreground: 'FFFFFF' },
          { token: 'identifier', foreground: 'FFFFFF' },
        ],
        colors: {
          'editor.background': '#030712', // Solid dark background
          'editor.foreground': '#FFFFFF', // Default text color
          'editorLineNumber.foreground': '#6B7280',
          'editor.selectionBackground': '#030712', // Match background to hide selection
          'editor.selectionHighlightBackground': '#030712', // Match background to hide selection highlight
          'editorCursor.foreground': '#22C55E', // Visible cursor color
          'editorHoverWidget.background': '#1F2937',
          'editorHoverWidget.border': '#22C55E4D',
          'editorIndentGuide.background': '#6B728033',
          'editorIndentGuide.activeBackground': '#22C55E33',
          'editor.lineHighlightBackground': '#030712', // Match background to hide line highlight
          'editor.lineHighlightBorder': '#030712', // Match background to hide line highlight border
          'editor.rangeHighlightBackground': '#030712', // Match background to hide range highlight
        },
      });
      window.monaco.editor.setTheme('bitcode');
    }
  };

  // Apply theme on mount
  useEffect(() => {
    applyTheme();
  }, []);

  return (
    <Editor
      height="66vh"
      language={language}
      value={code}
      theme="bitcode"
      onChange={setCode}
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        // Reapply theme on mount to ensure it sticks
        applyTheme();
        // Force a layout update to fix rendering issues
        setTimeout(() => {
          editor.layout();
        }, 0);
      }}
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
        selectOnLineNumbers: false,
        renderLineHighlight: 'none', // Disable line highlight entirely
        renderHighlightCurrentLine: false, // Explicitly disable current line highlight
        renderSelection: false, // Disable selection rendering
        highlightActiveLine: false, // Disable active line highlight
      }}
    />
  );
};

export default CodeEditor;