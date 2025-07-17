from google.cloud import aiplatform_v1beta1 as aiplatform

def get_genai_client():
    client_options = {"api_endpoint": "us-central1-aiplatform.googleapis.com"}
    client = aiplatform.PredictionServiceClient(client_options=client_options)
    return client