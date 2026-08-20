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
        thinking: { type: 'disabled' },
        response_format: { type: 'json_object' },
        stream: false,
        temperature: 0.2,
        max_tokens: 220,
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
        '你是一个严格但务实的英语单词中文释义判题助手。你只需要判断“用户中文答案”是否应当被接受为该英文单词的正确释义。若用户答案与标准释义语义基本等价，或只是自然中文改写、口语表达、轻微修饰、不改变核心义项的具体化表达，应返回 correct。例如“最终决定”相对“决定”，“把零件拼装起来”相对“组装”，“长得像”相对“与…相似”，通常都应视为可接受。只有在义项明显不对应、语义偏离较大、只是相关联想、上下位关系差异明显、或跨到另一层常见义项时，才返回 incorrect。只输出 JSON，不要输出任何额外文字。JSON 结构固定为 {"verdict":"correct|incorrect","confidence":0到1的小数,"scope":"per_word|global_synonym","reason":"一句中文理由"}。',
    },
    {
      role: 'user',
      content: JSON.stringify(cleanPayload, null, 2),
    },
  ]
}
