# Organization Chart Tool - 完全仕様書 v4

## 📋 プロジェクト概要

### 目的
- Excelファイルから組織図を自動生成するWebツール
- 単一HTMLファイルとして配布可能
- 多言語対応（英語・日本語・インドネシア語）

### 開発経緯
- **v1**: ファイル分割版（動作確認済み）✅
- **v2**: 単一ファイル版（7962行、バグあり）❌
- **v3**: 構造化単一ファイル版（構文エラー）❌
- **v4**: 設計ベース統合版（開発中）🚧

---

## 🏗️ アーキテクチャ設計

### モジュール構成
```
1. ConfigModule     - 設定・言語・サンプルデータ
2. DataProcessor    - データ処理・検証
3. LayoutCalculator - レイアウト計算
4. ChartRenderer    - 組織図描画
5. DataTableManager - データテーブル管理
6. ExportUtils      - エクスポート機能
7. UIController     - UI制御・イベント処理
8. MainApp          - アプリケーション統合制御
```

### データフロー
```
Input → DataProcessor → LayoutCalculator → ChartRenderer → Output
                ↓
           DataTableManager ← UIController → ExportUtils
```

### 依存関係
```
CONFIG ← 全モジュール
LanguageManager ← UIController
DataProcessor ← UIController ← MainApp
LayoutCalculator ← UIController
ChartRenderer ← UIController
DataTableManager ← UIController
ExportUtils ← UIController
```

---

## 📊 データ構造仕様

### データテーブル列構成（17列）

| # | 区分 | 必須 | 項目名 | データ型 | 説明 |
|---|------|------|--------|----------|------|
| 1 | Team情報 | ✅ | Level | number(1-10) | 組織階層レベル |
| 2 | Team情報 | ✅ | Team Name | string | 短縮型チーム名（表示用） |
| 3 | Team情報 | ❌ | Exact Team Name | string | 正式チーム名 |
| 4 | Team情報 | ✅ | Upper Team | string | 上位組織名 |
| 5 | Team情報 | ❌ | Team ID | string | 企業管理コード |
| 6 | PIC情報 | ✅ | Role | string | 役職 |
| 7 | PIC情報 | ❌ | Role(2nd Lang) | string | 役職第2言語 |
| 8 | PIC情報 | ❌ | Team Boss | Y/N | チーム長フラグ |
| 9 | PIC情報 | ✅ | PIC Name | string | 担当者名 |
| 10 | PIC情報 | ❌ | PIC Name(2nd Lang) | string | 担当者名第2言語 |
| 11 | PIC情報 | ❌ | Concurrent Position | string | 兼任情報 |
| 12 | PIC情報 | ❌ | Employee CD | string | 社員番号 |
| 13 | PIC情報 | ❌ | Grade | string | 等級 |
| 14 | 補足情報 | ❌ | Memo | string | メモ |
| 15 | 補足情報 | ❌ | Border Color | color | 枠線色 |
| 16 | 補足情報 | ❌ | Header BG Color | color | ヘッダー背景色 |
| 17 | 補足情報 | ❌ | Header Text Color | color | ヘッダー文字色 |

### UI表示列（追加）
- **行番号**: 左端に自動生成
- **ドラッグハンドル**: 行並び替え用
- **Actions**: 削除ボタン等
- **Status**: 検証結果表示

---

## 🎨 UI/UX仕様

### 画面レイアウト
```
┌─────────────────────────────────────────┐
│ Header [Title]              [Language] │
├─────────────────────────────────────────┤
│ File Drop Zone                          │
├─────────────────────────────────────────┤
│ Controls                                │
│ ┌─ Data Operations ─┐ ┌─ Chart Gen ─┐  │
│ │ Load Sample       │ │ Generate    │  │
│ │ Export Template   │ │ Full Screen │  │
│ └───────────────────┘ └─────────────┘  │
├─────────────────────────────────────────┤
│ Statistics / Errors                     │
├─────────────────────────────────────────┤
│ Data Table (Optional)                   │
├─────────────────────────────────────────┤
│ Organization Chart Display              │
└─────────────────────────────────────────┘
```

### データテーブル詳細設計

#### 固定列（左側）
```
[#] [☰] [Level*] [Team Name*] | [Scrollable Area...]
```

#### 列表示制御
- チェックボックスで表示/非表示切替
- 必須項目（*付き）は常に表示
- デフォルト非表示項目: Exact Team Name, Team ID, Role(2nd Lang), PIC Name(2nd Lang), Concurrent Position, Employee CD, Grade, Memo, Color設定

#### ドラッグ&ドロップ
- ドラッグハンドル（☰）で行の並び替え
- 行番号の自動更新
- ドラッグ中の視覚的フィードバック

### 組織図表示

#### ボックスサイズ
```
Small:  70px × 80px  (spacing: 57px × 120px)
Medium: 85px × 100px (spacing: 72px × 140px)  [デフォルト]
Large:  100px × 120px (spacing: 87px × 170px)
```

#### フォントサイズ
```
Small:  org:10px, name:8px, role:7px
Medium: org:12px, name:10px, role:9px  [デフォルト]
Large:  org:14px, name:12px, role:11px
```

#### 表示モード
- **標準モード**: Team Name + PIC Name + Role
- **Hide Managersモード**: Team Nameのみ表示

---

## 🔧 API仕様

