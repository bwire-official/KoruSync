'use client'

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/Input'; // Verify path
import { Button } from '@/components/ui/Button'; // Verify path
import { Label } from '@/components/ui/label'; // Assuming Label is needed/available

// Define the structure for a pillar object
interface Pillar {
  name: string;
  color: string; // Store color as hex string, e.g., '#10B981'
}

// Define the props interface with the correct pillar type
interface PillarsStepProps {
  initialPillars: Pillar[]; // Expects array of Pillar objects
  // Update onComplete to expect the correct structure
  onComplete: (data: { pillars: Pillar[] }) => void;
  loading: boolean;
}

// Default colors to cycle through for new pillars
const DEFAULT_COLORS = ['#34D399', '#60A5FA', '#FBBF24', '#F87171', '#A78BFA', '#FB923C'];

// Preset pillar names (only names)
const PRESET_PILLAR_NAMES = [
  'Health & Fitness',
  'Career & Business',
  'Relationships',
  'Personal Growth',
  'Finances',
  'Spirituality',
  'Family',
  'Social Life',
  'Hobbies & Creativity',
  'Community Service'
];

export function PillarsStep({ initialPillars, onComplete, loading }: PillarsStepProps) {
  // State now holds an array of Pillar objects
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [newPillarName, setNewPillarName] = useState('');

  // Initialize state with initialPillars only once
  useEffect(() => {
    setPillars(initialPillars || []);
  }, [initialPillars]); // Depend only on initialPillars

  // Helper to get the next default color
  const getNextColor = () => {
    return DEFAULT_COLORS[pillars.length % DEFAULT_COLORS.length];
  };

  // Check if a pillar name already exists
  const pillarExists = (name: string) => {
    return pillars.some(p => p.name.toLowerCase() === name.toLowerCase());
  };

  const handleAddPillar = (nameToAdd: string) => {
    const trimmedName = nameToAdd.trim();
    if (trimmedName && !pillarExists(trimmedName)) {
      const newPillar: Pillar = {
        name: trimmedName,
        color: getNextColor(), // Assign a default color
      };
      setPillars([...pillars, newPillar]);
      setNewPillarName(''); // Clear input only if adding custom
    }
  };

  const handleRemovePillar = (pillarToRemove: Pillar) => {
    setPillars(pillars.filter(pillar => pillar.name !== pillarToRemove.name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure at least one pillar is selected (adjust min if needed)
    if (loading || pillars.length === 0) {
        // Optionally set an error state here to inform the user
        console.error("Please select at least one pillar.");
        return;
    }
    // Pass the array of Pillar objects
    onComplete({ pillars });
  };

  return (
    <>
      <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">
        Define Your Life Pillars
      </h2>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        Select or add the key areas you want to balance and track (e.g., Web3, School, Health).
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preset Pillars Section */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-500 dark:text-gray-400">Choose from presets:</Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_PILLAR_NAMES.map((name) => {
              const isSelected = pillarExists(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    if (!isSelected) {
                      handleAddPillar(name); // Add with default color
                    } else {
                      // Find the pillar object to remove
                      const pillarToRemove = pillars.find(p => p.name === name);
                      if (pillarToRemove) {
                        handleRemovePillar(pillarToRemove);
                      }
                    }
                  }}
                  // Toggle appearance based on selection
                  className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 border ${
                    isSelected
                      ? 'bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-500 dark:border-emerald-600' // Use consistent color for selected
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {name} {isSelected ? <X className="inline w-3 h-3 ml-1" /> : <Plus className="inline w-3 h-3 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Pillar Input Section */}
        <div className="space-y-2">
           <Label htmlFor="custom-pillar" className="text-sm text-gray-500 dark:text-gray-400">Add a custom pillar:</Label>
           <div className="flex gap-2">
             <Input
               id="custom-pillar"
               type="text"
               placeholder="e.g., Side Project"
               value={newPillarName}
               onChange={(e) => setNewPillarName(e.target.value)}
               className="flex-1"
               disabled={loading}
             />
             <Button
               type="button"
               variant="secondary" // Use secondary or outline
               onClick={() => handleAddPillar(newPillarName)}
               // Disable if input is empty or pillar already exists
               disabled={!newPillarName.trim() || pillarExists(newPillarName.trim()) || loading}
               aria-label="Add custom pillar"
             >
               <Plus className="w-4 h-4" />
             </Button>
           </div>
        </div>


        {/* Selected Pillars Display Section */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-500 dark:text-gray-400">Your selected pillars:</Label>
          {pillars.length === 0 ? (
             <p className="text-xs text-gray-400 dark:text-gray-500 italic">Select or add at least one pillar.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pillars.map((pillar) => (
                <div
                  key={pillar.name} // Use name as key assuming names are unique per user
                  className="flex items-center gap-1.5 pl-2 pr-1 py-1 text-white rounded-lg text-sm"
                  // Use the pillar's specific color for background
                  style={{ backgroundColor: pillar.color }}
                >
                  <span>{pillar.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePillar(pillar)}
                    className="opacity-70 hover:opacity-100 p-0.5 rounded-full hover:bg-black/10"
                    aria-label={`Remove ${pillar.name}`}
                    disabled={loading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={loading}
          // Disable if no pillars are selected
          disabled={loading || pillars.length === 0}
          className="w-full mt-6"
          variant="primary"
        >
          Continue
        </Button>
      </form>
    </>
  );
}
