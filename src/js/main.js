/**
 * 組織図作成ツール - メイン処理（修正版）
 * アプリケーションの初期化と制御
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
     * 依存ライブラリを確認
     */
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
        const errorDiv = document.createElement('div');
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