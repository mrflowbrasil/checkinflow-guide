// Quick signup edge function for landing page.
// Creates an auth user (email pre-confirmed) with a temporary password,
// triggers a welcome email containing the temp password, and returns
// the temp password to the client so it can sign in automatically.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function generateTempPassword(): string {
  // 16 chars: letters + digits + symbol — strong but human-readable
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%&*'
  const all = upper + lower + digits + symbols
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let out = ''
  out += upper[bytes[0] % upper.length]
  out += lower[bytes[1] % lower.length]
  out += digits[bytes[2] % digits.length]
  out += symbols[bytes[3] % symbols.length]
  for (let i = 4; i < bytes.length; i++) out += all[bytes[i] % all.length]
  return out
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 255
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) return json(500, { error: 'server_misconfigured' })

  let body: { name?: string; email?: string }
  try {
    body = await req.json()
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  const name = (body.name ?? '').toString().trim()
  const email = (body.email ?? '').toString().trim().toLowerCase()

  if (name.length < 2 || name.length > 80) return json(400, { error: 'invalid_name' })
  if (!isEmail(email)) return json(400, { error: 'invalid_email' })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

  // Check if user already exists (admin.listUsers supports email filter via getUserByEmail-style)
  // Use admin.listUsers with email — fall back to attempting createUser and catching duplicate.
  const tempPassword = generateTempPassword()
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: name, signup_source: 'lp_quick_signup' },
  })

  if (createError) {
    const msg = (createError.message || '').toLowerCase()
    if (
      msg.includes('already') ||
      msg.includes('registered') ||
      msg.includes('exists') ||
      msg.includes('duplicate')
    ) {
      return json(200, { status: 'exists' })
    }
    console.error('quick-signup createUser error', createError)
    return json(500, { error: 'signup_failed' })
  }

  if (!created?.user) {
    return json(500, { error: 'signup_failed' })
  }

  // Fire-and-forget welcome email with the temporary password.
  try {
    await admin.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'quick-signup-welcome',
        recipientEmail: email,
        idempotencyKey: `quick-signup-${created.user.id}`,
        templateData: {
          firstName: name.split(' ')[0],
          email,
          tempPassword,
          resetUrl: 'https://hub.mrflow.com.br/reset-password',
          appUrl: 'https://hub.mrflow.com.br/app',
        },
      },
    })
  } catch (e) {
    console.error('quick-signup welcome email failed (non-fatal)', e)
  }

  return json(200, {
    status: 'created',
    email,
    tempPassword,
  })
})
