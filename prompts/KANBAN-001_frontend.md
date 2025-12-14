# Frontend Implementation Plan: KANBAN-001 Position Detail Page with Kanban Board

## 1. Overview

This implementation plan covers the development of a position detail page featuring a Kanban board interface for managing candidates through different interview stages. The feature allows recruiters to visualize candidates in their current interview phase and update their status via drag-and-drop functionality.

**Frontend Architecture Principles:**
- **Component-Based Architecture**: Modular React components with clear separation of concerns
- **Service Layer Pattern**: Centralized API communication through service modules following existing `candidateService.js` patterns
- **React Router**: Client-side routing for navigation between positions list and detail pages
- **State Management**: Local state management using React hooks (useState, useEffect, useMemo)
- **Optimistic Updates**: Immediate UI updates with rollback on API failure
- **TypeScript**: Type-safe component development with interfaces matching API responses

## 2. Architecture Context

### Components/Services Involved

**New Components to Create:**
- `pages/PositionDetail.tsx` - Main page component that fetches and displays position data
- `components/KanbanBoard.tsx` - Container component managing drag-and-drop logic and candidate state
- `components/KanbanColumn.tsx` - Individual column representing an interview stage
- `components/CandidateCard.tsx` - Draggable card displaying candidate information

**Existing Components to Update:**
- `components/Positions.tsx` - Update "Ver proceso" button to navigate to detail page

**New Services to Create:**
- `services/positionService.js` - API methods for position-related operations

**Existing Services to Update:**
- `services/candidateService.js` - Add `updateCandidateStage` method

### Files Referenced

- `frontend/src/App.tsx` - Routing configuration
- `frontend/src/components/Positions.tsx` - Positions list component
- `frontend/src/services/candidateService.js` - Existing service pattern reference
- `ai-specs/ai-specs/changes/FRONTEND_KANBAN_SPEC.md` - Complete specification reference

### Routing Considerations

- **New Route**: `/positions/:id` - Position detail page
- **Route Integration**: Add route to `App.tsx` using React Router
- **Navigation**: Update Positions component to navigate to detail page

### State Management Approach

- **Local Component State**: useState for position data, candidates, loading, and error states
- **Optimistic Updates**: Update UI immediately, revert on API failure
- **Memoization**: useMemo for candidate grouping by interview stage
- **No Global State**: All state managed locally within components

## 3. Implementation Steps

### Step 0: Create Feature Branch

- **Action**: Create and switch to a new feature branch following the development workflow
- **Branch Naming**: `feature/KANBAN-001-frontend` (use actual ticket ID when available)
- **Implementation Steps**:
  1. Ensure you're on the latest `main` or `develop` branch (or appropriate base branch)
  2. Pull latest changes: `git pull origin [base-branch]`
  3. Create new branch: `git checkout -b feature/KANBAN-001-frontend`
  4. Verify branch creation: `git branch`
- **Notes**: This must be the FIRST step before any code changes. Refer to `ai-specs/specs/frontend-standards.mdc` section "Development Workflow" for specific branch naming conventions and workflow rules.

### Step 1: Create Position Service

- **File**: `frontend/src/services/positionService.js`
- **Action**: Create new service file following existing `candidateService.js` pattern
- **Function Signatures**:
  ```javascript
  export const getPositionInterviewFlow = async (positionId) => { ... }
  export const getPositionCandidates = async (positionId) => { ... }
  ```
- **Implementation Steps**:
  1. Create new file `frontend/src/services/positionService.js`
  2. Import axios: `import axios from 'axios';`
  3. Define base URL constant: `const API_BASE_URL = 'http://localhost:3010';`
  4. Implement `getPositionInterviewFlow`:
     - Endpoint: `GET ${API_BASE_URL}/position/${positionId}/interviewflow`
     - Use try/catch block
     - Throw error with Spanish message: `'Error al obtener el flujo de entrevistas:'`
     - Return `response.data`
  5. Implement `getPositionCandidates`:
     - Endpoint: `GET ${API_BASE_URL}/position/${positionId}/candidates`
     - Use try/catch block
     - Throw error with Spanish message: `'Error al obtener los candidatos:'`
     - Return `response.data`
  6. Export both functions
- **Dependencies**: `axios` (already in package.json)
- **Implementation Notes**:
  - Follow exact pattern from `candidateService.js`
  - Use hardcoded base URL (no environment variables)
  - Error messages in Spanish to match existing pattern
  - Handle error.response?.data for detailed error information

