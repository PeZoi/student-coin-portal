import * as XLSX from "xlsx-js-style";
import { TeacherRosterStudent } from "../types";
import { formatDate } from "@/lib/date";

export interface ExportStudentRosterExcelOptions {
  className?: string;
  isPartialSelection?: boolean;
}

/**
 * Service xuất dữ liệu Danh sách Học sinh theo lớp sang định dạng Excel (.xlsx)
 * - Sử dụng xlsx-js-style để áp dụng giao diện bảng biểu chuyên nghiệp, màu sắc chuẩn nhận diện
 * - Chi tiết tiến độ bài tập toàn diện: Tổng số bài, Đã làm (Đã duyệt), Chờ duyệt, Nộp trễ, Được miễn
 * - Header xanh thương hiệu (#0A62D6), viền mỏng tinh tế, format số xu và tự động tính tổng lũy kế
 */
export const studentRosterExcelService = {
  exportStudentsToExcel(
    students: TeacherRosterStudent[],
    options: ExportStudentRosterExcelOptions = {}
  ) {
    if (!students || students.length === 0) {
      throw new Error("Không có dữ liệu học sinh để xuất file Excel.");
    }

    const { className, isPartialSelection } = options;
    const now = new Date();

    // 1. Khởi tạo Workbook
    const wb = XLSX.utils.book_new();

    // 2. Chuẩn bị tiêu đề và thông tin chung
    const displayClassName =
      className && className !== "all"
        ? className
        : students[0]?.class_name || "Tất cả các lớp";

    const selectionNotice = isPartialSelection
      ? ` (Đã lọc ${students.length} học sinh được chọn)`
      : ` (Tổng cộng: ${students.length} học sinh)`;

    // 3. Xây dựng ma trận dữ liệu (Array of Arrays) - 16 cột
    const aoaData: (string | number | null)[][] = [
      // Dòng 1: Đơn vị / Hệ thống
      ["HỆ THỐNG QUẢN LÝ HỌC SINH & ĐỔI THƯỞNG HEO ĐẤT - STUDENT COIN PORTAL"],
      // Dòng 2: Tiêu đề báo cáo
      ["DANH SÁCH HỒ SƠ HỌC SINH"],
      // Dòng 3: Lớp học & Ngày xuất báo cáo
      [
        `Lớp: ${displayClassName}${selectionNotice}  |  Ngày xuất: ${formatDate(
          now,
          "dd/MM/yyyy HH:mm"
        )}`,
      ],
      // Dòng 4: Dòng trống ngăn cách
      [],
      // Dòng 5: Header cột (16 cột chuẩn hóa)
      [
        "STT",
        "Họ và tên học sinh",
        "Lớp",
        "SĐT / Zalo Phụ huynh",
        "Xu Heo Đất",
        "Tổng xu tích lũy",
        "Tổng bài tập",
        "Đã làm",
        "Chờ duyệt",
        "Nộp trễ",
        "Được miễn",
        "Quà đã đổi",
        "Trạng thái PIN",
        "Đăng nhập gần nhất",
        "Trạng thái tài khoản",
        "Ghi chú",
      ],
    ];

    // Biến tích lũy thống kê cho dòng Tổng cộng
    let totalCurrentCoins = 0;
    let totalEarnedCoins = 0;
    let totalMissions = 0;
    let totalApprovedMissions = 0;
    let totalPendingMissions = 0;
    let totalLateMissions = 0;
    let totalExemptMissions = 0;
    let totalRedeemedRewards = 0;

    // 4. Đổ dữ liệu từng dòng học sinh
    students.forEach((student, index) => {
      const currentCoins = student.current_coins || 0;
      const totalEarned = student.total_earned_coins || 0;
      const totalM = student.total_missions_count || 0;
      const approvedM = student.completed_missions_count || 0;
      const pendingM = student.pending_missions_count || 0;
      const lateM = student.late_missions_count || 0;
      const exemptM = student.exempt_missions_count || 0;
      const redeemedR = student.redeemed_rewards_count || 0;

      totalCurrentCoins += currentCoins;
      totalEarnedCoins += totalEarned;
      totalMissions += totalM;
      totalApprovedMissions += approvedM;
      totalPendingMissions += pendingM;
      totalLateMissions += lateM;
      totalExemptMissions += exemptM;
      totalRedeemedRewards += redeemedR;

      // Trạng thái mã PIN
      const pinStatusText =
        student.pin_status === "locked"
          ? "Bị khóa"
          : student.pin_status === "failed_attempts"
          ? "Cảnh báo sai PIN"
          : "Bình thường";

      // Lần đăng nhập gần nhất
      const lastLoginText =
        student.last_login_at &&
        student.last_login_at !== "null" &&
        student.last_login_at !== ""
          ? formatDate(student.last_login_at, "dd/MM/yyyy HH:mm")
          : "Chưa đăng nhập";

      // Trạng thái tài khoản
      const accountStatusText = student.is_active
        ? "Đang hoạt động"
        : "Tạm khóa";

      aoaData.push([
        index + 1,
        student.full_name || "-",
        student.class_name || displayClassName,
        student.phone_zalo || "-",
        currentCoins,
        totalEarned,
        totalM,
        approvedM,
        pendingM,
        lateM,
        exemptM,
        redeemedR,
        pinStatusText,
        lastLoginText,
        accountStatusText,
        "", // Cột ghi chú
      ]);
    });

    // 5. Dòng tổng cộng (Summary Row)
    const summaryRowIndex = aoaData.length;
    aoaData.push([
      "TỔNG CỘNG",
      "",
      "",
      "",
      totalCurrentCoins,
      totalEarnedCoins,
      totalMissions,
      totalApprovedMissions,
      totalPendingMissions,
      totalLateMissions,
      totalExemptMissions,
      totalRedeemedRewards,
      "",
      "",
      "",
      "",
    ]);

    // 6. Khu vực ký tên xác nhận (Signatures)
    aoaData.push([]); // Dòng trống
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
      "",
      "",
      "",
      `Ngày ${now.getDate()} tháng ${
        now.getMonth() + 1
      } năm ${now.getFullYear()}`,
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
      "",
      "",
      "",
      "GIÁO VIÊN CHỦ NHIỆM / PHỤ TRÁCH",
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

    const studentNameStyle = {
      ...baseDataStyle,
      font: { name: "Arial", sz: 10, bold: true, color: { rgb: "0F172A" } },
      alignment: { horizontal: "left", vertical: "center" },
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

    // 10. Áp dụng style cho Header bảng (Dòng 5 -> row index 4, 16 cột)
    const headerCols = 16;
    for (let c = 0; c < headerCols; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 4, c });
      if (ws[cellAddress]) {
        ws[cellAddress].s = headerStyle;
      }
    }

    // 11. Áp dụng style cho Data Rows
    const dataStartRow = 5;
    const dataEndRow = dataStartRow + students.length;

    for (let r = dataStartRow; r < dataEndRow; r++) {
      const isZebra = r % 2 === 1;
      const zebraFill = isZebra
        ? { fgColor: { rgb: "F8FAFC" } }
        : { fgColor: { rgb: "FFFFFF" } };

      const student = students[r - dataStartRow];

      for (let c = 0; c < headerCols; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { t: "s", v: "" };
        }

        // Căn chỉnh theo loại dữ liệu cột
        let cellAlign = baseDataStyle;
        if (c === 1) {
          // Họ và tên học sinh
          cellAlign = studentNameStyle;
        } else if ([0, 2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14].includes(c)) {
          // STT, Lớp, SĐT, Tiến độ 5 cột, Quà đổi, PIN, Đăng nhập, Trạng thái
          cellAlign = centerDataStyle;
        } else if ([4, 5].includes(c)) {
          // Xu Heo Đất, Tổng xu tích lũy
          cellAlign = rightDataStyle;
        }

        ws[cellAddress].s = {
          ...cellAlign,
          fill: zebraFill,
        };

        // Format số cho Xu
        if (c === 4 || c === 5) {
          ws[cellAddress].z = "#,##0";
        }

        // Điểm xuyết màu sắc nổi bật cho các cột tiến độ bài tập
        if (c === 7) {
          // Đã làm: Xanh lá cây đậm
          const approvedVal = Number(ws[cellAddress].v) || 0;
          if (approvedVal > 0) {
            ws[cellAddress].s = {
              ...ws[cellAddress].s,
              font: { name: "Arial", sz: 9.5, bold: true, color: { rgb: "15803D" } },
            };
          }
        } else if (c === 8) {
          // Chờ duyệt: Cam hổ phách nếu có bài chờ
          const pendingVal = Number(ws[cellAddress].v) || 0;
          if (pendingVal > 0) {
            ws[cellAddress].s = {
              ...ws[cellAddress].s,
              font: { name: "Arial", sz: 9.5, bold: true, color: { rgb: "B45309" } },
            };
          }
        } else if (c === 9) {
          // Nộp trễ: Đỏ hồng nếu có nộp trễ
          const lateVal = Number(ws[cellAddress].v) || 0;
          if (lateVal > 0) {
            ws[cellAddress].s = {
              ...ws[cellAddress].s,
              font: { name: "Arial", sz: 9.5, bold: true, color: { rgb: "BE123C" } },
            };
          }
        } else if (c === 10) {
          // Được miễn: Tím phong cách
          const exemptVal = Number(ws[cellAddress].v) || 0;
          if (exemptVal > 0) {
            ws[cellAddress].s = {
              ...ws[cellAddress].s,
              font: { name: "Arial", sz: 9.5, bold: true, color: { rgb: "6B21A8" } },
            };
          }
        }

        // Đánh dấu màu trạng thái PIN nếu bị khóa
        if (c === 12 && student.pin_status === "locked") {
          ws[cellAddress].s = {
            ...ws[cellAddress].s,
            font: { name: "Arial", sz: 9.5, bold: true, color: { rgb: "E11D48" } },
          };
        }
      }
    }

    // 12. Áp dụng style cho dòng Tổng cộng (Summary Row)
    for (let c = 0; c < headerCols; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: summaryRowIndex, c });
      if (!ws[cellAddress]) {
        ws[cellAddress] = { t: "s", v: "" };
      }

      const isRightCol = c === 4 || c === 5;
      ws[cellAddress].s = {
        ...summaryStyle,
        alignment: {
          horizontal: c === 0 ? "right" : isRightCol ? "right" : "center",
          vertical: "center",
        },
      };

      if (c === 4) {
        ws[cellAddress].z = "#,##0";
        ws[cellAddress].s = {
          ...ws[cellAddress].s,
          font: { name: "Arial", sz: 10.5, bold: true, color: { rgb: "0A62D6" } },
        };
      } else if (c === 5) {
        ws[cellAddress].z = "#,##0";
        ws[cellAddress].s = {
          ...ws[cellAddress].s,
          font: { name: "Arial", sz: 10.5, bold: true, color: { rgb: "D97706" } },
        };
      } else if (c === 7) {
        ws[cellAddress].s = {
          ...ws[cellAddress].s,
          font: { name: "Arial", sz: 10, bold: true, color: { rgb: "15803D" } },
        };
      } else if (c === 8) {
        ws[cellAddress].s = {
          ...ws[cellAddress].s,
          font: { name: "Arial", sz: 10, bold: true, color: { rgb: "B45309" } },
        };
      } else if (c === 9) {
        ws[cellAddress].s = {
          ...ws[cellAddress].s,
          font: { name: "Arial", sz: 10, bold: true, color: { rgb: "BE123C" } },
        };
      }
    }

    // 13. Áp dụng style cho khu vực Ký nhận (Signatures)
    if (ws[XLSX.utils.encode_cell({ r: signDateRow, c: 11 })]) {
      ws[XLSX.utils.encode_cell({ r: signDateRow, c: 11 })].s = {
        font: { name: "Arial", sz: 9.5, italic: true, color: { rgb: "475569" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    const signTitles = [
      { r: signDateRow + 1, c: 1 },
      { r: signDateRow + 1, c: 11 },
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
      { r: signDateRow + 2, c: 11 },
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

    // 14. Thiết lập Merges (Hợp nhất ô) - 16 cột
    ws["!merges"] = [
      // Hợp nhất tiêu đề chính dòng 1, 2, 3 (cột 0 -> 15)
      { s: { r: 0, c: 0 }, e: { r: 0, c: 15 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 15 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 15 } },
      // Hợp nhất chữ "TỔNG CỘNG" từ cột 0 đến 3
      { s: { r: summaryRowIndex, c: 0 }, e: { r: summaryRowIndex, c: 3 } },
      // Hợp nhất ô ngày tháng ký nhận (cột 11 -> 15)
      { s: { r: signDateRow, c: 11 }, e: { r: signDateRow, c: 15 } },
      // Hợp nhất tên chức vụ ký nhận
      { s: { r: signDateRow + 1, c: 1 }, e: { r: signDateRow + 1, c: 3 } },
      { s: { r: signDateRow + 1, c: 11 }, e: { r: signDateRow + 1, c: 15 } },
      { s: { r: signDateRow + 2, c: 1 }, e: { r: signDateRow + 2, c: 3 } },
      { s: { r: signDateRow + 2, c: 11 }, e: { r: signDateRow + 2, c: 15 } },
    ];

    // 15. Thiết lập độ rộng cột (Column widths - 16 cột tinh tế)
    ws["!cols"] = [
      { wch: 6 }, // 0: STT
      { wch: 26 }, // 1: Họ tên học sinh
      { wch: 12 }, // 2: Lớp
      { wch: 15 }, // 3: SĐT / Zalo
      { wch: 15 }, // 4: Xu Heo Đất
      { wch: 15 }, // 5: Tổng xu tích lũy
      { wch: 13 }, // 6: Tổng bài tập
      { wch: 12 }, // 7: Đã làm
      { wch: 12 }, // 8: Chờ duyệt
      { wch: 12 }, // 9: Nộp trễ
      { wch: 12 }, // 10: Được miễn
      { wch: 14 }, // 11: Quà đã đổi
      { wch: 15 }, // 12: Trạng thái PIN
      { wch: 20 }, // 13: Đăng nhập gần nhất
      { wch: 18 }, // 14: Trạng thái tài khoản
      { wch: 22 }, // 15: Ghi chú
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
    XLSX.utils.book_append_sheet(wb, ws, "Danh_Sach_Hoc_Sinh");

    // 17. Tạo tên file và kích hoạt tải về
    const safeClassName = displayClassName.replace(
      /[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g,
      "_"
    );
    const timestamp = formatDate(now, "yyyyMMdd_HHmm");
    const fileName = `Danh_sach_hoc_sinh_${safeClassName}_${timestamp}.xlsx`;

    XLSX.writeFile(wb, fileName);
  },
};
