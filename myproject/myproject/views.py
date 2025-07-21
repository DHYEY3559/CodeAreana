from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'auth': reverse('rest_login', request=request, format=format),
        'registration': reverse('rest_register', request=request, format=format),
        'admin': request.build_absolute_uri('/admin/')
    })
