from rest_framework.routers import DefaultRouter
from .views import InteractionHistoryViewSet

router = DefaultRouter()
router.register(r'history', InteractionHistoryViewSet, basename='interactionhistory')

urlpatterns = router.urls
