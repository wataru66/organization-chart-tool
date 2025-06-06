/**
 * 組織図作成ツール - データ処理モジュール（Call Name対応版・データ反映修正版）
 * Excelデータの読み込み、処理、Call Name・正式名称マッピングを担当
 */

class DataProcessor {
    constructor() {
        this.rawData = [];
        this.processedData = {
            organizations: new Map(),
            hierarchy: new Map(),
            managers: new Map(),
            advisors: new Map()
        };
        this.callNameMapping = new Map(); // Call Name → Team Long Name
        this.errors = [];
        this.isProcessed = false;
    }

    /**
     * Excelファイルを処理
     * @param {File} file - Excelファイル
     * @returns {Promise<void>}
     */
    async processExcelFile(file) {
        try {
            ConfigUtils.debugLog('Excel ファイル読み込み開始', 'data');
            
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            const sheetNames = workbook.SheetNames;
            if (sheetNames.length === 0) {
                throw new Error('ワークシートが見つかりません');
            }
            
            const worksheet = workbook.Sheets[sheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (data.length < 2) {
                throw new Error('データが不足しています（ヘッダー行を含めて2行以上必要）');
            }
            
            // ヘッダー行をスキップしてデータ行のみを取得
            this.rawData = data.slice(1).filter(row => 
                row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== '')
            );
            
            ConfigUtils.debugLog(`Excel データ読み込み完了: ${this.rawData.length}行`, 'data');
            
            this.processData();
            
        } catch (error) {
            ConfigUtils.debugLog(`Excel 処理エラー: ${error.message}`, 'error');
            throw new Error(`Excel ファイルの処理に失敗しました: ${error.message}`);
        }
    }

    /**
     * アップロードされたサンプルファイルを処理
     * @returns {Promise<void>}
     */
    async processSampleFile() {
        try {
            // window.fs APIを使用してサンプルファイルを読み込み
            const fileData = await window.fs.readFile('SampleData.xlsx');
            const workbook = XLSX.read(fileData, { type: 'array' });
            
            const sheetNames = workbook.SheetNames;
            const worksheet = workbook.Sheets[sheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            this.rawData = data.slice(1).filter(row => 
                row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== '')
            );
            
            ConfigUtils.debugLog(`サンプルファイル読み込み完了: ${this.rawData.length}行`, 'data');
            
            this.processData();
            
        } catch (error) {
            ConfigUtils.debugLog(`サンプルファイル処理エラー: ${error.message}`, 'error');
            throw new Error(`サンプルファイルの処理に失敗しました: ${error.message}`);
        }
    }

    /**
     * 修正済みサンプルデータを読み込み
     */
    loadCorrectedSampleData() {
        try {
            ConfigUtils.debugLog('修正済みサンプルデータ読み込み開始', 'data');
            
            this.rawData = CORRECTED_SAMPLE_DATA.map(row => [...row]);
            
            ConfigUtils.debugLog(`修正済みサンプルデータ: ${this.rawData.length}行`, 'data');
            
            this.processData();
            
        } catch (error) {
            ConfigUtils.debugLog(`修正済みサンプルデータ読み込みエラー: ${error.message}`, 'error');
            throw new Error(`修正済みサンプルデータの読み込みに失敗しました: ${error.message}`);
        }
    }

    /**
     * データを処理（修正版 - 確実な初期化と再処理対応）
     */
    processData() {
        try {
            ConfigUtils.debugLog('=== データ処理開始（初期化含む）===', 'data');
            
            // 既存の処理済みデータを完全にクリア
            this.processedData = {
                organizations: new Map(),
                hierarchy: new Map(),
                managers: new Map(),
                advisors: new Map(),
                dataOrder: new Map() // データ順序を記録
            };
            this.callNameMapping.clear();
            this.errors = [];
            this.isProcessed = false;
            
            ConfigUtils.debugLog('既存データクリア完了', 'data');
            
            if (!this.rawData || this.rawData.length === 0) {
                throw new Error('処理するデータがありません');
            }
            
            ConfigUtils.debugLog(`処理対象データ: ${this.rawData.length}行`, 'data');
            
            // データクレンジング
            this.cleanData();
            
            // Call Name・Team Long Nameマッピングを構築
            this.buildCallNameMapping();
            
            // 組織データを構築
            this.buildOrganizationData();
            
            // 階層構造を構築
            this.buildHierarchy();
            
            // 管理者・アドバイザ情報を処理
            this.processManagersAndAdvisors();
            
            // データ検証
            this.validateData();
            
            this.isProcessed = true;
            
            ConfigUtils.debugLog('=== データ処理完了 ===', 'data');
            ConfigUtils.debugLog(`組織数: ${this.processedData.organizations.size}`, 'data');
            ConfigUtils.debugLog(`階層関係: ${this.processedData.hierarchy.size}`, 'data');
            ConfigUtils.debugLog(`Call Nameマッピング: ${this.callNameMapping.size}`, 'data');
            ConfigUtils.debugLog(`エラー数: ${this.errors.length}`, 'data');
            
        } catch (error) {
            ConfigUtils.debugLog(`データ処理エラー: ${error.message}`, 'error');
            this.errors.push(`データ処理エラー: ${error.message}`);
            throw error;
        }
    }

