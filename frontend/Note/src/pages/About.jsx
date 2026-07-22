const About = () => {
    const features = [
        {
            icon: "📝",
            title: "Smart Note Taking",
            desc: "Create, organise and manage your academic notes in one place. Upload PDFs and images directly to your notes."
        },
        {
            icon: "📚",
            title: "Subject Organisation",
            desc: "Group your notes by subject. Filter and find exactly what you need in seconds."
        },
        {
            icon: "🔍",
            title: "Powerful Search",
            desc: "Search across all your notes by title or subject instantly as you type."
        },
        {
            icon: "🔒",
            title: "Secure & Private",
            desc: "Your notes are protected with JWT authentication. Only you can access your content."
        },
        {
            icon: "☁️",
            title: "Cloud Storage",
            desc: "All files are stored securely on the cloud via Cloudinary. Access your notes from anywhere."
        },
        {
            icon: "⚡",
            title: "Fast & Responsive",
            desc: "Built with React and Vite for a lightning fast experience on any device."
        },
    ];

    return (
        <div className="min-h-screen bg-[#FFF6F1]">

            {/* Hero */}
            <div className="bg-[#20160F] px-6 py-20 text-center">
                <p className="text-xs text-[#FF3E68] tracking-[4px] uppercase mb-3">
                    About the Project
                </p>
                <h1 className="text-4xl font-medium text-[#FFF6F1] mb-4 leading-snug">
                    Notes — Your Academic<br />Life, Organised
                </h1>
                <p className="text-sm text-[#FFEDE5]/50 max-w-md mx-auto leading-relaxed">
                    A full-stack notes application built to help students manage
                    their study materials, stay organised, and perform better.
                </p>
            </div>

            {/* What is it */}
            <div className="max-w-3xl mx-auto px-6 py-16">
                <div className="bg-white border border-[#FFEDE5] rounded-2xl p-8 mb-8">
                    <h2 className="text-lg font-medium text-[#20160F] mb-3">
                        What is Notes?
                    </h2>
                    <p className="text-sm text-[#20160F]/60 leading-relaxed mb-4">
                        Notes is a collaborative academic note-sharing platform designed
                        for students. Admins can upload study materials organised by subject,
                        and students can access, search, and filter all their notes from a
                        single clean dashboard.
                    </p>
                    <p className="text-sm text-[#20160F]/60 leading-relaxed">
                        Whether you're preparing for exams, catching up on missed lectures,
                        or simply staying organised — Notes gives you everything you need
                        in one place.
                    </p>
                </div>

                {/* Tech Stack */}
                <div className="bg-white border border-[#FFEDE5] rounded-2xl p-8 mb-8">
                    <h2 className="text-lg font-medium text-[#20160F] mb-5">Built With</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                            { name: "React + Vite", role: "Frontend" },
                            { name: "Node.js + Express", role: "Backend" },
                            { name: "MongoDB + Mongoose", role: "Database" },
                            { name: "JWT", role: "Authentication" },
                            { name: "Cloudinary", role: "File Storage" },
                            { name: "Tailwind CSS", role: "Styling" },
                        ].map((tech) => (
                            <div
                                key={tech.name}
                                className="border border-[#FFEDE5] rounded-xl p-3.5"
                            >
                                <p className="text-xs font-medium text-[#20160F]">{tech.name}</p>
                                <p className="text-[10px] text-[#FF3E68] mt-0.5">{tech.role}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <h2 className="text-lg font-medium text-[#20160F] mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="bg-white border border-[#FFEDE5] rounded-2xl p-5 flex gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#FFEDE5] flex items-center justify-center text-lg flex-shrink-0">
                                {f.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#20160F] mb-1">{f.title}</p>
                                <p className="text-xs text-[#20160F]/50 leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;