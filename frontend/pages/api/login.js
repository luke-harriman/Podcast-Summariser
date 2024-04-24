import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.users.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: 'No user found with this email' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (isPasswordValid) {
    // Respond only with a success message; do not set sessions here
    return res.status(200).json({ message: 'Logged in successfully' });
  } else {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
}
