/**
 * Organization Chart Tool - Layout Calculator Module (v4)
 * レイアウト計算・配置機能
 */

class LayoutCalculator {
    constructor() {
        this.processedData = null;
        this.cachedLayout = null;
        
        // CONFIG変数の安全な参照
        const config = (typeof CONFIG !== 'undefined' ? CONFIG : null) || 
                      (typeof window !== 'undefined' && window.CONFIG) ||
                      (typeof window !== 'undefined' && window.ConfigModule && window.ConfigModule.CONFIG) ||
                      {};
        
        this.spacingConfig = {
            x: (config.LAYOUT && config.LAYOUT.HORIZONTAL_SPACING) || 24,
            y: (config.LAYOUT && config.LAYOUT.VERTICAL_SPACING) || 100,
            margin: (config.LAYOUT && config.LAYOUT.MARGIN) || 50
        };
        
        // ConfigUtilsの安全な参照
        const configUtils = (typeof ConfigUtils !== 'undefined' ? ConfigUtils : null) ||
                           (typeof window !== 'undefined' && window.ConfigUtils) ||
                           (typeof window !== 'undefined' && window.ConfigModule && window.ConfigModule.ConfigUtils) ||
                           { debugLog: () => {} };
        
        configUtils.debugLog('LayoutCalculator initialized', 'layout');
    }

