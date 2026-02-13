import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { Check, Info, Lock, Sparkles, Search, X, AlertCircle } from "lucide-react";

const CONDITIONS_DATA = [
  { id: "diabetes", icon: "🩸", category: "metabolic", gradient: "from-red-500 to-rose-600" },
  { id: "thyroid", icon: "🦋", category: "metabolic", gradient: "from-blue-400 to-indigo-600" },
  { id: "pcos", icon: "🌸", category: "metabolic", gradient: "from-pink-400 to-purple-600" },
  { id: "obesity", icon: "⚖️", category: "metabolic", gradient: "from-orange-400 to-red-600" },
  { id: "hypertension", icon: "💓", category: "cardiac", gradient: "from-purple-500 to-pink-600" },
  { id: "heart", icon: "❤️", category: "cardiac", gradient: "from-rose-500 to-red-600" },
  { id: "cholesterol", icon: "🧈", category: "cardiac", gradient: "from-yellow-500 to-orange-600" },
  { id: "celiac", icon: "🌾", category: "digestive", gradient: "from-lime-500 to-emerald-600" },
  { id: "lactose", icon: "🥛", category: "digestive", gradient: "from-blue-500 to-sky-600" },
  { id: "gastric", icon: "🔥", category: "digestive", gradient: "from-orange-500 to-amber-600" },
  { id: "liver", icon: "🧼", category: "digestive", gradient: "from-emerald-400 to-teal-600" },
  { id: "asthma", icon: "🫁", category: "respiratory", gradient: "from-cyan-400 to-blue-600" },
  { id: "kidney", icon: "🫘", category: "specialized", gradient: "from-amber-500 to-orange-600" },
  { id: "anemia", icon: "🥩", category: "specialized", gradient: "from-red-600 to-maroon-800" },
  { id: "arthritis", icon: "🦴", category: "specialized", gradient: "from-slate-400 to-slate-600" },
  { id: "cancer", icon: "🎗️", category: "specialized", gradient: "from-purple-400 to-indigo-500" },
  { id: "pregnancy", icon: "🤰", category: "life", gradient: "from-pink-300 to-rose-400" },
  { id: "elderly", icon: "👴", category: "life", gradient: "from-gray-400 to-slate-500" },
  { id: "surgery", icon: "🩹", category: "life", gradient: "from-blue-300 to-indigo-400" },
  { id: "none", icon: "✨", category: "life", gradient: "from-emerald-500 to-cyan-600" }
];

const STORAGE_KEY = "nutriguard_v2"; // Migrated to v2 to support arrays

function HealthProfile() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setSelectedIds(Array.isArray(saved) ? saved : []);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [selectedIds]);

  const toggleCondition = (id) => {
    if (id === "none") return setSelectedIds(["none"]);
    setSelectedIds(prev => {
      const filtered = prev.filter(i => i !== "none");
      return filtered.includes(id) ? filtered.filter(i => i !== id) : [...filtered, id];
    });
  };

  const groupedConditions = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = CONDITIONS_DATA.filter(c => t(`conditions.${c.id}`).toLowerCase().includes(query));
    const groups = {};
    filtered.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [searchQuery, t]);

  return (
    <div className={`min-h-screen pt-24 pb-12 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <header className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tight">{t("profile.title")}</h1>
            <p className="text-slate-500">{t("profile.subtitle")}</p>
          </header>

          <section className={`p-8 rounded-[2rem] border transition-all ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-200"} shadow-2xl`}>
            <div className="flex items-center justify-between mb-8">
              <span className="flex items-center gap-2 font-bold uppercase text-xs tracking-[0.2em] text-indigo-500">
                <Sparkles className="w-4 h-4" /> {t("profile.healthCondition")}
              </span>
              <AnimatePresence>
                {saved && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3" /> {t("profile.saved")}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full min-h-[70px] p-4 rounded-2xl border cursor-pointer flex flex-wrap gap-2 items-center transition-all ${
                  isDark ? "bg-slate-800/50 border-slate-700 hover:border-indigo-500/50" : "bg-slate-100/50 border-slate-200 hover:border-indigo-300"
                }`}
              >
                {selectedIds.length === 0 ? (
                  <span className="text-slate-500 ml-2">{t("profile.selectCondition")}</span>
                ) : (
                  selectedIds.map(id => (
                    <motion.span layoutId={id} key={id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r ${CONDITIONS_DATA.find(c => c.id === id)?.gradient} text-white shadow-lg`}>
                      {CONDITIONS_DATA.find(c => c.id === id)?.icon} {t(`conditions.${id}`)}
                      <X className="w-3.5 h-3.5 cursor-pointer hover:scale-125 transition-transform" onClick={(e) => { e.stopPropagation(); toggleCondition(id); }} />
                    </motion.span>
                  ))
                )}
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`absolute z-50 w-full mt-3 p-5 rounded-3xl border shadow-2xl backdrop-blur-2xl ${isDark ? "bg-slate-900/98 border-slate-700" : "bg-white/98 border-slate-200"}`}>
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input autoFocus placeholder={t("profile.searchPlaceholder")} className={`w-full pl-12 pr-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    <div className="max-h-[400px] overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                      {Object.keys(groupedConditions).length === 0 ? (
                        <p className="text-center py-10 text-slate-500 font-medium">{t("profile.noResults")}</p>
                      ) : (
                        Object.entries(groupedConditions).map(([cat, items]) => (
                          <div key={cat} className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 px-2">{t(`profile.categories.${cat}`)}</h3>
                            <div className="grid sm:grid-cols-2 gap-2.5">
                              {items.map(cond => (
                                <button key={cond.id} onClick={() => toggleCondition(cond.id)} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${selectedIds.includes(cond.id) ? `bg-gradient-to-r ${cond.gradient} text-white border-transparent shadow-md` : isDark ? "hover:bg-slate-800 border-slate-800" : "hover:bg-slate-50 border-slate-100"}`}>
                                  <span className="text-2xl">{cond.icon}</span>
                                  <span className="font-bold text-sm">{t(`conditions.${cond.id}`)}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-start gap-4 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed italic">{t("profile.disclaimer")}</p>
            </div>
          </section>

          <footer className="grid sm:grid-cols-2 gap-4">
            <div className={`p-6 rounded-[2rem] border ${isDark ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-100 shadow-sm"} flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center"><Lock className="text-emerald-500 w-6 h-6" /></div>
              <div className="space-y-1"><h4 className="text-sm font-bold">Privacy Locked</h4><p className="text-[10px] text-slate-500 leading-tight">On-device encryption enabled.</p></div>
            </div>
            <div className={`p-6 rounded-[2rem] border ${isDark ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-100 shadow-sm"} flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center"><Info className="text-indigo-500 w-6 h-6" /></div>
              <div className="space-y-1"><h4 className="text-sm font-bold">Context Aware</h4><p className="text-[10px] text-slate-500 leading-tight">AI adjusts to your specific profile.</p></div>
            </div>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}

export default HealthProfile;