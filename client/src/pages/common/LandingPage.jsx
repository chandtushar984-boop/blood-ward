import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplet,
  MapPin,
  BellRing,
  ShieldCheck,
  HeartHandshake,
  Activity,
  Radar,
  Lock,
  Layers,
  CheckCircle2,
  Clock,
  Building2,
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  Check,
  Award,
} from "lucide-react";
import Button from "../../components/common/Button";
import BloodCompatibility from "../../components/common/BloodCompatibility";

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqItems = [
    {
      q: "Who is eligible to donate blood on BloodWard?",
      a: "Healthy individuals aged 18–65 with a minimum weight of 45 kg (typically 50 kg for complete units) who meet pre-screening health criteria can register. Registered donors complete a self-reported health questionnaire and maintain their active availability. Final suitability is confirmed in person by medical staff at the hospital or licensed blood bank before collection.",
    },
    {
      q: "How does BloodWard protect donor location and privacy?",
      a: "BloodWard employs a three-layer privacy shield: 1) Donor coordinates are coarsened by ~300–900m around city centroids so residential addresses are never exposed; 2) Personal contact numbers remain masked until a voluntary donor explicitly accepts a blood request; 3) Donors set a static home base and are never tracked via continuous background GPS.",
    },
    {
      q: "What is the difference between an individual recipient and a hospital representative?",
      a: "Individual recipients are patients or family members coordinating urgent personal blood needs; their requests activate immediately. Hospital representatives are institutional medical coordinators who require administrative verification before their requisitions are dispatched, preventing fraudulent broadcasts across the network.",
    },
    {
      q: "How does the date-aware radius matching system work?",
      a: "Emergency requests needed today default to a 20 KM radius horizon to guarantee rapid transit. Requests needed tomorrow default to 30 KM, and planned procedures in 2+ days default to 50 KM. Users can also select canonical presets [5, 10, 20, 30, 50 KM] or expand to 'Any distance' as clinical requirements dictate.",
    },
    {
      q: "How does BloodWard prevent duplicate or competing donor responses?",
      a: "BloodWard uses an atomic single-winner concurrency model on MongoDB. When multiple donors attempt to accept the same requisition simultaneously, the database atomically assigns the match to the first arrival and immediately responds with HTTP 409 Conflict to any subsequent requests, automatically clearing the accepted requisition from other donors' dispatch radars.",
    },
    {
      q: "Does BloodWard charge any fees for blood requests or donor matches?",
      a: "No. BloodWard is a voluntary healthcare coordination infrastructure designed strictly to connect emergency requisitions with altruistic voluntary donors. Selling blood or charging matching fees is strictly prohibited and contrary to medical and legal ethics.",
    },
  ];

  const donationSteps = [
    {
      step: "01",
      title: "Self-Screening & Availability",
      desc: "Complete the preliminary health questionnaire and toggle your availability status to 'Available' when ready to receive proximity alerts.",
      icon: HeartHandshake,
      color: "crimson",
    },
    {
      step: "02",
      title: "Real-Time Emergency Dispatch",
      desc: "Receive instant push alerts via WebSocket when an active blood request within your bounded radius matches your clinically compatible blood group.",
      icon: BellRing,
      color: "blue",
    },
    {
      step: "03",
      title: "Voluntary Acceptance",
      desc: "Review hospital location, urgency, and procedure timeline on the radar map. Accept with atomic single-winner protection to unlock hospital direct contact.",
      icon: CheckCircle2,
      color: "green",
    },
    {
      step: "04",
      title: "Clinical Donation at Facility",
      desc: "Arrive at the accredited medical center. Authorized healthcare providers verify your vitals, collect the donation, and provide post-donation recovery care.",
      icon: Activity,
      color: "navy",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-[#F8FAFC] dark:bg-[#0F1115] text-[#1E293B] dark:text-[#F1F5F9] transition-colors">
      {/* 1. HERO SECTION: EDITORIAL HEALTHCARE PLATFORM */}
      <section id="home" className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 border-b border-[#E2E8F0] dark:border-[#343B47] bg-white dark:bg-[#181B21] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Hero Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FEF2F2] dark:bg-[#A61B2B]/20 border border-[#FECACA] dark:border-[#A61B2B]/40 text-[#A61B2B] dark:text-rose-400 text-xs font-semibold tracking-wide uppercase">
                <Droplet className="w-3.5 h-3.5 fill-current" />
                <span>CLINICAL EMERGENCY BLOOD DISPATCH NETWORK</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1E293B] dark:text-[#F1F5F9] leading-[1.14]">
                Emergency Blood Matching,{" "}
                <span className="text-[#A61B2B] dark:text-rose-500">
                  When Seconds Count.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#475569] dark:text-[#CBD5E1] max-w-2xl font-normal leading-relaxed">
                Connect directly with nearby verified voluntary blood donors. Privacy-first geographic discovery with real-time push dispatch, date-aware distance horizons [5..50 KM], and shielded contact disclosure.
              </p>

              {/* Primary Dual Call to Action */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/register/donor")}
                  className="w-full sm:w-auto font-bold shadow-sm"
                >
                  <HeartHandshake className="w-4 h-4 mr-2" /> Donate Blood
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/register/recipient")}
                  className="w-full sm:w-auto font-semibold"
                >
                  <Search className="w-4 h-4 mr-2" /> Find Blood & Requisition
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto font-medium text-xs text-[#1E293B] dark:text-[#F1F5F9]"
                >
                  Sign In to Workspace →
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E2E8F0] dark:border-[#343B47] grid grid-cols-3 gap-3 text-xs text-[#475569] dark:text-[#CBD5E1] max-w-lg mx-auto lg:mx-0 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#28734A] dark:text-emerald-400 shrink-0" />
                  <span>Privacy Shielded</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Radar className="w-4 h-4 text-[#315B83] dark:text-sky-400 shrink-0" />
                  <span>Bounded Radius</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-[#A61B2B] dark:text-rose-400 shrink-0" />
                  <span>Instant Broadcast</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Hero Card: Blood Compatibility Reference Component (5 cols) */}
            <div className="lg:col-span-5">
              <BloodCompatibility defaultRecipientGroup="O+" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#315B83] dark:text-sky-400">
            Operational Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight">
            How BloodWard Coordinates Transfusions
          </h2>
          <p className="text-[#475569] dark:text-[#CBD5E1] text-xs sm:text-sm leading-relaxed">
            Engineered to coordinate emergency blood discovery without administrative latency, middleman markups, or privacy compromise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white dark:bg-[#181B21] p-6 sm:p-7 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs space-y-3 relative hover:border-[#315B83] dark:hover:border-sky-500 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] dark:bg-sky-950/40 text-[#315B83] dark:text-sky-300 border border-[#BFDBFE] dark:border-sky-800/50 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <span className="text-[10px] font-medium uppercase text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#20242C] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#343B47]">
                Hospital Entry
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F1F5F9] pt-1">Issue Clinical Requisition</h3>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              Recipients publish blood requests specifying recipient blood group, units, hospital facility, and date-aware matching radius [5, 10, 20, 30, 50 KM].
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-[#181B21] p-6 sm:p-7 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs space-y-3 relative hover:border-[#A61B2B] dark:hover:border-rose-500 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] dark:bg-rose-950/40 text-[#A61B2B] dark:text-rose-400 border border-[#FECACA] dark:border-rose-800/50 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <span className="text-[10px] font-medium uppercase text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#20242C] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#343B47]">
                WebSocket Push
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F1F5F9] pt-1">Targeted Proximity Dispatch</h3>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              Compatible, available voluntary donors inside the bounded radius receive instantaneous real-time alerts via Socket.IO targeted rooms without refreshing.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-[#181B21] p-6 sm:p-7 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs space-y-3 relative hover:border-[#28734A] dark:hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#28734A] dark:text-emerald-400 border border-[#BBF7D0] dark:border-emerald-800/50 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <span className="text-[10px] font-medium uppercase text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#20242C] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#343B47]">
                Single Winner
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F1F5F9] pt-1">Verified Acceptance & Arrival</h3>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              When an eligible donor accepts, atomic concurrency locks the match. Hospital contact credentials unlock securely while other donor radars update instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 3. BLOOD DONATION PROCESS SECTION */}
      <section id="donation-process" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A61B2B] dark:text-rose-400">
            Clinical Protocol
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight">
            The Voluntary Blood Donation Journey
          </h2>
          <p className="text-[#475569] dark:text-[#CBD5E1] text-xs sm:text-sm leading-relaxed">
            From preliminary self-reported readiness to hospital donation: safe, structured, and clinically vetted.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {donationSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-white dark:bg-[#181B21] p-6 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs space-y-3 flex flex-col justify-between hover:border-[#315B83] dark:hover:border-sky-500 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#A61B2B] dark:text-rose-400">
                      STAGE {step.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] flex items-center justify-center text-[#315B83] dark:text-sky-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-[#1E293B] dark:text-[#F1F5F9]">{step.title}</h3>
                  <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">{step.desc}</p>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#343B47] text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-[#28734A] dark:text-emerald-400" /> Standardized Procedure
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. WHY BLOODWARD SECTION */}
      <section id="why-bloodward" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="bg-white dark:bg-[#181B21] rounded-2xl p-6 sm:p-10 border border-[#E2E8F0] dark:border-[#343B47] shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#F0F7FF] dark:bg-sky-950/40 text-[#315B83] dark:text-sky-300 text-xs font-semibold border border-[#BFDBFE] dark:border-sky-800/50">
              <Radar className="w-3.5 h-3.5" /> CLINICAL COMPARISON
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight">
              Why Healthcare Coordinates with BloodWard
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              Traditional emergency blood searches rely on fragmented social media broadcasts, unverified phone lists, and chaotic hospital hallways. BloodWard replaces noise with authoritative geospatial precision and medical safety.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-[#FEF2F2] dark:bg-rose-950/40 text-[#A61B2B] dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B] dark:text-[#F1F5F9]">Clinical RBC Compatibility Engine</h4>
                  <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1] mt-0.5">Automated mapping checks donor-recipient antigen compatibility across all 8 major blood groups before alerts fire.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-[#F0F7FF] dark:bg-sky-950/40 text-[#315B83] dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B] dark:text-[#F1F5F9]">Date-Aware Radius Horizons</h4>
                  <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1] mt-0.5">Preset horizons: 20 KM for today, 30 KM for tomorrow, 50 KM for scheduled procedures. Zero synthetic travel inflation.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#28734A] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B] dark:text-[#F1F5F9]">Atomic Concurrency Single-Winner Lock</h4>
                  <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1] mt-0.5">Eliminates duplicate donor arrivals through MongoDB atomic state locking with HTTP 409 conflict safety.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#F8FAFC] dark:bg-[#20242C] p-6 sm:p-8 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] space-y-6">
            <h3 className="text-base font-bold text-[#1E293B] dark:text-[#F1F5F9] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#315B83] dark:text-sky-400" /> Traditional vs BloodWard Architecture
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-white dark:bg-[#181B21] rounded-lg border border-[#E2E8F0] dark:border-[#343B47] space-y-1">
                <span className="text-[#A61B2B] dark:text-rose-400 font-bold block text-[11px]">TRADITIONAL BROADCAST:</span>
                <span className="text-[#64748B] dark:text-[#94A3B8] block font-sans text-xs">Public phone leaks, irrelevant blood group spam, distant uncoordinated donors, race conditions.</span>
              </div>

              <div className="p-3 bg-white dark:bg-[#181B21] rounded-lg border border-[#BBF7D0] dark:border-[#28734A]/50 space-y-1">
                <span className="text-[#28734A] dark:text-emerald-400 font-bold block text-[11px]">BLOODWARD CLINICAL DISPATCH:</span>
                <span className="text-[#1E293B] dark:text-[#F1F5F9] block font-sans text-xs font-medium">Targeted RBC matching, ~500m coordinate coarsening, gated contact disclosure, atomic acceptance.</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
              <div className="bg-white dark:bg-[#181B21] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#343B47]">
                <span className="block text-lg font-bold text-[#A61B2B] dark:text-rose-400">8 of 8</span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">RBC Blood Groups</span>
              </div>
              <div className="bg-white dark:bg-[#181B21] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#343B47]">
                <span className="block text-lg font-bold text-[#315B83] dark:text-sky-400">&lt;20ms</span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Push Notification Sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOSPITAL AND INSTITUTIONAL TRUST SECTION */}
      <section id="institutional-trust" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#315B83] dark:text-sky-400">
            Institutional Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight">
            Hospital Verification & Medical Trust
          </h2>
          <p className="text-[#475569] dark:text-[#CBD5E1] text-xs sm:text-sm leading-relaxed">
            Maintaining clinical integrity through administrative credential review and role segregation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#181B21] p-6 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] dark:bg-sky-950/40 text-[#315B83] dark:text-sky-300 border border-[#BFDBFE] dark:border-sky-800/50 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1E293B] dark:text-[#F1F5F9]">Hospital Coordinator Vetting</h3>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              Institutional accounts require representative designation, facility address, and official authorization notes reviewed by platform administrators.
            </p>
          </div>

          <div className="bg-white dark:bg-[#181B21] p-6 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] dark:bg-amber-950/40 text-[#A66B19] dark:text-amber-300 border border-[#FDE68A] dark:border-amber-800/50 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1E293B] dark:text-[#F1F5F9]">Pending Verification Gate</h3>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              Hospital requisitions remain held in Pending Verification until credentials are confirmed, preventing rogue broadcasts from reaching voluntary donors.
            </p>
          </div>

          <div className="bg-white dark:bg-[#181B21] p-6 rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#28734A] dark:text-emerald-400 border border-[#BBF7D0] dark:border-emerald-800/50 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1E293B] dark:text-[#F1F5F9]">Immutable Audit Logging</h3>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              Every verification approval, rejection reason, account block, and request cancellation is recorded in server-managed immutable audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* 6. SAFETY AND VERIFICATION EXPLANATION */}
      <section id="safety" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="bg-white dark:bg-[#181B21] rounded-2xl p-6 sm:p-10 border border-[#E2E8F0] dark:border-[#343B47] shadow-xs space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#28734A] dark:text-emerald-400">
              Security & Privacy Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight">
              Safety, Privacy & Clinical Boundaries
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              How BloodWard balances immediate proximity dispatch with clinical privacy and user security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] space-y-2.5">
              <div className="w-7 h-7 rounded-md bg-[#F0F7FF] dark:bg-sky-950/40 text-[#315B83] dark:text-sky-300 flex items-center justify-center font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#1E293B] dark:text-[#F1F5F9]">Self-Reported Health Info</h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                Donor health questionnaire metrics are self-reported for preliminary screening and are never shared with public searches. Clinical clearance occurs at the donation facility.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] space-y-2.5">
              <div className="w-7 h-7 rounded-md bg-[#FEF2F2] dark:bg-rose-950/40 text-[#A61B2B] dark:text-rose-400 flex items-center justify-center font-bold">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#1E293B] dark:text-[#F1F5F9]">~500m Centroid Coarsening</h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                Map markers apply deterministic coordinate jittering (~300–900m) around registered city coordinates, completely preventing triangular residential identification.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] space-y-2.5">
              <div className="w-7 h-7 rounded-md bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#28734A] dark:text-emerald-400 flex items-center justify-center font-bold">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#1E293B] dark:text-[#F1F5F9]">Gated Contact Disclosure</h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                Phone numbers remain masked with bullet dots until a registered donor clicks 'Accept Request'. This eliminates unwanted calls while guaranteeing direct coordination.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#20242C] border border-[#E2E8F0] dark:border-[#343B47] space-y-2.5">
              <div className="w-7 h-7 rounded-md bg-[#FFFBEB] dark:bg-amber-950/40 text-[#A66B19] dark:text-amber-300 flex items-center justify-center font-bold">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#1E293B] dark:text-[#F1F5F9]">HttpOnly Cookie Auth</h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                JWT tokens are stored strictly in secure HttpOnly cookies, eliminating browser cross-site scripting (XSS) credential theft vectors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. IMPACT & ARCHITECTURAL STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1E293B] dark:bg-[#181B21] text-white rounded-2xl p-8 sm:p-10 border border-[#334155] dark:border-[#343B47] shadow-xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#38BDF8]">
              Verified Platform Metrics
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white dark:text-[#F1F5F9]">
              Built on Concrete Architectural Truths
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              We present factual engineering specifications rather than unverifiable marketing claims.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-[#334155] dark:border-[#343B47]">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-[#F87171]">100%</div>
              <div className="text-xs font-bold text-white dark:text-[#F1F5F9]">Clinical RBC Mapping</div>
              <div className="text-[11px] text-[#94A3B8]">All 8 blood groups verified by authoritative compatibility logic.</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-[#38BDF8]">[5..50] KM</div>
              <div className="text-xs font-bold text-white dark:text-[#F1F5F9]">Canonical Distance Presets</div>
              <div className="text-[11px] text-[#94A3B8]">Spherical Haversine calculation with date-aware default horizons.</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-[#4ADE80]">&lt;20ms</div>
              <div className="text-xs font-bold text-white dark:text-[#F1F5F9]">WebSocket Dispatch</div>
              <div className="text-[11px] text-[#94A3B8]">Targeted Socket.IO room broadcasts for instantaneous alert delivery.</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-[#FBBF24]">Single-Winner</div>
              <div className="text-xs font-bold text-white dark:text-[#F1F5F9]">Atomic Concurrency</div>
              <div className="text-[11px] text-[#94A3B8]">HTTP 409 Conflict protection prevents duplicate donor claims.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ) SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#315B83] dark:text-sky-400">
            Common Queries
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[#475569] dark:text-[#CBD5E1] text-xs sm:text-sm">
            Answers to common medical, technical, and operational questions about BloodWard.
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#181B21] rounded-xl border border-[#E2E8F0] dark:border-[#343B47] shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#20242C] transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-[#1E293B] dark:text-[#F1F5F9] leading-tight">
                    {item.q}
                  </span>
                  <span className="p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed border-t border-[#F1F5F9] dark:border-[#343B47] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. BOTTOM CALL TO ACTION BANNER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-[#181B21] rounded-2xl p-8 sm:p-10 border border-[#E2E8F0] dark:border-[#343B47] shadow-sm text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A61B2B] via-[#315B83] to-[#28734A]" />

          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-[#F1F5F9] tracking-tight">
            Ready to Coordinate or Donate Blood?
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] max-w-lg mx-auto leading-relaxed">
            Join thousands of voluntary donors and hospital blood coordinators across verified geographic clusters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/register/donor")}
              className="w-full sm:w-auto font-bold"
            >
              <HeartHandshake className="w-4 h-4 mr-1.5" /> Register as Voluntary Donor
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate("/register/recipient")}
              className="w-full sm:w-auto font-semibold"
            >
              <Building2 className="w-4 h-4 mr-1.5 text-[#315B83] dark:text-sky-400" /> Issue Hospital Request
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
