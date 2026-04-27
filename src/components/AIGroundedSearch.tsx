import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink, Loader2, Info } from 'lucide-react';

interface AIGroundedSearchProps {
  query: string;
  type: 'service' | 'product' | 'general';
}

export default function AIGroundedSearch({ query, type }: AIGroundedSearchProps) {
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<{ uri: string, title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAIResponse = async () => {
      if (!query || query.length < 3) {
        setResult(null);
        setSources([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // AI call goes to the backend — API key stays server-side
        const res = await fetch(`/api/ai/search?q=${encodeURIComponent(query)}&type=${type}`);
        if (!res.ok) throw new Error('AI not available');
        const data = await res.json();
        setResult(data.result || null);
        setSources(data.sources || []);
      } catch (err) {
        console.error("AI Grounded Search Error:", err);
        setError("Unable to connect to divine insights.");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchAIResponse, 1000); // Debounce
    return () => clearTimeout(timer);
  }, [query, type]);

  if (!query || query.length < 3) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-[2rem] border border-orange-200 dark:border-orange-900/30 overflow-hidden shadow-sm">
          <div className="bg-white/50 dark:bg-stone-900/50 p-6 flex items-start gap-4">
            <div className="mt-1 w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-2">
                  Divine Insights
                  <span className="h-1 w-1 bg-orange-400 rounded-full animate-pulse" />
                </h3>
              </div>
              
              {isLoading ? (
                <div className="space-y-2 py-2">
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded-full w-1/2 animate-pulse" />
                </div>
              ) : error ? (
                <p className="text-sm text-stone-500 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {error}
                </p>
              ) : result ? (
                <>
                  <p className="text-stone-800 dark:text-stone-200 text-sm leading-relaxed mb-4">
                    {result}
                  </p>
                  
                  {sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-orange-200/30 dark:border-orange-900/30">
                      <span className="text-[10px] text-orange-400 dark:text-orange-600 font-bold uppercase tracking-tighter mr-2 py-1">Sources</span>
                      {sources.map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors flex items-center gap-1 max-w-[200px]"
                        >
                          <span className="truncate">{source.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
