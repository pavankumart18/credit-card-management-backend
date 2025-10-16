import React from "react";
import SummaryCard from "./SummaryCard";
import { DollarSign, PieChart, Zap } from "lucide-react";

interface HeaderSummaryGridProps {
  totalOutstanding: number;
  cibilScore: number;
  onDownloadStatements?: () => void;
  onQuickPay?: () => void;
}

const HeaderSummaryGrid: React.FC<HeaderSummaryGridProps> = ({ totalOutstanding, cibilScore, onDownloadStatements, onQuickPay }) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard
        title="Total Outstanding"
        subtitle={`Across your cards`}
        value={`₹${totalOutstanding.toLocaleString()}`}
        icon={<DollarSign size={20} />}
        actionLabel="Download Statement"
        onAction={onDownloadStatements}
      />

      <SummaryCard
        title="CIBIL Score"
        subtitle="Updated recently"
        value={cibilScore}
        icon={<PieChart size={20} />}
        actionLabel="View Details"
        onAction={() => window.location.href = '/cibil-score'}
      />

      <SummaryCard
        title="Quick Actions"
        subtitle="Pay bills · Recharge"
        value="Pay & Recharge"
        icon={<Zap size={20} />}
        actionLabel="Pay a Bill"
        onAction={onQuickPay}
      />
    </section>
  );
};

export default HeaderSummaryGrid;
