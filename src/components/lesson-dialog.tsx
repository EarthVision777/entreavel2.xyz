"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { LessonReading } from "@/components/lesson-reading";
import { Button } from "@/components/ui/button";
import { guideFor } from "@/data/guides";
import { t } from "@/lib/i18n";
import { openExternal, vimeoEmbed, youtubeId } from "@/lib/media";
import type { Product } from "@/lib/types";

export function LessonDialog({
  product,
  dark,
  onClose,
}: {
  product: Product | null;
  dark: boolean;
  onClose: () => void;
}) {
  const open = product !== null;
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-0 z-[81] flex flex-col bg-gray-900 text-gray-100 outline-none">
          <div
            className={`flex items-center justify-between border-b px-4 py-4 ${dark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white text-gray-900"}`}
          >
            <Dialog.Title className="flex-1 truncate text-center text-base font-medium">
              {product?.name}
            </Dialog.Title>
            <Dialog.Close
              aria-label={t("close")}
              className="rounded-full p-2 text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {product ? <LessonBody product={product} dark={dark} /> : null}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function LessonBody({ product, dark }: { product: Product; dark: boolean }) {
  const guide = guideFor(product.id);
  const original = hasOriginalClass(product);
  const [tab, setTab] = useState<"guide" | "class">(guide ? "guide" : "class");

  useEffect(() => {
    setTab(guideFor(product.id) ? "guide" : "class");
  }, [product.id]);

  const frame = "w-full rounded-lg bg-black";
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 pb-16">
      {guide && original ? (
        <div
          role="tablist"
          aria-label={product.name}
          className="mx-auto grid w-full max-w-xl grid-cols-2 gap-1 rounded-full bg-black/40 p-1"
        >
          <TabButton
            selected={tab === "guide"}
            onClick={() => setTab("guide")}
          >
            {t("reading_tab")}
          </TabButton>
          <TabButton
            selected={tab === "class"}
            onClick={() => setTab("class")}
          >
            {t("original_class")}
          </TabButton>
        </div>
      ) : null}
      {tab === "guide" && guide ? (
        <LessonReading guide={guide} />
      ) : (
        <Player product={product} frame={frame} />
      )}
      {product.type === "external_link" && tab === "guide" ? (
        <div className="mx-auto flex w-full max-w-xl justify-center">
          <Button
            className="h-auto bg-[#8a1500] px-8 py-3 text-base text-white hover:bg-[#6e1000]"
            onClick={() => openExternal(product.contentUrl)}
          >
            {t("open_access")}
          </Button>
        </div>
      ) : null}
      {product.description ? (
        <div
          className={`mx-auto w-full max-w-xl rounded-lg p-4 ${dark ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-600"}`}
        >
          <h3 className="mb-2 font-sans text-lg font-semibold">{t("description")}</h3>
          <p className="whitespace-pre-wrap">{product.description}</p>
        </div>
      ) : null}
    </div>
  );
}

function TabButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e7b5a6] ${selected ? "bg-[#8a1500] text-white" : "text-stone-300 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function hasOriginalClass(product: Product) {
  if (product.type === "external_link") return false;
  if (product.type === "html") {
    const html = product.htmlContent.trim();
    return Boolean(html) && html !== "<div></div>";
  }
  return Boolean(product.contentUrl);
}

function Player({ product, frame }: { product: Product; frame: string }) {
  const url = product.contentUrl;

  if (product.type === "external_link") {
    return (
      <div className="flex justify-center py-10">
        <Button
          className="h-auto bg-[#8a1500] px-8 py-3 text-base text-white hover:bg-[#6e1000]"
          onClick={() => openExternal(url)}
        >
          {t("open_access")}
        </Button>
      </div>
    );
  }

  if (product.type === "youtube") {
    const id = youtubeId(url);
    if (!id) return <p>URL de YouTube inválida</p>;
    return (
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={product.name}
          className={`${frame} h-full`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (product.type === "vimeo") {
    const embed = vimeoEmbed(url);
    if (!embed) return <p>URL de Vimeo inválida</p>;
    return (
      <div className="aspect-video w-full">
        <iframe
          src={embed}
          title={product.name}
          className={`${frame} h-full`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (product.type === "audio") {
    return (
      <audio className="w-full" controls preload="metadata">
        <source src={url} type="audio/mpeg" />
      </audio>
    );
  }

  if (product.type === "pdf") {
    return (
      <iframe
        title={product.name}
        className="h-[70vh] w-full"
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
      />
    );
  }

  if (product.type === "html") {
    const html = product.htmlContent.trim();
    if (!html || html === "<div></div>") {
      return (
        <p className="py-16 text-center text-gray-300">
          Esta clase se publica en breve.
        </p>
      );
    }
    return (
      <iframe
        title={product.name}
        className="h-[70vh] w-full border-0 bg-white"
        sandbox="allow-scripts allow-popups"
        srcDoc={html}
      />
    );
  }

  return (
    <div className="space-y-3">
      <iframe
        title={product.name}
        src={url}
        className="h-[70vh] w-full rounded-lg bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
      <button
        type="button"
        className="text-sm text-blue-400 underline"
        onClick={() => openExternal(url)}
      >
        {t("open_lesson")}
      </button>
    </div>
  );
}
