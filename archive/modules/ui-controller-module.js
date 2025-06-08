/**
 * UI Controller Module
 * ユーザーインターフェース制御モジュール
 */

const UIControllerModule = (() => {
    'use strict';

    class UIController {
        constructor() {
            this.languageManager = null;
            this.dataProcessor = null;
            this.layoutCalculator = null;
            this.chartRenderer = null;
            this.dataTableManager = null;
            this.exportUtils = null;
            this.styleManager = null;
            
            this.currentData = [];
            this.currentLayout = null;
            this.viewMode = 'chart'; // 'chart' or 'table'
            
            this.initialize();
        }

        /**
         * 初期化
         */
        initialize() {
            this.setupModuleReferences();
            this.setupEventListeners();
            this.initializeUI();
            this.loadSettings();
        }

        /**
         * モジュール参照を設定
         */
        setupModuleReferences() {
            if (window.ConfigModule?.LanguageManager) {
                this.languageManager = window.ConfigModule.LanguageManager.getInstance();
            }
            if (window.ExportUtilsModule) {
                this.exportUtils = window.ExportUtilsModule.createExporter();
            }
            if (window.ChartStyleMasterModule?.ChartStyleManager) {
                this.styleManager = new window.ChartStyleMasterModule.ChartStyleManager();
            }
        }

        /**
         * イベントリスナーを設定
         */
        setupEventListeners() {
            // ファイルアップロード
            document.addEventListener('change', (e) => {
                if (e.target.matches('#file-input')) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });

            // ボタンクリック
            document.addEventListener('click', (e) => {
                if (e.target.matches('#load-sample-btn')) {
                    this.loadSampleData();
                } else if (e.target.matches('#generate-chart-btn')) {
                    this.generateChart();
                } else if (e.target.matches('#toggle-view-btn')) {
                    this.toggleView();
                } else if (e.target.matches('#export-svg-btn')) {
                    this.exportSVG();
                } else if (e.target.matches('#export-png-btn')) {
                    this.exportPNG();
                } else if (e.target.matches('#export-html-btn')) {
                    this.exportHTML();
                } else if (e.target.matches('#fullscreen-btn')) {
                    this.toggleFullscreen();
                } else if (e.target.matches('#reset-view-btn')) {
                    this.resetView();
                }
            });

            // 設定変更
            document.addEventListener('change', (e) => {
                if (e.target.matches('#language-select')) {
                    this.changeLanguage(e.target.value);
                } else if (e.target.matches('#box-size-select')) {
                    this.changeBoxSize(e.target.value);
                } else if (e.target.matches('#font-size-select')) {
                    this.changeFontSize(e.target.value);
                } else if (e.target.matches('#line-style-select')) {
                    this.changeLineStyle(e.target.value);
                } else if (e.target.matches('#color-theme-select')) {
                    this.changeColorTheme(e.target.value);
                } else if (e.target.matches('#hide-managers-check')) {
                    this.toggleHideManagers(e.target.checked);
                }
            });
        }

        /**
         * UIを初期化
         */
        initializeUI() {
            this.updateUIText();
            this.updateButtonStates();
            this.initializeStyleControls();
        }

        /**
         * ファイルアップロード処理
         * @param {File} file - アップロードされたファイル
         */
        async handleFileUpload(file) {
            if (!file) return;

            try {
                this.showLoadingState(true);
                
                if (!this.dataProcessor) {
                    this.dataProcessor = new window.DataProcessorModule.DataProcessor();
                }
                
                this.currentData = await this.dataProcessor.processExcelFile(file);
                this.updateDataDisplay();
                this.updateButtonStates();
                
                this.showNotification(this.t('messages.fileLoaded'), 'success');
            } catch (error) {
                console.error('File upload error:', error);
                this.showNotification(this.t('messages.fileLoadError'), 'error');
            } finally {
                this.showLoadingState(false);
            }
        }

        /**
         * サンプルデータを読み込み
         */
        loadSampleData() {
            try {
                if (window.ConfigModule?.SAMPLE_DATA) {
                    this.currentData = window.ConfigModule.SAMPLE_DATA;
                    this.updateDataDisplay();
                    this.updateButtonStates();
                    this.showNotification(this.t('messages.sampleLoaded'), 'success');
                }
            } catch (error) {
                console.error('Sample data load error:', error);
                this.showNotification(this.t('messages.sampleLoadError'), 'error');
            }
        }

        /**
         * 組織図を生成
         */
        generateChart() {
            if (!this.currentData || this.currentData.length === 0) {
                this.showNotification(this.t('messages.noData'), 'warning');
                return;
            }

            try {
                this.showLoadingState(true);

                // レイアウト計算
                if (!this.layoutCalculator) {
                    this.layoutCalculator = new window.LayoutCalculatorModule.LayoutCalculator();
                }
                this.currentLayout = this.layoutCalculator.calculateLayout(this.currentData);

                // チャート描画
                if (!this.chartRenderer) {
                    const container = document.querySelector('#chart-container');
                    this.chartRenderer = window.ChartRendererModule.createRenderer(container);
                }
                this.chartRenderer.render(this.currentData, this.currentLayout);

                this.updateButtonStates();
                this.showNotification(this.t('messages.chartGenerated'), 'success');
            } catch (error) {
                console.error('Chart generation error:', error);
                this.showNotification(this.t('messages.chartGenerationError'), 'error');
            } finally {
                this.showLoadingState(false);
            }
        }

        /**
         * ビューを切り替え
         */
        toggleView() {
            this.viewMode = this.viewMode === 'chart' ? 'table' : 'chart';
            this.updateViewDisplay();
            this.updateButtonStates();
        }

        /**
         * 言語を変更
         * @param {string} language - 言語コード
         */
        changeLanguage(language) {
            if (this.languageManager) {
                this.languageManager.setLanguage(language);
                this.updateUIText();
                this.saveSettings();
            }
        }

        /**
         * ボックスサイズを変更
         * @param {string} size - サイズ
         */
        changeBoxSize(size) {
            if (this.styleManager) {
                this.styleManager.setBoxSize(size);
                if (this.chartRenderer) {
                    this.chartRenderer.updateStyle('boxSize', size);
                }
                this.saveSettings();
            }
        }

        /**
         * フォントサイズを変更
         * @param {string} size - サイズ
         */
        changeFontSize(size) {
            if (this.styleManager) {
                this.styleManager.setFontSize(size);
                if (this.chartRenderer) {
                    this.chartRenderer.updateStyle('fontSize', size);
                }
                this.saveSettings();
            }
        }

        /**
         * 線スタイルを変更
         * @param {string} style - スタイル
         */
        changeLineStyle(style) {
            if (this.styleManager) {
                this.styleManager.setLineStyle(style);
                if (this.chartRenderer) {
                    this.chartRenderer.updateStyle('lineStyle', style);
                }
                this.saveSettings();
            }
        }

        /**
         * カラーテーマを変更
         * @param {string} theme - テーマ
         */
        changeColorTheme(theme) {
            if (this.styleManager) {
                this.styleManager.setColorTheme(theme);
                if (this.chartRenderer) {
                    this.chartRenderer.updateStyle('colorTheme', theme);
                }
                this.saveSettings();
            }
        }

        /**
         * マネージャー非表示を切り替え
         * @param {boolean} hide - 非表示フラグ
         */
        toggleHideManagers(hide) {
            // マネージャー非表示機能の実装
            if (this.chartRenderer && this.currentData) {
                const filteredData = hide 
                    ? this.currentData.filter(org => !org.teamBoss)
                    : this.currentData;
                
                if (this.layoutCalculator) {
                    this.currentLayout = this.layoutCalculator.calculateLayout(filteredData);
                    this.chartRenderer.render(filteredData, this.currentLayout);
                }
            }
            this.saveSettings();
        }

        /**
         * SVGエクスポート
         */
        exportSVG() {
            const svg = document.querySelector('#chart-container svg');
            if (svg && this.exportUtils) {
                this.exportUtils.exportSVG(svg);
            }
        }

        /**
         * PNGエクスポート
         */
        exportPNG() {
            const svg = document.querySelector('#chart-container svg');
            if (svg && this.exportUtils) {
                this.exportUtils.exportPNG(svg);
            }
        }

        /**
         * HTMLエクスポート
         */
        exportHTML() {
            const container = document.querySelector('#chart-container');
            if (container && this.exportUtils) {
                this.exportUtils.exportHTML(container);
            }
        }

        /**
         * フルスクリーンを切り替え
         */
        toggleFullscreen() {
            const container = document.querySelector('#chart-container');
            if (!container) return;

            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(err => {
                    console.error('Fullscreen error:', err);
                });
            } else {
                document.exitFullscreen();
            }
        }

        /**
         * ビューをリセット
         */
        resetView() {
            if (this.chartRenderer) {
                this.chartRenderer.resetView();
            }
        }

        /**
         * データ表示を更新
         */
        updateDataDisplay() {
            if (this.viewMode === 'table') {
                if (!this.dataTableManager) {
                    const container = document.querySelector('#table-container');
                    this.dataTableManager = window.DataTableManagerModule.createManager(container);
                }
                this.dataTableManager.setData(this.currentData);
            }
            
            // データ統計を更新
            const stats = document.querySelector('#data-stats');
            if (stats) {
                stats.textContent = this.t('stats.totalRecords', { count: this.currentData.length });
            }
        }

        /**
         * ビュー表示を更新
         */
        updateViewDisplay() {
            const chartContainer = document.querySelector('#chart-container');
            const tableContainer = document.querySelector('#table-container');
            const toggleBtn = document.querySelector('#toggle-view-btn');

            if (this.viewMode === 'chart') {
                chartContainer.style.display = 'block';
                tableContainer.style.display = 'none';
                toggleBtn.textContent = this.t('buttons.showTable');
            } else {
                chartContainer.style.display = 'none';
                tableContainer.style.display = 'block';
                toggleBtn.textContent = this.t('buttons.showChart');
                this.updateDataDisplay();
            }
        }

        /**
         * ボタン状態を更新
         */
        updateButtonStates() {
            const hasData = this.currentData && this.currentData.length > 0;
            const hasChart = hasData && this.currentLayout;

            // ボタンの有効/無効を設定
            document.querySelector('#generate-chart-btn').disabled = !hasData;
            document.querySelector('#toggle-view-btn').disabled = !hasData;
            document.querySelector('#export-svg-btn').disabled = !hasChart;
            document.querySelector('#export-png-btn').disabled = !hasChart;
            document.querySelector('#export-html-btn').disabled = !hasChart;
            document.querySelector('#fullscreen-btn').disabled = !hasChart;
            document.querySelector('#reset-view-btn').disabled = !hasChart;
        }

        /**
         * スタイルコントロールを初期化
         */
        initializeStyleControls() {
            // スタイル選択肢を設定
            if (this.styleManager) {
                this.populateStyleSelects();
            }
        }

        /**
         * スタイル選択肢を設定
         */
        populateStyleSelects() {
            // ボックスサイズ選択肢
            const boxSizeSelect = document.querySelector('#box-size-select');
            if (boxSizeSelect) {
                const sizes = Object.keys(window.ChartStyleMasterModule.CHART_STYLE_MASTER.BOX_SIZES);
                boxSizeSelect.innerHTML = sizes.map(size => 
                    `<option value="${size}">${this.t('styles.boxSize.' + size)}</option>`
                ).join('');
            }

            // 他の選択肢も同様に設定...
        }

        /**
         * UI テキストを更新
         */
        updateUIText() {
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.dataset.i18n;
                element.textContent = this.t(key);
            });
        }

        /**
         * ローディング状態を表示
         * @param {boolean} show - 表示フラグ
         */
        showLoadingState(show) {
            const loader = document.querySelector('#loading');
            if (loader) {
                loader.style.display = show ? 'block' : 'none';
            }
        }

        /**
         * 通知を表示
         * @param {string} message - メッセージ
         * @param {string} type - タイプ ('success', 'error', 'warning', 'info')
         */
        showNotification(message, type = 'info') {
            // 簡易通知実装
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        /**
         * 設定を保存
         */
        saveSettings() {
            const settings = {
                language: this.languageManager?.getCurrentLanguage(),
                boxSize: this.styleManager?.getCurrentBoxSize(),
                fontSize: this.styleManager?.getCurrentFontSize(),
                lineStyle: this.styleManager?.getCurrentLineStyle(),
                colorTheme: this.styleManager?.getCurrentColorTheme(),
                viewMode: this.viewMode
            };
            
            localStorage.setItem('orgChart.settings', JSON.stringify(settings));
        }

        /**
         * 設定を読み込み
         */
        loadSettings() {
            try {
                const settings = JSON.parse(localStorage.getItem('orgChart.settings') || '{}');
                
                if (settings.language && this.languageManager) {
                    this.languageManager.setLanguage(settings.language);
                    document.querySelector('#language-select').value = settings.language;
                }
                
                if (settings.viewMode) {
                    this.viewMode = settings.viewMode;
                }
                
                // 他の設定も復元...
            } catch (error) {
                console.error('Settings load error:', error);
            }
        }

        /**
         * 翻訳関数
         * @param {string} key - 翻訳キー
         * @param {Object} params - パラメータ
         * @returns {string} 翻訳されたテキスト
         */
        t(key, params = {}) {
            return this.languageManager?.t(key, params) || key;
        }
    }

    return {
        UIController,
        createController() {
            return new UIController();
        }
    };
})();

if (typeof window !== 'undefined') {
    window.UIControllerModule = UIControllerModule;
}