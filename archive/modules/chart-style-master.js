/**
 * Organization Chart Tool - Chart Style Master (v4)
 * 組織図描画設定のマスタデータ管理
 */

// === 1. チームボックススタイルマスタ ===
const CHART_STYLE_MASTER = {
    // ボックスサイズ設定
    BOX_SIZES: {
        'extra-small': {
            name: 'Extra Small',
            width: 60,
            height: 70,
            spacingX: 45,
            spacingY: 100,
            description: '極小サイズ - 多数の組織表示用'
        },
        'small': {
            name: 'Small',
            width: 70,
            height: 80,
            spacingX: 57,
            spacingY: 120,
            description: '小サイズ - コンパクト表示'
        },
        'medium': {
            name: 'Medium',
            width: 85,
            height: 100,
            spacingX: 72,
            spacingY: 140,
            description: '標準サイズ - バランス重視',
            default: true
        },
        'large': {
            name: 'Large',
            width: 100,
            height: 120,
            spacingX: 87,
            spacingY: 170,
            description: '大サイズ - 詳細表示'
        },
        'extra-large': {
            name: 'Extra Large',
            width: 120,
            height: 140,
            spacingX: 105,
            spacingY: 200,
            description: '特大サイズ - プレゼン用'
        }
    },

    // フォントサイズ設定
    FONT_SIZES: {
        'tiny': {
            name: 'Tiny',
            teamName: '8px',
            picName: '7px',
            role: '6px',
            description: '極小フォント'
        },
        'small': {
            name: 'Small',
            teamName: '10px',
            picName: '8px',
            role: '7px',
            description: '小フォント - 密集表示用'
        },
        'medium': {
            name: 'Medium',
            teamName: '12px',
            picName: '10px',
            role: '9px',
            description: '標準フォント - 読みやすさ重視',
            default: true
        },
        'large': {
            name: 'Large',
            teamName: '14px',
            picName: '12px',
            role: '11px',
            description: '大フォント - 視認性重視'
        },
        'extra-large': {
            name: 'Extra Large',
            teamName: '16px',
            picName: '14px',
            role: '13px',
            description: '特大フォント - プレゼン用'
        }
    },

    // 線のスタイル設定
    LINE_STYLES: {
        'thin': {
            name: 'Thin',
            width: 1,
            style: 'solid',
            color: '#333333',
            description: '細線 - シンプル'
        },
        'normal': {
            name: 'Normal',
            width: 2,
            style: 'solid',
            color: '#333333',
            description: '標準線 - バランス重視',
            default: true
        },
        'thick': {
            name: 'Thick',
            width: 3,
            style: 'solid',
            color: '#333333',
            description: '太線 - 強調表示'
        },
        'dashed': {
            name: 'Dashed',
            width: 2,
            style: 'dashed',
            dashArray: '5,5',
            color: '#666666',
            description: '点線 - 補助関係表示'
        },
        'dotted': {
            name: 'Dotted',
            width: 2,
            style: 'dotted',
            color: '#666666',
            description: '破線 - 一時的関係表示'
        }
    },

    // 色テーマ設定
    COLOR_THEMES: {
        'default': {
            name: 'Default',
            description: 'デフォルトカラー',
            boxBorder: '#333333',
            boxBackground: '#f9f9f9',
            headerBackground: '#4a5568',
            headerText: '#ffffff',
            bodyText: '#2d3748',
            lineColor: '#333333'
        },
        'blue': {
            name: 'Blue Theme',
            description: 'ブルー系カラー',
            boxBorder: '#2563eb',
            boxBackground: '#eff6ff',
            headerBackground: '#1d4ed8',
            headerText: '#ffffff',
            bodyText: '#1e40af',
            lineColor: '#2563eb'
        },
        'green': {
            name: 'Green Theme',
            description: 'グリーン系カラー',
            boxBorder: '#059669',
            boxBackground: '#ecfdf5',
            headerBackground: '#047857',
            headerText: '#ffffff',
            bodyText: '#065f46',
            lineColor: '#059669'
        },
        'purple': {
            name: 'Purple Theme',
            description: 'パープル系カラー',
            boxBorder: '#7c3aed',
            boxBackground: '#f3e8ff',
            headerBackground: '#6d28d9',
            headerText: '#ffffff',
            bodyText: '#5b21b6',
            lineColor: '#7c3aed'
        },
        'orange': {
            name: 'Orange Theme',
            description: 'オレンジ系カラー',
            boxBorder: '#ea580c',
            boxBackground: '#fff7ed',
            headerBackground: '#c2410c',
            headerText: '#ffffff',
            bodyText: '#9a3412',
            lineColor: '#ea580c'
        },
        'monochrome': {
            name: 'Monochrome',
            description: 'モノクロ - 印刷用',
            boxBorder: '#000000',
            boxBackground: '#ffffff',
            headerBackground: '#000000',
            headerText: '#ffffff',
            bodyText: '#000000',
            lineColor: '#000000'
        }
    },

    // レベル別スタイル設定
    LEVEL_STYLES: {
        1: {
            name: 'Level 1 (Executive)',
            headerBackground: '#1f2937',
            headerText: '#ffffff',
            fontWeight: 'bold',
            borderWidth: 3,
            priority: 'highest'
        },
        2: {
            name: 'Level 2 (Senior Management)',
            headerBackground: '#374151',
            headerText: '#ffffff',
            fontWeight: 'bold',
            borderWidth: 2,
            priority: 'high'
        },
        3: {
            name: 'Level 3 (Middle Management)',
            headerBackground: '#4b5563',
            headerText: '#ffffff',
            fontWeight: 'normal',
            borderWidth: 2,
            priority: 'medium'
        },
        4: {
            name: 'Level 4 (Department)',
            headerBackground: '#6b7280',
            headerText: '#ffffff',
            fontWeight: 'normal',
            borderWidth: 2,
            priority: 'medium'
        },
        5: {
            name: 'Level 5 (Team)',
            headerBackground: '#9ca3af',
            headerText: '#000000',
            fontWeight: 'normal',
            borderWidth: 1,
            priority: 'low'
        },
        6: {
            name: 'Level 6+ (Individual)',
            headerBackground: '#d1d5db',
            headerText: '#000000',
            fontWeight: 'normal',
            borderWidth: 1,
            priority: 'lowest'
        }
    },

    // 配置スタイル設定
    LAYOUT_STYLES: {
        'compact': {
            name: 'Compact',
            description: 'コンパクト配置 - 省スペース',
            spacingMultiplier: 0.8,
            marginMultiplier: 0.5,
            verticalSpacing: 100
        },
        'normal': {
            name: 'Normal',
            description: '標準配置 - バランス重視',
            spacingMultiplier: 1.0,
            marginMultiplier: 1.0,
            verticalSpacing: 140,
            default: true
        },
        'relaxed': {
            name: 'Relaxed',
            description: 'ゆったり配置 - 見やすさ重視',
            spacingMultiplier: 1.3,
            marginMultiplier: 1.5,
            verticalSpacing: 180
        },
        'presentation': {
            name: 'Presentation',
            description: 'プレゼン配置 - 大画面用',
            spacingMultiplier: 1.5,
            marginMultiplier: 2.0,
            verticalSpacing: 220
        }
    },

    // アニメーション設定
    ANIMATION_STYLES: {
        'none': {
            name: 'No Animation',
            description: 'アニメーションなし',
            duration: 0
        },
        'subtle': {
            name: 'Subtle',
            description: '控えめなアニメーション',
            duration: 200,
            easing: 'ease-out',
            fadeIn: true,
            slideIn: false
        },
        'smooth': {
            name: 'Smooth',
            description: 'スムーズなアニメーション',
            duration: 300,
            easing: 'ease-in-out',
            fadeIn: true,
            slideIn: true,
            default: true
        },
        'dynamic': {
            name: 'Dynamic',
            description: 'ダイナミックなアニメーション',
            duration: 500,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fadeIn: true,
            slideIn: true,
            bounce: true
        }
    }
};

