import React from 'react';
// import { sampleMembers } from './data/memberData'; // Removed: use real backend data instead
import { useModal, useNudge } from '../../hooks/useMemberManagement';
import { useMembersContext } from './contexts/MembersContext.jsx';
import MemberSearchAndFilter from './components/MemberSearchAndFilter';
import MemberCardList from './components/MemberCardList';
import MemberDetailsModal from './components/MemberDetailsModal';
import NudgeNotification from './components/NudgeNotification';

/**
 * Main component for managing and displaying member list
 * Provides search, filtering, and detailed member information
 */
export default function MemberList() {
  // Use context for member data
  const {
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredMembers
  } = useMembersContext();

  const {
    selectedMember,
    isModalOpen,
    openModal,
    closeModal
  } = useModal();

  const {
    nudgeMessage,
    sendNudge
  } = useNudge();

  if (loading) {
    return <div className="text-center py-12">Loading members...</div>;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Nudge Notification */}
      <NudgeNotification 
        message={nudgeMessage} 
        visible={!!nudgeMessage} 
      />
      <div className="px-4 py-4 pb-20">
        {/* Search and Filter Controls */}
        <MemberSearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />
        {/* Member Cards List */}
        <MemberCardList
          members={filteredMembers}
          onMemberClick={openModal}
          onNudge={sendNudge}
        />
      </div>
      {/* Member Details Modal */}
      <MemberDetailsModal
        isOpen={isModalOpen}
        member={selectedMember}
        onClose={closeModal}
        onNudge={sendNudge}
      />
    </main>
  );
}
