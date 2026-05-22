// config.js - 配置常量
const CONFIG = {
    // 默认列映射（建议与企业微信智能表格的列名保持一致）
    defaultColumns: {
        date: "预计交付时间",
        project: "项目名称",
        task: "情况说明",
        type: "项目类型",
        startDate: "开始日期",
        endDate: "结束日期"
    },

    // 节假日 (MM-DD)
    holidays: [
        "01-01", "05-01", "10-01", "10-02", "10-03",
        "04-04", "04-05", "04-06", "06-22", "06-23", "06-24", "09-29", "09-30", "10-06"
    ],

    // 卡片颜色池 (border, bg, text)
    colorPalette: [
        { border: "#FFB347", bg: "#FFF4E6", text: "#C45C00" },
        { border: "#4C9A8E", bg: "#E6F4F0", text: "#1F6E5C" },
        { border: "#5D9BD5", bg: "#EBF3FB", text: "#2A6F9C" },
        { border: "#C4628E", bg: "#FDF0F5", text: "#A1376A" },
        { border: "#9B6FA3", bg: "#F5EFF7", text: "#6B3E7A" },
        { border: "#E88D67", bg: "#FEF2EC", text: "#B55B36" },
        { border: "#6C91B2", bg: "#EEF3F8", text: "#2C577C" },
        { border: "#95B35B", bg: "#F2F8E8", text: "#567E1A" }
    ],

    // 注册模块列表（顺序影响显示顺序）
    modules: [
        { id: "calendar", name: "📅 项目日历", file: "calendar.js", enabled: true },
        { id: "gantt", name: "📊 甘特图", file: "gantt.js", enabled: false },  // 暂未实现
        { id: "risk", name: "⚠️ 风险提醒", file: "risk.js", enabled: false }
    ]
};