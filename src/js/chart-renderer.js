/**
 * 組織図作成ツール - チャート描画モジュール（色指定システム対応版・修正版）
 * 組織ボックスと接続線の描画を担当
 */

class ChartRenderer {
    constructor(container) {
        this.container = container;
        this.processedData = null;
        this.dataProcessor = null; // DataProcessorの参照を追加
    }

    /**
     * DataProcessorの参照を設定
     * @param {DataProcessor} dataProcessor - データプロセッサー
     */
    setDataProcessor(dataProcessor) {
        this.dataProcessor = dataProcessor;
    }

    /**
     * 組織図を描画（色指定対応版）
     * @param {Object} layout - レイアウト情報 { nodes, connections }
     * @param {Object} processedData - 処理済みデータ
     */
    render(layout, processedData) {
        this.processedData = processedData;
        
        // コンテナをクリア
        this.clearContainer();
        
        ConfigUtils.debugLog('=== 組織図描画開始 ===', 'render');
        ConfigUtils.debugLog(`ノード数: ${layout.nodes.length}`, 'render');
        ConfigUtils.debugLog(`接続線数: ${layout.connections.length}`, 'render');
        
        // 組織ボックスを描画
        layout.nodes.forEach(node => {
            this.createOrganizationBox(node);
        });
        
        // 接続線を描画
        layout.connections.forEach(connection => {
            this.createConnectionLine(connection);
        });
        
        // コンテナサイズを調整
        this.adjustContainerSize(layout.nodes);
        
        // Call Name・Team Long Name対応表を作成
        this.createCallNameLegend(layout.nodes);
        
        // 色設定の凡例を作成
        this.createColorLegend(layout.nodes);
        
        ConfigUtils.debugLog('組織図描画完了', 'render');
    }

    /**
     * コンテナをクリア
     */
    clearContainer() {
        this.container.innerHTML = '';
    }

    /**
     * 組織ボックスを作成（色指定対応版・修正版）
     * @param {Object} node - ノード情報 { org, x, y, level }
     */
    createOrganizationBox(node) {
        const orgData = this.processedData.organizations.get(node.org);
        
        // メインボックス要素を作成
        const box = document.createElement('div');
        box.className = 'org-box';
        box.setAttribute('data-level', node.level);
        box.setAttribute('data-call-name', node.org);
        box.setAttribute('data-long-name', orgData.longName || node.org);
        box.style.left = node.x + 'px';
        box.style.top = node.y + 'px';
        
        // カスタム色を適用
        this.applyCustomColors(box, orgData);
        
        // ヘッダー部分を作成
        const header = this.createBoxHeader(node.org, orgData);
        box.appendChild(header);
        
        // コンテンツ部分を作成
        const content = this.createBoxContent(orgData);
        box.appendChild(content);
        
        // ホバー効果のためのイベントリスナー
        this.addBoxEventListeners(box, node);
        
        this.container.appendChild(box);
    }

    /**
     * カスタム色を適用（修正版 - ヘッダー背景色対応）
     * @param {HTMLElement} box - ボックス要素
     * @param {Object} orgData - 組織データ
     */
    applyCustomColors(box, orgData) {
        const colors = orgData.colors || {};
        
        ConfigUtils.debugLog(`色適用開始: ${orgData.name}`, 'render');
        ConfigUtils.debugLog(`色データ: ${JSON.stringify(colors)}`, 'render');
        
        // 枠線色
        if (colors.borderColor && colors.borderColor !== CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.borderColor) {
            box.style.borderColor = colors.borderColor;
            box.style.borderWidth = '2px';
            box.style.borderStyle = 'solid';
            ConfigUtils.debugLog(`枠線色適用: ${colors.borderColor}`, 'render');
        }
        
        // 注意: backgroundColorはヘッダー部分に適用されるため、ここでは設定しない
        // ヘッダー作成時にcolors.backgroundColorをheaderBackgroundColorとして使用
        
        // カスタム色使用フラグを設定（アイコン表示は無効化）
        if (this.hasCustomColors(colors)) {
            // data-has-custom-colors属性は設定するが、CSSでのアイコン表示は無効化済み
            box.setAttribute('data-has-custom-colors', 'true');
            ConfigUtils.debugLog(`カスタム色フラグ設定（アイコン非表示）: ${orgData.name}`, 'render');
        }
        
        ConfigUtils.debugLog(`色適用完了: ${orgData.name}`, 'render');
    }

