import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check,
  Close as CloseIcon,
} from '@mui/icons-material';


const sampleRequests = [
  {
    id: 1,
    subject: "Request for Emergency Loan",
    submittedBy: "Juan Dela Cruz",
    submittedDate: new Date('2024-01-15'),
    status: "pending",
    priority: "high",
    requestType: "loan-request",
    description: "I need an emergency loan for medical expenses. My family member was hospitalized and I need funds urgently.",
    amount: 50000,
    paymentPeriod: 12,
    interestRate: "negotiable"
  },
  {
    id: 2,
    subject: "Add New Savings Goal - House Down Payment",
    submittedBy: "Maria Santos",
    submittedDate: new Date('2024-01-14'),
    status: "pending",
    priority: "medium",
    requestType: "add-goal",
    description: "I want to create a new savings goal for my house down payment. Target amount is 500,000 pesos.",
    amount: 500000,
    startingDate: "2024-02-01",
    dueDate: "2026-02-01"
  },
  {
    id: 3,
    subject: "Unable to Pay This Month",
    submittedBy: "Pedro Gonzales",
    submittedDate: new Date('2024-01-13'),
    status: "approved",
    priority: "high",
    requestType: "unable-to-pay",
    description: "Due to job loss, I am unable to make my payment this month. I request for a payment extension."
  },
  {
    id: 4,
    subject: "Extend Payment Deadline",
    submittedBy: "Ana Rodriguez",
    submittedDate: new Date('2024-01-12'),
    status: "pending",
    priority: "low",
    requestType: "extend-deadline",
    description: "I need to extend my payment deadline by 2 weeks due to delayed salary."
  },
  {
    id: 5,
    subject: "Change Goal Amount",
    submittedBy: "Carlos Mendoza",
    submittedDate: new Date('2024-01-11'),
    status: "rejected",
    priority: "medium",
    requestType: "change-goal",
    description: "I want to increase my vacation goal from 100,000 to 150,000 pesos.",
    amount: 150000
  }
];

export default function MemberRequestApproval() {
  const [requests, setRequests] = useState(sampleRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = requests.filter(req => req.status === 'pending').length;

  const handleCardClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleApprove = (requestId) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
    setIsModalOpen(false);
  };

  const handleReject = (requestId) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
    setIsModalOpen(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Mobile Layout
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-4 pb-20">
        {/* To be Approved Section */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">To be Approved</h2>
          <div className="space-y-3">
            {filteredRequests.filter(req => req.status === 'pending').map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleCardClick(request)}
                className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-blue-500 text-sm font-semibold">{getUserInitials(request.submittedBy)}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{request.subject}</h3>
                      <p className="text-xs text-gray-500">
                        {request.submittedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {request.submittedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(request.id);
                      }}
                      className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(request.id);
                      }}
                      className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                    >
                      <CloseIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rejected Section */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Rejected</h2>
          <div className="space-y-3">
            {filteredRequests.filter(req => req.status === 'rejected').map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleCardClick(request)}
                className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200 opacity-70"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-semibold">{getUserInitials(request.submittedBy)}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{request.subject}</h3>
                    <p className="text-xs text-gray-500">
                      {request.submittedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {request.submittedBy}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Approved Section */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Approved</h2>
          <div className="space-y-3">
            {filteredRequests.filter(req => req.status === 'approved').map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleCardClick(request)}
                className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white border-2 border-green-600 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-semibold">{getUserInitials(request.submittedBy)}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{request.subject}</h3>
                    <p className="text-xs text-gray-500">
                      {request.submittedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {request.submittedBy}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 text-lg font-semibold">{getUserInitials(selectedRequest.submittedBy)}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Request Details</h2>
                  <p className="text-sm text-gray-500">
                    {selectedRequest.requestType.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <CloseIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Submitted by</p>
                  <p className="text-sm text-gray-600">{selectedRequest.submittedBy}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">Submitted on</p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.submittedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">Priority</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Subject</h3>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  {selectedRequest.subject}
                </p>
              </div>

              {selectedRequest.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    {selectedRequest.description}
                  </p>
                </div>
              )}

              {selectedRequest.amount && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Financial Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Amount</p>
                      <p className="text-sm text-gray-600">{formatCurrency(selectedRequest.amount)}</p>
                    </div>

                    {selectedRequest.paymentPeriod && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Payment Period</p>
                        <p className="text-sm text-gray-600">{selectedRequest.paymentPeriod} months</p>
                      </div>
                    )}

                    {selectedRequest.interestRate && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Interest Rate</p>
                        <p className="text-sm text-gray-600">
                          {selectedRequest.interestRate === '0' ? '0% (No Interest)' : 
                           selectedRequest.interestRate === 'negotiable' ? 'Negotiable' :
                           `${selectedRequest.interestRate}% per month`}
                        </p>
                      </div>
                    )}

                    {selectedRequest.startingDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Starting Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedRequest.startingDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {selectedRequest.dueDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Target Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedRequest.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="px-6 pb-6 flex space-x-3">
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Approve
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
