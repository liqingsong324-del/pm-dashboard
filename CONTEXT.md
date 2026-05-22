<<<<<<< HEAD
\# 项目管理系统 - 架构说明



\## 目标

一个纯前端、无服务端的项目管理仪表板，支持上传Excel并切换不同视图（日历、甘特图、风险提醒等）。



\## 文件结构

\- index.html      : 主入口，包含顶栏、菜单容器、内容容器

\- style.css       : 全局样式

\- config.js       : 配置常量（默认列映射、颜色主题、节假日）

\- utils.js        : 公共函数（日期解析、Excel解析、颜色映射、HTML转义）

\- calendar.js     : 日历视图模块

\- gantt.js        : 甘特图模块（占位或后续实现）

\- risk.js         : 风险提醒模块（未来）

\- app.js          : 主控制器：上传文件、解析数据、模块切换



\## 模块接口规范

每个模块必须暴露一个对象，包含：

\- name: string

\- init(containerElement, data): void   // 首次渲染到指定容器

\- update(newData): void                // 数据更新时刷新视图

\- destroy(): void                      // 切换模块前清理（可选）



\## 数据规范

全局数据由 app.js 中的 globalRecords 维护，格式为数组，每个元素：

{

&#x20;   date: Date对象,           // 交付日期

&#x20;   project: string,          // 项目名称

&#x20;   description: string,      // 事项说明

&#x20;   type: string,             // 项目类型（用于卡片颜色）

&#x20;   startDate: Date|null,     // 甘特图开始日期

&#x20;   endDate: Date|null        // 甘特图结束日期

}



\## 扩展新模块步骤

1\. 新建 Xxx.js，实现模块接口。

2\. 在 index.html 中用 <script src="xxx.js"> 引入。

3\. 在 config.js 的 MODULES 数组中注册。

4\. 在 app.js 的 modules 对象中添加映射（或自动从 MODULES 生成）。



\## 当前已实现模块

\- calendar: 基于交付日期的月视图日历，支持节假日、周末高亮，卡片悬停放大。



\## 待开发模块

\- gantt: 基于 startDate/endDate 的横道图。

\- risk: 基于关键字或超期提醒。



\## 维护记录

2026-05-22: 从单体HTML重构为模块化架构，保留全部原有功能。

=======
\# 项目管理系统 - 架构说明



\## 目标

一个纯前端、无服务端的项目管理仪表板，支持上传Excel并切换不同视图（日历、甘特图、风险提醒等）。



\## 文件结构

\- index.html      : 主入口，包含顶栏、菜单容器、内容容器

\- style.css       : 全局样式

\- config.js       : 配置常量（默认列映射、颜色主题、节假日）

\- utils.js        : 公共函数（日期解析、Excel解析、颜色映射、HTML转义）

\- calendar.js     : 日历视图模块

\- gantt.js        : 甘特图模块（占位或后续实现）

\- risk.js         : 风险提醒模块（未来）

\- app.js          : 主控制器：上传文件、解析数据、模块切换



\## 模块接口规范

每个模块必须暴露一个对象，包含：

\- name: string

\- init(containerElement, data): void   // 首次渲染到指定容器

\- update(newData): void                // 数据更新时刷新视图

\- destroy(): void                      // 切换模块前清理（可选）



\## 数据规范

全局数据由 app.js 中的 globalRecords 维护，格式为数组，每个元素：

{

&#x20;   date: Date对象,           // 交付日期

&#x20;   project: string,          // 项目名称

&#x20;   description: string,      // 事项说明

&#x20;   type: string,             // 项目类型（用于卡片颜色）

&#x20;   startDate: Date|null,     // 甘特图开始日期

&#x20;   endDate: Date|null        // 甘特图结束日期

}



\## 扩展新模块步骤

1\. 新建 Xxx.js，实现模块接口。

2\. 在 index.html 中用 <script src="xxx.js"> 引入。

3\. 在 config.js 的 MODULES 数组中注册。

4\. 在 app.js 的 modules 对象中添加映射（或自动从 MODULES 生成）。



\## 当前已实现模块

\- calendar: 基于交付日期的月视图日历，支持节假日、周末高亮，卡片悬停放大。



\## 待开发模块

\- gantt: 基于 startDate/endDate 的横道图。

\- risk: 基于关键字或超期提醒。



\## 维护记录

2026-05-22: 从单体HTML重构为模块化架构，保留全部原有功能。

>>>>>>> d1d33e4b1f39d07d51a7224ab903259a311df42a
