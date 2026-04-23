# VerboseHostPanel

Side detail panel for viewing a `Host` resource and backend-owned host inventory data.

## Files

- `VerboseHostPanel.tsx`: detail card shell, metadata/spec rendering, tag expansion, copyable IP tags, and expand/collapse controls.
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
- computed `refs`

Host IPs and metainfo are backend-owned in this UI flow. The panel tolerates both current shapes while backend payloads are settling:

- `spec.IPs` or top-level `ips`
- `spec.metaInfo` or top-level `metaInfo`

## Tag Behavior

Long tag groups show the first five values and expose a show more/less control. IP tags are clickable and copy the selected address to the clipboard.

## Data Ownership

`Host.refs` is displayed only as backend-computed data. AddressGroup membership for Hosts is managed through `HostBinding` resources elsewhere, not by editing refs from this panel.

## Lifecycle

The parent table owns selection and visibility. The panel exposes `onClose`, `onExpand`, and `onCollapse` callbacks and switches the expand/collapse icon based on `DETAIL_PANEL_MIN_WIDTH`.
