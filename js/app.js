// dom elements
const btnGroup = document.querySelector(".btn-grp");
const issueCount = document.getElementById("issue-count");
const userSearchInput = document.getElementById("user-search-input");
const popUp = document.getElementById("popup-info");

// issues store
const issues = {
  all: [],
  open: [],
  closed: [],
};

// priority colors
const priorityClass = {
  high: "badge-error",
  medium: "badge-warning",
  low: "badge-info",
};

// label colors
const labelsWithClass = {
  bug: "badge-error border-error",
  "help wanted": "badge-warning border-warning",
  enhancement: "badge-success border-success",
  "good first issue": "badge-secondary border-secondary",
  documentation: "badge-info border-info",
};

// filter buttons
btnGroup.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn) return;

  const target = btn.dataset.target;
  if (!target) return;

  for (let b of btnGroup.children) {
    b.classList.remove("filter_btn_active");
  }
  btn.classList.add("filter_btn_active");

  renderData(issues[target]);
  updateIssueCount(issues[target]);
});

// issue count
function updateIssueCount(target) {
  issueCount.textContent =
    target.length < 10 && target.length > 0
      ? "0" + target.length
      : target.length;
}

// fetch issues
async function fetchIssues(end, target) {
  renderData([], true);

  try {
    const res = await fetch(
      `https://phi-lab-server.vercel.app/api/v1/lab/${end || "issues/"}`,
    );
    const json = await res.json();
    const data = json.data;

    issues.all = data;
    issues.open = issues.all.filter((issue) => issue.status === "open");
    issues.closed = issues.all.filter((issue) => issue.status === "closed");

    renderData(issues[target] || issues.all);
    updateIssueCount(issues[target] || issues.all);

    return json.data;
  } catch (error) {
    console.log(error);
  }
}

// render cards
function renderData(list, isLoading = false) {
  const parentContainer = document.getElementById("all");

  // loader
  if (isLoading) {
    parentContainer.innerHTML = `
      <div class="col-span-full flex justify-center items-center py-20">
        <span class="loading loading-spinner loading-lg text-[#4a00ff]"></span>
      </div>`;
    return;
  }

  parentContainer.innerHTML = list
    .map((issue) => {
      return `
        <div onclick="handlePopUp(${issue.id})" class="shadow bg-white rounded-md border-t-3 ${
          issue.status === "open" ? "border-success" : "border-purple-500"
        }  hover:shadow cursor-pointer">
          <div class="px-4 pt-4 h-fit">
            <div class="flex items-center justify-between mb-3">
              <img src="./assets/${issue.status}-status.png" />
              <div class="badge ${priorityClass[issue.priority]} badge-soft uppercase px-6 font-medium">
                ${issue.priority}
              </div>
            </div>
            <h2 class="text-sm font-semibold text-black">${issue.title}</h2>
            <p class="my-2 text-[12px] text-[#64748b]">${issue.description}</p>
            <div class="my-3 flex gap-2 flex-wrap">
              ${issue.labels
                .map(
                  (label) =>
                    `<div class="badge w-fit ${labelsWithClass[label] || "bg-fuchsia-50 border-fuchsia-400"} badge-soft px-2 font-semibold uppercase rounded-full">
                      <img src="./assets/${label}.png" class="w-3 h-3" />
                      <span class="-ms-1">${label}</span>
                    </div>`,
                )
                .join("")}
            </div>
          </div>
          <div class="divider my-0"></div>
          <div class="px-4 pb-4 pt-2">
            <p class="text-[#64748b] text-[12px]"># ${issue.id} ${issue.author}</p>
            <p class="text-[#64748b] text-[12px]">${new Date(issue.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

// search

userSearchInput.addEventListener("input", (e) => {
  const searchText = e.target.value.trim();
  if (searchText) {
    fetchIssues(`issues/search?q=${searchText}`);
  } else {
    fetchIssues();
  }
});

// close popup
function closePopUp() {
  popUp.classList.add("hidden");
  popUp.innerHTML = "";
}

// open popup
async function handlePopUp(id) {
  popUp.classList.toggle("hidden");

  const res = await fetch(
    `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`,
  );
  const json = await res.json();
  const data = json.data;

  popUp.innerHTML = `
    <div class="card bg-white shadow-md w-[520px] p-6 rounded-xl">
      <h2 class="text-xl font-bold text-gray-900 mb-2">${data.title}</h2>
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span class="badge badge-${data.status === "open" ? "success" : "error"} text-white text-xs font-semibold px-3 py-1 rounded-full">${data.status}</span>
        <span>• Opened by ${data.author} • ${new Date(data.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="flex gap-2 mb-4">
        ${data.labels
          .map(
            (label) => `
          <span class="badge badge-outline text-xs font-medium gap-1">
            <img src="./assets/${label}.png" class="w-3 h-3" />
            ${label.toUpperCase()}
          </span>`,
          )
          .join("")}
      </div>
      <p class="text-gray-600 text-sm mb-5 leading-relaxed">${data.description}</p>
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start justify-between mb-5">
        <div>
          <p class="text-xs text-gray-500 mb-1">Assignee:</p>
          <p class="text-sm font-semibold text-gray-900">${data.assignee || "Not found"}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">Priority:</p>
          <span class="badge ${priorityClass[data.priority]} text-white text-xs font-semibold px-3 py-1 rounded-full">${data.priority.toUpperCase()}</span>
        </div>
      </div>
      <div class="flex justify-end">
        <button class="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none px-6 rounded-lg text-sm font-medium" onclick="closePopUp()">
          Close
        </button>
      </div>
    </div>
  `;
}

// close outside click
popUp.addEventListener("click", (e) => {
  if (!e.target.closest(".card")) {
    closePopUp();
  }
});

fetchIssues();
updateIssueCount(issues["all"]);
