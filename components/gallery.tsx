"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Heart, User, Star, Filter, Loader2 } from "lucide-react";
import { supabase, type Stylist } from "@/lib/supabase";

type Lang = "en" | "sk";

type GalleryItem = {
  id: string;
  image_url: string;
  thumbnail_url: string;
  stylist_id: string | null;
  stylist_name: string;
  title: string | null;
  description: string | null;
  week_number: number;
  year: number;
  like_count: number;
  is_featured: boolean;
  created_at: string;
  user_has_liked: boolean;
};

type GalleryProps = {
  lang: Lang;
  label?: string;
  title?: string;
  sub?: string;
  maxItems?: number;
};

const VISITOR_ID_KEY = "be_gallery_visitor_id";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function getCurrentWeekYear(): { week: number; year: number } {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return { week, year: now.getFullYear() };
}

export function Gallery({ lang, label, title, sub, maxItems = 12 }: GalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [filterStylist, setFilterStylist] = useState<string>("all");
  const [filterWeek, setFilterWeek] = useState<string>("all"); // "all" | "this_week" | "recent"
  const visitorIdRef = useRef<string>("");

  const texts = {
    en: {
      label: label || "Gallery",
      title: title || "Our Finest Work",
      sub: sub || "Latest haircuts from our talented artists",
      thisWeek: "This Week",
      allWork: "All Work",
      recent: "Recent",
      byStylist: "By Stylist",
      allStylists: "All Stylists",
      likes: "likes",
      by: "by",
      featured: "Featured",
      loadMore: "Load More",
      loading: "Loading...",
      noImages: "No images yet. Check back soon!",
      heartAlt: "Like this style",
    },
    sk: {
      label: label || "Galéria",
      title: title || "Naše najlepšie práce",
      sub: sub || "Najnovšie účesy od našich talentovaných majstrov",
      thisWeek: "Tento týždeň",
      allWork: "Všetky práce",
      recent: "Nedávne",
      byStylist: "Podľa špecialistu",
      allStylists: "Všetci špecialisti",
      likes: "páči sa",
      by: "od",
      featured: "Oblúbené",
      loadMore: "Načítať viac",
      loading: "Načítavam...",
      noImages: "Zatiaľ žiadne obrázky. Vráťte sa čoskoro!",
      heartAlt: "Páči sa mi tento štýl",
    },
  } as const;

  const t = texts[lang];

  // Load gallery items
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: maxItems.toString(),
        visitor_id: visitorIdRef.current,
      });

      if (filterStylist !== "all") {
        params.set("stylist_id", filterStylist);
      }

      const { week, year } = getCurrentWeekYear();
      if (filterWeek === "this_week") {
        params.set("week", week.toString());
        params.set("year", year.toString());
      }

      const res = await fetch(`/api/gallery?${params.toString()}`);
      const data = await res.json();
      
      if (data.items) {
        setItems(data.items);
      }
    } catch (e) {
      console.error("[Gallery] load error", e);
    } finally {
      setLoading(false);
    }
  }, [filterStylist, filterWeek, maxItems]);

  // Load stylists for filter
  const loadStylists = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("stylists")
        .select("id, name, is_active")
        .eq("is_active", true)
        .order("name");
      setStylists(data || []);
    } catch (e) {
      console.error("[Gallery] load stylists error", e);
    }
  }, []);

  useEffect(() => {
    visitorIdRef.current = getOrCreateVisitorId();
    void loadStylists();
  }, [loadStylists]);

  useEffect(() => {
    if (visitorIdRef.current) {
      void loadItems();
    }
  }, [loadItems]);

  // Handle like
  const handleLike = async (itemId: string) => {
    if (!visitorIdRef.current || likingIds.has(itemId)) return;

    setLikingIds((prev) => new Set([...prev, itemId]));

    // Optimistic update
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newLiked = !item.user_has_liked;
          return {
            ...item,
            user_has_liked: newLiked,
            like_count: newLiked ? item.like_count + 1 : item.like_count - 1,
          };
        }
        return item;
      })
    );

    try {
      const res = await fetch("/api/gallery/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gallery_item_id: itemId,
          visitor_id: visitorIdRef.current,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) => {
            if (item.id === itemId) {
              return { ...item, like_count: data.like_count };
            }
            return item;
          })
        );
      }
    } catch (e) {
      console.error("[Gallery] like error", e);
      // Revert on error
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const revertedLiked = !item.user_has_liked;
            return {
              ...item,
              user_has_liked: revertedLiked,
              like_count: revertedLiked ? item.like_count + 1 : item.like_count - 1,
            };
          }
          return item;
        })
      );
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  return (
    <section className="gallery-section" id="gallery">
      {/* Header */}
      <div className="gallery-header reveal">
        <div className="section-label" style={{ justifyContent: "center" }}>
          {t.label}
        </div>
        <h2>{t.title}</h2>
        <p>{t.sub}</p>
      </div>

      {/* Filters */}
      <div className="gallery-filters reveal reveal-delay-1">
        {/* Week filter */}
        <div className="gallery-filter-group">
          <button
            type="button"
            className={`gallery-filter-btn ${filterWeek === "all" ? "active" : ""}`}
            onClick={() => setFilterWeek("all")}
          >
            {t.allWork}
          </button>
          <button
            type="button"
            className={`gallery-filter-btn ${filterWeek === "this_week" ? "active" : ""}`}
            onClick={() => setFilterWeek("this_week")}
          >
            {t.thisWeek}
          </button>
          <button
            type="button"
            className={`gallery-filter-btn ${filterWeek === "recent" ? "active" : ""}`}
            onClick={() => setFilterWeek("recent")}
          >
            {t.recent}
          </button>
        </div>

        {/* Stylist filter */}
        <div className="gallery-filter-group">
          <select
            className="gallery-stylist-select"
            value={filterStylist}
            onChange={(e) => setFilterStylist(e.target.value)}
          >
            <option value="all">{t.allStylists}</option>
            {stylists.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="gallery-grid">
        {loading ? (
          <div className="gallery-loading">
            <Loader2 className="gallery-spinner" />
            <p>{t.loading}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="gallery-empty">
            <p>{t.noImages}</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className={`gallery-item reveal ${index % 3 === 1 ? "reveal-delay-1" : index % 3 === 2 ? "reveal-delay-2" : ""}`}
            >
              <div className="gallery-item-image">
                <Image
                  src={item.thumbnail_url || item.image_url}
                  alt={item.title || `Haircut by ${item.stylist_name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
                
                {/* Featured badge */}
                {item.is_featured && (
                  <div className="gallery-featured-badge">
                    <Star className="h-3 w-3" />
                    {t.featured}
                  </div>
                )}

                {/* Hover overlay */}
                <div className="gallery-item-overlay">
                  <button
                    type="button"
                    className={`gallery-like-btn ${item.user_has_liked ? "liked" : ""}`}
                    onClick={() => void handleLike(item.id)}
                    disabled={likingIds.has(item.id)}
                    aria-label={t.heartAlt}
                  >
                    <Heart
                      className={`h-5 w-5 ${item.user_has_liked ? "fill-current" : ""}`}
                      strokeWidth={1.5}
                    />
                    <span>{item.like_count}</span>
                  </button>
                </div>
              </div>

              {/* Item info */}
              <div className="gallery-item-info">
                {item.title && (
                  <h4 className="gallery-item-title">{item.title}</h4>
                )}
                <div className="gallery-item-meta">
                  <span className="gallery-item-stylist">
                    <User className="h-3 w-3" />
                    {t.by} {item.stylist_name}
                  </span>
                  <span className="gallery-item-likes">
                    <Heart className="h-3 w-3" />
                    {item.like_count} {t.likes}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