### Step 2: Update Candidate Service

- **File**: `frontend/src/services/candidateService.js`
- **Action**: Add `updateCandidateStage` method to existing service
- **Function Signature**:
  ```javascript
  export const updateCandidateStage = async (candidateId, applicationId, interviewStepId) => { ... }
  ```
- **Implementation Steps**:
  1. Open `frontend/src/services/candidateService.js`
  2. Add new function `updateCandidateStage`:
     - Endpoint: `PUT http://localhost:3010/candidates/${candidateId}`
     - Request body: `{ applicationId, currentInterviewStep: interviewStepId }`
     - Use try/catch block
     - Throw error with Spanish message: `'Error al actualizar la etapa del candidato:'`
     - Return `response.data`
  3. Export the new function
- **Dependencies**: `axios` (already imported)
- **Implementation Notes**:
  - Follow same error handling pattern as existing functions
  - `currentInterviewStep` in body must be a number (interview_step_id), not string
  - Use candidateId from API response in URL parameter

### Step 3: Create TypeScript Interfaces

- **File**: `frontend/src/types/kanban.types.ts` (create types directory if needed)
- **Action**: Define TypeScript interfaces for data models
- **Interfaces to Create**:
  ```typescript
  interface InterviewStep { ... }
  interface Candidate { ... }
  interface InterviewFlowApiResponse { ... }
  ```
- **Implementation Steps**:
  1. Create `frontend/src/types/` directory if it doesn't exist
  2. Create `kanban.types.ts` file
  3. Define `InterviewStep` interface:
     - id: number
     - interviewFlowId: number
     - interviewTypeId: number
     - name: string
     - orderIndex: number
  4. Define `Candidate` interface:
     - id: number
     - fullName: string
     - currentInterviewStep: string
     - averageScore: number
     - applicationId: number
  5. Define `InterviewFlowApiResponse` interface:
     - interviewFlow: { positionName: string, interviewFlow: { ... } }
  6. Export all interfaces
- **Dependencies**: None (TypeScript types only)
- **Implementation Notes**:
  - Match exact structure from API responses
  - Use English for all names and comments
  - These types will be used across all components

### Step 4: Create CandidateCard Component

- **File**: `frontend/src/components/CandidateCard.tsx`
- **Action**: Create draggable candidate card component
- **Component Signature**:
  ```typescript
  interface CandidateCardProps {
    candidate: Candidate;
    onDragStart: (candidate: Candidate) => void;
    isDragging: boolean;
  }
  ```
- **Implementation Steps**:
  1. Create `frontend/src/components/CandidateCard.tsx`
  2. Import React and types
  3. Import Bootstrap components: `Card` from 'react-bootstrap'
  4. Define `CandidateCardProps` interface
  5. Implement component:
     - Make card draggable: `draggable={true}`
     - Add `onDragStart` handler that calls `onDragStart(candidate)`
     - Display candidate `fullName`
     - Implement score visualization with 5 circles:
       - Calculate filled circles from `averageScore` (0-5)
       - Use Bootstrap `badge` or custom divs
       - Filled: green (`bg-success` or `#22c55e`)
       - Empty: gray (`bg-secondary` or `#d1d5db`)
       - Size: `h-3 w-3` or Bootstrap equivalent
       - **DO NOT show numeric score**
     - Apply dragging styles: `opacity-50` when `isDragging`
     - Add hover effects: `hover:shadow-md`, `hover:border-primary`
  6. Apply Bootstrap classes: `bg-white`, `border`, `rounded`, `p-3`, `shadow-sm`
  7. Add `cursor-move` class
- **Dependencies**: `react-bootstrap` (already in package.json)
- **Implementation Notes**:
  - Score circles: Round `averageScore` to nearest integer for filled circles
  - Example: 4.5 → 4 filled circles, 1 empty
  - Use Bootstrap utility classes for styling
  - Ensure card is visually distinct when dragging

### Step 5: Create KanbanColumn Component

- **File**: `frontend/src/components/KanbanColumn.tsx`
- **Action**: Create column component for interview stage
- **Component Signature**:
  ```typescript
  interface KanbanColumnProps {
    step: InterviewStep;
    candidates: Candidate[];
    onDrop: (stepName: string) => void;
    onDragStart: (candidate: Candidate) => void;
  }
  ```
