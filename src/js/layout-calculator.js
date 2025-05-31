/**
 * 組織図作成ツール - レイアウト計算モジュール（修正版）
 * 組織の配置位置と接続線の計算を担当
 */

class LayoutCalculator {
    constructor(processedData) {
        this.processedData = processedData;
        this.spacing = CONFIG.LAYOUT;
    }

    /**
     * レイアウトを計算（修正版）
     * @param {Array<string>} targetOrgs - 対象組織の配列
     * @param {string|null} baseOrg - 基準組織
     * @returns {Object} レイアウト情報 { nodes, connections }
     */
    calculateLayout(targetOrgs, baseOrg = null) {
        try {
            ConfigUtils.debugLog('=== レイアウト計算開始 ===', 'layout');
            ConfigUtils.debugLog(`対象組織数: ${targetOrgs.length}`, 'layout');
            ConfigUtils.debugLog(`対象組織: [${targetOrgs.join(', ')}]`, 'layout');
            
            // データの存在確認
            if (!this.processedData || !this.processedData.organizations) {
                throw new Error('処理済みデータが存在しません');
            }
            
            // 各組織のデータ存在確認
            for (const org of targetOrgs) {
                const orgData = this.processedData.organizations.get(org);
                if (!orgData) {
                    throw new Error(`組織データが見つかりません: ${org}`);
                }
                ConfigUtils.debugLog(`${org}: parent="${orgData.parent || 'なし'}", level=${orgData.level}`, 'layout');
            }
            
            // 階層レベルを計算
            const orgLevels = this.calculateHierarchyLevels(targetOrgs, baseOrg);
            
            // 階層別にグループ化
            const levelGroups = this.groupByLevel(targetOrgs, orgLevels);
            
            // X座標を計算（ボトムアップ方式）
            const orgXPositions = this.calculateXPositions(levelGroups, targetOrgs);
            
            // ノードを生成
            const nodes = this.generateNodes(levelGroups, orgXPositions);
            
            // 接続線を生成
            const connections = this.generateConnections(nodes, targetOrgs);
            
            ConfigUtils.debugLog(`生成されたノード数: ${nodes.length}`, 'layout');
            ConfigUtils.debugLog(`生成された接続線数: ${connections.length}`, 'layout');
            
            return { nodes, connections };
            
        } catch (error) {
            ConfigUtils.debugLog(`レイアウト計算でエラー発生: ${error.message}`, 'error');
            ConfigUtils.debugLog(`エラースタック: ${error.stack}`, 'error');
            throw error;
        }
    }

    /**
     * 階層レベルを計算（修正版）
     * @param {Array<string>} targetOrgs - 対象組織
     * @param {string|null} baseOrg - 基準組織
     * @returns {Map<string, number>} 組織レベルマップ
     */
    calculateHierarchyLevels(targetOrgs, baseOrg) {
        const orgLevels = new Map();
        const visited = new Set();
        
        // ルート組織を特定
        const rootOrgs = this.findRootOrganizations(targetOrgs, baseOrg);
        ConfigUtils.debugLog(`ルート組織: ${rootOrgs.join(', ')}`, 'layout');
        
        // 階層レベルを再帰的に設定
        const setHierarchyLevel = (org, level) => {
            if (visited.has(org) || !targetOrgs.includes(org)) return;
            
            visited.add(org);
            orgLevels.set(org, level);
            
            ConfigUtils.debugLog(`${org} をレベル ${level} に設定`, 'layout');
            
            // 子組織を処理
            const children = this.processedData.hierarchy.get(org) || [];
            children.forEach(child => {
                if (targetOrgs.includes(child)) {
                    setHierarchyLevel(child, level + 1);
                }
            });
        };
        
        // ルート組織から開始
        rootOrgs.forEach(root => {
            setHierarchyLevel(root, 1);
        });
        
        // 未処理の組織があれば警告
        targetOrgs.forEach(org => {
            if (!orgLevels.has(org)) {
                ConfigUtils.debugLog(`警告: ${org} の階層レベルが未設定 - レベル1に設定`, 'layout');
                orgLevels.set(org, 1);
            }
        });
        
        return orgLevels;
    }

