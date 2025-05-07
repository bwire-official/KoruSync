import { motion } from 'framer-motion'

interface PageLoaderProps {
  message?: string
}

export const PageLoader = ({ message }: PageLoaderProps) => {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{message || 'Loading...'}</p>
      </motion.div>
    </div>
  )
} 