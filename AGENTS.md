# AGENTS.md

Panduan ini berlaku untuk semua AI agents (Codex, Claude, Copilot, dll.) yang bekerja di repo ini.

---

## Stack & Tooling

- **Framework**: Next.js (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Linter/Formatter**: ESLint + Prettier
- **Testing**: Jest + React Testing Library (unit), Playwright (e2e)

---

## Struktur Direktori

```
├── app/                  # App Router: layouts, pages, route handlers
│   ├── (auth)/           # Route group — auth pages
│   ├── api/              # API route handlers
│   └── layout.tsx        # Root layout
├── components/           # Shared UI components (atomic/compound)
├── lib/                  # Utility functions, helpers, constants
├── hooks/                # Custom React hooks
├── services/             # External API calls, data fetching logic
├── types/                # Global TypeScript types & interfaces
├── public/               # Static assets
└── tests/
    ├── unit/             # Jest unit tests
    └── e2e/              # Playwright end-to-end tests
```

---

## Konvensi Koding

### Umum
- Gunakan **TypeScript strict** — tidak boleh ada `any` kecuali terpaksa dan diberi komentar alasannya.
- Satu komponen per file. Nama file = nama komponen (PascalCase).
- Utility functions dan hooks: camelCase.
- Konstanta global: UPPER_SNAKE_CASE di `lib/constants.ts`.

### Komponen
- Gunakan **function components** dengan arrow function.
- Props selalu diberi tipe eksplisit (`interface` atau `type`), jangan inline anonymous.
- Hindari `useEffect` yang tidak perlu — prefer Server Components bila memungkinkan.

```tsx
// ✅ Benar
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

const Button = ({ label, onClick, variant = "primary" }: ButtonProps) => {
  return (
    <button className={cn(styles[variant])} onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;
```

### Data Fetching
- **Server Components**: gunakan `fetch` langsung dengan `cache` / `revalidate` options.
- **Client Components**: gunakan custom hook di `hooks/`, panggil dari `services/`.
- Jangan menaruh logic fetch di dalam komponen UI secara langsung.

### API Routes
- Semua handler ada di `app/api/`.
- Selalu validasi input dengan **Zod** sebelum proses lebih lanjut.
- Return response dengan status code yang tepat.

```ts
// app/api/users/route.ts
import { z } from "zod";
import { NextResponse } from "next/server";

const schema = z.object({ name: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // ... logic
  return NextResponse.json({ success: true }, { status: 201 });
}
```

---

## Perintah yang Diizinkan

Agent boleh menjalankan perintah berikut tanpa konfirmasi:

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm test             # Run unit tests
pnpm test:e2e         # Run Playwright tests
pnpm type-check       # tsc --noEmit
```

> ⚠️ **Jangan jalankan** perintah yang menyentuh database production, deploy ke environment live, atau menghapus file di luar `node_modules` dan `.next` tanpa konfirmasi eksplisit dari user.

---

## Aturan Git

- Branch dari `main` dengan format: `feat/`, `fix/`, `chore/`, `refactor/`.
- Commit message ikuti **Conventional Commits**:
  ```
  feat(auth): add Google OAuth login
  fix(api): handle null user on profile fetch
  chore: update dependencies
  ```
- Jangan commit langsung ke `main`.
- Jangan commit file `.env*`, `*.key`, secret apapun.

---

## Testing

- Setiap komponen baru **wajib** punya unit test minimal happy path.
- Setiap API route **wajib** punya test untuk success case dan error/validation case.
- File test ditempatkan berdampingan dengan source (`Component.test.tsx`) atau di `tests/`.
- Coverage threshold: **>= 80%** untuk `statements` dan `branches`.

---

## Environment Variables

- Semua env var didokumentasikan di `.env.example`.
- Variabel yang diekspos ke client **harus** diawali `NEXT_PUBLIC_`.
- Jangan hardcode nilai secret di source code.

---

## Hal yang Tidak Boleh Dilakukan Agent

1. **Jangan** mengubah `next.config.ts` tanpa memahami dampaknya ke build.
2. **Jangan** menghapus atau merestrukturisasi folder utama tanpa diskusi.
3. **Jangan** menginstal package baru yang bersifat heavy/major tanpa menyebutkannya ke user terlebih dahulu.
4. **Jangan** mengabaikan TypeScript error — fix atau jelaskan kenapa diabaikan.
5. **Jangan** menulis kode yang bypass validasi input dari user.

---

## Cara Agent Harus Beroperasi

1. **Baca dulu** file yang relevan sebelum mengedit.
2. **Buat perubahan sekecil mungkin** yang menjawab permintaan — jangan refactor hal yang tidak diminta.
3. **Jalankan lint + type-check** setelah setiap perubahan signifikan.
4. **Jelaskan** setiap keputusan non-trivial di PR description atau sebagai komentar inline.
5. Kalau ada ambiguitas di requirement — **tanya dulu**, jangan assume.