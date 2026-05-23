/* eslint-disable import/no-default-export */
import React, { FC } from 'react'
import { Routes, Route, Navigate, useInRouterContext } from 'react-router-dom'
import {
  AddressGroupsPage,
  HostsPage,
  NetworksPage,
  ResourceDetailsPage,
  RulesPage,
  ServicesPage,
  SGROUPS_RESOURCE_DETAILS_CONFIG,
} from 'pages'

export type TAppInnerProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

export const AppInner: FC<TAppInnerProps> = ({
  cluster,
  namespace,
  syntheticProject,
  pluginName,
  pluginPath,
  toggleTheme,
}) => {
  const inRouter = useInRouterContext()

  if (!inRouter) return <div>Plugin is NOT under host Router (likely duplicate react-router-dom)</div>

  return (
    <Routes>
      <Route index element={<Navigate to="hosts" replace />} />

      {/* NOTE: paths are RELATIVE to /.../plugins/:pluginName/* */}
      <Route
        path="hosts"
        element={
          <HostsPage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
          />
        }
      />
      <Route
        path="hosts/:namespace/:name"
        element={
          <ResourceDetailsPage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
            resourceConfig={SGROUPS_RESOURCE_DETAILS_CONFIG.hosts}
          />
        }
      />
      <Route
        path="addressgroups"
        element={
          <AddressGroupsPage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
          />
        }
      />
      <Route
        path="addressgroups/:namespace/:name"
        element={
          <ResourceDetailsPage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
            resourceConfig={SGROUPS_RESOURCE_DETAILS_CONFIG.addressgroups}
          />
        }
      />
      <Route
        path="networks"
        element={
          <NetworksPage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
          />
        }
      />
      <Route
        path="networks/:namespace/:name"
        element={
          <ResourceDetailsPage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
            resourceConfig={SGROUPS_RESOURCE_DETAILS_CONFIG.networks}
          />
        }
      />
      <Route
        path="rules"
        element={
          <RulesPage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
          />
        }
      />
      <Route
        path="rules/:namespace/:name"
        element={
          <ResourceDetailsPage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
            resourceConfig={SGROUPS_RESOURCE_DETAILS_CONFIG.rules}
          />
        }
      />
      <Route
        path="services"
        element={
          <ServicesPage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
          />
        }
      />
      <Route
        path="services/:namespace/:name"
        element={
          <ResourceDetailsPage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
            resourceConfig={SGROUPS_RESOURCE_DETAILS_CONFIG.services}
          />
        }
      />

      {/* <Route
        path="table"
        element={
          <RbacTablePage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
          />
        }
      /> */}

      {/* <Route
        path="roles/:namespace/:name"
        element={
          <RoleDetailsPage
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
          />
        }
      /> */}

      {/* optional catch-all */}
      {/* <Route path="*" element={<MainPage />} /> */}
    </Routes>
  )
}
