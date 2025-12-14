import React from 'react';
import { Card } from 'react-bootstrap';
import { Candidate } from '../types/kanban.types';

interface CandidateCardProps {
    candidate: Candidate;
    onDragStart: (candidate: Candidate) => void;
    isDragging: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onDragStart, isDragging }) => {
    const filledCircles = Math.round(candidate.averageScore);
    const emptyCircles = 5 - filledCircles;

    const handleDragStart = (e: React.DragEvent) => {
        onDragStart(candidate);
    };

    return (
        <Card
            draggable={true}
            onDragStart={handleDragStart}
            className={`bg-white border rounded p-3 shadow-sm cursor-move mb-2 ${
                isDragging ? 'opacity-50' : ''
            }`}
            style={{
                cursor: 'move',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                if (!isDragging) {
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#0d6efd';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '';
            }}
        >
            <Card.Body className="p-0">
                <div className="mb-2">
                    <strong>{candidate.fullName}</strong>
                </div>
                <div className="d-flex gap-1 align-items-center">
                    {Array.from({ length: filledCircles }).map((_, index) => (
                        <div
                            key={`filled-${index}`}
                            className="rounded-circle"
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#22c55e',
                            }}
                        />
                    ))}
                    {Array.from({ length: emptyCircles }).map((_, index) => (
                        <div
                            key={`empty-${index}`}
                            className="rounded-circle"
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#d1d5db',
                            }}
                        />
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
};

export default CandidateCard;

