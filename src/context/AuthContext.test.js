import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import * as authService from "../api/authService";

jest.mock("../api/authService");

// Helper component to consume and display auth context values
function AuthConsumer({ onRender }) {
  const auth = useAuth();
  if (onRender) onRender(auth);
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="isAuthenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="user">{JSON.stringify(auth.user)}</span>
      <span data-testid="token">{auth.token || ""}</span>
      <button data-testid="login-btn" onClick={() => auth.login("tok123", { id: "1", email: "a@b.com", firstName: "A", lastName: "B", role: "admin" })}>Login</button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("AuthContext", () => {
  test("initial state with no stored token sets loading false and user null", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  test("validates stored token by calling getProfile on mount", async () => {
    localStorage.setItem("token", "valid-token");
    authService.getProfile.mockResolvedValue({
      data: { user: { id: "1", email: "test@test.com", firstName: "Test", lastName: "User", role: "admin" } },
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(authService.getProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    expect(screen.getByTestId("user").textContent).toContain("test@test.com");
  });

  test("clears token if getProfile fails on mount", async () => {
    localStorage.setItem("token", "expired-token");
    authService.getProfile.mockRejectedValue(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  test("login stores token in localStorage and sets user state", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    await act(async () => {
      screen.getByTestId("login-btn").click();
    });

    expect(localStorage.getItem("token")).toBe("tok123");
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    expect(screen.getByTestId("token").textContent).toBe("tok123");
    expect(screen.getByTestId("user").textContent).toContain('"email":"a@b.com"');
  });

  test("logout calls signOut API, removes token, and clears user", async () => {
    authService.signOut.mockResolvedValue({});

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    // First login
    await act(async () => {
      screen.getByTestId("login-btn").click();
    });
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");

    // Then logout
    await act(async () => {
      screen.getByTestId("logout-btn").click();
    });

    expect(authService.signOut).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  test("logout clears state even if signOut API fails", async () => {
    authService.signOut.mockRejectedValue(new Error("Network error"));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    await act(async () => {
      screen.getByTestId("login-btn").click();
    });

    await act(async () => {
      screen.getByTestId("logout-btn").click();
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
  });

  test("useAuth throws when used outside AuthProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow("useAuth must be used within an AuthProvider");
    consoleError.mockRestore();
  });
});
