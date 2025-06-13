
// Simple proxy server to handle CORS and API requests
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'https://palegoldenrod-dogfish-630246.hostingersite.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.json({ status: true, message: 'API Proxy server is running' });
});

// Test route for agent endpoint
app.get('/test-agent', (req, res) => {
  res.json({ status: true, message: 'Agent test endpoint is working' });
});

const API_BASE_URL = 'https://atoms-api.smallest.ai/api/v1';
// Use environment variable for API key with fallback for backward compatibility
const API_KEY = process.env.ATOMS_API_KEY || 'sk_d719bb865d2d4ccb826d0a883e5d614f';

// Proxy endpoint for user data
app.get('/api/proxy/user', async (req, res) => {
  try {
    console.log('Fetching user data from API...');
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy server error' });
  }
});

// Proxy endpoint for conversation data
app.get('/api/proxy/conversation/:id', async (req, res) => {
  try {
    console.log('Fetching conversation data for ID:', req.params.id);
    const response = await fetch(`${API_BASE_URL}/conversation/${req.params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy server error' });
  }
});

// Proxy endpoint for agent data - simplified to match user endpoint
app.get('/api/proxy/agent', async (req, res) => {
  try {
    console.log('Fetching agent data from API...');
    // Build query string if parameters exist
    const queryString = req.query && Object.keys(req.query).length > 0 
      ? '?' + new URLSearchParams(req.query).toString() 
      : '';
      
    const response = await fetch(`${API_BASE_URL}/agent${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error (agent):', error);
    res.status(500).json({ error: 'Proxy server error (agent)' });
  }
});

// Proxy endpoint for getting a single agent by ID
app.get('/api/proxy/agent/:id', async (req, res) => {
  try {
    console.log('Fetching agent data for ID:', req.params.id);
    const response = await fetch(`${API_BASE_URL}/agent/${req.params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error (get agent by ID):', error);
    res.status(500).json({ error: 'Proxy server error (get agent by ID)' });
  }
});

// Proxy endpoint for updating an agent by ID
app.patch('/api/proxy/agent/:id', async (req, res) => {
  try {
    console.log('Updating agent with ID:', req.params.id);
    console.log('Update payload:', req.body);
    
    const response = await fetch(`${API_BASE_URL}/agent/${req.params.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error (update agent):', error);
    res.status(500).json({ error: 'Proxy server error (update agent)' });
  }
});

// Proxy endpoint for creating a new agent
app.post('/api/proxy/agent', async (req, res) => {
  try {
    console.log('Creating new agent with data:', req.body);
    
    const response = await fetch(`${API_BASE_URL}/agent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error (create agent):', error);
    res.status(500).json({ error: 'Proxy server error (create agent)' });
  }
});

// Proxy endpoint for outbound calls
app.post('/api/proxy/conversation/outbound', async (req, res) => {
  try {
    const { agentId, phoneNumber } = req.body;
    
    // Validate required fields
    if (!agentId || !phoneNumber) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Both agentId and phoneNumber are required' 
      });
    }
    
    console.log(`Initiating outbound call to ${phoneNumber} with agent ${agentId}`);
    
    const response = await fetch(`${API_BASE_URL}/conversation/outbound`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId,
        phoneNumber
      }),
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', JSON.stringify(data, null, 2));
    
    // Enhance the response data with more identifiable fields
    const enhancedData = {
      ...data,
      // Make conversation ID more accessible
      conversationId: data?.data?._id || data?._id,
      callId: data?.data?.callId,
      status: 'initiated'
    };
    
    console.log('Enhanced response data:', JSON.stringify(enhancedData, null, 2));
    res.status(response.status).json(enhancedData);
  } catch (error) {
    console.error('Proxy error (outbound call):', error);
    res.status(500).json({ error: 'Proxy server error (outbound call)' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`API key is ${API_KEY.startsWith('sk_') ? 'configured' : 'missing - check .env file'}`);
});

