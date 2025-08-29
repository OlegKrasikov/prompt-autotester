import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "Unauthorized",
        userMessage: "Authentication required" 
      }, { status: 401 });
    }

    const body = await request.json();
    const { provider, apiKey } = body;

    if (!provider || !apiKey) {
      return NextResponse.json({ 
        error: "Missing required fields",
        userMessage: "Please provide both provider and API key" 
      }, { status: 400 });
    }

    // Only support OpenAI validation for now
    if (provider !== 'openai') {
      return NextResponse.json({ 
        error: "Unsupported provider",
        userMessage: "Only OpenAI key validation is supported currently" 
      }, { status: 400 });
    }

    // Basic API key format validation - don't send invalid keys to OpenAI
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      return NextResponse.json({ 
        error: "Invalid API key format",
        userMessage: "OpenAI API keys should start with 'sk-' and be at least 20 characters long",
        valid: false
      }, { status: 400 });
    }

    // Validate OpenAI API key by making a test request
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-nano',
          messages: [
            {
              role: 'user',
              content: 'Hello world'
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle different OpenAI API error codes
        switch (response.status) {
          case 401:
            return NextResponse.json({
              error: "Invalid API key",
              userMessage: "The API key is invalid or has been revoked. Please check your key and try again.",
              valid: false
            }, { status: 403 });
          
          case 403:
            return NextResponse.json({
              error: "API key forbidden",
              userMessage: "The API key doesn't have permission to access this model. Please check your account permissions.",
              valid: false
            }, { status: 403 });
          
          case 429:
            return NextResponse.json({
              error: "Rate limit exceeded",
              userMessage: "The API key has exceeded rate limits. The key appears to be valid but is currently rate limited.",
              valid: true,
              warning: "Rate limited"
            }, { status: 200 });
          
          case 500:
          case 502:
          case 503:
          case 504:
            return NextResponse.json({
              error: "OpenAI server error",
              userMessage: "OpenAI's servers are currently experiencing issues. Please try again later.",
              valid: null
            }, { status: 500 });
          
          default:
            return NextResponse.json({
              error: "API validation failed",
              userMessage: `OpenAI API returned an error: ${errorData.error?.message || 'Unknown error'}`,
              valid: false
            }, { status: 400 });
        }
      }

      // If we get here, the API key is valid
      const responseData = await response.json();
      
      return NextResponse.json({
        message: "API key is valid",
        userMessage: "✅ API key validated successfully!",
        valid: true,
        testResponse: responseData.choices?.[0]?.message?.content || "Test successful"
      }, { status: 200 });

    } catch (fetchError: unknown) {
      console.error("OpenAI API validation error:", fetchError);
      
      // Handle network errors
      if (fetchError && typeof fetchError === 'object' && 'code' in fetchError && 
          (fetchError.code === 'ENOTFOUND' || fetchError.code === 'ECONNREFUSED')) {
        return NextResponse.json({
          error: "Network error",
          userMessage: "Unable to connect to OpenAI's servers. Please check your internet connection.",
          valid: null
        }, { status: 500 });
      }
      
      return NextResponse.json({
        error: "Validation request failed",
        userMessage: "Failed to validate the API key due to a network error. Please try again.",
        valid: null
      }, { status: 500 });
    }

  } catch (error) {
    console.error("API key validation error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      userMessage: "Something went wrong during validation. Please try again." 
    }, { status: 500 });
  }
}