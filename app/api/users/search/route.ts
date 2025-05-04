import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const reqData = await request.json();
    console.log("Received search request:", reqData);
    
    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("Unauthorized request - missing or invalid Authorization header");
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get token from Authorization header
    const token = authHeader.split(' ')[1];
    
    // Get search query from request
    const { data } = reqData;
    
    if (!data || !data.query) {
      console.log("Invalid request - missing query parameter");
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    console.log(`Searching for users with query: "${data.query}"`);
    
    // Call API with token
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Remove trailing slash if present
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    
    // Check if baseUrl already includes /api to avoid duplication
    const apiEndpoint = baseUrl.endsWith('/api') 
      ? `${baseUrl}/users?search=${encodeURIComponent(data.query)}`
      : `${baseUrl}/api/users?search=${encodeURIComponent(data.query)}`;
    
    console.log(`Calling backend API: ${apiEndpoint}`);
    
    const backendResponse = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Backend response status: ${backendResponse.status}`);
    
    if (!backendResponse.ok) {
      let errorMessage = `Failed to search users: ${backendResponse.statusText}`;
      try {
        const errorData = await backendResponse.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Ignore JSON parsing errors for error response
      }
      
      console.error(errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: backendResponse.status }
      );
    }
    
    const responseData = await backendResponse.json();
    console.log("Backend response data:", responseData);
    
    // Extract users from the response, handling different response formats
    let users = [];
    
    if (Array.isArray(responseData)) {
      users = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      users = responseData.data;
    } else if (responseData.users && Array.isArray(responseData.users)) {
      users = responseData.users;
    } else if (responseData.data?.users && Array.isArray(responseData.data.users)) {
      users = responseData.data.users;
    }
    
    console.log(`Found ${users.length} users`);
    
    return NextResponse.json({
      success: true,
      data: {
        users: users
      }
    });
  } catch (error) {
    console.error('Error in users search API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search users' },
      { status: 500 }
    );
  }
} 