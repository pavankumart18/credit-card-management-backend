import React, { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Smartphone, Globe } from "lucide-react";

interface PaymentModalProps {
  amountLabel?: string;
  amountValue?: string;
  onClose: () => void;
  onSuccess: (result?: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amountLabel = "Amount", amountValue = "₹0", onClose, onSuccess }) => {
  const [method, setMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [upiId, setUpiId] = useState('');

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess({ method, amount: amountValue });
      alert('Payment successful (demo)');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.12 }} className="relative z-50 w-[460px] p-6 rounded-2xl bg-gray-900/95 border border-gray-700 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-400">Confirm Payment</div>
            <div className="text-lg font-bold mt-1">{amountLabel}</div>
            <div className="text-2xl font-bold mt-2 text-yellow-400">{amountValue}</div>
          </div>

          <div className="text-xs text-gray-400">Secure · Demo mode</div>
        </div>

        <div className="mt-5">
          <div className="text-sm text-gray-300">Payment method</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setMethod('card')} className={`p-3 rounded-lg border ${method === 'card' ? 'border-yellow-400 bg-yellow-400/5' : 'border-gray-700'} flex items-center gap-2`}>
              <CreditCard size={18} /> Card
            </button>
            <button onClick={() => setMethod('upi')} className={`p-3 rounded-lg border ${method === 'upi' ? 'border-yellow-400 bg-yellow-400/5' : 'border-gray-700'} flex items-center gap-2`}>
              <Smartphone size={18} /> UPI
            </button>
            <button onClick={() => setMethod('netbanking')} className={`p-3 rounded-lg border ${method === 'netbanking' ? 'border-yellow-400 bg-yellow-400/5' : 'border-gray-700'} flex items-center gap-2`}>
              <Globe size={18} /> Netbanking
            </button>
            <button onClick={() => setMethod('wallet')} className={`p-3 rounded-lg border ${method === 'wallet' ? 'border-yellow-400 bg-yellow-400/5' : 'border-gray-700'} flex items-center gap-2`}>
              Wallet
            </button>
          </div>
        </div>

        <div className="mt-4">
          {method === 'card' && (
            <div className="space-y-3">
              <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="Card number (demo)" className="w-full bg-gray-800 p-3 rounded-md text-sm border border-gray-700" />
              <div className="flex gap-2">
                <input placeholder="MM/YY" className="flex-1 bg-gray-800 p-3 rounded-md text-sm border border-gray-700" />
                <input placeholder="CVV" className="w-24 bg-gray-800 p-3 rounded-md text-sm border border-gray-700" />
              </div>
            </div>
          )}

          {method === 'upi' && (
            <div className="space-y-3">
              <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="your@upi (demo)" className="w-full bg-gray-800 p-3 rounded-md text-sm border border-gray-700" />
              <div className="text-xs text-gray-400">A real UPI flow will redirect to a UPI app for authentication.</div>
            </div>
          )}

          {method === 'netbanking' && (
            <div className="space-y-3">
              <select className="w-full bg-gray-800 p-3 rounded-md text-sm border border-gray-700">
                <option>Choose Bank (demo)</option>
                <option>HDFC</option>
                <option>ICICI</option>
                <option>State Bank</option>
              </select>
            </div>
          )}

          {method === 'wallet' && (
            <div className="space-y-3">
              <div className="text-sm text-gray-400">Choose wallet (demo)</div>
              <div className="flex gap-2 mt-2">
                <button className="px-3 py-2 rounded-md border border-gray-700">Paytm</button>
                <button className="px-3 py-2 rounded-md border border-gray-700">PhonePe</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-700">Cancel</button>
          <button onClick={handlePay} className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold">{processing ? 'Processing...' : `Pay ${amountValue}`}</button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
