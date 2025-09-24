import Seo, { Props as SeoProps } from "../../../website/components/Seo.tsx";
import { ProductListingPage, ProductListingPageListItem } from "../../types.ts";
import { canonicalFromBreadcrumblist } from "../../utils/canonical.ts";

export type Props = {
  jsonLD: ProductListingPage | null;
} & Partial<Omit<SeoProps, "jsonLDs">>;

/**
 * @deprecated true
 * @migrate commerce/sections/Seo/SeoPLPV2.tsx
 * @title SeoPLP deprecated
 */
function Section({ jsonLD, ...props }: Props) {
  const title = jsonLD?.seo?.title;
  const description = jsonLD?.seo?.description;
  const canonical = props.canonical
    ? props.canonical
    : jsonLD?.seo?.canonical
      ? jsonLD.seo.canonical
      : jsonLD?.breadcrumb
        ? canonicalFromBreadcrumblist(jsonLD?.breadcrumb)
        : undefined;

  const noIndexing = props.noIndexing ||
    jsonLD?.seo?.noIndexing ||
    !jsonLD ||
    !jsonLD.products.length;

  function sanitizeObj<T>(obj: T): T {
    const propsToRemove = [
      "additionalProperty",
      "isVariantOf",
      "image",
      "teasers",
      "priceSpecification",
      "inProductGroupWithID",
      "sellerName",
      "inventoryLevel",
      "sellerDefault",
      "giftSkuIds",
      "priceValidUntil",
    ];

    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObj(item)) as T;
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([key]) => !propsToRemove.includes(key))
          .map(([key, value]) => [key, sanitizeObj(value)])
      ) as T;
    }

    return obj;
  }

  function formatProductListing(data: ProductListingPage | null) {
    if (!data || !data.products || data.products.length === 0) return null;

    
    const itemListElement: ProductListingPageListItem[] = data.products
      .filter(product => product && product.sku) 
      .map((product, index) => {
        
        const sanitizedProduct = sanitizeObj(product);
        
        
        if (typeof sanitizedProduct === 'object' && sanitizedProduct !== null) {
          
          const productWithDefaults = {
            ...sanitizedProduct,
            "@type": sanitizedProduct["@type"] || "Product",
            
            url: sanitizedProduct.url || `#product-${product.sku}`
          };
          
          return {
            "@type": "ListItem" as const,
            position: index + 1,
            item: productWithDefaults
          };
        }
        
        return {
          "@type": "ListItem" as const,
          position: index + 1,
          item: sanitizedProduct
        };
      });

    
    return {
      "@context": "https://schema.org",
      "@type": "ItemList" as const,
      "numberOfItems": itemListElement.length,
      "itemListElement": itemListElement
    };
  }

  function formatBreadCrumb(data: ProductListingPage | null) {
    if (!data || !data.breadcrumb || !data.breadcrumb.itemListElement) return null;

    
    const validItems = data.breadcrumb.itemListElement
      .filter(item => item && item.name && item.item) 
      .map((item, index) => ({
        "@type": "ListItem" as const,
        position: index + 1,
        name: item.name,
        item: item.item
      }));

    if (validItems.length === 0) return null;

    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList" as const,
      "itemListElement": validItems
    };
  }

  function formatNewJsonLd(data: ProductListingPage | null) {
    if (!data) return [];

   
    const jsonLdArray = [];
    
    
    const productList = formatProductListing(data);
    if (productList) {
      jsonLdArray.push(productList);
    }
    
    
    const breadcrumb = formatBreadCrumb(data);
    if (breadcrumb) {
      jsonLdArray.push(breadcrumb);
    }
    
    
    if (jsonLdArray.length > 0 && (data.seo || data.pageInfo)) {
      const webPageSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage", 
        ...(data.seo?.title && { "name": data.seo.title }),
        ...(data.seo?.description && { "description": data.seo.description }),
        ...(data.seo?.canonical && { "url": data.seo.canonical }),
    
        ...(productList && { "mainEntity": productList }),
        ...(breadcrumb && { "breadcrumb": breadcrumb })
      };
      
     
      return [webPageSchema];
    }
    
    return jsonLdArray;
  }

  
  const newJsonLd = formatNewJsonLd(jsonLD);
  
 
  const validJsonLd = newJsonLd.filter(item => {
    try {
      
      JSON.stringify(item);
      return true;
    } catch {
      console.error("Invalid JSON-LD item:", item);
      return false;
    }
  });

  return (
    <Seo
      {...props}
      title={title || props.title}
      description={description || props.description}
      canonical={canonical}
      jsonLDs={validJsonLd}
      noIndexing={noIndexing}
    />
  );
}

export default Section;