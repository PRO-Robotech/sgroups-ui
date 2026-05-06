# AddressGroupFormModal

Modal for creating and editing `AddressGroup` resources and their host, service, and network bindings.

## Files

- `AddressGroupFormModal.tsx`: modal shell, AntD form, async resource loading, create/edit submit flow, and lifecycle reset.
- `types.ts`: component props and form value model.
- `utils.tsx`: binding diff helpers, overview tree data, and editable spec patch logic.
- `styled.ts`: fixed-height modal layout, two-column grid, independent form/overview scrolling, overview sidebar, and loading state styles.
- `index.ts`: public export.

## Layout

The modal body is a fixed-height, viewport-bounded two-column shell. The left form column scrolls internally through the AntD form, while the right Structure Overview keeps its title fixed and scrolls only the overview body.

On narrow screens, the overview sidebar is hidden and the form keeps the same internal scroll behavior.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the AddressGroup.
- `displayName`, `allowAccess`, `description`, and `comment` map to editable `spec` fields.
- `hosts` and `networks` are selected by name from the AddressGroup namespace and synced through binding resources.
- `services` are selected as `namespace/name` values from all namespaces and synced through binding resources.

Do not write `AddressGroup.refs` from this modal. It is backend-computed data.

## Validation

AntD form validation mirrors the local `v2`/`v3sgroups` schema and backend validation from `tmp/sgroups`:

- `namespace`: required Kubernetes resource name, max 63 characters.
- `name`: required Kubernetes resource name, max 63 characters.
- `displayName`: optional, max 63 characters.
- `defaultAction`: controlled by the Allow access switch and submitted as `Allow` or `Deny`.
- `description` and `comment`: optional strings. The current schema does not define stricter client-side limits for these fields.

Validation failures should stop submit before any create, patch, or binding request is sent.

## Create Flow

Create submits the AddressGroup first, then creates selected bindings:

- `HostBinding` in the AddressGroup namespace.
- `NetworkBinding` in the AddressGroup namespace.
- `ServiceBinding` in the selected Service namespace.

Hosts and Networks are selected from the future AddressGroup namespace. Services can be selected from any namespace and are labeled as `namespace / serviceName`.

Changing `namespace` clears the selected Hosts and Networks because those selections are scoped to the future AddressGroup namespace. It must not clear selected Services; Service bindings are created in each selected Service namespace.

Binding requests are intentionally executed one at a time. The backend can reject concurrent binding sync with serialization errors, so do not replace this with `Promise.all`.

## Edit Flow

Edit mode receives an existing `addressGroup` prop.

- `namespace` and `name` are hidden immutable identifiers; keep their values registered in the AntD form store so submit can build patch endpoints.
- Editable fields are patched only when changed.
- Cleared optional strings use `patchEntryWithDeleteOp`.
- Changed values use `patchEntryWithReplaceOp`.
- Selected Hosts, Services, and Networks are initialized from existing bindings, not from `refs`.
- Removed selections delete bindings.
- Added selections create bindings.
- If no editable fields or bindings changed, no update request is sent.

Patch and binding requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields or bindings changed.

## Structure Overview

The sidebar renders a single AddressGroup contents tree from the selected Hosts, Services, and Networks. Hosts, Networks, and Services are grouped by resource namespace before individual resource nodes.

Create mode builds synthetic binding objects from the current form selection so the overview can reuse the same AddressGroup contents tree as edit mode and verbose panels. Before the user enters an AddressGroup `name`, the overview uses a stable pending internal AddressGroup name; otherwise the shared tree filters can drop selected resources because the synthetic binding target does not match the tree root.

In edit mode, newly added selections are shown with a subtle green background and left accent. Removed selections disappear from the overview immediately because the sidebar reflects the current form selection, not the saved backend state.

Tree keys are parent-derived by the shared contents tree builder, including the namespace grouping layer. If this tree is later embedded under another overview node, pass that parent key as the builder prefix instead of relying on short repeated section keys.

## Lifecycle

The parent conditionally renders the modal only while it is open. The modal also uses AntD `destroyOnHidden` and resets refs/state after close. This hard reset is intentional because partial async prefills can leave AntD multi-selects visually broken on reopen.

Edit prefill should run once per open cycle after the full async resource set is ready.
