---
title: "Deadline Hunter #2: Upgrading AI Agent - From 'Note Taker' to Real 'Virtual Assistant'"
date: "2025-12-14"
tags: ["devlog", "n8n", "ai", "gemini", "postgres", "javascript", "bilingual"]
---

> *🇻🇳 Bản tiếng Việt nằm ở phía dưới bài viết (Vietnamese version is available below).*

---

### DevLog #2: Upgrading AI Agent - From "Note Taker" to Real "Virtual Assistant" 🤖
**Author:** Dulkang | **Project:** Deadline Hunter (AI Security Agent) | **Tech Stack:** n8n, PostgreSQL, Google Gemini 1.5 Flash, JavaScript.

### 1. The Challenge 💡
In DevLog #1, my Bot did a good job of "Listening and Saving". I said "Submit homework tomorrow", it saved to the Database. However, it was quite... "mindless".

The problem arose when I wanted to ask it back: "Hey Bot, do I have anything this week?".

**Old system:** It would think I was assigning a new task and save a task named "Do I have anything this week?" to the Database. 🤦‍♂️

**Goal:** The Bot must distinguish the User's **Intent**: When is it Assigning (**Add**) and when is it Querying (**Query**).

### 2. The Solution 🏗️
I decided to refactor the Workflow, switching from a **Linear** model to a **Routing** model.

**New processing flow diagram:**
`Telegram Input` ➔ `AI Agent (Classify)` ➔ `Switch (Router)`

➡️ **Branch 1 (Add):** Save to Postgres ➔ Report "Saved".

➡️ **Branch 2 (Query):** Select from Postgres ➔ AI Summarize ➔ Reply with list.

### 3. Execution Process & Key Techniques 🛠️
#### A. Teaching AI to classify intent (Prompt Engineering)
Instead of just extracting information, I upgraded the Prompt so Gemini returns an additional `intent` field.

```javascript
// Upgraded Prompt
Analyze the message to determine INTENT:
1. "add": Assign new task (Example: "Submit homework tomorrow").
2. "query": Ask for schedule (Example: "Check deadline").

Required JSON Output:
{
  "intent": "add" or "query",
  "task_name": "...",
  "due_date": "..."
}
```

#### B. Handling Timezone "Matrix"
This was the most "fatal" bug. When I chatted at 3 PM, the Server (UTC) thought it was 8 AM. Leading to "in 1 hour" calculations being completely off.

**Solution:** I used Luxon in n8n and forced time casting right in the AI Prompt: `CURRENT TIME: {{ $now.setZone('Asia/Ho_Chi_Minh').format('yyyy-MM-dd HH:mm') }}`. This helps AI have a "watch" with standard Vietnam time to calculate relative milestones (like "tomorrow morning", "this afternoon", "in 30 minutes").

#### C. "Query Branch" Technique
At this branch, I don't let the Bot return raw data (Raw JSON) from the Database because it looks very dry. I use a simple **RAG** model (Retrieval-Augmented Generation):

1.  **Retrieve:** Get 5 latest tasks from SQL.
2.  **Generate:** Feed those 5 tasks to AI Agent with prompt: *"Summarize this list like a friendly secretary"* to get the most natural answer.

### 4. Troubleshooting & Lessons Learned 🐛
During dev, I encountered 3 major errors and here is how I overcame them:

🔴 **Error 1: Switch Node not working**
*   **Phenomenon:** Data passed through AI but got stuck at Switch.
*   **Cause:** AI returned String, but Switch needed JSON Object.
*   **Fix:** Place a **Code node** (`JSON.parse`) before the Switch node to decode data before routing.

🔴 **Error 2: Bot "Muted" when asking for schedule**
*   **Phenomenon:** Query branch reported SQL error.
*   **Cause:** I mistakenly copied the formula from the Add branch. Add branch needs 4 parameters, but Query branch only needs `$1` (Telegram ID).
*   **Fix:** Simplify SQL parameters and cast data type `$1::varchar` to match Database.

🔴 **Error 3: Bot Spamming messages (Loop Issue)**
*   **Phenomenon:** Found 5 tasks, Bot sent 5 separate messages immediately.
*   **Cause:** n8n's default mechanism is to run loop through each item (Run for each item).
*   **Fix:** Use **Limit node** to block the flow, allowing AI activation only once, but still allowing AI to read all data using `.all()` function.

### 5. Results & Next Steps 🚀
Currently, "Deadline Hunter" can:
✅ Understand context (Assign vs Ask).
✅ Read images (OCR Vision).
✅ Calculate time accurately according to Vietnam time.
✅ Reply naturally, with emotion.

**Next Steps:**
- [ ] Add Menu Button on Telegram (`/start`, `/help`).
- [ ] Build Dashboard Web (Frontend Next.js) to view schedule visually.

---

### DevLog #2: Nâng cấp AI Agent - Từ "Máy ghi chép" thành "Trợ lý ảo" thực thụ 🤖
**Tác giả:** Dulkang | **Dự án:** Deadline Hunter (AI Security Agent) | **Tech Stack:** n8n, PostgreSQL, Google Gemini 1.5 Flash, JavaScript.

### 1. Vấn đề & Thách thức (The Challenge) 💡
Ở DevLog #1, Bot của tôi đã làm tốt việc "Nghe và Lưu". Tôi bảo "Mai nộp bài", nó lưu vào Database. Tuy nhiên, nó khá... "vô tri".

Vấn đề nảy sinh khi tôi muốn hỏi ngược lại nó: "Ê Bot, tuần này tao có việc gì không?".

