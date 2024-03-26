import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { setLoginSession } from '../../utils/auth';

const prisma = new PrismaClient();

export default async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      await setLoginSession(res, { id: user.id, email: user.email });
      return res.status(200).json({ message: 'Logged in successfully' });
    }
    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
