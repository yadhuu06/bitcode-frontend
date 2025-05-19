import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, setCode, language = "python" }) => {
  const editorRef = useRef(null);

  return (
    <Editor
      height="500px"
      language={language}
      value={code}
      theme="vs-dark"
      onChange={setCode}
      onMount={(editor) => (editorRef.current = editor)}
      options={{
        fontSize: 16,
        tabSize: 4,
        minimap: { enabled: false },
        autoIndent: 'advanced',
        formatOnType: true,
        formatOnPaste: true,
        scrollBeyondLastLine: false,
      }}
    />
  );
};

export default CodeEditor;
