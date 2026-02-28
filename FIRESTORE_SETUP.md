# Firebase Firestore Setup Guide

## Prerequisites

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Set up Firebase Authentication

## Environment Variables

Add the following to your `.env.local` file (copy from `.env.example`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Database Collections Schema

### 1. **users** Collection
Stores user profile information with role assignments.

```
users/{userId}
├── id: string
├── email: string
├── name: string
├── role: 'SUPERADMIN' | 'MANAGER' | 'EMPLOYEE'
├── avatar: string (optional)
├── companyId: string
├── departmentId: string (optional)
├── phone: string (optional)
├── status: 'active' | 'inactive'
├── createdAt: Timestamp
├── updatedAt: Timestamp
└── createdBy: string
```

### 2. **companies** Collection
Stores company information.

```
companies/{companyId}
├── id: string
├── name: string
├── industry: string (optional)
├── website: string (optional)
├── logo: string (optional)
├── address: string (optional)
├── country: string (optional)
├── status: 'active' | 'inactive'
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### 3. **departments** Collection
Stores department information.

```
departments/{departmentId}
├── id: string
├── name: string
├── companyId: string
├── managerId: string (optional)
├── description: string (optional)
├── status: 'active' | 'inactive'
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### 4. **projects** Collection
Stores project information.

```
projects/{projectId}
├── id: string
├── name: string
├── description: string (optional)
├── companyId: string
├── status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED'
├── startDate: Timestamp
├── endDate: Timestamp
├── managerId: string
├── teamMemberIds: [string]
├── budget: number (optional)
├── kpiTarget: number (optional)
├── riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### 5. **tasks** Collection
Stores task information.

```
tasks/{taskId}
├── id: string
├── projectId: string
├── title: string
├── description: string (optional)
├── assignedTo: string
├── status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED'
├── priority: 'LOW' | 'MEDIUM' | 'HIGH'
├── dueDate: Timestamp
├── completedDate: Timestamp (optional)
├── estimatedHours: number (optional)
├── actualHours: number (optional)
├── dependencies: [string]
├── attachments: [string]
├── createdAt: Timestamp
├── updatedAt: Timestamp
└── createdBy: string
```

### 6. **assets** Collection
Stores company assets.

```
assets/{assetId}
├── id: string
├── name: string
├── description: string (optional)
├── type: string
├── companyId: string
├── status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED'
├── currentUser: string (optional)
├── location: string (optional)
├── value: number (optional)
├── purchaseDate: Timestamp (optional)
├── expiryDate: Timestamp (optional)
├── serialNumber: string (optional)
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### 7. **chatMessages** Collection
Stores chat messages for projects.

```
chatMessages/{messageId}
├── id: string
├── projectId: string (optional)
├── senderId: string
├── senderName: string
├── message: string
├── attachments: [string] (optional)
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### 8. **kpiMetrics** Collection
Stores KPI metrics for projects.

```
kpiMetrics/{metricId}
├── id: string
├── projectId: string
├── metricName: string
├── targetValue: number
├── currentValue: number
├── unit: string
├── lastUpdated: Timestamp
└── createdAt: Timestamp
```

### 9. **riskAssessments** Collection
Stores risk assessments for projects.

```
riskAssessments/{riskId}
├── id: string
├── projectId: string
├── riskName: string
├── description: string (optional)
├── likelihood: number (1-5)
├── impact: number (1-5)
├── mitigation: string (optional)
├── owner: string
├── status: 'OPEN' | 'MITIGATED' | 'CLOSED'
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

## Firestore Security Rules

For development (not production):

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, implement proper RLS:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'SUPERADMIN';
    }
    
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['SUPERADMIN', 'MANAGER'];
    }
    
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.assignedTo || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['SUPERADMIN', 'MANAGER'];
    }
  }
}
```

## Indexes

Create the following composite indexes in Firestore for better query performance:

1. **users** collection:
   - companyId + role + status

2. **projects** collection:
   - companyId + status + createdAt

3. **tasks** collection:
   - projectId + status + dueDate
   - assignedTo + status + dueDate

4. **assets** collection:
   - companyId + status + createdAt

## Initialization

The app uses Zustand stores for state management and custom React hooks for data fetching. Firestore listeners are set up automatically when components mount.

## API Reference

See `/lib/services/firestore.ts` for all available functions:

- User operations: `getUser`, `createUser`, `updateUser`, `getUsersByRole`
- Project operations: `getProject`, `getProjectsByCompany`, `createProject`, `updateProject`
- Task operations: `getTask`, `getTasksByProject`, `getTasksByAssignee`, `createTask`, `updateTask`
- Asset operations: `getAsset`, `getAssetsByCompany`, `createAsset`
- Chat operations: `getChatMessages`, `sendChatMessage`
