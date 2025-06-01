/**
 * Organization Chart Tool - Configuration File (Color System Version)
 * Manages application settings and demo data
 */

// Language definitions
const LANG = {
    en: {
        // Language selection
        languageLabel: "Language:",
        
        // Page title and headers
        title: "Organization Chart Tool",
        subtitle: "Automatically generate organization charts from Excel files",
        usage: "Usage: 1️⃣ Select file → 2️⃣ Validate data → 3️⃣ Generate chart → 4️⃣ Export",
        
        // Demo mode
        demoMode: "Demo Mode: Running with sample data",
        
        // File upload
        fileDropZone: "📁 Drop Excel file here or click to select",
        supportedFormats: "Supported formats: .xlsx, .xls",
        
        // Controls
        baseOrganization: "Base Organization:",
        showAll: "Show All",
        levelLimit: "Level Limit:",
        noLimit: "No Limit",
        levelsUpTo: "Up to {{n}} levels",
        fontSize: "Font Size:",
        boxSize: "Box Size:",
        hideManagers: "Hide Managers",
        small: "Small",
        medium: "Medium",
        large: "Large",
        
        // Buttons
        generateChart: "Generate Chart",
        showDataTable: "Show/Edit Data Table",
        validateData: "Validate Data",
        exportSVG: "Export SVG",
        exportPNG: "Export PNG",
        print: "Print",
        fullScreen: "Full Screen",
        exitFullScreen: "Exit Full Screen",
        loadSampleData: "Load Sample Data",
        
        // Data table
        dataTableTitle: "Data Table - Validation & Edit",
        addNewRow: "Add New Row",
        applyChanges: "Apply Changes",
        closeTable: "Close Table",
        
        // Table headers
        tableHeaders: {
            actions: "Actions",
            level: "Level",
            employeeId: "Employee ID",
            name: "Name",
            nameEn: "Name (EN)",
            grade: "Grade",
            teamLongName: "Team Long Name",
            callName: "Call Name",
            concurrent: "Concurrent",
            parent: "Parent Org",
            role: "Role",
            roleJp: "Role (JP)",
            borderColor: "Border Color🎨",
            backgroundColor: "Header BG Color🎨",
            headerTextColor: "Header Text Color🎨",
            status: "Status"
        },
        
        // Status messages
        valid: "OK",
        invalid: "Error",
        warning: "Warning",
        pending: "Pending",
        
        // Actions
        delete: "Delete",
        selectPlease: "Please select",
        
        // Messages
        success: "Success!",
        error: "Error",
        noDataLoaded: "No data loaded. Please select an Excel file first.",
        fileLoadComplete: 'File "{{filename}}" loaded successfully.',
        chartGenerated: "Chart generated ({{count}} organizations)",
        changesApplied: "Changes applied successfully\n{{count}} rows of data applied (Custom colors: {{customColors}} organizations)\n\nClick 'Generate Chart' to see the updated chart.",
        
        // Validation messages
        nameRequired: "Name is required",
        callNameRequired: "Call Name is required",
        roleRequired: "Role is required",
        levelOutOfRange: "Level must be between 1-10",
        parentNotFound: "Parent organization (Call Name) not found",
        circularReference: "Circular reference detected",
        invalidColorFormat: "Invalid {{field}} format: {{value}}",
        colorValidationError: "{{field}} validation error: {{error}}",
        
        // Export messages
        exportStarted: "Download started",
        exportEmptyTemplate: "Export Empty Template",
        exportCurrentData: "Export Current Data",
        exportHTML: "Export HTML",
        emptyTemplateExported: "Empty template \"{{filename}}\" exported successfully.",
        currentDataExported: "Current data \"{{filename}}\" exported successfully.",
        htmlExported: "Standalone HTML \"{{filename}}\" exported successfully.",
        pngExportRequiresLib: "PNG export requires html2canvas library.<br>Please use SVG export instead.",
        
        // Color picker
        selectColor: "Select {{field}}",
        departmentPresets: "Department Presets",
        colorPalette: "Color Palette",
        customColor: "Custom Color",
        apply: "Apply",
        clearColor: "Clear Color (Use Default)",
        
        // Legend
        callNameLegend: "Call Name - Full Name Reference",
        colorLegend: "Color Coding",
        customColorUsage: "Custom colors: {{count}} organizations, {{patterns}} patterns",
        
        // Manager visibility
        organizationOnly: "Organization Only",
        
        // Button groups
        dataOperations: "📁 Data Operations",
        dataEditingValidation: "🛠️ Data Editing & Validation",
        chartGeneration: "🎯 Chart Generation",
        exportOutput: "📤 Export & Output",
        displayControl: "🖥️ Display Control"
    },
    ja: {
        // Language selection
        languageLabel: "言語:",
        
        // Page title and headers
        title: "組織図作成ツール",
        subtitle: "Excelファイルから組織図を自動生成",
        usage: "使用方法: 1️⃣ ファイル選択 → 2️⃣ データ検証 → 3️⃣ 組織図生成 → 4️⃣ エクスポート",
        
        // Demo mode
        demoMode: "デモモード: サンプルデータで実行中",
        
        // File upload
        fileDropZone: "📁 Excelファイルをここにドロップまたはクリックして選択",
        supportedFormats: "対応形式: .xlsx, .xls",
        
        // Controls
        baseOrganization: "基準組織:",
        showAll: "すべて表示",
        levelLimit: "レベル制限:",
        noLimit: "制限なし",
        levelsUpTo: "{{n}}レベルまで",
        fontSize: "フォントサイズ:",
        boxSize: "ボックスサイズ:",
        hideManagers: "管理者を非表示",
        small: "小",
        medium: "中",
        large: "大",
        
        // Buttons
        generateChart: "組織図生成",
        showDataTable: "データテーブル表示/編集",
        validateData: "データ検証",
        exportSVG: "SVGエクスポート",
        exportPNG: "PNGエクスポート",
        print: "印刷",
        fullScreen: "フルスクリーン",
        exitFullScreen: "フルスクリーン終了",
        loadSampleData: "サンプルデータ読み込み",
        
        // Data table
        dataTableTitle: "データテーブル - 検証と編集",
        addNewRow: "新規行追加",
        applyChanges: "変更を適用",
        closeTable: "テーブルを閉じる",
        
        // Table headers
        tableHeaders: {
            actions: "操作",
            level: "レベル",
            employeeId: "社員ID",
            name: "名前",
            nameEn: "名前（英語）",
            grade: "等級",
            teamLongName: "正式組織名",
            callName: "Call Name",
            concurrent: "兼任",
            parent: "上位組織",
            role: "役職",
            roleJp: "役職（日本語）",
            borderColor: "枠線色🎨",
            backgroundColor: "ヘッダー背景色🎨",
            headerTextColor: "ヘッダー文字色🎨",
            status: "状態"
        },
        
        // Status messages
        valid: "OK",
        invalid: "エラー",
        warning: "警告",
        pending: "保留中",
        
        // Actions
        delete: "削除",
        selectPlease: "選択してください",
        
        // Messages
        success: "成功！",
        error: "エラー",
        noDataLoaded: "データが読み込まれていません。最初にExcelファイルを選択してください。",
        fileLoadComplete: 'ファイル "{{filename}}" が正常に読み込まれました。',
        chartGenerated: "組織図が生成されました（{{count}}組織）",
        changesApplied: "変更が正常に適用されました\n{{count}}行のデータが適用されました（カスタム色: {{customColors}}組織）\n\n「組織図生成」をクリックして更新された組織図を確認してください。",
        
        // Validation messages
        nameRequired: "名前は必須です",
        callNameRequired: "Call Nameは必須です",
        roleRequired: "役職は必須です",
        levelOutOfRange: "レベルは1-10の範囲で入力してください",
        parentNotFound: "上位組織（Call Name）が見つかりません",
        circularReference: "循環参照が検出されました",
        invalidColorFormat: "無効な{{field}}形式: {{value}}",
        colorValidationError: "{{field}}検証エラー: {{error}}",
        
        // Export messages
        exportStarted: "ダウンロードを開始しました",
        exportEmptyTemplate: "空のテンプレートをエクスポート",
        exportCurrentData: "現在のデータをエクスポート",
        exportHTML: "HTMLエクスポート",
        emptyTemplateExported: "空のテンプレート \"{{filename}}\" が正常にエクスポートされました。",
        currentDataExported: "現在のデータ \"{{filename}}\" が正常にエクスポートされました。",
        htmlExported: "スタンドアロンHTML \"{{filename}}\" が正常にエクスポートされました。",
        pngExportRequiresLib: "PNGエクスポートにはhtml2canvasライブラリが必要です。<br>代わりにSVGエクスポートをご利用ください。",
        
        // Color picker
        selectColor: "{{field}}を選択",
        departmentPresets: "部門プリセット",
        colorPalette: "カラーパレット",
        customColor: "カスタム色",
        apply: "適用",
        clearColor: "色をクリア（デフォルト使用）",
        
        // Legend
        callNameLegend: "Call Name - 正式名称対照",
        colorLegend: "色分け表示",
        customColorUsage: "カスタム色: {{count}}組織、{{patterns}}パターン",
        
        // Manager visibility
        organizationOnly: "組織のみ",
        
        // Button groups
        dataOperations: "📁 データ操作",
        dataEditingValidation: "🛠️ データ編集・検証",
        chartGeneration: "🎯 組織図生成",
        exportOutput: "📤 エクスポート・出力",
        displayControl: "🖥️ 表示制御"
    },
    id: {
        // Language selection
        languageLabel: "Bahasa:",
        
        // Page title and headers
        title: "Alat Bagan Organisasi",
        subtitle: "Otomatis membuat bagan organisasi dari file Excel",
        usage: "Penggunaan: 1️⃣ Pilih file → 2️⃣ Validasi data → 3️⃣ Buat bagan → 4️⃣ Ekspor",
        
        // Demo mode
        demoMode: "Mode Demo: Berjalan dengan data sampel",
        
        // File upload
        fileDropZone: "📁 Seret file Excel di sini atau klik untuk memilih",
        supportedFormats: "Format yang didukung: .xlsx, .xls",
        
        // Controls
        baseOrganization: "Organisasi Dasar:",
        showAll: "Tampilkan Semua",
        levelLimit: "Batas Level:",
        noLimit: "Tanpa Batas",
        levelsUpTo: "Hingga {{n}} level",
        fontSize: "Ukuran Font:",
        boxSize: "Ukuran Kotak:",
        hideManagers: "Sembunyikan Manajer",
        small: "Kecil",
        medium: "Sedang",
        large: "Besar",
        
        // Buttons
        generateChart: "Buat Bagan",
        showDataTable: "Tampilkan/Edit Tabel Data",
        validateData: "Validasi Data",
        exportSVG: "Ekspor SVG",
        exportPNG: "Ekspor PNG",
        print: "Cetak",
        fullScreen: "Layar Penuh",
        exitFullScreen: "Keluar Layar Penuh",
        loadSampleData: "Muat Data Sampel",
        
        // Data table
        dataTableTitle: "Tabel Data - Validasi & Edit",
        addNewRow: "Tambah Baris Baru",
        applyChanges: "Terapkan Perubahan",
        closeTable: "Tutup Tabel",
        
        // Table headers
        tableHeaders: {
            actions: "Aksi",
            level: "Level",
            employeeId: "ID Karyawan",
            name: "Nama",
            nameEn: "Nama (EN)",
            grade: "Grade",
            teamLongName: "Nama Lengkap Tim",
            callName: "Call Name",
            concurrent: "Rangkap Jabatan",
            parent: "Organisasi Induk",
            role: "Peran",
            roleJp: "Peran (JP)",
            borderColor: "Warna Border🎨",
            backgroundColor: "Warna Latar Header🎨",
            headerTextColor: "Warna Teks Header🎨",
            status: "Status"
        },
        
        // Status messages
        valid: "OK",
        invalid: "Error",
        warning: "Peringatan",
        pending: "Menunggu",
        
        // Actions
        delete: "Hapus",
        selectPlease: "Silakan pilih",
        
        // Messages
        success: "Berhasil!",
        error: "Error",
        noDataLoaded: "Tidak ada data yang dimuat. Silakan pilih file Excel terlebih dahulu.",
        fileLoadComplete: 'File "{{filename}}" berhasil dimuat.',
        chartGenerated: "Bagan dibuat ({{count}} organisasi)",
        changesApplied: "Perubahan berhasil diterapkan\n{{count}} baris data diterapkan (Warna kustom: {{customColors}} organisasi)\n\nKlik 'Buat Bagan' untuk melihat bagan yang diperbarui.",
        
        // Validation messages
        nameRequired: "Nama wajib diisi",
        callNameRequired: "Call Name wajib diisi",
        roleRequired: "Peran wajib diisi",
        levelOutOfRange: "Level harus antara 1-10",
        parentNotFound: "Organisasi induk (Call Name) tidak ditemukan",
        circularReference: "Referensi melingkar terdeteksi",
        invalidColorFormat: "Format {{field}} tidak valid: {{value}}",
        colorValidationError: "Error validasi {{field}}: {{error}}",
        
        // Export messages
        exportStarted: "Unduhan dimulai",
        exportEmptyTemplate: "Ekspor Template Kosong",
        exportCurrentData: "Ekspor Data Saat Ini",
        exportHTML: "Ekspor HTML",
        emptyTemplateExported: "Template kosong \"{{filename}}\" berhasil diekspor.",
        currentDataExported: "Data saat ini \"{{filename}}\" berhasil diekspor.",
        htmlExported: "HTML mandiri \"{{filename}}\" berhasil diekspor.",
        pngExportRequiresLib: "Ekspor PNG memerlukan library html2canvas.<br>Silakan gunakan ekspor SVG sebagai gantinya.",
        
        // Color picker
        selectColor: "Pilih {{field}}",
        departmentPresets: "Preset Departemen",
        colorPalette: "Palet Warna",
        customColor: "Warna Kustom",
        apply: "Terapkan",
        clearColor: "Hapus Warna (Gunakan Default)",
        
        // Legend
        callNameLegend: "Call Name - Referensi Nama Lengkap",
        colorLegend: "Kode Warna",
        customColorUsage: "Warna kustom: {{count}} organisasi, {{patterns}} pola",
        
        // Manager visibility
        organizationOnly: "Hanya Organisasi",
        
        // Button groups
        dataOperations: "📁 Operasi Data",
        dataEditingValidation: "🛠️ Edit & Validasi Data",
        chartGeneration: "🎯 Pembuatan Bagan",
        exportOutput: "📤 Ekspor & Output",
        displayControl: "🖥️ Kontrol Tampilan"
    }
};

