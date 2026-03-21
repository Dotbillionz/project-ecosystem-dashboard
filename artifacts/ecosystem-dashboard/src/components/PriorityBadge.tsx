import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, ChevronRight } from "lucide-react";
import { PRIORITY_STACK } from "@/lib/data";
import { cn } from "@/lib/utils";

export function PriorityBadge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        className={cn(
          "glass-panel rounded-2xl overflow-hidden flex flex-col items-end",
          "border-[rgba(251,191,36,0.3)] shadow-[0_0_20px_rgba(251,191,36,0.15)]"
        )}
        animate={{ width: isOpen ? 320 : 'auto' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors w-full"
        >
          <div className="relative">
            <Target className="w-5 h-5 text-yellow-400" />
            <span className="absolute inset-0 rounded-full animate-ping bg-yellow-400 opacity-30"></span>
          </div>
          <span className="font-display font-bold text-sm tracking-widest text-yellow-400 glow-gold uppercase whitespace-nowrap">
            Priority Stack
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            className="ml-auto text-yellow-400/50"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full border-t border-white/5"
            >
              <div className="p-4 flex flex-col gap-3">
                {PRIORITY_STACK.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    <span className="text-sm text-gray-300 font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
