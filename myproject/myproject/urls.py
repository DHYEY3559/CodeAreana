# myproject/urls.py

from django.contrib import admin
from django.urls import path, include
from .views import api_root  # Import the new view

urlpatterns = [
    # Add this line to point the root URL to your new API root view
    path('', api_root, name='api-root'), 
    
    path('admin/', admin.site.urls),
    # Authentication endpoints from dj-rest-auth
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/', include('users.urls')),
]
