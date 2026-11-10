import { apiFetch } from "../api/config";
import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Account Settings page
// Shows current username and email. Allows updating username and password.
// Profile updates use the verified HttpOnly customer session.
export default function Account() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    apiFetch("/api/auth/me").then(async (response) => {
      if (response.status === 401) { navigate("/login"); return; }
      if (!response.ok) throw new Error("Could not load your account");
      const user = await response.json();
      if (active) { setUsername(user.name || ""); setEmail(user.email || ""); }
    }).catch((error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password && password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // The backend selects the account from the verified session.
      const body = { name: username };
      if (password) { body.password = password; body.currentPassword = currentPassword; }
      const res = await apiFetch("/api/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Update failed");
      // Update localStorage with latest profile
      localStorage.setItem(
        "authUser",
        JSON.stringify({ id: data._id, name: data.name, email: data.email })
      );

      // Dispatch custom event to notify navbar of user data update
      window.dispatchEvent(
        new CustomEvent("authStateChanged", {
          detail: {
            isLoggedIn: true,
            user: { id: data._id, name: data.name, email: data.email },
          },
        })
      );

      // Cart stays unchanged here; account update is independent
      setSuccess("Account updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setPassword("");
      setCurrentPassword("");
      setConfirm("");
    }
  };

  return (
    <div className="flex items-center justify-center py-10">
      <Paper elevation={3} className="w-full max-w-md p-6">
        <Typography variant="h5" className="mb-4 font-bold text-center">
          Account Settings
        </Typography>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" className="mb-4">
            {success}
          </Alert>
        )}
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
            />
            <TextField label="Email" value={email} fullWidth disabled />
            <TextField label="Current password (required to change password)" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
            <TextField
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
