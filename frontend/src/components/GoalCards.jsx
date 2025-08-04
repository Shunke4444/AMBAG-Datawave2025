import { 
  Card, 
  CardContent, 
  LinearProgress, 
  Box } from '@mui/material';

import useIsMobile from '../hooks/useIsMobile';

const goals = [
  {
    title: "Monthly House Bills",
    percentage: 54,
    amount: 8100,
    total: 15000,
    status: "not yet complete",
    daysLeft: "15 days left",
    color: "red"
  },
  {
    title: "Boracay Trip",
    percentage: 32,
    amount: 28800,
    total: 90000,
    status: "not completed",
    daysLeft: "5 months left",
    color: "rose"
  },
  {
    title: "Tuition Fee",
    percentage: 78,
    amount: 39000,
    total: 50000,
    status: "almost complete",
    daysLeft: "35 days left",
    color: "amber"
  },
  {
    title: "Emergency Funds",
    percentage: 17,
    amount: 56100,
    total: 330000,
    status: "not completed",
    daysLeft: "1 year left",
    color: "rose"
  }
];

const GoalCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
      {goals.map((goal, index)=> (
        <Card key={index} className="bg-white !rounded-2xl p-4 shadow-md space-y-2 h-64">
          <CardContent>
            <h1 className='text-md font-bold mb-4'>{goal.title}</h1>
            <div className="text-sm font-semibold text-primary">
              {goal.percentage}%{" "}
              <span className='font-light text-xs text-primary'>
                {goal.status}
              </span>
            </div>
            <Box display="flex" alignItems="center" gap={2}>
                <Box width="100%" mr={1}>
                  <LinearProgress variant="determinate" ssx={{
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: !goal.color, 
                    }
                  }}  />
                </Box>
            </Box>
            <p className='text-sm font-medium mt-4'>
              ₱{goal.amount.toLocaleString()}.00 / ₱{goal.total.toLocaleString()}.00
            </p>
            <p className="text-xs text-gray-500 mt-4">{goal.daysLeft}</p>

          </CardContent>
        </Card>
      ))}
      
    </div>
    
  )
}

export default GoalCards