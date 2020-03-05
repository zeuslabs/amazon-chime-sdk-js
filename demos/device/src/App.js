import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import RoomProvider from './containers/RoomProvider';
import RoomShim from './shim/Room';
import Meeting from './views/Meeting';
import Home from './views/Home';
import Controller from './views/Controller';
import ControllerShim from './shim/Controller';

import routes from './routes';

import './App.css';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path={routes.CONTROLLER}>
          <ControllerShim />
          <Controller />
        </Route>
        <Route path={routes.ROOT}>
          <RoomShim />
          <RoomProvider />
          <Route path={routes.MEETING} component={Meeting} />
          <Route path={routes.ROOT} exact component={Home} />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
