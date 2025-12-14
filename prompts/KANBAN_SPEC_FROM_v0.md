# Especificación: Página de Detalle de Posición con Kanban Board

## 1. Resumen Ejecutivo

Esta especificación describe la implementación de una página de detalle de posición que permite visualizar y gestionar candidatos mediante un tablero Kanban con funcionalidad drag-and-drop.

## 2. Arquitectura de Archivos

### 2.1 Estructura de Directorios
\`\`\`
app/
  └── positions/
      └── [id]/
          └── page.tsx          # Página principal (Server Component)
components/
  ├── kanban-board.tsx          # Componente principal del tablero (Client Component)
  ├── kanban-column.tsx         # Columna individual del Kanban
  └── candidate-card.tsx        # Tarjeta de candidato
\`\`\`

## 3. Modelos de Datos

### 3.1 InterviewStep
\`\`\`typescript
interface InterviewStep {
  id: number;
  name: string;
  orderIndex: number;
}
\`\`\`

### 3.2 Candidate
\`\`\`typescript
interface Candidate {
  id: number;
  fullName: string;
  currentInterviewStep: string;  // Nombre de la etapa actual
  averageScore: number;          // Valor entre 0-5
}
\`\`\`

### 3.3 Etapas del Proceso (en orden)
1. "Llamada telefónica"
2. "Entrevista técnica"
3. "Entrevista cultural"
4. "Entrevista Manager"

## 4. Componentes Detallados

### 4.1 app/positions/[id]/page.tsx

**Responsabilidad:** Server Component que obtiene datos iniciales y renderiza el layout principal.

**Props:**
- `params: { id: string }` - ID de la posición

**Funcionalidades:**
- Obtener flujo de entrevistas desde API o mock data
- Obtener candidatos desde API o mock data
- Renderizar header con botón de retorno
- Renderizar título de la posición
- Renderizar KanbanBoard con datos

**Estilos:**
- Fondo: `bg-[#f8f9fa]` (gris muy claro)
- Container: `min-h-screen`
- Header: Tarjeta blanca con sombra sutil (`shadow-sm`)
- Padding: `p-6` o `p-8`

**Mock Data (cuando NEXT_PUBLIC_API_URL no está configurado):**
\`\`\`typescript
// 4 etapas del proceso
const mockInterviewFlow = [
  { id: 1, name: "Llamada telefónica", orderIndex: 1 },
  { id: 2, name: "Entrevista técnica", orderIndex: 2 },
  { id: 3, name: "Entrevista cultural", orderIndex: 3 },
  { id: 4, name: "Entrevista Manager", orderIndex: 4 }
];

// 12 candidatos distribuidos entre las etapas
const mockCandidates = [
  // Llamada telefónica (3 candidatos)
  { id: 1, fullName: "María García", currentInterviewStep: "Llamada telefónica", averageScore: 4.5 },
  { id: 2, fullName: "Juan Pérez", currentInterviewStep: "Llamada telefónica", averageScore: 3.8 },
  { id: 3, fullName: "Ana Martínez", currentInterviewStep: "Llamada telefónica", averageScore: 4.2 },
  // Entrevista técnica (3 candidatos)
  { id: 4, fullName: "Carlos López", currentInterviewStep: "Entrevista técnica", averageScore: 4.7 },
  { id: 5, fullName: "Laura Sánchez", currentInterviewStep: "Entrevista técnica", averageScore: 3.5 },
  { id: 6, fullName: "Pedro Rodríguez", currentInterviewStep: "Entrevista técnica", averageScore: 4.0 },
  // Entrevista cultural (3 candidatos)
  { id: 7, fullName: "Isabel Torres", currentInterviewStep: "Entrevista cultural", averageScore: 4.8 },
  { id: 8, fullName: "Miguel Ángel Ruiz", currentInterviewStep: "Entrevista cultural", averageScore: 3.9 },
  { id: 9, fullName: "Carmen Fernández", currentInterviewStep: "Entrevista cultural", averageScore: 4.3 },
  // Entrevista Manager (3 candidatos)
  { id: 10, fullName: "Roberto Jiménez", currentInterviewStep: "Entrevista Manager", averageScore: 4.6 },
  { id: 11, fullName: "Patricia Morales", currentInterviewStep: "Entrevista Manager", averageScore: 4.1 },
  { id: 12, fullName: "Francisco Vargas", currentInterviewStep: "Entrevista Manager", averageScore: 3.7 }
];
\`\`\`

### 4.2 components/kanban-board.tsx

**Tipo:** Client Component (`"use client"`)

**Props:**
\`\`\`typescript
interface KanbanBoardProps {
  interviewFlow: InterviewStep[];
  initialCandidates: Candidate[];
  positionId: string;
}
\`\`\`

**Estado:**
\`\`\`typescript
const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
\`\`\`

**Funcionalidades Principales:**

1. **Agrupación de Candidatos por Etapa:**
   - Usar `useMemo` para agrupar candidatos por `currentInterviewStep`
   - Crear un objeto Map: `{ [stepName: string]: Candidate[] }`

2. **Drag and Drop:**
   - `handleDragStart`: Guardar candidato en estado `draggedCandidate`
   - `handleDrop`: 
     - Actualizar `currentInterviewStep` del candidato
     - Actualizar estado local inmediatamente (optimistic update)
     - Llamar API para persistir cambio
     - Si API falla, revertir al estado anterior
     - Mostrar toast con resultado

3. **Gestión de Toasts:**
   - Éxito: `toast({ title: "✓ Candidato movido", description: "...", duration: 3000 })`
   - Error: `toast({ title: "✕ Error", description: "...", variant: "destructive", duration: 5000 })`

4. **API Integration:**
   - Solo llamar API si `NEXT_PUBLIC_API_URL` está configurado
   - Endpoint: `PUT ${API_URL}/candidates/${candidateId}`
   - Body: `{ currentInterviewStep: newStepName }`
   - Si no hay API configurada, mantener cambios localmente

**Layout:**
- Container: `flex gap-4 overflow-x-auto pb-4`
- Responsive: Scroll horizontal en móvil, vista completa en desktop
- Min-width por columna: `min-w-[280px]`

### 4.3 components/kanban-column.tsx

**Tipo:** Client Component

**Props:**
\`\`\`typescript
interface KanbanColumnProps {
  step: InterviewStep;
  candidates: Candidate[];
  onDrop: (stepName: string) => void;
  onDragStart: (candidate: Candidate) => void;
}
\`\`\`

**Funcionalidades:**
- `onDragOver`: Prevenir comportamiento por defecto y mostrar indicador visual
- `onDrop`: Llamar callback `onDrop` con nombre de la etapa
- `onDragLeave`: Remover indicador visual

**Estilos:**
- Container: `bg-white rounded-lg shadow-sm p-4`
- Width: `flex-1 min-w-[280px]`
- Header: `font-semibold text-gray-700 mb-3`
- Badge: Mostrar cantidad de candidatos `bg-blue-100 text-blue-700`
- Drop zone activa: `border-2 border-dashed border-blue-400 bg-blue-50`

### 4.4 components/candidate-card.tsx

**Tipo:** Client Component

**Props:**
\`\`\`typescript
interface CandidateCardProps {
  candidate: Candidate;
  onDragStart: (candidate: Candidate) => void;
  isDragging: boolean;
}
\`\`\`

**Funcionalidades:**
- Draggable: `draggable={true}`
- `onDragStart`: Notificar al padre
- Mostrar nombre completo
- Mostrar score con círculos verdes

**Sistema de Score:**
- Total: 5 círculos
- Llenos: Verde (#22c55e / green-500)
- Vacíos: Gris (#d1d5db / gray-300)
- Tamaño: `h-3 w-3` (12px)
- Layout: `flex gap-1`
- **NO mostrar número del score**

**Estilos:**
- Container: `bg-white border border-gray-200 rounded-lg p-3 cursor-move`
- Shadow: `shadow-sm hover:shadow-md`
- Transition: `transition-all duration-200`
- Dragging: `opacity-50`
- Hover: `hover:border-blue-300`

**Ejemplo Visual:**
\`\`\`
┌─────────────────────┐
│ María García        │
│ ● ● ● ● ○          │ <- 4.5/5 = 4 círculos verdes llenos
└─────────────────────┘
\`\`\`

## 5. Diseño Visual

### 5.1 Paleta de Colores

**Backgrounds:**
- Página principal: `#f8f9fa` (gris muy claro)
- Tarjetas/Columnas: `#ffffff` (blanco)
- Hover estados: `#f3f4f6` (gris claro)

**Textos:**
- Primario: `#374151` (gray-700)
- Secundario: `#6b7280` (gray-500)
- Muted: `#9ca3af` (gray-400)

**Acentos:**
- Azul primario: `#3b82f6` (blue-500)
- Azul claro: `#dbeafe` (blue-100)
- Verde (score): `#22c55e` (green-500)
- Rojo (error): `#ef4444` (red-500)

**Bordes:**
- Default: `#e5e7eb` (gray-200)
- Hover: `#93c5fd` (blue-300)
- Drop zone: `#60a5fa` (blue-400)

### 5.2 Sombras
- Cards: `shadow-sm` (sutil)
- Cards hover: `shadow-md` (moderada)
- Header: `shadow-sm`

### 5.3 Tipografía
- Headers: `font-semibold text-lg` o `text-xl`
- Body: `text-sm` o `text-base`
- Muted: `text-xs text-gray-500`

### 5.4 Espaciado
- Padding tarjetas: `p-3` o `p-4`
- Gap entre columnas: `gap-4`
- Gap entre cards: `gap-2`
- Margin sections: `mb-4` o `mb-6`

## 6. Comportamiento de Drag & Drop

### 6.1 Estados Visuales

**1. Inicio del Drag:**
- Tarjeta arrastrada: `opacity-50`
- Cursor: `cursor-grabbing` (todo el documento)

**2. Hover sobre Columna:**
- Columna: Agregar borde azul discontinuo y fondo azul claro
- Indicador visual: "Soltar aquí"

**3. Drop Exitoso:**
- Tarjeta aparece inmediatamente en nueva columna
- Toast verde: "✓ Candidato movido exitosamente"
- Animación suave de transición

**4. Drop Fallido:**
- Tarjeta vuelve a columna original
- Toast rojo: "✕ Error al mover candidato. Inténtalo nuevamente."

### 6.2 Flujo de Datos

\`\`\`
1. Usuario arrastra tarjeta
   ↓
2. onDragStart: Guardar candidato en estado
   ↓
3. onDragOver: Mostrar indicador visual en columna destino
   ↓
4. onDrop: 
   a. Actualizar estado local (optimistic)
   b. Llamar API PUT
   c. Si éxito: Mantener cambio + toast éxito
   d. Si fallo: Revertir cambio + toast error
\`\`\`

### 6.3 Manejo de Estado

**Optimistic Update:**
\`\`\`typescript
// Guardar estado anterior
const previousCandidates = [...candidates];

// Actualizar inmediatamente (UI responsiva)
setCandidates(updatedCandidates);

try {
  // Intentar persistir en backend
  await updateCandidateAPI();
  toast({ title: "✓ Candidato movido", ... });
} catch (error) {
  // Revertir si falla
  setCandidates(previousCandidates);
  toast({ title: "✕ Error", variant: "destructive", ... });
}
\`\`\`

## 7. Integración con API

### 7.1 Variables de Entorno

\`\`\`bash
NEXT_PUBLIC_API_URL=https://tu-api.com/api
\`\`\`

### 7.2 Endpoints

**GET Interview Flow:**
\`\`\`
GET ${API_URL}/positions/${positionId}/interviewflow
Response: InterviewStep[]
\`\`\`

**GET Candidates:**
\`\`\`
GET ${API_URL}/applications/position/${positionId}
Response: Candidate[]
\`\`\`

**UPDATE Candidate Stage:**
\`\`\`
PUT ${API_URL}/candidates/${candidateId}
Body: { currentInterviewStep: string }
Response: { success: boolean }
\`\`\`

### 7.3 Manejo de Errores

- Timeout: 10 segundos
- Retry: No automático (usuario debe reintentar)
- Fallback: Mock data si API no disponible
- Toast: Mostrar errores al usuario

## 8. Navegación

### 8.1 Ruta
\`\`\`
/positions/[id]
\`\`\`

### 8.2 Navegación desde Lista
\`\`\`typescript
// En página de lista de posiciones
<Button onClick={() => router.push(`/positions/${position.id}`)}>
  Ver proceso
</Button>
\`\`\`

### 8.3 Botón de Retorno
\`\`\`typescript
// En página de detalle
<Button variant="ghost" onClick={() => router.back()}>
  <ArrowLeft className="h-4 w-4 mr-2" />
  Volver
</Button>
\`\`\`

## 9. Responsive Design

### 9.1 Mobile (< 768px)
- Columnas en scroll horizontal
- Width mínimo: 280px por columna
- Padding reducido: `p-4`
- Header compacto

### 9.2 Tablet (768px - 1024px)
- 2 columnas visibles
- Scroll para ver el resto

### 9.3 Desktop (> 1024px)
- 4 columnas visibles simultáneamente
- No scroll necesario
- Padding generoso: `p-8`

## 10. Accesibilidad

### 10.1 Keyboard Navigation
- Tab: Navegar entre tarjetas
- Enter/Space: Iniciar drag
- Arrow keys: Mover entre columnas
- Escape: Cancelar drag

### 10.2 Screen Readers
- Aria labels en botones y tarjetas
- Role="button" en elementos clickables
- Anuncios de cambios de estado

### 10.3 Contraste
- Ratio mínimo: 4.5:1 para texto normal
- Ratio mínimo: 3:1 para texto grande
- Verificar con herramientas de contraste

## 11. Performance

### 11.1 Optimizaciones
- `useMemo` para agrupación de candidatos
- Lazy loading de imágenes (si aplica)
- Debounce en búsquedas (futuro)
- Virtual scrolling para muchos candidatos (futuro)

### 11.2 Bundle Size
- Code splitting por ruta
- Importaciones dinámicas para componentes pesados
- Tree shaking habilitado

## 12. Testing (Recomendado)

### 12.1 Unit Tests
- Agrupación de candidatos por etapa
- Cálculo de score visual
- Validación de datos mock

### 12.2 Integration Tests
- Drag and drop entre columnas
- Llamadas a API
- Manejo de errores

### 12.3 E2E Tests
- Flujo completo de mover candidato
- Navegación entre páginas
- Estados de error

## 13. Dependencias Necesarias

\`\`\`json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "latest"
  }
}
\`\`\`

**Componentes UI (shadcn/ui):**
- Button
- Card
- Badge
- Toast/Toaster
- use-toast hook

## 14. Checklist de Implementación

- [ ] Crear estructura de carpetas
- [ ] Definir interfaces TypeScript
- [ ] Implementar página positions/[id]/page.tsx
- [ ] Crear componente kanban-board.tsx
- [ ] Crear componente kanban-column.tsx
- [ ] Crear componente candidate-card.tsx
- [ ] Implementar drag and drop
- [ ] Agregar mock data
- [ ] Implementar integración con API
- [ ] Agregar sistema de toasts
- [ ] Aplicar estilos visuales
- [ ] Implementar sistema de score con círculos
- [ ] Testing en diferentes navegadores
- [ ] Testing responsive
- [ ] Verificar accesibilidad
- [ ] Optimizar performance

## 15. Notas de Implementación

### 15.1 Consideraciones Importantes
- El componente debe funcionar sin API (con mock data)
- Los cambios persisten localmente hasta que API confirme
- Los toasts deben cerrarse automáticamente
- El drag debe sentirse fluido y responsivo

### 15.2 Posibles Mejoras Futuras
- Filtros por nombre de candidato
- Ordenamiento dentro de columnas
- Vista de detalle de candidato (modal)
- Comentarios en tarjetas
- Notificaciones en tiempo real
- Historial de movimientos
- Búsqueda y filtros avanzados
- Exportación a PDF/Excel

## 16. Ejemplo de Uso en Cursor

Para implementar esta spec en Cursor, puedes usar el siguiente prompt:

\`\`\`
Implementa una página de detalle de posición con tablero Kanban según las siguientes especificaciones:

1. Crea la ruta /positions/[id]/page.tsx con mock data de 4 etapas y 12 candidatos
2. Implementa drag-and-drop funcional entre columnas
3. Usa los siguientes colores: fondo #f8f9fa, tarjetas blancas, acentos azules
4. Sistema de score con 5 círculos verdes (sin número)
5. Toasts con mensajes en español para confirmación/error
6. Responsive con scroll horizontal en móvil

Las 4 etapas en orden son:
- Llamada telefónica
- Entrevista técnica
- Entrevista cultural
- Entrevista Manager

Usa optimistic updates y fallback a mock data si no hay API configurada.
\`\`\`

---

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Autor:** Sistema v0
