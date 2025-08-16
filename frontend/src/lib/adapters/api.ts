import { SessionSummary, SessionDetail, Comment, Appointment, PresignedUpload, ID } from '@/types';

export interface Api {
  listSessions(params?: { patientId?: ID }): Promise<SessionSummary[]>;
  getSession(id: ID): Promise<SessionDetail>;
  createSession(payload: SessionDetail): Promise<SessionDetail>;
  listComments(sessionId: ID): Promise<Comment[]>;
  createComment(sessionId: ID, payload: Omit<Comment,'id'|'createdAt'|'sessionId'>): Promise<Comment>;
  createAppointment(payload: Omit<Appointment,'id'>): Promise<Appointment>;
  presignUpload(payload: { filename: string; contentType: string }): Promise<PresignedUpload>;
}

// Mock API implementation
function mockApi(): Api {
  const mockSessions: SessionDetail[] = [
    {
      id: '1',
      patientId: 'patient1',
      exercise: 'Squat',
      startedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      endedAt: new Date(Date.now() - 86400000 + 300000).toISOString(), // +5 min
      avgScore: 85,
      flags: ['Keep chest up', 'Go deeper'],
      reps: 12,
      localOnly: true,
      repMetrics: [
        {
          repIndex: 1,
          tStart: 0,
          tEnd: 3000,
          angles: { hip: 45, knee: 95, torso: 12 },
          flags: ['Keep chest up'],
          score: 85
        },
        {
          repIndex: 2,
          tStart: 4000,
          tEnd: 7000,
          angles: { hip: 42, knee: 92, torso: 8 },
          flags: [],
          score: 95
        }
      ],
      notes: 'Good form overall, needs work on depth'
    },
    {
      id: '2',
      patientId: 'patient1',
      exercise: 'ShoulderAbduction',
      startedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      endedAt: new Date(Date.now() - 172800000 + 240000).toISOString(), // +4 min
      avgScore: 92,
      flags: ['Aim for symmetry'],
      reps: 15,
      localOnly: true,
      repMetrics: [
        {
          repIndex: 1,
          tStart: 0,
          tEnd: 2000,
          angles: { shoulder: 88, torso: 5 },
          flags: [],
          score: 95
        }
      ],
      notes: 'Excellent ROM, slight asymmetry noted'
    }
  ];

  const mockComments: Comment[] = [
    {
      id: '1',
      sessionId: '1',
      author: 'clinician',
      t: 1500,
      text: 'Good depth here, chest position improving',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      sessionId: '1',
      author: 'patient',
      t: 3500,
      text: 'Felt more stable on this rep',
      createdAt: new Date().toISOString()
    }
  ];

  return {
    async listSessions(params?: { patientId?: ID }): Promise<SessionSummary[]> {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (params?.patientId) {
        return mockSessions.filter(s => s.patientId === params.patientId);
      }
      return mockSessions;
    },

    async getSession(id: ID): Promise<SessionDetail> {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const session = mockSessions.find(s => s.id === id);
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    },

    async createSession(payload: SessionDetail): Promise<SessionDetail> {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const newSession = {
        ...payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      mockSessions.push(newSession);
      return newSession;
    },

    async listComments(sessionId: ID): Promise<Comment[]> {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return mockComments.filter(c => c.sessionId === sessionId);
    },

    async createComment(sessionId: ID, payload: Omit<Comment,'id'|'createdAt'|'sessionId'>): Promise<Comment> {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newComment: Comment = {
        ...payload,
        id: Date.now().toString(),
        sessionId,
        createdAt: new Date().toISOString()
      };
      
      mockComments.push(newComment);
      return newComment;
    },

    async createAppointment(payload: Omit<Appointment,'id'>): Promise<Appointment> {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        ...payload,
        id: Date.now().toString()
      };
    },

    async presignUpload(payload: { filename: string; contentType: string }): Promise<PresignedUpload> {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        uploadUrl: `https://mock-upload.example.com/${payload.filename}`,
        fileUrl: `https://mock-storage.example.com/${payload.filename}`
      };
    }
  };
}

// Real API implementation
function realApi(baseUrl: string): Api {
  return {
    async listSessions(params?: { patientId?: ID }): Promise<SessionSummary[]> {
      const url = new URL(`${baseUrl}/sessions`);
      if (params?.patientId) {
        url.searchParams.set('patientId', params.patientId);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json();
    },

    async getSession(id: ID): Promise<SessionDetail> {
      const response = await fetch(`${baseUrl}/sessions/${id}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      return response.json();
    },

    async createSession(payload: SessionDetail): Promise<SessionDetail> {
      const response = await fetch(`${baseUrl}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to create session');
      return response.json();
    },

    async listComments(sessionId: ID): Promise<Comment[]> {
      const response = await fetch(`${baseUrl}/sessions/${sessionId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },

    async createComment(sessionId: ID, payload: Omit<Comment,'id'|'createdAt'|'sessionId'>): Promise<Comment> {
      const response = await fetch(`${baseUrl}/sessions/${sessionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to create comment');
      return response.json();
    },

    async createAppointment(payload: Omit<Appointment,'id'>): Promise<Appointment> {
      const response = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to create appointment');
      return response.json();
    },

    async presignUpload(payload: { filename: string; contentType: string }): Promise<PresignedUpload> {
      const response = await fetch(`${baseUrl}/uploads/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to get presigned upload URL');
      return response.json();
    }
  };
}

export const api: Api = (process.env.NEXT_PUBLIC_API_MODE === 'real')
  ? realApi(process.env.NEXT_PUBLIC_API_BASE_URL || '/api')
  : mockApi();
