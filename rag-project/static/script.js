"use strict";

const $ = (id) => document.getElementById(id);

const landing = $("landing");
const workspace = $("workspace");
const fileInput = $("fileInput");
const dropZone = $("dropZone");
const selectedFile = $("selectedFile");
const selectedFileName = $("selectedFileName");
const selectedFileSize = $("selectedFileSize");
const processButton = $("processButton");
const processButtonText = $("processButtonText");
const uploadStatus = $("uploadStatus");
const uploadStatusText = $("uploadStatusText");
const questionInput = $("questionInput");
const askButton = $("askButton");
const askButtonText = $("askButtonText");
const chatEmpty = $("chatEmpty");
const chatContent = $("chatContent");
const answerOutput = $("answerOutput");
const questionOutput = $("questionOutput");
const toast = $("toast");

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "txt", "docx", "csv", "xlsx", "xls"];

let chosenFile = null;
let documentProcessed = false;
let toastTimer = null;
let currentAnswer = "";
let lastQuestion = "";

/* -------------------------------------------------------
   LANDING PAGE AND NAVIGATION
------------------------------------------------------- */

function showWorkspace() {
    document.body.classList.add("workspace-mode");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Reveal the workspace again when it is reopened.
    workspace.style.animation = "none";
    void workspace.offsetHeight;
    workspace.style.animation = "";

    setTimeout(() => {
        workspace.querySelector(".drop-zone")?.focus({ preventScroll: true });
    }, 350);
}

function showLanding() {
    document.body.classList.remove("workspace-mode");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

$("getStarted").addEventListener("click", showWorkspace);
$("navGetStarted").addEventListener("click", showWorkspace);
$("startFromSection").addEventListener("click", showWorkspace);
$("workspaceLink").addEventListener("click", (event) => {
    event.preventDefault();
    showWorkspace();
});

$("backToHome").addEventListener("click", showLanding);
$("brandHome").addEventListener("click", (event) => {
    event.preventDefault();
    showLanding();
});
$("footerHome").addEventListener("click", (event) => {
    event.preventDefault();
    showLanding();
});

$("howLink").addEventListener("click", (event) => {
    if (document.body.classList.contains("workspace-mode")) {
        event.preventDefault();
        showLanding();

        setTimeout(() => {
            $("howItWorks").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 100);
    }
});

$("uploadFromHero").addEventListener("click", () => {
    showWorkspace();

    setTimeout(() => {
        fileInput.click();
    }, 350);
});

$("currentYear").textContent = new Date().getFullYear();

/* -------------------------------------------------------
   SCROLL ANIMATIONS
------------------------------------------------------- */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add("visible"));
}

// Reveal the first screen immediately instead of waiting for a scroll.
window.addEventListener("load", () => {
    document.querySelectorAll(".hero-copy .reveal, .hero-visual.reveal")
        .forEach((element) => element.classList.add("visible"));
});

window.addEventListener("scroll", () => {
    $("topbar").classList.toggle("scrolled", window.scrollY > 20);
}, { passive: true });

/* -------------------------------------------------------
   TOAST MESSAGES
------------------------------------------------------- */

function showToast(message, isError = false) {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.toggle("error", isError);
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

/* -------------------------------------------------------
   FILE SELECTION AND VALIDATION
------------------------------------------------------- */

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExtension(filename) {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function setUploadStatus(message, type = "idle") {
    uploadStatusText.textContent = message;
    uploadStatus.classList.remove("is-success", "is-error", "is-loading");

    if (type === "success") {
        uploadStatus.classList.add("is-success");
    } else if (type === "error") {
        uploadStatus.classList.add("is-error");
    } else if (type === "loading") {
        uploadStatus.classList.add("is-loading");
    }
}

function setChosenFile(file) {
    if (!file) {
        return;
    }

    const extension = getExtension(file.name);

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        showToast(
            "Unsupported file type. Choose PDF, DOCX, TXT, CSV, XLSX, or XLS.",
            true
        );
        return;
    }

    if (file.size === 0) {
        showToast("This file is empty. Choose another document.", true);
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        showToast("The maximum file size is 20 MB.", true);
        return;
    }

    chosenFile = file;
    documentProcessed = false;

    selectedFileName.textContent = file.name;
    selectedFileSize.textContent = formatFileSize(file.size);
    selectedFile.hidden = false;

    processButton.disabled = false;
    processButtonText.textContent = "Upload & process";

    questionInput.disabled = true;
    askButton.disabled = true;

    chatContent.hidden = true;
    chatEmpty.hidden = false;
    currentAnswer = "";
    lastQuestion = "";

    setUploadStatus("Document selected — ready to process");
}

function resetSelectedFile() {
    chosenFile = null;
    documentProcessed = false;
    fileInput.value = "";

    selectedFile.hidden = true;
    processButton.disabled = true;
    processButtonText.textContent = "Upload & process";

    questionInput.disabled = true;
    questionInput.value = "";
    askButton.disabled = true;

    chatContent.hidden = true;
    chatEmpty.hidden = false;

    setUploadStatus("Waiting for a document");
}

fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];

    if (file) {
        setChosenFile(file);
    }
});

dropZone.addEventListener("click", () => {
    fileInput.click();
});

dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fileInput.click();
    }
});

["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.add("drag-over");
    });
});

["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.remove("drag-over");
    });
});

dropZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];

    if (file) {
        setChosenFile(file);
    }
});

// Prevent dropping a file elsewhere on the page from navigating away.
document.addEventListener("dragover", (event) => {
    event.preventDefault();
});

