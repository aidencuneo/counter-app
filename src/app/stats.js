import Chart from 'chart.js/auto';
import regression from 'regression';
import { round } from '../util/util.js';

export async function drawStats(name, values) {
    if (lastChart)
        lastChart.destroy();

    let labels = Object.keys(values);
    let data = Object.values(values);

    // Ascending order
    labels.sort((a, b) => new Date(a) - new Date(b));
    data = labels.map(d => values[d]);

    lastChart = new Chart(
        statsCanvas,
        {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: name,
                        data: data,
                    },
                ],
            },
        },
    );

    // Display details
    let total = data.reduce((a, b) => a + b, 0);
    let average = total / data.length;
    let gradient = regression.linear(data.map((x, i) => [i, x])).equation[0];
    let gradientSign = gradient < 0 ? '' : '+';

    totalStatDiv.innerText = 'Total: ' + round(total, 2);
    averageStatDiv.innerText = 'Average: ' + round(average, 2);
    maxStatDiv.innerText = 'Max: ' + round(Math.max(...data), 2);
    gradientStatDiv.innerText = 'Gradient: ' + gradientSign + round(gradient, 2);
}

let lastChart;
