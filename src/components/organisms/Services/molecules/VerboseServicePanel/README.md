# VerboseServicePanel

Side detail panel for viewing a `Service` resource, transport configuration, and computed refs.

## Files

- `VerboseServicePanel.tsx`: detail card shell, metadata/spec rendering, transport formatting, tag expansion, related refs, and expand/collapse controls.
- `index.ts`: public export.

## Displayed Data

The panel renders read-only values from the selected table row:

- `metadata.name` and `metadata.namespace`
- `spec.displayName`
- `spec.description` and `spec.comment`
- `metadata.creationTimestamp`
- `metadata.labels` and `metadata.annotations`
- `spec.transports`
- computed `refs`

`Service.refs` is displayed only as backend-computed data. AddressGroup membership for Services is managed through `ServiceBinding` resources elsewhere.

## Transport Display

Each transport is formatted as `protocol / IP family` with entry details for ports, ICMP types, description, and comment. Empty transports render a readable fallback instead of exposing raw payload shape.

Long tag groups show the first five values and expose a show more/less control.

## Lifecycle

The parent table owns selection and visibility. The panel exposes `onClose`, `onExpand`, and `onCollapse` callbacks and switches the expand/collapse icon based on `DETAIL_PANEL_MIN_WIDTH`.
