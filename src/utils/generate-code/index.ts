import * as crypto from 'crypto';

export const GROUP_CODE_LENGTH = 8;

/**
 * Generates a random group invite code (8 chars, A–Z and 0–9).
 * Matches `GroupCode` validation rules.
 */
export const generateCode = (length = GROUP_CODE_LENGTH): string => {
  if (length < 1) {
    throw new Error('code length must be at least 1');
  }

  return crypto.randomBytes(length).toString('hex');
};
