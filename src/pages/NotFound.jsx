import { useNavigate } from "react-router-dom";
import { Sprout, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="no-scroll-view bg-[#fdfbf7] items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-sm">
        <div className="w-20 h-20 bg-[#f4f2eb] rounded-3xl flex items-center justify-center mx-auto border border-[#eeede6] shadow-sm">
          <Sprout className="w-10 h-10 text-[#768870] opacity-30" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-[#2a3328] tracking-tighter">404</h1>
          <p className="text-sm font-bold text-[#7a8478] uppercase tracking-[0.2em]">Page Not Found</p>
        </div>

        <p className="text-xs font-medium text-[#7a8478] leading-relaxed">
          The page you are looking for doesn't exist or has been moved to a new field.
        </p>

        <button
          onClick={() => navigate('/')}
          className="kisan-btn-primary w-full py-4 uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-[#768870]/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Farm
        </button>
      </div>
    </div>
  );
};

export default NotFound;
