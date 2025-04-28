export const isSeller = (role: string) => (req: any, res: any, next: any) => {
  if (req.role !== role) {
    return res.status(403).json({ message: "Access denied" });
  }
  return next();
};

export const isUser = (role: string) => (req: any, res: any, next: any) => {
  if (req.role !== role) {
    return res.status(403).json({ message: "Access denied" });
  }
  return next();
};

export const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  return next();
};
