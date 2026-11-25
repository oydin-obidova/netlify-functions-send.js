const UZ_MONTHS = [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
];

function formatUzDate(isoStr) {
    if (!isoStr) return "Belgilanmagan";
    const parts = String(isoStr).split("-");
    if (parts.length !== 3) return isoStr;
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${day}-${UZ_MONTHS[monthIndex] || parts[1]}, ${parts[0]}-yil`;
}

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function getSenderDisplay(name, username) {
    const cleanName = (name || "").trim();
    const cleanUser = (username || "").trim().replace(/^@+/, "");
    const formattedUser = cleanUser ? "@" + cleanUser : "";
    if (cleanName && formattedUser) return `${cleanName} (${formattedUser})`;
    return cleanName || formattedUser || "Ko‘rsatilmagan";
}

exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ ok: false, error: "Method Not Allowed" })
        };
    }

    const BOT_TOKEN = process.env.9292309662:AAFew_ByAbuqfyUqUiGja6MtoxLN5ozQSBs;
    const CHAT_ID = process.env.6424296115;

    if (!BOT_TOKEN || !CHAT_ID) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ok: false, error: "MISSING_CREDENTIALS" })
        };
    }

    try {
        const answers = JSON.parse(event.body || "{}");
        const senderText = getSenderDisplay(answers.senderName, answers.senderUsername);
        const tgIdLine = answers.senderId
            ? `\n<b>🆔 Telegram ID:</b> <code>${escapeHtml(answers.senderId)}</code>`
            : "";

        const messageText =
            `<b>💌 Yangi uchrashuv javobi!</b>\n\n` +
            `<b>👤 Kimdan:</b> ${escapeHtml(senderText)}${tgIdLine}\n` +
            `<b>📍 Manzil:</b> ${escapeHtml(answers.location || "Tanlanmagan")}\n` +
            `<b>📅 Sana:</b> ${escapeHtml(formatUzDate(answers.date))}\n` +
            `<b>⏰ Vaqt:</b> ${escapeHtml(answers.time || "Belgilanmagan")}\n` +
            `<b>🌸 Bo‘sh vaqtda:</b> ${escapeHtml(answers.question1 || "-")}\n` +
            `<b>☕ Uchrashuv turi:</b> ${escapeHtml(answers.meeting || "-")}\n` +
            `<b>✨ Taassurot:</b> ${escapeHtml(answers.question2 || "-")}\n` +
            `<b>💬 Yakuniy javob:</b> ${escapeHtml(answers.finalAnswer || "-")}`;

        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: messageText,
                parse_mode: "HTML"
            })
        });

        const data = await response.json();
        if (!response.ok || !data.ok) {
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ok: false, error: data.description || "Telegram API xatosi" })
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ok: true })
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ok: false, error: err.message })
        };
    }
};
