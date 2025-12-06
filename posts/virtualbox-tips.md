---
title: "VirtualBox Tips"
date: "2025-12-06"
tags: ["virtualbox", "ubuntu", "bilingual"]
---

> *🇻🇳 Bản tiếng Việt nằm ở phía dưới bài viết (Vietnamese version is available below).*

---

### Essential "Lifesaver" Tips & Tricks for VirtualBox Users

You're probably no stranger to VirtualBox, right? Installation guides are everywhere; a quick Google search gives you tons of results. So, I won't bore you by "lecturing" on dry theory here.

Instead, I’ll summarize the "must-have" steps to take immediately after installation to avoid silly mistakes, plus a few cool tricks you'll inevitably look for sooner or later. These are my personal notes to save myself from pulling my hair out every time a VM acts up. Let's dive in! 🚀

### 1. The "3-Step Combo" to Do Immediately After Installation

Do this, and I guarantee your machine will run smoothly, copy-paste will fly, and USBs will connect seamlessly.

**Step 1: Grant Permissions to the User (On the Host machine)**

Run this command to add your user to the `vboxusers` group. Remember to log out and log back in for it to take effect.

```bash
usermod -aG vboxusers username
```

**Step 2: Install the Extension Pack**

Download this from the VirtualBox homepage; just double-click to install it.

**Step 3: Install Guest Additions (On the Virtual Machine - Guest)**

Inside your Linux VM, install the required packages:

```bash
sudo apt install build-essential dkms linux-headers-$(uname -r)
```

Then, on the VirtualBox menu bar, select **Insert Guest Additions CD image** and run the file `./VBoxLinuxAdditions.run` as root.

✅ **Result:** Full screen, shared folders, bi-directional copy/paste, and smooth USB support!

### 2. Tips to "Slim Down" Your .VDI Files 📉

After using it for a while, your virtual hard disk file (`.vdi`) keeps bloating up even if you've deleted data inside. Don't worry, here is how to squeeze it back down:

**👉 For Linux Guests:**

*   **On the Guest:** Zero-out the free space.

```bash
dd if=/dev/zero of=/var/tmp/bigemptyfile bs=4096k ; rm /var/tmp/bigemptyfile
```

> **Note:** Grab a coffee, this takes a little while.

*   **On the Host:** Compact the file.

```bash
# For VirtualBox >= 6.1.4
VBoxManage modifymedium disk /path/to/thedisk.vdi --compact
```

**👉 For Windows Guests:**

*   **On the Guest:** Run Disk Defragmentation. Then download the **SDelete** tool and run this in CMD:

```cmd
sdelete.exe c: -z
```

*   **On the Host:** Similar to above.

```bash
VBoxManage modifymedium disk /path/to/thedisk.vdi --compact
```

### 3. Change Format & Increase Disk Size 💾

**🔄 Convert from VMDK to VDI (for easier compaction):**

If you accidentally created a VMDK drive but want to compress it, you need to convert it to VDI first:

```bash
VBoxManage clonehd "source.vmdk" "cloned.vdi" --format vdi
```

(Remember to **backup first** just to be safe)

**⬆️ Increase Disk Capacity (Resize):**

Virtual disk out of space? Don't create a new machine, run this command to expand it (e.g., to 50GB):

```bash
VBoxManage modifyhd "disk.vdi" --resize 51200
```

Then go into the VM and use **GParted** to extend the partition, and you're done!

### 4. Fix the "Slow as a Snail" Windows VM Issue 🐢

If your Windows VM is lagging terribly and you see a green turtle icon in the status bar, the main culprit is **Hyper-V**.

**How to fix it:**

1.  Disable the **Core Isolation** feature in Windows Defender.
2.  Disable Hyper-V using this PowerShell command (run as Admin):

```powershell
bcdedit /set hypervisorlaunchtype off
```

3.  Reboot the machine:

```powershell
shutdown -s -t 2
```

No more turtle; your machine will run like the wind again! 💨

---

### Bỏ túi ngay loạt Tips & Tricks "cứu cánh" cho dân chơi VirtualBox

Mọi người chắc không lạ gì với VirtualBox rồi đúng không? Tài liệu cài đặt thì đầy rẫy trên mạng, Google cái là ra cả tá. Thế nên bài này mình sẽ không ngồi "giảng đạo" lại mớ lý thuyết khô khan đó đâu.

