export type JwtPayload = {
  username?: string;
  sub?: string;
  role?: string;
  exp?: number;
  iat?: number;
};

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payloadJson) as JwtPayload;
  } catch {
    return null;
  }
}
