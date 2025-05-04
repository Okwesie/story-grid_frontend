import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const reqData = await request.json();
    
    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get token from Authorization header
    const token = authHeader.split(' ')[1];
    
    // Forward request to the actual backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Remove trailing slash if present
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    
    // Check if baseUrl already includes /api to avoid duplication
    const apiEndpoint = baseUrl.endsWith('/api') 
      ? `${baseUrl}/conversations`
      : `${baseUrl}/api/conversations`;
    
    console.log(`Fetching conversations from: ${apiEndpoint}`);
    
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
      console.error(`Failed to fetch conversations [${backendResponse.status}]: ${responseText}`);
      
      // Try to parse as JSON if possible
      let errorMessage = 'Failed to fetch conversations';
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
    
    // Try to extract conversations from different possible response formats
    let conversations = [];
    if (Array.isArray(responseData)) {
      conversations = responseData;
    } else if (responseData.conversations && Array.isArray(responseData.conversations)) {
      conversations = responseData.conversations;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      conversations = responseData.data;
    } else if (responseData.data && responseData.data.conversations && Array.isArray(responseData.data.conversations)) {
      conversations = responseData.data.conversations;
    }
    
    console.log(`Retrieved ${conversations.length} conversations. Response format:`,
      conversations.length > 0 ?
        `First conversation sample: ${JSON.stringify(conversations[0])}` :
        'No conversations'
    );
    
    return NextResponse.json({
      success: true,
      data: {
        conversations: conversations
      }
    });
  } catch (error) {
    console.error('Error in getConversations API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
} 