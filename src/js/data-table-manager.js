/**
 * 組織図作成ツール - データテーブル管理モジュール（エラー詳細表示版）
 * データの表示、編集、検証機能を提供 + 詳細エラー情報表示
 */

// カラーパレット管理クラス（完全修正版）
class ColorPaletteManager {
    constructor() {
        this.paletteColors = CONFIG.COLOR_SYSTEM.PALETTE_COLORS;
        this.departmentPresets = CONFIG.COLOR_SYSTEM.DEPARTMENT_PRESETS;
        this.currentRowIndex = null;
        this.currentFieldName = null;
    }

    /**
     * 改善されたカラーピッカーを作成（確実動作版）
     * @param {string} fieldName - フィールド名
     * @param {string} currentValue - 現在の値
     * @param {number} rowIndex - 行インデックス
     * @returns {string} カラーピッカーHTML
     */
    createColorPicker(fieldName, currentValue, rowIndex) {
        const fieldDisplayName = this.getFieldDisplayName(fieldName);
        const displayColor = this.getDisplayColor(fieldName, currentValue);
        
        // ユニークIDを生成
        const uniqueId = `colorPicker_${rowIndex}_${fieldName}`;
        
        return `
            <div class="color-input-container" data-row="${rowIndex}" data-field="${fieldName}">
                <div class="color-preview-box ${currentValue ? 'has-color' : ''}" 
                     id="preview_${uniqueId}"
                     style="background-color: ${displayColor}; cursor: pointer;"
                     title="${fieldDisplayName}: ${currentValue || 'デフォルト'}"
                     data-row="${rowIndex}" 
                     data-field="${fieldName}">
                </div>
                <input type="text" 
                       class="color-text-input"
                       id="input_${uniqueId}"
                       value="${currentValue}" 
                       placeholder="#色コード"
                       title="HEXカラーコード"
                       onchange="window.updateTableColorValue(${rowIndex}, '${fieldName}', this.value)">
                <button type="button" 
                        class="color-picker-btn" 
                        id="btn_${uniqueId}"
                        title="${fieldDisplayName}を選択"
                        style="cursor: pointer; pointer-events: auto;"
                        data-row="${rowIndex}" 
                        data-field="${fieldName}">
                    🎨
                </button>
            </div>
        `;
    }

    /**
     * 表示用の色を取得
     * @param {string} fieldName - フィールド名
     * @param {string} currentValue - 現在の値
     * @returns {string} 表示色
     */
    getDisplayColor(fieldName, currentValue) {
        if (currentValue && currentValue.trim()) {
            return currentValue;
        }
        
        // フィールドに応じたデフォルト色
        switch (fieldName) {
            case 'borderColor':
                return CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.borderColor;
            case 'backgroundColor':
                return CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.headerBackgroundColor; // ヘッダー背景色に変更
            case 'headerTextColor':
                return CONFIG.COLOR_SYSTEM.DEFAULT_COLORS.headerTextColor;
            default:
                return '#4a5568'; // ヘッダーのデフォルト色
        }
    }

    /**
     * カラーピッカーを開く（位置修正版）
     * @param {number} rowIndex - 行インデックス
     * @param {string} fieldName - フィールド名
     * @param {HTMLElement} element - クリックされた要素
     */
    openColorPicker(rowIndex, fieldName, element) {
        // 既存のピッカーを閉じる
        this.closePalette();
        
        // 現在の選択情報を保存
        this.currentRowIndex = rowIndex;
        this.currentFieldName = fieldName;
        
        // データテーブルマネージャーから現在値を取得
        const tableManager = window.app?.uiController?.dataTableManager;
        if (!tableManager) {
            console.error('DataTableManager not found');
            return;
        }
        
        const currentValue = tableManager.tableData[rowIndex][fieldName] || '';
        
        // カラーパレットを作成
        const colorPalette = this.createColorPalette(fieldName, currentValue, rowIndex);
        
        // 表示位置を計算（修正版）
        const rect = element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const paletteWidth = 350;
        const paletteHeight = 450;
        
        console.log('🎨 位置計算:', {
            elementRect: rect,
            viewport: { width: viewportWidth, height: viewportHeight },
            paletteSize: { width: paletteWidth, height: paletteHeight }
        });
        
        // X座標の計算（画面右端を考慮）
        let left = rect.left;
        if (left + paletteWidth > viewportWidth) {
            // 右側に表示できない場合は左側に表示
            left = rect.right - paletteWidth;
        }
        // 画面左端からはみ出る場合は画面内に収める
        if (left < 10) {
            left = 10;
        }
        
        // Y座標の計算（画面下端を考慮）
        let top = rect.bottom + 5;
        if (top + paletteHeight > viewportHeight) {
            // 下側に表示できない場合は上側に表示
            top = rect.top - paletteHeight - 5;
            // 上側にも表示できない場合は画面内の適切な位置に
            if (top < 10) {
                top = Math.max(10, viewportHeight - paletteHeight - 10);
            }
        }
        
        console.log('🎨 最終位置:', { left, top });
        
        // スタイルを設定
        colorPalette.style.position = 'fixed';
        colorPalette.style.left = left + 'px';
        colorPalette.style.top = top + 'px';
        colorPalette.style.zIndex = '9999';
        colorPalette.style.maxWidth = paletteWidth + 'px';
        colorPalette.style.maxHeight = paletteHeight + 'px';
        colorPalette.style.overflow = 'auto';
        
        document.body.appendChild(colorPalette);
        
        // 外部クリックで閉じる
        setTimeout(() => {
            const handleClickOutside = (e) => {
                if (!colorPalette.contains(e.target) && !element.contains(e.target)) {
                    this.closePalette();
                    document.removeEventListener('click', handleClickOutside);
                }
            };
            document.addEventListener('click', handleClickOutside);
        }, 100);
        
        this.debugLog(`カラーピッカー開く: 行${rowIndex}, ${fieldName}, 位置(${left}, ${top})`);
    }

    /**
     * デバッグログ出力（安全版）
     * @param {string} message - メッセージ
     */
    debugLog(message) {
        try {
            if (typeof ConfigUtils !== 'undefined' && ConfigUtils.debugLog) {
                ConfigUtils.debugLog(message, 'table');
            } else {
                console.log(`[TABLE] ${message}`);
            }
        } catch (error) {
            console.log(`[TABLE] ${message}`);
        }
    }