    /**
     * データクレンジング
     */
    cleanData() {
        ConfigUtils.debugLog('データクレンジング開始', 'data');
        
        this.rawData = this.rawData.filter(row => {
            // 基本的な必須データがあるかチェック
            const hasCallName = row[6] && row[6].toString().trim();
            const hasName = row[2] && row[2].toString().trim();
            
            if (!hasCallName || !hasName) {
                ConfigUtils.debugLog(`無効な行をスキップ: Call Name="${row[6]}", Name="${row[2]}"`, 'data');
                return false;
            }
            
            return true;
        });
        
        // データの正規化
        this.rawData.forEach((row, index) => {
            // 文字列データの正規化
            for (let i = 0; i < row.length; i++) {
                if (typeof row[i] === 'string') {
                    row[i] = row[i].trim();
                }
            }
            
            // 階層レベルの正規化
            if (row[0]) {
                row[0] = parseInt(row[0]) || 1;
            } else {
                row[0] = 1;
            }
            
            // 親組織の正規化
            if (row[8] === '' || row[8] === null || row[8] === undefined) {
                row[8] = 'N/A';
            }
        });
        
        ConfigUtils.debugLog(`クレンジング後のデータ数: ${this.rawData.length}行`, 'data');
    }

    /**
     * Call Name・Team Long Nameマッピングを構築
     */
    buildCallNameMapping() {
        ConfigUtils.debugLog('Call Name マッピング構築開始', 'data');
        
        this.rawData.forEach(row => {
            const callName = row[6]; // Call Name
            const teamLongName = row[5]; // Team Long Name
            
            if (callName && teamLongName && callName !== teamLongName) {
                this.callNameMapping.set(callName, teamLongName);
                ConfigUtils.debugLog(`マッピング追加: ${callName} → ${teamLongName}`, 'data');
            }
        });
        
        ConfigUtils.debugLog(`Call Name マッピング構築完了: ${this.callNameMapping.size}件`, 'data');
    }

    /**
     * 組織データを構築（色情報対応版・修正版）
     */
    buildOrganizationData() {
        ConfigUtils.debugLog('組織データ構築開始', 'data');
        
        this.rawData.forEach((row, index) => {
            const callName = row[7];
            const teamLongName = row[6] || callName;
            const level = parseInt(row[0]) || 1;
            const parent = row[8] === 'N/A' ? null : row[8];
            
            if (!this.processedData.organizations.has(callName)) {
                // 色情報を取得（11:枠線色, 12:背景色, 13:ヘッダー文字色）
                const colorSettings = {
                    borderColor: row[11] || '',
                    backgroundColor: row[12] || '',
                    headerTextColor: row[13] || ''
                };
                
                // 色設定をパース
                const colors = ConfigUtils.parseColorSettings(colorSettings);
                
                const orgData = {
                    name: callName,
                    longName: teamLongName,
                    level: level,
                    parent: parent,
                    managers: [],
                    advisors: [],
                    hasData: true,
                    colors: colors
                };
                
                this.processedData.organizations.set(callName, orgData);
                
                // データ順序を記録（テーブル内での出現順序）
                this.processedData.dataOrder.set(callName, index);
                
                ConfigUtils.debugLog(`組織追加: ${callName} (Level: ${level}, Parent: ${parent || 'なし'}, Order: ${index})`, 'data');
                
                // 色設定がある場合はログ出力
                if (ConfigUtils.hasCustomColors(colors)) {
                    ConfigUtils.debugLog(`カスタム色設定: ${callName} - ${JSON.stringify(colors)}`, 'data');
                }
            }
        });
        
        ConfigUtils.debugLog(`組織データ構築完了: ${this.processedData.organizations.size}組織`, 'data');
    }

