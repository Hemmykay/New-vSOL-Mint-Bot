"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function handler(req, res) {
    try {
        const response = await fetch(`${process.env.VERCEL_URL}/`, {
            method: "POST",
        });
        if (response.ok) {
            res.status(200).json({ message: "Cron job executed successfully" });
        }
        else {
            res.status(500).json({ message: "Error executing cron job" });
        }
    }
    catch (error) {
        console.error("Error in cron job:", error);
        res.status(500).json({ message: "Error executing cron job" });
    }
}
exports.default = handler;
