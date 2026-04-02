"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildChartScript = buildChartScript;
const QueryEngine_1 = require("../dataset/QueryEngine");
const chartColors_1 = require("../constants/chartColors");
const DEFAULT_LINE_COLOR = "#2b7cff";
function buildChartScript(widget, dataset) {
    if (!dataset || !widget.query)
        return "";
    const result = (0, QueryEngine_1.runAggregation)(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation);
    const type = widget.type === "donut" ? "doughnut" : widget.type;
    const datasetConfig = buildDatasetConfig(widget, result.values);
    const optionsConfig = buildOptionsConfig(widget.type);
    return `
 {
  const ctx = document.getElementById("chart-${widget.id}");
  if(ctx){
   new Chart(ctx,{
    type:"${type}",
    data:{
     labels:${JSON.stringify(result.labels)},
     datasets:[${JSON.stringify(datasetConfig)}]
    },
    options:${JSON.stringify(optionsConfig)}
   });
  }
 }
 `;
}
function buildDatasetConfig(widget, values) {
    if (widget.type === "donut") {
        return {
            data: values,
            backgroundColor: chartColors_1.chartColors,
            borderWidth: 0
        };
    }
    if (widget.type === "line") {
        return {
            label: widget.title || "",
            data: values,
            borderColor: widget.color || DEFAULT_LINE_COLOR,
            backgroundColor: chartColors_1.chartColors,
            tension: 0.3,
            pointRadius: 3,
            fill: false
        };
    }
    return {
        label: widget.title || "",
        data: values,
        backgroundColor: chartColors_1.chartColors,
        borderWidth: 0,
        borderRadius: 6
    };
}
function buildOptionsConfig(type) {
    const base = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true
            }
        }
    };
    if (type === "donut") {
        return {
            ...base,
            cutout: "70%"
        };
    }
    return base;
}
