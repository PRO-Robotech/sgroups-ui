# HostFormModal

Modal for creating and editing `Host` resources and their AddressGroup membership through `HostBinding` resources.

## Files

- `HostFormModal.tsx`: modal shell, AntD form, async resource loading, create/edit submit flow, and lifecycle reset.
- `types.ts`: component props and form value model.
- `utils.tsx`: current binding lookup, binding diff helpers, overview tree data, and editable spec patch logic.
- `styled.ts`: modal layout, two-column grid, overview sidebar, and loading state styles.
- `index.ts`: public export.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the Host.
- `displayName`, `description`, and `comment` map to editable `spec` fields.
- `addressGroups` stores selected AddressGroups as namespaced values.
- AddressGroup options are disabled until `namespace` is selected, then filtered to AddressGroups in that namespace. Changing `namespace` in create mode clears `addressGroups`.

Host IPs and metainfo are backend-owned in this modal flow and are not edited here. Reads should tolerate both `spec`-nested and legacy flattened payloads until the backend shape is consistent.

## Validation

The modal uses AntD form rules for backend-backed constraints:

- `namespace`: required Kubernetes resource namespace, max 63 chars.
- `name`: required Kubernetes resource name, max 63 chars.
- `displayName`: optional, max 63 chars.

The local `v2` and `v3sgroups` OpenAPI HostSpec only declares `displayName`, `description`, and `comment` as strings. The display-name length comes from the extracted backend validator in `tmp`; `description` and `comment` currently have no stricter documented limits.

## Create Flow

Create submits the Host first, then creates one `HostBinding` per selected AddressGroup.

Each binding:

- is created in the Host namespace
- points `spec.host` to the Host name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

Binding requests are intentionally executed one at a time. The backend can reject concurrent binding sync with serialization errors, so do not replace this with `Promise.all`.

Do not write `Host.refs` from this modal. It is backend-computed data.

## Edit Flow

Edit mode receives an existing `host` prop.

- `namespace` and `name` are read-only identifiers.
- Editable fields are patched only when changed.
- Cleared optional strings use `patchEntryWithDeleteOp`.
- Changed values use `patchEntryWithReplaceOp`.
- AddressGroup selection is initialized from existing `HostBinding` resources, not from `refs`.
- AddressGroup options remain scoped to the Host namespace.
- Removed selections delete bindings.
- Added selections create bindings in the Host namespace.
- If no editable fields or bindings changed, no update request is sent.

Patch and binding requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields or bindings changed.

## Lifecycle

The parent conditionally renders the modal only while it is open and increments a modal instance `key` before each create/edit open. This forces a real React unmount/remount for modal-local hooks and state. The AntD modal still uses `destroyOnHidden` for its internal subtree, but lifecycle correctness must not rely on that alone.

Edit prefill should run once per open cycle after the full async resource set is ready.
