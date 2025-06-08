/**
 * Organization Chart Tool - Layout Calculator Module (v4)
 * レイアウト計算・配置機能 - 修正版
 */

class LayoutCalculator {
    constructor() {
        this.processedData = null;
        this.cachedLayout = null;
        
        // CONFIG変数の安全な参照
        this.config = this.getConfig();
        this.configUtils = this.getConfigUtils();
        
        this.spacingConfig = {
            x: (this.config.LAYOUT && this.config.LAYOUT.HORIZONTAL_SPACING) || 24,
            y: (this.config.LAYOUT && this.config.LAYOUT.VERTICAL_SPACING) || 100,
            margin: (this.config.LAYOUT && this.config.LAYOUT.MARGIN) || 50
        };
        
        this.configUtils.debugLog('LayoutCalculator initialized', 'layout');
    }

    /**
     * CONFIG変数の安全な取得
     */
    getConfig() {
        return (typeof CONFIG !== 'undefined' ? CONFIG : null) || 
               (typeof window !== 'undefined' && window.CONFIG) ||
               (typeof window !== 'undefined' && window.ConfigModule && window.ConfigModule.CONFIG) ||
               {
                   DEFAULTS: {
                       BOX_SIZES: {
                           small: { width: '80', height: '100', spacingX: '100', spacingY: '120' },
                           medium: { width: '110', height: '130', spacingX: '130', spacingY: '150' },
                           large: { width: '130', height: '150', spacingX: '150', spacingY: '180' }
                       }
                   },
                   LAYOUT: {
                       HORIZONTAL_SPACING: 24,
                       VERTICAL_SPACING: 100,
                       MARGIN: 50
                   }
               };
    }

    /**
     * ConfigUtilsの安全な取得
     */
    getConfigUtils() {
        return (typeof ConfigUtils !== 'undefined' ? ConfigUtils : null) ||
               (typeof window !== 'undefined' && window.ConfigUtils) ||
               (typeof window !== 'undefined' && window.ConfigModule && window.ConfigModule.ConfigUtils) ||
               { 
                   debugLog: (message, category) => {
                       console.log(`[${category?.toUpperCase() || 'INFO'}] ${message}`);
                   }
               };
    }

    /**
     * レイアウトを計算
     */
    calculateLayout(organizations, baseOrg = null, options = {}) {
        try {
            this.configUtils.debugLog(`Calculating layout for ${organizations.length} organizations`, 'layout');
            
            if (!organizations || !Array.isArray(organizations) || organizations.length === 0) {
                throw new Error('Organizations array is empty or invalid');
            }
            
            const {
                hideManagers = false,
                fontSize = 'medium',
                boxSize = 'medium'
            } = options;
            
            // ボックスサイズ設定を取得
            const boxConfig = (this.config.DEFAULTS && this.config.DEFAULTS.BOX_SIZES && this.config.DEFAULTS.BOX_SIZES[boxSize]) || 
                              (this.config.DEFAULTS && this.config.DEFAULTS.BOX_SIZES && this.config.DEFAULTS.BOX_SIZES.medium) || 
                              { spacingX: '120', spacingY: '140' };
            const spacingX = parseInt(boxConfig.spacingX) || 120;
            const spacingY = parseInt(boxConfig.spacingY) || 140;
            
            // レイアウト計算の開始
            const layout = {
                nodes: [],
                connections: [],
                bounds: { width: 0, height: 0 },
                config: {
                    boxSize,
                    fontSize,
                    hideManagers,
                    spacingX,
                    spacingY
                }
            };
            
            if (organizations.length === 0) {
                return layout;
            }
            
            // 階層別にグループ化
            const levelGroups = this.groupByLevel(organizations);
            this.configUtils.debugLog(`Grouped into ${levelGroups.size} levels`, 'layout');
            
            // 2パス方式でレイアウト計算
            // パス1: 初期位置計算（子から親へ）
            const levelPositions = this.calculateInitialPositions(levelGroups, spacingX, spacingY);
            
            // パス2: 親の位置を子の中央に調整（親から子へ）
            this.adjustParentPositions(levelPositions, organizations);
            
            // 最終的なノード配列を作成
            levelPositions.forEach(levelLayout => {
                levelLayout.nodes.forEach(node => {
                    layout.nodes.push(node);
                });
            });
            
            // 接続線を計算
            layout.connections = this.calculateConnections(levelPositions, organizations);
            
            // 境界を計算
            layout.bounds = this.calculateBounds(layout.nodes);
            
            // キャッシュに保存
            this.cachedLayout = layout;
            
            this.configUtils.debugLog(`Layout calculated: ${layout.nodes.length} nodes, ${layout.connections.length} connections`, 'layout');
            return layout;
            
        } catch (error) {
            this.configUtils.debugLog(`Layout calculation error: ${error.message}`, 'error');
            throw new Error(`Failed to calculate layout: ${error.message}`);
        }
    }