    /**
     * 階層構造を構築
     */
    buildHierarchy() {
        ConfigUtils.debugLog('階層構造構築開始', 'data');
        
        this.processedData.organizations.forEach((orgData, orgName) => {
            const parent = orgData.parent;
            
            if (parent && parent !== 'N/A') {
                if (!this.processedData.hierarchy.has(parent)) {
                    this.processedData.hierarchy.set(parent, []);
                }
                
                if (!this.processedData.hierarchy.get(parent).includes(orgName)) {
                    this.processedData.hierarchy.get(parent).push(orgName);
                    ConfigUtils.debugLog(`階層関係追加: ${parent} → ${orgName}`, 'data');
                }
            }
        });
        
        // 子組織をアルファベット順でソート
        this.processedData.hierarchy.forEach((children, parent) => {
            children.sort();
        });
        
        ConfigUtils.debugLog(`階層構造構築完了: ${this.processedData.hierarchy.size}の親組織`, 'data');
    }

    /**
     * 管理者・アドバイザ情報を処理（チームボスフラグ対応版）
     */
    processManagersAndAdvisors() {
        ConfigUtils.debugLog('管理者・アドバイザ情報処理開始（チームボスフラグ対応）', 'data');
        
        this.rawData.forEach(row => {
            const callName = row[7];
            const name = row[2];
            const role = row[9];
            const roleJp = row[10];
            const teamBossFlag = row[14]; // 15列目：チームボスフラグ
            const concurrent = row[15]; // 16列目：兼任フラグ
            
            if (!callName || !name || !role) return;
            
            const orgData = this.processedData.organizations.get(callName);
            if (!orgData) return;
            
            const personData = {
                name: name,
                role: role,
                roleJp: roleJp,
                isTeamBoss: teamBossFlag === 'Y' || teamBossFlag === 'y' || teamBossFlag === '1',
                isConcurrent: concurrent === 'Y' || concurrent === 'y' || concurrent === '1'
            };
            
            // チームボスフラグがある場合はそれを優先、ない場合は従来のキーワード判定
            let isManager = false;
            let isAdvisor = false;
            
            if (personData.isTeamBoss) {
                isManager = true;
                ConfigUtils.debugLog(`チームボス判定: ${callName} - ${name} (${role})`, 'data');
            } else {
                // 従来のキーワード判定
                isManager = CONFIG.DATA_PROCESSING.MANAGER_KEYWORDS.some(keyword => 
                    role.toLowerCase().includes(keyword.toLowerCase())
                );
                
                isAdvisor = CONFIG.DATA_PROCESSING.ADVISOR_KEYWORDS.some(keyword => 
                    role.toLowerCase().includes(keyword.toLowerCase())
                );
            }
            
            if (isManager) {
                orgData.managers.push(personData);
                ConfigUtils.debugLog(`管理者追加: ${callName} - ${name} (${role}) [ボス:${personData.isTeamBoss}]`, 'data');
            } else if (isAdvisor) {
                orgData.advisors.push(personData);
                ConfigUtils.debugLog(`アドバイザ追加: ${callName} - ${name} (${role})`, 'data');
            }
        });
        
        const managerCount = Array.from(this.processedData.organizations.values())
            .reduce((count, org) => count + org.managers.length, 0);
        const advisorCount = Array.from(this.processedData.organizations.values())
            .reduce((count, org) => count + org.advisors.length, 0);
        const teamBossCount = Array.from(this.processedData.organizations.values())
            .reduce((count, org) => count + org.managers.filter(m => m.isTeamBoss).length, 0);
            
        ConfigUtils.debugLog(`管理者・アドバイザ処理完了: 管理者${managerCount}名(うちチームボス${teamBossCount}名), アドバイザ${advisorCount}名`, 'data');
    }

    /**
     * データ検証
     */
    validateData() {
        ConfigUtils.debugLog('データ検証開始', 'data');
        
        // 循環参照チェック
        this.checkCircularReferences();
        
        // 孤立組織チェック
        this.checkOrphanedOrganizations();
        
        // 重複チェック
        this.checkDuplicates();
        
        ConfigUtils.debugLog(`データ検証完了: ${this.errors.length}個のエラー`, 'data');
    }

