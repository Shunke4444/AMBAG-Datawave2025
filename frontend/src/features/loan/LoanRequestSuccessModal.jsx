import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Home, Group } from '@mui/icons-material';

const LoanRequestSuccessModal = ({ isOpen, onClose, onGoHome, loanData }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
              {/* Success Icon */}
              <div className="text-center pt-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                >
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Request Sent!
                </h2>
                
                <p className="text-gray-600 px-6 mb-6">
                  Your loan request for <strong>₱{loanData?.amount}</strong> has been sent to your group members.
                </p>
              </div>

              {/* Request Details */}
              <div className="px-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="font-semibold">₱{loanData?.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Purpose:</span>
                    <span className="font-semibold">{loanData?.purpose}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Period:</span>
                    <span className="font-semibold">{loanData?.paymentPeriod} Month(s)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Interest Rate:</span>
                    <span className="font-semibold">
                      {loanData?.interestRate === '0' ? '0% (No Interest)' : 
                       loanData?.interestRate === 'negotiable' ? 'Negotiable' :
                       `${loanData?.interestRate}% per month`}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start space-x-2">
                  <Group className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    You'll receive notifications when group members respond to your request. We'll keep you updated on the approval status.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 space-y-3">
                <button
                  onClick={onGoHome}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Home className="w-5 h-5" />
                  <span>Go to Dashboard</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoanRequestSuccessModal;