- **Implementation Steps**:
  1. Create `frontend/src/components/KanbanColumn.tsx`
  2. Import React, types, and Bootstrap components
  3. Import `CandidateCard` component
  4. Define `KanbanColumnProps` interface
  5. Implement component:
     - Create column container with Bootstrap `Card` or custom div
     - Display column header with step name
     - Show candidate count badge: `badge bg-primary`
     - Implement drag handlers:
       - `onDragOver`: Prevent default, add visual indicator (border, background)
       - `onDrop`: Call `onDrop(step.name)`
       - `onDragLeave`: Remove visual indicator
     - Map candidates to `CandidateCard` components
     - Pass `onDragStart` to each card
  6. Apply Bootstrap classes:
     - Container: `bg-white`, `rounded`, `shadow-sm`, `p-3`
     - Header: `fw-semibold`, `text-secondary`, `mb-3`
     - Active drop zone: `border`, `border-2`, `border-dashed`, `border-primary`, `bg-primary`, `bg-opacity-10`
  7. Add responsive width: `flex-1`, `min-width: 280px`
- **Dependencies**: `react-bootstrap`, `CandidateCard` component
- **Implementation Notes**:
  - Visual indicator should be clear when dragging over column
  - Column should show all candidates for that stage
  - Use Bootstrap spacing utilities for layout

### Step 6: Create KanbanBoard Component

- **File**: `frontend/src/components/KanbanBoard.tsx`
- **Action**: Create main Kanban board container with drag-and-drop logic
- **Component Signature**:
  ```typescript
  interface KanbanBoardProps {
    interviewSteps: InterviewStep[];
    initialCandidates: Candidate[];
    positionId: string;
  }
  ```
- **Implementation Steps**:
  1. Create `frontend/src/components/KanbanBoard.tsx`
  2. Import React, hooks, types, and services
  3. Import `KanbanColumn` component
  4. Import `updateCandidateStage` from `candidateService`
  5. Define `KanbanBoardProps` interface
  6. Implement component with state:
     - `candidates`: useState<Candidate[]>(initialCandidates)
     - `draggedCandidate`: useState<Candidate | null>(null)
  7. Create `groupedCandidates` using `useMemo`:
     - Group candidates by `currentInterviewStep` (string name)
     - Return object: `{ [stepName: string]: Candidate[] }`
  8. Implement `handleDragStart`:
     - Set `draggedCandidate` to the candidate being dragged
  9. Implement `handleDrop`:
     - Find target step by name
     - Get step ID from `interviewSteps` array
     - Save previous candidates state
     - Update candidates state optimistically (update `currentInterviewStep` string)
     - Call `updateCandidateStage` API:
       - Use `draggedCandidate.id` for URL
       - Use `draggedCandidate.applicationId` for body
       - Use step `id` (number) for `currentInterviewStep` in body
     - On success: Show success toast/message
     - On error: Revert state, show error toast/message
  10. Sort `interviewSteps` by `orderIndex` before rendering
  11. Render columns:
     - Map over sorted `interviewSteps`
     - For each step, get candidates from `groupedCandidates[step.name]` or empty array
     - Render `KanbanColumn` with appropriate props
  12. Apply Bootstrap classes:
     - Container: `d-flex`, `gap-3`, `overflow-auto`, `pb-3`
     - Responsive: Horizontal scroll on mobile, full view on desktop
- **Dependencies**: `react-bootstrap`, `candidateService`, `KanbanColumn` component
- **Implementation Notes**:
  - Critical: Map step name (string) to step ID (number) for API call
  - Use optimistic updates for responsive UI
  - Handle API errors gracefully with state rollback
  - Toast notifications can use Bootstrap Alert or custom component

### Step 7: Create PositionDetail Page Component