    /**
     * 組織を階層別にグループ化
     */
    groupByLevel(organizations) {
        const levelGroups = new Map();
        
        organizations.forEach(org => {
            try {
                // orgがオブジェクトの場合はそのまま使用
                const orgData = (typeof org === 'object' && org !== null) ? org : null;
                
                if (orgData && typeof orgData.level === 'number' && orgData.level > 0) {
                    const level = orgData.level;
                    if (!levelGroups.has(level)) {
                        levelGroups.set(level, []);
                    }
                    levelGroups.get(level).push(orgData);
                } else {
                    this.configUtils.debugLog(`Invalid organization data: ${JSON.stringify(org)}`, 'layout');
                }
            } catch (error) {
                this.configUtils.debugLog(`Error processing organization: ${error.message}`, 'error');
            }
        });
        
        // レベル順にソート
        return new Map([...levelGroups.entries()].sort((a, b) => a[0] - b[0]));
    }

    /**
     * 初期位置計算（パス1）- 親子グループ単位で配置（左上基点）
     */
    calculateInitialPositions(levelGroups, spacingX, spacingY) {
        const levelPositions = new Map();
        let currentY = 20; // 上端から小さなマージンで開始
        
        // 全レベルを上から下に配置（Y座標設定）
        const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
        
        for (const level of sortedLevels) {
            const orgs = levelGroups.get(level);
            const levelLayout = this.calculateLevelLayoutGrouped(orgs, level, currentY, spacingX, spacingY);
            levelPositions.set(level, levelLayout);
            currentY = levelLayout.maxY + spacingY;
        }
        
        return levelPositions;
    }
    
