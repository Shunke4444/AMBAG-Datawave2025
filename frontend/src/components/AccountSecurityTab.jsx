
import {
  Box, TextField
} from '@mui/material'

const AccountSecurityTab = () => {
  return (
    <main className="border-accent border-2 m-4 p-4 flex flex-col gap-12">
      <h1
      className="text-xl font-medium text-primary"
      >Security Options</h1>

      <div className="flex flex-col gap-8 w-auto px-12">
        <h3
        className='font-semibold text-md'
        >Change Password</h3>
        <div className="flex justify-between gap-12">
          <TextField id="outlined-basic" label="Current Password" variant="outlined"  fullWidth/>
          <TextField id="outlined-basic" label="New Password" variant="outlined" fullWidth/>
          <button type="submit"
          className='bg-primary text-secondary px-10 py-1 font-medium rounded-md 
              hover:bg-primary/80 active:bg-primary/70 transition-colors duration-200 cursor-pointer'
          >Save</button>
        </div>
        <div className='flex gap-12'>
          <TextField id="outlined-basic" label="Confirm New Password" variant="outlined" fullWidth />
          <button
          className='outline-1 outline-gray-400  text-textcolor py-1 px-8 rounded-md cursor-pointer 
              hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200'
          >Cancel</button>
        </div>

        <h3
        className='font-semibold text-md'
        >Two-Factor Authentication</h3>
        
        <div className="flex flex-2/3 justify-between">
        <div className="flex">
          {/* Labels */}
            <p className="text-textcolor font-medium text-sm flex flex-col gap-8 p-8">
              <span>Email Address: </span>
              <span>Phone Number: </span>
            </p>

          {/* Details */}
            <p className="text-textcolor font-medium text-sm flex flex-col gap-8 p-8">
              <span>JihadFariq123@gmail.com</span>
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
            >Edit
            </button>
          </div>
        </div>

      </div>


    </main>
  )
}

export default AccountSecurityTab