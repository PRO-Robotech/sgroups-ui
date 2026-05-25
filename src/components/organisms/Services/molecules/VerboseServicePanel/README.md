# VerboseServicePanel

Side detail panel for viewing a `Service` resource, transport configuration, and the AddressGroups currently bound to it.

## Files

- `VerboseServicePanel.tsx`: detail card shell, metadata/spec rendering, transport formatting, binding/resource loading, bound AddressGroups tree, tag expansion, and expand/collapse controls.
- `index.ts`: public export.

## Displayed Data

The panel renders read-only values from the selected table row:

- `spec.displayName` in the panel title, falling back to `metadata.name` when the display name is empty
- `metadata.namespace`
- `spec.description` and `spec.comment`
- `metadata.creationTimestamp`
- `metadata.labels` and `metadata.annotations`
- `spec.transports`

`metadata.annotations` excludes Kubernetes client annotations with the `kubectl.kubernetes.io/` prefix. `Service.refs` is backend-computed data and is not displayed by this panel.

`spec.displayName` is not repeated as a separate detail row because it is already the panel title.

## Transport Display

Each transport is grouped under a `protocol / IP family` heading. Port and ICMP type entries render as tags. Entry descriptions and comments are shown in tooltips instead of inline tag text. Empty transports render a readable fallback instead of exposing raw payload shape.

Long tag groups show the first five values and expose a show more/less control. Tags are stacked vertically in the verbose layout.

## Bound AddressGroups Tree

The `Bound Address Groups` tree is derived from current `ServiceBinding` resources and AddressGroup lookups.

The section subtitle includes the bound AddressGroup count. The AntD tree starts from AddressGroup namespace nodes instead of rendering a duplicate `Bound Address Groups` root row.

Bindings are matched by comparing `binding.spec.service` with the current Service `metadata.name` and `metadata.namespace`. Matching bindings are grouped by `spec.addressGroup.namespace`. Under each namespace node, each child shows the resolved AddressGroup label from `spec.displayName`, falling back to `metadata.name` only when no display name exists.

Missing AddressGroups render as `Not found`; failed lookups render as `Error while fetching`.

Tree node keys are derived from the `bound-address-groups-root` prefix, the namespace node, and each binding/resource node. Child status leaves extend the binding key so repeated binding names or fallback states do not collide in AntD Tree.

Resolved AddressGroup nodes include a small detail-link icon next to the badge. The link uses the AddressGroup namespace and immutable `metadata.name`, not the display label.

The bound AddressGroups tree starts collapsed by default. Do not set `defaultExpandAll` or `defaultExpandedKeys` unless a specific detail view needs initial expansion.

## Lifecycle

The parent table owns selection and visibility. The panel exposes `onClose`, `onExpand`, and `onCollapse` callbacks and switches the expand/collapse icon based on `DETAIL_PANEL_MIN_WIDTH`.
