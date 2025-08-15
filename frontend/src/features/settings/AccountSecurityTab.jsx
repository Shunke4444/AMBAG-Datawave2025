import { Box, TextField } from '@mui/material'
import useIsMobile from '../../hooks/useIsMobile';

const AccountSecurityTab = () => {
  const isMobile = useIsMobile();

  // Mobile / Tablet Layout
  if (isMobile) {
    return (
      <main className="border-accent border-2 m-2 p-4 flex flex-col gap-6">
        <h1 className="text-xl font-medium text-primary">Security Options</h1>

        {/* Change Password Section */}
        <div className="flex flex-col gap-4 w-full">
          <h3 className="font-semibold text-md">Change Password</h3>
          <TextField label="Current Password" variant="outlined" fullWidth className="mb-2"/>
          <TextField label="New Password" variant="outlined" fullWidth className="mb-2"/>
          <TextField label="Confirm New Password" variant="outlined" fullWidth className="mb-2"/>
          <div className="flex gap-2">
            <button className="flex-1 bg-primary text-secondary py-2 rounded-md font-medium hover:bg-primary/80 transition-colors">
              Save
            </button>
            <button className="flex-1 outline-1 outline-gray-400 text-textcolor py-2 rounded-md hover:bg-gray-100 transition-colors">
              Cancel
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex flex-col gap-4 w-full">
          <h3 className="font-semibold text-sm md:text-md lg:text-lg">Two-Factor Authentication</h3>
          <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-md">
            {/* Email */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="font-medium text-xs sm:text-sm md:text-base text-textcolor">
                Email Address: JihadFariq123@gmail.com
              </span>
              <button className="sm:flex-none w-full sm:w-auto py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm md:text-base outline-1 outline-gray-400 rounded-md hover:bg-gray-100 transition-colors">
                Edit
              </button>
            </div>
            {/* Phone */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="font-medium text-xs sm:text-sm md:text-base text-textcolor">
                Phone Number: 1111-222-3333
              </span>
              <button className="sm:flex-none w-full sm:w-auto py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm md:text-base outline-1 outline-gray-400 rounded-md hover:bg-gray-100 transition-colors">
                Edit
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Desktop Layout
  return (
    <main className="border-accent border-2 m-4 p-4 flex flex-col gap-12">
      <h1 className="text-xl font-medium text-primary">Security Options</h1>

      {/* Change Password Section */}
      <div className="flex flex-col gap-8 w-auto px-12">
        <h3 className="font-semibold text-md">Change Password</h3>
        <div className="flex justify-between gap-12">
          <TextField label="Current Password" variant="outlined" fullWidth/>
          <TextField label="New Password" variant="outlined" fullWidth/>
          <button
            type="submit"
            className="bg-primary text-secondary px-10 py-1 font-medium rounded-md hover:bg-primary/80 transition-colors"
          >
            Save
          </button>
        </div>
        <div className="flex gap-12">
          <TextField label="Confirm New Password" variant="outlined" fullWidth/>
          <button
            className="outline-1 outline-gray-400 text-textcolor py-1 px-8 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Two-Factor Authentication */}
        <h3 className="font-semibold text-md">Two-Factor Authentication</h3>
        <div className="flex justify-between">
          <div className="flex">
            {/* Labels */}
            <p className="text-textcolor font-medium text-sm flex flex-col gap-8 p-8">
              <span>Email Address:</span>
              <span>Phone Number:</span>
            </p>
            {/* Details */}
            <p className="text-textcolor font-medium text-sm flex flex-col gap-8 p-8">
              <span>JihadFariq123@gmail.com</span>
              <span>1111-222-3333</span>
            </p>
          </div>
          {/* Edit buttons */}
          <div className="flex flex-col gap-8 p-8">
            <button className="outline-1 outline-gray-400 text-textcolor py-1 px-4 rounded-md hover:bg-gray-100 transition-colors">Edit</button>
            <button className="outline-1 outline-gray-400 text-textcolor py-1 px-4 rounded-md hover:bg-gray-100 transition-colors">Edit</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AccountSecurityTab;
