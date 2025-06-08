/**
 * Export Utils Module
 * エクスポート機能モジュール（SVG/PNG/HTML/Excel）
 */

const ExportUtilsModule = (() => {
    'use strict';

    class ExportUtils {
        constructor() {
            this.languageManager = null;
            this.initialize();
        }

        initialize() {
            if (window.ConfigModule?.LanguageManager) {
                this.languageManager = window.ConfigModule.LanguageManager.getInstance();
            }
        }

        /**
         * SVGエクスポート
         * @param {SVGElement} svgElement - SVG要素
         * @param {string} filename - ファイル名
         */
        exportSVG(svgElement, filename = 'organization-chart.svg') {
            if (!svgElement) return;

            const clonedSVG = svgElement.cloneNode(true);
            this.embedStyles(clonedSVG);
            
            const svgData = new XMLSerializer().serializeToString(clonedSVG);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            this.downloadBlob(blob, filename);
        }

        /**
         * PNGエクスポート
         * @param {SVGElement} svgElement - SVG要素
         * @param {string} filename - ファイル名
         * @param {number} scale - スケール
         */
        async exportPNG(svgElement, filename = 'organization-chart.png', scale = 2) {
            if (!svgElement) return;

            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const svgData = this.prepareSVGForExport(svgElement);
                
                const img = new Image();
                img.onload = () => {
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    ctx.scale(scale, scale);
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        this.downloadBlob(blob, filename);
                    }, 'image/png');
                };
                
                img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
            } catch (error) {
                console.error('PNG export failed:', error);
            }
        }

        /**
         * HTMLエクスポート
         * @param {HTMLElement} container - コンテナ要素
         * @param {string} filename - ファイル名
         */
        exportHTML(container, filename = 'organization-chart.html') {
            if (!container) return;

            const htmlContent = this.generateStandaloneHTML(container);
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            this.downloadBlob(blob, filename);
        }

        /**
         * Excelエクスポート
         * @param {Array} data - データ配列
         * @param {string} filename - ファイル名
         */
        exportExcel(data, filename = 'organization-data.xlsx') {
            if (!data || data.length === 0) return;

            // 簡易CSV形式でのエクスポート（Excel代替）
            const headers = [
                'Level', 'Team Name', 'Exact Team Name', 'Upper Team', 'Team ID',
                'Role', 'Role(2nd Lang)', 'Team Boss', 'PIC Name', 'PIC Name(2nd Lang)',
                'Concurrent', 'Employee CD', 'Grade', 'Memo',
                'Border Color', 'Header BG Color', 'Header Text Color'
            ];
            
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => {
                    const key = this.headerToKey(header);
                    const value = row[key] || '';
                    return `"${value.toString().replace(/"/g, '""')}"`;
                }).join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            this.downloadBlob(blob, filename.replace('.xlsx', '.csv'));
        }

        /**
         * SVGをエクスポート用に準備
         * @param {SVGElement} svgElement - SVG要素
         * @returns {string} SVGデータ
         */
        prepareSVGForExport(svgElement) {
            const clonedSVG = svgElement.cloneNode(true);
            this.embedStyles(clonedSVG);
            
            // viewBoxを設定
            const bbox = svgElement.getBBox();
            clonedSVG.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
            clonedSVG.setAttribute('width', bbox.width);
            clonedSVG.setAttribute('height', bbox.height);
            
            return new XMLSerializer().serializeToString(clonedSVG);
        }

        /**
         * スタイルをSVGに埋め込み
         * @param {SVGElement} svg - SVG要素
         */
        embedStyles(svg) {
            const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
            style.textContent = `
                .org-box { cursor: pointer; }
                .org-box:hover .org-box-bg { stroke-width: 3; }
                .connection-line { stroke: #666; stroke-width: 2; fill: none; }
                .team-name { font-family: Arial, sans-serif; font-weight: bold; }
                .pic-name { font-family: Arial, sans-serif; }
                .role { font-family: Arial, sans-serif; font-style: italic; }
            `;
            svg.insertBefore(style, svg.firstChild);
        }

        /**
         * スタンドアロンHTMLを生成
         * @param {HTMLElement} container - コンテナ要素
         * @returns {string} HTML文字列
         */
        generateStandaloneHTML(container) {
            return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Chart</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .chart-container { width: 100%; height: 600px; border: 1px solid #ccc; }
        svg { width: 100%; height: 100%; }
        .org-box { cursor: pointer; }
        .connection-line { stroke: #666; stroke-width: 2; fill: none; }
    </style>
</head>
<body>
    <h1>Organization Chart</h1>
    <div class="export-info">
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
    ${container.outerHTML}
</body>
</html>`;
        }

        /**
         * ファイルをダウンロード
         * @param {Blob} blob - Blobオブジェクト
         * @param {string} filename - ファイル名
         */
        downloadBlob(blob, filename) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        /**
         * ヘッダーをキーに変換
         * @param {string} header - ヘッダー名
         * @returns {string} キー名
         */
        headerToKey(header) {
            const keyMap = {
                'Level': 'level',
                'Team Name': 'teamName',
                'Exact Team Name': 'exactTeamName',
                'Upper Team': 'upperTeam',
                'Team ID': 'teamId',
                'Role': 'role',
                'Role(2nd Lang)': 'role2ndLang',
                'Team Boss': 'teamBoss',
                'PIC Name': 'picName',
                'PIC Name(2nd Lang)': 'picName2ndLang',
                'Concurrent': 'concurrent',
                'Employee CD': 'employeeCd',
                'Grade': 'grade',
                'Memo': 'memo',
                'Border Color': 'borderColor',
                'Header BG Color': 'headerBgColor',
                'Header Text Color': 'headerTextColor'
            };
            return keyMap[header] || header.toLowerCase().replace(/\s+/g, '');
        }

        /**
         * 翻訳関数
         * @param {string} key - 翻訳キー
         * @returns {string} 翻訳されたテキスト
         */
        t(key) {
            return this.languageManager?.t(key) || key;
        }
    }

    return {
        ExportUtils,
        createExporter() {
            return new ExportUtils();
        }
    };
})();

if (typeof window !== 'undefined') {
    window.ExportUtilsModule = ExportUtilsModule;
}