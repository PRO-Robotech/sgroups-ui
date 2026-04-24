# AddressGroupFormModal

Modal for creating and editing `AddressGroup` resources and their host, service, and network bindings.

## Files

- `AddressGroupFormModal.tsx`: modal shell, AntD form, async resource loading, create/edit submit flow, and lifecycle reset.
- `types.ts`: component props and form value model.
- `utils.tsx`: binding diff helpers, overview tree data, and editable spec patch logic.
- `styled.ts`: modal layout, two-column grid, overview sidebar, and loading state styles.
- `index.ts`: public export.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the AddressGroup.
- `displayName`, `defaultAction`, `description`, and `comment` map to editable `spec` fields.
- `hosts`, `services`, and `networks` are selected as namespaced values and synced through binding resources.

Do not write `AddressGroup.refs` from this modal. It is backend-computed data.

## Create Flow

Create submits the AddressGroup first, then creates selected bindings:

- `HostBinding` in the AddressGroup namespace.
- `NetworkBinding` in the AddressGroup namespace.
- `ServiceBinding` in the selected Service namespace.

Hosts and Networks are selected from the future AddressGroup namespace. Services can be selected from any namespace and are labeled as `namespace / serviceName`.

Binding requests are intentionally executed one at a time. The backend can reject concurrent binding sync with serialization errors, so do not replace this with `Promise.all`.

## Edit Flow

Edit mode receives an existing `addressGroup` prop.

- `namespace` and `name` are read-only identifiers.
- Editable fields are patched only when changed.
- Cleared optional strings use `patchEntryWithDeleteOp`.
- Changed values use `patchEntryWithReplaceOp`.
- Selected Hosts, Services, and Networks are initialized from existing bindings, not from `refs`.
- Removed selections delete bindings.
- Added selections create bindings.
- If no editable fields or bindings changed, no update request is sent.

Patch and binding requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields or bindings changed.

## Lifecycle

The parent conditionally renders the modal only while it is open. The modal also uses AntD `destroyOnClose` and resets refs/state after close. This hard reset is intentional because partial async prefills can leave AntD multi-selects visually broken on reopen.

Edit prefill should run once per open cycle after the full async resource set is ready.
