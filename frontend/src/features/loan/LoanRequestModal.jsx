import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Close, Group, AccountBalance, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LoanRequestModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleBPILoan = () => {
    window.open('https://www.bpi.com.ph/personal/loans/personal-loan/regular-loan?utm_source=google&utm_medium=cpc&utm_campaign=8859&utm_term=pl-gs-bpi-ph-pl-aq-phr-br-new&utm_content=pl-phr-br-bpi_loan_2.0&gad_source=1', '_blank');
    onClose();
  };

  const handleGroupLoan = () => {
    // Navigate to requests page with loan parameter
    navigate('/app/requests?type=loan');
    onClose();
  };

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
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Request a Loan</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Close className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-gray-600 text-sm mb-6">
                  Choose your preferred loan option below:
                </p>

                {/* Group Loan Option */}
                <button
                  onClick={handleGroupLoan}
                  className="w-full p-4 bg-primary/5 hover:bg-primary/10 border-2 border-primary/20 hover:border-primary/40 rounded-xl transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Group className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">From Group Members</h3>
                      <p className="text-sm text-gray-600">Request a loan from your group members</p>
                    </div>
                    <ArrowForward className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* BPI Loan Option */}
                <button
                  onClick={handleBPILoan}
                  className="w-full p-4 bg-accent/5 hover:bg-accent/10 border-2 border-accent/20 hover:border-accent/40 rounded-xl transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                      <AccountBalance className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">BPI Bank Loan</h3>
                      <p className="text-sm text-gray-600">Apply for a personal loan with BPI</p>
                    </div>
                    <ArrowForward className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Tip:</strong> Group loans are usually faster to approve, while BPI loans may offer larger amounts and longer terms.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoanRequestModal;
