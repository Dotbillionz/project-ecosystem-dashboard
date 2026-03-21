import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Zap, Users, ExternalLink, ArrowRight } from "lucide-react";
import { Project, ProjectComponent } from "@/lib/data";
import { Link } from "wouter";

interface Props {
  project: Project;
  component: ProjectComponent;
  onClose: () => void;
}

export function Level3Modal({ project, component, onClose }: Props) {
  const { feature } = component;
  const hasAudience = feature.audience && feature.audience.length > 0;
  const [activeRole, setActiveRole] = useState(0);

  const handleCta = () => {
    if (!feature.ctaUrl) return;
    if (feature.ctaUrl.startsWith("http")) {
      window.open(feature.ctaUrl, "_blank", "noopener");
    }
    // internal links handled by Link component below
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.88, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 30, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative w-full max-w-4xl glass-panel rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          style={{
            border: `1px solid ${project.color}40`,
            boxShadow: `0 25px 60px -15px rgba(0,0,0,0.85), 0 0 40px -10px ${project.color}25`,
          }}
        >
          {/* ── HEADER ── */}
          <div className="shrink-0 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                background: `radial-gradient(ellipse at 80% 0%, ${project.color} 0%, transparent 60%)`,
              }}
            />
            <div className="px-7 pt-7 pb-6 relative z-10">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[10px] uppercase tracking-[0.15em] font-bold px-3 py-1 rounded-full"
                  style={{
                    background: `${project.color}20`,
                    color: project.color,
                    border: `1px solid ${project.color}40`,
                  }}
                >
                  {project.name}
                </span>
                <span className="text-white/20 text-xs">›</span>
                <span className="text-white/40 text-xs uppercase tracking-widest">{component.name}</span>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-1 leading-tight pr-10">
                {component.name}
              </h2>
              <p className="font-medium text-sm" style={{ color: project.color }}>
                {feature.name}
              </p>
            </div>

            <div className="h-px bg-white/10" />
          </div>

          {/* ── BODY ── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 md:p-7 space-y-7">

              {/* Core Capabilities */}
              <div>
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                  <Activity className="w-3.5 h-3.5" />
                  Core Capabilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {feature.points.map((point, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + idx * 0.04 }}
                      className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-xl px-4 py-2.5"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-gray-300 text-sm">{point}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Role-Based Audience — shown only if data exists */}
              {hasAudience && (
                <div>
                  <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                    <Users className="w-3.5 h-3.5" />
                    Who Sees What (Role-Based View)
                  </h3>

                  {/* Role tabs */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {feature.audience!.map((aud, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveRole(i)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={
                          activeRole === i
                            ? {
                                background: `${project.color}20`,
                                color: project.color,
                                border: `1px solid ${project.color}50`,
                              }
                            : {
                                background: "rgba(255,255,255,0.04)",
                                color: "rgba(255,255,255,0.45)",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }
                        }
                      >
                        <span>{aud.icon}</span>
                        <span>{aud.role}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active role content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeRole}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="rounded-2xl p-5"
                      style={{
                        background: `linear-gradient(135deg, ${project.color}08 0%, rgba(255,255,255,0.02) 100%)`,
                        border: `1px solid ${project.color}25`,
                      }}
                    >
                      <p className="text-xs font-bold mb-3" style={{ color: project.color }}>
                        {feature.audience![activeRole].icon} {feature.audience![activeRole].role} sees:
                      </p>
                      <ul className="space-y-2">
                        {feature.audience![activeRole].sees.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                            <ArrowRight
                              className="w-3.5 h-3.5 shrink-0 mt-0.5"
                              style={{ color: project.color }}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* Strategic Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="glass-panel rounded-2xl p-5"
                >
                  <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                    Strategic Role
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.strategicRole}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: `linear-gradient(135deg, ${project.color}12 0%, transparent 100%)`,
                    border: `1px solid ${project.color}30`,
                  }}
                >
                  <h3
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold mb-2"
                    style={{ color: project.color }}
                  >
                    <Zap className="w-3 h-3" />
                    Next Move
                  </h3>
                  <p className="text-white text-sm font-medium leading-relaxed">{feature.nextMove}</p>
                </motion.div>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3"
              >
                {feature.ctaUrl && feature.ctaLabel && (
                  feature.ctaUrl.startsWith("http") ? (
                    <a
                      href={feature.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold tracking-wider uppercase text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] text-black"
                      style={{
                        background: project.color,
                        boxShadow: `0 10px 25px -10px ${project.color}80`,
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      {feature.ctaLabel}
                    </a>
                  ) : (
                    <Link href={feature.ctaUrl} onClick={onClose}>
                      <div
                        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold tracking-wider uppercase text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] text-black cursor-pointer"
                        style={{
                          background: project.color,
                          boxShadow: `0 10px 25px -10px ${project.color}80`,
                        }}
                      >
                        <ArrowRight className="w-4 h-4" />
                        {feature.ctaLabel}
                      </div>
                    </Link>
                  )
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/25 transition-all"
                >
                  Close
                </button>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
