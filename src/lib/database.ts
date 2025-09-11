import { supabase } from './supabase'
import { Project, Home, HomeHistoryEntry, Task, Photo, Estimate, Receipt, Contractor } from '../types/project'

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  try {
    return process.env.REACT_APP_SUPABASE_URL && 
           process.env.REACT_APP_SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' &&
           process.env.REACT_APP_SUPABASE_ANON_KEY &&
           process.env.REACT_APP_SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE';
  } catch {
    return false;
  }
};

// Type definitions for database operations
export interface DatabaseProject extends Omit<Project, 'tasks' | 'photos' | 'notes' | 'estimates' | 'receipts' | 'contractors'> {
  home_id: string
}

export interface DatabaseTask extends Omit<Task, 'id'> {
  id?: string
  project_id: string
}

export interface DatabasePhoto extends Omit<Photo, 'id'> {
  id?: string
  project_id: string
}

export interface DatabaseNote {
  id?: string
  project_id: string
  note: string
  created_at?: string
}

export interface DatabaseEstimate extends Omit<Estimate, 'id'> {
  id?: string
  project_id: string
}

export interface DatabaseReceipt extends Omit<Receipt, 'id'> {
  id?: string
  project_id: string
  receipt_image_url?: string
}

export interface DatabaseContractor extends Omit<Contractor, 'id'> {
  id?: string
  project_id: string
}

export interface DatabaseHomeHistory extends Omit<HomeHistoryEntry, 'id'> {
  id?: string
  home_id: string
  original_project_id?: string
}

