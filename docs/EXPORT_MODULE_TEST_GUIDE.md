# Export Module Manual Test Guide

## 🎯 テスト目的
Export modules（export-utils-module.js）の実際のブラウザ環境での動作確認

## 📋 テスト手順

### Phase 1: 準備
1. **ファイルを開く**: `test-export-modules.html` をブラウザで開く
2. **モジュール読み込み確認**: コンソールにエラーがないか確認
3. **初期状態確認**: エクスポートボタンが無効（disabled）になっていることを確認

### Phase 2: チャート生成テスト
1. **「Generate Test Chart」をクリック**
2. **期待する結果**:
   - ✅ 組織図がチャートコンテナに表示される
   - ✅ 「Chart generated successfully」のメッセージが表示される
   - ✅ エクスポートボタンが有効になる
   - ✅ コンソールにエラーが出ない

### Phase 3: SVGエクスポートテスト
1. **「Test SVG Export」をクリック**
2. **期待する結果**:
   - ✅ `test-organization-chart.svg` ファイルがダウンロードされる
   - ✅ ダウンロードしたSVGファイルをブラウザで開ける
   - ✅ 組織図が正しく表示される
   - ✅ スタイルが適用されている

### Phase 4: PNGエクスポートテスト
1. **「Test PNG Export」をクリック**
2. **期待する結果**:
   - ✅ `test-organization-chart.png` ファイルがダウンロードされる
   - ✅ PNGファイルで組織図が画像として保存されている
   - ✅ 画質が適切（2倍スケール）
   - ✅ 接続線も含めて完全に描画されている

### Phase 5: HTMLエクスポートテスト
1. **「Test HTML Export」をクリック**
2. **期待する結果**:
   - ✅ `test-organization-chart.html` ファイルがダウンロードされる
   - ✅ HTMLファイルを独立してブラウザで開ける
   - ✅ 組織図が完全に表示される
   - ✅ スタイルが埋め込まれている

### Phase 6: データエクスポートテスト
1. **「Test Data Export」をクリック**
2. **期待する結果**:
   - ✅ `test-organization-data.csv` ファイルがダウンロードされる
   - ✅ CSVファイルをExcelで開ける
   - ✅ 組織データが正しく構造化されている
   - ✅ 日本語文字が正しく表示される

### Phase 7: 統合テスト
1. **「Test All Exports」をクリック**
2. **期待する結果**:
   - ✅ 4つのファイルが順次ダウンロードされる
   - ✅ 「All export tests passed!」メッセージが表示される
   - ✅ 成功率100%が表示される

## 🔍 確認ポイント

### ブラウザコンソール
- エラーメッセージがないか
- WarningやDeprecationがないか
- ネットワークエラーがないか

### ダウンロードファイル
- ファイル名が正しいか
- ファイルサイズが適切か（0byteでないか）
- ファイルが開けるか
- 内容が正しいか

### パフォーマンス
- エクスポート処理時間が適切か（数秒以内）
- メモリリークがないか
- ブラウザがフリーズしないか

## 📊 テスト結果記録

### ✅ 成功ケース記録
```
□ チャート生成: 成功
□ SVGエクスポート: 成功
□ PNGエクスポート: 成功
□ HTMLエクスポート: 成功
□ データエクスポート: 成功
□ 統合テスト: 成功
```

### ❌ 失敗ケース記録
```
失敗した機能:
エラーメッセージ:
ブラウザ:
再現手順:
```

## 🛠️ トラブルシューティング

### よくある問題
1. **モジュールが読み込まれない**
   - ファイルパスを確認
   - HTTPSで開いているか確認
   - ネットワーク接続を確認

2. **PNGエクスポートが失敗**
   - ブラウザのCanvas APIサポートを確認
   - セキュリティ設定を確認
   - 画像サイズ制限を確認

3. **ダウンロードが開始されない**
   - ブラウザのダウンロード設定を確認
   - ポップアップブロッカーを確認
   - 権限設定を確認

### ブラウザ互換性
- **Chrome**: 全機能サポート
- **Firefox**: 全機能サポート
- **Safari**: PNG export要注意
- **Edge**: 全機能サポート

## 🎯 合格基準

### 必須条件（All PASS required）
- ✅ チャート生成成功
- ✅ SVGエクスポート成功
- ✅ HTMLエクスポート成功
- ✅ データエクスポート成功

### 推奨条件（PASS recommended）
- ✅ PNGエクスポート成功
- ✅ 統合テスト100%成功
- ✅ パフォーマンス問題なし

## 📝 最終確認

テスト完了後、以下を確認：

1. **ダウンロードフォルダ**に以下のファイルが存在する：
   - `test-organization-chart.svg`
   - `test-organization-chart.png`
   - `test-organization-chart.html`
   - `test-organization-data.csv`

2. **各ファイル**が正常に開ける

3. **ブラウザコンソール**にエラーがない

4. **テストページ**で成功メッセージが表示されている

## 🎉 テスト完了報告

テスト完了時は以下の情報を報告：

```
【Export Module Test Results】
Date: [テスト日時]
Browser: [ブラウザ名・バージョン]
OS: [OS名・バージョン]

Results:
□ Chart Generation: PASS/FAIL
□ SVG Export: PASS/FAIL
□ PNG Export: PASS/FAIL
□ HTML Export: PASS/FAIL
□ Data Export: PASS/FAIL
□ Integration Test: PASS/FAIL

Overall Status: PASS/FAIL
Notes: [追加コメント]
```