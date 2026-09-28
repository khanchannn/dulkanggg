---
title: "Understanding and Auditing HTTP Basic Authentication"
date: "2026-09-28"
tags: ["security", "web", "authentication", "burp", "ffuf", "bilingual"]
---

> *🇻🇳 Bản tiếng Việt nằm ở phía dưới bài viết (Vietnamese version is available below).*

---

### Understanding and Auditing HTTP Basic Authentication

Some websites place an extra sign-in prompt in front of an administration page or a private directory. A common mechanism for this is HTTP Basic Authentication. It is simple and widely supported, but it is only a gate: it does not make a weak password strong, and it should not be the only protection for a sensitive application.

Basic Authentication is an HTTP authentication scheme; it has no relationship to the browser's `User-Agent` header. When the server asks for authentication, the client sends a value in the `Authorization` header. The value contains the word `Basic` followed by a Base64 representation of `username:password`. Base64 is encoding, not encryption. Anyone who can read an unencrypted request can recover the original pair, so HTTPS is essential.

For example, the text `user:pass` can be represented as `dXNlcjpwYXNz`. The colon separates the username from the password before encoding. A server usually asks for credentials with a `401 Unauthorized` response and a `WWW-Authenticate: Basic` header. After the client supplies credentials, the server either grants access or returns another denial.

### Why an extra password prompt can create a false sense of security

Putting a prompt in front of `/admin` may keep casual visitors away, but an obscure URL is not an access-control policy. If the extra account uses a short, reused, or predictable password, the gate can be weak. It can also be difficult to manage when several people share one account: auditing who signed in or removing one person's access becomes harder.

Basic Authentication does not provide modern account features by itself, such as multi-factor authentication, individual identity, or a built-in policy for throttling repeated failures. Those controls have to come from the server, a gateway, or a separate identity provider. Treat Basic Auth as one layer in a design, not as a substitute for application authorization.

### 1. Confirm what the endpoint is asking for

In an approved assessment, first make a normal request to the in-scope page and inspect the response. A `401` response with `WWW-Authenticate: Basic` indicates that the server is requesting Basic Authentication. Check that the challenge appears only on the expected resources and that the page is served over HTTPS.

Use Burp Suite to inspect a request and response without changing credentials. The `Authorization` header is the relevant part of the HTTP exchange; browser metadata such as `User-Agent` does not determine the Basic Auth username or password. Avoid copying real credentials into notes, screenshots, or reports.

### 2. Build a small Burp Intruder exercise in a local lab

The following walkthrough is deliberately limited to a loopback lab at `http://127.0.0.1:8080/admin`. Configure that disposable endpoint with the synthetic credential `admin:abba`, and keep it isolated from public networks. The example uses only four characters (`a`, `b`, `c`, `d`) and four-character candidates, so Intruder generates exactly 256 requests.

1. In Burp Proxy, capture a request to the local lab using any placeholder Basic Auth value. Send it to **Intruder**.
2. Set the target to `127.0.0.1:8080`. In the request editor, select only the Base64 value after `Authorization: Basic` and add payload markers around it. Do not mark the word `Basic` or other headers.
3. Choose **Sniper**. This attack type uses one payload set at each position in turn. Keep one marked position so the request count stays at 256.
4. In **Payloads**, choose **Brute forcer**. Set the character set to `abcd`, with both minimum and maximum length set to `4`.
5. Under **Payload processing**, add rules in this order: **Add prefix** with the value `admin:`, then **Encode** using Base64. Intruder applies processing rules in sequence, so each candidate becomes a complete `admin:<candidate>` string before it is encoded.
6. Leave Base64 padding intact. A trailing `=` is valid padding and is not something to remove just because it looks unusual. Burp's optional URL-encoding setting is separate from Base64 and should only be enabled when the request format requires it.
7. Start the attack only after checking the host and the request count. In this lab, a `200` response for the `admin:abba` candidate should differ from the `401` responses for the other candidates. Confirm by checking the returned content as well as the status code.

