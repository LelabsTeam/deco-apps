// DO NOT EDIT. This file is generated by deco.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $$$$$$$$$0 from "./actions/analytics/sendEvent.ts";
import * as $$$$$$$$$1 from "./actions/cart/addItems.ts";
import * as $$$$$$$$$2 from "./actions/cart/addOfferings.ts";
import * as $$$$$$$$$3 from "./actions/cart/clearOrderformMessages.ts";
import * as $$$$$$$$$4 from "./actions/cart/getInstallment.ts";
import * as $$$$$$$$$5 from "./actions/cart/removeItemAttachment.ts";
import * as $$$$$$$$$6 from "./actions/cart/removeItems.ts";
import * as $$$$$$$$$7 from "./actions/cart/removeOffering.ts";
import * as $$$$$$$$$8 from "./actions/cart/simulation.ts";
import * as $$$$$$$$$9 from "./actions/cart/updateAttachment.ts";
import * as $$$$$$$$$10 from "./actions/cart/updateCoupons.ts";
import * as $$$$$$$$$11 from "./actions/cart/updateGifts.ts";
import * as $$$$$$$$$12 from "./actions/cart/updateItemAttachment.ts";
import * as $$$$$$$$$13 from "./actions/cart/updateItemPrice.ts";
import * as $$$$$$$$$14 from "./actions/cart/updateItems.ts";
import * as $$$$$$$$$15 from "./actions/cart/updateProfile.ts";
import * as $$$$$$$$$16 from "./actions/cart/updateUser.ts";
import * as $$$$$$$$$17 from "./actions/masterdata/createDocument.ts";
import * as $$$$$$$$$18 from "./actions/masterdata/updateDocument.ts";
import * as $$$$$$$$$19 from "./actions/newsletter/subscribe.ts";
import * as $$$$$$$$$20 from "./actions/notifyme.ts";
import * as $$$$$$$$$21 from "./actions/review/submit.ts";
import * as $$$$$$$$$22 from "./actions/trigger.ts";
import * as $$$$$$$$$23 from "./actions/wishlist/addItem.ts";
import * as $$$$$$$$$24 from "./actions/wishlist/removeItem.ts";
import * as $$$$0 from "./handlers/sitemap.ts";
import * as $$$0 from "./loaders/cart.ts";
import * as $$$1 from "./loaders/categories/tree.ts";
import * as $$$2 from "./loaders/collections/list.ts";
import * as $$$3 from "./loaders/config.ts";
import * as $$$4 from "./loaders/intelligentSearch/productDetailsPage.ts";
import * as $$$5 from "./loaders/intelligentSearch/productList.ts";
import * as $$$6 from "./loaders/intelligentSearch/productListingPage.ts";
import * as $$$7 from "./loaders/intelligentSearch/productListingPageReduced.ts";
import * as $$$8 from "./loaders/intelligentSearch/productSearchValidator.ts";
import * as $$$9 from "./loaders/intelligentSearch/suggestions.ts";
import * as $$$10 from "./loaders/intelligentSearch/topsearches.ts";
import * as $$$11 from "./loaders/legacy/brands.ts";
import * as $$$12 from "./loaders/legacy/productDetailsPage.ts";
import * as $$$13 from "./loaders/legacy/productList.ts";
import * as $$$14 from "./loaders/legacy/productListingPage.ts";
import * as $$$15 from "./loaders/legacy/relatedProductsLoader.ts";
import * as $$$16 from "./loaders/legacy/suggestions.ts";
import * as $$$17 from "./loaders/logistics/getSalesChannelById.ts";
import * as $$$18 from "./loaders/logistics/listPickupPoints.ts";
import * as $$$19 from "./loaders/logistics/listPickupPointsByLocation.ts";
import * as $$$20 from "./loaders/logistics/listSalesChannelById.ts";
import * as $$$21 from "./loaders/logistics/listStockByStore.ts";
import * as $$$22 from "./loaders/masterdata/searchDocuments.ts";
import * as $$$23 from "./loaders/navbar.ts";
import * as $$$24 from "./loaders/options/productIdByTerm.ts";
import * as $$$25 from "./loaders/orders/list.ts";
import * as $$$26 from "./loaders/paths/PDPDefaultPath.ts";
import * as $$$27 from "./loaders/paths/PLPDefaultPath.ts";
import * as $$$28 from "./loaders/product/extend.ts";
import * as $$$29 from "./loaders/product/extensions/detailsPage.ts";
import * as $$$30 from "./loaders/product/extensions/list.ts";
import * as $$$31 from "./loaders/product/extensions/listingPage.ts";
import * as $$$32 from "./loaders/product/extensions/suggestions.ts";
import * as $$$33 from "./loaders/product/wishlist.ts";
import * as $$$34 from "./loaders/promotion/getPromotionById.ts";
import * as $$$35 from "./loaders/proxy.ts";
import * as $$$36 from "./loaders/user.ts";
import * as $$$37 from "./loaders/wishlist.ts";
import * as $$$38 from "./loaders/workflow/product.ts";
import * as $$$39 from "./loaders/workflow/products.ts";
import * as $$$$$$0 from "./sections/Analytics/Vtex.tsx";
import * as $$$$$$$$$$0 from "./workflows/events.ts";
import * as $$$$$$$$$$1 from "./workflows/product/index.ts";

