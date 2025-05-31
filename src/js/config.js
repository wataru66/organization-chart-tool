/**
 * 組織図作成ツール - 設定ファイル（色指定システム対応版）
 * アプリケーションの設定値とデモデータを管理
 */

// アプリケーション設定
const CONFIG = {
    // デフォルト設定値
    DEFAULTS: {
        SPACING: { x: 120, y: 140 }, // 横間隔を調整
        BOX_SIZE: { width: 85, height: 100 }, // 横幅を3割縮小
        FONT_SIZES: {
            small: { org: '10px', name: '8px', role: '7px' },
            medium: { org: '12px', name: '10px', role: '9px' },
            large: { org: '14px', name: '12px', role: '11px' }
        },
        BOX_SIZES: {
            small: { width: '70px', height: '80px', spacingX: '95px', spacingY: '110px' },
            medium: { width: '85px', height: '100px', spacingX: '120px', spacingY: '140px' },
            large: { width: '100px', height: '120px', spacingX: '145px', spacingY: '170px' }
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
        HORIZONTAL_SPACING: 120,
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
        
        // 部門別推奨色設定（改善版）
        DEPARTMENT_PRESETS: {
            'direct': {
                name: '直接部門',
                borderColor: 'blue-medium',
                backgroundColor: 'blue-light',
                headerTextColor: '#ffffff'
            },
            'indirect': {
                name: '間接部門',
                borderColor: 'green-medium',
                backgroundColor: 'green-light',
                headerTextColor: '#ffffff'
            },
            'management': {
                name: '管理部門',
                borderColor: 'purple-medium',
                backgroundColor: 'purple-light',
                headerTextColor: '#ffffff'
            },
            'sales': {
                name: '営業部門',
                borderColor: 'orange-medium',
                backgroundColor: 'orange-light',
                headerTextColor: '#ffffff'
            },
            'support': {
                name: 'サポート部門',
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

// 修正済みサンプルデータ（色指定対応版 - カスタム色設定を含む）
// [階層, 従業員番号, 名前, Name, Grade, Team Long Name, Call Name, 兼任, Parent, Role, 役割, 枠線色, 背景色, ヘッダー文字色]
const CORRECTED_SAMPLE_DATA = [
    [1, "", "鈴木太郎", "Suzuki Taro", "M4", "インドネシア社", "YKK IDN", "", "N/A", "President", "社長", "#2196f3", "#e3f2fd", "#ffffff"],
    [2, "", "有田次郎", "Arita Jiro", "M3", "Production", "Production", "", "YKK IDN", "Factory manager", "工場長", "#4caf50", "#f1f8e9", "#ffffff"],
    [3, "", "KBU", "Kristanta Budi Utama", "M3", "Cimanggis Factory", "CMG", "", "Production", "deputy factory manager", "工場長", "#9c27b0", "#f3e5f5", "#ffffff"],
    [3, "", "Hindam", "Hindam", "M3", "Cibitun Factory", "CBT", "", "Production", "deputy factory manager", "工場長", "#ff9800", "#fff3e0", "#ffffff"],
    [4, "", "中西航", "Nakanishi Wataru", "P2", "Finishing goods", "Zipper Assemble", "", "CMG", "Advisor", "Advisor", "#f44336", "#ffebee", "#ffffff"],
    [5, "", "西尾亮介", "Nishio Ryosuke", "PC", "Plastic Fastener", "PF", "", "Zipper Assemble", "Advisor", "Advisor", "#2e7d32", "#f1f8e9", "#ffffff"],
    [6, "", "Fajar", "Fajar", "M1", "Plastic Fastener", "PF", "", "Zipper Assemble", "Department Manager", "部門長", "#1565c0", "#e3f2fd", "#ffffff"],
    [6, "", "Budi", "Budi", "E5", "DOM工程", "DOM", "", "PF", "Section Manager", "工程長", "#6a1b9a", "#f3e5f5", "#ffffff"],
    [6, "", "品質管理", "QC Team", "E3", "Quality Control", "QC", "", "PF", "QC Manager", "品質管理", "#e65100", "#fff3e0", "#ffffff"],
    [6, "", "保全", "Maintenance", "E4", "Maintenance", "MT", "", "PF", "Maintenance Manager", "保全", "#c62828", "#ffebee", "#ffffff"]
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