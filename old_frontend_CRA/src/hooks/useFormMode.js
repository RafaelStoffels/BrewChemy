import { useLocation, useParams } from 'react-router-dom';

export default function useFormMode() {
  const { id } = useParams();
  const location = useLocation();

  const isView = location.pathname.includes('/details');
  const isEditing = !!id && !isView;

  return { isEditing, isView };
}
