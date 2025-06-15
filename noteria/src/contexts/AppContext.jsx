import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,
  spaces: [],
  notes: {}
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'ADD_SPACE':
      return {
        ...state,
        spaces: [...state.spaces, action.payload]
      };
    
    case 'ADD_SUBSPACE':
      return {
        ...state,
        spaces: state.spaces.map(space =>
          space.id === action.payload.spaceId
            ? { ...space, subSpaces: [...space.subSpaces, action.payload.subSpace] }
            : space
        )
      };
    
    case 'ADD_NOTE':
      const key = `${action.payload.spaceId}-${action.payload.subSpaceId}`;
      return {
        ...state,
        notes: {
          ...state.notes,
          [key]: [...(state.notes[key] || []), action.payload.note]
        }
      };
    
    case 'UPDATE_NOTE':
      const updateKey = `${action.payload.spaceId}-${action.payload.subSpaceId}`;
      return {
        ...state,
        notes: {
          ...state.notes,
          [updateKey]: state.notes[updateKey].map(note =>
            note.id === action.payload.noteId
              ? { ...note, ...action.payload.updates, updatedAt: new Date().toISOString() }
              : note
          )
        }
      };
    
    case 'DELETE_NOTE':
      const deleteKey = `${action.payload.spaceId}-${action.payload.subSpaceId}`;
      return {
        ...state,
        notes: {
          ...state.notes,
          [deleteKey]: state.notes[deleteKey].filter(note => note.id !== action.payload.noteId)
        }
      };
    
    case 'SET_CURRENT_SPACE':
      return { ...state, currentSpace: action.payload };
    
    case 'SET_CURRENT_SUBSPACE':
      return { ...state, currentSubSpace: action.payload };
    
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Clear initial local storage data on first load
  useEffect(() => {
    const isFirstLoad = !localStorage.getItem('noteria-initialized');
    if (isFirstLoad) {
      localStorage.removeItem('noteria-data');
      localStorage.setItem('noteria-initialized', 'true');
    }
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('noteria-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        Object.keys(parsedData).forEach(key => {
          if (key === 'spaces') {
            parsedData.spaces.forEach(space => {
              dispatch({ type: 'ADD_SPACE', payload: space });
            });
          } else if (key === 'notes') {
            Object.keys(parsedData.notes).forEach(noteKey => {
              parsedData.notes[noteKey].forEach(note => {
                const [spaceId, subSpaceId] = noteKey.split('-');
                dispatch({
                  type: 'ADD_NOTE',
                  payload: { spaceId, subSpaceId, note }
                });
              });
            });
          }
        });
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    const dataToSave = {
      spaces: state.spaces,
      notes: state.notes,
      darkMode: state.darkMode
    };
    localStorage.setItem('noteria-data', JSON.stringify(dataToSave));
  }, [state.spaces, state.notes, state.darkMode]);

  // Apply dark mode to document
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