Thay vào đó, mình sẽ tóm tắt lại những thao tác "must-have" sau khi cài đặt để tránh mấy lỗi ngớ ngẩn, cộng thêm vài thủ thuật cực hay ho mà sớm muộn gì bạn cũng sẽ cần tìm kiếm. Đây là những note mình tự rút ra để đỡ phải vò đầu bứt tai mỗi khi máy ảo dở chứng. Bắt đầu nào! 🚀

### 1. "Combo 3 bước" cần làm ngay sau khi cài đặt

Làm xong cái này đảm bảo máy chạy mượt, copy-paste ầm ầm, nhận USB thoải mái luôn.

**Bước 1: Cấp quyền cho User (Trên máy thật - Host)**

Chạy lệnh này để thêm user của bạn vào nhóm `vboxusers`. Nhớ log out rồi log in lại mới ăn nha.

```bash
usermod -aG vboxusers username
```

**Bước 2: Cài Extension Pack**

Cái này tải trên trang chủ VirtualBox, click đúp là cài thôi.

**Bước 3: Cài Guest Additions (Trên máy ảo - Guest)**

Vào máy ảo Linux, cài các gói cần thiết:

```bash
sudo apt install build-essential dkms linux-headers-$(uname -r)
```

Sau đó trên thanh menu VirtualBox, chọn **Insert Guest Additions CD image** và chạy file `./VBoxLinuxAdditions.run` với quyền root.

✅ **Kết quả:** Full màn hình, share folder, copy/paste 2 chiều, nhận USB ngon lành!

### 2. Bí kíp "giảm cân" cho file .VDI 📉

Dùng một thời gian, file ổ cứng ảo (`.vdi`) cứ phình to ra dù bên trong bạn đã xóa bớt dữ liệu. Đừng lo, đây là cách ép nó nhỏ lại:

**👉 Với máy ảo Linux:**

*   **Trên máy ảo:** Lấp đầy chỗ trống bằng số 0 (Zero-out free space).

```bash
dd if=/dev/zero of=/var/tmp/bigemptyfile bs=4096k ; rm /var/tmp/bigemptyfile
```

> **Lưu ý:** Chờ xíu nhé, hơi lâu đấy.

*   **Trên máy thật (Host):** Nén file lại.

```bash
# Với VirtualBox >= 6.1.4
VBoxManage modifymedium disk /path/to/thedisk.vdi --compact
```

**👉 Với máy ảo Windows:**

*   **Trên máy ảo:** Chạy chống phân mảnh ổ đĩa (Defrag). Sau đó tải công cụ **SDelete** và chạy CMD:

```cmd
sdelete.exe c: -z
```

*   **Trên máy thật:** Tương tự như trên.

```bash
VBoxManage modifymedium disk /path/to/thedisk.vdi --compact
```

### 3. Đổi định dạng & Tăng dung lượng ổ cứng 💾

**🔄 Chuyển từ VMDK sang VDI (để dễ nén dung lượng):**

Nếu lỡ tạo ổ VMDK mà muốn nén, bạn phải convert sang VDI trước:

```bash
VBoxManage clonehd "source.vmdk" "cloned.vdi" --format vdi
```

(Nhớ **backup trước** cho chắc cú nha)

**⬆️ Tăng dung lượng ổ cứng (Resize):**

Ổ cứng ảo bị đầy? Đừng tạo máy mới, chạy lệnh này để mở rộng (Ví dụ lên 50GB):

```bash
VBoxManage modifyhd "disk.vdi" --resize 51200
```

Sau đó vào máy ảo dùng **GParted** để kéo dãn phân vùng ra là xong!

### 4. Fix lỗi máy ảo Windows "chậm như rùa" 🐢

Nếu bạn thấy máy ảo Windows lag kinh khủng và dưới thanh trạng thái có hiện icon con rùa màu xanh, thì thủ phạm chính là **Hyper-V**.

**Cách xử lý:**

1.  Tắt tính năng **Core Isolation** trong Windows Defender.
2.  Tắt **Hyper-V** bằng lệnh PowerShell (chạy quyền Admin):

```powershell
bcdedit /set hypervisorlaunchtype off
```

3.  Reboot lại máy:

```powershell
shutdown -s -t 2
```

Hết rùa là máy lại chạy nhanh như gió ngay! 💨