import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Device ID
   * @description Device ID to control (optional)
   */
  device_id?: string;
}

/**
 * @title Previous Track
 * @description Skip to the previous track in playback
 */
export default async function previous(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
  const { device_id } = props;

  const response = await ctx.client["POST /me/player/previous"]({
    device_id,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error skipping to previous track: ${response.status} - ${errorText}`,
    );
  }

  return { success: true };
}
