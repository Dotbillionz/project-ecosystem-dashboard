import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";

export function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#050a10] text-white flex items-center justify-center font-sans overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#050a10] to-[#0a0510]" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-md px-6"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-6xl mb-6"
        >
          💎
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-black tracking-tight mb-2"
        >
          <span className="text-amber-400">SpotX</span>{" "}
          <span className="text-white">Ecosystem</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/50 text-sm uppercase tracking-widest mb-3"
        >
          Risk-Controlled Trading Platform
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {["EMA/RSI Strategy", "Copy Trading", "P&L Tracking", "Risk Engine"].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full border border-amber-500/20 text-amber-400/60 text-xs">
              {tag}
            </span>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={login}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-lg tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow"
        >
          Log in to continue
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white/25 text-xs mt-4"
        >
          Your account is automatically created on first login.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { icon: "🧠", label: "Smart Strategy", sub: "EMA + RSI signals" },
            { icon: "📊", label: "Live P&L", sub: "Real-time tracking" },
            { icon: "🔁", label: "Copy Trading", sub: "Mirror master trades" },
          ].map((f) => (
            <div key={f.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-2xl mb-1">{f.icon}</p>
              <p className="text-white/80 text-xs font-semibold">{f.label}</p>
              <p className="text-white/30 text-[10px]">{f.sub}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
