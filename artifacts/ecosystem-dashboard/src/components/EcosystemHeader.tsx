import { motion } from "framer-motion";
import { Hexagon, ChevronRight, Home, User } from "lucide-react";
import { Link } from "wouter";
import { Project, ProjectComponent } from "@/lib/data";
import { useAuth } from "@workspace/replit-auth-web";

interface Props {
  project: Project | null;
  component: ProjectComponent | null;
  onNavigateHome: () => void;
  onNavigateProject: () => void;
}

export function EcosystemHeader({ project, component, onNavigateHome, onNavigateProject }: Props) {
  const { user, isAuthenticated } = useAuth();

  const displayName = user?.firstName ?? user?.email?.split("@")[0] ?? null;

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 w-full glass-panel border-x-0 border-t-0 border-b-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <Hexagon className="w-8 h-8 text-white" />
          <h1 className="font-display font-bold text-xl tracking-[0.2em] uppercase hidden sm:block">
            Master <span className="text-white/50">Ecosystem</span>
          </h1>
        </div>

        <nav className="flex items-center space-x-2 text-sm font-medium">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          {project && (
            <>
              <ChevronRight className="w-4 h-4 text-white/30" />
              <button
                onClick={onNavigateProject}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: project.color }}
              >
                <span>{project.emoji}</span>
                <span className="hidden sm:inline font-bold" style={{ textShadow: `0 0 10px ${project.color}80` }}>
                  {project.name}
                </span>
              </button>
            </>
          )}

          {component && (
            <>
              <ChevronRight className="w-4 h-4 text-white/30" />
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-white/5 text-white border border-white/10">
                <span className="truncate max-w-[120px] sm:max-w-none">{component.name}</span>
              </div>
            </>
          )}

          <div className="w-px h-4 bg-white/10 mx-1" />

          {isAuthenticated ? (
            <Link href="/dashboard">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all text-xs font-semibold">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-4 h-4 rounded-full" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{displayName ?? "My Account"}</span>
              </button>
            </Link>
          ) : null}
        </nav>
      </div>
    </motion.header>
  );
}
