
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

  // Example: Load mock data on mount (replace this with backend call)

  useEffect(() => {
    // Simulate fetch kuno hahhaa pag nagrefresh 

    // Mock Data
    setTimeout(() => {
      setContributionsList([
        {
          name: 'Jihad Fariq',
          role: 'Manager',
          amount: '+ 2,500.00 PHP',
          date: '29/07/2025',
        },
        {
          name: 'Gab Vinculado',
          role: 'Member',
          amount: '+ 2,500.00 PHP', 
          date: '29/07/2025'
        },
        {
          name: 'Dianne Boholst',
          role: 'Member',
          amount: '+ 2,500.00 PHP', 
          date: '29/07/2025'
        },
        {
          name: 'Norman Bautista',
          role: 'Member',
          amount: '+ 2,500.00 PHP', 
          date: '29/07/2025'
        },
      ]);
    }, 500);
  }, [])

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


  function stringAvatar(name) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
      };
    }

  return (
    <div className="max-h-[550px] overflow-y-auto pr-2 flex flex-col gap-4 mt-7 outline-1 outline-gray-200 rounded-2xl shadow-md lg:outline-0 lg:rounded-none lg:shadow-none">
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
                <div key = {index} className='px-4'>
                  <ListItem>
                    <ListItemText>
                      <div className="grid grid-cols-3">
                        <div className="p-3 ">
                          <Avatar  {...stringAvatar(contributions.name)} />
                        </div>
                        <div className="flex flex-col absolute left-24">
                          <p className='text-sm font-semibold'>{contributions.name}</p>
                          <p className='text-xxs text-green font-light'>Contributed</p>
                          <p className='text-xxs font-light'>{contributions.role}</p>
                        </div>
                        <div className="flex flex-col gap-4 absolute left-72 md:left-136 lg:left-64">
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