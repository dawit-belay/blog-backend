import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}
