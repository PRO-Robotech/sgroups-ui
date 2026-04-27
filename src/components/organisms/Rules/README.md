# Rules

## Create modal

The bottom `Add UniRule` button opens `UniRuleFormModal`.

The modal follows the Figma layout structure, but the payload and editable fields follow the local `v3` / `v3sgroups` `sgroups.io/v1alpha1` schema. Older `tmp/newApi` rule docs are used only to confirm practical create-time validation behavior for TCP/UDP and ICMP rule variants.

- `Namespace`: required. Rule namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: required. Kubernetes DNS label format, max 63 chars.
- `Display name`: optional, max 63 chars.
- `Action`: required. AntD validates `Allow` or `Deny`.
- `Traffic`: required. UI labels are `Both`, `Ingress`, or `Egress`; saved `spec.session.traffic` values are lowercase: `both`, `ingress`, or `egress`.
- `Local`: required endpoint block.
- `Remote`: required endpoint block.
- `Description`: optional.
- `Comment`: optional.
- `IP family`: optional transport selector. `IPv4` or `IPv6`.
- `Protocol`: optional transport selector. `TCP`, `UDP`, or `ICMP`.
- `Transport entries`: optional repeated section.
  - for `TCP` and `UDP`, each entry uses `ports`
  - for `ICMP`, each entry uses `types`
  - each entry may also include optional `description` and `comment`
  - if transport entries are filled, `IP family` and `Protocol` become required

## Endpoint rules

The current `RuleEndpoint` CRD supports these types:

- `AddressGroup`
- `Service`
- `FQDN`
- `CIDR`

For `AddressGroup` and `Service` endpoints:

- the form stores `namespace` and `name` separately
- namespace is not locked to the rule namespace
- the `Name` select is scoped by the chosen resource namespace
- services and address groups can be chosen from any namespace
- selected resource namespace and name are validated as Kubernetes DNS labels, max 63 chars

For string endpoints:

- `FQDN` is validated as a hostname-like FQDN
- `CIDR` is validated for both IPv4 and IPv6 CIDR formats

## API flow

The save flow creates the main resource directly:

```ts
Rule
```

There are no binding resources in the UniRule modal flow. Endpoint references are written directly into:

```ts
Rule.spec.endpoints.local
Rule.spec.endpoints.remote
```

Transport data is written into:

```ts
Rule.spec.transport
```

Session direction is written into:

```ts
Rule.spec.session
```

## Edit modal

The table actions column includes edit and delete actions.

Edit opens the same `UniRuleFormModal` for a selected Rule by passing it as the optional `rule` prop.

In edit mode:

- `Namespace` and `Name` are read-only because they identify the resource endpoint.
- The modal does not use PUT.
- Edit save patches only changed fields.
- Optional string fields are deleted with `patchEntryWithDeleteOp` when cleared.
- Changed values are saved with `patchEntryWithReplaceOp`.
- If nothing changed, no update request is sent.

Patched fields are currently:

- `Rule.spec.displayName`
- `Rule.spec.action`
- `Rule.spec.description`
- `Rule.spec.comment`
- `Rule.spec.endpoints.local`
- `Rule.spec.endpoints.remote`
- `Rule.spec.session`
- `Rule.spec.transport`

## Delete modal

The table delete action opens the toolkit `DeleteModal`.

The delete endpoint is built from the selected row `metadata.namespace` and `metadata.name`:

```ts
;/api/celrsstu / { cluster } / k8s / apis / sgroups.io / v1alpha1 / namespaces / { namespace } / rules / { name }
```

If the row namespace is missing, the current screen namespace is used as a fallback.

## Validation Notes

The implementation validates with AntD before building the save payload.

- `Action`, `Traffic`, endpoint type, IP family, and protocol are checked against local enum values from the `v3` / `v3sgroups` schema.
- Local endpoints can only be `AddressGroup` or `Service`.
- Remote endpoints can be `AddressGroup`, `Service`, `FQDN`, or `CIDR`.
- `TCP` and `UDP` transport entries validate single ports and ranges like `80,443` or `1000-2000`
- `ICMP` entries validate type values from `0` to `255`
- selecting a protocol requires at least one transport entry
- adding a transport entry requires both protocol and IP family
- transport payload is omitted only when the whole transport section is empty

## Structure overview

The right sidebar renders a `Structure Overview` tree with separate top-level `Local` and `Remote` sections.

- `AddressGroup` and `Service` endpoints reuse the existing rule verbose tree builder
- the tree expands through the current host, network, and service binding graph
- `FQDN` and `CIDR` endpoints render as direct endpoint leaves

## Modal lifecycle

- The modal is conditionally rendered only while open, so closing it fully unmounts the component and reopening mounts a fresh instance.
- Edit prefill runs once per open cycle, after the async resources needed for the overview and selects are ready.
- The loading state uses React state, not refs read during render.

## Schema Source

The implementation follows the local `v3` / `v3sgroups` OpenAPI dumps for the current `sgroups.io/v1alpha1` resource shape. The `tmp/newApi` rule docs are reference material for legacy rule-specific required fields and transport validation semantics.

Relevant fields:

- `Rule.spec.displayName`
- `Rule.spec.action`
- `Rule.spec.description`
- `Rule.spec.comment`
- `Rule.spec.endpoints.local`
- `Rule.spec.endpoints.remote`
- `Rule.spec.session.traffic`
- `Rule.spec.transport.IPv`
- `Rule.spec.transport.protocol`
- `Rule.spec.transport.entries`
