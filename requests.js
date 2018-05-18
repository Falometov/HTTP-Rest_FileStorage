const ip = location.origin;
let globalTarget;
let stack = [];
const contentDir = document.querySelector(".contentDir");
const butShowContent = document.getElementById("showContent");
// const butAddData = document.getElementById("addData");
const butRewriteData = document.getElementById("rewriteData");
const deleteFile = document.getElementById("deleteFile");
const copyFile = document.getElementById("copyFile");
const moveFile = document.getElementById("moveFile");
const pasteFile = document.getElementById("pasteFile");
const downloadFile = document.getElementById("downloadFile");
const currentLocation = document.body.querySelector(".currentLocation__content");

// butAddData.addEventListener("click", handlerPOST);
butRewriteData.addEventListener("click", handlerPUT);
deleteFile.addEventListener("click", handlerDELETE);
copyFile.addEventListener("click", handlerCOPY);
moveFile.addEventListener("click", handlerMOVE);
pasteFile.addEventListener("click", handlerPASTE);
downloadFile.addEventListener("click", handlerDownload);
let area = document.querySelector("textarea");
const listDir = document.querySelector(".contentDir ul");
const prevclick = document.querySelector("#prev");
prevclick.addEventListener("click", handlerPrev);

function getCurrentDirectory(stack){
    if (stack[stack.length-1] ===""){
        stack.pop();
    }
    return stack.reduce((prev, cur, i) => {
        return prev + "/" + cur;
    });
}
let curDir = "";
handlerGET("Home");
let globalresponse = {};
function handlerGET(dir) {
    var myNode = document.querySelector(".contentDir ul");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    if (stack[stack.length - 1] !== dir) {
        stack.push(dir);
    }
    curDir = getCurrentDirectory(stack);
    currentLocation.textContent = "Вы находитесь в директории : "+curDir;
    fetch(`${ip}/?data=${curDir}`, { method: 'GET' }).then(data => data.json())
        .then(function (response) {
            globalresponse = response;
            response.forEach(el => {
                const img = document.createElement("img");
                const div = document.createElement("div");
                const span = document.createElement("span");
                div.className = "folder";
                div.setAttribute("data-dir", el.nameFile);
                if (el.nameFile.includes(".")) {
                    const expansion = el.nameFile.split(".").pop();
                    const expansionsImage = ["jpg", "jpeg", "png", "gif", "tiff"];
                    const expansionsVideos = ["mov", "mp4", "mpeg", "mpg"];
                    const expansionsAudio = ["mp3", "ogg", "bin", "wav", "wave"];
                    const expansionsArchives = ["rar", "zip", "tgz", "xar", "tar-gz"];
                    const expansionsInfo = ["inf"];
                    const expansionsInfo = ["exe", "bin"];
                    switch (true) {
                        case (expansionsImage.includes(expansion)): {
                            img.src = "Images/ImagesImage.png";
                            break;
                        }
                        case (expansionsVideos.includes(expansion)): {
                            img.src = "Images/VideosImage.png";
                            break;
                        }
                        case (expansionsAudio.includes(expansion)): {
                            img.src = "Images/AudioImage.png";
                            break;
                        }
                        case (expansionsArchives.includes(expansion)): {
                            img.src = "Images/archivesImage.png";
                            break;
                        }
                        case (expansionsInfo.includes(expansion)): {
                            img.src = "Images/InfoImage.png";
                            break;
                        }
                        case (expansionsExe.includes(expansion)): {
                            img.src = "Images/ExeImage.png";
                            break;
                        }
                        default: {
                            img.src = "Images/fileImage.png";
                        }
                    }
                    img.classList.add("file");
                }
                else {
                    img.src = "Images/folderImage.png";
                    img.classList.add("folder");
                }
                img.setAttribute("data-dir", el.nameFile);
                img.width = 50;
                img.height = 50;
                span.textContent = el.nameFile;
                span.className = "nameFolder";
                div.appendChild(img);
                div.appendChild(span);
                const li = document.createElement("li");
                li.appendChild(div);
                listDir.appendChild(li);
            });

        })
}


