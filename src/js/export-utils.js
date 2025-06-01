/**
 * 組織図作成ツール - エクスポートユーティリティ（完全版・エラー修正）
 * PNG、SVG、印刷機能を提供
 */

class ExportUtils {
    constructor(chartRenderer) {
        this.chartRenderer = chartRenderer;
    }

    /**
     * PNG形式でエクスポート
     * @returns {Promise<void>}
     */
    async exportPNG() {
        try {
            // html2canvasが利用可能かチェック
            if (typeof html2canvas !== 'undefined') {
                ConfigUtils.debugLog('PNG出力開始', 'export');
                
                const canvas = await html2canvas(this.chartRenderer.container, {
                    backgroundColor: '#ffffff',
                    scale: 2, // 高解像度
                    logging: false,
                    useCORS: true,
                    allowTaint: false,
                    width: this.chartRenderer.container.scrollWidth,
                    height: this.chartRenderer.container.scrollHeight
                });
                
                this.downloadCanvas(canvas, CONFIG.EXPORT.PNG_FILENAME);
                ConfigUtils.debugLog('PNG出力完了', 'export');
                this.showExportSuccess('PNGファイルのダウンロードを開始しました');
            } else {
                this.showPNGError();
            }
        } catch (error) {
            ConfigUtils.debugLog(`PNG出力エラー: ${error.message}`, 'error');
            this.showExportError('PNG出力中にエラーが発生しました: ' + error.message);
        }
    }

    /**
     * SVG形式でエクスポート
     */
    exportSVG() {
        try {
            const svgContent = this.chartRenderer.toSVG();
            this.downloadText(svgContent, CONFIG.EXPORT.SVG_FILENAME, 'image/svg+xml');
            ConfigUtils.debugLog('SVG出力完了', 'export');
            this.showExportSuccess('SVGファイルのダウンロードを開始しました');
        } catch (error) {
            ConfigUtils.debugLog(`SVG出力エラー: ${error.message}`, 'error');
            this.showExportError('SVG出力中にエラーが発生しました: ' + error.message);
        }
    }

    /**
     * 印刷機能
     */
    print() {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                this.showExportError('ポップアップがブロックされました。ポップアップを許可してください。');
                return;
            }
            
            const printHTML = this.chartRenderer.getPrintHTML();
            
            printWindow.document.write(printHTML);
            printWindow.document.close();
            printWindow.focus();
            
            // 印刷ダイアログを表示
            setTimeout(() => {
                printWindow.print();
                setTimeout(() => {
                    printWindow.close();
                }, 1000);
            }, 250);
            