    /**
     * 色値を更新（修正版）
     * @param {number} rowIndex - 行インデックス
     * @param {string} fieldName - フィールド名
     * @param {string} value - 色値
     */
    updateColorValue(rowIndex, fieldName, value) {
        const tableManager = window.app?.uiController?.dataTableManager;
        if (tableManager) {
            tableManager.updateColorValue(rowIndex, fieldName, value);
        }
    }

    /**
     * 改善されたカラーパレットを作成（ドラッグ対応版）
     * @param {string} fieldName - フィールド名
     * @param {string} currentValue - 現在の値
     * @param {number} rowIndex - 行インデックス
     * @returns {HTMLElement} パレット要素
     */
    createColorPalette(fieldName, currentValue, rowIndex) {
        const paletteDiv = document.createElement('div');
        paletteDiv.className = 'color-palette';
        paletteDiv.setAttribute('data-row', rowIndex);
        paletteDiv.setAttribute('data-field', fieldName);
        
        paletteDiv.innerHTML = `
            <div class="palette-header palette-drag-handle" style="cursor: move;">
                <span>${this.getFieldDisplayName(fieldName)}を選択</span>
                <button type="button" class="close-btn">×</button>
            </div>
            
            <!-- 部門別プリセット -->
            <div class="preset-section">
                <div class="section-title">部門別プリセット</div>
                <div class="preset-grid">
                    ${this.createPresetButtons(fieldName, rowIndex)}
                </div>
            </div>
            
            <!-- 15色パレット -->
            <div class="palette-section">
                <div class="section-title">カラーパレット</div>
                <div class="color-grid">
                    ${this.createColorButtons(fieldName, currentValue, rowIndex)}
                </div>
            </div>
            
            <!-- カスタム色入力 -->
            <div class="custom-section">
                <div class="section-title">カスタム色</div>
                <div class="custom-input">
                    <input type="text" 
                           placeholder="#1976d2" 
                           class="custom-color-input"
                           style="width: 100px; font-family: monospace;">
                    <button type="button" class="apply-btn">適用</button>
                </div>
            </div>
            
            <!-- クリアボタン -->
            <div class="clear-section">
                <button type="button" class="clear-btn">
                    色をクリア（デフォルト使用）
                </button>
            </div>
        `;
        
        // イベントリスナーを追加
        this.attachPaletteEventListeners(paletteDiv, rowIndex, fieldName);
        
        // ドラッグ機能を追加
        this.makeDraggable(paletteDiv);
        
        return paletteDiv;
    }

