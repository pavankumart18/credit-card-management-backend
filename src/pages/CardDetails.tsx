import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Navbar2 from "../components/Navbar2";

interface Card {
  id: number;
  title: string;
  subtitle: string;
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  gradient: string;
  secret: boolean;
}

interface Transaction {
  id: number;
  merchant: string;
  amount: string;
  date: string;
}

const CardDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const [card, setCard] = useState<Card>({
    id: Number(id),
    title: "Platinum",
    subtitle: "Rewards 5%",
    number: "1234 5678 9012 3456",
    holder: "John Doe",
    expiry: "12/26",
    cvv: "123",
    gradient: "from-indigo-500 to-blue-500",
    secret: true,
  });

  const [transactions] = useState<Transaction[]>([
    { id: 1, merchant: "Amazon", amount: "₹2500", date: "2025-10-12" },
    { id: 2, merchant: "Zomato", amount: "₹750", date: "2025-10-11" },
    { id: 3, merchant: "Flipkart", amount: "₹1800", date: "2025-10-10" },
  ]);

  const toggleSecret = () => {
    setCard({ ...card, secret: !card.secret });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar2 />
      <div className="max-w-5xl mx-auto p-6 space-y-8">

        {/* Card View */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Card Front & Back */}
          <div className="flex-1 space-y-6">
            <div className={`relative w-full h-64 rounded-3xl shadow-2xl p-6 bg-gradient-to-r ${card.gradient}`}>
              <div className="flex justify-between items-start">
                <div className="text-xs opacity-70">CARD</div>
                <button onClick={toggleSecret} className="text-gray-200 hover:text-white">
                  {card.secret ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-8 text-2xl font-semibold tracking-widest">
                {card.secret ? "**** **** **** ****" : card.number}
              </div>
              <div className="flex justify-between mt-6 text-sm opacity-80">
                <div>{card.holder}</div>
                <div>{card.expiry}</div>
              </div>
            </div>

            <div className={`relative w-full h-40 rounded-3xl shadow-2xl p-6 bg-gradient-to-r ${card.gradient}`}>
              <div className="flex justify-between">
                <div className="text-sm opacity-70">BACK</div>
              </div>
              <div className="mt-20 text-right text-sm opacity-80">
                CVV: {card.secret ? "***" : card.cvv}
              </div>
            </div>
          </div>

          {/* Right: Card Info & Actions */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-2">Card Details</h2>
              <p><span className="opacity-70">Type:</span> {card.title}</p>
              <p><span className="opacity-70">Subtitle:</span> {card.subtitle}</p>
              <p><span className="opacity-70">Number:</span> {card.secret ? "**** **** **** ****" : card.number}</p>
              <p><span className="opacity-70">Holder:</span> {card.holder}</p>
              <p><span className="opacity-70">Expiry:</span> {card.expiry}</p>
              <p><span className="opacity-70">CVV:</span> {card.secret ? "***" : card.cvv}</p>
            </div>

            <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-2">AI Suggestions</h2>
              <ul className="list-disc list-inside text-sm opacity-80">
                <li>Pay your electricity bill using this card to earn 5% cashback.</li>
                <li>Use this card for online shopping to maximize reward points.</li>
                <li>Maintain a balance below ₹50,000 for optimal usage.</li>
              </ul>
            </div>

            <div className="bg-gray-800/60 p-4 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-2">Transaction History</h2>
              <div className="space-y-2 text-sm opacity-80">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between bg-gray-700/40 rounded-xl p-2 hover:bg-gray-700/60 transition">
                    <span>{tx.merchant}</span>
                    <span>{tx.amount}</span>
                    <span>{tx.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CardDetails;
