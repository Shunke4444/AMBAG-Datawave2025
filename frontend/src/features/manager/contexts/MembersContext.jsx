import React, { createContext, useContext, useState, useEffect } from 'react';

const MembersContext = createContext();

export const MembersProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [groupId, setGroupId] = useState(null);

  useEffect(() => {
    let unsubscribe;
    const initAuthAndFetch = async () => {
      const { getAuth, onAuthStateChanged } = await import('firebase/auth');
      const auth = getAuth();
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        // Only redirect if not already on login or signup
        const path = window.location.pathname;
        if (!user && path !== '/login' && path !== '/signup') {
          console.warn('No user found, redirecting to login...');
          window.location.replace('/login');
          return;
        }
        if (!user) {
          setMembers([]);
          setLoading(false);
          return;
        }
        try {
          const token = await user.getIdToken();
          const firebase_uid = user.uid;
          const baseURL = import.meta?.env?.VITE_API_URL || "http://localhost:8000";
          const userRes = await fetch(`${baseURL}/users/profile/${firebase_uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = await userRes.json();
          const group_id = userData?.role?.group_id;
          setGroupId(group_id || null);
          if (!group_id) {
            console.warn('No group_id found in user profile');
            setMembers([]);
            setLoading(false);
            return;
          }
          const groupRes = await fetch(`${baseURL}/groups/${group_id}/members`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          let membersData = await groupRes.json();
          membersData = Array.isArray(membersData) ? membersData : [];
          membersData = membersData.map((m, idx) => ({
            ...m,
            name: `${m.first_name || ''} ${m.last_name || ''}`.trim(),
            id: m.firebase_uid || idx,
            email: m.email || '',
            currentGoal: m.currentGoal || '',
            targetAmount: m.targetAmount || 0,
            paidAmount: m.paidAmount || 0,
            monthlyTarget: m.monthlyTarget || 0,
            lastPayment: m.lastPayment ? new Date(m.lastPayment) : new Date(),
            missedPayments: m.missedPayments || 0,
            joinDate: m.joinDate ? new Date(m.joinDate) : new Date(),
            paymentHistory: m.paymentHistory || [],
            goalStatus: m.goalStatus || 'on-track',
          }));
          setMembers(membersData);
        } catch (err) {
          setMembers([]);
        } finally {
          setLoading(false);
        }
      });
    };
    initAuthAndFetch();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <MembersContext.Provider value={{
      members,
      setMembers,
      loading,
      groupId,
      searchTerm,
      setSearchTerm,
      filterStatus,
      setFilterStatus,
      filteredMembers: React.useMemo(() => {
        let result;
        const contributorMembers = members.filter(m => m.role !== 'manager');
        if (!searchTerm.trim()) {
          result = contributorMembers.filter(member => filterStatus === 'all' || member.goalStatus === filterStatus);
        } else {
          result = contributorMembers.filter(member => {
            const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
              (member.email || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === 'all' || member.goalStatus === filterStatus;
            return matchesSearch && matchesFilter;
          });
        }
        return result;
      }, [members, searchTerm, filterStatus])
    }}>
      {children}
    </MembersContext.Provider>
  );
};

export const useMembersContext = () => useContext(MembersContext);
