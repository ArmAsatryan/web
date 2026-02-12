import { type LucideIcon } from "lucide-react";
import {SiFacebook, SiInstagram, SiLinkedin, SiTelegram, SiWhatsapp} from "react-icons/si";

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "For Business", href: "#b2b" },
  { label: "Reviews", href: "#reviews" },
  { label: "Team", href: "#team" },
  { label: "Contact", href: "#contact" },
];

export const features = [
  {
    title: "Ballistic Calculator",
    description: "Advanced trajectory computation engine with atmospheric corrections, Coriolis effect, spin drift, and more. Get precise firing solutions in real time.",
    icon: "Crosshair" as const,
  },
  {
    title: "Ammo Database",
    description: "Comprehensive ammunition library with detailed ballistic data for thousands of cartridges. Search, compare, and select with confidence.",
    icon: "Database" as const,
  },
  {
    title: "Reticle Database",
    description: "Extensive collection of reticle patterns with overlay visualization. Match your optic to your ammunition for perfect subtensions.",
    icon: "Focus" as const,
  },
  {
    title: "BALLISTiQ PRO Mini-Apps",
    description: "Specialized tools including unit converters, wind calculators, range estimation, and target log. Everything a precision shooter needs.",
    icon: "LayoutGrid" as const,
  },
  {
    title: "Kestrel Integration",
    description: "Seamless integration with Kestrel weather meters for live atmospheric data. Automatic environmental updates for maximum accuracy.",
    icon: "Wind" as const,
  },
  {
    title: "Offline Ready",
    description: "Full functionality without internet connection. All calculations run locally on your device, ensuring reliability in the field.",
    icon: "WifiOff" as const,
  },
];

export const pricingPlans = [
  {
    name: "BALLISTiQ",
    price: "Free",
    description: "Essential ballistic tools for every shooter",
    features: [
      "Ballistic Calculator",
      "Basic Ammo Database",
      "Reticle Database",
      "Offline Mode",
      "Unit Converters",
    ],
    cta: "Download Free",
    highlighted: false,
  },
  {
    name: "BALLISTiQ PRO",
    price: "Free",
    priceSuffix: "(Beta)",
    description: "Advanced features for precision shooters",
    features: [
      "Everything in Free",
      "PRO Mini-Apps Suite",
      "Kestrel Integration",
      "Advanced Trajectory Modeling",
      "Custom Ammo Profiles",
      "Target Log & Analytics",
      "Priority Support",
    ],
    cta: "Get PRO Beta",
    highlighted: true,
    badge: "Beta",
  },
];

export const b2bSolutions = [
  {
    title: "C++ Engine for Thermal Scopes",
    description: "Embed our ballistic engine directly into thermal imaging scopes. Provides real-time firing solutions overlay on thermal imagery.",
    image: "ThermalScope",
  },
  {
    title: "C++ Engine for Ground Drones (UGV)",
    description: "Integrate precision ballistics into unmanned ground vehicles. Automated targeting solutions for autonomous and remotely operated systems.",
    image: "UGV",
  },
  {
    title: "C++ Engine for Smart Turrets",
    description: "Power remote weapon stations with advanced ballistic computation. Full trajectory calculation suite for automated turret systems.",
    image: "SmartTurret",
  },
];

export const reviews = [
  {
    name: "Mike R.",
    handle: "@precisionshooter",
    rating: 5,
    text: "BALLISTiQ is hands down the best ballistic calculator I've used. The accuracy of the trajectory predictions is remarkable, and the Kestrel integration is a game-changer.",
  },
  {
    name: "David K.",
    handle: "@longrangehunter",
    rating: 5,
    text: "Finally a ballistic app that works offline in the field. The ammo database is comprehensive, and the reticle overlay feature saved me hours of manual calculation.",
  },
  {
    name: "Sarah T.",
    handle: "@competitiveshooter",
    rating: 5,
    text: "The PRO features are incredible. The mini-apps suite covers everything I need during competitions. Clean interface and reliable calculations every time.",
  },
  {
    name: "James L.",
    handle: "@tacticalpro",
    rating: 5,
    text: "Great tool for professionals. The C++ engine performance is impressive - calculations are instant. Looking forward to seeing more ammo added to the database.",
  },
  {
    name: "Alex P.",
    handle: "@outdoorsman_alex",
    rating: 5,
    text: "Switched from three different apps to just BALLISTiQ. Everything I need in one place. The wind calculator alone is worth it.",
  },
  {
    name: "Mikita_ch",
    handle: "Nov 16, 2025",
    rating: 5,
    text: "Interface simple d'utilisation qui a l'air tr\u00e8s complet pour mon usage TLD et surtout j'aime la r\u00e9activit\u00e9 et l'efficacit\u00e9 du service d'aide en ligne qui malgr\u00e9 le week-end et l'heure tardive m'a offert une r\u00e9ponse d\u00e9taill\u00e9e et en fran\u00e7ais en moins d'une minute.",
  },
];

export const teamMembers = [
  {
    name: "Armen Asatryan",
    role: "Co-Founder & CEO",
    image: "Armen_Asatryan",
  },
  {
    name: "Gerasim Israyelyan",
    role: "Co-Founder & CTO",
    image: "Gerasim_Israyelyan",
  },
  {
    name: "Spartak Kyureghyan",
    role: "Co-Founder & CFO",
    image: "Spartak_Kyureghyan",
  },
  {
    name: "Ishkhan Gevorgyan",
    role: "Co-Founder & CPO",
    image: "Ishkhan_Gevorgyan",
  },
  {
    name: "Andranik Eghoyan",
    role: "Android Magician",
    image: "Andranik_Eghoyan",
  },
  {
    name: "Arame Avetisyan",
    role: "Software Test Engineers",
    image: "Arame_Avetisyan",
  },
];

export const socialLinks = [
  { name: "Facebook", url: "https://www.facebook.com/profile.php?id=61575991441085", Icon: SiFacebook },
  { name: "Instagram", url: "https://instagram.com/ballistiq_app", Icon: SiInstagram },
  { name: "LinkedIn", url: "https://www.linkedin.com/company/103644170", Icon: SiLinkedin },
  { name: "Telegram", url: "https://t.me/ballistiqsupport", Icon: SiTelegram },
  { name: "WhatsApp", url: "https://wa.me/353899602753", Icon: SiWhatsapp },
];