contentDir.addEventListener("dblclick", handlerOpenFolder)
function handlerOpenFolder(event) {
    const target = event.target;

    if (target.className === "folder") {
        handlerGET(target.dataset.dir);
        area.value = "";
        area.style.display = "none";
    } else
        if (target.className === "file") {
            globalTarget = target;
            const expansion = target.dataset.dir.split(".").pop();
            if (expansion === "txt") {
                globalresponse.forEach((el) => {
                    if (el.nameFile === target.dataset.dir) {
                        area.value = el.valueFile;
                        area.style.display = "block";
                        return;
                    }
                })
            }

        }
    return;
}

contentDir.addEventListener("click", handlerGetTarget)
function handlerGetTarget(event) {
    const target = event.target;
    if (!target.dataset.dir)
        return;
    target.tabIndex = 0;
    target.focus();
    globalTarget = target;
}

function handlerPrev(event) {
    if (stack.length !== 1) {
        area.value = "";
        area.style.display = "none";
        stack.pop();
        handlerGET(stack.pop());
    }
}

function handlerPOST(event) {
    let target = event.target;
    let curDir = sgetCurrentDirectory(stack);
    let data = {
        nameFile: curDir + "/" + globalTarget.dataset.dir,
        valueFile: area.value
    }

    fetch(`${ip}?data=${JSON.stringify(data)}`, { method: 'POST', }).then(data => data.json())
        .then(function (response) {
            if (response) {
                area.value = "";
                area.style.display = "none";
                handlerGET("");
                alert("Данные успешно изменены");
            }
        })
}

function handlerPUT(event) {
    let target = event.target;
    let curDir = getCurrentDirectory(stack);
    let data = {
        nameFile: curDir + "/" + globalTarget.dataset.dir,
        valueFile: area.value
    }

    fetch(`${ip}?data=${JSON.stringify(data)}`, { method: 'PUT', }).then(data => data.json())
        .then(function (response) {
            if (response) {
                area.value = "";
                area.style.display = "none";
                handlerGET("");
                alert("Данные успешно изменены");
            }
        })
}
function handlerDownload() {
    let curDir = getCurrentDirectory(stack);

    curDir = curDir + "/" + globalTarget.dataset.dir;
    fetch(`${ip}?data=${curDir}&down=true`, { method: 'GET', }).then(data => data.blob())
        .then(function (response) {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            let url = window.URL.createObjectURL(response);
            a.href = url;
            a.download = globalTarget.dataset.dir;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        })
}

function handlerDELETE(event) {
    let target = event.target;
    let curDir = getCurrentDirectory(stack);

    curDir = curDir + "/" + globalTarget.dataset.dir;

    fetch(`${ip}?data=${curDir}`, { method: 'DELETE', }).then(data => data.json())
        .then(function (response) {
            if (response) {
                area.value = "";
                area.style.display = "none";
                handlerGET("");
                alert("Файл удален");
            }
        })
}
let dataToCopy;
let action = "";
function handlerCOPY() {
    let curDir = getCurrentDirectory(stack);
    let value = "";
    if (globalTarget.className !== "file")
        return;
    globalresponse.forEach((el) => {
        if (el.nameFile === globalTarget.dataset.dir) {
            value = el.valueFile;
            return;
        }
    })
    let data = {
        nameFile: globalTarget.dataset.dir,
        valueFile: value
    }
    dataToCopy = data;
    action = "copy";

}
function handlerMOVE() {
    handlerCOPY();
    let curDir = getCurrentDirectory(stack);
    dataToCopy["pathFrom"] = curDir + "/" + globalTarget.dataset.dir;
    action = "move";
}


function handlerPASTE(event) {
    let curDir = getCurrentDirectory(stack);
    dataToCopy["pathTo"] = curDir + "/";
    if (action == "copy") {
        fetch(`${ip}?data=${JSON.stringify(dataToCopy)}`, { method: 'COPY', }).then(data => data.blob())
            .then(function (response) {
                if (response) {
                    handlerGET("");
                }
            })
    } else
        if (action === "move") {
            fetch(`${ip}?data=${JSON.stringify(dataToCopy)}`, { method: 'MOVE', }).then(data => data.blob())
                .then(function (response) {
                    if (response) {
                        handlerGET("");
                    }
                })
        }

}
