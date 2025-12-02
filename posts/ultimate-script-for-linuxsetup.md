---
title: "A Friendly Guide to Setting Up a Fresh Ubuntu Server"
date: "2025-12-01"
tags: ["ubuntu", "vps", "automation", "docker", "bilingual"]
---

> *🇻🇳 Bản tiếng Việt nằm ở phía dưới bài viết (Vietnamese version is available below).*

---

### The "I Forgot to Install Git Again" Solution
![linux](../public/images/linux.png)
Hey everyone!

We’ve all been there. You just spun up a fresh Ubuntu VPS or a new Virtual Machine. You’re excited to start deploying your project. You SSH in, ready to rock, you type `git clone...` and boom:

> `bash: git: command not found`

**Ugh. Frustrating, right?**

Then you install Git. Then you try to unzip a file. Command not found. Then you realize `htop` isn't there. And worse, halfway through the night, you remember you completely forgot to configure the firewall, leaving your server wide open.

Honestly, remembering every single utility and security package for every new server is a pain. It’s repetitive, and manual work leads to mistakes.

That’s why I decided to stop doing it manually and wrote a **"One-Click" script** to handle the boring stuff for me. I’m sharing it here so you can save time (and sanity) too.

#### The Essentials: What We Are Installing

Before we get to the script, here is the "Survival Kit" I believe every modern Ubuntu server needs:

1.  **The Toolbox (System Utilities)**
    * **curl & wget:** For downloading stuff.
    * **git:** Because how else are you getting your code?
    * **vim / nano:** You need to edit config files somehow.
    * **htop:** Because the default `top` is hard to read.
    * **unzip & net-tools:** For managing archives and checking network stats (`ifconfig`).

2.  **The Bodyguards (Security)**
    * **ufw (Uncomplicated Firewall):** The easiest way to manage ports.
    * **fail2ban:** A must-have. It watches for repeated failed login attempts (brute-force attacks) and automatically bans those IP addresses.

3.  **The Engine Room (Web & Containers)**
    * **nginx:** A lightweight, high-performance web server and reverse proxy.
    * **docker & docker-compose:** It’s 2024 (almost 2025!). We shouldn't be installing messy dependencies directly on the OS anymore. Docker keeps everything clean and portable.

#### The Script

