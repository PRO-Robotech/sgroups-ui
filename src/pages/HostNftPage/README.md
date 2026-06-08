# Host NFT

`SgroupsHostNftTab` renders the `Host` nftables ruleset subresource inside the Host detail page:

```txt
hosts/{namespace}/{metadata.name}#nft
```

The tab uses immutable Host identifiers from the detail factory. It does not select a Host from form state.

`HostNftPage` remains as a compatibility wrapper for the legacy route shape, but `AppInner` redirects `hosts/{namespace}/{metadata.name}/nft` to `hosts/{namespace}/{metadata.name}#nft`.

## Backend endpoint

Requests go through the same cluster proxy path as the rest of the plugin:

```txt
/api/clusters/{cluster}/k8s/apis/sgroups.io/v1alpha1/namespaces/{namespace}/hosts/{name}/nft
```

This maps to the backend raw path:

```txt
/apis/sgroups.io/v1alpha1/namespaces/{namespace}/hosts/{name}/nft
```

The backend OpenAPI spec exposes only the `watch` query knob for this subresource. The UI does not send selectors.

## Watch

When `watch=true`, the UI first fetches one non-watch snapshot to populate the current view, then opens the `watch=true` stream for subsequent `NftList` snapshots. Watch is enabled by default.

Each watch event is a full nftables snapshot, not a row patch. The UI accepts raw `NftList` objects, Kubernetes-style watch events with the list under `object`, and `data:`-prefixed stream lines. The UI replaces the displayed plain response or structure view from the latest complete snapshot. Stopping the watch aborts the fetch stream.

## Display

The NFT tab uses `Plain` / `Structure` tabs. `Plain` is the default. It renders the latest backend text response in a readonly Monaco editor with a lightweight custom `nftables` syntax highlighter. If the backend payload has no `items[].text`, the plain view falls back to formatted JSON for the latest `NftList`.

The `Structure` view is mounted only after the user switches to the `Structure` tab. Tabs are left uncontrolled so AntD can update the active tab indicator immediately on click without waiting for this component to re-render. Replacing Monaco and computing structure rows are deferred to later frames, and a standalone spinner occupies the content area while rows are prepared. This avoids building and mounting the structured view while users stay in the default plain response view.

The `Structure` view uses a small local virtual scroller, so large nftables snapshots only mount the visible table, chain, rule, and loose object rows. It uses precomputed row heights by item type and compact chain rows when a chain has no hook, policy, or detail metadata. The scroller renders an overscanned slice inside a full-height spacer and keeps wheel scrolling and scrollbar dragging on the same code path. The hierarchy and rule expression labels are prepared before rendering the list, and the flattened virtual items are memoized so scrolling does not repeatedly parse nftables expression objects. Rule rows include their chain label so they remain understandable when scrolled into the middle of a large chain.

When the `Structure` view is active, it renders structured `nftables` JSON as a compact hierarchy:

- tables at the top level
- chains nested inside their table
- rules nested inside their chain
- sets, flowtables, and ungrouped objects shown alongside the closest table when possible
- family, table, chain, hook, and policy when those fields are present
- additional object fields rendered as readable label/value sections

Rule expressions are rendered as readable selector/action lines such as `ip.saddr == 10.0.0.1`, `tcp.dport == 443`, `meta.l4proto == tcp`, `accept`, `Match extension: comment`, `Count traffic: 10 packets, 2048 bytes`, and `Jump to SGROUPS-ALLOW`, instead of exposing internal expression object names like `match -> xt -> counter -> jump`.
Rule rows are compact horizontal rows with a rounded `RULE` badge and categorized expression chips on the same line when space allows.

The structure view does not expose raw JSON by default; fields are presented in user-facing sections.

If the backend returns text without parseable JSON, the structure view falls back to one text-only summary item for that ruleset.

The content area is replaced by a standalone loading spinner while the current request has no resolved response yet. Once the backend response has been converted, a real empty response renders as empty Monaco JSON in `Plain` or an empty structure state after switching to `Structure`.
