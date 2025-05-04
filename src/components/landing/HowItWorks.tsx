import { ListTodo, Calendar, BarChart } from 'lucide-react'

export default function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Find Your Rhythm in 3 Steps
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get started with KoruSync and begin your journey to balanced productivity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
                <ListTodo className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Define & Categorize</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Set up your life pillars (Web3, School, Life) and organize your tasks with custom categories and tags.
              </p>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500" />
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Plan & Track</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Schedule focus time, log tasks, and track your progress across all areas of your life.
              </p>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500" />
          </div>

          {/* Step 3 */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Visualize & Balance</h3>
              <p className="text-gray-600 dark:text-gray-300">
                See clear reports, monitor goals, and spot imbalances to maintain harmony across your life pillars.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 