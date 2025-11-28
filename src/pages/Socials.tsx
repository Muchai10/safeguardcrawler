// src/pages/Socials.tsx
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { format, parseISO, isToday, isThisWeek, isThisMonth } from "date-fns";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Twitter,
  Search,
  Calendar,
  Shield,
  Filter,
} from "lucide-react";

type Threat = {
  id: string;
  tweet_hash: string;
  keyword_trigger: string;
  content: string;
  created_at: string;
  threat_score: number;
  threat_category: "critical_threat" | "high_threat" | "medium_threat" | "neutral";
  sentiment_label: string;
  sentiment_score: number;
  location_boosted: boolean;
};

type ThreatFilter = "all" | "critical_threat" | "high_threat" | "medium_threat" | "neutral";
type DateFilter = "all" | "today" | "week" | "month";

export default function Socials() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [threatFilter, setThreatFilter] = useState<ThreatFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchThreats() {
      setLoading(true);
      const { data, error } = await supabase
        .from("twitter_threats")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
      } else {
        setThreats(data || []);
      }
      setLoading(false);
    }
    fetchThreats();
  }, []);

  // Client-side filtering
  const filteredThreats = useMemo(() => {
    return threats.filter((threat) => {
      const date = parseISO(threat.created_at);

      // Date filter
      if (dateFilter === "today" && !isToday(date)) return false;
      if (dateFilter === "week" && !isThisWeek(date)) return false;
      if (dateFilter === "month" && !isThisMonth(date)) return false;

      // Threat level filter
      if (threatFilter !== "all" && threat.threat_category !== threatFilter) return false;

      // Search in content or keyword
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          threat.content.toLowerCase().includes(q) ||
          threat.keyword_trigger.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [threats, threatFilter, dateFilter, searchQuery]);

  const getThreatColor = (category: string) => {
    switch (category) {
      case "critical_threat":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "high_threat":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      case "medium_threat":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  const getThreatLabel = (cat: string) => {
    return cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      {/* HERO HEADER */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pt-24 pb-10 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-800">
              <Twitter className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Live Social Threat Feed
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Real-time detection of GBV threats, harassment, and high-risk language on Kenyan Twitter (X)
          </p>
          <div className="mt-6 inline-flex items-center gap-3 px-8 py-4 bg-red-100 dark:bg-red-900/30 rounded-full border-2 border-red-300 dark:border-red-800">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {filteredThreats.length}
            </span>
            <span className="text-lg text-gray-600 dark:text-gray-400">Active Signals</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* FILTER BAR */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg mb-10 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-30">
          {/* Search */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search threats or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500 transition-all outline-none"
            />
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            {/* Date Filter */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2">
              <Calendar size={18} className="text-gray-500 mr-2" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="bg-transparent border-none text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
              >
                <option value="all">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Threat Level Buttons */}
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              {(["all", "critical_threat", "high_threat", "medium_threat", "neutral"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setThreatFilter(level)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    threatFilter === level
                      ? "bg-red-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {level === "all" ? "All Levels" : getThreatLabel(level)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* THREAT GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Loading threat signals...</p>
          </div>
        ) : filteredThreats.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">No active threats</h3>
            <p className="text-gray-500 mt-2">The digital space is calm right now.</p>
            <button
              onClick={() => {
                setThreatFilter("all");
                setDateFilter("all");
                setSearchQuery("");
              }}
              className="mt-6 px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredThreats.map((threat) => (
              <div
                key={threat.id}
                className="group block bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                {/* Threat Level Bar */}
                <div
                  className={`h-1 w-full ${
                    threat.threat_category === "critical_threat"
                      ? "bg-red-600"
                      : threat.threat_category === "high_threat"
                      ? "bg-orange-500"
                      : threat.threat_category === "medium_threat"
                      ? "bg-yellow-500"
                      : "bg-gray-400"
                  }`}
                />

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getThreatColor(
                        threat.threat_category
                      )}`}
                    >
                      {getThreatLabel(threat.threat_category)}
                    </span>
                    {threat.location_boosted && (
                      <span className="flex items-center text-xs font-bold text-green-600 dark:text-green-400">
                        <MapPin size={14} className="mr-1" />
                        Location Boosted
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">
                      Trigger Keyword
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-500" />
                      {threat.keyword_trigger}
                    </p>
                  </div>

                  <blockquote className="text-gray-700 dark:text-gray-300 text-sm italic border-l-4 border-red-300 dark:border-red-800 pl-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-r mb-5 line-clamp-4">
                    "{threat.content}"
                  </blockquote>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      <Clock size={14} />
                      {format(parseISO(threat.created_at), "MMM d, yyyy • HH:mm")}
                    </span>
                  </div>

                  <div className="flex justify-between items-end pt-5 border-t border-gray-100 dark:border-gray-700 mt-5">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Threat Score</p>
                      <p className="text-2xl font-black text-red-600 dark:text-red-400">
                        {threat.threat_score}
                        <span className="text-sm font-normal">/100</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Negative Sentiment</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        {(threat.sentiment_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ETHICAL FOOTER */}
      <footer className="bg-gray-900 text-white py-12 mt-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold">SafeGuard Crawler</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-3xl mx-auto">
            This system monitors public social media for threats of violence, harassment, and GBV-related language using AI.
            All data is fully anonymized. No personal information is stored or displayed.
            <br />
            For safety monitoring and research purposes only.
          </p>
          <p className="text-xs text-gray-500 mt-6">
            Ethical AI for safer digital spaces • © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}