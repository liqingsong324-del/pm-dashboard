<<<<<<< HEAD
// calendar.js - 日历视图模块
const CalendarModule = {
    name: 'calendar',
    container: null,
    currentData: null,

    // 渲染日历到指定容器
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
        
        // 获取所有有任务的日期，确定日历范围
        let sortedDates = Array.from(map.keys()).sort();
        if (sortedDates.length === 0) {
            this.container.innerHTML = '<div style="text-align:center;padding:40px;">暂无任务数据</div>';
            return;
        }
        let startDate = new Date(sortedDates[0]);
        let endDate = new Date(sortedDates[sortedDates.length-1]);

        // 计算起始周一和结束周日
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
        const todayStr = new Date().toISOString().slice(0,10);
        const holidays = CONFIG.holidays;
        const colorPalette = CONFIG.colorPalette;

        let html = `<table class="calendar"><thead><tr><th>周一</th><th>周二</th><th>周三</th><th>周四</th><th>周五</th><th>周六</th><th>周日</th></tr></thead><tbody>`;
        for (let week of weeks) {
            html += `<tr>`;
            for (let day of week) {
                let dayStr = day.toISOString().slice(0,10);
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
                        html += `</div>`;
                    }
                }
                html += `</td>`;
            }
            html += `</tr>`;
        }
        html += `</tbody></table>`;
        this.container.innerHTML = html;
        // 滚动到当前月份所在行
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
=======
// calendar.js - 日历视图模块
const CalendarModule = {
    name: 'calendar',
    container: null,
    currentData: null,

    // 渲染日历到指定容器
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
        
        // 获取所有有任务的日期，确定日历范围
        let sortedDates = Array.from(map.keys()).sort();
        if (sortedDates.length === 0) {
            this.container.innerHTML = '<div style="text-align:center;padding:40px;">暂无任务数据</div>';
            return;
        }
        let startDate = new Date(sortedDates[0]);
        let endDate = new Date(sortedDates[sortedDates.length-1]);

        // 计算起始周一和结束周日
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
        const todayStr = new Date().toISOString().slice(0,10);
        const holidays = CONFIG.holidays;
        const colorPalette = CONFIG.colorPalette;

        let html = `<table class="calendar"><thead><tr><th>周一</th><th>周二</th><th>周三</th><th>周四</th><th>周五</th><th>周六</th><th>周日</th></tr></thead><tbody>`;
        for (let week of weeks) {
            html += `<tr>`;
            for (let day of week) {
                let dayStr = day.toISOString().slice(0,10);
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
                        html += `</div>`;
                    }
                }
                html += `</td>`;
            }
            html += `</tr>`;
        }
        html += `</tbody></table>`;
        this.container.innerHTML = html;
        // 滚动到当前月份所在行
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
>>>>>>> d1d33e4b1f39d07d51a7224ab903259a311df42a
};