    /**
     * 循環参照をチェック
     */
    checkCircularReferences() {
        this.processedData.organizations.forEach((orgData, orgName) => {
            const visited = new Set();
            let current = orgName;
            
            while (current) {
                if (visited.has(current)) {
                    this.errors.push(`循環参照が検出されました: ${Array.from(visited).join(' → ')} → ${current}`);
                    break;
                }
                
                visited.add(current);
                const parentData = this.processedData.organizations.get(current);
                current = parentData?.parent;
            }
        });
    }

    /**
     * 孤立組織をチェック
     */
    checkOrphanedOrganizations() {
        this.processedData.organizations.forEach((orgData, orgName) => {
            const parent = orgData.parent;
            
            if (parent && parent !== 'N/A' && !this.processedData.organizations.has(parent)) {
                this.errors.push(`存在しない親組織を参照: ${orgName} → ${parent}`);
            }
        });
    }

    /**
     * 重複をチェック（チーム長・アドバイザの同一Call Name許可版）
     */
    checkDuplicates() {
        const callNameGroups = new Map();
        
        // Call Name別にグループ化
        this.rawData.forEach((row, index) => {
            const callName = row[7];
            const role = row[9];     // 修正: role = row[9]
            const teamBossFlag = row[14]; // 修正: teamBossFlag = row[14]
            
            if (!callNameGroups.has(callName)) {
                callNameGroups.set(callName, []);
            }
            
            callNameGroups.get(callName).push({
                row: row,
                index: index,
                role: role,
                teamBossFlag: teamBossFlag
            });
        });
        
        // 各Call Nameグループをチェック
        callNameGroups.forEach((group, callName) => {
            if (group.length > 1) {
                // デバッグログ: グループの詳細を出力
                ConfigUtils.debugLog(`Call Name "${callName}" 重複チェック:`, 'data');
                group.forEach((person, i) => {
                    ConfigUtils.debugLog(`  ${i + 1}. 行${person.index + 2}: role="${person.role}", teamBoss="${person.teamBossFlag}"`, 'data');
                });
                
                // 複数人いる場合、チーム長とアドバイザの組み合わせかチェック
                const isValidCombination = this.isValidRoleCombination(group);
                
                ConfigUtils.debugLog(`  判定結果: ${isValidCombination ? '有効' : '無効'}`, 'data');
                
                if (!isValidCombination) {
                    const rowNumbers = group.map(g => g.index + 2).join(', ');
                    this.errors.push(`不正な重複Call Name: ${callName} (行${rowNumbers}) - 同じ組織内で同じ役割の複数人または不正な組み合わせ`);
                }
            }
        });
    }
    
    /**
     * 役割の組み合わせが有効かチェック
     * @param {Array} group - 同一Call Nameの人員グループ
     * @returns {boolean} 有効な組み合わせかどうか
     */
    isValidRoleCombination(group) {
        const managers = [];
        const advisors = [];
        const others = [];
        
        group.forEach(person => {
            const role = person.role.toLowerCase();
            const isTeamBoss = person.teamBossFlag === 'Y' || person.teamBossFlag === 'y' || person.teamBossFlag === '1';
            
            // チームボスフラグがある場合は管理者として分類
            if (isTeamBoss) {
                managers.push(person);
            } else {
                // キーワード判定
                const isManager = CONFIG.DATA_PROCESSING.MANAGER_KEYWORDS.some(keyword => 
                    role.includes(keyword.toLowerCase())
                );
                const isAdvisor = CONFIG.DATA_PROCESSING.ADVISOR_KEYWORDS.some(keyword => 
                    role.includes(keyword.toLowerCase())
                );
                
                if (isManager) {
                    managers.push(person);
                } else if (isAdvisor) {
                    advisors.push(person);
                } else {
                    others.push(person);
                }
            }
        });
        
        // デバッグ出力: 分類結果
        ConfigUtils.debugLog(`    分類結果: 管理者${managers.length}名, アドバイザ${advisors.length}名, その他${others.length}名`, 'data');
        managers.forEach(m => ConfigUtils.debugLog(`      管理者: "${m.role}" (チームボス: ${m.teamBossFlag})`, 'data'));
        advisors.forEach(a => ConfigUtils.debugLog(`      アドバイザ: "${a.role}" (チームボス: ${a.teamBossFlag})`, 'data'));
        others.forEach(o => ConfigUtils.debugLog(`      その他: "${o.role}" (チームボス: ${o.teamBossFlag})`, 'data'));
        
        // 有効な組み合わせの条件：
        // 1. チーム長1名のみ
        // 2. チーム長1名 + アドバイザ1名
        // 3. アドバイザ1名のみ
        // 無効なケース：
        // - チーム長2名以上
        // - アドバイザ2名以上
        // - その他の役割が混在
        
        if (managers.length > 1) {
            ConfigUtils.debugLog(`無効：チーム長複数 ${managers.length}名`, 'data');
            return false;
        }
        
        if (advisors.length > 1) {
            ConfigUtils.debugLog(`無効：アドバイザ複数 ${advisors.length}名`, 'data');
            return false;
        }
        
        if (others.length > 0) {
            ConfigUtils.debugLog(`無効：その他の役割が混在 ${others.length}名`, 'data');
            return false;
        }
        
        // チーム長1名 + アドバイザ1名、またはどちらか1名のみは有効
        if ((managers.length <= 1) && (advisors.length <= 1)) {
            ConfigUtils.debugLog(`有効な組み合わせ：チーム長${managers.length}名、アドバイザ${advisors.length}名`, 'data');
            return true;
        }
        
        return false;
    }

