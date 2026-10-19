
import { supabase } from "./supabaseClient.js";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const authMessage = document.getElementById("authMessage");

function showMessage(message, type = "error") {
    if (!authMessage) return;

    authMessage.textContent = message;
    authMessage.classList.toggle("success", type === "success");
}

function setLoading(form, isLoading, normalText, loadingText) {
    const button = form.querySelector('button[type="submit"]');

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : normalText;
}

// If the user already has a session, send them to the main page.
const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

if (sessionError) {
    showMessage("We couldn't check your session. Please try again.");
} else if (sessionData.session) {
    window.location.replace("./index.html");
}

// LOGIN
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        showMessage("");

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        setLoading(loginForm, true, "Log In", "Logging in...");

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                showMessage("Login failed. Check your email and password, then try again.");
                return;
            }

            window.location.replace("./index.html");
        } catch (error) {
            console.error("Login error:", error);
            showMessage("Something went wrong. Check your connection and try again.");
        } finally {
            setLoading(loginForm, false, "Log In", "Logging in...");
        }
    });
}

// SIGN UP
if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        showMessage("");

        const fullNameInput = document.getElementById("signupName");
const emailInput = document.getElementById("signupEmail");
const passwordInput = document.getElementById("signupPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");

const missingFields = [];

if (!fullNameInput) missingFields.push("signupName");
if (!emailInput) missingFields.push("signupEmail");
if (!passwordInput) missingFields.push("signupPassword");
if (!confirmPasswordInput) missingFields.push("confirmPassword");

if (missingFields.length > 0) {
    showMessage("Missing HTML field IDs: " + missingFields.join(", "));
    console.error("Missing signup fields:", missingFields);
    return;
}


const fullName = fullNameInput.value.trim();
const email = emailInput.value.trim();
const password = passwordInput.value;
const confirmPassword = confirmPasswordInput.value;
        if (!fullName) {
            showMessage("Please enter your full name.");
            return;
        }

        if (password.length < 8) {
            showMessage("Your password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Your passwords do not match.");
            return;
        }

        setLoading(signupForm, true, "Create Account", "Creating account...");

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) {
                showMessage(error.message);
                return;
            }

            if (data.session) {
                showMessage("Account created successfully. Opening your feed...", "success");
                window.location.replace("./index.html");
            } else {
                showMessage(
                    "Account created. Check your email for a confirmation link before logging in.",
                    "success"
                );
            }
        } catch (error) {
            console.error("Signup error:", error);
            showMessage("Something went wrong. Check your connection and try again.");
        } finally {
            setLoading(signupForm, false, "Create Account", "Creating account...");
        }
    });
}

