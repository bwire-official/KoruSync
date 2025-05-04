import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Master Your Flow Across Web3, School & Life
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            KoruSync helps ambitious builders, students, and professionals track tasks, manage focus across life pillars, and achieve sustainable success without burnout.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/auth/signup" 
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-center"
            >
              Get Started Free
            </Link>
            <Link 
              href="#how-it-works" 
              className="w-full sm:w-auto px-8 py-3 text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors duration-200 text-center"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* App Preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-2xl filter blur-2xl" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              {/* Placeholder for app screenshot/mockup */}
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                App Preview Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 