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
        const errorDiv = document.createElement('div');
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
            <button onclick="this.parentElement.remove()" style="
                background: #c53030;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            ">閉じる</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // 10秒後に自動削除
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
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
     * Excel出力用のデータを準備
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