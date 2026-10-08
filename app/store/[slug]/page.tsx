import { cache } from "react";
import { Metadata } from "next";
import { DEFAULT_PRODUCTS } from "@/lib/default-products";
import ProductDetailPageClient from "./ProductDetailPageClient";
import { Product } from "@/lib/store-types";

export const revalidate = 60;

import { getProducts } from "@/lib/store-db";

const getStoreProduct = cache(async (slug: string): Promise<Product | null> => {
  try {
    const products = getProducts();
    const found = products.find((p) => p.slug === slug || p.id === slug);
    if (found) return found;
  } catch (e) {}

  return DEFAULT_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null;
});

export async function generateStaticParams() {
  return DEFAULT_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProduct(slug);

  if (!product) {
    return {
      title: "Digital Tool - Store | Abdallah Ahmed",
    };
  }

  const title = `${product.title} - Digital Store | Abdallah Ahmed`;
  const description =
    product.subtitle || product.description?.slice(0, 160) || `Download ${product.title} for ${product.software || "design & development"}.`;
  const canonicalUrl = `https://bid032.com/store/${product.slug}`;
  const ogImage = product.coverImage || "https://bid032.com/Photos/01.webp";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Abdallah Ahmed Digital Store",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getStoreProduct(slug);

  return <ProductDetailPageClient slug={slug} initialProduct={product} />;
}
