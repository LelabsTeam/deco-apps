import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";
import type { OrderForm } from "../../utils/types.ts";

export interface Item {
  quantity: number;
  index: number;
}

export interface Props {
  orderItems: Item[];
  allowedOutdatedData?: Array<"paymentData">;
  noSplitItem?: boolean;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items/update
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { vcsDeprecated } = ctx;
  const {
    orderItems,
    allowedOutdatedData = ["paymentData"],
    noSplitItem,
  } = props;
  const { orderFormId } = parseCookie(req.headers);
  const cookie = req.headers.get("cookie") ?? "";
  const segment = getSegmentFromBag(ctx);

  const { utm_campaign, utm_medium, utm_source } = segment?.payload ?? {};

  const response = await vcsDeprecated
    ["POST /api/checkout/pub/orderForm/:orderFormId/items/update"]({
      orderFormId,
      allowedOutdatedData,
      sc: segment?.payload.channel,
      utm_campaign,
      utm_medium,
      utm_source,
    }, {
      body: { orderItems, noSplitItem: Boolean(noSplitItem) },
      headers: {
        "content-type": "application/json",
        "accept": "application/json",
        cookie,
      },
    });

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;