document.addEventListener("drop", (event) => {
    if (!dropZone.contains(event.target)) {
        event.preventDefault();
    }
});

$("removeFile").addEventListener("click", () => {
    if (processButton.disabled) {
        return;
    }

    resetSelectedFile();
});

/* -------------------------------------------------------
   UPLOAD AND PROCESS DOCUMENT
------------------------------------------------------- */

processButton.addEventListener("click", uploadDocument);

async function uploadDocument() {
    if (!chosenFile) {
        showToast("Please choose a document first.", true);
        return;
    }

    const fileBeingUploaded = chosenFile;
    const formData = new FormData();

    formData.append("document", fileBeingUploaded);

    processButton.disabled = true;
    processButtonText.textContent = "Processing document...";
    setUploadStatus("Reading and indexing document...", "loading");

    try {
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Document processing failed.");
        }

        documentProcessed = true;

        setUploadStatus(
            `Ready — ${data.chunks} text sections indexed`,
            "success"
        );

        processButtonText.textContent = "✓ Document ready";
        questionInput.disabled = false;
        askButton.disabled = false;

        questionInput.placeholder = "Ask anything about your document...";
        chatEmpty.hidden = false;
        chatContent.hidden = true;

        showToast("Your document is ready. Ask your first question.");
        questionInput.focus();

    } catch (error) {
        documentProcessed = false;
        processButton.disabled = false;
        processButtonText.textContent = "Try processing again";

        setUploadStatus(
            error.message || "Could not process this document.",
            "error"
        );

        showToast(error.message || "Could not process the document.", true);
    }
}

/* -------------------------------------------------------
   QUESTION SUGGESTIONS
------------------------------------------------------- */

document.querySelectorAll(".suggestion").forEach((button) => {
    button.addEventListener("click", () => {
        if (!documentProcessed) {
            showToast("Upload and process a document first.", true);
            return;
        }

        questionInput.value = button.dataset.question || "";
        resizeQuestionInput();
        questionInput.focus();
    });
});

/* -------------------------------------------------------
   ASK A QUESTION
------------------------------------------------------- */

askButton.addEventListener("click", askQuestion);

questionInput.addEventListener("keydown", (event) => {
    // Enter sends; Shift + Enter inserts a new line.
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (!askButton.disabled) {
            askQuestion();
        }
    }
});

questionInput.addEventListener("input", resizeQuestionInput);

function resizeQuestionInput() {
    questionInput.style.height = "auto";
    questionInput.style.height =
        `${Math.min(questionInput.scrollHeight, 140)}px`;
}

async function askQuestion() {
    const question = questionInput.value.trim();

    if (!documentProcessed) {
        showToast("Upload and process a document first.", true);
        return;
    }

    if (!question) {
        showToast("Type a question before generating an answer.", true);
        questionInput.focus();
        return;
    }

    lastQuestion = question;
    questionOutput.textContent = question;

    chatEmpty.hidden = true;
    chatContent.hidden = false;

    answerOutput.textContent = "Searching your document and preparing an answer...";

    askButton.disabled = true;
    askButtonText.textContent = "Thinking...";
    questionInput.disabled = true;

    try {
        const response = await fetch("/api/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not generate an answer.");
        }

        currentAnswer = String(data.answer || "No answer was returned.");

        // Use textContent, not innerHTML, to keep model output safe.
        answerOutput.textContent = currentAnswer;

        chatContent.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    } catch (error) {
        answerOutput.textContent =
            error.message || "Something went wrong while generating the answer.";


        showToast(error.message || "Could not generate an answer.", true);

    } finally {
        askButton.disabled = false;
        askButtonText.textContent = "Generate answer";
        questionInput.disabled = false;
        questionInput.value = "";
        resizeQuestionInput();
        questionInput.focus();
    }
}

/* -------------------------------------------------------
   COPY ANSWER
------------------------------------------------------- */

$("copyAnswer").addEventListener("click", async () => {
    if (!currentAnswer) {
        showToast("There is no answer to copy yet.", true);
        return;
    }

    try {
        await navigator.clipboard.writeText(currentAnswer);
        showToast("Answer copied to clipboard.");
    } catch (_error) {
        // Fallback for browsers that block clipboard access.
        const temporaryTextArea = document.createElement("textarea");
        temporaryTextArea.value = currentAnswer;
        temporaryTextArea.style.position = "fixed";
        temporaryTextArea.style.opacity = "0";
        document.body.appendChild(temporaryTextArea);
        temporaryTextArea.select();

        const copied = document.execCommand("copy");
        temporaryTextArea.remove();

        if (copied) {
            showToast("Answer copied to clipboard.");
        } else {
            showToast("Copy was blocked by your browser.", true);
        }
    }
});

/* -------------------------------------------------------
   DOWNLOAD ANSWER AS A TEXT FILE
------------------------------------------------------- */

$("downloadAnswer").addEventListener("click", () => {
    if (!currentAnswer) {
        showToast("There is no answer to download yet.", true);
        return;
    }

    const text = [
        "DOCUMIND — DOCUMENT ANSWER",
        "================================",
        "",
        `Question: ${lastQuestion}`,
        "",
        "Answer:",
        currentAnswer,
        "",
        "Generated by DocuMind."
    ].join("\n");

    const blob = new Blob([text], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "documind-answer.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    showToast("Your answer has been downloaded.");
});

/* -------------------------------------------------------
   INITIAL STATE
------------------------------------------------------- */

resetSelectedFile();