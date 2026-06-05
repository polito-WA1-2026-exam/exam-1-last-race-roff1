async function login({username, password}) {
    const response = await fetch('http://localhost:3001/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });

    if (response.ok)
        return await response.json();

    // Unauthorized
    if (response.status === 401)
        throw new Error(JSON.stringify({ error: "Invalid username or password" }));

    // Validation error
    if (response.status === 422) {
        const data = await response.json();
        throw new Error(JSON.stringify(data.validationErrors));
    }

    throw new Error(JSON.stringify({ error: 'Server error' }));
}

async function logout() {
    const response = await fetch('http://localhost:3001/api/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    })

    if (response.ok)
        return true
    else 
        throw new Error("Login failed")
}

async function getCurrentUser() {
    const response = await fetch('http://localhost:3001/api/sessions/current', {
        credentials: "include"
    })
    if(response.ok)
        return await response.json()
    else
        return null
}

export { login, logout, getCurrentUser }