const KEY = "atlas24Lead";

export function getLead(): Record<string, any> {
  try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}
export function setLead(patch: Record<string, any>) {
  const current = getLead();
  sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
}
export function requireLeadOrRedirect(fields: string[], redirect = "/anfrage/step1") {
  const lead = getLead();
  const ok = fields.every(f => lead?.[f] != null && String(lead[f]).length > 0);
  if (!ok) window.location.replace(redirect);
  return lead;
}
export function clearLead() { sessionStorage.removeItem(KEY); }
