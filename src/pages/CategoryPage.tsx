// src/pages/CategoryPage.tsx
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { format, isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";
import {
  Calendar,
  Filter,
  ExternalLink,
  Search,
  Smile,
  Frown,
  Meh,
  Globe,
  User,
  MapPin,
  Building,
} from "lucide-react";

// --- Types ---
type Article = {
  id: number;
  title: string;
  article_url: string;
  summary_snippet: string;
  publish_date: string | null;
  keyword_category: string;
  site_url: string;
  sentiment?: string;
  sentiment_score?: number;
  entities?: string;

  // Parsed fields
  sentiment_label?: "Positive" | "Negative" | "Neutral";
  ner_persons?: string[];
  ner_locations?: string[];
  ner_orgs?: string[];
};

type PageType = "category" | "source" | "entity";

// --- Constants ---
const KNOWN_CATEGORIES = ["gvb", "crime", "politics", "business", "other", "scams"];
const KNOWN_ENTITIES = ["people", "places", "organizations"];

const CATEGORY_COLORS: Record<string, string> = {
  GVB: "bg-purple-100 text-purple-800 border-purple-200",
  Crime: "bg-red-100 text-red-800 border-red-200",
  Scams: "bg-amber-100 text-amber-800 border-amber-200",
  Politics: "bg-blue-100 text-blue-800 border-blue-200",
  Business: "bg-green-100 text-green-800 border-green-200",
  Other: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function CategoryPage() {
  const { category: param } = useParams<{ category: string }>();
  const slug = decodeURIComponent(param || "").toLowerCase().trim();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "Positive" | "Negative" | "Neutral">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Determine page type
  const pageType: PageType = useMemo(() => {
    if (KNOWN_CATEGORIES.includes(slug)) return "category";
    if (KNOWN_ENTITIES.includes(slug)) return "entity";
    return "source";
  }, [slug]);

  // Page title
  const displayTitle = useMemo(() => {
    if (pageType === "category") {
      const nice = slug === "gvb" ? "GVB" : slug.charAt(0).toUpperCase() + slug.slice(1);
      return `${nice} News`;
    }
    if (pageType === "entity") {
      return `Mentioned ${slug.charAt(0).toUpperCase() + slug.slice(1)}`;
    }
    return `${slug.replace(/\b\w/g, (l) => l.toUpperCase())} Archive`;
  }, [slug, pageType]);

  // Parse entities & sentiment
  const parseArticle = (article: any): Article => {
    const entities = article.entities || "";
    const parts = entities.split("|").map((p: string) => p.trim()).filter(Boolean);

    const ner_persons = parts
      .filter((p) => p.startsWith("PER:"))
      .map((p) => p.replace(/^PER:\s*/, "").trim());

    const ner_locations = parts
      .filter((p) => p.startsWith("LOC:"))
      .map((p) => p.replace(/^LOC:\s*/, "").trim());

    const ner_orgs = parts
      .filter((p) => p.startsWith("ORG:"))
      .map((p) => p.replace(/^ORG:\s*/, "").trim());

    let sentiment_label: "Positive" | "Negative" | "Neutral" | undefined = undefined;
    if (article.sentiment === "Positive") sentiment_label = "Positive";
    else if (article.sentiment === "Negative") sentiment_label = "Negative";
    else if (article.sentiment === "Neutral") sentiment_label = "Neutral";

    return {
      ...article,
      sentiment_label,
      ner_persons,
      ner_locations,
      ner_orgs,
    };
  };

  // --- Data Fetching ---
  useEffect(() => {
    async function fetchArticles() {
      if (!slug) return;

      setLoading(true);
      let query = supabase.from("scraped_articles").select("*");

      // Category pages (e.g. /gvb, /crime)
      if (pageType === "category") {
        const dbCategory = slug === "gvb" ? "GVB" : slug.charAt(0).toUpperCase() + slug.slice(1);
        query = query.eq("keyword_category", dbCategory);
      }
      // Entity pages (people, places, organizations)
      else if (pageType === "entity") {
        if (slug === "people") {
          query = query.ilike("entities", "%PER:%"); // Works with or without space after colon
        } else if (slug === "places") {
          query = query.ilike("entities", "%LOC:%");
        } else if (slug === "organizations") {
          query = query.ilike("entities", "%ORG:%");
        }
      }
      // Source pages (e.g. the-star.co.ke)
      else {
        const domain = slug.split(" ")[0];
        query = query.ilike("site_url", `%${domain}%`);
      }

      query = query
        .order("publish_date", { ascending: false, nullsLast: true })
        .limit(150);

      const { data, error } = await query;

      if (error) {
        console.error("Supabase fetch error:", error);
        setArticles([]);
      } else {
        const parsed = (data || []).map(parseArticle);
        setArticles(parsed);
      }

      setLoading(false);
    }

    fetchArticles();
  }, [slug, pageType]);

  // Client-side filtering
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const date = article.publish_date ? parseISO(article.publish_date) : null;

      // Date filters
      if (dateFilter === "today" && date && !isToday(date)) return false;
      if (dateFilter === "week" && date && !isThisWeek(date)) return false;
      if (dateFilter === "month" && date && !isThisMonth(date)) return false;

      // Sentiment filter
      if (sentimentFilter !== "all" && article.sentiment_label !== sentimentFilter) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          article.title?.toLowerCase().includes(q) ||
          article.summary_snippet?.toLowerCase().includes(q) ||
          article.ner_persons?.some((p) => p.toLowerCase().includes(q)) ||
          article.ner_locations?.some((l) => l.toLowerCase().includes(q)) ||
          article.ner_orgs?.some((o) => o.toLowerCase().includes(q));

        if (!matches) return false;
      }

      return true;
    });
  }, [articles, dateFilter, sentimentFilter, searchQuery]);

  // Header icon
  const HeaderIcon = () => {
    if (pageType === "category") return <Filter className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />;
    if (pageType === "source") return <Globe className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />;
    if (slug === "people") return <User className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />;
    if (slug === "places") return <MapPin className="w-8 h-8 md:w-10 md:h-10 text-green-500" />;
    return <Building className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />;
  };

  const getSentimentIcon = () => {
    if (sentimentFilter === "Positive") return <Smile size={18} className="text-green-500 mr-2" />;
    if (sentimentFilter === "Negative") return <Frown size={18} className="text-red-500 mr-2" />;
    return <Meh size={18} className="text-gray-500 mr-2" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pt-24 pb-10 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <HeaderIcon />
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              {displayTitle}
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            {pageType === "source"
              ? `All articles from ${displayTitle}`
              : `Latest news and mentions related to ${displayTitle.toLowerCase()}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* FILTER BAR */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg mb-10 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder={`Search in ${slug}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2">
              <Calendar size={18} className="text-gray-500 mr-2" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-transparent border-none text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
              >
                <option value="all">Any Date</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2">
              {getSentimentIcon()}
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value as any)}
                className="bg-transparent border-none text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
              >
                <option value="all">All Sentiments</option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
                <option value="Neutral">Neutral</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Loading articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">No articles found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters.</p>
            <button
              onClick={() => {
                setDateFilter("all");
                setSentimentFilter("all");
                setSearchQuery("");
              }}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <a
                key={article.id}
                href={article.article_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                {article.sentiment_label && (
                  <div
                    className={`h-1 w-full ${
                      article.sentiment_label === "Positive"
                        ? "bg-green-500"
                        : article.sentiment_label === "Negative"
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  />
                )}

                <div className="p-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span className="font-bold uppercase tracking-wider">
                      {new URL(article.site_url).hostname.replace("www.", "")}
                    </span>
                    {article.publish_date && (
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {format(parseISO(article.publish_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-3 group-hover:text-indigo-600 transition">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6">
                    {article.summary_snippet || "No preview available"}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        CATEGORY_COLORS[article.keyword_category] || CATEGORY_COLORS.Other
                      }`}
                    >
                      {article.keyword_category}
                    </span>
                    <span className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                      Read <ExternalLink size={14} className="ml-1" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-gray-400 text-sm">
            Aggregated for research purposes • All content belongs to original publishers
          </p>
        </div>
      </footer>
    </div>
  );
}