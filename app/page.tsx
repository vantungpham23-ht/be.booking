import Image from "next/image";
import Link from "next/link";
import { Scissors, Sparkles, Flame, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BOOKING_URL = "https://booking.behairbarber.shop/booking/";

const services = [
  {
    id: "klasicky-strih",
    name: "Klasický strih (30 min)",
    description: "Classic haircut with wash and styling. Most booked men’s service.",
    duration: "30 min",
    price: "15€",
    icon: Scissors,
  },
  {
    id: "melir",
    name: "Melír (60–90 min)",
    description: "Highlights for light, dimensional colour with styling.",
    duration: "60–90 min",
    price: "od 55€",
    icon: Sparkles,
  },
  {
    id: "classic-head-spa",
    name: "Classic Head Spa (60 min)",
    description: "Relaxing head spa ritual with wash, massage and scalp care.",
    duration: "60 min",
    price: "40€",
    icon: Flame,
  },
];

const team = [
  {
    name: "Quan K.",
    role: "Master Barber",
    bio: "Detail-obsessed with skin fades, classic cuts, and shaping Be. as a calm ritual space.",
    focus: "Men's grooming · Skin fades · Beard design",
  },
  {
    name: "Son Ngo",
    role: "Senior Stylist & Colorist",
    bio: "Blends modern colour techniques with soft, wearable shapes for all hair lengths.",
    focus: "Salon cuts · Balayage & melír · Long hair styling",
  },
  {
    name: "Hank",
    role: "Haircut & Head Spa Specialist",
    bio: "Combines precise clipper work with restorative head spa and body massage.",
    focus: "Clipper work · Head spa · Body massage",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-slate-100 flex flex-col">
      {/* HERO */}
      <section className="relative px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Logo row */}
          <div className="flex items-center justify-between gap-6 be-animate-fade-up">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative h-10 w-16 sm:h-12 sm:w-20">
                {/* Đặt file logo vào public/be-logo.svg để dùng path này */}
                <Image
                  src="/be-logo.svg"
                  alt="Be. Hair & Barber logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <div className="leading-tight">
                <p className="text-xs sm:text-[11px] uppercase tracking-[0.25em] text-slate-400">
                  Be. Hair &amp; Barber
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Your Shine, Our Masterpiece
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              <span className="h-px w-10 bg-slate-700" />
              <span>Košice · Slovakia</span>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[3fr,2fr] items-center">
            <div className="space-y-6 be-animate-fade-up">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Hair &amp; Barber · Head Spa · Body Massage · Košice
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
                <span className="block text-slate-100">Your Shine,</span>
                <span className="block text-slate-300">
                  Our{" "}
                  <span className="be-gold-text">
                    Masterpiece
                  </span>
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl">
                A modern, premium salon for men and women in the heart of
                Košice. Haircuts, colour, beards, head spa and body massage in a
                calm, contemporary space.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 be-animate-fade-up-delay">
                <Link href={BOOKING_URL} passHref legacyBehavior>
                  <a>
                    <Button
                      size="lg"
                      className="be-gold-gradient text-black font-semibold px-8 py-6 text-sm tracking-wide rounded-full shadow-[0_0_28px_rgba(0,0,0,0.6)]"
                    >
                      Book Appointment
                    </Button>
                  </a>
                </Link>
                <div className="space-y-1 text-xs text-slate-500 max-w-xs">
                  <p>
                    Limited daily slots. Reserve your time and let our team take
                    care of your hair, scalp and body.
                  </p>
                  <p className="text-[11px] be-gold-text">
                    Hot: Head Spa ritual now available.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative be-animate-fade-up-delay">
              <div className="rounded-3xl border be-gold-border/60 bg-gradient-to-br from-[#141414] via-[#111111] to-[#050505] p-6 shadow-[0_0_80px_rgba(0,0,0,0.75)]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Košice · Slovakia
                  </p>
                  <span className="text-[11px] px-3 py-1 rounded-full border border-[var(--be-gold-start)]/70 bg-[#121212] text-slate-900 be-gold-gradient uppercase tracking-[0.2em]">
                    Premium
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">
                    Fade, beard, or full restyle —
                    <span className="text-slate-100 font-medium">
                      {" "}
                      we refine every detail.
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Ambient lighting, curated sound, and skilled hands turn your
                    visit into a ritual.
                  </p>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="rounded-xl border border-slate-800 bg-[#141414] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Experience
                    </p>
                    <p className="mt-1 font-medium">Master barbers</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-[#141414] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Booking
                    </p>
                    <p className="mt-1 font-medium">Online 24/7</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-[#141414] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Location
                    </p>
                    <p className="mt-1 font-medium">Budapeštianska 38</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES HIGHLIGHT */}
      <section className="px-4 sm:px-6 lg:px-10 py-12 sm:py-16 bg-gradient-to-b from-[#0b0b0b] to-[#111111] border-y border-slate-900/70">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Top services
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-100 be-animate-fade-up">
                Najčastejšie rezervované služby.
              </h2>
            </div>
            <div className="text-xs text-slate-500 max-w-sm">
              Three services our guests book the most – a classic men&apos;s
              cut, bright dimension with melír, and a deeply relaxing head spa
              ritual.
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.id}
                  className="group relative border border-slate-800 bg-[#111111] hover:be-gold-border transition-all duration-200 hover:-translate-y-1 be-animate-fade-up be-card-soft-float"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base font-semibold text-slate-100">
                        {service.name}
                      </CardTitle>
                      <div className="h-9 w-9 rounded-full border border-[var(--be-gold-start)]/60 bg-[#181818] flex items-center justify-center text-slate-900 be-gold-gradient be-gold-animated">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-slate-400">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-1 rounded-full bg-[#151515] text-slate-300 border border-slate-800">
                        {service.duration}
                      </span>
                      <span className="font-semibold be-gold-text">
                        {service.price}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                      <Link href={BOOKING_URL} passHref legacyBehavior>
                        <a className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400 group-hover:be-gold-text">
                          Book appointment
                        </a>
                      </Link>
                      <span className="h-1 w-8 rounded-full bg-slate-800 group-hover:be-gold-gradient transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICE LIST – DEMO TABLE BASED ON CENNÍK */}
      <section className="px-4 sm:px-6 lg:px-10 py-12 sm:py-16 bg-[#0b0b0b]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Cenník / Price List
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-100">
                Clear, honest pricing.
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Below is a demo of the Be. Hair &amp; Barber price structure. You
              can freely edit the HTML to match the exact official Cenník.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 text-xs sm:text-sm">
            {/* Men's grooming + Head spa */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-300">
                  PÁNSKE HOLIČSTVO
                </h3>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  MEN&apos;S GROOMING
                </p>
                <div className="mt-3 h-px w-16 be-gold-gradient rounded-full" />
              </div>

              <div className="space-y-2">
                <PriceRow
                  label="Klasický strih (30 min)"
                  note="Classic Haircut | umytie vlasov, styling"
                  price="15€"
                />
                <PriceRow
                  label="Strih dlhých vlasov nad 20 cm (40 min)"
                  note="Long Haircut over 20 cm | umytie vlasov, styling"
                  price="18€"
                />
                <PriceRow
                  label="Detský strih (30 min)"
                  note="Kids Haircut | deti do 13 rokov"
                  price="10€"
                />
                <PriceRow
                  label="Úprava brady britvou (30 min)"
                  note="Straight Razor Beard Trim"
                  price="12€"
                />
                <PriceRow
                  label="Kombinácia: strih + úprava brady (45 min)"
                  note="Combo: Haircut + Beard Trim"
                  price="25€"
                />
                <PriceRow
                  label="Farbenie šedín (25 min)"
                  note="Grey Hair Coverage"
                  price="20€"
                />
                <PriceRow
                  label="Klasické farbenie vlasov (40 min)"
                  note="Classic Hair Coloring"
                  price="25€"
                />
                <PriceRow
                  label="Trvalá ondulácia vlasov"
                  note="Men&apos;s Perm"
                  price="od 35€"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-300">
                    HEAD SPA
                  </h3>
                  <div className="mt-2 h-px w-16 be-gold-gradient rounded-full" />
                </div>
                <div className="space-y-2">
                  <PriceRow
                    label="Classic Head Spa (60 min)"
                    note="Umytie vlasov, relaxačná masáž hlavy, tváre, šije a ramien"
                    price="40€"
                  />
                  <PriceRow
                    label="Standard Head Spa (75 min)"
                    note="Rituál s maskou na tvár, teplé obklady na oči"
                    price="55€"
                  />
                  <PriceRow
                    label="Luxury Head Spa (90 min)"
                    note="Rozšírený rituál s masážou chrbta a dekoltu"
                    price="65€"
                  />
                </div>
              </div>
            </div>

            {/* Women's salon + Body massage */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-300">
                  DÁMSKE KADEPNÍCTVO
                </h3>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  WOMEN&apos;S HAIR SALON
                </p>
                <div className="mt-3 h-px w-16 be-gold-gradient rounded-full" />
              </div>

              <div className="space-y-2">
                <PriceRow
                  label="Fúkaná vlasov (20 min)"
                  note="Blow Dry | umytie, sušenie, styling"
                  price="12€"
                />
                <PriceRow
                  label="Strihanie krátke vlasy (45 min)"
                  note="Signature Short Cut | umytie, strih, sušenie, styling"
                  price="18€"
                />
                <PriceRow
                  label="Strihanie dlhé vlasy nad 20 cm (45 min)"
                  note="Signature Long Cut | umytie, strih, sušenie, styling"
                  price="22€"
                />
                <PriceRow
                  label="Farbenie bez odfarbovania (80–120 min)"
                  note="Essential Color | umytie, sušenie, styling"
                  price="50€"
                />
                <PriceRow
                  label="Melír (60–90 min)"
                  note="Highlights | umytie, sušenie, styling"
                  price="od 55€"
                />
                <PriceRow
                  label="Balayage (120–400 min)"
                  note="Balayage / Ombre | umytie, sušenie, styling"
                  price="od 110€"
                />
                <PriceRow
                  label="Trvalá ondulácia vlasov (60–90 min)"
                  note="Permanent Waves | styling included"
                  price="od 60€"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-300">
                    MASÁŽ TELA
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    BODY MASSAGE
                  </p>
                  <div className="mt-2 h-px w-16 be-gold-gradient rounded-full" />
                </div>
                <div className="space-y-2">
                  <PriceRow
                    label="Relaxačná masáž celého tela (60 min)"
                    note="Relaxing Full Body Massage"
                    price="40€"
                  />
                  <PriceRow
                    label="Terapeutická masáž celého tela (90 min)"
                    note="Therapeutic Full Body Massage"
                    price="60€"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            * All services are subject to consultation. Final price depends on
            hair length, technique and product use. Please adjust this text and
            the table HTML to match the official Be. Hair &amp; Barber cenník.
          </p>
        </div>
      </section>

      {/* ABOUT / VIBE + TEAM */}
      <section className="px-4 sm:px-6 lg:px-10 py-14 sm:py-18 lg:py-20 bg-[#0b0b0b]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="grid gap-8 md:grid-cols-[3fr,2fr] items-start">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                The Be. Vibe
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-100">
                Modern. Minimal. Masculine.
              </h2>
              <p className="text-sm text-slate-400">
                Be. Hair &amp; Barber is built for guests who care about detail.
                From the moment you step in, the space is designed to help you
                disconnect — warm lighting, refined materials, and calm energy.
              </p>
              <p className="text-sm text-slate-400">
                Our team combines classic craft with contemporary technique.
                Every cut, fade, colour and shave is done with intention — so
                you leave feeling sharper, lighter, and ready.
              </p>
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-800 bg-[#111111] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-2">
                  What to expect
                </p>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li>· One-on-one attention with your barber or stylist.</li>
                  <li>· Precise consultation before every service.</li>
                  <li>· Clean, minimal interior with ambient music.</li>
                  <li>· Products selected for performance and comfort.</li>
                </ul>
              </div>
              <Link href={BOOKING_URL} passHref legacyBehavior>
                <a className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase be-gold-text">
                  <Wand2 className="h-4 w-4 text-[var(--be-gold-start)]" />
                  Book your ritual in Košice
                </a>
              </Link>
            </div>
          </div>

          {/* Team cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm sm:text-base font-semibold tracking-[0.2em] uppercase text-slate-300">
                Our team
              </h3>
              <span className="hidden sm:inline text-[11px] text-slate-500">
                Demo content – freely edit names, roles and bios in HTML.
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {team.map((member) => (
                <Card
                  key={member.name}
                  className="border border-slate-800 bg-[#101010]"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-100">
                      {member.name}
                    </CardTitle>
                    <p className="text-[11px] uppercase tracking-[0.18em] be-gold-text">
                      {member.role}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-slate-400">{member.bio}</p>
                    <p className="text-[11px] text-slate-500">
                      {member.focus}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto px-4 sm:px-6 lg:px-10 py-8 border-t border-slate-900 bg-[#050505]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between text-xs text-slate-400">
          <div>
            <p className="font-medium text-slate-200">Be. Hair &amp; Barber</p>
            <p>Budapeštianska 38, Ťahanovce, Košice</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Your Shine, Our Masterpiece.
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-200 mb-1">Opening hours</p>
            <p>Mon–Fri: 09:00 – 19:00</p>
            <p>Sat: 09:00 – 18:00</p>
            <p>Sun: 10:00 – 17:00</p>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-slate-200">Connect</p>
            <div className="flex flex-col gap-1">
              <a
                href="https://www.instagram.com/be.hairbarber"
                target="_blank"
                rel="noreferrer"
                className="hover:be-gold-text"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/Be.HairBarber"
                target="_blank"
                rel="noreferrer"
                className="hover:be-gold-text"
              >
                Facebook
              </a>
              <a
                href={BOOKING_URL}
                className="mt-2 inline-flex items-center text-[11px] uppercase tracking-[0.2em] be-gold-text"
              >
                Book appointment
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

type PriceRowProps = {
  label: string;
  note?: string;
  price: string;
};

function PriceRow({ label, note, price }: PriceRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-slate-200 text-xs sm:text-sm">{label}</p>
        {note && (
          <p className="text-[11px] text-slate-500 mt-0.5">{note}</p>
        )}
      </div>
      <p className="text-xs sm:text-sm be-gold-text whitespace-nowrap">
        {price}
      </p>
    </div>
  );
}

