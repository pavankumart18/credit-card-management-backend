import React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Plus } from "lucide-react";

export type CardType = {
  id: number;
  title: string;
  subtitle: string;
  number: string;
  secret: boolean;
  gradient: string;
  limit?: string;
  outstanding?: string;
};

interface CardsGridProps {
  cards: CardType[];
  onToggleSecret: (id: number) => void;
  onPay: (card: CardType) => void;
  onDetails: (card: CardType) => void;
  onConvertEMI: (card: CardType) => void;
  onAddCard?: () => void;
}

const CardsGrid: React.FC<CardsGridProps> = ({ cards, onToggleSecret, onPay, onDetails, onConvertEMI, onAddCard }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">My Cards</h3>
        <div className="flex items-center gap-2">
          <button onClick={onAddCard} className="flex items-center gap-2 px-3 py-2 bg-yellow-400 text-black rounded-2xl"><Plus size={14}/> Add Card</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <motion.div key={c.id} whileHover={{ y: -6, scale: 1.02 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`relative p-5 rounded-2xl shadow-xl bg-gradient-to-r ${c.gradient} cursor-pointer`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs opacity-70">CREDIT CARD</div>
                <div className="mt-3 text-2xl font-semibold">{c.title}</div>
                <div className="text-sm mt-1">{c.subtitle}</div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button onClick={(e) => { e.stopPropagation(); onToggleSecret(c.id); }} className="bg-black/10 p-2 rounded-md">{c.secret ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                <button onClick={(e) => { e.stopPropagation(); onConvertEMI(c); }} className="text-xs px-2 py-1 bg-black/20 rounded-md">Convert</button>
              </div>
            </div>

            <div className="mt-6 font-mono tracking-widest text-lg">{c.secret ? '**** **** **** ****' : c.number}</div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <div>Limit: {c.limit}</div>
              <div className="font-semibold">Outstanding: {c.outstanding}</div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); onPay(c); }} className="flex-1 px-3 py-2 rounded-lg bg-yellow-400 text-black font-semibold">Pay</button>
              <button onClick={(e) => { e.stopPropagation(); onDetails(c); }} className="px-3 py-2 rounded-lg border border-gray-700">Details</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CardsGrid;
