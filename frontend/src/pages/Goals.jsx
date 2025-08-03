
import {Add as AddIcon} from '@mui/icons-material';
import GoalInfo from '../components/GoalInfo';

const Goals = () => {


  return (
    <>
      <main className="flex flex-col w-full h-full min-h-screen  justify-center" >  
          
          <div className="w-372  h-176 bg-primary mx-20 rounded-4xl flex flex-col justify-start gap-4">
            <header className='flex justify-end p-8'>
              <button className='cursor-pointer'>
                <AddIcon className='text-secondary'/>
              </button>
            </header>
            <GoalInfo/>
          </div>
      </main>
    </>
  )
}

export default Goals