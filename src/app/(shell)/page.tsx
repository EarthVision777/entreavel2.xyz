"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { LessonDialog } from "@/components/lesson-dialog";
import { useApp, toast } from "@/components/app-provider";
import { Spinner } from "@/components/spinner";
import { guideFor, noteFor } from "@/data/guides";
import { ApiError, api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { openExternal, releaseMessage } from "@/lib/media";
import type { ModuleSummary, Product, ProductSummary } from "@/lib/types";

export default function HomePage() {
  const { config, theme } = useApp();
  const dark = theme === "dark";
  const [modules, setModules] = useState<ModuleSummary[] | null>(null);
  const [opened, setOpened] = useState<ModuleSummary | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .listModules()
      .then((data) => {
        if (active) setModules(data);
      })
      .catch(() => {
        if (!active) return;
        setModules([]);
        toast.error(t("error_loading_products"));
      });
    return () => {
      active = false;
    };
  }, []);

  const openProduct = useCallback(async (item: ProductSummary) => {
    setLoadingId(item.id);
    try {
      setProduct(await api.getProduct(item.id));
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 403
          ? t("you_dont_have_access")
          : t("error_loading_content");
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  }, []);

  function openModule(module: ModuleSummary) {
    if (module.hasAccess) {
      setOpened(module);
      return;
    }
    if (module.purchaseUrl) {
      openExternal(module.purchaseUrl);
      return;
    }
    toast.error(t("you_dont_have_access"));
  }

  if (modules === null) return <Spinner dark={dark} />;

  return (
    <div>
      {opened ? (
        <div>
          <button
            type="button"
            onClick={() => setOpened(null)}
            className="mb-4 inline-flex items-center rounded-full text-gray-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e7b5a6]"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            {t("back")}
          </button>
          <ModuleIntro
            moduleId={opened.id}
            count={opened.products.length}
            dark={dark}
          />
          <div className="grid grid-cols-2 gap-3">
            {opened.products.map((item, index) => {
              const lead = guideFor(item.id)?.lead;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openProduct(item)}
                  className={`rounded-2xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e7b5a6] ${loadingId === item.id ? "opacity-60" : ""}`}
                >
                  <div className="relative">
                    <Thumb
                      src={item.thumbnailUrl}
                      name={item.name}
                      rounded="rounded-2xl"
                    />
                    <span className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#8a1500] text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <h3
                    className="mt-3 px-1 text-center text-sm leading-5 font-medium break-words"
                    style={{ color: config.productNameColor }}
                  >
                    {item.name}
                  </h3>
                  {lead ? (
                    <p className="mt-1 line-clamp-3 px-1 text-center text-xs leading-5 text-gray-400">
                      {lead}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <Banners />
          <div className="grid grid-cols-2 gap-4">
            {modules.map((module) => {
              const locked = releaseMessage(module);
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => openModule(module)}
                  className={`overflow-hidden rounded-lg text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e7b5a6] ${dark ? "border border-gray-700 bg-gray-800" : "bg-white"}`}
                >
                  <div className="relative aspect-square">
                    <Thumb src={module.thumbnailUrl} name={module.name} />
                    {!module.hasAccess ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center">
                        <Lock className="mb-2 h-8 w-8 text-white" />
                        {!module.purchaseUrl && locked ? (
                          <p className="text-sm text-white">{locked}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  {config.showProductName ? (
                    <div className="p-3 text-center">
                      <h3
                        className="text-sm leading-5 font-medium break-words"
                        style={{ color: config.productNameColor }}
                      >
                        {module.name}
                      </h3>
                      {noteFor(module.id) ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">
                          {noteFor(module.id)?.summary}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
          {modules.length === 0 ? (
            <p className={`py-16 text-center ${dark ? "text-gray-400" : "text-gray-500"}`}>
              {t("no_products_available")}
            </p>
          ) : null}
        </div>
      )}
      <LessonDialog
        product={product}
        dark={dark}
        onClose={() => setProduct(null)}
      />
    </div>
  );
}

function ModuleIntro({
  moduleId,
  count,
  dark,
}: {
  moduleId: string;
  count: number;
  dark: boolean;
}) {
  const note = noteFor(moduleId);
  if (!note) return null;
  return (
    <section
      className={`mb-5 rounded-2xl border px-4 py-4 ${dark ? "border-white/10 bg-white/[0.04]" : "border-stone-200 bg-white"}`}
    >
      <p
        className={`text-xs font-medium tracking-wide uppercase ${dark ? "text-[#f0c7b8]" : "text-[#8a1500]"}`}
      >
        {count === 1 ? "1 clase" : t("lessons_count", { count })}
      </p>
      <p className={`mt-2 text-base leading-7 ${dark ? "text-stone-100" : "text-stone-900"}`}>
        {note.summary}
      </p>
      <p className={`mt-2 text-sm leading-6 ${dark ? "text-stone-400" : "text-stone-600"}`}>
        {note.howToUse}
      </p>
    </section>
  );
}

function Thumb({
  src,
  name,
  rounded = "",
}: {
  src: string | null;
  name: string;
  rounded?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex aspect-square w-full items-center justify-center bg-gradient-to-br from-red-900 to-red-700 ${rounded}`}
      >
        <span className="text-3xl font-bold text-white">{name.charAt(0)}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className={`aspect-square w-full object-cover ${rounded}`}
    />
  );
}

function Banners() {
  const { config } = useApp();
  const banners = config.banners;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % banners.length),
      5000,
    );
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative mb-6 w-full">
      <div className="relative aspect-video overflow-hidden rounded-lg shadow-sm">
        {banners.map((banner, bannerIndex) => (
          <button
            key={banner.imageUrl}
            type="button"
            className={`absolute inset-0 transition-opacity duration-500 ${bannerIndex === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
            onClick={() => openExternal(banner.linkUrl)}
          >
            <img
              src={banner.imageUrl}
              alt={`Banner ${bannerIndex + 1}`}
              className="h-full w-full object-contain"
            />
          </button>
        ))}
        {banners.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Anterior"
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1"
              onClick={() =>
                setIndex((current) =>
                  current === 0 ? banners.length - 1 : current - 1,
                )
              }
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1"
              onClick={() =>
                setIndex((current) => (current + 1) % banners.length)
              }
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
