```
---
title: "PowerShell Commands for Windows Server Admins"
date: "2025-12-04"
tags: ["windows", "server", "automation","bilingual"]
---

> *🇻🇳 Bản tiếng Việt nằm ở phía dưới bài viết (Vietnamese version is available below).*

---

### Essential PowerShell "Lifesaver" Commands for Windows Server Admins

Hello everyone. Today, I’d like to share and expand on a list of extremely useful PowerShell commands. Why use PowerShell on Windows Server? Because when you are managing dozens or hundreds of servers, clicking through individual GUI windows is impossible and incredibly slow. PowerShell allows you to operate quickly, accurately, and makes automation easy.

Below is a compiled list that includes both basic file operations and advanced system administration commands.

### 1. File System & Storage Management

**Calculate folder size instantly**

On a Server, right-clicking Properties to check the size of a log folder or user profile can take forever. Use this command to calculate it immediately:

```powershell
"{0:N2} GB" -f ((Get-ChildItem C:\inetpub\logs\ -Recurse | Measure-Object -Property Length -Sum -ErrorAction Stop).Sum / 1GB)
```

(This command recursively calculates the total size and converts it to GB, which is very handy for checking which folders are consuming your disk space).

**Search content in files ("Grep" for Windows)**

Need to find a specific error log or a misconfiguration hidden in dozens of text files? Don’t open them one by one.

```powershell
Select-String -Path C:\Windows\System32\LogFiles\*.log -Pattern "Error 500"
```

### 2. Service and Process Management

This is a daily task for any admin. Instead of opening services.msc or Task Manager, you can do it much faster here.

**Check and Restart a stuck Service**

Example: The Web Server (IIS) service is unresponsive.

```powershell
# Check status
Get-Service -Name W3SVC

# Restart immediately
Restart-Service -Name W3SVC -Force
```

**Find and "Kill" stubborn processes**

Is an application eating up too much RAM and refusing to close?

```powershell
# Find process by name
Get-Process -Name "notepad"

# Force stop the process (Equivalent to End Task)
Stop-Process -Name "notepad" -Force
```

### 3. Network & Connectivity Checks

On Windows Server, network debugging is critical. The ping command isn't enough because it doesn't check specific ports.

**Check Ports (Telnet Alternative)**

The Test-NetConnection command (alias: tnc) is the most powerful tool to check if your Server can reach a Database or another Web Server.

```powershell
# Check if the server 192.168.1.10 has port 80 open
Test-NetConnection -ComputerName 192.168.1.10 -Port 80
```

**View IP information cleanly**

Instead of ipconfig /all which outputs too much text, this command gives a cleaner view of your Interfaces:

```powershell
Get-NetIPAddress | Format-Table InterfaceAlias, IPAddress, PrefixLength
```

### 4. System Event Logs

Reading Event Viewer with the naked eye is exhausting. Filter it using PowerShell instead.

**Get the 10 most recent system errors**

This helps you quickly grasp the server's health status immediately after logging in.

```powershell
Get-EventLog -LogName System -EntryType Error -Newest 10
```

### 5. Remote Management

This is the "ultimate weapon" of Windows Server. You don't need to Remote Desktop (RDP) into a server just to run a few commands.

**Connect directly to another Server's session**

This feature is called PowerShell Remoting (PSSession).

```powershell
# Open a session to Server01
Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)
```

After running this, your command prompt will change to `[Server01]: PS C:\>`, meaning every command you type is now running on the remote machine.

### 6. Updates & Security

**Check installed HotFixes**

Essential for verifying if your Server has been patched with the latest security updates.

```powershell
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10
```

**Run as Admin for a specific application**

Similar to the runas command, but this is how you handle it in an object-oriented environment:

```powershell
Start-Process powershell -Verb RunAs
```

### Quick Tip: Save as a Script

If you frequently run a sequence of commands (e.g., Stop service -> Delete logs -> Start service), save them into a `.ps1` file.

Don't forget to check the Execution Policy as mentioned in previous posts:

```powershell
Set-ExecutionPolicy RemoteSigned
```

I hope this expanded list helps with your system administration tasks. Please comment below if you have any other "go-to" commands!

---

### Tổng hợp các lệnh PowerShell "Cứu cánh" cho Quản trị viên Windows Server

Chào mọi người. Hôm nay mình muốn chia sẻ và mở rộng thêm danh sách các lệnh PowerShell cực kỳ hữu ích. Tại sao lại là PowerShell trên Windows Server? Vì khi quản lý hàng chục, hàng trăm server, việc click chuột qua từng cửa sổ GUI là bất khả thi và chậm chạp. PowerShell giúp bạn thao tác nhanh, chính xác và dễ dàng tự động hóa.

Dưới đây là danh sách mình tổng hợp, bao gồm cả các thao tác file cơ bản và các lệnh quản trị hệ thống nâng cao.

### 1. Quản lý File và Dung lượng (File System)

**Tính toán kích thước thư mục cực nhanh**

Trên Server, việc chuột phải chọn Properties để xem dung lượng thư mục log hoặc user profile rất mất thời gian. Hãy dùng lệnh này để tính toán ngay lập tức:

```powershell
"{0:N2} GB" -f ((Get-ChildItem C:\inetpub\logs\ -Recurse | Measure-Object -Property Length -Sum -ErrorAction Stop).Sum / 1GB)
```

(Lệnh này đệ quy tính tổng dung lượng và đổi sang GB, rất tiện để kiểm tra thư mục nào đang chiếm dụng ổ cứng).

**Tìm kiếm nội dung trong file (Grep cho Windows)**

Bạn cần tìm một dòng log lỗi cụ thể hoặc một config sai trong hàng tá file text? Đừng mở từng file một.

```powershell
Select-String -Path C:\Windows\System32\LogFiles\*.log -Pattern "Error 500"
```

### 2. Quản lý Dịch vụ (Services) và Tiến trình (Processes)

Đây là việc làm hàng ngày của admin. Thay vì mở services.msc hay Task Manager, bạn có thể làm nhanh hơn nhiều.

**Kiểm tra và Khởi động lại Service bị treo**

Ví dụ: Service Web Server (IIS) bị đơ.

```powershell
# Kiểm tra trạng thái
Get-Service -Name W3SVC

