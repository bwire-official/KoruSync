import Link from 'next/link'

export default function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Ready to Find Your Balance?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join ambitious builders, students, and professionals who are achieving sustainable success with KoruSync.
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Sign Up Free
          </Link>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            No credit card required. Start your journey to balanced productivity today.
          </p>
        </div>
      </div>
    </section>
  )
} 