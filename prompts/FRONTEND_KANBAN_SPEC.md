# Frontend Specification: Position Detail Page with Kanban Board

## 1. Executive Summary

This specification describes the implementation of a position detail page that allows viewing and managing candidates through a Kanban board with drag-and-drop functionality. This implementation uses React with React Router (not Next.js) and follows the existing frontend architecture patterns.

## 2. File Architecture

### 2.1 Directory Structure
```
frontend/
  └── src/
      ├── pages/
      │   └── PositionDetail.tsx      # Main page component
      ├── components/
      │   ├── Positions.tsx           # Existing positions list (to be updated)
      │   ├── KanbanBoard.tsx         # Main Kanban board component
      │   ├── KanbanColumn.tsx        # Individual Kanban column
      │   └── CandidateCard.tsx       # Candidate card component
      └── services/
          ├── candidateService.js     # Existing candidate service
          └── positionService.js      # New service for position operations
```

### 2.2 Integration with Existing Components

**Existing Component:**
- `components/Positions.tsx` - Already exists with positions list and filters
- Contains "Ver proceso" button that needs to navigate to detail page

**New Components to Create:**
- `pages/PositionDetail.tsx` - Main detail page
- `components/KanbanBoard.tsx` - Kanban board container
- `components/KanbanColumn.tsx` - Individual column
- `components/CandidateCard.tsx` - Candidate card

**New Service:**
- `services/positionService.js` - API methods for position-related operations

## 3. Data Models

### 3.1 InterviewStep
```typescript
interface InterviewStep {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
}
```

### 3.2 Candidate
```typescript
interface Candidate {
  id: number;                    // Candidate ID (from backend response)
  fullName: string;
  currentInterviewStep: string;  // Name of current stage (matches InterviewStep.name)
  averageScore: number;          // Value between 0-5 (calculated from interviews)
  applicationId: number;         // Application ID (required for updating stage)
}
```

### 3.3 Interview Flow Response
```typescript
// Backend returns: { interviewFlow: { positionName, interviewFlow: {...} } }
interface InterviewFlowApiResponse {
  interviewFlow: {
    positionName: string;
    interviewFlow: {
      id: number;
      description: string;
      interviewSteps: InterviewStep[];
    };
  };
}
```

### 3.4 Candidates Response
```typescript
// Array of Candidate objects
type CandidatesResponse = Candidate[];
```

## 4. Detailed Components

### 4.1 pages/PositionDetail.tsx

**Responsibility:** Main page component that fetches initial data and renders the main layout.

**Props:**
- Uses React Router `useParams` to get position ID from route: `/positions/:id`

**Functionalities:**
- Fetch interview flow from API: `GET /position/:id/interviewflow` (using positionService)
- Fetch candidates from API: `GET /position/:id/candidates` (using positionService)
- Render header with back arrow button (left of title) to return to positions list
- Render position title from API response (`positionName`)
- Render KanbanBoard with data
- Handle loading and error states
- Display position title at the top for context
- **No mock data** - always use real API calls

**State Management:**
```typescript
const [positionName, setPositionName] = useState<string>('');
const [interviewSteps, setInterviewSteps] = useState<InterviewStep[]>([]);
const [candidates, setCandidates] = useState<Candidate[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
```