    /**
     * ルート組織を特定（修正版）
     * @param {Array<string>} targetOrgs - 対象組織
     * @param {string|null} baseOrg - 基準組織
     * @returns {Array<string>} ルート組織の配列
     */
    findRootOrganizations(targetOrgs, baseOrg) {
        if (baseOrg) {
            return [baseOrg];
        }
        
        const rootOrgs = targetOrgs.filter(org => {
            const orgData = this.processedData.organizations.get(org);
            if (!orgData) {
                ConfigUtils.debugLog(`警告: 組織データが見つかりません - ${org}`, 'layout');
                return false;
            }
            return !orgData.parent || !targetOrgs.includes(orgData.parent);
        });
        
        ConfigUtils.debugLog(`ルート組織特定結果: [${rootOrgs.join(', ')}]`, 'layout');
        
        if (rootOrgs.length === 0) {
            ConfigUtils.debugLog('警告: ルート組織が見つかりません。最初の組織をルートとして使用', 'layout');
            return targetOrgs.length > 0 ? [targetOrgs[0]] : [];
        }
        
        return rootOrgs;
    }

    /**
     * 階層別にグループ化
     * @param {Array<string>} targetOrgs - 対象組織
     * @param {Map<string, number>} orgLevels - 組織レベルマップ
     * @returns {Map<number, Array<string>>} レベル別グループ
     */
    groupByLevel(targetOrgs, orgLevels) {
        const levelGroups = new Map();
        
        targetOrgs.forEach(org => {
            const level = orgLevels.get(org);
            if (!levelGroups.has(level)) {
                levelGroups.set(level, []);
            }
            levelGroups.get(level).push(org);
        });
        
        ConfigUtils.debugLog('階層グループ作成:', 'layout');
        levelGroups.forEach((orgs, level) => {
            ConfigUtils.debugLog(`  レベル${level}: [${orgs.join(', ')}]`, 'layout');
        });
        
        return levelGroups;
    }

    /**
     * X座標を計算（修正版：親子グループ化対応）
     * @param {Map<number, Array<string>>} levelGroups - レベル別グループ
     * @param {Array<string>} targetOrgs - 対象組織
     * @returns {Map<string, number>} 組織のX座標マップ
     */
    calculateXPositions(levelGroups, targetOrgs) {
        const orgXPositions = new Map();
        const maxLevel = Math.max(...levelGroups.keys());
        
        ConfigUtils.debugLog('\n=== X座標計算（親子グループ化方式）===', 'layout');
        
        // 最下層から上位層へ向けて処理
        for (let currentLevel = maxLevel; currentLevel >= 1; currentLevel--) {
            if (!levelGroups.has(currentLevel)) continue;
            
            const orgsAtLevel = levelGroups.get(currentLevel);
            ConfigUtils.debugLog(`\n--- レベル ${currentLevel} の処理 ---`, 'layout');
            ConfigUtils.debugLog(`対象組織: [${orgsAtLevel.join(', ')}]`, 'layout');
            
            if (currentLevel === maxLevel) {
                // 最下層: 親組織別にグループ化して配置
                this.positionBottomLevelByParent(orgsAtLevel, orgXPositions, targetOrgs);
            } else {
                // 上位層: 子組織の中央に配置
                this.positionUpperLevel(orgsAtLevel, orgXPositions, targetOrgs);
            }
        }
        
        this.logFinalPositions(orgXPositions);
        return orgXPositions;
    }

