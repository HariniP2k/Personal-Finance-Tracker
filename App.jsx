import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { FinanceProvider } from './context/FinanceContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Categories from './pages/Categories'
import Analytics from './pages/Analytics'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  useEffect(() => {
    ["log", "warn", "error"].forEach((level) => {
      const original = console[level];

      console[level] = (...args) => {
        original.apply(console, args);

        const safeArgs = args.map((a) => {
          if (a instanceof Error) {
            return {
              message: a.message,
              stack: a.stack,
              name: a.name,
            };
          }
          try {
            JSON.stringify(a);
            return a;
          } catch {
            return String(a);
          }
        });

        try {
          window.parent?.postMessage(
            { type: "iframe-console", level, args: safeArgs },
            "*"
          );
        } catch (e) {
          original("Failed to postMessage:", e);
        }
      };
    });

    window.onerror = (msg, url, line, col, error) => {
      window.parent?.postMessage(
        {
          type: "iframe-console",
          level: "error",
          args: [
            msg,
            url,
            line,
            col,
            error ? { message: error.message, stack: error.stack } : null,
          ],
        },
        "*"
      );
    };

    window.onunhandledrejection = (event) => {
      const reason =
        event.reason instanceof Error
          ? { message: event.reason.message, stack: event.reason.stack }
          : event.reason;

      window.parent?.postMessage(
        {
          type: "iframe-console",
          level: "error",
          args: ["Unhandled Promise Rejection:", reason],
        },
        "*"
      );
    };
  }, []);

  return (
    <ErrorBoundary>
      <FinanceProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </Layout>
        </Router>
      </FinanceProvider>
    </ErrorBoundary>
  )
}

export default App