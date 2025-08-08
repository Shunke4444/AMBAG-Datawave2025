import { useState } from 'react';
import {
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Box,
  TextField,
  InputAdornment,
  OutlinedInput
} from '@mui/material';


const WithdrawForm = () => {

  const [methodOption, setMethodOption] = useState('');

  const optionChange = (event) => {
    setMethodOption(event.target.value);
  }

  const paymentOptionsInfo = [
    {
      name:"Bank Card",
      payTime: "Instant",
      fee:"0%"
    },
    {
      name:"PayMaya",
      payTime: "5-10mins",
      fee:"5%"
    },
    {
      name:"GCash",
      payTime: "15-20mins",
      fee:"8%"
    },
    {
      name:"Gotyme",
      payTime: "5-10mins",
      fee:"6%"
    },
  ]

  const selectedOption = paymentOptionsInfo.find(
    (option) => option.name === methodOption
  );


  return (
    <main className="flex flex-col w-full h-full min-h-screen  justify-center">

      <div className="w-372 min-h-176 bg-secondary outline-1 outline-primary mx-20 rounded-4xl p-8 flex gap-80">
        <form className="flex flex-col gap-16 p-4 w-160 text-textcolor">
          
          {/* Payment Method Select */}
          <FormControl fullWidth variant="outlined" sx={{ backgroundColor: 'white', borderRadius: 2 }}>
            <InputLabel id="payMethod">Payment Options</InputLabel>
            <Select
              labelId="payMethod"
              id="payMethodOptions"
              value={methodOption}
              onChange={optionChange}
              label="Payment Options"
            >
              <MenuItem value="Bank Card">Bank Card
              
              </MenuItem>
              <MenuItem value="PayMaya">Maya Wallet</MenuItem>
              <MenuItem value="GCash">GCash</MenuItem>
              <MenuItem value="Gotyme">Gotyme</MenuItem>
            </Select>
          </FormControl>

          {/* Account Number */}
          <TextField
            fullWidth
            required
            id="accountNum"
            label="Account Number"
            variant="outlined"
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                color: 'inherit',
              },
              '& .MuiInputLabel-root': {
                color: 'inherit',
              },
            }}
          />

          {/* Amount Field */}
          <FormControl fullWidth variant="outlined" sx={{ backgroundColor: 'white', borderRadius: 2 }}>
            <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
            <OutlinedInput
              id="outlined-adornment-amount"
              startAdornment={<InputAdornment position="start">₱</InputAdornment>}
              label="Amount"
            />
          </FormControl>
            
          <button type='submit'
            className='bg-primary p-4 font-medium text-xs rounded-md text-secondary cursor-pointer'
            fullWidth
          >
            Continue
          </button>
            
        </form>
        <Box className="w-160 text-textcolor rounded-md p-4">
          {selectedOption ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">{selectedOption.name}</h2>
              <p className="text-sm">Processing Time: {selectedOption.payTime}</p>
              <p className="text-sm">Fee: {selectedOption.fee}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a method to see details</p>
          )}
        </Box>
      </div>
        
    </main>
  )
}

export default WithdrawForm