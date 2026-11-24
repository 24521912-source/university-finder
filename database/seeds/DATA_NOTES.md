# Ghi chú dữ liệu cần kiểm tra

Dữ liệu cấp 2–3 được tra từ trang chính thức của trường (hoặc báo/trang tuyển sinh uy tín khi trang trường không truy cập được) vào 14/10/2026. Mỗi điểm chuẩn/học phí trong `universities.json` có `sourceUrl`. Dưới đây là những điểm chưa chắc chắn hoặc bị bỏ sót — kiểm tra trước khi demo.

## Đại học Kinh tế Thành phố Hồ Chí Minh (UEH) — cấp 3

- Điểm chuẩn 2026 (Khóa 52, công bố 09/08/2026) theo phương thức xét tuyển tích hợp thang 100, không có điểm riêng thang 30/1200 -> dùng điểm chuẩn 2025 (Khóa 51, mã KSA). Nguồn 2026 (chưa đọc bảng chi tiết): https://tuyensinh.ueh.edu.vn/bai-viet/ueh-cong-bo-ket-qua-xet-tuyen-khoa-52-dai-hoc-chinh-quy-nam-2026-gia-tang-co-hoi-hoc-tap-quoc-te/
- Điểm 2025 là một mức chung cho PT2, PT3, PT4, PT5 (đã quy đổi tương đương, thang 30), không phải điểm riêng của thi THPT; UEH không công bố điểm ĐGNL riêng thang 1200.
- Các CTĐT có dấu (*) (Tiếng Anh thương mại, Thống kê kinh doanh, Toán tài chính, Phân tích rủi ro..., TMĐT, HTTTQL, KHDL, Phân tích dữ liệu, KHMT, KTPM, CNTT, Công nghệ nghệ thuật, Công nghệ và ĐMST, ATTT): PT5 có môn nhân hệ số 2 quy về thang 30.
- Tổ hợp xét tuyển không có trong bảng điểm 2025 -> combinations để trống (tổ hợp 2026 có trong trang thông tin tuyển sinh 2026).
- Mã ngành 7 số và tên ngành MOET lấy từ bảng chương trình trong thông tin tuyển sinh 2026; ISB BBus -> 7340101 và ASEAN Co-op -> 7340201 theo bảng 2026 (bảng 2025 chỉ ghi mã ISB_CNTN, ASA_Co-op).
- Điểm UEH Mekong (KSV, 17–22) không đưa vào.
- foundedYear 1976 (QĐ 426/TTg ngày 27/10/1976) chỉ xác nhận qua nguồn thứ cấp (tapchitoaan.vn), không thấy trên trang giới thiệu chính thức.
- Học phí 2026-2027 tính theo tín chỉ, không quy đổi ra năm; không gắn với mã ngành cụ thể.

## Trường Đại học Bách khoa, ĐHQG-HCM (HCMUT) — cấp 3

