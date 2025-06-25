export const round = (n, prec) =>
    Math.round(n * (10 ** (prec ?? 0))) / (10 ** (prec ?? 0));

export const formatPerc = (n, prec) =>
    round(100 * n, prec) + '%';
