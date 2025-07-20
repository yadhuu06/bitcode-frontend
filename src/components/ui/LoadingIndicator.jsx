import React from 'react';
import { useSelector } from 'react-redux';
import LoadingAnimation from './LoadingAnimation';

const LoadingIndicator = () => {
  const { isLoading, message, progress, style } = useSelector((state) => state.loading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <LoadingAnimation message={message} progress={progress} style={style} />
    </div>
   
  );
};

export default LoadingIndicator;