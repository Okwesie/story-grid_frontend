import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const reqData = await request.json();
    
    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get message data from request
    const { data } = reqData;
    
    if (!data || !data.conversationId || !data.content) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID and message content are required' },
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
    
    console.log(`Sending message to: ${apiEndpoint}`);
    console.log(`Conversation ID: ${data.conversationId}`);
    console.log(`Message content: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`);
    
    // Format payload according to backend expectations
    const payload = {
      data: {
        content: data.content
      }
    };
    
    console.log("Sending payload:", JSON.stringify(payload));
    
    const backendResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!backendResponse.ok) {
      // First get the response text
      const responseText = await backendResponse.text();
      console.error(`Failed to send message [${backendResponse.status}]: ${responseText}`);
      
      // Try to parse as JSON if possible
      let errorMessage = 'Failed to send message';
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
    console.log(`Message sent successfully. Response:`, responseData);
    
    return NextResponse.json({
      success: true,
      data: responseData.message || responseData.data?.message || {}
    });
  } catch (error) {
    console.error('Error in sendMessage API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 