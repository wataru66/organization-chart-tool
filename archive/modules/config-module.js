/**
 * Organization Chart Tool - Configuration Module (v4)
 * 設定管理、言語システム、サンプルデータを統合
 */

// === 1. 言語定義 ===
const LANG = {
    en: {
        // Language selection
        languageLabel: "Language:",
        
        // Page title and headers
        title: "Organization Chart Tool",
        subtitle: "Automatically generate organization charts from Excel files",
        usage: "💡 <strong>Usage:</strong> 1️⃣ Select file → 2️⃣ Validate data → 3️⃣ Generate chart → 4️⃣ Export",
        
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
        exportEmptyTemplate: "Export Empty Template",
        exportCurrentData: "Export Current Data",
        exportHTML: "Export HTML",
        
        // Data table
        dataTableTitle: "Data Table - Validation & Edit",
        addNewRow: "Add New Row",
        applyChanges: "Apply Changes",
        closeTable: "Close Table",
        
        // Table headers (新構造)
        tableHeaders: {
            rowNumber: "#",
            dragHandle: "☰",
            actions: "Actions",
            level: "Level",
            teamName: "Team Name",
            exactTeamName: "Exact Team Name",
            upperTeam: "Upper Team",
            teamId: "Team ID",
            role: "Role",
            role2ndLang: "Role(2nd Lang)",
            teamBoss: "Team Boss",
            picName: "PIC Name",
            picName2ndLang: "PIC Name(2nd Lang)",
            concurrent: "Concurrent Position",
            employeeCd: "Employee CD",
            grade: "Grade",
            memo: "Memo",
            borderColor: "Border Color",
            headerBgColor: "Header BG Color",
            headerTextColor: "Header Text Color",
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
        changesApplied: "Changes applied successfully\\n{{count}} rows of data applied\\n\\nClick 'Generate Chart' to see the updated chart.",
        
        // Validation messages
        nameRequired: "Name is required",
        teamNameRequired: "Team Name is required",
        roleRequired: "Role is required",
        levelOutOfRange: "Level must be between 1-10",
        parentNotFound: "Parent organization not found",
        circularReference: "Circular reference detected",
        
        // Export messages
        exportStarted: "Download started",
        emptyTemplateExported: "Empty template exported successfully.",
        currentDataExported: "Current data exported successfully.",
        htmlExported: "Standalone HTML exported successfully.",
        
        // Button groups
        dataOperations: "📁 Data Operations",
        dataEditingValidation: "🛠️ Data Editing & Validation",
        chartGeneration: "🎯 Chart Generation",
        exportOutput: "📤 Export & Output"
    },
    ja: {
        // Language selection
        languageLabel: "言語:",
        
        // Page title and headers
        title: "組織図作成ツール",
        subtitle: "Excelファイルから組織図を自動生成",
        usage: "💡 <strong>使用方法:</strong> 1️⃣ ファイル選択 → 2️⃣ データ検証 → 3️⃣ 組織図生成 → 4️⃣ エクスポート",
        
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
        showDataTable: "データテーブル表示・編集",
        validateData: "データ検証",
        exportSVG: "SVGエクスポート",
        exportPNG: "PNGエクスポート",
        print: "印刷",
        fullScreen: "フルスクリーン",
        exitFullScreen: "フルスクリーン終了",
        loadSampleData: "サンプルデータ読み込み",
        exportEmptyTemplate: "空のテンプレートをエクスポート",
        exportCurrentData: "現在のデータをエクスポート",
        exportHTML: "HTMLエクスポート",
        
        // Data table
        dataTableTitle: "データテーブル - 検証と編集",
        addNewRow: "新規行追加",
        applyChanges: "変更を適用",
        closeTable: "テーブルを閉じる",
        
        // Table headers (新構造)
        tableHeaders: {
            rowNumber: "#",
            dragHandle: "☰",
            actions: "操作",
            level: "レベル",
            teamName: "チーム名",
            exactTeamName: "正式チーム名",
            upperTeam: "上位チーム",
            teamId: "チームID",
            role: "役職",
            role2ndLang: "役職（第2言語）",
            teamBoss: "チーム長",
            picName: "担当者名",
            picName2ndLang: "担当者名（第2言語）",
            concurrent: "兼任",
            employeeCd: "社員番号",
            grade: "等級",
            memo: "メモ",
            borderColor: "枠線色",
            headerBgColor: "ヘッダー背景色",
            headerTextColor: "ヘッダー文字色",
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
        changesApplied: "変更が正常に適用されました\\n{{count}}行のデータが適用されました\\n\\n「組織図生成」をクリックして更新された組織図を確認してください。",
        
        // Validation messages
        nameRequired: "担当者名は必須です",
        teamNameRequired: "チーム名は必須です",
        roleRequired: "役職は必須です",
        levelOutOfRange: "レベルは1-10の範囲で入力してください",
        parentNotFound: "上位組織が見つかりません",
        circularReference: "循環参照が検出されました",
        
        // Export messages
        exportStarted: "ダウンロードを開始しました",
        emptyTemplateExported: "空のテンプレートが正常にエクスポートされました。",
        currentDataExported: "現在のデータが正常にエクスポートされました。",
        htmlExported: "スタンドアロンHTMLが正常にエクスポートされました。",
        
        // Button groups
        dataOperations: "📁 データ操作",
        dataEditingValidation: "🛠️ データ編集・検証",
        chartGeneration: "🎯 組織図生成",
        exportOutput: "📤 エクスポート・出力"
    },
    id: {
        // Language selection
        languageLabel: "Bahasa:",
        
        // Page title and headers
        title: "Alat Bagan Organisasi",
        subtitle: "Otomatis membuat bagan organisasi dari file Excel",
        usage: "💡 <strong>Penggunaan:</strong> 1️⃣ Pilih file → 2️⃣ Validasi data → 3️⃣ Buat bagan → 4️⃣ Ekspor",
        
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
        exportEmptyTemplate: "Ekspor Template Kosong",
        exportCurrentData: "Ekspor Data Saat Ini",
        exportHTML: "Ekspor HTML",
        
        // Data table
        dataTableTitle: "Tabel Data - Validasi & Edit",
        addNewRow: "Tambah Baris Baru",
        applyChanges: "Terapkan Perubahan",
        closeTable: "Tutup Tabel",
        
        // Table headers (新構造)
        tableHeaders: {
            rowNumber: "#",
            dragHandle: "☰",
            actions: "Aksi",
            level: "Level",
            teamName: "Nama Tim",
            exactTeamName: "Nama Tim Lengkap",
            upperTeam: "Tim Atas",
            teamId: "ID Tim",
            role: "Peran",
            role2ndLang: "Peran(Bahasa 2)",
            teamBoss: "Kepala Tim",
            picName: "Nama PIC",
            picName2ndLang: "Nama PIC(Bahasa 2)",
            concurrent: "Posisi Rangkap",
            employeeCd: "Kode Karyawan",
            grade: "Grade",
            memo: "Memo",
            borderColor: "Warna Border",
            headerBgColor: "Warna Latar Header",
            headerTextColor: "Warna Teks Header",
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
        changesApplied: "Perubahan berhasil diterapkan\\n{{count}} baris data diterapkan\\n\\nKlik 'Buat Bagan' untuk melihat bagan yang diperbarui.",
        
        // Validation messages
        nameRequired: "Nama PIC wajib diisi",
        teamNameRequired: "Nama Tim wajib diisi",
        roleRequired: "Peran wajib diisi",
        levelOutOfRange: "Level harus antara 1-10",
        parentNotFound: "Organisasi induk tidak ditemukan",
        circularReference: "Referensi melingkar terdeteksi",
        
        // Export messages
        exportStarted: "Unduhan dimulai",
        emptyTemplateExported: "Template kosong berhasil diekspor.",
        currentDataExported: "Data saat ini berhasil diekspor.",
        htmlExported: "HTML mandiri berhasil diekspor.",
        
        // Button groups
        dataOperations: "📁 Operasi Data",
        dataEditingValidation: "🛠️ Edit & Validasi Data",
        chartGeneration: "🎯 Pembuatan Bagan",
        exportOutput: "📤 Ekspor & Output"
    }
};

// === 2. 言語管理システム ===
let CURRENT_LANG = localStorage.getItem('organizationChartLang') || 'en';

const AVAILABLE_LANGUAGES = {
    'en': 'English',
    'ja': '日本語',
    'id': 'Bahasa Indonesia'
};

function t(key, params = {}) {
    const keys = key.split('.');
    let value = LANG[CURRENT_LANG];
    
    for (const k of keys) {
        value = value?.[k];
        if (!value) break;
    }
    
    if (typeof value === 'string') {
        return value.replace(/\{\{(\w+)\}\}/g, (match, param) => params[param] || match);
    }
    
    return key;
}

const LanguageManager = {
    getCurrentLanguage() {
        return CURRENT_LANG;
    },
    
    setLanguage(langCode) {
        if (LANG[langCode]) {
            CURRENT_LANG = langCode;
            localStorage.setItem('organizationChartLang', langCode);
            this.updatePageContent();
            console.log(`Language changed to: ${langCode}`);
        } else {
            console.error(`Language not supported: ${langCode}`);
        }
    },
    
    getAvailableLanguages() {
        return AVAILABLE_LANGUAGES;
    },
    
    updatePageContent() {
        document.title = t('title');
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const paramsAttr = element.getAttribute('data-i18n-params');
            let params = {};
            
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
        
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const paramsAttr = element.getAttribute('data-i18n-params');
            let params = {};
            
            if (paramsAttr) {
                try {
                    params = JSON.parse(paramsAttr);
                } catch (e) {
                    console.warn('Invalid data-i18n-params JSON for HTML element:', paramsAttr);
                }
            }
            
            element.innerHTML = t(key, params);
        });
        
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = CURRENT_LANG;
        }
        
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: CURRENT_LANG } 
        }));
    },
    
    initialize() {
        this.createLanguageSelector();
        this.updatePageContent();
        console.log('Language system initialized with: ' + CURRENT_LANG);
    },
    
    createLanguageSelector() {
        const headerTop = document.querySelector('.header-top') || document.querySelector('.header') || document.querySelector('.controls') || document.body;
        
        if (document.getElementById('languageSelector')) {
            return;
        }
        
        const selectorContainer = document.createElement('div');
        selectorContainer.id = 'languageSelector';
        selectorContainer.className = 'language-selector';
        selectorContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        const label = document.createElement('label');
        label.setAttribute('data-i18n', 'languageLabel');
        label.textContent = t('languageLabel');
        label.style.cssText = `
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #4a5568;
        `;
        
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
        
        Object.entries(AVAILABLE_LANGUAGES).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            if (code === CURRENT_LANG) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });
        
        selectorContainer.appendChild(label);
        selectorContainer.appendChild(select);
        
        if (headerTop.classList.contains('header-top')) {
            headerTop.appendChild(selectorContainer);
        } else {
            if (headerTop.firstChild) {
                headerTop.insertBefore(selectorContainer, headerTop.firstChild);
            } else {
                headerTop.appendChild(selectorContainer);
            }
        }
    }
};

