import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowBack, 
  AccountBalance, 
  AccessTime, 
  Percent,
  Send
} from '@mui/icons-material';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormHelperText
} from '@mui/material';

const GroupLoanRequest = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    paymentPeriod: '',
    interestRate: '',
    reason: ''
  });

  const [errors, setErrors] = useState({});

  const paymentPeriods = [
    { value: '1', label: '1 Month' },
    { value: '2', label: '2 Months' },
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '1 Year' }
  ];

  const interestRates = [
    { value: '0', label: '0% (No Interest)' },
    { value: '2', label: '2% per month' },
    { value: '3', label: '3% per month' },
    { value: '5', label: '5% per month' },
    { value: 'negotiable', label: 'Negotiable' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid loan amount';
    }

    if (!formData.purpose) {
      newErrors.purpose = 'Please specify the purpose of the loan';
    }

    if (!formData.paymentPeriod) {
      newErrors.paymentPeriod = 'Please select a payment period';
    }

    if (!formData.interestRate) {
      newErrors.interestRate = 'Please select an interest rate';
    }

    if (!formData.reason) {
      newErrors.reason = 'Please provide a reason for the loan request';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center mr-3 transition-colors"
          >
            <ArrowBack className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Group Loan Request</h1>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Field */}
          <div>
            <TextField
              fullWidth
              label="Loan Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: (
                  <div className="flex items-center mr-2">
                    <AccountBalance className="w-5 h-5 text-gray-400" />
                    <span className="ml-1 text-gray-600">₱</span>
                  </div>
                ),
              }}
              placeholder="0.00"
              variant="outlined"
            />
          </div>

          {/* Purpose Field */}
          <div>
            <TextField
              fullWidth
              label="Purpose of Loan"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              error={!!errors.purpose}
              helperText={errors.purpose}
              placeholder="e.g., Emergency, Education, Business"
              variant="outlined"
            />
          </div>

          {/* Payment Period */}
          <div>
            <FormControl fullWidth error={!!errors.paymentPeriod}>
              <InputLabel>Payment Period</InputLabel>
              <Select
                value={formData.paymentPeriod}
                onChange={(e) => handleInputChange('paymentPeriod', e.target.value)}
                label="Payment Period"
                startAdornment={<AccessTime className="w-5 h-5 text-gray-400 mr-2" />}
              >
                {paymentPeriods.map((period) => (
                  <MenuItem key={period.value} value={period.value}>
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.paymentPeriod && (
                <FormHelperText>{errors.paymentPeriod}</FormHelperText>
              )}
            </FormControl>
          </div>

          {/* Interest Rate */}
          <div>
            <FormControl fullWidth error={!!errors.interestRate}>
              <InputLabel>Preferred Interest Rate</InputLabel>
              <Select
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                label="Preferred Interest Rate"
                startAdornment={<Percent className="w-5 h-5 text-gray-400 mr-2" />}
              >
                {interestRates.map((rate) => (
                  <MenuItem key={rate.value} value={rate.value}>
                    {rate.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.interestRate && (
                <FormHelperText>{errors.interestRate}</FormHelperText>
              )}
            </FormControl>
          </div>

          {/* Reason Field */}
          <div>
            <TextField
              fullWidth
              label="Reason for Loan Request"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              error={!!errors.reason}
              helperText={errors.reason}
              placeholder="Please provide details about why you need this loan and how you plan to repay it..."
              variant="outlined"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              📋 <strong>Note:</strong> Your loan request will be sent to all group members for approval. You'll be notified once members respond to your request.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>Send Loan Request</span>
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default GroupLoanRequest;
