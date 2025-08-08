import { useState } from "react";
import {
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
  Button,
} from "@mui/material";

const RequestFormMember = () => {
  const [requestType, setRequestType] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      requestType,
      title,
      amount,
      message,
    };
    console.log("Form Submitted:", formData);
    // TODO: send to backend
  };

  return (
    <main className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-primary">Request Funds</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Request Type */}
        <FormControl fullWidth>
          <InputLabel id="request-type-label">Request Type</InputLabel>
          <Select
            labelId="request-type-label"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
          >
            <MenuItem value="add-goal">Add a Goal</MenuItem>
            <MenuItem value="pay-share">Pay Share Quota</MenuItem>
            <MenuItem value="extend-deadline">Extend Deadline</MenuItem>
            <MenuItem value="unable-pay">
              Unable to Pay / Missed Deadline
            </MenuItem>
            <MenuItem value="others">Others</MenuItem>
          </Select>
        </FormControl>

        {/* Request Title */}
        <TextField
          label="Request Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Amount */}
        <TextField
          label="Amount"
          type="number"
          variant="outlined"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* Message Box */}
        <TextField
          label="Additional Details"
          variant="outlined"
          fullWidth
          multiline
          minRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className="mt-4"
        >
          Send Request
        </Button>
      </form>
    </main>
  );
};

export default RequestFormMember;
