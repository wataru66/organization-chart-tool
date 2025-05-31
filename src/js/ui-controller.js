/**
 * 組織図作成ツール - UI制御モジュール（データ反映修正版）
 * ユーザーインターフェースの制御とイベント管理
 */

class UIController {
    constructor() {
        this.dataProcessor = new DataProcessor();
        this.chartRenderer = null;
        this.exportUtils = null;
        this.layoutCalculator = null;
        this.dataTableManager = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.initializeDataTableManager();
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
            generateBtn: document.getElementById('generateBtn'),
            exportSvgBtn: document.getElementById('exportSvgBtn'),
            exportPngBtn: document.getElementById('exportPngBtn'),
            printBtn: document.getElementById('printBtn'),
            showTableBtn: document.getElementById('showTableBtn'),
            validateBtn: document.getElementById('validateBtn'),
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
            this.showLoading('サンプルデータを読み込み中...');
            this.elements.demoMode.style.display = 'block';
            this.elements.demoMode.textContent = 'デモモード: 修正済みサンプルデータで動作確認中';
            
            this.dataProcessor.loadCorrectedSampleData();
            this.updateUI();
            this.enableControls();
            this.showStats();
            this.hideError();
            this.hideLoading();
            
            setTimeout(() => {
                this.generateChart();
            }, 500);
            
            ConfigUtils.debugLog('修正済みサンプルデータロード完了', 'ui');
        } catch (error) {
            this.hideLoading();
            this.showError('サンプルデータの読み込みに失敗しました: ' + error.message);
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
                throw new Error('対応していないファイル形式です。Excelファイル（.xlsx, .xls）を選択してください。');
            }
            
            this.showLoading(`ファイルを読み込み中: ${file.name}`);
            this.hideError();
            
            await this.dataProcessor.processExcelFile(file);
            this.updateUI();
            this.enableControls();
            this.showStats();
            this.hideLoading();
            
            this.elements.demoMode.style.display = 'none';
            
