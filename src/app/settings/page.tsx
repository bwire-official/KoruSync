'use client'

import { useRouter } from 'next/navigation'
import { 
  User, 
  Bell, 
  Settings,
  Shield, 
  HelpCircle,
  Layers,
  ChevronRight,
  LifeBuoy,
  LogOut,
  Loader2,
  Mail,
  Globe,
  Calendar,
  Clock,
  Image as ImageIcon,
  Twitter,
  Github,
  Linkedin,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Save,
  ArrowLeft,
  Upload,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { userService } from '@/services/userService'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  bio: z.string().optional(),
  x_handle: z.string().optional(),
  github_username: z.string().optional(),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional(),
  website: z.string().url('Invalid website URL').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

// Profile Settings Component
function ProfileSettings() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      username: user?.user_metadata?.username || '',
      email: user?.email || '',
    }
  })

  useEffect(() => {
    if (user?.id) {
      loadUserProfile()
    }
  }, [user?.id])

  const loadUserProfile = async () => {
    if (!user?.id) return
    
    try {
      // Get the user's profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        throw new Error('Failed to load profile')
      }

      // if (profile) {
      //   reset({
      //     full_name: profile.full_name || '',
      //     username: profile.username || '',
      //     email: user.email || '',
      //     phone: profile.phone || '',
      //     location: profile.location || '',
      //     occupation: profile.occupation || '',
      //     education: profile.education || '',
      //     bio: profile.bio || '',
      //     x_handle: profile.x_handle || '',
      //     github_username: profile.github_username || '',
      //     linkedin_url: profile.linkedin_url || '',
      //     website: profile.website || '',
      //   })
      //   setAvatarUrl(profile.avatar_url)
      // }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile. Please try again.')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}/avatar.${fileExt}`

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user profile with new avatar URL
      if (user?.id) {
        await userService.updateProfile(user.id, { avatar_url: publicUrl })
        setAvatarUrl(publicUrl)
        toast.success('Avatar updated successfully')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const removeAvatar = async () => {
    try {
      setUploading(true)
      
      if (user?.id) {
        // Remove avatar from storage
        const filePath = avatarUrl?.split('/').pop()
        if (filePath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${filePath}`])
        }

        // Update user profile
       // await userService.updateProfile(user.id, { avatar_url: null })
        setAvatarUrl(null)
        toast.success('Avatar removed successfully')
      }
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error('Failed to remove avatar')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return
    
    setIsSaving(true)
    try {
      await userService.updateProfile(user.id, data)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Profile Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <ImageIcon className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Picture</h3>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              {avatarUrl ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    disabled={uploading}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="avatar" className="block mb-2">
                Upload a new profile picture
              </Label>
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="avatar"
                  className={cn(
                    "px-4 py-2 rounded-lg cursor-pointer",
                    "bg-white dark:bg-gray-700",
                    "border border-gray-200 dark:border-gray-600",
                    "hover:bg-gray-50 dark:hover:bg-gray-600",
                    "transition-colors duration-200",
                    "flex items-center space-x-2"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {uploading && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Recommended: Square image, at least 400x400px
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <User className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="full_name"
                  {...register('full_name')}
                  className="pl-10"
                  placeholder="John Doe"
                  error={errors.full_name?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="username"
                  {...register('username')}
                  className="pl-10"
                  placeholder="johndoe"
                  error={errors.username?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  {...register('email')}
                  className="pl-10"
                  placeholder="john@example.com"
                  error={errors.email?.message}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  {...register('phone')}
                  className="pl-10"
                  placeholder="+1 (555) 000-0000"
                  error={errors.phone?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  {...register('location')}
                  className="pl-10"
                  placeholder="City, Country"
                  error={errors.location?.message}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Briefcase className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Professional Information</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="occupation"
                  {...register('occupation')}
                  className="pl-10"
                  placeholder="Software Engineer"
                  error={errors.occupation?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="education"
                  {...register('education')}
                  className="pl-10"
                  placeholder="University of Technology"
                  error={errors.education?.message}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Globe className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Links</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="x_handle">X (Twitter) Handle</Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="x_handle"
                  {...register('x_handle')}
                  className="pl-10"
                  placeholder="@johndoe"
                  error={errors.x_handle?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_username">GitHub Username</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="github_username"
                  {...register('github_username')}
                  className="pl-10"
                  placeholder="johndoe"
                  error={errors.github_username?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="linkedin_url"
                  {...register('linkedin_url')}
                  className="pl-10"
                  placeholder="https://linkedin.com/in/johndoe"
                  error={errors.linkedin_url?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Personal Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="website"
                  {...register('website')}
                  className="pl-10"
                  placeholder="https://johndoe.com"
                  error={errors.website?.message}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isSaving}
            loadingText="Saving changes..."
            className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      description: 'Manage your personal information',
      color: 'bg-blue-500'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Configure your notification preferences',
      color: 'bg-purple-500'
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: Settings,
      description: 'Customize your KoruSync experience',
      color: 'bg-green-500'
    },
    {
      id: 'pillars',
      title: 'Life Pillars',
      icon: Layers,
      description: 'Manage your life pillars',
      color: 'bg-yellow-500'
    },
    {
      id: 'support',
      title: 'Support',
      icon: LifeBuoy,
      description: 'Get help and support',
      color: 'bg-indigo-500'
    },
    {
      id: 'account',
      title: 'Account',
      icon: Shield,
      description: 'Manage your account security',
      color: 'bg-red-500'
    }
  ]

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {!activeSection ? (
        <div className="space-y-2">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-lg",
                "bg-white dark:bg-gray-800",
                "border border-gray-200 dark:border-gray-700",
                "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                "transition-colors duration-200"
              )}
            >
              <div className="flex items-center space-x-4">
                <div className={cn("p-2 rounded-lg", section.color)}>
                  <section.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">{section.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {section.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}

          {/* Sign Out Button */}
          <div className="mt-8">
            <Button
              variant="danger"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center space-x-2"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setActiveSection('')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
            Back to Settings
          </button>

          {/* Section Content */}
          {activeSection === 'profile' && <ProfileSettings />}
        </div>
      )}
    </div>
  )
} 