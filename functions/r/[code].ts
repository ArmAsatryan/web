import {
  buildReferralRedirectResponse,
  normalizeReferralCode,
} from "../../shared/referral-redirect";

export async function onRequest(context: {
  request: Request;
  params: { code?: string | string[] };
}): Promise<Response> {
  const rawParam = context.params.code;
  const raw = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  const code = normalizeReferralCode(raw);

  if (!code) {
    return Response.redirect(new URL("/", context.request.url).toString(), 302);
  }

  return buildReferralRedirectResponse(context.request, code);
}
