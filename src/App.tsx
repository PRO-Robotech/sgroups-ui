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
      <Route exact path="/rules-sg-sg">
        <RulesPageSpecific id="sgSg" />
      </Route>
      <Route exact path="/rules-fqdn">
        <RulesPageSpecific id="fqdn" />
      </Route>
      <Route exact path="/rules-cidr">
        <RulesPageSpecific id="cidr" />
      </Route>
      <Route exact path="/rules-cidr-icmp">
        <RulesPageSpecific id="cidrIcmp" />
      </Route>
      <Route exact path="/rules-sg-sg-icmp">
        <RulesPageSpecific id="sgSgIcmp" />
      </Route>
      <Route exact path="/rules-sg-sg-ie">
        <RulesPageSpecific id="sgSgIe" />
      </Route>
      <Route exact path="/rules-sg-sg-ie-icmp">
        <RulesPageSpecific id="sgSgIeIcmp" />
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
