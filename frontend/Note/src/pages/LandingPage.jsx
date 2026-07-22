import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);
  
  return (
    <div className="bg-[#FFF6F1] text-[#20160F]">

      {/* HERO */}
      <section className="bg-[#20160F] text-white flex px-12 pt-20 gap-12 min-h-[480px]">

        {/* LEFT */}
        <div className="flex-1 pb-20">
          <div className="inline-block bg-[#FF3E6822] text-[#FF3E68] px-4 py-1 rounded-full text-xs mb-5 border border-[#FF3E6855]">
            Study smarter, not harder
          </div>

          <h1 className="text-4xl leading-tight mb-4">
            Your notes.<br />
            <span className="text-[#FF3E68]">Organised.</span><br />
            Always.
          </h1>

          <p className="opacity-70 mb-8 max-w-md">
            A beautiful, distraction-free space to capture, organise, and review your study notes.
          </p>

          <div className="flex gap-3">
            <Link
              to={'/register'}
              className="bg-brand-gradient px-6 py-3 rounded-full shadow-soft font-semibold trandistion-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
              Start for free
            </Link>
            <Link
              to={'/'}
              className="border border-white/30 px-6 py-3 rounded-full shadow-md font-semibold trandistion-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
              See how it works
            </Link>
          </div>
        </div>

        {/* RIGHT (Cards) */}
        <div className="flex items-end gap-4 flex-1 justify-center">

          {/* Card */}
          <div className="bg-white text-black p-5 rounded-t-xl w-[200px] h-[200px] shadow-lg">
            <span className="text-xs bg-green-100 px-2 py-1 rounded">
              Biology
            </span>
            <p className="text-sm mt-2 font-medium">
              Cell Division — Mitosis phases
            </p>
          </div>

          <div className="bg-white text-black p-5 rounded-t-xl w-[200px] h-[300px] shadow-lg">
            <span className="text-xs bg-blue-100 px-2 py-1 rounded">
              Mathematics
            </span>
            <p className="text-sm mt-2 font-medium">
              Integration by parts
            </p>
          </div>

          <div className="bg-white text-black p-5 rounded-t-xl w-[200px] h-[240px] shadow-lg">
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
              History
            </span>
            <p className="text-sm mt-2 font-medium">
              World War II
            </p>
          </div>

        </div>
      </section>

      {/* HIGHLIGHTS */}
      <div className="flex justify-center bg-white border-b">
        {[
          ["AI-generated", "Flashcards from any note"],
          ["School-scoped", "Notes stay private to your class"],
          ["Streak tracking", "Stay consistent, day by day"],
          ["Free to use", "No credit card required"],
        ].map((item, i) => (
          <div key={i} className="px-12 py-6 text-center border-r last:border-none">
            <div className="text-lg font-medium">{item[0]}</div>
            <div className="text-xs opacity-50">{item[1]}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="px-12 py-16">
        <p className="text-xs text-[#FF3E68] uppercase mb-2">Features</p>
        <h2 className="text-3xl mb-4">Everything you need to study effectively</h2>

        <div className="grid grid-cols-3 gap-5 mt-10">
          {[
            { title: "Rich note editor", desc: "Upload PDFs, images, or typed notes and keep everything organised by subject and class." },
            { title: "AI flashcards", desc: "Turn any note into a ready-to-study flashcard deck in seconds, generated automatically." },
            { title: "Progress tracking", desc: "Build streaks, log study time, and see how consistent you've been week over week." },
            { title: "Flashcard decks", desc: "Flip through cards or quiz yourself with multiple choice — pick whichever mode sticks." },
            { title: "Instant search", desc: "Find any note by title in a click, scoped to your own class and school." },
            { title: "Smart folders", desc: "Notes are automatically grouped by subject, so nothing gets lost in the shuffle." },
          ].map(({ title, desc }, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-brand-ink/5 shadow-card">
              <h3 className="font-medium mb-2">{title}</h3>
              <p className="text-sm opacity-60">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="bg-brand-gradient text-white mx-12 mb-16 p-12 rounded-3xl flex justify-between items-center shadow-soft">
        <div>
          <h2 className="text-2xl mb-2">Ready to study smarter?</h2>
          <p className="opacity-60">
            Join thousands of students using Siksha.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to={"/register"}
            className="bg-white text-brand-coral px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors">
            Get started
          </Link>
          <button className="border border-white/60 px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
            Learn more
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="flex justify-between px-12 py-8 bg-white border-t">
        <div className="uppercase tracking-widest">Siksha</div>
        <div className="flex gap-6 text-sm opacity-50">
          <span>Features</span>
          <span>Pricing</span>
          <span>About</span>
          <span>Contact</span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;