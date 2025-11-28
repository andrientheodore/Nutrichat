
import React, { useState, useEffect, useCallback } from 'react';
import { FoodItem, DailyStats, Message, UserProfile, NutrientType, WearableConfig, InsightAlert } from './types';
import { deepseekService } from './services/deepseekService';
import { telegramService } from './services/telegramService';
import { geminiService } from './services/geminiService';
import { googleSheetsService } from './services/googleSheetsService';
import { supabaseService } from './services/supabaseService';
import { config } from './config';
import ChatInterface from './components/ChatInterface';
import MacroCard from './components/MacroCard';
import FoodLog from './components/FoodLog';
import Charts from './components/Charts';
import AuthScreen from './components/AuthScreen';
import SettingsModal from './components/SettingsModal';
import NutritionAdvisorModal from './components/NutritionAdvisorModal';
import InsightPopup from './components/InsightPopup';
import NutriScore from './components/NutriScore';
import { SortableItem } from './components/SortableItem';
import { LayoutDashboard, RefreshCcw, Leaf, MessageSquare, Settings, BrainCircuit, GripVertical } from 'lucide-react';

import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

const App: React.FC = () => {
  // --- Auth & Config ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>('User');
  
  // --- Theme State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('THEME_MODE') === 'dark';
    }
    return false;
  });

  // --- Dashboard Layout State ---
  const [dashboardItems, setDashboardItems] = useState<string[]>([
    'nutriscore', 'charts', 'calories', 'protein', 'carbs', 'fat', 'foodlog'
  ]);

  // --- User Data State ---
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    calorieTarget: 2200,
    proteinTarget: 150,
    weight: undefined,
    height: undefined,
    age: undefined,
    gender: 'Male'
  });
  
  const [foodLog, setFoodLog] = useState<FoodItem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  });

  // --- Feature B & C State (Agentic & Digital Twin) ---
  const [wearables, setWearables] = useState<WearableConfig>({
    hasOura: false,
    hasAppleHealth: false,
    hasCGM: false,
  });
  const [insightAlert, setInsightAlert] = useState<InsightAlert | null>(null);

  // --- UI State ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Desktop: Chat Visibility / Resize
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(45); // Percentage for Dashboard
  const [isResizing, setIsResizing] = useState(false);

  // Mobile: Tab Navigation
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'dashboard' | 'chat'>('dashboard');

  // --- Modal State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorAdvice, setAdvisorAdvice] = useState('');

  // --- DnD Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: { distance: 8 } // Require slight movement to prevent accidental drags on clicks
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDashboardItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // --- Initialization ---
  useEffect(() => {
    // Load cached profile if available
    const savedUser = localStorage.getItem('USER_PROFILE');
    if (savedUser) {
      const profile = JSON.parse(savedUser);
      setUserProfile(profile);
      setUserName(profile.name);
      setIsAuthenticated(true);
    }

    // Load Wearables
    const savedWearables = localStorage.getItem('WEARABLES_CONFIG');
    if (savedWearables) {
      setWearables(JSON.parse(savedWearables));
    }

    // Load Dashboard Layout
    const savedLayout = localStorage.getItem('DASHBOARD_LAYOUT');
    if (savedLayout) {
        try {
            setDashboardItems(JSON.parse(savedLayout));
        } catch(e) { console.error("Layout load failed", e); }
    }
  }, []);

  useEffect(() => {
      localStorage.setItem('DASHBOARD_LAYOUT', JSON.stringify(dashboardItems));
  }, [dashboardItems]);

  // --- Theme Logic ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('THEME_MODE', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('THEME_MODE', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- Feature C: Digital Twin / Biometric Simulation ---
  useEffect(() => {
    if (isAuthenticated && (wearables.hasOura || wearables.hasCGM)) {
      const timeout = setTimeout(() => {
        if (Math.random() > 0.1) {
          if (wearables.hasOura && wearables.hasCGM) {
             setInsightAlert({
               type: 'biometric',
               title: 'Digital Twin Prediction',
               message: "Based on your poor sleep score last night (Oura), your insulin resistance is likely elevated today. High-carb meals might spike your glucose more than usual.",
               action: "Try a protein-rich breakfast",
               dataPoint: "Sleep Score: 62 (Restless)"
             });
          } else if (wearables.hasOura) {
             setInsightAlert({
               type: 'biometric',
               title: 'Recovery Alert',
               message: "Your readiness score is low. Consider increasing carb intake slightly post-workout to aid recovery, but keep fats low.",
               dataPoint: "Readiness: 58"
             });
          }
        }
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, wearables]);

  // --- Feature B: Behavioral Coaching Logic ---
  const checkBehavioralPatterns = (newItem: FoodItem) => {
    const lowerName = newItem.name.toLowerCase();
    const triggerWords = ['cookie', 'cake', 'chocolate', 'candy', 'snack', 'chips', 'ice cream'];
    const isTriggerFood = triggerWords.some(word => lowerName.includes(word));
    
    if (isTriggerFood) {
      setTimeout(() => {
        setInsightAlert({
          type: 'behavioral',
          title: 'Behavioral Pattern Detected',
          message: `I notice a pattern of snacking on ${newItem.name} around this time. Is this usually due to stress, boredom, or hunger?`,
          action: "Suggest a healthier alternative?",
          dataPoint: "Frequency: 3 days in a row"
        });
      }, 1500);
    }
  };

  // --- Data Fetching ---
  const refreshData = useCallback(async () => {
    if (isAuthenticated && userProfile.phoneNumber) {
      setIsRefreshing(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const logs = await supabaseService.getLogs(userProfile.phoneNumber, today);
        setFoodLog(logs);
      } catch (err) {
        console.error("Failed to fetch logs on refresh:", err);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [isAuthenticated, userProfile.phoneNumber]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // --- Responsive Logic ---
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- Desktop Resize Logic ---
  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = (mouseMoveEvent.clientX / window.innerWidth) * 100;
      if (newWidth > 25 && newWidth < 75) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, resize, stopResizing]);


  // --- Stats Calculation ---
  useEffect(() => {
    const stats = foodLog.reduce(
      (acc, item) => ({
        totalCalories: acc.totalCalories + item.calories,
        totalProtein: acc.totalProtein + item.protein,
        totalCarbs: acc.totalCarbs + item.carbs,
        totalFat: acc.totalFat + item.fat,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );
    setDailyStats(stats);
  }, [foodLog]);

  // --- Handlers ---
  const handleLoginSuccess = (profile: UserProfile) => {
    setUserName(profile.name);
    setUserProfile(profile);
    localStorage.setItem('USER_PROFILE', JSON.stringify(profile));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('USER_PROFILE');
    setIsAuthenticated(false);
    setFoodLog([]);
    setMessages([]);
    setDailyStats({ totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('USER_PROFILE', JSON.stringify(newProfile));
    if (newProfile.uuid) {
      supabaseService.updateProfile(newProfile.uuid, newProfile);
    }
  };

  const handleUpdateWearables = (config: WearableConfig) => {
    setWearables(config);
    localStorage.setItem('WEARABLES_CONFIG', JSON.stringify(config));
  };

  const handleAdvisorClick = async () => {
    setIsAdvisorOpen(true);
    const today = new Date().toISOString().split('T')[0];
    const dataSignature = JSON.stringify({
      count: foodLog.length,
      cals: dailyStats.totalCalories,
      prot: dailyStats.totalProtein
    });
    const cacheKey = `ADVISOR_CACHE_${today}_${dataSignature}`;

    const cachedAdvice = localStorage.getItem(cacheKey);
    if (cachedAdvice) {
      setAdvisorAdvice(cachedAdvice);
      return;
    }

    setAdvisorLoading(true);
    setAdvisorAdvice('');
    try {
      // Use config key
      const apiKey = config.deepseekApiKey;
      const advice = await deepseekService.getNutritionAdvice(apiKey, userProfile, dailyStats, foodLog);
      try { localStorage.setItem(cacheKey, advice); } catch (err) { console.warn("Cache failed", err); }
      setAdvisorAdvice(advice);
    } catch (e) {
      setAdvisorAdvice("Sorry, I couldn't generate advice right now.");
    } finally {
      setAdvisorLoading(false);
    }
  };

  const executeToolCall = async (toolName: string, args: any): Promise<string> => {
    if (toolName === 'appendMealData') {
      const newItem: FoodItem = {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        name: args.description,
        quantity: '1 serving', 
        calories: args.calories,
        protein: args.protein,
        carbs: args.carbs,
        fat: args.fat,
        timestamp: Date.now()
      };
      setFoodLog(prev => [...prev, newItem]);
      checkBehavioralPatterns(newItem);
      const sheetUrl = localStorage.getItem('GOOGLE_SHEETS_URL');
      if (sheetUrl) googleSheetsService.logMeal(sheetUrl, newItem);
      if (userProfile.phoneNumber) await supabaseService.addLog(userProfile.phoneNumber, newItem);
      return JSON.stringify({ success: true, message: "Meal logged successfully" });
    }
    if (toolName === 'updateProfileData') {
      const updated = { ...userProfile, ...args };
      setUserProfile(updated);
      localStorage.setItem('USER_PROFILE', JSON.stringify(updated));
      if (userProfile.uuid) supabaseService.updateProfile(userProfile.uuid, updated);
      return JSON.stringify({ success: true, message: "Profile updated" });
    }
    if (toolName === 'getUserData') return JSON.stringify(userProfile);
    if (toolName === 'getReport') return JSON.stringify({ date: args.date, stats: dailyStats, mealsLogged: foodLog.length });
    return JSON.stringify({ error: "Tool not found" });
  };

  const handleSendMessage = async (text: string, imageBase64?: string, audioBase64?: string) => {
    // Use config key
    const apiKey = config.deepseekApiKey;
    telegramService.logToTelegram(text, imageBase64, audioBase64).catch(console.error);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text, image: imageBase64, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      let messageContext = text;
      if (imageBase64) {
        try {
          const analysisResult = await geminiService.analyzeImage(imageBase64);
          messageContext = `${text || 'Analyze this food'}\n\n[System: The user uploaded an image. Analysis]:\n${analysisResult}`;
        } catch (imgErr) { messageContext += "\n\n[System Error: Image analysis failed.]"; }
      }
      if (audioBase64) {
        try {
          const audioAnalysis = await geminiService.analyzeAudio(audioBase64);
          if (audioAnalysis && !audioAnalysis.startsWith("Error")) {
             messageContext = `[System: Voice note analysis]:\n${audioAnalysis}`;
          } else { messageContext = `[System: Voice note analysis failed.]`; }
        } catch (err) { messageContext += "\n\n[System Error: Audio analysis failed]"; }
      }

      const today = new Date().toISOString().split('T')[0];
      const history = messages.slice(-10);
      const contextMessages = [
        ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, text: m.text })),
        { role: 'user', text: messageContext }
      ];

      let aiResponse = await deepseekService.sendMessage(apiKey, contextMessages, userProfile, today);

      if (aiResponse.tool_calls) {
        const toolOutputs = [];
        for (const toolCall of aiResponse.tool_calls) {
          const output = await executeToolCall(toolCall.function.name, JSON.parse(toolCall.function.arguments));
          toolOutputs.push({ tool_call_id: toolCall.id, role: "tool", name: toolCall.function.name, content: output });
        }
        const followUpMessages = [...contextMessages, aiResponse, ...toolOutputs];
        const followUpPayload = followUpMessages.map(m => ({ role: m.role, text: m.content || m.text, tool_calls: m.tool_calls, tool_call_id: m.tool_call_id, name: m.name }));
        aiResponse = await deepseekService.sendMessage(apiKey, followUpPayload, userProfile, today);
      }
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: aiResponse.content, timestamp: Date.now() }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "⚠️ AI Error: " + (error as Error).message, timestamp: Date.now() }]);
    } finally { setIsProcessing(false); }
  };

  const handleDeleteMessage = useCallback((id: string) => setMessages(prev => prev.filter(msg => msg.id !== id)), []);
  const handleRemoveFood = useCallback((id: string) => {
    setFoodLog(prev => {
      const item = prev.find(i => i.id === id);
      if (item) supabaseService.deleteLog(id); 
      return prev.filter(item => item.id !== id);
    });
  }, []);
  const handleUpdateFood = useCallback(async (updatedItem: FoodItem) => {
    setFoodLog(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    if (userProfile.phoneNumber) await supabaseService.updateLog(updatedItem.id, updatedItem);
  }, [userProfile.phoneNumber]);

  // --- Widget Rendering ---
  const renderWidget = (id: string) => {
    switch(id) {
      case 'nutriscore':
        return <NutriScore stats={dailyStats} goals={userProfile} />;
      case 'charts':
        return <Charts stats={dailyStats} />;
      case 'calories':
        return <MacroCard type={NutrientType.Calories} value={dailyStats.totalCalories} goal={userProfile.calorieTarget} unit="kcal" color="text-orange-500" />;
      case 'protein':
        return <MacroCard type={NutrientType.Protein} value={dailyStats.totalProtein} goal={userProfile.proteinTarget} unit="g" color="text-red-500" />;
      case 'carbs':
        return <MacroCard type={NutrientType.Carbs} value={dailyStats.totalCarbs} goal={250} unit="g" color="text-amber-500" />;
      case 'fat':
        return <MacroCard type={NutrientType.Fat} value={dailyStats.totalFat} goal={70} unit="g" color="text-yellow-500" />;
      case 'foodlog':
        return (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors h-full">
                <div className="flex items-center space-x-2 mb-4">
                  <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400" /><h3 className="font-semibold text-slate-700 dark:text-slate-200">Todays Log</h3>
                </div>
                <FoodLog items={foodLog} onRemove={handleRemoveFood} onUpdate={handleUpdateFood} />
            </div>
        );
      default: return null;
    }
  };

  const getSpanClass = (id: string) => {
    switch(id) {
      case 'nutriscore': return 'col-span-1 md:col-span-2';
      case 'charts': return 'col-span-1 md:col-span-2';
      case 'foodlog': return 'col-span-full';
      default: return 'col-span-1';
    }
  };

  if (!isAuthenticated) return <AuthScreen onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors duration-300">
      <InsightPopup isOpen={!!insightAlert} onClose={() => setInsightAlert(null)} alert={insightAlert} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentProfile={userProfile} onUpdateProfile={handleUpdateProfile} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} onLogout={handleLogout} wearables={wearables} onUpdateWearables={handleUpdateWearables} />
      <NutritionAdvisorModal isOpen={isAdvisorOpen} onClose={() => setIsAdvisorOpen(false)} isLoading={advisorLoading} advice={advisorAdvice} />

      <div className="flex w-full h-full overflow-hidden">
        {/* --- DASHBOARD VIEW --- */}
        <div 
          className={`flex flex-col gap-4 h-full transition-all duration-75 ease-linear ${isMobile ? `w-full absolute inset-0 bg-slate-50 dark:bg-slate-950 z-10 ${activeMobileTab === 'dashboard' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}` : 'relative border-r border-slate-200 dark:border-slate-800'}`}
          style={!isMobile ? { width: `${isChatOpen ? sidebarWidth : 100}%` } : {}}
        >
          <div className={`flex flex-col h-full overflow-hidden ${isMobile ? 'pb-20' : ''}`}>
            <div className="bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0 shadow-sm z-20 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><Leaf className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none">NutriChat</h1>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Cal AI • {userName}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><Settings className="w-5 h-5" /></button>
                <button onClick={refreshData} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <RefreshCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex-shrink-0 shadow-inner flex items-center justify-between">
               <div>
                 <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-200" />
                    <h2 className="font-bold text-sm">Get AI Insights</h2>
                 </div>
                 <p className="text-xs text-indigo-100 opacity-90">Analyze your daily nutrition</p>
               </div>
               <button 
                onClick={handleAdvisorClick}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-sm transition-all"
               >
                 Review
               </button>
            </div>

            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter} 
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={dashboardItems} strategy={rectSortingStrategy}>
                <div className="p-4 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pb-24 md:pb-4">
                  {dashboardItems.map((id) => (
                    <SortableItem key={id} id={id} className={getSpanClass(id)}>
                      {renderWidget(id)}
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Resize Handle (Desktop) */}
          {!isMobile && isChatOpen && (
            <div
              className="absolute top-0 right-[-5px] w-[10px] h-full cursor-col-resize z-50 flex items-center justify-center group hover:bg-indigo-500/10 transition-colors"
              onMouseDown={startResizing}
            >
              <div className="w-1 h-8 bg-slate-300 dark:bg-slate-600 rounded-full group-hover:bg-indigo-400 transition-colors" />
            </div>
          )}
        </div>

        {/* --- CHAT VIEW --- */}
        <div 
          className={`h-full bg-slate-50 dark:bg-slate-950 transition-all ease-linear flex flex-col ${isMobile ? `w-full absolute inset-0 z-10 ${activeMobileTab === 'chat' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}` : ''}`}
          style={!isMobile ? { width: isChatOpen ? `${100 - sidebarWidth}%` : '0%', display: isChatOpen ? 'flex' : 'none' } : {}}
        >
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            onDeleteMessage={handleDeleteMessage}
            onClose={() => setIsChatOpen(false)}
            isProcessing={isProcessing}
          />
        </div>

        {/* Desktop Chat Toggle (When Closed) */}
        {!isMobile && !isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-l-xl shadow-lg z-40 hover:bg-indigo-700 transition-all"
            title="Open Assistant"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        )}

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 flex justify-around items-center z-50 pb-safe transition-colors">
            <button 
              onClick={() => setActiveMobileTab('dashboard')}
              className={`flex flex-col items-center space-y-1 ${activeMobileTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-[10px] font-medium">Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveMobileTab('chat')}
              className={`flex flex-col items-center space-y-1 ${activeMobileTab === 'chat' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <div className="relative">
                <MessageSquare className="w-6 h-6" />
                {isProcessing && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
              </div>
              <span className="text-[10px] font-medium">Assistant</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
