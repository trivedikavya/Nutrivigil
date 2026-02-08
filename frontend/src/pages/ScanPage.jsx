import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import VoiceQuery from "../components/VoiceQuery";
import { LANGUAGE_MAP } from "../utils/languageMap";

// Matches the key used in tests to mock the health condition
const STORAGE_KEY = "nutriguard";

function ScanPage() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [condition, setCondition] = useState("");
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [voiceAnswer, setVoiceAnswer] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setCondition(saved);
  }, []);

  const handleVoiceSubmit = async () => {
    if (!followUpQuestion || !result) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("https://nutb.onrender.com/analyze", {
        condition: condition,
        query: followUpQuestion,
        foodName: result.food_name
      });

      setVoiceAnswer(res.data);
      setFollowUpQuestion("");
    } catch (err) {
      let errorMessage = t("errors.analysisFailed");
      if (err.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (err.response?.data) {
        const backendError = err.response.data;
        errorMessage = backendError.error || backendError.message || backendError;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // client-side validation for file size
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!selectedFile) return setError(t("errors.noImage"));
    if (!condition) return setError(t("errors.noCondition"));

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("condition", condition);
      formData.append("language", LANGUAGE_MAP[i18n.language] || "English");

      const res = await axios.post("https://nutb.onrender.com/analyze", formData);
      setResult(res.data);
    } catch (err) {
      let errorMessage = t("errors.analysisFailed");
      if (err.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (err.response?.data) {
        const backendError = err.response.data;
        errorMessage = backendError.error || backendError.message || backendError;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const TrafficIcon = {
    green: <CheckCircle className="w-8 h-8 text-green-400" />,
    yellow: <AlertCircle className="w-8 h-8 text-yellow-400" />,
    red: <XCircle className="w-8 h-8 text-red-400" />,
  };

  const TrafficTitle = {
    green: t('safety.safe'),
    yellow: t('safety.moderate'),
    red: t('safety.unsafe'),
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = { en: 'en-US', hi: 'hi-IN', es: 'es-ES', fr: 'fr-FR' };
    utterance.lang = langMap[i18n.language] || 'en-US';
    utterance.pitch = 1.1;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-10 px-5 relative">
      <div className="absolute inset-0 -z-10 pointer-events-none blur-3xl"></div>

      <motion.div
        className={`w-full max-w-[600px] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-12 transition-colors ${
          theme === 'dark' ? "bg-black/40" : "bg-white/90 border border-gray-200"
        }`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.header className="text-center mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r mb-2 ${
            theme === 'dark' ? "from-purple-500 to-blue-500" : "from-purple-600 to-blue-600"
          }`}>
            {t("scan.title")}
          </h1>
          <p className={`text-sm mb-4 ${theme === 'dark' ? "text-gray-300" : "text-gray-600"}`}>
            {t("scan.subtitle")}
          </p>

          <AnimatePresence mode="wait">
            {condition ? (
              <motion.div
                key="badge"
                className={`inline-block px-5 py-2 rounded-full text-xs font-semibold border ${
                  theme === 'dark' ? "bg-blue-400/10 text-blue-300 border-blue-400/20" : "bg-blue-100 text-blue-700 border-blue-300"
                }`}
              >
                {t("scan.condition")}: {t(`conditions.${condition}`)}
              </motion.div>
            ) : (
              <motion.div
                key="warning"
                className={`inline-block px-5 py-2 rounded-full text-xs border ${
                  theme === 'dark' ? "bg-yellow-400/10 text-yellow-300 border-yellow-300/20" : "bg-yellow-100 text-yellow-700 border-yellow-300"
                }`}
              >
                {t("scan.setCondition")}{" "}
                <Link to="/profile" className="underline font-semibold text-blue-300">
                  {t("nav.profile")}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className={`font-semibold text-sm ${theme === 'dark' ? "text-gray-200" : "text-gray-700"}`}>
              {t("scan.foodPhoto")}
            </label>
            <motion.div
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 md:p-10 text-center cursor-pointer transition-all ${
                theme === 'dark' ? "border-blue-500/30 bg-blue-500/5 hover:border-cyan-400" : "border-blue-300 bg-blue-50"
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <AnimatePresence mode="wait">
                {preview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={preview} className="max-w-full max-h-[250px] rounded-2xl object-contain shadow-xl" />
                    <p className="text-xs">{selectedFile?.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-12 h-12 text-blue-300" />
                    <p className="text-sm font-medium">{t("scan.uploadHint")}</p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.button
            onClick={handleScan}
            disabled={loading || !selectedFile || !condition}
            className="w-full py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-purple-800 to-indigo-500 disabled:opacity-70"
          >
            {loading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /><span>{t("scan.scanning")}</span></>
            ) : (
              <span>{t("scan.scanButton")}</span>
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              role="alert" // 🛠️ Added for test identification
              className="mt-6 p-4 border rounded-2xl flex items-center gap-3 bg-red-500/10 border-red-500/20 text-red-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div
              className="mt-6 p-7 rounded-2xl shadow-xl border bg-blue-500/5 border-blue-400/10"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-blue-400/10">
                {TrafficIcon[result.traffic_light]}
                <h2 className="text-xl font-bold">{TrafficTitle[result.traffic_light]}</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div><strong>{t("scan.labels.food")}:</strong> {result.food_name}</div>
                <div className="pt-4 border-t border-blue-400/10"><strong>{t("scan.labels.reason")}:</strong> {result.reason}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ScanPage;