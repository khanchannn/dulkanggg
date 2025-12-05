---
title: "Fail2Ban: Protecting Your Server"
date: "2025-12-05"
tags: ["ubuntu", "vps", "security", "network", "bilingual", "fail2ban"]
---

> *🇻🇳 Bản tiếng Việt nằm ở phía dưới bài viết (Vietnamese version is available below).*

---

### Fail2Ban: The Diligent "Bodyguard" Protecting Your Server

Hello everyone! If you operate a server (VPS/Dedicated), you surely know that uneasy feeling of seeing thousands of unauthorized login attempts (brute-force) hitting your system daily.

Don't worry, Fail2Ban was born to solve this. Think of Fail2Ban as a security guard who reads your server logs 24/7. The moment he spots suspicious activity (like too many wrong passwords), he immediately signals the Firewall to "lock out" that intruder.

Today, I’ll guide you from A to Z on how to install and use this amazing tool.

### 1. Installation (Easy as Pie)

On popular operating systems like Ubuntu or Debian, you only need one command:

```bash
sudo apt install fail2ban
```

### 2. Configuration: The Rules of the Game

This is the most important part. Fail2Ban has a very cool configuration principle: It reads `.conf` files first, but it will prioritize `.local` files.

**Tip:** Never edit the `.conf` file directly. Copy it to a `.local` file to edit. This helps you keep the original file intact and prevents losing your configuration when the software updates.

Create a local configuration file:

```bash
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

Now open the `/etc/fail2ban/jail.local` file and edit the core parameters:

*   **ignoreip**: The "Death Exemption" list. Enter your own IP or your company's IP here to avoid accidentally locking yourself out if you type the wrong password.
*   **bantime**: The "Jail time" (in seconds). Default is 600s (10 minutes). I usually increase this to 3600s or more just to be safe.
*   **findtime & maxretry**: This is the "Three strikes and you're out" rule. Example: Within the `findtime` window (10 minutes), if there are more than `maxretry` (3) failed attempts, then BAN.

**Example SSH protection configuration:**
By default, SSH is enabled, but you should double-check the `[ssh]` block:

```ini
[ssh]
enabled  = true
port     = ssh      # If you changed your SSH port (e.g., 2222), enter 2222 here
filter   = sshd
logpath  = /var/log/auth.log
maxretry = 3
```

### 3. Advanced: Creating Custom Filters for Websites

Fail2Ban doesn't just protect SSH; it can protect Nginx, Apache, or even your WordPress login page. The principle is using Regex (Regular Expressions) to scan logs. For example, let's say you want to block someone trying to brute-force `wp-login.php`.

**Step 1: Check the log**
See what traces the attacker leaves. Example in `/var/log/nginx/access.log`:
`123.123.123.123 ... "POST /wp-login.php HTTP/1.1" 200 ...`

**Step 2: Write the Regex**
We will translate the log line above into a language Fail2Ban understands:
`<HOST> - - \[(\d{2})/\w{3}/\d{4}:\1:\1:\1 -\d{4}\] "POST /wp-login.php HTTP/1.1" 200`

**Step 3: Create a new filter**
Create the file `/etc/fail2ban/filter.d/wordpress.conf`:

```ini
[Definition]
failregex = <HOST> - - \[(\d{2})/\w{3}/\d{4}:\1:\1:\1 -\d{4}\] "POST /wp-login.php HTTP/1.1" 200
ignoreregex =
```

Then remember to restart the service:

```bash
sudo service fail2ban restart
```

### 4. Management and Monitoring

Once installed, you need to know what it's actually doing, right?

**See how many "bad guys" Fail2Ban has caught:**

```bash
sudo fail2ban-client status
```

**See the list of IPs currently blocked in the firewall:**

```bash
sudo iptables -L -n -v
```

### 5. For Pros: Installing the Latest Version from Source

Sometimes the repository (Repo) on Ubuntu/Debian is a bit outdated. If you want the latest features (like better IPv6 support), install it manually.

**Step 1: Remove the old version**

```bash
sudo apt purge fail2ban
```

**Step 2: Download and Install**
Visit the Fail2Ban Github to get the link for the latest version, then:

```bash
# Download and extract (e.g., version 0.10.4)
tar xvfj fail2ban-0.10.4.tar.bz2
cd fail2ban-0.10.4

