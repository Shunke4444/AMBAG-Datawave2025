// components/ResponsiveGoals.jsx
import React from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import GoalCards from "../components/GoalCards";
import GoalCarouselMobile from '../components/mobile/GoalCarouselMobile';

const ResponsiveGoals = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md")); 

  return (
    <div>
      {isDesktop ? (
        <GoalCards />
      ) : (
        <div className="px-4">
          <GoalCarouselMobile />
        </div>
      )}
    </div>
  );
};

export default ResponsiveGoals;
