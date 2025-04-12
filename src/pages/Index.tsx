
import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirecionar para a página de dashboard
const Index = () => {
  return <Navigate to="/dashboard" replace />;
};

export default Index;
