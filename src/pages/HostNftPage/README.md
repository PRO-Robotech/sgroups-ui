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

When `watch=true`, the UI first fetches one non-watch snapshot to populate the current table, then opens the `watch=true` stream for subsequent `NftList` snapshots. Watch is enabled by default.

Each watch event is a full nftables table snapshot, not a row patch. The UI accepts raw `NftList` objects, Kubernetes-style watch events with the list under `object`, and `data:`-prefixed stream lines. The UI replaces the entire table for every received batch. Stopping the watch aborts the fetch stream.

## Display

The primary table renders one row per structured `nftables` JSON object when JSON is available:

- object type such as `TABLE`, `CHAIN`, `RULE`, or `SET`
- family, table, chain, hook, policy, and handle when those fields are present
- a compact details column for chain metadata and rule expression summaries

Each overview row can expand to show the raw object JSON. A collapsed `Ruleset` section below the table keeps the full text output from `nft list ruleset` and the full structured JSON output from `nft -j` available for troubleshooting.

If the backend returns text without parseable JSON, the table falls back to one text-only summary row for that ruleset.
