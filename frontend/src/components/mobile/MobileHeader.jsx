import React from 'react';
import { Notifications, AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import bot from '../../assets/icons/chatbot-speech-bubble.svg'
import userIcon from '../../assets/images/USER.png';    
const MobileHeader = ({ userName = "Johnny" }) => {
  const navigate = useNavigate();
    const handleChatClick = () => {
        navigate('/ai-assistant'); 
    };

    const handleNotificationClick = () => {
        navigate('/notifications'); 
    };

  return (
    <main className="flex items-center justify-between pt-8 px-5 bg-primary text-secondary"> 
      <section className="flex items-center space-x-3">
        <img 
          src={userIcon} 
          className="w-12 h-12 contain-content"
        />
        <h1 className="text-lg font-medium">Hello, {userName}</h1>
      </section>
      
      <aside className="flex items-center space-x-4">
        <div className="relative">
          <button onClick={handleChatClick}
          className="w-10 h-10 text-accent rounded-lg flex items-center justify-center hover:bg-secondary/10 transition-colors">
            <img 
              src={bot} 
              alt="Chatbot Icon" 
              className="w-7 h-7
               filter-accent"
              style={{filter: 'brightness(0) saturate(100%) invert(100%)'}}
            />
          </button>
        </div>

        <button onClick={handleNotificationClick} className="relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-secondary/10 transition-colors">
          <Notifications fontSize='large' className=" text-secondary" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
            <p className="text-xs font-bold text-textcolor">!</p>
          </div>
        </button>
      </aside>
    </main>
  );
};

export default MobileHeader;
