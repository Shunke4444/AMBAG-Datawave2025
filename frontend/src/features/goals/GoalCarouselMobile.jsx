import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GoalCardGlassMobile from "./GoalCardGlassMobile";
import { calculateDaysLeft } from "./GoalCards";

const GoalCarouselMobile = ({ goals = [] }) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = goals.length;

  // If no goals, don't render anything
  if (!goals || goals.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        No goals available
      </div>
    );
  }

  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % total);
  };
  
  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + total) % total);
  };

  // Enhanced swipe animation variants
  const swipeVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 15 : -15
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        x: { type: "spring", stiffness: 400, damping: 25 }, 
        opacity: { duration: 0.1 }, 
        scale: { duration: 0.15 }, 
        rotateY: { duration: 0.15 } 
      }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 15 : -15,
      transition: {
        x: { type: "spring", stiffness: 400, damping: 25 },
        opacity: { duration: 0.1 }, 
        scale: { duration: 0.15 }, 
        rotateY: { duration: 0.15 } 
      }
    })
  };


  let startX = 0;
  
  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    
    if (Math.abs(diff) > 50) { 
      if (diff > 0) {
        next(); 
      } else {
        prev(); 
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative w-full max-w-2xl flex justify-center touch-pan-y overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ perspective: "1000px" }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={swipeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            whileDrag={{ 
              scale: 0.95,
              rotateY: 5,
              transition: { duration: 0 }
            }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipeThreshold = 50;
              const swipeVelocityThreshold = 500;
              
              if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > swipeVelocityThreshold) {
                if (offset.x > 0 || velocity.x > 0) {
                  prev();
                } else {
                  next();
                }
              }
            }}
            className="flex justify-center cursor-grab active:cursor-grabbing"
            style={{ 
              touchAction: 'pan-y',
              transformStyle: 'preserve-3d'
            }}
          >
            <GoalCardGlassMobile goal={{
              ...goals[index],
              total: goals[index]?.goal_amount || 0,
              amount: goals[index]?.current_amount || 0,
              daysLeft: calculateDaysLeft(goals[index]?.target_date)
            }} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        {goals.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to goal ${i + 1}`}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === index ? "bg-yellow-400 shadow-lg" : "bg-gray-500/60 hover:bg-gray-400/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default GoalCarouselMobile;
