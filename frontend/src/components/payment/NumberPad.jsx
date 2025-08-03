import React from 'react';
import Delete from '../../assets/icons/NumpadDelete.svg';

export default function NumberPad({ 
  onNumberPress, 
  onDelete, 
  onDot,
  variant = 'desktop' // 'desktop' or 'mobile'
}) {
  const numberButtons = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['•', 0, 'delete']
  ];

  const isDesktop = variant === 'desktop';

  const buttonClasses = isDesktop
    ? "w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-textcolor text-2xl font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
    : "w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-medium hover:bg-white/30 transition-colors";

  const iconFilter = isDesktop
    ? 'brightness(0) saturate(100%) invert(26%) sepia(89%) saturate(2455%) hue-rotate(346deg) brightness(91%) contrast(89%)'
    : 'brightness(0) saturate(100%) invert(100%)';

  return (
    <div className="grid grid-cols-3 gap-4">
      {numberButtons.flat().map((button, index) => (
        <button
          key={index}
          onClick={() => {
            if (button === 'delete') {
              onDelete();
            } else if (button === '•') {
              onDot();
            } else {
              onNumberPress(button);
            }
          }}
          className={buttonClasses}
          aria-label={button === 'delete' ? 'Delete' : button === '•' ? 'Decimal point' : `Number ${button}`}
        >
          {button === 'delete' ? (
            <img 
              src={Delete} 
              alt="Delete" 
              className="w-6 h-6" 
              style={{ filter: iconFilter }}
            />
          ) : (
            <span className={isDesktop ? "text-primary" : ""}>{button}</span>
          )}
        </button>
      ))}
    </div>
  );
}