# Install via Python
sudo python setup.py install
```

**Step 3: Create a System Boot Service**
Since you installed it manually, you need to copy the init script yourself:

```bash
cp files/debian-initd /etc/init.d/fail2ban
update-rc.d fail2ban defaults
service fail2ban start
```

Then verify it with the command `fail2ban-client version` and you're done!

---

### Fail2Ban: Chàng "Vệ sĩ" Cần Mẫn Bảo Vệ Server Của Bạn

Chào mọi người! Nếu bạn đang vận hành một server (VPS/Dedicated), chắc hẳn bạn biết cảm giác bất an khi hàng ngày có hàng ngàn lượt cố gắng đăng nhập trái phép (brute-force) vào hệ thống.

Đừng lo, Fail2Ban sinh ra là để giải quyết vấn đề này. Hãy tưởng tượng Fail2Ban như một người bảo vệ ngồi đọc nhật ký (logs) của server 24/7. Hễ thấy ai có dấu hiệu khả nghi (như gõ sai mật khẩu quá nhiều lần), anh ta sẽ lập tức báo cho tường lửa (Firewall) "cấm cửa" kẻ đó ngay lập tức.

Hôm nay mình sẽ hướng dẫn các bạn từ A-Z cách cài đặt và sử dụng công cụ tuyệt vời này nhé.

### 1. Cài đặt (Dễ như ăn kẹo)

Trên các hệ điều hành phổ biến như Ubuntu hay Debian, bạn chỉ cần một câu lệnh:

```bash
sudo apt install fail2ban
```

### 2. Cấu hình: Quy tắc của trò chơi

Đây là phần quan trọng nhất. Fail2Ban có một nguyên tắc cấu hình rất hay: Nó đọc file `.conf` trước, nhưng sẽ ưu tiên file `.local`.

**Mẹo:** Đừng bao giờ sửa trực tiếp file `.conf`. Hãy copy ra file `.local` để sửa. Điều này giúp bạn giữ nguyên file gốc và không bị mất cấu hình khi cập nhật phần mềm.

Tạo file cấu hình local:

```bash
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

Bây giờ hãy mở file `/etc/fail2ban/jail.local` và chỉnh sửa các thông số cốt lõi:

*   **ignoreip**: Danh sách các IP "được miễn tử". Hãy điền IP của chính bạn hoặc công ty vào đây để tránh trường hợp lỡ tay gõ sai mật khẩu mà tự nhốt mình ở ngoài.
*   **bantime**: Thời gian "đi tù" (tính bằng giây). Mặc định là 600s (10 phút). Mình thường tăng lên 3600s hoặc hơn cho chắc ăn.
*   **findtime & maxretry**: Đây là luật "quá tam ba bận". Ví dụ: Trong khoảng thời gian `findtime` (10 phút), nếu đăng nhập sai quá `maxretry` (3 lần) thì BAN.

**Ví dụ cấu hình bảo vệ SSH:**
Mặc định SSH đã được bật, nhưng bạn nên kiểm tra lại đoạn cấu hình `[ssh]`:

```ini
[ssh]
enabled  = true
port     = ssh      # Nếu bạn đổi port SSH (ví dụ 2222), hãy điền số 2222 vào đây
filter   = sshd
logpath  = /var/log/auth.log
maxretry = 3
```

### 3. Nâng cao: Tự tạo bộ lọc (Filters) cho Website

Fail2Ban không chỉ bảo vệ SSH, nó bảo vệ được cả Nginx, Apache hay thậm chí là trang đăng nhập WordPress của bạn.

Nguyên lý là sử dụng Regex (Biểu thức chính quy) để soi log. Ví dụ bạn muốn chặn ai đó cố dò mật khẩu trang `wp-login.php`.

**Bước 1: Soi log**
Xem kẻ tấn công để lại dấu vết gì. Ví dụ trong `/var/log/nginx/access.log`:
`123.123.123.123 ... "POST /wp-login.php HTTP/1.1" 200 ...`

**Bước 2: Viết Regex**
Chúng ta sẽ chuyển dòng log trên thành ngôn ngữ mà Fail2Ban hiểu:
`<HOST> - - \[(\d{2})/\w{3}/\d{4}:\1:\1:\1 -\d{4}\] "POST /wp-login.php HTTP/1.1" 200`

**Bước 3: Tạo filter mới**
Tạo file `/etc/fail2ban/filter.d/wordpress.conf`:

```ini
[Definition]
failregex = <HOST> - - \[(\d{2})/\w{3}/\d{4}:\1:\1:\1 -\d{4}\] "POST /wp-login.php HTTP/1.1" 200
ignoreregex =
```

Sau đó nhớ restart lại service nhé:

```bash
sudo service fail2ban restart
```

### 4. Quản lý và Theo dõi

Cài xong rồi thì phải biết xem nó đang làm gì chứ nhỉ?

**Xem Fail2Ban đang "bắt" được bao nhiêu đứa:**

```bash
sudo fail2ban-client status
```

**Xem danh sách IP đang bị chặn trong tường lửa:**

```bash
sudo iptables -L -n -v
```

### 5. Dành cho Pro: Cài đặt phiên bản mới nhất từ Source

Đôi khi kho ứng dụng (Repo) của Ubuntu/Debian cập nhật khá chậm. Nếu bạn muốn dùng các tính năng mới nhất (như hỗ trợ IPv6 tốt hơn), hãy cài thủ công.

**Bước 1: Gỡ bản cũ**

```bash
sudo apt purge fail2ban
```

**Bước 2: Tải và cài đặt**
Truy cập Github của Fail2Ban để lấy link bản mới nhất, sau đó:

```bash
# Tải về và giải nén (ví dụ bản 0.10.4)
tar xvfj fail2ban-0.10.4.tar.bz2
cd fail2ban-0.10.4

# Cài đặt bằng Python
sudo python setup.py install
```

**Bước 3: Tạo service khởi động cùng Windows**
Vì cài thủ công nên bạn phải tự copy file khởi động (init script):

```bash
cp files/debian-initd /etc/init.d/fail2ban
update-rc.d fail2ban defaults
service fail2ban start
```

Sau đó kiểm tra lại bằng lệnh `fail2ban-client version` là xong!