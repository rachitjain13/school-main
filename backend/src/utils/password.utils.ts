
import * as argon2 from "argon2";

const ARGON2_OPTIONS: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
};

export const hashPassword = async (
  password: string
): Promise<string> => {
  if (!password || password.length < 12) {
    throw new Error("Password must contain at least 12 characters");
  }

  // Default Argon2 output is an encoded string.
  return argon2.hash(password, ARGON2_OPTIONS);
};

export const verifyPassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  if (!password || !passwordHash) {
    return false;
  }

  try {
    return await argon2.verify(passwordHash, password);
  } catch {
    return false;
  }
};