    /**
     * 親子グループを考慮したレベル内レイアウト
     */
    calculateLevelLayoutGrouped(organizations, level, startY, spacingX, spacingY) {
        const nodes = [];
        const boxWidth = parseInt((this.config.DEFAULTS && this.config.DEFAULTS.BOX_SIZES && this.config.DEFAULTS.BOX_SIZES.medium && this.config.DEFAULTS.BOX_SIZES.medium.width) || 110);
        const boxHeight = parseInt((this.config.DEFAULTS && this.config.DEFAULTS.BOX_SIZES && this.config.DEFAULTS.BOX_SIZES.medium && this.config.DEFAULTS.BOX_SIZES.medium.height) || 130);
        
        // 組織を親ごとにグループ化
        const parentGroups = new Map();
        const orphans = []; // 親がいない組織
        
        organizations.forEach(org => {
            if (org.upperTeam) {
                if (!parentGroups.has(org.upperTeam)) {
                    parentGroups.set(org.upperTeam, []);
                }
                parentGroups.get(org.upperTeam).push(org);
            } else {
                orphans.push(org);
            }
        });
        
        // 各親グループ内で子をソート（データ順序）
        parentGroups.forEach((children, parent) => {
            children.sort((a, b) => (a.dataOrder || 0) - (b.dataOrder || 0));
        });
        
        // 親グループをソート（最初の子のデータ順序で）
        const sortedParentGroups = Array.from(parentGroups.entries()).sort(([parentA, childrenA], [parentB, childrenB]) => {
            const minOrderA = Math.min(...childrenA.map(child => child.dataOrder || 0));
            const minOrderB = Math.min(...childrenB.map(child => child.dataOrder || 0));
            return minOrderA - minOrderB;
        });
        
        // 孤立ノードもソート
        orphans.sort((a, b) => (a.dataOrder || 0) - (b.dataOrder || 0));
        
        // 配置開始（左端から小さなマージンで開始）
        let currentX = 20; // 左端から小さなマージン
        const groupSpacing = Math.max(spacingX * 0.4, 32); // グループ間のスペースをさらに削減（20%減）
        
        // 1. 親なし組織（ルートレベル）
        orphans.forEach(org => {
            const node = {
                id: org.id || org.teamName,
                x: currentX,
                y: startY,
                width: boxWidth,
                height: boxHeight,
                level: level,
                data: org,
                parentGroup: null
            };
            nodes.push(node);
            currentX += boxWidth + Math.max(boxWidth / 4, 30); // ボックス幅の1/4または30px
        });
        
        // グループ間のスペーシング
        if (orphans.length > 0) {
            currentX += groupSpacing;
        }
        
        // 2. 親ごとのグループ（ソート済み）
        sortedParentGroups.forEach(([parent, children], groupIndex) => {
            const groupStartX = currentX;
            
            // 子を配置（左から右へ連続して）
            children.forEach((child, childIndex) => {
                const node = {
                    id: child.id || child.teamName,
                    x: currentX,
                    y: startY,
                    width: boxWidth,
                    height: boxHeight,
                    level: level,
                    data: child,
                    parentGroup: parent,
                    groupIndex: groupIndex,
                    childIndex: childIndex
                };
                nodes.push(node);
                currentX += boxWidth + Math.max(boxWidth / 4, 30); // ボックス幅の1/4または30px
            });
            
            const groupEndX = currentX - spacingX;
            this.configUtils.debugLog(`Parent ${parent}: children placed from ${groupStartX} to ${groupEndX} (${children.length} children)`, 'layout');
            
            // グループ間のスペーシングを追加
            currentX += groupSpacing;
        });
        
        return {
            nodes: nodes,
            maxY: startY + boxHeight,
            level: level
        };
    }
    
    /**
     * 親の位置調整（パス2）- 下位レベルから上位レベルへ
     */
    adjustParentPositions(levelPositions, organizations) {
        this.configUtils.debugLog('=== Adjusting parent positions (bottom-up) ===', 'layout');
        
        // 親子関係のマップを作成
        const childrenMap = new Map();
        organizations.forEach(org => {
            if (org.upperTeam) {
                if (!childrenMap.has(org.upperTeam)) {
                    childrenMap.set(org.upperTeam, []);
                }
                childrenMap.get(org.upperTeam).push(org.teamName);
            }
        });
        
        // 下位レベルから上位レベルへ調整（子の位置確定後に親を調整）
        const sortedLevels = Array.from(levelPositions.keys()).sort((a, b) => b - a);
        
        for (const level of sortedLevels) {
            const levelLayout = levelPositions.get(level);
            
            // このレベルの親を調整
            levelLayout.nodes.forEach(node => {
                const children = childrenMap.get(node.data.teamName);
                if (children && children.length >= 1) {
                    const childNodes = this.findChildNodes(children, levelPositions);
                    if (childNodes.length >= 1) {
                        if (childNodes.length === 1) {
                            // 子が1つの場合：親を子の真上に配置
                            const child = childNodes[0];
                            const newX = child.x + (child.width / 2) - (node.width / 2);
                            this.configUtils.debugLog(`Single child: placing parent ${node.data.teamName} directly above ${child.data.teamName}`, 'layout');
                            node.x = newX;
                        } else {
                            // 子が複数の場合：子の左右中央の上部に親を配置
                            const leftmostChild = childNodes.reduce((min, child) => 
                                child.x < min.x ? child : min
                            );
                            const rightmostChild = childNodes.reduce((max, child) => 
                                child.x > max.x ? child : max
                            );
                            
                            // 子の範囲の中央点を正確に計算
                            const leftEdge = leftmostChild.x;
                            const rightEdge = rightmostChild.x + rightmostChild.width;
                            const childrenCenterX = (leftEdge + rightEdge) / 2;
                            const newX = childrenCenterX - (node.width / 2);
                            
                            this.configUtils.debugLog(`Multiple children: placing parent ${node.data.teamName} at center (${childrenCenterX.toFixed(1)}) of children range [${leftEdge.toFixed(1)} - ${rightEdge.toFixed(1)}]`, 'layout');
                            node.x = newX;
                        }
                    }
                }
            });
            
            // 同レベル内で重複解決
            this.resolveOverlapsWithGrouping(levelLayout.nodes, childrenMap);
        }
    }
    
