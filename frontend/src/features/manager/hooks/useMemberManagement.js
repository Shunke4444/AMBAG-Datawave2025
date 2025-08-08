import { useState, useMemo } from 'react';

/**
 * Custom hook for managing member list state and filtering
 * @param {Array} initialMembers - Initial member data
 * @returns {Object} Members state and handlers
 */
export const useMembers = (initialMembers) => {
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || member.goalStatus === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [members, searchTerm, filterStatus]);

  const memberStats = useMemo(() => {
    const activeMembers = members.filter(m => 
      m.goalStatus === 'on-track' || m.goalStatus === 'fully-paid'
    ).length;
    
    const atRiskMembers = members.filter(m => 
      m.goalStatus === 'behind' || m.goalStatus === 'at-risk' || m.goalStatus === 'overdue'
    ).length;

    return { activeMembers, atRiskMembers };
  }, [members]);

  return {
    members,
    setMembers,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredMembers,
    memberStats
  };
};

/**
 * Custom hook for managing modal state
 * @returns {Object} Modal state and handlers
 */
export const useModal = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMember(null);
    setIsModalOpen(false);
  };

  return {
    selectedMember,
    isModalOpen,
    openModal,
    closeModal
  };
};

/**
 * Custom hook for managing nudge notifications
 * @returns {Object} Nudge state and handlers
 */
export const useNudge = () => {
  const [nudgeMessage, setNudgeMessage] = useState('');

  const sendNudge = (memberId, memberName) => {
    // Simulate sending a nudge notification
    console.log(`Nudging member ${memberName} (ID: ${memberId})`);
    setNudgeMessage(`Nudge sent to ${memberName}!`);
    setTimeout(() => setNudgeMessage(''), 3000);
  };

  return {
    nudgeMessage,
    sendNudge
  };
};
