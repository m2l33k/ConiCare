from langchain_ollama import OllamaLLM
try:
    from langchain_openai import ChatOpenAI
except ImportError:
    ChatOpenAI = None

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
import os

# Load environment variables (if python-dotenv is available)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Initialize LLM
# Priority: GitHub Models (via OpenAI compatible API) -> Ollama
github_token = os.getenv("GITHUB_TOKEN")

if github_token and ChatOpenAI:
    print("Using GitHub Models (Phi-4)")
    llm = ChatOpenAI(
        model="Phi-4-multimodal-instruct",
        api_key=github_token,
        base_url="https://models.inference.ai.azure.com"
    )
else:
    print("Using Local Ollama (llama3)")
    # Command to run ollama: `ollama run llama3`
    llm = OllamaLLM(model="llama3") 

# Vector Store Setup
VECTOR_DB_PATH = "chroma_db"
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def initialize_knowledge_base(pdf_path: str):
    """
    Loads a PDF, splits it, and stores embeddings in ChromaDB locally.
    """
    if not os.path.exists(pdf_path):
        return {"error": "File not found"}

    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = text_splitter.split_documents(documents)
    
    # Create vector store
    db = Chroma.from_documents(texts, embeddings, persist_directory=VECTOR_DB_PATH)
    # db.persist() # Automatic in newer versions
    return {"status": "Knowledge base indexed successfully"}

def ask_chatbot(question: str):
    """
    Queries the local RAG chatbot.
    """
    # Check if vector db exists, if not, use plain LLM
    if os.path.exists(VECTOR_DB_PATH):
        db = Chroma(persist_directory=VECTOR_DB_PATH, embedding_function=embeddings)
        retriever = db.as_retriever(search_kwargs={"k": 3})
        
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm, 
            chain_type="stuff", 
            retriever=retriever,
            return_source_documents=True
        )
        
        try:
            response = qa_chain.invoke({"query": question})
            return {
                "answer": response["result"],
                "sources": [doc.metadata.get("source", "Unknown") for doc in response["source_documents"]]
            }
        except Exception as e:
            if "model 'llama3' not found" in str(e):
                return {"answer": "The AI model (llama3) is currently downloading or missing. Please wait a few minutes and try again.", "sources": []}
            raise e
    else:
        # Fallback to pure LLM if no docs indexed
        prompt = PromptTemplate(
            input_variables=["question"],
            template="You are a helpful assistant for parents of children with special needs. Answer the following question: {question}"
        )
        chain = prompt | llm | StrOutputParser()
        try:
            response = chain.invoke({"question": question})
            return {"answer": response, "sources": ["General Knowledge (No docs indexed yet)"]}
        except Exception as e:
            if "model 'llama3' not found" in str(e):
                return {"answer": "The AI model (llama3) is currently downloading or missing. Please wait a few minutes and try again.", "sources": []}
            raise e
