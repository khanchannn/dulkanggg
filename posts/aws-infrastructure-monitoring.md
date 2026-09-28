---
title: "[Project Showcase] Xây dựng hệ thống Monitoring cho Infrastructure trên AWS"
date: "2026-09-28"
tags: ["aws", "monitoring", "devops", "prometheus", "kubernetes", "project-showcase"]
---

# [Project Showcase] Xây dựng hệ thống Monitoring cho Infrastructure trên AWS

Trong bài viết này, mình chia sẻ mô hình monitoring cho hạ tầng chạy trên AWS, bao gồm EC2 và Kubernetes trên EKS. Mục tiêu là tập trung metric ở một nơi, quan sát được tình trạng máy chủ, workload và ứng dụng, đồng thời gửi cảnh báo có chọn lọc để đội vận hành xử lý trước khi sự cố ảnh hưởng người dùng.

> Repo đi kèm chứa các cấu hình tham khảo đã lược bỏ thông tin riêng của môi trường. Hãy thay endpoint, phiên bản, quyền IAM và chính sách mạng theo AWS account của bạn trước khi triển khai.

## 1. Kiến trúc tổng quan

![Sơ đồ kiến trúc monitoring cho AWS với EC2, EKS, Prometheus, Grafana và Alertmanager](../../images/aws-infrastructure-monitoring.png)

Hệ thống được chia thành hai vùng mạng trong một VPC:

- **Public subnet:** Application Load Balancer (ALB) nhận kết nối HTTPS của quản trị viên tới Grafana. Không mở trực tiếp Grafana, Prometheus hoặc Alertmanager ra Internet.
- **Private subnet:** Các máy EC2 chạy Grafana, Prometheus và Alertmanager; EC2 ứng dụng, Kafka và Elasticsearch gửi metric qua exporter. EKS chạy các workload ứng dụng cùng các thành phần thu thập metric.
- **Internet Gateway và NAT Gateway:** ALB nhận kết nối Internet; NAT Gateway cho phép tài nguyên private subnet đi ra ngoài khi cần cập nhật hoặc tải image. Trong production, nên cân nhắc VPC endpoints và thiết kế NAT theo yêu cầu sẵn sàng cao cũng như ngân sách.

Luồng metric: **Exporter / ứng dụng → Prometheus → Grafana**. Khi rule đạt ngưỡng trong khoảng thời gian cấu hình, Prometheus gửi alert tới **Alertmanager**, sau đó Alertmanager nhóm và chuyển cảnh báo tới Slack hoặc email.

## 2. Thành phần sử dụng

| Thành phần | Vai trò |
| --- | --- |
| Prometheus | Scrape, lưu trữ và truy vấn time-series metrics |
| Grafana | Dashboard và khám phá dữ liệu từ Prometheus |
| Alertmanager | Nhóm, định tuyến và giới hạn lặp cảnh báo |
| Node Exporter | Thu thập metric hệ điều hành trên EC2 và node Linux |
| kube-state-metrics | Cung cấp trạng thái và metadata của Kubernetes objects |
| Kafka / Elasticsearch exporters | Chuyển metric của broker và cluster thành định dạng Prometheus |
| Instrumentation của ứng dụng | Xuất request rate, latency và số lỗi theo endpoint phù hợp |

Trên EKS, có thể cài `kube-prometheus-stack` để quản lý Prometheus Operator, kube-state-metrics, node exporter, Grafana dashboard và rule Kubernetes. Cần rà lại thành phần nào đã có sẵn để tránh cài exporter hoặc scrape trùng.

## 3. Các metric cần theo dõi

| Nhóm | Metric / trạng thái tiêu biểu | Dùng để phát hiện |
| --- | --- | --- |
| EC2 / host | CPU, memory, filesystem, disk I/O, network in/out | Thiếu tài nguyên, đầy đĩa, nghẽn mạng |
| Kafka | Consumer lag, under-replicated partitions, bytes in/out | Consumer tụt lại, replica không đồng bộ, tải tăng bất thường |
| Elasticsearch | Cluster health, JVM heap, indexing/search latency | Cluster suy giảm, áp lực heap, thao tác tìm kiếm hoặc ghi chậm |
| EKS | Pod phase, restart count, container CPU/memory so với request/limit | Pod Pending hoặc crash-loop, thiếu tài nguyên, restart tăng |
| Ứng dụng | Request rate, latency p95/p99, HTTP 4xx/5xx | Lưu lượng biến động, phản hồi chậm, lỗi tăng |

Metric cần có label ổn định như `environment`, `cluster`, `instance`, `namespace` và `service` để dashboard và alert lọc đúng phạm vi. Tránh đưa user ID, URL có query string hoặc giá trị có cardinality cao vào label.

## 4. Nguyên tắc scrape và lưu trữ

