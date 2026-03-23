// Demo credentials
const demoCredentials = {
  username: "admin",
  password: "admin123",
};

// HTML theke input 
const userNameInput = document.getElementById("user-name-input");
const userPassInput = document.getElementById("user-pass-input");
const userSignInBtn = document.getElementById("user-signin-btn");

function handleLogin() {
  const nameVal = userNameInput.value.trim(); 
  const passVal = userPassInput.value.trim(); 

  // kono field khali check
  if (!nameVal || !passVal) {
    alert("Sob field puro korte hobe!");
    return;
  }

  if (nameVal === demoCredentials.username && passVal === demoCredentials.password) {
    alert("Login successful!");
    window.location.replace("../app.html");
  } else {
    alert("Login failed! Username ba password thik nei.");
  }
}

userSignInBtn.addEventListener("click", handleLogin);
