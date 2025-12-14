import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { getPositionInterviewFlow, getPositionCandidates } from '../services/positionService';
import { InterviewStep, Candidate, InterviewFlowApiResponse } from '../types/kanban.types';
import KanbanBoard from '../components/KanbanBoard';

const PositionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [positionName, setPositionName] = useState<string>('');
    const [interviewSteps, setInterviewSteps] = useState<InterviewStep[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setError('ID de posición no válido');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch interview flow
                const flowResponse: InterviewFlowApiResponse = await getPositionInterviewFlow(id);
                setPositionName(flowResponse.interviewFlow.positionName);
                setInterviewSteps(flowResponse.interviewFlow.interviewFlow.interviewSteps);

                // Fetch candidates
                const candidatesResponse = await getPositionCandidates(id);
                setCandidates(candidatesResponse);
            } catch (err: any) {
                const errorMessage = err.message || 'Error al cargar los datos de la posición';
                setError(errorMessage);
                console.error('Error fetching position data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <Container className="mt-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={() => navigate('/positions')}>
                        Volver a posiciones
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '1rem' }}>
            <div className="d-flex align-items-center mb-4">
                <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => navigate('/positions')}
                    aria-label="Volver a posiciones"
                    style={{ border: 'none', background: 'none' }}
                >
                    <ArrowLeft size={24} />
                </Button>
                <h2 className="mb-0" style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)' }}>{positionName}</h2>
            </div>
            <KanbanBoard
                interviewSteps={interviewSteps}
                initialCandidates={candidates}
                positionId={id || ''}
            />
        </Container>
    );
};

export default PositionDetail;