- **File**: `frontend/src/pages/PositionDetail.tsx`
- **Action**: Create main page component that fetches data and renders Kanban board
- **Component Signature**: Uses React Router `useParams` hook
- **Implementation Steps**:
  1. Create `frontend/src/pages/` directory if it doesn't exist
  2. Create `frontend/src/pages/PositionDetail.tsx`
  3. Import React, hooks, React Router, Bootstrap components, and services
  4. Import `KanbanBoard` component
  5. Import types
  6. Implement component:
     - Use `useParams` to get `id` from route
     - Define state:
       - `positionName`: useState<string>('')
       - `interviewSteps`: useState<InterviewStep[]>([])
       - `candidates`: useState<Candidate[]>([])
       - `loading`: useState<boolean>(true)
       - `error`: useState<string | null>(null)
     - Create `useEffect` to fetch data on mount:
       - Set loading to true
       - Call `getPositionInterviewFlow(positionId)`:
         - Extract `positionName` from `response.interviewFlow.positionName`
         - Extract `interviewSteps` from `response.interviewFlow.interviewFlow.interviewSteps`
         - Handle nested response structure
       - Call `getPositionCandidates(positionId)`:
         - Set candidates state
       - Handle errors: Set error state, log error
       - Set loading to false in finally block
     - Render loading state: Bootstrap `Spinner` or loading message
     - Render error state: Bootstrap `Alert` with error message
     - Render main content:
       - Header with back arrow and position title:
         - Use `ArrowLeft` icon from `react-bootstrap-icons`
         - Use `useNavigate` to navigate back to `/positions`
         - Display `positionName` as heading
       - Render `KanbanBoard` with fetched data
  7. Apply Bootstrap classes:
     - Container: `Container`, `mt-4`
     - Background: `bg-light` or custom `#f8f9fa`
     - Header: `d-flex`, `align-items-center`, `mb-4`
     - Back button: `Button`, `variant="link"`, `p-0`, `me-3`
- **Dependencies**: `react-router-dom`, `react-bootstrap`, `react-bootstrap-icons`, `positionService`, `KanbanBoard` component
- **Implementation Notes**:
  - Handle API response structure: `{ interviewFlow: { positionName, interviewFlow: {...} } }`
  - Back arrow should be to the left of position title
  - Show appropriate loading and error states
  - Ensure proper cleanup in useEffect if needed

### Step 8: Update Positions Component

- **File**: `frontend/src/components/Positions.tsx`
- **Action**: Update "Ver proceso" button to navigate to position detail page
- **Implementation Steps**:
  1. Open `frontend/src/components/Positions.tsx`
  2. Import `useNavigate` from `react-router-dom`
  3. Add `useNavigate` hook in component
  4. Update "Ver proceso" button:
     - Add `onClick` handler: `() => navigate(\`/positions/${position.id}\`)`
     - Ensure `position` object has `id` property
     - If using mock data, add `id` to mock positions
  5. Test navigation works correctly
- **Dependencies**: `react-router-dom` (already in package.json)
- **Implementation Notes**:
  - Button should navigate to `/positions/:id` route
  - Ensure position objects have `id` property for navigation
  - Maintain existing button styling and layout

### Step 9: Update App Routing

- **File**: `frontend/src/App.tsx`
- **Action**: Add route for position detail page
- **Implementation Steps**:
  1. Open `frontend/src/App.tsx`
  2. Import React Router components: `BrowserRouter`, `Routes`, `Route` from `react-router-dom`
  3. Import `PositionDetail` component
  4. Wrap application in `BrowserRouter` (if not already)
  5. Add `Routes` component
  6. Add route: `<Route path="/positions/:id" element={<PositionDetail />} />`
  7. Ensure existing routes are preserved
  8. Test routing works correctly
- **Dependencies**: `react-router-dom` (already in package.json)
- **Implementation Notes**:
  - Route parameter `:id` will be available in `PositionDetail` via `useParams`
  - Ensure route is added before catch-all routes
  - Test navigation from Positions list to detail page

### Step 10: Add Toast/Notification System

- **File**: Create toast utility or use Bootstrap Alert
- **Action**: Implement notification system for drag-and-drop feedback
- **Implementation Options**:
  - Option A: Use Bootstrap Alert component (simpler, no new dependencies)
  - Option B: Create custom toast component
  - Option C: Use third-party library (if approved)
- **Implementation Steps** (Option A - Bootstrap Alert):
  1. In `KanbanBoard.tsx`, add state for toast: `toastMessage`, `toastVariant`
  2. Create toast display using Bootstrap `Alert`:
     - Show success: `variant="success"`, message: "✓ Candidato movido exitosamente"
     - Show error: `variant="danger"`, message: "✕ Error al mover candidato. Inténtalo nuevamente."
  3. Auto-dismiss after 3-5 seconds using `setTimeout`
  4. Position toast at top of page or within KanbanBoard