// Current language setting - dynamically changeable
let CURRENT_LANG = localStorage.getItem('organizationChartLang') || 'en'; // Default to English

// Available languages
const AVAILABLE_LANGUAGES = {
    'en': 'English',
    'ja': '日本語', 
    'id': 'Bahasa Indonesia'
};

// Helper function to get translated text
function t(key, params = {}) {
    const keys = key.split('.');
    let value = LANG[CURRENT_LANG];
    
    for (const k of keys) {
        value = value?.[k];
        if (!value) break;
    }
    
    if (typeof value === 'string') {
        // Replace parameters like {{n}}, {{filename}}, etc.
        return value.replace(/\{\{(\w+)\}\}/g, (match, param) => params[param] || match);
    }
    
    return key; // Return key if translation not found
}

// Language management functions
const LanguageManager = {
    /**
     * Get current language
     */
    getCurrentLanguage() {
        return CURRENT_LANG;
    },
    
    /**
     * Set new language and persist to localStorage
     */
    setLanguage(langCode) {
        if (LANG[langCode]) {
            CURRENT_LANG = langCode;
            localStorage.setItem('organizationChartLang', langCode);
            this.updatePageContent();
            ConfigUtils.debugLog(`Language changed to: ${langCode}`, 'i18n');
        } else {
            console.error(`Language not supported: ${langCode}`);
        }
    },
    
    /**
     * Get available languages
     */
    getAvailableLanguages() {
        return AVAILABLE_LANGUAGES;
    },
    
    /**
     * Update all page content with current language
     */
    updatePageContent() {
        // Update page title
        document.title = t('title');
        
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const paramsAttr = element.getAttribute('data-i18n-params');
            let params = {};
            
            // Parse parameters if they exist
            if (paramsAttr) {
                try {
                    params = JSON.parse(paramsAttr);
                } catch (e) {
                    console.warn('Invalid data-i18n-params JSON:', paramsAttr);
                }
            }
            
            const translated = t(key, params);
            
            if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
                element.value = translated;
            } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = translated;
            } else {
                element.textContent = translated;
            }
        });
        
        // Update elements with data-i18n-html attribute (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const paramsAttr = element.getAttribute('data-i18n-params');
            let params = {};
            
            // Parse parameters if they exist
            if (paramsAttr) {
                try {
                    params = JSON.parse(paramsAttr);
                } catch (e) {
                    console.warn('Invalid data-i18n-params JSON for HTML element:', paramsAttr);
                }
            }
            
            element.innerHTML = t(key, params);
        });
        
        // Update language selector
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = CURRENT_LANG;
        }
        
        // Trigger custom event for other components to update
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: CURRENT_LANG } 
        }));
        
        ConfigUtils.debugLog('Page content updated for language: ' + CURRENT_LANG, 'i18n');
    },
    
    /**
     * Initialize language system
     */
    initialize() {
        // Create language selector if it doesn't exist
        this.createLanguageSelector();
        
        // Update page content with current language
        this.updatePageContent();
        
        ConfigUtils.debugLog('Language system initialized with: ' + CURRENT_LANG, 'i18n');
    },
    
    /**
     * Create language selector UI
     */
    createLanguageSelector() {
        // Find the header-top area to add language selector
        const headerTop = document.querySelector('.header-top') || document.querySelector('.header') || document.querySelector('.controls') || document.body;
        
        // Check if language selector already exists
        if (document.getElementById('languageSelector')) {
            return;
        }
        
        // Create language selector container
        const selectorContainer = document.createElement('div');
        selectorContainer.id = 'languageSelector';
        selectorContainer.className = 'language-selector';
        selectorContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        // Create label
        const label = document.createElement('label');
        label.setAttribute('data-i18n', 'languageLabel');
        label.textContent = t('languageLabel');
        label.style.cssText = `
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #4a5568;
        `;
        
        // Create select element
        const select = document.createElement('select');
        select.id = 'languageSelect';
        select.style.cssText = `
            font-size: 13px;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #cbd5e0;
            background: white;
            cursor: pointer;
        `;
        
        // Add options
        Object.entries(AVAILABLE_LANGUAGES).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            if (code === CURRENT_LANG) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        // Add change event listener
        select.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });
        
        // Assemble and add to page
        selectorContainer.appendChild(label);
        selectorContainer.appendChild(select);
        
        // Insert into header-top or appropriate location
        if (headerTop.classList.contains('header-top')) {
            // If it's the header-top div, append to it
            headerTop.appendChild(selectorContainer);
        } else {
            // Fallback to original behavior
            if (headerTop.firstChild) {
                headerTop.insertBefore(selectorContainer, headerTop.firstChild);
            } else {
                headerTop.appendChild(selectorContainer);
            }
        }
    }
};

