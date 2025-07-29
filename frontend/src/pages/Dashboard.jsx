

const Dashboard = () => {

  return (
    <div className="flex flex-col lg:flex-row w-full h-full min-h-screen">
      

      <main>
        <div className="">
          <h1 className="text-xl font-bold text-textcolor p-20">
            Dashboard
          </h1>
          {/* notif, settings , help supp  */}
        </div>
        
        <div className="w-432  h-208.25 bg-primary mx-20 rounded-tr-4xl rounded-tl-4xl grid grid-cols-3 grid-rows-[auto_auto_auto] gap-4 p-4 ">

          {/* Member List - Tall Left Box */}
            <div className="row-span-3 bg-secondary rounded-2xl p-4 col-span-1">
              {/* Group Contribution Status */}
            </div>

          {/* Top Right Boxes */}
            <div className="col-span-1 bg-secondary rounded-xl p-4">
              {/* Monthly House Bills */}
            </div>
            <div className="col-span-1 bg-secondary rounded-xl p-4">
              {/* Boracay Trip */}
            </div>

            {/* Mid Right Boxes */}
            <div className="col-span-1 bg-secondary rounded-xl p-4">
              {/* Tuition Fee */}
            </div>
            <div className="col-span-1 bg-secondary rounded-xl p-4">
              {/* Emergency Funds */}
            </div>

            {/* Bottom Right Wide Box */}
            <div className="col-span-2 bg-secondary rounded-xl p-4">
              {/* Consistency Report and Stats */}
            </div>

            {/* Footer Buttons */}
            <div className="col-span-3 bg-secondary rounded-xl p-4 flex justify-between gap-4">
              {/* Buttons like Add Goal, Notify Members, etc. */}
            </div>

        </div>
      </main>

    </div>
  )
}

export default Dashboard