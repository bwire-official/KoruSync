'use client';
import { Brain, Target, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProblemSolution() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            The Challenge
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Balancing demanding projects, studies, and personal life can be overwhelming. KoruSync brings structure and clarity to your journey.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {/* Web3 & Work */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4 transform hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Web3 & Work</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track project milestones, manage deadlines, and maintain focus on your most important work.
            </p>
          </motion.div>

          {/* Education */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4 transform hover:scale-110 transition-transform duration-300">
              <Brain className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Education</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Balance coursework, assignments, and study time while pursuing your other goals.
            </p>
          </motion.div>

          {/* Personal Life */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 transform hover:scale-110 transition-transform duration-300">
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Personal Life</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Maintain healthy habits, relationships, and personal growth alongside your professional pursuits.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
} 