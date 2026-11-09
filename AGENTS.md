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

---

### Quy tắc 7: Tuyệt đối không sử dụng kiểu `any` (No Explicit `any`)
* **Lý do nghiêm cấm:** 
  - Kiểu `any` phá vỡ hoàn toàn cơ chế kiểm tra kiểu (Type Safety) của TypeScript, che giấu lỗi lúc biên dịch và dễ gây crash ứng dụng khi chạy thực tế (Runtime Crash).
  - Vi phạm quy tắc nghiêm ngặt của ESLint (`@typescript-eslint/no-explicit-any`).
* **Quy chuẩn thay thế bắt buộc:**
  1. **Khi chưa biết rõ cấu trúc dữ liệu (Dynamic API Response, JSON.parse):**
     - Bắt buộc sử dụng `unknown` thay vì `any`.
     - Sử dụng Type Narrowing (`typeof`, `instanceof`, Type Guard, hoặc Zod schema) trước khi truy cập thuộc tính của `unknown`.
     - Với object động, sử dụng `Record<string, unknown>`.
  2. **Bắt lỗi trong khối `catch`:**
     - Sử dụng `catch (error: unknown)` hoặc `catch (error)`.
     - Trích xuất thông điệp lỗi an toàn:
       ```ts
       const err = error instanceof Error ? error : new Error(String(error));
       console.error(err.message);
       ```
  3. **Hàm nhận thuộc tính form / dynamic:**
     - Sử dụng Generic Type (ví dụ `<K extends keyof T>(field: K, value: T[K])`) thay vì `(field: string, value: any)`.
  4. **Payload và Dữ liệu API:**
     - Bắt buộc định nghĩa interface/type cụ thể (ví dụ: `OpenAiResponse`, `AiGradingRawResponse`, `ChatCompletionPayload`) cho toàn bộ request payload và response.

*Ví dụ chuẩn khi xử lý dữ liệu động & lỗi:*
```ts
// ❌ SAI: Dùng any vô tội vạ, dễ dính lỗi ESLint @typescript-eslint/no-explicit-any
let json: any = null;
try {
  json = JSON.parse(responseText);
} catch (err: any) {
  console.error(err.message);
}

// ✅ ĐÚNG: Khai báo type rõ ràng, dùng unknown cho dữ liệu chưa xác thực
interface ApiResponse {
  choices?: { message?: { content?: string } }[];
}

let json: ApiResponse | null = null;
try {
  json = JSON.parse(responseText) as ApiResponse;
} catch (error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(err.message);
}
```

---

### Quy tắc 8: Tuyệt đối không gọi `setState` đồng bộ bên trong `useEffect` (Tránh Cascading Renders)
* **Lý do nghiêm cấm:**
  - Vi phạm cảnh báo nghiêm ngặt của React Compiler / ESLint: *"Error: Calling setState synchronously within an effect can trigger cascading renders"*.
  - Khi gọi `setState` trực tiếp và đồng bộ trong `useEffect` (đặc biệt là để đồng bộ props vào state), React buộc phải chạy thêm một chu kỳ render phụ (cascading render) ngay sau lượt render vừa hoàn tất. Điều này làm giảm hiệu năng, gây hiện tượng chớp nháy giao diện (flicker) và làm phức tạp hóa vòng đời component.

* **Quy chuẩn giải pháp bắt buộc (Theo tài liệu React "You Might Not Need an Effect"):**
  1. **Khởi tạo và Reset State bằng thuộc tính `key` (Khuyến nghị hàng đầu cho Form & Modal nghiệp vụ):**
     - Khi mở modal hoặc chuyển đổi dữ liệu cần sửa, truyền `key={item?.id ?? "create"}` vào component.
     - Component con khởi tạo giá trị trực tiếp trong `useState(initialData?.name || "")` mà **không cần bất kỳ `useEffect` nào**. Khi `key` đổi, React tự động reset component về trạng thái ban đầu sạch sẽ.
  2. **Quản lý Controlled / Uncontrolled Component bằng `useControllableState` (Cho UI Controls dùng chung):**
     - Đối với các component như `Select`, `Input`, `Switch`, `Checkbox`, `Tabs` vừa hỗ trợ `value` từ form cha (controlled), vừa hỗ trợ tự lưu state (uncontrolled):
     - **Bắt buộc dùng hook `@/hooks/useControllableState`**, rút gọn việc xử lý chỉ còn **1 dòng** giống như `useState` thông thường, loại bỏ hoàn toàn `useEffect`.
  3. **Tính toán dữ liệu phái sinh ngay trong lúc render (Derive State during Rendering):**
     - Nếu một giá trị có thể tính toán từ props hoặc state hiện tại, tính trực tiếp bằng biến thông thường hoặc `useMemo`, tuyệt đối không tạo thêm `useState` rồi cập nhật nó bằng `useEffect`.
  4. **Cập nhật State trực tiếp trong Event Handler:**
     - Thay đổi state tại hàm xử lý sự kiện của người dùng (`onClick`, `onChange`, `onSubmit`), tránh việc sự kiện làm đổi props rồi component lại dùng `useEffect` để đồng bộ lại state.

