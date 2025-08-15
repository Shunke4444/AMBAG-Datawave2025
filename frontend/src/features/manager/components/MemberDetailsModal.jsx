import React from 'react';
import { motion } from 'framer-motion';
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
 * Modal component for displaying detailed member information
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Object} props.member - Member data to display
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onNudge - Nudge handler
 */
const MemberDetailsModal = ({ isOpen, member, onClose, onNudge }) => {
  if (!isOpen || !member) return null;

  const progressPercentage = getProgressPercentage(member.paidAmount, member.targetAmount);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
        role="document"
      >
        {/* Modal Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
              <span className="text-blue-500 text-lg font-semibold" aria-hidden="true">
                  {getUserInitials(`${member.first_name} ${member.last_name}`)}
                </span>
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-gray-900">
                Member Details
              </h2>
              <p id="modal-description" className="text-sm text-gray-500">
                  {member.first_name} {member.last_name} {/* Ensure consistent usage */}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-primary hover:bg-red-700 flex items-center justify-center transition-colors text-white"
            aria-label="Close modal"
          >
            ×
          </button>
        </header>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Progress and Amount Cards */}
          <section className="grid grid-cols-2 gap-4" aria-label="Progress summary">
            <div className="bg-primary rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">Progress</h3>
              <p className="text-lg font-bold text-white">
                {progressPercentage.toFixed(0)}%
              </p>
            </div>
            <div className="bg-accent rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Amount Paid</h3>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(member.paidAmount)}
              </p>
            </div>
          </section>

          {/* Goal Progress Bar */}
          <section className="bg-gray-50 rounded-lg p-4" aria-label="Detailed goal progress">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Goal Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Goal progress: ${progressPercentage.toFixed(0)}% completed`}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatCurrency(member.paidAmount)}</span>
              <span>{formatCurrency(member.targetAmount)}</span>
            </div>
          </section>

          {/* Member Details */}
          <section className="space-y-4" aria-label="Member information">
            <div>
              <p className="text-sm font-medium text-gray-900">Current Goal</p>
              <p className="text-sm text-gray-600">{member.currentGoal}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">Target Amount</p>
              <p className="text-sm text-gray-600">{formatCurrency(member.targetAmount)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">Monthly Target</p>
              <p className="text-sm text-gray-600">{formatCurrency(member.monthlyTarget)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(member.goalStatus)}`}>
                {formatStatusText(member.goalStatus)}
              </span>
            </div>

            {member.missedPayments > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900">Missed Payments</p>
                <p className="text-sm text-primary font-medium">
                  {member.missedPayments} payment{member.missedPayments > 1 ? 's' : ''}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-900">Last Payment</p>
              <p className="text-sm text-gray-600">
                {member.lastPayment.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">Member Since</p>
              <p className="text-sm text-gray-600">
                {member.joinDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </section>

          {/* Payment History */}
          <section className="bg-gray-50 rounded-lg p-4" aria-label="Recent payment history">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Payment History</h3>
            <div className="space-y-2">
              {member.paymentHistory.slice(0, 3).map((payment, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                >
                  <span className="text-sm text-gray-600">
                    {payment.date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      payment.status === 'paid' ? 'text-green-600' : 'text-primary'
                    }`}>
                      {payment.status === 'paid' ? formatCurrency(payment.amount) : 'Missed'}
                    </span>
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        payment.status === 'paid' ? 'bg-green-500' : 'bg-primary'
                      }`}
                      aria-hidden="true"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Nudge Button */}
          {shouldShowNudgeButton(member.goalStatus) && (
            <button
              onClick={() => onNudge(member.id, `${member.first_name} ${member.last_name}`)}
              className="w-full bg-primary hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              aria-label={`Send payment reminder to ${member.first_name} ${member.last_name}`}
            >
              <NudgeIcon className="w-5 h-5" aria-hidden="true" />
              <span>Send Payment Reminder</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MemberDetailsModal;
