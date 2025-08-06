import { 
  Card, 
  CardContent, 
  LinearProgress, 
  Box } from '@mui/material';

import useIsMobile from '../hooks/useIsMobile';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


// import required modules
import { Navigation, Pagination } from 'swiper/modules';

const getStatus = (amount, total) => {
  const percentage = (amount / total) * 100;
  
  if (percentage === 0) {
    return "Not Started";
  } else if (percentage < 75) {
    return "In Progress";
  } else if (percentage >= 75 && percentage < 100) {
    return "Almost Complete";
  } else if (percentage >= 100) {
    return "Completed";
  }
  return "In Progress";
};


const goals = [
  {
    title: "Monthly House Bills",
    amount: 8100,
    total: 15000,
    daysLeft: "15 days left",
    color: "red"
  },
  {
    title: "Boracay Trip",
    amount: 28800,
    total: 90000,
    daysLeft: "5 months left",
    color: "rose"
  },
  {
    title: "Tuition Fee",
    amount: 39000,
    total: 50000,
    daysLeft: "35 days left",
    color: "amber"
  },
  {
    title: "Emergency Funds",
    amount: 56100,
    total: 330000,
    daysLeft: "1 year left",
    color: "rose"
  }
];

const GoalCards = () => {

  const isUseMobile = useIsMobile();
    if (isUseMobile) {
    // Mobile layout
    return (
      <div className="relative w-full">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation = {true}
                pagination={{
                  el: '.custom-swiper-pagination',
                  clickable: true,
                }}
                spaceBetween={12}
                breakpoints={{
                  0: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                }}
              >
                {goals.map((goal, index) => (
                  <SwiperSlide key={index}>
                    <Card className="w-[80%] md:w-[75%] mx-auto bg-white !rounded-2xl p-4 shadow-md space-y-2 h-64">
                      <CardContent>
                        <h1 className="text-md font-bold mb-4">{goal.title}</h1>
                        <div className="text-sm font-semibold text-primary">
                          {goal.percentage}%{' '}
                          <span className="font-light text-xs text-primary">
                            {goal.status}
                          </span>
                        </div>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box width="100%" mr={1}>
                            <LinearProgress variant="determinate" />
                          </Box>
                        </Box>
                        <p className="text-sm font-medium mt-4">
                          ₱{goal.amount.toLocaleString()}.00 / ₱{goal.total.toLocaleString()}.00
                        </p>
                        <p className="text-xs text-gray-500 mt-4">{goal.daysLeft}</p>
                      </CardContent>
                    </Card>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* ✅ Custom Pagination Dots */}
          <div className="custom-swiper-pagination mt-4 flex justify-center gap-2">

          </div>
        </div>
    );
  }
      



  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
      {goals.map((goal, index)=> {
        const percentage = Math.round((goal.amount / goal.total) * 100);
        const status = getStatus(goal.amount, goal.total);
        
        return (
          <Card key={index} className="bg-white !rounded-2xl p-4 shadow-md space-y-2 h-64">
            <CardContent>
              <h1 className='text-md font-bold mb-4'>{goal.title}</h1>
              <div className="text-sm font-semibold text-primary">
                {percentage}%{" "}
                <span className='font-light text-xs text-primary'>
                  {status}
                </span>
              </div>
              <Box display="flex" alignItems="center" gap={2}>
                  <Box width="100%" mr={1}>
                    <LinearProgress variant="determinate" value={percentage} ssx={{
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
        );
      })}
      
    </div>
    
  )
}

export { goals };
export default GoalCards