"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase, type Service } from "@/lib/supabase";
import { normalizeServices } from "@/lib/normalize-service";
import {
  SERVICE_CATEGORY_IDS,
  SERVICE_CATEGORY_LABELS,
  type ServiceCategoryId,
} from "@/lib/service-categories";

type Lang = "en" | "sk";

type PriceMenuProps = {
  lang: Lang;
  label: string;
  title: string;
  sub: string;
};

export function PriceMenu({ lang, label, title, sub }: PriceMenuProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<ServiceCategoryId>("mens");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError(false);
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("category")
        .order("sort_order")
        .order("name");
      if (cancelled) return;
      if (error) {
        console.error("[PriceMenu]", error.message);
        setLoadError(true);
        setServices([]);
        return;
      }
      setServices(normalizeServices(data ?? []));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Dòng dịch vụ mount sau khi fetch; observer trên page.tsx không thấy → cần observe lại.
  // Chỉ grid .active (các tab khác display:none — IO không bật visible đúng lúc đổi tab).
  useEffect(() => {
    const root = sectionRef.current;
    if (!root || services.length === 0) return;

    const reveals: HTMLElement[] = [];
    root.querySelectorAll<HTMLElement>(".special-combos.reveal:not(.visible)").forEach((el) =>
      reveals.push(el)
    );
    root
      .querySelectorAll<HTMLElement>(
        `.menu-grid.active .menu-item.reveal:not(.visible)`
      )
      .forEach((el) => reveals.push(el));

    if (reveals.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [services, activeTab]);

  const byCategory = useMemo(() => {
    const m = new Map<ServiceCategoryId, Service[]>();
    for (const id of SERVICE_CATEGORY_IDS) m.set(id, []);
    for (const s of services) {
      const list = m.get(s.category as ServiceCategoryId);
      if (list) list.push(s);
    }
    return m;
  }, [services]);

  const featuredMens = services.find((s) => s.category === "mens" && s.sort_order === 0);
  const featuredWomens = services.find((s) => s.category === "womens" && s.sort_order === 0);

  const gridServices = (cat: ServiceCategoryId) => {
    const list = byCategory.get(cat) ?? [];
    if (cat === "mens" || cat === "womens") {
      return list.filter((s) => s.sort_order !== 0);
    }
    return list;
  };

  const formatPrice = (p: number) => {
    const n = Number(p);
    if (!Number.isFinite(n)) return "—";
    if (Number.isInteger(n)) return `${n}€`;
    return `${n.toFixed(2)}€`;
  };

  const titleParts = title.split(" ");
  const titleFirst = titleParts[0];
  const titleRest = titleParts.slice(1).join(" ");

  return (
    <section ref={sectionRef} className="menu-section" id="menu">
      <div className="menu-bg-text">PRICE LIST</div>
      <div className="menu-header reveal">
        <div className="section-label" style={{ justifyContent: "center" }}>
          {label}
        </div>
        <h2>
          {titleFirst} <span>{titleRest}</span>
        </h2>
        <p>{sub}</p>
      </div>

      {(featuredMens || featuredWomens) && (
        <div className="special-combos reveal">
          {featuredMens && (
            <div className="special-combo-card">
              <div className="special-combo-title">
                {featuredMens.name}{" "}
                <span>({featuredMens.duration_minutes} MIN)</span>
              </div>
              <div className="special-combo-desc">{featuredMens.description ?? ""}</div>
              <div className="special-combo-price">{formatPrice(featuredMens.price)}</div>
            </div>
          )}
          {featuredWomens && (
            <div className="special-combo-card">
              <div className="special-combo-title">
                {featuredWomens.name}{" "}
                <span>({featuredWomens.duration_minutes} MIN)</span>
              </div>
              <div className="special-combo-desc">{featuredWomens.description ?? ""}</div>
              <div className="special-combo-price">{formatPrice(featuredWomens.price)}</div>
            </div>
          )}
        </div>
      )}

      <div className="menu-tabs reveal reveal-delay-1">
        {SERVICE_CATEGORY_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={`menu-tab ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            {SERVICE_CATEGORY_LABELS[id][lang]}
          </button>
        ))}
      </div>

      {loadError && (
        <p className="menu-header reveal px-6 text-center text-sm text-red-400/90">
          {lang === "sk"
            ? "Cenník sa nepodarilo načítať. Skontrolujte pripojenie alebo obnovte stránku."
            : "Could not load the price list. Check your connection or refresh the page."}
        </p>
      )}

      {SERVICE_CATEGORY_IDS.map((cat) => (
        <div
          key={cat}
          className={`menu-grid ${activeTab === cat ? "active" : ""}`}
          id={`tab-${cat}`}
        >
          {gridServices(cat).map((item, index) => (
            <div
              key={item.id}
              className={`menu-item reveal${index % 2 === 1 ? " reveal-delay-1" : ""}`}
            >
              <div className="menu-item-info">
                <div className="menu-item-time">{item.duration_minutes} min</div>
                <div className="menu-item-name">{item.name}</div>
                <div className="menu-item-desc">{item.description ?? ""}</div>
              </div>
              <div className="menu-item-price">{formatPrice(item.price)}</div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
