---
title: "Git Cheat Sheet"
date: "2025-12-08"
tags: ["git", "cheatsheet", "bilingual", "devops"]
---

> *🇻🇳 Bản tiếng Việt nằm ở phía dưới bài viết (Vietnamese version is available below).*

---

### Git Cheat Sheet: A "Lifesaver" for My "Goldfish Memory" Days 🧠

Hi everyone! 👋

Honestly, when I first started tinkering with Git, I felt like I was lost in the Matrix. Sometimes I forgot commands; other times I had no clue how to revert code after accidentally deleting something.

After a period of "blood, sweat, and tears" and Googling my fingers off, I decided to compile all the "god-tier" Git commands I use most often (plus a few advanced ones I'm currently learning). This post serves as both an online notebook for me to look up and, hopefully, a helpful guide for fellow newbies so you don't feel so overwhelmed.

Let's save this for later! 👇

### 1. The Warm-up: Configuration ⚙️
Before coding, you gotta "introduce yourself" to Git. These are settings I only need to do once when installing Git.

**Declare your name so everyone knows who coded this part:**
```bash
git config --global user.name "Your Name"
```

**The email associated with your name:**
```bash
git config --global user.email "email@example.com"
```

**This one is cool; it sets VS Code as the default editor instead of Vim (so you don't get stuck in Vim not knowing the way out 😅):**
```bash
git config --global core.editor "code --wait"
```

**Create a shortcut (alias). For example, instead of typing `git checkout`, now I just type `git co`.**
```bash
git config --global alias.co checkout
```

**Review everything I’ve set up:**
```bash
git config --list
```

### 2. The "Daily Bread": Basic Workflow
These are the commands I type until my keyboard wears out every day.

**Turn the current folder into a Git repository:**
```bash
git init
```

**Download a project from the web (GitHub/GitLab) to your machine:**
```bash
git clone <url>
```

**Gather all modified files to prepare for packaging (Stage):**
```bash
git add .
```

**"Seal the deal"! Save the changes with a note attached:**
```bash
git commit -m "your message"
```

**Push code from my machine to the server (Remote):**
```bash
git push origin <branch>
```

**Pull the latest code from the server to my machine (remember to do this before coding to avoid conflicts):**
```bash
git pull origin <branch>
```

### 3. The Art of Clones: Branch Masters 🌿
Working in a team without branching is a recipe for disaster. This part helps me code new features without affecting the main code.

**See what branches I currently have:**
```bash
git branch
```

**Create a new branch:**
```bash
git branch <name>
```

**Jump to another branch to work:**
```bash
git checkout <branch>
```

**Merge code from another branch into the current one (the most suspenseful moment: will there be conflicts?):**
```bash
git merge <branch>
```

**Delete a local branch (after merging is done):**
```bash
git branch -d <branch>
```

### 4. Time Machine: History Explorers 🕵️‍♂️
When code breaks, or I simply want to see "What on earth did I do yesterday?", I use this group:

**View commit history neatly in 1 line (very easy to read):**
```bash
git log --oneline
```

**Draw a history graph of branches; looks very professional:**
```bash
git log --graph --oneline --all
```

**See what I’ve modified but haven't add-ed yet:**
```bash
git diff
```

**This sounds a bit negative, but it helps see who wrote each line of code. Very useful for... finding the culprit (or asking for help from) the person who wrote that line:**
```bash
git blame <file>
```

### 5. Regret Medicine: Undo Artists
My favorite part! The savior for those "oops" moments.

**Undo the last commit but keep the code I just wrote (to fix the commit message, for example):**
```bash
git reset --soft HEAD^
```

**⚠️ Danger warning! Wipes out the last commit and everything you just coded. Only use when you really want to scrap everything and start over:**
```bash
git reset --hard HEAD^
```

**Discard changes in a specific file (when not yet added):**
```bash
git checkout -- <file>
```

**Create a new commit to reverse the changes of an old commit (safer than reset):**
```bash
git revert <commit>
```

### 6. Temporary Cleanup: Stash & Cleanup 🧹
Coding halfway through and the boss demands a hotfix on another branch? Don't commit unfinished code; use stash.

**Temporarily tuck away the pile of unfinished code in a safe corner:**
```bash
git stash
```

**Pull that stashed code back out to continue working:**
```bash
git stash pop
```

**See how many piles of code I've stashed:**
```bash
git stash list
```

**Throw away a stash (if not needed anymore):**
```bash
git stash drop
```

### 7. Teamwork on GitHub: Collaborators 🤝
For those who contribute to open source projects or do group assignments.

**Create a copy of someone else's project to my account:**
```bash
git fork
```

**Connect to the original repo (to update when the author updates):**
```bash
git remote add upstream <url>
```

**Pull the latest code from the original repo and merge it into mine smoothly:**
```bash
git pull --rebase upstream main
```

### 8. Marking Milestones: Tagging & Releases 🏷️
When the product is good to go and ready for version 1.0.

**Label the current commit (e.g., v1.0):**
```bash
git tag <name>
```

**Push these labels to the server:**
```bash
git push origin --tags
```

### 9. Heavy Weapons: Advanced Tools 🛠️
I'm still learning these, but I see the "wizards" using them often:

**Pick exactly 1 specific commit from another branch to bring to mine (like picking the best cherry):**
```bash
git cherry-pick <commit>
```

**Find the commit causing a bug using binary search (sounds really fancy):**
```bash
git bisect
```

**Git's secret diary. If you accidentally delete a commit or branch, you can still find it here. This is the ultimate lifebuoy!**
```bash
git reflog
```

Conclusion: Git has thousands of commands, but I find mastering this pile is enough to "survive" projects. Hope this cheat sheet helps you guys. If there are any other cool commands, comment below to teach me! Happy coding! 💻🔥

---

### Git Cheat Sheet: "Phao Cứu Sinh" Cho Những Ngày "Não Cá Vàng" 🧠

Chào mọi người! 👋

Thú thật là thời gian đầu mới tập tành làm quen với Git, mình cảm thấy như lạc vào ma trận vậy. Lúc thì quên lệnh, lúc thì không biết làm sao để quay lại code cũ khi lỡ tay xóa nhầm.

Sau một thời gian "trầy vi tróc vảy" và google mỏi tay, mình quyết định tổng hợp lại toàn bộ các câu lệnh Git "thần thánh" mà mình hay dùng nhất (và cả mấy lệnh nâng cao mà mình đang tập dùng). Bài viết này vừa là cuốn sổ tay online để mình tự tra cứu, vừa hy vọng giúp ích cho các bạn newbie giống mình đỡ bỡ ngỡ hơn.

Cùng lưu lại nhé! 👇

### 1. Màn Khởi Động: Cấu hình (Configuration) ⚙️
Trước khi code thì phải "xưng danh" với Git đã. Đây là những thiết lập mình chỉ cần làm một lần đầu tiên khi cài Git thôi.

**Khai báo tên để mọi người biết ai đã code đoạn này:**
```bash
git config --global user.name "Tên Của Bạn"
```

**Email đi kèm với tên:**
```bash
git config --global user.email "email@example.com"
```

**Cái này hay nè, nó set VS Code làm trình chỉnh sửa mặc định thay vì Vim (đỡ bị kẹt trong Vim không biết đường ra 😅):**
```bash
git config --global core.editor "code --wait"
```

**Tạo tên tắt (alias). Ví dụ thay vì gõ `git checkout`, giờ chỉ cần gõ `git co` là xong. Ngầu chưa!**
```bash
git config --global alias.co checkout
```

**Xem lại tất cả những gì mình đã cài đặt:**
```bash
git config --list
```

### 2. Quy Trình "Cơm Bữa": Basic Workflow
Đây là những lệnh mình gõ mòn cả bàn phím mỗi ngày.

**Biến folder hiện tại thành một Git repository:**
```bash
git init
```

**Tải một project từ trên mạng (GitHub/GitLab) về máy:**
```bash
git clone <url>
```

**Gom tất cả các file đã sửa để chuẩn bị đóng gói (Stage):**
```bash
git add .
```

**"Chốt đơn"! Lưu lại các thay đổi với một dòng tin nhắn ghi chú:**
```bash
git commit -m "tin nhắn của bạn"
```

**Đẩy code từ máy mình lên server (Remote):**
```bash
git push origin <branch>
```

**Kéo code mới nhất từ server về máy mình (nhớ làm cái này trước khi code để tránh conflict nhé):**
```bash
git pull origin <branch>
```

### 3. Phân Thân Chi Thuật: Branch Masters 🌿
Làm việc nhóm mà không chia nhánh (branch) là toang ngay. Phần này giúp mình code tính năng mới mà không ảnh hưởng đến code chính.

**Xem mình đang có những nhánh nào:**
```bash
git branch
```

**Tạo nhánh mới:**
```bash
git branch <tên_nhánh>
```

**Nhảy sang nhánh khác để làm việc:**
```bash
git checkout <tên_nhánh>
```

**Gộp code từ nhánh khác vào nhánh hiện tại (giây phút hồi hộp nhất xem có bị conflict không):**
```bash
git merge <tên_nhánh>
```

**Xóa nhánh ở máy mình (sau khi đã merge xong xuôi):**
```bash
git branch -d <tên_nhánh>
```

### 4. Cỗ Máy Thời Gian: History Explorers 🕵️‍♂️
Khi code bị lỗi, hoặc đơn giản là muốn xem "Hôm qua mình đã làm cái quái gì vậy?", thì dùng nhóm này:

**Xem lịch sử commit gọn gàng trong 1 dòng (dễ nhìn lắm):**
```bash
git log --oneline
```

**Vẽ biểu đồ lịch sử các nhánh, nhìn rất chuyên nghiệp:**
```bash
git log --graph --oneline --all
```

**Xem mình đã sửa cái gì mà chưa add:**
```bash
git diff
```

**Lệnh này nghe hơi tiêu cực (blame = đổ lỗi), nhưng nó giúp xem từng dòng code do ai viết. Rất hữu ích để... hỏi tội (hoặc hỏi bài) người viết dòng đó:**
```bash
git blame <file>
```

### 5. Thuốc Hối Hận: Undo Artists
Phần mình thích nhất đây rồi! Cứu tinh cho những lần "lỡ tay".

**Hoàn tác commit gần nhất nhưng giữ lại code mình vừa viết (để sửa lại commit message chẳng hạn):**
```bash
git reset --soft HEAD^
```

**⚠️ Cảnh báo nguy hiểm! Xóa bay màu commit gần nhất và cả những gì bạn vừa code. Chỉ dùng khi thực sự muốn bỏ hết làm lại:**
```bash
git reset --hard HEAD^
```

**Hủy bỏ các thay đổi trong một file cụ thể (khi chưa add):**
```bash
git checkout -- <file>
```

**Tạo một commit mới để đảo ngược lại thay đổi của một commit cũ (an toàn hơn reset):**
```bash
git revert <commit>
```

### 6. Dọn Dẹp Tạm Thời: Stash & Cleanup 🧹
Đang code dở mà sếp bắt fix bug gấp ở nhánh khác? Đừng commit code dở, hãy dùng stash.

**Cất tạm đống code đang làm dở vào một góc an toàn:**
```bash
git stash
```

**Lôi đống code vừa cất ra để làm tiếp:**
```bash
git stash pop
```

**Xem mình đang cất bao nhiêu đống code:**
```bash
git stash list
```

**Vứt bỏ đống code đã cất (nếu không cần nữa):**
```bash
git stash drop
```

### 7. Làm Việc Nhóm Trên GitHub: Collaborators 🤝
Dành cho ai hay đóng góp vào các dự án mã nguồn mở hoặc làm bài tập nhóm.

**Tạo một bản sao của dự án người khác về tài khoản của mình:**
```bash
git fork
```

**Kết nối với kho chứa gốc (để cập nhật khi tác giả update):**
```bash
git remote add upstream <url>
```

**Kéo code mới nhất từ kho gốc về và gộp vào code của mình một cách mượt mà:**
```bash
git pull --rebase upstream main
```

### 8. Đánh Dấu Cột Mốc: Tagging & Releases 🏷️
Khi sản phẩm đã ngon lành cành đào và sẵn sàng ra mắt phiên bản 1.0.

**Gắn nhãn cho commit hiện tại (ví dụ: v1.0):**
```bash
git tag <tên_tag>
```

**Đẩy các cái nhãn này lên server:**
```bash
git push origin --tags
```

### 9. Vũ Khí Hạng Nặng: Advanced Tools 🛠️
Mấy cái này mình cũng đang học thôi, nhưng thấy các "pháp sư" hay dùng:

**Chọn đúng 1 commit cụ thể ở nhánh khác đem về nhánh mình (giống như nhặt quả cherry ngon nhất vậy):**
```bash
git cherry-pick <commit>
```

**Tìm ra commit nào gây ra lỗi bằng thuật toán tìm kiếm nhị phân (nghe xịn xò thực sự):**
```bash
git bisect
```

**Cuốn nhật ký bí mật của Git. Nếu bạn lỡ tay xóa mất commit hay branch, vào đây vẫn có cơ hội tìm lại được. Đây là phao cứu sinh cuối cùng!**
```bash
git reflog
```

Lời kết: Git có hàng nghìn lệnh, nhưng mình thấy nắm vững đống này là cũng đủ để "sống sót" qua các dự án rồi. Hy vọng cái cheat sheet này giúp ích cho các bạn. Nếu có lệnh nào hay ho nữa, comment bên dưới chỉ mình với nhé! Happy coding! 💻🔥