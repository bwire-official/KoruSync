import { Check, X } from 'lucide-react'

interface PasswordRequirement {
  text: string
  met: boolean
}

interface PasswordRequirementsProps {
  password: string
}

export const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  const requirements: PasswordRequirement[] = [
    {
      text: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      text: 'At least one uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      text: 'At least one lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      text: 'At least one number',
      met: /[0-9]/.test(password),
    },
    {
      text: 'At least one special character',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ]

  return (
    <div className="mt-2 space-y-2">
      {requirements.map((requirement, index) => (
        <div key={index} className="flex items-center text-sm">
          {requirement.met ? (
            <Check className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <X className="h-4 w-4 text-red-500 mr-2" />
          )}
          <span
            className={
              requirement.met
                ? 'text-green-500 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400'
            }
          >
            {requirement.text}
          </span>
        </div>
      ))}
    </div>
  )
} 