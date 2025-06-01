
const API_BASE_URL = '/api/proxy';
const API_KEY = 'sk_838fd2ac51c4cca2f21afd84f40de303';

// Common HTTP request handler
async function makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  console.log(`Making ${options.method || 'GET'} request to ${url}`);
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}):`, errorText);
    throw new Error(`API Error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
  }
  
  const data = await response.json();
  return data;
}

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  authProvider: string;
  isEmailVerified: boolean;
  organizationId: string;
}

interface Agent {
  _id: string;
  name: string;
  description?: string;
  language?: {
    enabled: string; // 'en', 'es', etc.
    switching: boolean;
    synthesizer?: {
      voiceConfig?: {
        model: string; // 'waves', 'waves_lightning_large', 'waves_lightning_large_voice_clone'
        voiceId?: string;
        gender?: 'male' | 'female';
      };
      speed?: number;
      consistency?: number;
      similarity?: number;
      enhancement?: number;
    };
    speed?: number;
    consistency?: number;
    similarity?: number;
    enhancement?: number;
  };
  globalKnowledgeBaseId?: string;
  slmModel?: string;
  defaultVariables?: Record<string, any>;
  globalPrompt?: string;
  telephonyProductId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ConversationData {
  _id: string;
  callId: string;
  agent: {
    _id: string;
    name: string;
    description: string;
    organization: string;
    workflowId: string;
    createdBy: string;
    globalKnowledgeBaseId: string;
    language: {
      enabled: string;
      switching: boolean;
      supported: string[];
    };
    synthesizer: {
      voiceConfig: {
        model: string;
        voiceId: string;
        gender: string;
      };
      speed: number;
      consistency: number;
      similarity: number;
      enhancement: number;
    };
    slmModel: string;
    defaultVariables: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  };
  status: string;
  duration: number;
  recordingUrl: string;
  from: string;
  to: string;
  transcript: any[];
  average_transcriber_latency: number;
  average_agent_latency: number;
  average_synthesizer_latency: number;
  type: string;
}

export interface AgentPayload {
  name: string;
  description?: string;
  language?: {
    enabled: string;
    switching: boolean;
    synthesizer?: {
      voiceConfig?: {
        model: string;
        voiceId?: string;
        gender?: 'male' | 'female';
      };
      speed?: number;
      consistency?: number;
      similarity?: number;
      enhancement?: number;
    };
    speed?: number;
    consistency?: number;
    similarity?: number;
    enhancement?: number;
  };
  globalKnowledgeBaseId?: string;
  slmModel?: string;
  defaultVariables?: Record<string, any>;
  globalPrompt?: string;
  telephonyProductId?: string;
}

// For updates, all fields are optional
export interface UpdateAgentPayload extends Partial<AgentPayload> {}

export const fetchUserData = async (): Promise<ApiResponse<UserData>> => {
  console.log('Fetching user data...');
  
  const data = await makeRequest<ApiResponse<UserData>>(`${API_BASE_URL}/user`);
  console.log('User data received:', data);
  return data;
};

export const fetchConversationData = async (conversationId: string): Promise<ApiResponse<any>> => {
  if (!conversationId.trim()) {
    throw new Error('Conversation ID is required');
  }
  return makeRequest(`${API_BASE_URL}/conversation/${conversationId}`, { method: 'GET' });
};

export const fetchConversations = async (params: { page?: number, offset?: number } = {}): Promise<ApiResponse<any[]>> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  
  const queryString = queryParams.toString();
  return makeRequest(`${API_BASE_URL}/conversation${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
};

export const makeOutboundCall = async (payload: { agentId: string, phoneNumber: string }): Promise<ApiResponse<any>> => {
  return makeRequest(`${API_BASE_URL}/conversation/outbound`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const checkCallStatus = async (callId: string): Promise<ApiResponse<any>> => {
  if (!callId.trim()) {
    throw new Error('Call ID is required');
  }
  return makeRequest(`${API_BASE_URL}/telephony/call/${callId}`, { method: 'GET' });
};

// Define the actual agents response structure that matches the backend response
interface AgentsResponse {
  agents: Agent[];
}

export const fetchAgentsData = async (params: { page?: number, offset?: number, search?: string } = {}): Promise<ApiResponse<AgentsResponse>> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  if (params.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  console.log(`Fetching agents data with params: ${queryString}`);
  
  const data = await makeRequest<ApiResponse<AgentsResponse>>(`${API_BASE_URL}/agent${queryString ? `?${queryString}` : ''}`);
  console.log('Agents data received:', data);
  return data;
};

export const fetchAgentById = async (agentId: string): Promise<ApiResponse<Agent>> => {
  console.log(`Fetching agent data for ID: ${agentId}`);
  
  const data = await makeRequest<ApiResponse<Agent>>(`${API_BASE_URL}/agent/${agentId}`);
  console.log('Agent data received:', data);
  return data;
};

export const updateAgent = async (agentId: string, payload: UpdateAgentPayload): Promise<ApiResponse<Agent>> => {
  console.log(`Updating agent with ID: ${agentId}`, payload);
  
  const data = await makeRequest<ApiResponse<Agent>>(`${API_BASE_URL}/agent/${agentId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  
  console.log('Agent updated successfully:', data);
  return data;
};

export const createAgent = async (payload: AgentPayload): Promise<ApiResponse<Agent>> => {
  console.log(`Creating new agent with data:`, payload);
  
  const data = await makeRequest<ApiResponse<Agent>>(`${API_BASE_URL}/agent`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  console.log('Agent created successfully:', data);
  return data;
};
