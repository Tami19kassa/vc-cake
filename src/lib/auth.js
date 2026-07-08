import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vccakeacademysecret12345";

// Verifies JWT token from authorization header
export function verifyToken(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // returns { id, username }
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
}