// === 2. スタイル管理クラス ===
class ChartStyleManager {
    constructor() {
        this.currentStyle = {
            boxSize: 'medium',
            fontSize: 'medium',
            lineStyle: 'normal',
            colorTheme: 'default',
            layoutStyle: 'normal',
            animationStyle: 'smooth'
        };
        
        this.customOverrides = new Map();
        ConfigUtils.debugLog('ChartStyleManager initialized', 'style');
    }

    /**
     * スタイル設定を取得
     */
    getStyle(category, styleId) {
        const categoryData = CHART_STYLE_MASTER[category?.toUpperCase()];
        if (!categoryData) return null;
        
        return categoryData[styleId] || null;
    }

    /**
     * 現在のスタイル設定を取得
     */
    getCurrentStyle() {
        return {
            ...this.currentStyle,
            computed: this.computeCurrentStyle()
        };
    }

    /**
     * 現在のスタイルを計算
     */
    computeCurrentStyle() {
        const boxSize = this.getStyle('BOX_SIZES', this.currentStyle.boxSize);
        const fontSize = this.getStyle('FONT_SIZES', this.currentStyle.fontSize);
        const lineStyle = this.getStyle('LINE_STYLES', this.currentStyle.lineStyle);
        const colorTheme = this.getStyle('COLOR_THEMES', this.currentStyle.colorTheme);
        const layoutStyle = this.getStyle('LAYOUT_STYLES', this.currentStyle.layoutStyle);
        const animationStyle = this.getStyle('ANIMATION_STYLES', this.currentStyle.animationStyle);

        return {
            box: {
                width: boxSize?.width || 85,
                height: boxSize?.height || 100,
                spacingX: boxSize?.spacingX || 72,
                spacingY: (boxSize?.spacingY || 140) * (layoutStyle?.spacingMultiplier || 1),
                border: {
                    width: lineStyle?.width || 2,
                    style: lineStyle?.style || 'solid',
                    color: colorTheme?.boxBorder || '#333333'
                },
                background: colorTheme?.boxBackground || '#f9f9f9'
            },
            header: {
                background: colorTheme?.headerBackground || '#4a5568',
                color: colorTheme?.headerText || '#ffffff',
                fontSize: fontSize?.teamName || '12px',
                fontWeight: 'bold'
            },
            text: {
                picName: {
                    fontSize: fontSize?.picName || '10px',
                    color: colorTheme?.bodyText || '#2d3748',
                    fontWeight: 'bold'
                },
                role: {
                    fontSize: fontSize?.role || '9px',
                    color: colorTheme?.bodyText || '#2d3748',
                    fontWeight: 'normal'
                }
            },
            line: {
                width: lineStyle?.width || 2,
                style: lineStyle?.style || 'solid',
                color: lineStyle?.color || colorTheme?.lineColor || '#333333',
                dashArray: lineStyle?.dashArray || null
            },
            layout: {
                margin: 50 * (layoutStyle?.marginMultiplier || 1),
                verticalSpacing: layoutStyle?.verticalSpacing || 140
            },
            animation: {
                duration: animationStyle?.duration || 300,
                easing: animationStyle?.easing || 'ease-in-out'
            }
        };
    }

