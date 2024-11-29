# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

```
{
  "exam_title": "考試標題",
  "logo_url": "考試 logo 圖片網址",
  "source": "考試來源",
  "language": "考試使用語言",
  "total_questions": "總題數",
  "questions": [{
    "question": "題目內容",
    "type": "題目類型：single_choice(單選), multiple_choice(多選), ordered_list(排序), multiple_tasks(多任務)",
    "options": {
      "A": "選項A內容",
      "B": "選項B內容",
      "C": "選項C內容", 
      "D": "選項D內容",
      "E": "選項E內容 (僅多選題)"
    },
    "correct_answer": "正確答案：單選題為單一字母(如:A)，多選題為字母陣列(如:[A,B])，排序題為字母陣列(如:[B,C,A])，多任務題為字母字串(如:BAABA)",
    "explanation": "答案解釋"
  }]
}
```