// === 3. 設定システム ===
const CONFIG = {
    DEFAULTS: {
        SPACING: { x: 72, y: 140 },
        BOX_SIZE: { width: 85, height: 100 },
        FONT_SIZES: {
            small: { org: '10px', name: '8px', role: '7px' },
            medium: { org: '12px', name: '10px', role: '9px' },
            large: { org: '14px', name: '12px', role: '11px' }
        },
        BOX_SIZES: {
            small: { width: '104px', height: '130px', spacingX: '127px', spacingY: '150px' },
            medium: { width: '138px', height: '160px', spacingX: '161px', spacingY: '180px' },
            large: { width: '161px', height: '180px', spacingX: '184px', spacingY: '210px' }
        }
    },
    
    DATA_PROCESSING: {
        REQUIRED_FIELDS: ['level', 'teamName', 'picName', 'role', 'upperTeam'],
        MANAGER_KEYWORDS: ['長', 'Manager', 'manager', 'Head', 'Chief', 'President', 'Director'],
        ADVISOR_KEYWORDS: ['アドバイザ', 'Advisor', 'advisor']
    },
    
    LAYOUT: {
        MIN_SPACING: 24,
        VERTICAL_SPACING: 140,
        HORIZONTAL_SPACING: 24,
        MARGIN: 50,
        CONNECTION_LINE_OFFSET: 20
    },
    
    DEBUG: {
        ENABLED: true,
        LOG_LAYOUT_CALCULATION: true,
        LOG_DATA_PROCESSING: true
    }
};

