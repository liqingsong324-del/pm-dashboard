// app.js - 主控制逻辑（已优化：文件名格式化升级版，截图名称自动变为“项目日历_YYMMDD”）
let globalRecords = [];
let currentModule = null;
let rawJson = null;
let currentColumns = [];        // 保存当前Excel的列名

const moduleConstructors = {
    calendar: CalendarModule,
};

let fileInput, containerDiv, moduleButtonsDiv;
let columnPanel, projectSelect, typeSelect, generateBtn, nodesContainer, addNodeBtn;
let fullscreenCtrlBar, toggleFullscreenBtn, exportImageBtn; 

document.addEventListener('DOMContentLoaded', () => {
    fileInput = document.getElementById('excelUpload');
    containerDiv = document.getElementById('moduleContainer');
    moduleButtonsDiv = document.getElementById('moduleButtons');
    columnPanel = document.getElementById('columnMappingPanel');
    projectSelect = document.getElementById('projectColSelect');
    typeSelect = document.getElementById('typeColSelect');
    generateBtn = document.getElementById('generateCalendarBtn');
    nodesContainer = document.getElementById('nodesContainer');
    addNodeBtn = document.getElementById('addNodeBtn');
    
    fullscreenCtrlBar = document.getElementById('fullscreenCtrlBar');
    toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');
    exportImageBtn = document.getElementById('exportImageBtn'); 

    CONFIG.modules.forEach(mod => {
        if (mod.enabled && moduleConstructors[mod.id]) {
            const btn = document.createElement('button');
            btn.textContent = mod.name;
            btn.className = 'module-btn';
            if (mod.id === 'calendar') btn.classList.add('active');
            btn.dataset.module = mod.id;
            btn.addEventListener('click', () => switchModule(mod.id));
            moduleButtonsDiv.appendChild(btn);
        }
    });

    fileInput.addEventListener('change', handleFileUpload);
    if (generateBtn) generateBtn.addEventListener('click', generateFromSelectedColumns);
    if (addNodeBtn) addNodeBtn.addEventListener('click', () => addNodeRow());  
    
    if (toggleFullscreenBtn) {
        toggleFullscreenBtn.addEventListener('click', toggleFullscreenMode);
    }

    if (exportImageBtn) {
        exportImageBtn.addEventListener('click', exportModuleToImage);
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('fullscreen-mode')) {
            toggleFullscreenMode();
        }
    });
});

function toggleFullscreenMode() {
    const body = document.body;
    const fsText = toggleFullscreenBtn.querySelector('.fs-text');
    const fsIcon = toggleFullscreenBtn.querySelector('.fs-icon');
    
    body.classList.toggle('fullscreen-mode');
    
    if (body.classList.contains('fullscreen-mode')) {
        fsText.textContent = '退出全屏';
        fsIcon.textContent = '⏹';
    } else {
        fsText.textContent = '全屏展示';
        fsIcon.textContent = '🎦';
    }
}

