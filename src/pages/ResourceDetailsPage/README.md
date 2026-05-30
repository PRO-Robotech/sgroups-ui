# ResourceDetailsPage

Shared detail page implementation for namespaced `sgroups.io/v1alpha1` resources.

## Route shape

Detail routes are registered per resource in `AppInner`:

```txt
hosts/:namespace/:name
services/:namespace/:name
networks/:namespace/:name
addressgroups/:namespace/:name
rules/:namespace/:name
```

The `:name` route param is always `metadata.name`, not `spec.displayName`.

## Display names

The page fetches the selected resource and resolves the visible label as:

```ts
resource.spec?.displayName || resource.metadata.name
```

That visible label is used for breadcrumbs, the hidden page title, and the resource dropdown label. API selectors, endpoints, YAML editor props, and redirects keep using `metadata.name`.

## Breadcrumbs

Breadcrumbs are built with `buildSgroupsResourceDetailsBreadcrumbs`.

The first breadcrumb links back to the module table:

```txt
{basePath}/{plural}
```

The resource breadcrumb uses the visible display name, not the identifier.
Tenant/namespace is kept in the route and API calls, but it is not rendered as a breadcrumb item.

## Factory contents

The generated factory includes:

- header badge, resource dropdown, copy button, and actions
- the shared first Details-tab row: resource info, namespace, owner references, labels, and annotations
- conditions table when `.status.conditions` exists
- YAML editor

The header selector overrides the toolkit `DropdownRedirect` locally so option values remain `metadata.name` for route changes while visible option labels use `spec.displayName`, falling back to `metadata.name`.

All five sgroups detail pages use the same factory-backed upper Details-tab row from the YAML factory shape. Labels and annotations are edited through the shared `AggregatedCounterCard` metadata cards, not through local React detail sections.

AddressGroup, Host, Network, and Service details add local injected sections below the shared metadata row: `SgroupsAddressGroupDetailsSection`, `SgroupsHostDetailsSection`, `SgroupsNetworkDetailsSection`, and `SgroupsServiceDetailsSection`. These sections contain only resource-specific cards while keeping the shared header, metadata, conditions, and YAML tabs factory-driven.

The AddressGroup detail section renders `Main` and `Entities` cards. The `Main` card exposes a default-action switch using the same `Allow access` mapping as `AddressGroupFormModal`: checked patches `spec.defaultAction` to `Allow`, unchecked patches it to `Deny`. `Logs` and `Trace` render as read-only boolean status icons. The `Entities` card reuses the shared AddressGroup contents tree so it stays aligned with verbose panels and modal overviews. Figma's `Assignments` and `Incoming ports` cards are intentionally not rendered here: metadata belongs to the shared factory row, and the local `v2` OpenAPI shape does not expose incoming ports or transports on `AddressGroup`.

AddressGroup details add a `Rules` tab with a segmented `Rules from` / `Rules to` table. `Rules from` matches `Rule.spec.endpoints.local` against the current AddressGroup; `Rules to` matches `Rule.spec.endpoints.remote`. The tab's `Add` button passes create-mode initial values into `UniRuleFormModal`: `Rules from` preselects the current AddressGroup as Local, and `Rules to` preselects it as Remote.

AddressGroup details also add `Hosts`, `Networks`, and `Services` tabs. These tabs are backed by HostBinding, NetworkBinding, and ServiceBinding resources that point at the current AddressGroup, but the tables show the connected resources rather than binding-name columns. Their `Add` buttons open the AddressGroup edit modal so membership changes continue through binding resources instead of computed refs.

Service details add `AddressGroups` and `Rules` tabs. The `AddressGroups` tab is backed by `ServiceBinding` resources whose `spec.service` matches the current Service name and namespace. The `Rules` tab uses the same segmented `Rules from` / `Rules to` pattern and matches `Rule.spec.endpoints.local` or `Rule.spec.endpoints.remote` when the endpoint type is `Service`. Its `Add` button also passes create-mode initial values into `UniRuleFormModal`, preselecting the current Service as Local from `Rules from` or Remote from `Rules to`.

Delete actions intentionally do not pass `redirectTo` from detail pages. The shared delete modal close handler navigates to `redirectTo` on any close, so canceling or closing the modal would otherwise jump back to the resource table. The local sgroups delete modal also sets `maskClosable={false}`, so backdrop clicks do not close it.

The generic Events tab is intentionally omitted for sgroups resources because current sgroups flows do not provide resource-specific event behavior.
