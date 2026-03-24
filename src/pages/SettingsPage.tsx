import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Moon, 
  Globe, 
  Volume2, 
  Target, 
  BookOpen, 
  Download, 
  Trash2, 
  ExternalLink,
  Mail,
  Smartphone,
  CreditCard,
  Zap,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge } from '../components/UI';
import { isSupabaseConfigured } from '../lib/supabase';

const SettingsPage: React.FC = () => {
  const { user, logout, updatePreferences } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [soundEnabled, setSoundEnabled] = useState(user?.preferences?.notificationsEnabled ?? true);
  const [isUpdating, setIsUpdating] = useState(false);

  const languages = ['English', 'Portuguese', 'Spanish', 'French', 'German', 'Italian', 'Chinese', 'Japanese', 'Korean'];

  const menuItems = [
    { id: 'account', label: 'Account', icon: User, color: 'text-primary' },
    { id: 'study', label: 'Study Plan', icon: Target, color: 'text-neon-cyan' },
    { id: 'app', label: 'App Settings', icon: Smartphone, color: 'text-soft-pink' },
    { id: 'billing', label: 'Subscription', icon: CreditCard, color: 'text-amber-400' },
    { id: 'data', label: 'Data & Privacy', icon: Database, color: 'text-emerald-400' },
    { id: 'support', label: 'Support', icon: HelpCircle, color: 'text-blue-400' },
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  const handleClearData = () => {
    if (window.confirm('This will clear all your local study data. This action cannot be undone. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-6 p-8 glass-dark rounded-[2.5rem] border border-white/5 shadow-neon">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1 shadow-neon">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-3xl font-black text-white">{user?.displayName?.[0] || user?.email?.[0] || '?'}</div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white glow-text">{user?.displayName || 'Language Learner'}</h3>
                <p className="text-soft-gray font-medium">{user?.email}</p>
                <div className="flex gap-2 pt-2">
                  <Badge variant="glass" className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest">Pro Member</Badge>
                  <Badge variant="glass" className="bg-white/5 text-soft-gray border-none text-[10px] font-black uppercase tracking-widest">Level 12</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] px-4">Account Details</h4>
              <div className="grid gap-3">
                {[
                  { label: 'Display Name', value: user?.displayName || 'Not set', icon: User },
                  { label: 'Email Address', value: user?.email, icon: Mail },
                  { label: 'Auth Provider', value: user?.authProvider || 'Email', icon: Shield },
                  { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A', icon: BookOpen },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-6 glass-dark rounded-2xl border border-white/5 group hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-soft-gray group-hover:text-primary transition-colors">
                        <item.icon size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">{item.label}</p>
                        <p className="text-white font-bold">{item.value}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary font-black text-xs">Edit</Button>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              variant="destructive" 
              className="w-full py-8 rounded-2xl font-black text-lg shadow-neon bg-soft-pink/10 text-soft-pink border-none hover:bg-soft-pink/20"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-2" /> Sign Out of Falai
            </Button>
          </motion.div>
        );

      case 'study':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] px-4">Daily Goals</h4>
              <Card className="p-8 glass-dark rounded-[2.5rem] border border-white/5 shadow-neon space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-white font-black text-xl">Intensive Study</p>
                    <p className="text-soft-gray text-sm font-medium">30 minutes per day</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 flex items-center justify-center text-neon-cyan">
                    <Zap size={32} />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['Casual', 'Regular', 'Serious', 'Insane'].map((level, i) => (
                    <button 
                      key={level}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        i === 2 ? 'bg-neon-cyan text-slate-900 border-neon-cyan shadow-neon' : 'bg-white/5 text-soft-gray border-white/10'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] px-4">Learning Focus</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Vocabulary', icon: BookOpen, active: true },
                  { label: 'Pronunciation', icon: Volume2, active: true },
                  { label: 'Grammar', icon: Shield, active: false },
                  { label: 'Listening', icon: Bell, active: false },
                ].map((focus) => (
                  <button 
                    key={focus.label}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${
                      focus.active ? 'bg-primary/10 border-primary text-primary shadow-neon' : 'bg-white/5 border-white/5 text-soft-gray'
                    }`}
                  >
                    <focus.icon size={24} />
                    <span className="font-black text-xs uppercase tracking-widest">{focus.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'app':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] px-4">Preferences</h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-6 glass-dark rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-soft-gray">
                      <Moon size={18} />
                    </div>
                    <div>
                      <p className="text-white font-bold">Dark Mode</p>
                      <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">Always On</p>
                    </div>
                  </div>
                  <button className="w-12 h-6 rounded-full relative transition-colors bg-primary shadow-neon">
                    <motion.div animate={{ x: 24 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 glass-dark rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-soft-gray">
                      <Volume2 size={18} />
                    </div>
                    <div>
                      <p className="text-white font-bold">Sound Effects</p>
                      <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">{soundEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      const newValue = !soundEnabled;
                      setSoundEnabled(newValue);
                      await updatePreferences({ notificationsEnabled: newValue });
                    }}
                    className={`w-12 h-6 rounded-full relative transition-colors ${soundEnabled ? 'bg-primary shadow-neon' : 'bg-white/10'}`}
                  >
                    <motion.div animate={{ x: soundEnabled ? 24 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                <div className="p-6 glass-dark rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-soft-gray">
                      <Globe size={18} />
                    </div>
                    <div>
                      <p className="text-white font-bold">Native Language</p>
                      <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">For translations</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => updatePreferences({ nativeLanguage: lang })}
                        className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                          user?.preferences?.nativeLanguage === lang 
                            ? 'bg-primary text-white border-primary shadow-neon' 
                            : 'bg-white/5 text-soft-gray border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 glass-dark rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-soft-gray">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <p className="text-white font-bold">Default Subtitle Size</p>
                      <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">Shadowing Player</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updatePreferences({ subtitleSize: size })}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          (user?.preferences?.subtitleSize || 'md') === size 
                            ? 'bg-primary text-white border-primary shadow-neon' 
                            : 'bg-white/5 text-soft-gray border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'billing':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <Card className="p-10 glass-dark rounded-[3rem] border border-white/5 shadow-neon relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Badge variant="glass" className="bg-amber-400/20 text-amber-400 border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">Active Plan</Badge>
                    <h3 className="text-4xl font-black text-white font-display tracking-tight glow-text">Falai Pro</h3>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                    <CreditCard size={32} />
                  </div>
                </div>
                <p className="text-soft-gray font-medium text-lg leading-relaxed">
                  Your subscription will automatically renew on April 24, 2026.
                </p>
                <div className="pt-4 flex gap-4">
                  <Button className="flex-1 py-6 rounded-2xl font-black bg-amber-400 text-slate-900 hover:bg-amber-500 shadow-neon border-none">Manage Subscription</Button>
                  <Button variant="ghost" className="text-soft-gray font-black">Cancel</Button>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] px-4">Payment Method</h4>
              <div className="flex items-center justify-between p-6 glass-dark rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-white/5 rounded-md flex items-center justify-center text-white/40 font-black text-[10px]">VISA</div>
                  <div>
                    <p className="text-white font-bold">•••• 4242</p>
                    <p className="text-[10px] font-black text-soft-gray uppercase tracking-widest">Expires 12/28</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-black text-xs">Update</Button>
              </div>
            </div>
          </motion.div>
        );

      case 'data':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="p-8 glass-dark rounded-[2.5rem] border border-white/5 shadow-neon space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-emerald-400">
                  <Shield size={24} />
                  <h3 className="text-xl font-black text-white">Privacy & Sync</h3>
                </div>
                <Badge variant="glass" className="bg-white/5 border-white/10 text-[10px] py-1 px-3">
                  {isSupabaseConfigured ? 'Cloud Mode' : 'Local Mode'}
                </Badge>
              </div>
              
              <p className="text-soft-gray font-medium leading-relaxed">
                {isSupabaseConfigured 
                  ? 'Your learning progress is securely synced across all your devices using Falai Cloud.' 
                  : 'Your learning progress is stored locally on this device. Sign in with a cloud account to enable cross-device sync.'}
              </p>

              <div className="flex flex-col gap-4 pt-2">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                      {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Active'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-soft-gray">
                    {isSupabaseConfigured ? 'Real-time sync enabled' : 'Offline mode'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <Button variant="ghost" className="w-full justify-between py-8 px-6 glass-dark rounded-2xl border border-white/5 text-white hover:bg-white/5">
                <div className="flex items-center gap-4">
                  <Download size={18} className="text-soft-gray" />
                  <span className="font-bold">Export My Data</span>
                </div>
                <ChevronRight size={18} className="text-soft-gray" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleClearData}
                className="w-full justify-between py-8 px-6 glass-dark rounded-2xl border border-white/5 text-soft-pink hover:bg-soft-pink/5"
              >
                <div className="flex items-center gap-4">
                  <Trash2 size={18} />
                  <span className="font-bold">Reset All Progress</span>
                </div>
                <ChevronRight size={18} />
              </Button>
            </div>
          </motion.div>
        );

      case 'support':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-6 border border-white/5 glass-dark shadow-neon rounded-[2rem] space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-neon">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-white">Help Center</h4>
                    <p className="text-xs font-bold text-soft-gray">Guides and tutorials</p>
                  </div>
                </div>
                <Button variant="glass" className="w-full rounded-xl border-white/10 text-xs font-bold py-3">Visit Help Center</Button>
              </Card>

              <Card className="p-6 border border-white/5 glass-dark shadow-neon rounded-[2rem] space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-neon-cyan/10 flex items-center justify-center text-neon-cyan shadow-neon-cyan">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-white">Contact Support</h4>
                    <p className="text-xs font-bold text-soft-gray">Get help from our team</p>
                  </div>
                </div>
                <Button variant="glass" className="w-full rounded-xl border-white/10 text-xs font-bold py-3">Send Message</Button>
              </Card>
            </div>

            <Card className="p-8 border border-white/5 glass-dark shadow-neon rounded-[2.5rem] space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                  <h4 className="font-black text-white">App Information</h4>
                  <p className="text-sm text-soft-gray font-medium">Falai | Speak Like a Native</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="glass" className="bg-white/5 border-white/10 text-[10px] py-1.5 px-4">Version 1.2.4 (Stable)</Badge>
                  <Badge variant="glass" className="bg-white/5 border-white/10 text-[10px] py-1.5 px-4">Build 2026.03.24</Badge>
                </div>
              </div>
              
              <div className="h-px bg-white/5 w-full" />
              
              <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-soft-gray">
                <button className="hover:text-primary transition-colors">Privacy Policy</button>
                <button className="hover:text-primary transition-colors">Terms of Service</button>
                <button className="hover:text-primary transition-colors">Cookie Policy</button>
                <button className="hover:text-primary transition-colors">Licenses</button>
              </div>
            </Card>

            <footer className="pt-10 pb-20 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 opacity-30 grayscale">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Falai</span>
              </div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Made with ❤️ for language learners</p>
            </footer>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pb-24 space-y-10">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <SettingsIcon size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Preferences</span>
        </div>
        <h1 className="text-4xl font-black font-display tracking-tight text-white">Settings</h1>
        <p className="text-soft-gray font-medium">Customize your Falai experience.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Navigation */}
        <aside className="lg:w-72 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all border ${
                activeTab === item.id 
                  ? 'glass-dark border-primary/30 text-white shadow-neon' 
                  : 'bg-transparent border-transparent text-soft-gray hover:bg-white/5'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeTab === item.id ? 'bg-primary/20 ' + item.color : 'bg-white/5'
              }`}>
                <item.icon size={20} />
              </div>
              <span className="font-black text-sm tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-neon"
                />
              )}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 max-w-3xl">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
