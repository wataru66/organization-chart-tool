/**
 * 組織図作成ツール - レイアウト計算モジュール（修正版）
 * 組織の配置位置と接続線の計算を担当
 */

class LayoutCalculator {
    constructor(processedData) {
        this.processedData = processedData;
        this.spacing = CONFIG.LAYOUT;
        // デフォルト値を設定
        this.boxWidth = CONFIG.DEFAULTS.BOX_SIZE.width;
        this.boxHeight = CONFIG.DEFAULTS.BOX_SIZE.height;
        this.spacingX = CONFIG.DEFAULTS.SPACING.x;
        this.spacingY = CONFIG.DEFAULTS.SPACING.y;
    }
    
    /**
     * CSS変数から現在の寸法を取得
     */
    updateDimensionsFromCSS() {
        const root = document.documentElement;
        const computed = getComputedStyle(root);
        
        // CSS変数から値を取得（pxを除去して数値に変換）
        const boxWidthStr = computed.getPropertyValue('--org-box-width').trim();
        const boxHeightStr = computed.getPropertyValue('--org-box-height').trim();
        const spacingXStr = computed.getPropertyValue('--org-spacing-x').trim();
        const spacingYStr = computed.getPropertyValue('--org-spacing-y').trim();
        
        if (boxWidthStr) {
            this.boxWidth = parseInt(boxWidthStr.replace('px', ''));
        }
        if (boxHeightStr) {
            this.boxHeight = parseInt(boxHeightStr.replace('px', ''));
        }
        if (spacingXStr) {
            this.spacingX = parseInt(spacingXStr.replace('px', ''));
        }
        if (spacingYStr) {
            this.spacingY = parseInt(spacingYStr.replace('px', ''));
        }
        
        // HORIZONTAL_SPACINGとVERTICAL_SPACINGも更新
        this.spacing.HORIZONTAL_SPACING = this.spacingX;
        this.spacing.VERTICAL_SPACING = this.spacingY;
        
        ConfigUtils.debugLog(`CSS変数から寸法を取得:`, 'layout');
        ConfigUtils.debugLog(`  ボックス幅: ${this.boxWidth}px`, 'layout');
        ConfigUtils.debugLog(`  ボックス高さ: ${this.boxHeight}px`, 'layout');
        ConfigUtils.debugLog(`  横間隔: ${this.spacingX}px`, 'layout');
        ConfigUtils.debugLog(`  縦間隔: ${this.spacingY}px`, 'layout');
    }

