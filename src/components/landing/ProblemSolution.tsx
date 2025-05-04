import { Brain, Target, Zap } from 'lucide-react'

export default function ProblemSolution() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Feeling Pulled in Too Many Directions?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Balancing demanding projects, studies, and personal life can be overwhelming. KoruSync brings structure and clarity to your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Web3 & Work */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Web3 & Work</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track project milestones, manage deadlines, and maintain focus on your most important work.
            </p>
          </div>

          {/* Education */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Education</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Balance coursework, assignments, and study time while pursuing your other goals.
            </p>
          </div>

          {/* Personal Life */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Personal Life</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Maintain healthy habits, relationships, and personal growth alongside your professional pursuits.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 