// Application configuration
const CONFIG = {
    // デフォルト設定値
    DEFAULTS: {
        SPACING: { x: 72, y: 140 }, // 横間隔を60%に調整（120 * 0.6 = 72）
        BOX_SIZE: { width: 85, height: 100 }, // 横幅を3割縮小
        FONT_SIZES: {
            small: { org: '10px', name: '8px', role: '7px' },
            medium: { org: '12px', name: '10px', role: '9px' },
            large: { org: '14px', name: '12px', role: '11px' }
        },
        BOX_SIZES: {
            small: { width: '70px', height: '80px', spacingX: '57px', spacingY: '120px' },
            medium: { width: '85px', height: '100px', spacingX: '72px', spacingY: '140px' },
            large: { width: '100px', height: '120px', spacingX: '87px', spacingY: '170px' }
        }
    },
    
    // データ処理設定
    DATA_PROCESSING: {
        // 必須データ項目
        REQUIRED_FIELDS: ['name', 'callName', 'role'],
        
        // 管理者判定キーワード
        MANAGER_KEYWORDS: ['長', 'Manager', 'manager', 'Head', 'Chief', 'President', 'Factory manager', 'Department Manager', 'Section Manager'],
        
        // アドバイザ判定キーワード
        ADVISOR_KEYWORDS: ['アドバイザ', 'Advisor', 'advisor']
    },
    
    // レイアウト設定
    LAYOUT: {
        MIN_SPACING: 30,
        VERTICAL_SPACING: 140,
        HORIZONTAL_SPACING: 72, // 横間隔を60%に調整（120 * 0.6 = 72）
        MARGIN: 50,
        CONNECTION_LINE_OFFSET: 20
    },
    
    // 色指定システム設定（拡張版）
    COLOR_SYSTEM: {
        // デフォルト色設定（現行と同じ）
        DEFAULT_COLORS: {
            borderColor: '#333',        // デフォルト枠線色
            backgroundColor: '#f9f9f9', // デフォルト背景色
            headerBackgroundColor: '#4a5568', // デフォルトヘッダー背景色
            headerTextColor: '#ffffff'  // デフォルトヘッダー文字色
        },
        
        // 15色パレット（色相5×濃度3）- 色選択機能改善版
        PALETTE_COLORS: {
            // 青系（Blue）
            'blue-light': { hex: '#e3f2fd', name: '薄青', category: 'blue' },
            'blue-medium': { hex: '#2196f3', name: '青', category: 'blue' },
            'blue-dark': { hex: '#1565c0', name: '濃青', category: 'blue' },
            
            // 緑系（Green）
            'green-light': { hex: '#f1f8e9', name: '薄緑', category: 'green' },
            'green-medium': { hex: '#4caf50', name: '緑', category: 'green' },
            'green-dark': { hex: '#2e7d32', name: '濃緑', category: 'green' },
            
            // 紫系（Purple）
            'purple-light': { hex: '#f3e5f5', name: '薄紫', category: 'purple' },
            'purple-medium': { hex: '#9c27b0', name: '紫', category: 'purple' },
            'purple-dark': { hex: '#6a1b9a', name: '濃紫', category: 'purple' },
            
            // オレンジ系（Orange）
            'orange-light': { hex: '#fff3e0', name: '薄橙', category: 'orange' },
            'orange-medium': { hex: '#ff9800', name: '橙', category: 'orange' },
            'orange-dark': { hex: '#e65100', name: '濃橙', category: 'orange' },
            
            // 赤系（Red）
            'red-light': { hex: '#ffebee', name: '薄赤', category: 'red' },
            'red-medium': { hex: '#f44336', name: '赤', category: 'red' },
            'red-dark': { hex: '#c62828', name: '濃赤', category: 'red' }
        },
        
        // Department preset colors (improved version)
        DEPARTMENT_PRESETS: {
            'direct': {
                name: 'Direct Department',
                borderColor: 'blue-medium',
                backgroundColor: 'blue-light',
                headerTextColor: '#ffffff'
            },
            'indirect': {
                name: 'Indirect Department',
                borderColor: 'green-medium',
                backgroundColor: 'green-light',
                headerTextColor: '#ffffff'
            },
            'management': {
                name: 'Management',
                borderColor: 'purple-medium',
                backgroundColor: 'purple-light',
                headerTextColor: '#ffffff'
            },
            'sales': {
                name: 'Sales Department',
                borderColor: 'orange-medium',
                backgroundColor: 'orange-light',
                headerTextColor: '#ffffff'
            },
            'support': {
                name: 'Support Department',
                borderColor: 'red-medium',
                backgroundColor: 'red-light',
                headerTextColor: '#ffffff'
            }
        },
        
        // 基本色名マッピング（後方互換性）
        COLOR_NAMES: {
            'red': '#f44336', 'blue': '#2196f3', 'green': '#4caf50',
            'orange': '#ff9800', 'purple': '#9c27b0', 'teal': '#009688',
            'pink': '#e91e63', 'lime': '#cddc39', 'cyan': '#00bcd4',
            'yellow': '#ffeb3b', 'brown': '#795548', 'gray': '#9e9e9e',
            'black': '#000000', 'white': '#ffffff'
        }
    },
    
    // エクスポート設定
    EXPORT: {
        PNG_FILENAME: '組織図.png',
        SVG_FILENAME: '組織図.svg',
        PRINT_TITLE: '組織図印刷'
    },
    
    // デバッグ設定
    DEBUG: {
        ENABLED: true,
        LOG_LAYOUT_CALCULATION: true,
        LOG_DATA_PROCESSING: true
    }
};

