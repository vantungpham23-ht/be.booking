/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type MenuTab = "mens" | "womens" | "spa" | "massage" | "eyebrow";
type Lang = "en" | "sk";

type TeamMember = {
  name: string;
  role: string;
  bio: {
    en: string;
    sk: string;
  };
  focus: {
    en: string;
    sk: string;
  };
  avatarSrc: string;
  avatarAlt: string;
};

const team: TeamMember[] = [
  {
    name: "Quan K.",
    role: "Master Barber",
    bio: {
      en: "Men's grooming specialist with 3+ years of experience. Master of classic fades and modern beard design.",
      sk: "Špecialista na pánske strihy s viac ako 3 rokmi skúseností. Majster klasických fade strihov a modernej úpravy brady.",
    },
    focus: {
      en: "Men's grooming · Skin fades · Beard design",
      sk: "Pánsky grooming · Skin fades · Úprava brady",
    },
    avatarSrc: "/quan.JPG",
    avatarAlt: "Marek V. – Master Barber tại Be. Hair & Barber",
  },
  {
    name: "Son Ngo.",
    role: "Master Barber",
    bio: {
      en: "Men's grooming specialist with 2+ years of experience. Master of classic fades and modern beard design",
      sk: "Špecialista na pánske strihy s viac ako 2 rokmi skúseností. Majster klasických fade strihov a modernej úpravy brady.",
    },
    focus: {
      en: "Men's grooming · Skin fades · Beard design",
      sk: "Pánsky grooming · Skin fades · Úprava brady",
    },
    avatarSrc: "/son.JPG",
    avatarAlt: "Lucia K. – Color Specialist tại Be. Hair & Barber",
  },
  {
    name: "Hank.",
    role: "Head Spa Expert",
    bio: {
      en: "Scalp and hair treatment expert. Combines traditional massage with modern spa therapies for a deeply relaxing experience.",
      sk: "Expert na ošetrenie vlasov a pokožky hlavy. Spája tradičné masáže s modernými spa procedúrami pre hlboký oddych.",
    },
    focus: {
      en: "Head spa · Massage · Keratin",
      sk: "Head spa · Masáž · Keratín",
    },
    avatarSrc: "/hank.JPG",
    avatarAlt: "Jana M. – Head Spa Expert tại Be. Hair & Barber",
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<MenuTab>("mens");
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const cursor = document.getElementById("cursor");
    const ring = document.getElementById("cursorRing");

    if (!cursor || !ring) return;

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let frameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = `${mx}px`;
      cursor.style.top = `${my}px`;
    };

    document.addEventListener("mousemove", handleMouseMove);

    const animateRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      frameId = window.requestAnimationFrame(animateRing);
    };

    animateRing();

    const reveals = document.querySelectorAll<HTMLElement>(".reveal");
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

    const nav = document.querySelector<HTMLElement>("nav");
    const handleScroll = () => {
      if (!nav) return;
      nav.style.background =
        window.scrollY > 80
          ? "rgba(10,10,10,0.97)"
          : "linear-gradient(to bottom, rgba(0,0,0,0.92), transparent)";
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const goToBooking = () => {
    window.location.href = "https://booking.behairbarber.shop/booking/";
  };

  const texts = {
    en: {
      nav: {
        about: "About Us",
        services: "Services",
        team: "Our Team",
        contact: "Contact",
        book: "Book Now",
      },
      hero: {
        eyebrow: "✦ Budapeštianská 38, Ťahanovce ✦",
        title1: "YOUR SHINE,",
        title2: "Our Masterpiece.",
        sub: "High-end hair artistry — every cut is a masterpiece, every visit reveals a more confident you.",
        cta: "Book Now",
        scroll: "Discover",
      },
      story: {
        label: "Our Story",
        headingLine1: "Art Beyond",
        headingLine2: "Every Cut",
        p1: "Be. Hair & Barber was born from a deep passion for hair artistry and a desire to offer a complete grooming experience where technique meets aesthetics.",
        p2: "Here, every client is entrusted to artists who understand face structure, trends, and each person's own vision.",
        p3: "We believe beauty is not imitation, but discovering and honoring the best version of yourself.",
        stat1: "Years of Experience",
        stat2: "Happy Clients",
        stat3: "Dedication",
      },
      team: {
        label: "Expert Team",
        heading1: "The Artists",
        heading2: "Behind Your Look",
        desc: "Each expert at Be. is highly trained and constantly updated on the latest trends and techniques from fashion capitals worldwide.",
      },
      menu: {
        label: "Price List",
        title: "Cenník / Price List",
        sub: "Top-tier quality — transparent pricing",
      },
      footer: {
        tagline: "Hair & Barber Studio",
        description:
          "Your Shine, Our Masterpiece — a premium grooming space where every detail is crafted around your confidence.",
        servicesTitle: "Services",
        hoursTitle: "Opening Hours",
        addressTitle: "Address",
        bookNow: "Book Now",
        copyright: "All rights reserved.",
      },
    },
    sk: {
      nav: {
        about: "O nás",
        services: "Služby",
        team: "Náš tím",
        contact: "Kontakt",
        book: "Objednať sa",
      },
      hero: {
        eyebrow: "✦ Budapeštianská 38, Ťahanovce ✦",
        title1: "TVOJ LESK,",
        title2: "Naše majstrovské dielo.",
        sub: "Prémiový barber & hair salon — každý strih je originál, každá návšteva nový pocit sebavedomia.",
        cta: "Objednať sa",
        scroll: "Objavuj",
      },
      story: {
        label: "Náš príbeh",
        headingLine1: "Umenie nad",
        headingLine2: "Každým strihom",
        p1: "Be. Hair & Barber vznikol z vášne pre kadernícke remeslo a túžby ponúknuť kompletný grooming zážitok, kde sa technika spája s estetikou.",
        p2: "Každý klient je v rukách majstrov, ktorí rozumejú tvaru tváre, trendom aj osobnému štýlu.",
        p3: "Veríme, že krása nie je napodobňovanie, ale objavenie a zvýraznenie tej najlepšej verzie seba samého.",
        stat1: "Rokov skúseností",
        stat2: "Spokojných klientov",
        stat3: "Nasadenie",
      },
      team: {
        label: "Náš tím",
        heading1: "Umelci",
        heading2: "Za vašim vzhľadom",
        desc: "Každý člen tímu Be. je odborne vyškolený a neustále sleduje nové trendy aj techniky z módnych metropol.",
      },
      menu: {
        label: "Cenník služieb",
        title: "Cenník / Price List",
        sub: "Špičková kvalita — férové ceny",
      },
      footer: {
        tagline: "Hair & Barber Studio",
        description:
          "Your Shine, Our Masterpiece — prémiový grooming priestor, kde každý detail je o vašej sebadôvere.",
        servicesTitle: "Služby",
        hoursTitle: "Otváracie hodiny",
        addressTitle: "Adresa",
        bookNow: "Objednať sa",
        copyright: "Všetky práva vyhradené.",
      },
    },
  } as const;

  return (
    <>
      <div className="cursor" id="cursor" />
      <div className="cursor-ring" id="cursorRing" />

      <nav>
        <a href="#" className="nav-logo">
          <span className="nav-logo-mark">
            <img src="/be-logo.svg" alt="Be. Hair &amp; Barber logo" />
          </span>
        </a>
        <ul className="nav-links">
          <li>
            <a href="#story">{texts[lang].nav.about}</a>
          </li>
          <li>
            <a href="#menu">{texts[lang].nav.services}</a>
          </li>
          <li>
            <a href="#team">{texts[lang].nav.team}</a>
          </li>
          <li>
            <a href="#contact">{texts[lang].nav.contact}</a>
          </li>
        </ul>
        <div className="nav-actions">
          <div className="nav-lang-switch">
            <button
              type="button"
              className={lang === "en" ? "active" : ""}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <span>/</span>
            <button
              type="button"
              className={lang === "sk" ? "active" : ""}
              onClick={() => setLang("sk")}
            >
              SK
            </button>
          </div>
          <button className="nav-book" type="button" onClick={goToBooking}>
            {texts[lang].nav.book}
          </button>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-lines" />
          <div className="hero-content">
            <p className="hero-eyebrow">{texts[lang].hero.eyebrow}</p>
            <h1 className="hero-title">YOUR SHINE,</h1>
            <h1 className="hero-title-italic">Our Masterpiece.</h1>
            <div className="hero-divider">
              <div className="hero-divider-line" />
              <div className="hero-divider-diamond" />
              <div className="hero-divider-line right" />
            </div>
            <p className="hero-sub">{texts[lang].hero.sub}</p>
            <a
              href="https://booking.behairbarber.shop/booking/"
              className="hero-cta"
            >
              <span>{texts[lang].hero.cta}</span>
              <span className="hero-cta-arrow">→</span>
            </a>
          </div>
          <div className="hero-scroll">
            <span>{texts[lang].hero.scroll}</span>
            <div className="scroll-line" />
          </div>
        </section>

        <div className="gold-divider" />

        <section className="story" id="story">
          <div className="story-text reveal">
            <div style={{ position: "relative" }}>
              <div className="story-number">Be</div>
              <div className="section-label">{texts[lang].story.label}</div>
              <h2>
                {texts[lang].story.headingLine1}
                <br />
                Trên <em>{texts[lang].story.headingLine2}</em>
              </h2>
              <p>
                {texts[lang].story.p1}
              </p>
              <p>
                {texts[lang].story.p2}
              </p>
              <p>
                {texts[lang].story.p3}
              </p>
            </div>
            <div className="story-stats">
              <div>
                <span className="stat-num">5+</span>
                <span className="stat-label">{texts[lang].story.stat1}</span>
              </div>
              <div>
                <span className="stat-num">2K+</span>
                <span className="stat-label">{texts[lang].story.stat2}</span>
              </div>
              <div>
                <span className="stat-num">100%</span>
                <span className="stat-label">{texts[lang].story.stat3}</span>
              </div>
            </div>
          </div>
          <div className="story-visual reveal reveal-delay-2">
            <div className="story-img-frame">
              <div className="corner-decor tl" />
              <div className="corner-decor tr" />
              <div className="corner-decor bl" />
              <div className="corner-decor br" />
              <div className="story-img-inner">
                <Image
                  src="/be-salon.jpg"
                  alt="Be. Hair &amp; Barber salon"
                  fill
                  priority
                  className="object-cover"
                />

              </div>
            </div>
          </div>
        </section>

        <div className="gold-divider" />

        <section className="menu-section" id="menu">
          <div className="menu-bg-text">PRICE LIST</div>
          <div className="menu-header reveal">
            <div className="section-label" style={{ justifyContent: "center" }}>
              {texts[lang].menu.label}
            </div>
            <h2>
              {texts[lang].menu.title.split(" ")[0]}{" "}
              <span>{texts[lang].menu.title.split(" ").slice(1).join(" ")}</span>
            </h2>
            <p>{texts[lang].menu.sub}</p>
          </div>

          <div className="special-combos reveal">
            <div className="special-combo-card">
              <div className="special-combo-title">
                BE SPECIAL COMBO PRE MUZOV <span>(60 MIN)</span>
              </div>
              <div className="special-combo-desc">
                Strih, umytie vlasov, masaz hlavy a sije, maska na tvar,
                susenie a zaverecny styling
              </div>
              <div className="special-combo-price">35€</div>
            </div>
            <div className="special-combo-card">
              <div className="special-combo-title">
                BE SPECIAL COMBO PRE ZENY <span>(90-120 MIN)</span>
              </div>
              <div className="special-combo-desc">
                Umytie vlasov, masaz hlavy a sije, kolagenova kura, maska na
                tvar, susenie vlasov prof. fenom Dyson, zaverecny styling
              </div>
              <div className="special-combo-price">65€</div>
            </div>
          </div>

          <div className="menu-tabs reveal reveal-delay-1">
            <button
              type="button"
              className={`menu-tab ${activeTab === "mens" ? "active" : ""}`}
              onClick={() => setActiveTab("mens")}
            >
              ✂ Men&apos;s Grooming
            </button>
            <button
              type="button"
              className={`menu-tab ${activeTab === "womens" ? "active" : ""}`}
              onClick={() => setActiveTab("womens")}
            >
              ♦ Women&apos;s Salon
            </button>
            <button
              type="button"
              className={`menu-tab ${activeTab === "spa" ? "active" : ""}`}
              onClick={() => setActiveTab("spa")}
            >
              ◈ Head Spa
            </button>
            <button
              type="button"
              className={`menu-tab ${activeTab === "massage" ? "active" : ""}`}
              onClick={() => setActiveTab("massage")}
            >
              ❧ Body Massage
            </button>
            <button
              type="button"
              className={`menu-tab ${activeTab === "eyebrow" ? "active" : ""}`}
              onClick={() => setActiveTab("eyebrow")}
            >
              ◉ Eyebrow
            </button>
          </div>

          <div
            className={`menu-grid ${activeTab === "mens" ? "active" : ""}`}
            id="tab-mens"
          >
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">30 min</div>
                <div className="menu-item-name">KLASICKÝ STRIH</div>
                <div className="menu-item-desc">
                  Classic Haircut — strih strojčekom, nožnicami, umytie vlasov,
                  styling
                </div>
              </div>
              <div className="menu-item-price">15€</div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">40 min</div>
                <div className="menu-item-name">STRIH DLHÝCH VLASOV</div>
                <div className="menu-item-desc">
                  Long Haircut over 20cm — strih nožnicami, umytie vlasov,
                  styling
                </div>
              </div>
              <div className="menu-item-price">18€</div>
            </div>
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">30 min</div>
                <div className="menu-item-name">DETSKÝ STRIH</div>
                <div className="menu-item-desc">
                  Kids Haircut — deti do 13 rokov
                </div>
              </div>
              <div className="menu-item-price">10€</div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">30 min</div>
                <div className="menu-item-name">ÚPRAVA BRADY BRITVOU</div>
                <div className="menu-item-desc">Straight Razor Beard Trim</div>
              </div>
              <div className="menu-item-price">
                <small>od </small>5-10€
              </div>
            </div>
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">45 min</div>
                <div className="menu-item-name">
                  KOMBINÁCIA STRIH + ÚPRAVA BRADY
                </div>
                <div className="menu-item-desc">
                  Combo: Haircut + Beard Trim
                </div>
              </div>
              <div className="menu-item-price">25€</div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">25 min</div>
                <div className="menu-item-name">FARBENIE ŠEDÍN</div>
                <div className="menu-item-desc">Grey Hair Coverage</div>
              </div>
              <div className="menu-item-price">20€</div>
            </div>
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">60 min</div>
                <div className="menu-item-name">ODFARBOVANIE VLASOV</div>
                <div className="menu-item-desc">Hair Bleaching</div>
              </div>
              <div className="menu-item-price">40€</div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">40 min</div>
                <div className="menu-item-name">
                  KLASICKÉ FARBENIE VLASOV
                </div>
                <div className="menu-item-desc">Classic Hair Coloring</div>
              </div>
              <div className="menu-item-price">25€</div>
            </div>
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">—</div>
                <div className="menu-item-name">TRVALÁ ONDULÁCIA VLASOV</div>
                <div className="menu-item-desc">Men&apos;s Perm</div>
              </div>
              <div className="menu-item-price">
                <small>od </small>35€
              </div>
            </div>
          </div>

          <div
            className={`menu-grid ${activeTab === "womens" ? "active" : ""}`}
            id="tab-womens"
          >
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">20 min</div>
                <div className="menu-item-name">FÚKANÁ VLASOV</div>
                <div className="menu-item-desc">
                  Blow Dry — umytie, sušenie, styling
                </div>
              </div>
              <div className="menu-item-price">15€</div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">45 min</div>
                <div className="menu-item-name">
                  STRIHANIE KOMPLET
                </div>
                <div className="menu-item-desc">
                  Signature Cut — umytie, strih, sušenie, styling
                </div>
              </div>
              <div className="menu-item-price">21€</div>
            </div>
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">80-120 min</div>
                <div className="menu-item-name">
                  FARBENIE BEZ ODFARBOVANIA
                </div>
                <div className="menu-item-desc">
                  Essential Color — umytie, sušenie, styling
                </div>
              </div>
              <div className="menu-item-price">
                <small>od </small>40€
              </div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">60–90 min</div>
                <div className="menu-item-name">MELÍR</div>
                <div className="menu-item-desc">
                  Highlights — umytie, sušenie, styling
                </div>
              </div>
              <div className="menu-item-price">
                <small>od </small>55€
              </div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">120–400 min</div>
                <div className="menu-item-name">BALAYAGE</div>
                <div className="menu-item-desc">
                  Balayage — umytie, sušenie, styling
                </div>
              </div>
              <div className="menu-item-price">
                <small>od </small>80€
              </div>
            </div>
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">100-200 min</div>
                <div className="menu-item-name">ODFARBENIE VLASOV</div>
                <div className="menu-item-desc">
                  Hair Bleaching — umytie, strih, sušenie, styling
                </div>
              </div>
              <div className="menu-item-price">
                <small>od </small>60€-120€
              </div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">60–300 min</div>
                <div className="menu-item-name">
                  TRVALÁ ONDULÁCIA VLASOV
                </div>
                <div className="menu-item-desc">
                  Perm — umytie, sušenie, styling
                </div>
              </div>
              <div className="menu-item-price">
                <small>od </small>40€
              </div>
            </div>
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">240–400 min</div>
                <div className="menu-item-name">VYROVNÁVANIE VLASOV</div>
                <div className="menu-item-desc">
                  Hair Straightening Treatment — vyrovnávacia kúra
                </div>
              </div>
              <div className="menu-item-price">
                <small>od </small>65€
              </div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">60–90 min</div>
                <div className="menu-item-name">KERATÍNOVA REGENERÁCIA</div>
                <div className="menu-item-desc">
                  Keratin Regeneration — umytie, sušenie, keratínová kúra
                </div>
              </div>
              <div className="menu-item-price">
                <small>od </small>35€
              </div>
            </div>
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">60 min</div>
                <div className="menu-item-name">KOLAGÉNOVA KÚRA</div>
                <div className="menu-item-desc">Collagen Treatment</div>
              </div>
              <div className="menu-item-price">
                <small>od </small>18€
              </div>
            </div>
          </div>

          <div
            className={`menu-grid ${activeTab === "spa" ? "active" : ""}`}
            id="tab-spa"
          >
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">60 min</div>
                <div className="menu-item-name">CLASSIC HEAD SPA</div>
                <div className="menu-item-desc">
                  Umytie vlasov, relaxačná masáž hlavy, tváre, šije a ramien,
                  rúk
                </div>
              </div>
              <div className="menu-item-price">40€</div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">75 min</div>
                <div className="menu-item-name">STANDARD HEAD SPA</div>
                <div className="menu-item-desc">
                  Umytie vlasov, relaxačná masáž hlavy, tváre, šije a ramien,
                  dekoltu, chrbta, rúk, maska na tvár, teplé obklady na oči
                </div>
              </div>
              <div className="menu-item-price">55€</div>
            </div>
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">90 min</div>
                <div className="menu-item-name">LUXURY HEAD SPA</div>
                <div className="menu-item-desc">
                  Odstránenie make-upu, umývanie tváre, umytie vlasov šampónom,
                  relaxačná masáž hlavy, tváre, šije, ramien, dekoltu, chrbta,
                  horných a dolných končatín, teplé obklady na oči, maska na
                  tvár
                </div>
              </div>
              <div className="menu-item-price">65€</div>
            </div>
          </div>

          <div
            className={`menu-grid ${activeTab === "massage" ? "active" : ""}`}
            id="tab-massage"
          >
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">60 min</div>
                <div className="menu-item-name">
                  RELAXAČNÁ MASÁŽ CELÉHO TELA
                </div>
                <div className="menu-item-desc">
                  Relaxing Full Body Massage — masáž hlavy, chrbta, rúk, nôh
                </div>
              </div>
              <div className="menu-item-price">40€</div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">90 min</div>
                <div className="menu-item-name">
                  TERAPEUTICKÁ MASÁŽ CELÉHO TELA
                </div>
                <div className="menu-item-desc">
                  Therapeutic Full Body Massage — pôsobí hlboko na svalové
                  skupiny krku, šije, ramien, chrbta a dolných končatín
                </div>
              </div>
              <div className="menu-item-price">60€</div>
            </div>
          </div>

          <div
            className={`menu-grid ${activeTab === "eyebrow" ? "active" : ""}`}
            id="tab-eyebrow"
          >
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">EYEBROW</div>
                <div className="menu-item-name">ÚPRAVA OBOČIA (PINZETOU)</div>
                <div className="menu-item-desc">Eyebrow shaping (tweezers)</div>
              </div>
              <div className="menu-item-price">7€</div>
            </div>
            <div className="menu-item reveal reveal-delay-1">
              <div className="menu-item-info">
                <div className="menu-item-time">EYEBROW</div>
                <div className="menu-item-name">ZASTRIHÁVANIE OBOČIA</div>
                <div className="menu-item-desc">Eyebrow trimming</div>
              </div>
              <div className="menu-item-price">5€</div>
            </div>
            <div className="menu-item reveal">
              <div className="menu-item-info">
                <div className="menu-item-time">EYEBROW</div>
                <div className="menu-item-name">FARBENIE OBOČIA</div>
                <div className="menu-item-desc">Eyebrow coloring</div>
              </div>
              <div className="menu-item-price">8€</div>
            </div>
          </div>
        </section>

        <div className="gold-divider" />

        <section className="team-section" id="team">
          <div className="team-header reveal">
            <div>
              <div className="section-label">{texts[lang].team.label}</div>
              <h2>
                {texts[lang].team.heading1}
                <br />
                <em>{texts[lang].team.heading2}</em>
              </h2>
            </div>
            <p>{texts[lang].team.desc}</p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div
                key={member.name}
                className={`team-card reveal${
                  index === 1 ? " reveal-delay-1" : index === 2 ? " reveal-delay-2" : ""
                }`}
              >
                <div className="team-card-visual">
                  <Image
                    src={member.avatarSrc}
                    alt={member.avatarAlt}
                    fill
                    className="object-cover"
                  />
                  <div className="team-card-overlay">
                    <div className="team-name">{member.name}</div>
                    <div className="team-role">{member.role}</div>
                    <div className="team-desc">{member.bio[lang]}</div>
                    <div className="team-skills">
                      <span className="team-skill">{member.focus[lang]}</span>
                    </div>
                  </div>
                </div>
                <div className="team-card-info">
                  <div className="team-name" style={{ fontSize: 15 }}>
                    {member.name}
                  </div>
                  <div className="team-role">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>


        <footer id="contact">
          <div className="footer-top">
            <div className="footer-brand">
              <h3>Be.</h3>
              <p className="tagline">{texts[lang].footer.tagline}</p>
              <p>{texts[lang].footer.description}</p>
              <a
                href="https://booking.behairbarber.shop/booking/"
                className="footer-book-btn"
              >
                {texts[lang].footer.bookNow}
              </a>
              <div className="footer-social">
                <a
                  href="https://instagram.com/be.hairbarber"
                  className="social-btn"
                  title="Instagram"
                >
                  ig
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61586703411435"
                  className="social-btn"
                  title="Facebook"
                >
                  fb
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4>{texts[lang].footer.servicesTitle}</h4>
              <ul>
                <li>
                  <a href="#menu">Men&apos;s Grooming</a>
                </li>
                <li>
                  <a href="#menu">Women&apos;s Salon</a>
                </li>
                <li>
                  <a href="#menu">Head Spa</a>
                </li>
                <li>
                  <a href="#menu">Body Massage</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>{texts[lang].footer.hoursTitle}</h4>
              <div className="hours-row">
                <span>Pon – Pia</span>
                <span className="hours-time">9:00 – 19:00</span>
              </div>
              <div className="hours-row">
                <span>Sobota</span>
                <span className="hours-time">9:00 – 18:00</span>
              </div>
              <div className="hours-row">
                <span>Nedeľa</span>
                <span className="hours-time">10:00 – 17:00</span>
              </div>
            </div>
            <div className="footer-col">
              <h4>{texts[lang].footer.addressTitle}</h4>
              <p>
                Budapeštianská 38
                <br />
                Ťahanovce, Slovakia
              </p>
              <p className="footer-phone">
                <a href="tel:0944490503" className="footer-phone-link">
                  0944 490 503
                </a>
              </p>
              <p className="footer-handle">
                <a
                  href="https://instagram.com/be.hairbarber"
                  target="_blank"
                  rel="noreferrer"
                >
                  @be.hairbarber
                </a>
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              © 2026 <span className="gold-text">Be. Hair &amp; Barber</span>.
              {` ${texts[lang].footer.copyright}`}
            </p>
            <p className="footer-credit">
              Designed by{" "}
              <a
                href="https://www.instagram.com/vt.phh"
                target="_blank"
                rel="noreferrer"
                className="gold-text"
              >
                Aiden Pham
              </a>{" "}
              <span className="gold-text">♦</span> for excellence
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

