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
// We removed JWT for users; we identify the user by sending their DB id in the request body or header.
export default function Account() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load current user from localStorage (our session-like store)
    const raw = localStorage.getItem("authUser");
    if (!raw) return navigate("/login");
    try {
      const u = JSON.parse(raw);
      setUsername(u.name || "");
      setEmail(u.email || "");
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password && password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    const raw = localStorage.getItem("authUser");
    if (!raw) {
      setError("Please login again");
      return navigate("/login");
    }
    const u = JSON.parse(raw);
    setLoading(true);
    try {
      // Only send fields we allow to update: name and password, plus userId
      const body = { userId: u.id, name: username };
      if (password) body.password = password;
      const res = await fetch("http://localhost:5000/api/auth/update", {
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
