import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AppContext = createContext();

const initialState = {
  user: null,
  spaces: [],
  notes: {},
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarCollapsed: false,
  loading: true,
  error: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_SPACES':
      return { ...state, spaces: action.payload };
    
    case 'ADD_SPACE': {
      const newSpaces = [...state.spaces, action.payload];
      return { ...state, spaces: newSpaces };
    }
    
    case 'ADD_SUBSPACE': {
      const newSpaces = state.spaces.map(space => {
        if (space.id === action.payload.spaceId) {
          return {
            ...space,
            subspaces: [...(space.subspaces || []), action.payload.subspace]
          };
        }
        return space;
      });
      return { ...state, spaces: newSpaces };
    }
    
    case 'ADD_NOTE': {
      const newSpaces = state.spaces.map(space => {
        if (space.id === action.payload.spaceId) {
          return {
            ...space,
            notes: [...(space.notes || []), action.payload.note]
          };
        }
        return space;
      });
      return { ...state, spaces: newSpaces };
    }
    
    case 'UPDATE_NOTE': {
      const newSpaces = state.spaces.map(space => {
        if (space.id === action.payload.spaceId) {
          return {
            ...space,
            notes: space.notes.map(note =>
              note.id === action.payload.noteId ? action.payload.note : note
            )
          };
        }
        return space;
      });
      return { ...state, spaces: newSpaces };
    }
    
    case 'DELETE_NOTE': {
      const newSpaces = state.spaces.map(space => {
        if (space.id === action.payload.spaceId) {
          return {
            ...space,
            notes: space.notes.filter(note => note.id !== action.payload.noteId)
          };
        }
        return space;
      });
      return { ...state, spaces: newSpaces };
    }
    
    case 'TOGGLE_DARK_MODE': {
      const newDarkMode = !state.darkMode;
      localStorage.setItem('darkMode', newDarkMode.toString());
      return { ...state, darkMode: newDarkMode };
    }
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          dispatch({ type: 'SET_USER', payload: session.user });
          await fetchUserData(session.user.id);
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };

    initializeSession();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          dispatch({ type: 'SET_USER', payload: session.user });
          await fetchUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'SET_USER', payload: null });
          dispatch({ type: 'SET_SPACES', payload: [] });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user data (spaces and notes)
  const fetchUserData = async (userId) => {
    try {
      const { data: spaces, error: spacesError } = await supabase
        .from('spaces')
        .select(`
          *,
          subspaces (
            *,
            notes (*)
          ),
          notes (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (spacesError) throw spacesError;

      dispatch({ type: 'SET_SPACES', payload: spaces || [] });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Data fetch error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Apply dark mode to document
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const value = {
    state,
    dispatch,
    fetchUserData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
