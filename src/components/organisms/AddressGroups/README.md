# AddressGroups

## Create modal

The bottom `Add Address Group` button opens `AddressGroupFormModal`.

The modal is based on the Figma form layout and uses Ant Design form controls:

- `Tenant`: required. AddressGroup namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: hidden. Create mode generates a UUID value for `metadata.name` and keeps it in the form store for submit.
- `Display name`: optional. Max 63 characters. Uses the shared hostname-label validator: letters, numbers, hyphens, and optional dots; a dot is not required. Create mode is prefilled with `addressgroups-`.
- `Allow access`: maps to `spec.defaultAction`.
  - enabled: `Allow`
  - disabled: `Deny`
- `Hosts`: optional multi-select. Loaded from the AddressGroup namespace. Visible labels and search text use `spec.displayName`, falling back to the Host name only when no display name exists. Values remain Host names. Creates `HostBinding` resources in the AddressGroup namespace.
- `Services`: optional multi-select. Loaded from all namespaces. Visible labels and search text use `spec.displayName` with namespace context, falling back to the Service name only when no display name exists. Values remain `namespace/name`. Creates each `ServiceBinding` in the selected service namespace.
- `Networks`: optional multi-select. Loaded from the AddressGroup namespace. Visible labels and search text use `spec.displayName`, falling back to the Network name only when no display name exists. Values remain Network names. Creates `NetworkBinding` resources in the AddressGroup namespace.
- `Description`: optional.
- `Comment`: optional.

## API flow

The save flow creates the main resource first:

```ts
AddressGroup
```

Then it creates one binding per selected host, service, or network:

```ts
HostBinding
ServiceBinding
NetworkBinding
```

The binding `spec.addressGroup` points at the newly-created AddressGroup. Hosts and networks are bound from the AddressGroup namespace. Services can be selected from any namespace, and their bindings are created in the service namespace.

The `AddressGroup.refs` field is intentionally not written by the UI. It is treated as computed/read-only data and should be populated by backend/controller logic from bindings.

The modal structure overview is a single AddressGroup tree. It does not model local/remote groups. Inside the tree, Hosts, Networks, and Services are grouped by their resource namespace before individual resource nodes.

In create mode, the overview is derived from the current form selection before the AddressGroup resource exists. The hidden generated `name` gives the overview builder a stable pending AddressGroup identifier so selected Hosts, Networks, and Services still match the shared contents tree filters.

Changing the AddressGroup namespace clears selected Hosts and Networks because those resources are namespace-scoped to the future AddressGroup namespace. Selected Services are not cleared by namespace changes because Services can be selected from any namespace and their bindings are created in the selected Service namespace.

The overview tree uses parent-derived AntD Tree keys. When the shared AddressGroup contents tree is reused inside another modal overview, callers prefix it with the selected AddressGroup overview key so repeated namespace, section, and resource nodes remain unique.

Modal and verbose-panel trees start collapsed by default. Avoid `defaultExpandAll` and `defaultExpandedKeys` unless a specific flow needs initial expansion.

Resource nodes in the overview and verbose-panel trees include a small detail-link icon next to the badge. The link target uses the resource namespace and immutable `metadata.name`; `spec.displayName` is only the visible label.

## Table display

The AddressGroups table uses badge/tag/icon formatting consistently:

- `Display Name` is the first pinned column and renders an `AddressGroup` badge. It shows `spec.displayName`, falling back to `metadata.name` only when the display name is empty.
- The `Display Name` value links to the AddressGroup detail page at `addressgroups/{namespace}/{metadata.name}`. The link text uses the display name, but the URL uses immutable identifiers.
- `Name` is intentionally hidden from the table, but remains in row data for edit/delete endpoints.
- `Tenant` renders a canonical `Tenant` badge.
- `Default Action` renders as a colored AntD tag.
- `Trace` renders as a status icon: a green check for enabled and a red cross for disabled.

## Detail page

The AddressGroup detail route is `addressgroups/{namespace}/{metadata.name}`. Breadcrumbs and the resource dropdown prefer `spec.displayName`, but API requests, links, and edit/delete endpoints always use immutable `metadata.name` and `metadata.namespace`.

The detail body uses the Figma card layout for:

