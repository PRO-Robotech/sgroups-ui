import React, { FC } from 'react'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { store } from 'store/store'
import { HostsPage } from 'pages/HostsPage'
import { ThemeModeProvider } from 'hooks/ThemeModeContext'
import { useThemeMode } from 'hooks/useThemeMode'
import { AppInner } from './AppInner'

export type TAppProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  withRoutes?: boolean
  toggleTheme?: () => void
}

export const App: FC<TAppProps> = ({
  cluster,
  namespace,
  syntheticProject,
  pluginName,
  pluginPath,
  withRoutes,
  toggleTheme,
}) => {
  const { mode, toggleTheme: toggleThemeInternal } = useThemeMode(toggleTheme)
  const [queryClient] = React.useState(() => new QueryClient())

  const providerValue = { mode, toggleTheme: toggleThemeInternal }

  // Logic is specific for type of plugin
  if (!withRoutes) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeModeProvider value={providerValue}>
          <Provider store={store}>
            <MemoryRouter>
              <HostsPage
                cluster={cluster}
                namespace={namespace}
                syntheticProject={syntheticProject}
                pluginName={pluginName}
                pluginPath={pluginPath}
                toggleTheme={toggleTheme}
              />
            </MemoryRouter>
          </Provider>
        </ThemeModeProvider>
      </QueryClientProvider>
    )
  }
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider value={providerValue}>
        <Provider store={store}>
          <AppInner
            cluster={cluster}
            namespace={namespace}
            syntheticProject={syntheticProject}
            pluginName={pluginName}
            pluginPath={pluginPath}
            toggleTheme={toggleTheme}
          />
        </Provider>
      </ThemeModeProvider>
    </QueryClientProvider>
  )
}

// eslint-disable-next-line import/no-default-export
export default App
