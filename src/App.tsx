import React, { FC } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { MainPage, SecurityGroupsPage, NetworksPage, RulesPage, RulesDiagramPage, GraphPage } from 'pages'
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
      <Route exact path="/rules/diagram">
        <RulesDiagramPage />
      </Route>
      <Route exact path="/rules/:typeId?">
        <RulesPage />
      </Route>
      <Route exact path="/graph">
        <GraphPage />
      </Route>
    </Switch>
  </BrowserRouter>
)
