import { Link } from "react-router-dom";

const features = [
  {
    icon: "📚",
    title: "School-based Access",
    desc: "Admins create a unique school code. Students and co-admins join instantly. Every note, notice, and deadline stays private to your school.",
    tag: "Core",
  },
  {
    icon: "🗂️",
    title: "Class-scoped Content",
    desc: "Post notes, notices, and deadlines to specific classes or school-wide. Students only see what's relevant to them.",
    tag: "Organisation",
  },
  {
    icon: "📝",
    title: "Rich Note Upload",
    desc: "Upload PDFs, images, and documents. Files are stored securely on Cloudinary and accessible anytime, anywhere.",
    tag: "Notes",
  },
  {
    icon: "🔖",
    title: "Save & Bookmark",
    desc: "Students can bookmark any note for quick access later. Saved notes live in a dedicated section on the dashboard.",
    tag: "Notes",
  },
  {
    icon: "🔍",
    title: "Live Search",
    desc: "Debounced search across note titles and subject names — results appear as you type, no page reload needed.",
    tag: "Search",
  },
  {
    icon: "🃏",
    title: "Flashcard Generator",
    desc: "Turn any note into a flashcard deck automatically. Study smarter with spaced repetition built in.",
    tag: "Study",
  },
  {
    icon: "⏱️",
    title: "Study Timer",
    desc: "Built-in Pomodoro timer tracks your weekly study hours. Streaks keep you accountable day after day.",
    tag: "Study",
  },
  {
    icon: "🔥",
    title: "Streak Tracking",
    desc: "Login streaks and longest-streak records motivate consistent study habits. Your progress is always visible.",
    tag: "Motivation",
  },
  {
    icon: "📢",
    title: "Notice Board",
    desc: "Admins post school-wide or class-specific notices. Students see only what applies to their class.",
    tag: "Communication",
  },
  {
    icon: "📅",
    title: "Deadline Manager",
    desc: "Never miss a submission. Admins set deadlines per subject and class. Students see them sorted by due date.",
    tag: "Organisation",
  },
  {
    icon: "🌙",
    title: "Dark Mode",
    desc: "Full dark mode support across every page. Easy on the eyes during late-night study sessions.",
    tag: "UI",
  },
  {
    icon: "🔐",
    title: "JWT Authentication",
    desc: "Secure token-based auth with role-based access control. Admins and students see only what they're allowed to.",
    tag: "Security",
  },
];

const tagColors = {
  Core: "bg-[#20160F] text-white",
  Organisation: "bg-[#FF3E68]/15 text-[#FF3E68]",
  Notes: "bg-[#FFEDE5] text-[#FF3E68]",
  Search: "bg-[#20160F]/10 text-[#20160F]",
  Study: "bg-green-50 text-green-700",
  Motivation: "bg-orange-50 text-orange-600",
  Communication: "bg-purple-50 text-purple-600",
  UI: "bg-[#FFF6F1] text-[#20160F]/60",
  Security: "bg-red-50 text-red-500",
};

export default function Features() {
  return (
    <div className="min-h-screen bg-[#FFF6F1]">

      {/* Navbar */}
      <nav className="bg-white border-b border-[#FFEDE5] px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link to="/" className="text-lg font-medium text-[#20160F] tracking-[3px] uppercase">
          Notes
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/features" className="text-sm text-[#FF3E68] font-medium">Features</Link>
          <Link to="/pricing" className="text-sm text-[#20160F]/60 hover:text-[#20160F] transition-colors">Pricing</Link>
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
        <p className="text-xs font-medium text-[#FF3E68] tracking-[3px] uppercase mb-4">Everything you need</p>
        <h1 className="text-4xl font-medium text-[#FFF6F1] leading-snug mb-4">
          Built for schools.<br />Loved by students.
        </h1>
        <p className="text-sm text-[#FFEDE5]/55 max-w-md mx-auto leading-relaxed">
          Notes brings your entire academic life into one organised, secure, and beautifully simple platform.
        </p>
      </div>

      {/* Feature grid */}
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-[#FFEDE5] rounded-2xl p-6 hover:border-[#FF3E68]/40 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl">{f.icon}</span>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${tagColors[f.tag]}`}>
                  {f.tag}
                </span>
              </div>
              <h3 className="text-sm font-medium text-[#20160F] mb-2">{f.title}</h3>
              <p className="text-xs text-[#20160F]/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white border-t border-[#FFEDE5] px-8 py-16 text-center">
        <h2 className="text-2xl font-medium text-[#20160F] mb-3">Ready to get organised?</h2>
        <p className="text-sm text-[#20160F]/50 mb-7">Join thousands of students already using Notes.</p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/register"
            className="h-11 px-6 bg-[#20160F] text-[#FFF6F1] rounded-lg text-sm font-medium hover:bg-[#FF3E68] transition-colors flex items-center"
          >
            Create free account
          </Link>
          <Link
            to="/pricing"
            className="h-11 px-6 bg-[#FFF6F1] text-[#20160F] rounded-lg text-sm font-medium hover:bg-[#FFEDE5] transition-colors flex items-center border border-[#FFEDE5]"
          >
            View pricing
          </Link>
        </div>
      </div>

    </div>
  );
}