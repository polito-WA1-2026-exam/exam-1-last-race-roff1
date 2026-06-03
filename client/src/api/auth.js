async function login(username, password) {
    const response = await fetch('http://localhost:3001/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });

    if (response.ok) {
        return await response.json();
    }

    // Unauthorized
    if (response.status === 401) {
        const msg = response.headers.get("WWW-Authenticate");
        throw new Error(msg || "Invalid username or password");
    }

    // Validation error
    if (response.status === 422) {
        const data = await response.json();
        throw new Error(JSON.stringify(data.validationErrors));
    }

    throw new Error("Server error");
}

async function getCurrentUser() {

}

export { getCurrentUser }