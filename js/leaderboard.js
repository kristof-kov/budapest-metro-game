// leaderboard.ks
// owns all leaderboard logic: saving results and rendering the top-10 table
// no imports from other game modules, this file can run on both pages

const STORAGE_KEY = "bm_leaderboard";
const MAX_ENTRIES = 10;

// saves a completed game result to localStorage
export function saveResult({ name, total, seconds }) {
    const entries = loadLeaderboard();

    entries.push({
        name,
        total,
        time: _formatTime(seconds),
        date: new Date().toLocaleDateString("hu-HU")
    });

    entries.sort((a, b) => b.total - a.total);
    entries.splice(MAX_ENTRIES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// loads and returns the leaderboard array from localStorage
export function loadLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    } catch {
        return [];
    }
}

// renders the leaderboard into a given container element
export function renderLeaderboard(container) {
    const entries = loadLeaderboard();

    if (entries.length === 0) {
        container.innerHTML = "<p class='lb-empty'>Még nincs eredmény. Játsz egyet!</p>";
        return;
    }

    const rows = entries.map((e, i) => `
        <tr class="${i === 0 ? "lb-first" : ""}">
            <td class="lb-rank">${i + 1}.</td>
            <td class="lb-name">${_escape(e.name)}</td>
            <td class="lb-score">${e.total}</td>
            <td class="lb-time">${e.time}</td>
            <td class="lb-date">${e.date}</td>
        </tr>
    `).join("");
 
    container.innerHTML = `
        <table class="lb-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Név</th>
                    <th>Pont</th>
                    <th>Idő</th>
                    <th>Dátum</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

/* --- helpers --- */

function _formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

// prevents XSS from player names stored in localStorage
function _escape(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}