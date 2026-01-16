import React, { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";

// Component Imports
import Auth from "./Auth";
import Sidebar from "./Sidebar";
import CanvasEditor from "./CanvasEditor";
import Notepad from "./Notepad";
import { Menu } from "lucide-react";

const App = () => {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
    const [viewType, setViewType] = useState("notes");
    const [activeTabId, setActiveTabId] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle state

    // 1. Persistent Auth Session Listener
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session) {
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
                .from("items")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching data:", error.message);
            } else {
                setItems(data || []);
                if (data?.length > 0 && !activeTabId) {
                    const firstNote = data.find((i) => i.type === "note");
                    if (firstNote) setActiveTabId(firstNote.id);
                }
            }
        };

        fetchItems();

        const channel = supabase
            .channel(`user-data-${user.id}`)
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "items",
                filter: `user_id=eq.${user.id}`,
            }, () => {
                fetchItems();
            })
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
                .from("items")
                .insert([{
                    title: "New Note",
                    content: "",
                    type: "note",
                    user_id: user.id,
                }])
                .select();

            if (error) throw error;
            if (data) setActiveTabId(data[0].id);
        } catch (e) {
            console.error("Error creating note:", e.message);
        }
    };

    const updateNoteContent = async (id, newContent, newTitle) => {
        try {
            // Optimistic update for UI feel
            setItems(prev => prev.map(item => item.id === id ? { ...item, content: newContent, title: newTitle } : item));
            
            const { error } = await supabase
                .from("items")
                .update({ content: newContent, title: newTitle })
                .eq("id", id);

            if (error) throw error;
        } catch (e) {
            alert("Update failed: " + e.message);
        }
    };

    const deleteItem = async (id) => {
        try {
            // SYNCHRONOUS UI UPDATE (Instant removal)
            setItems(prev => prev.filter(item => item.id !== id));
            if (activeTabId === id) setActiveTabId(null);

            // DB removal in background
            const { error } = await supabase.from("items").delete().eq("id", id);
            if (error) throw error;
        } catch (e) {
            console.error("Delete error:", e.message);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        try {
            setUploadProgress(20);
            const { error: uploadError } = await supabase.storage
                .from("documents")
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            setUploadProgress(70);
            const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(fileName);

            const { error: dbError } = await supabase.from("items").insert([
                {
                    title: file.name,
                    type: file.type.includes("pdf") ? "pdf" : "doc",
                    url: publicUrl,
                    user_id: user.id,
                },
            ]);

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
            setItems(prev => prev.map(item => item.id === id ? { ...item, title: newTitle } : item));
            const { error } = await supabase.from("items").update({ title: newTitle }).eq("id", id);
            if (error) throw error;
        } catch (e) {
            alert("Rename failed: " + e.message);
        }
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!user ? <Auth onAuthSuccess={setUser} /> : <Navigate to="/" />} />
                <Route path="/" element={user ? (
                    <div className="flex h-screen overflow-hidden bg-white">
                        {/* Mobile Overlay */}
                        {isSidebarOpen && (
                            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
                        )}

                        {/* Sidebar with Mobile Logic */}
                        <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out z-50`}>
                            <Sidebar 
                                userEmail={user.user_metadata?.display_name || "User"} 
                                setViewType={(v) => { setViewType(v); setIsSidebarOpen(false); }} 
                                viewType={viewType} 
                                onLogout={handleLogout} 
                            />
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                            {/* Mobile Top Bar */}
                            <div className="md:hidden flex items-center p-4 border-b bg-white">
                                <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-slate-100 rounded-lg">
                                    <Menu size={24} className="text-slate-600" />
                                </button>
                                <span className="ml-4 font-bold text-blue-600">Connect</span>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                {viewType === "notes" ? (
                                    <Notepad 
                                        tabs={items.filter(i => i.type === "note")} 
                                        activeTabId={activeTabId} 
                                        setActiveTabId={setActiveTabId} 
                                        onAddTab={addNewTab} 
                                        onUpdate={updateNoteContent} 
                                        onDelete={deleteItem} 
                                    />
                                ) : (
                                    <CanvasEditor 
                                        items={items.filter(i => i.type !== "note")} 
                                        onDelete={deleteItem} 
                                        onFileUpload={handleFileUpload} 
                                        uploadProgress={uploadProgress} 
                                        onUpdateTitle={renameItem} 
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default App;