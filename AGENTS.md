<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md - Quy tắc phát triển dự án Student Coin Portal

Tài liệu này là **kim chỉ nam bắt buộc tuân thủ** cho tất cả các AI Agent và Developer khi phát triển hoặc sửa đổi mã nguồn trong dự án **Student Coin Portal** (Next.js App Router, TypeScript, Tailwind CSS v4).

---

## 1. Triết lý thiết kế & Viết code (Code Philosophy)
* **KISS (Keep It Simple, Stupid):** Viết code thật đơn giản, tường minh và dễ hiểu nhất có thể. Dài dòng một chút cũng được, miễn là dễ đọc, dễ giải thích và dễ debug. Tránh viết code quá "thông minh", lồng ghép trừu tượng hóa quá sớm (No over-engineering).
* **Định danh rõ ràng (Naming Conventions):** Tên biến, tên hàm, tên component phải rõ nghĩa bằng tiếng Anh (ví dụ: `fetchStudentMissions`, `handleSpinWheel`, `isClaimingCoin`).
* **Không định nghĩa lại (DRY - Don't Repeat Yourself):** 
  - Trước khi viết một hàm helper hoặc utility mới, phải kiểm tra các thư viện/helper dùng chung trong `@/lib` hoặc thư mục feature tương ứng.
  - **Nếu hàm đó đã tồn tại, BẮT BUỘC phải import để tái sử dụng, tuyệt đối không được định nghĩa lại.**

---

## 2. Kiến trúc dự án: Hybrid Feature-based Architecture

Dự án áp dụng mô hình **Hybrid Feature-based**: thư mục `app/` chỉ làm nhiệm vụ Routing và Layout; toàn bộ logic nghiệp vụ, UI component theo tính năng được đưa vào `features/`.

```text
student-coin-portal/
├── app/                        # CHỈ CHỨA ROUTING VÀ LAYOUTS
│   ├── (auth)/                 # Nhóm route xác thực (login, register...)
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (student)/              # Nhóm route dành cho học sinh / sinh viên
│   │   ├── layout.tsx          # Layout riêng (header học sinh, coin bar, nav)
│   │   ├── wheel/page.tsx      # /wheel (Vòng quay may mắn)
│   │   ├── missions/page.tsx   # /missions (Danh sách nhiệm vụ)
│   │   └── page.tsx            # / (Trang chủ học sinh)
│   ├── (admin)/                # Nhóm route dành cho giáo viên / quản trị viên
│   │   ├── layout.tsx          # Layout riêng (sidebar quản trị, thống kê)
│   │   ├── dashboard/page.tsx  # /admin/dashboard
│   │   └── rewards/page.tsx    # /admin/rewards (Quản lý quà tặng)
│   ├── globals.css             # CSS toàn cục
│   └── layout.tsx              # Root Layout chung
│
├── features/                   # CHỨA LOGIC & GIAO DIỆN THEO TỪNG TÍNH NĂNG
│   ├── lucky-wheel/            # Module Vòng quay may mắn
│   │   ├── components/         # LuckyWheel.tsx, WheelPrizeList.tsx
│   │   ├── hooks/              # useLuckyWheel.ts
│   │   ├── types/              # index.ts
│   │   └── actions/            # spinWheelAction.ts
│   ├── missions/               # Module Nhiệm vụ & Điểm danh
│   │   ├── components/         # MissionCard.tsx, SubmitProofModal.tsx
│   │   ├── types/
│   │   └── actions/
│   ├── wallet/                 # Module Ví coin & Lịch sử giao dịch
│   │   └── components/         # CoinBalance.tsx, TransactionList.tsx
│   └── auth/                   # Module Đăng nhập / Phân quyền
│
├── components/                 # COMPONENT DÙNG CHUNG TOÀN ỨNG DỤNG
│   └── ui/                     # Button.tsx, Modal.tsx, Card.tsx, Input.tsx...
│
├── lib/                        # HÀM TIỆN ÍCH DÙNG CHUNG (UTILITIES)
│   ├── utils.ts                # cn() (kết hợp clsx và tailwind-merge)
│   ├── date.ts                 # formatDistanceTime, formatDate bằng date-fns
│   └── constants.ts            # Hằng số toàn dự án
│
└── stores/                     # GLOBAL STATE (ZUSTAND)
    └── useUserStore.ts         # Quản lý state người dùng, số dư coin
```

---

## 3. Các quy tắc cốt lõi (Core Rules)

### Quy tắc 1: Giữ file `page.tsx` mỏng nhất có thể (Thin Page Pattern)
* File `page.tsx` **chỉ được làm đúng 2 nhiệm vụ**:
  1. Lấy dữ liệu ban đầu (Fetch data trên Server Component hoặc đọc `searchParams` / `params`).
  2. Truyền dữ liệu đó dưới dạng props vào Feature Component tương ứng.
* **Nghiêm cấm:** Viết JSX giao diện dài hàng trăm dòng, logic tính toán hay state trực tiếp trong `page.tsx`.

*Ví dụ chuẩn cho `app/(student)/wheel/page.tsx`:*
```tsx
// ✅ ĐÚNG: page.tsx cực kỳ ngắn gọn, sạch sẽ
import { getStudentPrizes } from "@/features/lucky-wheel/actions/getStudentPrizes";
import { LuckyWheelView } from "@/features/lucky-wheel/components/LuckyWheelView";

export default async function WheelPage() {
  const prizes = await getStudentPrizes();

  return <LuckyWheelView initialPrizes={prizes} />;
}
```

---

### Quy tắc 2: Tách biệt rõ ràng Server Component và Client Component
* **Mặc định mọi component là Server Component:** Tận dụng Server Component cho các trang/thành phần tĩnh, danh sách nhiệm vụ không cần tương tác động để tối ưu SEO và tốc độ tải trang.
* **Chỉ thêm `'use client'` khi thực sự cần thiết:**
  - Component có state (`useState`, `useReducer`, Zustand store).
  - Component có event listeners (`onClick`, `onChange`, `onSubmit`).
  - Component có hiệu ứng chuyển động, tương tác trực tiếp: ví dụ `LuckyWheel.tsx` (quay vòng quay), `SubmitProofModal.tsx` (popup nộp bài), component nén ảnh client trước khi upload.
* **Nguyên tắc "Đẩy Client Component xuống sâu nhất có thể" (Move Client Component to the Leaves):** Không bọc cả trang trong `'use client'`, chỉ bọc đúng phần tử có tương tác.

---

### Quy tắc 3: Tận dụng triệt để Route Groups `(...)`
* Dùng thư mục ngoặc tròn như `app/(student)` và `app/(admin)` để:
  - Tách biệt hoàn toàn 2 bộ khung giao diện `layout.tsx` cho giáo viên và học sinh (ví dụ: học sinh có thanh hiển thị Coin ở header, giáo viên có menu quản trị duyệt bài).
  - Giữ cho URL trên trình duyệt ngắn gọn, tự nhiên: `/wheel` thay vì `/student/wheel`, `/missions` thay vì `/student/missions`.

---

### Quy tắc 4: Thư viện nền tảng & Tái sử dụng (Tech Stack Standards)
Dự án đã tích hợp sẵn bộ thư viện tiêu chuẩn. Khi triển khai tính năng, **phải dùng đúng các thư viện này**:

| Mục đích | Thư viện tiêu chuẩn | Cách sử dụng / Quy định |
| :--- | :--- | :--- |
| **Quản lý State** | `zustand` | Lưu store trong `@/stores/` hoặc trong từng feature. |
| **Icons** | `lucide-react` | Nhập trực tiếp icon từ `lucide-react`, không dùng svg inline lặp lại. |
| **Thông báo (Toast)** | `sonner` | Dùng `toast.success()`, `toast.error()` từ `sonner`. Đã có `<Toaster />` tại Root Layout. |
| **CSS Class Helper** | `clsx` + `tailwind-merge` | Luôn dùng hàm `cn(...)` từ `@/lib/utils` để nối class động. |
| **Xử lý Form** | `react-hook-form` | Quản lý state của input form, tối ưu render. |
| **Validation** | `zod` + `@hookform/resolvers` | Định nghĩa schema kiểm tra form và kiểu dữ liệu bằng `zod`. |
| **Hiển thị Hình ảnh** | `next/image` | Luôn dùng `<Image />` thay vì thẻ `<img>`. Khi dùng CSS đổi size, kèm `style={{ height: 'auto' }}` hoặc `style={{ width: 'auto' }}`. |
| **Xử lý Ngày tháng** | `date-fns` | Dùng `format`, `formatDistanceToNow` từ `date-fns` (với locale tiếng Việt). |

---

### Quy tắc 5: Chuẩn mực tối ưu và hiển thị Hình ảnh (`next/image`)
* **Tuyệt đối không dùng thẻ `<img>` thuần:** Bắt buộc import và dùng `<Image />` từ `next/image` để tối ưu hóa hiệu năng, giảm dung lượng và tránh lỗi ESLint `@next/next/no-img-element`.
* **Quy chuẩn tránh lỗi Aspect Ratio cảnh báo Console:**
  - Khi thay đổi kích thước ảnh bằng CSS (ví dụ Tailwind `w-10`, `w-full`), **bắt buộc phải thêm inline style `style={{ height: 'auto' }}`** (hoặc `style={{ width: 'auto' }}` nếu chỉnh chiều cao) để giữ tỉ lệ khung hình chuẩn và không bị lỗi Next.js:
    > *"Image with src ... has either width or height modified, but not the other."*
* **Ảnh Vector SVG:**
  - Đối với các file SVG tĩnh (như khung sách, góc kim loại, icon), luôn thêm thuộc tính `unoptimized` để trình duyệt render trực tiếp vector sắc nét mà không qua pipeline nén ảnh raster của server.

*Ví dụ chuẩn khi hiển thị ảnh/SVG trang trí:*
```tsx
// ✅ ĐÚNG: Sử dụng Image kèm style={{ height: 'auto' }} và unoptimized cho SVG
import Image from "next/image";

<Image
  src="/mission/coner-top-left.svg"
  alt="Góc trên trái"
  width={48}
  height={53}
  unoptimized
  style={{ height: "auto" }}
  className="w-10 sm:w-12 pointer-events-none select-none"
/>
```

---

### Quy tắc 6: Tách biệt toàn bộ Logic nghiệp vụ ra Custom Hook (Custom Hook Pattern)
* **Nguyên tắc phân tách trách nhiệm (Separation of Concerns):**
  - **Component UI** chỉ làm đúng một việc: Nhận dữ liệu/hàm từ hook và render JSX giao diện (Presentational Component).
  - **Custom Hook** chịu trách nhiệm toàn bộ phần: Quản lý state (`useState`, `useReducer`), tác vụ phụ (`useEffect`), lắng nghe sự kiện (`window`, cảm biến, resize), tính toán dữ liệu, validate và gọi Server Actions/API.
* **Cấu trúc lưu trữ:**
  - Hook của tính năng nào thì đặt ngay trong thư mục `features/<feature-name>/hooks/` của tính năng đó (ví dụ: `useLuckyWheel.ts`, `useMissionList.ts`, `useDeviceMotion.ts`).
  - Hook dùng chung toàn dự án (nếu có) đặt tại `@/hooks/`.
* **Tiêu chí nhận diện khi nào PHẢI tách ra Hook:**
  - Khi một Component có từ 2 `useState` trở lên kèm theo các hàm tính toán xử lý logic, filter, debounce, event listeners.
  - Khi component bắt đầu xuất hiện các hàm xử lý sự kiện dài hơn 15-20 dòng.

*Ví dụ chuẩn cho việc tách Hook:*
```tsx
// ✅ ĐÚNG: Hook quản lý toàn bộ state & logic trong features/missions/hooks/useMissionFilter.ts
export function useMissionFilter(initialMissions: MissionItem[]) {
  const [filter, setFilter] = useState<MissionFilter>("all");
  const [selectedId, setSelectedId] = useState<string>("m1");

  const filteredMissions = useMemo(() => {
    if (filter === "pending") return initialMissions.filter((m) => !m.isCompleted);
    if (filter === "completed") return initialMissions.filter((m) => m.isCompleted);
    return initialMissions;
  }, [initialMissions, filter]);

  return {
    filter,
    setFilter,
    selectedId,
    setSelectedId,
    filteredMissions,
  };
}

// ✅ Component UI chỉ việc gọi hook và render, cực kỳ ngắn gọn và dễ bảo trì
export function MissionListView({ initialMissions }: { initialMissions: MissionItem[] }) {
  const { filter, setFilter, filteredMissions, selectedId, setSelectedId } = useMissionFilter(initialMissions);

  return (
    <div>
      <FilterTabs current={filter} onChange={setFilter} />
      <MissionList items={filteredMissions} activeId={selectedId} onSelect={setSelectedId} />
    </div>
  );
}
```



