import { FormEvent, useEffect, useMemo, useRef, useState } from "react"

type Screen = "login" | "menu" | "profile" | "budget" | "income"
type AllocationKey = "gas" | "hobbies" | "bills" | "savings" | "food"

const initialAllocations: Record<AllocationKey, number> = {
  gas: 20,
  hobbies: 10,
  bills: 35,
  savings: 10,
  food: 25,
}

const labels: Record<AllocationKey, string> = {
  gas: "Gas",
  hobbies: "Hobbies",
  bills: "Bills",
  savings: "Savings",
  food: "Food",
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M3 15.5 16 3l13 12.5M7 13v16h18V13" />
    </svg>
  )
}

function Avatar() {
  return (
    <div className="avatar" aria-hidden="true">
      <span className="avatar-head" />
      <span className="avatar-body" />
    </div>
  )
}

function AppShell({
  children,
  screen,
  goHome,
}: {
  children: React.ReactNode
  screen: Screen
  goHome: () => void
}) {
  return (
    <main className="app-shell">
      <section className="phone">
        <div className="content">{children}</div>
        {screen !== "login" && (
          <button
            className="home-button"
            onClick={goHome}
            aria-label="Go to home menu"
          >
            <HomeIcon />
          </button>
        )}
      </section>
    </main>
  )
}

