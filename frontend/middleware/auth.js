// // middleware/auth.js
// import jwt from 'jsonwebtoken';

// const auth = (req, res) => {
//   const { auth_token } = req.cookies;

//   if (!auth_token) {
//     res.status(401).end('Not authenticated');
//     return false;
//   }

//   try {
//     const user = jwt.verify(auth_token, process.env.JWT_SECRET);
//     req.user = user;
//     return true;
//   } catch (error) {
//     res.status(401).end('Not authenticated');
//     return false;
//   }
// };

// export default auth;
