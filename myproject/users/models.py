from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class InteractionHistory(models.Model):
    FEATURE_CHOICES = [
        ("voice", "VoiceSection"),
        ("grammar", "GrammarSection"),
        ("image", "ImageSection"),
        ("chat", "ChatSection"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='histories')
    feature = models.CharField(max_length=20, choices=FEATURE_CHOICES)
    input_data = models.TextField(blank=True, null=True)   # What the user sent (e.g., prompt/question)
    ai_response = models.TextField(blank=True, null=True)  # What the AI replied
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.feature} @ {self.timestamp}"
