import React, { useEffect } from 'react';
import { useLoginMutation } from './authApi';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [login, { isSuccess }] = useLoginMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      navigate('/');
    }
  }, [isSuccess, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email: 'test@example.com', password: 'password' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;