    /**
     * グループを考慮した重複解決（改善版）
     */
    resolveOverlapsWithGrouping(nodes, childrenMap) {
        if (nodes.length <= 1) return;
        
        this.configUtils.debugLog(`Resolving overlaps for ${nodes.length} nodes at same level`, 'layout');
        
        // 親を持たないノード（ルートまたは孤立ノード）を分離
        const rootNodes = nodes.filter(node => !node.data.upperTeam);
        const childNodes = nodes.filter(node => node.data.upperTeam);
        
        // 親ごとに子ノードをグループ化
        const parentGroups = new Map();
        childNodes.forEach(node => {
            const parentName = node.data.upperTeam;
            if (!parentGroups.has(parentName)) {
                parentGroups.set(parentName, []);
            }
            parentGroups.get(parentName).push(node);
        });
        
        // 各グループ内で子ノードを左から右にソート
        parentGroups.forEach(children => {
            children.sort((a, b) => a.x - b.x);
        });
        
        // ルートノードをソート
        rootNodes.sort((a, b) => a.x - b.x);
        
        // 最小間隔設定
        const minSpacing = 20;
        let currentX = 20; // 左端マージン
        
        // 1. ルートノードを配置
        rootNodes.forEach(node => {
            if (node.x < currentX) {
                this.configUtils.debugLog(`Adjusting root node ${node.data.teamName}: ${node.x} -> ${currentX}`, 'layout');
                node.x = currentX;
            }
            currentX = node.x + node.width + minSpacing;
        });
        
        // 2. 各親グループの子ノードを配置
        parentGroups.forEach((children, parentName) => {
            // グループ内の重複を解決
            for (let i = 1; i < children.length; i++) {
                const prevNode = children[i - 1];
                const currentNode = children[i];
                const minX = prevNode.x + prevNode.width + minSpacing;
                
                if (currentNode.x < minX) {
                    const adjustment = minX - currentNode.x;
                    this.configUtils.debugLog(`Adjusting child ${currentNode.data.teamName}: ${currentNode.x} -> ${minX}`, 'layout');
                    
                    // 現在のノードとその右側の兄弟ノードを移動
                    for (let j = i; j < children.length; j++) {
                        children[j].x += adjustment;
                    }
                }
            }
            
            // グループ全体と他のグループ・ルートノードとの重複を解決
            if (children.length > 0) {
                const groupLeftMost = children[0].x;
                if (groupLeftMost < currentX) {
                    const adjustment = currentX - groupLeftMost;
                    this.configUtils.debugLog(`Adjusting group ${parentName}: moving ${adjustment}px right`, 'layout');
                    
                    children.forEach(child => {
                        child.x += adjustment;
                    });
                }
                
                // currentXを更新
                const groupRightMost = children[children.length - 1].x + children[children.length - 1].width;
                currentX = Math.max(currentX, groupRightMost + minSpacing);
            }
        });
        
        this.configUtils.debugLog(`Overlap resolution completed, total width: ${currentX}`, 'layout');
    }
    
    /**
     * ノードの重複を解決
     */
    resolveOverlaps(nodes) {
        if (nodes.length <= 1) return;
        
        // X座標でソート
        nodes.sort((a, b) => a.x - b.x);
        
        const minSpacing = 16; // 最小間隔（20%削減）
        
        for (let i = 1; i < nodes.length; i++) {
            const currentNode = nodes[i];
            const prevNode = nodes[i - 1];
            
            const requiredX = prevNode.x + prevNode.width + minSpacing;
            if (currentNode.x < requiredX) {
                const adjustment = requiredX - currentNode.x;
                this.configUtils.debugLog(`Resolving overlap: moving ${currentNode.data.teamName} right by ${adjustment}px`, 'layout');
                
                // 現在のノードとその右側のノードを全て右にシフト
                for (let j = i; j < nodes.length; j++) {
                    nodes[j].x += adjustment;
                }
            }
        }
    }
    
