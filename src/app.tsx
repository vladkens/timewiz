import { Provider } from "jotai"
import { FC } from "react"
import { Redirect, Route, Router, Switch } from "wouter"
import { Header } from "./components/Header"
import { MainPage } from "./pages/Main"

const GoIndex: FC = () => {
  return <Redirect to="/" replace />
}

export const App: FC = () => {
  return (
    <Router>
      <Provider>
        <Header />

        <Switch>
          {/* <Route path="/features" component={FeaturesPage} /> */}
          <Route path="/" component={MainPage} />
          <Route component={GoIndex} />
        </Switch>
      </Provider>
    </Router>
  )
}
