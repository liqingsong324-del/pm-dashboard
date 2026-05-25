// calendar.js - 日历视图模块（已修复日期时区偏移问题）
const CalendarModule = {
    name: 'calendar',
    container: null,
    currentData: null,

    init(container, records) {
        this.container = container;
        this.currentData = records;
        this.render();
    },

    update(newRecords) {
        this.currentData = newRecords;
        this.render();
    },

    destroy() {
        if (this.container) this.container.innerHTML = '';
    },

    render() {
        if (!this.container || !this.currentData) return;
        const records = this.currentData;
        const map = groupRecordsByDate(records);
        
        let sortedDates = Array.from(map.keys()).sort();
        if (sortedDates.length === 0) {
            this.container.innerHTML = '<div style="text-align:center;padding:40px;">暂无任务数据</div>';
            return;
        }
        let startDate = new Date(sortedDates[0]);
        let endDate = new Date(sortedDates[sortedDates.length-1]);

        let startWeek = new Date(startDate);
        startWeek.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));
        let endWeek = new Date(endDate);
        endWeek.setDate(endDate.getDate() + (6 - ((endDate.getDay() + 6) % 7)));

        let weeks = [];
        let cur = new Date(startWeek);
        while (cur <= endWeek) {
            let week = [];
            for (let i=0;i<7;i++) {
                let d = new Date(cur);
                d.setDate(cur.getDate() + i);
                week.push(d);
            }
            weeks.push(week);
            cur.setDate(cur.getDate() + 7);
        }

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        // 修复点：使用本地时间格式化字符串，避免时区偏移
        const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        const holidays = CONFIG.holidays;
        const colorPalette = CONFIG.colorPalette;

        let html = `<table class="calendar"><thead><tr><th>周一</th><th>周二</th><th>周三</th><th>周四</th><th>周五</th><th>周六</th><th>周日</th></tr></thead><tbody>`;
        
        for (let week of weeks) {
            html += `<tr class="calendar-week-row">`;
            for (let day of week) {
                // 核心修复：强制使用本地时间的年、月、日拼接字符串，确保与 groupRecordsByDate 的 Key 一致
                let dayStr = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;
                
                let tasks = map.get(dayStr) || [];
                let isWeekend = (day.getDay() === 0 || day.getDay() === 6);
                let isHolidayFlag = isHoliday(day, holidays);
                let isTodayFlag = (dayStr === todayStr);
                let isCurrentMonth = (day.getFullYear() === currentYear && day.getMonth() === currentMonth);
                let cellClass = "";
                if (isWeekend && !isHolidayFlag) cellClass = "weekend-bg";
                if (isHolidayFlag) cellClass = "holiday-bg";
                if (isTodayFlag) cellClass = "today-bg";
                if (!isCurrentMonth) cellClass += " other-month";

                html += `<td class="${cellClass}">`;
                const dateNumberClass = isTodayFlag ? 'date-number today-date' : 'date-number';
                html += `<div class="date-head"><span class="${dateNumberClass}">${day.getMonth()+1}/${day.getDate()}</span>${isHolidayFlag ? '<span class="holiday-icon">🎉</span>' : ''}</div>`;
                if (tasks.length === 0) {
                    html += `<div class="empty-day">—</div>`;
                } else {
                    for (let t of tasks) {
                        let colorStyle = getColorForType(t.type, colorPalette);
                        html += `<div class="project-card" style="border-left-color: ${colorStyle.border}; background: ${colorStyle.bg};">`;
                        html += `<div class="card-proj" style="color: ${colorStyle.text};">【${escapeHtml(t.project)}】</div>`;
                        html += `<div class="card-desc">${escapeHtml(t.description).replace(/\n/g, '<br>')}</div>`;
                        html += `<div class="custom-tooltip" style="border-left-color: ${colorStyle.border}; background: linear-gradient(135deg, #ffffff 0%, ${colorStyle.bg} 100%);">`;
                        html += `    <div class="tooltip-title"><span class="icon">📌</span>项目名称：</div>`;
                        html += `    <div class="tooltip-project-name" style="color: ${colorStyle.text};">${escapeHtml(t.project)}</div>`;
                        html += `    <div class="tooltip-divider"></div>`;
                        html += `    <div class="tooltip-title"><span class="icon">📝</span>节点更新内容：</div>`;
                        html += `    <div class="tooltip-content-body">${escapeHtml(t.description).replace(/\n/g, '<br>')}</div>`;
                        html += `    <div class="tooltip-arrow" style="border-top-color: ${colorStyle.border};"></div>`;
                        html += `</div>`;
                        html += `</div>`;
                    }
                }
                html += `</td>`;
            }
            html += `</tr>`;
        }
        html += `</tbody></table>`;
        this.container.innerHTML = html;
        this.scrollToCurrentMonth();
    },

    scrollToCurrentMonth() {
        const containerElem = document.querySelector('.calendar-wrap');
        if (!containerElem) return;
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const rows = document.querySelectorAll('.calendar tbody tr');
        for (let row of rows) {
            const firstCell = row.cells[0];
            if (firstCell) {
                const dateSpan = firstCell.querySelector('.date-number');
                if (dateSpan) {
                    let [month, day] = dateSpan.innerText.split('/');
                    let cellDate = new Date(currentYear, parseInt(month)-1, parseInt(day));
                    if (cellDate.getMonth() === currentMonth) {
                        row.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        break;
                    }
                }
            }
        }
    }
};