import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function signup(req, res) {
  const { email, full_name, password } = req.body;
  const existingUser = await prisma.users.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(409).json({ error: "Email already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.users.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
      },
    });
    return res.status(200).json(newUser);
  } catch (e) {
    return res.status(400).json({ error: 'User already exists or other error' });
  }
}