*Ví dụ chuẩn khi xử lý Form / Modal nhận `initialData`:*
```tsx
// ❌ SAI: Dùng useEffect để đồng bộ props vào state -> Gây lỗi Cascading Renders
export function EditModal({ isOpen, initialData }: Props) {
  const [name, setName] = useState("");
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || ""); // ❌ Gọi setState đồng bộ trong effect
    }
  }, [isOpen, initialData]);
}

// ✅ ĐÚNG: Khởi tạo trực tiếp từ props kết hợp thuộc tính key ở component cha
// Component Cha:
<EditModal key={item?.id ?? "new"} isOpen={isOpen} initialData={item} />

// Component Con (Cực kỳ đơn giản, không cần useEffect):
export function EditModal({ isOpen, initialData }: Props) {
  const [name, setName] = useState(initialData?.name || ""); // ✅ Khởi tạo trực tiếp
  // ...
}
```

*Ví dụ chuẩn khi viết UI Controls vừa hỗ trợ `value` (controlled) vừa hỗ trợ `defaultValue` (uncontrolled):*
```tsx
import { useControllableState } from "@/hooks/useControllableState";

export function CustomSelect({ value: controlledValue, defaultValue, onChange }: Props) {
  // ✅ ĐÚNG: Chỉ 1 dòng duy nhất, hoạt động như useState mà không cần useEffect
  const [value, setValue] = useControllableState({
    prop: controlledValue,
    defaultProp: defaultValue ?? "",
    onChange,
  });

  return (
    <div onClick={() => setValue("option-1")}>
      <span>Giá trị hiện tại: {value}</span>
    </div>
  );
}
```

---

### Quy tắc 9: Chuẩn mực Data Fetching tối ưu (Mô hình 2 tầng: Server Component + SWR)
* **Lý do nghiêm cấm tự viết `useEffect` để fetch data:**
  - Vi phạm khuyến cáo chính thức của React.dev (*"You Might Not Need an Effect"*): Gây ra hiện tượng Network Waterfall, buộc người dùng phải chờ tải xong toàn bộ JavaScript mới bắt đầu gọi API, dễ mắc lỗi Race Condition và Cascading Renders khi gọi `setState` đồng bộ.
  - Tốn quá nhiều mã boilerplate rườm rà (`useState(data)`, `useState(loading)`, `useState(error)`, `let isMounted = true`).
  - Không có bộ nhớ đệm (Cache), mỗi lần mở modal hay chuyển tab là lại phải gọi API từ đầu và hiển thị lại spinner khó chịu.

