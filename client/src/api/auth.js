async function login({username, password}) {
    try{
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
        if (response.status === 401){
            const serverError = new Error(JSON.stringify({ error: "Invalid username or password" }));
            serverError.status = response.status;
            throw serverError
        }

        // Validation error
        if (response.status === 422) {
            const data = await response.json();
            const serverError = new Error(JSON.stringify(data.validationErrors));
            serverError.status = response.status;
            throw serverError
        }

        const serverError = new Error(JSON.stringify({ error: 'Server error' }));
        serverError.status = response.status;
        throw serverError;
    } catch (ex) {
        if (ex.status) // HTTP error
            throw ex;
        throw new Error(JSON.stringify({ error: "Network error in login" }), { cause: ex }); // network error
    }

}

async function logout() {
    try {
        const response = await fetch('http://localhost:3001/api/sessions/current', {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok)
            return true;
        
        const serverError = new Error(JSON.stringify({ error: "Logout failed on server" }));
        serverError.status = response.status;
        throw serverError

    } catch (ex) {
        if (ex.status)
            throw ex;
        throw new Error(JSON.stringify({ error: "Network error in logout" }), { cause: ex });
    }

}

async function getCurrentUser() {
    try {
        const response = await fetch('http://localhost:3001/api/sessions/current', {
            credentials: "include"
        })
        if(response.ok)
            return await response.json()
        else
            return null
    } catch (ex) {
        console.error("Network error in getCurrentUser", {cause: ex})
    }

}

export { login, logout, getCurrentUser }