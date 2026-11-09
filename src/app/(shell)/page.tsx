"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { LessonDialog } from "@/components/lesson-dialog";
import { useApp, toast } from "@/components/app-provider";
import { Spinner } from "@/components/spinner";
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
            className="mb-6 inline-flex items-center text-gray-400 hover:text-gray-200"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            {t("back")}
          </button>
          <div className="grid grid-cols-3 gap-3">
            {opened.products.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openProduct(item)}
                className={`text-left ${loadingId === item.id ? "opacity-60" : ""}`}
              >
                <Thumb
                  src={item.thumbnailUrl}
                  name={item.name}
                  rounded="rounded-2xl"
                />
                <h3
                  className="mt-3 px-1 text-center text-sm font-medium break-words"
                  style={{ color: config.productNameColor }}
                >
                  {item.name}
                </h3>
              </button>
            ))}
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
                  className={`overflow-hidden rounded-lg text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${dark ? "border border-gray-700 bg-gray-800" : "bg-white"}`}
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
                    <div className="p-2 text-center">
                      <h3
                        className="text-sm font-medium break-words"
                        style={{ color: config.productNameColor }}
                      >
                        {module.name}
                      </h3>
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
