// Environment variable validation for the Atlas.
// API keys for the opencode Go API are embedded (see deepseekClient.ts).

export function validateEnv(): string[] {
  const errors: string[] = [];
  // No external env vars required — opencode Go API uses embedded key
  return errors;
}
