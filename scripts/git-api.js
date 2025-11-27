async function verifyGitHubToken(token) {
    const res = await fetch("https://api.github.com/user", {
        headers: { "Authorization": "Bearer " + token }
    });
    return res.status !== 401;
}

async function getGitHubToken(localStorageKey) {
    let token = localStorage.getItem(localStorageKey)
    while (true) {
        let valid = await verifyGitHubToken(token);
        if (valid) {
            localStorage.setItem(localStorageKey, token);
            return token
        }
        token = prompt("No valid GitHub PAT, insert one:");
    }
}

async function loadGitRepositoryAsync(repoUrl, filePath, branch) {
    if (!repoUrl) throw new Error("No repo selected")
    if (!filePath) throw new Error("No file selected")
    if (!branch) throw new Error("No branch selected")

    let sha = null;
    let token = await getGitHubToken("github_pat");

    async function pullJSONAsync() {
        const response = await fetch(
            `${repoUrl}/contents/${filePath}?ref=${branch}`,
            { headers: { "Authorization": "Bearer " + token } }
        );
        const data = await response.json();
        if (!data.content) throw new Error(JSON.stringify(data, null, 2));

        sha = data.sha;

        const decoded = atob(data.content.replace(/\n/g, ""));
        return JSON.parse(decoded);
    }
    async function pushJSONAsync(jsonObj, message) {
        if (!sha) throw new Error("No SHA pulled");

        const content = btoa(JSON.stringify(jsonObj, null, 2));
        const response = await fetch(
            `${repoUrl}/contents/${filePath}`,
            {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({message, branch, content, sha})
            }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(data, null, 2));
        // Sha = last file encoding to tell GitHub that im up-to-date on push
        sha = data.content.sha;
    }

    return {
        pullJSONAsync,
        pushJSONAsync,
        src: {
            repoUrl,
            filePath,
            branch
        }
    };
}
