import { supabase } from "@/lib/supabase/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { authorizeTeacherRequest } from "@/lib/auth/guard";
import { HttpStatus } from "@/constants";
import { UserRole } from "@/constants/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export interface StudentCoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  tx_type: string;
  reference_type: string;
  reference_id: string | null;
  description: string;
  created_at: string;
  created_by: string | null;
  creator_name: string | null;
  creator_role: string | null;
}

export interface StudentCoinTransactionsResponse {
  student: {
    id: string;
    full_name: string;
    current_coins: number;
    total_earned_coins: number;
  };
  transactions: StudentCoinTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

/**
 * GET /api/teacher/students/[id]/coin-transactions
 * Lấy lịch sử biến động sổ cái xu Heo Đất của học sinh kèm thông tin người điều chỉnh
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Mã học sinh không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    const auth = await authorizeTeacherRequest(
      req,
      "Bạn không có quyền xem lịch sử giao dịch xu của học sinh."
    );
    if (!auth.success) {
      return auth.response;
    }

    // 1. Kiểm tra tài khoản học sinh tồn tại
    const { data: studentRecord, error: findError } = await supabase
      .from("users")
      .select("id, full_name, current_coins, total_earned_coins, role")
      .eq("id", id)
      .eq("role", UserRole.STUDENT)
      .single();

    if (findError || !studentRecord) {
      return apiError("Không tìm thấy thông tin học sinh.", HttpStatus.NOT_FOUND);
    }

    // 2. Phân trang: Đọc page và limit từ query params
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "15", 10)));
    const offset = (page - 1) * limit;

    // Lấy danh sách giao dịch xu mới nhất trước theo phạm vi phân trang
    const { data: rawTransactions, count: totalCount, error: txError } = await supabase
      .from("coin_transactions")
      .select(
        "id, user_id, amount, balance_before, balance_after, tx_type, reference_type, reference_id, description, created_at, created_by",
        { count: "exact" }
      )
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);

    if (txError) {
      console.error(
        "Lỗi truy vấn coin_transactions:",
        txError.message
      );
      return apiError(
        "Không thể tải lịch sử giao dịch ví xu.",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const total = totalCount ?? 0;
    const has_more = offset + (rawTransactions?.length ?? 0) < total;

    // 3. Truy vấn thông tin người điều chỉnh (created_by)
    const creatorIds = Array.from(
      new Set(
        (rawTransactions ?? [])
          .map((t) => t.created_by)
          .filter((cid): cid is string => typeof cid === "string" && cid.length > 0)
      )
    );

    const creatorMap = new Map<string, { full_name: string; role: string }>();

    if (creatorIds.length > 0) {
      const { data: creators, error: creatorError } = await supabase
        .from("users")
        .select("id, full_name, role")
        .in("id", creatorIds);

      if (!creatorError && creators) {
        creators.forEach((c) => {
          creatorMap.set(c.id, {
            full_name: c.full_name,
            role: c.role,
          });
        });
      }
    }

    // 4. Ghép thông tin người điều chỉnh vào từng giao dịch
    const transactions: StudentCoinTransaction[] = (rawTransactions ?? []).map(
      (tx) => {
        const creator = tx.created_by ? creatorMap.get(tx.created_by) : null;
        return {
          id: tx.id,
          user_id: tx.user_id,
          amount: tx.amount,
          balance_before: tx.balance_before,
          balance_after: tx.balance_after,
          tx_type: tx.tx_type,
          reference_type: tx.reference_type,
          reference_id: tx.reference_id,
          description: tx.description,
          created_at: tx.created_at,
          created_by: tx.created_by ?? null,
          creator_name: creator?.full_name ?? null,
          creator_role: creator?.role ?? null,
        };
      }
    );

    const payload: StudentCoinTransactionsResponse = {
      student: {
        id: studentRecord.id,
        full_name: studentRecord.full_name,
        current_coins: studentRecord.current_coins,
        total_earned_coins: studentRecord.total_earned_coins,
      },
      transactions,
      pagination: {
        page,
        limit,
        total,
        has_more,
      },
    };

    return apiSuccess(payload);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(
      "Lỗi máy chủ tại GET /api/teacher/students/[id]/coin-transactions:",
      err.message
    );
    return apiError(
      "Lỗi hệ thống khi tải lịch sử giao dịch.",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
