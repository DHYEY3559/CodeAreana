from rest_framework import serializers
from .models import InteractionHistory

class InteractionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InteractionHistory
        fields = '__all__'
        read_only_fields = ['user', 'timestamp']
