
import {Add as AddIcon} from '@mui/icons-material';
import GoalInfo from './GoalInfo';

const GoalsPage = () => {
  const authRole = "NewUser"; // this will come from auth state later

  return (
    <>
      <main className="flex flex-col w-full h-full min-h-screen justify-center">  
        <div className="w-372 h-176 bg-primary mx-20 rounded-4xl flex flex-col justify-start gap-4">
          <header className="flex justify-end p-8">
            <button className="cursor-pointer">
              <AddIcon className="text-secondary" />
            </button>
          </header>

          {/* Show goal cards only for Manager or Member */}
          {["Manager", "Member"].includes(authRole) ? (
            <GoalInfo />
          ) : (
            <div className="flex justify-center items-center h-full text-secondary/60">
              {/* Empty state placeholder */}
              No goals created yet
            </div>
          )}
        </div>
      </main>
    </>
  );
};


export default GoalsPage