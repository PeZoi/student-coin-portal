/**
 * ==============================================================================
 * HTTP CLIENT LAYER (PRODUCTION-GRADE HTTP CLIENT CHO TOÀN DỰ ÁN)
 * - Tự động nhận diện Content-Type (không ghi đè FormData khi upload ảnh/file)
 * - Khởi tạo Headers an toàn qua new Headers(headers)
 * - Xử lý Timeout mặc định (15s) và phân loại lỗi rõ ràng: "http" | "network" | "timeout" | "parse"
 * - Hỗ trợ parse JSON an toàn (/json/i), 204 No Content, query params dạng mảng
 * - Cơ chế setUnauthorizedHandler xử lý 401 tập trung (có cờ skipUnauthorizedHandler)
 * - Cung cấp bộ tiện ích http.get/post/put/patch/delete, isHttpError, getErrorMessage
 * ==============================================================================
 */

export type HttpErrorKind = "http" | "network" | "timeout" | "parse";

/**
 * Lỗi HTTP chuẩn hóa cho toàn dự án
 */
export class HttpError extends Error {
  status: number;
  kind: HttpErrorKind;
  data?: unknown;

  constructor(message: string, status: number, kind: HttpErrorKind, data?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.kind = kind;
    this.data = data;
  }
}

/**
 * Kiểm tra xem một lỗi có phải là HttpError không
 */
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

/**
 * Handler toàn cục khi gặp lỗi 401 Unauthorized (ví dụ: đăng xuất, xóa session)
 */
type UnauthorizedHandler = () => void;
let globalUnauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Đăng ký handler xử lý tập trung khi gặp lỗi 401 Unauthorized
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  globalUnauthorizedHandler = handler;
}

export type QueryParamValue =
  | string
  | number
  | boolean
  | (string | number | boolean)[]
  | undefined
  | null;

export interface RequestOptions<T = unknown> extends Omit<RequestInit, "body"> {
  /** Dữ liệu gửi đi dưới dạng JSON (tự động JSON.stringify và gán Content-Type) */
  json?: unknown;
  /** Body thuần (FormData, string, Blob...) - KHÔNG tự gán Content-Type để giữ boundary FormData */
  body?: BodyInit | null;
  /** Query params truyền dạng object, hỗ trợ cả mảng ?id=1&id=2 */
  params?: Record<string, QueryParamValue>;
  /** Thời gian timeout tính bằng milliseconds (mặc định: 15.000ms = 15s) */
  timeoutMs?: number;
  /** Bỏ qua gọi unauthorizedHandler khi gặp lỗi 401 (dùng cho API đăng nhập/nhập sai PIN) */
  skipUnauthorizedHandler?: boolean;
  /** Hàm validate / parse runtime dữ liệu trả về (ví dụ tích hợp Zod schema: (data) => schema.parse(data)) */
  parse?: (data: unknown) => T;
  /** Base URL tùy biến (nếu không truyền sẽ dùng NEXT_PUBLIC_API_BASE_URL hoặc để trống) */
  baseUrl?: string;
}

/**
 * Trích xuất thông điệp lỗi tiếng Việt thân thiện từ response hoặc HTTP status
 */
