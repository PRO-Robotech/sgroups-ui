import React, { FC } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import {
  MainPage,
  SecurityGroupsPage,
  SecurityGroupsAddPage,
  SecurityGroupsEditPage,
  NetworksPage,
  NetworksAddPage,
  NetworksEditPage,
  RulesPage,
  RulesPageSpecific,
  RulesEditorPage,
  GraphPage,
} from 'pages'
import { BASEPREFIX } from 'constants/basePrefix'

export const App: FC = () => (
  <BrowserRouter basename={BASEPREFIX}>
    <Switch>
      <Route exact path="/">
        <MainPage />
      </Route>
      <Route exact path="/security-groups/add">
        <SecurityGroupsAddPage />
      </Route>
      <Route path="/security-groups/edit/:securityGroupId">
        <SecurityGroupsEditPage />
      </Route>
      <Route exact path="/security-groups/:securityGroupId?">
        <SecurityGroupsPage />
      </Route>
      <Route exact path="/networks">
        <NetworksPage />
      </Route>
      <Route exact path="/networks/add">
        <NetworksAddPage />
      </Route>
      <Route path="/networks/edit/:networkId">
        <NetworksEditPage />
      </Route>
      <Route exact path="/rules">
        <RulesPage />
      </Route>
      <Route exact path="/rules/sg-sg">
        <RulesPageSpecific id="SgSg" />
      </Route>
      <Route exact path="/rules/fqdn">
        <RulesPageSpecific id="Fqdn" />
      </Route>
      <Route exact path="/rules/editor/:securityGroupId?">
        <RulesEditorPage />
      </Route>
      <Route exact path="/graph">
        <GraphPage />
      </Route>
    </Switch>
  </BrowserRouter>
)