export default function BudgetPlannerApp() {
  const skipAllocationSave = useRef(false)
  const [screen, setScreen] = useState<Screen>("login")
  const [username, setUsername] = useState(
    () => localStorage.getItem("budget-username") || "",
  )
  const [email, setEmail] = useState(
    () => localStorage.getItem("budget-email") || "",
  )
  const [password, setPassword] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [hasPassword, setHasPassword] = useState(
    () => localStorage.getItem("budget-has-password") === "true",
  )
  const [message, setMessage] = useState("")
  const [income, setIncome] = useState(
    () => Number(localStorage.getItem("budget-income")) || 0,
  )
  const [incomeDraft, setIncomeDraft] = useState(income ? String(income) : "")
  const [allocations, setAllocations] = useState<Record<AllocationKey, number>>(
    () => {
      try {
        return (
          JSON.parse(localStorage.getItem("budget-allocations") || "") ||
          initialAllocations
        )
      } catch {
        return initialAllocations
      }
    },
  )

  useEffect(() => {
    if (skipAllocationSave.current) {
      skipAllocationSave.current = false
      return
    }
    localStorage.setItem("budget-allocations", JSON.stringify(allocations))
  }, [allocations])

  const total = Object.values(allocations).reduce(
    (sum, value) => sum + value,
    0,
  )
  const projections = useMemo(
    () =>
      (Object.keys(allocations) as AllocationKey[]).map((key) => ({
        key,
        label: labels[key],
        percent: allocations[key],
        amount: income * (allocations[key] / 100),
      })),
    [allocations, income],
  )

  function submitAccount(event: FormEvent) {
    event.preventDefault()
    if (!username.trim() || !password.trim() || (isCreating && !email.trim())) {
      setMessage(
        isCreating
          ? "Enter an email, username, and password."
          : "Enter a username and password.",
      )
      return
    }
    localStorage.setItem("budget-username", username.trim())
    if (isCreating) localStorage.setItem("budget-email", email.trim())
    localStorage.setItem("budget-has-password", "true")
    setHasPassword(true)
    setMessage("")
    setScreen("menu")
  }

  function saveProfile(event: FormEvent) {
    event.preventDefault()
    if (!username.trim() || !email.trim() || (changingPassword && !password)) {
      setMessage("Complete all account fields before saving.")
      return
    }
    localStorage.setItem("budget-username", username.trim())
    localStorage.setItem("budget-email", email.trim())
    if (changingPassword) {
      localStorage.setItem("budget-has-password", "true")
      setHasPassword(true)
      setPassword("")
    }
    setChangingPassword(false)
    setMessage("")
    setEditingProfile(false)
  }

  function deleteAccount() {
    if (!window.confirm("Delete your account and all saved budget data? This cannot be undone.")) return

    ;["budget-username", "budget-email", "budget-has-password", "budget-income", "budget-allocations"].forEach(
      (key) => localStorage.removeItem(key),
    )
    setUsername("")
    setEmail("")
    setPassword("")
    setIncome(0)
    setIncomeDraft("")
    skipAllocationSave.current = true
    setAllocations(initialAllocations)
    setHasPassword(false)
    setChangingPassword(false)
    setEditingProfile(false)
    setIsCreating(true)
    setMessage("")
    setScreen("login")
  }

  function saveIncome(event: FormEvent) {
    event.preventDefault()
    const amount = Math.max(0, Number(incomeDraft) || 0)
    setIncome(amount)
    localStorage.setItem("budget-income", String(amount))
    setMessage("Income and allocations saved.")
  }

  function updateAllocation(key: AllocationKey, value: string) {
    const number = Math.min(100, Math.max(0, Number(value) || 0))
    setAllocations((current) => ({ ...current, [key]: number }))
    setMessage("")
  }

  return (
    <AppShell screen={screen} goHome={() => setScreen("menu")}>
      {screen === "login" && (
        <form className="login-screen" onSubmit={submitAccount}>
          <Avatar />
          <h1>{isCreating ? "Create your account" : "Welcome Back"}</h1>
          <label>
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>
          {isCreating && (
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
          )}
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isCreating ? "new-password" : "current-password"}
            />
          </label>
          {message && <p className="form-message error">{message}</p>}
          <button className="pill-button" type="submit">
            {isCreating ? "Create Account" : "Log In"}
          </button>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setIsCreating((value) => !value)
              setMessage("")
            }}
          >
            {isCreating ? "Already have an account?" : "Create an Account?"}
          </button>
        </form>
      )}

      {screen === "menu" && (
        <div className="menu-screen">
          <h1>Budget Planner</h1>
          <p>Choose where you would like to go.</p>
          <nav aria-label="Budget planner sections">
            <button onClick={() => setScreen("profile")}>Profile</button>
            <button onClick={() => setScreen("budget")}>Budget</button>
            <button onClick={() => setScreen("income")}>Income</button>
          </nav>
          <button
            className="sign-out"
            onClick={() => {
              setPassword("")
              setScreen("login")
            }}
          >
            Sign out
          </button>
        </div>
      )}

      {screen === "profile" && (
        <div className="profile-screen">
          <Avatar />
          {editingProfile ? (
            <form onSubmit={saveProfile}>
              <label>
                Username
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoFocus
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <div className="password-setting">
                <div>
                  <span>Password</span>
                  <strong>{hasPassword ? "••••••••" : "Not set"}</strong>
                </div>
                {changingPassword ? (
                  <label>
                    New password
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </label>
                ) : (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => {
                      setPassword("")
                      setChangingPassword(true)
                    }}
                  >
                    Change Password
                  </button>
                )}
              </div>
              {message && <p className="form-message error">{message}</p>}
              <div className="button-row">
                <button className="pill-button" type="submit">
                  Save
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setChangingPassword(false)
                    setPassword("")
                    setMessage("")
                    setEditingProfile(false)
                  }}
                >
                  Cancel
                </button>
              </div>
              <button className="delete-button" type="button" onClick={deleteAccount}>
                Delete Account
              </button>
            </form>
          ) : (
            <>
              <h1>{username || "Username"}</h1>
              <p className="profile-meta">
                Monthly income:{" "}
                <strong>
                  {income ? `$${income.toLocaleString()}` : "Not set"}
                </strong>
              </p>
              <button
                className="pill-button"
                onClick={() => setEditingProfile(true)}
              >
                Edit Your Account Settings
              </button>
            </>
          )}
        </div>
      )}

      {screen === "budget" && (
        <div className="budget-screen">
          <h1>Your Budget Projections</h1>
          <p className="budget-subtitle">
            {income
              ? `Based on $${income.toLocaleString()} monthly income`
              : "Add your income to see dollar projections"}
          </p>
          <div className="summary">
            <div
              className="pie"
              aria-label={`Budget allocation chart, ${total}% allocated`}
              style={{
                background: `conic-gradient(#ff646b 0 ${allocations.bills}%, #4b91e8 ${allocations.bills}% ${allocations.bills + allocations.gas}%, #45d17c ${allocations.bills + allocations.gas}% ${allocations.bills + allocations.gas + allocations.food}%, #f2be4b ${allocations.bills + allocations.gas + allocations.food}% ${allocations.bills + allocations.gas + allocations.food + allocations.savings}%, #9f72d5 ${allocations.bills + allocations.gas + allocations.food + allocations.savings}% 100%)`,
              }}
            />
            <div className="legend">
              <span>
                <i className="swatch bills" />
                Bills {allocations.bills}%
              </span>
              <span>
                <i className="swatch gas" />
                Gas {allocations.gas}%
              </span>
              <span>
                <i className="swatch food" />
                Food {allocations.food}%
              </span>
              <span>
                <i className="swatch savings" />
                Savings {allocations.savings}%
              </span>
              <span>
                <i className="swatch hobbies" />
                Hobbies {allocations.hobbies}%
              </span>
            </div>
          </div>
          <div className="projection-list">
            {projections.map((item) => (
              <div className="projection-row" key={item.key}>
                <span>{item.label}</span>
                <strong>{item.percent}%</strong>
                <b>
                  {income
                    ? `$${item.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                    : "—"}
                </b>
              </div>
            ))}
          </div>
          <button className="pill-button" onClick={() => setScreen("income")}>
            Edit Budget
          </button>
        </div>
      )}

      {screen === "income" && (
        <form className="income-screen" onSubmit={saveIncome}>
          <h1>Income &amp; Budget</h1>
          <label>
            Amount earned from your paycheck
            <span className="money-input">
              <span>$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={incomeDraft}
                onChange={(event) => setIncomeDraft(event.target.value)}
                placeholder="0.00"
              />
            </span>
          </label>
          <div className="allocation-heading">
            <p>Configure up to 100% for your budget projections</p>
            <strong className={total > 100 ? "over" : ""}>
              {total}% allocated
            </strong>
          </div>
          <div className="allocation-fields">
            {(Object.keys(allocations) as AllocationKey[]).map((key) => (
              <label key={key}>
                <span>{labels[key]}</span>
                <span className="percent-input">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={allocations[key]}
                    onChange={(event) =>
                      updateAllocation(key, event.target.value)
                    }
                  />
                  <span>%</span>
                </span>
              </label>
            ))}
          </div>
          {total > 100 && (
            <p className="form-message error">
              Reduce allocations by {total - 100}% to continue.
            </p>
          )}
          {message && total <= 100 && (
            <p className="form-message success">{message}</p>
          )}
          <button className="pill-button" type="submit" disabled={total > 100}>
            Save Budget
          </button>
        </form>
      )}
    </AppShell>
  )
}
