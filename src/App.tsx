import React, { FC } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { MainPage, SecurityGroupsPage, NetworksPage, RulesEditorPage, GraphPage } from 'pages'
import { BASEPREFIX } from 'constants/basePrefix'

export const App: FC = () => (
  <BrowserRouter basename={BASEPREFIX}>
    <Switch>
      <Route exact path="/">
        <MainPage />
      </Route>
      <Route exact path="/security-groups/">
        <SecurityGroupsPage />
      </Route>
      <Route exact path="/networks">
        <NetworksPage />
      </Route>
      <Route exact path="/rules-editor/:securityGroupId?">
        <RulesEditorPage />
      </Route>
      <Route exact path="/rules-editor/by-type/:byTypeId?">
        <RulesEditorPage />
      </Route>
      <Route exact path="/graph">
        <GraphPage />
      </Route>
    </Switch>
  </BrowserRouter>
)
