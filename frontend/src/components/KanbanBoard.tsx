import React, { useState, useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import { InterviewStep, Candidate } from '../types/kanban.types';
import KanbanColumn from './KanbanColumn';
import { updateCandidateStage } from '../services/candidateService';

interface KanbanBoardProps {
    interviewSteps: InterviewStep[];
    initialCandidates: Candidate[];
    positionId: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
    interviewSteps,
    initialCandidates,
    positionId,
}) => {
    const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
    const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');

    const groupedCandidates = useMemo(() => {
        const grouped: { [stepName: string]: Candidate[] } = {};
        candidates.forEach((candidate) => {
            const stepName = candidate.currentInterviewStep;
            if (!grouped[stepName]) {
                grouped[stepName] = [];
            }
            grouped[stepName].push(candidate);
        });
        return grouped;
    }, [candidates]);

    const handleDragStart = (candidate: Candidate) => {
        setDraggedCandidate(candidate);
    };

    const handleDrop = async (stepName: string) => {
        if (!draggedCandidate) return;

        const targetStep = interviewSteps.find((step) => step.name === stepName);
        if (!targetStep) {
            setToastMessage('✕ Error: Etapa no encontrada');
            setToastVariant('danger');
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        // Don't update if dropped on the same stage
        if (draggedCandidate.currentInterviewStep === stepName) {
            setDraggedCandidate(null);
            return;
        }

        // Save previous state for rollback
        const previousCandidates = [...candidates];

        // Optimistic update
        const updatedCandidates = candidates.map((candidate) =>
            candidate.id === draggedCandidate.id
                ? { ...candidate, currentInterviewStep: stepName }
                : candidate
        );
        setCandidates(updatedCandidates);
        setDraggedCandidate(null);

        try {
            await updateCandidateStage(
                draggedCandidate.id,
                draggedCandidate.applicationId,
                targetStep.id
            );
            setToastMessage('✓ Candidato movido exitosamente');
            setToastVariant('success');
            setTimeout(() => setToastMessage(null), 3000);
        } catch (error) {
            // Revert on error
            setCandidates(previousCandidates);
            setToastMessage('✕ Error al mover candidato. Inténtalo nuevamente.');
            setToastVariant('danger');
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const sortedSteps = [...interviewSteps].sort((a, b) => a.orderIndex - b.orderIndex);

    return (
        <div>
            {toastMessage && (
                <Alert
                    variant={toastVariant}
                    dismissible
                    onClose={() => setToastMessage(null)}
                    className="mb-3"
                >
                    {toastMessage}
                </Alert>
            )}
            <div 
                className="d-flex flex-column flex-md-row gap-3 overflow-auto pb-3" 
                style={{ minHeight: '400px' }}
            >
                {sortedSteps.map((step) => (
                    <KanbanColumn
                        key={step.id}
                        step={step}
                        candidates={groupedCandidates[step.name] || []}
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;

