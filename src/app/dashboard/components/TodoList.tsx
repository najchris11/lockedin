// TodoList component for managing tasks
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Edit2, Calendar, Flag } from 'lucide-react';
import { useTodo } from '@/hooks/useTodo';
import { Todo } from '@/types';
import { useNotifications } from '@/lib/notifications';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface TodoListProps {
  userId: string;
  className?: string;
}

export const TodoList: React.FC<TodoListProps> = ({ userId, className = '' }) => {
  const { todos, addTodo, updateTodo, deleteTodo, toggleTodo, loading, error } = useTodo(userId);
  const { showTaskNotification } = useNotifications();
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  
  // Edit todo state
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // TODO: Implement add todo functionality
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      await addTodo({
        title: newTodoTitle.trim(),
        description: newTodoDescription.trim() || undefined,
        priority: newTodoPriority,
        completed: false
      });
      
      setNewTodoTitle('');
      setNewTodoDescription('');
      setNewTodoPriority('medium');
      setIsAddingTodo(false);
      
      // Show task added notification
      showTaskNotification('task-added');
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  // Edit todo functionality
  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo.id);
    setEditForm({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority
    });
  };

  const handleSaveEdit = async (todoId: string) => {
    try {
      await updateTodo(todoId, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        priority: editForm.priority
      });
      setEditingTodo(null);
      setEditForm({ title: '', description: '', priority: 'medium' });
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setEditForm({ title: '', description: '', priority: 'medium' });
  };

  // Enhanced toggle function with notifications
  const handleToggleTodo = async (todoId: string) => {
    try {
      await toggleTodo(todoId);
      
      // Find the todo to check if it was completed
      const todo = todos.find(t => t.id === todoId);
      if (todo && !todo.completed) {
        // Task was just completed
        showTaskNotification('task-completed');
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  // TODO: Implement priority color coding
  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  // TODO: Implement priority icon
  const getPriorityIcon = (priority: Todo['priority']) => {
    return <Flag className={`w-4 h-4 ${getPriorityColor(priority)}`} />;
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h2>
        </div>
        <LoadingSpinner variant="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h2>
        </div>
        <ErrorDisplay
          error={error}
          title="Failed to load tasks"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddingTodo(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </motion.button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* TODO: Implement add todo form */}
      <AnimatePresence>
        {isAddingTodo && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddTodo}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Enter task title..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTodoDescription}
                  onChange={(e) => setNewTodoDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Enter task description..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as Todo['priority'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTodo(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* TODO: Implement todo list with animations */}
      <div className="space-y-3">
        <AnimatePresence>
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg border-l-4 ${
                todo.completed 
                  ? 'bg-gray-50 border-gray-300' 
                  : 'bg-white border-blue-500'
              } shadow-sm`}
            >
              {editingTodo === todo.id ? (
                // Edit form
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter task title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter task description"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as Todo['priority'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(todo.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Normal display
                <div className="flex items-start gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggleTodo(todo.id)}
                    className={`mt-1 p-1 rounded-full ${
                      todo.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400 hover:bg-green-200'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </motion.button>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${
                      todo.completed ? 'line-through text-gray-500' : 'text-black'
                    }`}>
                      {todo.title}
                    </h3>
                    
                    {todo.description && (
                      <p className={`text-sm mt-1 ${
                        todo.completed ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {todo.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      {getPriorityIcon(todo.priority)}
                      <span className={`text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                        {todo.priority.toUpperCase()}
                      </span>
                      
                      {todo.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {todo.dueDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditTodo(todo)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {todos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No tasks yet. Add your first task to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
