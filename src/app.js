import '@fontsource/cal-sans';
import '@fontsource/material-icons';

import { countersPageEvents, statsPageEvents } from './routes.js';

import { getRandHex, getLightOrDark } from './util/colourUtil.js';
import * as data from './app/data.js';
import { today, dateToStr, addDays, addMonths, addYears, getDaysInMonth } from './util/dates.js';
import { drawStats } from './app/stats.js';
import { round } from './util/util.js';

function renderCounter(name, value, background) {
    value ??= 0;
    background ??= '#' + getRandHex(6);
    let colour = getLightOrDark(background.substring(1), '#eeeeee', '#121212');

    console.log(countersDiv);
    countersDiv.innerHTML += `
<div class="counter" style="background: ${background}; color: ${colour};">
    <div>
        <span class="material-icons delete-icon" onclick="confirm('Are you sure you want to delete &quot;${name}&quot;?') ? deleteCounter(this) : 0;">delete</span>
        <span onclick="changeCounterIndex(this)">${name}</span>
    </div>
    <div class="value-container">
        <div class="decrease" onclick="decreaseValue(this)">－</div>
        <div class="value" onclick="changeCounterValue(this)">${value}</div>
        <div class="increase" onclick="increaseValue(this)">＋</div>
    </div>
</div>
    `.trim();
}

function elementBacktrack(elem, parents) {
    parents ??= 1;

    for (; parents > 0; --parents)
        elem = elem.parentElement;

    return elem;
}

function getCounterIndex(elem) {
    return [...countersDiv.children].indexOf(elem);
}

function getCounterIndexFromBtn(elem, parents) {
    elem = elementBacktrack(elem, parents);
    return getCounterIndex(elem);
}

function setCounterValue(counter, value) {
    counter.children[1].children[1].innerText = value;
}

function updateCounters() {
    console.log(selectedDate());

    for (let i = 0; i < counters.length; ++i) {
        const counter = countersDiv.children[i];
        const name = counters[i][0];

        setCounterValue(counter, data.getCount(name, selectedDate()));
    }
}

function selectedDate() {
    return dateToStr(new Date(
        yearSelector.value,
        monthSelector.value - 1,
        daySelector.value,
    ));
}

window.changeCounterIndex = counter => {
    counter = elementBacktrack(counter, 2);
    const amount = prompt('How many spaces would you like to move this counter down?'
        + ' (Use negative numbers to move up)');

    if (!amount || isNaN(+amount))
        return;

    const index = getCounterIndex(counter);
    const counterData = counters[index];

    counters.splice(index, 1);
    counters.splice(index + (+amount), 0, counterData);
    data.saveCounters(counters);

    // Rerender counters
    countersPageInit();
}

window.changeCounterValue = counter => {
    counter = elementBacktrack(counter, 2);
    const index = getCounterIndex(counter);
    const name = counters[index][0];
    const newValue = prompt('Enter a new value:');

    if (!newValue || isNaN(+newValue))
        return;

    setCounterValue(counter, data.setCount(name, +newValue, false, selectedDate()));
}

window.addCounter = () => {
    const name = prompt('Enter a name:');

    if (!name)
        return;

    const background = '#' + getRandHex(6);

    counters.push([name, background]);
    data.saveCounters(counters);
    renderCounter(name, data.getCount(name, selectedDate()), background);
};

window.deleteCounter = btn => {
    const counter = elementBacktrack(btn, 2);
    const index = getCounterIndex(counter);

    counters.splice(index, 1);
    data.saveCounters(counters);
    counter.remove();
};

window.increaseValue = btn => {
    const index = getCounterIndexFromBtn(btn, 2);
    const name = counters[index][0];
    const counter = countersDiv.children[index];

    setCounterValue(counter, data.setCount(name, 1, true, selectedDate()));
}

window.decreaseValue = btn => {
    const index = getCounterIndexFromBtn(btn, 2);
    const name = counters[index][0];
    const counter = countersDiv.children[index];

    setCounterValue(counter, data.setCount(name, -1, true, selectedDate()));
}

