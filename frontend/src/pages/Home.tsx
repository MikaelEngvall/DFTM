import { motion } from 'framer-motion';

export const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Välkommen till DFTM
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        Din personliga uppgiftshanterare
      </p>
    </motion.div>
  );
}; 