from google.genai import client

def get_genai_client():
    return client.Client(
        vertexai=True,
        project="qna-ai-proejct",
        location="us-central1"
    )
