import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'
import { User } from '@supabase/supabase-js'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
} 