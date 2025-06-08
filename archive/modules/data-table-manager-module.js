/**
 * Data Table Manager Module
 * 新しいデータ構造に対応したテーブル管理機能
 * 17列の組織データ管理とインタラクティブな操作機能
 */

const DataTableManagerModule = (() => {
    'use strict';

    /**
     * データテーブルマネージャークラス
     * 組織データの表形式表示と編集機能を提供
     */
    class DataTableManager {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                enableEditing: true,
                enableSorting: true,
                enableFiltering: true,
                enableRowNumbers: true,
                enableDragDrop: true,
                enableColumnVisibility: true,
                pageSize: 50,
                ...options
            };
            
            this.data = [];
            this.filteredData = [];
            this.sortConfig = { column: null, direction: 'asc' };
            this.currentPage = 1;
            this.selectedRows = new Set();
            this.columnVisibility = new Map();
            this.languageManager = null;
            
            // バリデーション関連
            this.validationErrors = new Map(); // rowIndex -> {columnId: errorMessage}
            this.validationWarnings = new Map(); // rowIndex -> {columnId: warningMessage}
            this.isDirty = false; // データが変更されているか
            this.isValidating = false; // バリデーション実行中か
            
            // カラム定義（新しい17列構造）
            this.columns = this.defineColumns();
            
            // 初期化
            this.initialize();
        }

        /**
         * カラム定義を設定
         * @returns {Array} カラム定義配列
         */
        defineColumns() {
            return [
                // Team情報グループ
                { 
                    id: 'level', 
                    key: 'level', 
                    titleKey: 'columns.level',
                    type: 'number', 
                    width: '80px', 
                    editable: true,
                    group: 'team',
                    visible: true,
                    sortable: true
                },
                { 
                    id: 'teamName', 
                    key: 'teamName', 
                    titleKey: 'columns.teamName',
                    type: 'text', 
                    width: '150px', 
                    editable: true,
                    group: 'team',
                    visible: true,
                    required: true,
                    sortable: true
                },
                { 
                    id: 'exactTeamName', 
                    key: 'exactTeamName', 
                    titleKey: 'columns.exactTeamName',
                    type: 'text', 
                    width: '150px', 
                    editable: true,
                    group: 'team',
                    visible: false,
                    sortable: true
                },
                { 
                    id: 'upperTeam', 
                    key: 'upperTeam', 
                    titleKey: 'columns.upperTeam',
                    type: 'text', 
                    width: '150px', 
                    editable: true,
                    group: 'team',
                    visible: true,
                    sortable: true
                },
                { 
                    id: 'teamId', 
                    key: 'teamId', 
                    titleKey: 'columns.teamId',
                    type: 'text', 
                    width: '100px', 
                    editable: true,
                    group: 'team',
                    visible: false,
                    sortable: true
                },
                
                // PIC情報グループ
                { 
                    id: 'role', 
                    key: 'role', 
                    titleKey: 'columns.role',
                    type: 'text', 
                    width: '120px', 
                    editable: true,
                    group: 'pic',
                    visible: true,
                    sortable: true
                },
                { 
                    id: 'role2ndLang', 
                    key: 'role2ndLang', 
                    titleKey: 'columns.role2ndLang',
                    type: 'text', 
                    width: '120px', 
                    editable: true,
                    group: 'pic',
                    visible: false,
                    sortable: true
                },
                { 
                    id: 'teamBoss', 
                    key: 'teamBoss', 
                    titleKey: 'columns.teamBoss',
                    type: 'boolean', 
                    width: '80px', 
                    editable: true,
                    group: 'pic',
                    visible: true,
                    sortable: true
                },
                { 
                    id: 'picName', 
                    key: 'picName', 
                    titleKey: 'columns.picName',
                    type: 'text', 
                    width: '120px', 
                    editable: true,
                    group: 'pic',
                    visible: true,
                    required: true,
                    sortable: true
                },
                { 
                    id: 'picName2ndLang', 
                    key: 'picName2ndLang', 
                    titleKey: 'columns.picName2ndLang',
                    type: 'text', 
                    width: '120px', 
                    editable: true,
                    group: 'pic',
                    visible: false,
                    sortable: true
                },
                { 
                    id: 'concurrent', 
                    key: 'concurrent', 
                    titleKey: 'columns.concurrent',
                    type: 'boolean', 
                    width: '100px', 
                    editable: true,
                    group: 'pic',
                    visible: false,
                    sortable: true
                },
                
                // 補足情報グループ
                { 
                    id: 'employeeCd', 
                    key: 'employeeCd', 
                    titleKey: 'columns.employeeCd',
                    type: 'text', 
                    width: '100px', 
                    editable: true,
                    group: 'supplemental',
                    visible: false,
                    sortable: true
                },
                { 
                    id: 'grade', 
                    key: 'grade', 
                    titleKey: 'columns.grade',
                    type: 'text', 
                    width: '80px', 
                    editable: true,
                    group: 'supplemental',
                    visible: false,
                    sortable: true
                },
                { 
                    id: 'memo', 
                    key: 'memo', 
                    titleKey: 'columns.memo',
                    type: 'text', 
                    width: '200px', 
                    editable: true,
                    group: 'supplemental',
                    visible: false,
                    sortable: true
                },
                { 
                    id: 'borderColor', 
                    key: 'borderColor', 
                    titleKey: 'columns.borderColor',
                    type: 'color', 
                    width: '100px', 
                    editable: true,
                    group: 'supplemental',
                    visible: false,
                    sortable: false
                },
                { 
                    id: 'headerBgColor', 
                    key: 'headerBgColor', 
                    titleKey: 'columns.headerBgColor',
                    type: 'color', 
                    width: '100px', 
                    editable: true,
                    group: 'supplemental',
                    visible: false,
                    sortable: false
                },
                { 
                    id: 'headerTextColor', 
                    key: 'headerTextColor', 
                    titleKey: 'columns.headerTextColor',
                    type: 'color', 
                    width: '100px', 
                    editable: true,
                    group: 'supplemental',
                    visible: false,
                    sortable: false
                }
            ];
        }

        /**
         * 初期化
         */
        initialize() {
            // 言語マネージャーを取得
            if (window.ConfigModule && window.ConfigModule.LanguageManager) {
                this.languageManager = window.ConfigModule.LanguageManager.getInstance();
            }
            
            // カラム表示設定を初期化
            this.initializeColumnVisibility();
            
            // テーブルを構築
            this.buildTable();
            
            // イベントリスナーを設定
            this.setupEventListeners();
        }

        /**
         * カラム表示設定を初期化
         */
        initializeColumnVisibility() {
            this.columns.forEach(column => {
                this.columnVisibility.set(column.id, column.visible);
            });
        }

        /**
         * データを設定
         * @param {Array} data - 組織データ配列
         */
        setData(data) {
            console.log('setData called with:', data);
            this.data = data || [];
            this.filteredData = [...this.data];
            this.currentPage = 1;
            this.selectedRows.clear();
            
            // バリデーション状態をリセット
            this.validationErrors.clear();
            this.validationWarnings.clear();
            this.setDirtyState(false);
            
            console.log(`Data set: ${this.data.length} rows, enableEditing: ${this.options.enableEditing}`);
            this.renderTable();
            
            // 初期バリデーション実行
            setTimeout(() => {
                this.validateAllData();
            }, 100);
        }

        /**
         * テーブルを構築
         */
        buildTable() {
            // 基本的なスタイルを追加
            if (!document.getElementById('data-table-styles')) {
                const style = document.createElement('style');
                style.id = 'data-table-styles';
                style.textContent = `
                    .data-table-container {
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        background: white;
                        margin: 10px 0;
                    }
                    .table-toolbar {
                        padding: 10px;
                        background: #f8f9fa;
                        border-bottom: 1px solid #ddd;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 10px;
                    }
                    .toolbar-left, .toolbar-center, .toolbar-right {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .table-wrapper {
                        max-height: 600px;
                        overflow: auto;
                        position: relative;
                    }
                    .data-table {
                        width: 100%;
                        min-width: 1200px;
                        border-collapse: collapse;
                        font-size: 14px;
                    }
                    .data-table th, .data-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .data-table th {
                        background: #f8f9fa;
                        font-weight: bold;
                        position: sticky;
                        top: 0;
                        z-index: 15;
                    }
                    .sortable {
                        cursor: pointer;
                        user-select: none;
                    }
                    .sortable:hover {
                        background: #e9ecef;
                    }
                    .data-row:nth-child(even) {
                        background: #f8f9fa;
                    }
                    .data-row:hover {
                        background: #e3f2fd;
                    }
                    .editable {
                        background: #fff3cd !important;
                    }
                    .cell-input {
                        width: 100%;
                        border: none;
                        background: transparent;
                        padding: 2px;
                    }
                    .column-visibility-panel {
                        position: absolute;
                        top: 100%;
                        right: 0;
                        background: white;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        padding: 15px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        z-index: 1000;
                        min-width: 250px;
                    }
                    .table-footer {
                        padding: 10px;
                        background: #f8f9fa;
                        border-top: 1px solid #ddd;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 15px;
                    }
                    .table-status {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 13px;
                    }
                    .status-info {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                    .status-icon {
                        font-size: 14px;
                    }
                    .status-text {
                        font-weight: 500;
                    }
                    .validation-summary {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        color: #dc3545;
                        font-weight: 500;
                    }
                    .status-success {
                        color: #28a745;
                    }
                    .status-warning {
                        color: #ffc107;
                    }
                    .status-error {
                        color: #dc3545;
                    }
                    .status-info-icon {
                        color: #17a2b8;
                    }
                    .btn {
                        padding: 6px 12px;
                        border: 1px solid #ddd;
                        background: white;
                        cursor: pointer;
                        border-radius: 3px;
                        font-size: 13px;
                    }
                    .btn:hover {
                        background: #f8f9fa;
                    }
                    .btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }
                    .search-input {
                        padding: 6px 10px;
                        border: 1px solid #ddd;
                        border-radius: 3px;
                        width: 200px;
                    }
                    .data-row[draggable="true"] {
                        position: relative;
                    }
                    .data-row.dragging {
                        opacity: 0.5;
                        background: #f0f0f0 !important;
                    }
                    .data-row.drop-target {
                        background: #e3f2fd !important;
                        border: 2px dashed #1976d2;
                    }
                    .data-row[draggable="true"]:hover {
                        background: #f5f5f5;
                    }
                    .row-controls {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        padding: 2px;
                    }
                    .drag-handle {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 16px;
                        height: 16px;
                        color: #888;
                        cursor: grab;
                        user-select: none;
                        opacity: 0.7;
                        transition: all 0.2s ease;
                        border-radius: 2px;
                        padding: 2px;
                    }
                    .drag-handle:hover {
                        opacity: 1;
                        color: #555;
                        background: rgba(0,0,0,0.05);
                    }
                    .drag-handle:active {
                        cursor: grabbing;
                        background: rgba(0,0,0,0.1);
                    }
                    .data-row.dragging .drag-handle {
                        cursor: grabbing;
                        opacity: 1;
                        color: #2196f3;
                    }
                    .drag-handle svg {
                        pointer-events: none;
                    }
                    
                    /* 固定列のスタイル */
                    .data-table th.sticky-column,
                    .data-table td.sticky-column {
                        position: sticky;
                        background: inherit;
                        z-index: 5;
                        border-right: 2px solid #ddd;
                    }
                    
                    /* 行番号列（最左端固定） */
                    .data-table th.row-number-header,
                    .data-table td.row-number-cell {
                        left: 0;
                        z-index: 20;
                        background: #f8f9fa;
                        min-width: 80px;
                        width: 80px;
                    }
                    
                    /* 行番号ヘッダー（交差部分） */
                    .data-table th.row-number-header {
                        z-index: 30 !important;
                    }
                    
                    /* Level列（2番目固定） */
                    .data-table th.column-level,
                    .data-table td.cell-level {
                        left: 80px;
                        z-index: 19;
                        background: #f8f9fa;
                        min-width: 70px;
                        width: 70px;
                    }
                    
                    /* Level列ヘッダー */
                    .data-table th.column-level {
                        z-index: 25 !important;
                    }
                    
                    /* Team Name列（3番目固定） */
                    .data-table th.column-teamName,
                    .data-table td.cell-teamName {
                        left: 150px;
                        z-index: 18;
                        background: #f8f9fa;
                        min-width: 150px;
                        width: 150px;
                        box-shadow: 2px 0 4px rgba(0,0,0,0.1);
                    }
                    
                    /* Team Name列ヘッダー */
                    .data-table th.column-teamName {
                        z-index: 24 !important;
                        box-shadow: 2px 0 4px rgba(0,0,0,0.15);
                    }
                    
                    /* ヘッダー行の固定列 */
                    .data-table th.sticky-column {
                        background: #e9ecef !important;
                        border-right: 2px solid #adb5bd;
                        border-bottom: 2px solid #adb5bd;
                    }
                    
                    /* データ行の固定列の基本背景 */
                    .data-table td.sticky-column {
                        background: #f8f9fa !important;
                    }
                    
                    /* データ行の固定列ホバー効果 */
                    .data-row:hover .sticky-column {
                        background: #e3f2fd !important;
                    }
                    
                    /* ドラッグ中の固定列 */
                    .data-row.dragging .sticky-column {
                        background: #f0f0f0 !important;
                    }
                    
                    /* 行番号列の強制背景設定 */
                    .data-table th.row-number-header,
                    .data-table td.row-number-cell {
                        background: #f8f9fa !important;
                    }
                    
                    /* Level列の強制背景設定 */
                    .data-table th.column-level,
                    .data-table td.cell-level {
                        background: #f8f9fa !important;
                    }
                    
                    /* Team Name列の強制背景設定 */
                    .data-table th.column-teamName,
                    .data-table td.cell-teamName {
                        background: #f8f9fa !important;
                    }
                    
                    /* バリデーションエラー表示 */
                    .data-cell.validation-error {
                        background: #ffe6e6 !important;
                        border: 1px solid #dc3545 !important;
                    }
                    .data-cell.validation-warning {
                        background: #fff3cd !important;
                        border: 1px solid #ffc107 !important;
                    }
                    .validation-tooltip {
                        position: absolute;
                        background: #dc3545;
                        color: white;
                        padding: 5px 8px;
                        border-radius: 3px;
                        font-size: 12px;
                        z-index: 1000;
                        white-space: nowrap;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    }
                    .validation-tooltip::before {
                        content: '';
                        position: absolute;
                        top: -5px;
                        left: 50%;
                        transform: translateX(-50%);
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                        border-bottom: 5px solid #dc3545;
                    }
                `;
                document.head.appendChild(style);
            }
            
            this.container.innerHTML = `
                <div class="data-table-container">
                    <div class="table-toolbar">
                        <div class="toolbar-left">
                            <button class="btn btn-sm add-row" title="${this.t('table.addRow')}">
                                <span class="icon">➕</span> ${this.t('table.addRow')}
                            </button>
                            <button class="btn btn-sm delete-selected" title="${this.t('table.deleteSelected')}" disabled>
                                <span class="icon">🗑️</span> ${this.t('table.deleteSelected')}
                            </button>
                            <button class="btn btn-sm apply-changes" title="${this.t('table.applyChanges')}">
                                <span class="icon">✅</span> ${this.t('table.applyChanges')}
                            </button>
                            <div class="row-count">
                                <span class="total-rows">0</span> ${this.t('table.rows')}
                            </div>
                        </div>
                        <div class="toolbar-center">
                            <input type="text" class="search-input" placeholder="${this.t('table.search')}" />
                            <button class="btn btn-sm clear-search" title="${this.t('table.clearSearch')}">
                                <span class="icon">❌</span> ${this.t('table.clear')}
                            </button>
                        </div>
                        <div class="toolbar-right">
                            <button class="btn btn-sm column-visibility" title="${this.t('table.columnVisibility')}">
                                <span class="icon">👁️</span> ${this.t('table.columns')}
                            </button>
                            <button class="btn btn-sm export-data" title="${this.t('table.export')}">
                                <span class="icon">📤</span> ${this.t('table.export')}
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-wrapper">
                        <table class="data-table">
                            <thead>
                                <tr class="header-row"></tr>
                            </thead>
                            <tbody class="table-body">
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="table-footer">
                        <div class="table-status">
                            <div class="status-info">
                                <span class="status-icon">ℹ️</span>
                                <span class="status-text">${this.t('table.ready')}</span>
                            </div>
                            <div class="validation-summary" style="display: none;">
                                <span class="error-count">0</span> ${this.t('table.errors')}
                            </div>
                        </div>
                        <div class="pagination">
                            <button class="btn btn-sm prev-page" disabled>
                                <span class="icon">⬅️</span> ${this.t('table.previous')}
                            </button>
                            <span class="page-info">
                                <span class="current-page">1</span> / <span class="total-pages">1</span>
                            </span>
                            <button class="btn btn-sm next-page" disabled>
                                ${this.t('table.next')} <span class="icon">➡️</span>
                            </button>
                        </div>
                        <div class="page-size-selector">
                            <label>${this.t('table.rowsPerPage')}:</label>
                            <select class="page-size">
                                <option value="25">25</option>
                                <option value="50" selected>50</option>
                                <option value="100">100</option>
                                <option value="all">${this.t('table.all')}</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="column-visibility-panel" style="display: none;">
                    <div class="panel-header">
                        <h3>${this.t('table.columnVisibility')}</h3>
                        <button class="btn btn-sm close-panel">❌</button>
                    </div>
                    <div class="panel-body">
                        <div class="column-groups"></div>
                        <div class="panel-actions">
                            <button class="btn btn-sm show-all">${this.t('table.showAll')}</button>
                            <button class="btn btn-sm hide-all">${this.t('table.hideAll')}</button>
                            <button class="btn btn-sm reset-defaults">${this.t('table.resetDefaults')}</button>
                        </div>
                    </div>
                </div>
            `;
            
            this.renderHeader();
            this.buildColumnVisibilityPanel();
        }

        /**
         * ヘッダーを描画
         */
        renderHeader() {
            const headerRow = this.container.querySelector('.header-row');
            headerRow.innerHTML = '';
            
            // 行番号カラム
            if (this.options.enableRowNumbers) {
                const th = document.createElement('th');
                th.className = 'row-number-header sticky-column';
                th.innerHTML = `
                    <input type="checkbox" class="select-all" title="${this.t('table.selectAll')}" />
                    <span class="row-number-label">#</span>
                `;
                headerRow.appendChild(th);
            }
            
            // データカラム
            this.columns.forEach(column => {
                if (this.columnVisibility.get(column.id)) {
                    const th = document.createElement('th');
                    
                    // 固定列のクラスを追加
                    let headerClass = `column-header column-${column.id}`;
                    if (column.id === 'level' || column.id === 'teamName') {
                        headerClass += ' sticky-column';
                    }
                    
                    th.className = headerClass;
                    th.setAttribute('data-column', column.id);
                    th.style.width = column.width;
                    
                    const sortIcon = this.sortConfig.column === column.id 
                        ? (this.sortConfig.direction === 'asc' ? '⬆️' : '⬇️') 
                        : '↕️';
                    
                    th.innerHTML = `
                        <div class="header-content">
                            <span class="column-title">${this.t(column.titleKey)}</span>
                            ${column.sortable ? `<span class="sort-icon">${sortIcon}</span>` : ''}
                        </div>
                    `;
                    
                    if (column.sortable && this.options.enableSorting) {
                        th.classList.add('sortable');
                        th.addEventListener('click', () => this.handleSort(column.id));
                    }
                    
                    headerRow.appendChild(th);
                }
            });
        }

        /**
         * テーブルを描画
         */
        renderTable() {
            console.log('renderTable called');
            console.trace('renderTable call stack');  // スタックトレースを表示
            const tbody = this.container.querySelector('.table-body');
            tbody.innerHTML = '';
            
            const startIndex = this.options.pageSize === 'all' ? 0 : (this.currentPage - 1) * this.options.pageSize;
            const endIndex = this.options.pageSize === 'all' ? this.filteredData.length : startIndex + this.options.pageSize;
            const pageData = this.filteredData.slice(startIndex, endIndex);
            
            pageData.forEach((row, index) => {
                const tr = this.createTableRow(row, startIndex + index);
                tbody.appendChild(tr);
            });
            
            this.updateFooter();
            this.updateToolbar();
        }

        /**
         * テーブル行を作成
         * @param {Object} rowData - 行データ
         * @param {number} index - 行インデックス
         * @returns {HTMLElement} テーブル行要素
         */
        createTableRow(rowData, index) {
            console.log(`Creating table row ${index}:`, rowData);
            const tr = document.createElement('tr');
            tr.className = 'data-row';
            tr.setAttribute('data-index', index);
            
            // ドラッグ&ドロップ機能
            if (this.options.enableDragDrop) {
                tr.draggable = true;
                // イベントリスナーは setupEventListeners() で委任方式で設定済み
            }
            
            // 行番号セル
            if (this.options.enableRowNumbers) {
                const td = document.createElement('td');
                td.className = 'row-number-cell sticky-column';
                
                let cellContent = `
                    <input type="checkbox" class="row-select" data-index="${index}" />
                    <span class="row-number">${index + 1}</span>
                `;
                
                // ドラッグ&ドロップが有効な場合はドラッグハンドルを追加
                if (this.options.enableDragDrop) {
                    cellContent = `
                        <div class="row-controls">
                            <span class="drag-handle" title="${this.t('table.dragToReorder')}">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                    <circle cx="3" cy="3" r="1"/>
                                    <circle cx="9" cy="3" r="1"/>
                                    <circle cx="3" cy="6" r="1"/>
                                    <circle cx="9" cy="6" r="1"/>
                                    <circle cx="3" cy="9" r="1"/>
                                    <circle cx="9" cy="9" r="1"/>
                                </svg>
                            </span>
                            <input type="checkbox" class="row-select" data-index="${index}" />
                            <span class="row-number">${index + 1}</span>
                        </div>
                    `;
                }
                
                td.innerHTML = cellContent;
                tr.appendChild(td);
            }
            
            // データセル
            this.columns.forEach(column => {
                if (this.columnVisibility.get(column.id)) {
                    const td = this.createTableCell(rowData, column, index);
                    tr.appendChild(td);
                }
            });
            
            return tr;
        }

        /**
         * テーブルセルを作成
         * @param {Object} rowData - 行データ
         * @param {Object} column - カラム定義
         * @param {number} index - 行インデックス
         * @returns {HTMLElement} テーブルセル要素
         */
        createTableCell(rowData, column, index) {
            const td = document.createElement('td');
            
            // 固定列のクラスを追加
            let cellClass = `data-cell cell-${column.id}`;
            if (column.id === 'level' || column.id === 'teamName') {
                cellClass += ' sticky-column';
            }
            
            td.className = cellClass;
            td.setAttribute('data-column', column.id);
            td.setAttribute('data-index', index);
            
            const value = rowData[column.key] || '';
            
            // デバッグログ追加
            if (index === 0) { // 最初の行のみログ出力
                console.log(`Cell creation - Column: ${column.id}, Editable: ${column.editable}, EnableEditing: ${this.options.enableEditing}, Value: ${value}`);
            }
            
            if (column.editable && this.options.enableEditing) {
                td.innerHTML = this.createEditableCell(value, column);
                td.classList.add('editable');
                if (index === 0) {
                    console.log(`Created editable cell for ${column.id}: ${td.innerHTML}`);
                }
            } else {
                td.innerHTML = this.formatCellValue(value, column);
                if (index === 0) {
                    console.log(`Created read-only cell for ${column.id}: ${td.innerHTML}`);
                }
            }
            
            return td;
        }

        /**
         * 編集可能セルを作成
         * @param {*} value - セル値
         * @param {Object} column - カラム定義
         * @returns {string} HTML文字列
         */
        createEditableCell(value, column) {
            console.log(`Creating editable cell - Column: ${column.id}, Type: ${column.type}, Value: ${value}`);
            let html;
            switch (column.type) {
                case 'boolean':
                    html = `<input type="checkbox" class="cell-input" ${value ? 'checked' : ''} />`;
                    break;
                case 'color':
                    html = `
                        <div class="color-input-wrapper">
                            <input type="color" class="cell-input color-input" value="${value || '#ffffff'}" />
                            <span class="color-value">${value || '#ffffff'}</span>
                        </div>
                    `;
                    break;
                case 'number':
                    html = `<input type="number" class="cell-input" value="${value}" min="0" max="10" />`;
                    break;
                default:
                    html = `<input type="text" class="cell-input" value="${this.escapeHtml(value)}" />`;
                    break;
            }
            console.log(`Generated HTML: ${html}`);
            return html;
        }

        /**
         * セル値をフォーマット
         * @param {*} value - セル値
         * @param {Object} column - カラム定義
         * @returns {string} フォーマット済み値
         */
        formatCellValue(value, column) {
            switch (column.type) {
                case 'boolean':
                    return value ? '✅' : '❌';
                case 'color':
                    return `
                        <div class="color-display">
                            <div class="color-swatch" style="background-color: ${value || '#ffffff'}"></div>
                            <span class="color-text">${value || ''}</span>
                        </div>
                    `;
                default:
                    return this.escapeHtml(value);
            }
        }

        /**
         * カラム表示パネルを構築
         */
        buildColumnVisibilityPanel() {
            const panel = this.container.querySelector('.column-visibility-panel');
            const groupsContainer = panel.querySelector('.column-groups');
            
            // グループ別にカラムを整理
            const groups = {
                team: { titleKey: 'groups.team', columns: [] },
                pic: { titleKey: 'groups.pic', columns: [] },
                supplemental: { titleKey: 'groups.supplemental', columns: [] }
            };
            
            this.columns.forEach(column => {
                if (groups[column.group]) {
                    groups[column.group].columns.push(column);
                }
            });
            
            // グループごとにチェックボックスを作成
            Object.entries(groups).forEach(([groupKey, group]) => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'column-group';
                groupDiv.innerHTML = `
                    <h4 class="group-title">${this.t(group.titleKey)}</h4>
                    <div class="group-columns"></div>
                `;
                
                const columnsContainer = groupDiv.querySelector('.group-columns');
                group.columns.forEach(column => {
                    const checkbox = document.createElement('label');
                    checkbox.className = 'column-checkbox';
                    checkbox.innerHTML = `
                        <input type="checkbox" data-column="${column.id}" 
                               ${this.columnVisibility.get(column.id) ? 'checked' : ''} />
                        <span class="checkbox-label">${this.t(column.titleKey)}</span>
                    `;
                    columnsContainer.appendChild(checkbox);
                });
                
                groupsContainer.appendChild(groupDiv);
            });
        }

        /**
         * イベントリスナーを設定
         */
        setupEventListeners() {
            const container = this.container;
            
            // ツールバーイベント
            container.querySelector('.add-row').addEventListener('click', () => this.addRow());
            container.querySelector('.delete-selected').addEventListener('click', () => this.deleteSelected());
            container.querySelector('.search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
            container.querySelector('.clear-search').addEventListener('click', () => this.clearSearch());
            container.querySelector('.column-visibility').addEventListener('click', () => this.toggleColumnVisibilityPanel());
            container.querySelector('.export-data').addEventListener('click', () => this.exportData());
            container.querySelector('.apply-changes').addEventListener('click', () => this.applyChanges());
            
            // ページネーションイベント
            container.querySelector('.prev-page').addEventListener('click', () => this.previousPage());
            container.querySelector('.next-page').addEventListener('click', () => this.nextPage());
            container.querySelector('.page-size').addEventListener('change', (e) => this.changePageSize(e.target.value));
            
            // 全選択イベント
            const selectAllCheckbox = container.querySelector('.select-all');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    console.log('Select all clicked:', e.target.checked);
                    this.selectAll(e.target.checked);
                });
            }
            
            // セル編集イベント（イベント委任）
            container.addEventListener('change', (e) => {
                console.log('Change event triggered on:', e.target.tagName, e.target.className);
                if (e.target.classList.contains('cell-input')) {
                    console.log('Cell input changed:', e.target.value, 'Type:', e.target.type);
                    console.log('Before handleCellEdit - current value:', e.target.value);
                    this.handleCellEdit(e.target);
                    console.log('After handleCellEdit - current value:', e.target.value);
                }
                if (e.target.classList.contains('row-select')) {
                    this.handleRowSelect(e.target);
                }
            });
            
            // セル編集のためのinputイベントも追加
            container.addEventListener('input', (e) => {
                console.log('Input event triggered on:', e.target.tagName, e.target.className);
                if (e.target.classList.contains('cell-input') && e.target.type !== 'checkbox') {
                    console.log('Cell input event:', e.target.value, 'Type:', e.target.type);
                    // リアルタイム更新のためのデバウンス処理は省略し、changeイベントで処理
                }
            });
            
            // blur イベントも追加
            container.addEventListener('blur', (e) => {
                console.log('Blur event triggered on:', e.target.tagName, e.target.className);
                if (e.target.classList.contains('cell-input')) {
                    console.log('Cell input blur:', e.target.value, 'Type:', e.target.type);
                }
            }, true);
            
            // カラム表示パネルイベント
            const panel = container.querySelector('.column-visibility-panel');
            panel.querySelector('.close-panel').addEventListener('click', () => this.toggleColumnVisibilityPanel());
            panel.querySelector('.show-all').addEventListener('click', () => this.showAllColumns());
            panel.querySelector('.hide-all').addEventListener('click', () => this.hideAllColumns());
            panel.querySelector('.reset-defaults').addEventListener('click', () => this.resetColumnDefaults());
            
            panel.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox' && e.target.dataset.column) {
                    this.toggleColumnVisibility(e.target.dataset.column, e.target.checked);
                }
            });
            
            // ドラッグ&ドロップイベント（イベント委任）
            if (this.options.enableDragDrop) {
                container.addEventListener('dragstart', (e) => {
                    if (e.target.closest('.data-row')) {
                        this.handleDragStart(e);
                    }
                });
                
                container.addEventListener('dragover', (e) => {
                    if (e.target.closest('.data-row')) {
                        this.handleDragOver(e);
                    }
                });
                
                container.addEventListener('dragleave', (e) => {
                    if (e.target.closest('.data-row')) {
                        this.handleDragLeave(e);
                    }
                });
                
                container.addEventListener('drop', (e) => {
                    if (e.target.closest('.data-row')) {
                        this.handleDrop(e);
                    }
                });
                
                container.addEventListener('dragend', (e) => {
                    if (e.target.closest('.data-row')) {
                        this.handleDragEnd(e);
                    }
                });
            }
        }

        /**
         * ソート処理
         * @param {string} columnId - カラムID
         */
        handleSort(columnId) {
            if (this.sortConfig.column === columnId) {
                this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortConfig.column = columnId;
                this.sortConfig.direction = 'asc';
            }
            
            const column = this.columns.find(col => col.id === columnId);
            this.filteredData.sort((a, b) => {
                let aVal = a[column.key] || '';
                let bVal = b[column.key] || '';
                
                if (column.type === 'number') {
                    aVal = parseFloat(aVal) || 0;
                    bVal = parseFloat(bVal) || 0;
                } else {
                    aVal = aVal.toString().toLowerCase();
                    bVal = bVal.toString().toLowerCase();
                }
                
                let result = 0;
                if (aVal < bVal) result = -1;
                else if (aVal > bVal) result = 1;
                
                return this.sortConfig.direction === 'desc' ? -result : result;
            });
            
            this.currentPage = 1;
            this.renderHeader();
            this.renderTable();
        }

        /**
         * 検索処理
         * @param {string} searchTerm - 検索語
         */
        handleSearch(searchTerm) {
            if (!searchTerm.trim()) {
                this.filteredData = [...this.data];
            } else {
                const term = searchTerm.toLowerCase();
                this.filteredData = this.data.filter(row => {
                    return this.columns.some(column => {
                        const value = row[column.key];
                        return value && value.toString().toLowerCase().includes(term);
                    });
                });
            }
            
            this.currentPage = 1;
            this.renderTable();
        }

        /**
         * セル編集処理
         * @param {HTMLElement} input - 入力要素
         */
        handleCellEdit(input) {
            try {
                // 無限ループ防止
                if (input.dataset.editing === 'true') {
                    console.log('Skipping handleCellEdit - already being processed');
                    return;
                }
                input.dataset.editing = 'true';
                
                const cell = input.closest('.data-cell');
                const rowIndex = parseInt(cell.dataset.index);
                const columnId = cell.dataset.column;
                const column = this.columns.find(col => col.id === columnId);
                
                console.log('Cell edit:', { rowIndex, columnId, column: column?.key });
                
                if (!column) {
                    console.error('Column not found:', columnId);
                    input.dataset.editing = 'false';
                    return;
                }
                
                let newValue = input.value;
                if (column.type === 'boolean') {
                    newValue = input.checked;
                } else if (column.type === 'number') {
                    newValue = parseFloat(newValue) || 0;
                }
                
                console.log('New value:', newValue);
                
                // バリデーション実行
                const validationResult = this.validateCellValue(newValue, column, rowIndex);
                
                // フィルタされたデータから対応する行を見つける
                const pageStart = this.options.pageSize === 'all' ? 0 : (this.currentPage - 1) * this.options.pageSize;
                const actualRowIndex = pageStart + rowIndex;
                
                // データを更新
                if (this.filteredData[actualRowIndex]) {
                    this.filteredData[actualRowIndex][column.key] = newValue;
                    console.log('Updated filtered data:', this.filteredData[actualRowIndex]);
                    
                    // 元データも更新
                    const originalDataRow = this.data.find(row => row.id === this.filteredData[actualRowIndex].id);
                    if (originalDataRow) {
                        originalDataRow[column.key] = newValue;
                        console.log('Updated original data:', originalDataRow);
                    }
                }
                
                // バリデーション結果を反映
                this.applyValidationResult(cell, rowIndex, columnId, validationResult);
                
                // Dirty状態を設定
                this.setDirtyState(true);
                
                // バリデーション実行（非同期）
                setTimeout(() => {
                    this.validateAllData();
                }, 100);
                
                // 変更イベントを発火
                this.container.dispatchEvent(new CustomEvent('dataChanged', {
                    detail: { 
                        rowIndex: actualRowIndex, 
                        columnId, 
                        newValue,
                        data: this.data,
                        validation: validationResult
                    }
                }));
                
                console.log('Cell edit completed successfully');
                
                // 無限ループ防止フラグをリセット
                input.dataset.editing = 'false';
                
            } catch (error) {
                console.error('Cell edit error:', error);
                // エラー時もフラグをリセット
                if (input) {
                    input.dataset.editing = 'false';
                }
            }
        }

        /**
         * ドラッグ開始処理
         * @param {DragEvent} e - ドラッグイベント
         */
        handleDragStart(e) {
            const row = e.target.closest('tr');
            const dragHandle = e.target.closest('.drag-handle');
            
            // ドラッグハンドル以外からのドラッグは無効にする（オプション）
            // if (this.options.enableDragDrop && !dragHandle) {
            //     e.preventDefault();
            //     return;
            // }
            
            if (row && row.dataset.index !== undefined) {
                const index = parseInt(row.dataset.index);
                e.dataTransfer.setData('text/plain', index.toString());
                e.dataTransfer.effectAllowed = 'move';
                row.classList.add('dragging');
                
                // ドラッグ画像をカスタマイズ（オプション）
                if (dragHandle) {
                    const dragImage = row.cloneNode(true);
                    dragImage.style.opacity = '0.8';
                    dragImage.style.transform = 'rotate(3deg)';
                    document.body.appendChild(dragImage);
                    e.dataTransfer.setDragImage(dragImage, 0, 0);
                    setTimeout(() => document.body.removeChild(dragImage), 0);
                }
                
                console.log('Drag started for row index:', index);
            }
        }

        /**
         * ドラッグオーバー処理
         * @param {DragEvent} e - ドラッグイベント
         */
        handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const row = e.target.closest('tr');
            if (row && row.classList.contains('data-row')) {
                // 既存のdrop-targetクラスをクリア
                this.container.querySelectorAll('.drop-target').forEach(el => {
                    el.classList.remove('drop-target');
                });
                row.classList.add('drop-target');
            }
        }

        /**
         * ドラッグリーブ処理
         * @param {DragEvent} e - ドラッグイベント
         */
        handleDragLeave(e) {
            const row = e.target.closest('tr');
            if (row) {
                row.classList.remove('drop-target');
            }
        }

        /**
         * ドロップ処理
         * @param {DragEvent} e - ドロップイベント
         */
        handleDrop(e) {
            e.preventDefault();
            
            const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const dropRow = e.target.closest('tr');
            
            if (dropRow && dropRow.dataset.index !== undefined) {
                const dropIndex = parseInt(dropRow.dataset.index);
                
                console.log('Drop event - dragIndex:', dragIndex, 'dropIndex:', dropIndex);
                
                if (dragIndex !== dropIndex && !isNaN(dragIndex) && !isNaN(dropIndex)) {
                    this.moveRow(dragIndex, dropIndex);
                }
            }
            
            // クリーンアップ
            this.cleanupDragState();
        }

        /**
         * ドラッグ終了処理
         * @param {DragEvent} e - ドラッグイベント
         */
        handleDragEnd(e) {
            this.cleanupDragState();
        }

        /**
         * ドラッグ状態をクリーンアップ
         */
        cleanupDragState() {
            this.container.querySelectorAll('.dragging, .drop-target').forEach(el => {
                el.classList.remove('dragging', 'drop-target');
            });
        }

        /**
         * 行を移動
         * @param {number} fromIndex - 移動元インデックス
         * @param {number} toIndex - 移動先インデックス
         */
        moveRow(fromIndex, toIndex) {
            console.log(`Moving row from ${fromIndex} to ${toIndex}`);
            
            // フィルタデータの範囲チェック
            if (fromIndex < 0 || fromIndex >= this.filteredData.length || 
                toIndex < 0 || toIndex >= this.filteredData.length) {
                console.error('Invalid row indices for move operation');
                return;
            }
            
            // 移動前の状態をログ
            console.log('Before move - filteredData length:', this.filteredData.length);
            console.log('Moving item:', this.filteredData[fromIndex]);
            
            // 行を移動
            const item = this.filteredData.splice(fromIndex, 1)[0];
            this.filteredData.splice(toIndex, 0, item);
            
            // 元データも更新（フィルタが適用されていない場合）
            if (this.filteredData.length === this.data.length) {
                this.data = [...this.filteredData];
            }
            
            console.log('After move - filteredData length:', this.filteredData.length);
            
            // テーブルを再描画
            this.renderTable();
            
            // 移動イベントを発火
            this.container.dispatchEvent(new CustomEvent('rowMoved', {
                detail: { fromIndex, toIndex, data: this.data }
            }));
            
            console.log('Row move completed successfully');
        }

        /**
         * 新しい行を追加
         */
        addRow() {
            const newRow = {};
            this.columns.forEach(column => {
                newRow[column.key] = column.type === 'boolean' ? false : '';
            });
            
            this.data.push(newRow);
            this.filteredData = [...this.data];
            this.renderTable();
            
            // 追加イベントを発火
            this.container.dispatchEvent(new CustomEvent('rowAdded', {
                detail: { row: newRow, data: this.data }
            }));
        }

        /**
         * 選択された行を削除
         */
        deleteSelected() {
            const selectedIndices = Array.from(this.selectedRows).sort((a, b) => b - a);
            
            selectedIndices.forEach(index => {
                this.data.splice(index, 1);
            });
            
            this.filteredData = [...this.data];
            this.selectedRows.clear();
            this.renderTable();
            
            // 削除イベントを発火
            this.container.dispatchEvent(new CustomEvent('rowsDeleted', {
                detail: { deletedIndices: selectedIndices, data: this.data }
            }));
        }

        /**
         * 行選択処理
         * @param {HTMLElement} checkbox - チェックボックス要素
         */
        handleRowSelect(checkbox) {
            const index = parseInt(checkbox.dataset.index);
            if (checkbox.checked) {
                this.selectedRows.add(index);
            } else {
                this.selectedRows.delete(index);
            }
            this.updateToolbar();
        }

        /**
         * 検索をクリア
         */
        clearSearch() {
            const searchInput = this.container.querySelector('.search-input');
            if (searchInput) {
                searchInput.value = '';
                this.handleSearch('');
            }
        }

        /**
         * 全選択/全解除
         * @param {boolean} selectAll - 選択フラグ
         */
        selectAll(selectAll) {
            console.log('SelectAll function called with:', selectAll);
            this.selectedRows.clear();
            
            const checkboxes = this.container.querySelectorAll('.row-select');
            console.log('Found checkboxes:', checkboxes.length);
            
            checkboxes.forEach((checkbox, index) => {
                checkbox.checked = selectAll;
                if (selectAll) {
                    // データインデックスを使用
                    const dataIndex = parseInt(checkbox.dataset.index);
                    this.selectedRows.add(dataIndex);
                    console.log('Selected row:', dataIndex);
                }
            });
            
            console.log('Selected rows:', this.selectedRows);
            this.updateToolbar();
        }

        /**
         * すべての列を表示
         */
        showAllColumns() {
            this.columns.forEach(column => {
                this.columnVisibility.set(column.id, true);
            });
            this.renderHeader();
            this.renderTable();
            this.updateColumnVisibilityPanel();
        }

        /**
         * すべての列を非表示（必須列は除く）
         */
        hideAllColumns() {
            this.columns.forEach(column => {
                // 必須列（teamName, picName）は非表示にしない
                if (!column.required) {
                    this.columnVisibility.set(column.id, false);
                }
            });
            this.renderHeader();
            this.renderTable();
            this.updateColumnVisibilityPanel();
        }

        /**
         * 列表示をデフォルトに戻す
         */
        resetColumnDefaults() {
            this.columns.forEach(column => {
                this.columnVisibility.set(column.id, column.visible);
            });
            this.renderHeader();
            this.renderTable();
            this.updateColumnVisibilityPanel();
        }

        /**
         * 列表示パネルを更新
         */
        updateColumnVisibilityPanel() {
            const panel = this.container.querySelector('.column-visibility-panel');
            const checkboxes = panel.querySelectorAll('input[type="checkbox"]');
            
            checkboxes.forEach(checkbox => {
                const columnId = checkbox.dataset.column;
                if (columnId) {
                    checkbox.checked = this.columnVisibility.get(columnId);
                }
            });
        }

        /**
         * 前のページへ
         */
        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTable();
            }
        }

        /**
         * 次のページへ
         */
        nextPage() {
            const totalPages = this.options.pageSize === 'all' ? 1 : Math.ceil(this.filteredData.length / this.options.pageSize);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTable();
            }
        }

        /**
         * ページサイズを変更
         * @param {string|number} size - ページサイズ
         */
        changePageSize(size) {
            this.options.pageSize = size === 'all' ? 'all' : parseInt(size);
            this.currentPage = 1;
            this.renderTable();
        }

        /**
         * カラム表示設定パネルを切り替え
         */
        toggleColumnVisibilityPanel() {
            const panel = this.container.querySelector('.column-visibility-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }

        /**
         * カラム表示を切り替え
         * @param {string} columnId - カラムID
         * @param {boolean} visible - 表示フラグ
         */
        toggleColumnVisibility(columnId, visible) {
            this.columnVisibility.set(columnId, visible);
            this.renderHeader();
            this.renderTable();
        }

        /**
         * フッターを更新
         */
        updateFooter() {
            const totalRows = this.filteredData.length;
            const totalPages = this.options.pageSize === 'all' ? 1 : Math.ceil(totalRows / this.options.pageSize);
            
            this.container.querySelector('.total-rows').textContent = totalRows;
            this.container.querySelector('.current-page').textContent = this.currentPage;
            this.container.querySelector('.total-pages').textContent = totalPages;
            
            this.container.querySelector('.prev-page').disabled = this.currentPage <= 1;
            this.container.querySelector('.next-page').disabled = this.currentPage >= totalPages;
        }

        /**
         * ツールバーを更新
         */
        updateToolbar() {
            const deleteBtn = this.container.querySelector('.delete-selected');
            deleteBtn.disabled = this.selectedRows.size === 0;
        }

        /**
         * データをエクスポート
         */
        exportData() {
            // エクスポート機能の実装（CSV形式）
            const headers = this.columns
                .filter(col => this.columnVisibility.get(col.id))
                .map(col => this.t(col.titleKey));
            
            const csvContent = [
                headers.join(','),
                ...this.filteredData.map(row => 
                    this.columns
                        .filter(col => this.columnVisibility.get(col.id))
                        .map(col => `"${(row[col.key] || '').toString().replace(/"/g, '""')}"`)
                        .join(',')
                )
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'organization_data.csv';
            link.click();
        }

        /**
         * 翻訳関数
         * @param {string} key - 翻訳キー
         * @returns {string} 翻訳されたテキスト
         */
        t(key) {
            // 直接ConfigModuleのt関数を使用
            if (window.ConfigModule && window.ConfigModule.t) {
                return window.ConfigModule.t(key);
            }
            
            // フォールバック翻訳
            const fallbackTranslations = {
                'table.addRow': '新規行追加',
                'table.deleteSelected': '選択行削除',
                'table.applyChanges': '変更を適用',
                'table.rows': '行',
                'table.search': '検索',
                'table.clear': 'クリア',
                'table.clearSearch': '検索クリア',
                'table.columns': '列',
                'table.columnVisibility': '列表示設定',
                'table.export': 'エクスポート',
                'table.previous': '前へ',
                'table.next': '次へ',
                'table.rowsPerPage': '表示行数',
                'table.all': 'すべて',
                'table.selectAll': 'すべて選択',
                'table.showAll': 'すべて表示',
                'table.hideAll': 'すべて非表示',
                'table.resetDefaults': 'デフォルトに戻す',
                'table.dragToReorder': 'ドラッグして並び替え',
                'table.ready': '準備完了',
                'table.errors': 'エラー',
                'table.warnings': '警告',
                'table.validating': '検証中...',
                'table.modified': '変更済み',
                'table.saved': '保存済み',
                'validation.required': 'この項目は必須です',
                'validation.invalidNumber': '数値を入力してください',
                'validation.invalidLevel': 'レベルは1-10の範囲で入力してください',
                'validation.duplicateTeamName': 'チーム名が重複しています',
                'validation.parentNotFound': '上位チームが見つかりません',
                'validation.circularReference': '循環参照が発生しています',
                'validation.levelHierarchy': 'レベルが上位チームより高くなっています',
                'validation.multipleBosses': '1チームに複数のボスが存在します',
                'groups.team': 'チーム情報',
                'groups.pic': 'PIC情報',
                'groups.supplemental': '補足情報',
                'columns.level': 'レベル',
                'columns.teamName': 'チーム名',
                'columns.exactTeamName': '正式チーム名',
                'columns.upperTeam': '上位チーム',
                'columns.teamId': 'チームID',
                'columns.role': '役職',
                'columns.role2ndLang': '役職（第2言語）',
                'columns.teamBoss': 'チーム長',
                'columns.picName': '担当者名',
                'columns.picName2ndLang': '担当者名（第2言語）',
                'columns.concurrent': '兼任',
                'columns.employeeCd': '社員番号',
                'columns.grade': '等級',
                'columns.memo': 'メモ',
                'columns.borderColor': '枠線色',
                'columns.headerBgColor': 'ヘッダー背景色',
                'columns.headerTextColor': 'ヘッダー文字色'
            };
            
            return fallbackTranslations[key] || key;
        }

        /**
         * HTMLエスケープ
         * @param {string} str - エスケープする文字列
         * @returns {string} エスケープされた文字列
         */
        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        // === バリデーション関数群 ===

        /**
         * セル値をバリデーション
         * @param {*} value - バリデーション対象の値
         * @param {Object} column - カラム定義
         * @param {number} rowIndex - 行インデックス
         * @returns {Object} バリデーション結果
         */
        validateCellValue(value, column, rowIndex) {
            console.log(`🔍 Validating cell: row ${rowIndex + 1}, column ${column.id}, value: "${value}", type: ${typeof value}`);
            
            const result = {
                isValid: true,
                errors: [],
                warnings: []
            };

            // 必須フィールドチェック
            if (column.required && (!value || value.toString().trim() === '')) {
                console.log(`❌ Required field validation failed for ${column.id}`);
                result.isValid = false;
                result.errors.push(this.t('validation.required'));
            }

            // 型別バリデーション
            switch (column.type) {
                case 'number':
                    if (value && isNaN(value)) {
                        console.log(`❌ Number validation failed for ${column.id}: "${value}"`);
                        result.isValid = false;
                        result.errors.push(this.t('validation.invalidNumber'));
                    }
                    break;
            }

            // 列別バリデーション
            switch (column.id) {
                case 'level':
                    if (value && (value < 1 || value > 10)) {
                        result.isValid = false;
                        result.errors.push(this.t('validation.invalidLevel'));
                    }
                    break;
                    
                case 'teamName':
                    // チーム名重複チェック
                    const duplicateCount = this.data.filter((row, index) => 
                        index !== rowIndex && row.teamName === value
                    ).length;
                    
                    if (duplicateCount > 0) {
                        result.warnings.push(this.t('validation.duplicateTeamName'));
                    }
                    break;
                    
                case 'upperTeam':
                    console.log(`🔍 Validating upperTeam: "${value}"`);
                    // 上位チーム存在チェック
                    if (value && value !== 'N/A') {
                        const parentRow = this.data.find(row => row.teamName === value);
                        console.log(`🔍 Parent row found:`, parentRow);
                        if (!parentRow) {
                            console.log(`⚠️ Parent team not found: "${value}"`);
                            result.warnings.push(this.t('validation.parentNotFound'));
                        } else {
                            // レベル階層チェック（親レベルは子レベルより小さくなければならない）
                            const currentRow = this.data[rowIndex];
                            console.log(`🔍 Level hierarchy check: parent level ${parentRow.level} vs current level ${currentRow.level}`);
                            
                            // 正しい階層：parent.level < current.level (1 < 2, 2 < 3, etc.)
                            // エラー条件：parent.level >= current.level (同じレベルまたは逆転)
                            if (currentRow && currentRow.level && parentRow.level >= currentRow.level) {
                                console.log(`❌ Level hierarchy violation: parent ${parentRow.level} >= current ${currentRow.level} (should be parent < current)`);
                                result.isValid = false;
                                result.errors.push(this.t('validation.levelHierarchy'));
                            } else if (currentRow && currentRow.level) {
                                console.log(`✅ Level hierarchy OK: parent ${parentRow.level} < current ${currentRow.level}`);
                            }
                        }
                    }
                    break;
            }

            return result;
        }

        /**
         * 全データをバリデーション
         */
        validateAllData() {
            console.log('🔄 validateAllData started');
            if (this.isValidating) return;
            
            this.isValidating = true;
            this.updateStatus('validating', this.t('table.validating'));
            
            console.log(`🔍 Data to validate:`, this.data);
            console.log(`🔍 Columns to check:`, this.columns.map(c => ({ id: c.id, key: c.key, required: c.required })));
            
            // バリデーション結果をクリア
            this.validationErrors.clear();
            this.validationWarnings.clear();
            
            let totalErrors = 0;
            let totalWarnings = 0;
            
            // 各行・各列をバリデーション
            this.data.forEach((row, rowIndex) => {
                console.log(`🔍 Validating row ${rowIndex + 1}:`, row);
                this.columns.forEach(column => {
                    const value = row[column.key];
                    const result = this.validateCellValue(value, column, rowIndex);
                    
                    if (!result.isValid || result.errors.length > 0) {
                        console.log(`❌ Errors found in row ${rowIndex + 1}, column ${column.id}:`, result.errors);
                        if (!this.validationErrors.has(rowIndex)) {
                            this.validationErrors.set(rowIndex, {});
                        }
                        this.validationErrors.get(rowIndex)[column.id] = result.errors.join(', ');
                        totalErrors += result.errors.length;
                    }
                    
                    if (result.warnings.length > 0) {
                        console.log(`⚠️ Warnings found in row ${rowIndex + 1}, column ${column.id}:`, result.warnings);
                        if (!this.validationWarnings.has(rowIndex)) {
                            this.validationWarnings.set(rowIndex, {});
                        }
                        this.validationWarnings.get(rowIndex)[column.id] = result.warnings.join(', ');
                        totalWarnings += result.warnings.length;
                    }
                });
            });
            
            // 循環参照チェック
            this.checkCircularReferences();
            
            // 複数ボスチェック
            this.checkMultipleBosses();
            
            // バリデーション結果を表示に反映
            this.updateValidationDisplay();
            
            // ステータス更新
            if (totalErrors > 0) {
                this.updateStatus('error', `${totalErrors} ${this.t('table.errors')}`);
            } else if (totalWarnings > 0) {
                this.updateStatus('warning', `${totalWarnings} ${this.t('table.warnings')}`);
            } else if (this.isDirty) {
                this.updateStatus('warning', this.t('table.modified'));
            } else {
                this.updateStatus('success', this.t('table.ready'));
            }
            
            this.isValidating = false;
        }

        /**
         * 複数ボスをチェック
         */
        checkMultipleBosses() {
            // チーム別にボス数をカウント
            const teamBossCount = new Map();
            
            this.data.forEach((row, rowIndex) => {
                if (row.teamBoss === true || row.teamBoss === 'Y') {
                    const teamName = row.teamName;
                    if (!teamBossCount.has(teamName)) {
                        teamBossCount.set(teamName, []);
                    }
                    teamBossCount.get(teamName).push(rowIndex);
                }
            });
            
            // 複数ボスがいるチームのエラーを設定
            teamBossCount.forEach((indices, teamName) => {
                if (indices.length > 1) {
                    indices.forEach(rowIndex => {
                        if (!this.validationErrors.has(rowIndex)) {
                            this.validationErrors.set(rowIndex, {});
                        }
                        this.validationErrors.get(rowIndex)['teamBoss'] = this.t('validation.multipleBosses');
                    });
                }
            });
        }

        /**
         * 循環参照をチェック
         */
        checkCircularReferences() {
            const visited = new Set();
            const recursionStack = new Set();
            
            const findRowIndex = (teamName) => {
                return this.data.findIndex(row => row.teamName === teamName);
            };
            
            const hasCycle = (teamName, path = []) => {
                const rowIndex = findRowIndex(teamName);
                if (rowIndex === -1) return false;
                
                if (recursionStack.has(teamName)) {
                    // 循環参照発見
                    const cycleStart = path.indexOf(teamName);
                    const cyclePath = path.slice(cycleStart).concat([teamName]);
                    
                    cyclePath.forEach(name => {
                        const idx = findRowIndex(name);
                        if (idx !== -1) {
                            if (!this.validationErrors.has(idx)) {
                                this.validationErrors.set(idx, {});
                            }
                            this.validationErrors.get(idx)['upperTeam'] = this.t('validation.circularReference');
                        }
                    });
                    return true;
                }
                
                if (visited.has(teamName)) return false;
                
                visited.add(teamName);
                recursionStack.add(teamName);
                
                const row = this.data[rowIndex];
                if (row.upperTeam && row.upperTeam !== 'N/A') {
                    if (hasCycle(row.upperTeam, path.concat([teamName]))) {
                        return true;
                    }
                }
                
                recursionStack.delete(teamName);
                return false;
            };
            
            this.data.forEach(row => {
                if (!visited.has(row.teamName)) {
                    hasCycle(row.teamName);
                }
            });
        }

        /**
         * バリデーション結果をセルに適用
         * @param {HTMLElement} cell - セル要素
         * @param {number} rowIndex - 行インデックス
         * @param {string} columnId - カラムID
         * @param {Object} validationResult - バリデーション結果
         */
        applyValidationResult(cell, rowIndex, columnId, validationResult) {
            // 既存のバリデーションクラスを削除
            cell.classList.remove('validation-error', 'validation-warning');
            
            // 新しいバリデーション結果を適用
            if (!validationResult.isValid || validationResult.errors.length > 0) {
                cell.classList.add('validation-error');
                this.showValidationTooltip(cell, validationResult.errors.join(', '));
            } else if (validationResult.warnings.length > 0) {
                cell.classList.add('validation-warning');
                this.showValidationTooltip(cell, validationResult.warnings.join(', '));
            }
        }

        /**
         * バリデーション表示を更新
         */
        updateValidationDisplay() {
            // 現在表示されている行のバリデーション結果を適用
            const rows = this.container.querySelectorAll('.data-row');
            rows.forEach((row, index) => {
                const rowIndex = parseInt(row.dataset.index);
                
                this.columns.forEach(column => {
                    const cell = row.querySelector(`.cell-${column.id}`);
                    if (cell) {
                        cell.classList.remove('validation-error', 'validation-warning');
                        
                        const errors = this.validationErrors.get(rowIndex)?.[column.id];
                        const warnings = this.validationWarnings.get(rowIndex)?.[column.id];
                        
                        if (errors) {
                            cell.classList.add('validation-error');
                        } else if (warnings) {
                            cell.classList.add('validation-warning');
                        }
                    }
                });
            });
            
            // エラーカウントを更新
            const totalErrors = Array.from(this.validationErrors.values())
                .reduce((sum, errors) => sum + Object.keys(errors).length, 0);
            
            const validationSummary = this.container.querySelector('.validation-summary');
            const errorCount = this.container.querySelector('.error-count');
            
            if (validationSummary && errorCount) {
                if (totalErrors > 0) {
                    errorCount.textContent = totalErrors;
                    validationSummary.style.display = 'flex';
                } else {
                    validationSummary.style.display = 'none';
                }
            }
        }

        /**
         * バリデーションツールチップを表示
         * @param {HTMLElement} cell - セル要素
         * @param {string} message - メッセージ
         */
        showValidationTooltip(cell, message) {
            // 既存のツールチップを削除
            const existingTooltip = cell.querySelector('.validation-tooltip');
            if (existingTooltip) {
                existingTooltip.remove();
            }
            
            // 新しいツールチップを作成
            const tooltip = document.createElement('div');
            tooltip.className = 'validation-tooltip';
            tooltip.textContent = message;
            tooltip.style.display = 'none';
            
            cell.appendChild(tooltip);
            
            // ホバーイベントを設定
            cell.addEventListener('mouseenter', () => {
                tooltip.style.display = 'block';
            });
            
            cell.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        }

        /**
         * ステータスを更新
         * @param {string} type - ステータスタイプ (success, warning, error, info)
         * @param {string} message - メッセージ
         */
        updateStatus(type, message) {
            const statusIcon = this.container.querySelector('.status-icon');
            const statusText = this.container.querySelector('.status-text');
            const statusInfo = this.container.querySelector('.status-info');
            
            if (!statusIcon || !statusText || !statusInfo) {
                console.warn('Status elements not found in container');
                return;
            }
            
            // 既存のステータスクラスを削除
            statusInfo.className = 'status-info';
            
            // アイコンとメッセージを更新
            switch (type) {
                case 'success':
                    statusIcon.textContent = '✅';
                    statusInfo.classList.add('status-success');
                    break;
                case 'warning':
                    statusIcon.textContent = '⚠️';
                    statusInfo.classList.add('status-warning');
                    break;
                case 'error':
                    statusIcon.textContent = '❌';
                    statusInfo.classList.add('status-error');
                    break;
                case 'validating':
                    statusIcon.textContent = '🔄';
                    statusInfo.classList.add('status-info-icon');
                    break;
                default:
                    statusIcon.textContent = 'ℹ️';
                    statusInfo.classList.add('status-info-icon');
                    break;
            }
            
            statusText.textContent = message;
            console.log(`Status updated: ${type} - ${message}`);
        }

        /**
         * Dirty状態を設定
         * @param {boolean} isDirty - Dirty状態
         */
        setDirtyState(isDirty) {
            this.isDirty = isDirty;
            
            if (isDirty) {
                // データ変更イベントを発火
                this.container.dispatchEvent(new CustomEvent('dataModified', {
                    detail: { isDirty: true, data: this.data }
                }));
            }
        }

        /**
         * バリデーション結果を取得
         * @returns {Object} バリデーション結果サマリー
         */
        getValidationSummary() {
            const totalErrors = Array.from(this.validationErrors.values())
                .reduce((sum, errors) => sum + Object.keys(errors).length, 0);
            
            const totalWarnings = Array.from(this.validationWarnings.values())
                .reduce((sum, warnings) => sum + Object.keys(warnings).length, 0);
            
            return {
                isValid: totalErrors === 0,
                hasWarnings: totalWarnings > 0,
                totalErrors,
                totalWarnings,
                errors: this.validationErrors,
                warnings: this.validationWarnings,
                isDirty: this.isDirty
            };
        }

        /**
         * 変更を適用（バリデーション結果表示）
         */
        applyChanges() {
            console.log('🔄 applyChanges called');
            
            try {
                // テーブルのDOM状態から現在のデータを読み取って更新
                console.log('🔄 Reading current table state...');
                this.readTableDataFromDOM();
                
                // 全データバリデーション実行
                console.log('🔄 Running validateAllData...');
                this.validateAllData();
                
                // バリデーション結果を取得
                console.log('🔄 Getting validation summary...');
                const validationSummary = this.getValidationSummary();
                console.log('🔄 Validation summary:', validationSummary);
                
                // バリデーション結果を表示
                console.log('🔄 Showing validation results...');
                this.showValidationResults(validationSummary);
                
                // 変更が成功した場合はDirtyフラグをクリア
                if (validationSummary.isValid) {
                    console.log('🔄 Data is valid, clearing dirty state');
                    this.setDirtyState(false);
                } else {
                    console.log('🔄 Data has validation issues');
                }
                
                console.log('🔄 applyChanges completed successfully');
                
            } catch (error) {
                console.error('🔄 Error in applyChanges:', error);
                alert(`バリデーション処理中にエラーが発生しました: ${error.message}`);
            }
        }

        /**
         * テーブルのDOM状態から現在のデータを読み取る
         */
        readTableDataFromDOM() {
            console.log('🔄 Reading table data from DOM...');
            
            const rows = this.container.querySelectorAll('.data-row');
            console.log(`Found ${rows.length} rows in DOM`);
            
            rows.forEach((row, displayIndex) => {
                const rowIndex = parseInt(row.dataset.index);
                const pageStart = this.options.pageSize === 'all' ? 0 : (this.currentPage - 1) * this.options.pageSize;
                const actualRowIndex = pageStart + rowIndex;
                
                console.log(`Processing row ${displayIndex}, rowIndex: ${rowIndex}, actualRowIndex: ${actualRowIndex}`);
                
                // 実際のデータ行を取得
                const dataRow = this.data[actualRowIndex] || this.filteredData[actualRowIndex];
                if (!dataRow) {
                    console.warn(`No data found for actualRowIndex: ${actualRowIndex}`);
                    return;
                }
                
                // 各セルの値を読み取る
                this.columns.forEach(column => {
                    const cell = row.querySelector(`[data-column="${column.id}"]`);
                    if (cell) {
                        const input = cell.querySelector('.cell-input');
                        if (input) {
                            let currentValue;
                            if (column.type === 'boolean') {
                                currentValue = input.checked;
                            } else if (column.type === 'number') {
                                currentValue = parseFloat(input.value) || 0;
                            } else {
                                currentValue = input.value;
                            }
                            
                            // データを更新
                            const oldValue = dataRow[column.key];
                            if (oldValue !== currentValue) {
                                console.log(`Updating ${column.key}: "${oldValue}" → "${currentValue}"`);
                                dataRow[column.key] = currentValue;
                                
                                // filteredDataも更新
                                if (this.filteredData[actualRowIndex]) {
                                    this.filteredData[actualRowIndex][column.key] = currentValue;
                                }
                                
                                // 元データも更新（IDが一致する行を探す）
                                const originalRow = this.data.find(row => row.id === dataRow.id);
                                if (originalRow && originalRow !== dataRow) {
                                    originalRow[column.key] = currentValue;
                                }
                            }
                        }
                    }
                });
            });
            
            console.log('🔄 Table data updated from DOM:', this.data);
        }

        /**
         * バリデーション結果を詳細表示
         * @param {Object} validationSummary - バリデーション結果サマリー
         */
        showValidationResults(validationSummary) {
            console.log('Validation Summary:', validationSummary);
            
            if (validationSummary.isValid && !validationSummary.hasWarnings) {
                const message = '✅ すべてのデータが正常です。\n\n🎉 データに問題はありません。組織図の生成が可能です。';
                this.updateStatus('success', this.t('table.ready'));
                this.showValidationModal(message, validationSummary, 'success');
                return;
            }

            // 詳細な結果表示を作成
            let htmlContent = this.createDetailedValidationReport(validationSummary);
            
            // モーダルで詳細表示
            this.showValidationModal(htmlContent, validationSummary, 'detailed');
        }

        /**
         * 詳細なバリデーション結果レポートを作成
         * @param {Object} validationSummary - バリデーション結果サマリー
         * @returns {string} HTML形式のレポート
         */
        createDetailedValidationReport(validationSummary) {
            let html = '<div class="validation-report">';
            
            // サマリー情報
            html += '<div class="validation-summary">';
            html += '<h4>📊 検証結果サマリー</h4>';
            html += '<div class="summary-stats">';
            html += `<div class="stat-item ${validationSummary.totalErrors > 0 ? 'error' : 'success'}">`;
            html += `<span class="icon">${validationSummary.totalErrors > 0 ? '❌' : '✅'}</span>`;
            html += `<span class="label">エラー:</span>`;
            html += `<span class="value">${validationSummary.totalErrors}件</span>`;
            html += '</div>';
            html += `<div class="stat-item ${validationSummary.totalWarnings > 0 ? 'warning' : 'success'}">`;
            html += `<span class="icon">${validationSummary.totalWarnings > 0 ? '⚠️' : '✅'}</span>`;
            html += `<span class="label">警告:</span>`;
            html += `<span class="value">${validationSummary.totalWarnings}件</span>`;
            html += '</div>';
            html += '</div>';
            html += '</div>';

            // エラー詳細
            if (validationSummary.totalErrors > 0) {
                html += '<div class="validation-section errors-section">';
                html += '<h4>❌ エラー詳細</h4>';
                html += '<div class="validation-items">';
                
                validationSummary.errors.forEach((errors, rowIndex) => {
                    const rowData = this.data[rowIndex];
                    const teamName = rowData?.teamName || 'N/A';
                    
                    Object.entries(errors).forEach(([columnId, errorMsg]) => {
                        const column = this.columns.find(col => col.id === columnId);
                        const columnTitle = column?.title || columnId;
                        const currentValue = rowData?.[column?.key] || '';
                        
                        html += '<div class="validation-item error-item">';
                        html += '<div class="item-header">';
                        html += `<span class="row-info">行 ${rowIndex + 1}</span>`;
                        html += `<span class="team-info">${teamName}</span>`;
                        html += `<span class="column-info">${columnTitle}</span>`;
                        html += '</div>';
                        html += '<div class="item-content">';
                        html += `<div class="error-message">${errorMsg}</div>`;
                        html += `<div class="current-value">現在の値: "${currentValue}"</div>`;
                        html += '</div>';
                        html += `<div class="item-action">`;
                        html += `<button class="btn-small goto-cell" data-row="${rowIndex}" data-column="${columnId}">セルに移動</button>`;
                        html += '</div>';
                        html += '</div>';
                    });
                });
                
                html += '</div>';
                html += '</div>';
            }

            // 警告詳細
            if (validationSummary.totalWarnings > 0) {
                html += '<div class="validation-section warnings-section">';
                html += '<h4>⚠️ 警告詳細</h4>';
                html += '<div class="validation-items">';
                
                validationSummary.warnings.forEach((warnings, rowIndex) => {
                    const rowData = this.data[rowIndex];
                    const teamName = rowData?.teamName || 'N/A';
                    
                    Object.entries(warnings).forEach(([columnId, warningMsg]) => {
                        const column = this.columns.find(col => col.id === columnId);
                        const columnTitle = column?.title || columnId;
                        const currentValue = rowData?.[column?.key] || '';
                        
                        html += '<div class="validation-item warning-item">';
                        html += '<div class="item-header">';
                        html += `<span class="row-info">行 ${rowIndex + 1}</span>`;
                        html += `<span class="team-info">${teamName}</span>`;
                        html += `<span class="column-info">${columnTitle}</span>`;
                        html += '</div>';
                        html += '<div class="item-content">';
                        html += `<div class="warning-message">${warningMsg}</div>`;
                        html += `<div class="current-value">現在の値: "${currentValue}"</div>`;
                        html += '</div>';
                        html += `<div class="item-action">`;
                        html += `<button class="btn-small goto-cell" data-row="${rowIndex}" data-column="${columnId}">セルに移動</button>`;
                        html += '</div>';
                        html += '</div>';
                    });
                });
                
                html += '</div>';
                html += '</div>';
            }

            // 解決策の提案
            html += '<div class="validation-section recommendations-section">';
            html += '<h4>💡 解決策の提案</h4>';
            html += '<div class="recommendations">';
            
            if (validationSummary.totalErrors > 0) {
                html += '<div class="recommendation error-rec">';
                html += '<strong>エラーの修正が必要です:</strong>';
                html += '<ul>';
                html += '<li>赤色でハイライトされたセルを確認してください</li>';
                html += '<li>「セルに移動」ボタンで問題のあるセルに直接移動できます</li>';
                html += '<li>エラーを修正後、再度「変更を適用」をクリックしてください</li>';
                html += '</ul>';
                html += '</div>';
            }
            
            if (validationSummary.totalWarnings > 0) {
                html += '<div class="recommendation warning-rec">';
                html += '<strong>警告の確認をお勧めします:</strong>';
                html += '<ul>';
                html += '<li>黄色でハイライトされたセルは確認が推奨されます</li>';
                html += '<li>警告は組織図生成を妨げませんが、データの整合性を確認してください</li>';
                html += '</ul>';
                html += '</div>';
            }
            
            html += '</div>';
            html += '</div>';

            html += '</div>'; // validation-report終了
            
            return html;
        }

        /**
         * バリデーション結果モーダルを表示
         * @param {string} content - 表示コンテンツ（HTMLまたはテキスト）
         * @param {Object} validationSummary - バリデーション結果サマリー
         * @param {string} type - 表示タイプ（'success', 'detailed'）
         */
        showValidationModal(content, validationSummary, type = 'detailed') {
            console.log('🔄 showValidationModal called with type:', type);
            console.log('Content length:', content.length);
            console.log('ValidationSummary:', validationSummary);
            
            // 既存のモーダルがあれば削除
            const existingModal = document.querySelector('.validation-modal');
            if (existingModal) {
                console.log('Removing existing modal');
                existingModal.remove();
            }
            
            // モーダル要素を作成
            const modal = document.createElement('div');
            modal.className = 'validation-modal';
            
            // コンテンツの種類に応じて表示を切り替え
            const isHTML = type === 'detailed';
            const bodyContent = isHTML ? content : `<pre>${this.escapeHtml(content)}</pre>`;
            
            console.log('Creating modal with isHTML:', isHTML);
            console.log('Body content preview:', bodyContent.substring(0, 200) + '...');
            
            modal.innerHTML = `
                <div class="validation-modal-content ${type}">
                    <div class="validation-modal-header">
                        <h3>📊 バリデーション結果</h3>
                        <button class="validation-modal-close" type="button">&times;</button>
                    </div>
                    <div class="validation-modal-body">
                        ${bodyContent}
                    </div>
                    <div class="validation-modal-footer">
                        <button class="btn btn-primary validation-modal-ok" type="button">OK</button>
                    </div>
                </div>
            `;
            
            // スタイルを追加
            const style = document.createElement('style');
            style.textContent = `
                .validation-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                .validation-modal-content {
                    background: white;
                    border-radius: 8px;
                    max-width: 800px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }
                .validation-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #ddd;
                    background: #f8f9fa;
                    border-radius: 8px 8px 0 0;
                }
                .validation-modal-header h3 {
                    margin: 0;
                    color: #333;
                }
                .validation-modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .validation-modal-close:hover {
                    color: #000;
                }
                .validation-modal-body {
                    padding: 20px;
                    white-space: pre-wrap;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .validation-modal-footer {
                    padding: 16px 20px;
                    border-top: 1px solid #ddd;
                    text-align: right;
                    background: #f8f9fa;
                    border-radius: 0 0 8px 8px;
                }
                .validation-modal-footer .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .validation-modal-footer .btn-primary {
                    background: #007bff;
                    color: white;
                }
                .validation-modal-footer .btn-primary:hover {
                    background: #0056b3;
                }
                
                /* 詳細レポート用スタイル */
                .validation-modal-content.detailed {
                    max-width: 900px;
                    width: 90vw;
                }
                .validation-modal-content.detailed .validation-modal-body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    white-space: normal;
                    max-height: 60vh;
                }
                .validation-report {
                    color: #333;
                }
                .validation-summary {
                    margin-bottom: 20px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 6px;
                }
                .summary-stats {
                    display: flex;
                    gap: 20px;
                    margin-top: 10px;
                }
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-weight: 500;
                }
                .stat-item.error {
                    background: #ffe6e6;
                    color: #d32f2f;
                }
                .stat-item.warning {
                    background: #fff3cd;
                    color: #f57c00;
                }
                .stat-item.success {
                    background: #e8f5e8;
                    color: #388e3c;
                }
                .validation-section {
                    margin-bottom: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    overflow: hidden;
                }
                .validation-section h4 {
                    margin: 0;
                    padding: 12px 16px;
                    background: #f5f5f5;
                    border-bottom: 1px solid #e0e0e0;
                }
                .validation-items {
                    padding: 0;
                }
                .validation-item {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 15px;
                }
                .validation-item:last-child {
                    border-bottom: none;
                }
                .validation-item.error-item {
                    background: #ffeaeb;
                    border-left: 4px solid #d32f2f;
                }
                .validation-item.warning-item {
                    background: #fffbf0;
                    border-left: 4px solid #f57c00;
                }
                .item-header {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 8px;
                    flex-wrap: wrap;
                }
                .row-info {
                    background: #2196f3;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .team-info {
                    background: #4caf50;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .column-info {
                    background: #ff9800;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .item-content {
                    flex: 1;
                }
                .error-message, .warning-message {
                    font-weight: 500;
                    margin-bottom: 4px;
                }
                .error-message {
                    color: #d32f2f;
                }
                .warning-message {
                    color: #f57c00;
                }
                .current-value {
                    font-size: 13px;
                    color: #666;
                    font-style: italic;
                }
                .item-action {
                    margin-top: 8px;
                }
                .btn-small {
                    padding: 4px 8px;
                    font-size: 12px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 3px;
                    cursor: pointer;
                }
                .btn-small:hover {
                    background: #f8f9fa;
                }
                .goto-cell {
                    color: #2196f3;
                    border-color: #2196f3;
                }
                .goto-cell:hover {
                    background: #e3f2fd;
                }
                .recommendations {
                    padding: 15px;
                }
                .recommendation {
                    margin-bottom: 15px;
                    padding: 12px;
                    border-radius: 4px;
                }
                .error-rec {
                    background: #ffe6e6;
                    border-left: 4px solid #d32f2f;
                }
                .warning-rec {
                    background: #fff3cd;
                    border-left: 4px solid #f57c00;
                }
                .recommendation ul {
                    margin: 8px 0 0 20px;
                    padding: 0;
                }
                .recommendation li {
                    margin-bottom: 4px;
                }
                
                /* セル強調表示用アニメーション */
                @keyframes highlight-flash {
                    0% { background-color: #ffeb3b; box-shadow: 0 0 10px rgba(255, 235, 59, 0.8); }
                    50% { background-color: #fff59d; box-shadow: 0 0 15px rgba(255, 235, 59, 1); }
                    100% { background-color: transparent; box-shadow: none; }
                }
                .highlight-cell {
                    position: relative;
                    z-index: 100;
                }
            `;
            
            // DOM に追加
            console.log('Adding style and modal to DOM');
            document.head.appendChild(style);
            document.body.appendChild(modal);
            console.log('Modal added to DOM, modal element:', modal);
            
            // モーダルが正しく表示されているか確認
            setTimeout(() => {
                const addedModal = document.querySelector('.validation-modal');
                console.log('Modal in DOM after 100ms:', addedModal ? 'Found' : 'Not found');
                if (addedModal) {
                    console.log('Modal display style:', window.getComputedStyle(addedModal).display);
                    console.log('Modal visibility:', window.getComputedStyle(addedModal).visibility);
                    console.log('Modal z-index:', window.getComputedStyle(addedModal).zIndex);
                }
            }, 100);
            
            // イベントリスナーを追加
            const closeModal = () => {
                console.log('🔄 Closing modal');
                modal.remove();
                style.remove();
            };
            
            // 閉じるボタンとOKボタンのイベントリスナー
            const closeButton = modal.querySelector('.validation-modal-close');
            const okButton = modal.querySelector('.validation-modal-ok');
            
            if (closeButton) {
                closeButton.addEventListener('click', (e) => {
                    console.log('Close button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                });
            }
            
            if (okButton) {
                okButton.addEventListener('click', (e) => {
                    console.log('OK button clicked - Event details:', {
                        isTrusted: e.isTrusted,
                        type: e.type,
                        target: e.target,
                        currentTarget: e.currentTarget,
                        timeStamp: e.timeStamp
                    });
                    console.log('Call stack:', new Error().stack);
                    
                    // isTrustedがfalseの場合は自動生成されたイベントなので無視
                    if (!e.isTrusted) {
                        console.log('Ignoring untrusted click event');
                        return;
                    }
                    
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                });
            }
            
            // バックグラウンドクリックでは閉じない（デバッグ用）
            modal.addEventListener('click', (e) => {
                console.log('Modal clicked, target:', e.target.className, 'isTrusted:', e.isTrusted);
                if (e.target === modal) {
                    console.log('Background clicked - modal will stay open for debugging');
                    // closeModal(); // デバッグ用にコメントアウト
                }
            });
            
            // ESCキーでも閉じない（デバッグ用）
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    console.log('ESC key pressed - modal will stay open for debugging');
                    // closeModal(); // デバッグ用にコメントアウト
                    // document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
            
            console.log('Modal setup complete. Only manual button clicks will close it.');
            
            // 「セルに移動」ボタンのイベントリスナー
            const gotoCellButtons = modal.querySelectorAll('.goto-cell');
            gotoCellButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const rowIndex = parseInt(e.target.dataset.row);
                    const columnId = e.target.dataset.column;
                    this.scrollToCell(rowIndex, columnId);
                    closeModal();
                });
            });
        }

        /**
         * 指定されたセルにスクロールして強調表示
         * @param {number} rowIndex - 行インデックス
         * @param {string} columnId - カラムID
         */
        scrollToCell(rowIndex, columnId) {
            console.log(`Scrolling to cell: row ${rowIndex + 1}, column ${columnId}`);
            
            try {
                // 該当セルを検索
                const targetCell = this.container.querySelector(`[data-index="${rowIndex}"][data-column="${columnId}"]`);
                if (!targetCell) {
                    console.warn(`Cell not found: row ${rowIndex + 1}, column ${columnId}`);
                    alert(`セルが見つかりません: 行${rowIndex + 1}, ${columnId}列`);
                    return;
                }
                
                // スクロールして表示
                targetCell.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
                
                // セルを一時的に強調表示
                targetCell.classList.add('highlight-cell');
                targetCell.style.animation = 'highlight-flash 2s ease-in-out';
                
                // 2秒後に強調表示を解除
                setTimeout(() => {
                    targetCell.classList.remove('highlight-cell');
                    targetCell.style.animation = '';
                }, 2000);
                
                // 入力フィールドがあればフォーカス
                const input = targetCell.querySelector('.cell-input');
                if (input) {
                    setTimeout(() => {
                        input.focus();
                        if (input.type === 'text') {
                            input.select();
                        }
                    }, 100);
                }
                
                console.log(`Successfully scrolled to cell: row ${rowIndex + 1}, column ${columnId}`);
                
            } catch (error) {
                console.error('Error scrolling to cell:', error);
                alert(`セルへの移動中にエラーが発生しました: ${error.message}`);
            }
        }

        // その他のユーティリティメソッドは省略...
    }

    // モジュールAPI
    return {
        DataTableManager,
        
        /**
         * データテーブルマネージャーを作成
         * @param {HTMLElement} container - コンテナ要素
         * @param {Object} options - オプション
         * @returns {DataTableManager} データテーブルマネージャーインスタンス
         */
        createManager(container, options = {}) {
            return new DataTableManager(container, options);
        }
    };
})();

// グローバルに公開
if (typeof window !== 'undefined') {
    window.DataTableManagerModule = DataTableManagerModule;
}