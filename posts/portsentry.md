---
title: "PortSentry: Detecting and Blocking Port Scans"
date: "2025-12-03"
tags: ["ubuntu", "vps", "security", "network", "bilingual"]
---

> *🇻🇳 Bản tiếng Việt nằm ở phía dưới bài viết (Vietnamese version is available below).*

---

### PortSentry: Detecting and Blocking Port Scans
PortSentry is a classic Intrusion Detection System (IDS) specialized in monitoring and preventing port scanning activities on servers. Although active development has ceased, it remains an excellent lesson in active defense mechanisms for anyone working in system security.

This article will guide you through cross-platform installation and detailed configuration ranging from basic to "paranoid."

### 1. Installing PortSentry on Various Distros
Depending on your operating system, choose the appropriate installation method:

**Debian/Ubuntu/Kali Linux:** Install directly from the official repositories:

```bash
sudo apt-get update
sudo apt-get install portsentry
```

**Fedora/CentOS/RHEL:** Typically, you will need to download the RPM package. Then use the command:

```bash
rpm -i portsentry*
```
(Note: If the RPM package is not found, you may need to compile from source or search within the EPEL repository).

**Arch Linux:** Use the AUR (Arch User Repository). The old command was `yaourt`, but nowadays you can use `yay` or `paru`:

```bash
yaourt -S portsentry
# Or
yay -S portsentry
```

### 2. Configuring Monitoring Tactics
The main configuration file is located at `/etc/portsentry/portsentry.conf`. We will open it to edit:

```bash
sudo nano /etc/portsentry/portsentry.conf
```

