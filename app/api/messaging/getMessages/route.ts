import { NextResponse } from 'next/server';

// Use fixed date values to prevent hydration errors
const ONE_DAY_AGO = '2023-07-14T10:00:00Z';
const ONE_DAY_AGO_MINUS_1HR = '2023-07-14T09:00:00Z';
const ONE_DAY_AGO_MINUS_2HR = '2023-07-14T08:00:00Z';
const ONE_DAY_AGO_MINUS_3HR = '2023-07-14T07:00:00Z';
const THREE_HOURS_AGO = '2023-07-15T07:00:00Z';

export async function POST(request: Request) {
  try {
    const reqData = await request.json();
    
    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get conversation ID from request
    const { data } = reqData;
    
    if (!data || !data.conversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }
    
    // Get token from Authorization header
    const token = authHeader.split(' ')[1];
    
    // Forward request to the actual backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Remove trailing slash if present
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    
    // Check if baseUrl already includes /api to avoid duplication
    const apiEndpoint = baseUrl.endsWith('/api') 
      ? `${baseUrl}/conversations/${data.conversationId}/messages`
      : `${baseUrl}/api/conversations/${data.conversationId}/messages`;
    
    console.log(`Fetching messages from: ${apiEndpoint}`);
    console.log(`Conversation ID: ${data.conversationId}`);
    
    const backendResponse = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!backendResponse.ok) {
      // First get the response text
      const responseText = await backendResponse.text();
      console.error(`Failed to fetch messages [${backendResponse.status}]: ${responseText}`);
      
      // Try to parse as JSON if possible
      let errorMessage = 'Failed to fetch messages';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.msg) {
          errorMessage = errorData.msg;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If we can't parse the JSON, use the response text itself
        if (responseText) {
          errorMessage = responseText;
        }
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: backendResponse.status }
      );
    }
    
    const responseData = await backendResponse.json();
    
    // Try to extract messages from different possible response formats
    let messages = [];
    if (Array.isArray(responseData)) {
      messages = responseData;
    } else if (responseData.messages && Array.isArray(responseData.messages)) {
      messages = responseData.messages;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      messages = responseData.data;
    } else if (responseData.data && responseData.data.messages && Array.isArray(responseData.data.messages)) {
      messages = responseData.data.messages;
    }
    
    console.log(`Retrieved ${messages.length} messages. Response format:`, 
      messages.length > 0 ? 
        `First message sample: ${JSON.stringify(messages[0])}` : 
        'No messages'
    );
    
    return NextResponse.json({
      success: true,
      data: {
        messages: messages
      }
    });
  } catch (error) {
    console.error('Error in getMessages API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
} 