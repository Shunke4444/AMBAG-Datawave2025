import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import GoalCardGlassMobile from "./GoalCardGlassMobile";
import mockGoals from "./mockGoals";

const GoalCarouselMobile = () => {
  const [index, setIndex] = useState(0);
  const total = mockGoals.length;

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  return (
    <div className="flex flex-col items-center gap-4 ">
      <div className="relative w-full max-w-2xl flex justify-center">
        <AnimatePresence mode="wait">
          <motion
            key={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.x < -30) next();
              else if (info.offset.x > 30) prev();
            }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            <GoalCardGlassMobile goal={mockGoals[index]} />
          </motion>
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        {mockGoals.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to goal ${i + 1}`}
            className={`w-3 h-3 rounded-full transition ${
              i === index ? "bg-yellow-400" : "bg-gray-500/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default GoalCarouselMobile;
