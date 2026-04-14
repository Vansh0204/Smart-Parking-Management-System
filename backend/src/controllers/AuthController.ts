import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'NEXUS_PARK_SECRET_KEY';

// In-memory User Database
const userDatabase = new Map<string, { password: string; role: string }>();
userDatabase.set('admin', { password: 'admin123', role: 'Admin' });

export class AuthController {
  public login = (req: Request, res: Response): void => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' });
        return;
      }

      // Auto-register new drivers if account doesn't exist
      if (!userDatabase.has(username)) {
        userDatabase.set(username, { password, role: 'Driver' });
      }

      const user = userDatabase.get(username)!;

      if (user.password !== password) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }

      const token = jwt.sign({ username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token, role: user.role, username });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}
