import User from "../models/User.js";

export const pingStreak = async (req, res) => {
    try {
        // Was User.findOne(req.user._id) — findOne() takes a filter object,
        // not an id, so this silently matched the wrong (or no) document.
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
        if (last) last.setHours(0, 0, 0, 0);

        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const diffDays = last ? Math.round((today - last) / MS_PER_DAY) : null;

        if (diffDays === 0) {
            return res.json({ streakCount: user.streakCount, longestStreak: user.longestStreak });
        }

        if (diffDays === 1) {
            user.streakCount += 1;
        } else {
            user.streakCount = 1;
        }

        user.lastActiveDate = today;
        if (user.streakCount > user.longestStreak) {
            user.longestStreak = user.streakCount;
        }

        await user.save();
        res.json({ streakCount: user.streakCount, longestStreak: user.longestStreak });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getStreak = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("streakCount longestStreak lastActiveDate");
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
