import { 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Avatar,
  Typography
} from '@mui/material'

import { useState, useEffect } from 'react';

const ContributionDiv = () => {

  const [contributionsList, setContributionsList] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Get current user
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const firebase_uid = user.uid;

        const baseURL = import.meta?.env?.VITE_API_URL || "http://localhost:8000";
        const userRes = await fetch(`${baseURL}/users/profile/${firebase_uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();
        const group_id = userData?.role?.group_id;
        if (!group_id) return;
        // Fetch group members
        const groupRes = await fetch(`${baseURL}/groups/${group_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const groupData = await groupRes.json();
        
        const members = groupData.members.filter(m => m.role !== 'manager');
        // Map to display format
        const formatted = members.map(m => ({
          first_name: m.first_name,
          last_name: m.last_name,
          name: m.first_name && m.last_name ? `${m.first_name} ${m.last_name}` : m.firebase_uid,
          role: 'Member',
          amount: '+ 2,500.00 PHP', // Replace with actual amount if available
          date: new Date().toLocaleDateString(), // Replace with actual date if available
        }));
        setContributionsList(formatted);
      } catch (err) {
        setContributionsList([]);
      }
    };
    fetchMembers();
  }, []);

 //MUI Functions for Automatic Avatar Coloring!!!
  function stringToColor(string) {
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  };


  function stringAvatar(first_name, last_name) {
    const name = first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || '?';
    const first = first_name?.[0] || '?';
    const second = last_name?.[0] || '';
    return {
      sx: { bgcolor: stringToColor(name) },
      children: `${first}${second}`,
    };
  }

  return (
    <div className="max-h-[600px] overflow-y-auto pr-2 flex flex-col gap-4 mt-7 outline-1 outline-gray-200 rounded-2xl shadow-md lg:outline-0 lg:rounded-none lg:shadow-none">
      <h1 className="flex justify-center text-md font-bold text-primary mt-4 ">
            Group Contribution Status
          </h1>
        {contributionsList.length === 0 ? (
            <Typography variant="body2" className="text-center text-gray-500 p-4">
              No member contributions yet.
            </Typography>
          ) : (

            <List>
              {contributionsList.map((contributions, index)=>(
                <div key = {index}>
                  <ListItem>
                    <ListItemText>
                      <div className="grid grid-cols-3 gap-1 items-center">
                        <div>
                          <Avatar {...stringAvatar(contributions.first_name, contributions.last_name)} />
                        </div>
                        <div className="flex flex-col">
                          <p className='text-sm font-semibold'>{contributions.first_name} {contributions.last_name}</p>
                          <p className='text-xxs text-green font-light'>Contributed</p>
                          <p className='text-xxs font-light'>{contributions.role}</p>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                          <p className='text-xs font-semibold text-green'>{contributions.amount}</p>
                          <p className='text-xxs font-light'>{contributions.date}</p>
                        </div>
                      </div>
                    </ListItemText>
                  </ListItem>
                  {index < contributionsList.length - 1 && (<Divider variant='middle' component="li"/>) }
                </div>
              ))}
            </List>
          )}
    </div>
  )
}

export default ContributionDiv