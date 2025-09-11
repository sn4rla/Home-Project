import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { HomeDashboard } from './components/HomeDashboard';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ProjectForm } from './components/ProjectForm';
import { ProjectDetail } from './components/ProjectDetail';
import { HomeHistory } from './components/HomeHistory';
import { SupabaseSetup } from './components/SupabaseSetup';
import { Project } from './types/project';

function AppContent() {
  const { user, loading: authLoading, isGuest } = useAuth();
  const { 
    home, 
    projects, 
    homeHistory, 
    loading: dataLoading,
    createProject,
    updateProject,
    updateHomeHistoryEntry
  } = useData();
  
  const [currentView, setCurrentView] = useState('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if user is not authenticated and not in guest mode
  if (!user && !isGuest) {
    return <Auth />;
  }



  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('project-detail');
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setCurrentView('create-project');
  };

  const handleEditProject = (project?: Project) => {
    setEditingProject(project || null);
    setCurrentView('edit-project');
  };

  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      if (editingProject) {
        // Update existing project
        await updateProject({ ...editingProject, ...projectData } as Project);
      } else {
        // Create new project
        await createProject(projectData as Omit<Project, 'id'>);
      }
      setEditingProject(null);
      setCurrentView('home');
    } catch (error) {
      console.error('Error saving project:', error);
      // You could add a toast notification here
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await updateProject(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      // You could add a toast notification here
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    // Reset selected project when navigating away from project detail
    if (view !== 'project-detail') {
      setSelectedProjectId(null);
    }
  };

  const currentProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId)
    : null;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeDashboard
            home={home}
            projects={projects}
            homeHistory={homeHistory}
            onCreateProject={handleCreateProject}
            onViewProjects={() => setCurrentView('projects')}
            onViewProject={handleViewProject}
          />
        );

      case 'projects':
        return (
          <ProjectDashboard 
            projects={projects}
            onViewProject={handleViewProject}
            onCreateProject={handleCreateProject}
          />
        );
      
      case 'create-project':
        return (
          <ProjectForm
            onSave={handleSaveProject}
            onCancel={() => setCurrentView('home')}
          />
        );
      
      case 'edit-project':
        return (
          <ProjectForm
            project={editingProject || undefined}
            onSave={handleSaveProject}
            onCancel={() => setCurrentView(selectedProjectId ? 'project-detail' : 'home')}
          />
        );
        
      case 'project-detail':
        return currentProject ? (
          <ProjectDetail
            project={currentProject}
            onBack={() => setCurrentView('projects')}
            onEdit={() => handleEditProject(currentProject)}
            onUpdateProject={handleUpdateProject}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Project not found</p>
          </div>
        );
        
      case 'history':
        return (
          <HomeHistory
            historyEntries={homeHistory}
            onUpdateHistory={updateHomeHistoryEntry}
          />
        );
        
      case 'setup':
        return <SupabaseSetup />;
        
      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">View not found</p>
          </div>
        );
    }
  };

  // Show loading while data is being fetched
  if (dataLoading) {
    return (
      <Layout currentView={currentView} onViewChange={handleViewChange}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your projects...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentView={currentView} onViewChange={handleViewChange}>
      {renderCurrentView()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}