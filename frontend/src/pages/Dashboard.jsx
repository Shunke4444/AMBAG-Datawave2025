import userIcon from "../assets/icons/circle-user.svg";
import menuIcon from "../assets/icons/menu-burger.svg";
import dashboard from "../assets/icons/dashboard-panel.svg";
import transactions from "../assets/icons/transaction.svg";
import goals from "../assets/icons/goals.svg";
import assistant from "../assets/icons/chatbot-speech-bubble.svg";
import loan from "../assets/icons/loan.svg";

const Dashboard = () => {
  return (
    <>
      <aside className="sidebar flex flex-col bg-primary w-60 h-dvh p-3">

        {/*user profile + menu */}
        <div className="flex flex-col">
          <div className="flex justify-between">
            <img src={userIcon} alt="User-Profile" className="w-12 h-12 "/>
            <svg>
              
            </svg>
          </div>
          <h1 className="text-xl font-medium text-secondary">
            Welcome, <span className="text-accent">User!</span>
          </h1>
        </div>

        {/* sidebar panels */}
        <div className="">
          <ul className="text-sm font-medium text-secondary">
            <li>
              
              Dashboard
            </li>
            <li>Transactions</li>
            <li>Goals</li>
            <li>Assistant</li>
            <li>Take a Loan?</li>
          </ul>
        </div>

        {/* bottom part */}
      </aside>
    </>
  )
}

export default Dashboard