    /**
     * パレットにイベントリスナーを追加（修正版）
     * @param {HTMLElement} paletteDiv - パレット要素
     * @param {number} rowIndex - 行インデックス
     * @param {string} fieldName - フィールド名
     */
    attachPaletteEventListeners(paletteDiv, rowIndex, fieldName) {
        // 閉じるボタン
        const closeBtn = paletteDiv.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePalette();
            });
        }

        // プリセットボタン
        paletteDiv.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const presetKey = btn.getAttribute('data-preset');
                if (presetKey) {
                    this.selectPresetColor(rowIndex, fieldName, presetKey);
                }
            });
        });

        // カラーボタン
        paletteDiv.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const colorKey = btn.getAttribute('data-color');
                if (colorKey) {
                    this.selectPaletteColor(rowIndex, fieldName, colorKey);
                }
            });
        });

        // カスタム色適用ボタン
        const applyBtn = paletteDiv.querySelector('.apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const customInput = paletteDiv.querySelector('.custom-color-input');
                if (customInput && customInput.value) {
                    this.applyCustomColor(rowIndex, fieldName, customInput.value);
                }
            });
        }

        // クリアボタン
        const clearBtn = paletteDiv.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.clearColor(rowIndex, fieldName);
            });
        }
    }

    /**
     * プリセットボタンを作成（修正版）
     */
    createPresetButtons(fieldName, rowIndex) {
        return Object.entries(this.departmentPresets).map(([key, preset]) => {
            const colorValue = this.getPresetColorForField(preset, fieldName);
            const hexColor = this.getPaletteColor(colorValue);
            const textColor = this.getContrastColor(hexColor);
            
            return `
                <button type="button" 
                        class="preset-btn" 
                        data-preset="${key}"
                        style="background: ${hexColor}; color: ${textColor}; border: 1px solid #ddd;"
                        title="${preset.name}">
                    ${preset.name}
                </button>
            `;
        }).join('');
    }

    /**
     * カラーボタンを作成（修正版）
     */
    createColorButtons(fieldName, currentValue, rowIndex) {
        return Object.entries(this.paletteColors).map(([colorKey, colorData]) => {
            const isSelected = currentValue === colorData.hex;
            return `
                <button type="button" 
                        class="color-btn ${isSelected ? 'selected' : ''}" 
                        data-color="${colorKey}"
                        style="background-color: ${colorData.hex}; border: 2px solid #ddd;"
                        title="${colorData.name} (${colorData.hex})">
                </button>
            `;
        }).join('');
    }

    /**
     * パレット色を選択
     */
    selectPaletteColor(rowIndex, fieldName, colorKey) {
        const colorData = this.paletteColors[colorKey];
        if (colorData) {
            this.updateColorValue(rowIndex, fieldName, colorData.hex);
            this.closePalette();
            this.debugLog(`パレット色選択: ${colorKey} → ${colorData.hex}`);
        }
    }

    /**
     * プリセット色を選択
     */
    selectPresetColor(rowIndex, fieldName, presetKey) {
        const preset = this.departmentPresets[presetKey];
        if (preset) {
            const colorValue = this.getPresetColorForField(preset, fieldName);
            const hexColor = this.getPaletteColor(colorValue);
            
            this.updateColorValue(rowIndex, fieldName, hexColor);
            this.closePalette();
            this.debugLog(`プリセット色選択: ${presetKey} → ${hexColor}`);
        }
    }

    /**
     * カスタム色を適用
     */
    applyCustomColor(rowIndex, fieldName, customValue) {
        // 色値を検証
        try {
            const validatedColor = this.parseColorValue(customValue);
            if (validatedColor) {
                this.updateColorValue(rowIndex, fieldName, validatedColor);
                this.closePalette();
                this.debugLog(`カスタム色適用: ${customValue} → ${validatedColor}`);
            } else {
                alert('有効な色コード（例: #1976d2、blue）を入力してください');
            }
        } catch (error) {
            alert('色値の検証中にエラーが発生しました: ' + error.message);
        }
    }

    /**
     * 色値をパース（安全版）
     * @param {string} colorValue - 色値
     * @returns {string|null} パース済み色値
     */
    parseColorValue(colorValue) {
        try {
            if (typeof ConfigUtils !== 'undefined' && ConfigUtils.parseColorValue) {
                return ConfigUtils.parseColorValue(colorValue);
            } else {
                // フォールバック処理
                if (colorValue && colorValue.startsWith('#') && /^#[0-9a-f]{6}$/i.test(colorValue)) {
                    return colorValue.toLowerCase();
                }
                return null;
            }
        } catch (error) {
            console.error('色値パースエラー:', error);
            return null;
        }
    }

    /**
     * 色をクリア
     */
    clearColor(rowIndex, fieldName) {
        this.updateColorValue(rowIndex, fieldName, '');
        this.closePalette();
        this.debugLog(`色クリア: 行${rowIndex}, ${fieldName}`);
    }

    /**
     * パレットを閉じる
     */
    closePalette() {
        document.querySelectorAll('.color-palette').forEach(p => p.remove());
    }

    /**
     * パレットをドラッグ可能にする
     * @param {HTMLElement} paletteDiv - パレット要素
     */
    makeDraggable(paletteDiv) {
        const header = paletteDiv.querySelector('.palette-drag-handle');
        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;
        let xOffset = 0;
        let yOffset = 0;

        const dragStart = (e) => {
            e.preventDefault();
            
            // タッチイベントとマウスイベントの両方に対応
            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            
            initialX = clientX - xOffset;
            initialY = clientY - yOffset;

            if (e.target === header || header.contains(e.target)) {
                // 閉じるボタンがクリックされた場合はドラッグしない
                if (e.target.classList.contains('close-btn')) {
                    return;
                }
                isDragging = true;
                paletteDiv.style.cursor = 'grabbing';
                header.style.cursor = 'grabbing';
            }
        };

        const dragEnd = () => {
            isDragging = false;
            paletteDiv.style.cursor = 'default';
            header.style.cursor = 'move';
            
            // 画面外に出た場合は画面内に戻す
            const rect = paletteDiv.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            let newLeft = currentX;
            let newTop = currentY;
            
            // 左右の境界チェック
            if (rect.left < 0) {
                newLeft = 0;
            } else if (rect.right > viewportWidth) {
                newLeft = viewportWidth - rect.width;
            }
            
            // 上下の境界チェック
            if (rect.top < 0) {
                newTop = 0;
            } else if (rect.bottom > viewportHeight) {
                newTop = viewportHeight - rect.height;
            }
            
            if (newLeft !== currentX || newTop !== currentY) {
                paletteDiv.style.left = newLeft + 'px';
                paletteDiv.style.top = newTop + 'px';
                xOffset = newLeft;
                yOffset = newTop;
            }
        };

        const drag = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // タッチイベントとマウスイベントの両方に対応
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            
            currentX = clientX - initialX;
            currentY = clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            paletteDiv.style.left = currentX + 'px';
            paletteDiv.style.top = currentY + 'px';
        };

        // マウスイベント
        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        // タッチイベント（モバイル対応）
        header.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);

        console.log('🎨 ドラッグ機能を設定');
    }

    /**
     * プリセットからフィールドに対応する色を取得
     */
    getPresetColorForField(preset, fieldName) {
        switch (fieldName) {
            case 'borderColor':
                return preset.borderColor;
            case 'backgroundColor':
                return preset.backgroundColor;
            case 'headerTextColor':
                return preset.headerTextColor;
            default:
                return preset.borderColor;
        }
    }

    /**
     * フィールド表示名を取得（修正版）
     */
    getFieldDisplayName(fieldName) {
        const displayNames = {
            'borderColor': '枠線色（全体）',
            'backgroundColor': 'ヘッダー背景色',
            'headerTextColor': 'ヘッダー文字色'
        };
        return displayNames[fieldName] || fieldName;
    }

    /**
     * コントラスト色を取得（白か黒）
     */
    getContrastColor(hexColor) {
        if (!hexColor || !hexColor.startsWith('#')) return '#000000';
        
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    /**
     * パレット色を取得
     */
    getPaletteColor(colorKey) {
        return this.paletteColors[colorKey]?.hex || colorKey;
    }
}

class DataTableManager {
    constructor(dataProcessor) {
        this.dataProcessor = dataProcessor;
        this.tableData = [];
        this.validationResults = new Map();
        this.isTableVisible = false;
        this.colorPaletteManager = new ColorPaletteManager();
        
        this.initializeElements();
    }

    /**
     * DOM要素を初期化
     */
    initializeElements() {
        this.elements = {
            tableSection: document.getElementById('dataTableSection'),
            tableBody: document.getElementById('dataTableBody'),
            showTableBtn: document.getElementById('showTableBtn')
        };
    }

    /**
     * データテーブルを表示（修正版）
     */
    showTable() {
        if (!this.dataProcessor.isDataProcessed()) {
            this.showError('データが読み込まれていません');
            return;
        }

        this.loadTableData();
        this.renderTable();
        this.validateAllData();
        this.elements.tableSection.style.display = 'block';
        this.isTableVisible = true;
        
        // DOM更新後にイベントリスナーを設定（修正版）
        setTimeout(() => {
            this.setupColorPickerEvents();
        }, 100);
        
        this.showValidationSummary();
        
        this.debugLog('データテーブルを表示（イベントリスナー設定）');
    }

    /**
     * デバッグログ出力（安全版）
     * @param {string} message - メッセージ
     */
    debugLog(message) {
        try {
            if (typeof ConfigUtils !== 'undefined' && ConfigUtils.debugLog) {
                ConfigUtils.debugLog(message, 'table');
            } else {
                console.log(`[TABLE] ${message}`);
            }
        } catch (error) {
            console.log(`[TABLE] ${message}`);
        }
    }

