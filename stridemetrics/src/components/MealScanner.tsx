import React, { useState } from 'react';
import { MealAnalysis, UserProfile } from '../types';
import { Upload, Utensils, Sparkles, CheckCircle2, AlertCircle, PlusCircle, Scale, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface MealScannerProps {
  userProfile: UserProfile;
  onLogMeal: (meal: MealAnalysis) => void;
  customApiKey?: string;
}

export const MealScanner: React.FC<MealScannerProps> = ({ userProfile, onLogMeal, customApiKey }) => {
  const [textDescription, setTextDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);
  const [logged, setLogged] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage && !textDescription.trim()) {
      setErrorMsg('Please upload a meal photo or describe what you ate.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setLogged(false);

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (selectedImage) {
        const parts = selectedImage.split(',');
        mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        imageBase64 = parts[1];
      }

      const res = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'x-gemini-api-key': customApiKey } : {})
        },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          textDescription: textDescription.trim() || undefined,
          userProfile,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Meal analysis failed');
      }

      const data: MealAnalysis = await res.json();
      data.imageUrl = selectedImage || undefined;
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Meal scan error:', err);
      setErrorMsg(err.message || 'Failed to analyze meal.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLog = () => {
    if (analysisResult) {
      onLogMeal(analysisResult);
      setLogged(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Utensils className="h-5 w-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">AI Meal & Macro Scanner</h1>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Upload a food image or describe your meal. {userProfile.coachName ? (userProfile.coachName.toLowerCase().startsWith('coach') ? userProfile.coachName : `Coach ${userProfile.coachName}`) : 'Coach Jason'} will estimate macros, health score, and nutritional advice aligned with your target: <span className="text-emerald-400 font-mono font-bold">{userProfile.dailyCalorieTarget} kcal</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Left: Input Panel */}
        <div className="space-y-5 sm:space-y-6">
          
          {/* File Upload Box */}
          <div className="rounded-3xl border border-dashed border-white/[0.08] bg-[#11151c] p-6 sm:p-8 text-center hover:border-emerald-500/50 transition-all">
            {selectedImage ? (
              <div className="relative group">
                <img src={selectedImage} alt="Food preview" className="max-h-56 mx-auto rounded-2xl object-cover" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 rounded-xl bg-black/80 p-2 text-xs text-zinc-300 hover:text-white"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white font-display">Upload Meal Photo</span>
                  <p className="text-xs text-zinc-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="relative text-center">
            <span className="bg-[#090d14] px-4 text-xs font-mono font-semibold text-zinc-400 tracking-widest">OR DESCRIBE IT</span>
            <div className="absolute inset-y-1/2 left-0 right-0 -z-10 border-t border-white/[0.08]"></div>
          </div>

          {/* Text Description Box */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">Meal Ingredients / Description</label>
            <textarea
              rows={3}
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="e.g. 200g grilled salmon with olive oil, sweet potato mash, and steamed asparagus..."
              className="w-full bg-[#0b0f17] border border-white/[0.08] rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!selectedImage && !textDescription.trim())}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-xs font-extrabold text-slate-950 uppercase tracking-wider hover:bg-emerald-400 active:scale-95 disabled:opacity-40 transition-all shadow-lg shadow-emerald-500/20"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
                <span>{userProfile.coachName ? (userProfile.coachName.toLowerCase().startsWith('coach') ? userProfile.coachName : `Coach ${userProfile.coachName}`) : 'Coach Jason'} is Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-slate-950" />
                <span>Analyze Meal & Calculate Macros</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Analysis Result Display */}
        <div>
          {analysisResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-white/[0.08] bg-[#11151c] p-5 sm:p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-display">{analysisResult.foodName}</h3>
                  <p className="text-xs text-zinc-400">{analysisResult.summary}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Health Score</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">{analysisResult.healthScore}/100</span>
                </div>
              </div>

              {/* Macro Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-2xl bg-[#181f2a] p-3 border border-white/[0.06] text-center">
                  <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1 font-mono uppercase">
                    <Flame className="h-3 w-3 text-emerald-400" /> Kcal
                  </div>
                  <div className="text-base sm:text-lg font-mono font-bold text-emerald-400 mt-1">{analysisResult.calories}</div>
                </div>

                <div className="rounded-2xl bg-[#181f2a] p-3 border border-white/[0.06] text-center">
                  <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1 font-mono uppercase">
                    <Scale className="h-3 w-3 text-emerald-400" /> Protein
                  </div>
                  <div className="text-base sm:text-lg font-mono font-bold text-white mt-1">{analysisResult.proteinG}g</div>
                </div>

                <div className="rounded-2xl bg-[#181f2a] p-3 border border-white/[0.06] text-center">
                  <div className="text-[10px] text-zinc-400 font-mono uppercase">Carbs</div>
                  <div className="text-base sm:text-lg font-mono font-bold text-zinc-300 mt-1">{analysisResult.carbsG}g</div>
                </div>

                <div className="rounded-2xl bg-[#181f2a] p-3 border border-white/[0.06] text-center">
                  <div className="text-[10px] text-zinc-400 font-mono uppercase">Fat</div>
                  <div className="text-base sm:text-lg font-mono font-bold text-zinc-300 mt-1">{analysisResult.fatG}g</div>
                </div>
              </div>

              {/* Key Nutrients */}
              {analysisResult.keyNutrients?.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-zinc-300 mb-2">Key Nutrients Highlighted</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.keyNutrients.map((nut, idx) => (
                      <span key={idx} className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-mono font-bold text-emerald-400">
                        {nut}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Coach Jason Feedback */}
              <div className="rounded-2xl bg-[#181f2a] border-l-2 border-emerald-400 p-4 text-xs space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 font-display">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Coach Jason's Nutritional Take
                </div>
                <p className="text-zinc-300 leading-relaxed">{analysisResult.jasonAdvice}</p>
              </div>

              {/* Log Button */}
              <button
                onClick={handleLog}
                disabled={logged}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#181f2a] border border-white/10 py-3 text-xs font-bold text-zinc-200 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 disabled:opacity-60 active:scale-95 transition-all uppercase tracking-wider font-mono"
              >
                {logged ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Logged to Daily Macro Log!</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 text-emerald-400" />
                    <span>Add to Today's Consumed Macros</span>
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-[#11151c] p-8 sm:p-10 text-center text-zinc-500">
              <Utensils className="h-12 w-12 text-zinc-700 mb-3" />
              <p className="text-sm font-bold text-white font-display">No Meal Scanned Yet</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                Upload a photo or enter a text description to receive Coach Jason's instant macro & health analysis.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

