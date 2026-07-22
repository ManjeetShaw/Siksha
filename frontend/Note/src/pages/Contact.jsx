import { useState } from "react";
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaEnvelope } from "react-icons/fa";

const Contact = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // 🔧 Wire this to your email service later (EmailJS / Nodemailer etc.)
        setSent(true);
        setName("");
        setEmail("");
        setMessage("");
    };

    const socials = [
        {
            icon: <FaGithub className="text-xl" />,
            label: "GitHub",
            handle: "@yourhandle",
            href: "#",  // ← add your link
            color: "hover:text-[#20160F]"
        },
        {
            icon: <FaLinkedin className="text-xl" />,
            label: "LinkedIn",
            handle: "@yourhandle",
            href: "#",  // ← add your link
            color: "hover:text-blue-600"
        },
        {
            icon: <FaTwitter className="text-xl" />,
            label: "Twitter",
            handle: "@yourhandle",
            href: "#",  // ← add your link
            color: "hover:text-sky-500"
        },
        {
            icon: <FaInstagram className="text-xl" />,
            label: "Instagram",
            handle: "@yourhandle",
            href: "#",  // ← add your link
            color: "hover:text-pink-500"
        },
        {
            icon: <FaEnvelope className="text-xl" />,
            label: "Email",
            handle: "your@email.com",
            href: "#",  // ← add your link
            color: "hover:text-[#FF3E68]"
        },
    ];

    return (
        <div className="min-h-screen bg-[#FFF6F1]">

            {/* Hero */}
            <div className="bg-[#20160F] px-6 py-16 text-center">
                <p className="text-xs text-[#FF3E68] tracking-[4px] uppercase mb-3">
                    Get In Touch
                </p>
                <h1 className="text-4xl font-medium text-[#FFF6F1] mb-3">
                    Contact Us
                </h1>
                <p className="text-sm text-[#FFEDE5]/50 max-w-sm mx-auto">
                    Have a question, suggestion, or just want to say hi? We'd love to hear from you.
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8">

                {/* Contact Form */}
                <div className="bg-white border border-[#FFEDE5] rounded-2xl p-8">
                    <h2 className="text-lg font-medium text-[#20160F] mb-6">Send a Message</h2>

                    {sent ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-14 h-14 rounded-full bg-[#FFEDE5] flex items-center justify-center text-2xl mb-4">
                                ✅
                            </div>
                            <p className="text-sm font-medium text-[#20160F] mb-1">Message sent!</p>
                            <p className="text-xs text-[#20160F]/40 mb-5">
                                Thanks for reaching out. We'll get back to you soon.
                            </p>
                            <button
                                onClick={() => setSent(false)}
                                className="text-xs text-[#FF3E68] hover:underline"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                    className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full h-10 border border-[#FFEDE5] rounded-lg px-3.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#20160F] mb-1.5 tracking-wide">
                                    Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write your message here..."
                                    required
                                    rows={5}
                                    className="w-full border border-[#FFEDE5] rounded-lg px-3.5 py-2.5 text-sm text-[#20160F] bg-[#FFF6F1] outline-none focus:border-[#FF3E68] focus:bg-white transition-colors placeholder:text-[#20160F]/30 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full h-11 bg-[#20160F] text-[#FFF6F1] rounded-lg text-sm font-medium hover:bg-[#FF3E68] transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    )}
                </div>

                {/* Social Links */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white border border-[#FFEDE5] rounded-2xl p-6">
                        <h2 className="text-sm font-medium text-[#20160F] mb-5">Find Us Online</h2>
                        <div className="flex flex-col gap-2">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center gap-3.5 px-3 py-3 rounded-xl border border-[#FFEDE5] text-[#20160F]/50 ${s.color} hover:border-current transition-all group`}
                                >
                                    <span className="transition-colors">{s.icon}</span>
                                    <div>
                                        <p className="text-xs font-medium text-[#20160F] group-hover:text-current transition-colors">
                                            {s.label}
                                        </p>
                                        <p className="text-[10px] text-[#20160F]/40">{s.handle}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Small note */}
                    <div className="bg-[#20160F] rounded-2xl p-5">
                        <p className="text-xs font-medium text-[#FFF6F1] mb-1">Response Time</p>
                        <p className="text-xs text-[#FFEDE5]/40 leading-relaxed">
                            We typically respond within 24–48 hours. For urgent issues, reach out via email directly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;