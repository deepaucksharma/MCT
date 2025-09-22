import { useNavigate } from 'react-router-dom';
import DMManager from '../../components/exercises/DMManager';

export default function DMPracticePage() {
  const navigate = useNavigate();

  // Get timeOfDay from navigation state if provided
  // const initialTimeOfDay = location.state?.timeOfDay;

  const handleClose = () => {
    navigate('/today');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <DMManager onClose={handleClose} />
      </div>
    </div>
  );
}