    /**
     * 階層構造の詳細検証
     * @returns {Object} 検証結果
     */
    validateHierarchyStructure() {
        const errors = [];
        const warnings = [];
        const statistics = {
            totalOrganizations: this.processedData.organizations.size,
            maxLevel: 0,
            rootOrganizations: 0,
            levelCounts: new Map()
        };
        
        // 統計情報を収集
        this.processedData.organizations.forEach((orgData, orgName) => {
            const level = orgData.level;
            statistics.maxLevel = Math.max(statistics.maxLevel, level);
            
            if (!orgData.parent || orgData.parent === 'N/A') {
                statistics.rootOrganizations++;
            }
            
            const currentCount = statistics.levelCounts.get(level) || 0;
            statistics.levelCounts.set(level, currentCount + 1);
        });
        
        // 詳細検証（チームボスフラグ対応版）
        this.processedData.organizations.forEach((orgData, orgName) => {
            // 階層レベルの整合性チェック
            if (orgData.parent && orgData.parent !== 'N/A') {
                const parentData = this.processedData.organizations.get(orgData.parent);
                if (parentData) {
                    if (orgData.level <= parentData.level) {
                        errors.push(`階層レベルエラー: ${orgName}(Level:${orgData.level}) の親 ${orgData.parent}(Level:${parentData.level}) より小さいかまたは同じレベルです`);
                    }
                }
            }
            
            // チームボス人数チェック
            const teamBossCount = orgData.managers.filter(m => m.isTeamBoss).length;
            if (teamBossCount >= 2) {
                errors.push(`チームボス複数エラー: ${orgName} にチームボスが${teamBossCount}名います（${orgData.managers.filter(m => m.isTeamBoss).map(m => m.name).join(', ')}）`);
            }
            
            // アドバイザ人数チェック
            if (orgData.advisors.length >= 2) {
                errors.push(`アドバイザ複数エラー: ${orgName} にアドバイザが${orgData.advisors.length}名います（${orgData.advisors.map(a => a.name).join(', ')}）`);
            }
            
            // 管理者不在の警告（従来通り）
            if (orgData.managers.length === 0) {
                warnings.push(`管理者不在: ${orgName}`);
            }
            
            // チームボス不在の警告（一般管理者はいるがチームボスがいない場合）
            if (orgData.managers.length > 0 && teamBossCount === 0) {
                warnings.push(`チームボス不在: ${orgName} に管理者はいますがチームボスが明示されていません`);
            }
        });
        
        const isValid = errors.length === 0;
        
        return {
            isValid,
            errors,
            warnings,
            statistics
        };
    }

    /**
     * Call Name マッピングを取得
     * @returns {Map<string, string>} Call Name → Team Long Name のマッピング
     */
    getCallNameMapping() {
        return new Map(this.callNameMapping);
    }

    /**
     * 組織リストを取得
     * @returns {Array<string>} 組織名（Call Name）の配列
     */
    getOrganizationList() {
        return Array.from(this.processedData.organizations.keys()).sort();
    }

