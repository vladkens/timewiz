import { Provider } from "jotai"
import { FC } from "react"
import { Redirect, Route, Router, Switch } from "wouter"
import { Header } from "./components/Header"
import { MainPage } from "./pages/Main"

const GoMain: FC = () => {
  return <Redirect to="/" replace />
}

export const App: FC = () => {
  return (
    <Router>
      <Provider>
        <div className="mx-auto w-[100vw] max-w-[1040px] px-2.5 pb-8">
          <Header />

          <Switch>
            {/* <Route path="/features" component={FeaturesPage} /> */}
            <Route path="/" component={MainPage} />
            <Route component={GoMain} />
          </Switch>
        </div>
      </Provider>
    </Router>
  )
}
