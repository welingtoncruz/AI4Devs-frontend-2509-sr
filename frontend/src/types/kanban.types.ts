export interface InterviewStep {
    id: number;
    interviewFlowId: number;
    interviewTypeId: number;
    name: string;
    orderIndex: number;
}

export interface Candidate {
    id: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
    applicationId: number;
}

export interface InterviewFlowApiResponse {
    interviewFlow: {
        positionName: string;
        interviewFlow: {
            interviewSteps: InterviewStep[];
        };
    };
}

