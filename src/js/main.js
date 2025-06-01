/**
 * Organization Chart Tool - Main Process (Revised Version)
 * Application initialization and control
 */

// アプリケーションのメインクラス
class OrgChartApp {
    constructor() {
        this.uiController = null;
        this.isInitialized = false;
    }

    /**
     * アプリケーションを初期化
     */
    initialize() {
        if (this.isInitialized) {
            ConfigUtils.debugLog('アプリケーションは既に初期化済み', 'app');
            return;
        }

        try {
            ConfigUtils.debugLog('=== 組織図作成ツール 初期化開始 ===', 'app');
            
            // 依存ライブラリの確認
            this.checkDependencies();
            
            // Initialize language system
            this.initializeLanguageSystem();
            
            // Apply language translations to UI
            this.applyTranslations();
            
            // UIコントローラーを初期化
            this.uiController = new UIController();
            
            // デモモードの確認
            this.checkDemoMode();
            
            // グローバル関数を設定
            this.setupGlobalFunctions();
            
            // エラーハンドリングを設定
            this.setupErrorHandling();
            
            this.isInitialized = true;
            ConfigUtils.debugLog('アプリケーション初期化完了', 'app');
            
        } catch (error) {
            console.error('アプリケーション初期化エラー:', error);
            this.showFatalError('アプリケーションの初期化に失敗しました');
        }
    }

    /**
     * Initialize the language system
     */
    initializeLanguageSystem() {
        if (typeof LanguageManager !== 'undefined') {
            LanguageManager.initialize();
            ConfigUtils.debugLog('Language system initialized', 'app');
        } else {
            ConfigUtils.debugLog('LanguageManager not found, skipping language initialization', 'app');
        }
    }

    /**
     * Apply language translations to UI elements
     */
    applyTranslations() {
        ConfigUtils.debugLog('Applying language translations', 'app');
        
        // Check if translation function exists
        if (typeof t !== 'function') {
            ConfigUtils.debugLog('Translation function not found', 'app');
            return;
        }
        
        // Page title and headers
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = t('title');
        
        const pageSubtitle = document.getElementById('pageSubtitle');
        if (pageSubtitle) pageSubtitle.textContent = t('subtitle');
        
        const pageUsage = document.getElementById('pageUsage');
        if (pageUsage) pageUsage.innerHTML = `💡 <strong>${t('usage').split(':')[0]}:</strong> ${t('usage').split(':')[1]}`;
        
        // Demo mode
        const demoMode = document.getElementById('demoMode');
        if (demoMode) demoMode.textContent = t('demoMode');
        
        // File drop zone
        const dropZoneText = document.getElementById('dropZoneText');
        if (dropZoneText) dropZoneText.textContent = t('fileDropZone');
        
        const supportedFormats = document.getElementById('supportedFormats');
        if (supportedFormats) supportedFormats.textContent = t('supportedFormats');
        
        // Control labels
        const baseOrgLabel = document.getElementById('baseOrgLabel');
        if (baseOrgLabel) baseOrgLabel.textContent = t('baseOrganization');
        
        const showAllOption = document.getElementById('showAllOption');
        if (showAllOption) showAllOption.textContent = t('showAll');
        
        const levelLimitLabel = document.getElementById('levelLimitLabel');
        if (levelLimitLabel) levelLimitLabel.textContent = t('levelLimit');
        
        const fontSizeLabel = document.getElementById('fontSizeLabel');
        if (fontSizeLabel) fontSizeLabel.textContent = t('fontSize');
        
        const boxSizeLabel = document.getElementById('boxSizeLabel');
        if (boxSizeLabel) boxSizeLabel.textContent = t('boxSize');
        
        const hideManagersLabel = document.getElementById('hideManagersLabel');
        if (hideManagersLabel) {
            // Update the text content while preserving the checkbox
            const checkbox = hideManagersLabel.querySelector('input[type="checkbox"]');
            hideManagersLabel.innerHTML = '';
            hideManagersLabel.appendChild(checkbox);
            hideManagersLabel.appendChild(document.createTextNode(' ' + t('hideManagers')));
        }
        
        // Update select options
        this.updateSelectOptions();
        
        // Update button texts
        this.updateButtonTexts();
        
        // Data table title
        const dataTableTitle = document.getElementById('dataTableTitle');
        if (dataTableTitle) dataTableTitle.textContent = t('dataTableTitle');
        
        ConfigUtils.debugLog('Translations applied successfully', 'app');
    }

