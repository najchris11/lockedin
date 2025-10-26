// Custom hook for Todo list functionality with localStorage fallback
import { useState, useEffect, useCallback } from 'react';
import { Todo } from '@/types';

export interface UseTodoReturn {
  todos: Todo[];
  addTodo: (todoData: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'lockedin-todos';

export const useTodoLocal = (userId: string = 'local-user'): UseTodoReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos from localStorage on mount
  useEffect(() => {
    try {
      const savedTodos = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
        }));
        setTodos(parsedTodos);
      }
    } catch (err) {
      console.error('Failed to load todos from localStorage:', err);
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Save todos to localStorage whenever todos change
  const saveTodos = useCallback((todoList: Todo[]) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(todoList));
      setError(null);
    } catch (err) {
      console.error('Failed to save todos to localStorage:', err);
      setError('Failed to save todos');
    }
  }, [userId]);

  // Add todo functionality
  const addTodo = useCallback(async (todoData: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      
      const newTodo: Todo = {
        ...todoData,
        id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedTodos = [newTodo, ...todos];
      setTodos(updatedTodos);
      saveTodos(updatedTodos);
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo');
      throw err;
    }
  }, [userId, todos, saveTodos]);

  // Update todo functionality
  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    try {
      setError(null);
      
      const updatedTodos = todos.map(todo => 
        todo.id === id 
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      );

      setTodos(updatedTodos);
      saveTodos(updatedTodos);
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo');
      throw err;
    }
  }, [todos, saveTodos]);

  // Delete todo functionality
  const deleteTodo = useCallback(async (id: string) => {
    try {
      setError(null);
      
      const updatedTodos = todos.filter(todo => todo.id !== id);
      setTodos(updatedTodos);
      saveTodos(updatedTodos);
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo');
      throw err;
    }
  }, [todos, saveTodos]);

  // Toggle todo completion
  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  }, [todos, updateTodo]);

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    loading,
    error
  };
};