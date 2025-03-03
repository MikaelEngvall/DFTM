import { useState, useEffect } from 'react';
import { Task, TaskStatus, Comment, taskApi } from '../services/api/taskApi';
import { useTranslation } from 'react-i18next';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onStatusUpdate: (taskId: string, newStatus: TaskStatus) => void;
  onAddComment: (taskId: string, commentText: string) => void;
}

export const TaskDetailModal = ({ isOpen, onClose, task, onStatusUpdate, onAddComment }: TaskDetailModalProps) => {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task.status);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hämta kommentarer när modalen öppnas
  useEffect(() => {
    const fetchComments = async () => {
      if (isOpen) {
        try {
          setIsLoading(true);
          const taskComments = await taskApi.getComments(task.id);
          setComments(taskComments);
        } catch (error) {
          console.error('Error fetching comments:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchComments();
  }, [isOpen, task.id]);

  // Återställ formuläret när modalen stängs
  useEffect(() => {
    if (!isOpen) {
      setNewComment('');
    }
  }, [isOpen]);

  // Uppdatera vald status när uppgiftens status ändras
  useEffect(() => {
    setSelectedStatus(task.status);
  }, [isOpen, task.status]);

  // Hantera statusändring
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as TaskStatus);
  };

  // Spara statusändring
  const handleSaveStatus = () => {
    if (selectedStatus !== task.status) {
      console.log(`Uppdaterar uppgift ${task.id} från status ${task.status} till ${selectedStatus}`);
      onStatusUpdate(task.id, selectedStatus);
    } else {
      console.log('Ingen ändring i status, hoppar över uppdatering');
    }
  };

  // Hantera kommentarformulär
  const handleSubmitComment = (event: React.FormEvent) => {
    event.preventDefault();
    if (newComment.trim()) {
      onAddComment(task.id, newComment);
      setNewComment('');
    }
  };

  // Formatera datum på svenska
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Statusalternativ
  const statusOptions = [
    { value: TaskStatus.PENDING, label: t('task.status.pending') },
    { value: TaskStatus.IN_PROGRESS, label: t('task.status.inProgress') },
    { value: TaskStatus.NOT_FEASIBLE, label: t('task.status.notFeasible') },
    { value: TaskStatus.COMPLETED, label: t('task.status.completed') }
  ];

  // Färgkoder för olika prioritetsnivåer
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-destructive text-destructive-foreground';
      case 'HIGH':
        return 'bg-amber-500 text-amber-950';
      case 'MEDIUM':
        return 'bg-yellow-500 text-yellow-950';
      case 'LOW':
        return 'bg-green-500 text-green-950';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  // Färgkoder för olika statustyper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500 text-yellow-950';
      case 'IN_PROGRESS':
        return 'bg-blue-500 text-blue-950';
      case 'NOT_FEASIBLE':
        return 'bg-destructive text-destructive-foreground';
      case 'COMPLETED':
        return 'bg-green-500 text-green-950';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  // Visa ingen modal om den inte är öppen
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card p-4 border-b border-border flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{task.title}</h2>
            <div className="flex gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {/* Uppgiftsinformation */}
          <div className="mb-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{t('task.details.description')}</h3>
              <p className="mt-1 whitespace-pre-line">{task.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">{t('task.details.dueDate')}</h4>
                <p>{formatDate(task.dueDate)}</p>
              </div>
              
              {task.completedDate && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">{t('task.details.completedDate')}</h4>
                  <p>{formatDate(task.completedDate)}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">{t('task.details.created')}</h4>
                <p>{formatDate(task.createdAt)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">{t('task.details.updated')}</h4>
                <p>{formatDate(task.updatedAt)}</p>
              </div>
            </div>
          </div>
          
          {/* Uppdatera status */}
          <div className="mb-6 p-4 bg-muted rounded-md">
            <h3 className="text-lg font-semibold mb-2">{t('task.details.updateStatus')}</h3>
            <div className="flex gap-2">
              <select 
                value={selectedStatus}
                onChange={handleStatusChange}
                className="flex-grow bg-card text-foreground p-2 rounded border border-input"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button 
                onClick={handleSaveStatus}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                disabled={selectedStatus === task.status}
              >
                {t('common.save')}
              </button>
            </div>
          </div>
          
          {/* Kommentarer */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('task.details.comments')}</h3>
            
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-t-2 border-primary rounded-full"></div>
              </div>
            ) : (
              <div className="space-y-4 mb-4">
                {comments.length === 0 ? (
                  <p className="text-muted-foreground">{t('task.details.noComments')}</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="bg-muted/30 p-3 rounded-md">
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>{comment.userName || 'Användare'}</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {/* Lägg till kommentar */}
            <form onSubmit={handleSubmitComment} className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('task.details.commentPlaceholder')}
                className="w-full p-2 rounded border border-input bg-card min-h-[100px]"
                required
              ></textarea>
              <button 
                type="submit"
                className="mt-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md"
                disabled={!newComment.trim()}
              >
                {t('task.details.addComment')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 