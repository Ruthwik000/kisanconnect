import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Phone, MapPin, Edit2, Save, X, Loader2, Sprout, Bell, Settings, LogOut, ChevronRight, Bookmark, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import BottomNav from '@/components/navigation/BottomNav';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, userProfile, updateProfile, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    farmerId: '',
    location: '',
    farmSize: '',
    crops: '',
    phone: '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        farmerId: userProfile.farmerId || '',
        location: userProfile.location || '',
        farmSize: userProfile.farmSize || '',
        crops: userProfile.crops || '',
        phone: userProfile.phone || '',
      });
    }
  }, [userProfile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
        toast.success(t('profile.updateSuccess') || 'Profile updated successfully');
      } else {
        toast.error(result.message || t('errors.serverError'));
      }
    } catch (error) {
      toast.error(t('errors.serverError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || '',
      farmerId: userProfile?.farmerId || '',
      location: userProfile?.location || '',
      farmSize: userProfile?.farmSize || '',
      crops: userProfile?.crops || '',
      phone: userProfile?.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-[#fdfbf7] text-[#2a3328]">
      {/* Unified Header */}
      <header className="app-header px-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#768870] rounded-lg flex items-center justify-center flex-shrink-0">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight truncate whitespace-nowrap">Your Profile</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <LanguageSelector variant="compact" />
          <button onClick={() => navigate('/news')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0"><Bell className="w-4 h-4" /></button>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="p-1.5 bg-[#768870]/10 rounded-full text-[#768870] hover:bg-[#768870]/20 transition-all flex-shrink-0">
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button onClick={handleCancel} className="p-1.5 bg-[#f4f2eb] rounded-full text-[#7a8478] hover:bg-gray-200 transition-all flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-1.5 bg-[#768870] rounded-full text-white hover:opacity-90 transition-all flex-shrink-0"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content (Flex-1) */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto overflow-y-auto scrollbar-hide p-6 space-y-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Left: Avatar Card */}
          <div className="space-y-6">
            <div className="kisan-card flex flex-col items-center py-8 text-center bg-white border-[#eeede6]">
              <div className="w-20 h-20 rounded-full bg-[#f4f2eb] border-2 border-[#768870]/20 flex items-center justify-center mb-4 relative overflow-hidden group">
                <User className="w-10 h-10 text-[#768870]" />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-lg font-extrabold text-[#2a3328]">{formData.name || 'User'}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/50 mt-1">Farmer / {formData.location || 'India'}</p>
              <div className="mt-6 w-full pt-6 border-t border-[#f4f2eb] space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#7a8478]">Farmer ID</span>
                  <span className="text-[#2a3328]">{formData.farmerId || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#7a8478]">Phone</span>
                  <span className="text-[#2a3328]">{formData.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <button onClick={logout} className="w-full kisan-card p-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 hover:border-red-100 transition-all font-bold text-sm">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Right: Form Area */}
          <div className="space-y-6">
            <div className="kisan-card bg-white border-[#eeede6]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/50 mb-6">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#7a8478] uppercase tracking-wider">Full Name</label>
                  <input
                    disabled={!isEditing}
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl px-4 py-3 text-sm font-semibold text-[#2a3328] disabled:opacity-70 focus:outline-[#768870]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#7a8478] uppercase tracking-wider">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                    <input
                      disabled={!isEditing}
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#2a3328] disabled:opacity-70 focus:outline-[#768870]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="kisan-card bg-white border-[#eeede6]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/50 mb-6">Farm Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#7a8478] uppercase tracking-wider">Farm Size (Acres)</label>
                  <input
                    disabled={!isEditing}
                    type="text"
                    value={formData.farmSize}
                    onChange={(e) => handleInputChange('farmSize', e.target.value)}
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl px-4 py-3 text-sm font-semibold text-[#2a3328] disabled:opacity-70 focus:outline-[#768870]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#7a8478] uppercase tracking-wider">Major Crops</label>
                  <input
                    disabled={!isEditing}
                    type="text"
                    value={formData.crops}
                    onChange={(e) => handleInputChange('crops', e.target.value)}
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl px-4 py-3 text-sm font-semibold text-[#2a3328] disabled:opacity-70 focus:outline-[#768870]"
                    placeholder="e.g. Rice, Wheat, Cotton"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Bookmark, label: 'Saved Items' },
                { icon: Settings, label: 'Settings' },
                { icon: Phone, label: 'Support' }
              ].map((item, idx) => (
                <button key={idx} className="kisan-card p-4 flex flex-col items-center gap-3 bg-white hover:border-[#768870]/30 transition-all border-[#eeede6] group text-center">
                  <div className="w-10 h-10 bg-[#f4f2eb] rounded-xl flex items-center justify-center group-hover:bg-[#768870]/10 transition-colors">
                    <item.icon className="w-5 h-5 text-[#768870]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#2a3328]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer flex-shrink-0">
        <BottomNav />
      </footer>
    </div>
  );
};

export default ProfilePage;