- `Info`: creation timestamp, namespace label, canonical `Tenant` badge, and owner reference.
- `Assignments`: total bindings count plus labels and annotations counters.
- `Main`: immutable name, display name, default action, description, and comment.

The assignment counter opens `AddressGroupFormModal` in edit mode so Hosts, Services, and Networks are still managed through binding resources. The detail page does not render the Figma `Incoming ports` card because the local `v2` OpenAPI dump has no AddressGroup incoming-port or transport fields.

The detail page also includes a `Rules` tab for AddressGroup-related UniRules:

- `Rules from` shows rules whose `spec.endpoints.local` is this AddressGroup.
- `Rules to` shows rules whose `spec.endpoints.remote` is this AddressGroup.
- Rule links show `spec.displayName`, falling back to `metadata.name`, while routes still use immutable namespace/name identifiers.
- `Add` opens `UniRuleFormModal` in the current AddressGroup namespace.

## Edit modal

The table actions column includes edit and delete actions.

Edit opens the same `AddressGroupFormModal` for a selected AddressGroup by passing it as the optional `addressGroup` prop.

In edit mode:

- `Tenant` and `Name` are hidden immutable identifiers because they identify the resource endpoint.
- `Display name`, `Allow access`, `Description`, and `Comment` are editable and saved with patch helpers from the toolkit.
- The edit modal header prefers `spec.displayName` and falls back to `metadata.name`.
- Edit save patches only changed fields. Optional string fields are deleted with `patchEntryWithDeleteOp` when cleared, and changed values are saved with `patchEntryWithReplaceOp`.
- Hosts, services, and networks are initialized from existing bindings and are editable.
- Removing a selected host, service, or network deletes the corresponding binding.
- Adding a selected host, service, or network creates the corresponding binding.
- In edit mode, namespace-scoped resource and binding queries must start from `addressGroup.metadata.namespace` immediately. Waiting for the form watcher alone causes partial prefills.
- Edit prefill should run only once per modal open, after host/network/service binding queries are ready. Repeated partial `setFieldsValue` calls can leave AntD selects visually stuck on reopen.
- Resource badge rendering is reused from the table formatter for the modal title, options, tags, and overview. User-facing resource labels should show `spec.displayName`, falling back to `metadata.name` only when no display name exists.
- Badge color inputs must be canonical resource kinds so colors match `openapi-ui` / `openapi-k8s-toolkit`: use `AddressGroup`, `Tenant`, `HostBinding`, `NetworkBinding`, and `ServiceBinding`, not display labels or abbreviations such as `Address Group`, `AG`, or `NS`.

## Delete modal

The table delete action opens `SgroupsDeleteModal`, a local wrapper around the toolkit delete request behavior.

The modal title renders `Delete`, a canonical `Tenant` badge with the row namespace, then a canonical `AddressGroup` badge with `spec.displayName` falling back to `metadata.name`.

The delete endpoint is built from the selected row `metadata.namespace` and `metadata.name`:

```ts
;/api/celrsstu /
  { cluster } /
  k8s /
  apis /
  sgroups.io /
  v1alpha1 /
  namespaces /
  { namespace } /
  addressgroups /
  { name }
```

If the row namespace is missing, the current screen namespace is used as a fallback.

## Modal lifecycle

- AntD modals must set `maskClosable={false}`. Users should close modals only with the Cancel button or the close icon.
- The modal is conditionally rendered only while open, so closing it fully unmounts the component and reopening mounts a fresh instance.
- That hard reset is intentional. Soft resets were not enough for AntD multi-select state in this flow.

## Schema source

The implementation follows the local `v2` OpenAPI dump for `sgroups.io/v1alpha1` resources.

Relevant fields:

- `AddressGroup.spec.displayName`
- `AddressGroup.spec.defaultAction`
- `AddressGroup.spec.description`
- `AddressGroup.spec.comment`
- `AddressGroup.spec.logs`
- `AddressGroup.spec.trace`
- `HostBinding.spec.addressGroup`
- `HostBinding.spec.host`
- `ServiceBinding.spec.addressGroup`
- `ServiceBinding.spec.service`
- `NetworkBinding.spec.addressGroup`
- `NetworkBinding.spec.network`
