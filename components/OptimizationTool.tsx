
import React, { useState } from 'react';
import { generateListingDescription } from '../services/geminiService';
import { Button } from './Button';
import { Sparkles, Copy, Check, Wand2, Lightbulb } from 'lucide-react';

interface OptimizationToolProps {
  className?: string;
  embedded?: boolean;
}

export const OptimizationTool: React.FC<OptimizationToolProps> = ({ className = '', embedded = false }) => {
  const [propertyName, setPropertyName] = useState('');
  const [features, setFeatures] = useState('');
  const [vibe, setVibe] = useState('Professional & Quiet');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName || !features) return;
    
    setLoading(true);
    const desc = await generateListingDescription(propertyName, features, vibe);
    setResult(desc);
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full ${embedded ? '' : 'py-24 bg-slate-950 border-t border-slate-900'} ${className}`}>
      <div className={embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        <div className={`grid grid-cols-1 ${embedded ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-8 md:gap-16 items-start`}>
          
          <div className={embedded ? 'hidden' : 'block'}>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              AI For Landlords
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Attract the Right <br/>
              <span className="text-emerald-500">Tenants</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Struggling to fill your PG or rental flat? Use our AI to write descriptions that appeal specifically to reliable students and working professionals.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-slate-700">1</div>
                <p className="text-slate-300">Enter property highlights (e.g., "Near College", "High Speed Wifi").</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-slate-700">2</div>
                <p className="text-slate-300">Select target audience vibe (Student, Pro, Family).</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-slate-700">3</div>
                <p className="text-slate-300">Get a professional listing description instantly.</p>
              </div>
            </div>
          </div>

          <div className={`${embedded ? 'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm' : 'bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl'} relative overflow-hidden`}>
             {/* Abstract bg element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="mb-8 relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/20">
                  <Wand2 className="h-3 w-3" /> AI Powered
               </div>
               <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">
                  Listing Optimizer
               </h3>
               <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Turn basic details into a compelling description that attracts the right tenants instantly.
               </p>
            </div>

            <form onSubmit={handleGenerate} className="relative z-10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Property Name</label>
                <input 
                  type="text" 
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. Green Valley PG"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Key Features</label>
                <textarea 
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="e.g. 5 mins walk to bus stand, homemade food, 24/7 water, study table provided..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none resize-none shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Target Audience Vibe</label>
                <div className="relative">
                  <select 
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none appearance-none cursor-pointer shadow-sm"
                  >
                    <option>Professional & Quiet</option>
                    <option>Student Friendly & Budget</option>
                    <option>Family & Safe</option>
                    <option>Luxury & Serviced</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full py-4 text-base shadow-lg shadow-emerald-900/20 group" isLoading={loading}>
                {!loading && <Sparkles className="h-4 w-4 mr-2 group-hover:animate-spin" />}
                {loading ? 'Optimizing...' : 'Generate Description'}
              </Button>
            </form>

            {result && (
              <div className="mt-8 relative group/result">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-20 blur group-hover/result:opacity-30 transition duration-500"></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
                          <Lightbulb className="h-4 w-4" />
                       </div>
                       <h4 className="text-slate-900 dark:text-white font-bold text-sm">Suggested Description</h4>
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy Text'}
                    </button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-7 font-medium">
                      {result}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
