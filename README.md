# 認證考試模擬平台

一個使用 React 和 Vite 建構的現代化互動式認證考試平台。本應用程式為準備各種專業認證的使用者提供全方位的學習環境，具備客製化測驗、進度追蹤和詳細解答等功能。目前收錄多份 AWS 認證考題，未來將持續擴充更多類型的認證考試。

## 功能特色

- **支援多種認證考試**
  - AWS 相關認證
    - AWS Certified AI Practitioner
    - AWS Certified Cloud Practitioner (Working in progress)
  - 資料庫認證
    - MongoDB Associate Developer (Working in progress)
  - 持續新增更多認證題庫中

- **客製化測驗體驗**
  - 可調整題目數量
  - 隨機題目模式
  - 進度追蹤
  - 每題都附詳細解答

- **資料管理**
  - 備份與還原功能
  - 測驗歷史記錄
  - 本地儲存進度

- **使用者介面**
  - 現代化響應式設計
  - 支援 Markdown 格式文字
  - 直覺式導航
  - 適合手機使用的版面配置

## 開始使用

### 系統需求
- Node.js 或 Bun（建議）
- npm 或 Bun 套件管理器

### 安裝步驟

1. 複製專案儲存庫
2. 安裝相依套件：
```bash
npm install
# 或
bun install
```

3. 啟動開發伺服器：
```bash
npm run dev
# 或
bun dev
```

## 測驗資料結構

題目以 JSON 格式儲存，結構如下：

```json
{
  "exam_title": "考試標題",
  "logo_url": "考試標誌圖片網址",
  "source": "考試來源",
  "language": "考試使用語言",
  "total_questions": "總題數",
  "questions": [{
    "question": "題目內容",
    "type": "題目類型（single_choice/multiple_choice/ordered_list/multiple_tasks）",
    "options": {
      "A": "選項 A 內容",
      "B": "選項 B 內容",
      "C": "選項 C 內容",
      "D": "選項 D 內容"
    },
    "correct_answer": ["A"],
    "explanation": "答案解釋"
  }]
}
```

## 最新更新

- 新增重置題目數量的關閉按鈕
- 最佳化測驗模式選擇與題目數量驗證
- 實作測驗設定 Modal 視窗
- 新增備份/還原功能
- 改善使用 ReactMarkdown 的題目格式
- 提升使用者介面一致性與樣式
- 新增測驗歷史記錄功能
- 實作儲存空間使用同意管理

## 開發技術

本專案使用：
- React + Vite 實現快速開發
- Joy UI 元件打造現代介面
- ReactMarkdown 支援豐富文字格式
- Local Storage 實作資料持久化

## 參與貢獻

歡迎提交 Pull Request 參與專案開發！如果你想要新增其他認證考試的題庫，可以：

1. 依照上述的 JSON 格式手動整理題目
2. 使用工具協助轉換：
   - 使用 PyPDF2、pdfplumber 等 Python 套件從 PDF 轉換
   - 使用 pdf.js 直接在瀏覽器處理 PDF
   - 使用 OCR 工具辨識圖片格式的題目

請確保轉換後的題目符合專案的 JSON 格式規範。

## 授權條款

本專案採用 GPL-3.0 授權條款。