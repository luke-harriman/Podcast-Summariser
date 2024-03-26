import { removeLoginSession } from '../../utils/auth';

export default async function signout(req, res) {
  try {
    removeLoginSession(res);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
