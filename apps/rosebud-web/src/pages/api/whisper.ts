import OpenAI from 'openai'
import { TranscriptionCreateParams } from 'openai/resources/audio/transcriptions'
import { toFile } from 'openai'
import withStreamMiddleware, {
  NextAuthRequest,
} from 'middleware/withStreamMiddleware'
import { NextResponse } from 'next/server'

export const config = {
  runtime: 'edge',
  maxDuration: 300,
}

const handler = async (req: NextAuthRequest): Promise<Response> => {
  // Get audio file from request
  const { file, language } = (await req.json()) as {
    file: string
    language: string
  }

  if (!file) {
    return new NextResponse(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
    })
  }
  if (!language) {
    return new NextResponse(JSON.stringify({ error: 'No language provided' }), {
      status: 400,
    })
  }
  const buffer = Buffer.from(file.split(',')[1], 'base64')
  const blob = new Blob([buffer], { type: 'audio/mpeg' })
  const audioFile = await toFile(blob, 'audio.mp3')

  const openaiApi = new OpenAI()
  const model = 'whisper-1'
  const request: TranscriptionCreateParams = {
    model,
    file: audioFile,
    language,
    response_format: 'text',
  }
  const text = await openaiApi.audio.transcriptions.create(request)

  if (!text) {
    return new NextResponse(JSON.stringify({ error: 'No response from AI' }), {
      status: 500,
    })
  }

  return new NextResponse(JSON.stringify({ response: text }), {
    status: 200,
  })
}

export default withStreamMiddleware(handler)
