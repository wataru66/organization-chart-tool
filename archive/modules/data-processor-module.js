/**
 * Organization Chart Tool - Data Processor Module (v4)
 * データ処理・検証機能
 */

class DataProcessor {
    constructor() {
        this.rawData = [];
        this.processedData = {
            organizations: new Map(),
            hierarchy: new Map(),
            managers: new Map(),
            advisors: new Map(),
            dataOrder: new Map()
        };
        this.callNameMapping = new Map(); // Team Name → Exact Team Name
        this.errors = [];
        this.isProcessed = false;
        
        // 新データ構造の列インデックス
        this.COLUMN_MAPPING = {
            level: 0,
            teamName: 1,
            exactTeamName: 2,
            upperTeam: 3,
            teamId: 4,
            role: 5,
            role2ndLang: 6,
            teamBoss: 7,
            picName: 8,
            picName2ndLang: 9,
            concurrent: 10,
            employeeCd: 11,
            grade: 12,
            memo: 13,
            borderColor: 14,
            headerBgColor: 15,
            headerTextColor: 16
        };
        
        ConfigUtils.debugLog('DataProcessor initialized with new column structure', 'data');
    }

    /**
     * Excelファイルを処理
     */
    async processExcelFile(file) {
        try {
            ConfigUtils.debugLog('Excel file processing started', 'data');
            
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            const sheetNames = workbook.SheetNames;
            if (sheetNames.length === 0) {
                throw new Error('No worksheets found');
            }
            
            const worksheet = workbook.Sheets[sheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (data.length < 2) {
                throw new Error('Insufficient data (minimum 2 rows including header required)');
            }
            
            // ヘッダー行をスキップしてデータ行のみを取得
            this.rawData = data.slice(1).filter(row => 
                row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== '')
            );
            
            ConfigUtils.debugLog(`Excel data loaded: ${this.rawData.length} rows`, 'data');
            return this.rawData;
            
        } catch (error) {
            ConfigUtils.debugLog(`Excel processing error: ${error.message}`, 'error');
            throw new Error(`Failed to process Excel file: ${error.message}`);
        }
    }

    /**
     * 修正済みサンプルデータを読み込み
     */
    loadCorrectedSampleData() {
        try {
            ConfigUtils.debugLog('Loading corrected sample data...', 'data');
            
            if (typeof CORRECTED_SAMPLE_DATA === 'undefined') {
                throw new Error('Sample data not available');
            }
            
            this.rawData = [...CORRECTED_SAMPLE_DATA];
            ConfigUtils.debugLog(`Sample data loaded: ${this.rawData.length} rows`, 'data');
            
            // 自動的にデータを処理
            this.processData();
            
        } catch (error) {
            ConfigUtils.debugLog(`Sample data loading error: ${error.message}`, 'error');
            throw new Error(`Failed to load sample data: ${error.message}`);
        }
    }

