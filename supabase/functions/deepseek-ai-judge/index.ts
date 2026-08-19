import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY') || ''
    if (!deepseekApiKey) {
      return new Response(JSON.stringify({ error: 'Missing DEEPSEEK_API_KEY secret' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const {
      model = 'deepseek-v4-flash',
      payload = null,
    } = await req.json()

    if (!payload || typeof payload !== 'object') {
      return new Response(JSON.stringify({ error: 'Missing payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const messages = buildJudgeMessages(payload)

    const upstreamResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: { type: 'json_object' },
        stream: false,
        temperature: 0.2,
        max_tokens: 180,
      }),
    })

    const responseText = await upstreamResponse.text()

    return new Response(responseText, {
      status: upstreamResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function buildJudgeMessages(payload: Record<string, unknown>) {
  const cleanPayload = {
    word: typeof payload.word === 'string' ? payload.word.trim() : '',
    standardAnswers: typeof payload.standardAnswers === 'string' ? payload.standardAnswers.trim() : '',
    userAnswer: typeof payload.userAnswer === 'string' ? payload.userAnswer.trim() : '',
    normalizedUserAnswer: typeof payload.normalizedUserAnswer === 'string' ? payload.normalizedUserAnswer.trim() : '',
    localAnswers: Array.isArray(payload.localAnswers) ? payload.localAnswers : [],
    dictAnswers: Array.isArray(payload.dictAnswers) ? payload.dictAnswers : [],
    acceptedWordAnswers: Array.isArray(payload.acceptedWordAnswers) ? payload.acceptedWordAnswers : [],
  }

  return [
    {
      role: 'system',
      content:
        '你是一个严格但务实的英语单词中文释义判题助手。你只需要判断“用户中文答案”是否应当被接受为该英文单词的正确释义。只有在语义基本等价、常见中文表达差异、或非常接近的考试释义时才返回 correct；更宽泛、仅相关、上下位词、例句延伸义、一词多义里明显不对应的义项，都必须返回 incorrect。只输出 JSON，不要输出任何额外文字。JSON 结构固定为 {"verdict":"correct|incorrect","confidence":0到1的小数,"scope":"per_word|global_synonym","reason":"一句中文理由"}。',
    },
    {
      role: 'user',
      content: JSON.stringify(cleanPayload, null, 2),
    },
  ]
}
