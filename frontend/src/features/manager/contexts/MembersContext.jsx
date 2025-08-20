import React, { createContext, useContext, useState, useEffect } from 'react';

const MembersContext = createContext();

export const MembersProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [groupId, setGroupId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Expose a refreshMembers function for manual refresh after signup/group creation
  const refreshMembers = async () => {
    setLoading(true);
    setUserLoading(true);
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setMembers([]);
        setGroupId(null);
        setCurrentUser(null);
        setLoading(false);
        setUserLoading(false);
        return;
      }
      const token = await user.getIdToken();
      const firebase_uid = user.uid;
      const baseURL = import.meta?.env?.VITE_API_URL || "http://localhost:8000";
      // Fetch user profile
      const userRes = await fetch(`${baseURL}/users/profile/${firebase_uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      setCurrentUser(userData || null);
      setUserLoading(false);
      const group_id = userData?.role?.group_id;
      setGroupId(group_id || null);
      if (!group_id) {
        setMembers([]);
        setLoading(false);
        return;
      }
      // Fetch group members
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
      setCurrentUser(null);
    } finally {
      setLoading(false);
      setUserLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe;
    (async () => {
      const { getAuth, onAuthStateChanged } = await import('firebase/auth');
      const auth = getAuth();
      setAuthLoading(true);
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          refreshMembers();
        } else {
          // Only clear state if user is null and auth is done loading
          setMembers([]);
          setGroupId(null);
          setCurrentUser(null);
        }
        setAuthLoading(false);
      });
    })();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <MembersContext.Provider value={{
      members,
      setMembers,
      loading,
      authLoading,
      groupId,
      searchTerm,
      setSearchTerm,
      filterStatus,
      setFilterStatus,
      refreshMembers,
      currentUser,
      userLoading,
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
