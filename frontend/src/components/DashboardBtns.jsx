
import {
  Addchart as AddGoalIcon,
  NotificationsActive as NotifyIcon,
  SettingsAccessibility as ManageMembersIcon,
  Add
} from '@mui/icons-material';

const DashboardBtns = () => {
  return (
    <div className='flex gap-16 p-4'>
      <div>
        <h1 className='font-bold text-lg text-primary'>Current Members: 4</h1>
      </div>
      <div className='flex gap-8'>
        <button className="bg-primary text-white hover:bg-primary/80 px-4 py-2 rounded-lg shadow cursor-pointer">
          <AddGoalIcon/>
          <p>Add Goals</p>
        </button>
        <button className="bg-primary text-white hover:bg-primary/80 px-4 py-2 rounded-lg shadow cursor-pointer">
          <NotifyIcon/>
          <p>Notify Members</p>
        </button>
        <button className="bg-primary text-white hover:bg-primary/80 px-4 py-2 rounded-lg shadow cursor-pointer">
          <ManageMembersIcon/>
          <p>Manage Members</p>
        </button>        
      </div>
    </div>
  )
}

export default DashboardBtns