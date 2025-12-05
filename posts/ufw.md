---
title: "Mastering Linux Firewalls Made Easy with UFW (Uncomplicated Firewall)"
date: "2025-12-02"
tags: ["ubuntu", "vps", "bilingual","cybersecurity", "firewall", "ufw", "iptables"]
---

> *🇻🇳 Bản tiếng Việt nằm ở phía dưới bài viết (Vietnamese version is available below).*

---

### Mastering Linux Firewalls Made Easy with UFW (Uncomplicated Firewall)

Hello everyone! If you've ever had a headache looking at the messy rules of iptables to configure a firewall, then UFW is your savior.

True to its name, "Uncomplicated Firewall", this tool was born to simplify server protection. It provides an extremely friendly command-line interface to manage the underlying iptables. Today, I will guide you through the essential operations to master UFW.

### 1. Installation and Startup

On distros like Ubuntu or Debian, installation takes just a few seconds:

```bash
sudo apt install ufw
```

By default after installation, UFW will be Inactive to prevent locking you out of the server immediately. To check the status:

```bash
sudo ufw status
```

If you want to support IPv6, open the configuration file and check this line:

```bash
sudo nano /etc/default/ufw
# Ensure this line is set to yes
IPV6=yes
```

If you need to restart the firewall after changing the config:

```bash
sudo ufw disable
sudo ufw enable
```

### 2. Setting Default "Rules of the Game"

The golden rule in security is: "Deny all, allow only what is necessary". Before opening any ports, set the defaults to block all incoming connections and allow all outgoing connections.

```bash
# Block all incoming traffic
sudo ufw default deny incoming

# Allow all outgoing traffic
sudo ufw default allow outgoing
```

**Quick Tip:** To ensure UFW always starts with the system, check the `/etc/ufw/ufw.conf` file and set `ENABLED=yes`.

### 3. Opening Ports (Allow)

**Most Important: SSH**
Never enable the firewall without opening the SSH port, otherwise, you will lock yourself out!

```bash
# Method 1: By service name
sudo ufw allow ssh

# Method 2: By port number (default is 22)
sudo ufw allow 22/tcp
```

*Note: If you changed your SSH port to a different number (e.g., 2222), use the command: `sudo ufw allow 2222/tcp`.*

**Web Server (HTTP/HTTPS)**
Allow web access:

```bash
sudo ufw allow www
# Or
sudo ufw allow 80/tcp
```

**FTP Server**

```bash
sudo ufw allow ftp
# Or
sudo ufw allow 21/tcp
```

**Opening a Port Range**
If your application needs a wide range of ports (e.g., from 100 to 300):

```bash
sudo ufw allow 100:300/tcp
sudo ufw allow 100:300/udp
```

### 4. Advanced Configuration (Specific IP)

This is a great way to enhance security. Instead of opening the door to the whole world, you only open it for a specific person.

**Allow a specific IP:**

```bash
sudo ufw allow from 192.168.0.100
```

**Allow an entire Subnet:**

```bash
sudo ufw allow from 123.45.67.89/24
```

**Combo: Allow this IP to this specific Port only:**
Example: Only allow the Boss's machine (IP 123.45.67.89) to SSH into the server.

```bash
sudo ufw allow from 123.45.67.89 to any port 22 proto tcp
```

### 5. Managing and Deleting Rules

Added a rule by mistake? No problem.

**Block connections (Deny)**
Although we defaulted to deny all, if you need to specifically block a port that is currently open:

```bash
sudo ufw deny 80/tcp
```

**Delete rules (Delete)**
The simplest way is to add delete before the old command:

```bash
sudo ufw delete allow 80/tcp
```

**The "Pro" way to delete (by line number)**
Sometimes you don't remember the original command, so list them with numbers:

```bash
sudo ufw status numbered
```

The result will look like `[ 1] 22/tcp ALLOW ....` To delete rule number 1, just run:

```bash
sudo ufw delete 1
```

