# NetworkFormModal

Modal for creating and editing `Network` resources and their AddressGroup membership through `NetworkBinding` resources.

## Files

- `NetworkFormModal.tsx`: modal shell, AntD form, async resource loading, create/edit submit flow, and lifecycle reset.
- `types.ts`: component props and form value model.
- `utils.tsx`: current binding lookup, binding diff helpers, overview tree data, and editable spec patch logic.
- `styled.ts`: fixed-height modal layout, two-column grid, independent form/overview scrolling, overview sidebar, and loading state styles.
- `index.ts`: public export.

## Layout

The modal body is a fixed-height, viewport-bounded two-column shell. The left form column scrolls internally through the AntD form, while the right Structure Overview keeps its title fixed and scrolls only the overview body.

On narrow screens, the overview sidebar is hidden and the form keeps the same internal scroll behavior.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the Network. `name` is hidden in create and edit; create mode generates a UUID value and keeps it registered in the form store.
- `displayName`, `CIDR`, `description`, and `comment` map to editable `spec` fields.
- `addressGroupNamespace` controls the namespace-scoped AddressGroup query.
- `addressGroups` stores selected AddressGroups as namespaced values.
- AddressGroup option labels and search text use `spec.displayName`, falling back to the AddressGroup name only when no display name exists. Labels omit the namespace because the namespace is chosen in the preceding selector.
- Namespace-scoped AddressGroup responses may omit `metadata.namespace`; the modal applies `addressGroupNamespace` before building options so AntD can resolve selected values to badge labels.
- AddressGroup options are disabled until `addressGroupNamespace` is selected. Changing `addressGroupNamespace` clears `addressGroups`.
- Submit filters stale `addressGroups` values to the current `addressGroupNamespace` so retained AntD form state cannot save bindings from a previous namespace.

The local `v2` OpenAPI dump is the source of truth for the resource shape. Do not write `Network.refs` from this modal. It is backend-computed data.

## Validation

AntD form rules mirror the local API docs and backend test fixtures:

- `namespace` is a required Kubernetes DNS label, max 63 chars.
- `name` is a hidden required Kubernetes DNS label, generated as a UUID in create mode, max 63 chars.
- `displayName` is optional, max 63 chars. Create mode is prefilled with `networks-`.
- `addressGroupNamespace` is an optional Kubernetes DNS label, max 63 chars.
- `CIDR` is required and must be a network CIDR with zero host bits. Values like `10.0.0.0/8`, `0.0.0.0/0`, and `2001:db8::/64` are valid; host-address CIDRs like `5.5.5.5/8` and `::1/8` are rejected before submit.

## Create Flow

Create submits the Network first, then creates one `NetworkBinding` per selected AddressGroup.

The create payload uses the hidden generated `name` as `metadata.name`; users do not type resource names in this modal.

Each binding:

- is created in the Network namespace
- points `spec.network` to the Network name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

Binding requests are intentionally executed one at a time. The backend can reject concurrent binding sync with serialization errors, so do not replace this with `Promise.all`.

## Edit Flow

Edit mode receives an existing `network` prop.

- `namespace` and `name` are hidden immutable identifiers; keep their values registered in the AntD form store so submit can build patch and binding endpoints.
- Editable fields are patched only when changed.
- Cleared optional strings use `patchEntryWithDeleteOp`.
- Changed values use `patchEntryWithReplaceOp`.
- `CIDR` is validated as a network CIDR and patched only when its trimmed value actually changed.
- AddressGroup selection is initialized from existing `NetworkBinding` resources, not from `refs`.
- AddressGroup namespace is initialized from the first existing `NetworkBinding.spec.addressGroup.namespace` when available.
- Removed selections delete bindings.
- Added selections create bindings in the Network namespace.
- If no editable fields or bindings changed, no update request is sent.

Patch and binding requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields or bindings changed.

## Structure Overview

The sidebar is built from selected AddressGroups and the current host, network, and service binding graph. Selected AddressGroups are filtered to the current `addressGroupNamespace`, grouped by AddressGroup namespace first, then each namespace contains its selected AddressGroup children. Each AddressGroup child reuses the AddressGroup contents tree builder.

In edit mode, newly selected AddressGroups are shown with a subtle green background and left accent. The pending Network binding is also injected into that AddressGroup branch so the overview previews the post-save graph.

Each selected AddressGroup overview node passes its own `overview-{namespace/name}` key as the tree key prefix. Nested namespace, section, binding, transport, entry, empty, and error keys then extend their parent key so repeated resources remain unique across the full AntD Tree.

The overview tree is remounted when AddressGroup namespace or selection changes. Overview graph fetches do not block the form after initial prefill; the sidebar renders from currently available data instead of holding an infinite spinner.

The overview tree starts collapsed by default. Do not set `defaultExpandAll` or `defaultExpandedKeys` here unless the product explicitly needs initial expansion.

## Lifecycle

The parent conditionally renders the modal only while it is open and increments a modal instance `key` before each create/edit open. This forces a real React unmount/remount for modal-local hooks and state. The AntD modal still uses `destroyOnHidden` for its internal subtree, but lifecycle correctness must not rely on that alone.

Edit prefill should run once per open cycle after resources needed for the form are ready. That includes AddressGroup options for the selected AddressGroup namespace, otherwise AntD can render prefilled selections as raw `namespace/name` values instead of the same badge labels used after create-mode selection.

Use field-specific AntD watchers for `addressGroupNamespace` and `addressGroups`. Watching the whole form can return an empty object before initialization and accidentally disable the initial AddressGroup options query.
