import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ECOSYSTEM_DATA, Project, ProjectComponent } from "@/lib/data";
import { EcosystemHeader } from "@/components/EcosystemHeader";
import { Level1Grid } from "@/components/Level1Grid";
import { Level2Project } from "@/components/Level2Project";
import { Level3Modal } from "@/components/Level3Modal";
import { PriorityBadge } from "@/components/PriorityBadge";

export function Dashboard() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeComponent, setActiveComponent] = useState<ProjectComponent | null>(null);

  // Prefetch background image to avoid flicker
  useEffect(() => {
    const img = new Image();
    img.src = `${import.meta.env.BASE_URL}images/bg-mesh.png`;
  }, []);

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectComponent = (component: ProjectComponent) => {
    setActiveComponent(component);
  };

  const handleCloseModal = () => {
    setActiveComponent(null);
  };

  const handleNavigateHome = () => {
    setActiveComponent(null);
    setActiveProject(null);
  };

  const handleNavigateProject = () => {
    setActiveComponent(null);
  };

  return (
    <div className="min-h-screen relative font-sans text-white overflow-x-hidden">
      {/* Abstract Background via generated image */}
      <div 
        className="fixed inset-0 z-[-1] opacity-40 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Overlay gradient to ensure text readability */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-transparent to-background/90 pointer-events-none" />

      <EcosystemHeader 
        project={activeProject} 
        component={activeComponent}
        onNavigateHome={handleNavigateHome}
        onNavigateProject={handleNavigateProject}
      />

      <main className="relative z-10 pb-24">
        <AnimatePresence mode="wait">
          {!activeProject ? (
            <Level1Grid 
              key="grid" 
              projects={ECOSYSTEM_DATA} 
              onSelectProject={handleSelectProject} 
            />
          ) : (
            <Level2Project 
              key={`project-${activeProject.id}`}
              project={activeProject}
              onBack={handleNavigateHome}
              onSelectComponent={handleSelectComponent}
            />
          )}
        </AnimatePresence>
      </main>

      {activeProject && activeComponent && (
        <Level3Modal 
          project={activeProject}
          component={activeComponent}
          onClose={handleCloseModal}
        />
      )}

      <PriorityBadge />
    </div>
  );
}

export default Dashboard;
