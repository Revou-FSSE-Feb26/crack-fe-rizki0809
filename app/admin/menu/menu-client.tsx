"use client";

import { useState, type FormEvent } from "react";
import Alert from "../../components/alert";
import Button from "../../components/button";
import Card from "../../components/card";
import Input from "../../components/input";
import Spinner, { Skeleton } from "../../components/spinner";
import { ApiError } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { formatPrice } from "../../lib/format";
import { DEFAULT_TONE, safeTone, TONE_OPTIONS } from "../../lib/tones";
import type { Category, Paginated, Product } from "../../lib/types";
import { useApiResource } from "../../lib/use-api-resource";

type CategoryWithCount = Category & { _count: { products: number } };

const selectStyles =
  "w-full rounded-2xl border border-cream-400 bg-cream-50 px-4 py-3 text-sm text-cocoa-900 transition duration-300 hover:border-cream-300 focus:outline-2 focus:outline-offset-2 focus:outline-strawberry-300 disabled:cursor-not-allowed disabled:bg-cream-200 disabled:opacity-60";

export default function MenuClient() {
  const { status } = useAuth();
  const enabled = status === "authenticated";

  const categories = useApiResource<CategoryWithCount[]>("/categories", {
    enabled,
  });
  // includeUnavailable supaya menu yang sedang dinonaktifkan tetap terlihat admin.
  const products = useApiResource<Paginated<Product>>(
    "/products?limit=100&includeUnavailable=true",
    { enabled }
  );

  const [notice, setNotice] = useState<string | null>(null);

  /** Dipanggil setiap kali data menu berubah, dari form mana pun. */
  function handleChanged(message: string) {
    setNotice(message);
    products.reload();
    // Jumlah menu per kategori ikut bergeser, jadi kategorinya disegarkan juga.
    categories.reload();
  }

  const list = products.data?.data ?? [];
  const isBusy = status === "loading" || products.initialLoading;

  return (
    <div className="flex flex-col gap-6">
      {notice && <Alert variant="success">{notice}</Alert>}

      <Card
        title="Tambah menu baru"
        description="Menu yang ditambahkan langsung tampil di katalog customer."
      >
        <ProductForm
          mode="create"
          categories={categories.data ?? []}
          categoriesLoading={categories.initialLoading}
          onDone={handleChanged}
        />
      </Card>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-bold text-cocoa-900">Daftar menu</h2>
          {!isBusy && (
            <p className="text-sm text-cocoa-500">
              {list.length} menu
              {products.refreshing && (
                <span className="ml-2">· memperbarui…</span>
              )}
            </p>
          )}
        </div>

        {products.error && (
          <Alert
            title="Gagal memuat menu"
            messages={products.error.messages}
            onRetry={products.reload}
            className="mt-4"
          />
        )}

        {isBusy && (
          <div className="mt-4 flex flex-col gap-3" aria-busy="true">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
        )}

        {!isBusy && !products.error && list.length === 0 && (
          <Card variant="soft" className="mt-4 py-12 text-center">
            <p className="text-4xl" aria-hidden="true">
              🍰
            </p>
            <h3 className="mt-3 font-semibold text-cocoa-900">Belum ada menu</h3>
            <p className="mt-1 text-sm text-cocoa-500">
              Tambahkan menu pertama lewat formulir di atas.
            </p>
          </Card>
        )}

        {!isBusy && list.length > 0 && (
          <ul className="mt-4 flex flex-col gap-3">
            {list.map((product) => (
              <li key={product.id}>
                <ProductRow
                  product={product}
                  categories={categories.data ?? []}
                  categoriesLoading={categories.initialLoading}
                  onChanged={handleChanged}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ Form ---

type FormFields = {
  name: string;
  description: string;
  price: string;
  emoji: string;
  tone: string;
  categoryId: string;
  bestSeller: boolean;
};

const emptyForm: FormFields = {
  name: "",
  description: "",
  price: "",
  emoji: "",
  tone: DEFAULT_TONE,
  categoryId: "",
  bestSeller: false,
};

/**
 * Satu formulir untuk dua keperluan: menambah menu baru dan mengubah yang
 * sudah ada. Disatukan supaya aturan validasinya tidak ditulis dua kali lalu
 * lama-lama berbeda sendiri.
 */
function ProductForm({
  mode,
  initial,
  categories,
  categoriesLoading,
  onDone,
  onCancel,
}: {
  mode: "create" | "edit";
  initial?: Product;
  categories: CategoryWithCount[];
  categoriesLoading: boolean;
  onDone: (message: string) => void;
  onCancel?: () => void;
}) {
  const { request } = useAuth();
  const isEdit = mode === "edit";

  const [fields, setFields] = useState<FormFields>(() =>
    initial
      ? {
          name: initial.name,
          description: initial.description,
          price: String(initial.price),
          emoji: initial.emoji,
          tone: safeTone(initial.tone),
          categoryId: initial.categoryId,
          bestSeller: initial.bestSeller,
        }
      : emptyForm
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const validation = validateForm(fields);
    setFieldErrors(validation);
    setErrors([]);

    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);

    const body = {
      name: fields.name.trim(),
      description: fields.description.trim(),
      price: Number(fields.price),
      emoji: fields.emoji.trim(),
      tone: fields.tone,
      categoryId: fields.categoryId,
      bestSeller: fields.bestSeller,
    };

    try {
      if (isEdit && initial) {
        await request<Product>(`/products/${initial.id}`, {
          method: "PATCH",
          body,
        });
        onDone(`Menu "${body.name}" berhasil diperbarui.`);
      } else {
        await request<Product>("/products", { method: "POST", body });
        // Kategori dibiarkan terpilih, supaya menambah beberapa menu dalam
        // kategori yang sama tidak perlu memilih ulang setiap kali.
        setFields({ ...emptyForm, categoryId: fields.categoryId });
        onDone(`Menu "${body.name}" berhasil ditambahkan.`);
      }
    } catch (error) {
      setErrors(
        error instanceof ApiError
          ? error.messages
          : ["Terjadi kesalahan. Coba lagi."]
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      {errors.length > 0 && (
        <Alert
          title={isEdit ? "Menu gagal diperbarui" : "Menu gagal ditambahkan"}
          messages={errors}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nama menu"
          name="name"
          placeholder="Donat Gula"
          value={fields.name}
          onChange={(event) => update("name", event.target.value)}
          error={fieldErrors.name}
          disabled={submitting}
          required
        />
        <Input
          label="Harga (Rp)"
          name="price"
          type="number"
          inputMode="numeric"
          min={1000}
          placeholder="25000"
          value={fields.price}
          onChange={(event) => update("price", event.target.value)}
          error={fieldErrors.price}
          hint="Minimal Rp 1.000."
          disabled={submitting}
          required
        />
      </div>

      <Input
        label="Deskripsi"
        name="description"
        placeholder="Donat empuk bertabur gula halus."
        value={fields.description}
        onChange={(event) => update("description", event.target.value)}
        error={fieldErrors.description}
        disabled={submitting}
        required
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Emoji"
          name="emoji"
          placeholder="🍩"
          maxLength={16}
          value={fields.emoji}
          onChange={(event) => update("emoji", event.target.value)}
          error={fieldErrors.emoji}
          hint="Dipakai sebagai gambar menu."
          disabled={submitting}
          required
        />

        <label className="block w-full">
          <span className="mb-1.5 block text-sm font-semibold text-cocoa-700">
            Warna kartu
          </span>
          <select
            name="tone"
            value={fields.tone}
            onChange={(event) => update("tone", event.target.value)}
            disabled={submitting}
            className={selectStyles}
          >
            {TONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="mt-1.5 flex items-center gap-2 text-xs text-cocoa-500">
            Pratinjau
            <span
              aria-hidden="true"
              className={`inline-block size-5 rounded-md ${safeTone(fields.tone)}`}
            />
          </span>
        </label>

        <label className="block w-full">
          <span className="mb-1.5 block text-sm font-semibold text-cocoa-700">
            Kategori
          </span>
          <select
            name="categoryId"
            value={fields.categoryId}
            onChange={(event) => update("categoryId", event.target.value)}
            disabled={submitting || categoriesLoading}
            className={selectStyles}
          >
            <option value="">
              {categoriesLoading ? "Memuat…" : "Pilih kategori"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId && (
            <span className="mt-1.5 block text-xs text-strawberry-700">
              {fieldErrors.categoryId}
            </span>
          )}
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-cocoa-700">
        <input
          type="checkbox"
          name="bestSeller"
          checked={fields.bestSeller}
          onChange={(event) => update("bestSeller", event.target.checked)}
          disabled={submitting}
          className="size-4 accent-strawberry-700"
        />
        Tandai sebagai best seller
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner label="Menyimpan" />
              Menyimpan…
            </>
          ) : isEdit ? (
            "Simpan perubahan"
          ) : (
            "Tambah menu"
          )}
        </Button>

        {onCancel && (
          <Button
            variant="outline"
            disabled={submitting}
            onClick={onCancel}
          >
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}

function validateForm(fields: FormFields): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!fields.name.trim()) errors.name = "Nama menu wajib diisi";
  else if (fields.name.trim().length > 120)
    errors.name = "Nama maksimal 120 karakter";

  if (!fields.description.trim()) errors.description = "Deskripsi wajib diisi";
  else if (fields.description.trim().length > 255)
    errors.description = "Deskripsi maksimal 255 karakter";

  const price = Number(fields.price);
  if (!fields.price.trim()) errors.price = "Harga wajib diisi";
  else if (!Number.isInteger(price)) errors.price = "Harga harus angka bulat";
  else if (price < 1000) errors.price = "Harga minimal Rp 1.000";

  if (!fields.emoji.trim()) errors.emoji = "Emoji wajib diisi";
  if (!fields.categoryId) errors.categoryId = "Pilih kategori dulu";

  return errors;
}

// ----------------------------------------------------------------- Daftar ---

function ProductRow({
  product,
  categories,
  categoriesLoading,
  onChanged,
}: {
  product: Product;
  categories: CategoryWithCount[];
  categoriesLoading: boolean;
  onChanged: (message: string) => void;
}) {
  const { request } = useAuth();

  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState<"delete" | "toggle" | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function run(action: "delete" | "toggle", send: () => Promise<unknown>) {
    if (busy) return;

    setBusy(action);
    setErrors([]);

    try {
      await send();
    } catch (error) {
      setErrors(
        error instanceof ApiError
          ? error.messages
          : ["Terjadi kesalahan. Coba lagi."]
      );
      setBusy(null);
      return;
    }

    setBusy(null);
    setConfirmingDelete(false);
  }

  function remove() {
    void run("delete", async () => {
      // Backend menghapus permanen kalau menu belum pernah dipesan, dan hanya
      // mengarsipkannya kalau sudah — pesannya menjelaskan yang mana.
      const result = await request<{ message: string }>(
        `/products/${product.id}`,
        { method: "DELETE" }
      );
      onChanged(result.message);
    });
  }

  function toggleAvailability() {
    void run("toggle", async () => {
      await request(`/products/${product.id}`, {
        method: "PATCH",
        body: { isAvailable: !product.isAvailable },
      });
      onChanged(
        product.isAvailable
          ? `Menu "${product.name}" disembunyikan dari katalog.`
          : `Menu "${product.name}" ditampilkan lagi di katalog.`
      );
    });
  }

  // ---- Mode ubah ---------------------------------------------------------
  if (editing) {
    return (
      <Card
        title={`Ubah "${product.name}"`}
        description="Perubahan langsung terlihat di katalog customer."
      >
        <ProductForm
          mode="edit"
          initial={product}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onCancel={() => setEditing(false)}
          onDone={(message) => {
            setEditing(false);
            onChanged(message);
          }}
        />
      </Card>
    );
  }

  // ---- Mode tampil -------------------------------------------------------
  return (
    <Card className={product.isAvailable ? undefined : "opacity-70"}>
      <div className="flex flex-wrap items-center gap-4">
        <span
          aria-hidden="true"
          className={`grid size-14 shrink-0 place-items-center rounded-2xl text-2xl ${safeTone(product.tone)}`}
        >
          {product.emoji}
        </span>

        <div className="min-w-40 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-cocoa-900">{product.name}</p>
            {product.bestSeller && (
              <span className="rounded-full bg-butter-200 px-2 py-0.5 text-[11px] font-semibold text-cocoa-700">
                Best seller
              </span>
            )}
            {!product.isAvailable && (
              <span className="rounded-full bg-cream-300 px-2 py-0.5 text-[11px] font-semibold text-cocoa-700">
                Disembunyikan
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-sm text-cocoa-500">
            {product.description}
          </p>
          <p className="mt-1 text-xs text-cocoa-500">
            {product.category.emoji} {product.category.name}
          </p>
        </div>

        <p className="font-bold text-strawberry-700">
          {formatPrice(product.price)}
        </p>

        {!confirmingDelete && (
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => {
                setErrors([]);
                setEditing(true);
              }}
            >
              Ubah
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={toggleAvailability}
            >
              {busy === "toggle" ? (
                <Spinner label="Menyimpan" />
              ) : product.isAvailable ? (
                "Sembunyikan"
              ) : (
                "Tampilkan"
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy !== null}
              onClick={() => setConfirmingDelete(true)}
            >
              Hapus
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 && <Alert messages={errors} className="mt-3" />}

      {confirmingDelete && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-cream-300 pt-3">
          <p className="text-sm font-semibold text-cocoa-700">
            Hapus menu &ldquo;{product.name}&rdquo;?
          </p>
          <div className="flex gap-2">
            <Button size="sm" disabled={busy !== null} onClick={remove}>
              {busy === "delete" ? (
                <>
                  <Spinner label="Menghapus" />
                  Menghapus…
                </>
              ) : (
                "Ya, hapus"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => setConfirmingDelete(false)}
            >
              Batal
            </Button>
          </div>
          <p className="w-full text-xs text-cocoa-500">
            Menu yang sudah pernah dipesan tidak dihapus permanen, hanya
            diarsipkan, supaya riwayat pesanan lama tetap utuh.
          </p>
        </div>
      )}
    </Card>
  );
}
