export const enum REDIS_KEY_PREFIX {
  SIGN_UP = 'sign_up:',
  RESET_PWD = 'reset_pwd:',
  REFRESH_TOKEN = 'refresh_token:',
}

export const SIGN_UP_TTL = 60 * 5; // 5minutes
export const RESET_PWD_TTL = 60 * 5; // 5 minutes
export const ACCESS_TOKEN_TTL = 60 * 60; // 1 hour
export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 3; // 3 days
