import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; 

// Component Imports
import Auth from './Auth';
import Sidebar from './Sidebar';
import CanvasEditor from './CanvasEditor';
import Notepad from './Notepad';

const App = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [viewType, setViewType] = useState('notes');
  const [activeTabId, setActiveTabId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 1. Persistent Auth Session Listener
  useEffect(() => {
    // Check if a user is already logged in when the app starts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for sign-in and sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        // Clear data when user logs out
        setItems([]);
        setActiveTabId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Real-time Data Fetching & Syncing
  useEffect(() => {
    if (!user) return;

    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id) // Fetches data tied to this specific permanent ID
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching persistent data:", error.message);
      } else {
        setItems(data || []);
        // Auto-select the first available note if no tab is active
        if (data?.length > 0 && !activeTabId) {
          const firstNote = data.find(i => i.type === 'note');
          if (firstNote) setActiveTabId(firstNote.id);
        }
      }
    };

    fetchItems();

    // Subscribe to database changes so UI updates across devices/sessions
    const channel = supabase
      .channel(`user-data-${user.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items', filter: `user_id=eq.${user.id}` }, 
        () => { fetchItems(); }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // 3. Global Actions
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e) {
      alert("Logout failed: " + e.message);
    }
  };

  const addNewTab = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([{ 
          title: "New Note", 
          content: "", 
          type: "note", 
          user_id: user.id 
        }])
        .select();
      
      if (error) throw error;
      if (data) setActiveTabId(data[0].id);
    } catch (e) {
      console.error("Error creating note:", e.message);
    }
  };

  // Inside App.jsx
const updateNoteContent = async (id, newContent, newTitle) => {
  try {
    const { error } = await supabase
      .from('items')
      .update({ 
        content: newContent, 
        title: newTitle // Now updates the title in the DB as well
      })
      .eq('id', id);
    
    if (error) throw error;
  } catch (e) {
    alert("Update failed: " + e.message);
  }
};
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    try {
      setUploadProgress(20);
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadProgress(70);
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('items')
        .insert([{ 
          title: file.name, 
          type: file.type.includes('pdf') ? 'pdf' : 'doc', 
          url: publicUrl, 
          user_id: user.id 
        }]);

      if (dbError) throw dbError;

      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      alert("Upload error: " + error.message);
      setUploadProgress(0);
    }
  };

  const renameItem = async (id, newTitle) => {
  try {
    const { error } = await supabase
      .from('items')
      .update({ title: newTitle })
      .eq('id', id);
    
    if (error) throw error;
  } catch (e) {
    alert("Rename failed: " + e.message);
  }
};

  const deleteItem = async (id) => {
    try {
      await supabase.from('items').delete().eq('id', id);
    } catch (e) {
      console.error("Delete error:", e.message);
    }
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Auth onAuthSuccess={setUser} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={user ? (
            <div className="flex h-screen overflow-hidden">
              <Sidebar 
                userEmail={user.user_metadata?.display_name || 'User'} 
                setViewType={setViewType} 
                viewType={viewType}
                onLogout={handleLogout}
              />
              <div className="flex-1 flex flex-col">
                {viewType === 'notes' ? (
                  <Notepad 
                    tabs={items.filter(i => i.type === 'note')} 
                    activeTabId={activeTabId}
                    setActiveTabId={setActiveTabId}
                    onAddTab={addNewTab}
                    onUpdate={updateNoteContent}
                    onDelete={deleteItem}
                  />
                ) : (
                  <CanvasEditor 
  items={items.filter(i => i.type !== 'note')} 
  onDelete={deleteItem}
  onFileUpload={handleFileUpload}
  uploadProgress={uploadProgress}
  onUpdateTitle={renameItem} // Add this prop
/>
                )}
              </div>
            </div>
          ) : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
};

export default App;