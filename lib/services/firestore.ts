import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Query,
  QueryConstraint,
  writeBatch,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { UserProfile, Project, Task, Asset, ChatMessage, Company, Department } from '../models'

// ============ USER OPERATIONS ============

export const getUser = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export const createUser = async (userId: string, userData: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      ...userData,
      id: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const updateUser = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export const getUsersByRole = async (companyId: string, role: string): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('companyId', '==', companyId),
      where('role', '==', role),
      where('status', '==', 'active')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as UserProfile)
  } catch (error) {
    console.error('Error fetching users by role:', error)
    return []
  }
}

// ============ PROJECT OPERATIONS ============

export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const docRef = doc(db, 'projects', projectId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? (docSnap.data() as Project) : null
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

export const getProjectsByCompany = async (companyId: string): Promise<Project[]> => {
  try {
    const q = query(
      collection(db, 'projects'),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as Project)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

export const createProject = async (projectData: Partial<Project>): Promise<string> => {
  try {
    const projectRef = doc(collection(db, 'projects'))
    await setDoc(projectRef, {
      ...projectData,
      id: projectRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return projectRef.id
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<void> => {
  try {
    const projectRef = doc(db, 'projects', projectId)
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

// ============ TASK OPERATIONS ============

export const getTask = async (taskId: string): Promise<Task | null> => {
  try {
    const docRef = doc(db, 'tasks', taskId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? (docSnap.data() as Task) : null
  } catch (error) {
    console.error('Error fetching task:', error)
    return null
  }
}

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId),
      orderBy('dueDate', 'asc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as Task)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

export const getTasksByAssignee = async (userId: string): Promise<Task[]> => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('assignedTo', '==', userId),
      orderBy('dueDate', 'asc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as Task)
  } catch (error) {
    console.error('Error fetching tasks by assignee:', error)
    return []
  }
}

export const createTask = async (taskData: Partial<Task>): Promise<string> => {
  try {
    const taskRef = doc(collection(db, 'tasks'))
    await setDoc(taskRef, {
      ...taskData,
      id: taskRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return taskRef.id
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  try {
    const taskRef = doc(db, 'tasks', taskId)
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

// ============ ASSET OPERATIONS ============

export const getAsset = async (assetId: string): Promise<Asset | null> => {
  try {
    const docRef = doc(db, 'assets', assetId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? (docSnap.data() as Asset) : null
  } catch (error) {
    console.error('Error fetching asset:', error)
    return null
  }
}

export const getAssetsByCompany = async (companyId: string): Promise<Asset[]> => {
  try {
    const q = query(
      collection(db, 'assets'),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as Asset)
  } catch (error) {
    console.error('Error fetching assets:', error)
    return []
  }
}

export const createAsset = async (assetData: Partial<Asset>): Promise<string> => {
  try {
    const assetRef = doc(collection(db, 'assets'))
    await setDoc(assetRef, {
      ...assetData,
      id: assetRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return assetRef.id
  } catch (error) {
    console.error('Error creating asset:', error)
    throw error
  }
}

// ============ CHAT OPERATIONS ============

export const getChatMessages = async (projectId: string, limitCount: number = 50): Promise<ChatMessage[]> => {
  try {
    const q = query(
      collection(db, 'chatMessages'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as ChatMessage).reverse()
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return []
  }
}

export const sendChatMessage = async (messageData: Partial<ChatMessage>): Promise<string> => {
  try {
    const messageRef = doc(collection(db, 'chatMessages'))
    await setDoc(messageRef, {
      ...messageData,
      id: messageRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return messageRef.id
  } catch (error) {
    console.error('Error sending chat message:', error)
    throw error
  }
}
