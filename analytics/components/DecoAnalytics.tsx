import { Head } from "$fresh/runtime.ts";
import { useScriptAsDataURI } from "@deco/deco/hooks";
export interface Props {
  /**
   * @description paths to be excluded.
   */
  exclude?: string;
  domain?: string;
}
declare global {
  interface Window {
    plausible: (name: string, params: {
      props: Record<string, string | boolean>;
    }) => void;
  }
}
// This function should be self contained, because it is stringified!
const snippet = (() => {
  // @ts-ignore untyped globalThis var
  globalThis.plausibleInitialized = false;
  return () => {
    // @ts-ignore untyped globalThis var
    if (globalThis.plausibleInitialized) return;
    // @ts-ignore untyped globalThis var
    globalThis.plausibleInitialized = true;

    // Flags and additional dimensions
    const props: Record<string, string> = {};
    const trackPageview = () =>
      globalThis.window.plausible?.("pageview", { props });

    // Attach pushState and popState listeners
    const originalPushState = history.pushState;
    if (originalPushState) {
      history.pushState = function () {
        // @ts-ignore monkey patch
        originalPushState.apply(this, arguments);
        trackPageview();
      };
      addEventListener("popstate", trackPageview);
    }

    // 2000 bytes limit
    const truncate = (str: string) => `${str}`.slice(0, 990);

    // setup plausible script and unsubscribe
    globalThis.window.DECO.events.subscribe((event) => {
      if (!event || event.name !== "deco") {
        return;
      }
      if (event.params) {
        const { flags, page } = event.params;
        if (Array.isArray(flags)) {
          for (const flag of flags) {
            props[flag.name] = truncate(flag.value.toString());
          }
        }
        props["pageId"] = truncate(`${page.id}`);
      }
      trackPageview();
    })();

    globalThis.window.DECO.events.subscribe((event) => {
      if (!event) {
        return;
      }
      const { name, params } = event;
      if (!name || !params || name === "deco") {
        return;
      }
      const values = { ...props };
      for (const key in params) {
        // @ts-expect-error somehow typescript bugs
        const value = params[key];
        if (value !== null && value !== undefined) {
          values[key] = truncate(
            typeof value !== "object" ? value : JSON.stringify(value),
          );
        }
      }
      globalThis.window.plausible?.(name, { props: values });
    });
  };
})();
function Component({ exclude, domain }: Props) {
  return (
    <Head>
      <link rel="dns-prefetch" href="https://plausible.io/api/event" />
      <link
        rel="preconnect"
        href="https://plausible.io/api/event"
        crossOrigin="anonymous"
      />
      <script
        defer
        data-domain={domain}
        data-exclude={`${"/proxy" + (exclude ? "," + exclude : "")}`}
        data-api="https://plausible.io/api/event"
        src="https://plausible.io/js/script.manual.js"
      />
      <script defer src={useScriptAsDataURI(snippet)} />
    </Head>
  );
}
export default Component;
