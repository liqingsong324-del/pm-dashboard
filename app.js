// app.js - 主控制逻辑（支持多节点拆分 + 修复新增节点）
let globalRecords = [];
let currentModule = null;
let rawJson = null;
let currentColumns = [];        // 新增：保存当前Excel的列名

const moduleConstructors = {
    calendar: CalendarModule,
};

let fileInput, containerDiv, moduleButtonsDiv;
let columnPanel, projectSelect, typeSelect, generateBtn, nodesContainer, addNodeBtn;

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
    if (addNodeBtn) addNodeBtn.addEventListener('click', () => addNodeRow());  // 不再需要传columns
});

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const data = await readExcelFile(file);
    if (data && data.length > 0) {
        rawJson = data;
        currentColumns = Object.keys(rawJson[0]);   // 保存列名
        
        populateSelect(projectSelect, currentColumns, CONFIG.defaultColumns.project);
        typeSelect.innerHTML = '<option value="">— 不使用类型列 —</option>';
        populateSelect(typeSelect, currentColumns, CONFIG.defaultColumns.type);
        
        nodesContainer.innerHTML = '';
        // 默认添加两个节点，传入列名
        addNodeRow(currentColumns);
        addNodeRow(currentColumns);
        
        columnPanel.style.display = 'flex';
        if (currentModule && currentModule.destroy) currentModule.destroy();
        containerDiv.innerHTML = '<div style="text-align:center; padding:60px; color:#8aa0b5;">✅ 已上传文件，请配置节点映射并点击“生成日历”</div>';
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
    // 如果没有传入 columns，则使用全局保存的 currentColumns
    const cols = columns || currentColumns;
    if (!cols || cols.length === 0) return;  // 尚未上传文件时不做操作

    const rowDiv = document.createElement('div');
    rowDiv.className = 'mapping-grid';
    rowDiv.style.marginBottom = '12px';
    
    // 日期列下拉框
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
    
    // 说明列下拉框
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
    
    // 删除按钮容器
    const delDiv = document.createElement('div');
    delDiv.className = 'mapping-item';
    delDiv.style.flex = '0 0 auto';
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.className = 'btn-node-delete';   // 使用独立class，便于样式控制
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
        return;
    }
    
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