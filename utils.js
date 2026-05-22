// utils.js - 公共函数
function parseDate(value) {
    if (!value) return null;
    if (typeof value === 'number') {
        let date = XLSX.SSF.parse_date_code(value);
        if (date) return new Date(date.y, date.m-1, date.d);
    }
    let str = String(value).trim();
    let match = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if (match) return new Date(parseInt(match[1]), parseInt(match[2])-1, parseInt(match[3]));
    match = str.match(/^(\d{1,2})[-\/](\d{1,2})/);
    if (match) {
        let now = new Date();
        let year = now.getFullYear();
        let month = parseInt(match[1])-1;
        let day = parseInt(match[2]);
        let d = new Date(year, month, day);
        if (d < now && now.getMonth() > month) d.setFullYear(year+1);
        return d;
    }
    match = str.match(/(\d{1,2})月(\d{1,2})日/);
    if (match) {
        let now = new Date();
        let year = now.getFullYear();
        let month = parseInt(match[1])-1;
        let day = parseInt(match[2]);
        let d = new Date(year, month, day);
        if (d < now && now.getMonth() > month) d.setFullYear(year+1);
        return d;
    }
    let d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
}

function isHoliday(date, holidays) {
    let month = (date.getMonth()+1).toString().padStart(2,'0');
    let day = date.getDate().toString().padStart(2,'0');
    return holidays.includes(`${month}-${day}`);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

let typeColorMap = new Map();
let colorIndex = 0;
function getColorForType(type, colorPalette) {
    if (!type) return colorPalette[0];
    if (typeColorMap.has(type)) return typeColorMap.get(type);
    let col = colorPalette[colorIndex % colorPalette.length];
    typeColorMap.set(type, col);
    colorIndex++;
    return col;
}
function resetColorMap() {
    typeColorMap.clear();
    colorIndex = 0;
}

function parseExcelToRecords(rawJson, columnMapping) {
    const { date: dateCol, project: projCol, task: taskCol, type: typeCol, startDate: startCol, endDate: endCol } = columnMapping;
    let records = [];
    for (let row of rawJson) {
        let dateVal = row[dateCol];
        let proj = row[projCol] ? String(row[projCol]).trim() : "";
        let task = row[taskCol] ? String(row[taskCol]).trim() : "";
        let typeVal = typeCol ? (row[typeCol] ? String(row[typeCol]).trim() : "") : "";
        if (!dateVal || !proj) continue;
        let dateObj = parseDate(dateVal);
        if (!dateObj) continue;
        let startDate = null, endDate = null;
        if (startCol && row[startCol]) startDate = parseDate(row[startCol]);
        if (endCol && row[endCol]) endDate = parseDate(row[endCol]);
        records.push({
            date: dateObj,
            project: proj,
            description: task || "—",
            type: typeVal,
            startDate: startDate,
            endDate: endDate
        });
    }
    return records;
}

function groupRecordsByDate(records) {
    let map = new Map();
    for (let r of records) {
        let key = r.date.toISOString().slice(0,10);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push({ project: r.project, description: r.description, type: r.type });
    }
    return map;
}