    /**
     * カラーピッカーのイベントを設定（修正版）
     */
    setupColorPickerEvents() {
        console.log('🎨 setupColorPickerEvents 開始');
        
        // すべてのカラーピッカーボタンを取得
        const colorPickerBtns = document.querySelectorAll('.color-picker-btn');
        const previewBoxes = document.querySelectorAll('.color-preview-box');
        
        console.log('🎨 カラーピッカーボタン数:', colorPickerBtns.length);
        console.log('🎨 プレビューボックス数:', previewBoxes.length);
        
        // カラーピッカーボタンにイベントを設定
        colorPickerBtns.forEach((btn, index) => {
            const rowIndex = parseInt(btn.getAttribute('data-row'));
            const fieldName = btn.getAttribute('data-field');
            
            console.log(`🎨 ボタン${index}: row=${rowIndex}, field=${fieldName}`);
            
            if (!isNaN(rowIndex) && fieldName) {
                // 新しいイベントリスナーを追加
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎨 ボタンクリック:', { rowIndex, fieldName });
                    this.colorPaletteManager.openColorPicker(rowIndex, fieldName, btn);
                });
                
                // スタイルを確実に設定
                btn.style.cursor = 'pointer';
                btn.style.pointerEvents = 'auto';
                btn.style.border = 'none';
                btn.style.background = '#4299e1';
                btn.style.color = 'white';
                btn.style.padding = '4px 6px';
                btn.style.borderRadius = '3px';
            }
        });
        
        // プレビューボックスにもイベントを設定
        previewBoxes.forEach((box, index) => {
            const rowIndex = parseInt(box.getAttribute('data-row'));
            const fieldName = box.getAttribute('data-field');
            
            console.log(`🎨 プレビュー${index}: row=${rowIndex}, field=${fieldName}`);
            
            if (!isNaN(rowIndex) && fieldName) {
                box.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎨 プレビュークリック:', { rowIndex, fieldName });
                    this.colorPaletteManager.openColorPicker(rowIndex, fieldName, box);
                });
                
                box.style.cursor = 'pointer';
            }
        });
        
        console.log('✅ カラーピッカーイベント設定完了');
    }

    /**
     * データテーブルを非表示
     */
    hideTable() {
        this.elements.tableSection.style.display = 'none';
        this.isTableVisible = false;
        
        // パレットも閉じる
        this.colorPaletteManager.closePalette();
        
        this.debugLog('データテーブルを非表示');
    }

    /**
     * テーブルデータを読み込み（色指定対応版・エラー詳細表示版）
     */
    loadTableData() {
        try {
            this.debugLog('=== テーブルデータ読み込み開始 ===');
            
            if (!this.dataProcessor.rawData || this.dataProcessor.rawData.length === 0) {
                throw new Error('rawDataが存在しません');
            }
            
            this.debugLog(`rawData行数: ${this.dataProcessor.rawData.length}`);
            
            this.tableData = this.dataProcessor.rawData.map((row, index) => {
                try {
                    this.debugLog(`行${index}処理中: ${JSON.stringify(row.slice(0, 7))}`);
                    
                    return {
                        index: index,
                        originalIndex: index,
                        level: row[0] || 1,
                        empId: row[1] || '',
                        name: row[2] || '',
                        nameEn: row[3] || '',
                        grade: row[4] || '',
                        teamLongName: row[5] || '',
                        callName: row[6] || '',
                        concurrent: row[7] || '',
                        parent: row[8] || '',
                        role: row[9] || '',
                        roleJp: row[10] || '',
                        borderColor: row[11] || '',
                        backgroundColor: row[12] || '',
                        headerTextColor: row[13] || '',
                        isDeleted: false,
                        isModified: false,
                        validationStatus: 'pending'
                    };
                } catch (rowError) {
                    console.error(`行${index}の処理でエラー:`, rowError);
                    this.debugLog(`行${index}エラー: ${rowError.message}`);
                    throw new Error(`行${index + 1}の処理に失敗: ${rowError.message}`);
                }
            });
            
            this.debugLog(`テーブルデータ読み込み完了: ${this.tableData.length}行`);
            
        } catch (error) {
            console.error('テーブルデータ読み込みエラー:', error);
            this.showDetailedError('テーブルデータの読み込みに失敗しました', error);
            throw error;
        }
    }

    /**
     * 詳細エラーを表示
     * @param {string} title - エラータイトル
     * @param {Error} error - エラーオブジェクト
     */
    showDetailedError(title, error) {
        const errorDetails = {
            message: error.message,
            stack: error.stack,
            dataProcessorState: {
                isProcessed: this.dataProcessor.isDataProcessed(),
                rawDataLength: this.dataProcessor.rawData ? this.dataProcessor.rawData.length : 0,
                organizationsSize: this.dataProcessor.processedData ? this.dataProcessor.processedData.organizations.size : 0
            },
            tableDataLength: this.tableData.length
        };
        
        console.error('詳細エラー情報:', errorDetails);
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            z-index: 2000;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            border: 2px solid #e53e3e;
        `;
        
        errorDiv.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #e53e3e; margin: 0;">
                    ❌ ${title}
                </h2>
            </div>
            
            <div style="background: #fed7d7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #c53030;">エラー詳細</h3>
                <p style="margin: 0; color: #c53030; font-family: monospace; font-size: 12px;">
                    ${error.message}
                </p>
            </div>
            
            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #2d3748;">状態情報</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
                    <li>データ処理済み: ${errorDetails.dataProcessorState.isProcessed}</li>
                    <li>rawData行数: ${errorDetails.dataProcessorState.rawDataLength}</li>
                    <li>組織数: ${errorDetails.dataProcessorState.organizationsSize}</li>
                    <li>テーブルデータ行数: ${errorDetails.tableDataLength}</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <button onclick="this.parentElement.remove()" style="
                    background: #4299e1;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                ">閉じる</button>
                <button onclick="console.log('エラー詳細:', ${JSON.stringify(errorDetails).replace(/"/g, '&quot;')})" style="
                    background: #718096;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-left: 10px;
                ">コンソールに詳細出力</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }

    /**
     * テーブルを描画（色指定対応版・修正版）
     */
    renderTable() {
        const tbody = this.elements.tableBody;
        tbody.innerHTML = '';

        this.updateTableHeader();

        this.tableData.forEach((row, index) => {
            if (row.isDeleted) return;
            
            const tr = document.createElement('tr');
            tr.setAttribute('data-index', index);
            
            if (row.isModified) {
                tr.style.backgroundColor = '#fff5f5';
                tr.style.borderLeft = '4px solid #f56565';
            }

            tr.innerHTML = `
                <td>
                    <button onclick="window.deleteRow(${index})" class="btn-danger" title="行を削除">削除</button>
                </td>
                <td>
                    <input type="number" value="${row.level}" 
                           onchange="window.updateCell(${index}, 'level', this.value)"
                           min="1" max="10" style="width: 60px;">
                </td>
                <td>
                    <input type="text" value="${row.empId}" 
                           onchange="window.updateCell(${index}, 'empId', this.value)"
                           style="width: 80px;">
                </td>
                <td>
                    <input type="text" value="${row.name}" 
                           onchange="window.updateCell(${index}, 'name', this.value)"
                           style="width: 100px;" required>
                </td>
                <td>
                    <input type="text" value="${row.nameEn}" 
                           onchange="window.updateCell(${index}, 'nameEn', this.value)"
                           style="width: 100px;">
                </td>
                <td>
                    <input type="text" value="${row.grade}" 
                           onchange="window.updateCell(${index}, 'grade', this.value)"
                           style="width: 60px;">
                </td>
                <td>
                    <input type="text" value="${row.teamLongName}" 
                           onchange="window.updateCell(${index}, 'teamLongName', this.value)"
                           style="width: 150px;" placeholder="正式組織名">
                </td>
                <td>
                    <input type="text" value="${row.callName}" 
                           onchange="window.updateCell(${index}, 'callName', this.value)"
                           style="width: 100px;" required>
                </td>
                <td>
                    <input type="text" value="${row.concurrent}" 
                           onchange="window.updateCell(${index}, 'concurrent', this.value)"
                           style="width: 60px;">
                </td>
                <td>
                    <select onchange="window.updateCell(${index}, 'parent', this.value)"
                            style="width: 120px;">
                        <option value="">選択してください</option>
                        <option value="N/A" ${row.parent === 'N/A' ? 'selected' : ''}>N/A</option>
                        ${this.getCallNameOptions(row.parent)}
                    </select>
                </td>
                <td>
                    <input type="text" value="${row.role}" 
                           onchange="window.updateCell(${index}, 'role', this.value)"
                           style="width: 120px;" required>
                </td>
                <td>
                    <input type="text" value="${row.roleJp}" 
                           onchange="window.updateCell(${index}, 'roleJp', this.value)"
                           style="width: 100px;">
                </td>
                <td>
                    ${this.colorPaletteManager.createColorPicker('borderColor', row.borderColor, index)}
                </td>
                <td>
                    ${this.colorPaletteManager.createColorPicker('backgroundColor', row.backgroundColor, index)}
                </td>
                <td>
                    ${this.colorPaletteManager.createColorPicker('headerTextColor', row.headerTextColor, index)}
                </td>
                <td>
                    <span class="status-${this.getValidationStatusClass(row.validationStatus)}" 
                          id="status-${index}" 
                          title="${this.getValidationDetails(index)}">
                        ${this.getValidationStatusText(row.validationStatus)}
                    </span>
                </td>
            `;

            tbody.appendChild(tr);
        });

        this.debugLog(`色対応テーブル描画完了: ${tbody.children.length}行`);
    }

    /**
     * テーブルヘッダーを更新（色列追加・修正版）
     */
    updateTableHeader() {
        const tableHeader = document.querySelector('#dataTableSection .table-container table thead');
        if (tableHeader) {
            tableHeader.innerHTML = `
                <tr>
                    <th>操作</th>
                    <th>階層</th>
                    <th>従業員番号</th>
                    <th>名前</th>
                    <th>英語名</th>
                    <th>等級</th>
                    <th>Team Long Name</th>
                    <th>Call Name</th>
                    <th>兼任</th>
                    <th>親組織</th>
                    <th>Role</th>
                    <th>役割</th>
                    <th>枠線色🎨</th>
                    <th>ヘッダー背景色🎨</th>
                    <th>ヘッダー文字色🎨</th>
                    <th>状態</th>
                </tr>
            `;
        }
    }

    /**
     * Call Name選択肢を取得
     */
    getCallNameOptions(selectedValue) {
        const callNames = new Set();
        
        this.tableData.forEach(row => {
            if (row.callName && !row.isDeleted) {
                callNames.add(row.callName);
            }
        });

        const sortedCallNames = Array.from(callNames).sort();
        
        return sortedCallNames.map(callName => 
            `<option value="${callName}" ${callName === selectedValue ? 'selected' : ''}>${callName}</option>`
        ).join('');
    }

    /**
     * セルの値を更新
     */
    updateCell(index, field, value) {
        if (this.tableData[index]) {
            this.tableData[index][field] = value;
            this.tableData[index].isModified = true;
            
            this.validateRow(index);
            this.showValidationSummary();
            
            if (field === 'callName') {
                this.renderTable();
                // レンダリング後にイベントを再設定
                setTimeout(() => {
                    this.setupColorPickerEvents();
                }, 100);
            }
            
            this.debugLog(`セル更新: 行${index}, ${field}=${value}`);
        }
    }

    /**
     * 色値を更新（完全修正版）
     */
    updateColorValue(index, field, value) {
        this.updateCell(index, field, value);
        
        // 対応するプレビューとテキスト入力を更新
        const container = document.querySelector(`[data-row="${index}"][data-field="${field}"]`);
        if (container) {
            const previewBox = container.querySelector('.color-preview-box');
            const textInput = container.querySelector('.color-text-input');
            
            if (previewBox) {
                const displayColor = this.colorPaletteManager.getDisplayColor(field, value);
                previewBox.style.backgroundColor = displayColor;
                previewBox.className = `color-preview-box ${value ? 'has-color' : ''}`;
                previewBox.title = `${this.colorPaletteManager.getFieldDisplayName(field)}: ${value || 'デフォルト'}`;
                
                // アニメーション効果
                previewBox.classList.add('updated');
                setTimeout(() => previewBox.classList.remove('updated'), 300);
            }
            
            if (textInput) {
                textInput.value = value;
            }
        }
        
        this.debugLog(`色値更新: 行${index}, ${field}=${value}`);
    }

    // 残りのメソッドは元のコードと同じ...
    deleteRow(index) {
        if (this.tableData[index]) {
            this.tableData[index].isDeleted = true;
            this.renderTable();
            // レンダリング後にイベントを再設定
            setTimeout(() => {
                this.setupColorPickerEvents();
            }, 100);
            this.debugLog(`行削除: ${index}`);
        }
    }

    addNewRow() {
        const newRow = {
            index: this.tableData.length,
            originalIndex: -1,
            level: 1,
            empId: '',
            name: '',
            nameEn: '',
            grade: '',
            teamLongName: '',
            callName: '',
            concurrent: '',
            parent: '',
            role: '',
            roleJp: '',
            borderColor: '',
            backgroundColor: '',
            headerTextColor: '',
            isDeleted: false,
            isModified: true,
            validationStatus: 'invalid'
        };

        this.tableData.push(newRow);
        this.renderTable();
        // レンダリング後にイベントを再設定
        setTimeout(() => {
            this.setupColorPickerEvents();
        }, 100);
        this.debugLog('新規行を追加（色列含む）');
    }

    validateAllData() {
        this.validationResults.clear();
        
        this.tableData.forEach((row, index) => {
            if (!row.isDeleted) {
                this.validateRow(index);
            }
        });

        this.updateValidationSummary();
        this.debugLog('全データ検証完了（色検証含む）');
    }

    validateRow(index) {
        const row = this.tableData[index];
        const errors = [];
        const warnings = [];
        
        // 必須フィールドチェック
        if (!row.name?.trim()) errors.push('名前が必要');
        if (!row.callName?.trim()) errors.push('Call Nameが必要');
        if (!row.role?.trim()) errors.push('Roleが必要');
        
        // 階層レベルチェック
        if (!row.level || row.level < 1 || row.level > 10) {
            errors.push('階層レベルは1-10の範囲');
        }
        
        // 親組織の存在チェック
        if (row.parent && row.parent !== 'N/A') {
            const parentExists = this.tableData.some(r => 
                !r.isDeleted && r.callName === row.parent
            );
            if (!parentExists) {
                errors.push('親組織(Call Name)が存在しません');
            }
        }
        
        // 循環参照チェック
        if (this.hasCircularReference(row.callName, row.parent)) {
            errors.push('循環参照が検出されました');
        }

        // 色値の検証
        ['borderColor', 'backgroundColor', 'headerTextColor'].forEach(colorField => {
            if (row[colorField] && row[colorField].trim()) {
                try {
                    const parsedColor = this.colorPaletteManager.parseColorValue(row[colorField]);
                    if (!parsedColor) {
                        warnings.push(`${this.getColorFieldDisplayName(colorField)}の形式が不正: ${row[colorField]}`);
                    }
                } catch (error) {
                    warnings.push(`${this.getColorFieldDisplayName(colorField)}の検証エラー: ${error.message}`);
                }
            }
        });

        this.validationResults.set(index, { errors, warnings });
        
        if (errors.length > 0) {
            row.validationStatus = 'invalid';
        } else if (warnings.length > 0) {
            row.validationStatus = 'warning';
        } else {
            row.validationStatus = 'valid';
        }

        this.updateRowValidationStatus(index);
    }

    getColorFieldDisplayName(fieldName) {
        const displayNames = {
            'borderColor': '枠線色',
            'backgroundColor': 'ヘッダー背景色',
            'headerTextColor': 'ヘッダー文字色'
        };
        return displayNames[fieldName] || fieldName;
    }

    hasCircularReference(callName, parentCallName) {
        if (!parentCallName || parentCallName === 'N/A') return false;
        if (callName === parentCallName) return true;
        
        const visited = new Set();
        let current = parentCallName;
        
        while (current && current !== 'N/A') {
            if (visited.has(current)) return true;
            if (current === callName) return true;
            
            visited.add(current);
            
            const parentRow = this.tableData.find(r => 
                !r.isDeleted && r.callName === current
            );
            current = parentRow?.parent;
        }
        
        return false;
    }

    updateRowValidationStatus(index) {
        const statusElement = document.getElementById(`status-${index}`);
        if (statusElement) {
            const row = this.tableData[index];
            const validationResult = this.validationResults.get(index) || { errors: [], warnings: [] };
            
            statusElement.className = `status-${this.getValidationStatusClass(row.validationStatus)}`;
            statusElement.textContent = this.getValidationStatusText(row.validationStatus);
            statusElement.title = this.getValidationDetails(index);
        }
    }

    getValidationDetails(index) {
        const validationResult = this.validationResults.get(index);
        if (!validationResult) return '未検証';
        
        const { errors, warnings } = validationResult;
        let details = [];
        
        if (errors.length > 0) {
            details.push('エラー: ' + errors.join(', '));
        }
        
        if (warnings.length > 0) {
            details.push('警告: ' + warnings.join(', '));
        }
        
        return details.length > 0 ? details.join(' | ') : '検証OK';
    }

    getValidationStatusClass(status) {
        switch (status) {
            case 'valid': return 'valid';
            case 'invalid': return 'invalid';
            case 'warning': return 'warning';
            default: return 'invalid';
        }
    }

    getValidationStatusText(status) {
        switch (status) {
            case 'valid': return 'OK';
            case 'invalid': return 'エラー';
            case 'warning': return '警告';
            default: return '未検証';
        }
    }

    updateValidationSummary() {
        const totalRows = this.tableData.filter(r => !r.isDeleted).length;
        const validRows = this.tableData.filter(r => !r.isDeleted && r.validationStatus === 'valid').length;
        const warningRows = this.tableData.filter(r => !r.isDeleted && r.validationStatus === 'warning').length;
        const invalidRows = totalRows - validRows - warningRows;
        
        this.debugLog(`検証サマリー: 総行数=${totalRows}, 有効=${validRows}, 警告=${warningRows}, 無効=${invalidRows}`);
    }

    showValidationSummary() {
        const totalRows = this.tableData.filter(r => !r.isDeleted).length;
        const validRows = this.tableData.filter(r => !r.isDeleted && r.validationStatus === 'valid').length;
        const warningRows = this.tableData.filter(r => !r.isDeleted && r.validationStatus === 'warning').length;
        const invalidRows = totalRows - validRows - warningRows;
        
        const colorStats = this.getColorUsageStats();
        
        const existingSummary = document.getElementById('validationSummary');
        if (existingSummary) {
            existingSummary.remove();
        }
        
        const summaryDiv = document.createElement('div');
        summaryDiv.id = 'validationSummary';
        summaryDiv.style.cssText = `
            background: ${invalidRows > 0 ? '#fef5e7' : warningRows > 0 ? '#fffbeb' : '#c6f6d5'};
            color: ${invalidRows > 0 ? '#dd6b20' : warningRows > 0 ? '#d69e2e' : '#22543d'};
            padding: 12px 16px;
            border-radius: 6px;
            margin: 10px 20px;
            border-left: 4px solid ${invalidRows > 0 ? '#f6ad55' : warningRows > 0 ? '#f6e05e' : '#48bb78'};
            font-size: 14px;
        `;
        
        const statusIcon = invalidRows > 0 ? '⚠️' : warningRows > 0 ? '⚡' : '✅';
        const statusText = invalidRows > 0 ? 'データに問題があります' : warningRows > 0 ? 'データに警告があります' : 'データは正常です';
        
        summaryDiv.innerHTML = `
            <strong>${statusIcon} データ検証結果</strong><br>
            ${statusText} - 総${totalRows}行中、有効${validRows}行、警告${warningRows}行、問題${invalidRows}行<br>
            <small>色設定: カスタム色${colorStats.customCount}組織、パターン${colorStats.patterns}種類</small>
            ${invalidRows > 0 || warningRows > 0 ? '<br><small>問題のある行は色付きでハイライトされています。修正してから組織図を生成してください。</small>' : ''}
        `;
        
        const tableContainer = this.elements.tableSection.querySelector('.table-container');
        tableContainer.parentNode.insertBefore(summaryDiv, tableContainer);
    }

    getColorUsageStats() {
        let customCount = 0;
        const colorPatterns = new Set();
        
        this.tableData.filter(r => !r.isDeleted).forEach(row => {
            const hasCustomColor = row.borderColor || row.backgroundColor || row.headerTextColor;
            if (hasCustomColor) {
                customCount++;
                const pattern = JSON.stringify({
                    border: row.borderColor,
                    bg: row.backgroundColor,
                    text: row.headerTextColor
                });
                colorPatterns.add(pattern);
            }
        });
        
        return {
            customCount,
            patterns: colorPatterns.size
        };
    }

    /**
     * 変更を適用（修正版 - 詳細エラー表示対応）
     */
    applyChanges() {
        try {
            this.debugLog('=== データテーブル変更適用開始 ===');
            
            // データ準備段階のエラーチェック
            if (!this.tableData || this.tableData.length === 0) {
                throw new Error('テーブルデータが存在しません');
            }
            
            const activeRows = this.tableData.filter(row => !row.isDeleted);
            this.debugLog(`有効な行数: ${activeRows.length}`);
            
            if (activeRows.length === 0) {
                throw new Error('有効なデータ行がありません');
            }
            
            // 各行のデータ変換
            const validData = activeRows.map((row, index) => {
                try {
                    this.debugLog(`行${index}変換中: callName="${row.callName}", name="${row.name}"`);
                    
                    if (!row.callName || !row.callName.trim()) {
                        throw new Error(`行${index + 1}: Call Nameが空です`);
                    }
                    
                    if (!row.name || !row.name.trim()) {
                        throw new Error(`行${index + 1}: 名前が空です`);
                    }
                    
                    return [
                        parseInt(row.level) || 1,
                        row.empId || '',
                        row.name || '',
                        row.nameEn || '',
                        row.grade || '',
                        row.teamLongName || '',
                        row.callName || '',
                        row.concurrent || '',
                        row.parent || '',
                        row.role || '',
                        row.roleJp || '',
                        row.borderColor || '',
                        row.backgroundColor || '',
                        row.headerTextColor || ''
                    ];
                } catch (rowError) {
                    this.debugLog(`行${index}変換エラー: ${rowError.message}`);
                    throw rowError;
                }
            });

            this.debugLog(`適用データ: ${validData.length}行`);
            this.debugLog('適用データサンプル:', validData.slice(0, 3));

            // DataProcessor更新段階のエラーチェック
            if (!this.dataProcessor) {
                throw new Error('DataProcessorが存在しません');
            }

            // rawDataを更新
            this.dataProcessor.rawData = validData;
            this.debugLog('rawData更新完了');
            
            // データを再処理して内部構造を更新
            this.dataProcessor.processData();
            this.debugLog('processData実行完了');
            
            // 処理結果の確認
            const processedData = this.dataProcessor.getProcessedData();
            this.debugLog(`処理済み組織数: ${processedData.organizations.size}`);
            this.debugLog(`処理済み階層数: ${processedData.hierarchy.size}`);
            
            if (processedData.organizations.size === 0) {
                throw new Error('データ処理後に組織が0件になりました');
            }
            
            // UIController更新段階のエラーチェック
            if (window.app && window.app.uiController) {
                try {
                    window.app.uiController.updateBaseOrgSelect();
                    this.debugLog('基準組織セレクト更新完了');
                } catch (uiError) {
                    console.warn('UI更新でエラーが発生しましたが、処理を継続します:', uiError);
                }
            }
            
            this.hideTable();
            
            const colorStats = this.getColorUsageStats();
            this.showSuccess(`✅ 変更適用完了\n${validData.length}行のデータを適用しました（カスタム色: ${colorStats.customCount}組織）\n\n「組織図生成」ボタンで更新された組織図を確認してください。`);
            
            this.debugLog(`変更適用完了: ${validData.length}行, カスタム色: ${colorStats.customCount}組織`);
            
        } catch (error) {
            console.error('変更適用エラー:', error);
            this.debugLog(`変更適用エラー: ${error.message}`);
            this.showDetailedError('変更の適用に失敗しました', error);
        }
    }

    showError(message) {
        alert(message);
    }

    showSuccess(message) {
        alert(message);
    }

    isVisible() {
        return this.isTableVisible;
    }

    hasUnsavedChanges() {
        return this.tableData.some(row => row.isModified);
    }

    getDataStructureInfo() {
        if (this.tableData.length === 0) return null;
        
        const sample = this.tableData[0];
        const colorStats = this.getColorUsageStats();
        
        return {
            totalRows: this.tableData.length,
            columns: Object.keys(sample),
            sampleData: sample,
            colorStats: colorStats
        };
    }
}

// グローバル関数（修正版 - より確実なイベント処理）

/**
 * テーブル用カラーピッカーを開く（デバッグ強化版）
 */
window.openTableColorPicker = function(rowIndex, fieldName, element) {
    console.log('🎨 openTableColorPicker 呼び出し:', { rowIndex, fieldName, element });
    
    try {
        // app の存在確認
        if (!window.app) {
            console.error('❌ window.app が存在しません');
            alert('アプリケーションが初期化されていません');
            return;
        }
        
        // uiController の存在確認
        if (!window.app.uiController) {
            console.error('❌ window.app.uiController が存在しません');
            alert('UIコントローラーが初期化されていません');
            return;
        }
        
        // dataTableManager の存在確認
        if (!window.app.uiController.dataTableManager) {
            console.error('❌ window.app.uiController.dataTableManager が存在しません');
            alert('データテーブルマネージャーが初期化されていません');
            return;
        }
        
        const tableManager = window.app.uiController.dataTableManager;
        console.log('✅ TableManager取得成功:', tableManager);
        
        // colorPaletteManager の存在確認
        if (!tableManager.colorPaletteManager) {
            console.error('❌ colorPaletteManager が存在しません');
            alert('カラーパレットマネージャーが初期化されていません');
            return;
        }
        
        console.log('✅ ColorPaletteManager取得成功:', tableManager.colorPaletteManager);
        
        // openColorPicker メソッドの存在確認
        if (typeof tableManager.colorPaletteManager.openColorPicker !== 'function') {
            console.error('❌ openColorPicker メソッドが存在しません');
            alert('カラーピッカー機能が利用できません');
            return;
        }
        
        console.log('🚀 カラーピッカーを開く:', { rowIndex, fieldName });
        tableManager.colorPaletteManager.openColorPicker(rowIndex, fieldName, element);
        
    } catch (error) {
        console.error('❌ openTableColorPicker でエラー:', error);
        alert('カラーピッカーを開く際にエラーが発生しました: ' + error.message);
    }
};

/**
 * テーブル用色値更新（デバッグ強化版）
 */
window.updateTableColorValue = function(rowIndex, fieldName, value) {
    console.log('🎨 updateTableColorValue 呼び出し:', { rowIndex, fieldName, value });
    
    try {
        if (!window.app?.uiController?.dataTableManager) {
            console.error('❌ DataTableManager not found');
            alert('データテーブルマネージャーが見つかりません');
            return;
        }
        
        const tableManager = window.app.uiController.dataTableManager;
        console.log('🚀 色値を更新:', { rowIndex, fieldName, value });
        tableManager.updateColorValue(rowIndex, fieldName, value);
        
    } catch (error) {
        console.error('❌ updateTableColorValue でエラー:', error);
        alert('色値更新中にエラーが発生しました: ' + error.message);
    }
};

// 初期化確認用のデバッグ関数
window.debugTableColorPicker = function() {
    console.log('=== カラーピッカーデバッグ情報 ===');
    console.log('window.app:', window.app);
    console.log('window.app?.uiController:', window.app?.uiController);
    console.log('window.app?.uiController?.dataTableManager:', window.app?.uiController?.dataTableManager);
    console.log('colorPaletteManager:', window.app?.uiController?.dataTableManager?.colorPaletteManager);
    
    if (window.app?.uiController?.dataTableManager?.colorPaletteManager) {
        const cpm = window.app.uiController.dataTableManager.colorPaletteManager;
        console.log('openColorPicker method:', typeof cpm.openColorPicker);
        console.log('paletteColors:', cpm.paletteColors);
        console.log('departmentPresets:', cpm.departmentPresets);
    }
};

// 既存のグローバル関数（簡素化版）
window.showDataTable = () => {
    console.log('🎨 showDataTable 呼び出し');
    
    // デバッグ情報を表示
    window.debugTableColorPicker();
    
    if (window.app && window.app.uiController && window.app.uiController.dataTableManager) {
        window.app.uiController.dataTableManager.showTable();
        console.log('✅ データテーブル表示完了');
        
        // テーブル表示後にテスト用のボタンをコンソールに案内
        console.log('🧪 テスト用: カラーピッカーをテストするには、テーブルの🎨ボタンをクリックしてください');
        
    } else {
        console.error('❌ DataTableManager not initialized');
        alert('データテーブル機能が初期化されていません');
    }
};

window.hideDataTable = () => {
    if (window.app && window.app.uiController && window.app.uiController.dataTableManager) {
        window.app.uiController.dataTableManager.hideTable();
    }
};

window.updateCell = (index, field, value) => {
    if (window.app && window.app.uiController && window.app.uiController.dataTableManager) {
        window.app.uiController.dataTableManager.updateCell(index, field, value);
    }
};

window.deleteRow = (index) => {
    if (window.app && window.app.uiController && window.app.uiController.dataTableManager) {
        window.app.uiController.dataTableManager.deleteRow(index);
    }
};

window.addNewRow = () => {
    if (window.app && window.app.uiController && window.app.uiController.dataTableManager) {
        window.app.uiController.dataTableManager.addNewRow();
    }
};

window.validateData = () => {
    if (window.app && window.app.uiController && window.app.uiController.dataTableManager) {
        window.app.uiController.dataTableManager.validateAllData();
    }
};

window.applyChanges = () => {
    if (window.app && window.app.uiController && window.app.uiController.dataTableManager) {
        window.app.uiController.dataTableManager.applyChanges();
    }
};

// グローバルに公開
window.DataTableManager = DataTableManager;