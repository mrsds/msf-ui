import React from "react";
import AppContainer from "components/App/AppContainer";
import { Switch, Route } from "react-router-dom";
import LandingPage from "components/LandingPage/LandingPage";

const App = () => (
    <Switch>
        <Route component={LandingPage} />
        <Route path="/map" component={AppContainer} />
    </Switch>
);

export default App;