// 纯前端快速拍照导出（基于 Tr 精准剪裁本月前所有行 + 自定义 YYMMDD 文件名）
function exportModuleToImage() {
    if (!containerDiv || containerDiv.children.length === 0) {
        alert('没有可以导出的日历内容');
        return;
    }

    const originalText = exportImageBtn.innerHTML;
    exportImageBtn.innerHTML = '<span>⏳</span> <span>正在渲染排期看板...</span>';
    exportImageBtn.disabled = true;

    // 🎯 1. 动态生成精简时间戳（精确到日）
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonthNum = now.getMonth() + 1;
    const curDateNum = now.getDate();
    const timeStampStr = `📷 截图留存时间：${curYear}-${String(curMonthNum).padStart(2, '0')}-${String(curDateNum).padStart(2, '0')}`;

    // 🎯 2. 动态从数据源中读取当前主看板的目标年份与月份（用于页面内标题展示）
    let targetYear = curYear;
    let targetMonth = curMonthNum;
    let displayTitleText = "项目管理日历";
    
    try {
        if (globalRecords && globalRecords.length > 0) {
            const firstDate = globalRecords[0].date; 
            targetYear = firstDate.getFullYear();
            targetMonth = firstDate.getMonth() + 1;
            displayTitleText = `📅 项目管理日历 (${targetYear}年${String(targetMonth).padStart(2, '0')}月)`;
        }
    } catch (e) {
        console.log("提取目标月份失败", e);
    }

    // 🎯 3. 注入高级双端标题栏
    const titleHeader = document.createElement('div');
    titleHeader.style.width = '100%';
    titleHeader.style.boxSizing = 'border-box';
    titleHeader.style.padding = '24px 20px 14px 20px';
    titleHeader.style.display = 'flex';
    titleHeader.style.justifyContent = 'space-between';
    titleHeader.style.alignItems = 'flex-end';
    titleHeader.style.borderBottom = '2px solid #eef2f6';
    titleHeader.style.marginBottom = '12px';
    titleHeader.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const titleLeft = document.createElement('div');
    titleLeft.style.fontSize = '26px';
    titleLeft.style.fontWeight = 'bold';
    titleLeft.style.color = '#1f3c5d';
    titleLeft.innerText = displayTitleText;

    const titleRight = document.createElement('div');
    titleRight.style.fontSize = '14px';
    titleRight.style.color = '#8aa0b5';
    titleRight.style.fontWeight = '500';
    titleRight.innerText = timeStampStr;

    titleHeader.appendChild(titleLeft);
    titleHeader.appendChild(titleRight);
    containerDiv.insertBefore(titleHeader, containerDiv.firstChild);

    // 🎯 4. 样式解封以铺满全长图
    const originalHeight = containerDiv.style.height;
    const originalMaxHeight = containerDiv.style.maxHeight;
    const originalOverflow = containerDiv.style.overflow;
    const originalOverflowY = containerDiv.style.overflowY;

    containerDiv.style.height = 'auto';
    containerDiv.style.maxHeight = 'none';
    containerDiv.style.overflow = 'visible';
    containerDiv.style.overflowY = 'visible';

    const scrollContainers = containerDiv.querySelectorAll('.calendar-wrap, [style*="overflow"]');
    const savedStyles = [];
    scrollContainers.forEach((el) => {
        savedStyles.push({
            el: el,
            height: el.style.height,
            maxHeight: el.style.maxHeight,
            overflow: el.style.overflow,
            overflowY: el.style.overflowY
        });
        el.style.height = 'auto';
        el.style.maxHeight = 'none';
        el.style.overflow = 'visible';
        el.style.overflowY = 'visible';
    });

    // 🎯 5. 精准拦截：针对 .calendar-week-row 标签行做真日期过滤
    const calendarRows = containerDiv.querySelectorAll('.calendar-week-row');
    const hiddenRows = [];
    
    calendarRows.forEach(row => {
        let shouldHideThisWeek = true;
        for (let i = 0; i < row.cells.length; i++) {
            const cell = row.cells[i];
            const dateSpan = cell.querySelector('.date-number');
            if (dateSpan) {
                let [monthText, _] = dateSpan.innerText.split('/');
                let cellMonth = parseInt(monthText);
                if (cellMonth === targetMonth || cellMonth > targetMonth || (targetMonth === 12 && cellMonth === 1)) {
                    shouldHideThisWeek = false;
                    break;
                }
            }
        }
        if (shouldHideThisWeek) {
            hiddenRows.push({ el: row, prevDisplay: row.style.display });
            row.style.display = 'none';
        }
    });

    // 🎯 6. 瞬间超清拍照
    html2canvas(containerDiv, {
        useCORS: true,          
        allowTaint: true,       
        scale: 2,               
        backgroundColor: '#ffffff',
        windowHeight: containerDiv.scrollHeight 
    }).then(canvas => {
        // 🎯 7. 即刻恢复网页现场原始形态
        containerDiv.removeChild(titleHeader);
        containerDiv.style.height = originalHeight;
        containerDiv.style.maxHeight = originalMaxHeight;
        containerDiv.style.overflow = originalOverflow;
        containerDiv.style.overflowY = originalOverflowY;
        
        savedStyles.forEach(item => {
            item.el.style.height = item.height;
            item.el.style.maxHeight = item.maxHeight;
            item.el.style.overflow = item.overflow;
            item.el.style.overflowY = item.overflowY;
        });

        hiddenRows.forEach(item => {
            item.el.style.display = item.prevDisplay;
        });

        // 🎯 8. 【核心修改点】：生成期望的“项目日历_260523”格式文件名（YYMMDD）
        const shortYear = String(curYear).slice(-2); // 提取年份后两位，如 "26"
        const shortMonth = String(curMonthNum).padStart(2, '0'); // 双位月份，如 "05"
        const shortDate = String(curDateNum).padStart(2, '0'); // 双位日期，如 "23"
        const fileName = `项目日历_${shortYear}${shortMonth}${shortDate}.png`;

        // 触发长图高速下载
        const imageUri = canvas.toDataURL("image/png");
        const downloadLink = document.createElement('a');
        downloadLink.download = fileName;
        downloadLink.href = imageUri;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        exportImageBtn.innerHTML = originalText;
        exportImageBtn.disabled = false;
    }).catch(err => {
        // 异常回滚保护机制
        if (titleHeader.parentNode === containerDiv) {
            containerDiv.removeChild(titleHeader);
        }
        containerDiv.style.height = originalHeight;
        containerDiv.style.maxHeight = originalMaxHeight;
        containerDiv.style.overflow = originalOverflow;
        containerDiv.style.overflowY = originalOverflowY;
        savedStyles.forEach(item => {
            item.el.style.height = item.height;
            item.el.style.maxHeight = item.maxHeight;
            item.el.style.overflow = item.overflow;
            item.el.style.overflowY = item.overflowY;
        });
        hiddenRows.forEach(item => {
            item.el.style.display = item.prevDisplay;
        });

        console.error('导出图片失败:', err);
        alert('导出图片失败，请重试');
        exportImageBtn.innerHTML = originalText;
        exportImageBtn.disabled = false;
    });
}

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const data = await readExcelFile(file);
    if (data && data.length > 0) {
        rawJson = data;
        currentColumns = Object.keys(rawJson[0]);
        
        populateSelect(projectSelect, currentColumns, CONFIG.defaultColumns.project);
        typeSelect.innerHTML = '<option value="">— 不使用类型列 —</option>';
        populateSelect(typeSelect, currentColumns, CONFIG.defaultColumns.type);
        
        nodesContainer.innerHTML = '';
        addNodeRow(currentColumns);
        
        columnPanel.style.display = 'flex';
        if (currentModule && currentModule.destroy) currentModule.destroy();
        containerDiv.innerHTML = '<div style="text-align:center; padding:60px; color:#8aa0b5;">✅ 已上传文件，请配置节点映射并点击“生成日历”</div>';
        
        if (fullscreenCtrlBar) fullscreenCtrlBar.style.display = 'none';
        globalRecords = [];
    }
}

