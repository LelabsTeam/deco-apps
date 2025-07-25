import { redirect } from "@deco/deco";
import type { ProductListingPage } from "../../../commerce/types.ts";
import { parseRange } from "../../../commerce/utils/filters.ts";
import { STALE } from "../../../utils/fetch.ts";
import { safeJsonSerialize } from "../../../website/utils/html.ts";
import { AppContext } from "../../mod.ts";
import {
  isFilterParam,
  pageTypesFromUrl,
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearch.ts";
import {
  getValidTypesFromPageTypes,
  pageTypesToBreadcrumbList,
  pageTypesToSeo,
} from "../../utils/legacy.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { getSkipSimulationBehaviorFromBag } from "../../utils/simulationBehavior.ts";
import { slugify } from "../../utils/slugify.ts";
import {
  filtersFromURL,
  mergeFacets,
  parsePageType,
  toFilter,
  toProduct,
} from "../../utils/transform.ts";
import type {
  AdvancedLoaderConfig,
  Facet,
  Fuzzy,
  PageType,
  RangeFacet,
  SelectedFacet,
  SimulationBehavior,
  Sort,
} from "../../utils/types.ts";
import { getFirstItemAvailable } from "../legacy/productListingPage.ts";
import PLPDefaultPath from "../paths/PLPDefaultPath.ts";

/** this type is more friendly user to fuzzy type that is 0, 1 or auto. */
export type LabelledFuzzy = "automatic" | "disabled" | "enabled";
/**
 * VTEX Intelligent Search doesn't support pagination above 50 pages.
 *
 * We're now showing results for the last page so the page doesn't crash
 */
const PAGE_REGEX = /page([1-9]\d*)/;
const VTEX_MAX_PAGES = 50;
const sortOptions = [
  { value: "", label: "relevance:desc" },
  { value: "price:desc", label: "price:desc" },
  { value: "price:asc", label: "price:asc" },
  { value: "orders:desc", label: "orders:desc" },
  { value: "name:desc", label: "name:desc" },
  { value: "name:asc", label: "name:asc" },
  { value: "release:desc", label: "release:desc" },
  { value: "discount:desc", label: "discount:desc" },
];
const LEGACY_TO_IS: Record<string, Sort> = {
  OrderByPriceDESC: "price:desc",
  OrderByPriceASC: "price:asc",
  OrderByTopSaleDESC: "orders:desc",
  OrderByNameDESC: "name:desc",
  OrderByReleaseDateDESC: "release:desc",
  OrderByBestDiscountDESC: "discount:desc",
};

const sortValues = [
  "price:desc",
  "price:asc",
  "orders:desc",
  "name:desc",
  "name:asc",
  "release:desc",
  "discount:desc",
  "relevance:desc",
];

export const mapLabelledFuzzyToFuzzy = (
  labelledFuzzy?: LabelledFuzzy,
): Fuzzy | undefined => {
  switch (labelledFuzzy) {
    case "automatic":
      return "auto";
    case "disabled":
      return "0";
    case "enabled":
      return "1";
    default:
      return;
  }
};
const ALLOWED_PARAMS = new Set([
  "ps",
  "sort",
  "page",
  "o",
  "q",
  "fuzzy",
  "map",
]);

enum AdditionalParameters {
  showSponsered,
  placement,
}
export interface Props {
  /**
   * @description overides the query term
   */
  query?: string;
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;
  /**
   * @title Sorting
   */
  sort?: Sort;
  /**
   * @title Fuzzy
   */
  fuzzy?: LabelledFuzzy;
  /**
   * @title Selected Facets
   * @description Override selected facets from url
   */
  selectedFacets?: SelectedFacet[];
  /**
   * @title Use collection name
   * @description Overwrite the page title with the collection name
   */
  useCollectionName?: boolean;
  /**
   * @title Hide Unavailable Items
   * @description Do not return out of stock items
   */
  hideUnavailableItems?: boolean;
  /**
   * @title Starting page query parameter offset.
   * @description Set the starting page offset. Default to 1.
   */
  pageOffset?: number;
  /**
   * @title Page query parameter
   */
  page?: number;
  /**
   * @description Include similar products
   * @deprecated Use product extensions instead
   */
  similars?: boolean;
  /**
   * @hide true
   * @description The URL of the page, used to override URL from request
   */
  pageHref?: string;

  /**
   * @title Include price in facets
   */
  priceFacets?: boolean;
  aditionalFieldsInQuery?: {
    label: string;
    value: string;
  }[];
  /**
   * @title Advanced Configuration
   * @description Further change loader behaviour
   */
  advancedConfigs?: AdvancedLoaderConfig;
  /**
   * @title Simulation Behavior
   * @description Defines the simulation behavior.
   */
  simulationBehavior?: SimulationBehavior;
}
const searchArgsOf = (props: Props, url: URL, ctx: AppContext) => {
  const hideUnavailableItems = props.hideUnavailableItems;
  const simulationBehavior =
    url.searchParams.get("simulationBehavior") as SimulationBehavior ||
    props.simulationBehavior || "default";
  const countFromSearchParams = url.searchParams.get("PS");
  const count = Number(countFromSearchParams ?? props.count ?? 12);
  const query = props.query ?? url.searchParams.get("q") ?? "";
  const currentPageoffset = props.pageOffset ?? 1;
  const page = props.page ??
    Math.min(
      url.searchParams.get("page")
        ? Number(url.searchParams.get("page")) - currentPageoffset
        : 0,
      VTEX_MAX_PAGES - currentPageoffset,
    );
  let sort = (url.searchParams.get("sort") as Sort) ??
    LEGACY_TO_IS[url.searchParams.get("O") ?? ""] ??
    props.sort ??
    sortOptions[0].value;
  if (!sort || !sortValues.includes(sort)) {
    sort = sortOptions[0].value as Sort;
  }
  const selectedFacets = mergeFacets(
    props.selectedFacets ?? [],
    filtersFromURL(url),
  );

  const fuzzy = mapLabelledFuzzyToFuzzy(props.fuzzy) ??
    (url.searchParams.get("fuzzy") as Fuzzy);
  return {
    query,
    fuzzy,
    page,
    sort,
    count,
    hideUnavailableItems,
    selectedFacets,
    simulationBehavior,
  };
};
const PAGE_TYPE_TO_MAP_PARAM = {
  Brand: "brand",
  Collection: "productClusterIds",
  Cluster: "productClusterIds",
  Search: null,
  Product: null,
  NotFound: null,
  FullText: null,
};
const pageTypeToMapParam = (type: PageType["pageType"], index: number) => {
  if (type === "Category" || type === "Department" || type === "SubCategory") {
    return `category-${index + 1}`;
  }
  return PAGE_TYPE_TO_MAP_PARAM[type];
};
const queryFromPathname = (
  isInSeachFormat: boolean,
  pageTypes: PageType[],
  path: string,
) => {
  const pathList = path.split("/").slice(1);
  const isPage = Boolean(pageTypes.length);
  const isValidPathSearch = pathList.length == 1;
  if (!isPage && !isInSeachFormat && isValidPathSearch) {
    // decode uri parse uri enconde symbols like '%20' to ' '
    return decodeURI(pathList[0]);
  }
};
const filtersFromPathname = (pages: PageType[]) =>
  pages
    .map((page, index) => {
      const key = pageTypeToMapParam(page.pageType, index);
      if (!key || !page.name) {
        return;
      }
      return (key &&
        page.name && {
        key,
        value: slugify(page.name),
      });
    })
    .filter((facet): facet is {
      key: string;
      value: string;
    } => Boolean(facet));
// Search API does not return the selected price filter, so there is no way for the
// user to remove this price filter after it is set. This function selects the facet
// so users can clear the price filters
const selectPriceFacet = (facets: Facet[], selectedFacets: SelectedFacet[]) => {
  const price = facets.find((f): f is RangeFacet => f.key === "price");
  const ranges = selectedFacets
    .filter((k) => k.key === "price")
    .map((s) => parseRange(s.value))
    .filter(Boolean);
  if (price) {
    for (const range of ranges) {
      if (!range) {
        continue;
      }
      for (const val of price.values) {
        if (val.range.from === range.from && val.range.to === range.to) {
          val.selected = true;
        }
      }
    }
  }
  return facets;
};
/**
 * @title VTEX Integration - Intelligent Search
 * @description Product Listing Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { vcsDeprecated } = ctx;
  const { url: baseUrl } = req;
  const url = new URL(props.pageHref || baseUrl);

  const lastParamn = url.pathname.split("/").pop();

  const matchParamPage = lastParamn?.match(PAGE_REGEX);
  const paramnPage = matchParamPage ? Number(matchParamPage[1]!) : 1;

  const segment = getSegmentFromBag(ctx);
  const {
    selectedFacets: baseSelectedFacets,
    page,
    ...args
  } = searchArgsOf(props, url, ctx);

  const aditionalFieldsInQuery: {
    [key in keyof typeof AdditionalParameters | string]?:
      | string
      | number
      | boolean;
  } = {};
  props.aditionalFieldsInQuery?.map((item) => {
    aditionalFieldsInQuery[item.label] = item.value;
  });

  let pathToUse = url.href.replace(url.origin, "");

  if (pathToUse === "/" || pathToUse === "/*") {
    const result = await PLPDefaultPath({ level: 1 }, req, ctx);
    pathToUse = result?.possiblePaths[0] ?? pathToUse;
  }

  const allPageTypes = await pageTypesFromUrl(pathToUse, ctx);
  const pageTypes = getValidTypesFromPageTypes(allPageTypes);

  const selectedFacets = baseSelectedFacets.length === 0
    ? filtersFromPathname(pageTypes)
    : baseSelectedFacets;
  const selected = withDefaultFacets(selectedFacets, ctx);
  const fselected = props.priceFacets
    ? selected
    : selected.filter((f) => f.key !== "price");
  const isInSeachFormat = Boolean(selected.length) || Boolean(args.query);
  const pathQuery = queryFromPathname(isInSeachFormat, pageTypes, url.pathname);
  const searchArgs = { ...args, query: args.query || pathQuery };
  if (!isInSeachFormat && !pathQuery) {
    return null;
  }

  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  const params = withDefaultParams({ ...searchArgs, page, locale });

  // search products on VTEX. Feel free to change any of these parameters
  const [productsResult, facetsResult] = await Promise.all([
    vcsDeprecated[
      "GET /api/io/_v/api/intelligent-search/product_search/*facets"
    ](
      {
        ...aditionalFieldsInQuery,
        ...params,
        page: props.page || paramnPage,
        facets: toPath(selected),
      },
      {
        ...STALE,
        headers: segment ? withSegmentCookie(segment) : undefined,
      },
    ).then((res) => res.json()),
    vcsDeprecated["GET /api/io/_v/api/intelligent-search/facets/*facets"]({
      ...params,
      ...aditionalFieldsInQuery,
      page: props.page || paramnPage,
      facets: toPath(fselected),
    }, { ...STALE, headers: segment ? withSegmentCookie(segment) : undefined })
      .then((res) => res.json()),
  ]);

  const currentPageTypes = !props.useCollectionName
    ? pageTypes
    : pageTypes.map((pageType) => {
      if (pageType.id !== pageTypes.at(-1)?.id) return pageType;

      const name = productsResult?.products?.[0]?.productClusters?.find(
        (collection) => collection.id === pageType.name,
      )?.name ?? pageType.name;

      return {
        ...pageType,
        name,
      };
    });

  // It is a feature from Intelligent Search on VTEX panel
  // redirect to a specific page based on configured rules
  if (productsResult.redirect) {
    redirect(
      new URL(productsResult.redirect, url.origin)
        .href,
    );
  }

  //comment this event because this event already calling in another location

  /** Intelligent search API analytics. Fire and forget 🔫 */
  // const fullTextTerm = params["query"];
  // if (fullTextTerm) {
  //   sendEvent({ type: "session.ping", url: url.href }, req, ctx)
  //     .then(() =>
  //       sendEvent(
  //         {
  //           type: "search.query",
  //           text: fullTextTerm,
  //           misspelled: productsResult.correction?.misspelled ?? false,
  //           match: productsResult.recordsFiltered,
  //           operator: productsResult.operator,
  //           locale: segment?.payload?.cultureInfo ?? "pt-BR",
  //           url: url.href,
  //         },
  //         req,
  //         ctx,
  //       )
  //     )
  //     .catch(console.error);
  // }

  const { products: vtexProducts, pagination, recordsFiltered } =
    productsResult;
  const facets = selectPriceFacet(facetsResult.facets, selectedFacets);
  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = await Promise.all(
    vtexProducts
      .map((p) =>
        toProduct(p, p.items.find(getFirstItemAvailable) || p.items[0], 0, {
          baseUrl: baseUrl,
          priceCurrency: segment?.payload?.currencyCode ?? "BRL",
          includeOriginalAttributes: props.advancedConfigs
            ?.includeOriginalAttributes,
        })
      )
      .map((product) =>
        props.similars ? withIsSimilarTo(req, ctx, product) : product
      ),
  );
  const paramsToPersist = new URLSearchParams();
  searchArgs.query && paramsToPersist.set("q", searchArgs.query);
  searchArgs.sort && paramsToPersist.set("sort", searchArgs.sort);

  const filters = facets
    .filter((f) => {
      if (f.values.some((item) => item.selected) || !f.hidden) return true;
      return false;
    })
    .map(toFilter(selectedFacets, paramsToPersist));
  const itemListElement = pageTypesToBreadcrumbList(pageTypes, baseUrl);
  const hasNextPage = Boolean(pagination.next.proxyUrl);
  const hasPreviousPage = paramnPage > 1;
  const currentSearchParams = new URLSearchParams(url.searchParams);

  const getPageUrl = (value: number) => {
    const pageCurrentExist = url.pathname.match(PAGE_REGEX);
    const queryParamns = currentSearchParams.toString()
      ? "?" + currentSearchParams.toString()
      : "";
    return pageCurrentExist
      ? `${
        url.pathname.replace(PAGE_REGEX, `page${paramnPage + value}`)
      }${queryParamns} `
      : `${url.pathname}/page${paramnPage + 1}${queryParamns}   `;
  };

  return {
    "@type": "ItemList",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement,
      numberOfItems: itemListElement.length,
    },
    filters,
    products,
    pageInfo: {
      nextPage: hasNextPage ? getPageUrl(1) : undefined,
      previousPage: hasPreviousPage ? getPageUrl(-1) : undefined,
      currentPage: paramnPage,
      records: recordsFiltered,
      recordPerPage: pagination.perPage,
      pagination,
      pageTypes: allPageTypes.map(parsePageType),
    },
    sortOptions,
    seo: safeJsonSerialize(pageTypesToSeo(
      currentPageTypes,
      baseUrl,
      hasPreviousPage ? paramnPage : undefined,
    )),
  };
};
export const cache = "stale-while-revalidate";
export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  const url = new URL(props.pageHref || req.url);
  if (url.searchParams.has("q")) {
    return null;
  }
  const segment = getSegmentFromBag(ctx)?.token ?? "";

  const params = new URLSearchParams([
    ["query", props.query ?? ""],
    ["count", (props.count || url.searchParams.get("count") || 12).toString()],
    ["page", (props.page ?? url.searchParams.get("page") ?? 1).toString()],
    ["sort", props.sort ?? url.searchParams.get("sort") ?? ""],
    ["fuzzy", props.fuzzy ?? url.searchParams.get("fuzzy") ?? ""],
    ["hideUnavailableItems", props.hideUnavailableItems?.toString() ?? ""],
    ["pageOffset", (props.pageOffset ?? 1).toString()],
    [
      "selectedFacets",
      (props.selectedFacets ?? []).reduce(
        (prev, curr) => [...prev, `${curr.key}:${curr.value}`],
        [] as string[],
      ).join("\\"),
    ],
    ["segment", segment],
    [
      "simulationBehavior",
      url.searchParams.get("simulationBehavior") || props.simulationBehavior ||
      "default",
    ],
  ]);
  url.searchParams.forEach((value, key) => {
    if (!ALLOWED_PARAMS.has(key.toLowerCase()) && !isFilterParam(key)) {
      return;
    }
    params.append(key, value);
  });
  params.sort();
  url.search = params.toString();
  return url.href;
};
export default loader;
