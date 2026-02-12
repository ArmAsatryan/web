import { Router, Route, Switch } from "wouter";
import { ThemeContext, useThemeProvider } from "@/hooks/use-theme";
import { I18nContext, useI18nProvider } from "@/hooks/use-i18n";
import { HomePage } from "@/pages/HomePage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicy";
import { TermsOfServicePage } from "@/pages/TermsOfService";
import NotFound from "@/pages/not-found";

function App() {
  const themeValue = useThemeProvider();
  const i18nValue = useI18nProvider();

  return (
    <ThemeContext.Provider value={themeValue}>
      <I18nContext.Provider value={i18nValue}>
        <Router>
          <Switch>
            <Route path="/privacy-policy" component={PrivacyPolicyPage} />
            <Route path="/terms-of-service" component={TermsOfServicePage} />
            <Route path="/" component={HomePage} />
            <Route path="/:rest+" component={NotFound} />
          </Switch>
        </Router>
      </I18nContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;