- HCMUT chỉ công bố điểm chuẩn 2026 (và cả 2025) theo phương thức xét tuyển tổng hợp THANG 100 (điểm học lực + điểm cộng + điểm ưu tiên), không có quy đổi thang 30 và không có điểm ĐGNL riêng, nên không thể dùng điểm thang 30 năm 2025; dùng điểm 2026 với scale=100. method ghi 'high_school_exam' cho gần nghĩa nhất (thực chất là xét tuyển tổng hợp).
- Bảng điểm chuẩn chính thức là ảnh trên hcmut.edu.vn (SPA, không tải được); điểm được đọc từ 3 ảnh bảng của trường đăng lại trên xaydungchinhsach.chinhphu.vn, khớp với các số nêu trong vnexpress (https://vnexpress.net/diem-chuan-dai-hoc-bach-khoa-tp-hcm-hcmut-nam-2026-chi-tiet-5106844.html).
- Tổ hợp xét tuyển và ánh xạ mã XT 3 số -> mã ngành 7 số lấy từ trang tổng hợp (tuyensinh247 đề án; https://trangedu.com/truong/dai-hoc-bach-khoa-dhqg-tphcm/); mã 7520122 Kỹ thuật tàu thủy từ API ngành của hcmut.edu.vn; mã 7520207/7850101 xác nhận tại trang HCMUS.
- Bỏ qua (không tìm thấy mã ngành 7 số đã kiểm chứng): 108 phần Kỹ thuật điều khiển & tự động hóa và Thiết kế vi mạch (chỉ map 7520201, 7520207); 112 Nhóm Dệt - May (69.92); 115 các ngành KTXD công trình giao thông/thủy/biển, cơ sở hạ tầng, trắc địa - bản đồ, CNKT vật liệu xây dựng (chỉ map 7580201); 125/225/325 phần Kỹ thuật môi trường (chỉ map 7850101); 128 phần Kỹ thuật hệ thống công nghiệp (chỉ map 7510605); 152 Kỹ thuật Đường sắt (76.06); 159 Kỹ thuật Bán dẫn (85.80); 208 Tiên tiến Kỹ thuật Điện - Điện tử (83.27); 252 Đường sắt TA (58.67); 258 Thiết kế Vi mạch TA (85.51); 259 Bán dẫn TA (82.66); 308 Chuyển tiếp Điện - Điện tử (68.85).
- Học phí: bảng 'học phí trung bình dự kiến' trong đề án đăng trên tuyensinh247 (trang chính thức hcmut.edu.vn không truy cập được).
- Địa chỉ/điện thoại/năm thành lập không đọc được từ hcmut.edu.vn (SPA); địa chỉ theo tuyensinh247 & trangedu, điện thoại 028 3864 7256 và năm 1957 theo https://www.momo.vn/sinh-vien/dai-hoc-bach-khoa-tp-hcm-hcmut (trangedu ghi số khác: 028 3865 4087).
- Tọa độ lấy từ OpenStreetMap qua Photon (komoot) vì Nominatim không truy cập được.

## Trường Đại học Công nghiệp TP.HCM (IUH) — cấp 2

- 2026 benchmarks (TB 971/TB-ĐHCN and TB 972/TB-ĐHCN, 10/8/2026) are for IUH's single 'phương thức xét kết hợp' (THPT exam + ĐGNL ĐHQG-HCM + học bạ lớp 12 + thành tích; thang 30). Recorded as method high_school_exam; no separate ĐGNL (thang 1200) benchmark exists for 2026. The announcement lists no tổ hợp per row, so combinations = [].
- The announcement has no major codes; codes taken from IUH's 2026 admissions info (https://tuyensinh.iuh.edu.vn, section 'Thông tin xét tuyển đợt 1 năm 2026'). Group rows expanded to one entry per major. 'Nhóm ngành Công nghệ thông tin' (school code 7480201) expanded to CNTT 7480201, KTPM 7480103, KHMT 7480101, HTTT 7480104 per the school's group description.
- IUH lists 'Kỹ thuật máy tính' under code 7480108 (MOET name: Công nghệ kỹ thuật máy tính); kept 7480108. 'Công nghệ hóa học' uses 7510401. 'Quản lý đất đai' group (7850103) also includes Kinh tế tài nguyên thiên nhiên per the school, not expanded.
- Tuition 2026-2027 (and 2025-2026) NOT found on iuh.edu.vn / tuyensinh.iuh.edu.vn: admissions page only states Quảng Ngãi campus gets 50% tuition reduction; tuition notices for HK1 2026-2027 have dates but no amounts. Aggregator figures (e.g. 33.5 triệu/năm kỹ thuật) are from 2024 or estimates, so not recorded.
- foundedYear 1956 = Trường Huấn nghiệp Gò Vấp (tiền thân); upgraded to university 12/2004 (QĐ 214/2004/QĐ-TTg). Source: https://iuh.edu.vn/vi/ve-chung-toi.html
- Location from Photon (OSM) since Nominatim returned nothing from this environment.

## Trường Đại học Công nghệ Thông tin, ĐHQG-HCM (UIT) — cấp 3

- UIT 2026 chỉ có 2 phương thức: tuyển thẳng và 'xét tuyển tổng hợp' (thang 100, đã gồm điểm cộng + ưu tiên). Điểm ghi ở đây là cột 'thang điểm 30' quy đổi do trường công bố trong ảnh bảng điểm chuẩn (https://www.uit.edu.vn/media/DIEM_CHUAN_1_a4247f962d.png), method ghi 'high_school_exam' cho gần nghĩa nhất; không phải điểm thi THPT thuần. Điểm thang 100 tương ứng: 7320104 82.20, 7340122 79.00, 7460108 91.70, 7460108TA 85.50, 7480101 88.50, 7480101TA 85.00, 7480102 78.30, 7480103 81.00, 7480103TA 76.00, 7480104 80.80, 7480104TT 78.00, 7480106 84.00, 7480107 100.00, 7480201 84.20, 7480201VN 80.00, 7480202 88.70, 7480202TA 77.50, 75202A1 90.50, 75202A1TA 80.00.
- Không có điểm chuẩn ĐGNL riêng (thang 1200) năm 2026 – trường không công bố phương thức ĐGNL tách riêng.
- Thiết kế vi mạch dùng mã ngành thí điểm '75202A1' theo đề án của trường; không có mã 7 chữ số chuẩn tương ứng nên giữ nguyên mã này.
- Tổ hợp xét tuyển lấy từ Đề án tuyển sinh 2026 (https://tuyensinh.uit.edu.vn/sites/default/files/uploads/files/202607/dean_moi.pdf), không có trong ảnh điểm chuẩn.
- Học phí là 'học phí dự kiến' theo đề án 2026 (đơn vị nghìn đồng/lần đóng, 2 lần/năm). Trang https://tuyensinh.uit.edu.vn/hoc-phi-hoc-bong hiển thị bảng khác (cũ hơn): chuẩn 42.000.000, tiên tiến 60.000.000 cho 2026-2027 – không dùng.
- Đề án 2026 ghi địa chỉ trụ sở 'Khu phố 34, Phường Linh Xuân, TP. HCM', khác với footer website ('Khu phố 9'); dùng theo website như yêu cầu.
- Tọa độ lấy từ dữ liệu OpenStreetMap qua Photon (komoot) vì Nominatim không truy cập được.

## Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (HCMUS) — cấp 3

- Điểm chuẩn 2026 là phương thức 2 'xét tuyển tổng hợp' (THPT 2026 hoặc ĐGNL ĐHQG-HCM 2026 kết hợp học bạ, đã gồm điểm cộng và ưu tiên); trường công bố cả thang 30 và thang 100 trong ảnh https://tuyensinh.hcmus.edu.vn/wp-content/uploads/2026/08/Diem-chuan-2026_ALL-IN-scaled.png. Dùng cột thang 30; method ghi 'high_school_exam' cho gần nghĩa nhất. Không có điểm ĐGNL thang 1200 riêng.
- Mã nhóm ngành (…NN) được tách theo ngành thành phần: 7440102NN -> 7440102, 7440107; 7440201NN -> 7440201, 7440206; 7460101NN -> 7460101, 7460112, 7460117; 7460108NN -> 7460108, 7460201; 7480201NN -> 7480201, 7480103, 7480104, 7480101. Mã 7440206 (Kinh tế đất đai) và 7460201 (Thống kê) lấy từ trang học phí của trường; 7480103/7480104 không xuất hiện trên trang HCMUS (xác nhận tại đề án UIT).
- Mã ngành thí điểm '74401a1' (Công nghệ bán dẫn) và '75202a1' (Thiết kế vi mạch) giữ nguyên như trường công bố, không có mã 7 chữ số thuần số.
- Tổ hợp xét tuyển lấy từ https://tuyensinh.hcmus.edu.vn/2026-thong-tin-tuyen-sinh/ (cập nhật 10/7/2026).
- Học phí: trang không ghi rõ đơn vị, tiêu đề cột 'Học phí năm 2026-2027' nên ghi unit=year.
- Tọa độ lấy từ OpenStreetMap qua Photon (komoot) vì Nominatim không truy cập được.

## Trường Đại học Kinh tế - Luật, ĐHQG-HCM (UEL) — cấp 3

- Điểm chuẩn 2026 đã công bố (09/08/2026) nhưng theo phương thức xét tuyển tổng hợp thang điểm 100 (ĐGNL 55% + THPT 35% + học bạ 10%), không có điểm riêng thang 30/1200 -> dùng điểm chuẩn 2025. Nguồn 2026: https://tuyensinh.uel.edu.vn/truong-dai-hoc-kinh-te-luat-cong-bo-ket-qua-tuyen-sinh-dai-hoc-chinh-quy-nam-2026/ (bảng đầy đủ dạng ảnh: https://tuyensinh.uel.edu.vn/wp-content/uploads/2026/08/UEL_Cong-bo-diem-chuan-2026.png).
- Điểm 2025 đọc từ ảnh bảng điểm (TCBC_PT2 = ĐGNL, TCBC_PT3 = thi THPT) trên trang công bố; điểm đã cộng điểm thưởng/ưu tiên và quy đổi bách phân vị theo ghi chú của trường.
- foundedYear=2000 là năm thành lập Khoa Kinh tế ĐHQG-HCM (tiền thân, 06/11/2000); trường mang tên Trường ĐH Kinh tế - Luật từ 24/3/2010.
- Trang liên hệ tuyển sinh ghi "khu phố 13" ở một chỗ, trang chủ uel.edu.vn ghi "khu phố 3".
- Học phí 2026-2027 là mức dự kiến; không có mức riêng cho chương trình ICAEW.
- Chương trình liên kết quốc tế (408_I, 410_I) không có điểm chuẩn trong bảng 2025.
- [Bổ sung 11/2026] Điểm chuẩn 2026 xét tuyển tổng hợp THANG 100 (38 mã XT) đọc từ ảnh chính thức https://tuyensinh.uel.edu.vn/wp-content/uploads/2026/08/UEL_Cong-bo-diem-chuan-2026.png; khớp top 10 và khoảng 65,01–90,01 nêu trong bài công bố. Ghi year=2026, scale=100, method='high_school_exam' (gần nghĩa nhất), program = tên chuyên ngành + '(mã XT ...)'. Mã XT -> mã ngành theo Thông tin tuyển sinh 2026 (bản đăng Dân trí: https://dcdn.dantri.com.vn/2026/02/15/thong-tin-tuyen-sinh-uel-2026-1771150334010.docx).
- Công thức 2026 (đề án): Điểm học lực = 55% ĐGNL quy đổi + 35% THPT quy đổi + 10% học bạ quy đổi; không thi ĐGNL thì ĐGNL thay bằng THPT quy đổi × α (α = 100% năm 2026). ĐGNL × 100/1200; THPT, học bạ = tổng 3 môn × 100/30. Công thức 20/30/50 và 50/50 trong cùng file chỉ dành cho chương trình liên kết (_I).
- Tổ hợp 2026: A00, A01, D01, D07, X25, X26 (đề án ghi 'Toán - Tiếng Anh - Hóa học (D01)', hiểu là D07).

## Trường Đại học Mở TP.HCM (OU) — cấp 3

- Trang điểm chuẩn 2026 không liệt kê tổ hợp xét tuyển theo ngành (chỉ nói điểm chuẩn bằng nhau giữa các tổ hợp) nên combinations để trống.
- Cột "Điểm chuẩn ĐGNL" không ghi rõ thang điểm; trang chỉ nói "kỳ thi Đánh giá năng lực của ĐHQG" – ghi scale 1200 theo thang của ĐGNL ĐHQG-HCM (giá trị 465–1036), chưa được trang xác nhận trực tiếp.
- Trụ sở: ou.edu.vn ghi "97 Võ Văn Tần" là địa chỉ trường, nhưng mục liên hệ ghi 35-37 Hồ Hảo Hớn, P. Cầu Ông Lãnh (Quận 1 cũ); chọn 97 Võ Văn Tần (Quận 3 cũ) làm cơ sở chính.
- Học phí lấy từ ảnh/PDF (Google Drive id 1-sqLXWF_PrtKJ8-ZtQVv1NBta79zU_ri) nhúng trên trang tuyển sinh; là "học phí bình quân" dự kiến khóa 2026, năm học 2026-2027; tăng không quá 10%/năm. Không có học phí cho chương trình liên kết quốc tế và Phân hiệu Đồng Nai.
- Mã tiên tiến (hậu tố C), Đồng Nai (D), liên kết (FL, SQ, SW, RO) được quy về mã 7 số; mã gốc ghi trong program.
- Số điện thoại lấy từ ou.edu.vn (028-38364748); hotline tuyển sinh 1800585884.
- Tọa độ lấy từ Photon (OpenStreetMap node 2341640693) vì Nominatim không truy cập được.

## Trường Đại học Ngoại thương, Cơ sở II tại TP.HCM (FTU2) — cấp 3

- Mã ngành 7 số KHÔNG có trong tài liệu chính thức của FTU (trường chỉ dùng mã xét tuyển NTSKT01...NTSKE06). Ánh xạ là suy luận: Kinh tế đối ngoại → 7310101 Kinh tế và Logistics toàn cầu… → 7310101 (cùng nhóm mã "KT"; có thể là 7310106 hoặc 7510605), Truyền thông Marketing tích hợp → 7340115, Kế toán - Kiểm toán → 7340301 (có thể là 7340302). Chỉ QTKD (7340101) và TC-NH (7340201) khớp tên trực tiếp. Cần kiểm tra lại.
- Thông báo chính thức (736/TB-ĐHNT, https://drive.google.com/file/d/120XeyBDATqTd-UHEyHh2cNudSt_OqgNK/view, đăng trên https://ftu.edu.vn/tuyensinh/dai-hoc-chinh-quy/ftu-thông-tin-tuyển-sinh-chung/thong-tin-tuyen-sinh-chung-nam-2026/7210-thong-bao-ngu-ng-di-m-trung-tuy-n-d-i-h-c-chinh-quy) chỉ công bố một ngưỡng theo tổ hợp gốc A00 cho mỗi mã xét tuyển (chung cho CT CLC và CT TC cùng mã); ghi chú chính thức: các tổ hợp A01, D01, D02, D03, D04, D06, D07 thấp hơn 1,00 điểm. Điểm các tổ hợp khác (X-1) lấy từ tuyensinh247 (khớp quy tắc này); với CT CLC (không xét A00) điểm X-1 là suy ra cho cùng mã xét tuyển.
- FTU không công bố riêng điểm chuẩn ĐGNL (HSA/V-ACT) – chỉ có bảng quy đổi tương đương; tuyensinh247 có ghi HSA/V-ACT nhưng không có nguồn chính thức nên không ghi.
- Website cs2.ftu.edu.vn hiện không hoạt động (trang mặc định Plesk / lỗi chứng chỉ); dữ liệu lấy từ ftu.edu.vn.
- Số điện thoại Phân hiệu chưa tìm thấy trên trang chính thức ((028) 3512 7254 chỉ thấy trên trang bên thứ ba jobsgo.vn, chưa xác minh).
- foundedYear 1993 = năm thành lập Cơ sở II (nguồn: daibieunhandan.vn/truong-dai-hoc-ngoai-thuong-thanh-lap-phan-hieu-tai-tp-ho-chi-minh-10408850.html); Trường ĐH Ngoại thương thành lập 1960.
- Học phí là mức dự kiến chung toàn trường năm học 2026-2027, không tách riêng Phân hiệu TP.HCM.
- Tọa độ lấy từ Photon (OpenStreetMap way 318679201, dữ liệu OSM ghi "25 Đường D5" khác với địa chỉ chính thức "15 Đường D5").

## Trường Đại học Quốc tế, ĐHQG-HCM (IU) — cấp 3

- Điểm chuẩn 2026 (công bố ~09/08/2026) theo phương thức xét tuyển tổng hợp thang 100, 24 mã ngành; không tìm thấy bảng chính thức trên tuyensinh.hcmiu.edu.vn và không có điểm riêng thang 30/1200 -> dùng điểm chuẩn 2025.
- Điểm THPT 2025: Ngôn ngữ Anh tính trên thang 40 (tiếng Anh x2), nhóm Kinh doanh – Quản lý – Kinh tế trên thang 35 (tiếng Anh x1,5) -> các entry này có scale 40/35 thay vì 30.
- Điểm 2025 công bố theo nhóm ngành (IU01–IU05, AP01–AP05); mỗi ngành trong nhóm ghi cùng một điểm. Mã 7 số lấy từ Thông tin tuyển sinh 2026 (PDF chính thức).
- Thương mại điện tử (7340122) là ngành mới 2026, chưa có điểm chuẩn 2025.
- Địa chỉ: hcmiu.edu.vn ghi "khu phố 9", trang tuyensinh.hcmiu.edu.vn/lien-he ghi "Khu phố 33". OSM xếp tọa độ vào khu Đông Hòa (giáp ranh).
- Học phí 2026-2027 là mức dự kiến; liên kết 4+0 với ĐH Andrews thu theo tỷ giá (không có số); môn cơ sở/chuyên ngành 2 năm đầu CT liên kết 2.050.000đ/tín chỉ.
- [Bổ sung 11/2026] Điểm chuẩn 2026 xét tuyển tổng hợp THANG 100 cho 24 ngành 'do ĐHQT cấp bằng' lấy từ trang tổng hợp https://diemthi.tuyensinh247.com/diem-chuan/dai-hoc-quoc-te-dhqg-tphcm-QSQ.html (không tìm thấy bảng chính thức dạng đọc được; PDF đề án trên tuyensinh.hcmiu.edu.vn không tải được). Không nhập các chương trình liên kết.
- Đề án chỉ nêu dạng k1·THPT + k2·ĐGNL + k3·học bạ, chưa có hệ số -> trang tư vấn chỉ hiện điểm chuẩn, không ước tính.

## Trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE) — cấp 3

- School renamed to 'Trường Đại học Công nghệ Kỹ thuật TP. Hồ Chí Minh' by QĐ 2809/QĐ-TTg ngày 26/12/2025 (cited in the 2026 benchmark decision). Admission code UTE unchanged.
- 2026 benchmarks (QĐ 76/QĐ-HĐTSĐHCQ, 09/8/2026) are for the school's 'phương thức tuyển sinh kết hợp' (combining THPT exam, học bạ, ĐGNL ĐHQG-HCM; thang 30). Recorded as method high_school_exam because the schema has no 'combined' method. No separate ĐGNL (thang 1200) benchmark published.
- Benchmark table is not per tổ hợp, so combinations = []. Combinations by subject (not A00-style codes) are in the 2026 flyer: https://tuyensinh.hcmute.edu.vn/pictures/THONG-TIN-TUYEN-SINH-NAM-2026-2-1768292994671.jpg
- School codes mapped: suffix V = tiếng Việt (program null), A = tiếng Anh, N = Việt-Nhật, BP = Bình Phước, TA/VM/DD = named programs. 7310403 Tâm lý học giáo dục, 7480118, 7480203, 7510209, 7840110 etc. are kept as the school publishes them.
- Supplementary-round benchmark for ngành Luật (26/8/2026) not included.
- Đại trà / tiếng Anh tuition for 2026-2027 NOT found: the official 'Thông tin tuyển sinh ĐHCQ 2026' PDF on hcmute.edu.vn returns 404 (main site hcmute.edu.vn unreachable during research). Only Sư phạm (miễn học phí) and Liên kết quốc tế fees recorded.
- Phone is the admissions counselling office number from the 2026 flyer; address ward follows the flyer ('P. Thủ Đức').
- foundedYear 1962 = Ban Cao đẳng Sư phạm Kỹ thuật (5/10/1962), confirmed via tienphong.vn article on the renaming (official history page not reachable).
- Bình Phước campus address not found. Location from Photon (OSM) since Nominatim returned nothing; OSM point may sit on the east side of campus.

## Trường Đại học Sư phạm TP.HCM (HCMUE) — cấp 2

- Bảng điểm trúng tuyển chính thức 2026 của trường (tuyensinh.hcmue.edu.vn, ngày 11/8/2026) chỉ đính kèm file PDF Google Drive bị chặn tải -> dùng bảng 2026 của tuyensinh247 (khớp với các mức Tuổi Trẻ nêu: SP Hóa 29,83; Toán ứng dụng 26,44; CNTT 18...).
- Mỗi ngành có nhiều dòng theo tổ hợp (độ lệch điểm giữa các tổ hợp); trường công bố theo 'tổ hợp gốc'.
- Điểm phân hiệu Long An (SP Toán 28,84; SP Tiếng Anh 26,70) và Gia Lai (SP KHTN 25,50) lấy từ Tuổi Trẻ, không có tổ hợp; các ngành khác ở phân hiệu chưa tìm thấy.
- Giáo dục Mầm non, Giáo dục Thể chất, Giáo dục Quốc phòng - An ninh: chỉ thấy điểm trong bảng 'xét tuyển kết hợp' (THPT/học bạ + năng khiếu) trên tuyensinh247, không rõ phương thức từng dòng -> không ghi.
- Tiếng Việt và Văn hóa Việt Nam (7220101): không có điểm 2026 theo THPT.
- Không có điểm ĐGNL thang 1200 (trường dùng kỳ thi ĐGNL chuyên biệt riêng kết hợp học bạ).
- Mã 7310201 (Chính trị học) và 7760103 (Hỗ trợ giáo dục người khuyết tật) — ngành mới 2026 — lấy từ đề án trên tuyensinh247; các mã khác từ trang điểm trúng tuyển 2 năm của trường: http://tuyensinh.hcmue.edu.vn/index.php?option=com_content&view=article&id=27810%3Aim-trung-tuyn-ca-2-nm-gn-nht&catid=4069%3Atin-tc&Itemid=9677&lang=vi&site=183
- Học phí: không tìm được. Quy định mức thu 2024-2025 đến 2026-2027 (QĐ 2465) chỉ có dạng PDF đính kèm trên khoaanh.hcmue.edu.vn không tải được; sinh viên ngành sư phạm được hỗ trợ học phí và sinh hoạt phí theo quy định Nhà nước.
- Địa chỉ phân hiệu Long An, Gia Lai chưa xác minh.

## Trường Đại học Tôn Đức Thắng (TDTU) — cấp 3

- Điểm thi THPT dùng năm 2025 (thang 40, tổ hợp gốc, một môn nhân hệ số 2) vì năm 2026 TDTU chỉ công bố Phương thức 1 dạng điểm tổng hợp thang 100 (THPT + học bạ + năng lực khác): https://admission.tdtu.edu.vn/sites/admission/files/Tuyen-sinh/2026/TB-Diemtrungtuyen/PL1-Diem-trung-tuyen-DH-2026-PT1-TanHung.pdf
- ĐGNL (ĐHQG-HCM, thang 1200) dùng năm 2026 (Phương thức 2, cơ sở Tân Hưng). ĐGNL 2026 của Phân hiệu Khánh Hòa (PL2-...-PhanHieu.pdf) chưa thu thập; điểm THPT 2025 có cả các mã N... (Phân hiệu Khánh Hòa) vì nằm trong cùng file.
- Điểm 2025 là điểm tổ hợp gốc; một số tổ hợp khác cao hơn +0,25 đến +1,0 theo PDF. combinations chỉ liệt kê tổ hợp có chênh lệch 0, được quy đổi từ tên môn sang mã tổ hợp (A00, D01...) – TDTU nhân hệ số 2 một môn nên mã tổ hợp chỉ mang tính tham chiếu; tổ hợp có Vẽ HHMT/TTM, Tin học, Công nghệ, NK TDTT không quy đổi được nên bỏ qua (combinations rỗng nếu không còn tổ hợp nào).
- Mã ngành TDTU có tiền tố/hậu tố (F, FA, D, K, DK, N; C, N, Q, T, H, G, L, M, E, X) được quy về 7 số; mã gốc ghi trong program. Một số chương trình liên kết nằm dưới mã ngành của trường (vd. K7340101N Quản trị nhà hàng - khách sạn → 7340101, K7480101L Công nghệ thông tin → 7480101).
- Một số ngành chỉ có điểm ĐGNL 2026 (không có trong bảng THPT 2025), vd. 7210408, 7310206, 7340404, 7340205, 7420204, 7480104, 7580104, 7520320, 7460108; 7510406 chỉ có trong 2025.
- 7310630 Việt Nam học chỉ tuyển thẳng người nước ngoài, không có điểm.
- Học phí 2026-2027 là mức dự kiến (học phí trung bình); học phí kỹ năng tiếng Anh (4,7–11,5 triệu/cấp độ) tính riêng, không đưa vào.
- Số điện thoại là hotline tư vấn tuyển sinh đại học trên admission.tdtu.edu.vn; tổng đài chung của trường chưa xác minh.
- Tọa độ lấy từ Photon (dữ liệu OpenStreetMap, way 290134801) vì Nominatim không truy cập được.

## Trường Đại học Y Dược TP.HCM (UMP) — cấp 3

- Benchmark announcement (TB 3557/TB-ĐHYD, 10/8/2026) is a single list for the 2026 general admission round (scores are per tổ hợp; B00 is the base combination, other combos = lowest admitted score). Recorded as method high_school_exam. Read from the PNG images embedded on the sourceUrl page.
- UMP does not publish separate ĐGNL (thang 1200) benchmarks for 2026; none recorded.
- Tuition is 'học phí dự kiến' from the 2026 admissions information (1608/TTTS-ĐHYD, 06/4/2026), assumed to apply to 2026-2027 first-year students.
- Ngành Điều dưỡng chuyên ngành Gây mê hồi sức uses admission code 772030103 (formerly 7720301_03); mapped to 7720301 with program note.
- foundedYear = 1947 (Trường Đại học Y khoa Sài Gòn, tiền thân); the merged Đại học Y Dược TP.HCM was established 27/10/1976 (QĐ 426/TTg). Source: https://ump.edu.vn/gioi-thieu/lich-su-phat-trien
- Location from Photon (OSM data) because Nominatim returned no response from this environment.
- Campus addresses come from the updated 2026 admissions info PDF: https://ump.edu.vn/uploads/ckeditor/files/Truong/DaoTaoDaiHoc/TuyenSinh/2026/2373_27052026_Capnhat_Thongtintuyensinh.pdf

## Trường Đại học Văn Lang (VLU) — cấp 3

- Điểm chuẩn 2026 công bố theo nhóm ngành (ảnh bảng trên trang chính thức); các ngành không nêu tên được gán 15 (THPT) / 600 (V-ACT) theo dòng 'Các ngành đào tạo còn lại'.
- Danh sách 10 ngành Global Elite lấy từ nội dung bài công bố điểm chuẩn; trường không công bố điểm riêng theo từng ngành Elite.
- Tổ hợp xét tuyển lấy từ bảng ngành 2026 tại https://www.vlu.edu.vn/news/truong-dai-hoc-van-lang-cong-bo-thong-tin-tuyen-sinh-dai-hoc-chinh-quy-2026 (không có trong bảng điểm chuẩn).
- V-ACT (ĐGNL ĐHQG TP.HCM) ghi là competency_assessment thang 1200; HSA/TSA/V-SAT/SAT và học bạ cũng có trong bảng nhưng không được ghi lại.
- Địa chỉ Cơ sở 2 lấy theo trang giới thiệu (tên phường cũ: Phường 11, Quận Bình Thạnh); chưa thấy địa chỉ phường mới trên trang chính thức.
- Học phí Y khoa, Răng-Hàm-Mặt không tìm thấy; mức học phí tiêu chuẩn là bình quân/năm, không phải đơn giá tín chỉ.

## Trường Đại học Công nghệ TP.HCM (HUTECH) — cấp 3

- Tổ hợp xét tuyển 2026 chỉ được công bố dạng tên môn (vd. 'Toán, Văn, Anh'), không có mã tổ hợp -> combinations = null.
- Mã xét tuyển riêng của trường đã quy về mã 7 số: hậu tố E -> program 'Tiếng Anh'; I1 -> chương trình liên ngành; LU/WE -> chương trình liên kết Lincoln/UWE.
- Mã 7520141 (Công nghệ ô tô điện) và 7340114 (Digital Marketing) lấy nguyên từ bảng của trường.
- Tọa độ là điểm OSM 'Đại học HUTECH' (trạm xe buýt ngay cạnh Sai Gon Campus, Hẻm 502 Điện Biên Phủ) — xấp xỉ, không phải tọa độ tòa nhà. Nominatim bị chặn, dùng Photon (dữ liệu OSM).
- Học phí khóa 2026 công bố theo toàn khóa + theo đợt; không có mức cho chương trình tiếng Anh và liên kết Lincoln/UWE trong bảng.
- ĐGNL ĐHQG TP.HCM ghi là competency_assessment thang 1200; điểm học bạ và V-SAT có trên trang nhưng không ghi lại.

## Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG-HCM (USSH) — cấp 2

- Điểm chuẩn 2026 xét tuyển tổng hợp THANG 100, trường công bố riêng theo nhóm đối tượng (đủ 3 thành phần / THPT + học bạ / ĐGNL + học bạ). Nhập cột 'THPT + học bạ' (đối tượng 2) cho 41 ngành chương trình chuẩn, theo https://diemthi.tuyensinh247.com/diem-chuan/dai-hoc-khoa-hoc-xa-hoi-va-nhan-van-dhqg-tphcm-QSX.html; đối chiếu khớp các mức Tiền Phong nêu (Báo chí 84,90; TTĐPT 88,80; Tâm lý học 87,00 cho đối tượng 2...). Bảng gốc là ảnh, không đọc được.
- Bỏ qua: chương trình chuẩn quốc tế, liên kết 2+2, Quản lý phát triển đô thị và bất động sản (chưa có mã ngành xác minh).
- Công thức đối tượng 2 (Tuổi Trẻ 24/02/2026, trọng số dự kiến): ĐHL1 = 90% THPT quy đổi + 10% học bạ quy đổi, THPT/học bạ = tổng 3 môn × 100/30.
- Mã ngành theo danh sách dự kiến 2026 (xaydungchinhsach.chinhphu.vn). Hán Nôm ghi 7220104 theo danh mục chuẩn (bảng nguồn bị lỗi định dạng ở dòng này). Chưa có học phí.

## Trường Đại học Khoa học Sức khỏe, ĐHQG-HCM — cấp 1

- Điểm chuẩn 2026 xét tuyển tổng hợp THANG 100 cho 5 ngành (Y khoa, Răng – Hàm – Mặt, Dược học, Y học cổ truyền, Điều dưỡng) theo https://diemthi.tuyensinh247.com/diem-chuan/dai-hoc-khoa-hoc-suc-khoe-dhqg-tphcm-QSY.html. Chưa xác minh trọng số công thức 2026 -> chỉ hiện điểm chuẩn. Chưa có học phí, địa chỉ chi tiết.

## Ghi chú chung ĐHQG-HCM 2026

- UIT và HCMUS: điểm thang 30 trong seed là điểm xét tuyển tổng hợp do chính trường quy đổi/công bố; trang tư vấn dùng để so gần đúng với tổng 3 môn (xem ADMISSION_SOURCES trong config.js). HCMUS 2026: ĐHL = max(0,8·THPT + 0,2·HB; 0,8·ĐGNL quy đổi + 0,2·HB) trên thang 30 (https://tuyensinh.hcmus.edu.vn/2026-thong-bao-ve-phuong-thuc-xet-tuyen-2/). UIT: thang 30 = thang 100 × 0,3.
- HCMUT, UEL, USSH, IU, KHSK hiển thị ở mục 'Trường xét tuyển tổng hợp' (composite.js), không xếp chung với điểm thang 30.
