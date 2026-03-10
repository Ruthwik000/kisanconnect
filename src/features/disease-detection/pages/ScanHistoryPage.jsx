import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye,
  Trash2,
  Download,
  Filter,
  Search,
  Sprout,
  Settings,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import { 
  getUserDiseaseDetectionsFromFirestore, 
  deleteDiseaseDetectionFromFirestore 
} from '@/features/disease-detection/services/diseaseFirestoreService';
import BottomNav from '@/shared/components/navigation/BottomNav';
import { toast } from 'sonner';

const ScanHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [scans, setScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  const [filter, setFilter] = useState('all'); // all, healthy, diseased
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadScanHistory();
  }, [user?.uid]);

  const loadScanHistory = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const history = await getUserDiseaseDetectionsFromFirestore(user.uid, 100);
      setScans(history);
    } catch (error) {
      console.error('Error loading scan history:', error);
      toast.error('Failed to load scan history');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteScan = async (scanId) => {
    try {
      await deleteDiseaseDetectionFromFirestore(scanId);
      setScans(scans.filter(scan => scan.id !== scanId));
      toast.success('Scan deleted successfully');
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast.error('Failed to delete scan');
    }
  };

  const downloadImage = (scan) => {
    if (scan.imageData) {
      const link = document.createElement('a');
      link.href = scan.imageData;
      link.download = `scan-${scan.disease}-${new Date(scan.createdAt.toDate()).toISOString().split('T')[0]}.jpg`;
      link.click();
    }
  };

  const filteredScans = scans.filter(scan => {
    const matchesFilter = filter === 'all' || 
      (filter === 'healthy' && scan.isHealthy) ||
      (filter === 'diseased' && !scan.isHealthy);
    
    const matchesSearch = searchTerm === '' || 
      scan.disease.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (isHealthy) => {
    return isHealthy ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusColor = (isHealthy) => {
    return isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(
      currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'te' ? 'te-IN' : 'en-IN',
      { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-[#fdfbf7] text-[#2a3328]">
      {/* Header */}
      <header className="app-header px-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/disease')}
            className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#768870] rounded-lg flex items-center justify-center flex-shrink-0">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight truncate whitespace-nowrap">
              Scan History
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <LanguageSelector variant="compact" />
          <button onClick={() => navigate('/news')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0">
            <Bell className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="px-4 py-3 bg-white border-b border-[#eeede6] flex-shrink-0">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#7a8478]" />
            <input
              type="text"
              placeholder="Search scans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#eeede6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#768870] focus:border-transparent"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', count: scans.length },
              { key: 'healthy', label: 'Healthy', count: scans.filter(s => s.isHealthy).length },
              { key: 'diseased', label: 'Diseased', count: scans.filter(s => !s.isHealthy).length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === key
                    ? 'bg-[#768870] text-white'
                    : 'bg-[#f4f2eb] text-[#7a8478] hover:bg-[#eeede6]'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="kisan-card p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-[#f4f2eb] rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#f4f2eb] w-3/4 rounded mb-2" />
                    <div className="h-3 bg-[#f4f2eb] w-1/2 rounded mb-2" />
                    <div className="h-3 bg-[#f4f2eb] w-1/4 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#f4f2eb] rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-8 h-8 text-[#7a8478]" />
            </div>
            <h3 className="text-lg font-bold text-[#2a3328] mb-2">No scans found</h3>
            <p className="text-[#7a8478] text-sm mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Start scanning plants to see your history here'
              }
            </p>
            <button
              onClick={() => navigate('/disease')}
              className="bg-[#768870] text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start Scanning
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredScans.map((scan) => (
              <div
                key={scan.id}
                className={`kisan-card p-4 border ${getStatusColor(scan.isHealthy)} hover:shadow-md transition-all`}
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 bg-[#f4f2eb] rounded-lg overflow-hidden flex-shrink-0">
                    {scan.imageData ? (
                      <img
                        src={scan.imageData}
                        alt="Scanned plant"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sprout className="w-6 h-6 text-[#7a8478]" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(scan.isHealthy)}
                        <h3 className="font-bold text-sm text-[#2a3328] truncate">
                          {scan.disease}
                        </h3>
                      </div>
                      <span className="text-xs text-[#7a8478] bg-white px-2 py-1 rounded">
                        {Math.round(scan.confidence * 100)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-[#7a8478] mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(scan.createdAt)}</span>
                      </div>
                      <span className="capitalize">{scan.method?.replace('_', ' ')}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedScan(scan)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#768870] text-white rounded text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      {scan.imageData && (
                        <button
                          onClick={() => downloadImage(scan)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#f4f2eb] text-[#7a8478] rounded text-xs font-medium hover:bg-[#eeede6] transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Save
                        </button>
                      )}
                      <button
                        onClick={() => deleteScan(scan.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#2a3328]">Scan Details</h2>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="p-2 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              {selectedScan.imageData && (
                <div className="mb-4">
                  <img
                    src={selectedScan.imageData}
                    alt="Scanned plant"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedScan.isHealthy)}
                  <div>
                    <h3 className="font-bold text-lg text-[#2a3328]">{selectedScan.disease}</h3>
                    <p className="text-sm text-[#7a8478]">
                      Confidence: {Math.round(selectedScan.confidence * 100)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-[#7a8478]">Date:</span>
                    <p className="text-[#2a3328]">{formatDate(selectedScan.createdAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[#7a8478]">Method:</span>
                    <p className="text-[#2a3328] capitalize">{selectedScan.method?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[#7a8478]">Language:</span>
                    <p className="text-[#2a3328] uppercase">{selectedScan.language}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[#7a8478]">Status:</span>
                    <p className={`font-medium ${selectedScan.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedScan.isHealthy ? 'Healthy' : 'Diseased'}
                    </p>
                  </div>
                </div>

                {/* Full Analysis */}
                {selectedScan.fullAnalysis && (
                  <div>
                    <h4 className="font-bold text-[#2a3328] mb-2">Full Analysis:</h4>
                    <div className="bg-[#f4f2eb] p-4 rounded-lg text-sm text-[#2a3328] whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {selectedScan.fullAnalysis}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer flex-shrink-0">
        <BottomNav />
      </footer>
    </div>
  );
};

export default ScanHistoryPage;