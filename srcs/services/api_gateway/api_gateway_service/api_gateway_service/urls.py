"""
URL configuration for api_gateway_service project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from api_gateway_app import views
from django.http import JsonResponse
import requests

def route_to_service(request, service_name):
    """Route API requests to the appropriate microservice."""
    service_map = {
        # "":
        "users": "http://users:8000",
        "game": "http://game:8001",
        "auth": "http://auth:8003",
        "friends": "http://friends:8004",
        "rooms": "http://rooms:8005",
    }

    if service_name in service_map:
        url = f"{service_map[service_name]}{request.get_full_path()}"
        try:
            # Forward the request to the appropriate service
            response = requests.request(
                method=request.method,
                url=url,
                headers=request.headers,
                data=request.body,
            )
            return JsonResponse(response.json(), status=response.status_code, safe=False)
        except requests.exceptions.RequestException as e:
            return JsonResponse(
                {"error": f"Service {service_name} is unavailable", "details": str(e)},
                status=503,
            )
    return JsonResponse({"error": "Service not found"}, status=404)

urlpatterns = [
    path('admin/', admin.site.urls),  # Administration panel
    path('api/<str:service_name>/', route_to_service),  # Dynamic routing to services
    # path('api/auth/', route_to_service),  # Dynamic routing to services
]
