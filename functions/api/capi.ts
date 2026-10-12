/**
 * Cloudflare Pages Function: /api/capi
 * 
 * Proxies funnel tracking events to Meta Conversions API (CAPI) using standard
 * Web Fetch and Web Crypto APIs (Workers runtime compatible, zero Node dependencies).
 * Deduplicates with browser Meta Pixel using the exact same event_id.
 */

interface Env {
  META_PIXEL_ID?: string;
  META_CAPI_TOKEN?: string;
  META_TEST_EVENT_CODE?: string;
}

// SHA-256 helper using native Web Crypto
async function sha256(text: string): Promise<string> {
  if (!text) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  try {
    const pixelId = env.META_PIXEL_ID;
    const capiToken = env.META_CAPI_TOKEN;

    // In local dev or unconfigured environments, gracefully acknowledge
    if (!pixelId || !capiToken) {
      return new Response(JSON.stringify({ 
        status: 'mock_acknowledged', 
        message: 'META_PIXEL_ID or META_CAPI_TOKEN not set in environment.' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json() as {
      event_name: string;
      event_id: string;
      event_time?: number;
      event_source_url?: string;
      custom_data?: Record<string, any>;
      user_data?: Record<string, any>;
    };

    const clientIp = request.headers.get('cf-connecting-ip') || 
                     request.headers.get('x-forwarded-for') || '';
    const userAgent = request.headers.get('user-agent') || '';

    // Build CAPI payload
    const capiUserData: Record<string, any> = {
      client_ip_address: clientIp,
      client_user_agent: userAgent
    };

    // If user provided email (e.g. from checkout redirect), hash it
    if (body.user_data?.email) {
      capiUserData.em = [await sha256(body.user_data.email)];
    }

    const payload: Record<string, any> = {
      data: [
        {
          event_name: body.event_name,
          event_time: body.event_time || Math.floor(Date.now() / 1000),
          event_id: body.event_id,
          event_source_url: body.event_source_url || 'https://herfirstincome.com',
          action_source: 'website',
          user_data: capiUserData,
          custom_data: body.custom_data || {}
        }
      ]
    };

    // If Meta test event code is configured in environment, append it
    if (env.META_TEST_EVENT_CODE) {
      payload.test_event_code = env.META_TEST_EVENT_CODE;
    }

    const metaApiUrl = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${capiToken}`;

    const metaResponse = await fetch(metaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const metaResult = await metaResponse.json();

    return new Response(JSON.stringify({
      success: metaResponse.ok,
      result: metaResult
    }), {
      status: metaResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'Failed to dispatch Meta CAPI event', 
      details: error?.message || String(error) 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