* **Quy chuẩn giải pháp bắt buộc (Mô hình 2 tầng kết hợp):**

  1. **Tầng 1 - Dữ liệu chính của Trang (Page-level Data):**
     - **Bắt buộc fetch trực tiếp trên Server Component (`page.tsx`)** bằng Server Service / Server Action trực tiếp (truy vấn DB trên server thay vì gọi HTTP endpoint nội bộ để tránh round-trip không cần thiết).
     - **Suspense Fallback phải là Pure Skeleton UI:**
       - `fallback` của `<Suspense>` PHẢI là component Skeleton thuần JSX tĩnh (Server Component, không `'use client'`).
       - **Tuyệt đối nghiêm cấm:** Đặt chính Client Component chứa hook data fetching vào `fallback={<FeatureView />}`. Vì khi fallback mount mà chưa có dữ liệu (`initialData` là `undefined`), Client sẽ lập tức tự bắn request API, gây ra lỗi **gọi API trùng lặp 2 lần (Duplicate Fetch)**.
     - **Cấu hình SWR khi nhận `initialData`:**
       - Trong Client Hook, khi truyền `fallbackData: initialData`, **bắt buộc cấu hình `revalidateOnMount: initialData ? false : true`** và `revalidateIfStale: !initialData`.
       - Điều này đảm bảo Client hoàn toàn tin tưởng dữ liệu tươi mới từ Server Component, không tự động gọi ngầm API kiểm tra lại trên Client khi vừa tải trang.
     - Trang hiển thị HTML có sẵn dữ liệu ngay lập tức (0ms độ trễ chờ đợi mạng Client, tối ưu Core Web Vitals FCP & LCP).
     ```tsx
     // ✅ ĐÚNG: app/teacher/classes/page.tsx (Server Component + Streaming Suspense)
     import { Suspense } from "react";
     import { TeacherClassesView } from "@/features/teacher/components/TeacherClassesView";
     import { ClassesSkeleton } from "@/features/teacher/components/classes/ClassesSkeleton";
     import { getTeacherClassesServer } from "@/features/teacher/services/teacherClassServerService";

     async function ClassesDataContainer() {
       const initialClasses = await getTeacherClassesServer();
       return <TeacherClassesView initialClasses={initialClasses} />;
     }

     export default function ClassesPage() {
       return (
         <Suspense fallback={<ClassesSkeleton />}>
           <ClassesDataContainer />
         </Suspense>
       );
     }
     ```

     ```ts
     // ✅ ĐÚNG: features/teacher/hooks/useTeacherClasses.ts
     const { data: classesList = initialClasses ?? [], mutate } = useSWR(
       "teacher-classes",
       () => teacherClassService.getClasses(),
       {
         fallbackData: initialClasses,
         revalidateOnMount: initialClasses ? false : true, // Không refetch ngầm nếu server đã cung cấp
         revalidateIfStale: !initialClasses,
         revalidateOnFocus: false,
       }
     );
     ```

  2. **Tầng 2 - Dữ liệu phụ / Bật Modal mới tải / Dropdown / Client Interaction:**
     - **Bắt buộc dùng thư viện `swr` bọc ngoài Service**: `useSWR(key, () => service.get())`.
     - Giữ nguyên 100% tầng Service để gọi API, `swr` quản lý lifecycle và bộ nhớ đệm.
     - Tự động cache (mở modal lần 2 tải 0ms tức thì), tự động gộp request trùng lặp (Request Deduplication), tự động revalidate khi focus tab.
     - Rút gọn code từ 35 dòng xuống đúng 1 - 2 dòng duy nhất!
     ```tsx
     // ✅ ĐÚNG: features/auth/hooks/useClasses.ts (Client Hook)
     import useSWR from "swr";
     import { classService } from "../services/classService";

     export function useClasses() {
       const { data: classes = [], isLoading, error } = useSWR(
         "active-classes",
         () => classService.getActiveClasses()
       );

       return { classes, isLoading, error };
     }
     ```

---

### Quy tắc 10: Quản lý State bằng Feature Context Pattern (Chống Prop Drilling & God Hook)
* **Lý do bắt buộc áp dụng:**
  - Khi một màn hình tính năng phức tạp (như Quản lý lớp học, Nhiệm vụ, Đổi quà...) bao gồm nhiều thành phần con: Thanh công cụ lọc (Toolbar), Thẻ thống kê (KPIs), Bảng dữ liệu (Table/Cards), và các hộp thoại (Modals).
  - **Nghiêm cấm:** Destructure hàng chục biến/hàm (20 - 35 biến) tại component cha chỉ để làm "người trung chuyển" truyền prop dây chuyền (Prop Drilling) xuống cho từng component con. Điều này làm code component cha phình to hàng trăm dòng, khó đọc, khó bảo trì và dễ sinh lỗi.

* **Quy chuẩn giải pháp bắt buộc (Feature Context Pattern):**
  1. **Tạo Feature Context cục bộ tại `features/<feature>/contexts/<Feature>Context.tsx`:**
     - Provider gọi custom hook chính của tính năng và truyền toàn bộ giá trị xuống Context.
     - Tận dụng `export type FeatureContextType = ReturnType<typeof useFeature>` để suy luận kiểu dữ liệu tự động 100% (Type-Safe, DRY, không định nghĩa lại interface).
  2. **Component View cha siêu ngắn gọn (Declarative View):**
     - Component View chỉ bọc Provider và render các thành phần con mà **không cần truyền props dây chuyền**.
  3. **Component con tự truy xuất Context (Consuming Context with Optional Fallback):**
     - Các component con (`<FeatureToolbar />`, `<FeatureTable />`, `<FeatureModal />`) tự gọi `useFeatureContext()` để lấy đúng dữ liệu/hàm cần dùng.
     - Vẫn hỗ trợ nhận `props?: Partial<Props>` dự phòng để dễ dàng viết test hoặc tái sử dụng độc lập.

