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

- `namespace` and `name` identify the Network.
- `displayName`, `CIDR`, `description`, and `comment` map to editable `spec` fields.
- `addressGroups` stores selected AddressGroups as namespaced values.
- AddressGroup options are disabled until `namespace` is selected, then filtered to AddressGroups in that namespace. Changing `namespace` in create mode clears `addressGroups`.

The local `v2` OpenAPI dump is the source of truth for the resource shape. Do not write `Network.refs` from this modal. It is backend-computed data.

## Validation

AntD form rules mirror the local API docs and backend test fixtures:

- `namespace` and `name` are required Kubernetes DNS labels, max 63 chars.
- `displayName` is optional, max 63 chars.
- `CIDR` is required and must be a network CIDR with zero host bits. Values like `10.0.0.0/8`, `0.0.0.0/0`, and `2001:db8::/64` are valid; host-address CIDRs like `5.5.5.5/8` and `::1/8` are rejected before submit.

## Create Flow

Create submits the Network first, then creates one `NetworkBinding` per selected AddressGroup.

Each binding:

- is created in the Network namespace
- points `spec.network` to the Network name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

Binding requests are intentionally executed one at a time. The backend can reject concurrent binding sync with serialization errors, so do not replace this with `Promise.all`.

## Edit Flow

Edit mode receives an existing `network` prop.

- `namespace` and `name` are read-only identifiers.
- Editable fields are patched only when changed.
- Cleared optional strings use `patchEntryWithDeleteOp`.
- Changed values use `patchEntryWithReplaceOp`.
- `CIDR` is validated as a network CIDR and patched only when its trimmed value actually changed.
- AddressGroup selection is initialized from existing `NetworkBinding` resources, not from `refs`.
- AddressGroup options remain scoped to the Network namespace.
- Removed selections delete bindings.
- Added selections create bindings in the Network namespace.
- If no editable fields or bindings changed, no update request is sent.

Patch and binding requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields or bindings changed.

## Structure Overview

The sidebar is built from selected AddressGroups and the current host, network, and service binding graph. It reuses the AddressGroup contents tree builder.

Each selected AddressGroup overview node passes its own `overview-{namespace/name}` key as the tree key prefix. Nested section, binding, transport, entry, empty, and error keys then extend their parent key so repeated resources remain unique across the full AntD Tree.

## Lifecycle

The parent conditionally renders the modal only while it is open and increments a modal instance `key` before each create/edit open. This forces a real React unmount/remount for modal-local hooks and state. The AntD modal still uses `destroyOnHidden` for its internal subtree, but lifecycle correctness must not rely on that alone.

Edit prefill should run once per open cycle after the full async resource set is ready.