#### A. Selecting Port Monitoring Sets (Port Configuration)
PortSentry provides 3 pre-set monitoring levels. You need to uncomment (#) one of the following sets depending on your security "sensitivity":

**Level 1: "Really Anal" (Paranoid/Strict)**
Select this set if you want to monitor almost all sensitive ports. Anyone touching them will be dealt with. This is the recommended choice.

```bash
# Un-comment these if you are really anal:
TCP_PORTS="1,7,9,11,15,70,79,80,109,110,111,119,138,139,143,512,513,514,515,540,635,1080,1524,2000,2001,4000,4001,5742,6000,6001,6667,12345,12346,20034,30303,32771,32772,32773,32774,31337,40421,40425,49724,54320"
UDP_PORTS="1,7,9,66,67,68,69,111,137,138,161,162,474,513,517,518,635,640,641,666,700,2049,32770,32771,32772,32773,32774,31337,54321"
```

**Level 2: "Aware"**
Monitors common ports, balancing security and performance.

```bash
# Use these if you just want to be aware:
# TCP_PORTS="1,11,15,79,111,119,143,540,635,1080,1524,2000,5742,6667,12345,12346,20034,31337,32771,32772,32773,32774,40421,49724,54320"
# UDP_PORTS="1,7,9,69,161,162,513,635,640,641,700,32770,32771,32772,32773,32774,31337,54321"
```

**Level 3: "Bare-bones" (Basic)**
Minimal monitoring. Not recommended unless the server is extremely underpowered.

#### B. Configuring Stealth Scan
In addition to the ports above, you can configure monitoring for high port ranges (above 1024) to detect stealth scanning techniques.

```bash
ADVANCED_PORTS_TCP="1023"
ADVANCED_PORTS_UDP="1023"
```

Crucially, make sure to exclude ports that you are actually using (e.g., Web, DNS, NetBIOS ports) to avoid blocking valid users:

```bash
ADVANCED_EXCLUDE_TCP="113,139"
ADVANCED_EXCLUDE_UDP="520,138,137,67"
```

### 3. Configuring Response and Blocking
What should PortSentry do when an attack is detected?

**Activate Blocking Mode**
Ensure the following two lines are set to 1 (1 = Block, 0 = Log only, 2 = Run external command):

```bash
BLOCK_UDP="1"
BLOCK_TCP="1"
```

**Blocking Method: TCP Wrappers**
A classic but effective blocking method is using `hosts.deny`. When an attacking IP is detected, PortSentry writes that IP to `/etc/hosts.deny`, causing services that support TCP Wrappers (like older SSH configs) to reject connections immediately.

Find and uncomment this line:

```bash
KILL_HOSTS_DENY="ALL: $TARGET$ : DENY"
```
(Note: `$TARGET$` is the variable representing the attacker's IP).

**Log Files and History**
Check the log file paths to ensure PortSentry records data in the correct location (Note: paths may vary by distro, e.g., `/etc/portsentry/...` or `/usr/pkg/etc/...`):

```bash
# Hosts to ignore (Whitelist)
IGNORE_FILE="/etc/portsentry/portsentry.ignore"
# Hosts that have been denied (Blocking History)
HISTORY_FILE="/etc/portsentry/portsentry.history"
# Hosts blocked in this session (Current Session)
BLOCKED_FILE="/etc/portsentry/portsentry.blocked"
```

### 4. Psychological Tactics: Port Banner
You can leave a message for the attacker if they intentionally connect to trap ports. This is an interesting feature to serve as a warning.

```bash
PORT_BANNER="** UNAUTHORIZED ACCESS PROHIBITED *** YOUR CONNECTION ATTEMPT HAS BEEN LOGGED. GO AWAY."
```

### 5. The Most Important Step: Whitelist (Ignore File)
Do not lock yourself out! Before starting, you absolutely must add your own IP and the local IP to the ignore list.

Open the `portsentry.ignore` file (path configured in step 3):

```bash
sudo nano /etc/portsentry/portsentry.ignore
```

Add the following:

```plaintext
127.0.0.1/32
0.0.0.0
[Your Machine's IP]
[Gateway IP]
```

### 6. Start and Verify
After completion, restart the service:

```bash
sudo service portsentry restart
```

To verify, use another machine to run a simple nmap scan against the server. Then check the `/etc/hosts.deny` file on the server; you should see the attacking machine's IP added to the blacklist along with the warning line.

### Advanced: Sending Email Alerts When Attacks are Detected
Receiving real-time notifications is a core part of DevSecOps and cybersecurity monitoring.

Below is a detailed guide on how to write a simple Shell script to send emails and integrate it into PortSentry's `KILL_RUN_CMD`.

#### 1. Prepare the Email Environment
To allow the Linux server to send emails, you need to install the `mailutils` package (on Debian/Ubuntu) or `mailx` (on CentOS).

**Ubuntu/Debian:**

```bash
sudo apt-get update
sudo apt-get install mailutils
```
(During installation, if asked to configure Postfix, you can select "Internet Site" if the server has a domain, or "Local only" for internal testing. However, to send to actual Gmail/Outlook, the server needs SMTP Relay configuration, but let's proceed with creating the script first).

#### 2. Write the Alert Script (portsentry_alert.sh)
We will write a script that accepts the Attacker's IP and the Scanned Port as parameters, then composes and sends an email.

Create the script file:

```bash
sudo nano /usr/local/bin/portsentry_alert.sh
```

Paste the following content:

```bash
#!/bin/bash

# ==========================================
# CONFIGURATION
# ==========================================
TO_EMAIL="admin@unitrade.id.vn"  # Replace with your email
SUBJECT="[ALERT] PortSentry Detected Attack!"
SERVER_NAME=$(hostname)
DATE=$(date "+%Y-%m-%d %H:%M:%S")

# Receive parameters from PortSentry
TARGET_IP=$1
TARGET_PORT=$2

# ==========================================
# EMAIL CONTENT
# ==========================================
BODY="
Security Alert from Server: $SERVER_NAME
------------------------------------------------
Detection Time      : $DATE
Action Taken        : Blocked
Attacker IP         : $TARGET_IP
Scanned Port        : $TARGET_PORT
------------------------------------------------
System has automatically added a rule to iptables/hosts.deny.
Please check logs at /var/log/syslog for more details.
"

# ==========================================
# SEND MAIL
# ==========================================
echo "$BODY" | mail -s "$SUBJECT" "$TO_EMAIL"
```

Grant execution permissions to the script:

```bash
sudo chmod +x /usr/local/bin/portsentry_alert.sh
```

#### 3. Integrate Script into PortSentry
Now we go back to the PortSentry configuration file to "teach" it how to call this script when an attack is detected.

Open the config file:

```bash
sudo nano /etc/portsentry/portsentry.conf
```

Find the `KILL_RUN_CMD` line. This line allows running an external command before blocking the IP. Edit it as follows:

```bash
# $TARGET$ is the variable containing the IP, $PORT$ is the variable containing the port
KILL_RUN_CMD="/usr/local/bin/portsentry_alert.sh $TARGET$ $PORT$"
```

**Important Note:** Ensure `BLOCK_UDP` and `BLOCK_TCP` variables are in mode 1 (Block) or 2 (Run Command Only) for the above command to execute. It is best to leave it at 1 to both block and send the email.

#### 4. Restart and Test
Restart PortSentry:

```bash
sudo service portsentry restart
```

**Attack Simulation:** Use another machine (or a phone using 4G - to have a different IP than the LAN) to scan:

```bash
nmap -p 1-100 <Your_Server_IP>
```

If successful, you will receive an email with the content: `Subject: [ALERT] PortSentry Detected Attack! Body: Security Alert... Attacker IP: 1.2.3.4.`

-------

### Hướng dẫn toàn tập về PortSentry: Phát hiện và Chặn đứng Port Scan
PortSentry là một công cụ phát hiện xâm nhập (IDS) kinh điển, chuyên dùng để giám sát và ngăn chặn các hành vi quét cổng (port scanning) trên máy chủ. Dù công cụ này đã ngừng phát triển, nó vẫn là một bài học tuyệt vời về cơ chế phòng thủ chủ động cho bất kỳ ai làm về bảo mật hệ thống.

Bài viết này sẽ hướng dẫn bạn cài đặt trên đa nền tảng và cấu hình chi tiết từ cơ bản đến "paranoid" (cực đoan).

### 1. Cài đặt PortSentry trên các Distro
Tùy vào hệ điều hành bạn đang sử dụng, hãy chọn phương pháp cài đặt phù hợp:

**Debian/Ubuntu/Kali Linux:** Cài đặt trực tiếp từ kho lưu trữ chính thức:

```bash
sudo apt-get update
sudo apt-get install portsentry
```

**Fedora/CentOS/RHEL:** Thông thường bạn sẽ cần tải gói RPM về máy. Sau đó sử dụng lệnh:

```bash
rpm -i portsentry*
```
(Lưu ý: Nếu không tìm thấy gói RPM, bạn có thể cần biên dịch từ mã nguồn hoặc tìm trong kho EPEL).

**Arch Linux:** Sử dụng AUR (Arch User Repository). Lệnh cũ là `yaourt`, nhưng hiện nay bạn có thể dùng `yay` hoặc `paru`:

```bash
yaourt -S portsentry
# Hoặc
yay -S portsentry
```

### 2. Cấu hình Chiến thuật Giám sát
File cấu hình chính nằm tại `/etc/portsentry/portsentry.conf`. Chúng ta sẽ mở nó lên và chỉnh sửa:

```bash
sudo nano /etc/portsentry/portsentry.conf
```

#### A. Lựa chọn bộ cổng giám sát (Port Configuration)
PortSentry cung cấp sẵn 3 cấp độ giám sát. Bạn cần bỏ dấu comment (#) ở một trong các bộ sau tùy theo mức độ "nhạy cảm" về bảo mật của bạn:

**Cấp độ 1: "Really Anal" (Cực đoan/Kỹ tính)**
Chọn bộ này nếu bạn muốn giám sát gần như tất cả các cổng nhạy cảm. Bất kỳ ai chạm vào đều sẽ bị xử lý. Đây là lựa chọn tôi khuyên dùng.

```bash
# Un-comment these if you are really anal:
TCP_PORTS="1,7,9,11,15,70,79,80,109,110,111,119,138,139,143,512,513,514,515,540,635,1080,1524,2000,2001,4000,4001,5742,6000,6001,6667,12345,12346,20034,30303,32771,32772,32773,32774,31337,40421,40425,49724,54320"
UDP_PORTS="1,7,9,66,67,68,69,111,137,138,161,162,474,513,517,518,635,640,641,666,700,2049,32770,32771,32772,32773,32774,31337,54321"
```

**Cấp độ 2: "Aware" (Cảnh giác)**
Giám sát các cổng phổ biến, cân bằng giữa bảo mật và hiệu năng.

```bash
# Use these if you just want to be aware:
# TCP_PORTS="1,11,15,79,111,119,143,540,635,1080,1524,2000,5742,6667,12345,12346,20034,31337,32771,32772,32773,32774,40421,49724,54320"
# UDP_PORTS="1,7,9,69,161,162,513,635,640,641,700,32770,32771,32772,32773,32774,31337,54321"
```

**Cấp độ 3: "Bare-bones" (Cơ bản)**
Chỉ giám sát tối thiểu. Không khuyến khích dùng trừ khi server quá yếu.

#### B. Cấu hình Stealth Scan (Quét ẩn)
Ngoài các cổng trên, bạn có thể cấu hình giám sát dải cổng cao (trên 1024) để phát hiện các kỹ thuật quét lén lút.

```bash
ADVANCED_PORTS_TCP="1023"
ADVANCED_PORTS_UDP="1023"
```

Đặc biệt, hãy loại trừ (exclude) các cổng mà bạn đang thực sự sử dụng (ví dụ cổng Web, DNS, NetBIOS) để tránh chặn nhầm người dùng hợp lệ:

```bash
ADVANCED_EXCLUDE_TCP="113,139"
ADVANCED_EXCLUDE_UDP="520,138,137,67"
```

### 3. Cấu hình Phản ứng và Chặn (Blocking)
Khi phát hiện tấn công, PortSentry sẽ làm gì?

**Kích hoạt chế độ chặn**
Đảm bảo hai dòng sau được đặt giá trị 1 (1 = Chặn, 0 = Chỉ ghi log, 2 = Chạy lệnh ngoài):

```bash
BLOCK_UDP="1"
BLOCK_TCP="1"
```

**Phương pháp chặn: TCP Wrappers**
Một phương pháp chặn cổ điển nhưng hiệu quả là sử dụng `hosts.deny`. Khi phát hiện IP tấn công, PortSentry sẽ ghi IP đó vào file `/etc/hosts.deny`, làm cho các dịch vụ hỗ trợ TCP Wrappers (như SSH cũ) từ chối kết nối ngay lập tức.

Tìm và bỏ comment dòng này:

```bash
KILL_HOSTS_DENY="ALL: $TARGET$ : DENY"
```
(Lưu ý: `$TARGET$` là biến đại diện cho IP của kẻ tấn công).

**File Log và Lịch sử**
Kiểm tra đường dẫn file log để đảm bảo PortSentry ghi dữ liệu đúng chỗ (Lưu ý đường dẫn có thể khác nhau tùy distro, ví dụ `/etc/portsentry/...` hoặc `/usr/pkg/etc/...`):

```bash
# Hosts to ignore (Danh sách trắng)
IGNORE_FILE="/etc/portsentry/portsentry.ignore"
# Hosts that have been denied (Lịch sử chặn)
HISTORY_FILE="/etc/portsentry/portsentry.history"
# Hosts blocked in this session (Phiên hiện tại)
BLOCKED_FILE="/etc/portsentry/portsentry.blocked"
```

### 4. "Đòn tâm lý": Port Banner
Bạn có thể để lại một lời nhắn cho kẻ tấn công nếu chúng cố tình kết nối vào các cổng bẫy. Đây là một tính năng thú vị để cảnh báo.

```bash
PORT_BANNER="** UNAUTHORIZED ACCESS PROHIBITED *** YOUR CONNECTION ATTEMPT HAS BEEN LOGGED. GO AWAY."
```

### 5. Bước quan trọng nhất: Whitelist (Ignore File)
Đừng tự nhốt mình ở ngoài! Trước khi khởi động, bạn bắt buộc phải thêm IP của chính mình và IP local vào danh sách bỏ qua.

Mở file `portsentry.ignore` (đường dẫn đã cấu hình ở bước 3):

```bash
sudo nano /etc/portsentry/portsentry.ignore
```

Thêm vào:

```plaintext
127.0.0.1/32
0.0.0.0
[IP Của Máy Bạn]
[IP Gateway]
```

### 6. Khởi động và Kiểm tra
Sau khi hoàn tất, khởi động lại dịch vụ:

```bash
sudo service portsentry restart
```

Để kiểm tra, hãy dùng một máy khác thực hiện lệnh nmap đơn giản vào server. Sau đó kiểm tra file `/etc/hosts.deny` trên server, bạn sẽ thấy IP của máy tấn công đã bị thêm vào danh sách đen kèm theo dòng cảnh báo.

### Nâng cao: Gửi Email Cảnh Báo Khi Phát Hiện Tấn Công với PortSentry
Việc nhận thông báo ngay lập tức (Real-time Notification) là một phần cốt lõi của DevSecOps và giám sát an ninh mạng.

Dưới đây là hướng dẫn chi tiết cách viết một script Shell đơn giản để gửi email và tích hợp nó vào `KILL_RUN_CMD` của PortSentry.

#### 1. Chuẩn bị môi trường gửi mail
Để server Linux gửi được email, bạn cần cài đặt gói `mailutils` (trên Debian/Ubuntu) hoặc `mailx` (trên CentOS).

**Ubuntu/Debian:**

```bash
sudo apt-get update
sudo apt-get install mailutils
```
(Trong quá trình cài đặt, nếu nó hỏi cấu hình Postfix, bạn có thể chọn "Internet Site" nếu server có domain, hoặc "Local only" nếu chỉ test nội bộ. Tuy nhiên, để gửi ra Gmail/Outlook thực tế, server cần cấu hình SMTP Relay, nhưng ta cứ đi qua bước tạo script trước).

#### 2. Viết Script Cảnh Báo (portsentry_alert.sh)
Chúng ta sẽ viết một script nhận tham số là IP kẻ tấn công và Cổng bị quét, sau đó soạn nội dung và gửi mail.

Tạo file script:

```bash
sudo nano /usr/local/bin/portsentry_alert.sh
```

Dán nội dung sau vào:

```bash
#!/bin/bash

# ==========================================
# CẤU HÌNH
# ==========================================
TO_EMAIL="admin@unitrade.id.vn"  # Thay bằng email của bạn
SUBJECT="[ALERT] PortSentry Detected Attack!"
SERVER_NAME=$(hostname)
DATE=$(date "+%Y-%m-%d %H:%M:%S")

# Nhận tham số từ PortSentry
TARGET_IP=$1
TARGET_PORT=$2

# ==========================================
# NỘI DUNG EMAIL
# ==========================================
BODY="
Cảnh báo bảo mật từ Server: $SERVER_NAME
------------------------------------------------
Thời gian phát hiện : $DATE
Hành động           : Đã chặn (Blocked)
IP Kẻ tấn công      : $TARGET_IP
Cổng bị quét        : $TARGET_PORT
------------------------------------------------
Hệ thống đã tự động thêm rule vào iptables/hosts.deny.
Vui lòng kiểm tra log tại /var/log/syslog để biết thêm chi tiết.
"

# ==========================================
# GỬI MAIL
# ==========================================
echo "$BODY" | mail -s "$SUBJECT" "$TO_EMAIL"
```

Cấp quyền thực thi cho script:

```bash
sudo chmod +x /usr/local/bin/portsentry_alert.sh
```

#### 3. Tích hợp Script vào PortSentry
Bây giờ chúng ta quay lại file cấu hình của PortSentry để "dạy" nó cách gọi script này khi phát hiện tấn công.

Mở file config:

```bash
sudo nano /etc/portsentry/portsentry.conf
```

Tìm dòng `KILL_RUN_CMD`. Dòng này cho phép chạy một lệnh ngoài (external command) trước khi chặn IP. Sửa lại như sau:

```bash
# $TARGET$ là biến chứa IP, $PORT$ là biến chứa cổng
KILL_RUN_CMD="/usr/local/bin/portsentry_alert.sh $TARGET$ $PORT$"
```

Lưu ý quan trọng: Đảm bảo biến `BLOCK_UDP` và `BLOCK_TCP` ở chế độ 1 (Block) hoặc 2 (Run Command Only) thì lệnh trên mới được thực thi. Tốt nhất là để 1 để vừa chặn vừa gửi mail.

#### 4. Khởi động lại và Test
Restart PortSentry:

```bash
sudo service portsentry restart
```

Thử nghiệm (Attack Simulation): Sử dụng máy khác (hoặc điện thoại dùng 4G - để khác IP mạng Lan) quét thử:

```bash
nmap -p 1-100 <IP_Server_Cua_Ban>
```

Nếu thành công, bạn sẽ nhận được một email với nội dung:
`Subject: [ALERT] PortSentry Detected Attack! Body: Cảnh báo bảo mật... IP Kẻ tấn công: 1.2.3.4.`