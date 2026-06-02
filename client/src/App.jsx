import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const API = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("haettToken"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("haettUser")) || null
  );

  const [isSignup, setIsSignup] = useState(false);
  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [adminFilter, setAdminFilter] = useState("pending");
  const [adminData, setAdminData] = useState(null);
  const [rejectReasons, setRejectReasons] = useState({});

  const [loginForm, setLoginForm] = useState({
    email: "user@haett.com",
    password: "password123",
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [applicationForm, setApplicationForm] = useState({
    partnerType: "",
    businessName: "",
    phone: "",
    website: "",
    audienceSize: "",
    description: "",
  });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const signup = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/auth/register`, signupForm);

      showToast("Account created. Please login now.");

      setLoginForm({
        email: signupForm.email,
        password: signupForm.password,
      });

      setSignupForm({
        name: "",
        email: "",
        password: "",
      });

      setIsSignup(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Signup failed");
    }
  };

  const login = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/auth/login`, loginForm);

      localStorage.setItem("haettToken", res.data.token);
      localStorage.setItem("haettUser", JSON.stringify(res.data.user));

      setToken(res.data.token);
      setUser(res.data.user);
      showToast("Logged in successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("haettToken");
    localStorage.removeItem("haettUser");

    setToken(null);
    setUser(null);
    setPartnerData(null);
    setAdminData(null);
  };

  const fetchPartner = async () => {
    if (!token || !user || user.role === "admin") return;

    setLoading(true);

    try {
      const res = await axios.get(`${API}/partner/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPartnerData(res.data);
    } catch {
      showToast("Unable to load partner data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmin = async () => {
    if (!token || !user || user.role !== "admin") return;

    setLoading(true);

    try {
      const res = await axios.get(
        `${API}/admin/applications?status=${adminFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAdminData(res.data);
    } catch {
      showToast("Unable to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartner();
    fetchAdmin();
  }, [token, user, adminFilter]);

  const submitApplication = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/applications`, applicationForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showToast("Application submitted successfully");
      fetchPartner();
    } catch (err) {
      showToast(err.response?.data?.message || "Application failed");
    }
  };

  const approveApplication = async (id) => {
    await axios.patch(
      `${API}/admin/applications/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    showToast("Application approved");
    fetchAdmin();
  };

  const rejectApplication = async (id) => {
    const reason = rejectReasons[id];
    if (!reason) return;

    await axios.patch(
      `${API}/admin/applications/${id}/reject`,
      { reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    showToast("Application rejected");
    fetchAdmin();
  };

  const toggleCode = async (id) => {
    await axios.patch(
      `${API}/admin/codes/${id}/toggle`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    showToast("Code status updated");
    fetchAdmin();
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast("Code copied");
  };

  const renderLanding = () => (
    <section className="landing">
      <div className="landing-left">
        <span className="badge">Partner Programme</span>

        <h1>Grow with Haett’s healthy meal community.</h1>

        <p>
          Influencers, gyms, businesses, and affiliates can apply to become
          Haett partners and receive exclusive discount codes to share with
          their audience.
        </p>

        <div className="feature-grid">
          <div>
            <strong>Unique Codes</strong>
            <span>Personal discount codes for partners</span>
          </div>

          <div>
            <strong>Track Usage</strong>
            <span>Monitor code performance easily</span>
          </div>

          <div>
            <strong>Quick Review</strong>
            <span>Applications reviewed by admin</span>
          </div>
        </div>
      </div>

      <form className="login-card" onSubmit={isSignup ? signup : login}>
        <h2>{isSignup ? "Create Account" : "Login"}</h2>

        <p>
          {isSignup
            ? "Create a user account and apply as a partner."
            : "Use a seeded account or create a new account."}
        </p>

        {isSignup && (
          <input
            type="text"
            placeholder="Full Name"
            value={signupForm.name}
            onChange={(e) =>
              setSignupForm({ ...signupForm, name: e.target.value })
            }
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={isSignup ? signupForm.email : loginForm.email}
          onChange={(e) =>
            isSignup
              ? setSignupForm({ ...signupForm, email: e.target.value })
              : setLoginForm({ ...loginForm, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={isSignup ? signupForm.password : loginForm.password}
          onChange={(e) =>
            isSignup
              ? setSignupForm({ ...signupForm, password: e.target.value })
              : setLoginForm({ ...loginForm, password: e.target.value })
          }
        />

        <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup
            ? "Already have an account? Login"
            : "New user? Create account"}
        </button>

        <div className="credentials">
          <p>Test user: user@haett.com</p>
          <p>Admin: admin@haett.com</p>
          <p>Password: password123</p>
        </div>
      </form>
    </section>
  );

  const renderApplicationForm = () => (
    <div className="page-card">
      <div className="section-title">
        <span>Application</span>
        <h2>Apply to become a Haett partner</h2>
        <p>Tell us about your brand, audience, and partnership type.</p>
      </div>

      <form className="form-grid" onSubmit={submitApplication}>
        <select
          value={applicationForm.partnerType}
          onChange={(e) =>
            setApplicationForm({
              ...applicationForm,
              partnerType: e.target.value,
            })
          }
        >
          <option value="">Select partner type *</option>
          <option>Affiliate</option>
          <option>Influencer</option>
          <option>Gym</option>
          <option>Corporate</option>
          <option>Partner Associate</option>
        </select>

        <input
          placeholder="Business or brand name *"
          value={applicationForm.businessName}
          onChange={(e) =>
            setApplicationForm({
              ...applicationForm,
              businessName: e.target.value,
            })
          }
        />

        <input
          placeholder="Contact phone"
          value={applicationForm.phone}
          onChange={(e) =>
            setApplicationForm({ ...applicationForm, phone: e.target.value })
          }
        />

        <input
          placeholder="Website or social link"
          value={applicationForm.website}
          onChange={(e) =>
            setApplicationForm({ ...applicationForm, website: e.target.value })
          }
        />

        <input
          placeholder="Estimated audience size"
          value={applicationForm.audienceSize}
          onChange={(e) =>
            setApplicationForm({
              ...applicationForm,
              audienceSize: e.target.value,
            })
          }
        />

        <textarea
          maxLength="500"
          placeholder="Short description, max 500 characters"
          value={applicationForm.description}
          onChange={(e) =>
            setApplicationForm({
              ...applicationForm,
              description: e.target.value,
            })
          }
        />

        <button
          className="wide-btn"
          disabled={!applicationForm.partnerType || !applicationForm.businessName}
        >
          Submit Application
        </button>
      </form>
    </div>
  );

  const renderPending = () => (
    <div className="status-page pending-status">
      <div className="status-icon">⏳</div>
      <h2>Application Under Review</h2>
      <p>Your application is being reviewed by the Haett team.</p>
      <span>
        Applied on {new Date(partnerData.application.appliedAt).toDateString()}
      </span>
      <small>You will hear back within a few business days.</small>
    </div>
  );

  const renderRejected = () => (
    <div className="status-page rejected-status">
      <div className="status-icon">❌</div>
      <h2>Application Rejected</h2>
      <p>{partnerData.application.rejectionReason}</p>

      <button onClick={() => setPartnerData({ user, application: null, codes: [] })}>
        Reapply Now
      </button>
    </div>
  );

  const renderApproved = () => {
    const codes = partnerData.codes || [];

    const totalUsed = codes.reduce((sum, code) => sum + code.usedCount, 0);
    const totalDiscount = codes.reduce(
      (sum, code) => sum + code.totalDiscount,
      0
    );

    return (
      <div className="page-card">
        <div className="section-title">
          <span>Dashboard</span>
          <h2>Partner Dashboard</h2>
          <p>
            Partner Type: {partnerData.application.partnerType} • Approved on{" "}
            {new Date(partnerData.application.approvedAt).toDateString()}
          </p>
        </div>

        <div className="stats">
          <div>
            <span>Total Codes</span>
            <strong>{codes.length}</strong>
          </div>

          <div>
            <span>Total Uses</span>
            <strong>{totalUsed}</strong>
          </div>

          <div>
            <span>Total Discount</span>
            <strong>₹{totalDiscount}</strong>
          </div>
        </div>

        <h3 className="subheading">Discount Codes</h3>

        {codes.length === 0 ? (
          <div className="empty-state">No discount codes assigned yet.</div>
        ) : (
          codes.map((code) => (
            <div className="discount-card" key={code.id}>
              <div>
                <strong>{code.code}</strong>
                <span>{code.discountValue}% off</span>
              </div>

              <p>{code.active ? "Active" : "Inactive"}</p>
              <p>Used {code.usedCount} times</p>
              <p>Expiry: {code.expiryDate || "No expiry"}</p>

              <button onClick={() => copyCode(code.code)}>Copy</button>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderAdmin = () => (
    <div className="page-card">
      <div className="section-title">
        <span>Admin</span>
        <h2>Partner Application Review Panel</h2>
        <p>
          Review applications, approve partners, reject with reasons, and manage
          codes.
        </p>
      </div>

      {adminData && (
        <div className="tabs">
          {["pending", "approved", "rejected", "all"].map((tab) => (
            <button
              key={tab}
              className={adminFilter === tab ? "active" : ""}
              onClick={() => setAdminFilter(tab)}
            >
              {tab} ({adminData.counts[tab]})
            </button>
          ))}
        </div>
      )}

      {loading && <p>Loading applications...</p>}

      <div className="admin-list">
        {adminData?.applications.map((application) => (
          <div className="admin-card" key={application.id}>
            <div className="admin-card-top">
              <div>
                <h3>{application.businessName}</h3>
                <p>
                  {application.name} • {application.email}
                </p>
              </div>

              <span className={`status-pill ${application.status}`}>
                {application.status}
              </span>
            </div>

            <div className="admin-details">
              <p>
                <b>Type:</b> {application.partnerType}
              </p>
              <p>
                <b>Social:</b> {application.website || "N/A"}
              </p>
              <p>
                <b>Audience:</b> {application.audienceSize || "N/A"}
              </p>
              <p>
                <b>Description:</b> {application.description || "N/A"}
              </p>
            </div>

            {application.status === "pending" && (
              <div className="admin-actions">
                <button onClick={() => approveApplication(application.id)}>
                  Approve
                </button>

                <input
                  placeholder="Reject reason"
                  value={rejectReasons[application.id] || ""}
                  onChange={(e) =>
                    setRejectReasons({
                      ...rejectReasons,
                      [application.id]: e.target.value,
                    })
                  }
                />

                <button
                  className="danger"
                  disabled={!rejectReasons[application.id]}
                  onClick={() => rejectApplication(application.id)}
                >
                  Confirm Reject
                </button>
              </div>
            )}

            {application.status === "approved" && (
              <div className="codes-area">
                <h4>Assigned Codes</h4>

                {application.codes.length === 0 ? (
                  <p>No codes assigned yet.</p>
                ) : (
                  application.codes.map((code) => (
                    <div className="mini-code" key={code.id}>
                      <strong>{code.code}</strong>
                      <span>{code.active ? "Active" : "Inactive"}</span>

                      <button onClick={() => toggleCode(code.id)}>
                        {code.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderUserView = () => {
    if (loading) return <div className="loading">Loading partner details...</div>;
    if (!partnerData) return <div className="loading">Loading...</div>;
    if (!partnerData.application) return renderApplicationForm();
    if (partnerData.application.status === "pending") return renderPending();
    if (partnerData.application.status === "rejected") return renderRejected();
    if (partnerData.application.status === "approved") return renderApproved();
  };

  return (
    <div className="app">
      {toast && <div className="toast">{toast}</div>}

      <nav className="navbar">
        <div className="logo">
          <span>H</span>

          <div>
            <strong>Haett</strong>
            <small>Partner Portal</small>
          </div>
        </div>

        {user && (
          <div className="user-box">
            <span>
              {user.name} • {user.role}
            </span>

            <button onClick={logout}>Logout</button>
          </div>
        )}
      </nav>

      {!token && renderLanding()}
      {token && user?.role !== "admin" && renderUserView()}
      {token && user?.role === "admin" && renderAdmin()}
    </div>
  );
}

export default App;