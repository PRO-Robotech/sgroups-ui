# VerboseAddressGroupPanel

Side detail panel for viewing an `AddressGroup` resource, its computed refs, and the resources bound to it.

## Files

- `VerboseAddressGroupPanel.tsx`: detail card shell, metadata/spec rendering, async related-resource loading, and expand/collapse controls.
- `contentsTree.tsx`: host, network, and service binding tree builder.
- `index.ts`: public export.

## Displayed Data

The panel renders read-only values from the selected table row:

- `metadata.name` and `metadata.namespace`
- `spec.displayName`
- `spec.defaultAction`
- `spec.logs` and `spec.trace`
- `spec.description` and `spec.comment`
- `metadata.creationTimestamp`
- `metadata.labels` and `metadata.annotations`
- computed `refs`

`AddressGroup.refs` is displayed only as backend-computed data. This panel must not treat refs as editable source data.

## Bound Entities Tree

The `Entities` tree is derived from current binding resources and resource lookups:

- `HostBinding` plus `Host` data for bound hosts and IP children.
- `NetworkBinding` plus `Network` data for bound networks and CIDR children.
- `ServiceBinding` plus `Service` data for bound services and transport children.

Bindings are matched by `spec.addressGroup.name` and `spec.addressGroup.namespace`. Missing resources render as `Not found`; failed lookups render as `Error while fetching`.

## Lifecycle

The parent table owns selection and visibility. The panel exposes `onClose`, `onExpand`, and `onCollapse` callbacks and switches the expand/collapse icon based on `DETAIL_PANEL_MIN_WIDTH`.
