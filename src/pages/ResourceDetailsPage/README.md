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

That visible label is used for breadcrumbs, the hidden page title, and the current value in the resource dropdown. API selectors, endpoints, YAML editor props, and redirects keep using `metadata.name`.

## Breadcrumbs

Breadcrumbs are built with `buildSgroupsResourceDetailsBreadcrumbs`.

The first breadcrumb links back to the module table:

```txt
{basePath}/{plural}
```

The resource breadcrumb uses the visible display name, not the identifier.

## Factory contents

The generated factory includes:

- header badge, resource dropdown, copy button, and actions
- labels and annotations actions/cards for generic resource detail layouts
- resource info and owner refs
- conditions table when `.status.conditions` exists
- YAML editor

Host, Network, and Service details replace the generic info/metadata card row with local injected sections: `SgroupsHostDetailsSection`, `SgroupsNetworkDetailsSection`, and `SgroupsServiceDetailsSection`. This follows the RBAC plugin pattern of injecting a local React component into the dynamic renderer for domain-specific inner content while keeping the shared header, actions, conditions, and YAML tabs factory-driven.

Delete actions intentionally do not pass `redirectTo` from detail pages. The shared delete modal close handler navigates to `redirectTo` on any close, so canceling or closing the modal would otherwise jump back to the resource table. The local sgroups delete modal also sets `maskClosable={false}`, so backdrop clicks do not close it.

The generic Events tab is intentionally omitted for sgroups resources because current sgroups flows do not provide resource-specific event behavior.
