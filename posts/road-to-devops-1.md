---
title: "Road to DevOps #1 | Web server with Nginx and Log monitoring with GoAccess"
date: "2025-12-01"
tags: ["cybersecurity", "personal", "bilingual", "devops", "nginx"]
---

> *🇻🇳 Bản tiếng Việt nằm ở phía dưới bài viết (Vietnamese version is available below).*

---

### Road to DevOps #1 | Web server with Nginx and Log monitoring with GoAccess 🚀

Hi everyone! 👋

Welcome to the first post in my "Road to DevOps" series. Today, we will start with something fundamental but essential: setting up a Web Server and monitoring it.

We will use **Nginx** as our web server and **GoAccess** to analyze and visualize the logs in real-time.

Let's get started! 👇

### 1. Setting up Nginx 🌐

Nginx is a high-performance HTTP web server. It's lightweight and very popular.

**Install Nginx:**
On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install nginx -y
```

**Check status:**
After installation, check if Nginx is running:
```bash
sudo systemctl status nginx
```

**Basic Configuration:**
Nginx configuration files are located in `/etc/nginx/`. The default site is usually defined in `/etc/nginx/sites-available/default`.

You can access your server's IP address in a web browser to see the "Welcome to nginx!" page.

### 2. Setting up GoAccess 📊

GoAccess is an open source real-time web log analyzer and interactive viewer that runs in a terminal in *nix systems or through your browser.

**Install GoAccess:**
```bash
echo "deb http://deb.goaccess.io/ $(lsb_release -cs) main" | sudo tee -a /etc/apt/sources.list.d/goaccess.list
wget -O - https://deb.goaccess.io/gnugpg.key | sudo apt-key --keyring /etc/apt/trusted.gpg.d/goaccess.gpg add -
sudo apt update
sudo apt install goaccess -y
```

**Run GoAccess:**
To analyze the Nginx access log:
```bash
sudo goaccess /var/log/nginx/access.log
```
You will see a terminal dashboard with hits, visitors, and bandwidth metrics.

**Generate HTML Report:**
To view a beautiful HTML dashboard, run:
```bash
sudo goaccess /var/log/nginx/access.log -o /var/www/html/report.html --log-format=COMBINED --real-time-html
```
Now navigate to `http://your-server-ip/report.html` to see the report!

### 3. Conclusion

We have successfully set up a basic web server and a monitoring tool. This is the first step in understanding how web infrastructure works.

See you in the next post! Happy coding! 💻🔥

---

### Road to DevOps #1 | Web Server với Nginx và Giám sát Log với GoAccess 🚀

Chào mọi người! 👋

Chào mừng các bạn đến với bài viết đầu tiên trong series "Road to DevOps" của mình. Hôm nay, chúng ta sẽ bắt đầu với một thứ cơ bản nhưng cực kỳ quan trọng: thiết lập Web Server và giám sát nó.

Chúng ta sẽ sử dụng **Nginx** làm web server và **GoAccess** để phân tích và trực quan hóa log theo thời gian thực.

Bắt đầu thôi! 👇

### 1. Cài đặt Nginx 🌐

Nginx là một web server HTTP hiệu năng cao, nhẹ và rất phổ biến.

**Cài đặt Nginx:**
Trên Ubuntu/Debian:
```bash
sudo apt update
sudo apt install nginx -y
```

**Kiểm tra trạng thái:**
Sau khi cài đặt, hãy kiểm tra xem Nginx có đang chạy không:
```bash
sudo systemctl status nginx
```

**Cấu hình cơ bản:**
Các file cấu hình của Nginx nằm trong `/etc/nginx/`. Trang default thường được định nghĩa trong `/etc/nginx/sites-available/default`.

Bạn có thể truy cập địa chỉ IP của server trên trình duyệt web để xem trang "Welcome to nginx!".

### 2. Cài đặt GoAccess 📊

GoAccess là một công cụ phân tích log web thời gian thực mã nguồn mở và là trình xem tương tác chạy trên terminal trong các hệ thống *nix hoặc qua trình duyệt của bạn.

**Cài đặt GoAccess:**
```bash
echo "deb http://deb.goaccess.io/ $(lsb_release -cs) main" | sudo tee -a /etc/apt/sources.list.d/goaccess.list
wget -O - https://deb.goaccess.io/gnugpg.key | sudo apt-key --keyring /etc/apt/trusted.gpg.d/goaccess.gpg add -
sudo apt update
sudo apt install goaccess -y
```

**Chạy GoAccess:**
Để phân tích access log của Nginx:
```bash
sudo goaccess /var/log/nginx/access.log
```
Bạn sẽ thấy một bảng điều khiển trên terminal với số lượt truy cập, người truy cập và băng thông.

**Tạo báo cáo HTML:**
Để xem bảng điều khiển HTML đẹp mắt, hãy chạy:
```bash
sudo goaccess /var/log/nginx/access.log -o /var/www/html/report.html --log-format=COMBINED --real-time-html
```
Bây giờ hãy truy cập vào `http://ip-server-cua-ban/report.html` để xem báo cáo nhé!

### 3. Kết luận

Chúng ta đã thiết lập thành công một web server cơ bản và một công cụ giám sát. Đây là bước đầu tiên để hiểu cách cơ sở hạ tầng web hoạt động.

Hẹn gặp lại các bạn trong bài viết tiếp theo! Happy coding! 💻🔥