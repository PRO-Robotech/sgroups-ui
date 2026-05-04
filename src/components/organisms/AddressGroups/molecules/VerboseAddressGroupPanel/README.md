# VerboseAddressGroupPanel

Side detail panel for viewing an `AddressGroup` resource and the resources bound to it.

## Files

- `VerboseAddressGroupPanel.tsx`: detail card shell, metadata/spec rendering, async related-resource loading, and expand/collapse controls.
- `contentsTree.tsx`: host, network, and service binding tree builder.
- `index.ts`: public export.

## Displayed Data

The panel renders read-only values from the selected table row:

- `metadata.name` and `spec.defaultAction` in the panel title
- `metadata.namespace`
- `spec.displayName`
- `spec.logs` and `spec.trace`
- `spec.description` and `spec.comment`
- `metadata.creationTimestamp`
- `metadata.labels` and `metadata.annotations`

`metadata.annotations` excludes Kubernetes client annotations with the `kubectl.kubernetes.io/` prefix. `AddressGroup.refs` is backend-computed data and is not displayed by this panel.

Tags are stacked vertically in the verbose layout.

## Bound Entities Tree

The `Entities` tree is derived from current binding resources and resource lookups:

- `HostBinding` plus `Host` data for bound hosts and IP children.
- `NetworkBinding` plus `Network` data for bound networks and CIDR children.
- `ServiceBinding` plus `Service` data for bound services and transport children.

Service transport leaves keep only ports/types visible. If an entry has a description or comment, those details are attached to the leaf tooltip.

Bindings are matched by `spec.addressGroup.name` and `spec.addressGroup.namespace`. Inside the Hosts, Networks, and Services branches, matched resources are grouped by the target resource namespace before rendering the individual Host, Network, or Service child nodes. Missing resources render as `Not found`; failed lookups render as `Error while fetching`.

Tree node keys are built from their parent key, including the namespace grouping layer. When this builder is reused inside another Structure Overview, callers pass the overview node key as a prefix so repeated namespace groups, Hosts, Networks, Services, transports, and empty/error leaves stay unique across the full AntD Tree.

The shared tree builder accepts highlighted Host, Network, and Service value lists. Modal overviews use this to mark pending edit additions with a subtle green background and left accent without changing the saved binding data.

## Lifecycle

The parent table owns selection and visibility. The panel exposes `onClose`, `onExpand`, and `onCollapse` callbacks and switches the expand/collapse icon based on `DETAIL_PANEL_MIN_WIDTH`.
