import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HttpAgent } from "@icp-sdk/core/agent";
import { CheckCircle, ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SiInstagram, SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";
import type { backendInterface as FullBackendInterface } from "../backend.d";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import { StorageClient } from "../utils/StorageClient";

// ── Data

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

const DEFAULT_PORTFOLIO_ITEMS = [
  {
    id: 1,
    src: "/assets/dsc_5580-019d3e37-cfae-70d9-bc3f-d15dd3ea56ce.jpg",
    caption: "Editorial Edge",
  },
  {
    id: 2,
    src: "/assets/dsc_5618-019d3e37-d097-707c-a42e-4215bed205c6.jpg",
    caption: "Quiet Radiance",
  },
  {
    id: 3,
    src: "/assets/dsc_5692-019d3e37-d70b-731b-918a-f26da67d0bcc.jpg",
    caption: "The Frame",
  },
  {
    id: 4,
    src: "/assets/dsc_5638-019d3e37-d97e-70b8-8194-af193911ea59.jpg",
    caption: "In Focus",
  },
  {
    id: 5,
    src: "/assets/dsc_5680-019d3e37-db5d-75db-ba88-edfb6619c9e6.jpg",
    caption: "Poolside",
  },
  {
    id: 6,
    src: "/assets/dsc_5656-019d3e37-ddf1-76da-91ff-0127d0e67262.jpg",
    caption: "Bold & Free",
  },
  {
    id: 7,
    src: "/assets/dsc_5722-019d3e37-e1ba-75b1-bed3-5d63be20c44b.jpg",
    caption: "Street Story",
  },
  {
    id: 8,
    src: "/assets/dsc_5715-019d3e37-e212-77ff-95af-13281757d1d9.jpg",
    caption: "Raw Light",
  },
  {
    id: 9,
    src: "/assets/dsc_5718-019d3e37-e38b-7021-b14d-fe10bee6b387.jpg",
    caption: "Together",
  },
];

const DEFAULT_SERVICES = [
  {
    id: 0,
    name: "CREATOR MINI PACK",
    subtitle: "Quick & Fresh",
    price: "₹3,999",
    description:
      "A compact content shoot for creators — one nearby location, fast delivery, and reels included.",
    features: [
      "30–45 minute shoot",
      "1 nearby location (café / street / home vibe)",
      "8–10 professionally edited photos",
      "2 short-form reels (trendy + simple edits)",
      "Basic posing guidance",
      "Delivery within 48–72 hours",
    ],
    highlighted: false,
  },
  {
    id: 1,
    name: "THE SPARK",
    subtitle: "Quick Shoot",
    price: "₹4,999",
    description:
      "A compact 1-hour shoot perfect for headshots, solo portraits, or small brand content. Clean, sharp, and straightforward.",
    features: [
      "1-hour session",
      "1 location",
      "10 edited photos",
      "Online gallery",
      "Digital files",
    ],
    highlighted: false,
  },
  {
    id: 2,
    name: "THE FRAME",
    subtitle: "Editorial Session",
    price: "₹25,000",
    description:
      "A focused editorial session for models, brands, or personal style — sharp, intentional, and story-driven.",
    features: [
      "3-hour session",
      "1–2 locations",
      "100+ edited photos",
      "Online gallery",
      "Print-ready files",
    ],
    highlighted: false,
  },
  {
    id: 3,
    name: "THE VISION",
    subtitle: "Full Lookbook / Campaign",
    price: "₹50,000",
    description:
      "A complete visual campaign for fashion brands, designers, or model portfolios. Built to make a statement.",
    features: [
      "8-hour coverage",
      "Up to 3 locations",
      "300+ edited photos",
      "Brand mood direction",
      "Online gallery",
      "Print-ready files",
    ],
    highlighted: true,
  },
  {
    id: 4,
    name: "THE LEGACY",
    subtitle: "Premium Multi-Day",
    price: "₹85,000",
    description:
      "For those who want it all — weddings, destination shoots, full brand campaigns. Two days, unlimited vision.",
    features: [
      "16-hour coverage",
      "Multiple locations",
      "500+ edited photos",
      "Premium retouching",
      "Behind-the-scenes reel",
      "Priority booking",
    ],
    highlighted: false,
  },
  {
    id: 5,
    name: "INFLUENCER PLAN",
    subtitle: "Content Creator Plan",
    price: "₹12,999 – ₹16,999 / month",
    description:
      "A monthly content package built for influencers and creators — consistent shoots, edited photos, and reels to keep your feed active.",
    features: [
      "2 shoots per month",
      "30–50 edited photos",
      "6–10 reels (short-form videos)",
      "Basic content direction (poses, trends, ideas)",
      "Priority delivery",
    ],
    highlighted: false,
  },
];

const DEFAULT_CONTENT: Record<string, string> = {
  "hero.subtitle": "Photography by Yashraj Gill",
  "hero.tagline":
    "Where style meets story — fashion, portraits, and every frame in between",
  "hero.cta_primary": "View Portfolio",
  "hero.cta_secondary": "Book a Shoot",
  "about.heading": "Every frame is a feeling",
  "about.bio_1":
    "I'm Yashraj — a storyteller with a camera. I grew up watching my parents dance in the kitchen to old Bollywood songs, and somewhere in that moment, I learned what real emotion looks like.",
  "about.bio_2":
    "For me, photography isn't about perfect poses or studio lights. It's about the quiet laugh before the kiss, the tear that escapes before you can wipe it away, the way hands intertwine when no one is watching.",
  "about.bio_3":
    "I've had the privilege of shooting 200+ stories across India — fashion editorials, weddings, portraits, and everything in between.",
  "about.bio_4":
    "If you're looking for someone who will blend into your story and capture it exactly as it is — raw, real, and full of laughter — then I think we're going to work beautifully together.",
  "contact.whatsapp": "919999999999",
  "contact.instagram": "lensandlaughs",
  "contact.email": "yashraj@lensandlaughs.in",
  "contact.phone": "+91 99999 99999",
  "footer.tagline":
    "Where style meets story — fashion, portraits, and every frame in between.",
};

// ── Booking Modal

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  preSelectedPackage?: string;
}