The **Cluster bomb** attack type iterates over every combination from separate payload sets. Two usernames and two passwords produce four combinations; large sets multiply quickly. For Basic Auth, the complete `username:password` pair must be Base64-encoded as one string. Encoding the username and password separately and concatenating those encoded fragments does not produce the correct header. For a small lab exercise, prepare a short list of complete pairs, encode each pair as a whole, and test that single list with one marked position. See PortSwigger's documentation on [attack types](https://portswigger.net/burp/documentation/desktop/tools/intruder/configure-attack/attack-types) and [payload processing](https://portswigger.net/burp/documentation/desktop/tools/intruder/configure-attack/processing) for current UI details.

Use only synthetic accounts on the local endpoint. Do not point this exercise at a public site, a shared service, or real user accounts. If the lab behaves unexpectedly, stop the run and inspect the request before continuing.

### 3. Run the equivalent tiny exercise with ffuf

ffuf substitutes values into requests. The `ffuf_basicauth.sh` helper from the [ffuf scripts project](https://github.com/ffuf/ffuf-scripts) takes username and password files, forms every `username:password` pair, then Base64-encodes each complete pair for use as an `Authorization` header value.

Create two small files for the local lab. They contain invented values only:

`users.txt`

```text
admin
viewer
```

`passwords.txt`

```text
abba
train-01
```

With the helper available locally, the command for this lab is:

```bash
./ffuf_basicauth.sh users.txt passwords.txt | ffuf \
  -w -:AUTH \
  -u http://127.0.0.1:8080/admin \
  -H "Authorization: Basic AUTH" \
  -fc 401 -rate 1 -t 1 -maxtime 30
```

The target is explicitly loopback, the input is four synthetic pairs, and ffuf is capped at one request per second, one worker, and 30 seconds. `-fc 401` filters the expected rejection response so a different response can be inspected; verify the response body and lab logs before deciding that a candidate worked. ffuf's `-rate` controls requests per second, while `-t` controls concurrent workers. Do not replace the loopback URL with a third-party target or feed this example leaked-password lists.

### 4. Strengthen the control

Use HTTPS everywhere and choose unique, high-entropy credentials. Protect the administration page with application-level authorization as well as any gateway prompt. Where possible, use a centralized identity provider that supports individual accounts, multi-factor authentication, and prompt access revocation.

Add rate limiting and monitoring at the layer that receives the authentication requests. Alert on repeated failures and unusual request patterns, but tune lockout behavior to avoid letting an attacker deny service to a legitimate user. Keep authentication logs protected and retain only the information needed to investigate events.

After the lab, remove temporary accounts and document the endpoint, test window, synthetic inputs, request count, and observed result. A useful report describes the control and its gaps without including working credentials.

### Summary

HTTP Basic Authentication is a small, broadly compatible access gate. Its credentials are Base64-encoded in the HTTP header, so HTTPS is required, and the mechanism does not replace strong identity and authorization controls. Burp Suite and ffuf can demonstrate the request format in an isolated loopback lab using synthetic accounts, tiny inputs, and strict request limits. Keep such exercises off public services and never use real credentials.

---

## 🇻🇳 Tìm hiểu và đánh giá HTTP Basic Authentication

Một số website đặt thêm màn hình đăng nhập trước trang quản trị hoặc thư mục riêng tư. HTTP Basic Authentication là một cơ chế phổ biến để làm việc đó. Cách triển khai đơn giản và được hỗ trợ rộng rãi, nhưng nó chỉ là một lớp chặn: không thể biến mật khẩu yếu thành mật khẩu mạnh và không nên là lớp bảo vệ duy nhất cho ứng dụng nhạy cảm.

Basic Authentication là một cơ chế xác thực của HTTP, không liên quan đến header `User-Agent` của trình duyệt. Khi máy chủ yêu cầu xác thực, client gửi giá trị trong header `Authorization`. Giá trị này gồm từ `Basic` và chuỗi `username:password` được biểu diễn bằng Base64. Base64 là mã hóa biểu diễn dữ liệu, không phải mã hóa bảo mật. Nếu request không được bảo vệ, người có thể đọc lưu lượng sẽ khôi phục được cặp thông tin gốc, vì vậy HTTPS là bắt buộc.

Ví dụ, chuỗi `user:pass` có thể được biểu diễn thành `dXNlcjpwYXNz`. Dấu hai chấm phân tách username và password trước khi mã hóa. Máy chủ thường yêu cầu thông tin đăng nhập bằng phản hồi `401 Unauthorized` cùng header `WWW-Authenticate: Basic`. Sau khi client gửi thông tin, máy chủ cho phép truy cập hoặc tiếp tục từ chối.

### Vì sao thêm một lớp mật khẩu có thể tạo cảm giác an toàn sai lệch

Đặt một màn hình xác thực trước `/admin` có thể ngăn khách truy cập thông thường, nhưng URL khó đoán không thay thế được chính sách kiểm soát truy cập. Nếu tài khoản bổ sung dùng mật khẩu ngắn, bị tái sử dụng hoặc dễ đoán thì lớp bảo vệ này có thể yếu. Việc nhiều người dùng chung một tài khoản cũng gây khó khăn khi cần xác định ai đã đăng nhập hoặc thu hồi quyền của một người.

Basic Authentication tự thân không cung cấp các tính năng quản lý tài khoản hiện đại như xác thực đa yếu tố, danh tính riêng cho từng người hay chính sách giới hạn các lần đăng nhập thất bại. Những kiểm soát đó phải được cấu hình ở máy chủ, gateway hoặc nhà cung cấp danh tính riêng. Hãy xem Basic Auth là một lớp trong thiết kế, không phải giải pháp thay thế cho phân quyền của ứng dụng.

### 1. Xác nhận endpoint đang yêu cầu điều gì

Trong một đợt đánh giá được cho phép, trước tiên hãy gửi request thông thường đến trang nằm trong phạm vi và xem phản hồi. `401` kèm `WWW-Authenticate: Basic` cho biết máy chủ đang yêu cầu Basic Authentication. Kiểm tra challenge chỉ xuất hiện ở đúng tài nguyên dự kiến và trang được phục vụ qua HTTPS.

Có thể dùng Burp Suite để xem request và response mà không thay đổi thông tin đăng nhập. Header `Authorization` là phần liên quan đến Basic Auth; metadata trình duyệt như `User-Agent` không quyết định username hoặc password. Tránh chép thông tin đăng nhập thật vào ghi chú, ảnh chụp màn hình hoặc báo cáo.

### 2. Tạo bài thực hành nhỏ bằng Burp Intruder trong lab cục bộ

Hướng dẫn dưới đây chỉ dành cho lab loopback tại `http://127.0.0.1:8080/admin`. Cấu hình endpoint tách biệt này với thông tin giả lập `admin:abba`, không kết nối ra mạng công khai. Ví dụ chỉ dùng bốn ký tự (`a`, `b`, `c`, `d`) và độ dài bốn ký tự, nên Intruder tạo đúng 256 request.

1. Trong Burp Proxy, bắt request đến lab cục bộ bằng một giá trị Basic Auth bất kỳ. Gửi request đó sang **Intruder**.
2. Đặt target thành `127.0.0.1:8080`. Trong trình soạn request, chỉ chọn giá trị Base64 sau `Authorization: Basic` rồi thêm payload marker bao quanh. Không đánh dấu từ `Basic` hoặc các header khác.
3. Chọn **Sniper**. Kiểu tấn công này dùng một tập payload lần lượt ở từng vị trí. Giữ đúng một vị trí được đánh dấu để số request là 256.
4. Trong **Payloads**, chọn **Brute forcer**. Đặt character set là `abcd`, cả độ dài nhỏ nhất và lớn nhất đều là `4`.
5. Trong **Payload processing**, thêm các quy tắc theo thứ tự: **Add prefix** với giá trị `admin:`, sau đó **Encode** bằng Base64. Burp chạy quy tắc theo thứ tự, vì vậy mỗi candidate trở thành chuỗi đầy đủ `admin:<candidate>` trước khi mã hóa.
6. Giữ nguyên padding Base64. Dấu `=` ở cuối là padding hợp lệ, không nên bỏ chỉ vì trông lạ. Tùy chọn URL-encode của Burp khác với Base64 và chỉ bật nếu định dạng request yêu cầu.
7. Chỉ bắt đầu sau khi kiểm tra host và số request. Trong lab này, candidate `admin:abba` phải có phản hồi `200` khác với phản hồi `401` của các candidate còn lại. Hãy kiểm tra nội dung trả về bên cạnh status code.

Kiểu **Cluster bomb** lần lượt thử mọi tổ hợp từ các tập payload riêng. Hai username và hai password tạo thành bốn tổ hợp; tập lớn sẽ nhân số request rất nhanh. Với Basic Auth, phải mã hóa Base64 toàn bộ cặp `username:password` như một chuỗi. Mã hóa riêng username và password rồi ghép hai phần sẽ không tạo ra header hợp lệ. Với bài thực hành nhỏ, hãy chuẩn bị danh sách ngắn gồm các cặp hoàn chỉnh, mã hóa từng cặp rồi thử bằng một payload position. Xem tài liệu PortSwigger về [attack types](https://portswigger.net/burp/documentation/desktop/tools/intruder/configure-attack/attack-types) và [payload processing](https://portswigger.net/burp/documentation/desktop/tools/intruder/configure-attack/processing) để biết giao diện hiện tại.

Chỉ dùng tài khoản giả lập trên endpoint loopback. Không trỏ bài thực hành này vào website công khai, dịch vụ dùng chung hoặc tài khoản thật. Nếu lab có biểu hiện khác dự kiến, dừng lại và kiểm tra request trước khi tiếp tục.

### 3. Thực hiện bài lab nhỏ tương tự bằng ffuf

ffuf thay các giá trị vào request. Script `ffuf_basicauth.sh` trong [dự án ffuf scripts](https://github.com/ffuf/ffuf-scripts) nhận hai file username và password, tạo từng cặp `username:password`, rồi mã hóa Base64 toàn bộ cặp để đặt vào header `Authorization`.

Tạo hai file nhỏ cho lab cục bộ. Chúng chỉ chứa dữ liệu tự tạo:

`users.txt`

```text
admin
viewer
```

`passwords.txt`

```text
abba
train-01
```

Khi đã có script trên máy, chạy lệnh sau cho lab này:

```bash
./ffuf_basicauth.sh users.txt passwords.txt | ffuf \
  -w -:AUTH \
  -u http://127.0.0.1:8080/admin \
  -H "Authorization: Basic AUTH" \
  -fc 401 -rate 1 -t 1 -maxtime 30
```

Target được cố định ở loopback, input chỉ có bốn cặp giả lập, còn ffuf bị giới hạn ở một request mỗi giây, một worker và tối đa 30 giây. `-fc 401` lọc phản hồi từ chối dự kiến để có thể xem phản hồi khác; hãy xác minh nội dung và log lab trước khi kết luận một candidate hợp lệ. `-rate` giới hạn số request mỗi giây, còn `-t` giới hạn worker chạy đồng thời. Không thay URL loopback bằng máy chủ bên thứ ba và không dùng danh sách mật khẩu bị rò rỉ cho ví dụ này.

### 4. Tăng cường lớp bảo vệ

Sử dụng HTTPS ở mọi nơi và chọn thông tin đăng nhập duy nhất, khó đoán. Bảo vệ trang quản trị bằng phân quyền ở cấp ứng dụng bên cạnh lớp gateway. Khi có thể, dùng nhà cung cấp danh tính tập trung hỗ trợ tài khoản cá nhân, xác thực đa yếu tố và thu hồi quyền nhanh chóng.

Thiết lập giới hạn tốc độ và giám sát tại lớp tiếp nhận request xác thực. Cảnh báo khi có nhiều lần thất bại hoặc mẫu request bất thường, đồng thời điều chỉnh cơ chế khóa để tránh việc kẻ tấn công khiến người dùng hợp lệ mất quyền truy cập. Bảo vệ log xác thực và chỉ lưu thông tin cần thiết cho điều tra.

Sau khi kết thúc lab, hãy xóa tài khoản tạm và ghi lại endpoint, khung giờ, dữ liệu giả lập, số request cùng kết quả quan sát được. Báo cáo nên mô tả cơ chế và điểm yếu mà không chứa thông tin đăng nhập còn sử dụng được.

### Tóm tắt

HTTP Basic Authentication là một lớp kiểm soát truy cập đơn giản, tương thích rộng. Thông tin đăng nhập được biểu diễn bằng Base64 trong header HTTP nên cần HTTPS; cơ chế này không thay thế hệ thống danh tính và phân quyền vững chắc. Burp Suite và ffuf có thể minh họa định dạng request trong lab loopback cô lập, với tài khoản giả lập, input nhỏ và giới hạn request nghiêm ngặt. Chỉ thực hiện bài lab trên dịch vụ cục bộ, không dùng thông tin đăng nhập thật.