    /**
     * Update select option texts
     */
    updateSelectOptions() {
        // Level select options
        const levelSelect = document.getElementById('levelSelect');
        if (levelSelect) {
            levelSelect.options[0].textContent = t('noLimit');
            for (let i = 1; i < levelSelect.options.length; i++) {
                const value = levelSelect.options[i].value;
                levelSelect.options[i].textContent = t('levelsUpTo', { n: value });
            }
        }
        
        // Font size select options
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        if (fontSizeSelect) {
            fontSizeSelect.options[0].textContent = t('small');
            fontSizeSelect.options[1].textContent = t('medium');
            fontSizeSelect.options[2].textContent = t('large');
        }
        
        // Box size select options
        const boxSizeSelect = document.getElementById('boxSizeSelect');
        if (boxSizeSelect) {
            boxSizeSelect.options[0].textContent = t('small');
            boxSizeSelect.options[1].textContent = t('medium');
            boxSizeSelect.options[2].textContent = t('large');
        }
    }

    /**
     * Update button texts
     */
    updateButtonTexts() {
        const buttonMappings = {
            'generateBtn': 'generateChart',
            'showTableBtn': 'showDataTable',
            'validateBtn': 'validateData',
            'exportSvgBtn': 'exportSVG',
            'exportPngBtn': 'exportPNG',
            'printBtn': 'print'
        };
        
        Object.entries(buttonMappings).forEach(([id, langKey]) => {
            const button = document.getElementById(id);
            if (button) {
                button.textContent = t(langKey);
            }
        });
        
        // Export empty template button (find by onclick)
        const exportTemplateBtn = document.querySelector('button[onclick="exportEmptyTemplate()"]');
        if (exportTemplateBtn) {
            exportTemplateBtn.textContent = t('exportEmptyTemplate');
        }
        
        // Export current data button (find by onclick)
        const exportCurrentDataBtn = document.querySelector('button[onclick="exportCurrentData()"]');
        if (exportCurrentDataBtn) {
            exportCurrentDataBtn.textContent = t('exportCurrentData');
        }
        
        // Export HTML button (find by onclick)
        const exportHTMLBtn = document.querySelector('button[onclick="exportHTML()"]');
        if (exportHTMLBtn) {
            exportHTMLBtn.textContent = t('exportHTML');
        }
        
        // Fullscreen button (find by onclick)
        const fullscreenBtn = document.querySelector('button[onclick="toggleFullscreen()"]');
        if (fullscreenBtn) {
            fullscreenBtn.textContent = t('fullScreen');
        }
        
        // Load sample data button (find by onclick)
        const sampleDataBtn = document.querySelector('button[onclick="loadSampleData()"]');
        if (sampleDataBtn) {
            sampleDataBtn.textContent = t('loadSampleData');
        }
        
        // Data table buttons
        const addNewRowBtn = document.querySelector('button[onclick="addNewRow()"]');
        if (addNewRowBtn) addNewRowBtn.textContent = t('addNewRow');
        
        const applyChangesBtn = document.querySelector('button[onclick="applyChanges()"]');
        if (applyChangesBtn) applyChangesBtn.textContent = t('applyChanges');
        
        const hideTableBtn = document.querySelector('button[onclick="hideDataTable()"]');
        if (hideTableBtn) hideTableBtn.textContent = t('closeTable');
    }

