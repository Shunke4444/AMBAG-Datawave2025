
import React, { useEffect, useState } from "react";
import { getMyVirtualBalance, addVirtualBalance } from "../../lib/api";
import PaymentLayout from "../payments/PaymentLayout";

export default function Balance() {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [amount, setAmount] = useState("");
    const [goalTitle, setGoalTitle] = useState("");
    const [status, setStatus] = useState("ready_for_external_payment");
    const [balanceType, setBalanceType] = useState("");
    const [success, setSuccess] = useState("");

	useEffect(() => {
		fetchBalance();
		// eslint-disable-next-line
	}, []);

	async function fetchBalance() {
		setLoading(true);
		setError("");
		try {
			const data = await getMyVirtualBalance();
			setBalance(data);
		} catch (e) {
			setError("Failed to fetch balance");
		}
		setLoading(false);
	}

	async function handleAddBalance(e) {
		e.preventDefault();
		setError("");
		setSuccess("");
		if (!amount || isNaN(amount) || Number(amount) <= 0) {
			setError("Enter a valid amount");
			return;
		}
		try {
            await addVirtualBalance({
                amount: Number(amount),
                goal_title: goalTitle,
                status,
                balance_type: balanceType
            });
			setSuccess("Balance added!");
			setAmount("");
			setGoalTitle("");
			fetchBalance();
		} catch (e) {
			setError("Failed to add balance");
		}
	}

    return (
    <PaymentLayout title="Virtual Balance" showOnDesktop={true}>
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-6 mt-8 text-black">
                <h2 className="text-2xl font-bold mb-4 text-center text-primary">My Virtual Balance</h2>
                {loading ? (
                    <div className="text-center text-primary">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 text-center mb-2">{error}</div>
                ) : (
                    <div className="mb-6 text-center">
                        <span className="text-4xl font-semibold text-green-600">
                            ₱{balance?.total_balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                        </span>
                    </div>
                )}
                <form onSubmit={handleAddBalance} className="mt-6 bg-gray-50 p-4 rounded-2xl shadow-inner text-black">
                    <h3 className="font-semibold mb-2 text-primary">Add Balance</h3>
                    <div className="mb-2">
                        <label className="block mb-1">Amount (₱)</label>
                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            className="w-full border rounded px-2 py-1 text-black"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Title/Note</label>
                        <input
                            type="text"
                            className="w-full border rounded px-2 py-1 text-black"
                            value={goalTitle}
                            onChange={e => setGoalTitle(e.target.value)}
                            placeholder="Manual Top-up"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Balance Type</label>
                        <select
                            className="w-full border rounded px-2 py-1 text-black"
                            value={balanceType}
                            onChange={e => setBalanceType(e.target.value)}
                            required
                        >
                            <option value="">Select type</option>
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-accent text-white py-2 rounded-xl mt-2 hover:bg-accent/90 transition">
                        Add Balance
                    </button>
                    {success && <div className="text-green-600 text-center mt-2">{success}</div>}
                    {error && <div className="text-red-500 text-center mt-2">{error}</div>}
                </form>
            </div>
        </PaymentLayout>
    );
}
