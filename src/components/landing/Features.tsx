import { Layers, Target, Brain, Timer } from 'lucide-react'

export default function Features() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Tools Designed for Balanced Success
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Everything you need to maintain harmony across your life pillars.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Pillar Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Pillar Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Organize tasks and track time across distinct life areas with custom categories and tags.
            </p>
          </div>

          {/* Goal Tracking */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Goal Tracking</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Set meaningful goals for each pillar and visualize your progress with clear metrics.
            </p>
          </div>

          {/* AI Assistant */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">AI Assistant</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get smart planning suggestions and insights to stay on track and maintain balance.
            </p>
          </div>

          {/* Focus Timer */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
              <Timer className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Focus Timer</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Dedicated modes to help you concentrate on what matters most in each moment.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 