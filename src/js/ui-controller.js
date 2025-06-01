/**
 * Organization Chart Tool - UI Control Module (Data Reflection Fixed Version)
 * User interface control and event management
 */

class UIController {
    constructor() {
        this.dataProcessor = new DataProcessor();
        this.chartRenderer = null;
        this.exportUtils = null;
        this.layoutCalculator = null;
        this.dataTableManager = null;
        this.isFullscreen = false;
        this.originalStyles = {};
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.initializeDataTableManager();
        
        // 初期ボタン状態を設定
        this.updateButtonStates('initial');
    }

    /**
     * DOM要素を初期化
     */
    initializeElements() {
        this.elements = {
            dropZone: document.getElementById('dropZone'),
            fileInput: document.getElementById('fileInput'),
            baseOrgSelect: document.getElementById('baseOrgSelect'),
            levelSelect: document.getElementById('levelSelect'),
            fontSizeSelect: document.getElementById('fontSizeSelect'),
            boxSizeSelect: document.getElementById('boxSizeSelect'),
            hideManagersCheckbox: document.getElementById('hideManagersCheckbox'),
            generateBtn: document.getElementById('generateBtn'),
            exportSvgBtn: document.getElementById('exportSvgBtn'),
            exportPngBtn: document.getElementById('exportPngBtn'),
            printBtn: document.getElementById('printBtn'),
            showTableBtn: document.getElementById('showTableBtn'),
            validateBtn: document.getElementById('validateBtn'),
            exportCurrentDataBtn: document.getElementById('exportCurrentDataBtn'),
            exportHTMLBtn: document.getElementById('exportHTMLBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            stats: document.getElementById('stats'),
            statsContent: document.getElementById('statsContent'),
            errors: document.getElementById('errors'),
            orgChart: document.getElementById('orgChart'),
            demoMode: document.getElementById('demoMode')
        };

        this.chartRenderer = new ChartRenderer(this.elements.orgChart);
        this.chartRenderer.setDataProcessor(this.dataProcessor);
        this.exportUtils = new ExportUtils(this.chartRenderer);
    }

    /**
     * データテーブル管理を初期化
     */
    initializeDataTableManager() {
        this.dataTableManager = new DataTableManager(this.dataProcessor);
        ConfigUtils.debugLog('データテーブル管理を初期化', 'ui');
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        this.setupFileDropListeners();
        
        this.elements.generateBtn.addEventListener('click', () => this.generateChart());
        this.elements.exportSvgBtn.addEventListener('click', () => this.exportSVG());
        
        if (this.elements.exportPngBtn) {
            this.elements.exportPngBtn.addEventListener('click', () => this.exportPNG());
        }
        
        this.elements.printBtn.addEventListener('click', () => this.printChart());
        
        if (this.elements.showTableBtn) {
            this.elements.showTableBtn.addEventListener('click', () => this.showDataTable());
        }
        
        if (this.elements.validateBtn) {
            this.elements.validateBtn.addEventListener('click', () => this.validateData());
        }
        
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.elements.fontSizeSelect.addEventListener('change', () => this.updateChartStyle());
        this.elements.boxSizeSelect.addEventListener('change', () => this.updateChartStyle());
        this.elements.hideManagersCheckbox.addEventListener('change', () => this.updateChartStyle());
    }

    /**
     * ファイルドロップリスナーを設定
     */
    setupFileDropListeners() {
        const dropZone = this.elements.dropZone;
        
        dropZone.addEventListener('click', () => this.elements.fileInput.click());
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('dragover');
            }
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });
    }

    /**
     * キーボードショートカットを設定
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // データテーブルが表示されている場合はショートカットを無効化
            if (this.dataTableManager && this.dataTableManager.isVisible()) {
                ConfigUtils.debugLog('データテーブル表示中のためショートカット無効化', 'ui');
                return;
            }
            
            // 入力フィールドにフォーカスがある場合はショートカットを無効化
            const activeElement = document.activeElement;
            if (activeElement && (
                activeElement.tagName === 'INPUT' || 
                activeElement.tagName === 'TEXTAREA' || 
                activeElement.tagName === 'SELECT' ||
                activeElement.contentEditable === 'true'
            )) {
                ConfigUtils.debugLog('入力フィールドフォーカス中のためショートカット無効化', 'ui');
                return;
            }
            
            if (e.ctrlKey) {
                switch(e.key) {
                    case 'g':
                        e.preventDefault();
                        this.generateChart();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.printChart();
                        break;
                    case 's':
                        e.preventDefault();
                        this.exportSVG();
                        break;
                }
            }
        });
        
        ConfigUtils.debugLog('キーボードショートカット設定完了（データテーブル対応・Ctrl+V無効化）', 'ui');
    }

    /**
     * 修正済みサンプルデータをロード
     */
    loadCorrectedSampleData() {
        try {
            this.showLoading('Loading sample data...');
            this.elements.demoMode.style.display = 'block';
            this.elements.demoMode.textContent = t ? t('demoMode') : 'Demo Mode: Running with sample data';
            
            this.dataProcessor.loadCorrectedSampleData();
            this.updateUI();
            this.updateButtonStates('dataLoaded'); // データ読み込み後の状態に更新
            this.showStats();
            this.hideError();
            this.hideLoading();
            
            setTimeout(() => {
                this.generateChart();
            }, 500);
            
            ConfigUtils.debugLog('修正済みサンプルデータロード完了', 'ui');
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to load sample data: ' + error.message);
            ConfigUtils.debugLog(`サンプルデータロードエラー: ${error.message}`, 'error');
        }
    }

    /**
     * アップロードされたサンプルファイルを処理
     */
    async loadSampleFile() {
        try {
            this.showLoading('サンプルファイルを読み込み中...');
            this.elements.demoMode.style.display = 'block';
            this.elements.demoMode.textContent = 'デモモード: アップロードされたサンプルファイルを処理中';
            
            await this.dataProcessor.processSampleFile();
            this.updateUI();
            this.enableControls();
            this.showStats();
            this.hideError();
            this.hideLoading();
            
            setTimeout(() => {
                this.generateChart();
            }, 500);
            
            ConfigUtils.debugLog('サンプルファイル処理完了', 'ui');
        } catch (error) {
            this.hideLoading();
            this.showError('サンプルファイルの処理に失敗しました: ' + error.message);
            ConfigUtils.debugLog(`サンプルファイル処理エラー: ${error.message}`, 'error');
            
            this.loadCorrectedSampleData();
        }
    }

    /**
     * ファイル選択イベントを処理
     */
    handleFileSelect(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    /**
     * ファイルを処理
     */
    async handleFile(file) {
        try {
            if (!this.validateFileType(file)) {
                throw new Error('Unsupported file format. Please select an Excel file (.xlsx, .xls).');
            }
            
            this.showLoading(`Loading file: ${file.name}`);
            this.hideError();
            
            await this.dataProcessor.processExcelFile(file);
            this.updateUI();
            this.updateButtonStates('dataLoaded'); // データ読み込み後の状態に更新
            this.showStats();
            this.hideLoading();
            
            this.elements.demoMode.style.display = 'none';
            
            ConfigUtils.debugLog(`ファイル処理完了: ${file.name}`, 'ui');
            this.showSuccessMessage(t ? t('fileLoadComplete', { filename: file.name }) : `File "${file.name}" loaded successfully.`);
            
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
            ConfigUtils.debugLog(`ファイル処理エラー: ${error.message}`, 'error');
        }
    }

    /**
     * ファイル形式を検証
     */
    validateFileType(file) {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const allowedExtensions = ['.xlsx', '.xls'];
        
        const isValidMimeType = allowedTypes.includes(file.type);
        const isValidExtension = allowedExtensions.some(ext => 
            file.name.toLowerCase().endsWith(ext)
        );
        
        return isValidMimeType || isValidExtension;
    }

    /**
     * UIを更新（修正版 - データテーブル変更時の対応）
     */
    updateUI() {
        this.updateBaseOrgSelect();
        this.updateChartRenderer();
        
        // データテーブルが表示中の場合は閉じる（データが変更されたため）
        if (this.dataTableManager && this.dataTableManager.isVisible()) {
            ConfigUtils.debugLog('データが更新されたためデータテーブルを閉じます', 'ui');
            this.dataTableManager.hideTable();
        }
        
        ConfigUtils.debugLog('UI更新完了', 'ui');
    }

    /**
     * 基準組織セレクトボックスを更新
     */
    updateBaseOrgSelect() {
        const select = this.elements.baseOrgSelect;
        select.innerHTML = '<option value="">すべて表示</option>';
        
        const organizations = this.dataProcessor.getOrganizationList();
        organizations.forEach(org => {
            const option = document.createElement('option');
            option.value = org;
            option.textContent = org;
            select.appendChild(option);
        });
        
        ConfigUtils.debugLog(`基準組織セレクト更新: ${organizations.length}件`, 'ui');
    }

    /**
     * チャートレンダラーを更新
     */
    updateChartRenderer() {
        const processedData = this.dataProcessor.getProcessedData();
        if (processedData.organizations.size > 0) {
            this.layoutCalculator = new LayoutCalculator(processedData);
            
            if (!this.chartRenderer) {
                this.chartRenderer = new ChartRenderer(this.elements.orgChart);
                this.chartRenderer.setDataProcessor(this.dataProcessor);
                this.exportUtils = new ExportUtils(this.chartRenderer);
            }
            
            ConfigUtils.debugLog('レイアウト計算機を更新', 'ui');
        }
    }

    /**
     * 組織図を生成（修正版 - データ反映確実化）
     */
    generateChart() {
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError(t ? t('noDataLoaded') : 'No data loaded. Please select an Excel file first.');
            return;
        }

        try {
            this.showLoading('Generating chart...');
            
            ConfigUtils.debugLog('=== 組織図生成開始 ===', 'ui');
            
            // データテーブルからの変更が適用されているか確認
            const processedData = this.dataProcessor.getProcessedData();
            if (processedData.organizations.size === 0) {
                ConfigUtils.debugLog('処理済みデータが空のため強制再処理を実行', 'ui');
                this.dataProcessor.processData(); // 強制的に再処理
            }
            
            ConfigUtils.debugLog(`処理済み組織数: ${processedData.organizations.size}`, 'ui');
            
            const baseOrg = this.elements.baseOrgSelect.value;
            const maxLevel = parseInt(this.elements.levelSelect.value);
            const fontSize = this.elements.fontSizeSelect.value;
            const boxSize = this.elements.boxSizeSelect.value;
            const hideManagers = this.elements.hideManagersCheckbox.checked;
            
            ConfigUtils.debugLog(`生成設定: baseOrg="${baseOrg}", maxLevel=${maxLevel}, fontSize=${fontSize}, boxSize=${boxSize}, hideManagers=${hideManagers}`, 'ui');
            
            if (!this.chartRenderer) {
                ConfigUtils.debugLog('ChartRendererを再初期化します', 'ui');
                this.chartRenderer = new ChartRenderer(this.elements.orgChart);
                this.chartRenderer.setDataProcessor(this.dataProcessor);
                this.exportUtils = new ExportUtils(this.chartRenderer);
            }
            
            if (typeof this.chartRenderer.updateStyles !== 'function') {
                ConfigUtils.debugLog('updateStylesメソッドが見つかりません', 'error');
                throw new Error('ChartRendererのupdateStylesメソッドが定義されていません');
            }
            
            // 必ず現在のフォントサイズとボックスサイズでスタイルを更新
            this.chartRenderer.updateStyles(fontSize, boxSize);
            
            if (!this.layoutCalculator) {
                ConfigUtils.debugLog('LayoutCalculatorを初期化します', 'ui');
                // 最新の処理済みデータを取得
                const latestProcessedData = this.dataProcessor.getProcessedData();
                this.layoutCalculator = new LayoutCalculator(latestProcessedData);
            } else {
                // 既存のLayoutCalculatorのデータを更新
                ConfigUtils.debugLog('LayoutCalculatorのデータを更新します', 'ui');
                this.layoutCalculator.processedData = this.dataProcessor.getProcessedData();
            }
            
            let targetOrgs;
            if (baseOrg) {
                targetOrgs = this.dataProcessor.getOrganizationHierarchy(baseOrg, maxLevel);
                ConfigUtils.debugLog(`基準組織: ${baseOrg}, 階層制限: ${maxLevel}`, 'ui');
            } else {
                targetOrgs = this.dataProcessor.getAllOrganizations(maxLevel);
                ConfigUtils.debugLog(`全組織表示, 階層制限: ${maxLevel}`, 'ui');
            }
            
            if (targetOrgs.length === 0) {
                throw new Error('表示する組織が見つかりません。条件を変更してください。');
            }
            
            ConfigUtils.debugLog(`対象組織: [${targetOrgs.join(', ')}]`, 'ui');
            
            // 最新のprocessedDataを取得
            const currentProcessedData = this.dataProcessor.getProcessedData();
            const missingOrgs = targetOrgs.filter(org => !currentProcessedData.organizations.has(org));
            if (missingOrgs.length > 0) {
                throw new Error(`組織データが見つかりません: ${missingOrgs.join(', ')}`);
            }
            
            ConfigUtils.debugLog('レイアウト計算を開始', 'ui');
            const layout = this.layoutCalculator.calculateLayout(targetOrgs, baseOrg, { hideManagers });
            
            ConfigUtils.debugLog('組織図描画を開始', 'ui');
            this.chartRenderer.render(layout, currentProcessedData, { hideManagers });
            
            this.hideLoading();
            this.hideError();
            
            // 組織図生成完了後の状態に更新（全機能利用可能）
            this.updateButtonStates('chartGenerated');
            
            this.showSuccessMessage(t ? t('chartGenerated', { count: targetOrgs.length }) : `Chart generated (${targetOrgs.length} organizations)`);
            
            ConfigUtils.debugLog(`組織図生成完了: ${targetOrgs.length}組織`, 'ui');
            
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to generate chart: ' + error.message);
            ConfigUtils.debugLog(`組織図生成エラー: ${error.message}`, 'error');
            ConfigUtils.debugLog(`エラースタック: ${error.stack}`, 'error');
            
            ConfigUtils.debugLog('=== デバッグ情報 ===', 'error');
            ConfigUtils.debugLog(`ChartRenderer: ${this.chartRenderer ? 'initialized' : 'null'}`, 'error');
            ConfigUtils.debugLog(`LayoutCalculator: ${this.layoutCalculator ? 'initialized' : 'null'}`, 'error');
            ConfigUtils.debugLog(`DataProcessor: ${this.dataProcessor ? 'initialized' : 'null'}`, 'error');
            
            if (this.chartRenderer) {
                ConfigUtils.debugLog(`updateStyles method: ${typeof this.chartRenderer.updateStyles}`, 'error');
            }
        }
    }

    /**
     * チャートスタイルを更新（リアルタイム更新）
     */
    updateChartStyle() {
        if (!this.dataProcessor.isDataProcessed()) return;
        
        const fontSize = this.elements.fontSizeSelect.value;
        const boxSize = this.elements.boxSizeSelect.value;
        
        this.chartRenderer.updateStyles(fontSize, boxSize);
        
        // If the chart is already generated, regenerate it with the new settings
        if (this.elements.orgChart.children.length > 0) {
            // Add a small delay to ensure CSS variables are applied before regenerating
            requestAnimationFrame(() => {
                this.generateChart();
            });
        }
        
        ConfigUtils.debugLog(`スタイル更新: フォント=${fontSize}, ボックス=${boxSize}`, 'ui');
    }

    /**
     * PNG出力
     */
    exportPNG() {
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError('Chart not generated yet');
            return;
        }
        
        this.exportUtils.exportPNG();
    }

    /**
     * SVG出力
     */
    exportSVG() {
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError('Chart not generated yet');
            return;
        }
        
        this.exportUtils.exportSVG();
    }

    /**
     * 印刷
     */
    printChart() {
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError('Chart not generated yet');
            return;
        }
        
        this.exportUtils.print();
    }

    /**
     * データテーブルを表示
     */
    showDataTable() {
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError('No data loaded');
            return;
        }
        
        if (this.dataTableManager) {
            this.dataTableManager.showTable();
            ConfigUtils.debugLog('データテーブルを表示', 'ui');
        } else {
            this.showError('Data table function not initialized');
        }
    }

    /**
     * データ検証を実行
     */
    validateData() {
        ConfigUtils.debugLog('=== データ検証開始 ===', 'ui');
        
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError('No data loaded');
            return;
        }
        
        try {
            this.showLoading('データを検証中...');
            
            const validationResult = this.dataProcessor.validateHierarchyStructure();
            
            this.hideLoading();
            ConfigUtils.debugLog('検証結果ポップアップを表示', 'ui');
            this.showValidationResult(validationResult);
            
            // 統計情報を更新（検証結果を反映）
            this.showStats();
            ConfigUtils.debugLog('統計情報を更新', 'ui');
            
            ConfigUtils.debugLog('データ検証完了', 'ui');
            
        } catch (error) {
            this.hideLoading();
            this.showError('Error during data validation: ' + error.message);
            ConfigUtils.debugLog(`データ検証エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 検証結果を表示
     */
    showValidationResult(validationResult) {
        ConfigUtils.debugLog('=== 検証結果ポップアップ表示開始 ===', 'ui');
        const { isValid, errors, warnings, statistics } = validationResult;
        
        // 既存の検証結果ポップアップを削除
        const existingPopups = document.querySelectorAll('.validation-result-popup');
        ConfigUtils.debugLog(`既存ポップアップ削除: ${existingPopups.length}個`, 'ui');
        existingPopups.forEach(popup => popup.remove());
        
        // データ処理エラーも含める
        const dataErrors = this.dataProcessor.getErrors();
        const totalErrors = dataErrors.length + errors.length;
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'validation-result-popup';
        resultDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            z-index: 2000;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        const hasAnyErrors = totalErrors > 0;
        let statusColor = hasAnyErrors ? '#e53e3e' : '#48bb78';
        let statusIcon = hasAnyErrors ? '❌' : '✅';
        let statusText = hasAnyErrors ? '検証失敗' : '検証成功';
        
        let content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: ${statusColor}; margin: 0;">
                    ${statusIcon} データ検証結果: ${statusText}
                </h2>
            </div>
            
            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #2d3748;">📊 統計情報</h3>
                <p><strong>総組織数:</strong> ${statistics.totalOrganizations}</p>
                <p><strong>最大階層レベル:</strong> ${statistics.maxLevel}</p>
                <p><strong>ルート組織数:</strong> ${statistics.rootOrganizations}</p>
                
                <h4 style="margin: 15px 0 5px 0;">階層レベル別組織数:</h4>
                <ul style="margin: 0; padding-left: 20px;">
        `;
        
        Array.from(statistics.levelCounts.entries())
            .sort((a, b) => a[0] - b[0])
            .forEach(([level, count]) => {
                content += `<li>レベル ${level}: ${count}組織</li>`;
            });
        
        content += `</ul></div>`;
        
        // データ処理エラーを表示
        if (dataErrors.length > 0) {
            content += `
                <div style="background: #fed7d7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 10px 0; color: #c53030;">❌ データ処理エラー (${dataErrors.length}件)</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #c53030;">
            `;
            dataErrors.forEach(error => {
                content += `<li>${error}</li>`;
            });
            content += `</ul></div>`;
        }
        
        // 検証エラーを表示
        if (errors.length > 0) {
            content += `
                <div style="background: #fed7d7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 10px 0; color: #c53030;">❌ 階層検証エラー (${errors.length}件)</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #c53030;">
            `;
            errors.forEach(error => {
                content += `<li>${error}</li>`;
            });
            content += `</ul></div>`;
        }
        
        if (warnings.length > 0) {
            content += `
                <div style="background: #fef5e7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 10px 0; color: #dd6b20;">⚠️ 警告 (${warnings.length}件)</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #dd6b20;">
            `;
            warnings.forEach(warning => {
                content += `<li>${warning}</li>`;
            });
            content += `</ul></div>`;
        }
        
        if (!hasAnyErrors) {
            content += `
                <div style="background: #c6f6d5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="margin: 0; color: #22543d;">
                        <strong>✅ 検証完了</strong><br>
                        データに問題は見つかりませんでした。組織図を生成できます。
                        ${warnings.length > 0 ? `<br><small>※ ${warnings.length}件の警告がありますが、組織図生成には影響ありません。</small>` : ''}
                    </p>
                </div>
            `;
        }
        
        content += `
            <div style="text-align: center;">
                <button onclick="this.closest('.validation-result-popup').remove()" style="
                    background: #4299e1;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                ">閉じる</button>
            </div>
        `;
        
        resultDiv.innerHTML = content;
        
        // Escキーで閉じる機能を追加
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                resultDiv.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        };
        document.addEventListener('keydown', closeHandler);
        
        // オーバーレイクリックで閉じる機能を追加
        resultDiv.addEventListener('click', (e) => {
            if (e.target === resultDiv) {
                resultDiv.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        });
        
        ConfigUtils.debugLog('検証結果ポップアップをDOMに追加', 'ui');
        document.body.appendChild(resultDiv);
        ConfigUtils.debugLog('=== 検証結果ポップアップ表示完了 ===', 'ui');
        
        console.log('=== データ検証結果 ===');
        console.log('検証結果:', isValid ? '成功' : '失敗');
        console.log('統計情報:', statistics);
        if (errors.length > 0) console.log('エラー:', errors);
        if (warnings.length > 0) console.log('警告:', warnings);
    }

    /**
     * 統計情報を表示
     */
    showStats() {
        const stats = this.dataProcessor.getStatistics();
        
        // 実際の検証結果を取得
        const validationResult = this.dataProcessor.validateHierarchyStructure();
        const dataErrors = this.dataProcessor.getErrors(); // データ処理時のエラー
        
        // 全エラー数を計算（データ処理エラー + 検証エラー）
        const totalErrors = dataErrors.length + validationResult.errors.length;
        const totalWarnings = validationResult.warnings.length;
        
        this.elements.statsContent.innerHTML = `
            Total Records: ${stats.totalRecords}, 
            Organizations: ${stats.organizations}, 
            Managers: ${stats.managers}, 
            Max Level: ${stats.maxLevel}
            ${stats.mappings ? `, Call Name Mappings: ${stats.mappings}` : ''}
            ${stats.customColors ? `, Custom Colors: ${stats.customColors} orgs` : ''}
            ${totalErrors > 0 ? `, <span style="color: #e53e3e;" title="Data: ${dataErrors.length}, Validation: ${validationResult.errors.length}">Errors: ${totalErrors}</span>` : ''}
            ${totalWarnings > 0 ? `, <span style="color: #dd6b20;" title="Validation warnings">Warnings: ${totalWarnings}</span>` : ''}
        `;
        
        this.elements.stats.style.display = 'block';
        ConfigUtils.debugLog(`統計情報を表示 - データエラー: ${dataErrors.length}, 検証エラー: ${validationResult.errors.length}, 警告: ${totalWarnings}`, 'ui');
        
        // デバッグ用：エラーの詳細をログ出力
        if (CONFIG.DEBUG.ENABLED) {
            if (dataErrors.length > 0) {
                ConfigUtils.debugLog('データ処理エラー詳細:', 'ui');
                dataErrors.forEach((error, index) => {
                    ConfigUtils.debugLog(`  ${index + 1}. ${error}`, 'ui');
                });
            }
            if (validationResult.errors.length > 0) {
                ConfigUtils.debugLog('検証エラー詳細:', 'ui');
                validationResult.errors.forEach((error, index) => {
                    ConfigUtils.debugLog(`  ${index + 1}. ${error}`, 'ui');
                });
            }
            if (validationResult.warnings.length > 0) {
                ConfigUtils.debugLog('警告詳細:', 'ui');
                validationResult.warnings.forEach((warning, index) => {
                    ConfigUtils.debugLog(`  ${index + 1}. ${warning}`, 'ui');
                });
            }
        }
    }

    /**
     * 成功メッセージを表示
     */
    showSuccessMessage(message) {
        const existingSuccess = document.getElementById('successMessage');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        const successDiv = document.createElement('div');
        successDiv.id = 'successMessage';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        successDiv.innerHTML = `
            <strong>✓ ${t ? t('success') : 'Success!'}</strong><br>${message}
            <style>
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => successDiv.remove(), 300);
            }
        }, 3000);
    }

    /**
     * エラーを表示
     */
    showError(message) {
        const errors = this.dataProcessor.getErrors();
        let errorHTML = `<div style="margin-bottom: 10px;"><strong>⚠️ ${message}</strong></div>`;
        
        if (errors.length > 0) {
            errorHTML += `
                <div style="margin-top: 10px; padding: 10px; background: #fed7d7; border-left: 4px solid #e53e3e; font-size: 14px;">
                    <strong>Data Error Details:</strong><br>
                    ${errors.slice(0, 5).map(error => `• ${error}`).join('<br>')}
                    ${errors.length > 5 ? `<br>... and ${errors.length - 5} more` : ''}
                </div>
            `;
        }
        
        this.elements.errors.innerHTML = errorHTML;
        this.elements.errors.style.display = 'block';
        
        ConfigUtils.debugLog(`エラー表示: ${message}`, 'ui');
    }

    /**
     * エラーを非表示
     */
    hideError() {
        this.elements.errors.style.display = 'none';
    }

    /**
     * ローディング表示
     */
    showLoading(message) {
        this.hideLoading();
        
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingIndicator';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(74, 85, 104, 0.95);
            color: white;
            padding: 25px 35px;
            border-radius: 10px;
            z-index: 2000;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            backdrop-filter: blur(5px);
        `;
        loadingDiv.innerHTML = `
            <div style="margin-bottom: 15px;">
                <div style="
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top: 3px solid white;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                "></div>
            </div>
            <div style="font-size: 16px;">${message}</div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(loadingDiv);
    }

    /**
     * ローディングを非表示
     */
    hideLoading() {
        const loadingDiv = document.getElementById('loadingIndicator');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    /**
     * ボタン状態を段階的に更新（改善版）
     * @param {string} stage - 'initial', 'dataLoaded', 'chartGenerated'
     */
    updateButtonStates(stage) {
        // All buttons that exist
        const buttons = {
            generateBtn: this.elements.generateBtn,
            showTableBtn: this.elements.showTableBtn,
            validateBtn: this.elements.validateBtn,
            exportCurrentDataBtn: this.elements.exportCurrentDataBtn,
            exportSvgBtn: this.elements.exportSvgBtn,
            exportPngBtn: this.elements.exportPngBtn,
            exportHTMLBtn: this.elements.exportHTMLBtn,
            printBtn: this.elements.printBtn,
            fullscreenBtn: this.elements.fullscreenBtn
        };

        switch (stage) {
            case 'initial':
                // 初期状態: データ操作のみ可能
                this.setButtonState(buttons.generateBtn, false);
                this.setButtonState(buttons.showTableBtn, false);
                this.setButtonState(buttons.validateBtn, false);
                this.setButtonState(buttons.exportCurrentDataBtn, false);
                this.setButtonState(buttons.exportSvgBtn, false);
                this.setButtonState(buttons.exportPngBtn, false);
                this.setButtonState(buttons.exportHTMLBtn, false);
                this.setButtonState(buttons.printBtn, false);
                this.setButtonState(buttons.fullscreenBtn, false);
                ConfigUtils.debugLog('ボタン状態: 初期状態（データ操作のみ）', 'ui');
                break;

            case 'dataLoaded':
                // データ読み込み後: データ編集・検証・組織図生成が可能
                this.setButtonState(buttons.generateBtn, true);
                this.setButtonState(buttons.showTableBtn, true);
                this.setButtonState(buttons.validateBtn, true);
                this.setButtonState(buttons.exportCurrentDataBtn, true);
                // エクスポート機能はまだ無効
                this.setButtonState(buttons.exportSvgBtn, false);
                this.setButtonState(buttons.exportPngBtn, false);
                this.setButtonState(buttons.exportHTMLBtn, false);
                this.setButtonState(buttons.printBtn, false);
                this.setButtonState(buttons.fullscreenBtn, false);
                ConfigUtils.debugLog('ボタン状態: データ読み込み後（編集・生成可能）', 'ui');
                break;

            case 'chartGenerated':
                // 組織図生成後: 全機能利用可能
                this.setButtonState(buttons.generateBtn, true);
                this.setButtonState(buttons.showTableBtn, true);
                this.setButtonState(buttons.validateBtn, true);
                this.setButtonState(buttons.exportCurrentDataBtn, true);
                this.setButtonState(buttons.exportSvgBtn, true);
                this.setButtonState(buttons.exportPngBtn, true);
                this.setButtonState(buttons.exportHTMLBtn, true);
                this.setButtonState(buttons.printBtn, true);
                this.setButtonState(buttons.fullscreenBtn, true);
                ConfigUtils.debugLog('ボタン状態: 組織図生成後（全機能利用可能）', 'ui');
                break;

            default:
                ConfigUtils.debugLog(`不明なステージ: ${stage}`, 'ui');
        }
    }

    /**
     * ボタンの有効/無効を安全に設定
     * @param {HTMLElement} button - ボタン要素
     * @param {boolean} enabled - 有効化フラグ
     */
    setButtonState(button, enabled) {
        if (button) {
            button.disabled = !enabled;
        }
    }

    /**
     * コントロールを有効化（レガシー互換用）
     */
    enableControls() {
        this.updateButtonStates('dataLoaded');
    }

    /**
     * コントロールを無効化（レガシー互換用）
     */
    disableControls() {
        this.updateButtonStates('initial');
    }

    /**
     * 設定値を取得
     */
    getCurrentSettings() {
        return {
            baseOrg: this.elements.baseOrgSelect.value,
            maxLevel: parseInt(this.elements.levelSelect.value),
            fontSize: this.elements.fontSizeSelect.value,
            boxSize: this.elements.boxSizeSelect.value,
            hideManagers: this.elements.hideManagersCheckbox.checked
        };
    }

    /**
     * UIをリセット
     */
    reset() {
        this.elements.orgChart.innerHTML = '';
        this.elements.baseOrgSelect.innerHTML = '<option value="">すべて表示</option>';
        this.hideError();
        this.hideLoading();
        this.elements.stats.style.display = 'none';
        this.elements.demoMode.style.display = 'none';
        this.disableControls();
        
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.remove();
        }
        
        this.dataProcessor = new DataProcessor();
        this.layoutCalculator = null;
        
        if (this.dataTableManager) {
            this.dataTableManager.hideTable();
            this.initializeDataTableManager();
        }
        
        ConfigUtils.debugLog('UIをリセット', 'ui');
    }

    /**
     * フル画面表示を切り替え
     */
    toggleFullscreen() {
        if (!this.dataProcessor.isDataProcessed() || this.elements.orgChart.children.length === 0) {
            this.showError('No chart generated yet. Please generate a chart first.');
            return;
        }

        try {
            if (!this.isFullscreen) {
                this.enterFullscreen();
            } else {
                this.exitFullscreen();
            }
        } catch (error) {
            this.showError('Error toggling fullscreen: ' + error.message);
            ConfigUtils.debugLog(`フル画面切り替えエラー: ${error.message}`, 'error');
        }
    }

    /**
     * フル画面表示に入る
     */
    enterFullscreen() {
        // 元のスタイルを保存
        this.saveOriginalStyles();

        // フル画面用のオーバーレイを作成
        const fullscreenOverlay = document.createElement('div');
        fullscreenOverlay.id = 'fullscreenOverlay';
        fullscreenOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #ffffff;
            z-index: 9999;
            overflow: auto;
            padding: 20px;
            box-sizing: border-box;
        `;

        // フル画面用のヘッダーを作成
        const fullscreenHeader = document.createElement('div');
        fullscreenHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
        `;

        fullscreenHeader.innerHTML = `
            <h2 style="margin: 0; color: #2d3748; font-family: 'Segoe UI', sans-serif;">
                Organization Chart - Full Screen View
            </h2>
            <button onclick="window.exitFullscreen()" style="
                background: #e53e3e;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-family: 'Segoe UI', sans-serif;
            ">
                ✕ ${t ? t('exitFullScreen') : 'Exit Full Screen'}
            </button>
        `;

        // チャート全体のサイズを取得
        const chartDimensions = this.getFullChartDimensions();
        
        // チャートコンテナをフル画面用に調整
        const fullscreenChartContainer = document.createElement('div');
        fullscreenChartContainer.style.cssText = `
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #ffffff;
            overflow: auto;
            max-height: calc(100vh - 120px);
            position: relative;
            padding: 20px;
        `;

        // チャートラッパーを作成（実際のサイズで）
        const chartWrapper = document.createElement('div');
        chartWrapper.style.cssText = `
            position: relative;
            width: ${chartDimensions.width}px;
            height: ${chartDimensions.height}px;
        `;

        // 元のチャートコンテンツをクローン
        const originalChart = this.elements.orgChart;
        const chartClone = originalChart.cloneNode(true);
        chartClone.id = 'fullscreenOrgChart';
        chartClone.style.width = chartDimensions.width + 'px';
        chartClone.style.height = chartDimensions.height + 'px';
        
        chartWrapper.appendChild(chartClone);
        fullscreenChartContainer.appendChild(chartWrapper);

        // オーバーレイに要素を追加
        fullscreenOverlay.appendChild(fullscreenHeader);
        fullscreenOverlay.appendChild(fullscreenChartContainer);

        // 既存の凡例があれば追加
        this.addLegendsToFullscreen(fullscreenOverlay);

        // ボディに追加
        document.body.appendChild(fullscreenOverlay);

        // Escキーでフル画面を終了
        this.setupFullscreenKeyboardEvents();

        // ステータス更新
        this.isFullscreen = true;
        this.updateFullscreenButton();

        ConfigUtils.debugLog('フル画面表示開始', 'ui');
    }

    /**
     * フル画面表示を終了
     */
    exitFullscreen() {
        const fullscreenOverlay = document.getElementById('fullscreenOverlay');
        if (fullscreenOverlay) {
            fullscreenOverlay.remove();
        }

        // 元のスタイルを復元
        this.restoreOriginalStyles();

        // キーボードイベントを削除
        document.removeEventListener('keydown', this.fullscreenKeyHandler);

        // ステータス更新
        this.isFullscreen = false;
        this.updateFullscreenButton();

        ConfigUtils.debugLog('フル画面表示終了', 'ui');
    }

    /**
     * 元のスタイルを保存
     */
    saveOriginalStyles() {
        this.originalStyles = {
            body: {
                overflow: document.body.style.overflow,
                position: document.body.style.position
            }
        };

        // ボディのスクロールを無効化
        document.body.style.overflow = 'hidden';
    }

    /**
     * 元のスタイルを復元
     */
    restoreOriginalStyles() {
        if (this.originalStyles.body) {
            document.body.style.overflow = this.originalStyles.body.overflow;
            document.body.style.position = this.originalStyles.body.position;
        }
    }

    /**
     * チャート全体の寸法を取得
     * @returns {Object} {width, height}
     */
    getFullChartDimensions() {
        const container = this.elements.orgChart;
        let maxX = 0;
        let maxY = 0;
        
        // すべての組織ボックスを確認
        const boxes = container.querySelectorAll('.org-box');
        boxes.forEach(box => {
            const left = parseInt(box.style.left) || 0;
            const top = parseInt(box.style.top) || 0;
            const width = box.offsetWidth || 85;
            const height = box.offsetHeight || 100;
            
            maxX = Math.max(maxX, left + width);
            maxY = Math.max(maxY, top + height);
        });
        
        // 接続線も考慮
        const lines = container.querySelectorAll('.connection-line');
        lines.forEach(line => {
            const left = parseInt(line.style.left) || 0;
            const top = parseInt(line.style.top) || 0;
            const width = parseInt(line.style.width) || 0;
            const height = parseInt(line.style.height) || 0;
            
            maxX = Math.max(maxX, left + width);
            maxY = Math.max(maxY, top + height);
        });
        
        // マージンを追加
        return {
            width: maxX + 50,
            height: maxY + 50
        };
    }

    /**
     * フル画面に凡例を追加
     */
    addLegendsToFullscreen(container) {
        // Call Name凡例
        const callNameLegend = document.getElementById('callNameLegend');
        if (callNameLegend) {
            const legendClone = callNameLegend.cloneNode(true);
            legendClone.id = 'fullscreenCallNameLegend';
            legendClone.style.marginTop = '20px';
            container.appendChild(legendClone);
        }

        // 色凡例
        const colorLegend = document.getElementById('colorLegend');
        if (colorLegend) {
            const legendClone = colorLegend.cloneNode(true);
            legendClone.id = 'fullscreenColorLegend';
            legendClone.style.marginTop = '20px';
            container.appendChild(legendClone);
        }
    }

    /**
     * フル画面用キーボードイベントを設定
     */
    setupFullscreenKeyboardEvents() {
        this.fullscreenKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.exitFullscreen();
            }
        };
        document.addEventListener('keydown', this.fullscreenKeyHandler);
    }

    /**
     * フル画面ボタンのテキストを更新
     */
    updateFullscreenButton() {
        if (this.elements.fullscreenBtn) {
            const text = this.isFullscreen ? 
                (t ? t('exitFullScreen') : 'Exit Full Screen') : 
                (t ? t('fullScreen') : 'Full Screen');
            this.elements.fullscreenBtn.textContent = text;
        }
    }

    /**
     * アプリケーション状態をチェック
     */
    getAppState() {
        return {
            dataLoaded: this.dataProcessor.isDataProcessed(),
            statistics: this.dataProcessor.isDataProcessed() ? this.dataProcessor.getStatistics() : null,
            settings: this.getCurrentSettings(),
            hasErrors: this.dataProcessor.getErrors().length > 0,
            chartGenerated: this.elements.orgChart.children.length > 0,
            dataTableVisible: this.dataTableManager ? this.dataTableManager.isVisible() : false,
            isFullscreen: this.isFullscreen
        };
    }

    /**
     * デバッグ情報をコンソールに出力
     */
    debugInfo() {
        if (!CONFIG.DEBUG.ENABLED) return;
        
        console.log('\n=== UI Controller Debug Info ===');
        console.log('App State:', this.getAppState());
        console.log('Elements:', Object.keys(this.elements));
        console.log('Data Processor Errors:', this.dataProcessor.getErrors());
        
        if (this.dataProcessor.isDataProcessed()) {
            console.log('Organization List:', this.dataProcessor.getOrganizationList());
            console.log('Processed Data Size:', {
                organizations: this.dataProcessor.getProcessedData().organizations.size,
                hierarchy: this.dataProcessor.getProcessedData().hierarchy.size
            });
        }
    }
}

// グローバルに公開
window.UIController = UIController;