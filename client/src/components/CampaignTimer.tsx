import React from "react";
import { useCampaignTimer } from "@/hooks/useCampaignTimer";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import type { Campaign } from "@/api/types";

interface CampaignTimerProps {
  campaigns: Campaign[];
}

export function CampaignTimer({ campaigns }: CampaignTimerProps) {
  // Find the active campaign that ends soonest
  const activeCampaigns = campaigns.filter(c => c.status === "active");
  
  if (activeCampaigns.length === 0) return null;

  // Sort by end date ascending to find the one ending soonest
  const nearestCampaign = [...activeCampaigns].sort((a, b) => 
    new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  )[0];

  const { days, hours, minutes, seconds, isExpired } = useCampaignTimer(nearestCampaign.endDate);

  if (isExpired) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="sticky top-0 z-[60] w-full bg-gradient-to-r from-[#0d3d2e]/90 to-[#0a5240]/90 backdrop-blur-md shadow-md text-white overflow-hidden"
      >
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="font-semibold text-sm sm:text-base tracking-wide uppercase">
              Limited Time Offer Ends In:
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 font-mono">
            <TimerBox value={days} label="Days" />
            <span className="text-xl font-bold text-yellow-400/50">:</span>
            <TimerBox value={hours} label="Hours" />
            <span className="text-xl font-bold text-yellow-400/50">:</span>
            <TimerBox value={minutes} label="Mins" />
            <span className="text-xl font-bold text-yellow-400/50">:</span>
            <TimerBox value={seconds} label="Secs" />
          </div>
        </div>
        
        {/* Animated bottom border */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent w-full" />
      </motion.div>
    </AnimatePresence>
  );
}

function TimerBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[3rem]">
      <div className="bg-black/20 rounded-md px-2 py-1 w-full text-center tabular-nums shadow-inner">
        <span className="text-xl sm:text-2xl font-bold text-yellow-400">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-white/70 uppercase tracking-wider mt-1 font-sans font-medium">
        {label}
      </span>
    </div>
  );
}
