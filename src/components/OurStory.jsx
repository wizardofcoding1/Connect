import React from "react";
import { Sparkles, MessageSquare, Code, Users, Heart } from "lucide-react";

const OurStory = ({ isModal = false }) => {
  const textTitle = isModal ? "text-slate-900" : "text-white";
  const textDesc = isModal ? "text-slate-550" : "text-slate-400";
  const textBody = isModal ? "text-slate-700" : "text-slate-350";
  const bgCard = isModal ? "bg-slate-50 border-slate-200/80" : "bg-slate-950/40 border-slate-800";
  const bgProfile = isModal ? "bg-slate-50/50 border-slate-200/60" : "bg-slate-950/30 border-slate-800";
  const divider = isModal ? "border-slate-200/80" : "border-slate-800/80";

  return (
    <div className={`p-6 md:p-8 min-h-[calc(100vh-3.5rem)] md:min-h-screen flex flex-col justify-start rounded-[2rem] select-text ${
      isModal ? "bg-white text-slate-800" : "bg-slate-900 text-slate-100"
    }`}>
      <div className="max-w-3xl mx-auto w-full space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-blue-600">
            <Sparkles size={14} className="text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} /> The Birth of Connect
          </div>
          <h1 className={`text-3xl md:text-4xl font-black tracking-tight leading-tight ${textTitle}`}>
            Built by Friends, <br />
            For Collaboration.
          </h1>
          <p className={`${textDesc} text-sm max-w-xl mx-auto leading-relaxed`}>
            How a simple college lab frustration turned into a centralized cloud workspace for notes and documents.
          </p>
        </div>

        {/* Timeline Story Card */}
        <div className={`relative border p-6 md:p-8 rounded-[2rem] space-y-6 shadow-sm ${bgCard}`}>
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600/15 border border-blue-500/30 rounded-2xl text-blue-600 shrink-0">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className={`text-lg font-bold mb-2 ${textTitle}`}>The College Lab Spark</h2>
              <p className={`${textBody} text-xs md:text-sm leading-relaxed`}>
                During a college practical lab session, co-founders <strong>Kartik</strong> and <strong>Maroof</strong> were sitting next to each other, trying to collaborate. They found themselves constantly logging into WhatsApp Web on the lab computers, sending notes and drag-dropping documents back and forth just to share code snippets and reference files.
              </p>
              <blockquote className={`mt-4 border-l-4 border-blue-500 pl-4 italic text-xs leading-relaxed ${textDesc}`}>
                "Opening WhatsApp every time just to share text files and PDF notes is messy. Let's make a dedicated workspace for ourselves."
              </blockquote>
            </div>
          </div>

          <div className={`border-t pt-6 flex items-start gap-4 ${divider}`}>
            <div className="p-3 bg-indigo-600/15 border border-indigo-500/30 rounded-2xl text-indigo-600 shrink-0">
              <Code size={24} />
            </div>
            <div>
              <h2 className={`text-lg font-bold mb-2 ${textTitle}`}>Turning Ideas into Connect</h2>
              <p className={`${textBody} text-xs md:text-sm leading-relaxed`}>
                What started as a tool to solve their own classroom inconvenience quickly evolved. Kartik and Maroof wanted something fast, beautiful, and secure. They designed a multi-tab Notepad with instant drafts, a visual Canvas to drag-and-drop document files, and real-time syncing. They named it <strong>Connect</strong>—because that is exactly what it does.
              </p>
            </div>
          </div>
        </div>

        {/* Founders Grid */}
        <div className="space-y-6">
          <h3 className={`text-sm font-bold text-center uppercase tracking-widest flex items-center justify-center gap-2 ${textDesc}`}>
            <Users size={16} /> Meet the Founders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Kartik Profile */}
            <div className={`border p-6 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-all duration-300 ${bgProfile}`}>
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-600/10 shrink-0">
                K
              </div>
              <div>
                <h4 className={`text-base font-bold ${textTitle}`}>Kartik</h4>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Co-Founder & Developer</p>
                <p className={`${textDesc} text-xs mt-1 leading-relaxed`}>
                  Passionate about crafting fast reactive interfaces and solving collaboration challenges.
                </p>
              </div>
            </div>

            {/* Maroof Profile */}
            <div className={`border p-6 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 transition-all duration-300 ${bgProfile}`}>
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-600/10 shrink-0">
                M
              </div>
              <div>
                <h4 className={`text-base font-bold ${textTitle}`}>Maroof</h4>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Co-Founder & Developer</p>
                <p className={`${textDesc} text-xs mt-1 leading-relaxed`}>
                  Focused on building robust real-time database sync logic and smooth storage pipelines.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[10px] text-slate-500 pt-6 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider">
          Made with <Heart size={12} className="text-red-500 animate-pulse" /> by Kartik & Maroof.
        </div>

      </div>
    </div>
  );
};

export default OurStory;
