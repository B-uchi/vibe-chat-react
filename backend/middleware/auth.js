import { getAuth } from "firebase-admin/auth";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    console.log(token)
    if (!token) return res.status(403).send({ message: "Access Denied" });
    if (token.startsWith("Bearer ")) {
      token = token.split(' ')[1];
    }
    
    let decodedToken = await getAuth().verifyIdToken(token)
    let uid =  decodedToken.uid
    req.uid = uid;

    next();
  } catch (error) {
    console.log(error.errorInfo)
    res.status(500).json({ message: error.message });
  }
};