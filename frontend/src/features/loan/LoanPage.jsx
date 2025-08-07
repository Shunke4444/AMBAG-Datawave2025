import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoanRequestModal from './LoanRequestModal';

const LoanPage = ({ isModalOpen, onCloseModal }) => {
  const navigate = useNavigate();

  const handleCloseModal = () => {
    onCloseModal();
  };

  return (
    <>
      {/* Main Loan Request Modal */}
      <LoanRequestModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default LoanPage;
