import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function signup(req, res) {
  console.log('Received data:', req.body);  // Log received data
  const { email, full_name, password } = req.body;  // Ensure these names match the keys in your request body
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.users.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
      },
    });
    console.log('New user created:', newUser);  // Log new user
    return res.status(200).json(newUser);
  } catch (e) {
    console.error('Error creating user:', e);  // Log any errors
    return res.status(400).json({ error: 'User already exists or other error' });
  }
}