Here is the magic shell script. It automates everything: updates the system, installs the tools, configures the firewall to allow SSH (so you don't lock yourself out!), and sets up Docker.

**How to use it:**

1.  Create a file: `nano setup_server.sh`
2.  Paste the code below.
3.  Make it executable: `chmod +x setup_server.sh`
4.  Run it: `sudo ./setup_server.sh`

```bash
#!/bin/bash

# ==========================================
# The Ultimate Ubuntu Server Setup Script
# Author: Khang (Dulkanggg)
# ==========================================

# 1. Check for Root Privileges
if [ "$EUID" -ne 0 ]; then 
  echo "Please run this script as root (use sudo)"
  exit
fi

echo "--- STARTING SYSTEM UPDATE ---"
apt update && apt upgrade -y

echo "--- 1. INSTALLING ESSENTIAL UTILITIES ---"
# Installing curl, wget, git, htop, vim, unzip, net-tools, etc.
apt install -y curl wget git htop vim nano unzip net-tools software-properties-common ca-certificates gnupg lsb-release

echo "--- 2. SETTING UP SECURITY (UFW & FAIL2BAN) ---"
apt install -y ufw fail2ban

# Configuring Basic Firewall Rules
# IMPORTANT: We must allow SSH first to prevent locking ourselves out!
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable UFW (Auto-confirm 'yes')
echo "y" | ufw enable

echo "--- 3. INSTALLING NGINX (Web Server) ---"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo "--- 4. INSTALLING DOCKER & DOCKER COMPOSE ---"
# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL [https://download.docker.com/linux/ubuntu/gpg](https://download.docker.com/linux/ubuntu/gpg) | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] [https://download.docker.com/linux/ubuntu](https://download.docker.com/linux/ubuntu) \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
systemctl start docker
systemctl enable docker

# Add current user to Docker group (so you don't need 'sudo' for docker commands)
# Note: This checks for the user who ran the sudo command
if [ -n "$SUDO_USER" ]; then
    usermod -aG docker $SUDO_USER
    echo "User $SUDO_USER has been added to the docker group."
fi

echo "--- SYSTEM CLEANUP ---"
apt autoremove -y

echo "=========================================="
echo "   SETUP COMPLETE! READY TO ROCK."
echo "=========================================="
echo "Versions Installed:"
echo "- Nginx: $(nginx -v 2>&1 | cut -d '/' -f 2)"
echo "- Docker: $(docker --version)"
echo "- UFW Status: $(ufw status | grep 'Status')"
echo "NOTE: Please logout and login again to apply Docker group permissions."
```
---

### Wrapping Up
And that’s it! In about 2 minutes, you go from a blank slate to a fully secured, Docker-ready server with all the creature comforts installed.
Hopefully, this script saves you some time on your next project. Let me know if you think I missed any essential tools in the comments below!
Happy Coding!

-----




### Hội chứng "Quên cài Git" và chiếc Script cứu cánh cho Ubuntu Server mới

Chào mọi người,

Chắc hẳn ai trong chúng ta cũng từng rơi vào cảnh này ít nhất một (hoặc nhiều) lần. Bạn vừa thuê được một con VPS ngon nghẻ, hoặc vừa tạo xong một máy ảo (VM) Ubuntu mới cứng để làm lab. Tâm trạng đang hừng hực khí thế, SSH vào server, gõ lệnh đầu tiên định kéo source về:

`git clone ...`

Và hệ thống trả về một câu xanh rờn:

> `bash: git: command not found`

**Cụt hứng thực sự!**

Thế là lại phải ngồi `apt install git`. Xong xuôi, định giải nén cái file data thì lại thiếu `unzip`. Muốn xem RAM, CPU thế nào cho trực quan thì nhớ ra chưa cài `htop`. Tệ hơn nữa là hì hục cả đêm deploy xong, sáng hôm sau mới tá hỏa nhận ra mình... quên bật tường lửa (Firewall), server "trần trụi" giữa internet.

Việc nhớ hết tất cả những gói phần mềm (packages) lặt vặt mỗi khi cài lại máy thực sự rất phiền phức và tốn thời gian. Mà làm thủ công thì kiểu gì cũng sót.

Đó là lý do mình quyết định không làm "thủ công mỹ nghệ" nữa. Thay vào đó, mình gom tất cả vào một script duy nhất. Chỉ cần chạy một dòng lệnh, đi pha cốc cà phê, quay lại là đã có một server "full option" để sẵn sàng chiến đấu.

Hôm nay mình chia sẻ lại script này cho anh em, hy vọng giúp mọi người tiết kiệm thời gian (và đỡ bực mình).

#### Bộ "đồ nghề" sinh tồn (Survival Kit) gồm những gì?

Trước khi đi vào script, điểm qua xem chúng ta sẽ cài những gì và tại sao nó cần thiết nhé:

**1. Nhóm Công cụ (System Utilities) - "Thiếu thì rất bực"**

* **curl & wget:** Để tải file, test API.
* **git:** Không có cái này thì lấy code kiểu gì?
* **vim / nano:** Để sửa file config nhanh gọn.
* **htop:** Xem tài nguyên máy (RAM/CPU) sướng hơn lệnh `top` mặc định nhiều.
* **unzip & net-tools:** Giải nén file và check IP/Port (`ifconfig`, `netstat`).

**2. Nhóm Vệ sĩ (Security)

* **ufw:** Tường lửa đơn giản nhất quả đất. Đóng hết các cửa, chỉ mở cửa cho mình vào thôi.
* **fail2ban:** Thằng này cực hay. Nó sẽ canh cửa SSH, ai gõ sai mật khẩu nhiều lần là nó chặn (ban) IP đó luôn. Chống dò mật khẩu cực tốt.

**3. Nhóm Vận hành (Engine Room)

* **nginx:** Web server nhẹ, làm Reverse Proxy cực mượt.
* **docker & docker-compose:** Giờ là thời đại của Container rồi. Cài database, redis hay app thì cứ đóng vào Docker cho sạch máy, đỡ xung đột thư viện.

---

#### Script "One-Click" (Tự động hóa)

Đây là đoạn script bash sẽ làm hết mọi việc từ A-Z: cập nhật hệ thống, cài tool, và quan trọng nhất là cấu hình Firewall chuẩn để bạn không bị... tự nhốt mình ở ngoài (do chặn nhầm port SSH).

**Cách dùng:**

1.  Tạo file mới: `nano setup_server.sh`
2.  Copy nội dung bên dưới dán vào.
3.  Cấp quyền chạy: `chmod +x setup_server.sh`
4.  Chạy script (cần quyền root): `sudo ./setup_server.sh`

```bash
#!/bin/bash

# ==========================================
# Script Cài đặt Ubuntu Server "Full Option"
# Tác giả: Khang (Dulkanggg)
# ==========================================

# 1. Kiểm tra xem có phải đang chạy bằng quyền Root không
if [ "$EUID" -ne 0 ]; then 
  echo "Lỗi: Bạn phải chạy script này bằng quyền root (sudo)"
  exit
fi

echo "--- BẮT ĐẦU CẬP NHẬT HỆ THỐNG (Ngồi chờ xíu nhé...) ---"
apt update && apt upgrade -y

echo "--- 1. CÀI ĐẶT CÔNG CỤ CƠ BẢN (Utilities) ---"
# Mấy cái này thiếu là rất khó chịu
apt install -y curl wget git htop vim nano unzip net-tools software-properties-common ca-certificates gnupg lsb-release

echo "--- 2. CÀI ĐẶT BẢO MẬT (UFW & FAIL2BAN) ---"
apt install -y ufw fail2ban

# Cấu hình Tường lửa (Firewall)
# QUAN TRỌNG: Phải mở port SSH (22) trước, không là mất kết nối luôn!
ufw default deny incoming  # Chặn tất cả chiều vào
ufw default allow outgoing # Cho phép tất cả chiều ra
ufw allow ssh              # Mở cổng SSH
ufw allow 22/tcp
ufw allow 80/tcp           # Mở cổng Web (HTTP)
ufw allow 443/tcp          # Mở cổng Web (HTTPS)

# Kích hoạt UFW (Tự động chọn 'yes')
echo "y" | ufw enable

echo "--- 3. CÀI ĐẶT NGINX (Web Server) ---"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo "--- 4. CÀI ĐẶT DOCKER & DOCKER COMPOSE ---"
# Thêm key chính thức của Docker
mkdir -p /etc/apt/keyrings
curl -fsSL [https://download.docker.com/linux/ubuntu/gpg](https://download.docker.com/linux/ubuntu/gpg) | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Thiết lập repository tải về
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] [https://download.docker.com/linux/ubuntu](https://download.docker.com/linux/ubuntu) \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Bật Docker service
systemctl start docker
systemctl enable docker

# Thêm user hiện tại vào nhóm docker (để gõ lệnh docker không cần thêm sudo)
if [ -n "$SUDO_USER" ]; then
    usermod -aG docker $SUDO_USER
    echo "Đã thêm user $SUDO_USER vào nhóm docker."
fi

echo "--- DỌN DẸP RÁC HỆ THỐNG ---"
apt autoremove -y

echo "=========================================="
echo "   CÀI ĐẶT HOÀN TẤT! CHIẾN THÔI."
echo "=========================================="
echo "Các phiên bản đã cài:"
echo "- Nginx: $(nginx -v 2>&1 | cut -d '/' -f 2)"
echo "- Docker: $(docker --version)"
echo "- Tường lửa (UFW): $(ufw status | grep 'Status')"
echo "LƯU Ý: Hãy Logout và Login lại để áp dụng quyền Docker nhé!"
```
---
### Lời kết
Vậy là xong! Chỉ mất tầm 2-3 phút chạy script, bạn đã biến một con server "trắng trơn" thành một môi trường đầy đủ tiện nghi, bảo mật cơ bản tốt và sẵn sàng chạy Docker.

Hy vọng cái script nhỏ này giúp ích cho anh em trong quá trình "vọc vạch" server. Nếu anh em thấy còn thiếu món "đồ chơi" nào quan trọng nữa thì comment bên dưới để mình bổ sung vào script nhé!