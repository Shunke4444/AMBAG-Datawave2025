// Sample member data with goal status
export const sampleMembers = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    phone: "+63 912 345 6789",
    goalStatus: "on-track",
    currentGoal: "Emergency Fund",
    targetAmount: 50000,
    paidAmount: 35000,
    monthlyTarget: 5000,
    lastPayment: new Date('2024-01-18'),
    missedPayments: 0,
    joinDate: new Date('2023-01-15'),
    paymentHistory: [
      { date: new Date('2024-01-18'), amount: 5000, status: 'paid' },
      { date: new Date('2023-12-18'), amount: 5000, status: 'paid' },
      { date: new Date('2023-11-18'), amount: 5000, status: 'paid' }
    ]
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria.santos@email.com", 
    phone: "+63 918 765 4321",
    goalStatus: "fully-paid",
    currentGoal: "House Down Payment",
    targetAmount: 200000,
    paidAmount: 200000,
    monthlyTarget: 8000,
    lastPayment: new Date('2024-01-15'),
    missedPayments: 0,
    joinDate: new Date('2022-06-10'),
    paymentHistory: [
      { date: new Date('2024-01-15'), amount: 8000, status: 'paid' },
      { date: new Date('2023-12-15'), amount: 8000, status: 'paid' }
    ]
  },
  {
    id: 3,
    name: "Pedro Gonzales",
    email: "pedro.gonzales@email.com",
    phone: "+63 915 123 4567",
    goalStatus: "behind",
    currentGoal: "Vacation Fund",
    targetAmount: 75000,
    paidAmount: 25000,
    monthlyTarget: 3000,
    lastPayment: new Date('2023-11-20'),
    missedPayments: 2,
    joinDate: new Date('2023-03-22'),
    paymentHistory: [
      { date: new Date('2023-11-20'), amount: 3000, status: 'paid' },
      { date: new Date('2023-12-20'), amount: 0, status: 'missed' },
      { date: new Date('2024-01-20'), amount: 0, status: 'missed' }
    ]
  },
  {
    id: 4,
    name: "Ana Rodriguez",
    email: "ana.rodriguez@email.com",
    phone: "+63 917 890 1234",
    goalStatus: "at-risk",
    currentGoal: "Medical Emergency",
    targetAmount: 100000,
    paidAmount: 45000,
    monthlyTarget: 6000,
    lastPayment: new Date('2023-12-10'),
    missedPayments: 1,
    joinDate: new Date('2022-11-05'),
    paymentHistory: [
      { date: new Date('2023-12-10'), amount: 6000, status: 'paid' },
      { date: new Date('2024-01-10'), amount: 0, status: 'missed' }
    ]
  },
  {
    id: 5,
    name: "Carlos Mendoza",
    email: "carlos.mendoza@email.com",
    phone: "+63 920 567 8901",
    goalStatus: "overdue",
    currentGoal: "Business Capital",
    targetAmount: 150000,
    paidAmount: 60000,
    monthlyTarget: 10000,
    lastPayment: new Date('2023-10-15'),
    missedPayments: 3,
    joinDate: new Date('2024-01-10'),
    paymentHistory: [
      { date: new Date('2023-10-15'), amount: 10000, status: 'paid' },
      { date: new Date('2023-11-15'), amount: 0, status: 'missed' },
      { date: new Date('2023-12-15'), amount: 0, status: 'missed' },
      { date: new Date('2024-01-15'), amount: 0, status: 'missed' }
    ]
  }
];

export const statusOptions = ['all', 'on-track', 'behind', 'at-risk', 'overdue', 'fully-paid'];
