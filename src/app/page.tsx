"use client";
import { useState } from "react";
import { analyzeResponseSheet } from "./actions";

export default function Home() {
  const [url, setUrl] = useState("");
  const [subject, setSubject] = useState<"CS1" | "CS2" | "DA">("CS1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);

    const result = await analyzeResponseSheet(url, subject);

    if (!result.success) {
      setError(result.error || "Failed to analyze");
    } else {
      setData(result);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/30 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <main className="max-w-6xl mx-auto relative z-10">
        <header className="text-center mb-12 mt-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            GATE 2026 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Predictor</span>
          </h1>
          <p className="text-slate-400 text-lg">Upload your Digialm response sheet URL for instant marks analysis.</p>
        </header>

        <section className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl mb-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="subject" value="CS1" checked={subject === "CS1"} onChange={() => setSubject("CS1")} className="hidden" />
                <div className={`p-4 text-center rounded-xl border-2 transition-all ${subject === "CS1" ? "border-purple-500 bg-purple-500/10 text-white" : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"}`}>
                  <h3 className="font-bold text-lg">CS - 1</h3>
                  <p className="text-xs opacity-70">Computer Science</p>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="subject" value="CS2" checked={subject === "CS2"} onChange={() => setSubject("CS2")} className="hidden" />
                <div className={`p-4 text-center rounded-xl border-2 transition-all ${subject === "CS2" ? "border-purple-500 bg-purple-500/10 text-white" : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"}`}>
                  <h3 className="font-bold text-lg">CS - 2</h3>
                  <p className="text-xs opacity-70">Computer Science</p>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="subject" value="DA" checked={subject === "DA"} onChange={() => setSubject("DA")} className="hidden" />
                <div className={`p-4 text-center rounded-xl border-2 transition-all ${subject === "DA" ? "border-blue-500 bg-blue-500/10 text-white" : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"}`}>
                  <h3 className="font-bold text-lg">DA</h3>
                  <p className="text-xs opacity-70">Data Science & AI</p>
                </div>
              </label>
            </div>

            <div className="flex gap-4 mt-4">
              <input
                type="url"
                required
                placeholder="Paste your GATE Digialm URL here..."
                className="flex-1 bg-slate-900/80 border border-slate-600 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold whitespace-nowrap hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <span className="animate-pulse">Analyzing...</span> : "Analyze Result"}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-center text-sm">
                {error}
              </div>
            )}
          </form>
        </section>

        {data && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 mt-16">
            {data.candidate && data.candidate.name !== "Unknown" && (
              <div className="mb-8 text-center bg-slate-800/40 border border-slate-700/50 rounded-2xl py-4 backdrop-blur-md">
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  Candidate: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{data.candidate.name}</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1 font-mono">ID: {data.candidate.id}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
                <h3 className="text-slate-400 font-medium mb-2 relative z-10">Total Estimated Score</h3>
                <div className="text-5xl font-black text-white drop-shadow-lg relative z-10">
                  {data.summary.total_marks.toFixed(2)}<span className="text-2xl text-slate-500">/100</span>
                </div>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 flex flex-col justify-center gap-4">
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400 text-sm font-medium">Attempted</span>
                  <span className="text-xl font-bold">{data.summary.attempted}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="text-emerald-400 text-sm font-medium">Correct</span>
                  <span className="text-xl font-bold text-emerald-400">{data.summary.correct}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-rose-400 text-sm font-medium">Incorrect</span>
                  <span className="text-xl font-bold text-rose-400">{data.summary.incorrect}</span>
                </div>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 flex flex-col justify-center gap-4">
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="text-emerald-400 text-sm font-medium">Positive Marks</span>
                  <span className="text-xl font-bold text-emerald-400">+{data.summary.positive_marks.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="text-rose-400 text-sm font-medium">Negative Marks</span>
                  <span className="text-xl font-bold text-rose-400">{data.summary.negative_marks.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm font-medium">Total Questions</span>
                  <span className="text-xl font-bold">65</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-700/50 font-bold text-xl">
                Question Breakdown
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Q.No</th>
                      <th className="px-6 py-4">Section</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Your Ans</th>
                      <th className="px-6 py-4">Key</th>
                      <th className="px-6 py-4">Eval</th>
                      <th className="px-6 py-4 text-right">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 text-sm">
                    {data.questions.map((q: any) => (
                      <tr key={String(q.q_num)} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">Q.{String(q.q_num).padStart(2, '0')}</td>
                        <td className="px-6 py-4">{q.section}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded-md text-[10px] font-bold tracking-wider">{q.type}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{q.status}</td>
                        <td className="px-6 py-4 font-mono font-bold text-white">{q.given_ans || '-'}</td>
                        <td className="px-6 py-4 font-mono font-bold text-purple-400">{q.correct_ans}</td>
                        <td className="px-6 py-4">
                          {q.eval_status === "PASS" && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-xs font-bold w-16 text-center inline-block">PASS</span>}
                          {q.eval_status === "FAIL" && <span className="px-2 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-md text-xs font-bold w-16 text-center inline-block">FAIL</span>}
                          {q.eval_status === "----" && <span className="px-2 py-1 bg-slate-700/50 text-slate-500 border border-slate-600 rounded-md text-xs font-bold w-16 text-center inline-block">----</span>}
                        </td>
                        <td className={`px-6 py-4 font-bold text-right ${q.eval_status === 'PASS' ? 'text-emerald-400' : q.eval_status === 'FAIL' ? 'text-rose-400' : 'text-slate-500'}`}>
                          {q.eval_status === "PASS" ? '+' : ''}{q.marks_obtained !== null ? Number(q.marks_obtained).toFixed(2) : "0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