- Dùng `scrape_interval` phù hợp với độ nhạy của từng nhóm metric; ví dụ 30–60 giây cho hạ tầng thông thường. Scrape quá dày làm tăng lưu lượng, dung lượng và chi phí vận hành.
- Đặt retention theo nhu cầu điều tra và dung lượng. Project này dùng mục tiêu ban đầu **15 ngày**; đây không phải giá trị phù hợp với mọi workload.
- Theo dõi chính Prometheus: dung lượng volume, tốc độ tăng dữ liệu, số series và thời gian query. Dùng `metric_relabel_configs` để loại metric không cần thiết sau khi đã xác nhận chúng không phục vụ dashboard hoặc alert nào.
- Với môi trường cần lưu lịch sử dài hoặc HA, đánh giá remote write / giải pháp lưu trữ dài hạn, backup, và cách phục hồi. Không xem một Prometheus instance đơn lẻ là kho lưu trữ bền vững.

## 5. Cảnh báo và giảm alert fatigue

Các rule nên chỉ rõ điều kiện, mức độ ảnh hưởng, thời gian duy trì và hướng xử lý. Ví dụ dưới đây minh họa alert khi filesystem sắp đầy; threshold cần được điều chỉnh theo loại volume và tốc độ tăng dữ liệu:

```yaml
groups:
  - name: infrastructure.rules
    rules:
      - alert: HostFilesystemSpaceLow
        expr: |
          (node_filesystem_avail_bytes{fstype!="tmpfs",mountpoint!="/run"}
            / node_filesystem_size_bytes{fstype!="tmpfs",mountpoint!="/run"}) < 0.10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Filesystem space is low on {{ $labels.instance }}"
          description: "Less than 10% free on {{ $labels.mountpoint }}. Check disk growth and retention."
```

Để giảm cảnh báo rác:

1. Phân loại `critical` và `warning`, định tuyến tới đúng người nhận.
2. Dùng `for: 5m` cho tín hiệu cần duy trì liên tục; không áp dụng máy móc cho mọi alert.
3. Nhóm các alert cùng cluster/service và cấu hình `group_wait`, `group_interval`, `repeat_interval` để tránh spam.
4. Thêm `runbook_url` hoặc hướng xử lý trong annotation; định kỳ xem alert nào không có hành động tương ứng.
5. Lưu Slack webhook và thông tin SMTP trong Kubernetes Secret hoặc secret manager; không commit credential vào Git.

## 6. Vấn đề gặp phải và cách xử lý

### Prometheus làm đầy ổ đĩa

Lưu quá nhiều series trong thời gian dài có thể làm volume tăng nhanh. Hướng xử lý là đặt retention có giới hạn, điều chỉnh scrape interval, loại bỏ metric thừa sau khi đánh giá tác động, và theo dõi tốc độ tăng dung lượng trước khi volume cạn.

### Cảnh báo quá nhiều

Khi mọi bất thường đều gửi Slack ngay lập tức, cảnh báo quan trọng dễ bị bỏ qua. Chia severity, yêu cầu điều kiện duy trì bằng `for: 5m` ở những rule phù hợp, gom nhóm thông báo và rà lại ngưỡng dựa trên dữ liệu thực tế giúp kênh cảnh báo dễ sử dụng hơn.

## 7. Bảo mật và vận hành

- Đặt Grafana, Prometheus và Alertmanager ở private subnet; chỉ expose giao diện cần thiết qua ALB có HTTPS, xác thực và giới hạn nguồn truy cập.
- Chỉ cho phép Prometheus scrape các port exporter từ security group hoặc network policy cần thiết; không mở exporter ra Internet.
- Tách quyền đọc dashboard khỏi quyền sửa datasource/rule; không dùng tài khoản admin mặc định.
- Không commit secret, token, account ID hoặc state Terraform chứa dữ liệu nhạy cảm. Dùng secret manager và backend state có mã hóa, khóa truy cập.
- Đặt budget alert cho NAT Gateway, EKS, EC2, EBS và truyền dữ liệu; chi phí AWS phụ thuộc region, cấu hình và thời gian chạy.
- Kiểm tra quy trình nâng cấp, backup và khôi phục dashboard, rule, cấu hình cũng như dữ liệu cần giữ.

## 8. Repository và phạm vi triển khai

Mã nguồn, cấu hình Prometheus, alert rules, dashboard Grafana và hướng dẫn triển khai được lưu tại [aws-infrastructure-monitoring](https://github.com/khanchannn/aws-infrastructure-monitoring).

Repo là lab/showcase để xem cấu trúc và thử từng thành phần. Terraform/EKS có thể phát sinh chi phí AWS; hãy đọc hướng dẫn, kiểm tra plan, cấu hình quyền IAM tối thiểu và xóa tài nguyên lab sau khi thực hành. Các giá trị ví dụ không thay thế việc review bảo mật cho production.

## Kết luận

Một hệ thống monitoring hữu ích cần đi từ metric có ý nghĩa tới cảnh báo có người chịu trách nhiệm và hành động cụ thể. Bắt đầu với những tín hiệu ảnh hưởng trực tiếp đến độ ổn định dịch vụ, theo dõi dung lượng lưu trữ của chính monitoring stack, rồi mở rộng dần theo nhu cầu vận hành.
