
import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirecionar para a página de agenda
const Index = () => {
  return <Navigate to="/agenda" replace />;
};

export default Index;
