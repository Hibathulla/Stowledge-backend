export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await Bun.password.hashSync(password, {
    algorithm: "bcrypt",
    cost: 12,
  });
  return hashedPassword;
}
