/**
 * Cloudflare Pages Function: /api/verify-upgrade
 * 
 * Verifies the signed HttpOnly cookie for the /upgrade and /downsell gating logic.
 * Returns the exact remaining seconds for the authentic countdown timer.
 */

import { verifyUpgradeToken } from './_crypto';

interface Env {
  COOKIE_SIGNING_KEY?: string;
}

// Helper to parse cookies from headers
function getCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const matches = header.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return matches ? decodeURIComponent(matches[1]) : null;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  const secretKey = env.COOKIE_SIGNING_KEY || 'hfi_default_dev_signing_key_replace_in_production_2026';
  const cookieHeader = request.headers.get('Cookie');
  const token = getCookie(cookieHeader, 'hfi_upgrade_token');

  if (!token) {
    return new Response(JSON.stringify({
      valid: false,
      reason: 'No upgrade token found'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const verification = await verifyUpgradeToken(token, secretKey);

  return new Response(JSON.stringify({
    valid: verification.valid,
    remainingSeconds: verification.remainingSeconds || 0,
    expiresAt: verification.payload?.expiresAt || 0,
    reason: verification.reason
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0'
    }
  });
};