    /**
     * 最下層の組織を親別にグループ化して配置
     * @param {Array<string>} orgs - 最下層の組織
     * @param {Map<string, number>} orgXPositions - X座標マップ
     * @param {Array<string>} targetOrgs - 対象組織
     */
    positionBottomLevelByParent(orgs, orgXPositions, targetOrgs) {
        // 親組織別にグループ化
        const parentGroups = new Map();
        
        orgs.forEach(org => {
            const orgData = this.processedData.organizations.get(org);
            const parent = orgData.parent || 'root';
            
            if (!parentGroups.has(parent)) {
                parentGroups.set(parent, []);
            }
            parentGroups.get(parent).push(org);
        });
        
        ConfigUtils.debugLog('親組織別グループ化:', 'layout');
        parentGroups.forEach((children, parent) => {
            ConfigUtils.debugLog(`  ${parent}: [${children.join(', ')}]`, 'layout');
        });
        
        let currentX = this.spacing.MARGIN;
        
        // 親組織をアルファベット順でソート
        const sortedParents = Array.from(parentGroups.keys()).sort();
        
        sortedParents.forEach(parent => {
            const childrenInGroup = parentGroups.get(parent);
            
            // 各親グループ内で子組織をアルファベット順でソート
            childrenInGroup.sort();
            
            ConfigUtils.debugLog(`\n${parent}グループの配置:`, 'layout');
            
            childrenInGroup.forEach(org => {
                orgXPositions.set(org, currentX);
                ConfigUtils.debugLog(`  ${org} → X=${currentX}`, 'layout');
                currentX += this.spacing.HORIZONTAL_SPACING;
            });
            
            // 親グループ間に追加スペースを設ける
            if (childrenInGroup.length > 0) {
                currentX += this.spacing.HORIZONTAL_SPACING * 0.3;
            }
        });
    }

    /**
     * 上位層の組織を配置
     * @param {Array<string>} orgs - 上位層の組織
     * @param {Map<string, number>} orgXPositions - X座標マップ
     * @param {Array<string>} targetOrgs - 対象組織
     */
    positionUpperLevel(orgs, orgXPositions, targetOrgs) {
        ConfigUtils.debugLog(`\n=== 上位層配置: [${orgs.join(', ')}] ===`, 'layout');
        
        // 親組織を子組織の数でソート（子が多い順）
        const orgsWithChildCount = orgs.map(org => {
            const children = this.processedData.hierarchy.get(org) || [];
            const validChildren = children.filter(child => 
                targetOrgs.includes(child) && orgXPositions.has(child)
            );
            
            return { org, childCount: validChildren.length, children: validChildren };
        });
        
        // 子組織を持つ組織を優先処理
        orgsWithChildCount.sort((a, b) => b.childCount - a.childCount);
        
        orgsWithChildCount.forEach(({ org, children }) => {
            ConfigUtils.debugLog(`${org} の子組織: [${children.join(', ')}]`, 'layout');
            
            if (children.length === 0) {
                // 子組織がない場合の配置
                this.positionOrganizationWithoutChildren(org, orgXPositions);
            } else {
                // 子組織がある場合の中央配置
                this.positionOrganizationAtCenter(org, children, orgXPositions);
            }
        });
    }

    /**
     * 子組織がない組織を配置
     * @param {string} org - 組織名
     * @param {Map<string, number>} orgXPositions - X座標マップ
     */
    positionOrganizationWithoutChildren(org, orgXPositions) {
        const existingPositions = Array.from(orgXPositions.values()).sort((a, b) => a - b);
        
        // 既存の配置に重複しない位置を探す
        let nextX = this.spacing.MARGIN;
        for (const existingX of existingPositions) {
            if (Math.abs(nextX - existingX) < this.spacing.HORIZONTAL_SPACING) {
                nextX = existingX + this.spacing.HORIZONTAL_SPACING;
            }
        }
        
        // 最後の位置の次に配置
        if (existingPositions.length > 0) {
            nextX = Math.max(nextX, existingPositions[existingPositions.length - 1] + this.spacing.HORIZONTAL_SPACING);
        }
        
        orgXPositions.set(org, nextX);
        ConfigUtils.debugLog(`${org} を子なしとして X=${nextX} に配置`, 'layout');
    }

    /**
     * 子組織の中央に親組織を配置
     * @param {string} org - 親組織名
     * @param {Array<string>} children - 子組織の配列
     * @param {Map<string, number>} orgXPositions - X座標マップ
     */
    positionOrganizationAtCenter(org, children, orgXPositions) {
        const childPositions = children.map(child => orgXPositions.get(child));
        const minX = Math.min(...childPositions);
        const maxX = Math.max(...childPositions);
        const centerX = (minX + maxX) / 2;
        
        orgXPositions.set(org, centerX);
        
        ConfigUtils.debugLog(`${org} → X=${centerX} (${minX} + ${maxX})/2`, 'layout');
        ConfigUtils.debugLog(`  子組織: [${children.join(', ')}] at [${childPositions.join(', ')}]`, 'layout');
    }

