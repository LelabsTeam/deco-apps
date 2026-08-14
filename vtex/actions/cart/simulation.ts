import { AppContext } from "../../mod.ts";
import type { SimulationOrderForm } from "../../utils/types.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";
import { logger } from "@deco/deco/o11y";

export interface Item {
  id: number;
  quantity: number;
  seller: string;
}

export interface Props {
  items: Item[];
  postalCode: string;
  country: string;
  RnbBehavior?: 0 | 1;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForms/simulation
 * @title Simulation OrderForm
 * @description Simulate an orderForm, used for shipping and pricing simulation
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<SimulationOrderForm> => {
  const cookie = req.headers.get("cookie") ?? "";
  const { vcsDeprecated } = ctx;
  const { items, postalCode, country, RnbBehavior = 1 } = props;

  const invalidItems = items.filter(
    (item) =>
      item.quantity == null ||
      item.quantity < 1 ||
      Number.isNaN(item.quantity) ||
      !Number.isFinite(item.quantity),
  );

  if (invalidItems.length > 0) {
    const url = new URL(req.url);
    logger.warn(
      "Simulation received items with invalid quantities (CHK0023)",
      {
        invalidItems,
        postalCode,
        country,
        referer: req.headers.get("referer"),
        origin: req.headers.get("origin"),
        pathname: url.pathname,
        totalItems: items.length,
        invalidCount: invalidItems.length,
      },
    );
  }

  const validItems = items.filter(
    (item) =>
      item.quantity != null &&
      item.quantity >= 1 &&
      !Number.isNaN(item.quantity) &&
      Number.isFinite(item.quantity),
  );

  if (validItems.length === 0) {
    return {
      items: [],
      ratesAndBenefitsData: { rateAndBenefitsIdentifiers: [], teaser: [] },
      paymentData: {
        updateStatus: "",
        installmentOptions: [],
        paymentSystems: [],
        payments: [],
        giftCards: [],
        giftCardMessages: [],
        availableAccounts: [],
        availableTokens: [],
        availableAssociations: {},
      },
      selectableGifts: [],
      postalCode: postalCode ?? "",
      country: country ?? "",
      logisticsInfo: [],
      messages: [],
      purchaseConditions: { itemPurchaseConditions: [] },
      pickupPoints: [],
      totals: [],
      allowMultipleDeliveries: false,
    } as SimulationOrderForm;
  }

  const segment = getSegmentFromBag(ctx);

  const response = await vcsDeprecated[
    "POST /api/checkout/pub/orderForms/simulation"
  ](
    {
      RnbBehavior,
      sc: segment?.payload.channel,
    },
    {
      body: { items: validItems, country, postalCode },
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        cookie,
      },
    },
  );

  return response.json();
};

export default action;