# Khởi động lại ngay lập tức
Restart-Service -Name W3SVC -Force
```

**Tìm và "Kill" tiến trình cứng đầu**

Một ứng dụng chiếm quá nhiều RAM và không chịu tắt?

```powershell
# Tìm tiến trình theo tên
Get-Process -Name "notepad"

# Buộc dừng tiến trình (tương đương End Task)
Stop-Process -Name "notepad" -Force
```

### 3. Kiểm tra Kết nối Mạng (Network & Connectivity)

Trên Windows Server, việc debug mạng là tối quan trọng. Lệnh ping là chưa đủ vì nó không kiểm tra được cổng (port).

**Kiểm tra Port (Thay thế Telnet)**

Lệnh Test-NetConnection (hay viết tắt là tnc) là công cụ mạnh nhất để kiểm tra xem Server có thông tới Database hay Web Server khác không.

```powershell
# Kiểm tra xem máy chủ 192.168.1.10 có mở port 80 không
Test-NetConnection -ComputerName 192.168.1.10 -Port 80
```

**Xem thông tin IP nhanh gọn**

Thay vì ipconfig /all ra quá nhiều chữ, lệnh này cho cái nhìn gọn gàng hơn về các Interface:

```powershell
Get-NetIPAddress | Format-Table InterfaceAlias, IPAddress, PrefixLength
```

### 4. Quản lý Nhật ký hệ thống (Event Logs)

Đọc Event Viewer bằng mắt thường rất mỏi mắt. Hãy lọc nó bằng PowerShell.

**Lấy 10 lỗi gần nhất trong hệ thống**

Lệnh này giúp bạn nắm bắt nhanh tình hình sức khỏe của Server ngay khi vừa login.

```powershell
Get-EventLog -LogName System -EntryType Error -Newest 10
```

### 5. Quản trị từ xa (Remote Management)

Đây là "vũ khí" mạnh nhất của Windows Server. Bạn không cần Remote Desktop (RDP) vào server chỉ để chạy vài lệnh.

**Kết nối trực tiếp vào phiên làm việc của Server khác**

Tính năng này gọi là PowerShell Remoting (PSSession).

```powershell
# Mở một phiên kết nối tới Server01
Enter-PSSession -ComputerName Server01 -Credential (Get-Credential)
```

Sau khi chạy lệnh này, dấu nhắc lệnh của bạn sẽ đổi thành `[Server01]: PS C:\>`, nghĩa là mọi lệnh bạn gõ đều đang chạy trên máy kia.

### 6. Cập nhật và Bảo mật

**Kiểm tra các bản vá lỗi (HotFix) đã cài đặt**

Rất cần thiết để kiểm tra xem Server đã được patch lỗ hổng bảo mật mới nhất chưa.

```powershell
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10
```

**Chạy quyền Admin cho một ứng dụng cụ thể**

Tương tự lệnh runas bạn đã chia sẻ, nhưng đây là cách gọi trong môi trường object:

```powershell
Start-Process powershell -Verb RunAs
```

### Mẹo nhỏ: Lưu lại thành Script

Nếu bạn thường xuyên phải chạy một chuỗi các lệnh (ví dụ: Dừng service -> Xóa log -> Start service), hãy lưu chúng vào file `.ps1`.

Đừng quên kiểm tra Execution Policy như bài gốc đã đề cập:

```powershell
Set-ExecutionPolicy RemoteSigned
```

Hy vọng danh sách mở rộng này giúp ích cho công việc quản trị hệ thống của bạn. Hãy comment bên dưới nếu bạn có những lệnh "tủ" nào khác nhé!
```