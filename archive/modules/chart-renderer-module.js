/**
 * Chart Renderer Module
 * 組織図の描画とレンダリングを担当するモジュール
 * chart-style-master.jsと統合してスタイル設定を反映
 */

const ChartRendererModule = (() => {
    'use strict';

    // スタイルマスターからの設定適用
    let styleManager = null;

    /**
     * 組織図レンダラークラス
     * 階層構造を持つ組織データを視覚的な組織図として描画
     */
    class ChartRenderer {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                showConnections: true,
                enableInteraction: true,
                animationDuration: 300,
                ...options
            };
            
            this.svgElement = null;
            this.nodes = new Map();
            this.connections = [];
            this.currentZoom = 1;
            this.currentTransform = { x: 0, y: 0 };
            
            // スタイル設定の初期化
            this.initializeStyles();
        }

        /**
         * スタイル設定の初期化
         */
        initializeStyles() {
            if (window.ChartStyleMasterModule && window.ChartStyleMasterModule.ChartStyleManager) {
                styleManager = new window.ChartStyleMasterModule.ChartStyleManager();
                
                // デフォルトスタイルパックを適用
                styleManager.applyPresetPack('standard');
            }
        }

        /**
         * 組織図をレンダリング
         * @param {Array} organizations - 組織データ配列
         * @param {Object} layout - レイアウト情報
         */
        render(organizations, layout) {
            console.log(`[RENDER] Starting render: ${organizations?.length || 0} organizations`);
            
            if (!organizations || organizations.length === 0) {
                console.warn('[RENDER] No organizations provided');
                this.showEmptyState();
                return;
            }

            if (!layout) {
                console.error('[RENDER] No layout provided');
                this.showErrorState('Layout data is missing');
                return;
            }

            try {
                // コンテナをクリア
                console.log('[RENDER] Clearing container');
                this.clearContainer();
                
                // SVG要素を作成
                console.log('[RENDER] Creating SVG element');
                this.createSVGElement(layout);
                
                if (!this.svgElement) {
                    throw new Error('Failed to create SVG element');
                }
                
                // 組織ボックスを描画
                console.log(`[RENDER] Rendering ${organizations.length} organizations`);
                this.renderOrganizations(organizations, layout);
                
                // 接続線を描画
                if (this.options.showConnections && layout.connections) {
                    console.log(`[RENDER] Rendering ${layout.connections.length} connections`);
                    this.renderConnections(layout.connections);
                }
                
                // SVGの存在を確認
                const svgCheck = this.container.querySelector('svg');
                if (!svgCheck) {
                    throw new Error('SVG element not found after rendering');
                }
                
                console.log('[RENDER] SVG element confirmed in container');
                
                // チーム名対照表を描画
                try {
                    this.renderTeamNameTable(organizations);
                } catch (tableError) {
                    console.warn('[RENDER] Team name table rendering failed:', tableError);
                }
                
                // インタラクション機能を追加
                if (this.options.enableInteraction) {
                    try {
                        this.enableInteractions();
                    } catch (interactionError) {
                        console.warn('[RENDER] Interaction setup failed:', interactionError);
                    }
                }
                
                // フィット機能
                try {
                    this.fitToContainer();
                } catch (fitError) {
                    console.warn('[RENDER] Fit to container failed:', fitError);
                }
                
                console.log('[RENDER] Rendering completed successfully');
                
            } catch (error) {
                console.error('[RENDER] Chart rendering failed:', error);
                console.error('[RENDER] Error stack:', error.stack);
                this.showErrorState(error.message);
            }
        }

        /**
         * コンテナをクリア
         */
        clearContainer() {
            if (this.container) {
                this.container.innerHTML = '';
                this.nodes.clear();
                this.connections = [];
            }
        }

        /**
         * SVG要素を作成（適切なビューポートで縦方向全体表示）
         * @param {Object} layout - レイアウト情報
         */
        createSVGElement(layout) {
            try {
                console.log('[SVG] Creating SVG element...');
                
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                if (!svg) {
                    throw new Error('Failed to create SVG element');
                }
                
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                
                // コンテナサイズを取得
                const containerRect = this.container.getBoundingClientRect();
                const containerWidth = Math.max(containerRect.width, 800); // 最小幅を確保
                const containerHeight = Math.max(containerRect.height, 600); // 最小高さを確保
                
                console.log(`[SVG] Container size: ${containerWidth}x${containerHeight}`);
                
                // レイアウトの実際のサイズ
                const layoutWidth = layout.bounds?.width || layout.width || 1200;
                const layoutHeight = layout.bounds?.height || layout.height || 800;
                
                console.log(`[SVG] Layout size: ${layoutWidth}x${layoutHeight}`);
                
                // 縦方向を優先してスケールを計算
                const scaleY = containerHeight / layoutHeight;
                const scaleX = containerWidth / layoutWidth;
                
                // 縦方向を全て表示し、横方向は必要に応じてスクロール
                const scale = Math.min(scaleY * 0.95, 1.0); // 縦方向に95%フィット、最大1.0倍
                
                // ビューポートを設定（縦方向全体が表示されるように）
                const viewBoxWidth = Math.max(containerWidth / scale, layoutWidth);
                const viewBoxHeight = Math.max(containerHeight / scale, layoutHeight);
                
                svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
                svg.classList.add('org-chart-svg');
                
                // コンテナに水平スクロールを有効化
                this.container.style.overflowX = 'auto';
                this.container.style.overflowY = 'auto';
                
                // デフズ要素（マーカーなど）を追加
                const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                this.createArrowMarkers(defs);
                svg.appendChild(defs);
                
                // メイングループ
                const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                mainGroup.classList.add('main-group');
                svg.appendChild(mainGroup);
                
                // DOMに追加
                this.container.appendChild(svg);
                this.svgElement = svg;
                
                // デバッグ情報
                console.log(`[SVG] Created successfully: ViewBox=${viewBoxWidth.toFixed(0)}x${viewBoxHeight.toFixed(0)}, Scale=${scale.toFixed(3)}`);
                
                // SVGが正しくDOMに追加されたか確認
                const svgInDom = this.container.querySelector('svg');
                if (!svgInDom) {
                    throw new Error('SVG element not found in DOM after creation');
                }
                
                console.log('[SVG] SVG element confirmed in DOM');
                
            } catch (error) {
                console.error('[SVG] SVG creation failed:', error);
                throw error;
            }
        }

        /**
         * 矢印マーカーを作成
         * @param {SVGElement} defs - defs要素
         */
        createArrowMarkers(defs) {
            const lineStyle = { color: '#666', width: 2 };
            
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'arrowhead');
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '7');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '3.5');
            marker.setAttribute('orient', 'auto');
            
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
            polygon.setAttribute('fill', lineStyle.color);
            
            marker.appendChild(polygon);
            defs.appendChild(marker);
        }

        /**
         * 組織ボックスを描画
         * @param {Array} organizations - 組織データ配列
         * @param {Object} layout - レイアウト情報
         */
        renderOrganizations(organizations, layout) {
            const mainGroup = this.svgElement.querySelector('.main-group');
            
            // layout.nodesからポジション情報を取得
            if (layout.nodes && layout.nodes.length > 0) {
                layout.nodes.forEach(node => {
                    const orgData = node.data;
                    if (orgData) {
                        const position = { x: node.x, y: node.y, width: node.width, height: node.height };
                        const orgElement = this.createOrganizationBox(orgData, position);
                        mainGroup.appendChild(orgElement);
                        this.nodes.set(node.id, { element: orgElement, data: orgData, position });
                    }
                });
            } else {
                // フォールバック: 古い方式
                organizations.forEach(org => {
                    const position = layout.positions && layout.positions[org.id];
                    if (position) {
                        const orgElement = this.createOrganizationBox(org, position);
                        mainGroup.appendChild(orgElement);
                        this.nodes.set(org.id, { element: orgElement, data: org, position });
                    }
                });
            }
        }

        /**
         * 組織ボックスを作成（動的サイズ対応）
         * @param {Object} org - 組織データ
         * @param {Object} position - 位置情報
         * @returns {SVGElement} 組織ボックスのSVG要素
         */
        createOrganizationBox(org, position) {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.classList.add('org-box');
            group.setAttribute('data-org-id', org.id);
            group.setAttribute('transform', `translate(${position.x}, ${position.y})`);
            
            // 動的サイズ計算
            const dynamicSize = this.calculateDynamicBoxSize(org, position);
            
            // スタイル設定を取得（動的サイズを使用）
            const boxStyle = {
                width: dynamicSize.width,
                height: dynamicSize.height,
                borderRadius: 8,
                borderWidth: 2,
                showHeader: true,
                headerHeight: dynamicSize.headerHeight,
                padding: 6,
                innerPadding: 5 // テキスト用の内部パディング
            };
            
            // カスタム色を取得（データから優先的に取得）
            const customBorderColor = org.borderColor || (org.colors && org.colors.borderColor) || '#1976d2';
            const customHeaderBg = org.headerBgColor || (org.colors && org.colors.headerBgColor) || '#e3f2fd';
            const customTextColor = org.headerTextColor || (org.colors && org.colors.headerTextColor) || '#000000';
            
            const fontStyle = {
                teamName: { family: 'Arial, sans-serif', size: '11px', weight: 'bold', lineHeight: 1.2 },
                picName: { family: 'Arial, sans-serif', size: '10px', weight: 'normal', lineHeight: 1.3 },
                role: { family: 'Arial, sans-serif', size: '9px', weight: 'normal', lineHeight: 1.2 }
            };
            
            const colorTheme = {
                boxBackground: '#ffffff',
                boxBorder: customBorderColor,
                headerBackground: customHeaderBg, // 取得したカスタム色を使用
                textColor: '#333333',
                teamNameColor: customTextColor, // カスタムテキスト色を使用
                picNameColor: '#666666',
                roleColor: '#999999'
            };
            
            console.log(`Team: ${org.teamName}, Header BG: ${customHeaderBg}, Border: ${customBorderColor}, Text: ${customTextColor}`);
            
            // メインボックス（統一された枠線）
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', boxStyle.width);
            rect.setAttribute('height', boxStyle.height);
            rect.setAttribute('x', 0);
            rect.setAttribute('y', 0);
            rect.setAttribute('rx', boxStyle.borderRadius);
            rect.setAttribute('ry', boxStyle.borderRadius);
            rect.setAttribute('fill', '#ffffff');
            rect.setAttribute('stroke', customBorderColor);
            rect.setAttribute('stroke-width', boxStyle.borderWidth);
            rect.classList.add('org-box-bg');
            group.appendChild(rect);
            
            // チーム名ヘッダー部分（背景色のみ、境界線なし）
            const headerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            headerRect.setAttribute('width', boxStyle.width - (boxStyle.borderWidth * 2));
            headerRect.setAttribute('height', boxStyle.headerHeight);
            headerRect.setAttribute('x', boxStyle.borderWidth);
            headerRect.setAttribute('y', boxStyle.borderWidth);
            headerRect.setAttribute('rx', boxStyle.borderRadius - boxStyle.borderWidth);
            headerRect.setAttribute('ry', boxStyle.borderRadius - boxStyle.borderWidth);
            headerRect.setAttribute('fill', customHeaderBg);
            headerRect.setAttribute('stroke', 'none'); // 境界線なし
            headerRect.classList.add('org-box-header');
            group.appendChild(headerRect);
            
            // ヘッダー下部を直角にするための補正矩形
            const headerBottomRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            headerBottomRect.setAttribute('width', boxStyle.width - (boxStyle.borderWidth * 2));
            headerBottomRect.setAttribute('height', boxStyle.borderRadius);
            headerBottomRect.setAttribute('x', boxStyle.borderWidth);
            headerBottomRect.setAttribute('y', boxStyle.headerHeight - boxStyle.borderRadius + boxStyle.borderWidth);
            headerBottomRect.setAttribute('fill', customHeaderBg);
            headerBottomRect.setAttribute('stroke', 'none');
            group.appendChild(headerBottomRect);
            
            // テキスト要素を追加（カスタム色を渡す）
            this.addTextElements(group, org, boxStyle, fontStyle, colorTheme, customTextColor);
            
            // ホバー効果
            this.addHoverEffects(group, org);
            
            return group;
        }
        
        /**
         * 動的ボックスサイズを計算
         * @param {Object} org - 組織データ
         * @param {Object} position - 位置情報
         * @returns {Object} 計算されたサイズ
         */
        calculateDynamicBoxSize(org, position) {
            const baseWidth = position.width || 138; // 15%増加後のmedium size
            const baseHeight = position.height || 160;
            
            // フォントスタイル定義
            const fontStyles = {
                teamName: { family: 'Arial, sans-serif', size: '10px', weight: 'bold' },
                role: { family: 'Arial, sans-serif', size: '9px', weight: 'normal' },
                picName: { family: 'Arial, sans-serif', size: '10px', weight: 'normal' }
            };
            
            // テキスト幅計算用の最大幅
            const maxTextWidth = baseWidth - 12; // パディング考慮
            const headerMaxWidth = baseWidth - 8; // ヘッダーパディング考慮
            
            // 各テキストの必要行数を計算
            const teamNameLines = this.wrapText(org.teamName || '', headerMaxWidth, fontStyles.teamName);
            
            // マネージャーと役職情報の行数計算
            let totalBodyLines = 0;
            
            if (org.managers && org.managers.length > 0) {
                org.managers.forEach(member => {
                    const roleLines = this.wrapText(member.role || '', maxTextWidth, fontStyles.role);
                    const nameLines = this.wrapText(member.name || '', maxTextWidth, fontStyles.picName);
                    totalBodyLines += roleLines.length + nameLines.length;
                });
            } else if (org.role && org.picName) {
                // フォールバック：旧形式
                const roleLines = this.wrapText(org.role || '', maxTextWidth, fontStyles.role);
                const nameLines = this.wrapText(org.picName || '', maxTextWidth, fontStyles.picName);
                totalBodyLines += roleLines.length + nameLines.length;
            }
            
            // 動的ヘッダー高さ計算
            const lineHeight = 12;
            const headerHeight = Math.max(30, (teamNameLines.length * lineHeight) + 8);
            
            // 動的高さ計算
            const bodyLineHeight = 13;
            const minBodyHeight = 50;
            const calculatedBodyHeight = Math.max(minBodyHeight, (totalBodyLines * bodyLineHeight) + 20);
            const dynamicHeight = headerHeight + calculatedBodyHeight;
            
            return {
                width: baseWidth,
                height: Math.max(baseHeight, dynamicHeight),
                headerHeight: headerHeight
            };
        }

        /**
         * テキスト要素を追加（チーム名と担当者情報を明確に区分、完全改行対応）
         * @param {SVGElement} group - グループ要素
         * @param {Object} org - 組織データ
         * @param {Object} boxStyle - ボックススタイル
         * @param {Object} fontStyle - フォントスタイル
         * @param {Object} colorTheme - カラーテーマ
         */
        addTextElements(group, org, boxStyle, fontStyle, colorTheme, customTextColor = null) {
            // ヘッダー部分にチーム名を配置（完全改行対応）
            if (org.teamName) {
                const headerPadding = 4;
                const maxHeaderWidth = boxStyle.width - (headerPadding * 2);
                const teamNameLines = this.wrapText(org.teamName, maxHeaderWidth, {
                    ...fontStyle.teamName,
                    size: '10px' // ヘッダーは少し小さく
                });
                
                const lineHeight = 12;
                const totalHeight = teamNameLines.length * lineHeight;
                const startY = (boxStyle.headerHeight - totalHeight) / 2 + lineHeight / 2;
                
                teamNameLines.forEach((line, index) => {
                    const teamText = this.createTextElement(
                        line,
                        boxStyle.width / 2,
                        startY + (index * lineHeight),
                        { ...fontStyle.teamName, size: '10px' },
                        customTextColor || org.headerTextColor || '#000000',
                        'team-name'
                    );
                    teamText.setAttribute('dominant-baseline', 'middle');
                    teamText.setAttribute('text-anchor', 'middle');
                    group.appendChild(teamText);
                });
            }
            
            // 担当者情報部分（ヘッダー下から開始）
            let yOffset = boxStyle.headerHeight + boxStyle.innerPadding;
            
            // チームボス情報を最初に表示
            if (org.managers && org.managers.length > 0) {
                const teamBoss = org.managers.find(member => member.isTeamBoss);
                if (teamBoss) {
                    yOffset = this.addPersonInfo(group, teamBoss, boxStyle, fontStyle, colorTheme, yOffset, true);
                    yOffset += 8; // チームボスと他メンバーの間にスペース
                }
                
                // その他のメンバー
                const otherMembers = org.managers.filter(member => !member.isTeamBoss);
                otherMembers.forEach(member => {
                    yOffset = this.addPersonInfo(group, member, boxStyle, fontStyle, colorTheme, yOffset, false);
                    yOffset += 6; // メンバー間のスペース
                });
            }
            
            // アドバイザーがいる場合
            if (org.advisors && org.advisors.length > 0) {
                org.advisors.forEach(advisor => {
                    yOffset = this.addPersonInfo(group, advisor, boxStyle, fontStyle, colorTheme, yOffset, false);
                    yOffset += 6;
                });
            }
            
            // フォールバック：旧形式のデータ対応
            if (org.role && org.picName && (!org.managers || org.managers.length === 0)) {
                const person = {
                    role: org.role,
                    name: org.picName,
                    isTeamBoss: true
                };
                this.addPersonInfo(group, person, boxStyle, fontStyle, colorTheme, yOffset, true);
            }
        }

        /**
         * 個人情報を追加（役割と名前を分けて表示、改行対応）
         * @param {SVGElement} group - グループ要素
         * @param {Object} person - 個人データ
         * @param {Object} boxStyle - ボックススタイル
         * @param {Object} fontStyle - フォントスタイル
         * @param {Object} colorTheme - カラーテーマ
         * @param {number} startY - 開始Y座標
         * @param {boolean} isTeamBoss - チームボスかどうか
         * @returns {number} 次のY座標
         */
        addPersonInfo(group, person, boxStyle, fontStyle, colorTheme, startY, isTeamBoss) {
            let yOffset = startY;
            const padding = boxStyle.innerPadding || 5;
            const maxWidth = boxStyle.width - (padding * 2) - 4; // マージンを少し追加
            
            // 役割を表示（長い場合は最大3行に分割）
            if (person.role) {
                const roleLines = this.wrapText(person.role, maxWidth, {
                    ...fontStyle.role,
                    weight: isTeamBoss ? 'bold' : 'normal',
                    size: isTeamBoss ? '8px' : '7px' // より小さくしてより多くの文字を表示
                });
                
                roleLines.forEach((line, index) => {
                    const roleText = this.createTextElement(
                        line,
                        padding + 2, // 左詰め
                        yOffset,
                        {
                            ...fontStyle.role,
                            weight: isTeamBoss ? 'bold' : 'normal',
                            size: isTeamBoss ? '8px' : '7px'
                        },
                        isTeamBoss ? '#d32f2f' : colorTheme.roleColor,
                        'role'
                    );
                    roleText.setAttribute('text-anchor', 'start'); // 左詰め
                    roleText.setAttribute('dominant-baseline', 'hanging'); // 上端揃え
                    group.appendChild(roleText);
                    yOffset += 10; // 行間隔を小さく
                });
                yOffset += 6; // 役職と名前の間隔
            }
            
            // 名前を中央揃えで表示（改行対応）
            if (person.name) {
                const nameLines = this.wrapText(person.name, maxWidth, {
                    ...fontStyle.picName,
                    weight: isTeamBoss ? 'bold' : 'normal',
                    size: isTeamBoss ? '9px' : '8px'
                });
                
                nameLines.forEach((line, index) => {
                    const nameText = this.createTextElement(
                        line,
                        boxStyle.width / 2, // 中央
                        yOffset,
                        {
                            ...fontStyle.picName,
                            weight: isTeamBoss ? 'bold' : 'normal',
                            size: isTeamBoss ? '9px' : '8px'
                        },
                        isTeamBoss ? '#1976d2' : colorTheme.picNameColor,
                        'pic-name'
                    );
                    nameText.setAttribute('text-anchor', 'middle'); // 中央揃え
                    nameText.setAttribute('dominant-baseline', 'hanging'); // 上端揃え
                    group.appendChild(nameText);
                    yOffset += 10; // 行間隔
                });
            }
            
            return yOffset;
        }
        
        /**
         * テキスト要素を作成
         * @param {string} text - テキスト内容
         * @param {number} x - X座標
         * @param {number} y - Y座標
         * @param {Object} style - フォントスタイル
         * @param {string} color - テキスト色
         * @param {string} className - CSSクラス名
         * @returns {SVGElement} テキスト要素
         */
        createTextElement(text, x, y, style, color, className) {
            const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElement.setAttribute('x', x);
            textElement.setAttribute('y', y);
            textElement.setAttribute('text-anchor', 'middle'); // デフォルトは中央揃え
            textElement.setAttribute('dominant-baseline', 'hanging');
            textElement.setAttribute('font-family', style.family || 'Arial, sans-serif');
            textElement.setAttribute('font-size', style.size || '12px');
            textElement.setAttribute('font-weight', style.weight || 'normal');
            textElement.setAttribute('fill', color || '#333333');
            textElement.classList.add(className);
            textElement.textContent = this.truncateText(text, style.maxLength || 20);
            
            return textElement;
        }

        /**
         * テキストを切り詰め
         * @param {string} text - 元のテキスト
         * @param {number} maxLength - 最大長
         * @returns {string} 切り詰められたテキスト
         */
        truncateText(text, maxLength) {
            if (!text || text.length <= maxLength) return text;
            return text.substring(0, maxLength - 3) + '...';
        }

        /**
         * テキストを指定幅で折り返し（制限なし版）
         * @param {string} text - 元のテキスト
         * @param {number} maxWidth - 最大幅（ピクセル）
         * @param {Object} fontStyle - フォントスタイル
         * @param {number} maxLines - 最大行数（null = 制限なし）
         * @returns {Array} 行の配列
         */
        wrapText(text, maxWidth, fontStyle, maxLines = null) {
            if (!text) return [''];
            
            // Canvas要素を使ってテキスト幅を測定
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = `${fontStyle.weight || 'normal'} ${fontStyle.size || '9px'} ${fontStyle.family || 'Arial, sans-serif'}`;
            
            // テキスト全体が1行に収まる場合はそのまま返す
            if (ctx.measureText(text).width <= maxWidth) {
                return [text];
            }
            
            const lines = [];
            const words = [];
            
            // 文字を1文字ずつ分割（日本語対応）
            for (let i = 0; i < text.length; i++) {
                const char = text.charAt(i);
                if (char === ' ') {
                    words.push(' '); // スペースは分割点として保持
                } else {
                    words.push(char);
                }
            }
            
            let currentLine = '';
            
            for (let i = 0; i < words.length; i++) {
                const char = words[i];
                const testLine = currentLine + char;
                const testWidth = ctx.measureText(testLine).width;
                
                if (testWidth > maxWidth && currentLine) {
                    // 現在の行を完成させて新しい行を開始
                    lines.push(currentLine.trim());
                    currentLine = char === ' ' ? '' : char; // スペースで改行する場合は次の行に含めない
                } else {
                    currentLine = testLine;
                }
            }
            
            if (currentLine.trim()) {
                lines.push(currentLine.trim());
            }
            
            // 行数制限がある場合のみ適用
            if (maxLines && lines.length > maxLines) {
                const lastLine = lines[maxLines - 1];
                if (lastLine.length > 3) {
                    lines[maxLines - 1] = lastLine.substring(0, lastLine.length - 3) + '...';
                }
                return lines.slice(0, maxLines);
            }
            
            return lines.length > 0 ? lines : [''];
        }

        /**
         * ホバー効果を追加
         * @param {SVGElement} group - グループ要素
         * @param {Object} org - 組織データ
         */
        addHoverEffects(group, org) {
            group.addEventListener('mouseenter', () => {
                group.classList.add('hovered');
                this.showTooltip(org, group);
            });
            
            group.addEventListener('mouseleave', () => {
                group.classList.remove('hovered');
                this.hideTooltip();
            });
            
            group.addEventListener('click', () => {
                this.selectOrganization(org);
            });
        }

        /**
         * 接続線を描画
         * @param {Array} connections - 接続情報配列
         */
        renderConnections(connections) {
            const mainGroup = this.svgElement.querySelector('.main-group');
            const connectionGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            connectionGroup.classList.add('connections');
            
            // 接続線を組織ボックスの後ろに配置
            mainGroup.insertBefore(connectionGroup, mainGroup.firstChild);
            
            const lineStyle = styleManager ? styleManager.getCurrentLineStyle() : this.getDefaultLineStyle();
            
            connections.forEach(conn => {
                const line = this.createConnectionLine(conn, lineStyle);
                if (line) {
                    connectionGroup.appendChild(line);
                    this.connections.push({ element: line, data: conn });
                }
            });
        }

        /**
         * 接続線を作成
         * @param {Object} connection - 接続情報
         * @param {Object} lineStyle - 線のスタイル
         * @returns {SVGElement|null} 線要素
         */
        createConnectionLine(connection, lineStyle) {
            // 特殊な接続線タイプの処理
            if (connection.connectionType === 'horizontal-bridge') {
                return this.createHorizontalBridge(connection, lineStyle);
            }
            
            // 接続情報から位置データを取得
            let fromPos, toPos;
            
            if (connection.fromPos && connection.toPos) {
                // レイアウト計算からの詳細な位置情報を使用
                fromPos = connection.fromPos;
                toPos = connection.toPos;
            } else if (connection.connectionType && (connection.connectionType === 'parent-to-children' || connection.connectionType === 'child-connector')) {
                // 特殊タイプは位置情報が直接含まれている場合がある
                fromPos = connection.fromPos;
                toPos = connection.toPos;
            } else {
                // フォールバック：ノードから位置情報を取得
                const parentNode = this.nodes.get(connection.from);
                const childNode = this.nodes.get(connection.to);
                
                if (!parentNode || !childNode) {
                    // console.log('Connection nodes not found:', connection.from, connection.to);
                    return null;
                }
                
                fromPos = parentNode.position;
                toPos = childNode.position;
            }
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = this.calculateConnectionPath(fromPos, toPos, lineStyle, connection);
            
            path.setAttribute('d', pathData);
            path.setAttribute('stroke', lineStyle.color);
            path.setAttribute('stroke-width', lineStyle.width);
            path.setAttribute('fill', 'none');
            
            if (lineStyle.style === 'dashed') {
                path.setAttribute('stroke-dasharray', lineStyle.dashArray || '5,5');
            } else if (lineStyle.style === 'dotted') {
                path.setAttribute('stroke-dasharray', lineStyle.dotArray || '2,2');
            }
            
            if (lineStyle.showArrows) {
                path.setAttribute('marker-end', 'url(#arrowhead)');
            }
            
            path.classList.add('connection-line');
            path.setAttribute('data-connection', `${connection.from}-${connection.to}`);
            
            // console.log('Created connection line:', connection.from, '->', connection.to, 'Path:', pathData);
            return path;
        }
        
        /**
         * 水平橋渡し線を作成
         */
        createHorizontalBridge(connection, lineStyle) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = `M ${connection.leftX} ${connection.bridgeY} L ${connection.rightX} ${connection.bridgeY}`;
            
            path.setAttribute('d', pathData);
            path.setAttribute('stroke', lineStyle.color);
            path.setAttribute('stroke-width', lineStyle.width);
            path.setAttribute('fill', 'none');
            path.classList.add('connection-line');
            path.setAttribute('data-connection', `${connection.from}-bridge`);
            
            return path;
        }

        /**
         * 接続パスを計算（完全垂直・水平線のみ）
         * @param {Object} fromPos - 開始位置
         * @param {Object} toPos - 終了位置
         * @param {Object} lineStyle - 線のスタイル
         * @returns {string} SVGパスデータ
         */
        calculateConnectionPath(fromPos, toPos, lineStyle, connection = null) {
            // 特殊な接続線タイプの処理
            if (connection && connection.connectionType) {
                return this.calculateSpecialConnectionPath(fromPos, toPos, connection);
            }
            
            // 標準的なL字型接続線（完全垂直・水平）
            const fromX = fromPos.x + (fromPos.width || 120) / 2;
            const fromY = fromPos.y + (fromPos.height || 80);
            const toX = toPos.x + (toPos.width || 120) / 2;
            const toY = toPos.y;
            
            // 親と子が水平にほぼ同じ位置の場合は完全垂直線
            if (Math.abs(fromX - toX) < 10) {
                return `M ${fromX} ${fromY} L ${fromX} ${toY}`;
            }
            
            // L字型接続（垂直→水平→垂直の3セグメント）
            const midY = fromY + (toY - fromY) * 0.5;
            return `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
        }
        
        /**
         * 特殊な接続線パスを計算（完全垂直・水平線のみ）
         */
        calculateSpecialConnectionPath(fromPos, toPos, connection) {
            if (connection.connectionType === 'direct-vertical') {
                // 直接垂直接続（子が1つの場合）
                if (connection.pathType === 'pure-vertical') {
                    // 完全垂直線（親と子が水平にほぼ同じ位置）
                    const fromX = fromPos.x + (fromPos.width || 120) / 2;
                    const fromY = fromPos.y + (fromPos.height || 80);
                    const toY = toPos.y;
                    
                    return `M ${fromX} ${fromY} L ${fromX} ${toY}`;
                } else {
                    // L字型接続（垂直→水平→垂直）
                    const fromX = fromPos.x + (fromPos.width || 120) / 2;
                    const fromY = fromPos.y + (fromPos.height || 80);
                    const toX = toPos.x + (toPos.width || 120) / 2;
                    const toY = toPos.y;
                    
                    // 中間点を計算（完全に垂直・水平）
                    const midY = fromY + (toY - fromY) * 0.5;
                    
                    return `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
                }
                
            } else if (connection.connectionType === 'parent-to-children') {
                // 親から分岐点への完全垂直線
                const fromX = connection.fromX;
                const fromY = connection.fromY;
                const toX = connection.toX;
                const toY = connection.toY;
                
                return `M ${fromX} ${fromY} L ${toX} ${toY}`;
                
            } else if (connection.connectionType === 'horizontal-bridge') {
                // 完全水平橋渡し線
                const bridgeY = connection.bridgeY;
                const leftX = connection.leftX;
                const rightX = connection.rightX;
                
                return `M ${leftX} ${bridgeY} L ${rightX} ${bridgeY}`;
                
            } else if (connection.connectionType === 'child-connector') {
                // 分岐点から子への完全垂直線
                const fromX = connection.fromX;
                const fromY = connection.fromY;
                const toX = connection.toX;
                const toY = connection.toY;
                
                return `M ${fromX} ${fromY} L ${toX} ${toY}`;
            }
            
            // フォールバック: 標準L字型接続（完全垂直・水平）
            const fromX = fromPos.x + (fromPos.width || 120) / 2;
            const fromY = fromPos.y + (fromPos.height || 80);
            const toX = toPos.x + (toPos.width || 120) / 2;
            const toY = toPos.y;
            
            const midY = fromY + (toY - fromY) * 0.5;
            return `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
        }

        /**
         * インタラクション機能を有効化
         */
        enableInteractions() {
            // ズーム機能
            this.enableZoom();
            
            // パン機能
            this.enablePan();
            
            // キーボードショートカット
            this.enableKeyboardShortcuts();
        }

        /**
         * ズーム機能を有効化
         */
        enableZoom() {
            this.svgElement.addEventListener('wheel', (e) => {
                e.preventDefault();
                
                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                this.currentZoom *= delta;
                this.currentZoom = Math.max(0.1, Math.min(5, this.currentZoom));
                
                this.updateTransform();
            });
        }

        /**
         * パン機能を有効化
         */
        enablePan() {
            let isPanning = false;
            let startPoint = { x: 0, y: 0 };
            
            this.svgElement.addEventListener('mousedown', (e) => {
                if (e.target === this.svgElement || e.target.classList.contains('main-group')) {
                    isPanning = true;
                    startPoint = { x: e.clientX, y: e.clientY };
                    this.svgElement.style.cursor = 'grabbing';
                }
            });
            
            this.svgElement.addEventListener('mousemove', (e) => {
                if (isPanning) {
                    const dx = e.clientX - startPoint.x;
                    const dy = e.clientY - startPoint.y;
                    
                    this.currentTransform.x += dx;
                    this.currentTransform.y += dy;
                    
                    startPoint = { x: e.clientX, y: e.clientY };
                    this.updateTransform();
                }
            });
            
            this.svgElement.addEventListener('mouseup', () => {
                isPanning = false;
                this.svgElement.style.cursor = 'default';
            });
        }

        /**
         * キーボードショートカットを有効化
         */
        enableKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                if (e.target.closest('.org-chart-container')) {
                    switch (e.key) {
                        case '0':
                            this.resetView();
                            break;
                        case '+':
                        case '=':
                            this.zoomIn();
                            break;
                        case '-':
                            this.zoomOut();
                            break;
                        case 'f':
                        case 'F':
                            this.fitToContainer();
                            break;
                    }
                }
            });
        }

        /**
         * 変換を更新
         */
        updateTransform() {
            const mainGroup = this.svgElement.querySelector('.main-group');
            if (mainGroup) {
                mainGroup.setAttribute('transform', 
                    `translate(${this.currentTransform.x}, ${this.currentTransform.y}) scale(${this.currentZoom})`
                );
            }
        }

        /**
         * ビューをリセット
         */
        resetView() {
            this.currentZoom = 1;
            this.currentTransform = { x: 0, y: 0 };
            this.updateTransform();
        }

        /**
         * ズームイン
         */
        zoomIn() {
            this.currentZoom *= 1.2;
            this.currentZoom = Math.min(5, this.currentZoom);
            this.updateTransform();
        }

        /**
         * ズームアウト
         */
        zoomOut() {
            this.currentZoom *= 0.8;
            this.currentZoom = Math.max(0.1, this.currentZoom);
            this.updateTransform();
        }

        /**
         * コンテナにフィット（縦方向優先）
         */
        fitToContainer() {
            try {
                const mainGroup = this.svgElement.querySelector('.main-group');
                if (!mainGroup) return;
                
                const bbox = mainGroup.getBBox();
                const containerRect = this.container.getBoundingClientRect();
                
                // 縦方向を優先してスケール計算
                const scaleY = containerRect.height / bbox.height;
                const scaleX = containerRect.width / bbox.width;
                
                // 縦方向を全て表示し、横方向は必要に応じてスクロール
                const scale = Math.min(scaleY * 0.95, 1.0); // 縦方向に95%フィット
                
                this.currentZoom = scale;
                
                // 中央寄せの調整（縦方向は中央、横方向は左寄せ）
                const translateY = (containerRect.height - bbox.height * scale) / 2 - bbox.y * scale;
                const translateX = Math.max(20, -bbox.x * scale); // 左端から20pxマージン
                
                this.currentTransform = {
                    x: translateX,
                    y: translateY
                };
                
                this.updateTransform();
                
                console.log(`Fit to container: Scale=${scale.toFixed(3)}, Transform=(${translateX.toFixed(0)}, ${translateY.toFixed(0)})`);
            } catch (error) {
                console.warn('Fit to container failed:', error);
            }
        }

        /**
         * ツールチップを表示
         * @param {Object} org - 組織データ
         * @param {SVGElement} element - ホバーされた要素
         */
        showTooltip(org, element) {
            // ツールチップの実装は省略（必要に応じて後で追加）
            console.log('Tooltip for:', org.teamName);
        }

        /**
         * ツールチップを非表示
         */
        hideTooltip() {
            // ツールチップの非表示実装
        }

        /**
         * 組織を選択
         * @param {Object} org - 組織データ
         */
        selectOrganization(org) {
            // 既存の選択を解除
            this.svgElement.querySelectorAll('.org-box.selected').forEach(box => {
                box.classList.remove('selected');
            });
            
            // 新しい選択を設定
            const orgBox = this.svgElement.querySelector(`[data-org-id="${org.id}"]`);
            if (orgBox) {
                orgBox.classList.add('selected');
            }
            
            // 選択イベントを発火
            this.container.dispatchEvent(new CustomEvent('organizationSelected', {
                detail: { organization: org }
            }));
        }

        /**
         * 空の状態を表示
         */
        showEmptyState() {
            this.container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-message">組織データがありません</div>
                    <div class="empty-state-description">
                        データをアップロードまたはサンプルデータを読み込んでください
                    </div>
                </div>
            `;
        }

        /**
         * エラー状態を表示
         * @param {string} message - エラーメッセージ
         */
        showErrorState(message) {
            this.container.innerHTML = `
                <div class="error-state">
                    <div class="error-state-icon">⚠️</div>
                    <div class="error-state-message">組織図の描画でエラーが発生しました</div>
                    <div class="error-state-description">${message}</div>
                </div>
            `;
        }

        /**
         * デフォルトのボックススタイルを取得
         */
        getDefaultBoxStyle() {
            return {
                width: 100,
                height: 120,
                borderRadius: 6,
                borderWidth: 2,
                padding: 8,
                showHeader: true,
                headerHeight: 30
            };
        }

        /**
         * デフォルトのフォントスタイルを取得
         */
        getDefaultFontStyle() {
            return {
                teamName: { family: 'Arial, sans-serif', size: 12, weight: 'bold', lineHeight: 4 },
                picName: { family: 'Arial, sans-serif', size: 10, weight: 'normal', lineHeight: 3 },
                role: { family: 'Arial, sans-serif', size: 9, weight: 'normal', lineHeight: 3 }
            };
        }

        /**
         * デフォルトのカラーテーマを取得
         */
        getDefaultColorTheme() {
            return {
                boxBackground: '#ffffff',
                boxBorder: '#cccccc',
                headerBackground: '#f5f5f5',
                teamNameColor: '#333333',
                picNameColor: '#666666',
                roleColor: '#999999'
            };
        }

        /**
         * デフォルトの線スタイルを取得
         */
        getDefaultLineStyle() {
            return {
                color: '#666666',
                width: 2,
                type: 'step',
                style: 'solid',
                showArrows: false
            };
        }

        /**
         * スタイル設定を更新
         * @param {string} type - スタイルタイプ (boxSize, fontSize, lineStyle, colorTheme, layoutStyle)
         * @param {string} value - 設定値
         */
        updateStyle(type, value) {
            if (styleManager) {
                switch (type) {
                    case 'boxSize':
                        styleManager.setBoxSize(value);
                        break;
                    case 'fontSize':
                        styleManager.setFontSize(value);
                        break;
                    case 'lineStyle':
                        styleManager.setLineStyle(value);
                        break;
                    case 'colorTheme':
                        styleManager.setColorTheme(value);
                        break;
                    case 'layoutStyle':
                        styleManager.setLayoutStyle(value);
                        break;
                }
                
                // スタイル更新後に再描画
                this.rerender();
            }
        }

        /**
         * プリセットパックを適用
         * @param {string} packName - パック名
         */
        applyPresetPack(packName) {
            if (styleManager) {
                styleManager.applyPresetPack(packName);
                this.rerender();
            }
        }

        /**
         * チーム名対照表を描画
         * @param {Array} organizations - 組織データ配列
         */
        renderTeamNameTable(organizations) {
            // 既存のテーブルを削除
            const existingTable = this.container.parentElement?.querySelector('.team-name-table-container');
            if (existingTable) {
                existingTable.remove();
            }

            // ユニークなチーム名のペアを抽出
            const teamNamePairs = new Map();
            organizations.forEach(org => {
                const shortName = org.teamName || '';
                const fullName = org.exactTeamName || org.teamName || '';
                
                if (shortName && fullName && shortName !== fullName) {
                    teamNamePairs.set(shortName, fullName);
                }
            });

            // テーブルがある場合のみ描画
            if (teamNamePairs.size > 0) {
                this.createTeamNameTable(teamNamePairs);
            }
        }

        /**
         * チーム名対照表を作成
         * @param {Map} teamNamePairs - チーム名ペアのマップ
         */
        createTeamNameTable(teamNamePairs) {
            const tableContainer = document.createElement('div');
            tableContainer.className = 'team-name-table-container';
            
            // テーブルヘッダーと本体を作成
            const tableHTML = `
                <div class="team-name-table-header">
                    <h3>${this.t('teamNameTable.title')}</h3>
                    <button class="toggle-table-btn" title="${this.t('teamNameTable.toggle')}">
                        <span class="toggle-icon">📋</span>
                    </button>
                </div>
                <div class="team-name-table-content">
                    <table class="team-name-table">
                        <thead>
                            <tr>
                                <th>${this.t('teamNameTable.shortName')}</th>
                                <th>${this.t('teamNameTable.fullName')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.from(teamNamePairs.entries())
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([shortName, fullName]) => `
                                    <tr>
                                        <td class="short-name">${this.escapeHtml(shortName)}</td>
                                        <td class="full-name">${this.escapeHtml(fullName)}</td>
                                    </tr>
                                `).join('')
                            }
                        </tbody>
                    </table>
                </div>
            `;
            
            tableContainer.innerHTML = tableHTML;
            
            // チャートコンテナの後に挿入
            this.container.parentElement.appendChild(tableContainer);
            
            // 折りたたみ機能を追加
            this.setupTableToggle(tableContainer);
            
            // テーブルスタイルを適用
            this.applyTableStyles(tableContainer);
        }

        /**
         * テーブル折りたたみ機能を設定
         * @param {HTMLElement} tableContainer - テーブルコンテナ
         */
        setupTableToggle(tableContainer) {
            const toggleBtn = tableContainer.querySelector('.toggle-table-btn');
            const content = tableContainer.querySelector('.team-name-table-content');
            
            if (toggleBtn && content) {
                let isCollapsed = false;
                
                toggleBtn.addEventListener('click', () => {
                    isCollapsed = !isCollapsed;
                    content.style.display = isCollapsed ? 'none' : 'block';
                    toggleBtn.classList.toggle('collapsed', isCollapsed);
                    
                    // アイコン変更
                    const icon = toggleBtn.querySelector('.toggle-icon');
                    if (icon) {
                        icon.textContent = isCollapsed ? '📄' : '📋';
                    }
                });
            }
        }

        /**
         * テーブルスタイルを適用
         * @param {HTMLElement} tableContainer - テーブルコンテナ
         */
        applyTableStyles(tableContainer) {
            // CSSスタイルを動的に追加
            if (!document.querySelector('#team-name-table-styles')) {
                const style = document.createElement('style');
                style.id = 'team-name-table-styles';
                style.textContent = `
                    .team-name-table-container {
                        margin-top: 20px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        background: #fff;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        overflow: hidden;
                    }
                    
                    .team-name-table-header {
                        background: #f8f9fa;
                        padding: 10px 15px;
                        border-bottom: 1px solid #ddd;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .team-name-table-header h3 {
                        margin: 0;
                        font-size: 16px;
                        font-weight: 600;
                        color: #333;
                    }
                    
                    .toggle-table-btn {
                        background: none;
                        border: none;
                        cursor: pointer;
                        padding: 5px;
                        border-radius: 4px;
                        transition: background-color 0.2s;
                    }
                    
                    .toggle-table-btn:hover {
                        background: #e9ecef;
                    }
                    
                    .toggle-table-btn.collapsed .toggle-icon {
                        opacity: 0.6;
                    }
                    
                    .team-name-table-content {
                        max-height: 300px;
                        overflow-y: auto;
                    }
                    
                    .team-name-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 14px;
                    }
                    
                    .team-name-table th {
                        background: #f8f9fa;
                        padding: 12px 15px;
                        text-align: left;
                        font-weight: 600;
                        color: #495057;
                        border-bottom: 2px solid #dee2e6;
                        position: sticky;
                        top: 0;
                        z-index: 10;
                    }
                    
                    .team-name-table td {
                        padding: 10px 15px;
                        border-bottom: 1px solid #dee2e6;
                        color: #333;
                    }
                    
                    .team-name-table tbody tr:hover {
                        background: #f8f9fa;
                    }
                    
                    .team-name-table .short-name {
                        font-weight: 500;
                        color: #007bff;
                        width: 40%;
                    }
                    
                    .team-name-table .full-name {
                        color: #495057;
                        width: 60%;
                    }
                    
                    /* レスポンシブ対応 */
                    @media (max-width: 768px) {
                        .team-name-table-header {
                            padding: 8px 12px;
                        }
                        
                        .team-name-table th,
                        .team-name-table td {
                            padding: 8px 12px;
                            font-size: 13px;
                        }
                        
                        .team-name-table-content {
                            max-height: 200px;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }

        /**
         * HTMLエスケープ
         * @param {string} str - エスケープする文字列
         * @returns {string} エスケープされた文字列
         */
        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        /**
         * 翻訳関数
         * @param {string} key - 翻訳キー
         * @returns {string} 翻訳されたテキスト
         */
        t(key) {
            // 言語マネージャーが利用可能な場合は使用
            if (window.ConfigModule?.LanguageManager) {
                const langManager = window.ConfigModule.LanguageManager.getInstance();
                if (langManager && typeof langManager.t === 'function') {
                    return langManager.t(key);
                }
            }
            
            // グローバルなt関数が利用可能な場合
            if (typeof window.t === 'function') {
                return window.t(key);
            }
            
            // フォールバック翻訳
            const fallbackTranslations = {
                'teamNameTable.title': 'チーム名対照表',
                'teamNameTable.toggle': '表示/非表示を切り替え',
                'teamNameTable.shortName': '短縮系チーム名',
                'teamNameTable.fullName': '正式チーム名'
            };
            
            return fallbackTranslations[key] || key;
        }

        /**
         * 再描画
         */
        rerender() {
            // 現在の状態を保存
            const currentOrganizations = Array.from(this.nodes.values()).map(node => node.data);
            const currentLayout = this.getCurrentLayout();
            
            // 再描画
            this.render(currentOrganizations, currentLayout);
        }

        /**
         * 現在のレイアウト情報を取得
         */
        getCurrentLayout() {
            const positions = {};
            this.nodes.forEach((node, id) => {
                positions[id] = node.position;
            });
            
            return {
                positions,
                connections: this.connections.map(conn => conn.data),
                width: this.svgElement ? parseInt(this.svgElement.getAttribute('viewBox').split(' ')[2]) : 1200,
                height: this.svgElement ? parseInt(this.svgElement.getAttribute('viewBox').split(' ')[3]) : 800
            };
        }

        /**
         * エクスポート用のSVGデータを取得
         * @returns {string} SVGデータ
         */
        exportSVG() {
            if (!this.svgElement) return '';
            
            // クローンを作成してスタイルを埋め込み
            const clonedSVG = this.svgElement.cloneNode(true);
            this.embedStyles(clonedSVG);
            
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
                .org-box.selected .org-box-bg { stroke: #007bff; stroke-width: 3; }
                .connection-line { transition: stroke-width 0.2s; }
                .connection-line:hover { stroke-width: 4; }
                .team-name { font-weight: bold; }
                .pic-name { font-weight: normal; }
                .role { font-style: italic; }
            `;
            
            svg.insertBefore(style, svg.firstChild);
        }
    }

    // モジュールAPI
    return {
        ChartRenderer,
        
        /**
         * チャートレンダラーを作成
         * @param {HTMLElement} container - コンテナ要素
         * @param {Object} options - オプション
         * @returns {ChartRenderer} チャートレンダラーインスタンス
         */
        createRenderer(container, options = {}) {
            return new ChartRenderer(container, options);
        },


        /**
         * デフォルト設定を取得
         * @returns {Object} デフォルト設定
         */
        getDefaultOptions() {
            return {
                showConnections: true,
                enableInteraction: true,
                animationDuration: 300
            };
        }
    };
})();

// グローバルに公開
if (typeof window !== 'undefined') {
    window.ChartRendererModule = ChartRendererModule;
}