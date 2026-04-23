# VerboseRulePanel

Side detail panel for viewing a `Rule` resource, transport details, and resolved endpoint contents.

## Files

- `VerboseRulePanel.tsx`: detail card shell, metadata/spec rendering, async related-resource loading, source/destination endpoint trees, and expand/collapse controls.
- `contentsTree.tsx`: endpoint tree builder for AddressGroup, Service, CIDR, and FQDN endpoints.
- `index.ts`: public export.

## Displayed Data

The panel renders read-only values from the selected table row:

- `metadata.name` and `metadata.namespace`
- `spec.displayName`
- `spec.action`
- `spec.session.traffic`
- `spec.transport.protocol`
- `spec.transport.IPv`
- `spec.transport.entries`
- `spec.endpoints.local`
- `spec.endpoints.remote`
- `spec.description` and `spec.comment`
- `metadata.creationTimestamp`
- `metadata.labels` and `metadata.annotations`

Actions are shown as colored tags. Transport entries are flattened into readable tag strings.

## Endpoint Trees

The `Source` and `Destination` sections resolve endpoint contents from the current resource graph:

- `CIDR` and `FQDN` endpoints render as leaf values.
- `Service` endpoints resolve service transports directly.
- AddressGroup-style endpoints resolve AddressGroups, then expand matching Host, Network, and Service bindings.

Missing resources render as `Not found`; failed lookups render as `Error while fetching`.

## Lifecycle

The parent table owns selection and visibility. The panel exposes `onClose`, `onExpand`, and `onCollapse` callbacks and switches the expand/collapse icon based on `DETAIL_PANEL_MIN_WIDTH`.
