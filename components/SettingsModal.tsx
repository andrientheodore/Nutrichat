
import React, { useState, useEffect } from 'react';
import { Settings, X, Save, FileSpreadsheet, HelpCircle, User, Ruler, Weight, Calendar, Target, Copy, Moon, Sun, LogOut, Watch, Activity, Smartphone } from 'lucide-react';
import { UserProfile, WearableConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  wearables: WearableConfig;
  onUpdateWearables: (config: WearableConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentProfile, 
  onUpdateProfile, 
  isDarkMode, 
  onToggleTheme, 
  onLogout,
  wearables,
  onUpdateWearables
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Profile State
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: 'Male',
    calorieTarget: '',
    proteinTarget: ''
  });

  // Local Wearable State
  const [wearableConfig, setWearableConfig] = useState<WearableConfig>({
    hasOura: false,
    hasAppleHealth: false,
    hasCGM: false,
  });

  useEffect(() => {
    if (isOpen) {
      const savedUrl = localStorage.getItem('GOOGLE_SHEETS_URL');
      if (savedUrl) setSheetUrl(savedUrl);

      setFormData({
        age: currentProfile.age?.toString() || '',
        weight: currentProfile.weight?.toString() || '',
        height: currentProfile.height?.toString() || '',
        gender: currentProfile.gender || 'Male',
        calorieTarget: currentProfile.calorieTarget.toString(),
        proteinTarget: currentProfile.proteinTarget.toString()
      });

      setWearableConfig(wearables);
    }
  }, [isOpen, currentProfile, wearables]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWearableToggle = (key: keyof WearableConfig) => {
    setWearableConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // Save Sheet URL
    localStorage.setItem('GOOGLE_SHEETS_URL', sheetUrl.trim());

    // Save Profile
    const updatedProfile: UserProfile = {
      ...currentProfile,
      age: Number(formData.age) || undefined,
      weight: Number(formData.weight) || undefined,
      height: Number(formData.height) || undefined,
      gender: formData.gender,
      calorieTarget: Number(formData.calorieTarget) || 2000,
      proteinTarget: Number(formData.proteinTarget) || 150
    };

    onUpdateProfile(updatedProfile);
    onUpdateWearables(wearableConfig);
    onClose();
  };

  const copyCode = () => {
    const code = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), data.name, data.quantity, data.calories, data.protein, data.carbs, data.fat]);
  return ContentService.createTextOutput("Success");
}`;
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800 relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] transition-colors">
        
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
              <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Settings</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Appearance Section */}
          <section>
            <h4 className="font-bold text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">App Settings</h4>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400">
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark Mode</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Switch appearance</p>
                  </div>
               </div>
               <button 
                onClick={onToggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
               >
                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
               </button>
            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* Wearables Integration */}
          <section>
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-4">
              <Activity className="w-5 h-5" />
              <h4 className="font-bold text-sm uppercase tracking-wide">Wearables & Devices</h4>
            </div>
            
            <div className="space-y-4">
              {/* Oura / Ring */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm text-slate-700 dark:text-slate-200">
                      <Watch className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Smart Ring / Oura</p>
                      <p className="text-[10px] text-slate-500">Sync Sleep & Readiness Scores</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => handleWearableToggle('hasOura')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${wearableConfig.hasOura ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}
                 >
                   {wearableConfig.hasOura ? 'Connected' : 'Connect'}
                 </button>
              </div>

              {/* CGM */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm text-slate-700 dark:text-slate-200">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">CGM Monitor</p>
                      <p className="text-[10px] text-slate-500">Continuous Glucose Data</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => handleWearableToggle('hasCGM')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${wearableConfig.hasCGM ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}
                 >
                   {wearableConfig.hasCGM ? 'Connected' : 'Connect'}
                 </button>
              </div>

              {/* Apple Health */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm text-slate-700 dark:text-slate-200">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Apple Health</p>
                      <p className="text-[10px] text-slate-500">Steps & Activity</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => handleWearableToggle('hasAppleHealth')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${wearableConfig.hasAppleHealth ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}
                 >
                   {wearableConfig.hasAppleHealth ? 'Connected' : 'Connect'}
                 </button>
              </div>

            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* Personal Info Section */}
          <section>
            <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 mb-4">
              <User className="w-5 h-5" />
              <h4 className="font-bold text-sm uppercase tracking-wide">Personal Metrics</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                   Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-700 dark:text-slate-200"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Weight className="w-3 h-3" /> Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 70"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Ruler className="w-3 h-3" /> Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="e.g. 175"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* Goals Section */}
          <section>
            <div className="flex items-center space-x-2 text-orange-600 mb-4">
              <Target className="w-5 h-5" />
              <h4 className="font-bold text-sm uppercase tracking-wide">Daily Targets</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Calorie Goal (kcal)</label>
                <input
                  type="number"
                  name="calorieTarget"
                  value={formData.calorieTarget}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-medium text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Protein Goal (g)</label>
                <input
                  type="number"
                  name="proteinTarget"
                  value={formData.proteinTarget}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-medium text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* Google Sheets Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
                <h4 className="font-bold text-sm uppercase tracking-wide">Data Sync</h4>
              </div>
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg"
              >
                <HelpCircle className="w-3 h-3" /> Setup Guide
              </button>
            </div>

            {showHelp && (
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 space-y-2 border border-slate-200 dark:border-slate-700">
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Create a new Google Sheet.</li>
                  <li>Go to <strong>Extensions &gt; Apps Script</strong>.</li>
                  <li>
                    Paste this code:
                    <button onClick={copyCode} className="ml-2 text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded hover:bg-slate-300 dark:hover:bg-slate-600 inline-flex items-center gap-1 cursor-pointer">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </li>
                  <li>Click <strong>Deploy &gt; New Deployment</strong>.</li>
                  <li>Select type: <strong>Web app</strong>.</li>
                  <li>Set "Who has access" to: <strong>Anyone</strong>.</li>
                  <li>Click Deploy and copy the <strong>Web App URL</strong>.</li>
                  <li>Paste the URL below.</li>
                </ol>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Google Sheets Web App URL</label>
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm text-slate-900 dark:text-slate-100"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Automatically logs new meals to your spreadsheet.
              </p>
            </div>
          </section>

        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-between items-center">
          <button
            onClick={onLogout}
            className="px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
          
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
