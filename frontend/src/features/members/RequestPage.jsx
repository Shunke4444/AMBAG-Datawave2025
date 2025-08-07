import React, { useState, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Badge
} from '@mui/material';
import MobileLayout from '../payments/PaymentLayout';
import MobileHeader from '../../shared/components/MobileHeader';
import RequestSubmittedModal from './RequestSubmittedModal';

export default function Request() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    requestType: '',
    subject: '',
    description: '',
    priority: '',
    amount: '',
    startingDate: '',
    dueDate: '',
    paymentPeriod: '',
    interestRate: ''
  });

  // Check URL parameters and pre-select loan request if needed
  useEffect(() => {
    const requestType = searchParams.get('type');
    if (requestType === 'loan') {
      setFormData(prev => ({
        ...prev,
        requestType: 'loan-request',
        subject: 'Loan Request from Group Members'
      }));
    }
  }, [searchParams]);

  const [modalOpen, setModalOpen] = useState(false);
  const [recentRequests, setRecentRequests] = useState([
    {
      id: 1,
      type: "Goal Modification",
      description: "Update monthly contribution amount",
      status: "Approved",
      statusColor: "green",
      submittedDate: "1 week ago"
    },
    {
      id: 2,
      type: "Membership Issue", 
      description: "Account access problem",
      status: "Rejected",
      statusColor: "red",
      submittedDate: "2 weeks ago"
    }
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation logic - all fields except description are required
    const requiredFields = ['requestType', 'subject', 'priority'];
    
    // If request type is "add-goal", also validate goal-specific fields
    if (formData.requestType === 'add-goal') {
      requiredFields.push('amount', 'startingDate', 'dueDate');
    }
    
    // If request type is "loan-request", also validate loan-specific fields
    if (formData.requestType === 'loan-request') {
      requiredFields.push('amount', 'paymentPeriod', 'interestRate');
    }
    
    // Check if all required fields are filled
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create new request object
    const newRequest = {
      id: Date.now(),
      type: formData.requestType.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      description: formData.subject,
      status: "Pending",
      statusColor: "orange",
      submittedDate: "Just now"
    };
    
    // Add to recent requests at the top and remove the last one
    setRecentRequests(prev => [newRequest, ...prev.slice(0, 1)]);
    
    // Show success modal
    setModalOpen(true);
    
    // Reset form
    setFormData({
      requestType: '',
      subject: '',
      description: '',
      priority: '',
      amount: '',
      startingDate: '',
      dueDate: '',
      paymentPeriod: '',
      interestRate: ''
    });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Desktop Layout
  const desktopLayout = (
    <main className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Request Form */}
          <section className={`${isMobile ? 'col-span-1' : 'col-span-2'}`}>
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <Typography variant="h5" className="mb-6 font-semibold text-textcolor">
                  New Request
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  {/* Request Type */}
                  <Box mb={3}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="request-type-label">Request Type</InputLabel>
                      <Select
                        labelId="request-type-label"
                        value={formData.requestType}
                        onChange={(e) => handleInputChange('requestType', e.target.value)}
                        label="Request Type"
                        sx={{
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        <MenuItem value="add-goal">Add a Goal</MenuItem>
                        <MenuItem value="change-goal">Change Goal</MenuItem>
                        <MenuItem value="discontinue-goal">Discontinue Goal</MenuItem>
                        <MenuItem value="loan-request">Loan Request</MenuItem>
                        <MenuItem value="concern">Concern</MenuItem>
                        <MenuItem value="unable-to-pay">Unable to Pay</MenuItem>
                        <MenuItem value="extend-deadline">Extend Deadline</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Subject */}
                  <Box mb={3}>
                    <TextField
                      fullWidth
                      label="Subject"
                      placeholder="Enter the subject of your request"
                      variant="outlined"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>

                  {/* Conditional Fields for Add a Goal */}
                  {formData.requestType === 'add-goal' && (
                    <>
                      {/* Amount */}
                      <Box mb={3}>
                        <TextField
                          fullWidth
                          label="Goal Amount"
                          placeholder="Enter the target amount for your goal"
                          variant="outlined"
                          type="number"
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', e.target.value)}
                          sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                          InputProps={{
                            startAdornment: <span style={{ marginRight: '8px' }}>$</span>,
                          }}
                        />
                      </Box>

                      {/* Starting Date */}
                      <Box mb={3}>
                        <TextField
                          fullWidth
                          label="Starting Date"
                          type="date"
                          variant="outlined"
                          value={formData.startingDate}
                          onChange={(e) => handleInputChange('startingDate', e.target.value)}
                          sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Box>

                      {/* Due Date */}
                      <Box mb={3}>
                        <TextField
                          fullWidth
                          label="Due Date"
                          type="date"
                          variant="outlined"
                          value={formData.dueDate}
                          onChange={(e) => handleInputChange('dueDate', e.target.value)}
                          sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Box>
                    </>
                  )}

                  {/* Conditional Fields for Loan Request */}
                  {formData.requestType === 'loan-request' && (
                    <>
                      {/* Loan Amount */}
                      <Box mb={3}>
                        <TextField
                          fullWidth
                          label="Loan Amount"
                          placeholder="Enter the amount you want to borrow"
                          variant="outlined"
                          type="number"
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', e.target.value)}
                          sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                          InputProps={{
                            startAdornment: <span style={{ marginRight: '8px' }}>₱</span>,
                          }}
                        />
                      </Box>

                      {/* Payment Period */}
                      <Box mb={3}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="payment-period-label">Payment Period</InputLabel>
                          <Select
                            labelId="payment-period-label"
                            value={formData.paymentPeriod || ''}
                            onChange={(e) => handleInputChange('paymentPeriod', e.target.value)}
                            label="Payment Period"
                            sx={{
                              backgroundColor: 'white',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          >
                            <MenuItem value="1">1 Month</MenuItem>
                            <MenuItem value="2">2 Months</MenuItem>
                            <MenuItem value="3">3 Months</MenuItem>
                            <MenuItem value="6">6 Months</MenuItem>
                            <MenuItem value="12">1 Year</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Interest Rate Preference */}
                      <Box mb={3}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="interest-rate-label">Preferred Interest Rate</InputLabel>
                          <Select
                            labelId="interest-rate-label"
                            value={formData.interestRate || ''}
                            onChange={(e) => handleInputChange('interestRate', e.target.value)}
                            label="Preferred Interest Rate"
                            sx={{
                              backgroundColor: 'white',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          >
                            <MenuItem value="0">0% (No Interest)</MenuItem>
                            <MenuItem value="2">2% per month</MenuItem>
                            <MenuItem value="3">3% per month</MenuItem>
                            <MenuItem value="5">5% per month</MenuItem>
                            <MenuItem value="negotiable">Negotiable</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </>
                  )}

                  {/* Priority */}
                  <Box mb={3}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="priority-label">Priority Level</InputLabel>
                      <Select
                        labelId="priority-label"
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        label="Priority Level"
                        sx={{
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Description */}
                  <Box mb={3}>
                    <TextField
                      fullWidth
                      label="Description"
                      placeholder="Please provide detailed information about your request, including any specific amounts or requirements"
                      multiline
                      rows={6}
                      variant="outlined"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: '#830000',
                      color: 'white',
                      py: 2,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'semibold',
                      '&:hover': {
                        backgroundColor: '#6b0000',
                      }
                    }}
                  >
                    Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>

          {/* Request History/Status */}
          <section className="col-span-1">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" className="mb-4 font-semibold text-textcolor">
                  Recent Requests
                </Typography>
                
                <div className="space-y-4">
                  {/* Request Status Items */}
                  {recentRequests.map((request) => (
                    <div key={request.id} className={`border-l-4 ${
                      request.statusColor === 'green' ? 'border-green-500' : 
                      request.statusColor === 'red' ? 'border-red-500' : 
                      request.statusColor === 'orange' ? 'border-primary' : 'border-primary'
                    } pl-4 py-2`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-textcolor text-sm">{request.type}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.statusColor === 'green' ? 'bg-green-100 text-green-800' : 
                          request.statusColor === 'red' ? 'bg-red-100 text-red-800' : 
                          request.statusColor === 'orange' ? 'bg-accent/20 text-textcolor' : 'bg-accent/20 text-textcolor'
                        }`}>{request.status}</span>
                      </div>
                      <p className="text-textcolor/60 text-xs">{request.description}</p>
                      <p className="text-textcolor/40 text-xs mt-1">Submitted {request.submittedDate}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-textcolor/20">
                  <Typography variant="subtitle2" className="mb-3 font-semibold text-textcolor">
                    Quick Actions
                  </Typography>
                  <div className="space-y-2">
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      size="small"
                      sx={{
                        borderColor: '#830000',
                        color: '#830000',
                        '&:hover': {
                          backgroundColor: '#830000',
                          color: 'white',
                        }
                      }}
                    >
                      View All Requests
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      size="small"
                      sx={{
                        borderColor: '#830000',
                        color: '#830000',
                        '&:hover': {
                          backgroundColor: '#830000',
                          color: 'white',
                        }
                      }}
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );

  // Mobile Layout
  const mobileLayout = (
    <main className="min-h-screen bg-white">
      {/* Mobile Header */}
      <MobileHeader title="Member Request" />
      
      <div className="px-0 py-4 space-y-8">
        {/* Request Form */}
        <Card className="shadow-none bg-white rounded-none">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit}>
              {/* Request Type */}
              <Box mb={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="request-type-label-mobile">Request Type</InputLabel>
                  <Select
                    labelId="request-type-label-mobile"
                    value={formData.requestType}
                    onChange={(e) => handleInputChange('requestType', e.target.value)}
                    label="Request Type"
                    sx={{
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  >
                    <MenuItem value="add-goal">Add a Goal</MenuItem>
                    <MenuItem value="change-goal">Change Goal</MenuItem>
                    <MenuItem value="discontinue-goal">Discontinue Goal</MenuItem>
                    <MenuItem value="loan-request">Loan Request</MenuItem>
                    <MenuItem value="concern">Concern</MenuItem>
                    <MenuItem value="unable-to-pay">Unable to Pay</MenuItem>
                    <MenuItem value="extend-deadline">Extend Deadline</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Subject */}
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="Subject"
                  placeholder="Enter the subject of your request"
                  variant="outlined"
                  size="small"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>

              {/* Conditional Fields for Add a Goal */}
              {formData.requestType === 'add-goal' && (
                <>
                  {/* Amount */}
                  <Box mb={3}>
                    <TextField
                      fullWidth
                      label="Goal Amount"
                      placeholder="Enter the target amount for your goal"
                      variant="outlined"
                      size="small"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                      InputProps={{
                        startAdornment: <span style={{ marginRight: '8px' }}>$</span>,
                      }}
                    />
                  </Box>

                  {/* Starting Date */}
                  <Box mb={3}>
                    <TextField
                      fullWidth
                      label="Starting Date"
                      type="date"
                      variant="outlined"
                      size="small"
                      value={formData.startingDate}
                      onChange={(e) => handleInputChange('startingDate', e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Box>

                  {/* Due Date */}
                  <Box mb={3}>
                    <TextField
                      fullWidth
                      label="Due Date"
                      type="date"
                      variant="outlined"
                      size="small"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Box>
                </>
              )}

              {/* Conditional Fields for Loan Request */}
              {formData.requestType === 'loan-request' && (
                <>
                  {/* Loan Amount */}
                  <Box mb={3}>
                    <TextField
                      fullWidth
                      label="Loan Amount"
                      placeholder="Enter the amount you want to borrow"
                      variant="outlined"
                      size="small"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                      InputProps={{
                        startAdornment: <span style={{ marginRight: '8px' }}>₱</span>,
                      }}
                    />
                  </Box>

                  {/* Payment Period */}
                  <Box mb={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel id="payment-period-label-mobile">Payment Period</InputLabel>
                      <Select
                        labelId="payment-period-label-mobile"
                        value={formData.paymentPeriod || ''}
                        onChange={(e) => handleInputChange('paymentPeriod', e.target.value)}
                        label="Payment Period"
                        sx={{
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        <MenuItem value="1">1 Month</MenuItem>
                        <MenuItem value="2">2 Months</MenuItem>
                        <MenuItem value="3">3 Months</MenuItem>
                        <MenuItem value="6">6 Months</MenuItem>
                        <MenuItem value="12">1 Year</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Interest Rate Preference */}
                  <Box mb={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel id="interest-rate-label-mobile">Preferred Interest Rate</InputLabel>
                      <Select
                        labelId="interest-rate-label-mobile"
                        value={formData.interestRate || ''}
                        onChange={(e) => handleInputChange('interestRate', e.target.value)}
                        label="Preferred Interest Rate"
                        sx={{
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        <MenuItem value="0">0% (No Interest)</MenuItem>
                        <MenuItem value="2">2% per month</MenuItem>
                        <MenuItem value="3">3% per month</MenuItem>
                        <MenuItem value="5">5% per month</MenuItem>
                        <MenuItem value="negotiable">Negotiable</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </>
              )}

              {/* Priority */}
              <Box mb={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="priority-label-mobile">Priority Level</InputLabel>
                  <Select
                    labelId="priority-label-mobile"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    label="Priority Level"
                    sx={{
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Description */}
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="Description"
                  placeholder="Please provide detailed information about your request, including any specific amounts or requirements"
                  multiline
                  rows={4}
                  variant="outlined"
                  size="small"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: '#830000',
                  color: 'white',
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#6b0000',
                  }
                }}
              >
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Request History/Status */}
        <Card className="shadow-none bg-white rounded-none">
          <CardContent className="p-4">
            <Typography variant="h6" className="mb-4 font-semibold text-textcolor text-sm">
              Recent Requests
            </Typography>
            
            <div className="space-y-4">
              {/* Request Status Items */}
              {recentRequests.map((request) => (
                <div key={request.id} className={`border-l-4 ${
                  request.statusColor === 'green' ? 'border-green-500' : 
                  request.statusColor === 'red' ? 'border-red-500' : 
                  request.statusColor === 'orange' ? 'border-primary' : 'border-primary'
                } pl-3 py-2`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-textcolor text-xs">{request.type}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.statusColor === 'green' ? 'bg-green-100 text-green-800' : 
                      request.statusColor === 'red' ? 'bg-red-100 text-red-800' : 
                      request.statusColor === 'orange' ? 'bg-accent/20 text-textcolor' : 'bg-accent/20 text-textcolor'
                    }`}>{request.status}</span>
                  </div>
                  <p className="text-textcolor/60 text-xs">{request.description}</p>
                  <p className="text-textcolor/40 text-xs mt-1">Submitted {request.submittedDate}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-textcolor/20">
              <Typography variant="subtitle2" className="mb-3 font-semibold text-textcolor text-sm">
                Quick Actions
              </Typography>
              <div className="space-y-3">
                <Button 
                  fullWidth 
                  variant="outlined" 
                  size="small"
                  sx={{
                    borderColor: '#830000',
                    color: '#830000',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: '#830000',
                      color: 'white',
                    }
                  }}
                >
                  View All Requests
                </Button>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  size="small"
                  sx={{
                    borderColor: '#830000',
                    color: '#830000',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: '#830000',
                      color: 'white',
                    }
                  }}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );

  return (
    <>
      {isMobile ? mobileLayout : desktopLayout}
      <RequestSubmittedModal open={modalOpen} onClose={handleCloseModal} />
    </>
  );
}
