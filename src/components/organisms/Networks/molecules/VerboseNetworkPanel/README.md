# VerboseNetworkPanel

Side detail panel for viewing a `Network` resource and the AddressGroups currently bound to it.

## Files

- `VerboseNetworkPanel.tsx`: detail card shell, metadata/spec rendering, binding/resource loading, bound AddressGroups tree, tag expansion, and expand/collapse controls.
- `index.ts`: public export.

## Displayed Data

The panel renders read-only values from the selected table row:

- `metadata.name` and `metadata.namespace`
- `spec.displayName`
- `spec.CIDR`
- `spec.description` and `spec.comment`
- `metadata.creationTimestamp`
- `metadata.labels` and `metadata.annotations`

`metadata.annotations` excludes Kubernetes client annotations with the `kubectl.kubernetes.io/` prefix. `Network.refs` is backend-computed data and is not displayed by this panel.

Long tag groups show the first five values and expose a show more/less control. Tags are stacked vertically in the verbose layout.

## Bound AddressGroups Tree

The `Bound Address Groups` tree is derived from current `NetworkBinding` resources and AddressGroup lookups.

Bindings are matched by comparing `binding.spec.network` with the current Network `metadata.name` and `metadata.namespace`. Each binding node shows the binding display name or metadata name when available, then resolves the target AddressGroup label from `spec.displayName` or metadata.

Missing AddressGroups render as `Not found`; failed lookups render as `Error while fetching`.

Tree node keys are derived from the root `bound-address-groups-root` key, then from each binding node. Child status/group leaves extend the binding key so repeated binding names or fallback states do not collide in AntD Tree.

## Lifecycle

The parent table owns selection and visibility. The panel exposes `onClose`, `onExpand`, and `onCollapse` callbacks and switches the expand/collapse icon based on `DETAIL_PANEL_MIN_WIDTH`.
