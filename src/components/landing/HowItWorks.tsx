'use client'; 

import { ListTodo, Calendar, BarChart } from 'lucide-react';
import { motion } from 'framer-motion'; // This named import is correct

// Define the component
export default function HowItWorks() {
  // Animation variants for the main container (staggering children)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Delay between each child animation
      },
    },
  };

  // Animation variants for individual feature items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 }, // Start invisible and slightly down
    visible: {
      opacity: 1,
      y: 0, // Animate to original y position
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  // Array of steps for easier mapping
  const steps = [
    {
      icon: ListTodo,
      title: 'Define & Categorize',
      description: 'Set up your life pillars and organize tasks with custom categories and tags.',
      color: 'cyan', // For icon background/text
    },
    {
      icon: Calendar,
      title: 'Plan & Track',
      description: 'Schedule your tasks and track your progress across all areas of life.',
      color: 'emerald', // For icon background/text
    },
    {
      icon: BarChart,
      title: 'Visualize & Balance',
      description: 'Monitor your progress and maintain harmony across all your life pillars.',
      color: 'purple', // For icon background/text
    },
  ];

  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-800/50"> {/* Slightly adjusted background */}
      <div className="container mx-auto px-4">
        {/* Section Header - Animated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} // Animate only once when it comes into view
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get started with KoruSync and begin your journey to balanced productivity in three simple steps.
          </p>
        </motion.div>

        {/* Grid Container for Steps - Animated */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible" // Trigger animation when container is in view
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {/* Map through the steps array to render each item */}
          {steps.map((step, index) => (
            <motion.div
              key={index} // Use index as key for mapped items
              variants={itemVariants} // Apply item animation variants
              className="relative group" // For potential future group-hover effects
            >
              {/* Card for each step */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 h-full flex flex-col"> {/* Added h-full and flex for consistent height */}
                {/* Icon container */}
                <div className={`w-12 h-12 bg-${step.color}-100 dark:bg-${step.color}-900/30 rounded-lg flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  <step.icon className={`w-6 h-6 text-${step.color}-500 dark:text-${step.color}-400`} />
                </div>
                {/* Text content */}
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow"> {/* Added flex-grow for description */}
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