// === 4. サンプルデータ（新構造対応） ===
// [Level, Team Name, Exact Team Name, Upper Team, Team ID, Role, Role(2nd Lang), Team Boss, PIC Name, PIC Name(2nd Lang), Concurrent Position, Employee CD, Grade, Memo, Border Color, Header BG Color, Header Text Color]
const CORRECTED_SAMPLE_DATA = [
    // Level 1 - Executive
    [1, "Global MFG", "Global Manufacturing Corp", "", "HQ001", "Chief Executive Officer", "最高経営責任者", true, "Robert Johnson", "ロバート・ジョンソン", "", "001", "CEO", "", "#2196f3", "#e3f2fd", "#000000"],
    
    // Level 2 - C-Level Executives  
    [2, "Operations", "Operations Division", "Global MFG", "OPS001", "Chief Operating Officer", "最高執行責任者", true, "Sarah Williams", "サラ・ウィリアムズ", "", "002", "COO", "", "#4caf50", "#f1f8e9", "#000000"],
    [2, "Finance", "Finance Division", "Global MFG", "FIN001", "Chief Financial Officer", "最高財務責任者", true, "Michael Chen", "マイケル・チェン", "", "003", "CFO", "", "#ff9800", "#fff3e0", "#000000"],
    [2, "HR", "Human Resources Division", "Global MFG", "HR001", "Chief Human Resources Officer", "最高人事責任者", true, "Jennifer Davis", "ジェニファー・デイビス", "", "004", "CHRO", "", "#9c27b0", "#f3e5f5", "#000000"],
    [2, "IT", "Technology Division", "Global MFG", "IT001", "Chief Technology Officer", "最高技術責任者", true, "David Miller", "デイビッド・ミラー", "", "005", "CTO", "", "#f44336", "#ffebee", "#000000"],
    
    // Level 3 - Vice Presidents
    [3, "Manufacturing", "Manufacturing Operations", "Operations", "MFG001", "Vice President Manufacturing", "製造担当副社長", true, "Amanda Rodriguez", "アマンダ・ロドリゲス", "", "006", "VP", "", "#4caf50", "#f1f8e9", "#000000"],
    [3, "Quality", "Quality Assurance", "Operations", "QA001", "Vice President Quality", "品質担当副社長", true, "James Thompson", "ジェームス・トンプソン", "", "007", "VP", "", "#2196f3", "#e3f2fd", "#000000"],
    [3, "Supply Chain", "Supply Chain Management", "Operations", "SCM001", "Vice President Supply Chain", "サプライチェーン担当副社長", true, "Lisa Anderson", "リサ・アンダーソン", "", "008", "VP", "", "#ff9800", "#fff3e0", "#000000"],
    [3, "Engineering", "Engineering Division", "Operations", "ENG001", "Vice President Engineering", "エンジニアリング担当副社長", true, "Thomas Wilson", "トーマス・ウィルソン", "", "009", "VP", "", "#9c27b0", "#f3e5f5", "#000000"],
    [3, "Sales", "Sales & Marketing", "Global MFG", "SAL001", "Vice President Sales", "営業担当副社長", true, "Emily Brown", "エミリー・ブラウン", "", "010", "VP", "", "#f44336", "#ffebee", "#000000"],
    
    // Level 4 - Directors
    [4, "Plant 1", "Production Plant 1", "Manufacturing", "PROD1", "Plant Director", "工場長", true, "Christopher Lee", "クリストファー・リー", "", "011", "DIR", "", "#4caf50", "#f1f8e9", "#000000"],
    [4, "Plant 2", "Production Plant 2", "Manufacturing", "PROD2", "Plant Director", "工場長", true, "Maria Garcia", "マリア・ガルシア", "", "012", "DIR", "", "#4caf50", "#f1f8e9", "#000000"],
    [4, "Plant 3", "Production Plant 3", "Manufacturing", "PROD3", "Plant Director", "工場長", true, "Kevin White", "ケビン・ホワイト", "", "013", "DIR", "", "#4caf50", "#f1f8e9", "#000000"],
    [4, "QC", "Quality Control", "Quality", "QC001", "Quality Director", "品質管理部長", true, "Rachel Martin", "レイチェル・マーティン", "", "014", "DIR", "", "#2196f3", "#e3f2fd", "#000000"],
    [4, "R&D", "Research & Development", "Engineering", "R&D001", "R&D Director", "研究開発部長", true, "Daniel Taylor", "ダニエル・テイラー", "", "015", "DIR", "", "#9c27b0", "#f3e5f5", "#000000"],
    [4, "Procurement", "Procurement Division", "Supply Chain", "PROC001", "Procurement Director", "調達部長", true, "Jessica Moore", "ジェシカ・ムーア", "", "016", "DIR", "", "#ff9800", "#fff3e0", "#000000"],
    [4, "Logistics", "Logistics Division", "Supply Chain", "LOG001", "Logistics Director", "物流部長", true, "Paul Jackson", "ポール・ジャクソン", "", "017", "DIR", "", "#ff9800", "#fff3e0", "#000000"],
    [4, "Marketing", "Marketing Division", "Sales", "MKTG001", "Marketing Director", "マーケティング部長", true, "Laura Adams", "ローラ・アダムス", "", "018", "DIR", "", "#f44336", "#ffebee", "#000000"],
    [4, "Sales North", "Regional Sales North", "Sales", "SALES1", "Sales Director", "営業部長", true, "Brian Clark", "ブライアン・クラーク", "", "019", "DIR", "", "#f44336", "#ffebee", "#000000"],
    [4, "Sales South", "Regional Sales South", "Sales", "SALES2", "Sales Director", "営業部長", true, "Nicole Lewis", "ニコール・ルイス", "", "020", "DIR", "", "#f44336", "#ffebee", "#000000"],
    
    // Level 5 - Managers
    [5, "Assembly 1", "Assembly Line 1", "Plant 1", "ASM001", "Assembly Manager", "組立管理者", true, "Andrew Hall", "アンドリュー・ホール", "", "021", "MGR", "", "#4caf50", "#f1f8e9", "#000000"],
    [5, "Assembly 2", "Assembly Line 2", "Plant 1", "ASM002", "Assembly Manager", "組立管理者", true, "Michelle Young", "ミシェル・ヤング", "", "022", "MGR", "", "#4caf50", "#f1f8e9", "#000000"],
    [5, "Machining", "Machining Department", "Plant 1", "MCH001", "Machining Manager", "機械加工管理者", true, "Steven King", "スティーブン・キング", "", "023", "MGR", "", "#4caf50", "#f1f8e9", "#000000"],
    [5, "Welding", "Welding Department", "Plant 2", "WLD001", "Welding Manager", "溶接管理者", true, "Rebecca Wright", "レベッカ・ライト", "", "024", "MGR", "", "#4caf50", "#f1f8e9", "#000000"],
    [5, "Finishing", "Finishing Department", "Plant 2", "FIN001", "Finishing Manager", "仕上げ管理者", true, "John Scott", "ジョン・スコット", "", "025", "MGR", "", "#4caf50", "#f1f8e9", "#000000"],
    [5, "Packaging", "Packaging Department", "Plant 3", "PKG001", "Packaging Manager", "包装管理者", true, "Karen Green", "カレン・グリーン", "", "026", "MGR", "", "#4caf50", "#f1f8e9", "#000000"],
    [5, "Shipping", "Shipping Department", "Plant 3", "SHP001", "Shipping Manager", "出荷管理者", true, "Robert Turner", "ロバート・ターナー", "", "027", "MGR", "", "#4caf50", "#f1f8e9", "#000000"],
    [5, "QC Lab", "QC Laboratory", "QC", "QCLAB", "Lab Manager", "検査室管理者", true, "Amy Phillips", "エイミー・フィリップス", "", "028", "MGR", "", "#2196f3", "#e3f2fd", "#000000"],
    [5, "QC Field", "Field Quality Control", "QC", "QCFLD", "Field QC Manager", "現場品質管理者", true, "Mark Campbell", "マーク・キャンベル", "", "029", "MGR", "", "#2196f3", "#e3f2fd", "#000000"],
    [5, "Product Dev", "Product Development", "R&D", "PRDDEV", "Product Development Manager", "製品開発管理者", true, "Stephanie Parker", "ステファニー・パーカー", "", "030", "MGR", "", "#9c27b0", "#f3e5f5", "#000000"],
    
    // Level 6 - Supervisors
    [6, "Asm Team A", "Assembly Team A", "Assembly 1", "ASM1A", "Team Supervisor", "チームリーダー", true, "Ryan Evans", "ライアン・エバンス", "", "031", "SUP", "", "#4caf50", "#f1f8e9", "#000000"],
    [6, "Asm Team B", "Assembly Team B", "Assembly 1", "ASM1B", "Team Supervisor", "チームリーダー", true, "Crystal Collins", "クリスタル・コリンズ", "", "032", "SUP", "", "#4caf50", "#f1f8e9", "#000000"],
    [6, "Asm Team C", "Assembly Team C", "Assembly 2", "ASM2A", "Team Supervisor", "チームリーダー", true, "Gregory Stewart", "グレゴリー・スチュワート", "", "033", "SUP", "", "#4caf50", "#f1f8e9", "#000000"],
    [6, "Mach Team A", "Machining Team A", "Machining", "MCH1A", "Team Supervisor", "チームリーダー", true, "Heather Morris", "ヘザー・モリス", "", "034", "SUP", "", "#4caf50", "#f1f8e9", "#000000"],
    [6, "Mach Team B", "Machining Team B", "Machining", "MCH1B", "Team Supervisor", "チームリーダー", true, "Brandon Rogers", "ブランドン・ロジャース", "", "035", "SUP", "", "#4caf50", "#f1f8e9", "#000000"],
    [6, "Weld Team A", "Welding Team A", "Welding", "WLD1A", "Team Supervisor", "チームリーダー", true, "Vanessa Reed", "バネッサ・リード", "", "036", "SUP", "", "#4caf50", "#f1f8e9", "#000000"],
    [6, "Weld Team B", "Welding Team B", "Welding", "WLD1B", "Team Supervisor", "チームリーダー", true, "Eric Cook", "エリック・クック", "", "037", "SUP", "", "#4caf50", "#f1f8e9", "#000000"],
    [6, "Fin Team A", "Finishing Team A", "Finishing", "FIN1A", "Team Supervisor", "チームリーダー", true, "Diana Bailey", "ダイアナ・ベイリー", "", "038", "SUP", "", "#4caf50", "#f1f8e9", "#000000"],
    [6, "Pkg Team A", "Packaging Team A", "Packaging", "PKG1A", "Team Supervisor", "チームリーダー", true, "Justin Rivera", "ジャスティン・リベラ", "", "039", "SUP", "", "#4caf50", "#f1f8e9", "#000000"],
    [6, "Ship Team A", "Shipping Team A", "Shipping", "SHP1A", "Team Supervisor", "チームリーダー", true, "Samantha Cooper", "サマンサ・クーパー", "", "040", "SUP", "", "#4caf50", "#f1f8e9", "#000000"]
];

