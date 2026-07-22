import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect for individual students getting started.",
    highlight: false,
    cta: "Get started free",
    ctaTo: "/register",
    features: [
      "1 school",
      "Up to 50 notes",
      "PDF & image uploads",
      "Flashcard generator",
      "Study timer & streaks",
      "Saved notes",
      "Live search",
      "Dark mode",
    ],
    missing: [
      "Class-scoped notices",
      "Deadline manager",
      "Multiple admins",
      "Priority support",
    ],
  },
  {
    name: "School",
    price: "₹499",
    period: "per month",
    desc: "For schools that want the full experience.",
    highlight: true,
    cta: "Start free trial",
    ctaTo: "/register",
    features: [
      "Unlimited notes",
      "Class-scoped notices & deadlines",
      "Multiple co-admins",
      "Unlimited file uploads",
      "Flashcard generator",
      "Study timer & streaks",
      "Saved notes",
      "Live search",
      "Dark mode",
      "Priority support",
    ],
    missing: [],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    desc: "For large institutions with advanced needs.",
    highlight: false,
    cta: "Contact us",
    ctaTo: "/contact",
    features: [
      "Everything in School",
      "Multiple schools under one account",
      "Custom branding",
      "Dedicated support manager",
      "SLA guarantees",
      "Data export",
      "SSO / custom auth",
    ],
    missing: [],
  },
];

const faqs = [
  {
    q: "Is the free plan really free?",
    a: "Yes — no credit card required. The free plan is free forever with no hidden charges.",
  },
  {
    q: "Can I upgrade or downgrade at any time?",
    a: "Absolutely. You can upgrade to School plan at any time and downgrade at the end of your billing cycle.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data is retained for 30 days after cancellation. You can export everything before then.",
  },
  {
    q: "How does the school code system work?",
    a: "When an admin registers, they create a school and get a unique code. Students and co-admins use that code to join the same school.",
  },
  {
    q: "Do students need to pay?",
    a: "No. Students join for free using their school's code. Only the school admin needs a paid plan for premium features.",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#FFF6F1]">

      {/* Navbar */}
      <nav className="bg-white border-b border-[#FFEDE5] px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link to="/" className="text-lg font-medium text-[#20160F] tracking-[3px] uppercase">
          Notes
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/features" className="text-sm text-[#20160F]/60 hover:text-[#20160F] transition-colors">Features</Link>
          <Link to="/pricing" className="text-sm text-[#FF3E68] font-medium">Pricing</Link>
          <Link to="/login" className="text-sm text-[#20160F]/60 hover:text-[#20160F] transition-colors">Sign in</Link>
          <Link
            to="/register"
            className="h-9 px-4 bg-[#20160F] text-[#FFF6F1] rounded-lg text-sm font-medium hover:bg-[#FF3E68] transition-colors flex items-center"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#20160F] px-8 py-20 text-center">
        <p className="text-xs font-medium text-[#FF3E68] tracking-[3px] uppercase mb-4">Simple pricing</p>
        <h1 className="text-4xl font-medium text-[#FFF6F1] leading-snug mb-4">
          No surprises.<br />Just great software.
        </h1>
        <p className="text-sm text-[#FFEDE5]/55 max-w-md mx-auto leading-relaxed">
          Start free, upgrade when you're ready. Every plan includes the core features students love.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 flex flex-col border transition-all ${
                plan.highlight
                  ? "bg-[#20160F] border-[#20160F] shadow-lg scale-[1.02]"
                  : "bg-white border-[#FFEDE5]"
              }`}
            >
              {plan.highlight && (
                <span className="self-start text-[10px] font-medium bg-[#FF3E68] text-white px-2.5 py-1 rounded-full mb-4">
                  Most popular
                </span>
              )}

              <p className={`text-xs font-medium tracking-wide mb-1 ${plan.highlight ? "text-[#FF3E68]" : "text-[#20160F]/50"}`}>
                {plan.name}
              </p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className={`text-3xl font-medium ${plan.highlight ? "text-[#FFF6F1]" : "text-[#20160F]"}`}>
                  {plan.price}
                </span>
                <span className={`text-xs mb-1.5 ${plan.highlight ? "text-[#FFEDE5]/50" : "text-[#20160F]/40"}`}>
                  / {plan.period}
                </span>
              </div>
              <p className={`text-xs leading-relaxed mb-6 ${plan.highlight ? "text-[#FFEDE5]/55" : "text-[#20160F]/50"}`}>
                {plan.desc}
              </p>

              <Link
                to={plan.ctaTo}
                className={`w-full h-10 rounded-lg text-sm font-medium flex items-center justify-center transition-colors mb-7 ${
                  plan.highlight
                    ? "bg-[#FF3E68] text-white hover:bg-[#FF3E68]/80"
                    : "bg-[#20160F] text-[#FFF6F1] hover:bg-[#FF3E68]"
                }`}
              >
                {plan.cta}
              </Link>

              <div className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <span className="text-[#FF3E68] mt-0.5 flex-shrink-0">✓</span>
                    <span className={`text-xs ${plan.highlight ? "text-[#FFEDE5]/80" : "text-[#20160F]/70"}`}>{f}</span>
                  </div>
                ))}
                {plan.missing.map((f) => (
                  <div key={f} className="flex items-start gap-2 opacity-35">
                    <span className="text-[#20160F] mt-0.5 flex-shrink-0">✕</span>
                    <span className="text-xs text-[#20160F]/60">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-8 pb-16">
        <h2 className="text-xl font-medium text-[#20160F] mb-7 text-center">Common questions</h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white border border-[#FFEDE5] rounded-xl p-5">
              <p className="text-sm font-medium text-[#20160F] mb-2">{faq.q}</p>
              <p className="text-xs text-[#20160F]/55 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white border-t border-[#FFEDE5] px-8 py-16 text-center">
        <h2 className="text-2xl font-medium text-[#20160F] mb-3">Start for free today</h2>
        <p className="text-sm text-[#20160F]/50 mb-7">No credit card required. Set up your school in under 2 minutes.</p>
        <Link
          to="/register"
          className="h-11 px-8 bg-[#20160F] text-[#FFF6F1] rounded-lg text-sm font-medium hover:bg-[#FF3E68] transition-colors inline-flex items-center"
        >
          Create free account
        </Link>
      </div>

    </div>
  );
}