# NetworkFormModal

Modal for creating and editing `Network` resources and their AddressGroup membership through `NetworkBinding` resources.

## Files

- `NetworkFormModal.tsx`: modal shell, AntD form, async resource loading, create/edit submit flow, and lifecycle reset.
- `types.ts`: component props and form value model.
- `utils.tsx`: current binding lookup, binding diff helpers, overview tree data, CIDR validation, and editable spec patch logic.
- `styled.ts`: modal layout, two-column grid, overview sidebar, and loading state styles.
- `index.ts`: public export.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the Network.
- `displayName`, `CIDR`, `description`, and `comment` map to editable `spec` fields.
- `addressGroups` stores selected AddressGroups as namespaced values.

The local `v2` OpenAPI dump is the source of truth for the resource shape. Do not write `Network.refs` from this modal. It is backend-computed data.

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
- `CIDR` is patched only when its trimmed value actually changed.
- AddressGroup selection is initialized from existing `NetworkBinding` resources, not from `refs`.
- Removed selections delete bindings.
- Added selections create bindings in the Network namespace.
- If no editable fields or bindings changed, no update request is sent.

Patch and binding requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields or bindings changed.

## Lifecycle

The parent conditionally renders the modal only while it is open. The modal also uses AntD `destroyOnClose` and resets refs/state after close. This hard reset is intentional and matches the other resource modals.

Edit prefill should run once per open cycle after the full async resource set is ready.
