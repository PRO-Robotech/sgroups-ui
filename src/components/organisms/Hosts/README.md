# Hosts

## Create modal

The bottom `Add Host` button opens `HostFormModal`.

The modal is based on the Figma form layout and uses Ant Design form controls:

- `Tenant`: required. Host namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: hidden. Create mode generates a UUID value for `metadata.name` and keeps it in the form store for submit.
- `Display name`: optional, max 63 chars. Uses the shared hostname-label validator: letters, numbers, hyphens, and optional dots; a dot is not required. Create mode is prefilled with `hosts-`.
- `Address group`: optional multi-select. Disabled until the Host namespace is known. Options are fetched only from the Host namespace. Visible labels and search text use `spec.displayName` without repeating the namespace, falling back to the AddressGroup name only when no display name exists. Values are stored as `namespace/name`.
- Namespace-scoped AddressGroup responses may omit `metadata.namespace`; the modal applies the Host namespace before building options so selected tags render badge labels instead of raw `namespace/name` values.
- `Description`: optional.
- `Comment`: optional.

## API flow

The save flow creates the main resource first:

```ts
Host
```

Then it creates one binding per selected AddressGroup:

```ts
HostBinding
```

Each binding:

- is created in the Host namespace
- points `spec.host` to the current Host name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

The UI does not write `Host.refs`. Treat it as computed/read-only backend data.

The modal structure overview is derived from the selected AddressGroups and the current host/service/network binding graph. Selected AddressGroups are filtered to the Host namespace before rendering or submit, then grouped by namespace first. Each AddressGroup child reuses the AddressGroup contents tree builder so the sidebar reflects the same structure as other flows.

Overview tree keys are parent-derived and prefixed with the namespace and selected AddressGroup overview node keys, so repeated resources remain unique in AntD Tree.

Modal and verbose-panel trees start collapsed by default. Avoid `defaultExpandAll` and `defaultExpandedKeys` unless a specific flow needs initial expansion.

AddressGroup nodes in the overview and verbose-panel trees include a small detail-link icon next to the badge. The link target uses the AddressGroup namespace and immutable `metadata.name`; `spec.displayName` is only the visible label.

## Table display

- `Display Name` is the first pinned column and renders a canonical `Host` badge. It shows `spec.displayName`, falling back to `metadata.name` only when the display name is empty.
- The `Display Name` value links to the Host detail page at `hosts/{namespace}/{metadata.name}`. The link text uses the display name, but the URL uses immutable identifiers.
- `Name` is intentionally hidden from the table, but remains in row data for edit/delete endpoints.
- `Tenant` renders a canonical `Tenant` badge.

## Detail page

The Host detail page keeps the shared resource-detail header, actions menu, upper resource info/metadata row, conditions section, and YAML editor, but uses a Host-specific `SgroupsHostDetailsSection` for the resource-specific Details-tab content below that row.

The shared factory row owns creation time, namespace, owner references, labels, and annotations. `SgroupsHostDetailsSection` renders only Host-specific cards:

- `Main`: hostname, UID, IPv4/IPv6 counts, description, and comment.
- `Meta info`: backend-owned host metadata such as OS, platform, platform version, kernel, and optional platform family.

Host IPs and metainfo are read-only in this view. Reads tolerate both the local OpenAPI shape under `spec.IPs` / `spec.metaInfo` and the legacy flattened `ips` / `metaInfo` payload.

The detail section does not render a Figma `Assignments` card. AddressGroup membership is edited through `HostFormModal` from table actions; labels and annotations are edited through the shared factory metadata cards.

## Edit modal

The table `Actions` column uses the same compact three-dot dropdown pattern as `openapi-ui`. Edit and delete are menu items inside that row dropdown.

Edit opens the same `HostFormModal` for a selected Host by passing it as the optional `host` prop.

In edit mode:

- `Tenant` and `Name` are hidden immutable identifiers because they identify the resource endpoint.
- `Display name`, `Description`, and `Comment` are editable and saved with toolkit patch helpers.
- The edit modal header prefers `spec.displayName` and falls back to `metadata.name`.
- Edit save patches only changed fields. Optional string fields are deleted with `patchEntryWithDeleteOp` when cleared, and changed values are saved with `patchEntryWithReplaceOp`.
- AddressGroup membership is initialized from existing `HostBinding` resources and remains editable.
- AddressGroup namespace is the Host namespace.
- Existing `HostBinding` matching tolerates omitted `spec.host.namespace` by falling back to the binding namespace.
- Changing the Host namespace clears the current AddressGroup selection.
- Removing a selected AddressGroup deletes the corresponding binding.
- Adding a selected AddressGroup creates the corresponding binding in the Host namespace.
- If no editable field changed and no binding changed, no update request is sent.

## Delete modal

The table delete action opens `SgroupsDeleteModal`, a local wrapper around the toolkit delete request behavior.

The modal title renders `Delete`, a canonical `Tenant` badge with the row namespace, then a canonical `Host` badge with `spec.displayName` falling back to `metadata.name`.

The delete endpoint is built from the selected row `metadata.namespace` and `metadata.name`:

```ts
;/api/celrsstu / { cluster } / k8s / apis / sgroups.io / v1alpha1 / namespaces / { namespace } / hosts / { name }
```

If the row namespace is missing, the current screen namespace is used as a fallback.

## Data shape notes

The implementation follows the local `v2` OpenAPI dump for `sgroups.io/v1alpha1` resources.

- Treat host IPs and metainfo as backend-owned data for this modal flow. The modal does not edit them.
- The local docs place these fields under `spec`:
  - `Host.spec.IPs`
  - `Host.spec.metaInfo`
- The current UI normalizes host reads so details/overview continue to work if payloads arrive either under `spec` or flattened at top level.

## Modal lifecycle

- AntD modals must set `maskClosable={false}`. Users should close modals only with the Cancel button or the close icon.
- The modal is conditionally rendered only while open, and the parent gives each open cycle a fresh React `key`, so closing and reopening mounts a new modal instance.
- That hard reset is intentional. It clears component state and hooks outside the AntD `<Modal>` subtree, which `destroyOnHidden` alone does not reset.
- Edit prefill waits for existing `HostBinding` resources and AddressGroup options before setting selected AddressGroups, so edit tags render with the same badge labels as create selections. Structure Overview graph lookups do not block the modal after initialization; the sidebar renders from currently available data.

## Schema source

Use the local `v2` and `v3sgroups` OpenAPI dumps for the Kubernetes resource shape. For field validation gaps not emitted into the OpenAPI schema, use the extracted backend sources in `tmp`.

Relevant fields:

- `Host.spec.displayName`
- `Host.spec.description`
- `Host.spec.comment`
- `Host.spec.IPs`
- `Host.spec.metaInfo`
- `HostBinding.spec.addressGroup`
- `HostBinding.spec.host`

Validation notes:

- `Host.metadata.name` and `Host.metadata.namespace` follow the backend resource-name regex: lower-case alphanumeric or `-`, start/end with alphanumeric, max 63 chars.
- `Host.spec.displayName` is limited to 63 characters by the backend `DisplayName` validator and the UI validates it with the shared hostname-label rule without requiring a dot.
- `Host.spec.description` and `Host.spec.comment` are strings in the local OpenAPI dump and currently have no stricter documented limits.
