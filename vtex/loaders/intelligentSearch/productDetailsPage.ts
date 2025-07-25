import type { ProductDetailsPage } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import type { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import {
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearch.ts";
import { pageTypesToSeo } from "../../utils/legacy.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { pickSku, toProductPage } from "../../utils/transform.ts";
import type {
  AdvancedLoaderConfig,
  PageType,
  Product as VTEXProduct,
} from "../../utils/types.ts";
import { LegacyProduct } from "../../utils/types.ts";
import PDPDefaultPath from "../paths/PDPDefaultPath.ts";

export interface Props {
  slug: RequestURLParam;
  /**
   * @description Include similar products
   * @deprecated Use product extensions instead
   */
  similars?: boolean;
  /**
   * @title Indexing Skus
   * @description Index of product pages with the `skuId` parameter
   */
  indexingSkus?: boolean;
  /**
   * @title Advanced Configuration
   * @description Further change loader behaviour
   */
  advancedConfigs?: AdvancedLoaderConfig;
}

/**
 * When there's no ?skuId querystring, we need to figure out the product id
 * from the pathname. For this, we use the pageType api
 */
const getProductID = (page: PageType) => {
  if (page.pageType !== "Product") {
    return null;
  }

  return page.id!;
};

/**
 * @title VTEX Integration - Intelligent Search
 * @description Product Details Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> => {
  const { vcsDeprecated } = ctx;
  const { url: baseUrl } = req;
  const { slug } = props;
  const haveToUseSlug = slug && !slug.startsWith(":");
  let defaultPaths;

  if (!haveToUseSlug) {
    defaultPaths = await PDPDefaultPath({ count: 1 }, req, ctx);
  }

  const lowercaseSlug = haveToUseSlug
    ? slug?.toLowerCase()
    : defaultPaths?.possiblePaths[0];
  const segment = getSegmentFromBag(ctx);
  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  const pageTypePromise = vcsDeprecated
    ["GET /api/catalog_system/pub/portal/pagetype/:term"](
      { term: `${lowercaseSlug}/p` },
      STALE,
    ).then((res) => res.json());

  const url = new URL(baseUrl);
  const skuId = url.searchParams.get("skuId") || url.searchParams.get("idsku");
  const productId = !skuId && getProductID(await pageTypePromise);

  /**
   * Fetch the exact skuId. If no one was provided, try fetching the product
   * and return the first sku
   */
  const query = skuId
    ? `sku:${skuId}`
    : productId
    ? `product:${productId}`
    : null;

  // In case we dont have the skuId or the productId, 404
  if (!query) {
    return null;
  }

  const facets = withDefaultFacets([], ctx);
  const params = withDefaultParams({ query, count: 1, locale });

  const { products: [product] } = await vcsDeprecated
    ["GET /api/io/_v/api/intelligent-search/product_search/*facets"]({
      ...params,
      facets: toPath(facets),
    }, { ...STALE, headers: withSegmentCookie(segment) })
    .then((res) => res.json());

  // Product not found, return the 404 status code
  if (!product) {
    return null;
  }

  // const legacyQuery = skuId ? `skuId:${skuId}` : `productId:${productId}`;
  // const res = await vcsDeprecated
  //   ["GET /api/catalog_system/pub/products/search/:term?"]({
  //     fq: [legacyQuery],
  //   });

  // const [legacyProduct] = (await res.json()) as LegacyProduct[];
  const sku = pickSku(product, skuId?.toString());

  let kitItems: VTEXProduct[] = [];
  if (sku.isKit && sku.kitItems) {
    const params = withDefaultParams({
      query: `sku:${sku.kitItems.join(";")}`,
      count: sku.kitItems.length,
    });

    const result = await vcsDeprecated
      ["GET /api/io/_v/api/intelligent-search/product_search/*facets"]({
        ...params,
        facets: toPath(facets),
      }, { ...STALE, headers: withSegmentCookie(segment) })
      .then((res) => res.json());

    kitItems = result.products;
  }

  const pageType = await pageTypePromise;

  const page = toProductPage(product, sku, kitItems, {
    baseUrl,
    priceCurrency: segment?.payload?.currencyCode ?? "BRL",
    includeOriginalAttributes: props.advancedConfigs?.includeOriginalAttributes,
  });

  const isPageProduct = pageType.pageType === "Product";

  const seo = isPageProduct ? pageTypesToSeo([pageType], baseUrl) : null;

  return {
    ...page,
    product: props.similars
      ? await withIsSimilarTo(req, ctx, page.product)
      : page.product,
    seo: isPageProduct && seo
      ? {
        ...seo,
        noIndexing: props.indexingSkus ? false : seo.noIndexing,
        // legacyProductTitle: legacyProduct?.productTitle || "",
        // legacyDescritionMetaTag: legacyProduct?.metaTagDescription || "",
      }
      : null,
  };
};

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  const segment = getSegmentFromBag(ctx)?.token;
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId") ?? "";

  const params = new URLSearchParams([
    ["slug", props.slug],
    ["segment", segment ?? ""],
    ["skuId", skuId],
  ]);

  url.search = params.toString();

  return url.href;
};

export default loader;