    /**
     * 子ノードを検索
     */
    findChildNodes(childNames, levelPositions) {
        const childNodes = [];
        levelPositions.forEach(levelLayout => {
            levelLayout.nodes.forEach(node => {
                if (childNames.includes(node.data.teamName)) {
                    childNodes.push(node);
                }
            });
        });
        return childNodes;
    }

    /**
     * 接続線を計算（明確な親子関係に基づく）
     */
    calculateConnections(levelPositions, organizations) {
        const connections = [];
        
        this.configUtils.debugLog('=== Connection Calculation Started ===', 'layout');
        
        // 各組織について、その親との接続線を作成
        organizations.forEach(org => {
            const orgData = (typeof org === 'object') ? org : null;
            if (orgData && orgData.upperTeam) {
                // 親組織を探す（upperTeamがparentと同じ）
                const parentOrg = organizations.find(parent => {
                    const parentData = (typeof parent === 'object') ? parent : null;
                    return parentData && parentData.teamName === orgData.upperTeam;
                });
                
                if (parentOrg) {
                    const connection = this.createConnectionFromObjects(parentOrg, orgData, levelPositions);
                    if (connection) {
                        connections.push(connection);
                        this.configUtils.debugLog(`Connection: ${parentOrg.teamName} -> ${orgData.teamName}`, 'layout');
                    }
                } else {
                    this.configUtils.debugLog(`Parent not found for ${orgData.teamName}, looking for: ${orgData.upperTeam}`, 'layout');
                }
            } else if (orgData && !orgData.upperTeam) {
                this.configUtils.debugLog(`Root organization: ${orgData.teamName}`, 'layout');
            }
        });
        
        this.configUtils.debugLog(`Total connections created: ${connections.length}`, 'layout');
        
        // 接続線の交差を最小化
        return this.optimizeConnectionPaths(connections);
    }

    /**
     * オブジェクトから接続線を作成
     */
    createConnectionFromObjects(parentOrg, childOrg, levelPositions) {
        try {
            const parentId = parentOrg.id || parentOrg.teamName;
            const childId = childOrg.id || childOrg.teamName;
            
            // レベル位置から対応するノードを探す
            let parentNode = null;
            let childNode = null;
            
            for (const levelNodes of levelPositions.values()) {
                const parentFound = levelNodes.nodes.find(node => 
                    node.id === parentId || node.data?.teamName === parentOrg.teamName
                );
                const childFound = levelNodes.nodes.find(node => 
                    node.id === childId || node.data?.teamName === childOrg.teamName
                );
                
                if (parentFound) parentNode = parentFound;
                if (childFound) childNode = childFound;
            }
            
            if (parentNode && childNode) {
                return {
                    from: parentId,
                    to: childId,
                    fromPos: {
                        x: parentNode.x,
                        y: parentNode.y,
                        width: parentNode.width,
                        height: parentNode.height
                    },
                    toPos: {
                        x: childNode.x,
                        y: childNode.y,
                        width: childNode.width,
                        height: childNode.height
                    },
                    fromX: parentNode.x + (parentNode.width / 2),
                    fromY: parentNode.y + parentNode.height,
                    toX: childNode.x + (childNode.width / 2),
                    toY: childNode.y,
                    type: 'hierarchy'
                };
            }
            
            return null;
        } catch (error) {
            this.configUtils.debugLog(`Connection creation error: ${error.message}`, 'error');
            return null;
        }
    }

    /**
     * レイアウトの境界を計算（縦方向表示最適化）
     */
    calculateBounds(nodes) {
        if (nodes.length === 0) {
            return { width: 0, height: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }
        
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        
        nodes.forEach(node => {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x + node.width);
            maxY = Math.max(maxY, node.y + node.height);
        });
        
        const margin = this.spacingConfig.margin;
        
        // 縦方向表示を優先し、最小幅制限を削除
        return {
            minX: minX - margin,
            minY: minY - margin,
            maxX: maxX + margin,
            maxY: maxY + margin,
            width: maxX - minX + (margin * 2), // 実際の幅を使用
            height: maxY - minY + (margin * 2)
        };
    }

