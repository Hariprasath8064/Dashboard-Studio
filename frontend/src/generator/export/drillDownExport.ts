/** CSS injected into the exported HTML when at least one widget has drill-down enabled. */
export const DRILL_DOWN_STYLES = `
body.dd-open{overflow:hidden;}
body.dd-open .export-dashboard{visibility:hidden!important;pointer-events:none!important;}
.dd-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:2147483000;display:flex;align-items:center;justify-content:center;}
.dd-backdrop.dd-hidden{display:none;}
.dd-modal{background:#fff;border-radius:10px;box-shadow:0 8px 40px rgba(0,0,0,.22);width:min(920px,calc(100vw - 80px));max-height:80vh;display:flex;flex-direction:column;overflow:hidden;position:relative;z-index:2147483001;}
.dd-header{display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid #e3e6ea;flex-shrink:0;}
.dd-title-block{display:flex;align-items:center;gap:8px;flex:1;min-width:0;}
.dd-title{font-size:14px;font-weight:600;color:#1b1f24;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.dd-label-badge{font-size:11px;font-weight:500;background:#2b7cff;color:#fff;border-radius:4px;padding:2px 8px;flex-shrink:0;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dd-count{font-size:12px;color:#94a3b8;white-space:nowrap;flex-shrink:0;}
.dd-close{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;background:transparent;color:#94a3b8;cursor:pointer;border-radius:6px;font-size:18px;flex-shrink:0;transition:background .12s;}
.dd-close:hover{background:#f1f5f9;color:#1b1f24;}
.dd-toolbar{display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid #e3e6ea;flex-shrink:0;}
.dd-search-wrap{flex:1;display:flex;align-items:center;gap:6px;background:#eef2f6;border:1px solid #e3e6ea;border-radius:6px;padding:0 10px;height:30px;color:#94a3b8;}
.dd-search{flex:1;border:none;background:transparent;outline:none;font-size:12px;color:#1b1f24;}
.dd-search::placeholder{color:#94a3b8;}
.dd-csv-btn{display:flex;align-items:center;gap:5px;height:30px;padding:0 12px;border:1px solid #e3e6ea;background:#fff;color:#475569;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;transition:background .12s;}
.dd-csv-btn:hover{background:#2b7cff;border-color:#2b7cff;color:#fff;}
.dd-table-wrap{flex:1;overflow:auto;min-height:0;}
.dd-table{width:100%;border-collapse:collapse;font-size:12px;}
.dd-table thead{position:sticky;top:0;background:#eef2f6;z-index:1;}
.dd-table th{padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #e3e6ea;white-space:nowrap;}
.dd-th-rn{width:40px;text-align:center!important;}
.dd-table td{padding:7px 12px;border-bottom:1px solid #e3e6ea;color:#1b1f24;white-space:nowrap;max-width:240px;overflow:hidden;text-overflow:ellipsis;}
.dd-td-rn{text-align:center;color:#94a3b8;font-size:11px;}
.dd-tr-alt{background:#f8fafc;}
.dd-table tbody tr:hover{background:#f1f5f9;}
.dd-empty{text-align:center!important;color:#94a3b8!important;padding:36px 0!important;font-size:13px;}
`

/** Modal HTML injected once into the exported page body. */
export const DRILL_DOWN_HTML = `
<div id="dd-backdrop" class="dd-backdrop dd-hidden" onclick="__closeDrillDown(event)">
 <div class="dd-modal" onclick="event.stopPropagation()">
  <div class="dd-header">
   <div class="dd-title-block">
    <div class="dd-title" id="dd-title"></div>
    <div class="dd-label-badge" id="dd-badge" style="display:none"></div>
   </div>
   <div class="dd-count" id="dd-count"></div>
   <button class="dd-close" onclick="__closeDrillDown(null)">&#x2715;</button>
  </div>
  <div class="dd-toolbar">
   <div class="dd-search-wrap">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="flex-shrink:0">
     <circle cx="5" cy="5" r="3.5" stroke="currentColor" stroke-width="1.2"/>
     <path d="M8 8l2.5 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
    <input class="dd-search" id="dd-search" placeholder="Search rows…" oninput="__filterDd(this.value)"/>
   </div>
   <button class="dd-csv-btn" onclick="__ddCsv()">&#x2193; CSV</button>
  </div>
  <div class="dd-table-wrap">
   <table class="dd-table">
    <thead id="dd-head"></thead>
    <tbody id="dd-body"></tbody>
   </table>
  </div>
 </div>
</div>
`