    /**
     * 指定した組織の階層を取得
     * @param {string} baseOrg - 基準組織
     * @param {number} maxLevel - 最大階層レベル（0は制限なし）
     * @returns {Array<string>} 対象組織の配列
     */
    getOrganizationHierarchy(baseOrg, maxLevel = 0) {
        const result = new Set();
        const visited = new Set();
        
        const addOrgAndChildren = (orgName, currentLevel) => {
            if (visited.has(orgName)) return;
            if (maxLevel > 0 && currentLevel > maxLevel) return;
            
            visited.add(orgName);
            
            const orgData = this.processedData.organizations.get(orgName);
            if (orgData && (!maxLevel || orgData.level <= maxLevel)) {
                result.add(orgName);
                
                const children = this.processedData.hierarchy.get(orgName) || [];
                children.forEach(child => {
                    addOrgAndChildren(child, currentLevel + 1);
                });
            }
        };
        
        addOrgAndChildren(baseOrg, 1);
        return Array.from(result);
    }

    /**
     * 全組織を取得
     * @param {number} maxLevel - 最大階層レベル（0は制限なし）
     * @returns {Array<string>} 対象組織の配列
     */
    getAllOrganizations(maxLevel = 0) {
        if (maxLevel === 0) {
            return this.getOrganizationList();
        }
        
        return Array.from(this.processedData.organizations.entries())
            .filter(([orgName, orgData]) => orgData.level <= maxLevel)
            .map(([orgName, orgData]) => orgName)
            .sort();
    }

    /**
     * 処理済みデータを取得
     * @returns {Object} 処理済みデータ
     */
    getProcessedData() {
        return this.processedData;
    }

    /**
     * エラーリストを取得
     * @returns {Array<string>} エラーメッセージの配列
     */
    getErrors() {
        return [...this.errors];
    }

    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        const totalRecords = this.rawData.length;
        const organizations = this.processedData.organizations.size;
        const managers = Array.from(this.processedData.organizations.values())
            .reduce((count, org) => count + org.managers.length, 0);
        const maxLevel = Array.from(this.processedData.organizations.values())
            .reduce((max, org) => Math.max(max, org.level), 0);
        const mappings = this.callNameMapping.size;
        const errors = this.errors.length;
        
        // 色設定統計
        const colorStats = ConfigUtils.getColorStatistics(this.processedData.organizations);
        
        return {
            totalRecords,
            organizations,
            managers,
            maxLevel,
            mappings,
            errors,
            customColors: colorStats.customCount,
            colorPatterns: colorStats.patternCount
        };
    }

    /**
     * 生データを取得
     * @returns {Array<Array>} 生データの配列
     */
    getRawData() {
        return this.rawData || [];
    }

    /**
     * データが処理済みかチェック
     * @returns {boolean} 処理済みフラグ
     */
    isDataProcessed() {
        return this.isProcessed && this.processedData.organizations.size > 0;
    }

    /**
     * データをリセット
     */
    reset() {
        this.rawData = [];
        this.processedData = {
            organizations: new Map(),
            hierarchy: new Map(),
            managers: new Map(),
            advisors: new Map()
        };
        this.callNameMapping.clear();
        this.errors = [];
        this.isProcessed = false;
        
        ConfigUtils.debugLog('データプロセッサーをリセット', 'data');
    }

    /**
     * デバッグ情報を出力
     */
    debugInfo() {
        if (!CONFIG.DEBUG.ENABLED) return;
        
        console.log('\n=== Data Processor Debug Info ===');
        console.log('Raw Data Rows:', this.rawData.length);
        console.log('Organizations:', this.processedData.organizations.size);
        console.log('Hierarchy Relations:', this.processedData.hierarchy.size);
        console.log('Call Name Mappings:', this.callNameMapping.size);
        console.log('Errors:', this.errors.length);
        console.log('Is Processed:', this.isProcessed);
        
        if (this.callNameMapping.size > 0) {
            console.log('\nCall Name Mappings:');
            this.callNameMapping.forEach((longName, callName) => {
                console.log(`  ${callName} → ${longName}`);
            });
        }
        
        if (this.errors.length > 0) {
            console.log('\nErrors:');
            this.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        // 色設定統計
        const colorStats = ConfigUtils.getColorStatistics(this.processedData.organizations);
        console.log('\nColor Statistics:');
        console.log(`  Custom Colors: ${colorStats.customCount}/${colorStats.total} (${colorStats.customPercentage}%)`);
        console.log(`  Color Patterns: ${colorStats.patternCount}`);
    }
}

// グローバルに公開
window.DataProcessor = DataProcessor;