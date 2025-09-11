import { createContext, useContext, useEffect, useState } from 'react'
import { Project, Home, HomeHistoryEntry } from '../types/project'
import { db } from '../lib/database'
import { useAuth } from './AuthContext'

interface DataContextType {
  home: Home | null
  projects: Project[]
  homeHistory: HomeHistoryEntry[]
  loading: boolean
  error: string | null
  // Home operations
  createHome: (home: Omit<Home, 'id'>) => Promise<void>
  updateHome: (home: Home) => Promise<void>
  // Project operations
  createProject: (project: Omit<Project, 'id'>) => Promise<void>
  updateProject: (project: Project) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  // Home history operations
  createHomeHistoryEntry: (entry: Omit<HomeHistoryEntry, 'id'>) => Promise<void>
  updateHomeHistoryEntry: (entry: HomeHistoryEntry) => Promise<void>
  // Refresh data
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

interface DataProviderProps {
  children: React.ReactNode
}

// Sample data for guest mode
const getSampleData = () => ({
  home: {
    id: 'home-1',
    address: '123 Oak Street, Springfield, CA 90210',
    purchaseDate: '2020-06-15T00:00:00Z',
    purchasePrice: 485000,
    currentValue: 625000,
    lastUpdated: '2024-03-01T00:00:00Z',
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2400,
    yearBuilt: 2015,
    propertyType: 'single-family',
    photos: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    ],
  } as Home,
  projects: [
    {
      id: 'project-1',
      name: 'Kitchen Renovation',
      description: 'Complete kitchen remodel including new cabinets, countertops, appliances, and flooring. Adding an island and improving the layout for better functionality.',
      status: 'in-progress',
      targetStartDate: '2024-03-01T00:00:00Z',
      estimatedCompletionDate: '2024-05-15T00:00:00Z',
      budget: 45000,
      projectedValue: 60000,
      tasks: [
        {
          id: 'task-1',
          name: 'Demolition',
          description: 'Remove old cabinets, countertops, and flooring',
          status: 'completed',
          assignedTo: 'Demo Crew',
          completedDate: '2024-03-05T00:00:00Z',
        },
        {
          id: 'task-2',
          name: 'Electrical Work',
          description: 'Install new outlets and lighting',
          status: 'completed',
          assignedTo: 'Mike\'s Electric',
          completedDate: '2024-03-12T00:00:00Z',
        },
        {
          id: 'task-3',
          name: 'Plumbing',
          description: 'Install new sink and dishwasher connections',
          status: 'in-progress',
          assignedTo: 'ABC Plumbing',
          dueDate: '2024-03-20T00:00:00Z',
        },
        {
          id: 'task-4',
          name: 'Cabinet Installation',
          description: 'Install new kitchen cabinets and island',
          status: 'pending',
          assignedTo: 'Custom Cabinets Inc',
          dueDate: '2024-04-01T00:00:00Z',
        },
        {
          id: 'task-5',
          name: 'Countertop Installation',
          description: 'Install quartz countertops',
          status: 'pending',
          dueDate: '2024-04-15T00:00:00Z',
        },
      ],
      photos: [
        {
          id: 'photo-1',
          url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
          type: 'before',
          caption: 'Original kitchen before renovation',
          uploadedDate: '2024-02-15T00:00:00Z',
        },
        {
          id: 'photo-2',
          url: 'https://images.unsplash.com/photo-1560448204-e2d5b17e2b07?w=800',
          type: 'inspirational',
          caption: 'Modern kitchen inspiration with island',
          uploadedDate: '2024-02-10T00:00:00Z',
        },
        {
          id: 'photo-3',
          url: 'https://images.unsplash.com/photo-1564540583246-934409427776?w=800',
          type: 'documentary',
          caption: 'Demolition in progress',
          uploadedDate: '2024-03-05T00:00:00Z',
        },
      ],
      notes: [
        'Remember to order appliances 2 weeks before installation',
        'Check with HOA about dumpster placement',
      ],
      estimates: [
        {
          id: 'est-1',
          contractor: 'Custom Cabinets Inc',
          amount: 25000,
          description: 'Custom kitchen cabinets and island',
          date: '2024-02-01T00:00:00Z',
          selected: true,
        },
        {
          id: 'est-2',
          contractor: 'Budget Cabinets LLC',
          amount: 18000,
          description: 'Semi-custom kitchen cabinets',
          date: '2024-02-03T00:00:00Z',
        },
      ],
      receipts: [
        {
          id: 'receipt-1',
          vendor: 'Home Depot',
          amount: 450,
          category: 'Demolition supplies',
          date: '2024-02-28T00:00:00Z',
        },
        {
          id: 'receipt-2',
          vendor: 'Mike\'s Electric',
          amount: 2800,
          category: 'Electrical work',
          date: '2024-03-12T00:00:00Z',
        },
      ],
      contractors: [
        {
          id: 'contractor-1',
          name: 'Mike Johnson',
          company: 'Mike\'s Electric',
          phone: '(555) 123-4567',
          email: 'mike@mikeselectric.com',
          specialty: 'Electrical',
          rating: 5,
        },
        {
          id: 'contractor-2',
          name: 'Sarah Wilson',
          company: 'ABC Plumbing',
          phone: '(555) 987-6543',
          email: 'sarah@abcplumbing.com',
          specialty: 'Plumbing',
          rating: 4,
        },
      ],
      createdDate: '2024-02-01T00:00:00Z',
      updatedDate: '2024-03-15T00:00:00Z',
    },
    {
      id: 'project-2',
      name: 'Master Bathroom Remodel',
      description: 'Update master bathroom with new tile, vanity, and shower.',
      status: 'planning',
      targetStartDate: '2024-06-01T00:00:00Z',
      estimatedCompletionDate: '2024-07-15T00:00:00Z',
      budget: 25000,
      projectedValue: 30000,
      tasks: [
        {
          id: 'task-6',
          name: 'Design Planning',
          description: 'Finalize bathroom layout and material selections',
          status: 'in-progress',
          assignedTo: 'Design Team',
          dueDate: '2024-05-15T00:00:00Z',
        },
        {
          id: 'task-7',
          name: 'Permit Application',
          description: 'Submit building permits for plumbing changes',
          status: 'pending',
          dueDate: '2024-05-20T00:00:00Z',
        },
      ],
      photos: [
        {
          id: 'photo-4',
          url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
          type: 'inspirational',
          caption: 'Modern bathroom with walk-in shower',
          uploadedDate: '2024-03-01T00:00:00Z',
        },
      ],
      notes: [],
      estimates: [],
      receipts: [],
      contractors: [],
      createdDate: '2024-02-15T00:00:00Z',
      updatedDate: '2024-03-01T00:00:00Z',
    },
  ] as Project[],
  homeHistory: [
    {
      id: 'history-1',
      projectName: 'Living Room Flooring',
      completionDate: '2023-11-15',
      description: 'Replaced old carpet with hardwood flooring throughout the living room and dining area.',
      beforePhoto: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      afterPhoto: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800',
      projectedValue: 15000,
      actualValue: 18000,
      wasTrackedProject: false,
    },
    {
      id: 'history-2',
      projectName: 'Front Yard Landscaping',
      completionDate: '2023-08-30',
      description: 'Complete front yard makeover with new plants, sprinkler system, and walkway.',
      afterPhoto: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      projectedValue: 8000,
      actualValue: 7500,
      wasTrackedProject: false,
    },
  ] as HomeHistoryEntry[]
})

