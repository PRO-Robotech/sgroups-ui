# Networks

## Create modal

The bottom `Add Network` button opens `NetworkFormModal`.

The modal is based on the Figma form layout and uses Ant Design form controls:

- `Namespace`: required. Network namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: hidden. Create mode generates a UUID value for `metadata.name` and keeps it in the form store for submit.
- `Display name`: optional, max 63 chars. Uses the shared hostname-label validator: letters, numbers, hyphens, and optional dots; a dot is not required. Create mode is prefilled with `networks-`.
- `Address group`: optional multi-select. Disabled until the Network namespace is known. Options are fetched only from the Network namespace. Visible labels and search text use `spec.displayName` without repeating the namespace, falling back to the AddressGroup name only when no display name exists. Values are stored as `namespace/name`.
- Namespace-scoped AddressGroup responses may omit `metadata.namespace`; the modal applies the Network namespace before building options so selected tags render badge labels instead of raw `namespace/name` values.
- `CIDR`: required. The form validates CIDR shape and requires a network address with zero host bits, for example `10.0.0.0/8` or `2001:db8::/64`.
- `Description`: optional.
- `Comment`: optional.

## API flow

The save flow creates the main resource first:

```ts
Network
```

Then it creates one binding per selected AddressGroup:

```ts
NetworkBinding
```

Each binding:

- is created in the Network namespace
- points `spec.network` to the current Network name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

The UI does not write `Network.refs`. Treat it as computed/read-only backend data.

The modal structure overview is derived from the selected AddressGroups and the current host/service/network binding graph. Selected AddressGroups are filtered to the Network namespace before rendering or submit, then grouped by namespace first. Each AddressGroup child reuses the AddressGroup contents tree builder so the sidebar reflects the same structure as other flows.

Overview tree keys are parent-derived and prefixed with the namespace and selected AddressGroup overview node keys, so repeated resources remain unique in AntD Tree.

Modal and verbose-panel trees start collapsed by default. Avoid `defaultExpandAll` and `defaultExpandedKeys` unless a specific flow needs initial expansion.

AddressGroup nodes in the overview and verbose-panel trees include a small detail-link icon next to the badge. The link target uses the AddressGroup namespace and immutable `metadata.name`; `spec.displayName` is only the visible label.

## Table display

- `Display Name` is the first pinned column and renders a canonical `Network` badge. It shows `spec.displayName`, falling back to `metadata.name` only when the display name is empty.
- The `Display Name` value links to the Network detail page at `networks/{namespace}/{metadata.name}`. The link text uses the display name, but the URL uses immutable identifiers.
- `Name` is intentionally hidden from the table, but remains in row data for edit/delete endpoints.
- `Namespace` renders a canonical `Namespace` badge.

## Detail page

The Network detail page uses the local `SgroupsNetworkDetailsSection` injected into the shared factory renderer. It follows the Figma card structure with `Info`, `Assignments`, and `Main` sections:

- `Info`: creation time, namespace, owner refs.
- `Assignments`: editable AddressGroup, label, and annotation counters.
- `Main`: `spec.CIDR`, `spec.description`, and `spec.comment`.

AddressGroup edits from the detail page are saved through `NetworkBinding` resources in the Network namespace. The detail page does not write computed `refs`.

## Edit modal

The table actions column includes edit and delete actions.

Edit opens the same `NetworkFormModal` for a selected Network by passing it as the optional `network` prop.

In edit mode:

- `Namespace` and `Name` are hidden immutable identifiers because they identify the resource endpoint.
- `Display name`, `CIDR`, `Description`, and `Comment` are editable and saved with toolkit patch helpers.
- The edit modal header prefers `spec.displayName` and falls back to `metadata.name`.
- Edit save patches only changed fields. Optional string fields are deleted with `patchEntryWithDeleteOp` when cleared, and changed values are saved with `patchEntryWithReplaceOp`.
- `CIDR` is validated as a network CIDR and patched only when its trimmed value actually changed.
- AddressGroup membership is initialized from existing `NetworkBinding` resources and remains editable.
- AddressGroup namespace is the Network namespace.
- Changing the Network namespace clears the current AddressGroup selection.
- Removing a selected AddressGroup deletes the corresponding binding.
- Adding a selected AddressGroup creates the corresponding binding in the Network namespace.
- If no editable field changed and no binding changed, no update request is sent.

## Delete modal

The table delete action opens `SgroupsDeleteModal`, a local wrapper around the toolkit delete request behavior.

The modal title renders `Delete`, a canonical `Namespace` badge with the row namespace, then a canonical `Network` badge with `spec.displayName` falling back to `metadata.name`.

The delete endpoint is built from the selected row `metadata.namespace` and `metadata.name`:

```ts
;/api/celrsstu / { cluster } / k8s / apis / sgroups.io / v1alpha1 / namespaces / { namespace } / networks / { name }
```

If the row namespace is missing, the current screen namespace is used as a fallback.

## Modal lifecycle

- AntD modals must set `maskClosable={false}`. Users should close modals only with the Cancel button or the close icon.
- The modal is conditionally rendered only while open, and the parent gives each open cycle a fresh React `key`, so closing and reopening mounts a new modal instance.
- That hard reset is intentional. It clears component state and hooks outside the AntD `<Modal>` subtree, which `destroyOnHidden` alone does not reset.
- Edit prefill waits for existing `NetworkBinding` resources and AddressGroup options before setting selected AddressGroups, so edit tags render with the same badge labels as create selections. Structure Overview graph lookups do not block the modal after initialization; the sidebar renders from currently available data.

## Schema source

The implementation follows the local `v2` OpenAPI dump for `sgroups.io/v1alpha1` resources.

Relevant fields:

- `Network.spec.displayName`
- `Network.spec.CIDR`
- `Network.spec.description`
- `Network.spec.comment`
- `NetworkBinding.spec.addressGroup`
- `NetworkBinding.spec.network`
