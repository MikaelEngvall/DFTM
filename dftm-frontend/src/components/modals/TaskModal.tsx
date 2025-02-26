import { Task } from '../../types';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onStatusChange?: (status: string) => void;
}

export const TaskModal = ({ task, onClose, onStatusChange }: TaskModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1f2937] rounded-lg w-full max-w-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        
        <h2 className="text-xl font-bold text-white mb-4">{task.title}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 block mb-1">Beskrivning</label>
            <p className="text-white">{task.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 block mb-1">Rapporterad av</label>
              <p className="text-white">{task.reporter}</p>
            </div>
            <div>
              <label className="text-gray-400 block mb-1">Tilldelad till</label>
              <p className="text-white">{task.assignee || 'Ej tilldelad'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 block mb-1">Skapad</label>
              <p className="text-white">
                {new Date(task.createdAt).toLocaleDateString('sv-SE')}
              </p>
            </div>
            <div>
              <label className="text-gray-400 block mb-1">Status</label>
              <select 
                value={task.status}
                onChange={(e) => onStatusChange?.(e.target.value)}
                className="bg-[#2c3b52] text-white rounded px-3 py-2 w-full"
              >
                <option value="PENDING">Väntande</option>
                <option value="IN_PROGRESS">Pågående</option>
                <option value="COMPLETED">Avslutad</option>
                <option value="CANCELLED">Avbruten</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 