### 6. Operation

Once you have finished configuring the rules, it's time to turn the firewall ON:

```bash
sudo ufw enable
```

To see detailed running rules:

```bash
sudo ufw status verbose
```

If you messed up the configuration too much and want to start over (Reset):

```bash
sudo ufw reset
```

### 7. System Logging

To know who is trying to "intrude" or to check if rules are working correctly, enable logging:

```bash
sudo ufw logging on
# Set log level (low, medium, high). Default is low.
sudo ufw logging medium
```

Read logs at `/var/log/ufw.log` or via `dmesg`. A log line will look like this: `[UFW BLOCK] IN=eth0 ... SRC=123.45.67.89 DST=987.65.43.21 ... DPT=22`

**Quick Decode:**

*   `[UFW BLOCK]`: Connection has been blocked.
*   `SRC`: The IP address of the source sending the packet.
*   `DPT` (Destination Port): The port they are trying to access (e.g., 22 is SSH).

**Bonus: For the team that hates typing commands**
If you prefer a Graphical User Interface (GUI), install GUFW:

```bash
sudo apt install gufw
```

It provides an intuitive interface to toggle the firewall with just a few clicks.

Hope this article helps you manage your server safely and easily. If you have any questions, feel free to comment below!

---

### Làm chủ tường lửa trên Linux cực dễ với UFW (Uncomplicated Firewall)

Chào mọi người! Nếu bạn từng "đau đầu" khi nhìn vào mớ quy tắc rối rắm của iptables để cấu hình tường lửa, thì UFW chính là vị cứu tinh của bạn.

Đúng như tên gọi "Uncomplicated Firewall" (Tường lửa không phức tạp), công cụ này sinh ra để đơn giản hóa việc bảo vệ server. Nó cung cấp một giao diện dòng lệnh cực kỳ thân thiện để quản lý iptables bên dưới. Hôm nay mình sẽ hướng dẫn các bạn những thao tác "nằm lòng" để sử dụng UFW nhé.

### 1. Cài đặt và Khởi động

Trên các distro như Ubuntu hay Debian, việc cài đặt chỉ tốn vài giây:

```bash
sudo apt install ufw
```

Mặc định sau khi cài, UFW sẽ ở trạng thái Inactive (không hoạt động) để tránh việc bạn vừa cài xong đã bị chặn khỏi server. Để kiểm tra trạng thái:

```bash
sudo ufw status
```

Nếu bạn muốn hỗ trợ cả IPv6, hãy mở file cấu hình và kiểm tra dòng này:

```bash
sudo nano /etc/default/ufw
# Đảm bảo dòng này là yes
IPV6=yes
```

Nếu bạn cần khởi động lại tường lửa sau khi chỉnh config:

```bash
sudo ufw disable
sudo ufw enable
```

### 2. Thiết lập "Luật chơi" mặc định (Defaults)

Nguyên tắc vàng trong bảo mật là: "Cấm tất cả, chỉ mở những gì cần thiết". Trước khi mở cổng, hãy thiết lập mặc định chặn mọi kết nối từ ngoài vào (incoming) và cho phép mọi kết nối từ trong ra (outgoing).

```bash
# Chặn tất cả chiều vào
sudo ufw default deny incoming

# Cho phép tất cả chiều ra
sudo ufw default allow outgoing
```

**Mẹo nhỏ:** Để UFW luôn tự bật khi khởi động máy, hãy kiểm tra file `/etc/ufw/ufw.conf` và set `ENABLED=yes`.

### 3. Mở cổng kết nối (Allow)

**Quan trọng nhất: SSH**
Đừng bao giờ bật tường lửa mà quên mở cổng SSH, nếu không bạn sẽ tự nhốt mình ở ngoài đấy!

```bash
# Cách 1: Gọi tên dịch vụ
sudo ufw allow ssh

# Cách 2: Gọi số port (mặc định là 22)
sudo ufw allow 22/tcp
```

