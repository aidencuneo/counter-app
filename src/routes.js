import * as data from './app/data.js';

function highlightBtn(btn) {
    for (let i = 0; i < pageBtns.children.length; ++i)
        pageBtns.children[i].style.backgroundColor = '';

    btn.style.backgroundColor = '#a9d4ff';
}

window.loadCountersPage = btn => {
    app.innerHTML = counterHTML;
    highlightBtn(btn);
    data.setLastPage('counters');

    for (let i = 0; i < countersPageEvents.length; ++i)
        countersPageEvents[i]();
}

window.loadStatsPage = btn => {
    app.innerHTML = statsHTML;
    highlightBtn(btn);
    data.setLastPage('stats');

    for (let i = 0; i < statsPageEvents.length; ++i)
        statsPageEvents[i]();
}

// Event listeners
export const countersPageEvents = [];
export const statsPageEvents = [];

// Elements
const pageBtns = document.getElementById('page-links');

// Save HTML for all pages
const counterHTML = app.innerHTML;
const statsHTML = stats.innerHTML;

// Clean HTML
app.innerHTML = '';
// document.body.removeChild(stats);
stats.remove();

// Load last page
if (data.getLastPage() === 'stats')
    window.loadStatsPage(pageBtns.children[1]);
else
    window.loadCountersPage(pageBtns.children[0]);
