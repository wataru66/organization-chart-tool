/**
 * Chart Renderer Module - Fixed for Large Organizations
 * 組織図の描画を担当するモジュール
 */

// グローバルスコープにChartRendererModuleを定義
window.ChartRendererModule = (function() {
    'use strict';

    /**
     * ChartRenderer クラス
     * 組織図のSVG描画を管理
     */
    class ChartRenderer {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                enableInteraction: true,
                showConnections: true,
                showTeamNameTable: true,
                ...options
            };
            
            this.svgElement = null;
            this.nodes = new Map();
            this.connections = [];
            this.currentZoom = 1;
            this.currentTransform = { x: 0, y: 0 };
            
            // Add render state tracking
            this.renderState = {
                isRendering: false,
                lastRenderTime: 0,
                renderAttempts: 0
            };
        }

        /**
         * 組織図を描画
         * @param {Array} organizations - 組織データ配列
         * @param {Object} layout - レイアウト情報
         */
        render(organizations, layout) {
            try {
                console.log('[RENDER] Starting render process...');
                console.log(`[RENDER] Organizations: ${organizations?.length || 0}, Layout nodes: ${layout?.nodes?.length || 0}`);
                
                // Prevent concurrent renders
                if (this.renderState.isRendering) {
                    console.warn('[RENDER] Render already in progress, skipping...');
                    return;
                }
                
                this.renderState.isRendering = true;
                this.renderState.renderAttempts++;
                
                // 入力検証
                if (!organizations || organizations.length === 0) {
                    throw new Error('No organizations to render');
                }
                
                if (!layout || !layout.nodes || layout.nodes.length === 0) {
                    throw new Error('No layout data available');
                }
                
                if (!this.container) {
                    throw new Error('Container element not found');
                }
                
                // Clear with delay for large datasets
                console.log('[RENDER] Clearing container');
                this.clearContainerSafely();
                
                // Allow DOM to stabilize for large datasets
                if (organizations.length > 50) {
                    console.log('[RENDER] Large dataset detected, adding stabilization delay');
                    setTimeout(() => this.continueRender(organizations, layout), 50);
                } else {
                    this.continueRender(organizations, layout);
                }
                
            } catch (error) {
                console.error('[RENDER] Chart rendering failed:', error);
                console.error('[RENDER] Error stack:', error.stack);
                this.renderState.isRendering = false;
                this.showErrorState(error.message);
            }
        }
        
        /**
         * Continue render process after container clear
         */
        continueRender(organizations, layout) {
            try {
                // SVG要素を作成
                console.log('[RENDER] Creating SVG element');
                this.createSVGElementSafely(layout);
                
                if (!this.svgElement) {
                    throw new Error('Failed to create SVG element');
                }
                
                // Batch rendering for large datasets
                const batchSize = 50;
                if (organizations.length > batchSize) {
                    console.log('[RENDER] Using batch rendering for large dataset');
                    this.renderOrganizationsBatched(organizations, layout, batchSize);
                } else {
                    // 組織ボックスを描画
                    console.log(`[RENDER] Rendering ${organizations.length} organizations`);
                    this.renderOrganizations(organizations, layout);
                }
                
                // 接続線を描画
                if (this.options.showConnections && layout.connections) {
                    console.log(`[RENDER] Rendering ${layout.connections.length} connections`);
                    this.renderConnections(layout.connections);
                }
                
                // Verify SVG presence with retry
                this.verifySVGPresence();
                
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
                
                // フィット機能 - delay for large datasets
                setTimeout(() => {
                    try {
                        this.fitToContainer();
                    } catch (fitError) {
                        console.warn('[RENDER] Fit to container failed:', fitError);
                    }
                }, organizations.length > 100 ? 100 : 10);
                
                console.log('[RENDER] Rendering completed successfully');
                this.renderState.isRendering = false;
                this.renderState.lastRenderTime = Date.now();
                
            } catch (error) {
                console.error('[RENDER] Render continuation failed:', error);
                this.renderState.isRendering = false;
                throw error;
            }
        }

        /**
         * Safely clear container with proper cleanup
         */
        clearContainerSafely() {
            if (this.container) {
                // Remove event listeners first
                if (this.svgElement) {
                    const allNodes = this.svgElement.querySelectorAll('.org-box');
                    allNodes.forEach(node => {
                        node.replaceWith(node.cloneNode(true));
                    });
                }
                
                // Clear in chunks for better performance
                while (this.container.firstChild) {
                    this.container.removeChild(this.container.firstChild);
                }
                
                this.nodes.clear();
                this.connections = [];
                this.svgElement = null;
            }
        }

        /**
         * Create SVG element with better error handling
         */
        createSVGElementSafely(layout) {
            try {
                console.log('[SVG] Creating SVG element safely...');
                
                // Create SVG
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                if (!svg) {
                    throw new Error('Failed to create SVG element');
                }
                
                // Set attributes before adding to DOM
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                
                // コンテナサイズを取得
                const containerRect = this.container.getBoundingClientRect();
                const containerWidth = Math.max(containerRect.width || 800, 800);
                const containerHeight = Math.max(containerRect.height || 600, 600);
                
                console.log(`[SVG] Container size: ${containerWidth}x${containerHeight}`);
                
                // レイアウトの実際のサイズ
                const layoutWidth = layout.bounds?.width || layout.width || 1200;
                const layoutHeight = layout.bounds?.height || layout.height || 800;
                
                console.log(`[SVG] Layout size: ${layoutWidth}x${layoutHeight}`);
                
                // Set viewBox
                const padding = 50;
                const viewBoxWidth = Math.max(containerWidth, layoutWidth + padding * 2);
                const viewBoxHeight = Math.max(containerHeight, layoutHeight + padding * 2);
                
                svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
                svg.classList.add('org-chart-svg');
                
                // Create structure before adding to DOM
                const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                this.createArrowMarkers(defs);
                svg.appendChild(defs);
                
                const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                mainGroup.classList.add('main-group');
                svg.appendChild(mainGroup);
                
                // Add to DOM
                this.container.appendChild(svg);
                this.svgElement = svg;
                
                // Enable scrolling
                this.container.style.overflowX = 'auto';
                this.container.style.overflowY = 'auto';
                
                // Force layout
                this.container.offsetHeight;
                
                console.log(`[SVG] Created successfully: ViewBox=${viewBoxWidth.toFixed(0)}x${viewBoxHeight.toFixed(0)}`);
                
            } catch (error) {
                console.error('[SVG] SVG creation failed:', error);
                throw error;
            }
        }

        /**
         * Verify SVG presence with retry mechanism
         */
        verifySVGPresence() {
            let retries = 3;
            let svgFound = false;
            
            while (retries > 0 && !svgFound) {
                const svgCheck = this.container.querySelector('svg');
                if (svgCheck) {
                    svgFound = true;
                    console.log('[RENDER] SVG element confirmed in container');
                } else {
                    retries--;
                    console.warn(`[RENDER] SVG not found, retries remaining: ${retries}`);
                    
                    // Force a reflow
                    this.container.style.display = 'none';
                    this.container.offsetHeight;
                    this.container.style.display = '';
                    
                    if (retries === 0) {
                        throw new Error('SVG element not found after rendering');
                    }
                }
            }
        }

        /**
         * Render organizations in batches for better performance
         */
        renderOrganizationsBatched(organizations, layout, batchSize) {
            const mainGroup = this.svgElement.querySelector('.main-group');
            if (!mainGroup) return;
            
            let index = 0;
            
            const renderBatch = () => {
                const batch = organizations.slice(index, index + batchSize);
                
                batch.forEach(org => {
                    const node = layout.nodes.find(n => n.data.id === org.id);
                    if (node) {
                        const orgGroup = this.createOrganizationBox(org, node);
                        if (orgGroup) {
                            mainGroup.appendChild(orgGroup);
                            this.nodes.set(org.id, node);
                        }
                    }
                });
                
                index += batchSize;
                
                if (index < organizations.length) {
                    // Schedule next batch
                    requestAnimationFrame(renderBatch);
                } else {
                    console.log('[RENDER] Batch rendering completed');
                }
            };
            
            renderBatch();
        }

        /**
         * 組織を描画
         * @param {Array} organizations - 組織データ配列
         * @param {Object} layout - レイアウト情報
         */
        renderOrganizations(organizations, layout) {
            const mainGroup = this.svgElement.querySelector('.main-group');
            if (!mainGroup) {
                console.error('[RENDER] Main group not found in SVG');
                return;
            }
            
            const orgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            orgGroup.classList.add('organizations');
            mainGroup.appendChild(orgGroup);
            
            // 各組織ボックスを描画
            organizations.forEach(org => {
                const node = layout.nodes.find(n => n.data.id === org.id);
                if (node) {
                    const orgElement = this.createOrganizationBox(org, node);
                    if (orgElement) {
                        orgGroup.appendChild(orgElement);
                        this.nodes.set(org.id, node);
                    }
                }
            });
        }

        /**
         * 組織ボックスを作成
         * @param {Object} org - 組織データ
         * @param {Object} node - ノード位置情報
         * @returns {SVGElement} グループ要素
         */
        createOrganizationBox(org, node) {
            try {
                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                group.classList.add('org-box');
                group.setAttribute('data-org-id', org.id);
                group.setAttribute('transform', `translate(${node.x}, ${node.y})`);
                
                // スタイル情報を取得
                const boxStyle = this.getBoxStyle(node);
                const colorTheme = this.getColorTheme(org);
                
                // 背景矩形
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('width', boxStyle.width);
                rect.setAttribute('height', boxStyle.height);
                rect.setAttribute('rx', boxStyle.borderRadius);
                rect.setAttribute('fill', colorTheme.backgroundColor);
                rect.setAttribute('stroke', colorTheme.borderColor);
                rect.setAttribute('stroke-width', boxStyle.borderWidth);
                rect.classList.add('org-box-bg');
                group.appendChild(rect);
                
                // ヘッダー部分（チーム名）
                if (boxStyle.showHeader) {
                    const header = this.createHeader(org, boxStyle, colorTheme);
                    group.appendChild(header);
                }
                
                // コンテンツ部分（メンバー情報）
                const content = this.createContent(org, boxStyle, colorTheme);
                group.appendChild(content);
                
                // インタラクション
                if (this.options.enableInteraction) {
                    this.addHoverEffects(group, org);
                }
                
                return group;
            } catch (error) {
                console.error(`[RENDER] Failed to create box for ${org.teamName}:`, error);
                return null;
            }
        }

        /**
         * ヘッダー部分を作成
         * @param {Object} org - 組織データ
         * @param {Object} boxStyle - ボックススタイル
         * @param {Object} colorTheme - カラーテーマ
         * @returns {SVGElement} ヘッダーグループ
         */
        createHeader(org, boxStyle, colorTheme) {
            const headerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            headerGroup.classList.add('org-header');
            
            // ヘッダー背景
            const headerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            headerRect.setAttribute('width', boxStyle.width);
            headerRect.setAttribute('height', boxStyle.headerHeight);
            headerRect.setAttribute('rx', boxStyle.borderRadius);
            headerRect.setAttribute('fill', colorTheme.borderColor);
            headerRect.classList.add('header-bg');
            headerGroup.appendChild(headerRect);
            
            // チーム名テキスト
            const teamNameText = this.createTextElement(
                org.teamName,
                boxStyle.width / 2,
                boxStyle.headerHeight / 2,
                this.getFontStyle().teamName,
                colorTheme.headerTextColor,
                'team-name'
            );
            teamNameText.setAttribute('dominant-baseline', 'middle');
            headerGroup.appendChild(teamNameText);
            
            return headerGroup;
        }

        /**
         * コンテンツ部分を作成
         * @param {Object} org - 組織データ
         * @param {Object} boxStyle - ボックススタイル
         * @param {Object} colorTheme - カラーテーマ
         * @returns {SVGElement} コンテンツグループ
         */
        createContent(org, boxStyle, colorTheme) {
            const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            contentGroup.classList.add('org-content');
            
            const startY = boxStyle.showHeader ? boxStyle.headerHeight + 8 : 8;
            const fontStyle = this.getFontStyle();
            
            // メンバー情報を表示
            org.members.forEach((member, index) => {
                if (index < 3) { // 最大3人まで表示
                    const memberY = startY + (index * 30);
                    const memberGroup = this.createMemberInfo(member, memberY, boxStyle, fontStyle, colorTheme);
                    contentGroup.appendChild(memberGroup);
                }
            });
            
            // 省略表示
            if (org.members.length > 3) {
                const moreText = this.createTextElement(
                    `他 ${org.members.length - 3} 名`,
                    boxStyle.width / 2,
                    startY + 90,
                    { ...fontStyle.picName, size: 9 },
                    '#666',
                    'more-members'
                );
                contentGroup.appendChild(moreText);
            }
            
            return contentGroup;
        }

        /**
         * メンバー情報を作成
         * @param {Object} person - メンバーデータ
         * @param {number} startY - Y座標開始位置
         * @param {Object} boxStyle - ボックススタイル
         * @param {Object} fontStyle - フォントスタイル
         * @param {Object} colorTheme - カラーテーマ
         * @returns {SVGElement} メンバー情報グループ
         */
        createMemberInfo(person, startY, boxStyle, fontStyle, colorTheme) {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.classList.add('member-info');
            
            const isTeamBoss = person.isTeamBoss === 'Y';
            let yOffset = startY;
            const padding = 4;
            
            // 役割を左詰めで表示
            if (person.role) {
                const roleText = this.createTextElement(
                    person.role,
                    padding, // 左詰め
                    yOffset,
                    {
                        ...fontStyle.role,
                        weight: isTeamBoss ? 'bold' : 'normal'
                    },
                    isTeamBoss ? '#d32f2f' : colorTheme.roleColor,
                    'role'
                );
                roleText.setAttribute('text-anchor', 'start'); // 左詰め
                group.appendChild(roleText);
                yOffset += parseInt(fontStyle.role.size) + 2;
            }
            
            // 名前を中央揃えで表示
            if (person.name) {
                const nameText = this.createTextElement(
                    person.name,
                    boxStyle.width / 2, // 中央
                    yOffset,
                    {
                        ...fontStyle.picName,
                        weight: isTeamBoss ? 'bold' : 'normal'
                    },
                    isTeamBoss ? '#1976d2' : colorTheme.picNameColor,
                    'pic-name'
                );
                nameText.setAttribute('text-anchor', 'middle'); // 中央揃え
                group.appendChild(nameText);
                yOffset += parseInt(fontStyle.picName.size) + 3;
            }
            
            return group;
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
                    console.warn(`[CONNECTION] Node not found for connection: ${connection.from} -> ${connection.to}`);
                    return null;
                }
                
                // 接続点を計算
                fromPos = {
                    x: parentNode.x + parentNode.width / 2,
                    y: parentNode.y + parentNode.height
                };
                
                toPos = {
                    x: childNode.x + childNode.width / 2,
                    y: childNode.y
                };
            }
            
            // 接続線のパスを作成
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // パスデータを生成
            const pathData = this.createPathData(fromPos, toPos, connection.connectionType);
            path.setAttribute('d', pathData);
            
            // スタイルを適用
            path.setAttribute('stroke', lineStyle.color);
            path.setAttribute('stroke-width', lineStyle.width);
            path.setAttribute('fill', 'none');
            path.classList.add('connection-line', connection.connectionType || 'standard');
            
            // 矢印付きの場合
            if (connection.hasArrow) {
                path.setAttribute('marker-end', 'url(#arrowhead)');
            }
            
            return path;
        }

        /**
         * 水平ブリッジを作成（特殊な接続線）
         * @param {Object} connection - 接続情報
         * @param {Object} lineStyle - 線のスタイル
         * @returns {SVGElement} パス要素
         */
        createHorizontalBridge(connection, lineStyle) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // 水平線のパスを作成
            const pathData = `M ${connection.fromPos.x} ${connection.fromPos.y} L ${connection.toPos.x} ${connection.toPos.y}`;
            path.setAttribute('d', pathData);
            path.setAttribute('stroke', lineStyle.color);
            path.setAttribute('stroke-width', lineStyle.width);
            path.setAttribute('fill', 'none');
            path.classList.add('connection-line', 'horizontal-bridge');
            
            return path;
        }

        /**
         * 接続線のパスデータを生成
         * @param {Object} from - 開始位置
         * @param {Object} to - 終了位置
         * @param {string} connectionType - 接続タイプ
         * @returns {string} SVGパスデータ
         */
        createPathData(from, to, connectionType) {
            // 垂直・水平の線のみで構成（階段状）
            const midY = from.y + (to.y - from.y) / 2;
            
            if (Math.abs(from.x - to.x) < 1) {
                // 垂直線
                return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
            } else {
                // 階段状の線
                return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
            }
        }

        /**
         * チーム名対照表を描画
         * @param {Array} organizations - 組織データ配列
         */
        renderTeamNameTable(organizations) {
            // チーム名テーブルの実装（必要に応じて）
            console.log(`[TABLE] Rendering team name table for ${organizations.length} organizations`);
        }

        /**
         * インタラクション機能を有効化
         */
        enableInteractions() {
            // パン機能
            this.enablePanning();
            
            // ズーム機能
            this.enableZooming();
            
            // キーボードショートカット
            this.enableKeyboardShortcuts();
        }

        /**
         * パン機能を有効化
         */
        enablePanning() {
            let isPanning = false;
            let startPoint = { x: 0, y: 0 };
            let startTransform = { x: 0, y: 0 };
            
            this.svgElement.addEventListener('mousedown', (e) => {
                if (e.button === 0 && !e.target.closest('.org-box')) { // 左クリックかつ組織ボックス以外
                    isPanning = true;
                    startPoint = { x: e.clientX, y: e.clientY };
                    startTransform = { ...this.currentTransform };
                    this.svgElement.style.cursor = 'grabbing';
                }
            });
            
            window.addEventListener('mousemove', (e) => {
                if (isPanning) {
                    const dx = e.clientX - startPoint.x;
                    const dy = e.clientY - startPoint.y;
                    
                    this.currentTransform = {
                        x: startTransform.x + dx,
                        y: startTransform.y + dy
                    };
                    
                    this.updateTransform();
                }
            });
            
            window.addEventListener('mouseup', () => {
                isPanning = false;
                this.svgElement.style.cursor = '';
            });
        }

        /**
         * ズーム機能を有効化
         */
        enableZooming() {
            this.svgElement.addEventListener('wheel', (e) => {
                e.preventDefault();
                
                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                const newZoom = this.currentZoom * delta;
                
                // ズーム範囲を制限
                this.currentZoom = Math.max(0.1, Math.min(5, newZoom));
                
                this.updateTransform();
            });
        }

        /**
         * キーボードショートカットを有効化
         */
        enableKeyboardShortcuts() {
            window.addEventListener('keydown', (e) => {
                switch(e.key) {
                    case '+':
                    case '=':
                        this.zoomIn();
                        break;
                    case '-':
                    case '_':
                        this.zoomOut();
                        break;
                    case '0':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.resetZoom();
                        }
                        break;
                    case 'f':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.fitToContainer();
                        }
                        break;
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
         * ズームをリセット
         */
        resetZoom() {
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
         * デフォルトの線スタイルを取得
         */
        getDefaultLineStyle() {
            return {
                color: '#666666',
                width: 2,
                dashArray: null
            };
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
            marker.setAttribute('markerHeight', '10');
            marker.setAttribute('refX', '8');
            marker.setAttribute('refY', '3');
            marker.setAttribute('orient', 'auto');
            
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3, 0 6');
            polygon.setAttribute('fill', lineStyle.color);
            
            marker.appendChild(polygon);
            defs.appendChild(marker);
        }

        /**
         * ボックススタイルを取得
         * @param {Object} node - ノード情報
         * @returns {Object} ボックススタイル
         */
        getBoxStyle(node) {
            // スタイルマネージャーから取得するか、デフォルトを使用
            if (typeof styleManager !== 'undefined' && styleManager && styleManager.getCurrentBoxStyle) {
                return styleManager.getCurrentBoxStyle();
            }
            
            // ノードに含まれるスタイル情報を使用
            if (node.boxStyle) {
                return node.boxStyle;
            }
            
            return this.getDefaultBoxStyle();
        }

        /**
         * カラーテーマを取得
         * @param {Object} org - 組織データ
         * @returns {Object} カラーテーマ
         */
        getColorTheme(org) {
            // デフォルトカラー
            const defaultTheme = {
                borderColor: '#2196f3',
                backgroundColor: '#e3f2fd',
                headerTextColor: '#ffffff',
                roleColor: '#666666',
                picNameColor: '#333333'
            };
            
            // 組織に設定されたカラーがあれば使用
            if (org.colors) {
                return {
                    borderColor: org.colors.borderColor || defaultTheme.borderColor,
                    backgroundColor: org.colors.backgroundColor || defaultTheme.backgroundColor,
                    headerTextColor: org.colors.headerTextColor || defaultTheme.headerTextColor,
                    roleColor: defaultTheme.roleColor,
                    picNameColor: defaultTheme.picNameColor
                };
            }
            
            return defaultTheme;
        }

        /**
         * フォントスタイルを取得
         * @returns {Object} フォントスタイル
         */
        getFontStyle() {
            // スタイルマネージャーから取得するか、デフォルトを使用
            if (typeof styleManager !== 'undefined' && styleManager && styleManager.getCurrentFontStyle) {
                return styleManager.getCurrentFontStyle();
            }
            
            return this.getDefaultFontStyle();
        }
    }

    // モジュールをエクスポート
    return {
        ChartRenderer: ChartRenderer
    };
})();