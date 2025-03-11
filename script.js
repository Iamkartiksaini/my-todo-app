const taskInputElem = document.querySelector(".input");
const addBtn = document.querySelector(".add-btn");

const taskContainer = document.querySelector(".tasks-cont");
const mainTask = document.querySelector(".main-task");
const messageElem = document.querySelector(".message");

const err = document.querySelector(".err");
const addedTasks = JSON.parse(localStorage.getItem("tasks"));
let allTasksObj = addedTasks || [];

//chat box

const chatWindow = document.querySelector(".chat-window");
const geminiIcon = document.querySelector(".gemini-icon");
const closeChat = document.querySelector(".close-chat");
const chatTextContainer = document.querySelector(".chat-text-cont");
const chatInput = document.querySelector("#chat_input");
const sendAIBtn = document.querySelector("#sendbtn");
//api crendentials
const apiKey = `AIzaSyBl1SR9HQxr5zP-APDwdmvwn07Whua68DE`;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
if (allTasksObj.length === 0) {
  messageElem.classList.add("block");
  messageElem.classList.remove("none");
} else {
  messageElem.classList.remove("block");
  messageElem.classList.add("none");
}
loopOverTasks();
// generating task and appending in the ui

function showingTaskInUi(e) {
  if (taskInputElem.value) {
    messageElem.classList.add("none");
    console.log(allTasksObj);

    allTasksObj.unshift({ task: taskInputElem.value, state: false });
    taskContainer.innerHTML = "";
    loopOverTasks();
    console.log(allTasksObj);
    localStorage.setItem("tasks", JSON.stringify(allTasksObj));
    taskInputElem.value = "";

    if (allTasksObj.length === 0) {
      messageElem.classList.add("block");
      messageElem.classList.remove("none");

      console.log("chal gaya");
    } else {
      messageElem.classList.remove("block");
      messageElem.classList.add("none");
    }
    err.classList.add("hidden");
  } else {
    err.classList.remove("hidden");
  }
}
window.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    showingTaskInUi(e);
  }
});
addBtn.addEventListener("click", (e) => {
  showingTaskInUi(e);
});

function generateTask(task, state) {
  const taskElem = document.createElement("div");
  taskElem.classList.add("task");
  if (state) {
    taskElem.classList.add("completed");
  }
  taskElem.innerHTML = `
              <div class="main-task flex align-center">
                <div class="tick flex justify-center align-center">
                  <img src="tick.svg" class="check-icon" alt="" />
                </div>
                <p class="task-text">${task}</p>

              </div>
            <div class="icons">
            <div class="ai">
                <i class="ri-gemini-fill"></i>
              </div>
              <div class="cross-icon delete">
                <i class="ri-add-line "></i>
              </div>
          </div>
            `;
  taskContainer.append(taskElem);
}

let aires = "";
//handling clicks
taskContainer.addEventListener("click", (event) => {
  async function handelClicks() {
    if (event.target.classList.contains("main-task")) {
      event.target.classList.toggle("completed");
      const childrens = Array.from(taskContainer.children);
      const taskIndex = childrens.indexOf(event.target.parentElement);
      if (allTasksObj[taskIndex].state === true) {
        allTasksObj[taskIndex].state = false;
        localStorage.setItem("tasks", JSON.stringify(allTasksObj));
        taskContainer.innerHTML = "";
        loopOverTasks();
      } else {
        allTasksObj[taskIndex].state = true;
        localStorage.setItem("tasks", JSON.stringify(allTasksObj));
        taskContainer.innerHTML = "";
        loopOverTasks();
      }
    } else if (event.target.classList.contains("delete")) {
      const childrens = Array.from(taskContainer.children);
      console.log(childrens);
      const taskIndex = childrens.indexOf(
        event.target.parentElement.parentElement
      );
      allTasksObj.splice(taskIndex, 1);
      localStorage.setItem("tasks", JSON.stringify(allTasksObj));

      taskContainer.innerHTML = ""; //container ko empty karna
      loopOverTasks();
      if (allTasksObj.length === 0) {
        messageElem.classList.add("block");
        messageElem.classList.remove("none");
      } else {
        messageElem.classList.remove("block");
        messageElem.classList.add("none");
      }
    } else if (event.target.classList.contains("ai")) {
      const children = Array.from(taskContainer.children);
      const taskIndex = children.indexOf(
        event.target.parentElement.parentElement
      );
      let aiRes = await getResponse(allTasksObj[taskIndex].task);

      document.querySelector("header").classList.add("none");
      chatWindow.id = taskIndex;
      chatWindow.classList.remove("none");
      geminiIcon.classList.remove("none");
      generateTextUi(allTasksObj[taskIndex].task, "user");
      generateTextUi(aiRes, "ai");
    }
  }
  handelClicks();
});

function loopOverTasks() {
  allTasksObj.forEach((e) => {
    generateTask(e.task, e.state);
  });
}
chatInput.addEventListener("input", (e) => {
  const val = e.target.value;
  if (val.length === 0) {
    sendAIBtn.setAttribute("disabled", true);
  } else {
    sendAIBtn.setAttribute("disabled", false);
  }
});

function generateTextUi(text, role) {
  const textElem = document.createElement("div");
  textElem.classList.add("chatbot-text-cont");
  textElem.innerHTML = text;

  if (role === "ai") {
    textElem.innerHTML = `<i class="ri-gemini-fill"></i>
              <p class="chat-text">${text}</p>`;
  }
  if (role === "user") {
    textElem.classList.add("user-req");
    textElem.innerHTML = `
              <p class="chat-text">${text}</p>`;
  }
  chatTextContainer.append(textElem);
  scrollToBottom();
}
//fetching data  from ai gemini
async function getResponse(taskText) {
  try {
    let response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `you are my assistant in completing my todos help me with this task '${taskText}' in 1000 characters or less`,
              },
            ],
          },
        ],
      }),
    });
    let data = await response.json();
    return await data.candidates[0].content.parts[0].text;
  } catch (err) {
    return err;
  }
}

// hiding and showing the chat window and gemini icon
closeChat.addEventListener("click", () => {
  chatWindow.classList.add("none");
  geminiIcon.classList.add("none");
  document.querySelector("header").classList.remove("none");
});

//auto scroll chat
function scrollToBottom() {
  chatTextContainer.scrollTop = chatTextContainer.scrollHeight;
}

// send button click
window.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    sendUserMessage();
  }
});
sendAIBtn.addEventListener("click", sendUserMessage);

async function sendUserMessage() {
  try {
    const isBtnDisabled = sendAIBtn.getAttribute("disabled");
    if (isBtnDisabled) return;
    sendAIBtn.setAttribute("disabled", true);
    const textValue = `${chatInput.value}`;
    chatInput.value = "Loading....";
    if (textValue !== "") {
      generateTextUi(textValue, "user");
      let aiRes = await wait(3000);
      generateTextUi(aiRes, "ai");
      chatInput.value = "";
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    sendAIBtn.setAttribute("disabled", false);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
