import { useState, useRef, ChangeEvent } from "react";
import { Upload, Copy, Image as ImageIcon, Check, ExternalLink, Globe, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [route, setRoute] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const fullUrl = `${window.location.origin}/r/${data.id}`;
        setRoute(fullUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (route) {
      navigator.clipboard.writeText(route);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-300 flex flex-col font-sans selection:bg-zinc-100 selection:text-black">
      {/* Navigation Bar */}
      <nav className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-6 md:px-10 bg-[#0E0E10]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-200 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-[#0A0A0B] rotate-45"></div>
          </div>
          <span className="text-zinc-100 font-bold text-lg tracking-tight">VAULT.IMG</span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
          <a href="#" className="text-zinc-500 hover:text-zinc-100 transition-colors">Gallery</a>
          <a href="#" className="text-zinc-500 hover:text-zinc-100 transition-colors">API</a>
          <a href="#" className="text-zinc-100">Uploader</a>
        </div>
        <button className="md:hidden text-zinc-400">
          <Zap className="w-5 h-5" />
        </button>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row p-6 md:p-10 gap-10 max-w-7xl mx-auto w-full">
        {/* Left Section: Uploader */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-light text-zinc-100 tracking-tight leading-tight"
            >
              Instant <span className="font-medium">Discord Embeds</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-500 max-w-md text-lg"
            >
              Upload your media and get a cryptographically random route designed to embed perfectly in Discord, Telegram, and Slack.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`flex-1 border-2 border-dashed ${file ? 'border-zinc-500 bg-[#151517]' : 'border-zinc-800 bg-[#121214]'} rounded-3xl flex flex-col items-center justify-center text-center p-8 md:p-12 transition-all duration-300 relative group overflow-hidden`}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*,video/mp4,image/gif"
            />
            
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-zinc-700 transition-colors">
                    <Upload className="w-8 h-8 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                  </div>
                  <p className="text-xl text-zinc-200 font-medium mb-1">Drop your GIF or Image</p>
                  <p className="text-sm text-zinc-600 mb-8">Maximum file size: 24MB</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-10 py-4 bg-zinc-100 text-black font-bold rounded-full hover:bg-white transition-all transform active:scale-95 shadow-xl shadow-white/5"
                  >
                    Select Media
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center w-full max-w-md"
                >
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-700 bg-black mb-6">
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-zinc-700" />
                      </div>
                    )}
                  </div>
                  <p className="text-zinc-200 font-medium mb-6 truncate max-w-xs">{file.name}</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setFile(null)}
                      className="px-6 py-3 border border-zinc-700 rounded-full hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="px-10 py-3 bg-zinc-100 text-black font-bold rounded-full hover:bg-white transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUploading ? "Uploading..." : "Upload to Vault"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {route && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl"
              >
                <div className="flex flex-col w-full md:w-auto">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Active Route</span>
                  <div className="flex items-center gap-2">
                    <code className="text-zinc-100 font-mono text-sm break-all">{route}</code>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={copyToClipboard}
                    className="flex-1 md:flex-none px-6 py-3 border border-zinc-700 rounded-xl text-[10px] uppercase font-bold tracking-wider hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy Link"}
                  </button>
                  <a 
                    href={route} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 border border-zinc-700 rounded-xl hover:bg-zinc-800 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section: Discord Preview Simulation */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold px-2">Live Embed Preview</div>
          
          <div className="bg-[#313338] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-black/20 flex-1 relative min-h-[500px]">
            <div className="p-4 flex gap-4 border-b border-zinc-800/30 bg-[#2B2D31]/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-indigo-500 shrink-0 flex items-center justify-center text-white font-bold">U</div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-white text-[15px] font-semibold">User01</span>
                  <span className="text-[11px] text-zinc-400">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <span className="text-blue-400 text-sm cursor-pointer hover:underline break-all truncate max-w-[250px]">
                  {route || "https://vault.img/r/8f2k-z9l1..."}
                </span>
              </div>
            </div>
            
            <div className="p-4 flex flex-col gap-2">
              <div className="border-l-4 border-[#1e1f22] bg-[#2B2D31] p-3 rounded-md flex flex-col shadow-sm">
                <span className="text-[11px] font-bold text-white mb-2 uppercase tracking-wide opacity-90">Vault.img</span>
                <div className="rounded overflow-hidden bg-black/20 aspect-video flex items-center justify-center">
                  {route && file ? (
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="Embed Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <ImageIcon className="w-10 h-10" />
                      <span className="text-xs font-medium">No media uploaded</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-zinc-700 rounded-sm flex items-center justify-center text-[8px] font-bold text-white">V</div>
                    <span>vault.img</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">{file?.type.split('/')[1].toUpperCase() || "PNG"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="p-4 bg-[#313338]">
              <div className="bg-[#383A40] h-11 rounded-lg flex items-center px-4">
                <div className="w-6 h-6 rounded-full bg-zinc-700 mr-3"></div>
                <span className="text-zinc-500 text-[14px]">Message #media-vault</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#121214] border border-zinc-800/50">
              <Globe className="w-5 h-5 text-zinc-500 mb-2" />
              <h3 className="text-zinc-200 text-xs font-bold mb-1">Global CDN</h3>
              <p className="text-zinc-600 text-[10px]">Sub-50ms latency for embeds.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#121214] border border-zinc-800/50">
              <Shield className="w-5 h-5 text-zinc-500 mb-2" />
              <h3 className="text-zinc-200 text-xs font-bold mb-1">Encrypted</h3>
              <p className="text-zinc-600 text-[10px]">Routes are 100% private.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="h-12 border-t border-zinc-800/50 flex items-center justify-between px-6 md:px-10 text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          Status: <span className="text-zinc-400">Operational</span>
        </div>
        <div className="hidden sm:block">&copy; 2024 Vault Media Systems</div>
        <div className="flex gap-4">
          <span className="text-zinc-400">US-EAST-1</span>
          <span className="text-zinc-400">v1.2.0-stable</span>
        </div>
      </footer>
    </div>
  );
}
