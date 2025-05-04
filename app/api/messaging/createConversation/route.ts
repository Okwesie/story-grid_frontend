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
    
    // Get conversation data from request
    const { data } = reqData;
    
    console.log("Received request data:", JSON.stringify(reqData));
    console.log("Extracted data field:", data ? JSON.stringify(data) : "undefined");
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Missing data object in request' },
        { status: 400 }
      );
    }
    
    if (!data.participants) {
      return NextResponse.json(
        { success: false, error: 'Missing participants field in data' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(data.participants)) {
      return NextResponse.json(
        { success: false, error: 'Participants must be an array' },
        { status: 400 }
      );
    }
    
    if (data.participants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one participant is required' },
        { status: 400 }
      );
    }
    
    // If it's a group chat, ensure it has a name
    if (data.isGroupChat && !data.name) {
      return NextResponse.json(
        { success: false, error: 'Group chats must have a name' },
        { status: 400 }
      );
    }
    
    // Forward request to the actual backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Remove trailing slash if present
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    
    // Check if baseUrl already includes /api to avoid duplication
    const apiEndpoint = baseUrl.endsWith('/api') 
      ? `${baseUrl}/conversations`
      : `${baseUrl}/api/conversations`;
    
    console.log(`Creating conversation with endpoint: ${apiEndpoint}`);
    console.log("Participants:", JSON.stringify(data.participants));
    
    // Format the request based on the backend API requirements
    // Try different structure - move participants to root level since that might be what the API expects
    const payload = {
      participants: data.participants,
      isGroupChat: data.isGroupChat || false,
      name: data.name || '',
      initialMessage: data.initialMessage || ''
    };
    
    console.log("Sending modified payload:", JSON.stringify(payload));
    
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
      console.error('Conversation creation failed:', responseText);
      
      // Try to parse as JSON if possible
      let errorMessage = 'Failed to create conversation';
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
    console.log('Conversation created successfully:', responseData);
    
    // Ensure we return data in a format that the frontend can properly access
    // The frontend expects either data.id or data.conversation.id
    return NextResponse.json({
      success: true,
      data: {
        id: responseData.data?.id,
        conversation: responseData.data,
        ...responseData.data
      }
    });
  } catch (error) {
    console.error('Error in createConversation API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
} 