/**
 * Client for interacting with the FastAPI powered AI assistant.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_ASSISTANT_URL || "http://localhost:8000";

async function handleResponse(response) {
  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error("Assistant service returned an invalid response");
  }

  if (!response.ok) {
    const message = payload?.detail || payload?.message || "Assistant service request failed";
    throw new Error(message);
  }

  return payload;
}

async function sendMessage(conversationId, question) {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      conversation_id: conversationId ?? undefined,
    }),
  });

  return handleResponse(response);
}

async function uploadDocuments(files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}

async function listDocuments() {
  const response = await fetch(`${API_BASE_URL}/api/v1/documents`);
  return handleResponse(response);
}

const aiAssistantService = {
  sendMessage,
  uploadDocuments,
  listDocuments,
};

export default aiAssistantService;
