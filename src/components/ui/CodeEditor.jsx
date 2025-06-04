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
          'editor.selectionBackground': '#22C55E33', // Semi-transparent green for visible selection
          'editor.selectionHighlightBackground': '#22C55E1A', // Lighter highlight for related text
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
        selectOnLineNumbers: true, // Allow selecting lines by clicking line numbers
        renderLineHighlight: 'none', // Keep minimalistic look
        renderHighlightCurrentLine: false, // Avoid line highlight
        renderSelection: true, // Enable text selection rendering
        highlightActiveLine: false, // Keep line highlight disabled
        selectionHighlight: true, // Highlight related text occurrences
      }}
    />
  );
};

export default CodeEditor;