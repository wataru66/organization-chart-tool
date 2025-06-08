/**
 * Main App Module
 * アプリケーションメインモジュール - 統合とオーケストレーション
 */

const MainAppModule = (() => {
    'use strict';

    class OrganizationChartApp {
        constructor() {
            this.version = '4.0.0';
            this.initialized = false;
            this.modules = {};
            
            // 初期化
            this.initialize();
        }

        /**
         * アプリケーション初期化
         */
        async initialize() {
            try {
                console.log(`Organization Chart Tool v${this.version} - Initializing...`);
                
                // DOM準備完了まで待機
                if (document.readyState === 'loading') {
                    await new Promise(resolve => {
                        document.addEventListener('DOMContentLoaded', resolve);
                    });
                }
                
                // モジュール依存関係チェック
                this.checkDependencies();
                
                // モジュール初期化
                this.initializeModules();
                
                // UI初期化
                this.initializeUI();
                
                // グローバルイベントリスナー設定
                this.setupGlobalEventListeners();
                
                this.initialized = true;
                console.log('Organization Chart Tool - Ready!');
                
                // 初期化完了通知
                this.notifyReady();
                
            } catch (error) {
                console.error('Initialization failed:', error);
                this.showFatalError(error);
            }
        }

        /**
         * 依存モジュールの存在チェック
         */
        checkDependencies() {
            const requiredModules = [
                'ConfigModule',
                'DataProcessorModule', 
                'LayoutCalculatorModule',
                'ChartStyleMasterModule',
                'ChartRendererModule',
                'DataTableManagerModule',
                'ExportUtilsModule',
                'UIControllerModule'
            ];
            
            const missing = requiredModules.filter(module => !window[module]);
            
            if (missing.length > 0) {
                throw new Error(`Missing required modules: ${missing.join(', ')}`);
            }
        }

        /**
         * モジュール初期化
         */
        initializeModules() {
            try {
                // 設定・言語モジュール
                this.modules.config = window.ConfigModule;
                this.modules.languageManager = window.ConfigModule.LanguageManager.getInstance();
                
                // データ処理モジュール
                this.modules.dataProcessor = new window.DataProcessorModule.DataProcessor();
                
                // レイアウト計算モジュール
                this.modules.layoutCalculator = new window.LayoutCalculatorModule.LayoutCalculator();
                
                // スタイル管理モジュール
                this.modules.styleManager = new window.ChartStyleMasterModule.ChartStyleManager();
                
                // エクスポートユーティリティ
                this.modules.exportUtils = window.ExportUtilsModule.createExporter();
                
                // UIコントローラー（他の全モジュール初期化後）
                this.modules.uiController = window.UIControllerModule.createController();
                
                console.log('All modules initialized successfully');
                
            } catch (error) {
                console.error('Module initialization failed:', error);
                throw error;
            }
        }

        /**
         * UI初期化
         */
        initializeUI() {
            // ページタイトル設定
            document.title = this.modules.languageManager.t('app.title');
            
            // バージョン情報表示
            const versionElement = document.querySelector('#app-version');
            if (versionElement) {
                versionElement.textContent = `v${this.version}`;
            }
            
            // 初期スタイル適用
            this.applyInitialStyles();
            
            // レスポンシブ対応
            this.setupResponsiveHandling();
        }

        /**
         * グローバルイベントリスナー設定
         */
        setupGlobalEventListeners() {
            // ウィンドウリサイズ
            window.addEventListener('resize', this.debounce(() => {
                this.handleWindowResize();
            }, 250));
            
            // キーボードショートカット
            document.addEventListener('keydown', (e) => {
                this.handleGlobalKeyboard(e);
            });
            
            // エラーハンドリング
            window.addEventListener('error', (e) => {
                this.handleGlobalError(e);
            });
            
            // unload時の処理
            window.addEventListener('beforeunload', () => {
                this.cleanup();
            });
        }

        /**
         * 初期スタイル適用
         */
        applyInitialStyles() {
            // デフォルトスタイルパック適用
            if (this.modules.styleManager) {
                this.modules.styleManager.applyPresetPack('standard');
            }
            
            // CSS変数設定
            this.updateCSSVariables();
        }

        /**
         * CSS変数更新
         */
        updateCSSVariables() {
            const root = document.documentElement;
            const currentTheme = this.modules.styleManager?.getCurrentColorTheme();
            
            if (currentTheme) {
                Object.entries(currentTheme).forEach(([key, value]) => {
                    root.style.setProperty(`--chart-${key}`, value);
                });
            }
        }

        /**
         * レスポンシブ対応設定
         */
        setupResponsiveHandling() {
            // モバイル対応
            const isMobile = window.innerWidth <= 768;
            document.body.classList.toggle('mobile-view', isMobile);
            
            // タッチデバイス対応
            if ('ontouchstart' in window) {
                document.body.classList.add('touch-device');
            }
        }

        /**
         * ウィンドウリサイズ処理
         */
        handleWindowResize() {
            // レスポンシブクラス更新
            this.setupResponsiveHandling();
            
            // チャートコンテナリサイズ
            const chartContainer = document.querySelector('#chart-container');
            if (chartContainer && this.modules.chartRenderer) {
                this.modules.chartRenderer.fitToContainer();
            }
        }

        /**
         * グローバルキーボード処理
         * @param {KeyboardEvent} e - キーボードイベント
         */
        handleGlobalKeyboard(e) {
            // Ctrl/Cmd + S でデータ保存
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveCurrentData();
            }
            
            // Esc でフルスクリーン終了
            if (e.key === 'Escape' && document.fullscreenElement) {
                document.exitFullscreen();
            }
        }

        /**
         * グローバルエラー処理
         * @param {ErrorEvent} e - エラーイベント
         */
        handleGlobalError(e) {
            console.error('Global error:', e.error);
            
            // ユーザーへの通知（重要でないエラーは除く）
            if (!e.error?.message?.includes('Script error')) {
                this.showErrorNotification(e.error?.message || 'An error occurred');
            }
        }

        /**
         * 現在のデータ保存
         */
        saveCurrentData() {
            if (this.modules.uiController?.currentData) {
                const data = this.modules.uiController.currentData;
                this.modules.exportUtils.exportExcel(data, 'organization-backup.csv');
                this.showSuccessNotification('Data exported successfully');
            }
        }

        /**
         * 初期化完了通知
         */
        notifyReady() {
            // カスタムイベント発火
            window.dispatchEvent(new CustomEvent('orgChartReady', {
                detail: { 
                    version: this.version,
                    modules: Object.keys(this.modules)
                }
            }));
            
            // ローディング画面を隠す
            const loader = document.querySelector('#initial-loader');
            if (loader) {
                loader.style.display = 'none';
            }
            
            // メインコンテンツを表示
            const mainContent = document.querySelector('#main-content');
            if (mainContent) {
                mainContent.style.display = 'block';
            }
        }

        /**
         * 致命的エラー表示
         * @param {Error} error - エラーオブジェクト
         */
        showFatalError(error) {
            const errorContainer = document.querySelector('#error-container') || document.body;
            errorContainer.innerHTML = `
                <div class="fatal-error">
                    <h2>🚨 ${this.modules.languageManager?.t('errors.fatal') || 'Fatal Error'}</h2>
                    <p>${error.message}</p>
                    <details>
                        <summary>Technical Details</summary>
                        <pre>${error.stack}</pre>
                    </details>
                    <button onclick="location.reload()">
                        ${this.modules.languageManager?.t('buttons.reload') || 'Reload Page'}
                    </button>
                </div>
            `;
        }

        /**
         * 成功通知表示
         * @param {string} message - メッセージ
         */
        showSuccessNotification(message) {
            this.showNotification(message, 'success');
        }

        /**
         * エラー通知表示
         * @param {string} message - メッセージ
         */
        showErrorNotification(message) {
            this.showNotification(message, 'error');
        }

        /**
         * 通知表示
         * @param {string} message - メッセージ
         * @param {string} type - タイプ
         */
        showNotification(message, type = 'info') {
            if (this.modules.uiController) {
                this.modules.uiController.showNotification(message, type);
            } else {
                // フォールバック
                console.log(`[${type.toUpperCase()}] ${message}`);
            }
        }

        /**
         * デバウンス関数
         * @param {Function} func - 実行する関数
         * @param {number} wait - 待機時間（ミリ秒）
         * @returns {Function} デバウンス済み関数
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        /**
         * クリーンアップ処理
         */
        cleanup() {
            // 設定保存
            if (this.modules.uiController) {
                this.modules.uiController.saveSettings();
            }
            
            // リソース解放
            Object.values(this.modules).forEach(module => {
                if (module && typeof module.cleanup === 'function') {
                    module.cleanup();
                }
            });
        }

        /**
         * アプリケーション情報取得
         * @returns {Object} アプリケーション情報
         */
        getInfo() {
            return {
                version: this.version,
                initialized: this.initialized,
                modules: Object.keys(this.modules),
                timestamp: new Date().toISOString()
            };
        }

        /**
         * デバッグ情報取得
         * @returns {Object} デバッグ情報
         */
        getDebugInfo() {
            return {
                ...this.getInfo(),
                currentData: this.modules.uiController?.currentData?.length || 0,
                currentLayout: !!this.modules.uiController?.currentLayout,
                viewMode: this.modules.uiController?.viewMode,
                language: this.modules.languageManager?.getCurrentLanguage(),
                userAgent: navigator.userAgent,
                screen: {
                    width: screen.width,
                    height: screen.height,
                    devicePixelRatio: window.devicePixelRatio
                }
            };
        }
    }

    // アプリケーションインスタンス
    let appInstance = null;

    return {
        OrganizationChartApp,
        
        /**
         * アプリケーション開始
         * @returns {OrganizationChartApp} アプリケーションインスタンス
         */
        start() {
            if (!appInstance) {
                appInstance = new OrganizationChartApp();
            }
            return appInstance;
        },
        
        /**
         * アプリケーションインスタンス取得
         * @returns {OrganizationChartApp|null} アプリケーションインスタンス
         */
        getInstance() {
            return appInstance;
        }
    };
})();

// グローバルに公開
if (typeof window !== 'undefined') {
    window.MainAppModule = MainAppModule;
    
    // 自動開始（DOMContentLoaded後）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.MainAppModule.start();
        });
    } else {
        window.MainAppModule.start();
    }
}