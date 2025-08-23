
import { Logout, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function MobileHeader({ title = "Page Title" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1);
  }

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 mt-5">
      {/* Logout */}
      <button
        className="flex lg:hidden items-center justify-center w-10 h-10 sm:w-12 sm:h-12 sm:m-0 bg-primary rounded-full text-secondary hover:bg-shadow transition-colors flex-shrink-0 cursor-pointer"
        aria-label="Go back"
        onClick={handleLogout}
      >
        <Logout className="text-lg sm:text-xl" />
      </button>

      {/* Title */}
      <h1 className="text-lg sm:text-xl font-bold text-textcolor truncate flex-1 text-center">
        {title}
      </h1>

      {/* Back Icon */}
      <button 
      onClick={handleGoBack}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 transition-colors shadow-md cursor-pointer">
        <ArrowBack />
      </button>


    </header>
  );
}
