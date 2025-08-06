
import {MoreVert as MoreIcon} from '@mui/icons-material';
import {Card, CardContent} from '@mui/material'
const GoalInfo = () => {

  const goals = [
  {
    title: "Monthly House Bills",
    amount: 8100.00,
    total: 15000.00,
    daysLeft: "15 days left",
    reqShare: 2500.00,
    payAmount: 2500.00,
    remaining: "None",
    deadline: "July 30, 2025"
  },
  {
    title: "Boracay Trip",
    amount: 28800.00,
    total: 90000.00,
    status: "not completed",
    daysLeft: "5 months left",
    reqShare: 11500.00,
    payAmount: 5500.00,
    remaining: 6000.00,
    deadline: "December 19, 2025"
  },
  {
    title: "Tuition Fee",
    amount: 39000.00,
    total: 50000.00,
    daysLeft: "35 days left",
    reqShare: 8600.00,
    payAmount: 4000.00,
    remaining: 4600.00,
    deadline: "August 15, 2025"
  },
  {
    title: "Emergency Funds",
    amount: 56100.00,
    total: 330000.00,
    daysLeft: "1 year left",
    reqShare: 5500.00,
    payAmount: 5500.00,
    remaining: "None",
    deadline: "July 30, 2026"
  }
];

  return (
    <div>
      <div className="grid grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2 gap-8 min-[100px] w-364 px-14 mx-4">            
        {goals.map((goal, index) => (
              <Card
                key={index}
                className='rounded-2xl shadow-md cursor-pointer'
              >
                <CardContent className='flex flex-col relative'>
                  <header className='flex justify-between'>
                    <h1 className='font-semibold text-md text-primary'>{goal.title}</h1>
                    <MoreIcon />
                  </header>
                  <p className='text-xs text-textcolor'>{goal.daysLeft}</p>
                  <p className='text-md text-green'>{goal.amount} / {goal.total}</p>
                  <span className='text-xs text-tex'>
                    <p>Required Share: <span className='text-green'>{goal.reqShare}</span></p>
                    <p>You've Paid: <span className='text-green'>{goal.payAmount}</span></p>
                    <p>Remaining: <span>{goal.remaining}</span></p>
                  </span>
                  <br></br>
                  <p className='text-sm font-medium'>Deadline: {goal.deadline}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
  )
}
export default GoalInfo