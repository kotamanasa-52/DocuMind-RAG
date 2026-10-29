
from langchain_ollama import ChatOllama

llm = ChatOllama(model="llama3.2")

response = llm.invoke("Explain RAG in simple words.")

print(response.content)