**Hệ thống cũ:** Nó sẽ tưởng tôi đang giao việc mới và lưu một task tên là "Tuần này tao có việc gì không?" vào Database. 🤦‍♂️

**Mục tiêu:** Bot phải phân biệt được **Ý định (Intent)** của người dùng: Khi nào là Giao việc (**Add**) và khi nào là Tra cứu (**Query**).

### 2. Giải pháp Kiến trúc (The Solution) 🏗️
Tôi quyết định tái cấu trúc lại Workflow, chuyển từ mô hình **Tuyến tính (Linear)** sang mô hình **Rẽ nhánh (Routing)**.

**Sơ đồ luồng xử lý mới:**
`Telegram Input` ➔ `AI Agent (Phân loại)` ➔ `Switch (Bộ điều hướng)`

➡️ **Nhánh 1 (Add):** Lưu vào Postgres ➔ Báo "Đã lưu".

➡️ **Nhánh 2 (Query):** Select từ Postgres ➔ AI Tóm tắt ➔ Trả lời danh sách.

### 3. Quá trình thực thi & Các kỹ thuật chính 🛠️
#### A. Dạy AI phân loại ý định (Prompt Engineering)
Thay vì chỉ trích xuất thông tin, tôi nâng cấp Prompt để Gemini trả về thêm trường `intent`.

```javascript
// Prompt nâng cấp
Phân tích tin nhắn để xác định Ý ĐỊNH:
1. "add": Giao việc mới (Ví dụ: "Mai nộp bài").
2. "query": Hỏi lịch (Ví dụ: "Kiểm tra deadline").

Output JSON bắt buộc:
{
  "intent": "add" hoặc "query",
  "task_name": "...",
  "due_date": "..."
}
```

#### B. Xử lý "Ma trận" thời gian (Timezone Handling)
Đây là bug "chí mạng" nhất. Khi tôi chat lúc 15h, Server (UTC) lại nghĩ là 8h sáng. Dẫn đến việc tính toán "sau 1 tiếng nữa" bị sai lệch hoàn toàn.

**Giải pháp:** Tôi đã sử dụng Luxon trong n8n và ép kiểu thời gian ngay trong Prompt của AI: `THỜI GIAN HIỆN TẠI: {{ $now.setZone('Asia/Ho_Chi_Minh').format('yyyy-MM-dd HH:mm') }}`. Điều này giúp AI có một "chiếc đồng hồ" chuẩn giờ Việt Nam để tính toán các mốc thời gian tương đối (như "sáng mai", "chiều nay", "sau 30 phút").

#### C. Kỹ thuật "Query Branch" (Nhánh tra cứu)
Tại nhánh này, tôi không cho Bot trả về dữ liệu thô (Raw JSON) từ Database vì trông rất khô khan. Tôi sử dụng mô hình **RAG** đơn giản (Retrieval-Augmented Generation):

1.  **Retrieve:** Lấy 5 task gần nhất từ SQL.
2.  **Generate:** Đưa 5 task đó vào AI Agent với prompt: *"Hãy tóm tắt danh sách này như một thư ký thân thiện"* để có câu trả lời tự nhiên nhất.

### 4. Những Bug "đau đầu" & Cách sửa (Troubleshooting) 🐛
Trong quá trình dev, tôi đã gặp 3 lỗi lớn và đây là cách tôi vượt qua:

🔴 **Lỗi 1: Switch Node không hoạt động**
*   **Hiện tượng:** Dữ liệu đi qua AI nhưng tắc ở Switch.
*   **Nguyên nhân:** AI trả về String, nhưng Switch cần JSON Object.
*   **Fix:** Đặt node **Code** (`JSON.parse`) trước node Switch để giải mã dữ liệu xong mới điều hướng.

🔴 **Lỗi 2: Bot bị "Câm" khi hỏi lịch**
*   **Hiện tượng:** Nhánh Query báo lỗi SQL.
*   **Nguyên nhân:** Tôi copy nhầm công thức từ nhánh Add sang. Nhánh Add cần 4 tham số, nhưng nhánh Query chỉ cần `$1` (Telegram ID).
*   **Fix:** Tối giản hóa tham số SQL và ép kiểu dữ liệu `$1::varchar` để khớp với Database.

🔴 **Lỗi 3: Bot Spam tin nhắn (Loop Issue)**
*   **Hiện tượng:** Tìm thấy 5 công việc, Bot gửi luôn 5 tin nhắn riêng lẻ.
*   **Nguyên nhân:** Cơ chế mặc định của n8n là chạy lặp qua từng item (Run for each item).
*   **Fix:** Sử dụng **node Limit** để chặn dòng chảy, chỉ cho phép kích hoạt AI 1 lần duy nhất, nhưng vẫn cho phép AI đọc toàn bộ dữ liệu bằng hàm `.all()`.

### 5. Kết quả & Hướng phát triển 🚀
Hiện tại, "Deadline Hunter" đã có thể:
✅ Hiểu ngữ cảnh (Giao việc vs Hỏi việc).
✅ Đọc được cả hình ảnh (OCR Vision).
✅ Tính toán thời gian chuẩn xác theo giờ Việt Nam.
✅ Trả lời tự nhiên, có cảm xúc.

**Next Steps:**
- [ ] Thêm Menu Button trên Telegram (`/start`, `/help`).
- [ ] Xây dựng Dashboard Web (Frontend Next.js) để xem lịch trực quan.