// サンプルデータエイリアス（互換性のため）
const SAMPLE_DATA = CORRECTED_SAMPLE_DATA;

// === 5. ユーティリティ ===
const ConfigUtils = {
    debugLog(message, category = 'general') {
        if (!CONFIG.DEBUG.ENABLED) return;
        
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [${category.toUpperCase()}] ${message}`);
    },
    
    updateCSSVariables(variables) {
        const root = document.documentElement;
        Object.entries(variables).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    },
    
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], CONFIG);
    }
};

// === 6. モジュールAPI ===
const ConfigModule = {
    LANG,
    CURRENT_LANG,
    AVAILABLE_LANGUAGES,
    t,
    LanguageManager: {
        getInstance() {
            return {
                ...LanguageManager,
                t: t
            };
        },
        getCurrentLanguage: () => LanguageManager.getCurrentLanguage(),
        setLanguage: (lang) => LanguageManager.setLanguage(lang),
        getAvailableLanguages: () => LanguageManager.getAvailableLanguages(),
        updatePageContent: () => LanguageManager.updatePageContent(),
        initialize: () => LanguageManager.initialize(),
        t: t
    },
    CONFIG,
    SAMPLE_DATA,
    CORRECTED_SAMPLE_DATA,
    ConfigUtils
};

// === 7. エクスポート ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigModule;
} else {
    // ブラウザ環境でグローバルに公開
    window.ConfigModule = ConfigModule;
    
    // 後方互換性のための個別エクスポート
    window.LANG = LANG;
    window.CURRENT_LANG = CURRENT_LANG;
    window.AVAILABLE_LANGUAGES = AVAILABLE_LANGUAGES;
    window.t = t;
    window.LanguageManager = LanguageManager;
    window.CONFIG = CONFIG;
    window.SAMPLE_DATA = SAMPLE_DATA;
    window.CORRECTED_SAMPLE_DATA = CORRECTED_SAMPLE_DATA;
    window.ConfigUtils = ConfigUtils;
}