### DataProcessor
```javascript
class DataProcessor {
    // データ読み込み
    async processExcelFile(file)
    loadCorrectedSampleData()
    
    // データ処理
    processData()
    cleanData()
    buildOrganizationData()
    buildHierarchy()
    
    // データ取得
    getProcessedData()
    getRawData()
    getOrganizations()
    getAllOrganizations(maxLevel)
    getOrganizationHierarchy(baseOrg, maxLevel)
    
    // 検証
    validateData()
    getErrors()
    isDataProcessed()
}
```

### LayoutCalculator
```javascript
class LayoutCalculator {
    calculateLayout(organizations, baseOrg, options)
    updateSpacing(spacingX, spacingY)
    recalculatePositions()
}
```

### ChartRenderer
```javascript
class ChartRenderer {
    render(layout, processedData, options)
    updateStyle(fontSize, boxSize)
    toggleHideManagers(hide)
    clear()
}
```

### DataTableManager
```javascript
class DataTableManager {
    // テーブル表示
    showTable(data)
    hideTable()
    loadTableData(data)
    
    // 列制御
    setColumnVisibility(columnId, visible)
    getVisibleColumns()
    resetToDefaults()
    
    // 行操作
    addNewRow()
    deleteRow(index)
    reorderRows(fromIndex, toIndex)
    
    // データ編集
    updateCell(rowIndex, columnId, value)
    applyChanges()
    validateTableData()
}
```

### ExportUtils
```javascript
class ExportUtils {
    exportSVG()
    exportPNG()
    exportHTML()
    exportCurrentData()
    exportEmptyTemplate()
    printChart()
}
```

### UIController
```javascript
class UIController {
    // ファイル処理
    handleFileUpload(file)
    loadSampleData()
    
    // チャート制御
    generateChart()
    updateChartStyle()
    toggleFullscreen()
    
    // テーブル制御
    showDataTable()
    hideDataTable()
    validateData()
    
    // UI更新
    updateButtonStates(state)
    updateBaseOrgSelect()
    showError(message)
    showSuccess(message)
}
```

---

## 🌐 多言語対応仕様

### 対応言語
- **en**: English（デフォルト）
- **ja**: 日本語
- **id**: Bahasa Indonesia

### 翻訳システム
```javascript
// 使用方法
t('key')                    // "Generate Chart"
t('key', {n: 5})           // "Up to 5 levels"
t('tableHeaders.teamName') // "Team Name"
```

### 言語切り替え
- ヘッダー右上にセレクトボックス
- localStorage に設定保存
- 動的なページ更新
- イベント発火: `languageChanged`

---

## 🎯 機能優先度

### Phase 1（必須機能）
- ✅ データ読み込み・処理
- ✅ 組織図生成・表示
- ✅ 基本エクスポート機能
- ✅ 言語切り替え
- 🚧 データテーブル（新構造）

### Phase 2（重要機能）
- ⬜ 列表示制御
- ⬜ ドラッグ&ドロップ並び替え
- ⬜ インライン編集
- ⬜ 検証機能強化

### Phase 3（便利機能）
- ⬜ 検索・フィルター
- ⬜ ズーム機能
- ⬜ ツールチップ
- ⬜ アニメーション効果

---

## 📁 ファイル構成

### 開発中のモジュール
```
modules/
├── config-module.js          ✅ 完成
├── data-processor-module.js  🚧 作成中
├── layout-calculator-module.js
├── chart-renderer-module.js
├── data-table-manager-module.js
├── export-utils-module.js
├── ui-controller-module.js
└── main-app-module.js
```

### 統合後のファイル
```
organization-chart-tool-v4-complete.html  - 最終統合版
```

### 参考ファイル
```
src/                    - v1（ファイル分割版）
├── index.html
├── js/*.js
└── styles/*.css

organization-chart-tool-standalone.html  - v2（バグあり）
organization-chart-tool-structured.html  - v3（構文エラー）
prototype-mockup.html                     - プロトタイプ
```

---

## 🧪 テスト仕様

### 動作確認項目

#### 基本機能
- [ ] ページ読み込み
- [ ] 言語切り替え
- [ ] サンプルデータ読み込み
- [ ] 組織図生成
- [ ] データテーブル表示

#### データテーブル
- [ ] 列表示制御
- [ ] 固定列スクロール
- [ ] 行番号表示
- [ ] ドラッグ&ドロップ
- [ ] データ編集
- [ ] 検証機能

#### エクスポート
- [ ] SVG出力
- [ ] PNG出力
- [ ] HTML出力
- [ ] 印刷機能

#### レスポンシブ
- [ ] デスクトップ表示
- [ ] タブレット表示
- [ ] スマートフォン表示

### ブラウザ対応
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 📝 更新履歴

### v4.0 (開発中)
- 新データ構造設計
- モジュール化アーキテクチャ
- データテーブル機能強化
- 多言語対応改善

### v1.0 (2024)
- 基本機能実装
- ファイル分割版として完成

---

## 🚀 今後の計画

### 短期目標
1. 各モジュールの実装完了
2. v4統合版の作成
3. 動作テスト・デバッグ

### 中期目標
1. UI/UX改善
2. 検索・フィルター機能
3. パフォーマンス最適化

### 長期目標
1. クラウド連携
2. 権限管理機能
3. API提供

---

**最終更新**: 2025年6月5日  
**バージョン**: v4.0-spec  
**作成者**: Claude Code Session  