    /**
     * ボックスヘッダーを作成（色対応版・修正版）
     * @param {string} callName - Call Name
     * @param {Object} orgData - 組織データ
     * @returns {HTMLElement} ヘッダー要素
     */
    createBoxHeader(callName, orgData) {
        const header = document.createElement('div');
        header.className = 'org-header';
        
        // Call Nameをそのまま表示
        header.textContent = this.formatOrganizationName(callName);
        header.setAttribute('data-call-name', callName);
        
        // ヘッダーの色を適用（修正版）
        const colors = orgData.colors || {};
        
        ConfigUtils.debugLog(`ヘッダー色適用: ${callName}`, 'render');
        ConfigUtils.debugLog(`ヘッダー色データ: ${JSON.stringify(colors)}`, 'render');
        
        // backgroundColorをヘッダー背景色として使用
        if (colors.backgroundColor && colors.backgroundColor !== CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.backgroundColor) {
            header.style.backgroundColor = colors.backgroundColor;
            ConfigUtils.debugLog(`ヘッダー背景色適用（backgroundColorから）: ${colors.backgroundColor}`, 'render');
        } else if (colors.headerBackgroundColor && colors.headerBackgroundColor !== CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.headerBackgroundColor) {
            header.style.backgroundColor = colors.headerBackgroundColor;
            ConfigUtils.debugLog(`ヘッダー背景色適用: ${colors.headerBackgroundColor}`, 'render');
        }
        
        if (colors.headerTextColor && colors.headerTextColor !== CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.headerTextColor) {
            header.style.color = colors.headerTextColor;
            ConfigUtils.debugLog(`ヘッダー文字色適用: ${colors.headerTextColor}`, 'render');
        }
        
        return header;
    }

