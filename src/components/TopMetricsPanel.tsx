import React from 'react'

interface TopMetricsPanelProps {
    activeEmis: number
    utilizationPercent: number
    rewardPoints: number
}

const Chip = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <div className={`px-3 py-2 rounded-xl border ${color} bg-black/20`}>
        <div className="text-[11px] text-gray-400">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
    </div>
)

const TopMetricsPanel: React.FC<TopMetricsPanelProps> = ({ activeEmis, utilizationPercent, rewardPoints }) => {
    return (
        <div className="flex gap-2">
            <Chip label="Active EMIs" value={`${activeEmis}`} color="border-gray-700" />
            <Chip label="Utilization" value={`${utilizationPercent}%`} color="border-gray-700" />
            <Chip label="Reward Points" value={`${rewardPoints.toLocaleString()}`} color="border-yellow-400/40" />
        </div>
    )
}

export default TopMetricsPanel