    /**
     * スタイル設定を変更
     */
    setStyle(category, styleId) {
        if (this.currentStyle.hasOwnProperty(category)) {
            const style = this.getStyle(category.toUpperCase().replace('STYLE', 'STYLES'), styleId);
            if (style) {
                this.currentStyle[category] = styleId;
                ConfigUtils.debugLog(`Style updated: ${category} = ${styleId}`, 'style');
                return true;
            }
        }
        return false;
    }

    /**
     * ボックスサイズを設定
     */
    setBoxSize(sizeId) {
        return this.setStyle('boxSize', sizeId);
    }

    /**
     * フォントサイズを設定
     */
    setFontSize(sizeId) {
        return this.setStyle('fontSize', sizeId);
    }

    /**
     * 線スタイルを設定
     */
    setLineStyle(styleId) {
        return this.setStyle('lineStyle', styleId);
    }

    /**
     * カラーテーマを設定
     */
    setColorTheme(themeId) {
        return this.setStyle('colorTheme', themeId);
    }

    /**
     * レイアウトスタイルを設定
     */
    setLayoutStyle(layoutId) {
        return this.setStyle('layoutStyle', layoutId);
    }

    /**
     * 現在のボックススタイルを取得
     */
    getCurrentBoxStyle() {
        const boxSize = this.getStyle('BOX_SIZES', this.currentStyle.boxSize);
        return boxSize || CHART_STYLE_MASTER.BOX_SIZES['medium'];
    }

