export const comparePassword = async (plainPassword: string, hashedPassword: string) => {
  return await Bun.password.verify(plainPassword, hashedPassword);
};
