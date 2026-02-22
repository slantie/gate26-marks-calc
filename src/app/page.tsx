"use client";
import { useState } from "react";
import { Calculator, FileText, Activity, Link, AlertCircle, User, CheckCircle, XCircle, Award } from "lucide-react";
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
    <div className="w-full max-w-6xl mx-auto px-6 py-12">
      <header className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center gap-6 justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-3 justify-center md:justify-start">
            <Calculator className="w-8 h-8 text-indigo-600" />
            GATE 2026 Marks Predictor
          </h1>
          <p className="text-slate-500 text-sm md:text-base">Calculate your estimated score directly from your Digialm response sheet URL.</p>
        </div>
      </header>

      {/* Form Card — warm white with a subtle border */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-md mb-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-3 block">Select Paper Subject</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CS1 */}
              <label className="cursor-pointer relative">
                <input type="radio" name="subject" value="CS1" checked={subject === "CS1"} onChange={() => setSubject("CS1")} className="peer sr-only" />
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4" />
                    <h3 className="font-semibold text-sm">CS - Shift 1</h3>
                  </div>
                  <p className="text-xs opacity-70">Computer Science</p>
                </div>
              </label>

              {/* CS2 */}
              <label className="cursor-pointer relative">
                <input type="radio" name="subject" value="CS2" checked={subject === "CS2"} onChange={() => setSubject("CS2")} className="peer sr-only" />
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4" />
                    <h3 className="font-semibold text-sm">CS - Shift 2</h3>
                  </div>
                  <p className="text-xs opacity-70">Computer Science</p>
                </div>
              </label>

              {/* DA */}
              <label className="cursor-pointer relative">
                <input type="radio" name="subject" value="DA" checked={subject === "DA"} onChange={() => setSubject("DA")} className="peer sr-only" />
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4" />
                    <h3 className="font-semibold text-sm">DA</h3>
                  </div>
                  <p className="text-xs opacity-70">Data Science & AI</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-3 block">Response Sheet URL</label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Link className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://cdn.digialm.com//per/g01/pub/585/touchstone/..."
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm placeholder:text-slate-400 shadow-sm"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 min-w-[160px] shadow-sm"
              >
                {loading ? <span className="animate-pulse">Processing...</span> : <span>Analyze Results</span>}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}
        </form>
      </section>

      {data && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Candidate Card */}
          {data.candidate && data.candidate.name !== "Unknown" && (
            <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-full border border-indigo-200">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">{data.candidate.name}</h2>
                  <p className="text-slate-400 font-mono text-sm mt-0.5">ID: {data.candidate.id}</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600">
                Subject: <span className="text-indigo-600 ml-1">{data.summary.subject || subject}</span>
              </div>
            </div>
          )}

          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Score */}
            <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-xl flex flex-col justify-center items-center text-center col-span-1 md:col-span-1 relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-indigo-600"></div>
              <p className="text-slate-500 text-sm font-semibold mb-2">Total Score</p>
              <div className="text-4xl font-extrabold text-slate-900">
                {data.summary.total_marks.toFixed(2)}
              </div>
              <p className="text-slate-400 text-xs mt-1">Out of 100</p>
            </div>

            {/* Stats Grid */}
            <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-xl col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Attempted</p>
                <p className="text-2xl font-extrabold text-slate-800">{data.summary.attempted} <span className="text-sm font-medium text-slate-400">/ 65</span></p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Correct</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <p className="text-2xl font-extrabold text-emerald-600">{data.summary.correct}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Incorrect</p>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <p className="text-2xl font-extrabold text-rose-600">{data.summary.incorrect}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Net Details</p>
                <div className="text-sm font-medium">
                  <p><span className="text-emerald-600">+{data.summary.positive_marks.toFixed(2)}</span> Positive</p>
                  <p><span className="text-rose-600">-{data.summary.negative_marks.toFixed(2)}</span> Negative</p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Breakdown Table */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">Question Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-100">Q.No</th>
                    <th className="px-6 py-4 border-b border-slate-100">Section</th>
                    <th className="px-6 py-4 border-b border-slate-100">Type</th>
                    <th className="px-6 py-4 border-b border-slate-100">Status</th>
                    <th className="px-6 py-4 border-b border-slate-100">Your Answer</th>
                    <th className="px-6 py-4 border-b border-slate-100">Official Key</th>
                    <th className="px-6 py-4 border-b border-slate-100">Evaluation</th>
                    <th className="px-6 py-4 border-b border-slate-100 text-right">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {data.questions.map((q: any) => (
                    <tr key={String(q.q_num)} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">Q.{String(q.q_num).padStart(2, '0')}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{q.section}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded text-[10px] font-bold tracking-widest">{q.type}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs font-medium">{q.status}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">{q.given_ans || '-'}</td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">{q.correct_ans}</td>
                      <td className="px-6 py-4">
                        {q.eval_status === "PASS" && <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-xs font-bold w-16 justify-center">PASS</span>}
                        {q.eval_status === "FAIL" && <span className="inline-flex items-center px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded text-xs font-bold w-16 justify-center">FAIL</span>}
                        {q.eval_status === "----" && <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-400 border border-slate-200 rounded text-xs font-bold w-16 justify-center">----</span>}
                      </td>
                      <td className={`px-6 py-4 font-bold text-right ${q.eval_status === 'PASS' ? 'text-emerald-600' : q.eval_status === 'FAIL' ? 'text-rose-600' : 'text-slate-300'}`}>
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
    </div>
  );
}