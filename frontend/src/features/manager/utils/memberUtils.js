/**
 * Formats a number as Philippine Peso currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Gets the color classes for a member's goal status
 * @param {string} status - The member's goal status
 * @returns {string} Tailwind color classes
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'on-track': return 'text-green-600 bg-green-100';
    case 'fully-paid': return 'text-blue-600 bg-blue-100';
    case 'behind': return 'text-yellow-600 bg-yellow-100';
    case 'at-risk': return 'text-orange-600 bg-orange-100';
    case 'overdue': return 'text-primary bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Calculates progress percentage
 * @param {number} paid - Amount paid
 * @param {number} target - Target amount
 * @returns {number} Progress percentage (0-100)
 */
export const getProgressPercentage = (paid, target) => {
  return Math.min((paid / target) * 100, 100);
};

/**
 * Gets the color class for progress bar based on percentage
 * @param {number} percentage - Progress percentage
 * @returns {string} Tailwind background color class
 */
export const getProgressColor = (percentage) => {
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 75) return 'bg-blue-500';
  if (percentage >= 50) return 'bg-yellow-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-primary';
};

/**
 * Gets user initials from full name
 * @param {string} name - Full name
 * @returns {string} User initials (up to 2 characters)
 */
export const getUserInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Formats status text for display
 * @param {string} status - Raw status string
 * @returns {string} Formatted status text
 */
export const formatStatusText = (status) => {
  switch (status) {
    case 'on-track': return 'On Track';
    case 'fully-paid': return 'Completed';
    case 'at-risk': return 'At Risk';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Determines if a member needs nudging based on their status
 * @param {string} goalStatus - Member's goal status
 * @returns {boolean} True if member needs nudging
 */
export const shouldShowNudgeButton = (goalStatus) => {
  return ['behind', 'at-risk', 'overdue'].includes(goalStatus);
};
