
# DocuMind – RAG-Based Document Question Answering

DocuMind is a document question-answering application that uses Retrieval-Augmented Generation (RAG) to answer questions based on uploaded documents.

## Features
- Upload documents and ask questions about their content.
- Supports PDF, TXT, DOCX, CSV, XLSX, and XLS files.
- Splits documents into chunks for retrieval.
- Uses semantic search to retrieve relevant information.
- Generates answers using a local language model.

## Technologies Used
- Python
- Flask
- LangChain
- Ollama
- ChromaDB
- HTML, CSS, JavaScript

## Models
- LLM: Llama 3.2
- Embeddings: Nomic Embed Text

## How It Works
1. Upload a document.
2. Extract and split its content into chunks.
3. Generate embeddings and retrieve relevant chunks.
4. Generate an answer using the language model.

## Run Locally
1. Install Python and Ollama.
2. Download the required Ollama models.
3. Install the Python dependencies.
4. Run `python server.py`.
5. Open the local URL displayed in the terminal.

## Author
Kota Manasa
