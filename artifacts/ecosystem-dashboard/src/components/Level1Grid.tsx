import { motion } from "framer-motion";
import { Link } from "wouter";
import { Project } from "@/lib/data";

interface Props {
  projects: Project[];
  onSelectProject: (p: Project) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 180, damping: 22 } },
};

const GRID_IMAGE = "/ecosystem-grid.png";

const GRID_POSITIONS: Record<string, { col: number; row: number }> = {
  "spotx":                { col: 0, row: 0 },
  "vaultzforge-dripcode": { col: 1, row: 0 },
  "xspaces":              { col: 2, row: 0 },
  "meta-fucecchio":       { col: 0, row: 1 },
  "speedbiz":             { col: 1, row: 1 },
  "ai-automation":        { col: 2, row: 1 },
  "deals-a-gogo":         { col: 0, row: 2 },
  "global-expansion":     { col: 1, row: 2 },
  "vaultzforge-tech":     { col: 2, row: 2 },
};

function getImageStyle(projectId: string) {
  const pos = GRID_POSITIONS[projectId] ?? { col: 0, row: 0 };
  const xPct = pos.col * 50;
  const yPct = pos.row * 50;
  return {
    backgroundImage: `url(${GRID_IMAGE})`,
    backgroundSize: "300% 300%",
    backgroundPosition: `${xPct}% ${yPct}%`,
  };
}

export function Level1Grid({ projects, onSelectProject }: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      className="max-w-7xl mx-auto px-6 py-8"
    >
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-black tracking-tight mb-3"
        >
          Select Protocol
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-base max-w-xl mx-auto"
        >
          Your full ecosystem — click any sector to drill into its infrastructure.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const imgStyle = getImageStyle(project.id);
          const isSpotX = project.id === "spotx";

          return (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectProject(project)}
              className="group relative cursor-pointer rounded-2xl overflow-hidden"
              style={{ height: "260px" }}
            >
              {/* Real image background — sliced from the composite grid */}
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                style={imgStyle}
              />

              {/* Dark gradient overlay for readability */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(to bottom,
                    rgba(0,0,0,0.15) 0%,
                    rgba(0,0,0,0.05) 30%,
                    rgba(0,0,0,0.60) 65%,
                    rgba(0,0,0,0.92) 100%)`,
                }}
              />

              {/* Hover colour glow overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                style={{ background: project.color }}
              />

              {/* Border glow */}
              <div
                className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-opacity-60 transition-all duration-300 pointer-events-none"
                style={{ borderColor: `${project.color}90` }}
              />

              {/* Content overlaid bottom */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3
                      className="font-display text-lg font-black leading-tight drop-shadow-lg"
                      style={{ color: project.color, textShadow: `0 0 20px ${project.color}60` }}
                    >
                      {project.name}
                    </h3>
                    <p className="text-white/60 text-xs uppercase tracking-widest font-medium mt-0.5">
                      {project.tagline}
                    </p>
                  </div>
                  <span className="text-3xl drop-shadow-xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">
                    {project.emoji}
                  </span>
                </div>

                {/* Component chips */}
                <div className="flex gap-1.5 flex-wrap mb-1">
                  {project.components.slice(0, 3).map((c) => (
                    <span
                      key={c.id}
                      className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20 text-white/60 backdrop-blur-sm"
                      style={{ background: "rgba(0,0,0,0.45)" }}
                    >
                      {c.name}
                    </span>
                  ))}
                  {project.components.length > 3 && (
                    <span
                      className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20 text-white/40 backdrop-blur-sm"
                      style={{ background: "rgba(0,0,0,0.45)" }}
                    >
                      +{project.components.length - 3}
                    </span>
                  )}
                </div>

                {/* SpotX CTA */}
                {isSpotX && (
                  <Link href="/spotx" onClick={(e) => e.stopPropagation()}>
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest text-black shadow-lg"
                      style={{
                        background: project.color,
                        boxShadow: `0 4px 20px ${project.color}50`,
                      }}
                    >
                      🚀 Open Live Trading →
                    </motion.div>
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
