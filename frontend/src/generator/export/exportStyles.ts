export const EXPORT_STYLES = `
:root{
 --surface:#ffffff;
 --border:#e3e6ea;
 --accent:#2b7cff;
 --bg:#f4f6f9;
}
*{
 box-sizing:border-box;
}
body{
 margin:0;
 font-family:Inter, Arial, sans-serif;
 background:var(--bg);
 color:#1b1f24;
}
.export-shell{
 min-height:100vh;
 padding:40px;
 background:var(--bg);
 display:flex;
 justify-content:center;
 align-items:flex-start;
 overflow-x:auto;
}
.export-dashboard{
 position:relative;
 border-radius:8px;
 background:var(--surface);
 box-shadow:0 12px 40px rgba(15,23,42,0.1);
 flex-shrink:0;
}
.widget{
 position:absolute;
 background:var(--surface);
 border:1px solid var(--border);
 border-radius:8px;
 box-shadow:0 4px 6px -1px rgba(0,0,0,.05),0 2px 4px -1px rgba(0,0,0,.03);
 overflow:visible;
}
.widget-inner{
 width:100%;
 height:100%;
 overflow:hidden;
 border-radius:8px;
 display:flex;
 flex-direction:column;
}
.chart-inner{
 padding:12px 16px;
 height:100%;
 display:flex;
 flex-direction:column;
}
.chart-inner canvas{
 flex:1;
 min-height:0;
 width:100% !important;
}
.wg-title{
 padding:12px 16px 0;
 font-weight:600;
 font-size:13px;
 color:#1b1f24;
 flex-shrink:0;
}
.kpi-inner{
 padding:14px 18px;
 height:100%;
 display:flex;
 flex-direction:column;
 align-items:center;
 justify-content:center;
 gap:4px;
}
.kpi-label-txt{
 font-size:11px;
 font-weight:600;
 color:#64748b;
 text-transform:uppercase;
 letter-spacing:0.06em;
 text-align:center;
 max-width:100%;
 overflow:hidden;
 text-overflow:ellipsis;
 white-space:nowrap;
}
.kpi-val{
 font-size:36px;
 font-weight:700;
 line-height:1.1;
 text-align:center;
}
.kpi-delta{
 font-size:12px;
 font-weight:600;
 margin-top:2px;
}
.text-inner{
 padding:16px 18px;
 height:100%;
 overflow:hidden;
}
.text-wg-h1{
 font-size:18px;
 font-weight:500;
 color:#1b1f24;
 margin-bottom:6px;
}
.text-wg-p{
 font-size:13px;
 color:#5a5f66;
 line-height:1.6;
}
.table-shell{ width:100%; height:100%; overflow:auto; }
.tw-table{ width:100%; border-collapse:collapse; font-size:13px; table-layout:fixed; }
.tw-table th{ padding:8px 10px; font-weight:600; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tw-table td{ padding:6px 10px; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tw-default .tw-table th{ background:#f4f6f9; border-bottom:2px solid #d8dde5; color:#374151; }
.tw-default .tw-table td{ border-bottom:1px solid #e9ecef; color:#1b1f24; }
.tw-default .tw-table tr:last-child td{ border-bottom:none; }
.tw-striped .tw-table th{ background:#f4f6f9; border-bottom:2px solid #d8dde5; color:#374151; }
.tw-striped .tw-table tbody tr:nth-child(even) td{ background:#f0f4fa; }
.tw-striped .tw-table td{ border-bottom:1px solid #eef0f2; color:#1b1f24; }
.tw-bordered .tw-table{ border:1px solid #c5cad0; }
.tw-bordered .tw-table th,.tw-bordered .tw-table td{ border:1px solid #d5dae0; }
.tw-bordered .tw-table th{ background:#f4f6f9; color:#374151; }
.tw-minimal .tw-table th{ border-bottom:2px solid #1b1f24; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; }
.tw-minimal .tw-table td{ border-bottom:1px solid #f0f2f4; color:#374151; }
.tw-minimal .tw-table tr:last-child td{ border-bottom:none; }
.tw-dark .tw-table th{ background:#1b2230; color:#ffffff; border-bottom:none; }
.tw-dark .tw-table tbody tr:nth-child(even) td{ background:#f8f9fb; }
.tw-dark .tw-table td{ border-bottom:1px solid #e9ecef; color:#1b1f24; }
.tw-blue .tw-table th{ background:#2b7cff; color:#ffffff; border-bottom:none; }
.tw-blue .tw-table tbody tr:nth-child(even) td{ background:#eff5ff; }
.tw-blue .tw-table td{ border-bottom:1px solid #dde8ff; color:#1b1f24; }
.tw-green .tw-table th{ background:#059669; color:#ffffff; border-bottom:none; }
.tw-green .tw-table tbody tr:nth-child(even) td{ background:#f0fdf7; }
.tw-green .tw-table td{ border-bottom:1px solid #d1fae5; color:#1b1f24; }
.tw-rose .tw-table th{ background:#e11d48; color:#ffffff; border-bottom:none; }
.tw-rose .tw-table tbody tr:nth-child(even) td{ background:#fff1f4; }
.tw-rose .tw-table td{ border-bottom:1px solid #fecdd3; color:#1b1f24; }
.tw-stats-row td{ font-weight:700; background:#f4f6f9 !important; border-top:2px solid #d8dde5 !important; font-size:12px; }
.empty-state{
 flex:1;
 display:flex;
 align-items:center;
 justify-content:center;
 color:#a3a9b6;
 font-size:14px;
}
.img-inner{
 width:100%;
 height:100%;
 overflow:hidden;
}
.img-placeholder{
 width:100%;
 height:100%;
 display:flex;
 align-items:center;
 justify-content:center;
 background:#f8fafc;
 color:#94a3b8;
 font-size:12px;
}
`
