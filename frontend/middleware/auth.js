import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  const { token } = req.cookies;
  
  if (!token) {
    return res.status(401).end('Not authenticated');
  }
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).end('Not authenticated');
  }
}
