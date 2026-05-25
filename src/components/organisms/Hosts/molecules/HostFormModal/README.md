# HostFormModal

Modal for creating and editing `Host` resources and their AddressGroup membership through `HostBinding` resources.

## Files

- `HostFormModal.tsx`: modal shell, AntD form, async resource loading, create/edit submit flow, and lifecycle reset.
- `types.ts`: component props and form value model.
- `utils.tsx`: current binding lookup, binding diff helpers, overview tree data, and editable spec patch logic.
- `styled.ts`: fixed-height modal layout, two-column grid, independent form/overview scrolling, overview sidebar, and loading state styles.
- `index.ts`: public export.

## Layout

The modal body is a fixed-height, viewport-bounded two-column shell. The left form column scrolls internally through the AntD form, while the right Structure Overview keeps its title fixed and scrolls only the overview body.

In edit mode, the resource title is rendered at the top of the AntD form. The canonical `Host` badge is static; the adjacent display-name text has a pencil action that toggles an inline `displayName` input. Keep this title field inside the `Form` tree so AntD validation, submit, and reset behavior continue to include it. Create mode keeps the normal body `Display name` field.

On narrow screens, the overview sidebar is hidden and the form keeps the same internal scroll behavior.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the Host. `name` is hidden in create and edit; create mode generates a UUID value and keeps it registered in the form store.
- `displayName`, `description`, and `comment` map to editable `spec` fields. In edit mode, `displayName` is edited from the title pencil instead of a body form row.
- `addressGroupNamespace` is hidden and mirrors the Host namespace. It controls the namespace-scoped AddressGroup query.
- `addressGroups` stores selected AddressGroups as namespaced values.
- AddressGroup option labels and search text use `spec.displayName`, falling back to the AddressGroup name only when no display name exists. Labels omit the namespace because AddressGroups are scoped to the Host namespace.
- Namespace-scoped AddressGroup responses may omit `metadata.namespace`; the modal applies `addressGroupNamespace` before building options so AntD can resolve selected values to badge labels.
- AddressGroup options are disabled until the Host namespace is known. Changing the Host namespace clears `addressGroups`.
- Submit filters stale `addressGroups` values to the Host namespace so retained AntD form state cannot save bindings from another namespace.

Host IPs and metainfo are backend-owned in this modal flow and are not edited here. Reads should tolerate both `spec`-nested and legacy flattened payloads until the backend shape is consistent.

## Validation

The modal uses AntD form rules for backend-backed constraints:

- `namespace`: required Kubernetes resource namespace, max 63 chars.
- `name`: hidden required Kubernetes resource name, generated as a UUID in create mode, max 63 chars.
- `displayName`: optional, max 63 chars. Uses the shared hostname-label validator: letters, numbers, hyphens, and optional dots; a dot is not required. Create mode is prefilled with `hosts-` plus six random digits.
- `addressGroupNamespace`: hidden Kubernetes resource namespace mirrored from `namespace`.

The local `v2` and `v3sgroups` OpenAPI HostSpec only declares `displayName`, `description`, and `comment` as strings. The display-name length comes from the extracted backend validator in `tmp`; the UI additionally applies the shared hostname-label rule without requiring a dot. `description` and `comment` currently have no stricter documented limits.

## Create Flow

Create submits the Host first, then creates one `HostBinding` per selected AddressGroup.

The create payload uses the hidden generated `name` as `metadata.name`; users do not type resource names in this modal.

Each binding:

- is created in the Host namespace
- points `spec.host` to the Host name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

Binding requests are intentionally executed one at a time. The backend can reject concurrent binding sync with serialization errors, so do not replace this with `Promise.all`.

Do not write `Host.refs` from this modal. It is backend-computed data.

## Edit Flow

Edit mode receives an existing `host` prop.

- `namespace` and `name` are hidden immutable identifiers; keep their values registered in the AntD form store so submit can build patch and binding endpoints.
- Editable fields are patched only when changed.
- Cleared optional strings use `patchEntryWithDeleteOp`.
- Changed values use `patchEntryWithReplaceOp`.
- AddressGroup selection is initialized from existing `HostBinding` resources, not from `refs`.
- AddressGroup namespace is initialized from the Host namespace.
- Current `HostBinding` lookup falls back to `HostBinding.metadata.namespace` when `spec.host.namespace` is omitted, because Host bindings are created in the Host namespace.
- Removed selections delete bindings.
- Added selections create bindings in the Host namespace.
- If no editable fields or bindings changed, no update request is sent.

Patch and binding requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields or bindings changed.

## Structure Overview

The sidebar is built from selected AddressGroups and the current host, network, and service binding graph. Selected AddressGroups are filtered to the Host namespace, grouped by AddressGroup namespace first, then each namespace contains its selected AddressGroup children. Each AddressGroup child reuses the AddressGroup contents tree builder.

In edit mode, newly selected AddressGroups are shown with a high-contrast green highlight, left accent, bold text, and an `Added` marker. The pending Host binding is also injected into that AddressGroup branch and marked as `Added` so the overview previews the post-save graph.

Each selected AddressGroup overview node passes its own `overview-{namespace/name}` key as the tree key prefix. Nested namespace, section, binding, transport, entry, empty, and error keys then extend their parent key so repeated resources remain unique across the full AntD Tree.

The overview tree is remounted when AddressGroup namespace or selection changes. Overview graph fetches do not block the form after initial prefill; the sidebar renders from currently available data instead of holding an infinite spinner.

Selected AddressGroup nodes and resolved resource children include a small detail-link icon next to their badges. Detail links use resource namespaces and immutable `metadata.name`; display names remain label-only.

The overview tree starts collapsed by default. Do not set `defaultExpandAll` or `defaultExpandedKeys` here unless the product explicitly needs initial expansion.

## Lifecycle

Set `maskClosable={false}` on the AntD `Modal`. Backdrop clicks must not close the modal; use the Cancel button or close icon for explicit close actions.

The parent conditionally renders the modal only while it is open and increments a modal instance `key` before each create/edit open. This forces a real React unmount/remount for modal-local hooks and state. The AntD modal still uses `destroyOnHidden` for its internal subtree, but lifecycle correctness must not rely on that alone.

Edit prefill should run once per open cycle after resources needed for the form are ready. That includes AddressGroup options for the selected AddressGroup namespace, otherwise AntD can render prefilled selections as raw `namespace/name` values instead of the same badge labels used after create-mode selection.

Use field-specific AntD watchers for `addressGroupNamespace` and `addressGroups`. Watching the whole form can return an empty object before initialization and accidentally disable the initial AddressGroup options query.