*Ví dụ chuẩn khi áp dụng Feature Context Pattern:*
```tsx
// ❌ SAI: Component cha destructure 35 biến rồi truyền prop dây chuyền mệt mỏi
export function ClassesView() {
  const {
    totalClasses, activeClasses, statusFilter, setStatusFilter,
    searchQuery, setSearchQuery, sortField, sortDirection,
    handleSortToggle, filteredClasses, isClassFormOpen, editingClass,
    handleOpenCreateClass, handleCloseClassForm, /* ... 20 biến nữa */
  } = useTeacherClasses();

  return (
    <div>
      <ClassesKpiCards totalClasses={totalClasses} activeClasses={activeClasses} />
      <ClassesToolbar statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} searchQuery={searchQuery} />
      <ClassesTable items={filteredClasses} sortField={sortField} sortDirection={sortDirection} />
      <ClassFormModal isOpen={isClassFormOpen} initialData={editingClass} onClose={handleCloseClassForm} />
    </div>
  );
}

// ✅ ĐÚNG: Áp dụng Feature Context Pattern - Cực kỳ thanh lịch, 0 dòng Prop Drilling
// features/teacher/contexts/TeacherClassesContext.tsx
export function TeacherClassesProvider({ children, initialClasses }: Props) {
  const value = useTeacherClasses(initialClasses);
  return <TeacherClassesContext.Provider value={value}>{children}</TeacherClassesContext.Provider>;
}

// Component Cha (View chỉ còn ~30 dòng cực kỳ sạch đẹp):
export function TeacherClassesView({ initialClasses }: Props) {
  return (
    <TeacherClassesProvider initialClasses={initialClasses}>
      <div className="space-y-5">
        <ClassesHeader />
        <ClassesKpiCards />
        <div className="bg-white rounded-2xl border border-slate-200">
          <ClassesToolbar />
          <ClassesTable />
        </div>
        <ClassFormModal />
        <AssignTeachersModal />
      </div>
    </TeacherClassesProvider>
  );
}
```

---

### Quy tắc 11: Kiểm soát Phân quyền & Xác thực 2 tầng (Proxy Edge + Server Guard)
* **Lý do nghiêm cấm viết thủ công kiểm tra session ở từng trang:**
  - Vi phạm nguyên tắc DRY: Lặp đi lặp lại 10-12 dòng `getAuthSession()`, kiểm tra null, kiểm tra `role` và gọi `redirect("/login")` ở từng file `page.tsx`.
  - Nguy cơ hở bảo mật (Security Leak) khi lập trình viên tạo trang mới nhưng quên copy đoạn mã kiểm tra này.
* **Quy chuẩn giải pháp bắt buộc (2 tầng phòng thủ):**
  1. **Tầng 1 - Cửa khẩu mạng (`proxy.ts` của Next.js 16):**
     - Chặn và kiểm tra quyền truy cập ở tầng Edge trước khi request chạm vào bất kỳ file Page hay Layout nào.
     - Tự động điều hướng người dùng chưa đăng nhập về `/login`, hoặc người dùng sai quyền về đúng trang chủ của họ.
  2. **Tầng 2 - Trợ lý Server (`@/lib/auth/guard.ts`):**
     - Khi Server Component hoặc Server Action cần lấy thông tin `session` đã xác thực, **bắt buộc sử dụng các helper function tập trung**:
       - `requireTeacher()`: Dành cho toàn bộ trang/action của Giáo viên & Quản trị viên (`TEACHER`, `SUPER_TEACHER`, `ADMIN`).
       - `requireStudent()`: Dành cho trang/action của Học sinh (`STUDENT`).
       - `requireAuth(allowedRoles)`: Dành cho các trường hợp phân quyền tùy biến.
     - **Rút gọn thành đúng 1 dòng code duy nhất:**
       ```tsx
       // ✅ ĐÚNG: Cực kỳ ngắn gọn, 1 dòng duy nhất, Type-Safe
       async function DataContainer() {
         const session = await requireTeacher();
         const data = await getServiceData(session);
         return <FeatureView initialData={data} />;
       }
       ```







