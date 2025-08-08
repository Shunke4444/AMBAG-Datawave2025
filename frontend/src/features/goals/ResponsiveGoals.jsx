// components/ResponsiveGoals.jsx
import React from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import GoalCards from "./GoalCards";
import GoalCarouselMobile from './GoalCarouselMobile';

const ResponsiveGoals = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // Changed from "md" to "lg"

  // Animation variants for smooth transitions
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.2,  // Reduced from 0.5 to 0.2
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.15,  // Reduced from 0.3 to 0.15
        ease: "easeIn"
      }
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isDesktop ? (
          <motion.div
            key="desktop"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            <GoalCards />
          </motion.div>
        ) : (
          <motion.div
            key="mobile"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="px-4"
          >
            <GoalCarouselMobile />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResponsiveGoals;
