import { Router } from 'express'
import { supabase } from '../config/supabase'

const router = Router()

// Sign up with email and password
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    res.status(201).json({ data })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Sign in with email and password
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    res.json({ data })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    res.json({ message: 'Signed out successfully' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Get current user
router.get('/me', async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error

    res.json({ user })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router 