export class DatabaseService {
  // Home operations
  async getHome(userId: string): Promise<Home | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('homes')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching home:', error)
        return null
      }

      return data ? this.mapDatabaseHomeToHome(data) : null
    } catch (err) {
      console.error('Database operation failed:', err);
      return null;
    }
  }

  async createHome(home: Omit<Home, 'id'>, userId: string): Promise<Home | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('homes')
        .insert([{ ...this.mapHomeToDatabase(home), user_id: userId }])
        .select('*')
        .single()

      if (error) {
        console.error('Error creating home:', error)
        return null
      }

      return this.mapDatabaseHomeToHome(data)
    } catch (err) {
      console.error('Database operation failed:', err);
      return null;
    }
  }

  async updateHome(home: Home, userId: string): Promise<Home | null> {
    const { data, error } = await supabase
      .from('homes')
      .update(this.mapHomeToDatabase(home))
      .eq('id', home.id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating home:', error)
      return null
    }

    return this.mapDatabaseHomeToHome(data)
  }

  // Project operations
  async getProjects(homeId: string): Promise<Project[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('home_id', homeId)
        .order('created_date', { ascending: false })

      if (projectsError) {
        console.error('Error fetching projects:', projectsError)
        return []
      }

      const projects: Project[] = []

      for (const projectData of projectsData) {
        const project = await this.getCompleteProject(projectData.id)
        if (project) {
          projects.push(project)
        }
      }

      return projects
    } catch (err) {
      console.error('Database operation failed:', err);
      return [];
    }
  }

  async getCompleteProject(projectId: string): Promise<Project | null> {
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      return null
    }

    // Fetch related data
    const [tasks, photos, notes, estimates, receipts, contractors] = await Promise.all([
      this.getProjectTasks(projectId),
      this.getProjectPhotos(projectId),
      this.getProjectNotes(projectId),
      this.getProjectEstimates(projectId),
      this.getProjectReceipts(projectId),
      this.getProjectContractors(projectId)
    ])

    return {
      ...this.mapDatabaseProjectToProject(projectData),
      tasks,
      photos,
      notes,
      estimates,
      receipts,
      contractors
    }
  }

  async createProject(project: Omit<Project, 'id'>, homeId: string): Promise<Project | null> {
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([{ ...this.mapProjectToDatabase(project), home_id: homeId }])
      .select('*')
      .single()

    if (projectError) {
      console.error('Error creating project:', projectError)
      return null
    }

    const projectId = projectData.id

    // Insert related data
    await Promise.all([
      this.createProjectTasks(projectId, project.tasks),
      this.createProjectPhotos(projectId, project.photos),
      this.createProjectNotes(projectId, project.notes),
      this.createProjectEstimates(projectId, project.estimates),
      this.createProjectReceipts(projectId, project.receipts),
      this.createProjectContractors(projectId, project.contractors)
    ])

    return this.getCompleteProject(projectId)
  }

  async updateProject(project: Project): Promise<Project | null> {
    const { error } = await supabase
      .from('projects')
      .update({
        ...this.mapProjectToDatabase(project),
        updated_date: new Date().toISOString()
      })
      .eq('id', project.id)

    if (error) {
      console.error('Error updating project:', error)
      return null
    }

    // Update related data
    await Promise.all([
      this.updateProjectTasks(project.id, project.tasks),
      this.updateProjectPhotos(project.id, project.photos),
      this.updateProjectNotes(project.id, project.notes),
      this.updateProjectEstimates(project.id, project.estimates),
      this.updateProjectReceipts(project.id, project.receipts),
      this.updateProjectContractors(project.id, project.contractors)
    ])

    return this.getCompleteProject(project.id)
  }

  async deleteProject(projectId: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('Error deleting project:', error)
      return false
    }

    return true
  }

  // Task operations
  async getProjectTasks(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }

    return data.map(task => this.mapDatabaseTaskToTask(task))
  }

  async createProjectTasks(projectId: string, tasks: Task[]): Promise<void> {
    if (tasks.length === 0) return

    const tasksData = tasks.map(task => ({
      ...this.mapTaskToDatabase(task),
      project_id: projectId
    }))

    const { error } = await supabase
      .from('tasks')
      .insert(tasksData)

    if (error) {
      console.error('Error creating tasks:', error)
    }
  }

  async updateProjectTasks(projectId: string, tasks: Task[]): Promise<void> {
    // Delete existing tasks and recreate (simple approach)
    await supabase.from('tasks').delete().eq('project_id', projectId)
    await this.createProjectTasks(projectId, tasks)
  }

  // Photo operations
  async getProjectPhotos(projectId: string): Promise<Photo[]> {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('project_id', projectId)
      .order('uploaded_date', { ascending: false })

    if (error) {
      console.error('Error fetching photos:', error)
      return []
    }

    return data.map(photo => this.mapDatabasePhotoToPhoto(photo))
  }

  async createProjectPhotos(projectId: string, photos: Photo[]): Promise<void> {
    if (photos.length === 0) return

    const photosData = photos.map(photo => ({
      ...this.mapPhotoToDatabase(photo),
      project_id: projectId
    }))

    const { error } = await supabase
      .from('photos')
      .insert(photosData)

    if (error) {
      console.error('Error creating photos:', error)
    }
  }

  async updateProjectPhotos(projectId: string, photos: Photo[]): Promise<void> {
    await supabase.from('photos').delete().eq('project_id', projectId)
    await this.createProjectPhotos(projectId, photos)
  }

  // Notes operations
  async getProjectNotes(projectId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('project_notes')
      .select('note')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching notes:', error)
      return []
    }

    return data.map(item => item.note)
  }

  async createProjectNotes(projectId: string, notes: string[]): Promise<void> {
    if (notes.length === 0) return

    const notesData = notes.map(note => ({
      project_id: projectId,
      note
    }))

    const { error } = await supabase
      .from('project_notes')
      .insert(notesData)

    if (error) {
      console.error('Error creating notes:', error)
    }
  }

  async updateProjectNotes(projectId: string, notes: string[]): Promise<void> {
    await supabase.from('project_notes').delete().eq('project_id', projectId)
    await this.createProjectNotes(projectId, notes)
  }

  // Estimates operations
  async getProjectEstimates(projectId: string): Promise<Estimate[]> {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching estimates:', error)
      return []
    }

    return data.map(estimate => this.mapDatabaseEstimateToEstimate(estimate))
  }

  async createProjectEstimates(projectId: string, estimates: Estimate[]): Promise<void> {
    if (estimates.length === 0) return

    const estimatesData = estimates.map(estimate => ({
      ...this.mapEstimateToDatabase(estimate),
      project_id: projectId
    }))

    const { error } = await supabase
      .from('estimates')
      .insert(estimatesData)

    if (error) {
      console.error('Error creating estimates:', error)
    }
  }

  async updateProjectEstimates(projectId: string, estimates: Estimate[]): Promise<void> {
    await supabase.from('estimates').delete().eq('project_id', projectId)
    await this.createProjectEstimates(projectId, estimates)
  }

  // Receipts operations
  async getProjectReceipts(projectId: string): Promise<Receipt[]> {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching receipts:', error)
      return []
    }

    return data.map(receipt => this.mapDatabaseReceiptToReceipt(receipt))
  }

  async createProjectReceipts(projectId: string, receipts: Receipt[]): Promise<void> {
    if (receipts.length === 0) return

    const receiptsData = receipts.map(receipt => ({
      ...this.mapReceiptToDatabase(receipt),
      project_id: projectId
    }))

    const { error } = await supabase
      .from('receipts')
      .insert(receiptsData)

    if (error) {
      console.error('Error creating receipts:', error)
    }
  }

  async updateProjectReceipts(projectId: string, receipts: Receipt[]): Promise<void> {
    await supabase.from('receipts').delete().eq('project_id', projectId)
    await this.createProjectReceipts(projectId, receipts)
  }

  // Contractors operations
  async getProjectContractors(projectId: string): Promise<Contractor[]> {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching contractors:', error)
      return []
    }

    return data.map(contractor => this.mapDatabaseContractorToContractor(contractor))
  }

  async createProjectContractors(projectId: string, contractors: Contractor[]): Promise<void> {
    if (contractors.length === 0) return

    const contractorsData = contractors.map(contractor => ({
      ...this.mapContractorToDatabase(contractor),
      project_id: projectId
    }))

    const { error } = await supabase
      .from('contractors')
      .insert(contractorsData)

    if (error) {
      console.error('Error creating contractors:', error)
    }
  }

  async updateProjectContractors(projectId: string, contractors: Contractor[]): Promise<void> {
    await supabase.from('contractors').delete().eq('project_id', projectId)
    await this.createProjectContractors(projectId, contractors)
  }

  // Home History operations
  async getHomeHistory(homeId: string): Promise<HomeHistoryEntry[]> {
    const { data, error } = await supabase
      .from('home_history')
      .select('*')
      .eq('home_id', homeId)
      .order('completion_date', { ascending: false })

    if (error) {
      console.error('Error fetching home history:', error)
      return []
    }

    return data.map(entry => this.mapDatabaseHomeHistoryToHomeHistory(entry))
  }

  async createHomeHistoryEntry(homeId: string, entry: Omit<HomeHistoryEntry, 'id'>): Promise<HomeHistoryEntry | null> {
    const { data, error } = await supabase
      .from('home_history')
      .insert([{ ...this.mapHomeHistoryToDatabase(entry), home_id: homeId }])
      .select('*')
      .single()

    if (error) {
      console.error('Error creating home history entry:', error)
      return null
    }

    return this.mapDatabaseHomeHistoryToHomeHistory(data)
  }

  async updateHomeHistoryEntry(entry: HomeHistoryEntry): Promise<HomeHistoryEntry | null> {
    const { data, error } = await supabase
      .from('home_history')
      .update(this.mapHomeHistoryToDatabase(entry))
      .eq('id', entry.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating home history entry:', error)
      return null
    }

    return this.mapDatabaseHomeHistoryToHomeHistory(data)
  }

  // Mapping functions
  private mapDatabaseHomeToHome(data: any): Home {
    return {
      id: data.id,
      address: data.address,
      purchaseDate: data.purchase_date,
      purchasePrice: data.purchase_price,
      currentValue: data.current_value,
      lastUpdated: data.last_updated,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      squareFootage: data.square_footage,
      yearBuilt: data.year_built,
      propertyType: data.property_type,
      photos: data.photos || []
    }
  }

  private mapHomeToDatabase(home: Omit<Home, 'id'>): any {
    return {
      address: home.address,
      purchase_date: home.purchaseDate,
      purchase_price: home.purchasePrice,
      current_value: home.currentValue,
      last_updated: home.lastUpdated,
      bedrooms: home.bedrooms,
      bathrooms: home.bathrooms,
      square_footage: home.squareFootage,
      year_built: home.yearBuilt,
      property_type: home.propertyType,
      photos: home.photos
    }
  }

  private mapDatabaseProjectToProject(data: any): Omit<Project, 'tasks' | 'photos' | 'notes' | 'estimates' | 'receipts' | 'contractors'> {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      targetStartDate: data.target_start_date,
      estimatedCompletionDate: data.estimated_completion_date,
      actualCompletionDate: data.actual_completion_date,
      budget: data.budget,
      projectedValue: data.projected_value,
      createdDate: data.created_date,
      updatedDate: data.updated_date
    }
  }

  private mapProjectToDatabase(project: Omit<Project, 'id' | 'tasks' | 'photos' | 'notes' | 'estimates' | 'receipts' | 'contractors'>): any {
    return {
      name: project.name,
      description: project.description,
      status: project.status,
      target_start_date: project.targetStartDate,
      estimated_completion_date: project.estimatedCompletionDate,
      actual_completion_date: project.actualCompletionDate,
      budget: project.budget,
      projected_value: project.projectedValue,
      created_date: project.createdDate,
      updated_date: project.updatedDate
    }
  }

  private mapDatabaseTaskToTask(data: any): Task {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      assignedTo: data.assigned_to,
      dueDate: data.due_date,
      completedDate: data.completed_date
    }
  }

  private mapTaskToDatabase(task: Task): any {
    return {
      id: task.id,
      name: task.name,
      description: task.description,
      status: task.status,
      assigned_to: task.assignedTo,
      due_date: task.dueDate,
      completed_date: task.completedDate
    }
  }

  private mapDatabasePhotoToPhoto(data: any): Photo {
    return {
      id: data.id,
      url: data.url,
      type: data.type,
      caption: data.caption,
      uploadedDate: data.uploaded_date
    }
  }

  private mapPhotoToDatabase(photo: Photo): any {
    return {
      id: photo.id,
      url: photo.url,
      type: photo.type,
      caption: photo.caption,
      uploaded_date: photo.uploadedDate
    }
  }

  private mapDatabaseEstimateToEstimate(data: any): Estimate {
    return {
      id: data.id,
      contractor: data.contractor,
      amount: data.amount,
      description: data.description,
      date: data.date,
      selected: data.selected
    }
  }

  private mapEstimateToDatabase(estimate: Estimate): any {
    return {
      id: estimate.id,
      contractor: estimate.contractor,
      amount: estimate.amount,
      description: estimate.description,
      date: estimate.date,
      selected: estimate.selected
    }
  }

  private mapDatabaseReceiptToReceipt(data: any): Receipt {
    return {
      id: data.id,
      vendor: data.vendor,
      amount: data.amount,
      category: data.category,
      date: data.date
    }
  }

  private mapReceiptToDatabase(receipt: Receipt): any {
    return {
      id: receipt.id,
      vendor: receipt.vendor,
      amount: receipt.amount,
      category: receipt.category,
      date: receipt.date
    }
  }

  private mapDatabaseContractorToContractor(data: any): Contractor {
    return {
      id: data.id,
      name: data.name,
      company: data.company,
      phone: data.phone,
      email: data.email,
      specialty: data.specialty,
      rating: data.rating
    }
  }

  private mapContractorToDatabase(contractor: Contractor): any {
    return {
      id: contractor.id,
      name: contractor.name,
      company: contractor.company,
      phone: contractor.phone,
      email: contractor.email,
      specialty: contractor.specialty,
      rating: contractor.rating
    }
  }

  private mapDatabaseHomeHistoryToHomeHistory(data: any): HomeHistoryEntry {
    return {
      id: data.id,
      projectName: data.project_name,
      completionDate: data.completion_date,
      description: data.description,
      beforePhoto: data.before_photo,
      afterPhoto: data.after_photo,
      projectedValue: data.projected_value,
      actualValue: data.actual_value,
      wasTrackedProject: data.was_tracked_project
    }
  }

  private mapHomeHistoryToDatabase(entry: Omit<HomeHistoryEntry, 'id'>): any {
    return {
      project_name: entry.projectName,
      completion_date: entry.completionDate,
      description: entry.description,
      before_photo: entry.beforePhoto,
      after_photo: entry.afterPhoto,
      projected_value: entry.projectedValue,
      actual_value: entry.actualValue,
      was_tracked_project: entry.wasTrackedProject
    }
  }
}

export const db = new DatabaseService()