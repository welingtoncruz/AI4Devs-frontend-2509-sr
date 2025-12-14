import React, { useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { InterviewStep, Candidate } from '../types/kanban.types';
import CandidateCard from './CandidateCard';

interface KanbanColumnProps {
    step: InterviewStep;
    candidates: Candidate[];
    onDrop: (stepName: string) => void;
    onDragStart: (candidate: Candidate) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ step, candidates, onDrop, onDragStart }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        onDrop(step.name);
    };

    return (
        <div
            className="w-100"
            style={{ minWidth: '280px', flex: '1 1 0' }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Card
                className={`bg-white rounded shadow-sm p-3 h-100 ${
                    isDragOver ? 'border border-2 border-dashed border-primary bg-primary bg-opacity-10' : ''
                }`}
            >
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-semibold text-secondary mb-0">{step.name}</h6>
                    <Badge bg="primary">{candidates.length}</Badge>
                </div>
                <div className="d-flex flex-column">
                    {candidates.map((candidate) => (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            onDragStart={onDragStart}
                            isDragging={false}
                        />
                    ))}
                    {candidates.length === 0 && (
                        <div className="text-muted text-center py-4" style={{ fontSize: '0.875rem' }}>
                            Sin candidatos
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default KanbanColumn;

