// DO NOT EDIT. This file is generated by deco.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $$$$$$$$$0 from "./actions/batchUpdateValues.ts";
import * as $$$$$$$$$1 from "./actions/createSpreadsheet.ts";
import * as $$$$$$$$$2 from "./actions/oauth/callback.ts";
import * as $$$$$$$$$3 from "./actions/updateValues.ts";
import * as $$$0 from "./loaders/getBatchValues.ts";
import * as $$$1 from "./loaders/getSpreadsheet.ts";
import * as $$$2 from "./loaders/getValues.ts";
import * as $$$3 from "./loaders/oauth/start.ts";

const manifest = {
  "loaders": {
    "google-sheets/loaders/getBatchValues.ts": $$$0,
    "google-sheets/loaders/getSpreadsheet.ts": $$$1,
    "google-sheets/loaders/getValues.ts": $$$2,
    "google-sheets/loaders/oauth/start.ts": $$$3,
  },
  "actions": {
    "google-sheets/actions/batchUpdateValues.ts": $$$$$$$$$0,
    "google-sheets/actions/createSpreadsheet.ts": $$$$$$$$$1,
    "google-sheets/actions/oauth/callback.ts": $$$$$$$$$2,
    "google-sheets/actions/updateValues.ts": $$$$$$$$$3,
  },
  "name": "google-sheets",
  "baseUrl": import.meta.url,
};

export type Manifest = typeof manifest;

export default manifest;