- **Dependencies**: `react-bootstrap` (already in package.json)
- **Implementation Notes**:
  - Toast messages in Spanish to match UI language
  - Auto-dismiss for better UX
  - Non-blocking notifications

### Step 11: Implement Responsive Design

- **Files**: All component files
- **Action**: Ensure mobile-responsive layout
- **Implementation Steps**:
  1. **Mobile (< 768px)**:
     - Update `KanbanBoard`: Change layout to vertical (stacked columns)
     - Use Bootstrap responsive utilities: `flex-column` on mobile
     - Each column takes full width
     - Reduce padding: `p-3` instead of `p-4`
  2. **Tablet (768px - 1024px)**:
     - Allow horizontal scroll if needed
     - Show 2 columns visible
  3. **Desktop (> 1024px)**:
     - Horizontal layout with all columns visible
     - Generous padding: `p-5`
  4. Test on different screen sizes
- **Dependencies**: Bootstrap responsive utilities
- **Implementation Notes**:
  - Use Bootstrap breakpoints: `sm`, `md`, `lg`
  - Mobile: Columns stacked vertically (full width each)
  - Desktop: Columns in horizontal row
  - Test with browser dev tools

### Step 12: Write Cypress E2E Tests

- **File**: `frontend/cypress/e2e/position-detail.cy.ts` (or `.js`)
- **Action**: Create end-to-end tests for position detail page
- **Test Cases**:
  1. Navigate to position detail page from positions list
  2. Verify position title is displayed
  3. Verify back arrow navigates to positions list
  4. Verify all interview stages are displayed as columns
  5. Verify candidates are displayed in correct columns
  6. Test drag-and-drop functionality:
     - Drag candidate from one column to another
     - Verify candidate appears in new column
     - Verify success message appears
  7. Test error handling (if API fails)
  8. Test responsive layout on mobile viewport
- **Implementation Steps**:
  1. Create test file in `cypress/e2e/` directory
  2. Set up test structure with `describe` and `it` blocks
  3. Mock API responses if needed
  4. Write test cases for each scenario
  5. Use Cypress commands: `visit`, `get`, `click`, `drag`, `drop`, `should`
  6. Test accessibility: Check ARIA labels, keyboard navigation
- **Dependencies**: `cypress` (already in package.json)
- **Implementation Notes**:
  - Follow existing Cypress test patterns in project
  - Mock API calls for consistent testing
  - Test both success and error scenarios
  - Verify UI updates correctly after drag-and-drop

### Step 13: Update Technical Documentation

- **Action**: Review and update technical documentation according to changes made
- **Implementation Steps**:
  1. **Review Changes**: Analyze all code changes made during implementation
  2. **Identify Documentation Files**: Determine which documentation files need updates:
     - API endpoint usage → Update `ai-specs/specs/api-spec.yml` (if frontend API patterns documented)
     - Component patterns → Update `ai-specs/specs/frontend-standards.mdc` (if new patterns established)
     - Routing changes → Document new route in appropriate location
  3. **Update Documentation**: For each affected file:
     - Update content in English (as per `documentation-standards.mdc`)
     - Maintain consistency with existing documentation structure
     - Ensure proper formatting
     - Document new components, services, and routes
  4. **Verify Documentation**: 
     - Confirm all changes are accurately reflected
     - Check that documentation follows established structure
     - Ensure examples match actual implementation
  5. **Report Updates**: Document which files were updated and what changes were made
- **References**: 
  - Follow process described in `ai-specs/specs/documentation-standards.mdc`
  - All documentation must be written in English
- **Notes**: This step is MANDATORY before considering the implementation complete. Do not skip documentation updates.

## 4. Implementation Order

1. **Step 0**: Create Feature Branch
2. **Step 1**: Create Position Service
3. **Step 2**: Update Candidate Service
4. **Step 3**: Create TypeScript Interfaces
5. **Step 4**: Create CandidateCard Component
6. **Step 5**: Create KanbanColumn Component
7. **Step 6**: Create KanbanBoard Component
8. **Step 7**: Create PositionDetail Page Component
9. **Step 8**: Update Positions Component
10. **Step 9**: Update App Routing
11. **Step 10**: Add Toast/Notification System
12. **Step 11**: Implement Responsive Design
13. **Step 12**: Write Cypress E2E Tests
14. **Step 13**: Update Technical Documentation

