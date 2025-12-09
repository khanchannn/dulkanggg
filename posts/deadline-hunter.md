---
title: "Deadline Hunter #1"
date: "2025-12-09"
tags: ["devlog", "n8n", "ai", "gemini", "docker", "bilingual", "devops"]
---

> *🇻🇳 Bản tiếng Việt nằm ở phía dưới bài viết (Vietnamese version is available below).*

---

### DevLog #1: How I Built "Deadline Hunter" with n8n and Gemini AI 🤖
### 1. The Idea & The Problem 💡
As a student, my biggest pain point is missing deadlines. Assignment notifications and exam schedules are usually scattered across Zalo/Telegram groups, scrolling away quickly and forgotten by everyone.

I decided to build "Deadline Hunter" - a smart Bot. I just need to forward a message or send a photo of the whiteboard to it. It will automatically read, extract the date and time, and save it to the system to remind me later.

### 2. Infrastructure as Code 🏗️
Instead of manual installation, I use Docker to package everything. This ensures the dev environment is identical to the deploy environment later (DevSecOps mindset).

**The "Holy Grail" `docker-compose.yml` File**
After many times fixing tunnel errors (408 timeout), here is the most stable version using Cloudflare Quick Tunnel:

```yaml
version: '3.8'

services:
  # 1. Database: Storage memory
  postgres:
    image: postgres:15-alpine
    container_name: deadline-postgres
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin_password_123
      POSTGRES_DB: deadline_db
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d deadline_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 2. Automation: The brain processing the flow
  n8n:
    image: n8nio/n8n:latest
    container_name: deadline-n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_SECURE_COOKIE=false
      # Link will be filled after Cloudflare starts
      - WEBHOOK_URL=https://<your-tunnel-url>.trycloudflare.com
    volumes:
      - ./n8n_data:/home/node/.n8n
    networks:
      - app-network
    depends_on:
      postgres:
        condition: service_healthy

  # 3. Networking: Tunnel to Internet (Bypass NAT/Firewall)
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: deadline-tunnel
    restart: always
    command: tunnel --url http://n8n:5678
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**CLI Commands Used:**

```bash
# Start the system
sudo docker-compose up -d

# View logs to get Tunnel link (important)
sudo docker logs -f deadline-tunnel

# Restart only n8n when updating Webhook URL
sudo docker-compose restart n8n
```

### 3. Database Schema Design 🗄️
I accessed the Postgres container to create the table. The table structure is designed to support user identification via Telegram ID.

**DB Access Command:**

```bash
docker exec -it deadline-postgres psql -U admin -d deadline_db
```

**Initialization SQL Script:**

```sql
-- Users Table: Stores who is who
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_chat_id VARCHAR(50) UNIQUE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks Table: Stores things to do
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    due_date TIMESTAMP,
    is_reminded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Building the AI "Brain" in n8n 🧠
This is the most interesting part. The processing workflow goes through 4 steps:

**Step 1: Telegram Trigger (The Ears)**
- Receive message from User.
- Use Webhook from Cloudflare Tunnel to ensure stable connection.

**Step 2: AI Processing (The Brain - Gemini 1.5 Flash)**
- Use Basic LLM Chain node combined with Google Gemini Chat Model.

**Prompt Engineering:**
> "You are a virtual assistant. Extract the task name and deadline from the message. Today is {{ $now }}. Return a single JSON: `{"task_name": "...", "due_date": "YYYY-MM-DD HH:mm:ss"}`."

**Step 3: Data Parsing**
Since AI returns text, I use a Code node (JavaScript) to convert it into a standard JSON Object.

```javascript
const aiOutput = $input.item.json.text;
const jsonString = aiOutput.substring(aiOutput.indexOf('{'), aiOutput.lastIndexOf('}') + 1);
return JSON.parse(jsonString);
```

**Step 4: Database Storage (Memory)**
- Use Postgres node to save data.
- Use Upsert technique (Insert if not exists, Update if exists) to handle User ID.

**Data Mapping:**

```javascript
{{ [
  $('Telegram Trigger').item.json.message.chat.id,
  $('Telegram Trigger').item.json.message.chat.first_name,
  $('Code in JavaScript').item.json.task_name,
  $('Code in JavaScript').item.json.due_date
] }}
```

### 5. Lessons Learned & Troubleshooting 🛠️
During the process, I encountered HTTP 408 Request Timeout error when using n8n's default tunnel.

- **Cause:** n8n's free tunnel is unstable in Vietnam.
- **Solution:** Switched to using `cloudflared` container (Quick Tunnel). Connection is much faster and more stable.
- **Lesson:** Always check Node names exactly when referencing variables (e.g., Code vs Code in JavaScript). One wrong letter and the system errors out immediately.

### 6. Current Results & Next Steps 🚀
Currently, I can text: "Submit English homework next Friday morning" and the Bot automatically saves the correct date and time to the Database.
**Next Steps (To-do list):**
- [ ] Bot replies with confirmation message "Saved".
- [ ] Set up Cronjob to scan Database every 30 minutes.
- [ ] Send reminder messages when due date is approaching (Notification).

---

### DevLog #1: Tôi đã xây dựng "Deadline Hunter" bằng n8n và AI Gemini như thế nào? 🤖


### 1. Ý tưởng & Vấn đề (The Problem) 💡
Là một sinh viên, nỗi đau lớn nhất của tôi là miss deadline. Các thông báo nộp bài tập, lịch thi thường nằm rải rác trong các nhóm chat Zalo/Telegram, trôi đi rất nhanh và không ai nhớ.