    /**
     * 依存ライブラリを確認
     */
    checkDependencies() {
        const requiredLibraries = [
            { name: 'XLSX', check: () => typeof XLSX !== 'undefined', required: true }
        ];

        const requiredClasses = [
            { name: 'CONFIG', check: () => typeof CONFIG !== 'undefined', required: true },
            { name: 'ConfigUtils', check: () => typeof ConfigUtils !== 'undefined', required: true },
            { name: 'DataProcessor', check: () => typeof DataProcessor !== 'undefined', required: true },
            { name: 'ChartRenderer', check: () => typeof ChartRenderer !== 'undefined', required: true },
            { name: 'LayoutCalculator', check: () => typeof LayoutCalculator !== 'undefined', required: true },
            { name: 'UIController', check: () => typeof UIController !== 'undefined', required: true }
        ];

        // 外部ライブラリチェック
        requiredLibraries.forEach(lib => {
            if (lib.check()) {
                ConfigUtils.debugLog(`${lib.name} ライブラリ: 利用可能`, 'app');
            } else if (lib.required) {
                throw new Error(`必須ライブラリ ${lib.name} が見つかりません`);
            } else {
                ConfigUtils.debugLog(`${lib.name} ライブラリ: 未使用 (オプション)`, 'app');
            }
        });

        // 必須クラスチェック
        requiredClasses.forEach(cls => {
            if (cls.check()) {
                ConfigUtils.debugLog(`${cls.name} クラス: 利用可能`, 'app');
            } else if (cls.required) {
                throw new Error(`必須クラス ${cls.name} が見つかりません`);
            }
        });
    }

