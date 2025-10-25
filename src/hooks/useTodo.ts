// Custom hook for Todo list functionality
import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UseTodoReturn, Todo } from '@/types';

export const useTodo = (userId: string): UseTodoReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement real-time todo synchronization
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const todosRef = collection(db, 'todos');
    const q = query(
      todosRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const todosData: Todo[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          todosData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            dueDate: data.dueDate?.toDate()
          } as Todo);
        });
        setTodos(todosData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching todos:', err);
        setError('Failed to fetch todos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // TODO: Implement add todo functionality
  const addTodo = useCallback(async (todoData: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      
      const newTodo = {
        ...todoData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'todos'), newTodo);
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo');
      throw err;
    }
  }, [userId]);

  // TODO: Implement update todo functionality
  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    try {
      setError(null);
      
      const todoRef = doc(db, 'todos', id);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(todoRef, updateData);
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo');
      throw err;
    }
  }, []);

  // TODO: Implement delete todo functionality
  const deleteTodo = useCallback(async (id: string) => {
    try {
      setError(null);
      
      await deleteDoc(doc(db, 'todos', id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo');
      throw err;
    }
  }, []);

  // TODO: Implement toggle todo completion
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
