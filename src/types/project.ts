export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  dueDate?: string;
  completedDate?: string;
}

export interface Photo {
  id: string;
  url: string;
  type: 'inspirational' | 'documentary' | 'before' | 'after';
  caption?: string;
  uploadedDate: string;
}

export interface Estimate {
  id: string;
  contractor: string;
  amount: number;
  description: string;
  date: string;
  selected?: boolean;
}

export interface Receipt {
  id: string;
  vendor: string;
  amount: number;
  category: string;
  date: string;
  imageUrl?: string;
}

export interface Contractor {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  specialty: string;
  rating?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed';
  targetStartDate: string;
  estimatedCompletionDate: string;
  actualCompletionDate?: string;
  budget: number;
  actualCost?: number;
  projectedValue?: number;
  actualValue?: number;
  tasks: Task[];
  photos: Photo[];
  notes: string[];
  estimates: Estimate[];
  receipts: Receipt[];
  contractors: Contractor[];
  createdDate: string;
  updatedDate: string;
}

export interface HomeHistoryEntry {
  id: string;
  projectName: string;
  completionDate: string;
  beforePhoto?: string;
  afterPhoto?: string;
  projectedValue?: number;
  actualValue?: number;
  description?: string;
  wasTrackedProject: boolean;
  originalProjectId?: string;
}

export interface Home {
  id: string;
  address: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  lastUpdated: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family';
  photos: string[];
}