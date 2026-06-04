# sgroups-ui

## Routes

The plugin has module table routes for the main `sgroups.io/v1alpha1` resources:

- `hosts`
- `services`
- `networks`
- `addressgroups`
- `rules`

Each table has internal detail links in the first `Display Name` column. Detail routes use immutable resource identifiers:

```txt
{plural}/{namespace}/{metadata.name}
```

Visible labels prefer `spec.displayName` and fall back to `metadata.name`. URLs, API requests, delete endpoints, and YAML/editor targets must continue to use `metadata.name`.

Resource nodes in modal overview trees and verbose-panel trees expose the same internal detail routes through a small link icon next to the resource badge. The icon uses the resolved resource namespace and immutable `metadata.name`; display names remain label-only.

Hosts also expose socket statistics and nftables rulesets as detail-page tabs:

```txt
hosts/{namespace}/{metadata.name}#sockstats
hosts/{namespace}/{metadata.name}#nft
```

The legacy `hosts/{namespace}/{metadata.name}/sockstats` path redirects to the same tab. The tab submits user-filled backend selectors to the Host `sockstats` subresource, defaults to `watch=true`, and runs the initial watch request on open. Watch events are full `SocketStatList` snapshots, so the UI replaces the whole table for every streamed batch.

The legacy `hosts/{namespace}/{metadata.name}/nft` path redirects to the `#nft` tab. The NFT tab reads the Host `nft` subresource, sends only the backend-supported `watch` query knob, defaults to `watch=true`, and replaces the whole table for every streamed `NftList` snapshot.

Detail pages are built from the shared namespaced resource factory in `src/pages/ResourceDetailsPage`. They include:

- breadcrumbs back to the module table, then the resource label and Details; tenant/namespace is not shown as a breadcrumb
- the shared resource info and metadata row
- labels and annotations cards/actions
- owner references when present
- conditions when present
- YAML

They intentionally do not include the generic Kubernetes Events tab.

## ⚙️ Configuration

This app can be configured through environment variables.

| Variable               | Type     | Description                                |
| ---------------------- | -------- | ------------------------------------------ |
| `BASEPREFIX`           | `string` | Base URL for the app. `/openapi-ui-plugin` |
| `CORS_ALLOWED_ORIGINS` | `string` | CORS allowed origins. Separated by comma   |

---

## 🤝 Contributing

[Check this out](./CONTRIBUTING.md)