    /**
     * 接続線パスを最適化（完全な垂直・水平線のみ、交差回避）
     */
    optimizeConnectionPaths(connections) {
        // 有効な接続のみをフィルタリング
        const validConnections = connections.filter(conn => 
            conn.fromPos && conn.toPos && conn.from && conn.to
        );
        
        // 親ノードごとにグループ化
        const connectionGroups = new Map();
        
        validConnections.forEach(conn => {
            const parentId = conn.from;
            if (!connectionGroups.has(parentId)) {
                connectionGroups.set(parentId, []);
            }
            connectionGroups.get(parentId).push(conn);
        });
        
        const optimizedConnections = [];
        
        // 各親ノードの子ノードを処理
        connectionGroups.forEach((childConnections, parentId) => {
            // 子の位置でソート（左から右へ）
            const sortedConnections = childConnections.sort((a, b) => 
                a.toPos.x - b.toPos.x
            );
            
            if (sortedConnections.length === 1) {
                // 子が1つの場合は直接垂直接続
                const conn = sortedConnections[0];
                const parentCenterX = conn.fromPos.x + (conn.fromPos.width || 120) / 2;
                const childCenterX = conn.toPos.x + (conn.toPos.width || 120) / 2;
                
                // 親と子が水平に近い場合は完全垂直、そうでなければL字
                if (Math.abs(parentCenterX - childCenterX) < 10) {
                    optimizedConnections.push({
                        ...conn,
                        connectionType: 'direct-vertical',
                        pathType: 'pure-vertical'
                    });
                } else {
                    optimizedConnections.push({
                        ...conn,
                        connectionType: 'direct-vertical',
                        pathType: 'l-shaped'
                    });
                }
                
            } else if (sortedConnections.length > 1) {
                // 子が複数の場合は分岐接続
                const firstConn = sortedConnections[0];
                const lastConn = sortedConnections[sortedConnections.length - 1];
                
                // 分岐点のY座標を計算（親と子の間の中点より少し下）
                const parentBottomY = firstConn.fromPos.y + (firstConn.fromPos.height || 80);
                const childTopY = firstConn.toPos.y;
                const bridgeY = parentBottomY + (childTopY - parentBottomY) * 0.6;
                
                // 親の中心X座標
                const parentCenterX = firstConn.fromPos.x + (firstConn.fromPos.width || 120) / 2;
                
                // 1. 親から分岐点への垂直線
                optimizedConnections.push({
                    ...firstConn,
                    connectionType: 'parent-to-children',
                    bridgeY: bridgeY,
                    fromX: parentCenterX,
                    fromY: parentBottomY,
                    toX: parentCenterX,
                    toY: bridgeY
                });
                
                // 2. 水平橋渡し線（左端の子から右端の子まで）
                const leftX = firstConn.toPos.x + (firstConn.toPos.width || 120) / 2;
                const rightX = lastConn.toPos.x + (lastConn.toPos.width || 120) / 2;
                
                optimizedConnections.push({
                    connectionType: 'horizontal-bridge',
                    bridgeY: bridgeY,
                    leftX: leftX,
                    rightX: rightX,
                    from: parentId,
                    to: 'bridge'
                });
                
                // 3. 各子への垂直接続線
                sortedConnections.forEach(conn => {
                    const childCenterX = conn.toPos.x + (conn.toPos.width || 120) / 2;
                    const childTopY = conn.toPos.y;
                    
                    optimizedConnections.push({
                        ...conn,
                        connectionType: 'child-connector',
                        bridgeY: bridgeY,
                        fromX: childCenterX,
                        fromY: bridgeY,
                        toX: childCenterX,
                        toY: childTopY
                    });
                });
            }
        });
        
        this.configUtils.debugLog(`Optimized connections: ${optimizedConnections.length} (from ${validConnections.length} valid)`, 'layout');
        return optimizedConnections;
    }