            ConfigUtils.debugLog(`ファイル処理完了: ${file.name}`, 'ui');
            this.showSuccessMessage(`ファイル「${file.name}」の読み込みが完了しました。`);
            
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
            this.showError('データが読み込まれていません。まずExcelファイルを選択してください。');
            return;
        }

        try {
            this.showLoading('組織図を生成中...');
            
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
            
            ConfigUtils.debugLog(`生成設定: baseOrg="${baseOrg}", maxLevel=${maxLevel}, fontSize=${fontSize}, boxSize=${boxSize}`, 'ui');
            
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
            const layout = this.layoutCalculator.calculateLayout(targetOrgs, baseOrg);
            
            ConfigUtils.debugLog('組織図描画を開始', 'ui');
            this.chartRenderer.render(layout, currentProcessedData);
            
            this.hideLoading();
            this.hideError();
            
            this.showSuccessMessage(`組織図を生成しました（${targetOrgs.length}組織）`);
            
            ConfigUtils.debugLog(`組織図生成完了: ${targetOrgs.length}組織`, 'ui');
            
        } catch (error) {
            this.hideLoading();
            this.showError('組織図の生成に失敗しました: ' + error.message);
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
        ConfigUtils.debugLog(`スタイル更新: フォント=${fontSize}, ボックス=${boxSize}`, 'ui');
    }

    /**
     * PNG出力
     */
    exportPNG() {
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError('組織図が生成されていません');
            return;
        }
        
        this.exportUtils.exportPNG();
    }

    /**
     * SVG出力
     */
    exportSVG() {
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError('組織図が生成されていません');
            return;
        }
        
        this.exportUtils.exportSVG();
    }

    /**
     * 印刷
     */
    printChart() {
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError('組織図が生成されていません');
            return;
        }
        
        this.exportUtils.print();
    }

    /**
     * データテーブルを表示
     */
    showDataTable() {
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError('データが読み込まれていません');
            return;
        }
        
        if (this.dataTableManager) {
            this.dataTableManager.showTable();
            ConfigUtils.debugLog('データテーブルを表示', 'ui');
        } else {
            this.showError('データテーブル機能が初期化されていません');
        }
    }

    /**
     * データ検証を実行
     */
    validateData() {
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError('データが読み込まれていません');
            return;
        }
        
        try {
            this.showLoading('データを検証中...');
            
            const validationResult = this.dataProcessor.validateHierarchyStructure();
            
            this.hideLoading();
            this.showValidationResult(validationResult);
            
            ConfigUtils.debugLog('データ検証完了', 'ui');
            
        } catch (error) {
            this.hideLoading();
            this.showError('データ検証中にエラーが発生しました: ' + error.message);
            ConfigUtils.debugLog(`データ検証エラー: ${error.message}`, 'error');
        }
    }

    /**
     * 検証結果を表示
     */
    showValidationResult(validationResult) {
        const { isValid, errors, warnings, statistics } = validationResult;
        
        const resultDiv = document.createElement('div');
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
        
        let statusColor = isValid ? '#48bb78' : '#e53e3e';
        let statusIcon = isValid ? '✅' : '❌';
        let statusText = isValid ? '検証成功' : '検証失敗';
        
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
        
        if (errors.length > 0) {
            content += `
                <div style="background: #fed7d7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 10px 0; color: #c53030;">❌ エラー (${errors.length}件)</h3>
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
        
        if (isValid) {
            content += `
                <div style="background: #c6f6d5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="margin: 0; color: #22543d;">
                        <strong>✅ 検証完了</strong><br>
                        データに問題は見つかりませんでした。組織図を生成できます。
                    </p>
                </div>
            `;
        }
        
        content += `
            <div style="text-align: center;">
                <button onclick="this.parentElement.parentElement.remove()" style="
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
        document.body.appendChild(resultDiv);
        
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
        
        this.elements.statsContent.innerHTML = `
            総レコード数: ${stats.totalRecords}, 
            組織数: ${stats.organizations}, 
            管理者数: ${stats.managers}, 
            最大階層数: ${stats.maxLevel}
            ${stats.mappings ? `, Call Name マッピング: ${stats.mappings}件` : ''}
            ${stats.customColors ? `, カスタム色: ${stats.customColors}組織` : ''}
            ${stats.errors > 0 ? `, エラー数: <span style="color: #e53e3e;">${stats.errors}</span>` : ''}
        `;
        
        this.elements.stats.style.display = 'block';
        ConfigUtils.debugLog('統計情報を表示', 'ui');
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
            <strong>✓ 成功!</strong><br>${message}
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
                    <strong>データエラー詳細:</strong><br>
                    ${errors.slice(0, 5).map(error => `• ${error}`).join('<br>')}
                    ${errors.length > 5 ? `<br>... 他${errors.length - 5}件` : ''}
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
     * コントロールを有効化
     */
    enableControls() {
        this.elements.generateBtn.disabled = false;
        this.elements.exportSvgBtn.disabled = false;
        if (this.elements.exportPngBtn) {
            this.elements.exportPngBtn.disabled = false;
        }
        this.elements.printBtn.disabled = false;
        if (this.elements.showTableBtn) {
            this.elements.showTableBtn.disabled = false;
        }
        if (this.elements.validateBtn) {
            this.elements.validateBtn.disabled = false;
        }
        
        ConfigUtils.debugLog('コントロールを有効化', 'ui');
    }

    /**
     * コントロールを無効化
     */
    disableControls() {
        this.elements.generateBtn.disabled = true;
        this.elements.exportSvgBtn.disabled = true;
        if (this.elements.exportPngBtn) {
            this.elements.exportPngBtn.disabled = true;
        }
        this.elements.printBtn.disabled = true;
        if (this.elements.showTableBtn) {
            this.elements.showTableBtn.disabled = true;
        }
        if (this.elements.validateBtn) {
            this.elements.validateBtn.disabled = true;
        }
        
        ConfigUtils.debugLog('コントロールを無効化', 'ui');
    }

    /**
     * 設定値を取得
     */
    getCurrentSettings() {
        return {
            baseOrg: this.elements.baseOrgSelect.value,
            maxLevel: parseInt(this.elements.levelSelect.value),
            fontSize: this.elements.fontSizeSelect.value,
            boxSize: this.elements.boxSizeSelect.value
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
     * アプリケーション状態をチェック
     */
    getAppState() {
        return {
            dataLoaded: this.dataProcessor.isDataProcessed(),
            statistics: this.dataProcessor.isDataProcessed() ? this.dataProcessor.getStatistics() : null,
            settings: this.getCurrentSettings(),
            hasErrors: this.dataProcessor.getErrors().length > 0,
            chartGenerated: this.elements.orgChart.children.length > 0,
            dataTableVisible: this.dataTableManager ? this.dataTableManager.isVisible() : false
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