import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AddCard: React.FC = () => {
  const navigate = useNavigate();
  const [card, setCard] = useState({ title: "", number: "", holder: "", expiry: "", cvv: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCard({ ...card, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("Card saved! (mock)");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-8 text-yellow-400">Add New Card</h1>

      {/* Card Preview */}
      <motion.div
        className="w-96 h-56 mb-8 relative perspective cursor-pointer"
        whileHover={{ rotateY: 5, rotateX: 5 }}
      >
        <motion.div
          className="absolute w-full h-full rounded-3xl shadow-2xl p-6 bg-gradient-to-r from-indigo-500 to-blue-500 border border-white/10"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="flex justify-between items-center">
            <div className="text-sm opacity-70">{card.title || "CARD"}</div>
          </div>

          <div className="text-2xl font-mono mt-6 tracking-widest">
            {card.number ? card.number.match(/.{1,4}/g)?.join(" ") : "**** **** **** ****"}
          </div>

          <div className="flex justify-between mt-6 text-sm opacity-80">
            <div>{card.holder || "CARD HOLDER"}</div>
            <div>{card.expiry || "MM/YY"}</div>
          </div>

          <div className="absolute bottom-4 right-6 text-sm opacity-80">
            CVV: {card.cvv || "***"}
          </div>

          <div className="absolute inset-0 rounded-3xl bg-white/5 pointer-events-none blur-lg"></div>
        </motion.div>
      </motion.div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 gap-4 w-96">
        <input
          name="title"
          placeholder="Card Name"
          className="input-rich"
          value={card.title}
          onChange={handleChange}
        />
        <input
          name="number"
          placeholder="Card Number"
          className="input-rich"
          value={card.number}
          onChange={handleChange}
        />
        <input
          name="holder"
          placeholder="Card Holder Name"
          className="input-rich"
          value={card.holder}
          onChange={handleChange}
        />
        <div className="flex gap-4">
          <input
            name="expiry"
            placeholder="MM/YY"
            className="input-rich flex-1"
            value={card.expiry}
            onChange={handleChange}
          />
          <input
            name="cvv"
            placeholder="CVV"
            className="input-rich flex-1"
            value={card.cvv}
            onChange={handleChange}
          />
        </div>
        <button
          className="bg-yellow-400 text-black font-bold rounded-2xl py-3 shadow-lg hover:scale-105 transition-all duration-300"
          onClick={handleSave}
        >
          Save Card
        </button>
      </div>

      {/* Rich Input Styles */}
      <style>{`
        .input-rich {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          color: white;
          outline: none;
          transition: all 0.3s ease;
        }
        .input-rich:focus {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.5);
          box-shadow: 0 0 10px rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
};

export default AddCard;
