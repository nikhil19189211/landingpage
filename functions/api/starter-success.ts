/**
 * Cloudflare Pages Function: /api/starter-success
 * 
 * Post-purchase redirect destination for Starter tier buyers.
 * Sets a cryptographically signed HttpOnly cookie valid for upgradeOfferWindowHours (default 24h),
 * then redirects the buyer to /upgrade.
 */

import { signUpgradeToken, TokenPayload } from './_crypto';

interface Env {
  COOKIE_SIGNING_KEY?: string;
  UPGRADE_WINDOW_HOURS?: string;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Signing key from environment or fallback default for local preview
  const secretKey = env.COOKIE_SIGNING_KEY || 'hfi_default_dev_signing_key_replace_in_production_2026';
  const windowHours = parseInt(env.UPGRADE_WINDOW_HOURS || '24', 10);
  const now = Math.floor(Date.now() / 1000);
  const maxAgeSeconds = windowHours * 3600;
  const expiresAt = now + maxAgeSeconds;

  // Build payload
  const payload: TokenPayload = {
    issuedAt: now,
    expiresAt: expiresAt,
    starterProductId: url.searchParams.get('product_id') || 'prod_starter_17'
  };

  // Sign token using Web Crypto HMAC-SHA256
  const token = await signUpgradeToken(payload, secretKey);

  // Preserve email and query params for seamless upgrade checkout pre-fill
  const emailParam = url.searchParams.get('email') || 
                     url.searchParams.get('customer_email') || 
                     url.searchParams.get('checkout[email]');

  const redirectUrl = new URL('/upgrade', url.origin);
  if (emailParam) {
    redirectUrl.searchParams.set('email', emailParam);
  }

  // Preserve UTMs if passed by checkout webhook/redirect
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'v'].forEach(k => {
    const val = url.searchParams.get(k);
    if (val) redirectUrl.searchParams.set(k, val);
  });

  const headers = new Headers();
  headers.set('Location', redirectUrl.toString());

  // Set signed, secure HttpOnly cookie
  headers.append(
    'Set-Cookie',
    `hfi_upgrade_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`
  );

  // Also set non-httpOnly expiry timestamp cookie so client can drive the countdown timer
  headers.append(
    'Set-Cookie',
    `hfi_upgrade_expiry=${expiresAt}; Path=/; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`
  );

  return new Response(null, {
    status: 302,
    headers
  });
};
