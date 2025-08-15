

const ProfileTab = () => {
  const personalInfo = [
    { label: 'Name', value: 'Jihad Fariq' },
    { label: 'Display Name', value: 'TJ' },
    { label: 'Email Address', value: 'JihadFariq123@gmail.com' },
    { label: 'Password', value: '*************' },
    { label: 'Phone Number', value: '1111-222-3333' },
  ];

  return (
    <main className="border-accent border-2 m-4 p-4 flex flex-col gap-8 mb-24">
      <h1 className="text-xl font-medium text-primary">Personal Information</h1>

      {/* Personal Details */}
      <div className="flex flex-col gap-4">
        {personalInfo.map((info, idx) => (
          <div key={idx} className="flex justify-between items-center gap-4">
            <div className="flex gap-2">
              <span className="font-medium text-textcolor">{info.label}:</span>
              <span className="text-textcolor">{info.value}</span>
            </div>
            <button
              className="outline-1 outline-gray-400 text-textcolor py-1 px-4 rounded-md cursor-pointer
              hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      <h1 className="text-xl font-medium text-primary mt-6">Address</h1>

      {/* Dropdown Selects */}
      <div className="flex flex-col md:flex-row flex-wrap gap-4 py-12 px-4">
      {/* Country */}
      <div className="flex flex-col w-full md:w-1/2 lg:w-1/3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
        <input 
          type="text" 
          placeholder="Enter country" 
          className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* City */}
      <div className="flex flex-col w-full md:w-1/2 lg:w-1/3">
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        <input 
          type="text" 
          placeholder="Enter city" 
          className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Postal Code */}
      <div className="flex flex-col w-full md:w-1/2 lg:w-1/3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
        <input 
          type="text" 
          placeholder="Enter postal code" 
          className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>

    {/* Save Button */}
    <div className="flex justify-center md:justify-start">
      <button className="bg-primary text-secondary font-medium rounded-md px-8 py-2 mt-4 cursor-pointer">
        Save
      </button>
    </div>

    </main>
  );
};

export default ProfileTab;

