import { Request } from 'express';

/**
 * What gets signed into the JWT token (minimal — no permissions, those are always loaded fresh from DB).
 */
export interface JWTSignPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * What `request.user` contains after JWT validation.
 * `permissions` is always loaded fresh from DB by JwtStrategy.validate(), never from the token.
 */
export interface JWTPayload extends JWTSignPayload {
  permissions: string[];
}

export interface RequestWithUser extends Request {
  user?: JWTPayload;
}
