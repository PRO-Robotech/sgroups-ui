# UniRuleFormModal

Modal for creating and editing `Rule` resources. Unlike the resource membership modals, this flow writes endpoint references directly into the Rule spec and does not create binding resources.

## Files

- `UniRuleFormModal.tsx`: modal shell, AntD form, segmented panels, async resource loading, create/edit submit flow, and lifecycle reset.
- `types.ts`: component props and form value model.
- `utils.tsx`: endpoint normalization, transport normalization, overview tree data, validation helpers, and editable spec patch logic.
- `styled.ts`: modal layout, two-column grid, overview sidebar, segmented panels, and loading state styles.
- `index.ts`: public export.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the Rule.
- `displayName`, `action`, `traffic`, `description`, and `comment` map to editable `spec` fields.
- `local` and `remote` endpoint blocks map to `spec.endpoints.local` and `spec.endpoints.remote`.
- Transport panel values normalize back to `spec.transport` at submit time.

Endpoint types currently supported by the modal are `AddressGroup`, `Service`, `FQDN`, and `CIDR`.

## Validation

AntD form validation runs before the create or patch flow reads the full form store.

- `namespace`, `name`, and selected endpoint resource identifiers use Kubernetes DNS label validation with a 63 character limit.
- `displayName` is optional and limited to 63 characters.
- `action`, `traffic`, endpoint types, IP family, and protocol are checked against local `v3` / `v3sgroups` enum values.
- Local endpoints are limited to `AddressGroup` and `Service`.
- Remote endpoints allow `AddressGroup`, `Service`, `FQDN`, and `CIDR`.
- `FQDN` values must match the shared hostname-like FQDN validator.
- `CIDR` values must pass the shared IPv4/IPv6 CIDR validator.
- TCP/UDP port entries accept comma-separated ports and ranges, for example `80,443` or `1000-2000`.
- ICMP type entries accept integer values from `0` through `255`.
- Transport is optional when the whole Ports panel is empty. Once a protocol or transport entry is provided, the form requires the matching IP family/protocol/entry combination before submit.

Validation source priority is the local `v3` / `v3sgroups` OpenAPI shape for current `sgroups.io/v1alpha1` resources, with `tmp/newApi` rule docs used only for legacy rule-variant transport semantics.

## Create Flow

Create submits a single `Rule` resource.

There are no Host, Service, Network, or AddressGroup binding resources in this flow. Endpoint references are written directly into the Rule payload.

## Edit Flow

Edit mode receives an existing `rule` prop.

- `namespace` and `name` are read-only identifiers.
- The modal does not use PUT.
- Editable fields are patched only when changed.
- Cleared optional strings use `patchEntryWithDeleteOp`.
- Changed values use `patchEntryWithReplaceOp`.
- If nothing changed, no update request is sent.

Patch requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields changed.

Patched fields include:

- `spec.displayName`
- `spec.action`
- `spec.description`
- `spec.comment`
- `spec.endpoints.local`
- `spec.endpoints.remote`
- `spec.session`
- `spec.transport`

## Lifecycle

The parent conditionally renders the modal only while it is open. The modal also uses AntD `destroyOnHidden` and resets refs/state after close.

Edit prefill should run once per open cycle after resources needed for selects and the Structure Overview are ready. Modal loading gates should use React state, not refs read during render.
