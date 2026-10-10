# Portfolio: hướng dẫn nhanh

## Cấu trúc thư mục (giữ nguyên khi tải lên GitHub)

```
portfolio/
  build.mjs            Script dựng website (Vercel tự chạy, bạn không cần sửa)
  package.json
  vercel.json          Cấu hình triển khai, bảo mật, bộ nhớ đệm
  content/
    data.mjs           TOÀN BỘ nội dung: chữ, số, liên kết, mạng xã hội, case study
    posts/             Bài blog (.md). File bắt đầu bằng _ sẽ không được đăng
  src/assets/
    css/site.css       Giao diện
    js/app.js          Hiệu ứng, biểu mẫu liên hệ
    img/               Mọi hình ảnh (đường dẫn trong data.mjs: /assets/img/ten-file.svg)
```

Thư mục `dist/` được tạo tự động khi build, không cần tải lên.

## Sửa nội dung

1. Mở `content/data.mjs`, sửa chữ trong dấu nháy kép. Không xóa dấu nháy hoặc dấu phẩy.
2. Đặt `demo:false` khi dùng nội dung thật. Đổi `url` thành địa chỉ thật của trang.
3. Ảnh: bỏ vào `src/assets/img/`, tên chữ thường không dấu, rồi ghi `"/assets/img/ten-file.jpg"`.
4. Thêm case study: sao chép một khối trong `CASES`, đổi `slug` (không dấu, nối bằng dấu gạch ngang). Có `proj:1` là trang dự án, không có là case study.
5. Biểu mẫu liên hệ: điền `SB.url` và `SB.key` (khóa publishable) trong cùng file.

## Thêm bài blog sau này

Tạo file `content/posts/ten-bai.md` với phần đầu như `_bai-mau.md`. Mục Blog, trang danh sách, RSS, sitemap tự xuất hiện.

## Triển khai

Đẩy lên GitHub, import vào Vercel. Không cần chọn Framework hay lệnh build, `vercel.json` đã khai báo sẵn.
