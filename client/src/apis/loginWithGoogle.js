export const loginWithGoogle = async (idToken) => {
  const BASE_URL = "http://localhost:4000";
  try {
    const response = await fetch(`${BASE_URL}/user/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error logging in with Google:", error);
  }
};
