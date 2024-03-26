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


// In the API routes, use this middleware to protect the api logic so it can't be called by people that aren't authenticated.

// import auth from '../../middleware/auth';

// export default function handler(req, res) {
//   auth(req, res, () => {
//     // The protected API logic here
//   });
// }