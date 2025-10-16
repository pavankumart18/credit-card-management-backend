// src/components/Card3D.tsx
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface Card3DProps {
  name: string;
  number: string;
  expiry: string;
  type: string;
  color: string;
}

const Card3D: React.FC<Card3DProps> = ({
  name,
  number,
  expiry,
  type,
  color,
}) => {
  const [flipped, setFlipped] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  return (
    <motion.div
      className="relative w-[340px] h-[210px] perspective cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative preserve-3d w-full h-full"
      >
        {/* Front */}
        <div
          className={`absolute w-full h-full rounded-2xl backface-hidden p-5 text-white shadow-2xl bg-gradient-to-br ${color}`}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg">{type} Card</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSecrets(!showSecrets);
              }}
              className="bg-white/20 p-1 rounded-full"
            >
              {showSecrets ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="mt-8 font-mono text-lg tracking-wider">
            {showSecrets
              ? number
              : "•••• •••• •••• " + number.slice(-4)}
          </div>
          <div className="mt-6 flex justify-between text-sm">
            <p>{name}</p>
            <p>{expiry}</p>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute w-full h-full rounded-2xl backface-hidden p-5 bg-gradient-to-br ${color} rotateY-180 text-white`}
        >
          <div className="bg-black w-full h-10 rounded-md mb-4"></div>
          <div className="bg-white/20 w-2/3 h-6 rounded-md mb-2"></div>
          <p className="text-sm opacity-70 mt-4">
            CVV: {showSecrets ? "123" : "•••"}
          </p>
          <p className="absolute bottom-4 right-5 text-xs opacity-70">
            {type} Secure
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Card3D;
