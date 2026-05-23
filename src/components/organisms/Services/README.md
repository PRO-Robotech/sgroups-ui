# Services

## Create modal

The bottom `Add Service` button opens `ServiceFormModal`.

The modal follows the Figma layout structure, but the payload and editable fields follow the local `v2` `sgroups.io/v1alpha1` schema:

- `Namespace`: required. Service namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: hidden. Create mode generates a UUID value for `metadata.name` and keeps it in the form store for submit.
- `Display name`: optional, max 63 chars. Uses the shared hostname-label validator: letters, numbers, hyphens, and optional dots; a dot is not required. Create mode is prefilled with `services-`.
- `Address group`: optional multi-select Cascader. The first level is namespace and the second level is AddressGroup. AddressGroups can be selected from any namespace; each namespace branch is loaded only when needed. Selected tags include a canonical `Namespace` badge and `AddressGroup` badge. Values are stored as `namespace/name`.
- Namespace-scoped AddressGroup responses may omit `metadata.namespace`; the modal applies the Cascader branch namespace before building options so selected tags render badge labels instead of raw `namespace/name` values.
- `Description`: optional.
- `Comment`: optional.
- `Transports`: UI-friendly repeated entries that are normalized into `spec.transports` at submit time.

## API flow

The save flow creates the main resource first:

```ts
Service
```

Then it creates one binding per selected AddressGroup:

```ts
ServiceBinding
```

Each binding:

- is created in the selected Service namespace
- points `spec.service` to the current Service name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

The UI does not write a refs-like field on Service. AddressGroup membership is managed through `ServiceBinding` resources.

The modal Structure Overview is derived from selected AddressGroups and the current binding graph. Selected AddressGroups can span namespaces and are grouped by namespace first. Overview tree keys are parent-derived and prefixed with the namespace and selected AddressGroup overview node keys, so repeated resources remain unique in AntD Tree.

Modal and verbose-panel trees start collapsed by default. Avoid `defaultExpandAll` and `defaultExpandedKeys` unless a specific flow needs initial expansion.

## Table display

The Services table keeps transport display aligned with verbose panels:

- `Display Name` is the first pinned column and renders a canonical `Service` badge. It shows `spec.displayName`, falling back to `metadata.name` only when the display name is empty.
- The `Display Name` value links to the Service detail page at `services/{namespace}/{metadata.name}`. The link text uses the display name, but the URL uses immutable identifiers.
- `Name` is intentionally hidden from the table, but remains in row data for edit/delete endpoints.
- `Namespace` renders a canonical `Namespace` badge.
- `Protocols` and `IP Families` values render as AntD tags.
- Transport entries render one tag per entry in the `Entries` column.
- Entry descriptions and comments are shown in tooltips instead of inline tag text.

## Edit modal

The table actions column includes edit and delete actions.

Edit opens the same `ServiceFormModal` for a selected Service by passing it as the optional `service` prop.

In edit mode:

- `Namespace` and `Name` are hidden immutable identifiers because they identify the resource endpoint.
- The edit modal header prefers `spec.displayName` and falls back to `metadata.name`.
- The modal does not use PUT.
- Edit save patches only changed fields and patches `spec.transports`.
- Optional string fields are deleted with `patchEntryWithDeleteOp` when cleared.
- Changed values are saved with `patchEntryWithReplaceOp`.
- AddressGroup membership is initialized from existing `ServiceBinding` resources and remains editable.
- AddressGroup Cascader branches are lazy-loaded by namespace.
- Changing or expanding one AddressGroup namespace does not clear selections from other namespaces.
- Removing a selected AddressGroup deletes the corresponding binding.
- Adding a selected AddressGroup creates the corresponding binding in the Service namespace.
- If no editable field changed and no binding changed, no update request is sent.

## Delete modal

The table delete action opens `SgroupsDeleteModal`, a local wrapper around the toolkit delete request behavior.

The modal title renders `Delete`, a canonical `Namespace` badge with the row namespace, then a canonical `Service` badge with `spec.displayName` falling back to `metadata.name`.

The delete endpoint is built from the selected row `metadata.namespace` and `metadata.name`:

```ts
;/api/celrsstu / { cluster } / k8s / apis / sgroups.io / v1alpha1 / namespaces / { namespace } / services / { name }
```

If the row namespace is missing, the current screen namespace is used as a fallback.

## Modal lifecycle

- The modal is conditionally rendered only while open, so closing it fully unmounts the component and reopening mounts a fresh instance.
- Segmented content reads and submits the full form store, not only the currently visible panel fields.
- Transport data is kept UI-friendly in the form and normalized back to `spec.transports` only at submit time.
- Edit prefill initializes selected AddressGroups from existing `ServiceBinding` resources. Cascader branches are loaded as needed so tags render with namespace and AddressGroup badges. Structure Overview graph lookups do not block the modal after initialization; the sidebar renders from currently available data.

## Schema source

Use the local `v2` and `v3sgroups` OpenAPI dumps for the Kubernetes resource shape. For field validation gaps not emitted into the OpenAPI schema, use the extracted backend sources in `tmp`.

Relevant fields:

- `Service.spec.displayName`
- `Service.spec.description`
- `Service.spec.comment`
- `Service.spec.transports`
- `ServiceBinding.spec.addressGroup`
- `ServiceBinding.spec.service`

Validation notes:

- `Service.metadata.name` and `Service.metadata.namespace` follow the backend resource-name regex: lower-case alphanumeric or `-`, start/end with alphanumeric, max 63 chars.
- `Service.spec.displayName` is limited to 63 characters by the backend `DisplayName` validator and the UI validates it with the shared hostname-label rule without requiring a dot.
- `Service.spec.transports[].IPv` must be `IPv4` or `IPv6`.
- `Service.spec.transports[].protocol` must be `TCP`, `UDP`, or `ICMP`.
- `TCP` and `UDP` transport entries require one or more ports or port ranges.
- `ICMP` transport entries accept numeric types from `0` to `255`.
- `Service.spec.description` and `Service.spec.comment` are strings in the local OpenAPI dump and currently have no stricter documented limits.