    /**
     * レイアウトを計算（Hide Managers対応版）
     * @param {Array<string>} targetOrgs - 対象組織の配列
     * @param {string|null} baseOrg - 基準組織
     * @param {Object} options - レイアウトオプション
     * @returns {Object} レイアウト情報 { nodes, connections }
     */
    calculateLayout(targetOrgs, baseOrg = null, options = {}) {
        try {
            ConfigUtils.debugLog('=== レイアウト計算開始 ===', 'layout');
            ConfigUtils.debugLog(`対象組織数: ${targetOrgs.length}`, 'layout');
            ConfigUtils.debugLog(`対象組織: [${targetOrgs.join(', ')}]`, 'layout');
            ConfigUtils.debugLog(`オプション: ${JSON.stringify(options)}`, 'layout');
            
            // レイアウトオプションを保存
            this.layoutOptions = options;
            
            // 現在のCSS変数から寸法を取得
            this.updateDimensionsFromCSS();
            
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
     * 階層レベルを計算（階層ギャップ対応版）
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
        
        // 階層レベルを再帰的に設定（ギャップ検出・修正付き）
        const setHierarchyLevel = (org, level, parentLevel = 0) => {
            if (visited.has(org) || !targetOrgs.includes(org)) return;
            
            visited.add(org);
            
            // データ上のレベルを優先して使用
            const orgData = this.processedData.organizations.get(org);
            const actualLevel = orgData ? orgData.level : level;
            
            // データのレベルを優先し、親子関係の整合性をチェック
            let adjustedLevel = actualLevel;
            if (parentLevel > 0 && actualLevel <= parentLevel) {
                // 親より同じかより小さいレベルの場合は、親+1に調整
                adjustedLevel = parentLevel + 1;
                ConfigUtils.debugLog(`レベル整合性調整: ${org} データレベル${actualLevel} → 調整レベル${adjustedLevel} (親: ${parentLevel})`, 'layout');
            } else {
                ConfigUtils.debugLog(`${org} データレベル${actualLevel}を使用`, 'layout');
            }
            
            orgLevels.set(org, adjustedLevel);
            ConfigUtils.debugLog(`${org} をレベル ${adjustedLevel} に設定 (元データ: ${actualLevel}, 計算: ${level})`, 'layout');
            
            // 子組織を処理
            const children = this.processedData.hierarchy.get(org) || [];
            const sortedChildren = children.filter(child => targetOrgs.includes(child));
            
            // 子組織を階層レベル順にソート
            sortedChildren.sort((a, b) => {
                const aData = this.processedData.organizations.get(a);
                const bData = this.processedData.organizations.get(b);
                const aLevel = aData ? aData.level : 999;
                const bLevel = bData ? bData.level : 999;
                return aLevel - bLevel;
            });
            
            sortedChildren.forEach(child => {
                setHierarchyLevel(child, adjustedLevel + 1, adjustedLevel);
            });
        };
        
        // ルート組織から開始
        rootOrgs.forEach(root => {
            setHierarchyLevel(root, 1, 0);
        });
        
        // 階層レベルの最適化（連続性確保）
        this.optimizeHierarchyLevels(orgLevels, targetOrgs);
        
        // 未処理の組織があれば適切なレベルを設定
        targetOrgs.forEach(org => {
            if (!orgLevels.has(org)) {
                const appropriateLevel = this.findAppropriateLevel(org, orgLevels, targetOrgs);
                orgLevels.set(org, appropriateLevel);
                ConfigUtils.debugLog(`未設定組織 ${org} をレベル ${appropriateLevel} に配置`, 'layout');
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
     * 階層レベルを最適化（連続性確保）
     * @param {Map<string, number>} orgLevels - 組織レベルマップ
     * @param {Array<string>} targetOrgs - 対象組織
     */
    optimizeHierarchyLevels(orgLevels, targetOrgs) {
        ConfigUtils.debugLog('階層レベル最適化開始', 'layout');
        
        // 使用されているレベルを取得
        const usedLevels = new Set(orgLevels.values());
        const sortedLevels = Array.from(usedLevels).sort((a, b) => a - b);
        
        ConfigUtils.debugLog(`使用中のレベル: [${sortedLevels.join(', ')}]`, 'layout');
        
        // レベルの連続性をチェック
        const gaps = [];
        for (let i = 1; i < sortedLevels.length; i++) {
            const current = sortedLevels[i];
            const previous = sortedLevels[i - 1];
            if (current - previous > 1) {
                gaps.push({ start: previous, end: current, gap: current - previous - 1 });
            }
        }
        
        if (gaps.length > 0) {
            ConfigUtils.debugLog(`階層ギャップ検出: ${gaps.length}箇所`, 'layout');
            gaps.forEach(gap => {
                ConfigUtils.debugLog(`  レベル${gap.start} → ${gap.end} (ギャップ: ${gap.gap})`, 'layout');
            });
            
            // ギャップを詰める調整（上位レベルを下げる）
            let adjustment = 0;
            for (const level of sortedLevels) {
                if (level > 1) {
                    const expectedLevel = level - adjustment;
                    const actualGap = level - (sortedLevels[sortedLevels.indexOf(level) - 1] || 0);
                    if (actualGap > 1) {
                        adjustment += actualGap - 1;
                    }
                    
                    if (adjustment > 0) {
                        // このレベルのすべての組織を調整
                        orgLevels.forEach((orgLevel, org) => {
                            if (orgLevel === level) {
                                orgLevels.set(org, level - adjustment);
                                ConfigUtils.debugLog(`ギャップ調整: ${org} レベル${level} → ${level - adjustment}`, 'layout');
                            }
                        });
                    }
                }
            }
        }
    }

    /**
     * 適切なレベルを見つける
     * @param {string} org - 組織名
     * @param {Map<string, number>} orgLevels - 既存の組織レベルマップ
     * @param {Array<string>} targetOrgs - 対象組織
     * @returns {number} 適切なレベル
     */
    findAppropriateLevel(org, orgLevels, targetOrgs) {
        const orgData = this.processedData.organizations.get(org);
        
        // データのレベルがあればそれを使用
        if (orgData && orgData.level) {
            return orgData.level;
        }
        
        // 親組織のレベルから推定
        if (orgData && orgData.parent && targetOrgs.includes(orgData.parent)) {
            const parentLevel = orgLevels.get(orgData.parent);
            if (parentLevel !== undefined) {
                return parentLevel + 1;
            }
        }
        
        // 子組織のレベルから推定
        const children = this.processedData.hierarchy.get(org) || [];
        const validChildren = children.filter(child => 
            targetOrgs.includes(child) && orgLevels.has(child)
        );
        
        if (validChildren.length > 0) {
            const childLevels = validChildren.map(child => orgLevels.get(child));
            const minChildLevel = Math.min(...childLevels);
            return Math.max(1, minChildLevel - 1);
        }
        
        // 最終手段として最大レベル+1
        const maxLevel = Math.max(...orgLevels.values(), 0);
        return maxLevel + 1;
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
     * X座標を計算（深さ優先ツリーレイアウト）
     * @param {Map<number, Array<string>>} levelGroups - レベル別グループ
     * @param {Array<string>} targetOrgs - 対象組織
     * @returns {Map<string, number>} 組織のX座標マップ
     */
    calculateXPositions(levelGroups, targetOrgs) {
        const orgXPositions = new Map();
        
        ConfigUtils.debugLog('\n=== X座標計算（深さ優先ツリーレイアウト）===', 'layout');
        
        // ルート組織を見つける
        const roots = this.findRootOrganizations(targetOrgs, null);
        ConfigUtils.debugLog(`ルート組織: [${roots.join(', ')}]`, 'layout');
        
        // 間隔設定
        const nodeSpacing = Math.floor(this.spacing.HORIZONTAL_SPACING * 1.5);
        const subtreeSpacing = nodeSpacing * 0.5; // サブツリー間の追加間隔
        
        let currentX = this.spacing.MARGIN;
        
        // 各ルートから深さ優先でレイアウト
        roots.forEach((root, rootIndex) => {
            ConfigUtils.debugLog(`\n--- ルート ${rootIndex + 1}: ${root} のレイアウト ---`, 'layout');
            
            // このルートのサブツリーをレイアウト
            const subtreeWidth = this.layoutSubtree(
                root, 
                currentX, 
                orgXPositions, 
                targetOrgs, 
                nodeSpacing
            );
            
            ConfigUtils.debugLog(`${root} サブツリー幅: ${subtreeWidth}px`, 'layout');
            
            // 次のルートの開始位置
            currentX += subtreeWidth + subtreeSpacing;
        });
        
        this.logFinalPositions(orgXPositions);
        return orgXPositions;
    }
    
    /**
     * サブツリーをレイアウト（深さ優先）
     * @param {string} node - ノード
     * @param {number} startX - 開始X座標
     * @param {Map<string, number>} orgXPositions - X座標マップ
     * @param {Array<string>} targetOrgs - 対象組織
     * @param {number} nodeSpacing - ノード間隔
     * @returns {number} サブツリーの幅
     */
    layoutSubtree(node, startX, orgXPositions, targetOrgs, nodeSpacing) {
        // この組織の子を取得
        const children = (this.processedData.hierarchy.get(node) || [])
            .filter(child => targetOrgs.includes(child))
            .sort((a, b) => this.getDataOrder(a) - this.getDataOrder(b));
        
        if (children.length === 0) {
            // 葉ノード：単純に配置
            orgXPositions.set(node, startX + nodeSpacing / 2);
            ConfigUtils.debugLog(`葉ノード ${node} → X=${startX + nodeSpacing / 2}`, 'layout');
            return nodeSpacing;
        }
        
        // 子サブツリーをレイアウト
        let childrenStartX = startX;
        const childrenWidths = [];
        const childrenCenters = [];
        
        children.forEach((child, index) => {
            const childWidth = this.layoutSubtree(
                child, 
                childrenStartX, 
                orgXPositions, 
                targetOrgs, 
                nodeSpacing
            );
            
            childrenWidths.push(childWidth);
            childrenCenters.push(orgXPositions.get(child));
            childrenStartX += childWidth;
        });
        
        // このノードを子の中央に配置
        const firstChildCenter = childrenCenters[0];
        const lastChildCenter = childrenCenters[childrenCenters.length - 1];
        const nodeX = (firstChildCenter + lastChildCenter) / 2;
        
        orgXPositions.set(node, nodeX);
        ConfigUtils.debugLog(`親ノード ${node} → X=${nodeX} (子の中央)`, 'layout');
        
        // サブツリー全体の幅を返す
        const totalWidth = childrenWidths.reduce((sum, width) => sum + width, 0);
        return totalWidth;
    }
    



    /**
     * 元データでの順序を取得
     * @param {string} org - 組織名
     * @returns {number} データ内での順序（見つからない場合は999）
     */
    getDataOrder(org) {
        if (!this.processedData || !this.processedData.dataOrder) {
            return 999;
        }
        
        const order = this.processedData.dataOrder.get(org);
        return order !== undefined ? order : 999;
    }

    /**
     * 組織が指定された祖先の子孫かどうかを判定
     * @param {string} org - 組織名
     * @param {string} ancestor - 祖先組織名
     * @param {Array<string>} targetOrgs - 対象組織
     * @returns {boolean} 子孫かどうか
     */
    isDescendantOf(org, ancestor, targetOrgs) {
        let current = org;
        const visited = new Set();
        
        while (current && current !== ancestor && !visited.has(current)) {
            visited.add(current);
            const orgData = this.processedData.organizations.get(current);
            if (!orgData || !orgData.parent) {
                break;
            }
            current = orgData.parent;
            if (current === ancestor) {
                return true;
            }
        }
        return false;
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
     * ノードを生成（Hide Managers対応版）
     * @param {Map<number, Array<string>>} levelGroups - レベル別グループ
     * @param {Map<string, number>} orgXPositions - X座標マップ
     * @returns {Array<Object>} ノードの配列
     */
    generateNodes(levelGroups, orgXPositions) {
        const nodes = [];
        const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
        
        // Hide Managersモードの場合は縦間隔を調整（0.6倍に拡大）
        const hideManagers = this.layoutOptions?.hideManagers || false;
        const verticalSpacing = hideManagers ? Math.floor(this.spacingY * 0.6) : this.spacingY;
        const boxHeight = hideManagers ? 35 : this.boxHeight;
        
        ConfigUtils.debugLog(`垂直スペーシング: ${verticalSpacing}px (Hide Managers: ${hideManagers})`, 'layout');
        ConfigUtils.debugLog(`ボックス高さ: ${boxHeight}px`, 'layout');
        
        sortedLevels.forEach((level, levelIndex) => {
            const orgsAtLevel = levelGroups.get(level);
            const y = levelIndex * verticalSpacing + this.spacing.MARGIN;
            
            orgsAtLevel.forEach(org => {
                const x = orgXPositions.get(org);
                if (x !== undefined) {
                    nodes.push({
                        org: org,
                        x: x - this.boxWidth / 2, // 中央揃えのためオフセット
                        y: y,
                        level: level,
                        boxHeight: boxHeight // Hide Managersモード用のボックス高さ
                    });
                    
                    ConfigUtils.debugLog(`最終配置: ${org} at (${x - this.boxWidth / 2}, ${y}) height=${boxHeight}`, 'layout');
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
     * 境界を計算（Hide Managers対応版）
     * @param {Array<Object>} nodes - ノードの配列
     * @returns {Object} 境界情報 { maxX, maxY }
     */
    calculateBounds(nodes) {
        let maxX = 0, maxY = 0;
        
        nodes.forEach(node => {
            const boxHeight = node.boxHeight || this.boxHeight;
            maxX = Math.max(maxX, node.x + this.boxWidth);
            maxY = Math.max(maxY, node.y + boxHeight);
        });
        
        return { 
            maxX: maxX + this.spacing.MARGIN, 
            maxY: maxY + this.spacing.MARGIN 
        };
    }
}

// グローバルに公開
window.LayoutCalculator = LayoutCalculator;