    /**
     * デモモードをチェック
     */
    checkDemoMode() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('demo') === 'true') {
            ConfigUtils.debugLog('デモモードでアプリケーションを開始', 'app');
            setTimeout(() => {
                this.uiController.loadCorrectedSampleData();
            }, 500);
        }
    }

    /**
     * グローバル関数を設定
     */
    setupGlobalFunctions() {
        // HTMLから呼び出される関数をグローバルスコープに設定
        window.generateChart = () => {
            if (this.uiController) {
                this.uiController.generateChart();
            }
        };

        window.exportPNG = () => {
            if (this.uiController) {
                this.uiController.exportPNG();
            }
        };

        window.exportSVG = () => {
            if (this.uiController) {
                this.uiController.exportSVG();
            }
        };

        window.printChart = () => {
            if (this.uiController) {
                this.uiController.printChart();
            }
        };

        window.loadSampleData = () => {
            if (this.uiController) {
                this.uiController.loadCorrectedSampleData();
            }
        };

        window.exportEmptyTemplate = () => {
            if (this.uiController && this.uiController.exportUtils) {
                this.uiController.exportUtils.exportEmptyTemplate();
            }
        };

        window.exportCurrentData = () => {
            if (this.uiController && this.uiController.exportUtils) {
                this.uiController.exportUtils.exportCurrentDataToExcel();
            }
        };

        window.exportHTML = () => {
            if (this.uiController && this.uiController.exportUtils) {
                this.uiController.exportUtils.exportHTML();
            }
        };

        window.toggleFullscreen = () => {
            if (this.uiController) {
                this.uiController.toggleFullscreen();
            }
        };

        window.exitFullscreen = () => {
            if (this.uiController) {
                this.uiController.exitFullscreen();
            }
        };

        window.showDataTable = () => {
            if (this.uiController) {
                this.uiController.showDataTable();
            }
        };

        // デバッグ用関数
        window.debugApp = () => {
            if (this.uiController) {
                this.uiController.debugInfo();
            }
        };

        // 緊急用：すべてのポップアップを削除
        window.clearAllPopups = () => {
            const popupSelectors = [
                '.validation-result-popup',
                '.detailed-error-popup',
                '.export-error-popup',
                '.fatal-error-popup'
            ];
            
            let removedCount = 0;
            popupSelectors.forEach(selector => {
                const popups = document.querySelectorAll(selector);
                popups.forEach(popup => {
                    popup.remove();
                    removedCount++;
                });
            });
            
            // その他の固定位置要素も削除
            const otherPopups = document.querySelectorAll('[style*="position: fixed"]');
            otherPopups.forEach(popup => {
                if (popup.style.zIndex > 1000) {
                    popup.remove();
                    removedCount++;
                }
            });
            
            console.log(`${removedCount}個のポップアップを削除しました`);
            alert(`${removedCount}個のポップアップを削除しました`);
        };

        ConfigUtils.debugLog('グローバル関数を設定', 'app');
    }

    /**
     * エラーハンドリングを設定
     */
    setupErrorHandling() {
        // 未処理のエラーをキャッチ
        window.addEventListener('error', (event) => {
            ConfigUtils.debugLog(`未処理エラー: ${event.error?.message || event.message}`, 'error');
            console.error('未処理エラー:', event.error || event);
        });

        // Promise の未処理エラーをキャッチ
        window.addEventListener('unhandledrejection', (event) => {
            ConfigUtils.debugLog(`未処理Promise拒否: ${event.reason}`, 'error');
            console.error('未処理Promise拒否:', event.reason);
        });

        ConfigUtils.debugLog('エラーハンドリングを設定', 'app');
    }

    /**
     * 致命的エラーを表示
     * @param {string} message - エラーメッセージ
     */
    showFatalError(message) {
        // 既存の致命的エラーポップアップを削除
        const existingFatalErrors = document.querySelectorAll('.fatal-error-popup');
        existingFatalErrors.forEach(popup => popup.remove());
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fatal-error-popup';
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        errorDiv.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 8px;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <h2 style="color: #c53030; margin-bottom: 20px;">
                    ⚠️ アプリケーションエラー
                </h2>
                <p style="margin-bottom: 20px; color: #2d3748;">
                    ${message}
                </p>
                <p style="font-size: 14px; color: #718096; margin-bottom: 20px;">
                    ページを再読み込みして再度お試しください。<br>
                    問題が解決しない場合は、ブラウザのコンソールを確認してください。
                </p>
                <button onclick="window.location.reload()" style="
                    background: #4299e1;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    ページを再読み込み
                </button>
            </div>
        `;

        document.body.appendChild(errorDiv);
    }

    /**
     * バージョン情報を取得
     * @returns {Object} バージョン情報
     */
    getVersionInfo() {
        return {
            version: '1.1.0',
            buildDate: new Date().toISOString().split('T')[0],
            dependencies: {
                XLSX: typeof XLSX !== 'undefined' ? 'loaded' : 'not loaded'
            }
        };
    }

    /**
     * アプリケーション情報をコンソールに出力
     */
    showAppInfo() {
        const info = this.getVersionInfo();
        console.log('\n=== 組織図作成ツール（修正版） ===');
        console.log(`バージョン: ${info.version}`);
        console.log(`ビルド日: ${info.buildDate}`);
        console.log('依存ライブラリ:', info.dependencies);
        console.log('設定:', CONFIG);
    }
}

// グローバルスコープにアプリケーションインスタンスを公開
window.app = null;

/**
 * DOM読み込み完了時にアプリケーションを初期化
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        app = new OrgChartApp();
        window.app = app;
        app.initialize();
        
        // 開発環境でのデバッグ情報表示
        if (CONFIG.DEBUG.ENABLED) {
            app.showAppInfo();
        }
        
    } catch (error) {
        console.error('DOMContentLoaded エラー:', error);
    }
});

/**
 * ページ読み込み完了時の処理
 */
window.addEventListener('load', () => {
    ConfigUtils.debugLog('ページ読み込み完了', 'app');
    
    // パフォーマンス情報をログ出力（デバッグモード時）
    if (CONFIG.DEBUG.ENABLED && window.performance) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        ConfigUtils.debugLog(`ページ読み込み時間: ${loadTime}ms`, 'performance');
    }
});

// グローバルに公開
window.OrgChartApp = OrgChartApp;