function BookingModal({
  open,
  onClose,
  preSelectedPackage,
}: BookingModalProps) {
  const { actor } = useActor();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: preSelectedPackage || "",
    eventDate: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setLoading(true);
    try {
      await actor.submitBookingRequest(
        form.name,
        form.email,
        form.phone,
        form.eventType,
        form.eventDate,
        form.message,
      );
      setSuccess(true);
      toast.success("Booking request sent! We'll be in touch soon.");
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg bg-background"
        data-ocid="booking.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-foreground tracking-wide">
            Book a Shoot
          </DialogTitle>
        </DialogHeader>
        {success ? (
          <div
            className="flex flex-col items-center gap-3 py-8"
            data-ocid="booking.success_state"
          >
            <CheckCircle className="w-12 h-12 text-gold" />
            <p className="font-serif text-lg">Request Received!</p>
            <p className="text-muted-foreground text-sm text-center">
              Thank you! We'll get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="bk-name"
                  className="text-xs uppercase tracking-wider"
                >
                  Name
                </Label>
                <Input
                  id="bk-name"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  data-ocid="booking.input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="bk-email"
                  className="text-xs uppercase tracking-wider"
                >
                  Email
                </Label>
                <Input
                  id="bk-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="bk-phone"
                  className="text-xs uppercase tracking-wider"
                >
                  Phone
                </Label>
                <Input
                  id="bk-phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs uppercase tracking-wider">
                  Event Type
                </Label>
                <Select
                  value={form.eventType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, eventType: v }))
                  }
                >
                  <SelectTrigger data-ocid="booking.select">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fashion Editorial">
                      Fashion Editorial
                    </SelectItem>
                    <SelectItem value="Lookbook / Campaign">
                      Lookbook / Campaign
                    </SelectItem>
                    <SelectItem value="Portrait">Portrait</SelectItem>
                    <SelectItem value="Wedding">Wedding</SelectItem>
                    <SelectItem value="Pre-Wedding">Pre-Wedding</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="Brand Campaign">
                      Brand Campaign
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="bk-date"
                className="text-xs uppercase tracking-wider"
              >
                Event Date
              </Label>
              <Input
                id="bk-date"
                type="date"
                value={form.eventDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, eventDate: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="bk-msg"
                className="text-xs uppercase tracking-wider"
              >
                Message
              </Label>
              <Textarea
                id="bk-msg"
                rows={3}
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
                data-ocid="booking.textarea"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-ocid="booking.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !actor}
                className="bg-gold text-white hover:bg-gold/90 border-0"
                data-ocid="booking.submit_button"
              >
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main

export default function Home() {
  const { actor: _actor } = useActor();
  const actor = _actor as FullBackendInterface | null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPackage, setBookingPackage] = useState("");

  // Dynamic content from backend
  const [content, setContent] =
    useState<Record<string, string>>(DEFAULT_CONTENT);
  const [portfolioItems, setPortfolioItems] = useState(DEFAULT_PORTFOLIO_ITEMS);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const storageClientRef = useRef<StorageClient | null>(null);

  useEffect(() => {
    if (!actor) return;
    let cancelled = false;

    const getStorageClient = async () => {
      if (storageClientRef.current) return storageClientRef.current;
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      storageClientRef.current = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      return storageClientRef.current;
    };

    const fetchAll = async () => {
      try {
        const [contentEntries, portfolioData, servicePackages] =
          await Promise.all([
            actor.getSiteContent(),
            actor.getPortfolioItems(),
            actor.getServicePackages(),
          ]);

        if (cancelled) return;

        // Site content
        if (contentEntries.length > 0) {
          const map: Record<string, string> = { ...DEFAULT_CONTENT };
          for (const entry of contentEntries) {
            if (entry.value) map[entry.key] = entry.value;
          }
          setContent(map);
        }

        // Services
        if (servicePackages.length > 0) {
          const sorted = [...servicePackages].sort(
            (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
          );
          const mapped = sorted.map((pkg) => ({
            id: Number(pkg.id),
            name: pkg.name,
            subtitle: pkg.subtitle,
            price: pkg.price,
            description: pkg.description,
            features: pkg.features,
            highlighted: pkg.highlighted,
          }));
          setServices(mapped);
        }

        // Portfolio items with resolved URLs
        if (portfolioData.length > 0) {
          try {
            const sc = await getStorageClient();
            const withUrls = await Promise.all(
              portfolioData
                .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
                .map(async (item) => {
                  try {
                    const url = await sc.getDirectURL(item.blobKey);
                    return {
                      id: Number(item.id),
                      src: url,
                      caption: item.caption,
                    };
                  } catch {
                    return null;
                  }
                }),
            );
            const valid = withUrls.filter(
              (x): x is { id: number; src: string; caption: string } =>
                x !== null,
            );
            if (!cancelled && valid.length > 0) {
              setPortfolioItems(valid);
            }
          } catch {
            // Keep defaults on storage client error
          }
        }
      } catch {
        // Keep defaults on error
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [actor]);

  const c = (key: string) => content[key] ?? DEFAULT_CONTENT[key] ?? "";

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    message: "",
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setContactLoading(true);
    try {
      await actor.submitContactForm(
        contactForm.name,
        contactForm.email,
        contactForm.phone,
        contactForm.message,
        contactForm.eventDate,
      );
      setContactSuccess(true);
      toast.success("Message sent! We'll get back to you soon.");
      setContactForm({
        name: "",
        email: "",
        phone: "",
        eventType: "",
        eventDate: "",
        message: "",
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  const openBooking = (pkg?: string) => {
    setBookingPackage(pkg || "");
    setBookingOpen(true);
  };

  const whatsappNumber = c("contact.whatsapp");
  const instagramHandle = c("contact.instagram");

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-32 md:h-36 flex items-center justify-between">
          <a href="#home" className="flex items-center" data-ocid="nav.link">
            <img
              src="/assets/uploads/untitled_design-019d3dd4-2493-72de-9c26-e2b9270ca794-1.png"
              alt="Lens & Laughs"
              className="h-[110px] md:h-[130px] w-auto object-contain"
            />
          </a>

          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="nav.link"
              >
                {link.label}
              </a>
            ))}
            <Button
              onClick={() => openBooking()}
              className="bg-gold text-white hover:bg-gold/90 border-0 text-sm tracking-widest uppercase font-medium px-5"
              data-ocid="nav.primary_button"
            >
              Book Now
            </Button>
          </nav>

          <button
            type="button"
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            data-ocid="nav.toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-t border-border/50 overflow-hidden"
            >
              <nav className="px-6 py-4 flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                    data-ocid="nav.link"
                  >
                    {link.label}
                  </a>
                ))}
                <Button
                  onClick={() => {
                    openBooking();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gold text-white hover:bg-gold/90 border-0 w-full text-sm tracking-widest uppercase"
                  data-ocid="nav.primary_button"
                >
                  Book Now
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Photography byline — below header, above hero */}
      <div className="mt-32 md:mt-36 bg-background text-center py-3 border-b border-border/30">
        <p className="text-foreground text-xs md:text-sm tracking-[0.35em] uppercase font-sans font-medium">
          {c("hero.subtitle")}
        </p>
      </div>

      {/* HERO */}
      <section id="home" className="relative">
        {/* Full image — no cropping, full portrait shown */}
        <img
          src="/assets/uploads/2x7a1263-019d3ddd-89be-763b-af9a-c13fb23205b0-1.jpg"
          alt="Hero"
          className="block w-full h-auto"
        />

        {/* Gradient overlay — bottom-to-top so text at bottom is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Text content — pinned to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-0 flex items-end pb-12 z-10"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="max-w-2xl">
              <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                Lens &amp; Laughs
              </h1>
              <p className="text-white/85 text-lg md:text-xl font-light max-w-md leading-relaxed mb-10">
                {c("hero.tagline")}
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#portfolio">
                  <Button
                    className="bg-gold text-white hover:bg-gold/90 border-0 px-8 py-3 h-auto text-sm tracking-widest uppercase font-medium"
                    data-ocid="hero.primary_button"
                  >
                    {c("hero.cta_primary") || "View Portfolio"}
                  </Button>
                </a>
                <Button
                  variant="outline"
                  onClick={() => openBooking()}
                  className="border-white text-white bg-transparent hover:bg-white/10 px-8 py-3 h-auto text-sm tracking-widest uppercase font-medium"
                  data-ocid="hero.secondary_button"
                >
                  {c("hero.cta_secondary") || "Book a Shoot"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 z-10"
        >
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">
              Our Work
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-wide">
              Portfolio
            </h2>
          </motion.div>

          <motion.div layout className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {portfolioItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="group relative overflow-hidden aspect-[3/4] cursor-pointer"
                  data-ocid={`portfolio.item.${i + 1}`}
                >
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white font-serif text-sm italic">
                      {item.caption}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative max-w-sm mx-auto">
                <div className="absolute -top-4 -left-4 w-full h-full border-2 border-gold/30" />
                <img
                  src="/assets/uploads/photographer-photo.jpg"
                  alt="Yashraj Gill"
                  className="w-full object-cover shadow-warm relative z-10"
                />
                <div className="absolute -bottom-6 -right-4 bg-background px-6 py-4 shadow-warm z-20">
                  <p className="font-script text-3xl text-gold">Yashraj Gill</p>
                  <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
                    Photographer
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-12 md:mt-0"
            >
              <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">
                The Artist
              </p>
              <h2 className="font-serif text-4xl font-bold mb-6 leading-snug">
                {c("about.heading")}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{c("about.bio_1")}</p>
                <p>{c("about.bio_2")}</p>
                <p>{c("about.bio_3")}</p>
                <p className="text-foreground font-medium">
                  {c("about.bio_4")}
                </p>
              </div>
              <Button
                onClick={() => openBooking()}
                className="mt-8 bg-gold text-white hover:bg-gold/90 border-0 px-8 h-11 text-sm tracking-widest uppercase"
                data-ocid="about.primary_button"
              >
                Work With Me
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">
              Packages
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-wide">
              Services
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              Whether you're a model, brand, couple, or just someone with a
              story to tell — there's a package built for you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex flex-col p-6 border ${
                  svc.highlighted
                    ? "border-gold bg-card shadow-warm"
                    : "border-border bg-card"
                }`}
                data-ocid={`services.card.${i + 1}`}
              >
                {svc.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs tracking-widest uppercase px-4 py-1">
                    Most Popular
                  </div>
                )}
                <p className="text-gold text-xs tracking-[0.35em] uppercase mb-1">
                  {svc.subtitle}
                </p>
                <h3 className="font-serif text-base font-bold mb-2">
                  {svc.name}
                </h3>
                <p className="font-serif text-lg font-bold text-gold mb-4">
                  {svc.price}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed mb-6">
                  {svc.description}
                </p>
                <ul className="space-y-2 mb-8 flex-1">
                  {svc.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2 text-xs text-foreground"
                    >
                      <span className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => openBooking(svc.name)}
                  className={`w-full h-11 text-sm tracking-widest uppercase ${
                    svc.highlighted
                      ? "bg-gold text-white hover:bg-gold/90 border-0"
                      : "bg-transparent text-foreground border border-foreground hover:bg-foreground hover:text-background"
                  }`}
                  data-ocid={`services.primary_button.${i + 1}`}
                >
                  Book This
                </Button>
              </motion.div>
            ))}
          </div>

          {/* CUSTOM BUDGET BANNER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 bg-foreground px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8"
            data-ocid="services.panel"
          >
            <div className="text-center md:text-left">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-background mb-3">
                Working with a specific budget?
              </h3>
              <p className="text-background/65 max-w-xl text-base leading-relaxed">
                Every story deserves to be told. Reach out and we'll craft
                something that works perfectly for you — no cookie-cutter
                pricing, just a plan built around your vision.
              </p>
            </div>
            <div className="flex-shrink-0">
              <a href="#contact">
                <Button
                  className="bg-gold text-white hover:bg-gold/90 border-0 px-10 h-12 text-sm tracking-widest uppercase font-medium whitespace-nowrap"
                  data-ocid="services.secondary_button"
                >
                  Let's Talk
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-blush/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">
              Get In Touch
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold">
              Let's Tell Your Story
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              Every great story starts with a conversation. Tell us about your
              moment and we'll make it unforgettable.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-3"
            >
              {contactSuccess ? (
                <div
                  className="flex flex-col items-center gap-4 py-16"
                  data-ocid="contact.success_state"
                >
                  <CheckCircle className="w-14 h-14 text-gold" />
                  <h3 className="font-serif text-2xl">Message Sent!</h3>
                  <p className="text-muted-foreground text-center">
                    Thank you for reaching out. We'll get back to you within 24
                    hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setContactSuccess(false)}
                    className="border-gold text-gold hover:bg-gold/10"
                  >
                    Send Another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor="ct-name"
                        className="text-xs uppercase tracking-wider"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="ct-name"
                        required
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        data-ocid="contact.input"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor="ct-email"
                        className="text-xs uppercase tracking-wider"
                      >
                        Email
                      </Label>
                      <Input
                        id="ct-email"
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm((p) => ({
                            ...p,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor="ct-phone"
                        className="text-xs uppercase tracking-wider"
                      >
                        Phone
                      </Label>
                      <Input
                        id="ct-phone"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs uppercase tracking-wider">
                        Event Type
                      </Label>
                      <Select
                        value={contactForm.eventType}
                        onValueChange={(v) =>
                          setContactForm((p) => ({ ...p, eventType: v }))
                        }
                      >
                        <SelectTrigger data-ocid="contact.select">
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fashion Editorial">
                            Fashion Editorial
                          </SelectItem>
                          <SelectItem value="Lookbook / Campaign">
                            Lookbook / Campaign
                          </SelectItem>
                          <SelectItem value="Portrait">Portrait</SelectItem>
                          <SelectItem value="Wedding">Wedding</SelectItem>
                          <SelectItem value="Pre-Wedding">
                            Pre-Wedding
                          </SelectItem>
                          <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                          <SelectItem value="Brand Campaign">
                            Brand Campaign
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="ct-date"
                      className="text-xs uppercase tracking-wider"
                    >
                      Event Date
                    </Label>
                    <Input
                      id="ct-date"
                      type="date"
                      value={contactForm.eventDate}
                      onChange={(e) =>
                        setContactForm((p) => ({
                          ...p,
                          eventDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="ct-msg"
                      className="text-xs uppercase tracking-wider"
                    >
                      Your Story
                    </Label>
                    <Textarea
                      id="ct-msg"
                      rows={4}
                      placeholder="Tell us about your special moment..."
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((p) => ({
                          ...p,
                          message: e.target.value,
                        }))
                      }
                      data-ocid="contact.textarea"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={contactLoading || !actor}
                    className="bg-gold text-white hover:bg-gold/90 border-0 w-full h-12 text-sm tracking-widest uppercase"
                    data-ocid="contact.submit_button"
                  >
                    {contactLoading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-2 flex flex-col gap-6"
            >
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-card border border-border hover:border-gold transition-colors group"
                data-ocid="contact.primary_button"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <SiWhatsapp className="text-white text-xl" />
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-gold transition-colors">
                    Chat on WhatsApp
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quick replies, usually within an hour
                  </p>
                </div>
              </a>

              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-card border border-border hover:border-gold transition-colors group"
                data-ocid="contact.secondary_button"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                  <SiInstagram className="text-white text-xl" />
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-gold transition-colors">
                    @{instagramHandle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Follow our journey on Instagram
                  </p>
                </div>
              </a>

              <div className="p-6 bg-card border border-border">
                <h4 className="font-serif text-lg font-semibold mb-3">
                  Working Together
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>📍 Based in Pune, shooting across India</li>
                  <li>📅 Availability 2026 open</li>
                  <li>⏱ Response within 24 hours</li>
                  <li>💛 Destination shoots welcome</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-footer py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="font-serif text-2xl font-bold text-white tracking-wide mb-3">
                Lens &amp; Laughs
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {c("footer.tagline")}
              </p>
              <div className="flex gap-4 mt-5">
                <a
                  href={`https://instagram.com/${instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-gold transition-colors"
                  aria-label="Instagram"
                >
                  <SiInstagram size={20} />
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-gold transition-colors"
                  aria-label="WhatsApp"
                >
                  <SiWhatsapp size={20} />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white/70 text-xs tracking-widest uppercase mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-white/50 hover:text-gold text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white/70 text-xs tracking-widest uppercase mb-4">
                Contact
              </h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li>{c("contact.email")}</li>
                <li>{c("contact.phone")}</li>
                <li>Pune, India</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              &copy; {new Date().getFullYear()} Lens &amp; Laughs. All rights
              reserved.
            </p>
            <p className="text-white/30 text-sm">
              Built with ♥ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preSelectedPackage={bookingPackage}
      />
    </div>
  );
}