## 5. Testing Checklist

### Post-Implementation Verification

- [ ] **Service Layer**:
  - [ ] `positionService.js` methods work correctly
  - [ ] `candidateService.js` updateCandidateStage works correctly
  - [ ] Error handling works for API failures
  - [ ] Error messages are in Spanish

- [ ] **Components**:
  - [ ] CandidateCard displays candidate name and score correctly
  - [ ] Score circles render correctly (5 circles, correct filled/empty)
  - [ ] KanbanColumn displays candidates for correct stage
  - [ ] KanbanBoard groups candidates correctly
  - [ ] PositionDetail fetches and displays data correctly

- [ ] **Drag and Drop**:
  - [ ] Cards are draggable
  - [ ] Visual feedback during drag (opacity, cursor)
  - [ ] Drop works correctly
  - [ ] API call is made with correct parameters
  - [ ] Optimistic update works
  - [ ] State reverts on API failure
  - [ ] Success toast appears on success
  - [ ] Error toast appears on failure

- [ ] **Navigation**:
  - [ ] "Ver proceso" button navigates to detail page
  - [ ] Back arrow navigates to positions list
  - [ ] Position ID is correctly extracted from URL
  - [ ] Route works with different position IDs

- [ ] **Responsive Design**:
  - [ ] Mobile layout: Columns stacked vertically
  - [ ] Tablet layout: Appropriate column display
  - [ ] Desktop layout: All columns visible horizontally
  - [ ] Layout adapts correctly at breakpoints

- [ ] **Error Handling**:
  - [ ] Loading state displays while fetching
  - [ ] Error state displays on API failure
  - [ ] User-friendly error messages
  - [ ] No console errors

### Cypress E2E Test Coverage

- [ ] Navigation from positions list to detail page
- [ ] Position title display
- [ ] Back navigation
- [ ] Column display
- [ ] Candidate display in correct columns
- [ ] Drag-and-drop functionality
- [ ] Success/error notifications
- [ ] Responsive layout

### Component Functionality Verification

- [ ] All components render without errors
- [ ] Props are passed correctly
- [ ] State updates correctly
- [ ] Event handlers work
- [ ] Conditional rendering works (loading, error states)

### Error Handling Verification

- [ ] API errors are caught and handled
- [ ] User sees appropriate error messages
- [ ] Application doesn't crash on errors
- [ ] State is properly managed during errors

## 6. Error Handling Patterns

### Error State Management in Components

- **Loading State**: Show spinner or loading message while fetching data
- **Error State**: Display Bootstrap Alert with error message
- **Empty State**: Handle case when no candidates exist
- **API Errors**: Catch and display user-friendly messages in Spanish

### User-Friendly Error Messages

- **Spanish Messages**: All error messages in Spanish to match UI
- **Specific Messages**: 
  - "Error al obtener el flujo de entrevistas"
  - "Error al obtener los candidatos"
  - "Error al actualizar la etapa del candidato"
- **Toast Notifications**: Non-blocking error notifications

### API Error Handling in Services

- **Try/Catch Blocks**: All service methods use try/catch
- **Error Propagation**: Throw errors with descriptive messages
- **Error Details**: Include `error.response?.data` in error messages
- **Consistent Pattern**: Follow existing `candidateService.js` pattern

## 7. UI/UX Considerations

### Bootstrap Component Usage

- **Cards**: Use Bootstrap `Card` for candidate cards and columns
- **Buttons**: Use Bootstrap `Button` with appropriate variants
- **Badges**: Use Bootstrap `badge` for candidate counts
- **Alerts**: Use Bootstrap `Alert` for error/success messages
- **Icons**: Use `react-bootstrap-icons` for ArrowLeft icon
- **Spacing**: Use Bootstrap spacing utilities (`p-3`, `mb-4`, `gap-3`)

### Responsive Design Considerations

- **Mobile First**: Design for mobile, enhance for desktop
- **Breakpoints**: Use Bootstrap breakpoints (`sm`, `md`, `lg`)
- **Flexible Layout**: Use Bootstrap flex utilities
- **Horizontal Scroll**: Allow horizontal scroll on mobile if needed
- **Touch Targets**: Ensure drag-and-drop works on touch devices

### Accessibility Requirements

