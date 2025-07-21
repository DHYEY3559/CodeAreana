# users/views.py
import requests
import json
from rest_framework.views import APIView
from rest_framework.response import Response

class LlamaInteractionView(APIView):
    def post(self, request, *args, **kwargs):
        user_prompt = request.data.get('prompt')
        # New: Get the target language from the frontend
        target_language = request.data.get('target_lang_name', 'Spanish') # Default to Spanish

        if not user_prompt:
            return Response({'error': 'No prompt provided'}, status=400)

        # New prompt that asks the AI to respond and then translate
        translation_prompt = f"""
        {user_prompt}
        
        First, provide your response in English.
        Then, on a new line, write '---' as a separator.
        Finally, on a new line, provide the exact translation of your English response into {target_language}.
        """

        ollama_url = 'http://localhost:11434/api/generate'
        payload = {
            "model": "mistral:latest", # Or llama3.2:1b
            "prompt": translation_prompt,
            "stream": False
        }

        try:
            response = requests.post(ollama_url, json=payload)
            response.raise_for_status()
            
            ai_response_text = response.json().get("response", "")
            
            # Split the response into English and translated parts
            parts = ai_response_text.split('---')
            english_part = parts[0].strip()
            translated_part = parts[1].strip() if len(parts) > 1 else "Translation not available."
            
            return Response({
                'english_response': english_part,
                'translated_response': translated_part
            })
            
        except Exception as e:
            return Response({'error': f"An error occurred: {e}"}, status=500)


from rest_framework import viewsets, permissions
from .models import InteractionHistory
from .serializers import InteractionHistorySerializer

class InteractionHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = InteractionHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # User can only see their own history
        return InteractionHistory.objects.filter(user=self.request.user).order_by('-timestamp')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        