// Sample data (500-person Manufacturing Company - Western style)
// [Level, Employee ID, Name, Name(EN), Grade, Team ID, Team Long Name, Call Name, Parent, Role, Role(JP), Border Color, Background Color, Header Text Color, Team Boss Flag, Concurrent]
const CORRECTED_SAMPLE_DATA = [
    // Level 1 - Executive
    [1, "001", "Robert Johnson", "Robert Johnson", "CEO", "HQ001", "Global Manufacturing Corp", "Global MFG", "N/A", "Chief Executive Officer", "最高経営責任者", "#2196f3", "#e3f2fd", "#000000", "Y", ""],
    
    // Level 2 - C-Level Executives
    [2, "002", "Sarah Williams", "Sarah Williams", "COO", "OPS001", "Operations Division", "Operations", "Global MFG", "Chief Operating Officer", "最高執行責任者", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [2, "003", "Michael Chen", "Michael Chen", "CFO", "FIN001", "Finance Division", "Finance", "Global MFG", "Chief Financial Officer", "最高財務責任者", "#ff9800", "#fff3e0", "#000000", "Y", ""],
    [2, "004", "Jennifer Davis", "Jennifer Davis", "CHRO", "HR001", "Human Resources Division", "HR", "Global MFG", "Chief Human Resources Officer", "最高人事責任者", "#9c27b0", "#f3e5f5", "#000000", "Y", ""],
    [2, "005", "David Miller", "David Miller", "CTO", "IT001", "Technology Division", "IT", "Global MFG", "Chief Technology Officer", "最高技術責任者", "#f44336", "#ffebee", "#000000", "Y", ""],
    
    // Level 3 - Vice Presidents
    [3, "006", "Amanda Rodriguez", "Amanda Rodriguez", "VP", "MFG001", "Manufacturing Operations", "Manufacturing", "Operations", "Vice President Manufacturing", "製造担当副社長", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [3, "007", "James Thompson", "James Thompson", "VP", "QA001", "Quality Assurance", "Quality", "Operations", "Vice President Quality", "品質担当副社長", "#2196f3", "#e3f2fd", "#000000", "Y", ""],
    [3, "008", "Lisa Anderson", "Lisa Anderson", "VP", "SCM001", "Supply Chain Management", "Supply Chain", "Operations", "Vice President Supply Chain", "サプライチェーン担当副社長", "#ff9800", "#fff3e0", "#000000", "Y", ""],
    [3, "009", "Thomas Wilson", "Thomas Wilson", "VP", "ENG001", "Engineering", "Engineering", "Operations", "Vice President Engineering", "エンジニアリング担当副社長", "#9c27b0", "#f3e5f5", "#000000", "Y", ""],
    [3, "010", "Emily Brown", "Emily Brown", "VP", "SAL001", "Sales & Marketing", "Sales", "Global MFG", "Vice President Sales", "営業担当副社長", "#f44336", "#ffebee", "#000000", "Y", ""],
    
    // Level 4 - Directors
    [4, "011", "Christopher Lee", "Christopher Lee", "DIR", "PROD1", "Production Plant 1", "Plant 1", "Manufacturing", "Plant Director", "工場長", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [4, "012", "Maria Garcia", "Maria Garcia", "DIR", "PROD2", "Production Plant 2", "Plant 2", "Manufacturing", "Plant Director", "工場長", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [4, "013", "Kevin White", "Kevin White", "DIR", "PROD3", "Production Plant 3", "Plant 3", "Manufacturing", "Plant Director", "工場長", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [4, "014", "Rachel Martin", "Rachel Martin", "DIR", "QC001", "Quality Control", "QC", "Quality", "Quality Director", "品質管理部長", "#2196f3", "#e3f2fd", "#000000", "Y", ""],
    [4, "015", "Daniel Taylor", "Daniel Taylor", "DIR", "R&D001", "Research & Development", "R&D", "Engineering", "R&D Director", "研究開発部長", "#9c27b0", "#f3e5f5", "#000000", "Y", ""],
    [4, "016", "Jessica Moore", "Jessica Moore", "DIR", "PROC001", "Procurement", "Procurement", "Supply Chain", "Procurement Director", "調達部長", "#ff9800", "#fff3e0", "#000000", "Y", ""],
    [4, "017", "Paul Jackson", "Paul Jackson", "DIR", "LOG001", "Logistics", "Logistics", "Supply Chain", "Logistics Director", "物流部長", "#ff9800", "#fff3e0", "#000000", "Y", ""],
    [4, "018", "Laura Adams", "Laura Adams", "DIR", "MKTG001", "Marketing", "Marketing", "Sales", "Marketing Director", "マーケティング部長", "#f44336", "#ffebee", "#000000", "Y", ""],
    [4, "019", "Brian Clark", "Brian Clark", "DIR", "SALES1", "Regional Sales North", "Sales North", "Sales", "Sales Director", "営業部長", "#f44336", "#ffebee", "#000000", "Y", ""],
    [4, "020", "Nicole Lewis", "Nicole Lewis", "DIR", "SALES2", "Regional Sales South", "Sales South", "Sales", "Sales Director", "営業部長", "#f44336", "#ffebee", "#000000", "Y", ""],
    
    // Level 5 - Managers
    [5, "021", "Andrew Hall", "Andrew Hall", "MGR", "ASM001", "Assembly Line 1", "Assembly 1", "Plant 1", "Assembly Manager", "組立管理者", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [5, "022", "Michelle Young", "Michelle Young", "MGR", "ASM002", "Assembly Line 2", "Assembly 2", "Plant 1", "Assembly Manager", "組立管理者", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [5, "023", "Steven King", "Steven King", "MGR", "MCH001", "Machining Department", "Machining", "Plant 1", "Machining Manager", "機械加工管理者", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [5, "024", "Rebecca Wright", "Rebecca Wright", "MGR", "WLD001", "Welding Department", "Welding", "Plant 2", "Welding Manager", "溶接管理者", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [5, "025", "John Scott", "John Scott", "MGR", "FIN001", "Finishing Department", "Finishing", "Plant 2", "Finishing Manager", "仕上げ管理者", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [5, "026", "Karen Green", "Karen Green", "MGR", "PKG001", "Packaging Department", "Packaging", "Plant 3", "Packaging Manager", "包装管理者", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [5, "027", "Robert Turner", "Robert Turner", "MGR", "SHP001", "Shipping Department", "Shipping", "Plant 3", "Shipping Manager", "出荷管理者", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [5, "028", "Amy Phillips", "Amy Phillips", "MGR", "QCLAB", "QC Laboratory", "QC Lab", "QC", "Lab Manager", "検査室管理者", "#2196f3", "#e3f2fd", "#000000", "Y", ""],
    [5, "029", "Mark Campbell", "Mark Campbell", "MGR", "QCFLD", "Field Quality Control", "QC Field", "QC", "Field QC Manager", "現場品質管理者", "#2196f3", "#e3f2fd", "#000000", "Y", ""],
    [5, "030", "Stephanie Parker", "Stephanie Parker", "MGR", "PRDDEV", "Product Development", "Product Dev", "R&D", "Product Development Manager", "製品開発管理者", "#9c27b0", "#f3e5f5", "#000000", "Y", ""],
    
    // Level 6 - Supervisors and Team Leaders
    [6, "031", "Ryan Evans", "Ryan Evans", "SUP", "ASM1A", "Assembly Team A", "Asm Team A", "Assembly 1", "Team Supervisor", "チームリーダー", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [6, "032", "Crystal Collins", "Crystal Collins", "SUP", "ASM1B", "Assembly Team B", "Asm Team B", "Assembly 1", "Team Supervisor", "チームリーダー", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [6, "033", "Gregory Stewart", "Gregory Stewart", "SUP", "ASM2A", "Assembly Team C", "Asm Team C", "Assembly 2", "Team Supervisor", "チームリーダー", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [6, "034", "Heather Morris", "Heather Morris", "SUP", "MCH1A", "Machining Team A", "Mach Team A", "Machining", "Team Supervisor", "チームリーダー", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [6, "035", "Brandon Rogers", "Brandon Rogers", "SUP", "MCH1B", "Machining Team B", "Mach Team B", "Machining", "Team Supervisor", "チームリーダー", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [6, "036", "Vanessa Reed", "Vanessa Reed", "SUP", "WLD1A", "Welding Team A", "Weld Team A", "Welding", "Team Supervisor", "チームリーダー", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [6, "037", "Eric Cook", "Eric Cook", "SUP", "WLD1B", "Welding Team B", "Weld Team B", "Welding", "Team Supervisor", "チームリーダー", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [6, "038", "Diana Bailey", "Diana Bailey", "SUP", "FIN1A", "Finishing Team A", "Fin Team A", "Finishing", "Team Supervisor", "チームリーダー", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [6, "039", "Justin Rivera", "Justin Rivera", "SUP", "PKG1A", "Packaging Team A", "Pkg Team A", "Packaging", "Team Supervisor", "チームリーダー", "#4caf50", "#f1f8e9", "#000000", "Y", ""],
    [6, "040", "Samantha Cooper", "Samantha Cooper", "SUP", "SHP1A", "Shipping Team A", "Ship Team A", "Shipping", "Team Supervisor", "チームリーダー", "#4caf50", "#f1f8e9", "#000000", "Y", ""]
];

// ユーティリティ関数（色指定システム対応 - 改善版）
const ConfigUtils = {
    /**
     * デバッグログを出力
     * @param {string} message - ログメッセージ
     * @param {string} category - ログカテゴリ
     */
    debugLog(message, category = 'general') {
        if (!CONFIG.DEBUG.ENABLED) return;
        
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [${category.toUpperCase()}] ${message}`);
    },
    
    /**
     * CSS変数を更新
     * @param {Object} variables - 更新するCSS変数のオブジェクト
     */
    updateCSSVariables(variables) {
        const root = document.documentElement;
        Object.entries(variables).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    },
    
    /**
     * 設定値を取得
     * @param {string} path - 設定パス（例: 'DEFAULTS.SPACING.x'）
     * @returns {any} 設定値
     */
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], CONFIG);
    },
    
    /**
     * Call NameとTeam Long Nameのマッピングを動的に更新
     * @param {Map} mapping - マッピング（Call Name → Team Long Name）
     */
    updateOrgDisplayMapping(mapping) {
        CONFIG.DATA_PROCESSING.ORG_DISPLAY_MAPPING = {};
        mapping.forEach((longName, callName) => {
            CONFIG.DATA_PROCESSING.ORG_DISPLAY_MAPPING[callName] = longName;
        });
        ConfigUtils.debugLog(`組織表示マッピングを更新: ${mapping.size}件`, 'config');
    },
    
    /**
     * 色値をパース（15色パレット対応 - 改善版）
     * @param {string} colorValue - 色値
     * @returns {string|null} パース済み色値
     */
    parseColorValue(colorValue) {
        if (!colorValue) return null;
        
        const value = colorValue.toString().trim();
        
        // 1. 15色パレットで検索
        if (CONFIG.COLOR_SYSTEM.PALETTE_COLORS[value]) {
            ConfigUtils.debugLog(`パレット色変換: ${value} → ${CONFIG.COLOR_SYSTEM.PALETTE_COLORS[value].hex}`, 'config');
            return CONFIG.COLOR_SYSTEM.PALETTE_COLORS[value].hex;
        }
        
        // 2. HEXカラー（#から始まる）- 3桁・6桁対応
        if (value.startsWith('#')) {
            // 3桁HEXを6桁に変換
            if (/^#[0-9a-f]{3}$/i.test(value)) {
                const expanded = value.replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i, '#$1$1$2$2$3$3');
                ConfigUtils.debugLog(`3桁HEX変換: ${value} → ${expanded}`, 'config');
                return expanded;
            }
            // 6桁HEX
            if (/^#[0-9a-f]{6}$/i.test(value)) {
                ConfigUtils.debugLog(`6桁HEX確認: ${value}`, 'config');
                return value.toLowerCase();
            }
        }
        
        // 3. RGB形式
        if (value.startsWith('rgb')) {
            ConfigUtils.debugLog(`RGB形式確認: ${value}`, 'config');
            return value;
        }
        
        // 4. 色名（基本的な色）
        const lowerValue = value.toLowerCase();
        if (CONFIG.COLOR_SYSTEM.COLOR_NAMES[lowerValue]) {
            ConfigUtils.debugLog(`色名変換: ${value} → ${CONFIG.COLOR_SYSTEM.COLOR_NAMES[lowerValue]}`, 'config');
            return CONFIG.COLOR_SYSTEM.COLOR_NAMES[lowerValue];
        }
        
        ConfigUtils.debugLog(`無効な色値: ${colorValue}`, 'config');
        return null;
    },
    
    /**
     * パレット色を取得
     * @param {string} colorKey - 色キー
     * @returns {string} HEX色
     */
    getPaletteColor(colorKey) {
        if (CONFIG.COLOR_SYSTEM.PALETTE_COLORS[colorKey]) {
            return CONFIG.COLOR_SYSTEM.PALETTE_COLORS[colorKey].hex;
        }
        // キーがそのままHEX色の場合はそのまま返す
        return colorKey;
    },
    
    /**
     * 部門プリセット色を取得
     * @param {string} presetKey - プリセットキー
     * @param {string} colorType - 色タイプ
     * @returns {string} HEX色
     */
    getDepartmentPresetColor(presetKey, colorType) {
        const preset = CONFIG.COLOR_SYSTEM.DEPARTMENT_PRESETS[presetKey];
        if (preset && preset[colorType]) {
            return this.getPaletteColor(preset[colorType]);
        }
        return null;
    },
    
    /**
     * 色設定をパース・検証（改善版）
     * @param {Object} colorInput - 色入力オブジェクト
     * @returns {Object} パース済み色設定
     */
    parseColorSettings(colorInput) {
        const colors = {
            borderColor: CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.borderColor,
            backgroundColor: CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.backgroundColor,
            headerBackgroundColor: CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.headerBackgroundColor,
            headerTextColor: CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.headerTextColor
        };
        
        // 枠線色
        if (colorInput.borderColor && colorInput.borderColor.trim()) {
            const parsedBorder = this.parseColorValue(colorInput.borderColor);
            if (parsedBorder) {
                colors.borderColor = parsedBorder;
                // 枠線色をヘッダー背景色としても使用（統一感のため）
                colors.headerBackgroundColor = parsedBorder;
                ConfigUtils.debugLog(`枠線色適用: ${colorInput.borderColor} → ${parsedBorder}`, 'config');
            }
        }
        
        // 背景色
        if (colorInput.backgroundColor && colorInput.backgroundColor.trim()) {
            const parsedBg = this.parseColorValue(colorInput.backgroundColor);
            if (parsedBg) {
                colors.backgroundColor = parsedBg;
                ConfigUtils.debugLog(`背景色適用: ${colorInput.backgroundColor} → ${parsedBg}`, 'config');
            }
        }
        
        // ヘッダー文字色
        if (colorInput.headerTextColor && colorInput.headerTextColor.trim()) {
            const parsedText = this.parseColorValue(colorInput.headerTextColor);
            if (parsedText) {
                colors.headerTextColor = parsedText;
                ConfigUtils.debugLog(`文字色適用: ${colorInput.headerTextColor} → ${parsedText}`, 'config');
            }
        }
        
        return colors;
    },

    /**
     * カスタム色が使用されているかチェック
     * @param {Object} colors - 色設定
     * @returns {boolean} カスタム色使用フラグ
     */
    hasCustomColors(colors) {
        if (!colors) return false;
        
        const defaultColors = CONFIG.COLOR_SYSTEM.DEFAULT_COLORS;
        const hasCustomBorder = colors.borderColor && colors.borderColor !== defaultColors.borderColor;
        const hasCustomBackground = colors.backgroundColor && colors.backgroundColor !== defaultColors.backgroundColor;
        const hasCustomHeaderText = colors.headerTextColor && colors.headerTextColor !== defaultColors.headerTextColor;
        const hasCustomHeaderBg = colors.headerBackgroundColor && colors.headerBackgroundColor !== defaultColors.headerBackgroundColor;
        
        return hasCustomBorder || hasCustomBackground || hasCustomHeaderText || hasCustomHeaderBg;
    },

    /**
     * 色の明度を計算してコントラスト色を取得
     * @param {string} hexColor - HEX色
     * @returns {string} コントラスト色（白または黒）
     */
    getContrastColor(hexColor) {
        if (!hexColor || !hexColor.startsWith('#')) return '#000000';
        
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // 明度計算（0.299*R + 0.587*G + 0.114*B）
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        
        return brightness > 128 ? '#000000' : '#ffffff';
    },

    /**
     * 色設定の統計情報を取得
     * @param {Map} organizationsMap - 組織データマップ
     * @returns {Object} 色統計情報
     */
    getColorStatistics(organizationsMap) {
        let defaultCount = 0;
        let customCount = 0;
        let colorPatterns = new Set();
        
        organizationsMap.forEach((orgData, orgName) => {
            if (orgData.colors && this.hasCustomColors(orgData.colors)) {
                customCount++;
                const pattern = JSON.stringify({
                    borderColor: orgData.colors.borderColor,
                    backgroundColor: orgData.colors.backgroundColor,
                    headerTextColor: orgData.colors.headerTextColor
                });
                colorPatterns.add(pattern);
            } else {
                defaultCount++;
            }
        });
        
        return {
            total: organizationsMap.size,
            defaultCount,
            customCount,
            patternCount: colorPatterns.size,
            customPercentage: organizationsMap.size > 0 ? Math.round((customCount / organizationsMap.size) * 100) : 0
        };
    },

    /**
     * デバッグ用の詳細ログ出力
     */
    debugDetailed() {
        if (!CONFIG.DEBUG.ENABLED) return;
        
        console.log('\n=== CONFIG デバッグ情報 ===');
        console.log('パレット色数:', Object.keys(CONFIG.COLOR_SYSTEM.PALETTE_COLORS).length);
        console.log('部門プリセット数:', Object.keys(CONFIG.COLOR_SYSTEM.DEPARTMENT_PRESETS).length);
        console.log('基本色名数:', Object.keys(CONFIG.COLOR_SYSTEM.COLOR_NAMES).length);
        console.log('デフォルト色:', CONFIG.COLOR_SYSTEM.DEFAULT_COLORS);
        
        console.log('\nパレット色一覧:');
        Object.entries(CONFIG.COLOR_SYSTEM.PALETTE_COLORS).forEach(([key, data]) => {
            console.log(`  ${key}: ${data.name} (${data.hex})`);
        });
        
        console.log('\n部門プリセット一覧:');
        Object.entries(CONFIG.COLOR_SYSTEM.DEPARTMENT_PRESETS).forEach(([key, preset]) => {
            console.log(`  ${key}: ${preset.name}`);
            console.log(`    枠線: ${this.getPaletteColor(preset.borderColor)}`);
            console.log(`    背景: ${this.getPaletteColor(preset.backgroundColor)}`);
            console.log(`    文字: ${preset.headerTextColor}`);
        });
    }
};

// グローバルに公開
window.CONFIG = CONFIG;
window.CORRECTED_SAMPLE_DATA = CORRECTED_SAMPLE_DATA;
window.ConfigUtils = ConfigUtils;
window.LANG = LANG;
window.CURRENT_LANG = CURRENT_LANG;
window.t = t;
window.LanguageManager = LanguageManager;