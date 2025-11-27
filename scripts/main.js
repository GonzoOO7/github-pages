let repository = null
let todos = [];

const log = document.getElementById("log");
const originalLog = console.log
console.log = (val) => {
    originalLog(val)
    log.textContent = val + ""
}
const listElement = document.getElementById("list");

// Render les items inside the "todolist" :)
function rerender() {
    listElement.innerHTML = "";
    todos.forEach((item, i) => {
        const row = document.createElement("div");

        const text = document.createElement("span");
        text.textContent = item;   // SAFE — auto-escapes

        const btn = document.createElement("button");
        btn.textContent = "x";
        btn.onclick = _=>{
            todos.splice(i,1)
            rerender()
        };

        row.append(text, btn);
        listElement.appendChild(row);
    });
}

// add
document.getElementById("addBtn").onclick = () => {
    const val = document.getElementById("newTodo").value.trim();
    if (!val) return;
    todos.push(val);
    document.getElementById("newTodo").value = "";
    rerender();
};

// pull
const pullBtn = document.getElementById("pullBtn")
pullBtn.onclick = async () => {
    try {
        console.log("[NOM] Pulling…")
        try {
            todos = await repository.pullJSONAsync();
        } catch {
            todos = [];
        }
        rerender();
        console.log("[NOM] Pulled successfully!")
    } catch (e) {
        console.log("[NOM] Pull failed:\n" + e.message)
    }
};

// push
document.getElementById("pushBtn").onclick = async () => {
    try {
        console.log("Pushing…")
        await repository.pushJSONAsync(todos, "Updated todos");
        console.log("[YEET] Pushed successfully!")
    } catch (e) {
        console.log("[YEET] Push failed:\n" + e.message)
    }
};

// actually load repo o.o -> ima do it last cuz otherwise I don't have the button :)
loadGitRepositoryAsync(
    "https://api.github.com/repos/GonzoOO7/http-test",
    "todo.json",
    "data"
).then(res => {
    repository = res
    try {
        // Try pulling initially, so you don't have to manually :)
        pullBtn.click()
        // pullBtn.disabled = true
    } catch {
        console.log("hehe")
    }
})