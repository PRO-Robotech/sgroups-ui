# VerboseRulePanel

Side detail panel for viewing a `Rule` resource, transport details, and resolved endpoint contents.

## Files

- `VerboseRulePanel.tsx`: detail card shell, metadata/spec rendering, async related-resource loading, source/destination endpoint trees, and expand/collapse controls.
- `contentsTree.tsx`: endpoint tree builder for AddressGroup, Service, CIDR, and FQDN endpoints.
- `index.ts`: public export.

## Displayed Data

The panel renders read-only values from the selected table row:

- `metadata.name` in the panel title
- `metadata.namespace`
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

`metadata.annotations` excludes Kubernetes client annotations with the `kubectl.kubernetes.io/` prefix.

Actions are shown as colored tags. Transport entries are shown as tags; entry descriptions and comments are shown in tooltips instead of inline tag text.

Long tag groups show the first five values and expose a show more/less control. Tags are stacked vertically in the verbose layout.

## Endpoint Trees

The `Source` and `Destination` sections resolve endpoint contents from the current resource graph:

- `CIDR` and `FQDN` endpoints render as leaf values.
- `Service` endpoints resolve service transports directly.
- AddressGroup-style endpoints resolve AddressGroups, then expand matching Host, Network, and Service bindings.

AddressGroup endpoint branches group matched Hosts, Networks, and Services by the target resource namespace before rendering individual binding/resource nodes. Binding nodes render with resource badges (`HostBinding`, `NetworkBinding`, or `ServiceBinding`) and then expand to the resolved Host, Network, or Service resource badge and details.

Service transport leaves in endpoint trees keep only ports/types visible. If an entry has a description or comment, those details are attached to the leaf tooltip.

Missing resources render as `Not found`; failed lookups render as `Error while fetching`.

Tree node keys are parent-derived. Service transport entries extend the service endpoint or binding resource key, and AddressGroup endpoint branches extend `address-group-endpoint` through Hosts, Networks, Services, namespace groups, bindings, resources, transports, and leaves. This keeps keys unique when the same endpoint tree is rendered beside another tree or embedded in the UniRule Structure Overview.

The UniRule form wraps this endpoint tree for editable overviews. When an edit changes the Local or Remote endpoint, the wrapper highlights the changed endpoint root; the verbose read-only panel itself does not apply pending-change highlights.

## Lifecycle

The parent table owns selection and visibility. The panel exposes `onClose`, `onExpand`, and `onCollapse` callbacks and switches the expand/collapse icon based on `DETAIL_PANEL_MIN_WIDTH`.
