"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAggregation = runAggregation;
function runAggregation(dataset, xColumn, yColumn, aggregation) {
    if (!xColumn || !yColumn) {
        return {
            labels: [],
            values: []
        };
    }
    const xIndex = dataset.columns.findIndex((c) => c.name === xColumn);
    const yIndex = dataset.columns.findIndex((c) => c.name === yColumn);
    if (xIndex === -1 || yIndex === -1) {
        return {
            labels: [],
            values: []
        };
    }
    const groups = {};
    dataset.rows.forEach((row) => {
        const key = String(row[xIndex]);
        const value = Number(row[yIndex]);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(value);
    });
    const labels = [];
    const values = [];
    Object.entries(groups).forEach(([label, nums]) => {
        labels.push(label);
        values.push(applyAggregation(nums, aggregation));
    });
    return {
        labels,
        values
    };
}
function applyAggregation(nums, type) {
    switch (type) {
        case "SUM":
            return nums.reduce((a, b) => a + b, 0);
        case "AVG":
            return nums.reduce((a, b) => a + b, 0) / nums.length;
        case "COUNT":
            return nums.length;
        case "MIN":
            return Math.min(...nums);
        case "MAX":
            return Math.max(...nums);
        default:
            return 0;
    }
}