const manifest = {
  "loaders": {
    "vtex/loaders/cart.ts": $$$0,
    "vtex/loaders/categories/tree.ts": $$$1,
    "vtex/loaders/collections/list.ts": $$$2,
    "vtex/loaders/config.ts": $$$3,
    "vtex/loaders/intelligentSearch/productDetailsPage.ts": $$$4,
    "vtex/loaders/intelligentSearch/productList.ts": $$$5,
    "vtex/loaders/intelligentSearch/productListingPage.ts": $$$6,
    "vtex/loaders/intelligentSearch/productListingPageReduced.ts": $$$7,
    "vtex/loaders/intelligentSearch/productSearchValidator.ts": $$$8,
    "vtex/loaders/intelligentSearch/suggestions.ts": $$$9,
    "vtex/loaders/intelligentSearch/topsearches.ts": $$$10,
    "vtex/loaders/legacy/brands.ts": $$$11,
    "vtex/loaders/legacy/productDetailsPage.ts": $$$12,
    "vtex/loaders/legacy/productList.ts": $$$13,
    "vtex/loaders/legacy/productListingPage.ts": $$$14,
    "vtex/loaders/legacy/relatedProductsLoader.ts": $$$15,
    "vtex/loaders/legacy/suggestions.ts": $$$16,
    "vtex/loaders/logistics/getSalesChannelById.ts": $$$17,
    "vtex/loaders/logistics/listPickupPoints.ts": $$$18,
    "vtex/loaders/logistics/listPickupPointsByLocation.ts": $$$19,
    "vtex/loaders/logistics/listSalesChannelById.ts": $$$20,
    "vtex/loaders/logistics/listStockByStore.ts": $$$21,
    "vtex/loaders/masterdata/searchDocuments.ts": $$$22,
    "vtex/loaders/navbar.ts": $$$23,
    "vtex/loaders/options/productIdByTerm.ts": $$$24,
    "vtex/loaders/orders/list.ts": $$$25,
    "vtex/loaders/paths/PDPDefaultPath.ts": $$$26,
    "vtex/loaders/paths/PLPDefaultPath.ts": $$$27,
    "vtex/loaders/product/extend.ts": $$$28,
    "vtex/loaders/product/extensions/detailsPage.ts": $$$29,
    "vtex/loaders/product/extensions/list.ts": $$$30,
    "vtex/loaders/product/extensions/listingPage.ts": $$$31,
    "vtex/loaders/product/extensions/suggestions.ts": $$$32,
    "vtex/loaders/product/wishlist.ts": $$$33,
    "vtex/loaders/promotion/getPromotionById.ts": $$$34,
    "vtex/loaders/proxy.ts": $$$35,
    "vtex/loaders/user.ts": $$$36,
    "vtex/loaders/wishlist.ts": $$$37,
    "vtex/loaders/workflow/product.ts": $$$38,
    "vtex/loaders/workflow/products.ts": $$$39,
  },
  "handlers": {
    "vtex/handlers/sitemap.ts": $$$$0,
  },
  "sections": {
    "vtex/sections/Analytics/Vtex.tsx": $$$$$$0,
  },
  "actions": {
    "vtex/actions/analytics/sendEvent.ts": $$$$$$$$$0,
    "vtex/actions/cart/addItems.ts": $$$$$$$$$1,
    "vtex/actions/cart/addOfferings.ts": $$$$$$$$$2,
    "vtex/actions/cart/clearOrderformMessages.ts": $$$$$$$$$3,
    "vtex/actions/cart/getInstallment.ts": $$$$$$$$$4,
    "vtex/actions/cart/removeItemAttachment.ts": $$$$$$$$$5,
    "vtex/actions/cart/removeItems.ts": $$$$$$$$$6,
    "vtex/actions/cart/removeOffering.ts": $$$$$$$$$7,
    "vtex/actions/cart/simulation.ts": $$$$$$$$$8,
    "vtex/actions/cart/updateAttachment.ts": $$$$$$$$$9,
    "vtex/actions/cart/updateCoupons.ts": $$$$$$$$$10,
    "vtex/actions/cart/updateGifts.ts": $$$$$$$$$11,
    "vtex/actions/cart/updateItemAttachment.ts": $$$$$$$$$12,
    "vtex/actions/cart/updateItemPrice.ts": $$$$$$$$$13,
    "vtex/actions/cart/updateItems.ts": $$$$$$$$$14,
    "vtex/actions/cart/updateProfile.ts": $$$$$$$$$15,
    "vtex/actions/cart/updateUser.ts": $$$$$$$$$16,
    "vtex/actions/masterdata/createDocument.ts": $$$$$$$$$17,
    "vtex/actions/masterdata/updateDocument.ts": $$$$$$$$$18,
    "vtex/actions/newsletter/subscribe.ts": $$$$$$$$$19,
    "vtex/actions/notifyme.ts": $$$$$$$$$20,
    "vtex/actions/review/submit.ts": $$$$$$$$$21,
    "vtex/actions/trigger.ts": $$$$$$$$$22,
    "vtex/actions/wishlist/addItem.ts": $$$$$$$$$23,
    "vtex/actions/wishlist/removeItem.ts": $$$$$$$$$24,
  },
  "workflows": {
    "vtex/workflows/events.ts": $$$$$$$$$$0,
    "vtex/workflows/product/index.ts": $$$$$$$$$$1,
  },
  "name": "vtex",
  "baseUrl": import.meta.url,
};

export type Manifest = typeof manifest;

export default manifest;
