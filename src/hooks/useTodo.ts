// Custom hook for Todo list functionality with offline support
import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, getDocsFromCache, getDocsFromServer } from 'firebase/firestore';
import { db, firestoreUtils } from '@/lib/firebase';
import { UseTodoReturn, Todo } from '@/types';
import { cacheUtils } from '@/lib/cache';

export const useTodo = (userId: string): UseTodoReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);

  // Optimized real-time todo synchronization with offline support
  useEffect(() => {
    if (!userId || isInitializedRef.current) {
      setLoading(false);
      return;
    }
    isInitializedRef.current = true;

    // Try to load from cache first
    const loadFromCache = async () => {
      try {
        const cachedTodos = cacheUtils.getTodos<Todo[]>(userId);
        if (cachedTodos && cachedTodos.length > 0) {
          setTodos(cachedTodos);
          setLoading(false);
          console.log('Todos loaded from cache');
        }
      } catch (error) {
        console.log('No cached todos found');
      }
    };

    // Load from cache immediately
    loadFromCache();

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
        
        // Cache the todos
        cacheUtils.cacheTodos(userId, todosData);
      },
      (err) => {
        console.error('Error fetching todos:', err);
        
        // If offline, try to use cached data
        if (!firestoreUtils.isOnline()) {
          const cachedTodos = cacheUtils.getTodos<Todo[]>(userId);
          if (cachedTodos) {
            setTodos(cachedTodos);
            setError('Offline mode - showing cached data');
          } else {
            setError('No cached data available offline');
          }
        } else {
          setError('Failed to fetch todos');
        }
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe;
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId]);

  // Optimistic add todo with immediate UI update
  const addTodo = useCallback(async (todoData: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      
      const tempId = `temp_${Date.now()}`;
      const newTodo = {
        id: tempId,
        ...todoData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Optimistic update - add to UI immediately
      setTodos(prev => [newTodo, ...prev]);
      cacheUtils.cacheTodos(userId, [newTodo, ...todos]);

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'todos'), {
        ...todoData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update with real ID
      setTodos(prev => prev.map(todo => 
        todo.id === tempId ? { ...todo, id: docRef.id } : todo
      ));

    } catch (err) {
      console.error('Error adding todo:', err);
      
      // Revert optimistic update
      setTodos(prev => prev.filter(todo => todo.id !== `temp_${Date.now()}`));
      setError('Failed to add todo');
      throw err;
    }
  }, [userId, todos]);

  // Optimistic update todo with immediate UI update
  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    let originalTodo: Todo | undefined;
    
    try {
      setError(null);
      
      // Store original state for rollback
      originalTodo = todos.find(t => t.id === id);
      if (!originalTodo) return;

      // Optimistic update - update UI immediately
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo
      ));

      // Update Firestore
      const todoRef = doc(db, 'todos', id);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(todoRef, updateData);
    } catch (err) {
      console.error('Error updating todo:', err);
      
      // Revert optimistic update
      if (originalTodo) {
        setTodos(prev => prev.map(todo => 
          todo.id === id ? originalTodo! : todo
        ));
      }
      setError('Failed to update todo');
      throw err;
    }
  }, [todos]);

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