    /**
     * データを処理（新構造対応）
     */
    processData() {
        try {
            ConfigUtils.debugLog('=== Data processing started ===', 'data');
            
            // 既存データをクリア
            this.processedData = {
                organizations: new Map(),
                hierarchy: new Map(),
                managers: new Map(),
                advisors: new Map(),
                dataOrder: new Map()
            };
            this.callNameMapping.clear();
            this.errors = [];
            this.isProcessed = false;
            
            if (!this.rawData || this.rawData.length === 0) {
                throw new Error('No data to process');
            }
            
            ConfigUtils.debugLog(`Processing ${this.rawData.length} rows`, 'data');
            
            // データクレンジング
            this.cleanData();
            
            // Team Name・Exact Team Nameマッピングを構築
            this.buildTeamNameMapping();
            
            // 組織データを構築
            this.buildOrganizationData();
            
            // 階層構造を構築
            this.buildHierarchy();
            
            // 管理者・アドバイザ情報を処理
            this.processManagersAndAdvisors();
            
            // データ検証
            this.validateData();
            
            this.isProcessed = true;
            ConfigUtils.debugLog(`Data processing completed: ${this.processedData.organizations.size} organizations`, 'data');
            
            // 組織配列を返す
            return Array.from(this.processedData.organizations.values());
            
        } catch (error) {
            ConfigUtils.debugLog(`Data processing error: ${error.message}`, 'error');
            this.errors.push(`Data processing failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * データクレンジング
     */
    cleanData() {
        ConfigUtils.debugLog('Cleaning data...', 'data');
        
        const cleanedData = [];
        let skippedRows = 0;
        
        this.rawData.forEach((row, index) => {
            try {
                // 必須フィールドをチェック
                const level = row[this.COLUMN_MAPPING.level];
                const teamName = row[this.COLUMN_MAPPING.teamName];
                const picName = row[this.COLUMN_MAPPING.picName];
                const role = row[this.COLUMN_MAPPING.role];
                
                if (!level || !teamName || !picName || !role) {
                    ConfigUtils.debugLog(`Row ${index + 1} skipped: missing required fields`, 'data');
                    skippedRows++;
                    return;
                }
                
                // データ型変換・正規化
                const cleanedRow = [...row];
                
                // Levelを数値に変換
                cleanedRow[this.COLUMN_MAPPING.level] = parseInt(level) || 1;
                
                // 文字列フィールドのトリム
                [
                    'teamName', 'exactTeamName', 'upperTeam', 'teamId',
                    'role', 'role2ndLang', 'picName', 'picName2ndLang',
                    'concurrent', 'employeeCd', 'grade', 'memo'
                ].forEach(field => {
                    const index = this.COLUMN_MAPPING[field];
                    if (cleanedRow[index]) {
                        cleanedRow[index] = cleanedRow[index].toString().trim();
                    }
                });
                
                // Team Bossを正規化（Y/N）
                const teamBoss = row[this.COLUMN_MAPPING.teamBoss];
                cleanedRow[this.COLUMN_MAPPING.teamBoss] = 
                    (teamBoss && ['Y', 'y', 'Yes', 'yes', 'true', '1'].includes(teamBoss.toString())) ? 'Y' : 'N';
                
                cleanedData.push(cleanedRow);
                
            } catch (error) {
                ConfigUtils.debugLog(`Row ${index + 1} cleaning error: ${error.message}`, 'error');
                skippedRows++;
            }
        });
        
        this.rawData = cleanedData;
        ConfigUtils.debugLog(`Data cleaning completed: ${cleanedData.length} valid rows, ${skippedRows} skipped`, 'data');
    }

    /**
     * Team Name・Exact Team Nameマッピングを構築
     */
    buildTeamNameMapping() {
        ConfigUtils.debugLog('Building team name mapping...', 'data');
        
        this.callNameMapping.clear();
        
        this.rawData.forEach(row => {
            const teamName = row[this.COLUMN_MAPPING.teamName];
            const exactTeamName = row[this.COLUMN_MAPPING.exactTeamName] || teamName;
            
            if (teamName && exactTeamName) {
                this.callNameMapping.set(teamName, exactTeamName);
            }
        });
        
        ConfigUtils.debugLog(`Team name mapping built: ${this.callNameMapping.size} entries`, 'data');
    }

    /**
     * 組織データを構築
     */
    buildOrganizationData() {
        ConfigUtils.debugLog('Building organization data...', 'data');
        
        this.rawData.forEach((row, index) => {
            try {
                const teamName = row[this.COLUMN_MAPPING.teamName];
                const level = row[this.COLUMN_MAPPING.level];
                const upperTeam = row[this.COLUMN_MAPPING.upperTeam];
                const exactTeamName = row[this.COLUMN_MAPPING.exactTeamName] || teamName;
                
                // Parent処理（"N/A"の場合はnull）
                const parent = (upperTeam === 'N/A' || !upperTeam) ? null : upperTeam;
                
                // 色設定処理
                const colorSettings = {
                    borderColor: row[this.COLUMN_MAPPING.borderColor] || '',
                    headerBgColor: row[this.COLUMN_MAPPING.headerBgColor] || '',
                    headerTextColor: row[this.COLUMN_MAPPING.headerTextColor] || ''
                };
                
                // 組織データが存在しない場合は初期化
                if (!this.processedData.organizations.has(teamName)) {
                    const orgData = {
                        id: teamName,
                        name: teamName,
                        teamName: teamName,
                        exactName: exactTeamName,
                        exactTeamName: exactTeamName,
                        level: level,
                        parent: parent,
                        upperTeam: parent,
                        managers: [],
                        advisors: [],
                        colors: colorSettings,
                        teamId: row[this.COLUMN_MAPPING.teamId] || '',
                        dataOrder: index
                    };
                    
                    this.processedData.organizations.set(teamName, orgData);
                    this.processedData.dataOrder.set(teamName, index);
                }
                
                // 人員情報を追加
                const picName = row[this.COLUMN_MAPPING.picName];
                const role = row[this.COLUMN_MAPPING.role];
                const teamBoss = row[this.COLUMN_MAPPING.teamBoss] === 'Y';
                
                const personData = {
                    name: picName,
                    name2ndLang: row[this.COLUMN_MAPPING.picName2ndLang] || '',
                    role: role,
                    role2ndLang: row[this.COLUMN_MAPPING.role2ndLang] || '',
                    isTeamBoss: teamBoss,
                    concurrent: row[this.COLUMN_MAPPING.concurrent] || '',
                    employeeCd: row[this.COLUMN_MAPPING.employeeCd] || '',
                    grade: row[this.COLUMN_MAPPING.grade] || '',
                    memo: row[this.COLUMN_MAPPING.memo] || ''
                };
                
                // 管理者・アドバイザの判定
                const isManager = this.isManagerRole(role) || teamBoss;
                const isAdvisor = this.isAdvisorRole(role);
                
                const orgData = this.processedData.organizations.get(teamName);
                
                // チーム長の場合はメインの情報として設定
                if (teamBoss) {
                    orgData.picName = picName;
                    orgData.picName2ndLang = personData.name2ndLang;
                    orgData.role = role;
                    orgData.role2ndLang = personData.role2ndLang;
                    
                    // 色設定をコピー
                    if (row[this.COLUMN_MAPPING.borderColor]) {
                        orgData.borderColor = row[this.COLUMN_MAPPING.borderColor];
                    }
                    if (row[this.COLUMN_MAPPING.headerBgColor]) {
                        orgData.headerBgColor = row[this.COLUMN_MAPPING.headerBgColor];
                    }
                    if (row[this.COLUMN_MAPPING.headerTextColor]) {
                        orgData.headerTextColor = row[this.COLUMN_MAPPING.headerTextColor];
                    }
                }
                
                if (isManager) {
                    orgData.managers.push(personData);
                } else if (isAdvisor) {
                    orgData.advisors.push(personData);
                } else {
                    orgData.managers.push(personData); // デフォルトは管理者扱い
                }
                
            } catch (error) {
                ConfigUtils.debugLog(`Organization data building error at row ${index + 1}: ${error.message}`, 'error');
                this.errors.push(`Row ${index + 1}: ${error.message}`);
            }
        });
        
        ConfigUtils.debugLog(`Organization data built: ${this.processedData.organizations.size} organizations`, 'data');
    }

    /**
     * 階層構造を構築
     */
    buildHierarchy() {
        ConfigUtils.debugLog('Building hierarchy...', 'data');
        
        this.processedData.hierarchy.clear();
        
        // 親子関係を構築（親 -> 子の配列）
        this.processedData.organizations.forEach((orgData, orgName) => {
            const parent = orgData.parent;
            
            if (parent && this.processedData.organizations.has(parent)) {
                // 親が存在する場合、親の子リストに追加
                if (!this.processedData.hierarchy.has(parent)) {
                    this.processedData.hierarchy.set(parent, []);
                }
                this.processedData.hierarchy.get(parent).push(orgName);
            } else if (!parent) {
                // 親がない場合はルートノード
                ConfigUtils.debugLog(`Root node found: ${orgName}`, 'data');
            }
        });
        
        // 各親の子を並び順でソート
        this.processedData.hierarchy.forEach((children, parent) => {
            children.sort((a, b) => {
                const orderA = this.processedData.dataOrder.get(a) || 0;
                const orderB = this.processedData.dataOrder.get(b) || 0;
                return orderA - orderB;
            });
        });
        
        ConfigUtils.debugLog(`Hierarchy built: ${this.processedData.hierarchy.size} parent organizations`, 'data');
        
        // 階層構造をログ出力（デバッグ用）
        this.processedData.hierarchy.forEach((children, parent) => {
            ConfigUtils.debugLog(`Parent: ${parent} -> Children: [${children.join(', ')}]`, 'data');
        });
    }

    /**
     * 管理者・アドバイザ情報を処理
     */
    processManagersAndAdvisors() {
        ConfigUtils.debugLog('Processing managers and advisors...', 'data');
        
        this.processedData.managers.clear();
        this.processedData.advisors.clear();
        
        this.processedData.organizations.forEach((orgData, orgName) => {
            if (orgData.managers.length > 0) {
                this.processedData.managers.set(orgName, orgData.managers);
            }
            if (orgData.advisors.length > 0) {
                this.processedData.advisors.set(orgName, orgData.advisors);
            }
        });
        
        ConfigUtils.debugLog(`Managers and advisors processed: ${this.processedData.managers.size} manager groups, ${this.processedData.advisors.size} advisor groups`, 'data');
    }

    /**
     * 管理者役職の判定
     */
    isManagerRole(role) {
        if (!role) return false;
        
        const managerKeywords = CONFIG.DATA_PROCESSING.MANAGER_KEYWORDS || [
            '長', 'Manager', 'manager', 'Head', 'Chief', 'President', 'Director'
        ];
        
        return managerKeywords.some(keyword => 
            role.toString().toLowerCase().includes(keyword.toLowerCase())
        );
    }

    /**
     * アドバイザ役職の判定
     */
    isAdvisorRole(role) {
        if (!role) return false;
        
        const advisorKeywords = CONFIG.DATA_PROCESSING.ADVISOR_KEYWORDS || [
            'アドバイザ', 'Advisor', 'advisor'
        ];
        
        return advisorKeywords.some(keyword => 
            role.toString().toLowerCase().includes(keyword.toLowerCase())
        );
    }

    /**
     * データ検証（階層構造の整合性も含む）
     */
    validateData() {
        ConfigUtils.debugLog('Validating data...', 'data');
        
        const validationErrors = [];
        let rootCount = 0;
        
        // 必須フィールドの検証
        this.processedData.organizations.forEach((orgData, orgName) => {
            if (!orgData.name) {
                validationErrors.push(`Organization ${orgName}: Team Name is required`);
            }
            
            if (orgData.level < 1 || orgData.level > 10) {
                validationErrors.push(`Organization ${orgName}: Level must be between 1-10`);
            }
            
            if (orgData.managers.length === 0 && orgData.advisors.length === 0) {
                validationErrors.push(`Organization ${orgName}: At least one person is required`);
            }
            
            // 上位組織の存在確認
            if (orgData.parent && !this.processedData.organizations.has(orgData.parent)) {
                validationErrors.push(`Organization ${orgName}: Parent organization "${orgData.parent}" not found`);
            }
            
            // ルートノードのカウント
            if (!orgData.parent) {
                rootCount++;
            }
        });
        
        // 階層構造の検証
        if (rootCount === 0) {
            validationErrors.push('No root organization found (all organizations have parents)');
        } else if (rootCount > 1) {
            validationErrors.push(`Multiple root organizations found: ${rootCount} (should be exactly 1)`);
        }
        
        // 循環参照の検証
        this.checkCircularReferences();
        
        // 階層レベルの一貫性検証
        this.validateHierarchyLevels(validationErrors);
        
        this.errors.push(...validationErrors);
        ConfigUtils.debugLog(`Data validation completed: ${validationErrors.length} errors found`, 'data');
    }
    
    /**
     * 階層レベルの一貫性を検証
     */
    validateHierarchyLevels(validationErrors) {
        this.processedData.organizations.forEach((orgData, orgName) => {
            if (orgData.parent) {
                const parentData = this.processedData.organizations.get(orgData.parent);
                if (parentData) {
                    // 親のレベルは子のレベルより1小さくなければならない
                    if (parentData.level !== orgData.level - 1) {
                        validationErrors.push(`Organization ${orgName}: Level ${orgData.level} is inconsistent with parent ${orgData.parent} level ${parentData.level}`);
                    }
                }
            }
        });
    }

    /**
     * 循環参照をチェック
     */
    checkCircularReferences() {
        const visited = new Set();
        const recursionStack = new Set();
        
        const hasCycle = (orgName) => {
            if (recursionStack.has(orgName)) {
                this.errors.push(`Circular reference detected: ${orgName}`);
                return true;
            }
            
            if (visited.has(orgName)) {
                return false;
            }
            
            visited.add(orgName);
            recursionStack.add(orgName);
            
            const orgData = this.processedData.organizations.get(orgName);
            if (orgData && orgData.parent) {
                if (hasCycle(orgData.parent)) {
                    return true;
                }
            }
            
            recursionStack.delete(orgName);
            return false;
        };
        
        this.processedData.organizations.forEach((_, orgName) => {
            if (!visited.has(orgName)) {
                hasCycle(orgName);
            }
        });
    }

    // === データアクセスメソッド ===

    /**
     * 処理済みデータを取得
     */
    getProcessedData() {
        return this.processedData;
    }

    /**
     * 生データを取得
     */
    getRawData() {
        return this.rawData;
    }

    /**
     * 組織リストを取得
     */
    getOrganizationList() {
        return Array.from(this.processedData.organizations.keys()).sort();
    }

    /**
     * 全組織を取得（レベル制限あり）
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
     * 指定組織の階層を取得
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
     * エラーを取得
     */
    getErrors() {
        return this.errors;
    }

    /**
     * 処理状態を確認
     */
    isDataProcessed() {
        return this.isProcessed;
    }

    /**
     * 統計情報を取得
     */
    getStatistics() {
        if (!this.isProcessed) {
            return null;
        }
        
        const totalRecords = this.rawData.length;
        const organizations = this.processedData.organizations.size;
        
        let managers = 0;
        let maxLevel = 0;
        
        this.processedData.organizations.forEach(orgData => {
            managers += orgData.managers.length;
            maxLevel = Math.max(maxLevel, orgData.level);
        });
        
        return {
            totalRecords,
            organizations,
            managers,
            maxLevel,
            errors: this.errors.length
        };
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
            advisors: new Map(),
            dataOrder: new Map()
        };
        this.callNameMapping.clear();
        this.errors = [];
        this.isProcessed = false;
        
        ConfigUtils.debugLog('DataProcessor reset', 'data');
    }
}

// モジュールエクスポート
const DataProcessorModule = {
    DataProcessor
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataProcessorModule;
} else {
    window.DataProcessorModule = DataProcessorModule;
    window.DataProcessor = DataProcessor; // 後方互換性
}