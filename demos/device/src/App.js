import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import RoomProvider from './room/containers/RoomProvider';
import RoomShim from './shim/RoomShim';
import Meeting from './room/views/Meeting';
import Home from './room/views/Home';
import Controller from './controller/views/Controller';
import ControllerShim from './shim/ControllerShim';
import routes from './routes';

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
