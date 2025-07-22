import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI

# Load environment variables from .env
load_dotenv()

app = FastAPI()

class DiffRequest(BaseModel):
    diff_content: str

@app.on_event("startup")
async def startup_event():
    validate_environment()

def validate_environment():
    if not os.getenv("OPENROUTER_API_KEY"):
        raise RuntimeError("Missing OPENROUTER_API_KEY in environment")
    print("Environment validated.")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def create_rag_pipeline(diff_content: str):
    """Create RAG pipeline using FAISS and OpenRouter (via ChatOpenAI)"""
    documents = [Document(page_content=diff_content, metadata={"source": "code_diff"})]

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", " ", ""]
    )
    split_docs = text_splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    vector_db = FAISS.from_documents(split_docs, embeddings)
    retriever = vector_db.as_retriever(search_kwargs={"k": 4})

    model = ChatOpenAI(
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=os.getenv("OPENROUTER_API_KEY"),
        model_name="mistralai/mixtral-8x7b-instruct",
        temperature=0,
        max_retries=2
    )

    template = """Human: You are a senior software engineer analyzing code changes.
    Generate a detailed summary of the following code changes between two GitHub commits.
    Focus on:
    - Major features/improvements added
    - Critical bug fixes
    - Potential breaking changes
    - Architectural modifications
    - Important refactoring efforts

    At the end of summary add a PR importance rating from 1 to 5. No other text is needed only the integer in format - PR_IMPORTANCE:1/2/3/4/5.

    Provide the summary in markdown format with clear section headers. Each heading should be bold and add enough spacing.

    Code changes:
    {context}

    Assistant:"""

    prompt = ChatPromptTemplate.from_template(template)

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | model
    )

    return rag_chain

@app.post("/summarize")
async def summarize_diff(request: DiffRequest):
    """Endpoint to summarize code diffs"""
    try:
        rag_chain = create_rag_pipeline(request.diff_content)
        response = rag_chain.invoke("Generate comprehensive summary of code changes")
        print("Summary generated successfully.", response)
        return {"summary": response.content}
    except Exception as e:
        return {"error": str(e)}