function extractErrorMessage(status: number, data: unknown): string {
  if (typeof data === "object" && data !== null) {
    // 1. Kiểm tra data.error (dạng chuỗi hoặc dạng object có message)
    if ("error" in data) {
      const err = (data as { error: unknown }).error;
      if (typeof err === "string" && err.trim()) return err;
      if (typeof err === "object" && err !== null && "message" in err) {
        const msg = (err as { message: unknown }).message;
        if (typeof msg === "string" && msg.trim()) return msg;
      }
    }
    // 2. Kiểm tra data.message
    if ("message" in data) {
      const msg = (data as { message: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg;
    }
  }

  // 3. Thông điệp mặc định tiếng Việt theo mã trạng thái HTTP
  switch (status) {
    case 400:
      return "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
    case 401:
      return "Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập.";
    case 403:
      return "Bé hoặc thầy cô không có quyền thực hiện thao tác này.";
    case 404:
      return "Không tìm thấy dữ liệu yêu cầu.";
    case 409:
      return "Dữ liệu đã tồn tại hoặc xảy ra xung đột.";
    case 429:
      return "Thao tác quá nhanh. Vui lòng chờ một chút rồi thử lại.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Máy chủ đang bảo trì hoặc gặp sự cố. Vui lòng thử lại sau ít phút.";
    default:
      return `Yêu cầu thất bại với mã lỗi HTTP ${status}.`;
  }
}

/**
 * Hàm lấy message lỗi an toàn từ bất kỳ kiểu error nào
 */
export function getErrorMessage(error: unknown, fallbackMessage = "Đã xảy ra lỗi không mong muốn."): string {
  if (isHttpError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return fallbackMessage;
}

/**
 * Hàm gọi API cốt lõi (Core HTTP Client)
 */
export async function httpClient<T = unknown>(
  endpoint: string,
  options: RequestOptions<T> = {}
): Promise<T> {
  const {
    json,
    body: customBody,
    params,
    headers: rawHeaders,
    timeoutMs = 60000,
    skipUnauthorizedHandler = false,
    parse,
    baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "",
    signal: userSignal,
    ...restOptions
  } = options;

  // 1. Xây dựng URL hoàn chỉnh
  let fullUrl = endpoint;
  if (!/^https?:\/\//i.test(endpoint)) {
    fullUrl = `${baseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
  }

  // 2. Xử lý Query Params (hỗ trợ cả mảng ?id=1&id=2)
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null) {
            searchParams.append(key, String(v));
          }
        });
      } else {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + queryString;
    }
  }

  // 3. Khởi tạo Headers an toàn bằng new Headers() (hỗ trợ HeadersInit dạng mảng, Headers instance, object)
  const headers = new Headers(rawHeaders);

  // 4. Xử lý Request Body và Content-Type
  let requestBody: BodyInit | null | undefined = customBody;

  if (json !== undefined) {
    requestBody = JSON.stringify(json);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }
  // GHI CHÚ: Nếu truyền FormData qua customBody, KHÔNG set Content-Type để trình duyệt tự thêm boundary.

  // 5. Quản lý Timeout và AbortSignal
  const controller = new AbortController();
  let isTimedOut = false;
  let timeoutId: NodeJS.Timeout | null = null;

  // Chỉ kích hoạt timeout nếu timeoutMs > 0 (nếu truyền timeoutMs: 0 sẽ tắt timeout hoàn toàn cho tác vụ AI / upload nặng)
  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      isTimedOut = true;
      controller.abort("timeout");
    }, timeoutMs);
  }

  // Lắng nghe tín hiệu hủy từ caller nếu có
  if (userSignal) {
    if (userSignal.aborted) {
      if (timeoutId) clearTimeout(timeoutId);
      throw userSignal.reason ?? new DOMException("The user aborted a request.", "AbortError");
    }
    userSignal.addEventListener("abort", () => {
      if (timeoutId) clearTimeout(timeoutId);
      controller.abort(userSignal.reason);
    });
  }

  let response: Response;

  try {
    response = await fetch(fullUrl, {
      ...restOptions,
      headers,
      body: requestBody,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (timeoutId) clearTimeout(timeoutId);

    // Người dùng chủ động hủy request -> ném lại AbortError nguyên bản
    if (userSignal?.aborted) {
      throw userSignal.reason ?? new DOMException("The user aborted a request.", "AbortError");
    }

    // Do timeout
    if (isTimedOut) {
      const waitSeconds = Math.round(timeoutMs / 1000);
      throw new HttpError(
        `Yêu cầu quá thời gian chờ (${waitSeconds}s). Vui lòng thử lại sau hoặc kiểm tra kết nối mạng nhé!`,
        0,
        "timeout"
      );
    }

    // Lỗi mạng hoặc CORS (TypeError: Failed to fetch)
    const errMessage = err instanceof Error ? err.message : String(err);
    throw new HttpError(
      `Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối Internet! (${errMessage})`,
      0,
      "network",
      err
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  // 6. Xử lý trường hợp 204 No Content hoặc Content-Length = 0
  const isNoContent = response.status === 204 || response.headers.get("content-length") === "0";
  if (isNoContent) {
    if (!response.ok) {
      throw new HttpError(
        extractErrorMessage(response.status, null),
        response.status,
        "http"
      );
    }
    return undefined as T;
  }

  // 7. Parse Response Body (Khớp /json/i bao gồm application/json, application/problem+json...)
  const contentType = response.headers.get("content-type") || "";
  const isJson = /json/i.test(contentType);

  let responseData: unknown = null;

  if (isJson) {
    try {
      responseData = await response.json();
    } catch (parseErr: unknown) {
      // Nếu server trả 200 OK nhưng JSON lỗi cú pháp -> báo lỗi parse rõ ràng
      if (response.ok) {
        throw new HttpError(
          "Dữ liệu phản hồi từ máy chủ không hợp lệ (Lỗi phân tích cú pháp JSON).",
          response.status,
          "parse",
          parseErr
        );
      }
    }
  } else {
    // Phản hồi text/html (thường gặp khi lỗi 502/504 Bad Gateway từ Cloudflare/Nginx)
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  // 8. Xử lý khi HTTP status thất bại (4xx, 5xx)
  if (!response.ok) {
    // Xử lý 401 Unauthorized tập trung (trừ khi có cờ skipUnauthorizedHandler như ở trang Login)
    if (response.status === 401 && !skipUnauthorizedHandler) {
      globalUnauthorizedHandler?.();
    }

    const message = extractErrorMessage(response.status, responseData);
    throw new HttpError(message, response.status, "http", responseData);
  }

  // 9. Runtime validation qua hàm parse (nếu caller truyền vào, ví dụ Zod schema)
  if (parse) {
    return parse(responseData);
  }

  return responseData as T;
}

/**
 * ==============================================================================
 * BỘ SHORTHAND TIỆN ÍCH: http.get, http.post, http.put, http.patch, http.delete
 * ==============================================================================
 */
export const http = {
  get<T = unknown>(endpoint: string, options?: RequestOptions<T>): Promise<T> {
    return httpClient<T>(endpoint, { ...options, method: "GET" });
  },

  post<T = unknown>(
    endpoint: string,
    json?: unknown,
    options?: Omit<RequestOptions<T>, "json">
  ): Promise<T> {
    return httpClient<T>(endpoint, { ...options, method: "POST", json });
  },

  put<T = unknown>(
    endpoint: string,
    json?: unknown,
    options?: Omit<RequestOptions<T>, "json">
  ): Promise<T> {
    return httpClient<T>(endpoint, { ...options, method: "PUT", json });
  },

  patch<T = unknown>(
    endpoint: string,
    json?: unknown,
    options?: Omit<RequestOptions<T>, "json">
  ): Promise<T> {
    return httpClient<T>(endpoint, { ...options, method: "PATCH", json });
  },

  delete<T = unknown>(endpoint: string, options?: RequestOptions<T>): Promise<T> {
    return httpClient<T>(endpoint, { ...options, method: "DELETE" });
  },
};
