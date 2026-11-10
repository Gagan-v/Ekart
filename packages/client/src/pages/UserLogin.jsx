import { setCustomer } from "../api/config";
import { apiFetch } from "../api/config";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  Stack,
} from "@mui/material";

// This page logs in an existing user by sending credentials to backend
export default function UserLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // The backend sets an HttpOnly session cookie.
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }
      localStorage.removeItem("cart");
      setCustomer(data);
      setSuccess("Logged in successfully");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-10">
      <Paper elevation={3} className="w-full max-w-md p-6">
        <Typography variant="h5" className="mb-4 font-bold text-center">
          Login
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
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Stack>
        </form>
        <Typography variant="body2" className="mt-4 text-center">
          New account? <Link to="/userregister">Sign up here</Link>
        </Typography>
      </Paper>
    </div>
  );
}
