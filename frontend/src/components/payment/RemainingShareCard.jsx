import React from 'react';

export default function RemainingShareCard({ 
  goalName = "House Bills", 
  remainingAmount = "P6000",
  variant = 'desktop' 
}) {
  const isDesktop = variant === 'desktop';

  if (isDesktop) {
    return (
      <section className="mb-8" aria-labelledby="remaining-share-label">
        <label 
          id="remaining-share-label"
          className="block text-textcolor/80 text-sm mb-3 font-medium"
        >
          Remaining Share for: {goalName}
        </label>
        <div className="border-2 rounded-xl p-4 text-center border-primary/20 bg-primary/5">
          <span className="text-2xl font-bold text-textcolor">{remainingAmount}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8" aria-labelledby="remaining-share-label-mobile">
      <label 
        id="remaining-share-label-mobile"
        className="block text-white/80 text-sm mb-3"
      >
        Remaining Share for {goalName}
      </label>
      <div className="border rounded-lg p-4 text-center border-white/30">
        <span className="text-xl font-medium text-white">{remainingAmount}</span>
      </div>
    </section>
  );
}
