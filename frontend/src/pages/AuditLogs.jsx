import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Pagination,
} from "@mui/material";
import { styled } from "@mui/system";

import { Search as SearchIcon} from '@mui/icons-material'


const StyledTableRow = styled(TableRow)(() => ({
  "&:hover": {
    backgroundColor: "#f9f9f9",
  },
}));


const AuditLogs = () => {

  const mockLogs = [
  {
    name: "Juan Dela Cruz",
    role: "Member",
    userId: "u123456789",
    action: "CONTRIBUTED ₱500",
    timestamp: "Aug 3, 2025 10:15 AM",
  },
  {
    name: "Maria Santos",
    role: "Manager",
    userId: "m987654321",
    action: "ADDED GOAL: 'Team Trip Fund'",
    timestamp: "Aug 2, 2025 4:32 PM",
  },
  {
    name: "Carlos Reyes",
    role: "Member",
    userId: "u234567891",
    action: "REQUESTED WITHDRAWAL ₱1,000",
    timestamp: "Aug 2, 2025 1:22 PM",
  },
  {
    name: "Maria Santos",
    role: "Manager",
    userId: "m987654321",
    action: "APPROVED CONTRIBUTION",
    timestamp: "Aug 1, 2025 6:42 PM",
  },
  {
    name: "Juan Dela Cruz",
    role: "Member",
    userId: "u123456789",
    action: "REQUESTED NEW GOAL: Tuition Fee",
    timestamp: "Jul 31, 2025 10:15 AM",
  },
];

  const ActionTag = styled("span")(({ theme }) => ({
      color: "var(--color-primary)",
      fontWeight: 600,
  }));

  const [page, setPage] = useState(1);
      const [filter, setFilter] = useState('');

      const handleChange = (_, value) => {
        setPage(value);
      };

      const itemsPerPage = 5;
      const filteredLogs = mockLogs.filter(log =>
        Object.values(log).some(value =>
          value.toLowerCase().includes(filter.toLowerCase())
        )
      );

      const paginatedLogs = filteredLogs.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
      );


  return (
    <main className="flex flex-col min-h-screen w-full h-full justify-start">
      <Typography className="mb-4 text-primary p-12 text-xxs font-light">
        Monitor any changes and actions made inside your group with audit logs.
      </Typography>

      <TableContainer component={Paper} className="rounded-xl shadow-md p-8">
        <Table>
          <TableHead className="bg-[--color-secondary]">
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.map((log, index) => (
              <StyledTableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar sx={{ width: 32, height: 32 }} />
                    <div>
                      <Typography fontWeight={600}>{log.name}</Typography>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{log.userId}</TableCell>
                <TableCell>{log.role}</TableCell>
                <TableCell>
                  <ActionTag>{log.action}</ActionTag>
                </TableCell>
                <TableCell>{log.timestamp}</TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="flex justify-center mt-8">
        <Pagination
          count={Math.ceil(filteredLogs.length / itemsPerPage)}
          page={page}
          onChange={handleChange}
          shape="rounded"
          color="primary"
        />
      </div>
    </main>
  );
};

export default AuditLogs;