            ConfigUtils.debugLog('印刷ダイアログを表示', 'export');
        } catch (error) {
            ConfigUtils.debugLog(`印刷エラー: ${error.message}`, 'error');
            this.showExportError('印刷中にエラーが発生しました: ' + error.message);
        }
    }

    /**
     * Canvasをダウンロード
     * @param {HTMLCanvasElement} canvas - Canvas要素
     * @param {string} filename - ファイル名
     */
    downloadCanvas(canvas, filename) {
        try {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.style.display = 'none';
            
            // ダウンロードを実行
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            ConfigUtils.debugLog(`PNG ダウンロード実行: ${filename}`, 'export');
        } catch (error) {
            ConfigUtils.debugLog(`PNG ダウンロードエラー: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * テキストファイルをダウンロード
     * @param {string} content - ファイル内容
     * @param {string} filename - ファイル名
     * @param {string} mimeType - MIMEタイプ
     */
    downloadText(content, filename, mimeType) {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // ダウンロードを実行
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // リソースをクリーンアップ
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
            
            ConfigUtils.debugLog(`ファイルダウンロード実行: ${filename}`, 'export');
        } catch (error) {
            ConfigUtils.debugLog(`ダウンロードエラー: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * PNG出力エラーを表示
     */
    showPNGError() {
        const message = `
            PNG出力には html2canvas ライブラリが必要です。<br>
            代わりにSVG出力をご利用ください。<br>
            <a href="#" onclick="window.exportSVG()" style="color: #3182ce; text-decoration: underline;">SVG出力を実行</a>
        `;
        this.showExportError(message);
    }

    /**
     * エクスポート成功メッセージを表示
     * @param {string} message - 成功メッセージ
     */
    showExportSuccess(message) {
        const successDiv = document.createElement('div');
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
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        successDiv.innerHTML = `
            <strong>✓ 成功!</strong><br>${message}
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(successDiv);
        
        // 3秒後に自動削除
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => successDiv.remove(), 300);
            }
        }, 3000);
    }

    /**
     * エクスポートエラーを表示
     * @param {string} message - エラーメッセージ
     */
    showExportError(message) {
        // 既存のエクスポートエラーポップアップを削除
        const existingExportErrors = document.querySelectorAll('.export-error-popup');
        existingExportErrors.forEach(popup => popup.remove());
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'export-error-popup';
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fed7d7;
            color: #c53030;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #e53e3e;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 400px;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <strong>⚠️ エクスポートエラー</strong><br><br>
            ${message}<br><br>
            <button onclick="this.closest('.export-error-popup').remove()" style="
                background: #c53030;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            ">閉じる</button>
        `;
        
        // Escキーで閉じる機能を追加
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                errorDiv.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        };
        document.addEventListener('keydown', closeHandler);
        
        // オーバーレイクリックで閉じる機能を追加
        errorDiv.addEventListener('click', (e) => {
            if (e.target === errorDiv) {
                errorDiv.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        });
        
        document.body.appendChild(errorDiv);
        
        // 10秒後に自動削除
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        }, 10000);
    }

    /**
     * 高画質PNG出力（将来の拡張用）
     * @param {number} scale - スケール倍率
     * @returns {Promise<void>}
     */
    async exportHighQualityPNG(scale = 3) {
        try {
            if (typeof html2canvas !== 'undefined') {
                const canvas = await html2canvas(this.chartRenderer.container, {
                    backgroundColor: '#ffffff',
                    scale: scale,
                    logging: false,
                    useCORS: true,
                    width: this.chartRenderer.container.scrollWidth,
                    height: this.chartRenderer.container.scrollHeight
                });
                
                const filename = CONFIG.EXPORT.PNG_FILENAME.replace('.png', '_high_quality.png');
                this.downloadCanvas(canvas, filename);
                ConfigUtils.debugLog(`高画質PNG出力完了 (scale: ${scale})`, 'export');
                this.showExportSuccess('高画質PNGファイルのダウンロードを開始しました');
            } else {
                this.showPNGError();
            }
        } catch (error) {
            ConfigUtils.debugLog(`高画質PNG出力エラー: ${error.message}`, 'error');
            this.showExportError('高画質PNG出力中にエラーが発生しました: ' + error.message);
        }
    }

    /**
     * Excel形式でデータ出力（将来の拡張用）
     */
    exportExcel() {
        try {
            // SheetJSを使用してExcel出力
            if (typeof XLSX !== 'undefined') {
                const workbook = XLSX.utils.book_new();
                
                // 組織データを配列に変換
                const orgData = this.prepareExcelData();
                const worksheet = XLSX.utils.aoa_to_sheet(orgData);
                
                XLSX.utils.book_append_sheet(workbook, worksheet, '組織図データ');
                XLSX.writeFile(workbook, '組織図データ.xlsx');
                
                ConfigUtils.debugLog('Excel出力完了', 'export');
                this.showExportSuccess('Excelファイルのダウンロードを開始しました');
            } else {
                this.showExportError('Excel出力には SheetJS ライブラリが必要です');
            }
        } catch (error) {
            ConfigUtils.debugLog(`Excel出力エラー: ${error.message}`, 'error');
            this.showExportError('Excel出力中にエラーが発生しました: ' + error.message);
        }
    }

    /**
     * 空のExcelテンプレートを出力
     */
    exportEmptyTemplate() {
        try {
            if (typeof XLSX !== 'undefined') {
                const workbook = XLSX.utils.book_new();
                
                // 空のテンプレートデータを作成
                const templateData = this.createEmptyTemplateData();
                const worksheet = XLSX.utils.aoa_to_sheet(templateData);
                
                // カラム幅を設定
                worksheet['!cols'] = [
                    { width: 8 },   // Level
                    { width: 12 },  // Employee ID
                    { width: 15 },  // Name
                    { width: 15 },  // Name (EN)
                    { width: 8 },   // Grade
                    { width: 12 },  // Team ID
                    { width: 20 },  // Team Long Name
                    { width: 15 },  // Call Name
                    { width: 15 },  // Parent Org
                    { width: 18 },  // Role
                    { width: 15 },  // Role (JP)
                    { width: 12 },  // Border Color
                    { width: 15 },  // Background Color
                    { width: 15 },  // Header Text Color
                    { width: 12 },  // Team Boss Flag
                    { width: 12 }   // Concurrent
                ];
                
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Organization Data');
                
                const filename = 'Organization_Chart_Template.xlsx';
                XLSX.writeFile(workbook, filename);
                
                ConfigUtils.debugLog('空テンプレート出力完了', 'export');
                this.showExportSuccess(t ? t('emptyTemplateExported', { filename }) : `Empty template "${filename}" exported successfully.`);
            } else {
                this.showExportError('Excel export requires SheetJS library');
            }
        } catch (error) {
            ConfigUtils.debugLog(`空テンプレート出力エラー: ${error.message}`, 'error');
            this.showExportError('Error exporting empty template: ' + error.message);
        }
    }

    /**
     * 空のテンプレートデータを作成
     * @returns {Array<Array>} テンプレート用データ配列
     */
    createEmptyTemplateData() {
        // ヘッダー行
        const headers = [
            'Level',
            'Employee ID', 
            'Name',
            'Name (EN)',
            'Grade',
            'Team ID',
            'Team Long Name',
            'Call Name',
            'Parent Org',
            'Role',
            'Role (JP)',
            'Border Color',
            'Background Color',
            'Header Text Color',
            'Team Boss',
            'Concurrent'
        ];
        
        // 説明行
        const instructionRow = [
            '1-10',
            'Optional',
            'Required',
            'Optional',
            'Optional',
            'Team identifier',
            'Full organization name',
            'Short name (Required)',
            'Parent Call Name or N/A',
            'Required',
            'Japanese role (Optional)',
            'HEX color or color name',
            'HEX color or color name', 
            'HEX color or color name',
            'Y for team boss, blank for others',
            'Y for concurrent assignment, blank for others'
        ];
        
        // サンプルデータ行
        const sampleRows = [
            [1, '', 'John Smith', 'John Smith', 'M4', 'HQ001', 'Main Office', 'HQ', 'N/A', 'President', '社長', '#2196f3', '#e3f2fd', '#ffffff', 'Y', ''],
            [2, '', 'Jane Doe', 'Jane Doe', 'M3', 'PROD001', 'Production Department', 'Production', 'HQ', 'Manager', '部長', '#4caf50', '#f1f8e9', '#ffffff', 'Y', ''],
            [3, '', 'Bob Johnson', 'Bob Johnson', 'M2', 'MFG001', 'Manufacturing Section', 'Mfg', 'Production', 'Section Manager', '課長', '', '', '', 'Y', ''],
            [3, '', 'Alice Brown', 'Alice Brown', 'E3', 'SUP001', 'Production Support', 'Prod Support', 'Production', 'Advisor', 'アドバイザ', '', '', '', '', 'Y']
        ];
        
        return [headers, instructionRow, ...sampleRows];
    }

    /**
     * 現在のデータをExcel形式で出力
     */
    exportCurrentDataToExcel() {
        if (!this.chartRenderer.dataProcessor || !this.chartRenderer.dataProcessor.isDataProcessed()) {
            this.showExportError('No data loaded to export. Please load data first.');
            return;
        }

        try {
            if (typeof XLSX !== 'undefined') {
                const workbook = XLSX.utils.book_new();
                
                // 現在のデータを準備
                const currentData = this.prepareCurrentDataForExcel();
                const worksheet = XLSX.utils.aoa_to_sheet(currentData);
                
                // カラム幅を設定
                worksheet['!cols'] = [
                    { width: 8 },   // Level
                    { width: 12 },  // Employee ID
                    { width: 15 },  // Name
                    { width: 15 },  // Name (EN)
                    { width: 8 },   // Grade
                    { width: 12 },  // Team ID
                    { width: 20 },  // Team Long Name
                    { width: 15 },  // Call Name
                    { width: 15 },  // Parent Org
                    { width: 18 },  // Role
                    { width: 15 },  // Role (JP)
                    { width: 12 },  // Border Color
                    { width: 15 },  // Background Color
                    { width: 15 },  // Header Text Color
                    { width: 12 },  // Team Boss Flag
                    { width: 12 }   // Concurrent
                ];
                
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Organization Data');
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                const filename = `Organization_Chart_Data_${timestamp}.xlsx`;
                XLSX.writeFile(workbook, filename);
                
                ConfigUtils.debugLog('現在データExcel出力完了', 'export');
                this.showExportSuccess(t ? t('currentDataExported', { filename }) : `Current data "${filename}" exported successfully.`);
            } else {
                this.showExportError('Excel export requires SheetJS library');
            }
        } catch (error) {
            ConfigUtils.debugLog(`現在データExcel出力エラー: ${error.message}`, 'error');
            this.showExportError('Error exporting current data: ' + error.message);
        }
    }

    /**
     * 現在のデータをExcel出力用に準備
     * @returns {Array<Array>} Excel用データ配列
     */
    prepareCurrentDataForExcel() {
        const headers = [
            'Level',
            'Employee ID', 
            'Name',
            'Name (EN)',
            'Grade',
            'Team ID',
            'Team Long Name',
            'Call Name',
            'Parent Org',
            'Role',
            'Role (JP)',
            'Border Color',
            'Background Color',
            'Header Text Color',
            'Team Boss',
            'Concurrent'
        ];
        
        const data = [headers];
        
        // DataProcessorから生のデータを取得
        const rawData = this.chartRenderer.dataProcessor.getRawData();
        
        if (rawData && rawData.length > 0) {
            rawData.forEach(row => {
                // 生データは配列形式で、各要素が対応する列のデータ
                data.push([
                    row[0] || '',   // Level
                    row[1] || '',   // Employee ID
                    row[2] || '',   // Name
                    row[3] || '',   // Name (EN)
                    row[4] || '',   // Grade
                    row[5] || '',   // Team ID
                    row[6] || '',   // Team Long Name
                    row[7] || '',   // Call Name
                    row[8] || '',   // Parent Org
                    row[9] || '',   // Role
                    row[10] || '',  // Role (JP)
                    row[11] || '',  // Border Color
                    row[12] || '',  // Background Color
                    row[13] || '',  // Header Text Color
                    row[14] || '',  // Team Boss Flag
                    row[15] || ''   // Concurrent
                ]);
            });
        }
        
        return data;
    }

    /**
     * Excel出力用のデータを準備（旧形式・互換性維持）
     * @returns {Array<Array>} Excel用データ配列
     */
    prepareExcelData() {
        const headers = ['組織名', '親組織', '階層レベル', '管理者', '役職', 'アドバイザ'];
        const data = [headers];
        
        if (this.chartRenderer.processedData && this.chartRenderer.processedData.organizations) {
            this.chartRenderer.processedData.organizations.forEach((org, name) => {
                const manager = org.managers.length > 0 ? org.managers[0] : null;
                const advisor = org.advisors.length > 0 ? org.advisors[0] : null;
                
                data.push([
                    name,
                    org.parent || '',
                    org.level,
                    manager ? manager.name : '',
                    manager ? manager.role : '',
                    advisor ? `${advisor.name} (${advisor.role})` : ''
                ]);
            });
        }
        
        return data;
    }

    /**
     * HTML形式でスタンドアロン組織図をエクスポート
     */
    exportHTML() {
        if (!this.chartRenderer.container || this.chartRenderer.container.children.length === 0) {
            this.showExportError('No chart generated to export. Please generate a chart first.');
            return;
        }

        try {
            const htmlContent = this.createStandaloneHTML();
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const filename = `Organization_Chart_${timestamp}.html`;
            
            this.downloadText(htmlContent, filename, 'text/html');
            
            ConfigUtils.debugLog('HTML出力完了', 'export');
            this.showExportSuccess(t ? t('htmlExported', { filename }) : `Standalone HTML "${filename}" exported successfully.`);
        } catch (error) {
            ConfigUtils.debugLog(`HTML出力エラー: ${error.message}`, 'error');
            this.showExportError('Error exporting HTML: ' + error.message);
        }
    }

    /**
     * スタンドアロンHTML文書を作成
     * @returns {string} 完全なHTML文書
     */
    createStandaloneHTML() {
        const chartHTML = this.chartRenderer.container.innerHTML;
        const legends = this.extractLegends();
        const customCSS = this.generateCustomCSS();
        const chartDimensions = this.getChartDimensions();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Chart</title>
    <style>
        ${this.getSimpleEmbeddedCSS(chartDimensions)}
        ${customCSS}
    </style>
</head>
<body>
    <header class="header">
        <h1>Organization Chart</h1>
        <p class="generated-info">Generated on ${new Date().toLocaleString()}</p>
    </header>
    
    <div class="chart-area">
        <div class="chart-container" style="width: ${chartDimensions.width + 40}px; height: ${chartDimensions.height + 40}px;">
            <div id="orgChart" style="width: ${chartDimensions.width}px; height: ${chartDimensions.height}px;">
                ${chartHTML}
            </div>
        </div>
    </div>
    
    ${legends}
    
    <footer class="footer">
        <p>Generated by Organization Chart Tool</p>
    </footer>
</body>
</html>`;
    }

    /**
     * シンプルな埋め込みCSS（幅制限なし）
     * @param {Object} dimensions - チャートの寸法
     * @returns {string} CSS文字列
     */
    getSimpleEmbeddedCSS(dimensions) {
        return `
        /* Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            padding: 20px;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }

        .header h1 {
            color: #2d3748;
            margin-bottom: 10px;
        }

        .generated-info {
            color: #718096;
            font-size: 0.9rem;
        }

        /* Chart Area - No width restrictions */
        .chart-area {
            overflow-x: auto;
            margin-bottom: 30px;
        }

        .chart-container {
            display: inline-block;
            position: relative;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
        }

        /* Organization Chart */
        #orgChart {
            position: relative;
        }

        .org-box {
            position: absolute;
            width: 85px;
            height: 100px;
            border: 2px solid #333;
            background: #f9f9f9;
            border-radius: 4px;
            font-size: 12px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 10;
        }

        .org-header {
            background: #4a5568;
            color: white;
            padding: 3px 4px;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
            border-radius: 2px 2px 0 0;
            min-height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            white-space: pre-line;
            line-height: 1.1;
            word-break: break-all;
            overflow-wrap: break-word;
        }

        .org-content {
            padding: 4px 3px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 1px;
        }

        .org-manager-role {
            font-size: 9px;
            font-weight: normal;
            text-align: left;
            color: #2d3748;
            margin-bottom: 1px;
            white-space: normal;
            line-height: 1.1;
            word-break: break-all;
            min-height: 14px;
        }

        .org-manager {
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 2px;
            color: #2d3748;
            white-space: normal;
            overflow: visible;
            line-height: 1.1;
            word-break: break-all;
            min-height: 16px;
        }

        .org-advisor-role {
            font-size: 8px;
            font-weight: normal;
            text-align: left;
            color: #718096;
            margin-bottom: 1px;
            white-space: normal;
            overflow: visible;
            line-height: 1.1;
            word-break: break-all;
            min-height: 12px;
        }

        .org-advisor {
            font-size: 9px;
            font-weight: normal;
            text-align: center;
            color: #718096;
            white-space: normal;
            overflow: visible;
            line-height: 1.1;
            word-break: break-all;
            min-height: 14px;
        }

        .org-empty {
            height: 1px;
            visibility: hidden;
        }

        /* Connection lines */
        .connection-line {
            position: absolute;
            background: #333;
            z-index: 1;
        }

        .connection-line.horizontal {
            height: 2px;
        }

        .connection-line.vertical {
            width: 2px;
        }

        /* Hide Managers mode */
        .org-box.hide-managers-mode {
            height: auto !important;
            min-height: 35px;
        }

        .org-box.hide-managers-mode .org-header {
            min-height: 35px;
            padding: 8px 6px;
        }

        .org-content.managers-hidden {
            display: none !important;
        }

        /* Legends */
        .abbreviation-legend,
        .color-legend {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .abbreviation-legend h4,
        .color-legend h4 {
            margin: 0 0 15px 0;
            color: #2d3748;
            font-size: 1.2rem;
        }

        .legend-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        .legend-table th,
        .legend-table td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
        }

        .legend-table th {
            background: #edf2f7;
            font-weight: bold;
        }

        .abbr-short {
            font-weight: bold;
            color: #4299e1;
        }

        .abbr-full {
            color: #2d3748;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 20px;
            color: #718096;
            font-size: 0.9rem;
            max-width: 800px;
            margin: 0 auto;
        }

        /* Print Styles */
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .chart-area {
                overflow: visible !important;
            }
            
            .org-box {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
        `;
    }

    /**
     * チャートの実際の寸法を取得
     * @returns {Object} {width, height}
     */
    getChartDimensions() {
        const container = this.chartRenderer.container;
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
     * 埋め込み用CSSを取得
     * @returns {string} CSS文字列
     */
    getEmbeddedCSS() {
        return `
        /* Reset and Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            overflow-x: auto;
        }

        .standalone-container {
            width: max-content;
            min-width: 100%;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header h1 {
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 2rem;
        }

        .generated-info {
            color: #718096;
            font-size: 0.9rem;
        }

        .chart-wrapper {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            overflow: visible;
            width: auto;
            display: inline-block;
            min-width: 100%;
        }

        .chart-container {
            position: relative;
            overflow: visible;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            background: #ffffff;
            padding: 20px;
            width: ${this.getChartDimensions().width + 40}px;
            height: ${this.getChartDimensions().height + 40}px;
        }

        /* Organization Chart Styles */
        #orgChart {
            position: relative;
            width: ${this.getChartDimensions().width}px;
            height: ${this.getChartDimensions().height}px;
        }

        .org-box {
            position: absolute;
            width: 85px;
            height: 100px;
            border: 2px solid #333;
            background: #f9f9f9;
            border-radius: 4px;
            font-size: 12px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            z-index: 10;
        }

        .org-box:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .org-header {
            background: #4a5568;
            color: white;
            padding: 3px 4px;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
            border-radius: 2px 2px 0 0;
            min-height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            white-space: pre-line;
            line-height: 1.1;
            word-break: break-all;
            overflow-wrap: break-word;
        }

        .org-content {
            padding: 4px 3px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 1px;
        }

        .org-manager-role {
            font-size: 9px;
            font-weight: normal;
            text-align: left;
            color: #2d3748;
            margin-bottom: 1px;
            white-space: normal;
            line-height: 1.1;
            word-break: break-all;
            min-height: 14px;
        }

        .org-manager {
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 2px;
            color: #2d3748;
            white-space: normal;
            overflow: visible;
            line-height: 1.1;
            word-break: break-all;
            min-height: 16px;
        }

        .org-advisor-role {
            font-size: 8px;
            font-weight: normal;
            text-align: left;
            color: #718096;
            margin-bottom: 1px;
            white-space: normal;
            overflow: visible;
            line-height: 1.1;
            word-break: break-all;
            min-height: 12px;
        }

        .org-advisor {
            font-size: 9px;
            font-weight: normal;
            text-align: center;
            color: #718096;
            white-space: normal;
            overflow: visible;
            line-height: 1.1;
            word-break: break-all;
            min-height: 14px;
        }

        .org-empty {
            height: 1px;
            visibility: hidden;
        }

        .org-empty-manager-space {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #a0aec0;
            font-style: italic;
            font-size: 9px;
        }

        .connection-line {
            position: absolute;
            background: #333;
            z-index: 1;
        }

        .connection-line.horizontal {
            height: 2px;
        }

        .connection-line.vertical {
            width: 2px;
        }

        /* Legends */
        .abbreviation-legend,
        .color-legend {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }

        .abbreviation-legend h4,
        .color-legend h4 {
            margin: 0 0 15px 0;
            color: #2d3748;
            font-size: 1.2rem;
        }

        .legend-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        .legend-table th,
        .legend-table td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
        }

        .legend-table th {
            background: #edf2f7;
            font-weight: bold;
        }

        .abbr-short {
            font-weight: bold;
            color: #4299e1;
        }

        .abbr-full {
            color: #2d3748;
        }

        .color-summary {
            font-size: 14px;
            color: #6c757d;
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #e9ecef;
            margin-bottom: 10px;
        }

        .color-patterns {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .color-pattern-item {
            display: flex;
            align-items: center;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #e9ecef;
        }

        .pattern-sample {
            border-radius: 2px;
            margin-right: 8px;
            flex-shrink: 0;
        }

        .pattern-orgs {
            font-size: 13px;
            color: #495057;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #718096;
            font-size: 0.9rem;
        }

        /* Print Styles */
        @media print {
            body {
                background: white;
            }
            
            .standalone-container {
                padding: 0;
            }
            
            .header,
            .chart-wrapper,
            .abbreviation-legend,
            .color-legend {
                box-shadow: none;
                border: 1px solid #ddd;
            }
            
            .org-box {
                box-shadow: none;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .org-box:hover {
                transform: none;
                box-shadow: none;
            }
            
            .connection-line {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .standalone-container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 1.5rem;
            }
            
            .chart-wrapper {
                padding: 10px;
            }
        }
        `;
    }

    /**
     * カスタムCSSを生成（個別の色設定など）
     * @returns {string} カスタムCSS
     */
    generateCustomCSS() {
        let customCSS = '';
        
        // 現在のCSS変数の値を取得
        const root = document.documentElement;
        const computed = getComputedStyle(root);
        
        // 現在のサイズ設定を適用
        customCSS += `
        .org-box {
            width: ${computed.getPropertyValue('--org-box-width')} !important;
            height: ${computed.getPropertyValue('--org-box-height')} !important;
            font-size: ${computed.getPropertyValue('--font-size-org')} !important;
        }
        .org-header {
            font-size: ${computed.getPropertyValue('--font-size-org')} !important;
        }
        .org-manager {
            font-size: ${computed.getPropertyValue('--font-size-name')} !important;
        }
        .org-manager-role {
            font-size: ${computed.getPropertyValue('--font-size-role')} !important;
        }
        .org-advisor {
            font-size: calc(${computed.getPropertyValue('--font-size-name')} * 0.85) !important;
        }
        .org-advisor-role {
            font-size: calc(${computed.getPropertyValue('--font-size-role')} * 0.85) !important;
        }
        `;
        
        // 各組織ボックスの個別スタイルを抽出
        const orgBoxes = this.chartRenderer.container.querySelectorAll('.org-box');
        orgBoxes.forEach((box, index) => {
            const callName = box.getAttribute('data-call-name');
            if (callName) {
                const header = box.querySelector('.org-header');
                const boxStyles = [];
                const headerStyles = [];
                
                // ボックス自体のスタイル
                if (box.style.borderColor) {
                    boxStyles.push(`border-color: ${box.style.borderColor} !important`);
                }
                
                // ヘッダーのスタイル
                if (header) {
                    if (header.style.backgroundColor) {
                        headerStyles.push(`background-color: ${header.style.backgroundColor} !important`);
                    }
                    if (header.style.color) {
                        headerStyles.push(`color: ${header.style.color} !important`);
                    }
                }
                
                if (boxStyles.length > 0) {
                    customCSS += `.org-box[data-call-name="${callName}"] { ${boxStyles.join('; ')}; }\n`;
                }
                
                if (headerStyles.length > 0) {
                    customCSS += `.org-box[data-call-name="${callName}"] .org-header { ${headerStyles.join('; ')}; }\n`;
                }
            }
        });
        
        return customCSS;
    }

    /**
     * 凡例部分を抽出
     * @returns {string} 凡例のHTML
     */
    extractLegends() {
        let legendsHTML = '';
        
        // Call Name凡例
        const callNameLegend = document.getElementById('callNameLegend');
        if (callNameLegend) {
            legendsHTML += `<div class="legend-section">${callNameLegend.outerHTML}</div>`;
        }
        
        // 色凡例
        const colorLegend = document.getElementById('colorLegend');
        if (colorLegend) {
            legendsHTML += `<div class="legend-section">${colorLegend.outerHTML}</div>`;
        }
        
        return legendsHTML;
    }

    /**
     * 組織図のステータス情報を取得
     * @returns {Object} ステータス情報
     */
    getExportStatus() {
        const bounds = this.chartRenderer.getBounds();
        const nodeCount = this.chartRenderer.container.querySelectorAll('.org-box').length;
        const connectionCount = this.chartRenderer.container.querySelectorAll('.connection-line').length;
        
        return {
            ready: nodeCount > 0,
            nodeCount,
            connectionCount,
            dimensions: bounds,
            timestamp: new Date().toISOString()
        };
    }
}

// グローバルに公開
window.ExportUtils = ExportUtils;