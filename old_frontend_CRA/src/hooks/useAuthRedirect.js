import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useAuthRedirect(user) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user]);
}
