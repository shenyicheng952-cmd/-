const SUPABASE_ORIGIN = 'https://qzuhgflmtfzsoprevbwl.supabase.co'

export async function onRequest(context) {
  const upstreamUrl = new URL(context.request.url)
  upstreamUrl.protocol = 'https:'
  upstreamUrl.host = new URL(SUPABASE_ORIGIN).host
  upstreamUrl.pathname = upstreamUrl.pathname.replace(/^\/supabase(?=\/|$)/, '')

  return fetch(new Request(upstreamUrl, context.request))
}