    /**
     * レイアウトを計算
     */
    calculateLayout(organizations, baseOrg = null, options = {}) {
        try {
            ConfigUtils.debugLog(`Calculating layout for ${organizations.length} organizations`, 'layout');
            
            if (!organizations || !Array.isArray(organizations) || organizations.length === 0) {
                throw new Error('Organizations array is empty or invalid');
            }
            
            const {
                hideManagers = false,
                fontSize = 'medium',
                boxSize = 'medium'
            } = options;
            
            // ボックスサイズ設定を取得
            const boxConfig = (CONFIG.DEFAULTS && CONFIG.DEFAULTS.BOX_SIZES && CONFIG.DEFAULTS.BOX_SIZES[boxSize]) || 
                              (CONFIG.DEFAULTS && CONFIG.DEFAULTS.BOX_SIZES && CONFIG.DEFAULTS.BOX_SIZES.medium) || 
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
            ConfigUtils.debugLog(`Grouped into ${levelGroups.size} levels`, 'layout');
            
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
            
            ConfigUtils.debugLog(`Layout calculated: ${layout.nodes.length} nodes, ${layout.connections.length} connections`, 'layout');
            return layout;
            
        } catch (error) {
            ConfigUtils.debugLog(`Layout calculation error: ${error.message}`, 'error');
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
                    ConfigUtils.debugLog(`Invalid organization data: ${JSON.stringify(org)}`, 'layout');
                }
            } catch (error) {
                ConfigUtils.debugLog(`Error processing organization: ${error.message}`, 'error');
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
        const boxWidth = parseInt((CONFIG.DEFAULTS && CONFIG.DEFAULTS.BOX_SIZES && CONFIG.DEFAULTS.BOX_SIZES.medium && CONFIG.DEFAULTS.BOX_SIZES.medium.width) || 120);
        const boxHeight = parseInt((CONFIG.DEFAULTS && CONFIG.DEFAULTS.BOX_SIZES && CONFIG.DEFAULTS.BOX_SIZES.medium && CONFIG.DEFAULTS.BOX_SIZES.medium.height) || 80);
        
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
            ConfigUtils.debugLog(`Parent ${parent}: children placed from ${groupStartX} to ${groupEndX} (${children.length} children)`, 'layout');
            
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
        ConfigUtils.debugLog('=== Adjusting parent positions (bottom-up) ===', 'layout');
        
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
                        // 子の範囲を計算
                        const leftmostChild = childNodes.reduce((min, child) => 
                            child.x < min.x ? child : min
                        );
                        const rightmostChild = childNodes.reduce((max, child) => 
                            child.x > max.x ? child : max
                        );
                        
                        // 親を子の中央に配置
                        const childrenCenterX = (leftmostChild.x + rightmostChild.x + rightmostChild.width) / 2;
                        const newX = childrenCenterX - (node.width / 2);
                        
                        ConfigUtils.debugLog(`Adjusting parent ${node.data.teamName}: ${node.x} -> ${newX} (children: ${children.join(', ')})`, 'layout');
                        node.x = newX;
                    }
                }
            });
            
            // 同レベル内で重複解決
            this.resolveOverlapsWithGrouping(levelLayout.nodes, childrenMap);
        }
    }
    
    /**
     * グループを考慮した重複解決
     */
    resolveOverlapsWithGrouping(nodes, childrenMap) {
        if (nodes.length <= 1) return;
        
        // 親子グループを作成（親と関連する子ノードを一緒に管理）
        const parentGroups = new Map();
        const orphanNodes = [];
        
        // 各ノードを親子関係で分類
        nodes.forEach(node => {
            const children = childrenMap.get(node.data.teamName);
            if (children && children.length > 0) {
                // このノードは親
                parentGroups.set(node.data.teamName, {
                    parent: node,
                    children: [],
                    leftMost: node.x,
                    rightMost: node.x + node.width
                });
            } else {
                // 子ノードまたは孤立ノード
                const parentName = node.data.upperTeam;
                if (parentName && parentGroups.has(parentName)) {
                    // 親が見つかった場合
                    const group = parentGroups.get(parentName);
                    group.children.push(node);
                    group.leftMost = Math.min(group.leftMost, node.x);
                    group.rightMost = Math.max(group.rightMost, node.x + node.width);
                } else {
                    // 親が見つからない（孤立ノード）
                    orphanNodes.push(node);
                }
            }
        });
        
        // グループを左から右にソート
        const sortedGroups = Array.from(parentGroups.values())
            .sort((a, b) => a.leftMost - b.leftMost);
        
        // 孤立ノードもソート
        orphanNodes.sort((a, b) => a.x - b.x);
        
        // グループ間の最小間隔をさらに削減
        const groupSpacing = 32;
        let currentX = 20; // 左端から小さなマージン
        
        // 孤立ノードを最初に配置
        orphanNodes.forEach(node => {
            if (node.x < currentX) {
                const adjustment = currentX - node.x;
                ConfigUtils.debugLog(`Moving orphan node ${node.data.teamName}: ${node.x} -> ${currentX}`, 'layout');
                node.x = currentX;
            }
            currentX = node.x + node.width + groupSpacing;
        });
        
        // 各グループを配置
        sortedGroups.forEach(group => {
            // グループ全体の幅を計算
            const groupWidth = group.rightMost - group.leftMost;
            
            // グループの開始位置を調整
            if (group.leftMost < currentX) {
                const adjustment = currentX - group.leftMost;
                ConfigUtils.debugLog(`Moving group for parent ${group.parent.data.teamName}: adjustment ${adjustment}px`, 'layout');
                
                // 親ノードを移動
                group.parent.x += adjustment;
                
                // 子ノードを移動
                group.children.forEach(child => {
                    child.x += adjustment;
                });
                
                group.leftMost += adjustment;
                group.rightMost += adjustment;
            }
            
            currentX = group.rightMost + groupSpacing;
        });
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
                ConfigUtils.debugLog(`Resolving overlap: moving ${currentNode.data.teamName} right by ${adjustment}px`, 'layout');
                
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
        
        ConfigUtils.debugLog('=== Connection Calculation Started ===', 'layout');
        
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
                        ConfigUtils.debugLog(`Connection: ${parentOrg.teamName} -> ${orgData.teamName}`, 'layout');
                    }
                } else {
                    ConfigUtils.debugLog(`Parent not found for ${orgData.teamName}, looking for: ${orgData.upperTeam}`, 'layout');
                }
            } else if (orgData && !orgData.upperTeam) {
                ConfigUtils.debugLog(`Root organization: ${orgData.teamName}`, 'layout');
            }
        });
        
        ConfigUtils.debugLog(`Total connections created: ${connections.length}`, 'layout');
        
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
            ConfigUtils.debugLog(`Connection creation error: ${error.message}`, 'error');
            return null;
        }
    }

    /**
     * 2つの組織間の接続線を作成
     */
    createConnection(parentOrg, childOrg, levelPositions) {
        // 親ノードを探す
        const parentNode = this.findNodeInLevels(parentOrg, levelPositions);
        const childNode = this.findNodeInLevels(childOrg, levelPositions);
        
        if (!parentNode || !childNode) {
            return null;
        }
        
        // 接続点を計算
        const parentCenterX = parentNode.x + parentNode.width / 2;
        const parentBottomY = parentNode.y + parentNode.height;
        
        const childCenterX = childNode.x + childNode.width / 2;
        const childTopY = childNode.y;
        
        // 垂直線と水平線の組み合わせ
        const midY = parentBottomY + (childTopY - parentBottomY) / 2;
        
        return {
            id: `${parentOrg}-${childOrg}`,
            type: 'hierarchy',
            points: [
                { x: parentCenterX, y: parentBottomY },
                { x: parentCenterX, y: midY },
                { x: childCenterX, y: midY },
                { x: childCenterX, y: childTopY }
            ],
            parent: parentOrg,
            child: childOrg
        };
    }

    /**
     * レベル内でノードを検索
     */
    findNodeInLevels(orgName, levelPositions) {
        for (const [level, levelLayout] of levelPositions) {
            const node = levelLayout.nodes.find(n => n.id === orgName);
            if (node) {
                return node;
            }
        }
        return null;
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
     * 処理済みデータを設定
     */
    setProcessedData(processedData) {
        this.processedData = processedData;
        this.cachedLayout = null; // キャッシュをクリア
        ConfigUtils.debugLog('Processed data set for layout calculation', 'layout');
    }

    /**
     * スペーシング設定を更新
     */
    updateSpacing(spacingX, spacingY) {
        this.spacingConfig.x = spacingX || this.spacingConfig.x;
        this.spacingConfig.y = spacingY || this.spacingConfig.y;
        this.cachedLayout = null; // キャッシュをクリア
        ConfigUtils.debugLog(`Spacing updated: x=${this.spacingConfig.x}, y=${this.spacingConfig.y}`, 'layout');
    }

    /**
     * ポジションを再計算
     */
    recalculatePositions() {
        this.cachedLayout = null;
        ConfigUtils.debugLog('Layout cache cleared for recalculation', 'layout');
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
        
        ConfigUtils.debugLog(`Optimized connections: ${optimizedConnections.length} (from ${validConnections.length} valid)`, 'layout');
        return optimizedConnections;
    }

    /**
     * 接続線の衝突検出と回避
     */
    optimizeConnections(connections, nodes) {
        // 簡単な衝突回避アルゴリズム
        const optimizedConnections = [...connections];
        
        // 交差している線を検出して調整
        for (let i = 0; i < optimizedConnections.length; i++) {
            for (let j = i + 1; j < optimizedConnections.length; j++) {
                const conn1 = optimizedConnections[i];
                const conn2 = optimizedConnections[j];
                
                if (this.connectionsIntersect(conn1, conn2)) {
                    // 交差している場合の調整ロジック
                    this.adjustConnectionPath(conn1, conn2);
                }
            }
        }
        
        return optimizedConnections;
    }

    /**
     * 2つの接続線が交差しているかチェック
     */
    connectionsIntersect(conn1, conn2) {
        // 簡単な交差判定（実装を簡略化）
        return false; // 現時点では無効
    }

    /**
     * 接続線パスを調整
     */
    adjustConnectionPath(conn1, conn2) {
        // 接続線の経路調整ロジック（実装を簡略化）
        ConfigUtils.debugLog('Connection path adjustment requested', 'layout');
    }

    /**
     * レベル間の最適な間隔を計算
     */
    calculateOptimalLevelSpacing(levelGroups) {
        const baseSpacing = this.spacingConfig.y;
        const optimalSpacings = new Map();
        
        levelGroups.forEach((orgs, level) => {
            // レベル内の最大ボックス高を考慮
            let maxHeight = parseInt(CONFIG.DEFAULTS.BOX_SIZES.medium.height);
            
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
        ConfigUtils.debugLog('LayoutCalculator reset', 'layout');
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