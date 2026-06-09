import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface ChatRequest {
  message: string
  conversationHistory?: Array<{
    role: 'user' | 'model'
    parts: [{ text: string }]
  }>
}

interface ChatResponse {
  response: string
  error?: never
}

interface ErrorResponse {
  error: string
  response?: never
}

const SYSTEM_INSTRUCTION = `You are ClaimDefender Core AI, a precise legal text analyst specializing in insurance denial analysis and structural handbook evaluation. Your primary functions include:

1. Analyzing insurance policy documents for coverage gaps and regulatory violations
2. Identifying specific policy sections that contradict denial letters
3. Providing evidence-based legal arguments for insurance appeals
4. Citing relevant insurance codes and regulations
5. Structuring professional appeal letter content

Guidelines for responses:
- Provide specific, actionable legal analysis
- Reference policy sections and insurance codes when applicable
- Focus on factual, evidence-based arguments
- Maintain professional legal terminology
- Avoid speculative or emotional language
- Structure responses clearly with numbered points when appropriate

Respond only with insurance-related legal analysis. Do not provide general legal advice outside of insurance claim disputes.`

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse | ErrorResponse>> {
  try {
    // Validate environment configuration
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not configured')
      return NextResponse.json(
        { error: "Internal Server Processing Exception" },
        { status: 500 }
      )
    }

    // Parse and validate request body
    const body: ChatRequest = await request.json()
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      )
    }

    // Sanitize input message
    const sanitizedMessage = body.message.trim().substring(0, 10000) // Limit to 10k chars
    if (sanitizedMessage.length === 0) {
      return NextResponse.json(
        { error: "Empty message content" },
        { status: 400 }
      )
    }

    // Initialize Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      systemInstruction: SYSTEM_INSTRUCTION
    })

    // Prepare conversation history
    const history = body.conversationHistory || []
    
    // Start chat session with history
    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.3, // Lower temperature for more focused, legal responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    })

    // Send message and get response
    const result = await chat.sendMessage(sanitizedMessage)
    const response = await result.response
    const responseText = response.text()

    if (!responseText || responseText.trim().length === 0) {
      return NextResponse.json(
        { error: "Empty response from AI model" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      response: responseText.trim()
    })

  } catch (error) {
    // Log error securely without exposing sensitive details
    console.error('Gemini API error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })

    // Return generic error response
    return NextResponse.json(
      { error: "Internal Server Processing Exception" },
      { status: 500 }
    )
  }
}

// Ensure only POST requests are accepted
export async function GET(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}

export async function PUT(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}

export async function DELETE(): Promise<NextResponse<ErrorResponse>> {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}