function populateSelect(selectElement, columns, defaultValue) {
    if (!selectElement) return;
    selectElement.innerHTML = '';
    columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        if (col === defaultValue) option.selected = true;
        selectElement.appendChild(option);
    });
}

function addNodeRow(columns = null) {
    if (!nodesContainer) return;
    const cols = columns || currentColumns;
    if (!cols || cols.length === 0) return;  

    const rowDiv = document.createElement('div');
    rowDiv.className = 'mapping-grid';
    rowDiv.style.marginBottom = '12px';
    
    const dateDiv = document.createElement('div');
    dateDiv.className = 'mapping-item';
    dateDiv.innerHTML = `<label>📅 节点日期列</label>`;
    const dateSelect = document.createElement('select');
    dateSelect.className = 'node-date-select';
    cols.forEach(col => {
        const opt = document.createElement('option');
        opt.value = col;
        opt.textContent = col;
        dateSelect.appendChild(opt);
    });
    dateDiv.appendChild(dateSelect);
    
    const taskDiv = document.createElement('div');
    taskDiv.className = 'mapping-item';
    taskDiv.innerHTML = `<label>📝 节点说明列</label>`;
    const taskSelect = document.createElement('select');
    taskSelect.className = 'node-task-select';
    cols.forEach(col => {
        const opt = document.createElement('option');
        opt.value = col;
        opt.textContent = col;
        taskSelect.appendChild(opt);
    });
    taskDiv.appendChild(taskSelect);
    
    const delDiv = document.createElement('div');
    delDiv.className = 'mapping-item';
    delDiv.style.flex = '0 0 auto';
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.className = 'btn-node-delete';   
    delBtn.onclick = () => rowDiv.remove();
    delDiv.appendChild(delBtn);
    
    rowDiv.appendChild(dateDiv);
    rowDiv.appendChild(taskDiv);
    rowDiv.appendChild(delDiv);
    nodesContainer.appendChild(rowDiv);
}

function readExcelFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(evt) {
            const binary = evt.target.result;
            const workbook = XLSX.read(binary, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            resolve(json);
        };
        reader.readAsBinaryString(file);
    });
}

function collectNodeConfigs() {
    const configs = [];
    const rows = nodesContainer.querySelectorAll('.mapping-grid');
    rows.forEach(row => {
        const dateSelect = row.querySelector('.node-date-select');
        const taskSelect = row.querySelector('.node-task-select');
        if (dateSelect && taskSelect && dateSelect.value && taskSelect.value) {
            configs.push({
                dateCol: dateSelect.value,
                taskCol: taskSelect.value
            });
        }
    });
    return configs;
}

function generateFromSelectedColumns() {
    if (!rawJson || rawJson.length === 0) {
        alert('请先上传 Excel 文件');
        return;
    }
    const projectCol = projectSelect ? projectSelect.value : '';
    let typeCol = typeSelect ? typeSelect.value : '';
    if (typeCol === "") typeCol = null;
    if (!projectCol) {
        alert('请选择项目名称列');
        return;
    }
    
    const nodes = collectNodeConfigs();
    if (nodes.length === 0) {
        alert('请至少添加一个节点（日期列+说明列）');
        return;
    }
    
    globalRecords = [];
    for (let row of rawJson) {
        const projectName = row[projectCol] ? String(row[projectCol]).trim() : "";
        if (!projectName) continue;
        const typeValue = typeCol ? (row[typeCol] ? String(row[typeCol]).trim() : "") : "";
        
        for (let node of nodes) {
            const dateVal = row[node.dateCol];
            const taskVal = row[node.taskCol] ? String(row[node.taskCol]).trim() : "";
            if (!dateVal || !taskVal) continue;
            const dateObj = parseDate(dateVal);
            if (!dateObj) continue;
            
            globalRecords.push({
                date: dateObj,
                project: projectName,
                description: taskVal,
                type: typeValue,
                startDate: null,
                endDate: null
            });
        }
    }
    
    resetColorMap();
    
    if (globalRecords.length === 0) {
        alert('没有有效的节点数据，请检查日期列格式或说明列是否为空');
        containerDiv.innerHTML = '<div style="text-align:center;padding:40px;">无有效数据</div>';
        if (fullscreenCtrlBar) fullscreenCtrlBar.style.display = 'none';
        return;
    }
    
    if (fullscreenCtrlBar) fullscreenCtrlBar.style.display = 'flex';
    
    if (currentModule) {
        currentModule.update(globalRecords);
    } else {
        switchModule('calendar');
    }
}

function switchModule(moduleId) {
    const ModuleConstructor = moduleConstructors[moduleId];
    if (!ModuleConstructor) return;
    if (currentModule && currentModule.destroy) currentModule.destroy();
    currentModule = ModuleConstructor;
    currentModule.init(containerDiv, globalRecords);
    document.querySelectorAll('.module-btn').forEach(btn => {
        if (btn.dataset.module === moduleId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}