*Lưu ý: Nếu bạn đã đổi port SSH sang số khác (ví dụ 2222), hãy dùng lệnh: `sudo ufw allow 2222/tcp`.*

**Web Server (HTTP/HTTPS)**
Cho phép truy cập web:

```bash
sudo ufw allow www
# Hoặc
sudo ufw allow 80/tcp
```

**FTP Server**

```bash
sudo ufw allow ftp
# Hoặc
sudo ufw allow 21/tcp
```

**Mở một dải Port**
Nếu ứng dụng của bạn cần một dải cổng rộng (ví dụ từ 100 đến 300):

```bash
sudo ufw allow 100:300/tcp
sudo ufw allow 100:300/udp
```

### 4. Cấu hình nâng cao (Specific IP)

Đây là cách tuyệt vời để tăng cường bảo mật. Thay vì mở cửa cho cả thế giới, bạn chỉ mở cửa cho một người cụ thể.

**Cho phép 1 IP cụ thể:**

```bash
sudo ufw allow from 192.168.0.100
```

**Cho phép cả một Subnet (Mạng con):**

```bash
sudo ufw allow from 123.45.67.89/24
```

**Combo: Chỉ cho phép IP này vào Port này:**
Ví dụ: Chỉ cho máy Sếp (IP 123.45.67.89) được SSH vào server.

```bash
sudo ufw allow from 123.45.67.89 to any port 22 proto tcp
```

### 5. Quản lý và Xóa quy tắc

Lỡ tay thêm nhầm luật? Không sao cả.

**Chặn kết nối (Deny)**
Mặc dù mặc định chúng ta đã chặn hết, nhưng nếu cần chặn cụ thể một port nào đó đang mở:

```bash
sudo ufw deny 80/tcp
```

**Xóa quy tắc (Delete)**
Cách đơn giản nhất là thêm từ delete vào trước câu lệnh cũ:

```bash
sudo ufw delete allow 80/tcp
```

**Cách xóa chuyên nghiệp hơn (theo số thứ tự)**
Đôi khi bạn không nhớ câu lệnh gốc, hãy liệt kê chúng ra kèm số thứ tự:

```bash
sudo ufw status numbered
```

Kết quả sẽ có dạng `[ 1] 22/tcp ALLOW ....` Muốn xóa quy tắc số 1, chỉ cần:

```bash
sudo ufw delete 1
```

### 6. Vận hành

Sau khi đã cấu hình xong xuôi các quy tắc, giờ là lúc BẬT tường lửa lên:

```bash
sudo ufw enable
```

Để xem chi tiết các quy tắc đang chạy:

```bash
sudo ufw status verbose
```

Nếu bạn cấu hình sai quá nhiều và muốn làm lại từ đầu (Reset):

```bash
sudo ufw reset
```

### 7. Nhật ký hệ thống (Logging)

Để biết ai đang cố gắng "đột nhập" hoặc kiểm tra xem rule có chạy đúng không, hãy bật log:

```bash
sudo ufw logging on
# Chỉnh mức độ log (low, medium, high). Mặc định là low.
sudo ufw logging medium
```

Đọc log tại `/var/log/ufw.log` hoặc `dmesg`. Một dòng log sẽ trông như thế này: `[UFW BLOCK] IN=eth0 ... SRC=123.45.67.89 DST=987.65.43.21 ... DPT=22`

**Giải mã nhanh:**

*   `[UFW BLOCK]`: Kết nối đã bị chặn.
*   `SRC`: IP của kẻ đang gửi gói tin đến.
*   `DPT` (Destination Port): Cổng mà họ đang cố truy cập (ví dụ 22 là SSH).

**Bonus: Dành cho team không thích gõ lệnh**
Nếu bạn thích giao diện đồ họa (GUI), hãy cài đặt GUFW:

```bash
sudo apt install gufw
```

Nó cung cấp một giao diện trực quan để bạn bật tắt firewall chỉ bằng những cú click chuột.