    /**
     * 現在のフォントスタイルを取得
     */
    getCurrentFontStyle() {
        const fontSize = this.getStyle('FONT_SIZES', this.currentStyle.fontSize);
        return fontSize || CHART_STYLE_MASTER.FONT_SIZES['medium'];
    }

    /**
     * 現在の線スタイルを取得
     */
    getCurrentLineStyle() {
        const lineStyle = this.getStyle('LINE_STYLES', this.currentStyle.lineStyle);
        return lineStyle || CHART_STYLE_MASTER.LINE_STYLES['normal'];
    }

    /**
     * 現在のカラーテーマを取得
     */
    getCurrentColorTheme() {
        const colorTheme = this.getStyle('COLOR_THEMES', this.currentStyle.colorTheme);
        return colorTheme || CHART_STYLE_MASTER.COLOR_THEMES['default'];
    }

    /**
     * プリセットパックを適用
     */
    applyPresetPack(packName) {
        const packs = {
            minimal: {
                boxSize: 'small',
                fontSize: 'small',
                lineStyle: 'thin',
                colorTheme: 'default',
                layoutStyle: 'compact'
            },
            standard: {
                boxSize: 'medium',
                fontSize: 'medium',
                lineStyle: 'normal',
                colorTheme: 'default',
                layoutStyle: 'normal'
            },
            presentation: {
                boxSize: 'large',
                fontSize: 'large',
                lineStyle: 'thick',
                colorTheme: 'blue',
                layoutStyle: 'presentation'
            },
            print: {
                boxSize: 'medium',
                fontSize: 'medium',
                lineStyle: 'normal',
                colorTheme: 'monochrome',
                layoutStyle: 'normal'
            }
        };

        const pack = packs[packName];
        if (pack) {
            const updated = this.setStyles(pack);
            ConfigUtils.debugLog(`Applied preset pack: ${packName}`, 'style');
            return updated;
        } else {
            ConfigUtils.debugLog(`Unknown preset pack: ${packName}`, 'style');
            return [];
        }
    }

    /**
     * 複数のスタイルを一括設定
     */
    setStyles(styles) {
        const updated = [];
        Object.entries(styles).forEach(([category, styleId]) => {
            if (this.setStyle(category, styleId)) {
                updated.push(category);
            }
        });
        
        ConfigUtils.debugLog(`Bulk style update: ${updated.join(', ')}`, 'style');
        return updated;
    }

    /**
     * レベル別スタイルを取得
     */
    getLevelStyle(level) {
        const baseLevel = Math.min(Math.max(level, 1), 6);
        const levelStyle = CHART_STYLE_MASTER.LEVEL_STYLES[baseLevel] || CHART_STYLE_MASTER.LEVEL_STYLES[6];
        const currentTheme = this.getStyle('COLOR_THEMES', this.currentStyle.colorTheme);
        
        return {
            ...levelStyle,
            // テーマカラーで上書き（オプション）
            headerBackground: currentTheme?.headerBackground || levelStyle.headerBackground,
            headerText: currentTheme?.headerText || levelStyle.headerText
        };
    }

    /**
     * カスタムオーバーライドを設定
     */
    setCustomOverride(orgName, styleOverrides) {
        this.customOverrides.set(orgName, styleOverrides);
        ConfigUtils.debugLog(`Custom override set for: ${orgName}`, 'style');
    }

    /**
     * カスタムオーバーライドを取得
     */
    getCustomOverride(orgName) {
        return this.customOverrides.get(orgName) || null;
    }

    /**
     * 組織専用の計算済みスタイルを取得
     */
    getComputedStyleForOrg(orgName, level) {
        const baseStyle = this.computeCurrentStyle();
        const levelStyle = this.getLevelStyle(level);
        const customOverride = this.getCustomOverride(orgName);

        // スタイルをマージ
        return {
            ...baseStyle,
            header: {
                ...baseStyle.header,
                background: levelStyle.headerBackground,
                color: levelStyle.headerText,
                fontWeight: levelStyle.fontWeight
            },
            box: {
                ...baseStyle.box,
                border: {
                    ...baseStyle.box.border,
                    width: levelStyle.borderWidth || baseStyle.box.border.width
                }
            },
            // カスタムオーバーライドを適用
            ...(customOverride || {})
        };
    }

