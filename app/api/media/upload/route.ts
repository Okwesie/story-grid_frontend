import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.error("Media upload: No authentication token found");
      return NextResponse.json(
        { success: false, message: "No authentication token found", data: null },
        { status: 401 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided", data: null },
        { status: 400 }
      );
    }
    
    // Convert file to base64 for sending to backend
    const buffer = await (file as File).arrayBuffer();
    const base64Data = `data:${(file as File).type};base64,${Buffer.from(buffer).toString('base64')}`;
    
    // Create the payload structure expected by backend
    const backendData = {
      file: base64Data,
      fileName: (file as File).name,
      // storyId is optional
    };
    
    console.log("Uploading media...", (file as File).name, (file as File).type);
    
    // Forward to backend media upload endpoint
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/media/upload`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: backendData }),
    });

    const result = await response.json();
    console.log("Backend media upload response:", result);
    
    // Return the result from the backend
    return NextResponse.json({
      success: result.status === 201,
      data: result.data,
      message: result.msg || "Media upload failed",
    });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload media", data: null },
      { status: 500 }
    );
  }
} 