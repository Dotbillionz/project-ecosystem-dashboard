import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, ExternalLink, ChevronRight } from "lucide-react";
import { Project, ProjectComponent } from "@/lib/data";

interface Props {
  project: Project;
  onBack: () => void;
  onSelectComponent: (c: ProjectComponent) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, duration: 0.35 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.25 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 24 } },
};

export function Level2Project({ project, onBack, onSelectComponent }: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="max-w-7xl mx-auto px-6 py-10"
    >
      {/* Back button */}
      <motion.button
        variants={itemVariants}
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium tracking-wide uppercase text-sm">All Projects</span>
      </motion.button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── LEFT: Identity + Intelligence Panel ── */}
        <motion.div
          variants={itemVariants}
          className="w-full lg:w-[340px] shrink-0 lg:sticky top-28 space-y-4"
        >
          {/* Identity card */}
          <div
            className="glass-panel rounded-3xl p-7 relative overflow-hidden"
            style={{ border: `1px solid ${project.color}30` }}
          >
            <div
              className="absolute top-0 right-0 w-72 h-72 opacity-15 blur-[90px] rounded-full pointer-events-none"
              style={{ backgroundColor: project.color }}
            />

            <div className="text-7xl mb-5 drop-shadow-2xl">{project.emoji}</div>
            <h2
              className="font-display text-3xl font-black mb-1 leading-tight"
              style={{ color: project.color }}
            >
              {project.name}
            </h2>
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-5 font-medium">
              {project.tagline}
            </p>

            <div className="h-px w-full bg-white/10 mb-5" />

            {/* Status row */}
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-gray-500 uppercase tracking-wider">Status</span>
              <span className="text-green-400 font-mono font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mb-5">
              <span className="text-gray-500 uppercase tracking-wider">Sub-Systems</span>
              <span className="text-white font-mono font-bold">{project.components.length}</span>
            </div>

            {/* Launch CTA */}
            {project.launchUrl ? (
              <a
                href={project.launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest text-black transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: project.color,
                  boxShadow: `0 8px 24px -8px ${project.color}80`,
                }}
              >
                <ExternalLink className="w-4 h-4" />
                {project.launchLabel ?? "Launch"}
              </a>
            ) : project.launchLabel ? (
              <button
                disabled
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest text-black/60 cursor-not-allowed"
                style={{ background: `${project.color}50` }}
              >
                {project.launchLabel} — Coming Soon
              </button>
            ) : null}
          </div>

          {/* Executive Summary */}
          {project.executiveSummary && (
            <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                Executive Intel
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">{project.executiveSummary}</p>
            </motion.div>
          )}

          {/* Blind Spot Warning */}
          {project.blindSpot && (
            <motion.div
              variants={itemVariants}
              className="rounded-2xl p-4 border flex gap-3"
              style={{
                background: "rgba(251,191,36,0.06)",
                borderColor: "rgba(251,191,36,0.25)",
              }}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-1">
                  Blind Spot
                </p>
                <p className="text-amber-200/80 text-xs leading-relaxed">{project.blindSpot}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── RIGHT: Component Cards ── */}
        <div className="flex-1 min-w-0">
          <motion.p
            variants={itemVariants}
            className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-5"
          >
            Sub-Systems — click to inspect
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.components.map((comp, idx) => (
              <motion.button
                key={comp.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectComponent(comp)}
                className="glass-panel rounded-2xl p-5 text-left border border-white/5 hover:border-white/20 transition-all flex flex-col relative overflow-hidden group"
                style={{ minHeight: "160px" }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-l-2xl"
                  style={{ backgroundColor: project.color }}
                />

                {/* Top-right index */}
                <span
                  className="absolute top-4 right-4 font-mono text-xs font-bold opacity-20 group-hover:opacity-50 transition-opacity"
                  style={{ color: project.color }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Content */}
                <h3 className="font-display text-lg font-bold text-white mb-1 pr-8">{comp.name}</h3>
                <p className="text-xs font-medium mb-3" style={{ color: `${project.color}cc` }}>
                  {comp.feature.name}
                </p>

                {/* First 2 points preview */}
                <ul className="space-y-1 mb-auto">
                  {comp.feature.points.slice(0, 2).map((pt, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      {pt}
                    </li>
                  ))}
                  {comp.feature.points.length > 2 && (
                    <li className="text-[11px] text-gray-600">
                      +{comp.feature.points.length - 2} more
                    </li>
                  )}
                </ul>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">
                    {comp.feature.audience ? `${comp.feature.audience.length} role views` : "inspect"}
                  </span>
                  <ChevronRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    style={{ color: project.color }}
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
