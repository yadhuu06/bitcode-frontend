import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import CustomButton from '../../components/ui/CustomButton';

const Questions = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-green-500 font-mono">
        Questions
      </h1>
      <CustomButton variant='create' onClick={() => navigate('/admin/questions/add')}>create Questions</CustomButton>

      {/* Add questions content here */}
    </div>
  );
};

export default Questions;