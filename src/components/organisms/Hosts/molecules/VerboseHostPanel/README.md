# VerboseHostPanel

Side detail panel for viewing a `Host` resource and backend-owned host inventory data.

## Files

- `VerboseHostPanel.tsx`: detail card shell, metadata/spec rendering, binding/resource loading, bound AddressGroups tree, tag expansion, copyable IP tags, and expand/collapse controls.
- `index.ts`: public export.

## Displayed Data

The panel renders read-only values from the selected table row:

- `metadata.name` and `metadata.namespace`
- `spec.displayName`
- `spec.description` and `spec.comment`
- host metainfo such as host name, OS, platform, platform family, platform version, and kernel version
- IPv4 and IPv6 addresses
- `metadata.creationTimestamp`
- `metadata.labels` and `metadata.annotations`

`metadata.annotations` excludes Kubernetes client annotations with the `kubectl.kubernetes.io/` prefix. `Host.refs` is backend-computed data and is not displayed by this panel.

Host IPs and metainfo are backend-owned in this UI flow. The panel tolerates both current shapes while backend payloads are settling:

- `spec.IPs` or top-level `ips`
- `spec.metaInfo` or top-level `metaInfo`

## Tag Behavior

Long tag groups show the first five values and expose a show more/less control. Tags are stacked vertically in the verbose layout. IP tags are clickable and copy the selected address to the clipboard.

## Bound AddressGroups Tree

The `Bound Address Groups` tree is derived from current `HostBinding` resources and AddressGroup lookups.

Bindings are matched by comparing `binding.spec.host` with the current Host `metadata.name` and `metadata.namespace`. Each binding node shows the binding display name or metadata name when available, then resolves the target AddressGroup label from `spec.displayName` or metadata.

Missing AddressGroups render as `Not found`; failed lookups render as `Error while fetching`.

## Lifecycle

The parent table owns selection and visibility. The panel exposes `onClose`, `onExpand`, and `onCollapse` callbacks and switches the expand/collapse icon based on `DETAIL_PANEL_MIN_WIDTH`.