**Data Fetching:**
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch interview flow
      const flowResponse = await getPositionInterviewFlow(positionId);
      // Backend returns: { interviewFlow: { positionName, interviewFlow: {...} } }
      setPositionName(flowResponse.interviewFlow.positionName);
      setInterviewSteps(flowResponse.interviewFlow.interviewFlow.interviewSteps);
      
      // Fetch candidates
      const candidatesData = await getPositionCandidates(positionId);
      // Backend returns array with: id, fullName, currentInterviewStep, averageScore, applicationId
      setCandidates(candidatesData);
    } catch (error) {
      setError('Error loading position data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [positionId]);
```

**Styles:**
- Background: `bg-light` (Bootstrap) or custom `#f8f9fa` (very light gray)
- Container: `min-vh-100` (Bootstrap) or `min-h-screen`
- Header: White card with subtle shadow (`shadow-sm`)
- Padding: `p-4` or `p-5` (Bootstrap spacing)

### 4.2 components/KanbanBoard.tsx

**Type:** Functional Component with hooks

**Props:**
```typescript
interface KanbanBoardProps {
  interviewSteps: InterviewStep[];  // Ordered array of interview steps
  initialCandidates: Candidate[];
  positionId: string;
}
```

**State:**
```typescript
const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
```

**Main Functionalities:**

1. **Candidate Grouping by Stage:**
   - Use `useMemo` to group candidates by `currentInterviewStep`
   - Create a Map object: `{ [stepName: string]: Candidate[] }`

2. **Drag and Drop:**
   - `handleDragStart`: Save candidate in `draggedCandidate` state
   - `handleDrop`: 
     - Update candidate's `currentInterviewStep`
     - Update local state immediately (optimistic update)
     - Call API to persist change
     - If API fails, revert to previous state
     - Show toast with result

3. **Toast Management:**
   - Success: Show success message "✓ Candidate moved successfully"
   - Error: Show error message "✕ Error moving candidate. Please try again."
   - Use React Bootstrap Alert or custom toast component

4. **API Integration:**
   - Always use real API calls (no mock data)
   - Endpoint: `PUT http://localhost:3010/candidates/:id` (using candidateService)
   - Body: `{ applicationId: number, currentInterviewStep: number }` (where currentInterviewStep is the interview_step_id)
   - Note: Need to map candidate's `currentInterviewStep` (string name) to `interview_step_id` (number) when updating
   - Use candidate's `id` from response in the URL parameter
   - Use candidate's `applicationId` from response in the request body

**Layout:**
- Container: `d-flex gap-3 overflow-auto pb-3` (Bootstrap) or `flex gap-4 overflow-x-auto pb-4`
- Responsive: Horizontal scroll on mobile, full view on desktop
- Min-width per column: `min-w-[280px]` or `min-width: 280px`

### 4.3 components/KanbanColumn.tsx

**Type:** Functional Component

**Props:**
```typescript
interface KanbanColumnProps {
  step: InterviewStep;
  candidates: Candidate[];
  onDrop: (stepName: string) => void;
  onDragStart: (candidate: Candidate) => void;
}
```

**Functionalities:**
- `onDragOver`: Prevent default behavior and show visual indicator
- `onDrop`: Call `onDrop` callback with stage name
- `onDragLeave`: Remove visual indicator

**Styles:**
- Container: `bg-white rounded shadow-sm p-3` (Bootstrap Card or custom)
- Width: `flex-1` with `min-width: 280px`
- Header: `fw-semibold text-secondary mb-3` (Bootstrap) or `font-semibold text-gray-700 mb-3`
- Badge: Show candidate count `badge bg-primary` (Bootstrap) or `bg-blue-100 text-blue-700`
- Active drop zone: `border border-2 border-dashed border-primary bg-primary bg-opacity-10` (Bootstrap)

### 4.4 components/CandidateCard.tsx

**Type:** Functional Component

**Props:**
```typescript
interface CandidateCardProps {
  candidate: Candidate;
  onDragStart: (candidate: Candidate) => void;
  isDragging: boolean;
}
```

**Functionalities:**
- Draggable: `draggable={true}`
- `onDragStart`: Notify parent
- Display full name
- Display score with green circles

**Score System:**
- Total: 5 circles
- Filled: Green (#22c55e / Bootstrap success color)
- Empty: Gray (#d1d5db / Bootstrap secondary)
- Size: `h-3 w-3` (12px) or Bootstrap sizing
- Layout: `d-flex gap-1` (Bootstrap) or `flex gap-1`
- **DO NOT show score number**

**Styles:**
- Container: `bg-white border border-secondary rounded p-3` with `cursor-move` (Bootstrap Card or custom)
- Shadow: `shadow-sm` on hover `shadow`
- Transition: `transition-all` with duration
- Dragging: `opacity-50`
- Hover: `border-primary` or custom hover border

**Visual Example:**
```
┌─────────────────────┐
│ María García        │
│ ● ● ● ● ○          │ <- 4.5/5 = 4 filled green circles
└─────────────────────┘
```

## 5. Visual Design

### 5.1 Color Palette

**Backgrounds:**
- Main page: `#f8f9fa` (very light gray) - Bootstrap `bg-light`
- Cards/Columns: `#ffffff` (white) - Bootstrap `bg-white`
- Hover states: `#f3f4f6` (light gray) - Bootstrap `bg-light`

**Text:**
- Primary: `#374151` (gray-700) - Bootstrap `text-dark`
- Secondary: `#6b7280` (gray-500) - Bootstrap `text-secondary`
- Muted: `#9ca3af` (gray-400) - Bootstrap `text-muted`

**Accents:**
- Primary blue: `#3b82f6` (blue-500) - Bootstrap `primary`
- Light blue: `#dbeafe` (blue-100) - Bootstrap `primary` with opacity
- Green (score): `#22c55e` (green-500) - Bootstrap `success`
- Red (error): `#ef4444` (red-500) - Bootstrap `danger`

**Borders:**
- Default: `#e5e7eb` (gray-200) - Bootstrap `border-secondary`
- Hover: `#93c5fd` (blue-300) - Bootstrap `border-primary`
- Drop zone: `#60a5fa` (blue-400) - Bootstrap `border-primary`

### 5.2 Shadows
- Cards: `shadow-sm` (subtle)
- Cards hover: `shadow` (moderate)
- Header: `shadow-sm`

### 5.3 Typography
- Headers: `fw-semibold fs-5` or `fs-4` (Bootstrap) or `font-semibold text-lg` or `text-xl`
- Body: `fs-6` or `fs-5` (Bootstrap) or `text-sm` or `text-base`
- Muted: `fs-6 text-muted` (Bootstrap) or `text-xs text-gray-500`

### 5.4 Spacing
- Card padding: `p-3` or `p-4` (Bootstrap)
- Gap between columns: `gap-3` or `gap-4` (Bootstrap)
- Gap between cards: `gap-2` (Bootstrap)
- Section margins: `mb-4` or `mb-5` (Bootstrap)

## 6. Drag & Drop Behavior

### 6.1 Visual States

**1. Drag Start:**
- Dragged card: `opacity-50`
- Cursor: `cursor-grabbing` (entire document)

**2. Hover over Column:**
- Column: Add blue dashed border and light blue background
- Visual indicator: "Drop here"

**3. Successful Drop:**
- Card appears immediately in new column
- Success toast: "✓ Candidate moved successfully"
- Smooth transition animation

**4. Failed Drop:**
- Card returns to original column
- Error toast: "✕ Error moving candidate. Please try again."

### 6.2 Data Flow

```
1. User drags card
   ↓
2. onDragStart: Save candidate in state
   ↓
3. onDragOver: Show visual indicator on destination column
   ↓
4. onDrop: 
   a. Update local state (optimistic)
   b. Call PUT API
   c. If success: Keep change + success toast
   d. If failure: Revert change + error toast
```

### 6.3 State Management

**Optimistic Update:**
```typescript
// Save previous state
const previousCandidates = [...candidates];

// Find the interview step ID from the step name
const targetStep = interviewSteps.find(step => step.name === newStepName);
if (!targetStep) {
  throw new Error('Invalid interview step');
}

// Update candidate's currentInterviewStep (string) immediately
const updatedCandidates = candidates.map(candidate => 
  candidate === draggedCandidate 
    ? { ...candidate, currentInterviewStep: newStepName }
    : candidate
);

// Update immediately (responsive UI)
setCandidates(updatedCandidates);

try {
  // Try to persist in backend
  // Use candidate.id from API response for URL parameter
  // Use candidate.applicationId from API response for request body
  // Use targetStep.id (interview_step_id) for currentInterviewStep in request body
  await updateCandidateStage(
    draggedCandidate.id,           // candidate ID from API response
    draggedCandidate.applicationId, // application ID from API response
    targetStep.id                   // interview_step_id (number)
  );
  // Show success toast
} catch (error) {
  // Revert if fails
  setCandidates(previousCandidates);
  // Show error toast
}
```

**Important:** 
- The candidate object from the API already includes both `id` and `applicationId`
- Map the `currentInterviewStep` string name to the corresponding `interview_step_id` from the `interviewSteps` array
- The API expects `currentInterviewStep` as a number (interview_step_id), not a string
- Always use real API calls - no fallback to mock data

## 7. API Integration

### 7.0 Data Mapping and Structure

**Important Data Transformations:**

1. **Interview Step Name to ID Mapping:**
   - Candidates have `currentInterviewStep` as a string (e.g., "Technical Interview")
   - API requires `currentInterviewStep` as a number (interview_step_id)
   - Create a mapping function:
   ```typescript
   const getStepIdByName = (stepName: string, interviewSteps: InterviewStep[]): number | null => {
     const step = interviewSteps.find(s => s.name === stepName);
     return step ? step.id : null;
   };
   ```

2. **Candidate Application ID:**
   - The PUT endpoint requires `applicationId` in the request body
   - **The backend already includes `applicationId` in the GET `/position/:id/candidates` response**
   - Each candidate object returned includes: `id`, `fullName`, `currentInterviewStep`, `averageScore`, `applicationId`
   - Use the `applicationId` directly from the candidate object

3. **Candidate ID for PUT Request:**
   - The PUT endpoint URL uses `/candidates/:id`
   - Use the candidate's `id` field from the GET response in the URL parameter
   - The backend expects: `PUT /candidates/:id` where `:id` is the candidate ID

### 7.1 API Base URL

**Following existing service pattern:**
- Use hardcoded base URL: `http://localhost:3010` (matching `candidateService.js`)
- No environment variables needed - follow existing project pattern

### 7.2 Endpoints

**GET Interview Flow:**
```
GET http://localhost:3010/position/:id/interviewflow
Response: {
  interviewFlow: {
    positionName: string;
    interviewFlow: {
      id: number;
      description: string;
      interviewSteps: InterviewStep[];
    };
  };
}
```

**GET Candidates:**
```
GET http://localhost:3010/position/:id/candidates
Response: Candidate[] (array of candidates with id, fullName, currentInterviewStep, averageScore, applicationId)
Example response:
[
  {
    id: 1,
    fullName: "Jane Smith",
    currentInterviewStep: "Technical Interview",
    averageScore: 4,
    applicationId: 1
  },
  {
    id: 2,
    fullName: "Carlos García",
    currentInterviewStep: "Initial Screening",
    averageScore: 0,
    applicationId: 2
  }
]
```

**UPDATE Candidate Stage:**
```
PUT http://localhost:3010/candidates/:id
Body: {
  applicationId: number;
  currentInterviewStep: number;  // interview_step_id (not the name)
}
Response: {
  message: string;
  data: {
    id: number;
    positionId: number;
    candidateId: number;
    applicationDate: string;
    currentInterviewStep: number;
    notes: string | null;
    interviews: any[];
  };
}
```

### 7.3 Error Handling

- Follow existing error handling pattern from `candidateService.js`
- Use try/catch blocks in service methods
- Throw descriptive errors in Spanish (matching existing pattern)
- Handle errors in components and show user-friendly messages
- Toast: Show errors to user with descriptive messages
- No fallback to mock data - always use real API

### 7.4 Service Layer

**Create positionService.js following existing pattern:**
```javascript
// Create services/positionService.js following the same pattern as candidateService.js
import axios from 'axios';

// Use same base URL pattern as existing services
const API_BASE_URL = 'http://localhost:3010';

export const getPositionInterviewFlow = async (positionId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/position/${positionId}/interviewflow`
    );
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el flujo de entrevistas:', error.response?.data || error.message);
  }
};

export const getPositionCandidates = async (positionId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/position/${positionId}/candidates`
    );
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los candidatos:', error.response?.data || error.message);
  }
};
```

**Update candidateService.js to add updateCandidateStage method:**
```javascript
// Add to existing services/candidateService.js
export const updateCandidateStage = async (candidateId, applicationId, interviewStepId) => {
  try {
    const response = await axios.put(
      `http://localhost:3010/candidates/${candidateId}`,
      {
        applicationId: applicationId,
        currentInterviewStep: interviewStepId  // This is the interview_step_id (number)
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Error al actualizar la etapa del candidato:', error.response?.data || error.message);
  }
};
```

**Important Notes:**
- Follow the existing service pattern from `candidateService.js`:
  - Use hardcoded base URL: `http://localhost:3010`
  - Use try/catch with error handling
  - Throw errors with descriptive messages in Spanish (matching existing pattern)
  - Return `response.data` directly
- The `currentInterviewStep` in the PUT request must be the `interview_step_id` (number), not the name (string)
- Need to map candidate's `currentInterviewStep` (string name) to the corresponding `interview_step_id` from interviewSteps array
- The `applicationId` is required in the request body and comes from the candidate object returned by the API
- The candidate `id` from the API response is used in the PUT URL parameter

## 8. Navigation

### 8.1 Route

```
/positions/:id
```

### 8.2 Route Configuration

**Update App.tsx or routing configuration:**
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PositionDetail from './pages/PositionDetail';

// In App component
<Routes>
  <Route path="/positions/:id" element={<PositionDetail />} />
  {/* other routes */}
</Routes>
```

### 8.3 Navigation from List

**Update Positions.tsx component:**
```typescript
// In Positions.tsx component
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Update the "Ver proceso" button
<Button 
  variant="primary" 
  onClick={() => navigate(`/positions/${position.id}`)}
>
  Ver proceso
</Button>
```

**Note:** The Positions component already exists at `frontend/src/components/Positions.tsx`. Update the button to use React Router navigation.

### 8.4 Back Button and Header

```typescript
// In PositionDetail page
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';
import { Container } from 'react-bootstrap';

const navigate = useNavigate();

// Header with back arrow and position title
<Container className="mt-4">
  <div className="d-flex align-items-center mb-4">
    <Button 
      variant="link" 
      className="p-0 me-3" 
      onClick={() => navigate('/positions')}
      aria-label="Volver al listado de posiciones"
    >
      <ArrowLeft size={24} />
    </Button>
    <h2 className="mb-0">{positionName}</h2>
  </div>
  {/* KanbanBoard component */}
</Container>
```

**Design Requirements:**
- Back arrow should be to the left of the position title
- Position title should be displayed at the top for context
- Use Bootstrap classes for consistent styling

## 9. Responsive Design

### 9.1 Mobile (< 768px)
- **Columns in vertical layout** (stacked, full width)
- Each column takes full width
- Columns displayed one below another
- Reduced padding: `p-3` or `p-4`
- Compact header with smaller font size

### 9.2 Tablet (768px - 1024px)
- Columns can be in horizontal scroll or 2 columns visible
- Scroll to see rest if more than 2 columns
- Medium padding: `p-4`

### 9.3 Desktop (> 1024px)
- All columns visible simultaneously in horizontal layout
- No scroll needed
- Generous padding: `p-5`
- Full width utilization

## 10. Accessibility

### 10.1 Keyboard Navigation
- Tab: Navigate between cards
- Enter/Space: Start drag
- Arrow keys: Move between columns
- Escape: Cancel drag

### 10.2 Screen Readers
- Aria labels on buttons and cards
- Role="button" on clickable elements
- Announce state changes

### 10.3 Contrast
- Minimum ratio: 4.5:1 for normal text
- Minimum ratio: 3:1 for large text
- Verify with contrast tools

## 11. Performance

### 11.1 Optimizations
- `useMemo` for candidate grouping
- Lazy loading of images (if applicable)
- Debounce on searches (future)
- Virtual scrolling for many candidates (future)

### 11.2 Bundle Size
- Code splitting by route (React.lazy)
- Dynamic imports for heavy components
- Tree shaking enabled

## 12. Testing (Recommended)

### 12.1 Unit Tests
- Candidate grouping by stage
- Score visual calculation
- API response data validation

### 12.2 Integration Tests
- Drag and drop between columns
- API calls
- Error handling

### 12.3 E2E Tests (Cypress)
- Complete flow of moving candidate
- Navigation between pages
- Error states

## 13. Required Dependencies

**Already in package.json:**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.23.1",
  "react-bootstrap": "^2.10.2",
  "react-bootstrap-icons": "^1.11.4",
  "typescript": "^4.9.5"
}
```

**May need to add:**
- Toast/notification library (or use React Bootstrap Alert)
- Or implement custom toast component

## 14. Implementation Checklist

- [ ] Create directory structure (pages/, components/)
- [ ] Define TypeScript interfaces matching actual API responses
- [ ] Create positionService.js following existing service pattern
- [ ] Update candidateService.js with updateCandidateStage method
- [ ] Implement PositionDetail.tsx page with real API calls
- [ ] Create KanbanBoard.tsx component
- [ ] Create KanbanColumn.tsx component
- [ ] Create CandidateCard.tsx component
- [ ] Implement drag and drop functionality
- [ ] Implement API integration with actual endpoints:
  - [ ] GET /position/:id/interviewflow
  - [ ] GET /position/:id/candidates
  - [ ] PUT /candidates/:id
- [ ] Map interview step names to IDs for API calls
- [ ] Handle API response structure (interviewFlow wrapper)
- [ ] Add toast/notification system
- [ ] Apply visual styles (Bootstrap or custom)
- [ ] Implement score system with circles
- [ ] Add routing configuration in App.tsx
- [ ] Update Positions.tsx "Ver proceso" button to navigate
- [ ] Implement back arrow and position title header
- [ ] Test in different browsers
- [ ] Test responsive design (especially mobile vertical layout)
- [ ] Verify accessibility
- [ ] Optimize performance
- [ ] Use candidate.id and candidate.applicationId from API responses

## 15. Implementation Notes

### 15.1 Important Considerations
- **Always use real API calls** - no mock data fallback
- Changes persist locally until API confirms (optimistic updates)
- Toasts should close automatically
- Drag should feel fluid and responsive
- Use Bootstrap classes where possible for consistency
- **Follow existing service layer patterns** from `candidateService.js`:
  - Use hardcoded base URL: `http://localhost:3010`
  - Use try/catch with descriptive error messages in Spanish
  - Return `response.data` directly
- **Critical:** Map candidate's `currentInterviewStep` (string name) to `interview_step_id` (number) when calling PUT API
- **Critical:** Use candidate's `id` and `applicationId` from API response (already included in GET response)
- **Critical:** Handle API response structure - interview flow is wrapped in `{ interviewFlow: {...} }`
- **Critical:** Mobile layout should display columns vertically (stacked), not horizontally
- Position title must be displayed at the top with back arrow to the left
- The "Ver proceso" button in Positions.tsx must navigate to `/positions/:id`
- Use actual endpoints: `/position/:id/interviewflow` and `/position/:id/candidates` (not `/positions/...`)

### 15.2 Possible Future Improvements
- Filters by candidate name
- Sorting within columns
- Candidate detail view (modal)
- Comments on cards
- Real-time notifications
- Movement history
- Advanced search and filters
- PDF/Excel export

## 16. Example Usage in Cursor

To implement this spec in Cursor, you can use the following prompt:

```
Implement a position detail page with Kanban board according to the following specifications:

1. Create the route /positions/:id using React Router
2. Create PositionDetail.tsx page that fetches data from:
   - GET http://localhost:3010/position/:id/interviewflow (returns { interviewFlow: { positionName, interviewFlow: {...} } })
   - GET http://localhost:3010/position/:id/candidates (returns array with id, fullName, currentInterviewStep, averageScore, applicationId)
3. Display position title at the top with back arrow button to the left
4. Create positionService.js following existing candidateService.js pattern:
   - Use hardcoded base URL: http://localhost:3010
   - Use try/catch with Spanish error messages
   - Return response.data directly
5. Update candidateService.js to add updateCandidateStage method
6. Implement functional drag-and-drop between columns
7. Use Bootstrap classes: bg-light for background, white cards, primary blue accents
8. Score system with 5 green circles (no number) - show averageScore visually
9. Toast notifications in Spanish for confirmation/error
10. Mobile responsive: columns stacked vertically on mobile (< 768px), horizontal on desktop
11. Update Positions.tsx "Ver proceso" button to navigate to detail page

API Endpoints (actual backend):
- GET /position/:id/interviewflow
- GET /position/:id/candidates  
- PUT /candidates/:id (requires applicationId and currentInterviewStep as interview_step_id number in body)

Important:
- Always use real API calls - no mock data
- Map candidate's currentInterviewStep (string) to interview_step_id (number) for API calls
- Use candidate.id from API response for PUT URL parameter
- Use candidate.applicationId from API response for PUT request body
- Handle API response structure: interview flow is wrapped in { interviewFlow: {...} }
- Follow existing service layer patterns from candidateService.js
```

## 17. Migration from Next.js Spec

**Key Differences from Next.js Version:**
- Use React Router `useParams` instead of Next.js `params`
- Use `useNavigate` instead of Next.js `router.push`
- Use hardcoded base URL `http://localhost:3010` (following existing service pattern)
- Use Bootstrap classes instead of Tailwind (or mix both)
- No Server Components - all components are client-side
- Use standard React hooks and patterns
- Follow existing service layer architecture from `candidateService.js`
- Always use real API calls - no mock data fallback

---

**Version:** 1.0  
**Date:** December 2024  
**Author:** AI Assistant  
**Based on:** KANBAN_SPEC.md (adapted for React/React Router)