    /**
     * Call Name・Team Long Name対応表を作成
     * @param {Array<Object>} nodes - ノードの配列
     */
    createCallNameLegend(nodes) {
        // 既存の凡例があれば削除
        const existingLegend = document.getElementById('callNameLegend');
        if (existingLegend) {
            existingLegend.remove();
        }
        
        // 使用されている組織のCall Name・Team Long Nameペアを収集
        const callNamePairs = new Map();
        
        nodes.forEach(node => {
            const orgData = this.processedData.organizations.get(node.org);
            const callName = node.org;
            const longName = orgData.longName || node.org;
            
            if (longName && longName !== callName) {
                callNamePairs.set(callName, longName);
            }
        });
        
        // DataProcessorからマッピングを取得（利用可能な場合）
        if (this.dataProcessor && this.dataProcessor.getCallNameMapping) {
            const mapping = this.dataProcessor.getCallNameMapping();
            mapping.forEach((longName, callName) => {
                // ノードに存在するもののみ追加
                if (nodes.some(node => node.org === callName)) {
                    callNamePairs.set(callName, longName);
                }
            });
        }
        
        // 凡例が必要かチェック
        if (callNamePairs.size === 0) {
            ConfigUtils.debugLog('Call Name凡例は不要（略称なし）', 'render');
            return;
        }
        
        // 凡例テーブルを作成
        const legendContainer = document.createElement('div');
        legendContainer.id = 'callNameLegend';
        legendContainer.className = 'abbreviation-legend';
        
        const legendTitle = document.createElement('h4');
        legendTitle.textContent = 'Call Name・正式名称対応表';
        legendContainer.appendChild(legendTitle);
        
        const table = document.createElement('table');
        table.className = 'legend-table';
        
        // ヘッダー行
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Call Name</th>
            <th>Team Long Name（正式名称）</th>
        `;
        table.appendChild(headerRow);
        
        // データ行（Call Nameでソート）
        Array.from(callNamePairs.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([callName, longName]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="abbr-short">${callName}</td>
                    <td class="abbr-full">${longName}</td>
                `;
                table.appendChild(row);
            });
        
        legendContainer.appendChild(table);
        
        // チャートコンテナの親要素に凡例を追加
        const chartContainer = this.container.parentElement;
        chartContainer.appendChild(legendContainer);
        
        ConfigUtils.debugLog(`Call Name凡例を作成: ${callNamePairs.size}件`, 'render');
    }

    /**
     * 色設定の凡例を作成
     * @param {Array<Object>} nodes - ノードの配列
     */
    createColorLegend(nodes) {
        // 既存の色凡例があれば削除
        const existingColorLegend = document.getElementById('colorLegend');
        if (existingColorLegend) {
            existingColorLegend.remove();
        }
        
        // カスタム色が使用されているかチェック
        const customColorOrgs = [];
        const colorPatterns = new Map();
        
        nodes.forEach(node => {
            const orgData = this.processedData.organizations.get(node.org);
            if (orgData.colors && this.hasCustomColors(orgData.colors)) {
                customColorOrgs.push(node.org);
                
                // 色パターンを収集
                const colorKey = JSON.stringify({
                    borderColor: orgData.colors.borderColor,
                    backgroundColor: orgData.colors.backgroundColor
                });
                
                if (!colorPatterns.has(colorKey)) {
                    colorPatterns.set(colorKey, {
                        colors: orgData.colors,
                        organizations: []
                    });
                }
                colorPatterns.get(colorKey).organizations.push(node.org);
            }
        });
        
        // カスタム色が使用されていない場合は凡例を表示しない
        if (customColorOrgs.length === 0) {
            ConfigUtils.debugLog('カスタム色が未使用のため色凡例をスキップ', 'render');
            return;
        }
        
        const legendContainer = document.createElement('div');
        legendContainer.id = 'colorLegend';
        legendContainer.className = 'color-legend';
        
        const legendTitle = document.createElement('h4');
        legendTitle.textContent = '色分け設定';
        legendContainer.appendChild(legendTitle);
        
        const summary = document.createElement('div');
        summary.className = 'color-summary';
        summary.innerHTML = `
            カスタム色使用: ${customColorOrgs.length}組織、
            色パターン: ${colorPatterns.size}種類
        `;
        legendContainer.appendChild(summary);
        
        // 色パターンごとの詳細（パターンが少ない場合のみ）
        if (colorPatterns.size <= 5) {
            const patternsList = document.createElement('div');
            patternsList.className = 'color-patterns';
            
            colorPatterns.forEach((patternData, colorKey) => {
                const pattern = document.createElement('div');
                pattern.className = 'color-pattern-item';
                pattern.innerHTML = `
                    <div class="pattern-sample" style="
                        width: 20px; 
                        height: 20px; 
                        border: 2px solid ${patternData.colors.borderColor}; 
                        background: ${patternData.colors.backgroundColor};
                        display: inline-block;
                        margin-right: 8px;
                        vertical-align: middle;
                    "></div>
                    <span class="pattern-orgs">${patternData.organizations.join(', ')}</span>
                `;
                patternsList.appendChild(pattern);
            });
            
            legendContainer.appendChild(patternsList);
        }
        
        // チャートコンテナの親要素に凡例を追加
        const chartContainer = this.container.parentElement;
        chartContainer.appendChild(legendContainer);
        
        ConfigUtils.debugLog(`色凡例を作成: ${colorPatterns.size}パターン`, 'render');
    }

    /**
     * カスタム色が使用されているかチェック
     * @param {Object} colors - 色設定
     * @returns {boolean} カスタム色使用フラグ
     */
    hasCustomColors(colors) {
        if (!colors) return false;
        
        const defaultColors = CONFIG.COLOR_SYSTEM.DEFAULT_COLORS;
        return (
            (colors.borderColor && colors.borderColor !== defaultColors.borderColor) ||
            (colors.backgroundColor && colors.backgroundColor !== defaultColors.backgroundColor) ||
            (colors.headerTextColor && colors.headerTextColor !== defaultColors.headerTextColor) ||
            (colors.headerBackgroundColor && colors.headerBackgroundColor !== defaultColors.headerBackgroundColor)
        );
    }

    /**
     * ボックスコンテンツを作成（修正版）
     * @param {Object} orgData - 組織データ
     * @returns {HTMLElement} コンテンツ要素
     */
    createBoxContent(orgData) {
        const content = document.createElement('div');
        content.className = 'org-content';
        
        // チーム長情報を取得
        const manager = orgData.managers.length > 0 ? orgData.managers[0] : null;
        
        // アドバイザ情報を取得
        const advisor = orgData.advisors.length > 0 ? orgData.advisors[0] : null;
        
        // 1. チーム長役職（左上、左揃え）
        const managerRoleElement = this.createManagerRoleElement(manager);
        content.appendChild(managerRoleElement);
        
        // 2. チーム長名前（中央揃え）
        const managerNameElement = this.createManagerNameElement(manager);
        content.appendChild(managerNameElement);
        
        // 3. アドバイザ役職（左揃え、85%サイズ、灰色）
        const advisorRoleElement = this.createAdvisorRoleElement(advisor);
        content.appendChild(advisorRoleElement);
        
        // 4. アドバイザ名前（中央揃え、85%サイズ、灰色）
        const advisorNameElement = this.createAdvisorNameElement(advisor);
        content.appendChild(advisorNameElement);
        
        return content;
    }

    /**
     * チーム長役職要素を作成
     * @param {Object} manager - 管理者データ
     * @returns {HTMLElement} 役職要素
     */
    createManagerRoleElement(manager) {
        const roleDiv = document.createElement('div');
        roleDiv.className = 'org-manager-role';
        
        if (manager && manager.role) {
            roleDiv.textContent = manager.role;
        } else {
            roleDiv.innerHTML = '&nbsp;';
        }
        
        return roleDiv;
    }

    /**
     * チーム長名前要素を作成
     * @param {Object} manager - 管理者データ
     * @returns {HTMLElement} 名前要素
     */
    createManagerNameElement(manager) {
        const nameDiv = document.createElement('div');
        nameDiv.className = 'org-manager';
        
        if (manager && manager.name) {
            nameDiv.textContent = manager.name;
        } else {
            nameDiv.textContent = 'N/A';
        }
        
        return nameDiv;
    }

    /**
     * アドバイザ役職要素を作成
     * @param {Object} advisor - アドバイザデータ
     * @returns {HTMLElement} 役職要素
     */
    createAdvisorRoleElement(advisor) {
        const roleDiv = document.createElement('div');
        roleDiv.className = 'org-advisor-role';
        
        if (advisor && advisor.role) {
            roleDiv.textContent = advisor.role;
        } else {
            // アドバイザがいない場合は見えない要素として扱う
            roleDiv.className = 'org-empty';
            roleDiv.innerHTML = '&nbsp;';
        }
        
        return roleDiv;
    }

    /**
     * アドバイザ名前要素を作成
     * @param {Object} advisor - アドバイザデータ
     * @returns {HTMLElement} 名前要素
     */
    createAdvisorNameElement(advisor) {
        const nameDiv = document.createElement('div');
        nameDiv.className = 'org-advisor';
        
        if (advisor && advisor.name) {
            nameDiv.textContent = advisor.name;
        } else {
            // アドバイザがいない場合は見えない要素として扱う
            nameDiv.className = 'org-empty';
            nameDiv.innerHTML = '&nbsp;';
        }
        
        return nameDiv;
    }

    /**
     * 組織名をフォーマット（Call Name用）
     * @param {string} callName - Call Name
     * @returns {string} フォーマット済み組織名
     */
    formatOrganizationName(callName) {
        // Call Nameは基本的に短縮形なので、長い場合のみ2行に分割
        if (callName.length > 12) {
            const words = callName.split(/[\s・_-]/);
            if (words.length > 1) {
                const mid = Math.ceil(words.length / 2);
                return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ');
            } else {
                // 単語分割できない場合は文字数で分割
                const mid = Math.ceil(callName.length / 2);
                return callName.substring(0, mid) + '\n' + callName.substring(mid);
            }
        }
        return callName;
    }

    /**
     * ボックスイベントリスナーを追加
     * @param {HTMLElement} box - ボックス要素
     * @param {Object} node - ノード情報
     */
    addBoxEventListeners(box, node) {
        // マウスオーバーで詳細情報を表示（ツールチップ）
        box.addEventListener('mouseenter', () => {
            this.showTooltip(box, node);
            this.highlightRelatedBoxes(node.org);
        });
        
        box.addEventListener('mouseleave', () => {
            this.hideTooltip();
            this.clearHighlights();
        });
        
        // クリックでフォーカス（将来の拡張）
        box.addEventListener('click', () => {
            this.focusOnOrganization(node.org);
        });
    }

    /**
     * ツールチップを表示（修正版 - カスタム色情報も表示）
     * @param {HTMLElement} box - ボックス要素
     * @param {Object} node - ノード情報
     */
    showTooltip(box, node) {
        // 既存のツールチップがあれば削除
        this.hideTooltip();
        
        const orgData = this.processedData.organizations.get(node.org);
        const longName = orgData.longName || node.org;
        
        let tooltipContent = '';
        
        // Call Nameと正式名称が異なる場合
        if (longName !== node.org) {
            tooltipContent += `<strong>正式名称:</strong><br>${longName}<br>`;
        }
        
        // カスタム色が使用されている場合（修正版 - アイコン言及を削除）
        if (orgData.colors && this.hasCustomColors(orgData.colors)) {
            tooltipContent += `<strong>カスタム色設定</strong><br>`;
            if (orgData.colors.borderColor !== CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.borderColor) {
                tooltipContent += `枠線: ${orgData.colors.borderColor}<br>`;
            }
            if (orgData.colors.backgroundColor !== CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.backgroundColor) {
                tooltipContent += `背景: ${orgData.colors.backgroundColor}<br>`;
            }
        }
        
        // ツールチップが必要な情報がある場合のみ表示
        if (tooltipContent) {
            const tooltip = document.createElement('div');
            tooltip.id = 'orgTooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(74, 85, 104, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                max-width: 200px;
                white-space: normal;
            `;
            
            tooltip.innerHTML = tooltipContent.trim();
            
            // ボックスの右上に配置
            const rect = box.getBoundingClientRect();
            const containerRect = this.container.getBoundingClientRect();
            
            tooltip.style.left = (rect.right - containerRect.left + 5) + 'px';
            tooltip.style.top = (rect.top - containerRect.top) + 'px';
            
            this.container.appendChild(tooltip);
        }
    }

    /**
     * ツールチップを非表示
     */
    hideTooltip() {
        const tooltip = document.getElementById('orgTooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    /**
     * 関連するボックスをハイライト（将来の拡張用）
     * @param {string} orgName - 組織名
     */
    highlightRelatedBoxes(orgName) {
        // 将来の機能: 親子関係をハイライト
        ConfigUtils.debugLog(`ハイライト対象: ${orgName}`, 'interaction');
    }

    /**
     * ハイライトをクリア（将来の拡張用）
     */
    clearHighlights() {
        // 将来の機能: ハイライトを削除
    }

    /**
     * 組織にフォーカス（将来の拡張用）
     * @param {string} orgName - 組織名
     */
    focusOnOrganization(orgName) {
        // 将来の機能: 選択した組織を中心に表示
        ConfigUtils.debugLog(`フォーカス対象: ${orgName}`, 'interaction');
    }

    /**
     * 接続線を作成（修正版）
     * @param {Object} connection - 接続情報 { from, to }
     */
    createConnectionLine(connection) {
        const fromX = connection.from.x + CONFIG.DEFAULTS.BOX_SIZE.width / 2;
        const fromY = connection.from.y + CONFIG.DEFAULTS.BOX_SIZE.height;
        const toX = connection.to.x + CONFIG.DEFAULTS.BOX_SIZE.width / 2;
        const toY = connection.to.y;
        
        const verticalOffset = CONFIG.LAYOUT.CONNECTION_LINE_OFFSET;
        
        // 親と子が同一X座標の場合は直線
        if (Math.abs(fromX - toX) < 5) {
            this.createVerticalLine(fromX, fromY, toY - fromY);
        } else {
            // T字型接続線
            // 1. 親ボックスから下向きの線
            this.createVerticalLine(fromX, fromY, verticalOffset);
            
            // 2. 水平線
            this.createHorizontalLine(
                Math.min(fromX, toX), 
                Math.abs(toX - fromX), 
                fromY + verticalOffset
            );
            
            // 3. 子ボックスへの上向きの線
            this.createVerticalLine(toX, fromY + verticalOffset, toY - (fromY + verticalOffset));
        }
    }

    /**
     * 垂直線を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標（開始点）
     * @param {number} height - 高さ
     */
    createVerticalLine(x, y, height) {
        const line = document.createElement('div');
        line.className = 'connection-line vertical';
        line.style.left = (x - 1) + 'px';
        line.style.top = y + 'px';
        line.style.height = height + 'px';
        this.container.appendChild(line);
    }

    /**
     * 水平線を作成（修正版）
     * @param {number} x - 開始X座標
     * @param {number} width - 幅
     * @param {number} y - Y座標
     */
    createHorizontalLine(x, width, y) {
        if (width <= 0) return; // 幅が0以下の場合は描画しない
        
        const line = document.createElement('div');
        line.className = 'connection-line horizontal';
        line.style.left = x + 'px';
        line.style.top = (y - 1) + 'px';
        line.style.width = width + 'px';
        this.container.appendChild(line);
    }

    /**
     * コンテナサイズを調整
     * @param {Array<Object>} nodes - ノードの配列
     */
    adjustContainerSize(nodes) {
        if (nodes.length === 0) return;
        
        let maxX = 0, maxY = 0;
        nodes.forEach(node => {
            maxX = Math.max(maxX, node.x + CONFIG.DEFAULTS.BOX_SIZE.width);
            maxY = Math.max(maxY, node.y + CONFIG.DEFAULTS.BOX_SIZE.height);
        });
        
        const totalWidth = maxX + CONFIG.LAYOUT.MARGIN;
        const totalHeight = maxY + CONFIG.LAYOUT.MARGIN;
        
        this.container.style.width = totalWidth + 'px';
        this.container.style.height = totalHeight + 'px';
        
        ConfigUtils.debugLog(`コンテナサイズ: ${totalWidth} x ${totalHeight}`, 'render');
    }

    /**
     * スタイルを更新（フォントサイズ、ボックスサイズ）
     * @param {string} fontSize - フォントサイズ（small/medium/large）
     * @param {string} boxSize - ボックスサイズ（small/medium/large）
     */
    updateStyles(fontSize, boxSize) {
        try {
            ConfigUtils.debugLog(`スタイル更新開始: フォント=${fontSize}, ボックス=${boxSize}`, 'render');
            
            // CONFIG の存在確認
            if (typeof CONFIG === 'undefined') {
                throw new Error('CONFIG が定義されていません');
            }
            
            const fonts = CONFIG.DEFAULTS.FONT_SIZES[fontSize];
            const sizes = CONFIG.DEFAULTS.BOX_SIZES[boxSize];
            
            if (!fonts) {
                throw new Error(`フォントサイズ設定が見つかりません: ${fontSize}`);
            }
            
            if (!sizes) {
                throw new Error(`ボックスサイズ設定が見つかりません: ${boxSize}`);
            }
            
            // ConfigUtils の存在確認
            if (typeof ConfigUtils === 'undefined' || typeof ConfigUtils.updateCSSVariables !== 'function') {
                throw new Error('ConfigUtils.updateCSSVariables が定義されていません');
            }
            
            ConfigUtils.updateCSSVariables({
                'font-size-org': fonts.org,
                'font-size-name': fonts.name,
                'font-size-role': fonts.role,
                'org-box-width': sizes.width,
                'org-box-height': sizes.height,
                'org-spacing-x': sizes.spacingX,
                'org-spacing-y': sizes.spacingY
            });
            
            ConfigUtils.debugLog(`スタイル更新完了: フォント=${fontSize}, ボックス=${boxSize}`, 'render');
            
        } catch (error) {
            ConfigUtils.debugLog(`スタイル更新エラー: ${error.message}`, 'error');
            console.error('スタイル更新エラー:', error);
            throw error;
        }
    }

    /**
     * 組織図の境界を取得
     * @returns {Object} 境界情報 { width, height }
     */
    getBounds() {
        const rect = this.container.getBoundingClientRect();
        return {
            width: rect.width || parseInt(this.container.style.width) || 800,
            height: rect.height || parseInt(this.container.style.height) || 600
        };
    }

    /**
     * 組織図をSVG形式で取得（色対応版）
     * @returns {string} SVG文字列
     */
    toSVG() {
        const bounds = this.getBounds();
        const width = bounds.width;
        const height = bounds.height;
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
        svg += '<defs><style><![CDATA[';
        svg += this.getSVGStyles();
        svg += ']]></style></defs>';
        
        // 組織ボックスをSVGに変換
        const boxes = this.container.querySelectorAll('.org-box');
        boxes.forEach(box => {
            svg += this.convertBoxToSVG(box);
        });
        
        // 接続線をSVGに変換
        const lines = this.container.querySelectorAll('.connection-line');
        lines.forEach(line => {
            svg += this.convertLineToSVG(line);
        });
        
        svg += '</svg>';
        return svg;
    }

    /**
     * SVG用のスタイルを取得
     * @returns {string} CSS文字列
     */
    getSVGStyles() {
        return `
            .org-box { font-family: 'Segoe UI', sans-serif; }
            .org-header { fill: #4a5568; font-weight: bold; font-size: 12px; }
            .org-manager { font-weight: bold; font-size: 10px; }
            .org-role { font-size: 9px; fill: #666; }
            .org-advisor { font-size: 9px; fill: #888; font-style: italic; }
            .connection-line { stroke: #333; stroke-width: 2; }
        `;
    }

    /**
     * ボックスをSVGに変換（色対応版）
     * @param {HTMLElement} box - ボックス要素
     * @returns {string} SVG要素文字列
     */
    convertBoxToSVG(box) {
        const x = parseInt(box.style.left);
        const y = parseInt(box.style.top);
        const width = 85;
        const height = CONFIG.DEFAULTS.BOX_SIZE.height;
        
        // カスタム色を取得
        const borderColor = box.style.borderColor || '#333';
        const backgroundColor = box.style.backgroundColor || '#f9f9f9';
        
        let svg = '';
        
        // ボックス背景
        svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2" rx="4"/>`;
        
        // ヘッダー背景色を取得
        const header = box.querySelector('.org-header');
        const headerBgColor = header ? (header.style.backgroundColor || '#4a5568') : '#4a5568';
        const headerTextColor = header ? (header.style.color || 'white') : 'white';
        
        svg += `<rect x="${x}" y="${y}" width="${width}" height="28" fill="${headerBgColor}" rx="4"/>`;
        svg += `<rect x="${x}" y="${y+24}" width="${width}" height="4" fill="${headerBgColor}"/>`;
        
        // ヘッダーテキスト（Call Name）
        if (header) {
            const headerText = header.textContent;
            svg += `<text x="${x + width/2}" y="${y + 17}" text-anchor="middle" font-size="10px" fill="${headerTextColor}">${this.escapeXml(headerText)}</text>`;
        }
        
        // チーム長名前
        const manager = box.querySelector('.org-manager');
        if (manager && manager.textContent.trim() !== 'N/A' && manager.textContent.trim() !== '') {
            svg += `<text x="${x + width/2}" y="${y + 55}" text-anchor="middle" font-weight="bold" font-size="9px" fill="#2d3748">${this.escapeXml(manager.textContent)}</text>`;
        }
        
        return svg;
    }

    /**
     * 線をSVGに変換
     * @param {HTMLElement} line - 線要素
     * @returns {string} SVG要素文字列
     */
    convertLineToSVG(line) {
        const x = parseInt(line.style.left);
        const y = parseInt(line.style.top);
        const width = parseInt(line.style.width) || 2;
        const height = parseInt(line.style.height) || 2;
        
        if (line.classList.contains('horizontal')) {
            return `<line x1="${x}" y1="${y + 1}" x2="${x + width}" y2="${y + 1}" class="connection-line"/>`;
        } else {
            return `<line x1="${x + 1}" y1="${y}" x2="${x + 1}" y2="${y + height}" class="connection-line"/>`;
        }
    }

    /**
     * XMLエスケープ
     * @param {string} text - エスケープ対象テキスト
     * @returns {string} エスケープ済みテキスト
     */
    escapeXml(text) {
        return text.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#39;');
    }

    /**
     * 印刷用のHTMLを取得
     * @returns {string} 印刷用HTML文字列
     */
    getPrintHTML() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${CONFIG.EXPORT.PRINT_TITLE}</title>
                <style>
                    @page { 
                        size: A4; 
                        margin: 1cm; 
                    }
                    body { 
                        margin: 0; 
                        font-family: 'Segoe UI', sans-serif; 
                    }
                    ${this.getPrintStyles()}
                </style>
            </head>
            <body>
                <div id="orgChart">${this.container.innerHTML}</div>
            </body>
            </html>
        `;
    }

    /**
     * 印刷用のスタイルを取得
     * @returns {string} 印刷用CSS
     */
    getPrintStyles() {
        return `
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
            }
            .org-header {
                background: #4a5568;
                color: white;
                padding: 3px 4px;
                font-weight: bold;
                text-align: center;
                border-radius: 2px 2px 0 0;
                min-height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1.1;
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
                text-align: left;
                color: #2d3748;
                min-height: 14px;
            }
            .org-manager {
                font-size: 10px;
                font-weight: bold;
                text-align: center;
                color: #2d3748;
                min-height: 16px;
            }
            .org-advisor-role {
                font-size: 8px;
                text-align: left;
                color: #718096;
                min-height: 12px;
            }
            .org-advisor {
                font-size: 9px;
                text-align: center;
                color: #718096;
                min-height: 14px;
            }
            .connection-line {
                position: absolute;
                background: #333;
            }
            .connection-line.horizontal {
                height: 2px;
            }
            .connection-line.vertical {
                width: 2px;
            }
        `;
    }
}

// グローバルに公開
window.ChartRenderer = ChartRenderer;