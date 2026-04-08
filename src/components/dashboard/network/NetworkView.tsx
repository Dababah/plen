"use client";

import React, { useState, useEffect } from "react";
import { Users, Flame, Search, Loader2, AtSign, User as UserIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import FollowButton from "./FollowButton";

export default function NetworkView({ lang, dict, currentUser }: { lang: string; dict: any; currentUser: any }) {
  const [activeTab, setActiveTab] = useState<"feed" | "search">("feed");
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  useEffect(() => {
    const hist = localStorage.getItem("network_search_history");
    if (hist) {
      try {
        setSearchHistory(JSON.parse(hist));
      } catch (e) {}
    }
  }, []);

  const addToHistory = (user: any) => {
    setSearchHistory(prev => {
      const newHist = [{ id: user.id, username: user.username, name: user.name, image: user.image }, ...prev.filter(u => u.id !== user.id)].slice(0, 10);
      localStorage.setItem("network_search_history", JSON.stringify(newHist));
      return newHist;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("network_search_history");
  };

  useEffect(() => {
    // Fake fetch for now, we'll connect it to an API later
    // The activity feed fetches all activities of `following` + `self`
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/network/feed");
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "feed") {
      fetchActivities();
    }
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const search = async () => {
      setSearchLoading(true);
      try {
        // We'll create this API
        const res = await fetch(`/api/network/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } finally {
        setSearchLoading(false);
      }
    };

    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "feed" 
              ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/20" 
              : "text-slate-500 hover:text-zinc-900 hover:bg-slate-50"
          }`}
        >
          Activity Feed
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "search" 
              ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/20" 
              : "text-slate-500 hover:text-zinc-900 hover:bg-slate-50"
          }`}
        >
          Find Friends
        </button>
      </div>

      {activeTab === "search" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold transition-all outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900"
            />
            {searchLoading && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <Link
                  key={user.id}
                  href={`/${lang}/${user.username}`}
                  onClick={() => addToHistory(user)}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      {user.image ? (
                        <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                          <UserIcon size={24} strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {user.name || user.username}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <AtSign size={10} /> {user.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.id !== currentUser.id && (
                      <FollowButton 
                        targetUserId={user.id} 
                        initialFollowing={user.isFollowing} 
                        size="sm" 
                      />
                    )}
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-bold text-slate-500 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                      View
                    </div>
                  </div>
                </Link>
              ))
            ) : searchQuery.length >= 3 && !searchLoading ? (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">
                No users found matching "{searchQuery}"
              </div>
            ) : null}

            {searchQuery.length === 0 && searchHistory.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Searches</h3>
                  <button onClick={clearHistory} className="text-xs font-bold text-slate-400 hover:text-black transition-colors">Clear</button>
                </div>
                <div className="space-y-2">
                  {searchHistory.map(user => (
                    <Link
                      key={user.id}
                      href={`/${lang}/${user.username}`}
                      className="flex items-center p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all group gap-3"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        {user.image ? (
                          <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <UserIcon size={20} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{user.name || user.username}</h4>
                        <p className="text-[10px] font-semibold text-slate-400">@{user.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "feed" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : activities.length > 0 ? (
            activities.map((act) => {
              const meta = act.metadata ? JSON.parse(act.metadata) : {};
              
              return (
                <div key={act.id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <Link href={`/${lang}/${act.user.username}`} className="shrink-0 group">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                       {act.user.image ? (
                        <img src={act.user.image} alt={act.user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                          <UserIcon size={20} strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/${lang}/${act.user.username}`} className="text-sm font-bold text-zinc-900 hover:underline">
                        {act.user.name || act.user.username}
                      </Link>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 shrink-0">
                        {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {act.type === "HABIT_MILESTONE" ? (
                      <div className="mt-2 p-3 rounded-xl bg-orange-50 border border-orange-100">
                        <p className="text-xs font-semibold text-orange-900 leading-relaxed">
                          Just hit a <span className="text-orange-600 font-black">{meta.milestone} Day Streak</span> on{" "}
                          <span className="italic">"{meta.habitTitle}"</span>! 🔥
                        </p>
                      </div>
                    ) : act.type === "NEW_FOLLOWER" ? (
                      <div className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                        <p className="text-xs font-semibold text-blue-900 leading-relaxed">
                          Started following you
                        </p>
                        <FollowButton targetUserId={act.user.id} initialFollowing={act.isFollowing} size="sm" />
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
             <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 border-dashed">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold text-sm mb-1">Your feed is quiet</p>
                <p className="text-xs text-slate-400">Search for friends to see their achievements here.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