window.drawStats = () => {
    const name = nameSelector.value;
    const time = timeSelector.value;
    let from = today();
    let to = from;

    // Save options for next time
    data.setStatsOptions([name, time]);

    if (time === '3days')
        to = addDays(to, -2);
    else if (time === '7days')
        to = addDays(to, -6);
    else if (time === '14days')
        to = addDays(to, -13);
    else if (time === 'thismonth')
        to = addDays(to, -new Date(to).getDate() + 1);
    else if (time === 'lastmonth') {
        from = addDays(to, -new Date(to).getDate());
        to = addDays(from, -new Date(from).getDate() + 1);
    } else if (time === '30days')
        to = addDays(to, -29);
    else if (time === '90days')
        to = addDays(to, -89);
    else if (time === 'thisyear') {
        to = `${new Date(to).getFullYear()}-1-1`;
    } else if (time === 'lastyear') {
        from = `${new Date(to).getFullYear() - 1}-12-31`;
        to = `${new Date(to).getFullYear() - 1}-1-1`;
    } else if (time === '1year')
        to = addYears(to, -1);
    else if (time === '2years')
        to = addYears(to, -2);
    else if (time === 'alltime') {
        from = undefined;
        to = undefined;
    }

    drawStats(name, data.getValues(name, from, to));
}

window.dateChanged = () => {
    const date = new Date();
    const selectedYear = yearSelector.value ? yearSelector.value : date.getFullYear();
    const selectedMonth = monthSelector.value ? monthSelector.value : date.getMonth() + 1;
    const selectedDay = daySelector.value ? daySelector.value : date.getDate();

    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const isCurYear = selectedYear == date.getFullYear();
    const isCurMonth = selectedMonth == date.getMonth() + 1;

    yearSelector.innerHTML = '';
    monthSelector.innerHTML = '';
    daySelector.innerHTML = '';

    for (let i = date.getFullYear(); i >= 1970; --i)
        yearSelector.innerHTML += `<option value="${i}">${i}</option>`;

    for (let i = 1; i <= (isCurYear ? date.getMonth() + 1 : 12); ++i)
        monthSelector.innerHTML += `<option value="${i}">${i}</option>`;

    for (let i = 1; i <= (isCurMonth ? date.getDate() : daysInMonth); ++i)
        daySelector.innerHTML += `<option value="${i}">${i}</option>`;

    yearSelector.value = selectedYear;
    monthSelector.value = selectedMonth;
    daySelector.value = selectedDay > daysInMonth ? daysInMonth : selectedDay;

    // Update counter counts
    updateCounters();
}

window.importPrompt = () => {
    fileInput.click();
}

window.importData = () => {
    const file = fileInput.files[0];

    if (!file)
        return;

    const reader = new FileReader();
    reader.readAsText(file, 'utf-8');

    reader.onload = e => {
        data.importFromJSON(e.target.result);
        statsPageInit();
    }

    reader.onerror = e => alert('Error reading file');
}

window.exportData = () => {
    const fileContent = data.exportToJSON();
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Download as a file
    const a = document.createElement('a');
    a.href = url;
    a.download = `counter_data_${today()}.json`;
    a.click();

    URL.revokeObjectURL(url); // Release object URL
}

// Load counters
let counters = data.getCounters();

const countersPageInit = () => {
    countersDiv.innerHTML = '';
    counters = data.getCounters();

    // Render counters from storage
    for (let i = 0; i < counters.length; ++i)
        renderCounter(counters[i][0], data.getCount(counters[i][0]), counters[i][1]);

    dateChanged();

    yearSelector.value = new Date().getFullYear();
    monthSelector.value = new Date().getMonth() + 1;
    daySelector.value = new Date().getDate();
}

const statsPageInit = () => {
    // Populate name selector
    for (let i = 0; i < counters.length; ++i)
        nameSelector.innerHTML += `<option value="${counters[i][0]}">${counters[i][0]}</option>`;

    // Select name and time from storage
    let [name, time] = data.getStatsOptions();

    if (name)
        nameSelector.value = name;
    if (time)
        timeSelector.value = time;

    window.drawStats();
}

// Add event listeners
countersPageEvents.push(countersPageInit);
statsPageEvents.push(statsPageInit);

// Initialise the page
if (data.getLastPage() === 'stats')
    statsPageInit();
else
    countersPageInit();
