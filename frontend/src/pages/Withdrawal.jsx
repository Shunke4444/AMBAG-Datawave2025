import { Card, CardContent, CardActionArea } from '@mui/material';
import { MoreVert as MoreIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Withdrawal = () => {
  const navigate = useNavigate();

  const savedMethods = [
    { name: "Bank Card", type: "ATM", accNum: "**** **** **** 7890" },
    { name: "Bank Card", type: "ATM", accNum: "**** **** **** 1212" },
  ];

  const otherMethods = [
    { name: "Bank Card", processTime: "Instant", fee: "0%", limit: "0.00 - 10,000.00" },
    { name: "GCash", processTime: "15-20mins", fee: "15.00", limit: "0.00 - 10,000.00" },
    { name: "Maya Wallet", processTime: "5-10 mins", fee: "10.00", limit: "0.00 - 10,000.00" },
    { name: "GoTyme", processTime: "5-10mins", fee: "12.00%", limit: "0.00 - 10,000.00" },
  ];

  return (
    <main className="flex flex-col w-full h-full min-h-screen justify-center">

      <div className="w-372 h-176 bg-primary mx-16 rounded-4xl p-8">
        {/* Saved Methods */}
          <h1 className="text-xl text-secondary font-light">Saved Withdrawal Methods</h1>
          <div className="flex justify-evenly p-8">
          {savedMethods.map((saved, index) => (
            <Card key={index} className="rounded-2xl shadow-md p-8 w-2xl">
              <CardActionArea onClick={() => navigate('/transactions/withdrawalProcess')}>
                <CardContent>
                  <div className="flex justify-between">
                    <h3 className="text-sm font-bold text-textcolor">{saved.name}</h3>
                    <button><MoreIcon /></button>
                  </div>
                  <div className="text-textcolor">
                    <p className="font-semibold">{saved.type}</p>
                    <p className="font-medium">{saved.accNum}</p>
                  </div>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </div>
        {/* Other Methods */}
        <h3 className="text-xl text-secondary font-light">Other Payment Methods</h3>
        <div className="flex flex-wrap justify-evenly p-8 gap-4">
          {otherMethods.map((method, index) => (
            <Card key={index} className="rounded-2xl shadow-md w-2xl">
              <CardActionArea onClick={() => navigate('/transactions/withdrawalProcess')}>
                <CardContent>
                  <div className="flex justify-between">
                    <h3 className="text-sm font-bold text-textcolor">{method.name}</h3>
                  </div>
                  <div className="text-textcolor">
                    <p className="font-light">Processing Time: {method.processTime}</p>
                    <p className="font-light">Fee: {method.fee}</p>
                    <p className="font-light">Limit: {method.limit}</p>
                  </div>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Withdrawal;