export function DataProvider({ children }: DataProviderProps) {
  const { user, isGuest } = useAuth()
  const [home, setHome] = useState<Home | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [homeHistory, setHomeHistory] = useState<HomeHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data when user changes or component mounts
  useEffect(() => {
    if (isGuest) {
      // Use sample data for guest mode
      const sampleData = getSampleData()
      setHome(sampleData.home)
      setProjects(sampleData.projects)
      setHomeHistory(sampleData.homeHistory)
      setLoading(false)
    } else if (user) {
      loadUserData()
    } else {
      // Clear data when no user
      setHome(null)
      setProjects([])
      setHomeHistory([])
      setLoading(false)
    }
  }, [user, isGuest])

  const loadUserData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Load home data
      const homeData = await db.getHome(user.id)
      if (homeData) {
        setHome(homeData)
        // Load projects and home history
        const [projectsData, historyData] = await Promise.all([
          db.getProjects(homeData.id),
          db.getHomeHistory(homeData.id)
        ])
        setProjects(projectsData)
        setHomeHistory(historyData)
      } else {
        // No home found, user needs to create one
        setHome(null)
        setProjects([])
        setHomeHistory([])
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Failed to load your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    if (isGuest) return
    await loadUserData()
  }

  const createHome = async (homeData: Omit<Home, 'id'>) => {
    if (isGuest) {
      // Guest mode: update local state only
      const newHome = { ...homeData, id: 'home-guest' }
      setHome(newHome)
      return
    }

    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    setError(null)

    try {
      const newHome = await db.createHome(homeData, user.id)
      if (newHome) {
        setHome(newHome)
      } else {
        throw new Error('Failed to create home')
      }
    } catch (err) {
      console.error('Error creating home:', err)
      setError('Failed to create home. Please try again.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateHome = async (homeData: Home) => {
    if (isGuest) {
      // Guest mode: update local state only
      setHome(homeData)
      return
    }

    if (!user) throw new Error('User not authenticated')

    setError(null)

    try {
      const updatedHome = await db.updateHome(homeData, user.id)
      if (updatedHome) {
        setHome(updatedHome)
      } else {
        throw new Error('Failed to update home')
      }
    } catch (err) {
      console.error('Error updating home:', err)
      setError('Failed to update home. Please try again.')
      throw err
    }
  }

  const createProject = async (projectData: Omit<Project, 'id'>) => {
    if (isGuest) {
      // Guest mode: update local state only
      const newProject = { 
        ...projectData, 
        id: `project-guest-${Date.now()}`,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
      }
      setProjects(prev => [...prev, newProject])
      return
    }

    if (!user || !home) throw new Error('User not authenticated or home not found')

    setError(null)

    try {
      const newProject = await db.createProject(projectData, home.id)
      if (newProject) {
        setProjects(prev => [...prev, newProject])
      } else {
        throw new Error('Failed to create project')
      }
    } catch (err) {
      console.error('Error creating project:', err)
      setError('Failed to create project. Please try again.')
      throw err
    }
  }

  const updateProject = async (projectData: Project) => {
    if (isGuest) {
      // Guest mode: update local state only
      setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p))
      return
    }

    setError(null)

    try {
      const updatedProject = await db.updateProject(projectData)
      if (updatedProject) {
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
      } else {
        throw new Error('Failed to update project')
      }
    } catch (err) {
      console.error('Error updating project:', err)
      setError('Failed to update project. Please try again.')
      throw err
    }
  }

  const deleteProject = async (projectId: string) => {
    if (isGuest) {
      // Guest mode: update local state only
      setProjects(prev => prev.filter(p => p.id !== projectId))
      return
    }

    setError(null)

    try {
      const success = await db.deleteProject(projectId)
      if (success) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
      } else {
        throw new Error('Failed to delete project')
      }
    } catch (err) {
      console.error('Error deleting project:', err)
      setError('Failed to delete project. Please try again.')
      throw err
    }
  }

  const createHomeHistoryEntry = async (entryData: Omit<HomeHistoryEntry, 'id'>) => {
    if (isGuest) {
      // Guest mode: update local state only
      const newEntry = { ...entryData, id: `history-guest-${Date.now()}` }
      setHomeHistory(prev => [newEntry, ...prev])
      return
    }

    if (!home) throw new Error('Home not found')

    setError(null)

    try {
      const newEntry = await db.createHomeHistoryEntry(home.id, entryData)
      if (newEntry) {
        setHomeHistory(prev => [newEntry, ...prev])
      } else {
        throw new Error('Failed to create home history entry')
      }
    } catch (err) {
      console.error('Error creating home history entry:', err)
      setError('Failed to create home history entry. Please try again.')
      throw err
    }
  }

  const updateHomeHistoryEntry = async (entryData: HomeHistoryEntry) => {
    if (isGuest) {
      // Guest mode: update local state only
      setHomeHistory(prev => prev.map(e => e.id === entryData.id ? entryData : e))
      return
    }

    setError(null)

    try {
      const updatedEntry = await db.updateHomeHistoryEntry(entryData)
      if (updatedEntry) {
        setHomeHistory(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e))
      } else {
        throw new Error('Failed to update home history entry')
      }
    } catch (err) {
      console.error('Error updating home history entry:', err)
      setError('Failed to update home history entry. Please try again.')
      throw err
    }
  }

  const value = {
    home,
    projects,
    homeHistory,
    loading,
    error,
    createHome,
    updateHome,
    createProject,
    updateProject,
    deleteProject,
    createHomeHistoryEntry,
    updateHomeHistoryEntry,
    refreshData,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}