    /**
     * CSS変数を生成
     */
    generateCSSVariables() {
        const style = this.computeCurrentStyle();
        
        return {
            '--org-box-width': `${style.box.width}px`,
            '--org-box-height': `${style.box.height}px`,
            '--org-spacing-x': `${style.box.spacingX}px`,
            '--org-spacing-y': `${style.box.spacingY}px`,
            '--font-size-team': style.header.fontSize,
            '--font-size-pic': style.text.picName.fontSize,
            '--font-size-role': style.text.role.fontSize,
            '--box-border-width': `${style.box.border.width}px`,
            '--box-border-style': style.box.border.style,
            '--box-border-color': style.box.border.color,
            '--box-bg': style.box.background,
            '--header-bg': style.header.background,
            '--header-color': style.header.color,
            '--text-color': style.text.picName.color,
            '--line-width': `${style.line.width}px`,
            '--line-color': style.line.color,
            '--line-style': style.line.style,
            '--animation-duration': `${style.animation.duration}ms`,
            '--animation-easing': style.animation.easing
        };
    }

    /**
     * プリセットスタイルパックを適用
     */
    applyStylePack(packName) {
        const packs = {
            'minimal': {
                boxSize: 'small',
                fontSize: 'small',
                lineStyle: 'thin',
                colorTheme: 'monochrome',
                layoutStyle: 'compact',
                animationStyle: 'none'
            },
            'standard': {
                boxSize: 'medium',
                fontSize: 'medium',
                lineStyle: 'normal',
                colorTheme: 'default',
                layoutStyle: 'normal',
                animationStyle: 'smooth'
            },
            'presentation': {
                boxSize: 'large',
                fontSize: 'large',
                lineStyle: 'thick',
                colorTheme: 'blue',
                layoutStyle: 'presentation',
                animationStyle: 'dynamic'
            },
            'print': {
                boxSize: 'medium',
                fontSize: 'medium',
                lineStyle: 'normal',
                colorTheme: 'monochrome',
                layoutStyle: 'compact',
                animationStyle: 'none'
            }
        };

        const pack = packs[packName];
        if (pack) {
            this.setStyles(pack);
            ConfigUtils.debugLog(`Style pack applied: ${packName}`, 'style');
            return true;
        }
        return false;
    }

    /**
     * 利用可能なオプションを取得
     */
    getAvailableOptions(category) {
        const categoryKey = category.toUpperCase().replace('STYLE', 'STYLES');
        const categoryData = CHART_STYLE_MASTER[categoryKey];
        
        if (!categoryData) return [];
        
        return Object.entries(categoryData).map(([key, value]) => ({
            id: key,
            name: value.name,
            description: value.description,
            isDefault: value.default || false
        }));
    }

    /**
     * デフォルト設定にリセット
     */
    resetToDefaults() {
        this.currentStyle = {
            boxSize: 'medium',
            fontSize: 'medium',
            lineStyle: 'normal',
            colorTheme: 'default',
            layoutStyle: 'normal',
            animationStyle: 'smooth'
        };
        this.customOverrides.clear();
        ConfigUtils.debugLog('Style reset to defaults', 'style');
    }

    /**
     * 設定をエクスポート
     */
    exportSettings() {
        return {
            currentStyle: { ...this.currentStyle },
            customOverrides: Object.fromEntries(this.customOverrides),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 設定をインポート
     */
    importSettings(settings) {
        if (settings.currentStyle) {
            this.currentStyle = { ...settings.currentStyle };
        }
        if (settings.customOverrides) {
            this.customOverrides = new Map(Object.entries(settings.customOverrides));
        }
        ConfigUtils.debugLog('Style settings imported', 'style');
    }
}

// === 3. モジュールエクスポート ===
const ChartStyleMasterModule = {
    CHART_STYLE_MASTER,
    ChartStyleManager
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartStyleMasterModule;
} else {
    window.ChartStyleMasterModule = ChartStyleMasterModule;
    window.CHART_STYLE_MASTER = CHART_STYLE_MASTER; // 後方互換性
    window.ChartStyleManager = ChartStyleManager; // 後方互換性
}