    /**
     * 最終位置をログ出力
     * @param {Map<string, number>} orgXPositions - X座標マップ
     */
    logFinalPositions(orgXPositions) {
        if (!CONFIG.DEBUG.LOG_LAYOUT_CALCULATION) return;
        
        console.log('\n=== 最終X座標（親子関係別）===');
        
        // 親子関係を含めて表示
        const positionsByParent = new Map();
        
        orgXPositions.forEach((x, org) => {
            const orgData = this.processedData.organizations.get(org);
            const parent = orgData.parent || 'root';
            
            if (!positionsByParent.has(parent)) {
                positionsByParent.set(parent, []);
            }
            positionsByParent.get(parent).push({ org, x });
        });
        
        // 親組織別に表示
        positionsByParent.forEach((children, parent) => {
            children.sort((a, b) => a.x - b.x);
            console.log(`\n${parent}の子組織:`);
            children.forEach(({ org, x }) => {
                console.log(`  ${org}: X=${x}`);
            });
        });
    }

    /**
     * ノードを生成
     * @param {Map<number, Array<string>>} levelGroups - レベル別グループ
     * @param {Map<string, number>} orgXPositions - X座標マップ
     * @returns {Array<Object>} ノードの配列
     */
    generateNodes(levelGroups, orgXPositions) {
        const nodes = [];
        const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
        
        sortedLevels.forEach((level, levelIndex) => {
            const orgsAtLevel = levelGroups.get(level);
            const y = levelIndex * this.spacing.VERTICAL_SPACING + this.spacing.MARGIN;
            
            orgsAtLevel.forEach(org => {
                const x = orgXPositions.get(org);
                if (x !== undefined) {
                    nodes.push({
                        org: org,
                        x: x - CONFIG.DEFAULTS.BOX_SIZE.width / 2, // 中央揃えのためオフセット
                        y: y,
                        level: level
                    });
                    
                    ConfigUtils.debugLog(`最終配置: ${org} at (${x - CONFIG.DEFAULTS.BOX_SIZE.width / 2}, ${y})`, 'layout');
                }
            });
        });
        
        return nodes;
    }

    /**
     * 接続線を生成
     * @param {Array<Object>} nodes - ノードの配列
     * @param {Array<string>} targetOrgs - 対象組織
     * @returns {Array<Object>} 接続線の配列
     */
    generateConnections(nodes, targetOrgs) {
        const connections = [];
        
        ConfigUtils.debugLog('\n=== 接続線生成開始 ===', 'layout');
        
        nodes.forEach((node, index) => {
            const orgData = this.processedData.organizations.get(node.org);
            
            if (!orgData) {
                ConfigUtils.debugLog(`警告: ノード${index}の組織データが見つかりません - ${node.org}`, 'layout');
                return;
            }
            
            ConfigUtils.debugLog(`ノード ${node.org}: parent="${orgData.parent || 'なし'}"`, 'layout');
            
            if (orgData.parent && targetOrgs.includes(orgData.parent)) {
                const parentNode = nodes.find(n => n.org === orgData.parent);
                if (parentNode) {
                    connections.push({
                        from: parentNode,
                        to: node
                    });
                    ConfigUtils.debugLog(`接続線作成: ${orgData.parent} → ${node.org}`, 'layout');
                } else {
                    ConfigUtils.debugLog(`警告: 親ノードが見つかりません - ${orgData.parent}`, 'layout');
                }
            }
        });
        
        ConfigUtils.debugLog(`接続線生成完了: ${connections.length}本`, 'layout');
        return connections;
    }

    /**
     * 境界を計算
     * @param {Array<Object>} nodes - ノードの配列
     * @returns {Object} 境界情報 { maxX, maxY }
     */
    calculateBounds(nodes) {
        let maxX = 0, maxY = 0;
        
        nodes.forEach(node => {
            maxX = Math.max(maxX, node.x + CONFIG.DEFAULTS.BOX_SIZE.width);
            maxY = Math.max(maxY, node.y + CONFIG.DEFAULTS.BOX_SIZE.height);
        });
        
        return { 
            maxX: maxX + this.spacing.MARGIN, 
            maxY: maxY + this.spacing.MARGIN 
        };
    }
}

// グローバルに公開
window.LayoutCalculator = LayoutCalculator;