import React from 'react';
import { TouchApp as NudgeIcon } from '@mui/icons-material';
import {
  formatCurrency,
  getStatusColor,
  getProgressPercentage,
  getProgressColor,
  getUserInitials,
  formatStatusText,
  shouldShowNudgeButton
} from '../utils/memberUtils';

/**
 * Individual member card component
 * @param {Object} props - Component props
 * @param {Object} props.member - Member data
 * @param {Function} props.onClick - Click handler for member card
 * @param {Function} props.onNudge - Nudge handler
 */
const MemberCard = ({ member, onClick, onNudge }) => {
  const progressPercentage = getProgressPercentage(member.paidAmount, member.targetAmount);

  const handleNudgeClick = (e) => {
    e.stopPropagation();
    onNudge(member.id, member.name);
  };

  return (
    <article
      onClick={() => onClick(member)}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${member.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(member);
        }
      }}
    >
      {/* Member Header */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Profile Avatar */}
          <div className="w-12 h-12 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
            <span className="text-blue-500 text-sm font-semibold" aria-hidden="true">
              {getUserInitials(member.name)}
            </span>
          </div>
          
          {/* Member Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
            <p className="text-xs text-gray-500">{member.currentGoal}</p>
            <span 
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.goalStatus)}`}
              aria-label={`Status: ${formatStatusText(member.goalStatus)}`}
            >
              {formatStatusText(member.goalStatus)}
            </span>
          </div>
        </div>
        
        {/* Nudge Button */}
        {shouldShowNudgeButton(member.goalStatus) && (
          <button
            onClick={handleNudgeClick}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
            aria-label={`Send payment reminder to ${member.name}`}
            title="Send Payment Reminder"
          >
            <NudgeIcon className="w-5 h-5 text-white" aria-hidden="true" />
          </button>
        )}
      </header>

      {/* Progress Section */}
      <section className="mb-3" aria-label="Goal progress">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{formatCurrency(member.paidAmount)} paid</span>
          <span>{formatCurrency(member.targetAmount)} target</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Goal progress: ${progressPercentage.toFixed(0)}% completed`}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{progressPercentage.toFixed(0)}% completed</span>
          {member.missedPayments > 0 && (
            <span className="text-primary font-medium">
              {member.missedPayments} missed payment{member.missedPayments > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </section>

      {/* Payment Info */}
      <footer className="flex justify-between text-xs text-gray-600">
        <span>Recent: {formatCurrency(member.paymentHistory[0]?.amount || 0)}</span>
        <span>
          Last paid: {member.lastPayment.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
      </footer>
    </article>
  );
};

export default MemberCard;
