import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Check,
  Close as CloseIcon,
} from '@mui/icons-material';

import { fetchAllMemberRequests, approveMemberRequest, rejectMemberRequest } from '../../lib/api';

export default function MemberRequestApproval() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllMemberRequests();
        // Map backend data to UI format
        const mapped = data.map((req) => ({
          id: req._id || req.id || req.request_id || Math.random().toString(36).slice(2),
          subject: req.subject || req.metadata?.subject || 'No Subject',
          submittedBy: req.metadata?.submittedBy || req.user_name || req.user_id || 'Unknown',
          submittedDate: req.created_at ? new Date(req.created_at) : new Date(),
          status: req.status || 'pending',
          priority: req.priority || 'medium',
          requestType: req.type || req.requestType || 'other',
          description: req.description || '',
          amount: req.metadata?.amount || req.amount,
          paymentPeriod: req.metadata?.paymentPeriod,
          interestRate: req.metadata?.interestRate,
          startingDate: req.metadata?.startingDate,
          dueDate: req.metadata?.dueDate,
        }));
        setRequests(mapped);
      } catch (err) {
        setError('Failed to fetch member requests.');
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);


  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.submittedBy && request.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = requests.filter(req => req.status === 'pending').length;

  const handleCardClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleApprove = async (requestId) => {
    try {
      await approveMemberRequest(requestId);
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      alert('Failed to approve request.');
    }
    setIsModalOpen(false);
  };

  const handleReject = async (requestId) => {
    try {
      await rejectMemberRequest(requestId);
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      alert('Failed to reject request.');
    }
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
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading member requests...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

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