    /**
     * 処理済みデータを設定
     */
    setProcessedData(processedData) {
        this.processedData = processedData;
        this.cachedLayout = null; // キャッシュをクリア
        this.configUtils.debugLog('Processed data set for layout calculation', 'layout');
    }

    /**
     * スペーシング設定を更新
     */
    updateSpacing(spacingX, spacingY) {
        this.spacingConfig.x = spacingX || this.spacingConfig.x;
        this.spacingConfig.y = spacingY || this.spacingConfig.y;
        this.cachedLayout = null; // キャッシュをクリア
        this.configUtils.debugLog(`Spacing updated: x=${this.spacingConfig.x}, y=${this.spacingConfig.y}`, 'layout');
    }

    /**
     * ポジションを再計算
     */
    recalculatePositions() {
        this.cachedLayout = null;
        this.configUtils.debugLog('Layout cache cleared for recalculation', 'layout');
    }

    /**
     * キャッシュされたレイアウトを取得
     */
    getCachedLayout() {
        return this.cachedLayout;
    }

    /**
     * 組織図の重心を計算
     */
    calculateCentroid(nodes) {
        if (nodes.length === 0) {
            return { x: 0, y: 0 };
        }
        
        let totalX = 0;
        let totalY = 0;
        
        nodes.forEach(node => {
            totalX += node.x + node.width / 2;
            totalY += node.y + node.height / 2;
        });
        
        return {
            x: totalX / nodes.length,
            y: totalY / nodes.length
        };
    }

    /**
     * ズーム用の変換行列を計算
     */
    calculateTransform(scale, centerX, centerY, containerWidth, containerHeight) {
        const translateX = containerWidth / 2 - centerX * scale;
        const translateY = containerHeight / 2 - centerY * scale;
        
        return {
            scale: scale,
            translateX: translateX,
            translateY: translateY,
            matrix: `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`
        };
    }

    /**
     * フィットツースクリーン計算
     */
    calculateFitToScreen(containerWidth, containerHeight, padding = 50) {
        if (!this.cachedLayout || this.cachedLayout.nodes.length === 0) {
            return { scale: 1, translateX: 0, translateY: 0 };
        }
        
        const bounds = this.cachedLayout.bounds;
        const availableWidth = containerWidth - (padding * 2);
        const availableHeight = containerHeight - (padding * 2);
        
        const scaleX = availableWidth / bounds.width;
        const scaleY = availableHeight / bounds.height;
        const scale = Math.min(scaleX, scaleY, 1); // 最大100%
        
        const centroid = this.calculateCentroid(this.cachedLayout.nodes);
        
        return this.calculateTransform(scale, centroid.x, centroid.y, containerWidth, containerHeight);
    }

    /**
     * レベル間の最適な間隔を計算
     */
    calculateOptimalLevelSpacing(levelGroups) {
        const baseSpacing = this.spacingConfig.y;
        const optimalSpacings = new Map();
        
        levelGroups.forEach((orgs, level) => {
            // レベル内の最大ボックス高を考慮
            let maxHeight = parseInt(this.config.DEFAULTS.BOX_SIZES.medium.height);
            
            // カスタムスペーシング計算ロジック
            const spacing = Math.max(baseSpacing, maxHeight + 40);
            optimalSpacings.set(level, spacing);
        });
        
        return optimalSpacings;
    }

    /**
     * デバッグ情報を取得
     */
    getDebugInfo() {
        return {
            spacingConfig: this.spacingConfig,
            hasProcessedData: !!this.processedData,
            hasCachedLayout: !!this.cachedLayout,
            cacheStats: this.cachedLayout ? {
                nodesCount: this.cachedLayout.nodes.length,
                connectionsCount: this.cachedLayout.connections.length,
                bounds: this.cachedLayout.bounds
            } : null
        };
    }

    /**
     * リセット
     */
    reset() {
        this.processedData = null;
        this.cachedLayout = null;
        this.configUtils.debugLog('LayoutCalculator reset', 'layout');
    }
}

// モジュールエクスポート
const LayoutCalculatorModule = {
    LayoutCalculator
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayoutCalculatorModule;
} else {
    window.LayoutCalculatorModule = LayoutCalculatorModule;
    window.LayoutCalculator = LayoutCalculator; // 後方互換性
}