/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  ChevronRight, 
  MapPin, 
  ArrowRight, 
  BarChart3, 
  Mail, 
  Phone, 
  Instagram, 
  Facebook, 
  Linkedin, 
  LayoutDashboard,
  Maximize2,
  MessageSquare,
  TrendingUp,
  Award,
  Filter,
  Menu,
  X
} from "lucide-react";
import { BRAND, IMAGES, PROJECTS } from "./constants";
import { Logo } from "./components/Logo";
import { AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "./lib/auth";
import { LogOut, User as UserIcon, Calendar, Clock, CheckCircle2, Lock, ShieldCheck, Mail as MailIcon } from "lucide-react";

// --- Components ---

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [copyStatus, setCopyStatus] = useState("Copy Domain");

  const getErrorMessage = (err: any) => {
    const projectId = "brij-dhara";
    switch (err.code) {
      case 'auth/operation-not-allowed':
        return `AUTHENTICATION_REQUIRED: Sign-in providers are currently disabled in your Firebase Core.`;
      case 'auth/unauthorized-domain':
        return `DOMAIN_AUTHORIZATION_REQUIRED: The current environment (${window.location.hostname}) is not yet whitelisted in your Firebase Security Cloud.`;
      case 'auth/popup-closed-by-user':
        return "Process interrupted by user. Please re-initiate.";
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return "Credential mismatch. Access denied.";
      default:
        return `${err.message || "Encryption error."} (Code: ${err.code})`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.hostname);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus("Copy Domain"), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-blue/60 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-brand-surface border border-brand-gold/30 shadow-2xl p-8 md:p-12 overflow-hidden isolate"
      >
        <div className="blueprint-grid absolute inset-0 opacity-10 pointer-events-none" />
        
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="relative z-10 text-center mb-10">
          <ShieldCheck className="text-brand-gold w-12 h-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white tracking-tighter">
            {isSignUp ? "CREATE" : "SECURE"} <span className="text-stroke">IDENTITY</span>
          </h2>
          <p className="text-brand-champagne/40 text-[10px] uppercase font-black tracking-[0.2em] mt-4">
            Access your cinematic asset portal
          </p>
        </div>

        <div className="flex gap-4 p-1 bg-white/5 border border-white/10 mb-8">
          <button 
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${!isSignUp ? 'bg-brand-gold text-brand-blue' : 'text-white/40 hover:text-white'}`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${isSignUp ? 'bg-brand-gold text-brand-blue' : 'text-white/40 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black p-4 mb-4 text-center uppercase tracking-[0.2em] relative overflow-hidden group">
            <div className="blueprint-grid absolute inset-0 opacity-10 pointer-events-none" />
            <span className="relative z-10">{error}</span>
          </div>
        )}

        {(error.includes("REQUIRED") || error.includes("authorized")) && (
          <div className="bg-brand-surface border border-brand-gold/20 p-6 mb-8 relative">
            <div className="absolute -top-3 left-6 bg-brand-gold text-brand-blue px-3 py-1 text-[8px] font-black uppercase tracking-widest">
              Security Protocol
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[8px] text-brand-gold/50 uppercase font-black tracking-widest mb-1">Current Domain</div>
                  <div className="text-[10px] text-white font-mono">{window.location.hostname}</div>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold text-[8px] font-black uppercase tracking-widest px-3 py-2 transition-all border border-brand-gold/20"
                >
                  {copyStatus}
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-white text-[10px] font-black uppercase tracking-widest">Initialization Steps:</h4>
                <ol className="text-white/40 text-[9px] space-y-2 list-decimal ml-4 uppercase tracking-tighter">
                  <li>Access <span className="text-brand-gold">Firebase Console</span> for project <span className="text-white">brij-dhara</span></li>
                  <li>Go to <span className="text-white">Authentication</span> &gt; <span className="text-white">Settings</span> &gt; <span className="text-white">Authorized Domains</span></li>
                  <li>Click <span className="text-brand-gold">Add Domain</span> and paste the copied domain above</li>
                  <li>Ensure <span className="text-brand-gold">Google</span> and <span className="text-brand-gold">Email/Password</span> are active in <span className="text-white">Sign-in method</span></li>
                </ol>
              </div>

              <a 
                href="https://console.firebase.google.com/project/brij-dhara/authentication/settings" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center py-3 bg-brand-gold text-brand-blue text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl"
              >
                Access Firebase Console →
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-brand-gold/50 text-[10px] uppercase tracking-widest font-black">Full Legal Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                <input 
                  required
                  type="text" 
                  placeholder="Investor Name" 
                  className="w-full bg-white/5 border-b border-white/10 p-4 pl-12 text-white focus:outline-none focus:border-brand-gold transition-colors placeholder:text-white/10 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-brand-gold/50 text-[10px] uppercase tracking-widest font-black">Email Identity</label>
            <div className="relative">
              <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
              <input 
                required
                type="email" 
                placeholder="email@vault.com" 
                className="w-full bg-white/5 border-b border-white/10 p-4 pl-12 text-white focus:outline-none focus:border-brand-gold transition-colors placeholder:text-white/10 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-brand-gold/50 text-[10px] uppercase tracking-widest font-black">Access Code</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
              <input 
                required
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-white/5 border-b border-white/10 p-4 pl-12 text-white focus:outline-none focus:border-brand-gold transition-colors placeholder:text-white/10 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="gold-sweep w-full bg-brand-gold text-brand-blue py-5 font-black tracking-[0.3em] text-[10px] transition-all disabled:opacity-50"
          >
            {loading ? "PROCESSING..." : isSignUp ? "CREATE ACCOUNT" : "AUTHORIZE ACCESS"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
          <p className="text-center text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mb-6">Or continue with third-party verification</p>
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 py-5 flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-black text-[10px] tracking-widest text-white disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
            GOOGLE IDENTITY
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const FloatingActions = () => {
  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
      <motion.a
        href={`https://wa.me/${BRAND.contact.phones[0]}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.9 }}
        className="bg-green-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20"
      >
        <MessageSquare size={24} />
      </motion.a>
      <motion.a
        href={`tel:${BRAND.contact.phones[0]}`}
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.9 }}
        className="bg-brand-gold text-brand-blue p-4 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20"
      >
        <Phone size={24} />
      </motion.a>
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEnquireClick = () => {
    setIsMenuOpen(false);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "Story", href: "#about" },
    { name: "Projects", href: "#portfolio" },
    { name: "Invest", href: "#calculator" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isMenuOpen 
            ? "bg-transparent py-6" 
            : isScrolled 
              ? "bg-brand-blue/95 backdrop-blur-xl py-4 border-b border-brand-gold/20" 
              : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsMenuOpen(false);
              }}
              className="flex items-center cursor-pointer group isolate"
            >
            <motion.div 
              animate={{ rotateY: 360 }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "linear"
              }}
              className="flex items-center"
            >
              <Logo 
                className={`h-16 md:h-32 transition-all duration-500 group-hover:scale-105 ${isScrolled ? "opacity-90" : "opacity-100"}`} 
                light={!isScrolled}
              />
            </motion.div>
            </div>
            
            {/* 11 Year Trust Badge - Desktop Only */}
            <div className="hidden lg:flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 px-3 py-1 scale-90">
               <Award size={14} className="text-brand-gold" />
               <span className="text-white text-[8px] font-black uppercase tracking-widest whitespace-nowrap">11 YEARS OF TRUST</span>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
              hidden: {}
            }}
            className="hidden md:flex items-center gap-8 text-[10px] font-black tracking-[0.2em] text-brand-gold uppercase"
          >
            {navLinks.map((link) => (
              <motion.a 
                key={link.name}
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 }
                }}
                href={link.href} 
                className="hover:text-white transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
              </motion.a>
            ))}

            {user ? (
              <div className="flex items-center gap-4">
                {user.email === "brijdhararealtech@gmail.com" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      const bookingsSection = document.getElementById('my-bookings');
                      if (bookingsSection) bookingsSection.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hidden lg:flex items-center gap-2 bg-brand-gold text-brand-blue px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg"
                  >
                    <ShieldCheck size={14} /> Admin Hub
                  </motion.button>
                )}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 hover:bg-white/10 transition-all font-black text-[10px] tracking-widest"
                  >
                    <img src={user.photoURL || ""} alt={user.displayName || ""} className="w-6 h-6 rounded-full border border-brand-gold/30" />
                    <span className="text-white uppercase">{user.displayName?.split(' ')[0]}</span>
                  </motion.button>
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-brand-surface border border-brand-gold/20 shadow-2xl p-2 z-50 text-[10px] font-black uppercase tracking-widest"
                      >
                        <button 
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            const bookingsSection = document.getElementById('my-bookings');
                            if (bookingsSection) bookingsSection.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-brand-gold hover:text-brand-blue transition-colors flex items-center gap-2"
                        >
                          <Calendar size={14} /> {user.email === "brijdhararealtech@gmail.com" ? "All Visits" : "My Visits"}
                        </button>
                        <button 
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 border-t border-white/5"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <motion.button
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-white text-[10px] font-black uppercase tracking-widest hover:text-brand-gold transition-colors"
                >
                  SIGN IN
                </motion.button>
                <motion.button
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden lg:block border border-brand-gold/30 text-white px-6 py-2 hover:bg-brand-gold hover:text-brand-blue transition-all"
                >
                  SIGN UP
                </motion.button>
              </div>
            )}

            <motion.button 
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0 }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEnquireClick}
              className="gold-sweep bg-brand-gold text-brand-blue px-8 py-3 rounded-none font-black text-[10px] hover:bg-white transition-all shadow-xl"
            >
              ENQUIRE NOW
            </motion.button>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-brand-gold p-2"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-brand-blue backdrop-blur-3xl flex flex-col items-center justify-center gap-8 md:hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(197,160,89,0.1),transparent_70%)] pointer-events-none" />
            <div className="blueprint-grid absolute inset-0 opacity-10 pointer-events-none" />
            
            <div className="absolute top-8 left-8 isolate" onClick={() => setIsAuthModalOpen(true)}>
              <Logo className="h-24 transition-opacity" light={true} />
            </div>
            
            {!user && (
              <div className="absolute top-8 right-8 flex gap-4">
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="text-brand-gold font-black uppercase tracking-[0.2em] text-[10px]"
                >
                  Join Legacy
                </button>
              </div>
            )}
            
            <div className="flex flex-col items-center gap-8 relative z-10">
              {navLinks.map((link, idx) => (
                <motion.a
                  key={link.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.2 }}
                  href={link.href}
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                  className="text-3xl font-black text-brand-gold uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleEnquireClick}
                className="gold-sweep bg-brand-gold text-brand-blue px-12 py-5 font-black tracking-[0.3em] text-xs mt-4"
              >
                SECURE YOUR PLOT
              </motion.button>
            </div>

            <div className="absolute bottom-12 flex items-center gap-6 text-brand-gold/40">
              <Instagram size={20} />
              <Facebook size={20} />
              <Linkedin size={20} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

const Hero = () => {
  return (
    <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-brand-blue">
      {/* Background with Parallax effect */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={IMAGES.hero} 
          alt="Luxury Architecture" 
          className="w-full h-full object-cover opacity-60 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue via-transparent to-brand-blue/60" />
      </motion.div>

      {/* Sun-Ray Overlay */}
      <div className="sun-ray absolute inset-0 z-1 pointer-events-none" />

      {/* Blueprint Grid Overlay */}
      <div className="blueprint-grid absolute inset-0 z-1 pointer-events-none opacity-20" />

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span className="block text-brand-gold tracking-[0.4em] text-xs md:text-sm uppercase mb-4 font-bold">
            ESTABLISHED SINCE {new Date().getFullYear() - BRAND.yearsOfTrust}
          </span>
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold text-white mb-6 tracking-tighter leading-tight">
            THE <span className="text-stroke">CINEMATIC</span><br />
            ARCHITECTURE
          </h1>
          <p className="max-w-2xl mx-auto text-brand-champagne/70 text-lg md:text-xl font-light mb-10 leading-relaxed italic">
            "{BRAND.tagline}" — Crafting timeless spaces with cinematic grandeur and architectural excellence.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button 
              className="gold-sweep group bg-brand-gold text-brand-blue px-10 py-4 font-bold tracking-widest text-sm flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
            >
              EXPLORE LEGACY <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              className="border border-brand-gold/30 text-white px-10 py-4 font-bold tracking-widest text-sm hover:bg-white hover:text-brand-blue transition-all active:scale-95"
            >
              VIEW BROCHURE
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-brand-gold/50 flex flex-col items-center"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] mb-2 text-white/40">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-brand-gold/50 to-transparent" />
      </motion.div>
    </section>
  );
};

const Calculator = () => {
  const [investment, setInvestment] = useState(100); // In Lakhs
  const [years, setYears] = useState(5);
  const [selectedLocation, setSelectedLocation] = useState(PROJECTS[0].id);

  const currentProject = PROJECTS.find(p => p.id === selectedLocation) || PROJECTS[0];
  const roiMultiplier = currentProject.roi;
  const roiValue = (investment * Math.pow(roiMultiplier, years)).toFixed(1);
  const appreciation = (parseFloat(roiValue) - investment).toFixed(1);

  return (
    <section id="calculator" className="py-24 bg-brand-blue relative overflow-hidden">
       {/* Background Grid */}
       <div className="blueprint-grid absolute inset-0 opacity-10 pointer-events-none" />
       
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              INVESTMENT <br/>
              <span className="text-brand-gold">GROWTH TRACKER</span>
            </h2>
            <p className="text-brand-champagne/60 mb-12 text-lg leading-relaxed max-w-md">
              Calculate your legacy's appreciation. Select a strategic corridor to see how our cinematic designs yield massive ROI.
            </p>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px] block">Select Strategic Hub</label>
                <div className="grid grid-cols-2 gap-4">
                  {PROJECTS.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setSelectedLocation(proj.id);
                      }}
                      className={`p-4 text-left border transition-all ${
                        selectedLocation === proj.id 
                        ? "bg-brand-gold text-brand-blue border-brand-gold" 
                        : "bg-white/5 text-white/50 border-white/10 hover:border-brand-gold/50"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold mb-1 opacity-60">{proj.location}</div>
                      <div className="font-bold text-sm">{proj.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px]">Investment (₹ Lakhs)</label>
                  <span className="text-white font-black text-2xl tracking-tighter">₹{investment} L</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="500" 
                  step="5"
                  value={investment} 
                  onChange={(e) => {
                    setInvestment(parseInt(e.target.value));
                  }}
                  className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-brand-gold"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px]">Horizon (Years)</label>
                  <span className="text-white font-black text-2xl tracking-tighter">{years} YRS</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={years} 
                  onChange={(e) => {
                    setYears(parseInt(e.target.value));
                  }}
                  className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-brand-gold"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-brand-surface border border-brand-gold/20 p-12 relative shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <TrendingUp size={160} className="text-brand-gold" />
            </div>
            
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-3 text-brand-gold mb-2">
                <TrendingUp size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Projected Asset Valuation</span>
              </div>
              
              <div className="text-6xl md:text-7xl font-black text-white tracking-tighter">
                ₹{roiValue} L<span className="text-brand-gold text-base ml-2">*</span>
              </div>
              
              <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/5">
                <div>
                  <span className="text-brand-gold/50 text-[10px] uppercase font-black tracking-widest block mb-2">Capital Gains</span>
                  <div className="text-3xl font-bold text-white tracking-tight">+₹{appreciation} L</div>
                </div>
                <div>
                  <span className="text-brand-gold/50 text-[10px] uppercase font-black tracking-widest block mb-2">ROI Rate</span>
                  <div className="text-3xl font-bold text-brand-gold tracking-tight">{((roiMultiplier - 1) * 100).toFixed(0)}% ANNALIZED</div>
                </div>
              </div>

              <div className="bg-brand-blue/50 p-6 border border-brand-gold/10">
                <p className="text-[10px] text-brand-champagne/40 italic leading-relaxed">
                  *This calculation includes a premium location surcharge for <span className="text-brand-gold font-bold">{currentProject.location}</span>. 
                  Market dynamics and infrastructure developments near NH-2 and highway corridors are major growth drivers.
                </p>
              </div>

              <button 
                className="gold-sweep w-full bg-brand-gold text-brand-blue py-5 font-black tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 group"
              >
                REQUEST PROSPECTUS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const PortfolioProject = ({ project, idx }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      onMouseEnter={() => { setIsHovered(true); }}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer bg-brand-surface border border-white/5 transition-all hover:border-brand-gold/30"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {isHovered && project.video ? (
          <video 
            src={project.video} 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={project.image} 
            alt={project.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Location Badge */}
        <div className="absolute top-4 left-4 bg-brand-blue/80 backdrop-blur-md px-3 py-1 border border-brand-gold/20 flex items-center gap-2">
          <MapPin size={10} className="text-brand-gold" />
          <span className="text-white text-[10px] font-bold uppercase tracking-widest">{project.location}</span>
        </div>

        {/* Fly-through trigger placeholder / animation label */}
        <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
          <div className="bg-brand-gold text-brand-blue px-3 py-1 flex items-center gap-2 scale-90">
            <Maximize2 size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Fly-Through Active</span>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-brand-gold uppercase text-[10px] tracking-[0.3em] font-black block mb-2">{project.type}</span>
            <h3 className="text-2xl font-bold text-white group-hover:text-brand-gold transition-colors">{project.name}</h3>
          </div>
          <div className="bg-brand-gold/10 text-brand-gold text-[8px] font-black uppercase tracking-widest px-2 py-1 border border-brand-gold/20">
            {project.badge}
          </div>
        </div>
        <p className="text-brand-champagne/40 text-sm leading-relaxed mb-6 h-12 overflow-hidden">{project.desc}</p>
        
        <div className="flex items-center gap-2 text-brand-gold text-[10px] font-bold uppercase tracking-widest group-hover:gap-4 transition-all">
          <span>Explore Excellence</span>
          <ArrowRight size={12} />
        </div>
      </div>
    </motion.div>
  );
};

const Portfolio = () => {
  const [filter, setFilter] = useState("All");
  const filteredProjects = filter === "All" ? PROJECTS : PROJECTS.filter(p => p.type === filter);

  return (
    <section id="portfolio" className="py-32 bg-brand-blue relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <span className="text-brand-gold tracking-[0.4em] text-xs font-black uppercase mb-4 block">Strategic Developments</span>
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight">
              ARCHITECTURAL<br/>
              <span className="text-stroke">MASTERPIECES</span>
            </h2>
          </motion.div>
          
          <div className="flex flex-wrap gap-2">
            {["All", "Residential", "Commercial"].map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); }}
                className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                  filter === f 
                  ? "bg-brand-gold text-brand-blue border-brand-gold" 
                  : "bg-transparent text-white/40 border-white/10 hover:border-brand-gold/40 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10">
          {filteredProjects.map((project, idx) => (
            <PortfolioProject key={project.id} project={project} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Timeline = () => {
  const milestones = [
    { year: "2013", title: "Foundation", desc: "Brij Dhara was born with a vision of cinematic life." },
    { year: "2016", title: "First Landmark", desc: "Completion of Kanha Kunj, redefining luxury residential space." },
    { year: "2019", title: "Commercial Expansion", desc: "Hetvik Plaza becomes a business icon in the region." },
    { year: "2024", title: "Future Vision", desc: "Launching 5 new mega-projects across high-growth corridors." },
  ];

  return (
    <section className="py-24 bg-[var(--color-brand-charcoal)] overflow-hidden relative">
      <div className="blueprint-grid absolute inset-0 opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">A DECADE OF <span className="text-[var(--color-brand-gold)]">TRUST</span></h2>
          <div className="w-24 h-1 bg-[var(--color-brand-gold)] mx-auto" />
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 hidden md:block" />

          <div className="space-y-20">
            {milestones.map((ms, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? "md:flex-row-reverse" : ""}`}
              >
                <div className="flex-1 text-center md:text-left">
                  <div className={`md:flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <div className={idx % 2 === 0 ? "text-left" : "md:text-right"}>
                      <span className="text-[var(--color-brand-gold)] text-4xl font-black mb-2 block">{ms.year}</span>
                      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{ms.title}</h3>
                      <p className="text-white/50 max-w-sm mx-auto md:mx-0">{ms.desc}</p>
                    </div>
                  </div>
                </div>
                <div 
                  className="w-4 h-4 rounded-full bg-[var(--color-brand-gold)] relative z-10 shrink-0 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-[var(--color-brand-gold)] animate-ping opacity-25 rounded-full" />
                </div>
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeFilter, setActiveFilter] = useState("pending"); // pending, confirmed, all, enquiries
  const [activeTab, setActiveTab] = useState("visits"); // visits, enquiries

  useEffect(() => {
    if (!user) return;

    const checkAdmin = async () => {
      if (user.email === "brijdhararealtech@gmail.com") {
        setIsAdmin(true);
        return;
      }
      try {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        setIsAdmin(adminDoc.exists());
      } catch (e) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Fetch Bookings
    const bookingsRef = collection(db, "bookings");
    const bookingsQuery = isAdmin 
      ? query(bookingsRef, orderBy("createdAt", "desc"))
      : query(bookingsRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(docs);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch bookings:", error);
      setLoading(false);
    });

    // Fetch Enquiries for Admins
    let unsubscribeEnquiries = () => {};
    if (isAdmin) {
      const enquiriesRef = collection(db, "enquiries");
      const enquiriesQuery = query(enquiriesRef, orderBy("createdAt", "desc"));
      unsubscribeEnquiries = onSnapshot(enquiriesQuery, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEnquiries(docs);
      });
    }

    return () => {
      unsubscribeBookings();
      unsubscribeEnquiries();
    };
  }, [user, isAdmin]);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status: newStatus });
    } catch (error) {
      console.error("Failed to update booking status:", error);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeFilter === "all") return true;
    return b.status === activeFilter;
  });

  if (!user) return null;

  return (
    <section id="my-bookings" className="py-24 bg-brand-blue relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-brand-gold tracking-[0.4em] text-xs font-black uppercase mb-4 block">
              {isAdmin ? "Central Management" : "Personal Dashboard"}
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight">
              {isAdmin ? "CONTROL" : "MY"} <span className="text-stroke">CENTER</span>
            </h2>
          </div>
          {isAdmin && (
            <div className="flex gap-4 p-1 bg-white/5 border border-white/10 rounded-none">
               <button 
                onClick={() => setActiveTab("visits")}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "visits" ? "bg-brand-gold text-brand-blue" : "text-white/40 hover:text-white"}`}
              >
                Visits
              </button>
              <button 
                onClick={() => setActiveTab("enquiries")}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "enquiries" ? "bg-brand-gold text-brand-blue" : "text-white/40 hover:text-white"}`}
              >
                Enquiries
              </button>
            </div>
          )}
        </div>

        {activeTab === "visits" ? (
          <>
            <div className="flex flex-wrap gap-2 mb-8">
              {["pending", "confirmed", "declined", "all"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${
                    activeFilter === f 
                    ? "bg-brand-gold text-brand-blue border-brand-gold" 
                    : "bg-transparent text-white/40 border-white/10 hover:border-brand-gold/40 hover:text-white"
                  }`}
                >
                  {f} {isAdmin ? `(${bookings.filter(b => f === 'all' ? true : b.status === f).length})` : ''}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center text-white/20">Syncing architectural data...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-brand-surface border border-white/5 p-12 text-center">
                <Calendar size={48} className="mx-auto text-white/10 mb-6" />
                <p className="text-brand-champagne/40">No visits found in this category.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookings.map((booking) => (
                  <motion.div 
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-surface border border-brand-gold/20 p-8 relative isolate overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={100} className="text-brand-gold" />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="max-w-[70%]">
                        {isAdmin && (
                          <div className="flex items-center gap-2 mb-2">
                            <UserIcon size={10} className="text-brand-gold" />
                            <span className="text-white text-[8px] font-bold uppercase tracking-widest truncate">{booking.userName}</span>
                          </div>
                        )}
                        <span className="text-brand-gold uppercase text-[10px] tracking-[0.3em] font-black block mb-1">Appointment</span>
                        <h3 className="text-xl font-bold text-white tracking-tight">{booking.projectName}</h3>
                      </div>
                      <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 border shadow-xl ${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                        booking.status === 'declined' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                        booking.status === 'pending' ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/30' : 
                        'bg-white/5 text-white/40 border-white/10'
                      }`}>
                        {booking.status}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-brand-champagne/60">
                        <Calendar size={14} className="text-brand-gold" />
                        <span className="text-sm">{new Date(booking.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-brand-champagne/60">
                        <Clock size={14} className="text-brand-gold" />
                        <span className="text-sm">{booking.time}</span>
                      </div>
                      {isAdmin && booking.userEmail && (
                        <div className="flex items-center gap-3 text-brand-champagne/40">
                          <Mail size={14} className="text-brand-gold/50" />
                          <span className="text-xs italic">{booking.userEmail}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[10px] text-white/20 font-mono">
                        REF: {booking.id.slice(0, 8).toUpperCase()}
                      </div>
                      {isAdmin && booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="bg-green-500/20 hover:bg-green-500/40 text-green-400 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                             onClick={() => updateBookingStatus(booking.id, 'declined')}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {enquiries.length === 0 ? (
               <div className="bg-brand-surface border border-white/5 p-12 text-center">
                <MessageSquare size={48} className="mx-auto text-white/10 mb-6" />
                <p className="text-brand-champagne/40">No general enquiries received.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-gold/10">
                      <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-gold">Investor</th>
                      <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-gold">Contact</th>
                      <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-gold">Asset</th>
                      <th className="py-4 text-[10px] font-black uppercase tracking-widest text-brand-gold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {enquiries.map((enq) => (
                      <tr key={enq.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-6">
                          <div className="font-bold text-white">{enq.name}</div>
                        </td>
                        <td className="py-6">
                          <div className="text-brand-champagne/60 text-xs">{enq.email}</div>
                          <div className="text-brand-champagne/40 text-xs font-mono">{enq.phone}</div>
                        </td>
                        <td className="py-6">
                          <div className="text-xs uppercase font-black tracking-widest text-brand-gold/70">{enq.project}</div>
                        </td>
                        <td className="py-6 text-[10px] text-white/20 font-mono">
                          {enq.createdAt?.toDate().toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};


const ContactForm = () => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    project: PROJECTS[0].name,
    isBooking: false,
    date: "",
    time: "10:00 AM"
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ 
        ...prev, 
        name: user.displayName || "", 
        email: user.email || "" 
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const isActuallyBooking = formData.isBooking && user;
    const path = isActuallyBooking ? 'bookings' : 'enquiries';
    
    try {
      if (isActuallyBooking) {
        await addDoc(collection(db, path), {
          userId: user.uid,
          userName: user.displayName || "Anonymous",
          userEmail: user.email || "",
          projectName: formData.project,
          date: formData.date,
          time: formData.time,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'enquiries'), {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          project: formData.project,
          createdAt: serverTimestamp()
        });
      }
      
      setSubmitted(true);
      setFormData(prev => ({ 
        ...prev, 
        isBooking: false, 
        date: "", 
        time: "10:00 AM" 
      }));
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-brand-blue relative">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-brand-gold tracking-[0.4em] text-xs font-black uppercase mb-4 block">Secure Your Asset</span>
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-10 tracking-tighter leading-tight">
            {formData.isBooking ? "SCHEDULE" : "CLAIM YOUR"} <br/><span className="text-stroke">{formData.isBooking ? "VISIT" : "LEGACY"}</span>
          </h2>
          <p className="text-brand-champagne/60 mb-12 text-lg leading-relaxed max-w-md">
            {formData.isBooking 
              ? "Select your preferred slot for a private architectural tour of our masterpieces."
              : "Our architectural advisors are ready to guide your next high-yield investment. Start your cinematic journey now."}
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                <MapPin className="text-brand-gold w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-black mb-1 uppercase tracking-widest text-[10px]">Corporate Hub</h4>
                <p className="text-brand-champagne/40 text-sm">{BRAND.contact.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="p-4 bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                <Phone className="text-brand-gold w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-black mb-1 uppercase tracking-widest text-[10px]">Investor Concierge</h4>
                <p className="text-brand-champagne/40 text-sm font-mono">+91 {BRAND.contact.phones.join(" / ")}</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="p-4 bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                <Mail className="text-brand-gold w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-black mb-1 uppercase tracking-widest text-[10px]">Correspondence</h4>
                <p className="text-brand-champagne/40 text-sm">{BRAND.contact.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-brand-gold p-px"
        >
          <div className="bg-brand-surface p-10 md:p-14 h-full relative overflow-hidden">
            <div className="blueprint-grid absolute inset-0 opacity-5 pointer-events-none" />
            
            {!user && formData.isBooking ? (
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center py-20 px-6">
                <UserIcon size={48} className="text-brand-gold/20 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Identity Verification Required</h3>
                <p className="text-brand-champagne/40 text-sm mb-10 leading-relaxed">
                  To secure a private site visit, please provide your credentials. This ensures a personalized architectural walkthrough.
                </p>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="gold-sweep bg-brand-gold text-brand-blue px-10 py-4 font-black tracking-widest text-xs"
                >
                  SIGN IN TO BOOK
                </button>
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
                <button 
                  onClick={() => setFormData({...formData, isBooking: false})}
                  className="mt-6 text-brand-gold/40 hover:text-brand-gold text-[10px] uppercase font-black tracking-widest transition-colors"
                >
                  Proceed with Simple Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="flex gap-4 p-1 bg-white/5 border border-white/10 rounded-none mb-8">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, isBooking: false})}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${!formData.isBooking ? 'bg-brand-gold text-brand-blue' : 'text-white/40 hover:text-white'}`}
                  >
                    Quick Enquiry
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, isBooking: true})}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${formData.isBooking ? 'bg-brand-gold text-brand-blue' : 'text-white/40 hover:text-white'}`}
                  >
                    Schedule Visit
                  </button>
                </div>

                {!formData.isBooking && (
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-brand-gold/50 text-[10px] uppercase tracking-widest font-black">Full Legal Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Investor Name" 
                        className="w-full bg-white/5 border-b border-white/10 p-5 text-white focus:outline-none focus:border-brand-gold transition-colors placeholder:text-white/10"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-brand-gold/50 text-[10px] uppercase tracking-widest font-black">Email Identity</label>
                        <input 
                          required
                          type="email" 
                          placeholder="email@vault.com" 
                          className="w-full bg-white/5 border-b border-white/10 p-5 text-white focus:outline-none focus:border-brand-gold transition-colors placeholder:text-white/10"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-brand-gold/50 text-[10px] uppercase tracking-widest font-black">Phone Contact</label>
                        <input 
                          required
                          type="tel" 
                          placeholder="+91..." 
                          className="w-full bg-white/5 border-b border-white/10 p-5 text-white focus:outline-none focus:border-brand-gold transition-colors placeholder:text-white/10"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.isBooking && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-brand-gold/50 text-[10px] uppercase tracking-widest font-black">Preferred Date</label>
                      <input 
                        required
                        type="date" 
                        className="w-full bg-white/5 border-b border-white/10 p-5 text-white focus:outline-none focus:border-brand-gold transition-colors [color-scheme:dark]"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-brand-gold/50 text-[10px] uppercase tracking-widest font-black">Preferred Time</label>
                      <select 
                        required
                        className="w-full bg-white/5 border-b border-white/10 p-5 text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none cursor-pointer"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                      >
                        {["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"].map(t => (
                          <option key={t} value={t} className="bg-brand-blue">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-brand-gold/50 text-[10px] uppercase tracking-widest font-black">Asset of Interest</label>
                  <select 
                    className="w-full bg-white/5 border-b border-white/10 p-5 text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none cursor-pointer"
                    value={formData.project}
                    onChange={(e) => {
                      setFormData({...formData, project: e.target.value});
                    }}
                  >
                    {PROJECTS.map(p => (
                      <option key={p.id} value={p.name} className="bg-brand-blue">{p.name} — {p.location}</option>
                    ))}
                    {!formData.isBooking && <option value="General" className="bg-brand-blue">General Portfolio Inquiry</option>}
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={submitted || loading}
                  className="gold-sweep w-full bg-brand-gold text-brand-blue py-6 font-black tracking-[0.3em] text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? "PROCESSING..." : submitted ? "SUBMISSION SUCCESSFUL" : formData.isBooking ? "CONFIRM SITE VISIT" : "INITIATE DIALOGUE"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    const path = 'subscribers';
    try {
      await addDoc(collection(db, path), {
        email,
        createdAt: serverTimestamp()
      });
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-brand-blue pt-32 pb-12 border-t border-white/5 relative overflow-hidden">
      <div className="blueprint-grid absolute inset-0 opacity-5 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-2">
            <div 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center mb-10 cursor-pointer group isolate"
            >
              <Logo className="h-32 md:h-48 group-hover:scale-105 transition-transform" light={true} />
            </div>
            <p className="text-brand-champagne/40 max-w-sm mb-10 leading-relaxed text-sm">
              BRIJ DHARA is a premium cinematic real estate developer dedicated to creating high-yield architectural icons and resilient legacies.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-white/20 hover:text-brand-gold transition-all"><Instagram size={24} /></a>
              <a href="#" className="text-white/20 hover:text-brand-gold transition-all"><Facebook size={24} /></a>
              <a href="#" className="text-white/20 hover:text-brand-gold transition-all"><Linkedin size={24} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-[0.3em] text-[10px]">CORRIDORS</h4>
            <ul className="space-y-4 text-brand-champagne/40 text-[11px] font-bold tracking-widest">
              <li><a href="#about" className="hover:text-brand-gold transition-colors">OUR STORY</a></li>
              <li><a href="#portfolio" className="hover:text-brand-gold transition-colors">PORTFOLIO</a></li>
              <li><a href="#calculator" className="hover:text-brand-gold transition-colors">INVESTMENT TRACKER</a></li>
              <li><a href="#contact" className="hover:text-brand-gold transition-colors">OFFICIAL INQUIRY</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-[0.3em] text-[10px]">VAULT</h4>
            <p className="text-brand-champagne/40 text-[11px] mb-6 leading-relaxed">Secure insights into high-yield corridors and cinematic launches.</p>
            <div className="flex bg-white/5 border border-white/10 focus-within:border-brand-gold transition-all">
              <form onSubmit={handleSubscribe} className="flex w-full">
                <input 
                  type="email" 
                  placeholder={subscribed ? "SUCCESS" : "EMAIL IDENTITY"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent px-4 py-3 text-white text-[10px] focus:outline-none w-full font-bold tracking-widest placeholder:text-white/10" 
                />
                <button 
                  type="submit"
                  disabled={loading || subscribed}
                  className="bg-brand-gold text-brand-blue px-4 py-3 hover:bg-white transition-colors disabled:opacity-50"
                  aria-label="Subscribe"
                >
                  {loading ? "..." : <ArrowRight size={16} />}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-6">
          <p className="text-white/10 text-[9px] font-bold tracking-[0.3em] text-center md:text-left uppercase">
            © {new Date().getFullYear()} {BRAND.legalName}. PRODUCED FOR RADIANT LEGACIES.
          </p>
          <div className="flex gap-8 text-[9px] text-white/10 font-bold uppercase tracking-[0.3em] flex-wrap justify-center">
            <a href="#" className="hover:text-brand-gold transition-colors">PRIVACY PROTOCOL</a>
            <a href="#" className="hover:text-brand-gold transition-colors">TERMS OF SERVICE</a>
            <a href="#" className="hover:text-brand-gold transition-colors">RERA COMPLIANCE</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

const BackgroundVideo = () => {
  return (
    <video 
      className="fixed top-1/2 -translate-y-1/2 right-[15%] w-[45vw] min-w-[400px] h-auto -z-10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-none object-cover opacity-60" 
      autoPlay 
      loop 
      muted 
      playsInline
    >
      <source src="make_rahda_krishnaji_rotating.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default function App() {
  return (
    <div className="bg-brand-blue min-h-screen text-white font-sans selection:bg-brand-gold selection:text-brand-blue">
      <BackgroundVideo />
      <Navbar />
      <FloatingActions />
      <main>
        <Hero />
        <Calculator />
        <Portfolio />
        
        {/* About Section */}
        <section id="about" className="py-32 bg-brand-blue relative overflow-hidden">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden xl:block">
            <span className="[writing-mode:vertical-lr] rotate-180 text-brand-gold text-xs tracking-[1em] font-black opacity-20">
              ARCHITECTURE OF TRUST
            </span>
          </div>

          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <span className="text-brand-gold font-bold tracking-[0.3em] text-xs block mb-4 uppercase">Leadership & Vision</span>
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none mb-6">
                  Engineering <br/>
                  <span className="text-brand-gold italic font-light">Cinematic Futures</span>
                </h2>
              </div>
              <div className="w-24 h-px bg-brand-gold/40" />
              <p className="text-brand-champagne/60 text-lg leading-relaxed max-w-lg">
                Under the strategic leadership of Dheeraj K. Saini, BRIJ DHARA merges structural precision with the emotive beauty of golden-hour aesthetics to create high-yield township masterpieces.
              </p>
              <div className="flex items-center gap-10 pt-4">
                <div>
                  <div className="text-4xl font-bold text-white mb-1">500+</div>
                  <div className="text-brand-gold/60 text-[10px] uppercase tracking-widest font-bold">Acres Developed</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-4xl font-bold text-white mb-1">40%</div>
                  <div className="text-brand-gold/60 text-[10px] uppercase tracking-widest font-bold">Avg. Appreciation</div>
                </div>
              </div>
            </motion.div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="relative z-10 group cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden border border-brand-gold/20 shadow-2xl relative">
                  <motion.img 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    src={IMAGES.director} 
                    alt="Dheeraj K. Saini - Managing Director" 
                    className="w-full h-full object-cover transition-all duration-1000" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-blue to-transparent opacity-60" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-brand-surface/90 backdrop-blur-xl p-8 border-t border-brand-gold/30 transform transition-transform group-hover:translate-x-2">
                  <h4 className="text-2xl font-bold text-white mb-1">Dheeraj K. Saini</h4>
                  <p className="text-brand-gold font-black tracking-[0.2em] text-xs uppercase">Director - Brijdhara Group</p>
                </div>
              </motion.div>
              
              <div className="absolute -top-12 -right-12 w-80 h-80 border border-brand-gold/10 z-0 animate-pulse pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-brand-gold/5 blur-3xl z-0 pointer-events-none" />
            </div>
          </div>
        </section>

        <Timeline />
        
        {/* Cinematic Quote & Vision Section */}
        <section className="py-40 bg-zinc-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 grayscale mix-blend-overlay">
            <img src={IMAGES.atrium} className="w-full h-full object-cover" alt="Architectural Atrium" referrerPolicy="no-referrer" />
          </div>
          <div className="blueprint-grid absolute inset-0 opacity-10" />
          
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-block p-6 border border-brand-gold/30 mb-12 rounded-full backdrop-blur-md">
                <LayoutDashboard className="text-brand-gold w-8 h-8" />
              </div>
              <h3 className="text-3xl md:text-6xl font-light italic text-white leading-tight mb-12">
                "We do not just <span className="text-brand-gold font-bold not-italic">transmute</span> barren land; we curate the very stage where your family's cinematic legacy unfolds."
              </h3>
              <div className="flex flex-col items-center gap-4">
                <div className="text-brand-gold font-black tracking-[0.4em] text-sm">- DHEERAJ K. SAINI</div>
                <div className="text-white/30 text-[10px] font-bold tracking-widest uppercase">Director - Brijdhara Group</div>
              </div>
            </motion.div>
          </div>
        </section>

        <MyBookings />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
