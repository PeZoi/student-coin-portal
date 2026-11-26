import * as XLSX from "xlsx-js-style";
import { TeacherExchangeRequestItem } from "../types";
import {
  ExchangeChoiceType,
  ExchangeRequestStatus,
  getExchangeChoiceTypeLabel,
} from "@/constants/rewards";
import { formatDate } from "@/lib/date";

export interface ExportRewardsExcelOptions {
  className?: string;
  month?: number | "all";
  year?: number | "all";
}

/**
 * Service xuất dữ liệu Đổi quà & Trả thưởng Heo Đất sang định dạng Excel (.xlsx)
 * - Sử dụng xlsx-js-style để áp dụng giao diện bảng biểu chuyên nghiệp, màu sắc chuẩn nhận diện
 * - Header xanh thương hiệu (#0A62D6), viền mỏng tinh tế, format số tiền VNĐ và xu
 * - Tổng hợp thống kê tự động và khu vực ký tên bàn giao tiền mặt / hiện vật
 */
export const rewardExcelService = {
  exportRewardsToExcel(
    requests: TeacherExchangeRequestItem[],
    options: ExportRewardsExcelOptions = {}
  ) {
    if (!requests || requests.length === 0) {
      throw new Error("Không có dữ liệu yêu cầu đổi quà để xuất file");
    }

    // Chỉ lấy các yêu cầu đã được duyệt & trao (COMPLETED)
    const approvedRequests = requests.filter(
      (r) => r.status === ExchangeRequestStatus.COMPLETED
    );

    if (approvedRequests.length === 0) {
      throw new Error("Không có yêu cầu đổi quà nào đã được duyệt để xuất file");
    }

    const { className, month, year } = options;
    const now = new Date();

    // 1. Khởi tạo Workbook
    const wb = XLSX.utils.book_new();

    // 2. Chuẩn bị tiêu đề và thông tin chung
    const periodText =
      month === "all" || !month
        ? `Tất cả các tháng / ${year === "all" || !year ? now.getFullYear() : year}`
        : `Tháng ${month}/${year === "all" || !year ? now.getFullYear() : year}`;

    const classText = className && className !== "all" ? `Lớp: ${className}` : "Tất cả các lớp";

    // 3. Xây dựng ma trận dữ liệu (Array of Arrays) - 12 cột
    const aoaData: (string | number | null)[][] = [
      // Dòng 1: Đơn vị / Hệ thống
      ["HỆ THỐNG QUẢN LÝ ĐỔI THƯỞNG HEO ĐẤT - STUDENT COIN PORTAL"],
      // Dòng 2: Tiêu đề báo cáo
      ["DANH SÁCH CHI TRẢ THƯỞNG HEO ĐẤT (ĐÃ DUYỆT)"],
      // Dòng 3: Kỳ chốt sổ & Lớp học
      [`Kỳ đổi thưởng: ${periodText}  |  ${classText}  |  Ngày xuất: ${formatDate(now, "dd/MM/yyyy HH:mm")}`],
      // Dòng 4: Dòng trống ngăn cách
      [],
      // Dòng 5: Header cột (12 cột)
      [
        "STT",
        "Họ và tên học sinh",
        "Lớp",
        "SĐT Phụ huynh",
        "Hình thức nhận",
        "Số xu đổi",
        "Số tiền (VNĐ)",
        "Chi tiết quà / Link Shopee",
        "Trạng thái",
        "Ngày duyệt",
        "Ghi chú",
        "Ký nhận",
      ],
    ];

    // Tính tổng số xu và tổng tiền
    let totalCoins = 0;
    let totalAmountVnd = 0;

    // 4. Đổ dữ liệu từng dòng
    approvedRequests.forEach((req, index) => {
      totalCoins += req.coins_to_exchange || 0;
      totalAmountVnd += req.amount_vnd || 0;

      const choiceLabel = getExchangeChoiceTypeLabel(req.choice_type);

      const isGiftLike =
        req.choice_type === ExchangeChoiceType.GIFT ||
        req.choice_type === ExchangeChoiceType.SPIN_GIFT;

      const giftDetail = isGiftLike
        ? req.shopee_product_url
          ? `${req.shopee_product_url}${req.shopee_note ? ` (${req.shopee_note})` : ""}`
          : req.shopee_note || "Chưa có link quà"
        : req.shopee_note || "Tiền mặt tại lớp";

      const noteText = req.shopee_note || "";
      const dateText = req.processed_at
        ? formatDate(req.processed_at, "dd/MM/yyyy HH:mm")
        : formatDate(req.created_at, "dd/MM/yyyy HH:mm");

      aoaData.push([
        index + 1,
        req.student_name || "-",
        req.class_name || className || "-",
        req.phone_zalo || "-",
        choiceLabel,
        req.coins_to_exchange || 0,
        req.amount_vnd || 0,
        giftDetail,
        "Đã duyệt",
        dateText,
        noteText,
        "", // Cột chữ ký để trống cho phụ huynh/học sinh ký
      ]);
    });

    // 5. Dòng tổng cộng (Footer row)
    const summaryRowIndex = aoaData.length;
    aoaData.push([
      "TỔNG CỘNG",
      "",
      "",
      "",
      "",
      totalCoins,
      totalAmountVnd,
      "",
      "",
      "",
      "",
      "",
    ]);

    // 6. Khu vực ký tên xác nhận (Footer Signatures)
    aoaData.push([]);
    aoaData.push([]);
    const signDateRow = aoaData.length;
    aoaData.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      `Ngày ..... tháng ..... năm ${now.getFullYear()}`,
    ]);
    aoaData.push([
      "",
      "NGƯỜI LẬP DANH SÁCH",
      "",
      "",
      "",
      "",
      "",
      "",
      "GIÁO VIÊN PHỤ TRÁCH / BỘ PHẬN THƯỞNG",
    ]);
    aoaData.push([
      "",
      "(Ký, ghi rõ họ tên)",
      "",
      "",
      "",
      "",
      "",
      "",
      "(Ký, ghi rõ họ tên)",
    ]);

    // 7. Chuyển Array of Arrays thành Sheet
    const ws = XLSX.utils.aoa_to_sheet(aoaData);

    // 8. Định nghĩa style chung
    const thinBorder = {
      top: { style: "thin", color: { rgb: "CBD5E1" } },
      bottom: { style: "thin", color: { rgb: "CBD5E1" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } },
    };

    const headerStyle = {
      font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "0A62D6" } }, // Xanh thương hiệu #0A62D6
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "084DB0" } },
        bottom: { style: "medium", color: { rgb: "084DB0" } },
        left: { style: "thin", color: { rgb: "084DB0" } },
        right: { style: "thin", color: { rgb: "084DB0" } },
      },
    };

    const baseDataStyle = {
      font: { name: "Arial", sz: 9.5, color: { rgb: "0F172A" } },
      border: thinBorder,
      alignment: { vertical: "center" },
    };

    const centerDataStyle = {
      ...baseDataStyle,
      alignment: { horizontal: "center", vertical: "center" },
    };

    const rightDataStyle = {
      ...baseDataStyle,
      alignment: { horizontal: "right", vertical: "center" },
    };

    const summaryStyle = {
      font: { name: "Arial", sz: 10, bold: true, color: { rgb: "0F172A" } },
      fill: { fgColor: { rgb: "F1F5F9" } },
      border: {
        top: { style: "medium", color: { rgb: "94A3B8" } },
        bottom: { style: "double", color: { rgb: "94A3B8" } },
        left: { style: "thin", color: { rgb: "CBD5E1" } },
        right: { style: "thin", color: { rgb: "CBD5E1" } },
      },
      alignment: { vertical: "center" },
    };

    // 9. Áp dụng style cho Tiêu đề trang
    if (ws["A1"]) {
      ws["A1"].s = {
        font: { name: "Arial", sz: 10, bold: true, color: { rgb: "64748B" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
    if (ws["A2"]) {
      ws["A2"].s = {
        font: { name: "Arial", sz: 15, bold: true, color: { rgb: "0A62D6" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
    if (ws["A3"]) {
      ws["A3"].s = {
        font: { name: "Arial", sz: 9.5, italic: true, color: { rgb: "475569" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    // 10. Áp dụng style cho Header bảng (Dòng 5 -> row index 4, 12 cột)
    const headerCols = 12;
    for (let c = 0; c < headerCols; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 4, c });
      if (ws[cellAddress]) {
        ws[cellAddress].s = headerStyle;
      }
    }

    // 11. Áp dụng style cho Data Rows
    const dataStartRow = 5;
    const dataEndRow = dataStartRow + approvedRequests.length;

    for (let r = dataStartRow; r < dataEndRow; r++) {
      const isZebra = r % 2 === 1;
      const zebraFill = isZebra ? { fgColor: { rgb: "F8FAFC" } } : { fgColor: { rgb: "FFFFFF" } };

      for (let c = 0; c < headerCols; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { t: "s", v: "" };
        }

        // Chọn kiểu căn chỉnh cột
        let cellAlign = baseDataStyle;
        if ([0, 2, 3, 4, 8, 9, 11].includes(c)) {
          cellAlign = centerDataStyle;
        } else if ([5, 6].includes(c)) {
          cellAlign = rightDataStyle;
        }

        ws[cellAddress].s = {
          ...cellAlign,
          fill: zebraFill,
        };

        // Format số cho Xu và Tiền
        if (c === 5) {
          ws[cellAddress].z = "#,##0";
        } else if (c === 6) {
          ws[cellAddress].z = '#,##0" đ"';
        }
      }
    }

    // 12. Áp dụng style cho dòng Tổng cộng (Summary Row)
    for (let c = 0; c < headerCols; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: summaryRowIndex, c });
      if (!ws[cellAddress]) {
        ws[cellAddress] = { t: "s", v: "" };
      }

      const isRightCol = c === 5 || c === 6;
      ws[cellAddress].s = {
        ...summaryStyle,
        alignment: {
          horizontal: c === 0 ? "right" : isRightCol ? "right" : "center",
          vertical: "center",
        },
      };

      if (c === 5) {
        ws[cellAddress].z = "#,##0";
      } else if (c === 6) {
        ws[cellAddress].z = '#,##0" đ"';
        ws[cellAddress].s = {
          ...ws[cellAddress].s,
          font: { name: "Arial", sz: 10.5, bold: true, color: { rgb: "0A62D6" } },
        };
      }
    }

    // 13. Áp dụng style cho khu vực Ký nhận (Signatures)
    if (ws[XLSX.utils.encode_cell({ r: signDateRow, c: 8 })]) {
      ws[XLSX.utils.encode_cell({ r: signDateRow, c: 8 })].s = {
        font: { name: "Arial", sz: 9.5, italic: true, color: { rgb: "475569" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    const signTitles = [
      { r: signDateRow + 1, c: 1 },
      { r: signDateRow + 1, c: 8 },
    ];
    signTitles.forEach(({ r, c }) => {
      const cellAddress = XLSX.utils.encode_cell({ r, c });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { name: "Arial", sz: 10, bold: true, color: { rgb: "0F172A" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    });

    const signSubtitles = [
      { r: signDateRow + 2, c: 1 },
      { r: signDateRow + 2, c: 8 },
    ];
    signSubtitles.forEach(({ r, c }) => {
      const cellAddress = XLSX.utils.encode_cell({ r, c });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { name: "Arial", sz: 9, italic: true, color: { rgb: "64748B" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    });

    // 14. Thiết lập Merges (Hợp nhất ô)
    ws["!merges"] = [
      // Hợp nhất tiêu đề chính dòng 1, 2, 3 (cột 0 -> 11)
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } },
      // Hợp nhất chữ "TỔNG CỘNG" từ cột 0 đến 4
      { s: { r: summaryRowIndex, c: 0 }, e: { r: summaryRowIndex, c: 4 } },
      // Hợp nhất ô ngày tháng ký nhận (cột 8 -> 11)
      { s: { r: signDateRow, c: 8 }, e: { r: signDateRow, c: 11 } },
      // Hợp nhất tên chức vụ ký nhận
      { s: { r: signDateRow + 1, c: 1 }, e: { r: signDateRow + 1, c: 3 } },
      { s: { r: signDateRow + 1, c: 8 }, e: { r: signDateRow + 1, c: 11 } },
      { s: { r: signDateRow + 2, c: 1 }, e: { r: signDateRow + 2, c: 3 } },
      { s: { r: signDateRow + 2, c: 8 }, e: { r: signDateRow + 2, c: 11 } },
    ];

    // 15. Thiết lập độ rộng cột (Column widths - 12 cột)
    ws["!cols"] = [
      { wch: 6 }, // 0: STT
      { wch: 25 }, // 1: Họ tên
      { wch: 14 }, // 2: Lớp
      { wch: 15 }, // 3: SĐT
      { wch: 16 }, // 4: Hình thức
      { wch: 14 }, // 5: Số xu
      { wch: 16 }, // 6: Số tiền
      { wch: 34 }, // 7: Chi tiết / Link
      { wch: 16 }, // 8: Trạng thái
      { wch: 18 }, // 9: Ngày gửi
      { wch: 28 }, // 10: Ghi chú / Từ chối
      { wch: 18 }, // 11: Ký nhận
    ];

    // Thiết lập chiều cao dòng tiêu đề và header
    ws["!rows"] = [
      { hpt: 20 }, // Dòng 1
      { hpt: 28 }, // Dòng 2
      { hpt: 20 }, // Dòng 3
      { hpt: 10 }, // Dòng 4
      { hpt: 28 }, // Dòng 5 (Header)
    ];

    // 16. Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, "Doi_Thuong_Heo_Dat");

    // 17. Tạo tên file và tải về
    const safeClassName = className && className !== "all" ? `_${className.replace(/\s+/g, "_")}` : "";
    const safePeriod =
      month === "all" || !month
        ? `_Nam_${year || now.getFullYear()}`
        : `_T${month}_${year || now.getFullYear()}`;
    const timestamp = formatDate(now, "yyyyMMdd_HHmm");
    const fileName = `Danh_sach_doi_thuong_Heo_Dat${safeClassName}${safePeriod}_${timestamp}.xlsx`;

    XLSX.writeFile(wb, fileName);
  },
};
