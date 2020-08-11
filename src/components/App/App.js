import React from "react";
import AppContainer from "components/App/AppContainer";
import { Switch, Route } from "react-router-dom";
import LandingPage from "components/LandingPage/LandingPage";

const App = () => (
    <Switch>
        <Route path="(.*)map" component={AppContainer} />
        <Route component={LandingPage} />
    </Switch>
);

export default App;