Tôi quyết định xây dựng "Deadline Hunter" - một con Bot thông minh. Tôi chỉ cần forward tin nhắn hoặc gửi ảnh chụp bảng cho nó. Nó sẽ tự đọc, tự trích xuất ngày giờ và lưu vào hệ thống để nhắc nhở tôi sau này.

### 2. Chuẩn bị Hạ tầng (Infrastructure as Code) 🏗️
Thay vì cài đặt thủ công, tôi sử dụng Docker để đóng gói mọi thứ. Điều này đảm bảo môi trường dev giống hệt môi trường deploy sau này (Tư duy DevSecOps).

**File `docker-compose.yml` "thần thánh"**
Sau nhiều lần fix lỗi tunnel (lỗi 408 timeout), đây là phiên bản ổn định nhất sử dụng Cloudflare Quick Tunnel:

```yaml
version: '3.8'

services:
  # 1. Database: Nơi lưu trữ bộ nhớ
  postgres:
    image: postgres:15-alpine
    container_name: deadline-postgres
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin_password_123
      POSTGRES_DB: deadline_db
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d deadline_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 2. Automation: Bộ não xử lý luồng
  n8n:
    image: n8nio/n8n:latest
    container_name: deadline-n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_SECURE_COOKIE=false
      # Link này sẽ điền sau khi Cloudflare khởi động
      - WEBHOOK_URL=https://<your-tunnel-url>.trycloudflare.com
    volumes:
      - ./n8n_data:/home/node/.n8n
    networks:
      - app-network
    depends_on:
      postgres:
        condition: service_healthy

  # 3. Networking: Đường hầm ra Internet (Bypass NAT/Firewall)
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: deadline-tunnel
    restart: always
    command: tunnel --url http://n8n:5678
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Các lệnh CLI đã dùng:**

```bash
# Khởi chạy hệ thống
sudo docker-compose up -d

# Xem log để lấy link Tunnel (quan trọng)
sudo docker logs -f deadline-tunnel

# Khởi động lại riêng n8n khi cập nhật Webhook URL
sudo docker-compose restart n8n
```

### 3. Thiết kế Cơ sở dữ liệu (Database Schema) 🗄️
Tôi truy cập vào container Postgres để tạo bảng. Cấu trúc bảng được thiết kế để hỗ trợ định danh người dùng qua Telegram ID.

**Lệnh truy cập DB:**

```bash
docker exec -it deadline-postgres psql -U admin -d deadline_db
```

**Script SQL khởi tạo:**

```sql
-- Bảng Users: Lưu ai là ai
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_chat_id VARCHAR(50) UNIQUE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng Tasks: Lưu việc cần làm
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    due_date TIMESTAMP,
    is_reminded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Xây dựng "Bộ não" AI trong n8n 🧠
Đây là phần thú vị nhất. Quy trình xử lý (Workflow) đi qua 4 bước:

**Bước 1: Telegram Trigger (Đôi tai)**
- Nhận tin nhắn từ User.
- Sử dụng Webhook từ Cloudflare Tunnel để đảm bảo kết nối ổn định.

**Bước 2: AI Processing (Bộ não - Gemini 1.5 Flash)**
- Sử dụng node Basic LLM Chain kết hợp Google Gemini Chat Model.

**Prompt Engineering (Câu lệnh cho AI):**
> "Bạn là trợ lý ảo. Trích xuất tên công việc và deadline từ tin nhắn. Hôm nay là {{ $now }}. Trả về JSON duy nhất: `{"task_name": "...", "due_date": "YYYY-MM-DD HH:mm:ss"}`."

**Bước 3: Data Parsing (Xử lý dữ liệu)**
Vì AI trả về văn bản, tôi dùng node Code (JavaScript) để chuyển nó thành JSON Object chuẩn.

```javascript
const aiOutput = $input.item.json.text;
const jsonString = aiOutput.substring(aiOutput.indexOf('{'), aiOutput.lastIndexOf('}') + 1);
return JSON.parse(jsonString);
```

**Bước 4: Database Storage (Bộ nhớ)**
- Sử dụng node Postgres để lưu dữ liệu.
- Dùng kỹ thuật Upsert (Insert nếu chưa có, Update nếu có rồi) để xử lý User ID.

**Mapping dữ liệu:**

```javascript
{{ [
  $('Telegram Trigger').item.json.message.chat.id,
  $('Telegram Trigger').item.json.message.chat.first_name,
  $('Code in JavaScript').item.json.task_name,
  $('Code in JavaScript').item.json.due_date
] }}
```

### 5. Những bài học & Khắc phục sự cố (Troubleshooting) 🛠️
Trong quá trình làm, tôi đã gặp phải lỗi HTTP 408 Request Timeout khi dùng tunnel mặc định của n8n.

- **Nguyên nhân:** Tunnel miễn phí của n8n không ổn định tại Việt Nam.
- **Giải pháp:** Chuyển sang dùng container cloudflared (Quick Tunnel). Kết nối nhanh và ổn định hơn hẳn.
- **Bài học:** Luôn kiểm tra tên Node chính xác khi tham chiếu biến (Ví dụ: Code vs Code in JavaScript). Sai một chữ là hệ thống báo lỗi đỏ ngay.

### 6. Kết quả hiện tại & Bước tiếp theo 🚀
Hiện tại, tôi đã có thể nhắn tin: "Nộp bài Tiếng Anh sáng thứ 6 tuần sau" và Bot tự động lưu đúng ngày giờ vào Database.

**Next Steps (To-do list):**
- [ ] Bot phản hồi tin nhắn xác nhận "Đã lưu".
- [ ] Thiết lập Cronjob quét Database mỗi 30 phút.
- [ ] Gửi tin nhắn nhắc nhở khi sắp đến hạn (Notification).