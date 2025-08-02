






const ProfileTab = () => {
  return (
    <main className="border-accent border-2 m-4 p-4 flex flex-col gap-12 ">
      
      <h1
      className="text-xl font-medium text-primary"
      >Personal Information</h1>
      
      {/* Personal Details */}
      <div className="flex flex-2/3 justify-between">
        <div className="flex">
          {/* Labels */}
            <p className="text-textcolor font-medium text-sm flex flex-col gap-8 p-8">
              <span>Name: </span>
              <span>Display Name: </span>
              <span>Email Address: </span>
              <span>Password: </span>
              <span>Phone Number: </span>
            </p>
            

          {/* Details */}
            <p className="text-textcolor font-medium text-sm flex flex-col gap-8 p-8">
              <span>Jihad Fariq </span>
              <span>TJ </span>
              <span>JihadFariq123@gmail.com</span>
              <span>************* </span>
              <span>1111-222-3333</span>
            </p>

        </div>
          {/* Edit btn */}
          <div className="flex flex-col gap-8 p-8">
            <button
            className=" outline-1 outline-gray-400    text-textcolor py-1 px-4 rounded-md cursor-pointer 
                hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"
            >Edit</button>
            <button
            className=" outline-1 outline-gray-400 text-textcolor py-1 px-4 rounded-md cursor-pointer 
                hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"

            >Edit</button>
            <button
            className=" outline-1 outline-gray-400 text-textcolor py-1 px-4 rounded-md cursor-pointer 
                hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"
            >Edit</button>
            <button
            className=" outline-1 outline-gray-400 text-textcolor py-1 px-4 rounded-md cursor-pointer 
                hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"
            >Edit</button>
          </div>
        </div>
      <h1
      className="text-xl font-medium text-primary"
      > Address
      </h1>


      {/* Dropdown Selects of  Country, City, Postal*/}

      <div className="flex justify-evenly py-12 px-12 sm:flex-col lg:flex-row ">

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Country
          </label>
          <select className=" w-80 p p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value=""></option>
              <option value="one">Option One</option>
              <option value="two">Option Two</option>
            </select>
        </div>
        

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          City
          </label>
          <select className=" w-80 p p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value=""></option>
              <option value="one">Option One</option>
              <option value="two">Option Two</option>
            </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Postal Code
          </label>
          <select className=" w-80 p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value=""></option>
              <option value="one">Option One</option>
              <option value="two">Option Two</option>
          </select>
        </div>
      </div>

      <button className="px-16 bg-primary p-2 mx-12 text-secondary font-medium rounded-md cursor-pointer w-fit">
        Save
      </button>
    </main>
  )
}

export default ProfileTab