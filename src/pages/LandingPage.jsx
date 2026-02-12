import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  MessageCircle,
  Camera,
  Newspaper,
  Cloud,
  ArrowRight,
  CheckCircle,
  Globe,
  Smartphone,
  Zap,
  Shield,
  Star,
  Users,
  Award,
  ChevronRight
} from 'lucide-react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: MessageCircle,
      title: t('landing.features.chat.title') || 'AI Advisory',
      description: t('landing.features.chat.desc') || 'Get instant answers to farming questions from our AI assistant',
      color: 'bg-[#768870]/10 text-[#768870]'
    },
    {
      icon: Camera,
      title: t('landing.features.disease.title') || 'Crop Scan',
      description: t('landing.features.disease.desc') || 'Identify crop diseases instantly with AI photo analysis',
      color: 'bg-[#8d9c8a]/10 text-[#8d9c8a]'
    },
    {
      icon: Cloud,
      title: t('landing.features.weather.title') || 'Weather',
      description: t('landing.features.weather.desc') || 'Real-time updates and localized recommendations',
      color: 'bg-[#7a8478]/10 text-[#7a8478]'
    },
    {
      icon: Newspaper,
      title: t('landing.features.news.title') || 'Schemes',
      description: t('landing.features.news.desc') || 'Stay updated with latest govt. programs and news',
      color: 'bg-[#768870]/10 text-[#768870]'
    }
  ];

  const benefits = [
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'Localized in English, Hindi, and Telugu for ease of access.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Works perfectly on low-end devices and poor networks.'
    },
    {
      icon: Zap,
      title: 'Instant Solutions',
      description: 'No waiting. Get your agricultural problems solved in seconds.'
    },
    {
      icon: Shield,
      title: 'Data Privacy',
      description: 'Your farm data is protected with enterprise-grade security.'
    }
  ];

  const stats = [
    { label: 'Registered Farmers', value: '10,000+', icon: Users },
    { label: 'Diseases Detected', value: '50,000+', icon: Zap },
    { label: 'States Covered', value: '12+', icon: Globe },
    { label: 'Success Rate', value: '98%', icon: Award }
  ];

  return (
    <div className="bg-[#fdfbf7] text-[#2a3328] font-sans selection:bg-[#768870]/20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#eeede6] py-3 px-6 h-[64px] flex items-center shadow-sm">
        <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#768870] rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#768870]">Kisan Connect</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block"><LanguageSelector variant="compact" /></div>
            <button
              onClick={() => navigate('/login')}
              className="text-[11px] font-black uppercase tracking-widest text-[#7a8478] hover:text-[#768870] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="kisan-btn-primary px-5 py-2.5 text-[11px] uppercase tracking-widest shadow-lg shadow-[#768870]/10"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#768870]/10 text-[#768870] text-[10px] font-black uppercase tracking-widest border border-[#768870]/20 animate-fade-in">
              <Star className="w-3.5 h-3.5 fill-[#768870]" />
              Empowering India's Backbone
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-[#2a3328] leading-[1.05] tracking-tighter">
              The Digital Farm <br />
              <span className="text-[#768870]">Revolution is Here.</span>
            </h1>

            <p className="text-base lg:text-lg font-medium text-[#7a8478] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Harness the power of AI to maximize your yield. From instant disease diagnosis
              to personalized government scheme alerts, Kisan Connect is your ultimate
              farming companion.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button
                onClick={() => navigate('/signup')}
                className="kisan-btn-primary px-10 py-5 rounded-2xl text-base uppercase tracking-widest shadow-2xl shadow-[#768870]/20 active:scale-95 group"
              >
                Join Now Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="kisan-card bg-transparent p-5 flex items-center justify-center gap-3 text-base font-bold border-[#eeede6] hover:bg-white active:scale-95 hover:border-[#768870]/30 transition-all"
              >
                Explore Platform
              </button>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4 pt-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#768870]" />
                <span className="text-xs font-bold text-[#7a8478]">Free for Farmers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#768870]" />
                <span className="text-xs font-bold text-[#7a8478]">Works Offline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#768870]" />
                <span className="text-xs font-bold text-[#7a8478]">Zero Learning Curve</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl bg-white p-4 border border-[#eeede6] transform rotate-3 hover:rotate-0 transition-all duration-700">
              <div className="aspect-[4/5] bg-[#f4f2eb] rounded-[30px] flex items-center justify-center relative overflow-hidden">
                <Sprout className="w-32 h-32 text-[#768870] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent flex items-end p-8">
                  <div className="w-full space-y-4">
                    <div className="h-4 bg-[#768870]/20 rounded-full w-3/4" />
                    <div className="h-4 bg-[#768870]/10 rounded-full w-1/2" />
                    <div className="h-12 bg-[#768870] rounded-2xl w-full" />
                  </div>
                </div>
              </div>
            </div>
            {/* Floating UI Elements */}
            <div className="absolute -top-6 -right-6 kisan-card p-5 shadow-2xl border-[#eeede6] bg-white animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider">AI Analysis</div>
                  <div className="text-[10px] text-[#7a8478] font-bold">Completed in 2.4s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-y border-[#eeede6] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#768870]">Core Platform</h2>
            <p className="text-4xl lg:text-5xl font-extrabold text-[#2a3328] tracking-tight">Everything you need to succeed.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="kisan-card p-8 flex flex-col gap-6 group hover:border-[#768870]/30 hover:-translate-y-2 cursor-default transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2a3328] mb-2 leading-tight">{feature.title}</h3>
                  <p className="text-sm font-medium text-[#7a8478] leading-relaxed opacity-80">{feature.description}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#768870] opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-[#fdfbf7]">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="space-y-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[#eeede6] flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-[#768870]" />
                  </div>
                  <h4 className="font-bold text-lg">{benefit.title}</h4>
                  <p className="text-xs text-[#7a8478] font-medium leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#768870]">Why Kisan Connect?</h2>
            <p className="text-4xl lg:text-5xl font-extrabold text-[#2a3328] tracking-tight">Built by Farmers, <br /> For Farmers.</p>
            <p className="text-base text-[#7a8478] leading-relaxed font-medium">
              We understand the challenges of Indian agriculture. Our platform is designed
              to be accessible, reliable, and powerful enough to transform your farm
              into a data-driven business.
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate('/signup')}
                className="kisan-btn-primary px-8 py-4 rounded-xl text-xs uppercase tracking-widest"
              >
                Learn More About Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#768870] text-white px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto border border-white/20">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-4xl font-extrabold tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-[800px] mx-auto text-center space-y-8">
          <Sprout className="w-16 h-16 text-[#768870] mx-auto opacity-20" />
          <h2 className="text-4xl lg:text-6xl font-extrabold text-[#2a3328] tracking-tighter leading-tight">
            Ready to grow the <br /> future of farming?
          </h2>
          <p className="text-lg text-[#7a8478] font-medium max-w-lg mx-auto">
            Join the thousands of farmers who are already scaling their production with Kisan Connect.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="kisan-btn-primary px-12 py-6 rounded-2xl text-lg uppercase tracking-widest shadow-2xl shadow-[#768870]/30 group"
          >
            Get Started Now
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Premium Detailed Footer */}
      <footer className="bg-white border-t border-[#eeede6] pt-20 pb-10 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#768870] rounded-lg flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-[#768870]">Kisan Connect</span>
              </div>
              <p className="text-sm font-medium text-[#7a8478] leading-relaxed">
                Empowering India's agricultural community with cutting-edge technology
                and data-driven insights. Built with pride in India.
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#2a3328] mb-6">Platform</h4>
              <ul className="space-y-4 text-sm font-bold text-[#7a8478]">
                <li className="hover:text-[#768870] cursor-pointer">AI Chat Bot</li>
                <li className="hover:text-[#768870] cursor-pointer">Crop Diagnosis</li>
                <li className="hover:text-[#768870] cursor-pointer">Market Prices</li>
                <li className="hover:text-[#768870] cursor-pointer">Weather Reports</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#2a3328] mb-6">Resources</h4>
              <ul className="space-y-4 text-sm font-bold text-[#7a8478]">
                <li className="hover:text-[#768870] cursor-pointer">Help Center</li>
                <li className="hover:text-[#768870] cursor-pointer">Farming Tips</li>
                <li className="hover:text-[#768870] cursor-pointer">Govt. Schemes</li>
                <li className="hover:text-[#768870] cursor-pointer">Community</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#2a3328] mb-6">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-[#7a8478]">
                <li className="hover:text-[#768870] cursor-pointer">Privacy Policy</li>
                <li className="hover:text-[#768870] cursor-pointer">Terms of Service</li>
                <li className="hover:text-[#768870] cursor-pointer">Cookies</li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-[#f4f2eb] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[11px] font-bold text-[#7a8478]/60 uppercase tracking-widest">
              © 2026 Kisan Connect Global Pvt. Ltd. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#768870]">Make In India</span>
              <div className="w-px h-4 bg-[#eeede6]" />
              <div className="flex gap-4">
                <Globe className="w-4 h-4 text-[#7a8478]" />
                <Smartphone className="w-4 h-4 text-[#7a8478]" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