- **ARIA Labels**: Add aria-label to back button
- **Keyboard Navigation**: Ensure cards are keyboard accessible
- **Screen Readers**: Proper semantic HTML
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Ensure sufficient contrast ratios

### Loading States and Feedback

- **Loading Spinner**: Show while fetching data
- **Optimistic Updates**: Immediate UI feedback on drag-and-drop
- **Toast Notifications**: Success/error feedback
- **Visual Indicators**: Clear drag-and-drop visual feedback

## 8. Dependencies

### External Libraries and Tools

- **React 18.3.1**: Already in package.json
- **React Router DOM 6.23.1**: Already in package.json
- **React Bootstrap 2.10.2**: Already in package.json
- **React Bootstrap Icons 1.11.4**: Already in package.json
- **Axios**: Already in package.json (via existing services)
- **TypeScript 4.9.5**: Already in package.json

### React Bootstrap Components Used

- `Card` - For candidate cards and columns
- `Button` - For navigation buttons
- `Badge` - For candidate counts
- `Alert` - For error/success messages
- `Container` - For page layout
- `Spinner` - For loading states (optional)

### Third-Party Packages

- None required - all dependencies already in package.json

## 9. Notes

### Important Reminders and Constraints

- **No Mock Data**: Always use real API calls - no fallback to mock data
- **API Base URL**: Use hardcoded `http://localhost:3010` (following existing pattern)
- **Error Messages**: All error messages must be in Spanish
- **Code Language**: All code, comments, and documentation in English
- **TypeScript**: Use TypeScript for new components (`.tsx` files)
- **Service Pattern**: Follow exact pattern from `candidateService.js`

### Business Rules

- **Interview Steps**: Displayed in order by `orderIndex`
- **Candidate Grouping**: Grouped by `currentInterviewStep` (string name)
- **Score Display**: Show 5 circles, no numeric score
- **Drag-and-Drop**: Only between different stages
- **Optimistic Updates**: Update UI immediately, revert on failure

### Language Requirements

- **Code**: English (variables, functions, comments)
- **UI Text**: Spanish (button labels, messages, toasts)
- **Documentation**: English
- **Error Messages**: Spanish (matching existing pattern)

### TypeScript vs JavaScript Considerations

- **New Components**: Use TypeScript (`.tsx` files)
- **Services**: Use JavaScript (`.js` files) to match existing pattern
- **Types**: Define in separate `.ts` file
- **Interfaces**: Use TypeScript interfaces for props and data models

## 10. Next Steps After Implementation

### Post-Implementation Tasks

1. **Code Review**: Submit PR for code review
2. **Testing**: Run all tests (unit, integration, E2E)
3. **Linting**: Ensure code passes ESLint
4. **Type Checking**: Ensure TypeScript compiles without errors
5. **Documentation**: Complete documentation updates (Step 13)
6. **Integration Testing**: Test with backend API
7. **Performance Testing**: Verify no performance issues
8. **Accessibility Audit**: Verify accessibility requirements

### Integration Considerations

- **Backend API**: Ensure backend endpoints are available and working
- **CORS**: Verify CORS is configured correctly
- **Error Handling**: Test with actual API errors
- **Data Validation**: Verify API response structure matches expectations

## 11. Implementation Verification

### Final Verification Checklist

#### Code Quality
- [ ] Code follows project conventions
- [ ] No console errors or warnings
- [ ] ESLint passes without errors
- [ ] TypeScript compiles without errors
- [ ] Code is properly formatted
- [ ] Comments are clear and in English

#### Functionality
- [ ] All features work as specified
- [ ] Drag-and-drop works correctly
- [ ] API integration works
- [ ] Navigation works
- [ ] Error handling works
- [ ] Loading states work

#### Testing
- [ ] Unit tests pass (if applicable)
- [ ] Integration tests pass
- [ ] Cypress E2E tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing completed

#### Integration
- [ ] Backend API integration works
- [ ] No breaking changes to existing features
- [ ] Routes work correctly
- [ ] Service layer works correctly

#### Documentation Updates Completed
- [ ] API documentation updated (if applicable)
- [ ] Component documentation updated (if applicable)
- [ ] Routing documentation updated (if applicable)
- [ ] All changes documented in English
- [ ] Documentation follows project standards

---

**Version**: 1.0  
**Date**: December 2024  
**Based on**: `ai-specs/ai-specs/changes/FRONTEND_KANBAN_SPEC.md`

