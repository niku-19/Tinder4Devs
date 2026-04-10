import bcrypt from 'bcrypt';

export const hash = async (toBeHashed) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(toBeHashed, salt);
    return hashed;
  } catch (error) {
    console.error(error.message);
    throw new Error('Error in hashing');
  }
};

export const verifyHash = async (toBeVerified, hash) => {
  try {
    const isValid = await bcrypt.compare(toBeVerified, hash);
    return isValid;
  } catch (error) {
    console.error(error.message);
    throw new Error('Error in verifying hash');
  }
};