/** JavaScript injected into the exported page to power the drill-down modal. */
export function buildDrillDownScript(
  columns: any[],
  rows: any[][],
): string {
  const colsJson = JSON.stringify(
    columns.map((c: any) => ({ name: c.name ?? c }))
  )
  const rowsJson = JSON.stringify(rows)

  return `
var __DD_COLS=${colsJson};
var __DD_ROWS=${rowsJson};
var __dd_rows=[];
var __dd_cols=[];

function __showDrillDown(label,filterCol,dispCols){
 var colIdx=filterCol?__DD_COLS.findIndex(function(c){return c.name===filterCol;}):-1;
 var filtered=colIdx>=0?__DD_ROWS.filter(function(r){return String(r[colIdx])===String(label);}):[].concat(__DD_ROWS);
 var cols=dispCols&&dispCols.length>0?dispCols:__DD_COLS.map(function(c){return c.name;});
 __dd_rows=filtered;
 __dd_cols=cols;
 __renderDd(label,filtered,cols);
 document.body.classList.add("dd-open");
 document.getElementById("dd-backdrop").classList.remove("dd-hidden");
 var s=document.getElementById("dd-search");if(s)s.value="";
}

function __renderDd(label,rows,cols){
 var colObjs=cols.map(function(n){return __DD_COLS.find(function(c){return c.name===n;})||{name:n};});
 var idxs=colObjs.map(function(c){return __DD_COLS.indexOf(c);});
 var badge=document.getElementById("dd-badge");
 if(label){badge.textContent=label;badge.style.display="";}else{badge.style.display="none";}
 document.getElementById("dd-count").textContent=rows.length+" rows";
 document.getElementById("dd-head").innerHTML="<tr><th class='dd-th-rn'>#</th>"+colObjs.map(function(c){return "<th>"+c.name+"</th>";}).join("")+"</tr>";
 document.getElementById("dd-body").innerHTML=rows.map(function(row,i){
  return "<tr class='"+(i%2?"dd-tr-alt":"")+"'><td class='dd-td-rn'>"+(i+1)+"</td>"+idxs.map(function(idx){var v=String(row[idx]!=null?row[idx]:"");return "<td title='"+v.replace(/'/g,"&#39;")+"'>"+v+"</td>";}).join("")+"</tr>";
 }).join("")||(rows.length===0?"<tr><td colspan='"+(colObjs.length+1)+"' class='dd-empty'>No rows</td></tr>":"");
}

function __filterDd(q){
 if(!q){__renderDd(null,__dd_rows,__dd_cols);return;}
 q=q.toLowerCase();
 var cols=__dd_cols;
 var colIdxs=cols.map(function(n){var c=__DD_COLS.find(function(x){return x.name===n;});return __DD_COLS.indexOf(c);});
 var filtered=__dd_rows.filter(function(row){return colIdxs.some(function(idx){return String(row[idx]!=null?row[idx]:"").toLowerCase().indexOf(q)>=0;});});
 __renderDd(null,filtered,cols);
}

function __ddCsv(){
 var cols=__dd_cols;
 var colObjs=cols.map(function(n){return __DD_COLS.find(function(c){return c.name===n;})||{name:n};});
 var idxs=colObjs.map(function(c){return __DD_COLS.indexOf(c);});
 var csv=[colObjs.map(function(c){return c.name;}).join(",")].concat(__dd_rows.map(function(row){return idxs.map(function(idx){return JSON.stringify(String(row[idx]!=null?row[idx]:""));}).join(",");})).join("\\n");
 var a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="drill-down.csv";a.click();
}

function __closeDrillDown(e){
 if(e&&e.target!==document.getElementById("dd-backdrop"))return;
 document.body.classList.remove("dd-open");
 document.getElementById("dd-backdrop").classList.add("dd-hidden");
}
`
}
