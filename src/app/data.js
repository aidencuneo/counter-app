import { today, dateToStr } from "../util/dates";

function asID(name) {
    return name.toLowerCase();
}

export function saveCounters(counters) {
    localStorage.setItem('counter_counters', JSON.stringify(counters));
}

export function getCounters() {
    let countersStr = localStorage.getItem('counter_counters');

    if (countersStr)
        return JSON.parse(countersStr);

    return [];
}

export function setCount(name, value, additive, day) {
    name = asID(name);
    day ??= today();
    additive ??= false;

    let values = localStorage.getItem(`counter_${name}_values`);

    if (values)
        values = JSON.parse(values);
    else
        values = {};

    values[day] ??= 0;

    if (additive)
        values[day] += value;
    else
        values[day] = value;

    // Clear blank values
    if (values[day] == 0)
        delete values[day];

    localStorage.setItem(`counter_${name}_values`, JSON.stringify(values));
    return values[day] ?? 0;
}

export function getCount(name, day) {
    name = asID(name);
    day ??= today();

    let values = localStorage.getItem(`counter_${name}_values`);

    if (values)
        return JSON.parse(values)[day] ?? 0;

    return 0;
}

export function getValues(name, from, to) {
    name = asID(name);
    from = new Date(from ?? today());
    to = to ? new Date(to) : undefined;

    if (to > from)
        [from, to] = [to, from];

    let values = localStorage.getItem(`counter_${name}_values`);

    if (values)
        values = JSON.parse(values);
    else
        return {};

    let filtered = {};

    // Find earliest date
    let dates = Object.keys(values);
    dates.sort((a, b) => new Date(a) - new Date(b));

    // Set to earliest date if one was not given
    if (!to)
        to = new Date(dates[0]);

    for (let date = from; date >= to; from.setDate(date.getDate() - 1)) {
        let dateStr = dateToStr(date);
        filtered[dateStr] = values[dateStr] ?? 0;
    }

    console.log(values);
    console.log(filtered);

    return filtered;
}

export function getLastPage() {
    return localStorage.getItem('counter_page') ?? 'counter';
}

export function setLastPage(lastPage) {
    localStorage.setItem('counter_page', lastPage);
}

export function getStatsOptions() {
    let optionsStr = localStorage.getItem('counter_stats_options');

    if (optionsStr)
        return JSON.parse(optionsStr);

    return [null, null];
}

export function setStatsOptions(options) {
    localStorage.setItem('counter_stats_options', JSON.stringify(options));
}

export function exportToJSON() {
    const counters = getCounters();
    const json = {counters};

    for (let i = 0; i < counters.length; ++i) {
        const name = asID(counters[i][0]);
        const values = localStorage.getItem(`counter_${name}_values`);

        if (values)
            json[`${name}_values`] = JSON.parse(values);
    }

    return JSON.stringify(json);
}

export function importFromJSON(json) {
    const data = JSON.parse(json);
    const counters = data.counters;

    saveCounters(counters);

    for (let i = 0; i < counters.length; ++i) {
        const name = asID(counters[i][0]);
        const values = data[`${name}_values`];

        localStorage.setItem(`counter_${name}_values`, JSON.stringify(values));
    }
}

export function clear() {
    for (let i = 0; i < localStorage.length; ++i)
        if (localStorage.key(i).startsWith('counter_'))
            localStorage.removeItem(localStorage.key(i));
}
