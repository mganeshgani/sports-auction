import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Team } from '../types';
import Button from './ui/Button';

interface TeamFormProps {
  onSubmit: (data: Partial<Team>) => Promise<void>;
  initialData?: Team;
  onCancel: () => void;
}

const TeamForm: React.FC<TeamFormProps> = ({
  onSubmit,
  initialData,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    totalSlots: initialData?.totalSlots || 6,
    budget: initialData?.budget || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        budget: formData.budget ? Number(formData.budget) : null,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error saving team');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800 rounded-lg p-6 space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Team Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Total Slots
        </label>
        <input
          type="number"
          min="1"
          value={formData.totalSlots}
          onChange={(e) => setFormData(prev => ({ ...prev, totalSlots: parseInt(e.target.value) }))}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Budget (Optional)
        </label>
        <input
          type="number"
          value={formData.budget}
          onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Leave empty for no budget limit"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {initialData ? 'Update Team' : 'Create Team'}
        </Button>
      </div>
    </motion.form>
  );
};

export default TeamForm;