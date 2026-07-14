# Supabase Edge Function: maimemo-proxy

这个函数将作为中转代理，解决浏览器直接调用墨墨 API 时的 CORS 跨域问题，并确保 `Authorization` 请求头不会被丢弃。

## 部署步骤

1. 在本地安装 Supabase CLI: `npm install -g supabase`
2. 登录 Supabase: `supabase login`
3. 初始化项目 (如果还没做): `supabase init`
4. 创建函数: `supabase functions new maimemo-proxy`
5. 将下面的代码复制到 `supabase/functions/maimemo-proxy/index.ts` 中。
6. 部署函数: `supabase functions deploy maimemo-proxy --project-ref iebdkqswcyuyqsusmocn`

## 函数代码 (index.ts)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 处理预检请求 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    const authHeader = req.headers.get('Authorization')

    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing target URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Proxying request to: ${url}`)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    const data = await response.text()

    return new Response(data, {
      status: response.status,
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
```
